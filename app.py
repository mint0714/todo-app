from flask import Flask      # FlaskというWebサーバの機能セットを読み込む
from flask_sqlalchemy import SQLAlchemy  # DBを操作するライブラリ
from datetime import datetime

app = Flask(__name__)       #Flaskクラスの中にはWebアプリを動かすために必要な機能が全て定義されています。しかしクラスは設計図なので、そのままでは使えません。
                            #Flaskのインスタンスを作成し、URLのルーティング処理や、サーバの起動、DBの設定などを可能にします.(app.py)

@app.route('/')              # 「/」へのアクセスを待ち受ける
def index():                 # アクセスがあったときに実行する関数
    return 'Hello Worlds!'    # ブラウザに文字を返す

if __name__ == '__main__':   #「もしこのファイルが直接実行されたならサーバを起動する」という条件。お決まりの文句みたいなもの
    app.run(debug=True)      # デバッグモードでサーバを起動。



# ── データベースの設定 ──────────────────────────────────
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db' #SQLAlchemyがDBファイルを読み書きするときに使うファイルのパスを保存

db = SQLAlchemy(app)  # SQLAlchemyのインスタンスを作成する。これを通じてDBを操作する

# ── テーブル定義：categories ────────────────────────────
class Category(db.Model):
    __tablename__ = 'categories'
    id   = db.Column(db.Integer, primary_key=True)  # 主キー（自動連番）
    name = db.Column(db.String(100), nullable=False, unique=True)
    tasks = db.relationship('Task', backref='category', lazy=True)  # relationship：CategoryからTaskを「category.tasks」で参照できるようにする

# ── テーブル定義：tasks ─────────────────────────────────
class Task(db.Model):
    __tablename__ = 'tasks'
    id           = db.Column(db.Integer, primary_key=True)
    title        = db.Column(db.String(200), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    category_id  = db.Column(db.Integer, db.ForeignKey('categories.id')) # ForeignKey：categoriesテーブルのidと紐づく外部キー
    comments = db.relationship('Comment', backref='task',
                               lazy=True, cascade='all, delete-orphan')
    # cascade='all, delete-orphan'：タスクを削除したとき紐づくコメントも一緒に削除する

# ── テーブル定義：comments ──────────────────────────────
class Comment(db.Model):
    __tablename__ = 'comments'
    id         = db.Column(db.Integer, primary_key=True)
    body       = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    task_id    = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)  # ForeignKey：tasksテーブルのidと紐づく外部キー

# ── DBにテーブルを作成する ──────────────────────────────
with app.app_context():  #後処理を手動で書く必要がなくなる
    db.create_all()  # 上記クラスの定義を元にDBファイルを作成する。これは現在存在しないテーブルだけを作成します。




#app.pyファイルの目的
#①  アプリの設定
#   └── どのDBを使うか
#   └── デバッグモードをONにするか　など

#②  テーブルの定義
#   └── DBにどんなテーブルを作るか
#   └── 各カラムの型や制約　など
#   └── 各種テーブルを定義しているclassのコードが実行されたときに、
#       dbインスタンスに内包されているModelクラスの情報に定義したテーブル情報が転記される
#   └── サーバを起動するたびにテーブルは初期化されない

#③  ルーティング（最も重要）
#   └── 「/にアクセスが来たらこの処理をする」
#   └── 「/addにPOSTが来たらこの処理をする」
#   └── ブラウザからのリクエストに対する処理を全て定義する