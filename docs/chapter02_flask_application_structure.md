# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第2章 Flaskアプリの構造 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 60〜90分 |
| 難易度 | 基礎 |
| この章で作るもの | URL、View関数、テンプレートの対応表 |
| この章で変更するファイル | なし |

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

この章では、ToDoアプリのFlaskコードを読み、ブラウザから届いたHTTPリクエストがどのPython関数につながるかを確認します。

第1章では、ブラウザ操作とHTTP通信の関係を学びました。この章では、そのリクエストをFlaskアプリがどのように受け取り、どのテンプレートを使って画面を返しているかを読みます。

この章を終えると、次のことができるようになります。

- `app.py` の主な役割を説明できる
- `@app.route` とURLの関係を説明できる
- View関数の役割を説明できる
- `render_template` でテンプレートに値が渡る流れを説明できる
- `redirect` と `url_for` の役割を説明できる
- `base.html` と子テンプレートの関係を説明できる

# 2. この章の完成イメージ

この章の最後には、ToDoアプリのURL、FlaskのView関数、HTMLテンプレートの関係を次のように整理できる状態を目指します。

```text
GET /
  -> app.py の index()
  -> templates/index.html
  -> タスク一覧画面

POST /add
  -> app.py の add_task()
  -> DBへタスクを保存
  -> redirect(url_for('index'))
  -> GET / へ戻る

GET /categories
  -> app.py の categories()
  -> templates/categories.html
  -> カテゴリ管理画面
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン2-5 手順2のあと。
URL、View関数、テンプレートの対応表が表示されている状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `app.py` | Flaskアプリの設定、ルーティング、View関数、DB操作が書かれている |
| `templates/base.html` | 共通レイアウト、ナビゲーション、差し込み枠が書かれている |
| `templates/index.html` | タスク一覧画面のHTMLテンプレート |
| `templates/categories.html` | カテゴリ管理画面のHTMLテンプレート |
| `templates/detail.html` | タスク詳細画面のHTMLテンプレート |
| `static/style.css` | 画面の見た目を整えるCSS |

> 注意:
> この章では、アプリ本体のファイルは編集しません。
> `app.py` と `templates/` 配下のファイルを読み、処理の流れを確認します。

## 3-2. この章で使う主なコマンド

| コマンド | 目的 |
| --- | --- |
| `python app.py` | Flaskアプリをローカルで起動する |
| `git status` | アプリ本体を変更していないことを確認する |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
python app.py
```

> 補足:
> この章では、コードを読む作業が中心です。
> コード検索は、エディタの検索機能を使っても、ターミナルで検索してもかまいません。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第1章の理解 | GET、POST、URL、HTML formの基本を説明できる |
| ローカル起動 | `python app.py` でToDoアプリを起動できる |
| エディタ | `app.py` と `templates/` 配下のファイルを開ける |
| ブラウザ | `http://127.0.0.1:5000` を開ける |

この章の作業前の状態:

```text
理解
  -> ブラウザがGETやPOSTを送ることを知っている

ファイル
  -> app.py と templates/ を読める
  -> アプリ本体のファイルは編集しない

ブラウザ
  -> ToDoアプリを表示できる
```

この章の作業後の状態:

```text
理解
  -> URLとView関数の対応を説明できる
  -> View関数とテンプレートの対応を説明できる
  -> POST後のredirectの流れを説明できる

ファイル
  -> アプリ本体のファイル変更はなし
```

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| Flask | PythonでWebアプリを作るためのフレームワーク |
| ルーティング | URLと処理する関数を対応づける仕組み |
| View関数 | リクエストを受け取り、レスポンスを作るPython関数 |
| テンプレート | HTMLを動的に作るためのファイル |
| Jinja | Flaskでよく使われるテンプレートエンジン |
| `render_template` | テンプレートからHTMLを作る関数 |
| `redirect` | 別のURLへ移動させるレスポンスを作る関数 |
| `url_for` | View関数名からURLを作る関数 |
| テンプレート継承 | 共通レイアウトを親テンプレートとして使う仕組み |

