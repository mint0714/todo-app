# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第10章 Renderへのデプロイ |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 90〜120分 |
| 難易度 | 実践 |
| この章で作るもの | Render上で公開されるFlask ToDoアプリ |
| この章で変更するファイル | なし。Render画面でWeb Service設定を作成する |

# 目次

1. この章のゴール
2. この章の完成イメージ
3. この章で使うファイル・コマンド
4. 前提確認
5. 概念説明
6. ハンズオン
7. 動作確認
8. 理解チェック
9. 理解チェックの回答例
10. 次章への接続

# 1. この章のゴール

この章では、Flask ToDoアプリをRenderのWeb Serviceとして公開します。

第9章では、GitHub ActionsでCIを作り、Pull RequestやpushをきっかけにE2Eテストを自動実行できるようにしました。

CIで確認できる状態になったら、次はアプリをインターネット上で開けるようにします。この「アプリを実行環境へ配置し、利用できる状態にすること」をデプロイと呼びます。

この章を終えると、次のことができるようになります。

- Render Web Serviceの役割を説明できる
- GitHubリポジトリをRenderへ連携できる
- build commandの役割を説明できる
- start commandの役割を説明できる
- `gunicorn app:app` の意味を説明できる
- Renderの環境変数を設定できる
- Renderのデプロイログを確認できる
- 本番URLでFlask ToDoアプリを確認できる

> 注意:
> この章では、Renderへの初回デプロイを扱います。
> 本番データを安全に永続化する方法は第11章で扱います。

# 2. この章の完成イメージ

この章の最後には、次の流れでFlaskアプリを公開できる状態を目指します。

```text
GitHubリポジトリ
  -> Render Web Service
  -> build commandで依存関係をインストールする
  -> start commandでFlaskアプリを起動する
  -> Renderのonrender.com URLで公開する
  -> ブラウザでToDoアプリを確認する
```

Renderに設定する主な内容:

| 項目 | 設定例 |
| --- | --- |
| Service Type | Web Service |
| Runtime / Language | Python 3 |
| Branch | `main` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| 環境変数 | `PYTHON_VERSION` |
| 公開URL | `https://サービス名.onrender.com` |

> 補足:
> 教材では基本ブランチを `main` として説明します。
> `develop` を使う運用の場合は、Renderで連携するbranchを `develop` に読み替えます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン10-6 手順6のあと。
Renderのサービス画面で、デプロイが成功し、公開URLが表示されている状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `app.py` | Flaskアプリ本体。Renderでは `app` というFlaskインスタンスを起動する |
| `requirements.txt` | Render上でインストールするPython依存関係 |
| `templates/` | Render上でも使われるHTMLテンプレート |
| `static/` | Render上でも使われるCSSなどの静的ファイル |

> 注意:
> この章では、アプリ本体のファイルを編集しません。
> Render画面でサービス設定を作成し、既存のFlaskアプリを公開します。

## 3-2. この章で使う主なコマンド

この章では、ローカルPCで新しいファイルを作成しません。

ローカルで確認に使う主なコマンドは次のとおりです。

| コマンド | 目的 |
| --- | --- |
| `git status` | ローカルに未整理の変更がないか確認する |
| `python --version` | ローカルのPythonバージョンを確認する |
| `python3 --version` | Linux / macOSでPythonバージョンを確認する |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

Linux / macOS:

```bash
python3 --version
git status
```

Windows PowerShell:

```powershell
python --version
git status
```

> 補足:
> Render画面で設定する `PYTHON_VERSION` は、ローカルやCIで使うPythonのメジャー・マイナーバージョンとそろえると理解しやすくなります。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| GitHub | リポジトリがGitHubにpushされている |
| CI | 第9章のGitHub ActionsがPull Requestで動く |
| Render | Renderアカウントにログインできる |
| GitHub連携 | RenderからGitHubリポジトリを選択できる |
| 依存関係 | `requirements.txt` に `gunicorn` が含まれている |
| Flaskアプリ | `app.py` に `app = Flask(__name__)` がある |

