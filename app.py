from flask import Flask, render_template, request, redirect, url_for # FlaskというWebサーバの機能セットを読み込む
                                                                     # （DB設定・モデル定義は Step 2 のものをそのまま使う）
from flask_sqlalchemy import SQLAlchemy  # DBを操作するライブラリ
from datetime import datetime

app = Flask(__name__)       #Flaskクラスの中にはWebアプリを動かすために必要な機能が全て定義されています。しかしクラスは設計図なので、そのままでは使えません。
                            #Flaskのインスタンスを作成し、URLのルーティング処理や、サーバの起動、DBの設定などを可能にします.(app.py)



# ── データベースの設定 ──────────────────────────────────
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db' #SQLAlchemyがDBファイルを読み書きするときに使うファイルのパスを保存。

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



@app.route('/')
def index():
    category_id = request.args.get('category_id', type=int)
    # URLの「?category_id=1」のような絞り込みパラメータを取得する

    if category_id:
        tasks = Task.query.filter_by(category_id=category_id)\
                          .order_by(Task.created_at.desc()).all()
    else:
        tasks = Task.query.order_by(Task.created_at.desc()).all()

    categories = Category.query.all()  # カテゴリ一覧も取得（絞り込みボタンとフォームで使う）
    return render_template('index.html', tasks=tasks, categories=categories)
    # ブラウザに文字を返す

# ── タスクの追加 ──────────────────────────────────────
@app.route('/add', methods=['POST'])
def add_task():
    title = request.form['title']             # フォームからタスク名を取得
    category_id = request.form.get('category_id') or None
    # or None：カテゴリ未選択（空文字）のときはNoneにする
    new_task = Task(title=title, category_id=category_id)
    db.session.add(new_task)    # DBへの追加を予約
    db.session.commit()         # 予約した変更をDBに確定（保存）
    return redirect(url_for('index'))

# ── 完了・未完了の切り替え ────────────────────────────
@app.route('/complete/<int:task_id>', methods=['POST'])
def complete_task(task_id):
    task = Task.query.get_or_404(task_id)  # 存在しないIDなら404エラー
    task.is_completed = not task.is_completed  # TrueとFalseを反転
    db.session.commit()
    return redirect(url_for('index'))

# ── タスクの削除 ──────────────────────────────────────
@app.route('/delete/<int:task_id>', methods=['POST'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    # cascade='all, delete-orphan' の設定により紐づくコメントも自動削除される
    db.session.commit()
    return redirect(url_for('index'))


if __name__ == '__main__':   #「もしこのファイルが直接実行されたならサーバを起動する」という条件。お決まりの文句みたいなもの
    app.run(debug=True)      # デバッグモードでサーバを起動。








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
#   └── sqlite:///はプロジェクトフォルダ/instanceフォルダまでの絶対パスを指定している。
#       Flaskはinstanceフォルダを自動的に作成するので、そこにDBファイルを保存することで、プロジェクトのコードとDBファイルを分けることができる。

#③  ルーティング（最も重要）
#   └── 「/にアクセスが来たらこの処理をする」
#   └── 「/addにPOSTが来たらこの処理をする」
#   └── ブラウザからのリクエストに対する処理を全て定義する