## 5-2. `app.py` の役割

`app.py` は、このToDoアプリの中心になるファイルです。

主に次の役割があります。

| 役割 | 内容 |
| --- | --- |
| アプリ作成 | `Flask(__name__)` でFlaskアプリを作る |
| DB設定 | SQLiteとSQLAlchemyの設定を行う |
| モデル定義 | Category、Task、Commentの形を定義する |
| ルーティング | URLとView関数を対応づける |
| View関数 | リクエストに応じて画面表示や保存処理を行う |

第2章では、この中でもルーティング、View関数、テンプレートの関係に注目します。

## 5-3. `@app.route` とView関数

Flaskでは、`@app.route` を使ってURLとPython関数を結びつけます。

例:

```python
@app.route('/')
def index():
    ...
```

これは、ブラウザから `/` にアクセスが来たときに、`index()` 関数を実行するという意味です。

このような関数を、View関数と呼びます。

## 5-4. `render_template`

`render_template` は、HTMLテンプレートを使ってレスポンス用のHTMLを作る関数です。

例:

```python
return render_template('index.html', tasks=tasks, categories=categories)
```

このコードでは、`templates/index.html` を使ってHTMLを作ります。

また、`tasks` と `categories` という値をテンプレートへ渡しています。テンプレート側では、渡された値を使ってタスク一覧やカテゴリ一覧を表示します。

## 5-5. `request`

`request` は、ブラウザから届いたリクエストの情報を読むために使います。

ToDoアプリでは、主に次のように使われています。

| コード | 役割 |
| --- | --- |
| `request.args.get('category_id', type=int)` | URLのクエリ文字列からカテゴリIDを読む |
| `request.form['title']` | フォームから送られたタスク名を読む |
| `request.form.get('category_id')` | フォームから送られたカテゴリIDを読む |

`request.args` は、URLに付いた値を読むときに使います。

例:

```text
/?category_id=1
```

`request.form` は、POSTされたフォームの値を読むときに使います。

## 5-6. `redirect` と `url_for`

フォーム送信後に同じ画面へ戻したいとき、Flaskでは `redirect` と `url_for` をよく使います。

例:

```python
return redirect(url_for('index'))
```

`url_for('index')` は、`index` というView関数に対応するURLを作ります。このアプリでは、`index()` は `/` に対応しています。

`redirect(...)` は、ブラウザに「次はこのURLへ移動してください」と伝えます。

タスク追加では、次の流れになります。

```text
POST /add
  -> add_task()
  -> DBへ保存
  -> redirect(url_for('index'))
  -> GET /
  -> index()
  -> index.htmlを表示
```

## 5-7. Jinjaテンプレート

Flaskでは、HTMLテンプレートにJinjaという仕組みを使います。

Jinjaでは、Pythonから渡された値をHTMLの中で使えます。

例:

```html
{% for task in tasks %}
    <span>{{ task.title }}</span>
{% endfor %}
```

このコードは、`tasks` の中にあるタスクを1件ずつ取り出し、タスク名を表示しています。

| 書き方 | 意味 |
| --- | --- |
| `{{ value }}` | 値を画面に表示する |
| `{% for ... %}` | 繰り返し処理を行う |
| `{% if ... %}` | 条件によって表示を切り替える |
| `{% extends ... %}` | 親テンプレートを継承する |
| `{% block ... %}` | 子テンプレートが差し替える場所を定義する |

## 5-8. テンプレート継承

ToDoアプリでは、`templates/base.html` が共通レイアウトです。

`templates/index.html`、`templates/categories.html`、`templates/detail.html` は、`base.html` を継承しています。

例:

```html
{% extends 'base.html' %}
```

`base.html` には、共通のHTML構造、CSS読み込み、ナビゲーションがあります。

子テンプレートは、`block` で定義された場所にページごとの内容を差し込みます。

