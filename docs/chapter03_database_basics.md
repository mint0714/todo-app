# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第3章 データベースの基本 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 60〜90分 |
| 難易度 | 基礎 |
| この章で作るもの | Category、Task、Commentの関係図 |
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

この章では、ToDoアプリのデータがどこに保存され、Category、Task、Commentがどのようにつながっているかを確認します。

第2章では、URL、View関数、テンプレートの関係を読みました。この章では、View関数の中で使われているSQLAlchemyとデータベースの基本を学びます。

この章を終えると、次のことができるようになります。

- SQLiteとSQLAlchemyの役割を説明できる
- Model、Table、Recordの関係を説明できる
- Primary KeyとForeign Keyの役割を説明できる
- Category、Task、Commentの関係を説明できる
- タスク追加時にDBへ保存される流れを説明できる
- 1対多の関係をToDoアプリの具体例で説明できる

# 2. この章の完成イメージ

この章の最後には、ToDoアプリのデータ構造を次のように整理できる状態を目指します。

```text
Category
  id
  name
  tasks

Task
  id
  title
  is_completed
  created_at
  category_id
  comments

Comment
  id
  body
  created_at
  task_id
```

関係としては、次のようになります。

```text
Category 1件
  -> Task 複数件

Task 1件
  -> Comment 複数件
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン3-5 手順3のあと。
Category、Task、Commentの関係図が表示され、`category_id` と `task_id` のつながりが分かる状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `app.py` | DB設定、Model定義、DB保存処理が書かれている |
| `instance/` | ローカル実行時のSQLite DBファイルが置かれる場所 |
| `templates/index.html` | タスク追加フォームが書かれている |
| `templates/categories.html` | カテゴリ追加フォームが書かれている |
| `templates/detail.html` | コメント追加フォームが書かれている |
| `.gitignore` | `instance/` など、Git管理しないファイルを指定する |

> 注意:
> この章では、アプリ本体のファイルは編集しません。
> `app.py` のDB設定とModel定義を読み、データ構造を理解します。

## 3-2. この章で使う主なコマンド

| コマンド | 目的 |
| --- | --- |
| `python app.py` | Flaskアプリを起動し、DBを使う状態にする |
| `git status` | アプリ本体を変更していないことを確認する |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
python app.py
```

> 補足:
> この章では、SQLiteのコマンド操作は必須にしません。
> 初学者がまず理解すべきことは、PythonのModel定義がDBのTable構造に対応していることです。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第1章の理解 | GET、POST、HTML formの基本を説明できる |
| 第2章の理解 | URL、View関数、テンプレートの対応を説明できる |
| ローカル起動 | `python app.py` でToDoアプリを起動できる |
| エディタ | `app.py` を開いて読める |
| ブラウザ | ToDoアプリでタスク追加を手動確認できる |

この章の作業前の状態:

```text
理解
  -> フォーム送信がView関数につながることを知っている

ファイル
  -> app.py を読める
  -> アプリ本体のファイルは編集しない

ブラウザ
  -> ToDoアプリを表示できる
```

この章の作業後の状態:

```text
理解
  -> Model、Table、Recordの関係を説明できる
  -> Primary KeyとForeign Keyを説明できる
  -> Category、Task、Commentの関係を説明できる

ファイル
  -> アプリ本体のファイル変更はなし
```

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| SQLite | ファイルとして保存できる軽量なデータベース |
| SQLAlchemy | Pythonからデータベースを扱うためのライブラリ |
| Model | Pythonコード上でDBのテーブル構造を表すクラス |
| Table | DB内でデータを種類ごとに保存する入れ物 |
| Column | Tableの項目 |
| Record | Tableに保存された1件分のデータ |
| Primary Key | Recordを一意に識別するためのID |
| Foreign Key | 別のTableのRecordとつながるためのID |
| relationship | Model同士のつながりをPythonから扱いやすくする設定 |
| 1対多 | 1件のデータに、複数件のデータが紐づく関係 |

## 5-2. SQLite

SQLiteは、データを1つのファイルとして保存できる軽量なデータベースです。

このToDoアプリでは、ローカル開発用DBとしてSQLiteを使っています。