この章の作業前の状態:

```text
ローカルPC
  -> Flask ToDoアプリがある
  -> GitHubへpushできる
  -> CIを実行できる

GitHub
  -> リポジトリがある
  -> mainブランチにアプリのコードがある

Render
  -> まだWeb Serviceは作成していない
```

この章の作業後の状態:

```text
Render
  -> Web Serviceが作成されている
  -> GitHubリポジトリとbranchが連携されている
  -> build commandとstart commandが設定されている
  -> デプロイログを確認できる
  -> 本番URLでToDoアプリを表示できる
```

> 注意:
> Renderの画面表示やボタン名は変更されることがあります。
> 画面の細かな見た目よりも、Web Service作成、GitHub連携、build command、start command、環境変数、デプロイログという流れを追うことを優先します。

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| デプロイ | アプリを実行環境に配置し、利用できる状態にすること |
| 本番環境 | 実際に利用者がアクセスする環境 |
| Render | WebアプリやDBなどを公開・運用できるクラウドサービス |
| Web Service | HTTPリクエストを受け付けるWebアプリ向けのサービス |
| build command | アプリを起動する前に依存関係のインストールなどを行うコマンド |
| start command | デプロイ後にアプリを起動するためのコマンド |
| runtime | Pythonなど、アプリを動かす実行環境の種類 |
| 環境変数 | 環境ごとに変えたい設定値をコードの外から渡す仕組み |
| デプロイログ | buildや起動の処理結果を確認できるログ |
| 本番URL | Renderが公開する `onrender.com` のURL |
| 一時的なファイルシステム | 再デプロイや再起動で保存したファイルが失われる可能性がある保存領域 |

## 5-2. Render Web Service

Render Web Serviceは、Webアプリを公開するためのサービスです。

Flaskアプリは、ブラウザからHTTPリクエストを受け取り、HTMLレスポンスを返します。そのため、RenderではWeb Serviceとして作成します。

この教材のToDoアプリでは、次のような流れになります。

```text
利用者のブラウザ
  -> https://サービス名.onrender.com にアクセスする
  -> Render Web Serviceがリクエストを受け取る
  -> Flaskアプリが処理する
  -> HTMLがブラウザへ返る
```

ローカル開発では `http://127.0.0.1:5000` にアクセスしていました。

Renderへデプロイすると、Renderが用意したURLからアクセスします。

```text
ローカル開発:
http://127.0.0.1:5000

Render本番環境:
https://サービス名.onrender.com
```

## 5-3. GitHubリポジトリとbranch

Renderは、GitHubリポジトリのコードを取得してデプロイします。

そのため、RenderでWeb Serviceを作るときには、次の情報を選びます。

| 項目 | 意味 |
| --- | --- |
| GitHubリポジトリ | デプロイしたいアプリのコードがある場所 |
| Branch | どのbranchのコードをデプロイするか |
| Root Directory | リポジトリ内のどのディレクトリをアプリのルートとして扱うか |

この教材では、リポジトリのルートに `app.py` と `requirements.txt` がある前提です。

そのため、Root Directoryは空のままにします。

```text
todo-app/
  app.py
  requirements.txt
  templates/
  static/
```

## 5-4. build command

build commandは、アプリを起動する前に実行する準備コマンドです。

Pythonアプリでは、主に依存関係をインストールします。

この教材では、次のbuild commandを使います。

```text
pip install -r requirements.txt
```

このコマンドにより、Render上で次のようなライブラリがインストールされます。

| ライブラリ | 役割 |
| --- | --- |
| Flask | Webアプリ本体を動かす |
| Flask-SQLAlchemy | FlaskからDBを扱う |
| SQLAlchemy | PythonからDBを操作する |
| gunicorn | 本番環境でFlaskアプリを起動する |

> 補足:
> ローカルPCに入っているライブラリは、Render上では使われません。
> Renderは別の環境なので、Render上でも依存関係をインストールする必要があります。

## 5-5. start command

start commandは、デプロイ後にアプリを起動するためのコマンドです。