```text
base.html
  -> 共通のHTML、ナビゲーション、CSS読み込み

index.html
  -> タスク一覧画面の本文

categories.html
  -> カテゴリ管理画面の本文

detail.html
  -> タスク詳細画面の本文
```

# 6. ハンズオン

## ハンズオン2-1: `/` にアクセスした時の処理を追う

目的:
トップページへのGETリクエストが、`app.py` の `index()` 関数につながることを確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`app.py` と `templates/index.html` をエディタで開ける状態です。

手順:

1. `app.py` を開きます。
2. 次のルーティングを探します。

```python
@app.route('/')
def index():
```

3. `index()` の中で、`category_id` を取得している行を確認します。

```python
category_id = request.args.get('category_id', type=int)
```

4. `category_id` がある場合とない場合で、取得するタスクが変わることを確認します。
5. `categories = Category.query.all()` でカテゴリ一覧も取得していることを確認します。
6. 最後に `render_template` で `index.html` を返していることを確認します。

```python
return render_template('index.html', tasks=tasks, categories=categories)
```

期待される結果:
`GET /` が `index()` 関数に対応し、`templates/index.html` を使ってタスク一覧画面を表示していることが分かります。

作業後の状態:
トップページ表示時に、Flask側でどの関数が動くかを説明できます。

確認ポイント:

画面上の確認:
ブラウザでトップページを開くと、タスク一覧画面が表示されます。

裏側の確認:
`@app.route('/')`、`index()`、`render_template('index.html', ...)` のつながりを説明できます。

## ハンズオン2-2: `/add` にPOSTした時の処理を追う

目的:
タスク追加フォームを送信したときに、`add_task()` 関数が実行され、保存後にトップページへ戻る流れを確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
第1章で、タスク追加時に `POST /add` が送られることを確認しています。

手順:

1. `templates/index.html` を開きます。
2. タスク追加フォームを確認します。

```html
<form action='/add' method='POST'>
```

3. `app.py` を開きます。
4. `/add` のルーティングを探します。

```python
@app.route('/add', methods=['POST'])
def add_task():
```

5. フォームからタスク名を取得している行を確認します。

```python
title = request.form['title']
```

6. 新しいタスクを作成している行を確認します。

```python
new_task = Task(title=title, category_id=category_id)
```

7. DBへ保存している行を確認します。

```python
db.session.add(new_task)
db.session.commit()
```

8. トップページへ戻している行を確認します。

```python
return redirect(url_for('index'))
```

期待される結果:
タスク追加フォームの送信先 `/add` と、`app.py` の `add_task()` 関数が対応していることが分かります。

作業後の状態:
タスク追加時の「フォーム送信、値の取得、DB保存、リダイレクト」の流れを説明できます。

確認ポイント:

画面上の確認:
タスク追加後、トップページへ戻り、追加したタスクが表示されます。

裏側の確認:
`request.form`、`db.session.add`、`db.session.commit`、`redirect(url_for('index'))` の役割を説明できます。

> 補足:
> DB保存の詳しい仕組みは第3章で扱います。
> この章では、フォームから受け取った値が保存処理へ渡されている流れを追えれば十分です。

## ハンズオン2-3: `index.html` に渡される値を確認する

目的:
`render_template` で渡された `tasks` と `categories` が、テンプレート内でどのように使われているかを確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`app.py` の `index()` 関数が、`tasks` と `categories` を `index.html` に渡していることを確認しています。

手順:

1. `app.py` で次の行を再度確認します。

```python
return render_template('index.html', tasks=tasks, categories=categories)
```

2. `templates/index.html` を開きます。
3. `categories` を使ってカテゴリ絞り込みリンクを表示している箇所を確認します。

```html
{% for cat in categories %}
<a href='/?category_id={{ cat.id }}'>{{ cat.name }}</a>
{% endfor %}
```

4. `categories` を使ってタスク追加フォームの選択肢を表示している箇所を確認します。