`app.py` には、次の設定があります。

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
```

この設定により、FlaskアプリはSQLiteのDBファイルを使います。

このプロジェクトでは、ローカル実行時に `instance/` 配下へDBファイルが作られることがあります。

```text
instance/todo.db
```

> 補足:
> `instance/` は `.gitignore` に含まれています。
> ローカルDBは環境ごとに変わるため、通常はGitHubへpushしません。

## 5-3. SQLAlchemy

SQLAlchemyは、Pythonからデータベースを扱うためのライブラリです。

このアプリでは、FlaskとSQLAlchemyをつなぐために、Flask-SQLAlchemyを使っています。

`app.py` には、次のコードがあります。

```python
db = SQLAlchemy(app)
```

この `db` を使って、Model、Column、Foreign Key、relationshipなどを定義します。

SQLAlchemyを使うと、SQL文を直接たくさん書かなくても、Pythonのクラスやオブジェクトとしてデータを扱えます。

## 5-4. Model、Table、Record

この教材では、Model、Table、Recordを次のように整理します。

| 用語 | ToDoアプリでの例 | 意味 |
| --- | --- | --- |
| Model | `Task` クラス | Pythonコード上のデータ定義 |
| Table | `tasks` テーブル | DB内の保存場所 |
| Record | タスク1件 | Tableに保存された1件のデータ |
| Column | `title`、`is_completed` など | Recordが持つ項目 |

たとえば、`Task` Modelは、DB内の `tasks` Tableに対応します。

```python
class Task(db.Model):
    __tablename__ = 'tasks'
```

`Task(title='買い物')` のようなデータを保存すると、`tasks` Tableに1件のRecordとして保存されます。

## 5-5. Primary Key

Primary Keyは、Recordを一意に識別するためのIDです。

ToDoアプリでは、Category、Task、Commentのすべてに `id` があります。

例:

```python
id = db.Column(db.Integer, primary_key=True)
```

`primary_key=True` は、そのColumnがPrimary Keyであることを表します。

Primary Keyがあることで、アプリは「どのタスクを完了にするか」「どのコメントを削除するか」を正確に指定できます。

## 5-6. Foreign Key

Foreign Keyは、別のTableのRecordとつながるためのIDです。

ToDoアプリでは、次のForeign Keyがあります。

| Foreign Key | つながる先 | 意味 |
| --- | --- | --- |
| `Task.category_id` | `categories.id` | タスクがどのカテゴリに属するか |
| `Comment.task_id` | `tasks.id` | コメントがどのタスクに属するか |

例:

```python
category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
```

これは、`tasks` Tableの `category_id` が、`categories` Tableの `id` とつながることを表します。

## 5-7. relationship

Foreign Keyは、DB上のつながりを表します。

一方で、`relationship` は、そのつながりをPythonコードから扱いやすくする設定です。

例:

```python
tasks = db.relationship('Task', backref='category', lazy=True)
```

この設定により、次のようにデータをたどれるようになります。

| 書き方 | 意味 |
| --- | --- |
| `category.tasks` | そのカテゴリに紐づくタスク一覧 |
| `task.category` | そのタスクが属するカテゴリ |

TaskとCommentの関係にも、同じ考え方があります。

```python
comments = db.relationship('Comment', backref='task',
                           lazy=True, cascade='all, delete-orphan')
```

この設定により、次のようにデータをたどれます。

| 書き方 | 意味 |
| --- | --- |
| `task.comments` | そのタスクに紐づくコメント一覧 |
| `comment.task` | そのコメントが属するタスク |

## 5-8. 1対多の関係

1対多は、1件のデータに複数件のデータが紐づく関係です。

ToDoアプリには、主に2つの1対多があります。

```text
Category 1件
  -> Task 複数件

Task 1件
  -> Comment 複数件
```

たとえば、`仕事` というカテゴリには、複数のタスクを紐づけられます。

また、1つのタスクには、複数のコメントを紐づけられます。

# 6. ハンズオン

## ハンズオン3-1: `Category` モデルを読む

目的:
カテゴリを保存する `Category` Modelの構造を確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`app.py` をエディタで開ける状態です。

手順:

1. `app.py` を開きます。
2. `Category` クラスを探します。

```python
class Category(db.Model):
    __tablename__ = 'categories'
```

3. `__tablename__` を確認します。

```python
__tablename__ = 'categories'
```

4. `id` Columnを確認します。

```python
id = db.Column(db.Integer, primary_key=True)
```

5. `name` Columnを確認します。

```python
name = db.Column(db.String(100), nullable=False, unique=True)
```

6. `tasks` relationshipを確認します。

```python
tasks = db.relationship('Task', backref='category', lazy=True)
```

期待される結果:
`Category` Modelが `categories` Tableに対応し、カテゴリ名と紐づくタスク一覧を持つことが分かります。

作業後の状態:
`Category` の `id`、`name`、`tasks` の役割を説明できます。

確認ポイント:

画面上の確認:
カテゴリ管理画面では、カテゴリ名と、そのカテゴリに紐づくタスク件数が表示されます。

裏側の確認:
`Category` と `Task` が `tasks = db.relationship(...)` によってつながっていることを説明できます。

## ハンズオン3-2: `Task` モデルを読む

目的:
タスクを保存する `Task` Modelの構造を確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`Category` Modelを確認し、カテゴリとタスクのつながりを見始めています。

手順:

1. `app.py` で `Task` クラスを探します。

```python
class Task(db.Model):
    __tablename__ = 'tasks'