ローカル開発では、次のようにFlaskの開発用サーバを使いました。

```text
python app.py
```

または次のように起動することもあります。

```text
flask run
```

しかし、本番環境では開発用サーバではなく、WSGIサーバを使います。この教材では `gunicorn` を使います。

Renderに設定するstart command:

```text
gunicorn app:app
```

`gunicorn app:app` は、次のように読みます。

| 部分 | 意味 |
| --- | --- |
| 左の `app` | `app.py` というPythonモジュール |
| 右の `app` | `app.py` の中にあるFlaskインスタンス |

この教材の `app.py` には、次のようなコードがあります。

```python
app = Flask(__name__)
```

そのため、Gunicornには「`app.py` の中の `app` を起動して」と伝えます。

```text
gunicorn app:app
```

## 5-6. 環境変数

環境変数は、環境ごとに変えたい設定をコードの外から渡す仕組みです。

たとえば、次のような値は環境変数で管理することが多いです。

```text
Pythonのバージョン
DB接続先
APIキー
秘密情報
本番用の設定値
```

この章では、Renderで使うPythonバージョンをそろえるために、`PYTHON_VERSION` を設定します。

例:

```text
PYTHON_VERSION=3.12.10
```

> 注意:
> Render画面で `PYTHON_VERSION` を設定する場合は、`3.12.10` のようにパッチバージョンまで含めた値を指定します。
> 実際の値は、教材や講師の指定、ローカル環境、CIで使っているPythonバージョンに合わせます。

この章では、DB接続先の `DATABASE_URL` はまだ設定しません。

DB接続先の切り替えやPostgreSQLの利用は第11章で扱います。

## 5-7. デプロイログ

Renderのデプロイログでは、buildと起動の様子を確認できます。

たとえば、次のような情報を確認します。

```text
リポジトリのコードを取得している
pip install が実行されている
gunicorn app:app が実行されている
アプリが起動している
デプロイが成功している
```

デプロイが失敗したときも、まずログを見ます。

ログを見ることで、次のような原因を切り分けられます。

| ログの例 | 考えられる原因 |
| --- | --- |
| `No module named ...` | 依存関係が足りない |
| `gunicorn: command not found` | `requirements.txt` に `gunicorn` がない、またはinstallに失敗している |
| `Failed to find attribute 'app'` | `gunicorn app:app` のモジュール名や変数名が合っていない |
| build command failed | `pip install -r requirements.txt` に失敗している |

## 5-8. SQLiteと一時的なファイルシステム

現在のToDoアプリはSQLiteを使っています。