```html
{% for cat in categories %}
<option value='{{ cat.id }}'>{{ cat.name }}</option>
{% endfor %}
```

5. `tasks` を使ってタスク一覧を表示している箇所を確認します。

```html
{% for task in tasks %}
<div class='task-item {% if task.is_completed %}completed{% endif %}'>
```

6. `{{ task.title }}` でタスク名を表示していることを確認します。

期待される結果:
`app.py` から渡された `tasks` と `categories` が、`templates/index.html` の中で画面表示に使われていることが分かります。

作業後の状態:
View関数からテンプレートへ値が渡り、テンプレートでHTMLに展開される流れを説明できます。

確認ポイント:

画面上の確認:
カテゴリ一覧、カテゴリ選択肢、タスク一覧が画面に表示されます。

裏側の確認:
`render_template('index.html', tasks=tasks, categories=categories)` と、テンプレート内の `tasks`、`categories` の対応を説明できます。

## ハンズオン2-4: `base.html` と子テンプレートの関係を確認する

目的:
共通レイアウトである `base.html` と、各画面の子テンプレートの関係を確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`templates/` 配下のHTMLテンプレートを開ける状態です。

手順:

1. `templates/base.html` を開きます。
2. CSSを読み込んでいる行を確認します。

```html
<link rel='stylesheet' href='/static/style.css'>
```

3. 共通ナビゲーションを確認します。

```html
<a href='/'>タスク一覧</a>
<a href='/categories'>カテゴリ管理</a>
```

4. ページごとの内容を差し込む `block content` を確認します。

```html
{% block content %}{% endblock %}
```

5. `templates/index.html` を開きます。
6. `base.html` を継承している行を確認します。

```html
{% extends 'base.html' %}
```

7. `index.html` の本文が `block content` の中に書かれていることを確認します。
8. `templates/categories.html` と `templates/detail.html` でも、同じように `base.html` を継承していることを確認します。

期待される結果:
共通部分は `base.html` にあり、ページごとの本文は子テンプレート側に書かれていることが分かります。

作業後の状態:
テンプレート継承によって、共通レイアウトとページ固有の内容が分けられていることを説明できます。

確認ポイント:

画面上の確認:
タスク一覧、カテゴリ管理、詳細画面のどのページにも共通ナビゲーションが表示されます。

裏側の確認:
`base.html` の `block content` に、子テンプレートの本文が差し込まれることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン2-4 手順8のあと。
`base.html` と `index.html` を並べて開き、`block content` と `{% extends 'base.html' %}` が見えている状態。

## ハンズオン2-5: URL、View関数、テンプレートの対応表を作る

目的:
ToDoアプリの主なURLを、View関数、テンプレート、画面や処理に対応づけて整理します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`app.py` の主なルーティングと、`templates/` 配下のHTMLテンプレートを確認済みです。

手順:

1. 次の表を見ながら、URL、View関数、テンプレートの対応を確認します。
2. ブラウザで各画面を開き、表の内容と画面が一致するか確認します。
3. 学習メモを残す場合は、`docs/` 配下にメモを作成してもかまいません。

| HTTPメソッド | URL | View関数 | テンプレート | 役割 |
| --- | --- | --- | --- | --- |
| GET | `/` | `index()` | `index.html` | タスク一覧を表示する |
| POST | `/add` | `add_task()` | なし | タスクを保存してトップページへ戻る |
| POST | `/complete/<task_id>` | `complete_task()` | なし | 完了状態を切り替えてトップページへ戻る |
| POST | `/delete/<task_id>` | `delete_task()` | なし | タスクを削除してトップページへ戻る |
| GET | `/categories` | `categories()` | `categories.html` | カテゴリ管理画面を表示する |
| POST | `/categories/add` | `add_category()` | なし | カテゴリを保存してカテゴリ管理画面へ戻る |
| POST | `/categories/<category_id>/delete` | `delete_category()` | なし | カテゴリを削除してカテゴリ管理画面へ戻る |
| GET | `/task/<task_id>` | `task_detail()` | `detail.html` | タスク詳細画面を表示する |
| POST | `/task/<task_id>/comment` | `add_comment()` | なし | コメントを保存して詳細画面へ戻る |
| POST | `/task/<task_id>/comment/<comment_id>/delete` | `delete_comment()` | なし | コメントを削除して詳細画面へ戻る |

