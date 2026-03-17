from flask import Flask      # FlaskというWebサーバの機能セットを読み込む

app = Flask(__name__)        # このファイル自体をFlaskアプリとして登録する
print(app)

@app.route('/')              # 「/」へのアクセスを待ち受ける
def index():                 # アクセスがあったときに実行する関数
    return 'Hello World!'    # ブラウザに文字を返す

if __name__ == '__main__':   #「もしこのファイルが直接実行されたならサーバを起動する」という条件。お決まりの文句みたいなもの
    app.run(debug=True)      # デバッグモードでサーバを起動。