`app.py` では、DB接続先が次のように設定されています。

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
```

Render上でも、この設定のままアプリは起動できます。

ただし、RenderのWeb Serviceでは、ローカルファイルとして保存したSQLite DBが永続的な本番データ保存に向かない場合があります。再デプロイ、再起動、無料枠のスリープなどで、ローカルファイルに保存したデータが消える可能性があるためです。

この章では、まず「アプリを公開してブラウザから確認できる状態」を目標にします。

本番データを安全に扱う方法は、第11章でSQLiteとPostgreSQLの違いとして整理します。

## 5-9. Auto Deployの扱い

Renderでは、連携したbranchへの変更をきっかけに自動デプロイできます。

この章では、初回デプロイと公開確認に集中します。

Auto DeployをCI成功後にどう動かすかは、第12章で改めて扱います。

もしWeb Service作成画面でAuto Deployの設定が表示された場合は、講師の指示または教材の運用方針に合わせて選びます。

# 6. ハンズオン

## ハンズオン10-1: RenderでWeb Serviceを作る

目的:
Render上にFlaskアプリを公開するためのWeb Serviceを作成します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
Renderにログインできる状態です。まだこのToDoアプリ用のWeb Serviceはありません。

手順:

1. ブラウザでRender Dashboardを開きます。
2. `New` または `New +` のメニューを開きます。
3. `Web Service` を選択します。
4. ソースコードの選択画面で、GitHubリポジトリからデプロイする選択肢を選びます。
5. GitHub連携が求められた場合は、RenderにGitHubリポジトリへのアクセスを許可します。

期待される結果:
RenderでWeb Service作成画面を開けます。

作業後の状態:
Renderで、どのGitHubリポジトリをデプロイするか選べる状態になっています。

確認ポイント:

画面上の確認:
Render画面にWeb Service作成フォームが表示されます。

裏側の確認:
この章で作るのはStatic Siteではなく、Flaskアプリを動かすWeb Serviceであることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン10-1 手順3のあと。
RenderのNewメニューでWeb Serviceを選択している状態。

> 注意:
> Renderの画面では、`Web Service`、`Deploy a web service`、`Build and deploy from a Git repository` など、似た表現が表示される場合があります。
> Flaskアプリを動かすサービスを選ぶ、という目的を意識します。

## ハンズオン10-2: GitHubリポジトリを連携する

目的:
Renderでデプロイ対象のGitHubリポジトリとbranchを選択します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
RenderのWeb Service作成画面を開いています。

手順:

1. GitHubリポジトリ一覧から、この教材のToDoアプリのリポジトリを選びます。
2. リポジトリが表示されない場合は、GitHub側の連携権限を確認します。
3. Branchに `main` を選びます。
4. `develop` 運用の場合は、Branchに `develop` を選びます。
5. Root Directoryは空のままにします。
6. 次のファイルがリポジトリのルートにあることを確認します。

```text
app.py
requirements.txt
templates/
static/
```

期待される結果:
Renderがデプロイ対象のGitHubリポジトリとbranchを認識します。

作業後の状態:
RenderのWeb Serviceが、どのコードを使ってデプロイするか決まっています。

確認ポイント:

画面上の確認:
Render画面で、対象リポジトリとbranchが選択されています。

裏側の確認:
RenderはGitHubから選択したbranchのコードを取得してデプロイすることを説明できます。

> 補足:
> Root Directoryは、アプリがリポジトリ内のサブディレクトリにある場合に使います。
> この教材ではリポジトリ直下に `app.py` があるため、空のままで進めます。

## ハンズオン10-3: build commandを設定する

目的:
Render上でPython依存関係をインストールするbuild commandを設定します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
Renderでデプロイ対象のGitHubリポジトリとbranchを選択済みです。

手順:

1. Service Nameを入力します。

例:

```text
flask-todo-app
```

2. RuntimeまたはLanguageで `Python 3` を選びます。
3. Regionは、講師の指示または自分に近い地域を選びます。
4. Instance Typeは、学習用のプランまたは講師指定のプランを選びます。
5. Build Command欄に次のコマンドを入力します。

```text
pip install -r requirements.txt
```

6. `requirements.txt` にアプリ実行に必要なライブラリがまとまっていることを確認します。

期待される結果:
Renderがデプロイ時に `requirements.txt` から依存関係をインストールできる設定になります。

作業後の状態:
Web Serviceのbuild commandが設定されています。

確認ポイント:

画面上の確認:
Build Command欄に `pip install -r requirements.txt` が入力されています。

裏側の確認:
Render上にはローカルPCの仮想環境がないため、デプロイ時に依存関係をインストールする必要があると説明できます。

> 注意:
> `requirements-dev.txt` はCIやローカルテスト用の依存関係です。
> 本番環境でE2Eテストを実行しない場合、この章のbuild commandでは `requirements.txt` だけを使います。

## ハンズオン10-4: start commandを設定する

目的:
Render上でFlaskアプリを起動するstart commandを設定します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
Web Serviceのbuild commandが設定されています。

手順:

1. Start Command欄に次のコマンドを入力します。

```text
gunicorn app:app
```

2. 左の `app` が `app.py` を表していることを確認します。
3. 右の `app` が `app.py` の中にあるFlaskインスタンスを表していることを確認します。
4. `requirements.txt` に `gunicorn` が含まれていることを確認します。

確認する内容:

```text
gunicorn==...
```

5. `flask run` や `python app.py` ではなく、Renderでは `gunicorn app:app` を使うことを確認します。

期待される結果:
Renderがデプロイ後にGunicornでFlaskアプリを起動できる設定になります。

作業後の状態:
Web Serviceのstart commandが設定されています。

確認ポイント:

画面上の確認:
Start Command欄に `gunicorn app:app` が入力されています。

裏側の確認:
本番環境では、Flaskの開発用サーバではなく、GunicornのようなWSGIサーバでアプリを起動することを説明できます。

> 補足:
> `app.py` のファイル名やFlaskインスタンス名が違う場合、`gunicorn app:app` の書き方も変わります。
> この教材では、ファイル名もFlaskインスタンス名も `app` なので `gunicorn app:app` になります。

## ハンズオン10-5: 環境変数を設定する

目的:
Render上で使うPythonバージョンを環境変数として設定します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
Web Serviceのbuild commandとstart commandが設定されています。

手順:

1. Web Service作成画面のEnvironment Variables欄を探します。
2. `Add Environment Variable` または同じ意味のボタンを選びます。
3. Keyに次の値を入力します。

```text
PYTHON_VERSION
```

4. Valueに、教材または講師が指定するPythonバージョンを入力します。

例:

```text
3.12.10
```

5. 環境変数の設定内容を確認します。

```text
PYTHON_VERSION=3.12.10
```

6. DB接続先の環境変数は、この章では設定しないことを確認します。

期待される結果:
Render上で使うPythonバージョンを明示できます。

作業後の状態:
Web Serviceに `PYTHON_VERSION` 環境変数が設定されています。

確認ポイント:

画面上の確認:
Render画面のEnvironment Variables欄に `PYTHON_VERSION` が表示されています。

裏側の確認:
環境変数は、コードに直接書きたくない値や環境ごとに変えたい値を外から渡す仕組みだと説明できます。

> 注意:
> 秘密情報をGitHubリポジトリに直接書き込んではいけません。
> APIキーやDB接続情報などは、必要になったときにRenderの環境変数やGitHub Secretsで扱います。

## ハンズオン10-6: 本番URLで表示を確認する

目的:
Renderで初回デプロイを実行し、デプロイログと本番URLを確認します。

実行場所:
Render画面 / ブラウザ

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
Web Serviceの基本設定、build command、start command、環境変数が入力されています。

手順:

1. 設定内容を最後に確認します。

| 項目 | 値 |
| --- | --- |
| Runtime / Language | `Python 3` |
| Branch | `main` または `develop` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Environment Variable | `PYTHON_VERSION` |

2. `Create Web Service` または同じ意味のボタンを押します。
3. Renderのデプロイログを開きます。
4. build commandが実行されていることを確認します。

確認するログの例:

```text
pip install -r requirements.txt
```

5. start commandが実行されていることを確認します。

確認するログの例:

```text
gunicorn app:app
```

6. デプロイが成功するまで待ちます。
7. Render画面に表示された本番URLを開きます。
8. ブラウザでToDoリスト画面が表示されることを確認します。
9. 学習用の確認として、タスクを1つ追加します。

入力例:

```text
Render確認タスク
```

10. 追加したタスクが画面に表示されることを確認します。

期待される結果:
Render上でFlask ToDoアプリが起動し、本番URLからアクセスできます。

作業後の状態:
Renderに公開されたToDoアプリをブラウザで確認できる状態です。

確認ポイント:

画面上の確認:
本番URLで `ToDoリスト` 画面が表示され、タスクを追加できます。

裏側の確認:
Renderログで、`pip install -r requirements.txt` と `gunicorn app:app` が実行されたことを確認できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン10-6 手順6のあと。
Renderのデプロイログで、デプロイ成功が表示されている状態。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン10-6 手順8のあと。
Renderの本番URLでToDoリスト画面が表示されている状態。

> 注意:
> 学習用の無料枠や低コストの環境では、しばらくアクセスがないと起動に時間がかかる場合があります。
> 最初のアクセスで表示まで時間がかかっても、すぐに失敗と判断せず、Renderのログと画面表示を確認します。

> 注意:
> この章の状態では、SQLiteを本番データ保存として本格運用する前提にはしません。
> 追加したタスクが将来の再デプロイや再起動後に残る保証については、第11章で整理します。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| Web Service | RenderにToDoアプリ用のWeb Serviceがある |
| GitHub連携 | 正しいGitHubリポジトリが選択されている |
| Branch | `main` または教材で使うbranchが選択されている |
| Build Command | `pip install -r requirements.txt` が設定されている |
| Start Command | `gunicorn app:app` が設定されている |
| 環境変数 | `PYTHON_VERSION` が設定されている |
| デプロイログ | buildと起動のログを確認できる |
| 本番URL | `https://サービス名.onrender.com` のURLを開ける |
| 画面表示 | ToDoリスト画面が表示される |
| 基本操作 | タスクを追加できる |