```

2. `tasks` Tableに対応していることを確認します。

```python
__tablename__ = 'tasks'
```

3. タスク名を保存する `title` を確認します。

```python
title = db.Column(db.String(200), nullable=False)
```

4. 完了状態を保存する `is_completed` を確認します。

```python
is_completed = db.Column(db.Boolean, default=False)
```

5. 作成日時を保存する `created_at` を確認します。

```python
created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

6. カテゴリとのつながりを表す `category_id` を確認します。

```python
category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
```

7. コメントとのつながりを表す `comments` relationshipを確認します。

```python
comments = db.relationship('Comment', backref='task',
                           lazy=True, cascade='all, delete-orphan')
```

期待される結果:
`Task` Modelが、タスク名、完了状態、作成日時、カテゴリID、コメント一覧を持つことが分かります。

作業後の状態:
`Task` がToDoアプリの中心となるModelであり、CategoryとCommentの間に位置していることを説明できます。

確認ポイント:

画面上の確認:
タスク一覧画面では、タスク名、カテゴリ、完了ボタン、詳細リンクが表示されます。

裏側の確認:
`Task.category_id` が `categories.id` とつながり、`Task.comments` がコメント一覧を表すことを説明できます。

> 補足:
> `cascade='all, delete-orphan'` は、タスクを削除したときに、そのタスクに紐づくコメントも一緒に削除するための設定です。

## ハンズオン3-3: `Comment` モデルを読む

目的:
コメントを保存する `Comment` Modelの構造を確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`Task` Modelに `comments` relationshipがあることを確認しています。

手順:

1. `app.py` で `Comment` クラスを探します。

```python
class Comment(db.Model):
    __tablename__ = 'comments'
```

2. `comments` Tableに対応していることを確認します。

```python
__tablename__ = 'comments'
```

3. コメント本文を保存する `body` を確認します。

```python
body = db.Column(db.Text, nullable=False)
```

4. 作成日時を保存する `created_at` を確認します。

```python
created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

5. タスクとのつながりを表す `task_id` を確認します。

```python
task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
```

期待される結果:
`Comment` Modelが、コメント本文、作成日時、紐づくタスクIDを持つことが分かります。

作業後の状態:
コメントは単独で存在するのではなく、必ず1つのTaskに紐づくことを説明できます。

確認ポイント:

画面上の確認:
タスク詳細画面では、タスクに紐づくコメント一覧が表示されます。

裏側の確認:
`Comment.task_id` が `tasks.id` とつながり、`nullable=False` によってタスクなしのコメントを作れないことを説明できます。

## ハンズオン3-4: タスク追加時のDB保存処理を追う

目的:
タスク追加フォームから送られた値が、`Task` RecordとしてDBに保存される流れを確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
第2章で、タスク追加フォームが `POST /add` を送り、`add_task()` が実行されることを確認しています。

手順:

1. `templates/index.html` で、タスク追加フォームを確認します。

```html
<form action='/add' method='POST'>
```

2. `app.py` で、`add_task()` を探します。

```python
@app.route('/add', methods=['POST'])
def add_task():
```

3. フォームからタスク名を取得する行を確認します。

```python
title = request.form['title']
```

4. フォームからカテゴリIDを取得する行を確認します。

```python
category_id = request.form.get('category_id') or None
```

5. `Task` オブジェクトを作る行を確認します。

```python
new_task = Task(title=title, category_id=category_id)
```

6. DBへの追加を予約する行を確認します。

```python
db.session.add(new_task)
```

7. DBへ保存を確定する行を確認します。

```python
db.session.commit()
```

8. 保存後にトップページへ戻る行を確認します。

```python
return redirect(url_for('index'))
```

期待される結果:
フォーム入力が `Task` オブジェクトになり、`db.session.add()` と `db.session.commit()` によってDBへ保存されることが分かります。

作業後の状態:
タスク追加時の「フォーム入力、Model作成、DB保存、リダイレクト」の流れを説明できます。

確認ポイント:

画面上の確認:
タスクを追加すると、トップページへ戻り、追加したタスクが一覧に表示されます。

裏側の確認:
`Task(...)` が `tasks` TableのRecordに対応し、`commit()` によって保存が確定することを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン3-4 手順8のあと。
`add_task()` の中で、`request.form`、`Task(...)`、`db.session.add()`、`db.session.commit()`、`redirect(...)` が見えている状態。

> 補足:
> `db.session.add()` は「保存する予定に入れる」処理です。
> `db.session.commit()` によって、その変更がDBに確定します。

## ハンズオン3-5: Category、Task、Commentの関係図を作る

目的:
Category、Task、Commentの関係を、1対多とForeign Keyに注目して整理します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
`Category`、`Task`、`Comment` のModel定義を確認済みです。

手順:

1. 次の関係図を確認します。

```text
categories
  id   Primary Key
  name

      1
      |
      | tasks.category_id -> categories.id
      |
      多