期待される結果:
ToDoアプリの主なURLが、どのView関数につながり、どの画面や処理に対応しているかを説明できます。

作業後の状態:
`app.py` のルーティングを見れば、アプリ全体の画面と処理の流れを追える状態になっています。

確認ポイント:

画面上の確認:
`/`、`/categories`、`/task/<task_id>` が、それぞれ別の画面を表示することを確認できます。

裏側の確認:
GETのView関数は主に `render_template` を返し、POSTのView関数は主に `redirect` を返していることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン2-5 手順2のあと。
ブラウザでToDoアプリを表示し、教材内の対応表と見比べている状態。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| `/` の処理 | `@app.route('/')` と `index()` の対応を説明できる |
| `/add` の処理 | フォーム送信、`request.form`、DB保存、redirectの流れを説明できる |
| テンプレートへの値渡し | `tasks` と `categories` が `index.html` で使われることを説明できる |
| テンプレート継承 | `base.html` と子テンプレートの関係を説明できる |
| 対応表 | URL、View関数、テンプレート、役割を対応づけられる |
| ファイル変更 | アプリ本体のファイルを編集していない |

確認:
`GET /` が `index()` に対応し、`POST /add` が `add_task()` に対応することを説明できれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. `app.py` は、このToDoアプリでどのような役割を持っていますか？
2. `@app.route('/')` は何を表していますか？
3. View関数とは何ですか？
4. `render_template('index.html', tasks=tasks, categories=categories)` は何をしていますか？
5. `request.form['title']` は何を取得していますか？
6. `redirect(url_for('index'))` は何をしていますか？
7. `base.html` と `index.html` の関係を説明してください。
8. GETのView関数とPOSTのView関数では、返す内容にどのような違いがありますか？

# 9. 理解チェックの回答例

1. `app.py` は、Flaskアプリの作成、DB設定、モデル定義、ルーティング、View関数などをまとめた中心的なファイルです。
2. ブラウザから `/` にアクセスが来たときに、直下の `index()` 関数を実行するという対応づけです。
3. View関数は、リクエストを受け取り、画面表示や保存処理を行い、レスポンスを返すPython関数です。
4. `index.html` を使ってHTMLを作り、そのテンプレートへ `tasks` と `categories` を渡しています。
5. タスク追加フォームから送られてきたタスク名を取得しています。
6. `index()` に対応するURLへブラウザを移動させています。このアプリではトップページへ戻す処理です。
7. `base.html` は共通レイアウトです。`index.html` は `base.html` を継承し、`block content` にタスク一覧画面の本文を差し込みます。
8. GETのView関数は主に画面表示のために `render_template` を返します。POSTのView関数は保存や削除などの処理を行ったあと、主に `redirect` で別画面へ移動させます。

# 10. 次章への接続

この章では、Flaskアプリのルーティング、View関数、テンプレートの関係を確認しました。

この章でできるようになったこと:

- `app.py` の主な役割を説明できる
- `@app.route` とURLの関係を説明できる
- View関数がリクエストを処理する流れを説明できる
- `render_template` でテンプレートへ値を渡す流れを説明できる
- `redirect` と `url_for` の役割を説明できる
- `base.html` と子テンプレートの関係を説明できる

第3章では、View関数の中で使われているSQLAlchemyとデータベースの関係を学びます。

タスクを追加すると、なぜ再読み込みしてもタスクが残るのか。
カテゴリとタスク、タスクとコメントはどのようにつながっているのか。

次章では、ToDoアプリのデータがどこに保存され、どのようなモデルで表現されているかを確認します。