画面上の確認:
本番URLでToDoリスト画面が表示され、タスク追加後に一覧へ戻ります。

裏側の確認:
Renderログで、依存関係インストールとGunicorn起動が成功しています。

Git状態の確認:
この章ではローカルファイルを変更していないため、原則としてGitに新しい差分は増えません。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
```

確認:
Renderの本番URLでToDoアプリを開き、Renderログでデプロイ成功を確認できれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. デプロイとは何ですか？
2. Render Web Serviceはどのような種類のアプリに使いますか？
3. RenderでGitHubリポジトリとbranchを選ぶ理由は何ですか？
4. build commandは何のために使いますか？
5. start commandは何のために使いますか？
6. `gunicorn app:app` の左の `app` と右の `app` は、それぞれ何を表していますか？
7. 環境変数は何のために使いますか？
8. デプロイに失敗したとき、まず何を確認しますか？
9. この章の状態で、SQLiteの本番データ永続化を深追いしない理由は何ですか？

# 9. 理解チェックの回答例

1. デプロイとは、アプリを実行環境に配置し、利用者がアクセスできる状態にすることです。
2. Render Web Serviceは、HTTPリクエストを受け取ってレスポンスを返すWebアプリに使います。FlaskアプリはWeb Serviceとして公開します。
3. Renderは選択したGitHubリポジトリとbranchのコードを取得してデプロイするためです。どのコードを本番環境に出すかを決める意味があります。
4. build commandは、アプリを起動する前の準備に使います。この教材では `requirements.txt` からPython依存関係をインストールします。
5. start commandは、デプロイ後にアプリを起動するために使います。この教材ではGunicornでFlaskアプリを起動します。
6. 左の `app` は `app.py` というPythonモジュールです。右の `app` は `app.py` の中にあるFlaskインスタンスです。
7. 環境変数は、環境ごとに変えたい設定値や秘密情報をコードの外から渡すために使います。
8. まずRenderのデプロイログを確認します。依存関係のインストール、start command、エラーメッセージを順番に見ます。
9. Render上のローカルファイルは再デプロイや再起動で失われる可能性があるためです。本番データを安全に扱うには、PostgreSQLなどの永続的なDBを検討する必要があります。

# 10. 次章への接続

この章では、Flask ToDoアプリをRenderのWeb Serviceとして公開しました。

この章でできるようになったこと:

- Render Web Serviceを作成できる
- GitHubリポジトリとbranchをRenderに連携できる
- build commandとstart commandを設定できる
- `gunicorn app:app` の意味を説明できる
- Renderの環境変数を設定できる
- デプロイログを確認できる
- 本番URLでToDoアプリを確認できる

ここまでで、アプリはインターネット上から開ける状態になりました。

一方で、現在のアプリはSQLiteを使っています。SQLiteは学習やローカル開発には便利ですが、本番環境でデータを安全に扱うには注意が必要です。

第11章では、本番環境でデータをどう扱うかを整理します。SQLiteとPostgreSQLの違い、Render上のDB運用、`DATABASE_URL` の考え方を学びます。