tasks
  id   Primary Key
  title
  is_completed
  created_at
  category_id  Foreign Key

      1
      |
      | comments.task_id -> tasks.id
      |
      多

comments
  id   Primary Key
  body
  created_at
  task_id  Foreign Key
```

2. CategoryとTaskの関係を言葉で説明します。
3. TaskとCommentの関係を言葉で説明します。
4. 学習メモを残す場合は、`docs/` 配下にメモを作成してもかまいません。

期待される結果:
Category、Task、Commentが、2つの1対多の関係でつながっていることを説明できます。

作業後の状態:
DBの関係を見ながら、画面上のカテゴリ、タスク、コメントがどのTableに保存されるかを説明できます。

確認ポイント:

画面上の確認:
カテゴリ、タスク、コメントが、それぞれ別の情報として画面に表示されることを確認できます。

裏側の確認:
`tasks.category_id` と `comments.task_id` が、それぞれForeign Keyとして別Tableとつながっていることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン3-5 手順1のあと。
Category、Task、Commentの関係図が表示され、Primary KeyとForeign Keyが分かる状態。

> メモ:
> 自分の言葉で説明してみましょう。
> 「1つのカテゴリには複数のタスクを紐づけられる」
> 「1つのタスクには複数のコメントを紐づけられる」

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| SQLite | ローカル開発用DBとして使われていることを説明できる |
| SQLAlchemy | PythonのModelからDBを扱うために使われていることを説明できる |
| ModelとTable | `Category`、`Task`、`Comment` がそれぞれTableに対応することを説明できる |
| Primary Key | 各Modelの `id` がRecordを識別することを説明できる |
| Foreign Key | `category_id` と `task_id` のつながりを説明できる |
| relationship | `category.tasks`、`task.category`、`task.comments`、`comment.task` を説明できる |
| DB保存 | `db.session.add()` と `db.session.commit()` の役割を説明できる |
| ファイル変更 | アプリ本体のファイルを編集していない |

確認:
Category、Task、Commentの関係を図にして説明できれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. SQLiteは、このToDoアプリで何のために使われていますか？
2. SQLAlchemyを使うと、どのようなことができますか？
3. Model、Table、Recordの関係を説明してください。
4. Primary Keyは何のためにありますか？
5. Foreign Keyは何のためにありますか？
6. `Task.category_id` は、どのTableのどのColumnとつながっていますか？
7. `Comment.task_id` は、どのTableのどのColumnとつながっていますか？
8. `db.session.add()` と `db.session.commit()` の違いを説明してください。

# 9. 理解チェックの回答例

1. ToDoアプリのカテゴリ、タスク、コメントをローカルPC上のDBファイルに保存するために使われています。
2. Pythonのクラスやオブジェクトを使って、DBのTableやRecordを扱えます。SQLを直接たくさん書かなくても、データの保存や取得ができます。
3. ModelはPythonコード上のデータ定義、TableはDB内の保存場所、RecordはTableに保存された1件分のデータです。
4. Primary Keyは、Recordを一意に識別するためにあります。たとえば、どのタスクを完了にするかをIDで指定できます。
5. Foreign Keyは、別のTableのRecordとつながるためにあります。タスクとカテゴリ、コメントとタスクを紐づけるために使います。
6. `Task.category_id` は、`categories` Tableの `id` Columnとつながっています。
7. `Comment.task_id` は、`tasks` Tableの `id` Columnとつながっています。
8. `db.session.add()` は保存する対象をセッションに追加する処理です。`db.session.commit()` は、その変更をDBへ確定する処理です。

# 10. 次章への接続

この章では、ToDoアプリのデータ構造を確認しました。

この章でできるようになったこと:

- SQLiteとSQLAlchemyの役割を説明できる
- Model、Table、Recordの関係を説明できる
- Primary KeyとForeign Keyの役割を説明できる
- Category、Task、Commentの1対多の関係を説明できる
- タスク追加時にDBへ保存される流れを説明できる

第4章では、ここまで手動で確認してきた操作を、どのようにテストとして整理するかを学びます。

タスク追加、カテゴリ追加、コメント追加は、どこまで自動テストで確認すべきか。
すべてをE2Eテストにするべきなのか。

次章では、自動テストを書く前に、テストの種類と考え方を整理します。
