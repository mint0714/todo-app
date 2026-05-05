# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第11章 RenderとDB運用 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 90〜120分 |
| 難易度 | 実践 |
| この章で作るもの | 本番環境でDBを扱うための構成理解と運用メモ |
| この章で変更するファイル | なし。DB構成と運用方針を確認する |

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

この章では、本番環境でデータを安全に扱うための考え方を学びます。

第10章では、Flask ToDoアプリをRenderへデプロイし、本番URLから画面を開ける状態にしました。

しかし、Webアプリは画面が表示されれば終わりではありません。ToDoアプリでは、タスク、カテゴリ、コメントといったデータを保存します。本番環境でそのデータをどう保存し、どう守るかを考える必要があります。

この章では、現在のアプリで使っているSQLiteと、本番環境でよく使われるPostgreSQLの違いを整理します。また、Render Postgres、`DATABASE_URL`、migrationの役割を確認します。

この章を終えると、次のことができるようになります。

- ローカルDB、テストDB、本番DBの違いを説明できる
- SQLiteとPostgreSQLの違いを説明できる
- Render上の一時的なファイルシステムの注意点を説明できる
- Render Postgresの役割を説明できる
- internal URLとexternal URLの違いを説明できる
- `DATABASE_URL` でDB接続先を切り替える考え方を説明できる
- migrationの役割を説明できる
- Flask-Migrate / Alembicが何のために使われるか説明できる

> 注意:
> この章では、アプリ本体のDB接続コードは変更しません。
> `app.py` をPostgreSQL対応にする実装や、migrationファイルの作成は、必要になった段階で別作業として扱います。

# 2. この章の完成イメージ

この章の最後には、DBの使い分けを次のように説明できる状態を目指します。

```text
ローカルPC
  -> 開発用DB
  -> 手動確認や開発中の動作確認に使う

pytest / Playwright
  -> テスト用DB
  -> テストのたびに状態をそろえて使う

Render
  -> 本番用DB
  -> 利用者のデータを保存する
  -> 長期的にはRender Postgresのような永続的なDBを使う
```

現在のアプリの状態:

```text
app.py
  -> sqlite:///todo.db を使う
  -> 起動時に db.create_all() でテーブルを作成する
```

本番運用で目指す考え方:

```text
ローカル環境
  -> sqlite:///todo.db

テスト環境
  -> テスト専用SQLite DB、またはテスト用DB

Render本番環境
  -> DATABASE_URL
  -> Render Postgres
  -> migrationでスキーマ変更を管理する
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン11-2 手順4のあと。
Render DashboardでPostgres作成画面、または既存PostgresのInfo画面を確認している状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `app.py` | 現在のDB接続設定とModel定義を確認する |
| `requirements.txt` | DB接続に必要なライブラリが将来ここに入ることを確認する |
| `instance/todo.db` | Flaskがローカルで作成するSQLite DBファイルの例 |
| `migrations/` | 将来、migrationを導入した場合に作られるディレクトリ |

> 注意:
> この章では、上記ファイルを編集しません。
> 役割を確認し、どのような変更が将来必要になるかを整理します。

## 3-2. この章で使う主なコマンド

この章では、実DBを変更するコマンドは実行しません。

ローカルの状態確認に使う主なコマンドは次のとおりです。

| コマンド | 目的 |
| --- | --- |
| `git status` | ローカルに意図しない変更がないか確認する |
| `ls instance` | SQLite DBファイルがあるか確認する |
| `dir instance` | Windows PowerShellでSQLite DBファイルがあるか確認する |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

Linux / macOS:

```bash
git status
ls instance
```

Windows PowerShell:

```powershell
git status
dir instance
```

> 補足:
> `instance/` がまだ存在しない場合もあります。
> ローカルでFlaskアプリを起動し、DBを使う操作をしたあとに作成されることがあります。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第10章の完了 | Renderの本番URLでToDoアプリを表示できる |
| 現在のDB | `app.py` でSQLiteを使っている |
| Render | Render Dashboardを開ける |
| 本番データ | タスク、カテゴリ、コメントがアプリ上で保存されることを理解している |
| Git | この章ではローカルファイルを変更しない |

この章の作業前の状態:

```text
ローカルPC
  -> Flask ToDoアプリがある
  -> SQLiteで動作確認できる

Render
  -> Web Serviceがある
  -> 本番URLでToDoアプリを表示できる

DB運用の理解
  -> SQLiteとPostgreSQLの違いはまだ整理できていない
  -> DATABASE_URLの使い方はまだ整理できていない
  -> migrationの必要性はまだ整理できていない
```

この章の作業後の状態:

```text
DB運用の理解
  -> 開発用DB、テスト用DB、本番用DBを区別できる
  -> SQLiteを本番データ保存に使うときの注意点を説明できる
  -> Render Postgresの役割を説明できる
  -> DATABASE_URLで接続先を切り替える考え方を説明できる
  -> migrationでDB構造の変更を管理する理由を説明できる
```

> 注意:
> 本番データやDB接続情報は慎重に扱います。
> 接続URL、ユーザー名、パスワードを教材メモやGitHubリポジトリにそのまま貼り付けないようにします。

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| 開発用DB | ローカルPCで手動確認や開発に使うDB |
| テスト用DB | 自動テストで使うDB。毎回同じ状態にそろえることが重要 |
| 本番用DB | 実際の利用者データを保存するDB |
| SQLite | 1つのファイルとして扱いやすい軽量DB |
| PostgreSQL | 本番環境で広く使われるDBサーバ |
| Render Postgres | Renderが提供するマネージドPostgreSQL |
| 永続化 | データを再起動や再デプロイ後も残すこと |
| 一時的なファイルシステム | 再起動や再デプロイで変更が失われる可能性がある保存領域 |
| `DATABASE_URL` | DB接続先を表すURL形式の環境変数 |
| internal URL | Render内のサービスから同じリージョンのDBへ接続するためのURL |
| external URL | Render外部のPCやツールからDBへ接続するためのURL |
| schema | DBのテーブル、カラム、制約などの構造 |
| migration | DBの構造変更をファイルとして管理し、順番に適用する仕組み |
| Flask-Migrate | FlaskアプリでAlembicによるmigrationを扱いやすくする拡張 |
| Alembic | SQLAlchemy向けのmigrationツール |

## 5-2. なぜDB運用を考えるのか

ToDoアプリでは、タスクを追加するとDBに保存されます。

DBに保存するデータには、次のようなものがあります。

| データ | 保存される内容 |
| --- | --- |
| タスク | タイトル、完了状態、作成日時、カテゴリ |
| カテゴリ | カテゴリ名 |
| コメント | コメント本文、作成日時、紐づくタスク |

開発中であれば、データが消えても作り直せることが多いです。

しかし、本番環境では利用者のデータが入ります。

本番環境では、次の観点が重要になります。

```text
データが再起動後も残るか
データが再デプロイ後も残るか
接続情報を安全に管理できるか
DB構造を変更するときに既存データを壊さないか
障害時に状況を確認できるか
```

この章では、まずDB運用の全体像をつかみます。

## 5-3. 開発用DB、テスト用DB、本番用DB

DBは、目的ごとに分けて考えます。

| DB | 主な用途 | 大事なこと |
| --- | --- | --- |
| 開発用DB | ローカルで手動確認する | 作り直しやすいこと |
| テスト用DB | 自動テストで使う | 毎回同じ状態から始められること |
| 本番用DB | 利用者データを保存する | 消えないこと、安全に扱えること |

同じToDoアプリでも、DBの役割は環境によって変わります。

```text
開発用DB
  -> 自分が試すためのデータ
  -> 消えても比較的困らない

テスト用DB
  -> テストが作るデータ
  -> テスト後に消してよい

本番用DB
  -> 利用者が作ったデータ
  -> 勝手に消してはいけない
```

この区別があいまいだと、テストで本番データを壊したり、ローカル用の設定を本番へ持ち込んだりする危険があります。

## 5-4. SQLiteの特徴

SQLiteは、1つのファイルとして扱える軽量なDBです。

この教材の現在のアプリでは、次の設定でSQLiteを使っています。

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
```

SQLiteのよいところ:

| 観点 | 内容 |
| --- | --- |
| 準備 | DBサーバを別途起動しなくてよい |
| 学習 | ファイルとして扱えるため理解しやすい |
| ローカル開発 | 小さなアプリの動作確認に向いている |
| テスト | テスト用DBを作り直しやすい |

一方で、本番環境では注意が必要です。

| 注意点 | 内容 |
| --- | --- |
| ファイル保存 | DBファイルがどこに保存されるかを意識する必要がある |
| 永続性 | 実行環境のファイルシステムに依存する |
| スケール | 複数インスタンスや高負荷の運用には向きにくい |
| バックアップ | 本番データとして扱うならバックアップ設計が必要 |

SQLiteが悪いわけではありません。

学習、ローカル開発、小さな確認には便利です。ただし、本番環境で利用者データを長く安全に扱う場合は、別の選択肢を検討します。

## 5-5. Renderの一時的なファイルシステム

RenderのWeb Serviceでは、ローカルファイルとして書き込んだ内容が再デプロイや再起動で失われる可能性があります。

このような保存領域を、一時的なファイルシステムとして考えます。

SQLiteはDBファイルをローカルファイルとして保存します。

そのため、Render上でSQLiteを使う場合、次のような問題が起きる可能性があります。

```text
タスクを追加する
  -> SQLiteファイルに保存される
  -> Renderの再デプロイや再起動が発生する
  -> ローカルファイルが失われる可能性がある
  -> 追加したタスクが消える可能性がある
```

学習用に「画面が動くこと」を確認するだけなら、第10章の状態でも学べることは多いです。

しかし、利用者データを長期保存する本番アプリとして扱う場合は、Render Postgresのような永続的なDBを検討します。

## 5-6. PostgreSQLの特徴

PostgreSQLは、本番環境で広く使われるDBサーバです。

SQLiteが「アプリの近くにある1つのDBファイル」として理解しやすいのに対して、PostgreSQLは「DBサーバに接続して使うDB」と考えると分かりやすいです。

| 観点 | SQLite | PostgreSQL |
| --- | --- | --- |
| 形式 | ファイルDB | DBサーバ |
| 起動 | 別サーバ不要 | DBサーバが必要 |
| 学習のしやすさ | とても扱いやすい | 設定項目が増える |
| 本番運用 | 注意が必要 | 本番運用でよく使われる |
| 複数接続 | 小規模向き | 複数接続を扱いやすい |
| バックアップ・監視 | 自分で考える部分が多い | サービスの機能を使いやすい |

本番環境では、アプリとDBを分けて考えます。

```text
Render Web Service
  -> Flaskアプリを動かす

Render Postgres
  -> 本番データを保存する
```

## 5-7. Render Postgres

Render Postgresは、Renderが提供するマネージドPostgreSQLです。

マネージドとは、DBサーバの作成、接続情報の管理、メトリクス確認などをクラウドサービス側の仕組みで扱えるという意味です。

Render Postgresでは、次のような情報を確認します。

| 項目 | 意味 |
| --- | --- |
| Database Name | DB名 |
| User | DBへ接続するユーザー |
| Password | DBへ接続するパスワード |
| Host | DBサーバの場所 |
| Port | PostgreSQLの接続ポート |
| Internal Database URL | Render内のサービスから接続するURL |
| External Database URL | Render外から接続するURL |

この教材のように、Render Web ServiceからRender Postgresへ接続する場合は、基本的にinternal URLを使うと考えます。

```text
Render Web Service
  -> internal URL
  -> Render Postgres
```

ローカルPCや外部ツールから接続する場合は、external URLを使うことがあります。

```text
ローカルPC
  -> external URL
  -> Render Postgres
```

> 注意:
> internal URLやexternal URLには、ユーザー名やパスワードが含まれます。
> GitHubや教材メモにそのまま貼り付けないようにします。

## 5-8. `DATABASE_URL`

`DATABASE_URL` は、DB接続先をURL形式で表す環境変数としてよく使われます。

PostgreSQLの接続URLは、次のような形になります。

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

このURLには、次の情報が含まれています。

| 部分 | 意味 |
| --- | --- |
| `postgresql://` | PostgreSQLへ接続すること |
| `USER` | DBユーザー名 |
| `PASSWORD` | DBパスワード |
| `HOST` | DBサーバのホスト名 |
| `PORT` | DBサーバのポート |
| `DATABASE` | DB名 |

アプリ側では、環境変数から `DATABASE_URL` を読み取ることで、環境ごとにDB接続先を切り替えられます。

```text
ローカル環境
  -> DATABASE_URL がなければ sqlite:///todo.db を使う

Render本番環境
  -> DATABASE_URL に Render Postgres のinternal URLを設定する
  -> アプリはPostgreSQLへ接続する
```

考え方の例:

```python
DATABASE_URLがある場合:
  DATABASE_URLを使う

DATABASE_URLがない場合:
  sqlite:///todo.db を使う
```

> 注意:
> この章では、上記の考え方だけを整理します。
> 現在の `app.py` は `sqlite:///todo.db` を直接指定しているため、実際に `DATABASE_URL` へ切り替えるにはコード変更とPostgreSQL用ドライバの追加が必要です。

## 5-9. schemaとmigration

DBには、データそのものだけでなく、データを入れるための構造があります。

この構造をschemaと呼びます。

たとえば、現在のToDoアプリには次のようなテーブルがあります。

| テーブル | 主なカラム |
| --- | --- |
| `categories` | `id`, `name` |
| `tasks` | `id`, `title`, `is_completed`, `created_at`, `category_id` |
| `comments` | `id`, `body`, `created_at`, `task_id` |

開発が進むと、次のような変更をしたくなることがあります。

```text
タスクに期限日を追加する
カテゴリに色を追加する
コメントに編集日時を追加する
ユーザー管理を追加する
```

このような変更は、PythonのModelを書き換えるだけでは不十分です。

本番DBには既存データが入っているため、DBの構造を安全に更新する必要があります。

この「DB構造の変更を手順として管理する仕組み」がmigrationです。

```text
Modelを変更する
  -> migrationファイルを作る
  -> 内容を確認する
  -> 本番DBへ順番に適用する
```

## 5-10. `db.create_all()` とmigrationの違い

現在の `app.py` には、次の処理があります。

```python
with app.app_context():
    db.create_all()
```

`db.create_all()` は、存在しないテーブルを作るには便利です。

学習や小さなローカル開発では分かりやすい方法です。

ただし、本番運用では次のような点に注意が必要です。

| 観点 | `db.create_all()` | migration |
| --- | --- | --- |
| 得意なこと | まだないテーブルを作る | DB構造の変更履歴を管理する |
| 変更履歴 | 残らない | ファイルとして残る |
| 既存データへの配慮 | 弱い | 変更手順として確認できる |
| チーム開発 | 状態が追いにくい | 誰がどの変更を入れたか追いやすい |
| 本番運用 | 注意が必要 | よく使われる |

本番DBでは、migrationファイルをGitで管理し、デプロイ時に順番に適用する考え方が重要になります。

## 5-11. Flask-Migrate / Alembic

Flask-Migrateは、FlaskアプリでDB migrationを扱いやすくする拡張です。

内部ではAlembicというmigrationツールを使います。

典型的には、次のような流れになります。

```text
Flask-Migrateを導入する
  -> flask db init でmigration管理を始める
  -> flask db migrate でmigrationファイルを作る
  -> migrationファイルを確認する
  -> flask db upgrade でDBへ適用する
```

代表的なコマンド:

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

> 注意:
> この章では、これらのコマンドは実行しません。
> migrationの必要性と流れを理解することが目的です。

# 6. ハンズオン

## ハンズオン11-1: ローカルDB、テストDB、本番DBの違いを整理する

目的:
同じToDoアプリでも、DBを使う目的が環境によって違うことを整理します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
第10章でRenderへデプロイし、本番URLでToDoアプリを表示できる状態です。

手順:

1. 現在の教材で登場するDBを3つに分けます。

```text
開発用DB
テスト用DB
本番用DB
```

2. それぞれの目的を表に整理します。

| DB | 使う場面 | 消えてよいか |
| --- | --- | --- |
| 開発用DB | ローカル手動確認 | 作り直せるなら消えてもよい |
| テスト用DB | pytest / Playwright | テストごとに消してよい |
| 本番用DB | Renderで公開したアプリ | 勝手に消えてはいけない |

3. 現在の `app.py` のDB設定を確認します。

確認するコード:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
```

4. 現在のアプリは、環境ごとにDB接続先を切り替える作りにはなっていないことを確認します。
5. 将来的には、環境変数でDB接続先を切り替える必要があることを確認します。

期待される結果:
開発用DB、テスト用DB、本番用DBの違いを説明できます。

作業後の状態:
DBを「どこで使うか」と「何のために使うか」で分けて考えられる状態です。

確認ポイント:

画面上の確認:
なし。

裏側の確認:
本番用DBは、利用者データを保存するため、テスト用DBとは分ける必要があると説明できます。

## ハンズオン11-2: Render Postgresの役割を確認する

目的:
RenderでPostgreSQLを使う場合に、どのような設定項目があるか確認します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
Render Dashboardを開ける状態です。

手順:

1. Render Dashboardを開きます。
2. `New` または `New +` のメニューを開きます。
3. `Postgres` または `PostgreSQL` を選択する画面を確認します。
4. 作成画面に表示される主な項目を確認します。

| 項目 | 確認する内容 |
| --- | --- |
| Name | DBに付ける名前 |
| Database | PostgreSQL上のDB名 |
| User | 接続ユーザー |
| Region | DBを作成する地域 |
| PostgreSQL Version | 使用するPostgreSQLのバージョン |
| Instance Type | DBの性能や料金に関わるプラン |
| Storage | DBに割り当てる容量 |

5. 既にPostgresがある場合は、Info画面を開きます。
6. Connectメニューまたは接続情報の表示場所を確認します。
7. DBを新規作成するかどうかは、講師の指示または学習環境の方針に従います。

期待される結果:
Render Postgresが、Web Serviceとは別に作成する本番用DBであることを説明できます。

作業後の状態:
RenderでPostgresを作る場合に確認すべき項目が分かっています。

確認ポイント:

画面上の確認:
Render DashboardでPostgresの作成画面、または既存DBのInfo画面を確認できます。

裏側の確認:
Web Serviceはアプリを動かす場所、Render Postgresはデータを保存する場所だと説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン11-2 手順4のあと。
RenderのPostgres作成画面で、Name、Region、Instance Typeなどの項目が表示されている状態。

> 注意:
> Postgresの作成には、プランや料金が関係する場合があります。
> この教材では、画面と役割の確認を主目的にします。実際に作成する場合は、講師の指示やRenderの料金表示を確認してから進めます。

## ハンズオン11-3: `DATABASE_URL` の考え方を確認する

目的:
DB接続先を環境変数 `DATABASE_URL` で切り替える考え方を整理します。

実行場所:
Render画面 / ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
Render Postgresの役割と接続情報の場所を確認済みです。

手順:

1. PostgreSQL接続URLの形を確認します。

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

2. URLに含まれる情報を確認します。

| 部分 | 意味 |
| --- | --- |
| `USER` | DBユーザー名 |
| `PASSWORD` | DBパスワード |
| `HOST` | DBサーバ |
| `PORT` | PostgreSQLのポート |
| `DATABASE` | DB名 |

3. Render Web ServiceからRender Postgresへ接続する場合は、internal URLを使うことを確認します。

```text
Render Web Service
  -> DATABASE_URL
  -> internal URL
  -> Render Postgres
```

4. ローカルPCなどRender外部から接続する場合は、external URLを使うことがあると確認します。

```text
ローカルPC
  -> external URL
  -> Render Postgres
```

5. Render Web ServiceのEnvironment画面で、将来的に次のような環境変数を設定することを確認します。

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

6. 実際の接続URLをメモに貼る場合は、パスワード部分を必ず伏せます。

伏せた例:

```text
postgresql://todo_user:********@db-host:5432/todo_db
```

7. 現在の `app.py` は `DATABASE_URL` を読んでいないため、環境変数を設定するだけではDB接続先は切り替わらないことを確認します。

期待される結果:
`DATABASE_URL` が、DB接続先を環境ごとに切り替えるための設定値であることを説明できます。

作業後の状態:
Renderの環境変数とDB接続URLの関係を説明できる状態です。

確認ポイント:

画面上の確認:
Render Web ServiceのEnvironment画面で、環境変数を設定する場所を確認できます。

裏側の確認:
`DATABASE_URL` には接続情報と秘密情報が含まれるため、GitHubへcommitしてはいけないと説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン11-3 手順5のあと。
Render Web ServiceのEnvironment画面で、環境変数を追加する場所が表示されている状態。

> 注意:
> 実際の `DATABASE_URL` は秘密情報です。
> スクリーンショットを撮るときは、パスワードや接続URL全体が写らないようにします。

## ハンズオン11-4: migrationの必要性を整理する

目的:
本番DBの構造変更を安全に扱うために、migrationが必要になる理由を整理します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
現在のアプリが `db.create_all()` でテーブルを作成していることを確認済みです。

手順:

1. 現在のToDoアプリのテーブルを確認します。

| テーブル | 役割 |
| --- | --- |
| `categories` | カテゴリを保存する |
| `tasks` | タスクを保存する |
| `comments` | コメントを保存する |

2. 将来追加したくなりそうなDB変更を考えます。

例:

```text
tasks テーブルに due_date カラムを追加する
categories テーブルに color カラムを追加する
comments テーブルに updated_at カラムを追加する
```

3. 既存データが入っている本番DBで、いきなりDB構造を変える危険を考えます。

```text
既存データが壊れる
カラム追加の順番が分からなくなる
ローカルと本番でDB構造がずれる
誰がどの変更を入れたか追えなくなる
```

4. migrationを使う場合の流れを確認します。

```text
Modelを変更する
  -> migrationファイルを作る
  -> migrationファイルを確認する
  -> テスト環境で適用する
  -> 本番DBへ適用する
```

5. Flask-Migrate / Alembicでよく使うコマンドの役割を確認します。

| コマンド | 役割 |
| --- | --- |
| `flask db init` | migration管理を始める |
| `flask db migrate` | Model差分からmigrationファイルを作る |
| `flask db upgrade` | migrationをDBへ適用する |

期待される結果:
本番DBの構造変更は、migrationとして履歴を残して管理する必要があると説明できます。

作業後の状態:
`db.create_all()` とmigrationの役割の違いを説明できる状態です。

確認ポイント:

画面上の確認:
なし。

裏側の確認:
本番DBでは既存データを守る必要があるため、DB構造の変更履歴を管理することが重要だと説明できます。

> 注意:
> この章では `flask db init`、`flask db migrate`、`flask db upgrade` は実行しません。
> migration導入には、依存関係追加、アプリ初期化コード、既存DBとの整合確認が必要になります。

## ハンズオン11-5: DB構成図を作る

目的:
ローカル、CI、Render本番環境で使うDBの関係を図として整理します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
開発用DB、テスト用DB、本番用DB、Render Postgres、`DATABASE_URL`、migrationの役割を確認済みです。

手順:

1. 現在の構成を図で確認します。

```text
ローカルPC
  Flaskアプリ
    -> SQLite

GitHub Actions
  pytest / Playwright
    -> テスト用DB

Render
  Web Service
    -> SQLite
```

2. 本番DBを安全に扱う構成を図で確認します。

```text
ローカルPC
  Flaskアプリ
    -> 開発用SQLite

GitHub Actions
  pytest / Playwright
    -> テスト用DB

Render
  Web Service
    -> DATABASE_URL
    -> Render Postgres
```

3. DB接続先を環境変数で切り替える考え方を整理します。

```text
DATABASE_URL がある
  -> そのURLのDBへ接続する

DATABASE_URL がない
  -> ローカル用SQLiteへ接続する
```

4. schema変更をmigrationで管理する流れを図に追加します。

```text
Model変更
  -> migrationファイル
  -> CIで確認
  -> 本番DBへ適用
```

5. 次章以降でCDを考えるとき、DB変更とアプリのデプロイをセットで考える必要があることを確認します。

期待される結果:
ローカル、CI、本番環境でDBを分ける理由を図で説明できます。

作業後の状態:
Render本番環境でDBを扱うときの構成イメージが整理されています。

確認ポイント:

画面上の確認:
教材内の構成図を見ながら、現在の構成と目指す構成の違いを説明できます。

裏側の確認:
本番環境では、アプリのデプロイだけでなく、DB接続先とDB構造の変更管理も重要だと説明できます。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| DBの区分 | 開発用DB、テスト用DB、本番用DBの違いを説明できる |
| SQLite | 学習やローカル開発に便利だが、本番運用では注意が必要と説明できる |
| Renderの保存領域 | ローカルファイルが再デプロイや再起動で失われる可能性を説明できる |
| PostgreSQL | 本番データを保存するDBサーバとして使われることを説明できる |
| Render Postgres | Web Serviceとは別に作成するDBであることを説明できる |
| internal URL | Render内のサービスからDBへ接続するときに使うURLだと説明できる |
| external URL | Render外部からDBへ接続するときに使うURLだと説明できる |
| `DATABASE_URL` | DB接続先を環境変数で切り替える考え方を説明できる |
| migration | DB構造変更を履歴として管理する仕組みだと説明できる |
| 秘密情報 | DB接続URLをGitHubへcommitしてはいけないと説明できる |

画面上の確認:
Render DashboardでPostgresやEnvironmentの設定場所を確認できます。

裏側の確認:
現在の `app.py` はSQLite固定であり、PostgreSQL対応にはコード変更と依存関係追加が必要だと説明できます。

Git状態の確認:
この章ではローカルファイルを変更していないため、原則としてGitに新しい差分は増えません。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
```

確認:
DBの種類、接続先の切り替え、migrationの役割を自分の言葉で説明できれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. 開発用DB、テスト用DB、本番用DBは何が違いますか？
2. SQLiteが学習やローカル開発に向いている理由は何ですか？
3. Render上でSQLiteを本番データ保存に使うとき、どのような注意点がありますか？
4. PostgreSQLはSQLiteと何が違いますか？
5. Render Web ServiceとRender Postgresは、それぞれ何の役割を持ちますか？
6. internal URLとexternal URLの違いは何ですか？
7. `DATABASE_URL` は何のために使いますか？
8. DB接続URLをGitHubにcommitしてはいけない理由は何ですか？
9. migrationは何のために使いますか？
10. `db.create_all()` とmigrationは何が違いますか？

# 9. 理解チェックの回答例

1. 開発用DBはローカル確認用、テスト用DBは自動テスト用、本番用DBは利用者データを保存するためのDBです。本番用DBは勝手に消したり作り直したりしてはいけません。
2. SQLiteはDBサーバを別に立てなくても、ファイルとして扱えるためです。準備が少なく、学習や小さな動作確認に向いています。
3. SQLiteはローカルファイルにデータを保存します。RenderのWeb Serviceでは再デプロイや再起動でローカルファイルが失われる可能性があるため、本番データ保存には注意が必要です。
4. SQLiteはファイルDB、PostgreSQLはDBサーバとして動くDBです。PostgreSQLは本番環境で複数接続や運用機能を扱いやすい選択肢です。
5. Render Web ServiceはFlaskアプリを動かす場所です。Render Postgresはアプリが使う本番データを保存する場所です。
6. internal URLはRender内のサービスから同じリージョンのDBへ接続するときに使います。external URLはRender外部のPCやツールから接続するときに使います。
7. `DATABASE_URL` はDB接続先を環境変数として渡すために使います。環境ごとに接続先を切り替えられます。
8. DB接続URLにはユーザー名やパスワードが含まれるためです。GitHubにcommitすると、秘密情報が漏れる危険があります。
9. migrationは、DBのテーブルやカラムなどの構造変更を履歴として管理し、安全にDBへ適用するために使います。
10. `db.create_all()` は存在しないテーブルを作るには便利ですが、変更履歴を管理しません。migrationはDB構造の変更をファイルとして残し、順番に適用できます。

# 10. 次章への接続

この章では、本番環境でDBを扱うための基本を整理しました。

この章でできるようになったこと:

- 開発用DB、テスト用DB、本番用DBを区別できる
- SQLiteとPostgreSQLの違いを説明できる
- Render上の一時的なファイルシステムの注意点を説明できる
- Render Postgresの役割を説明できる
- `DATABASE_URL` でDB接続先を切り替える考え方を説明できる
- migrationの役割を説明できる
- 本番DBの接続情報を安全に扱う必要性を説明できる

ここまでで、アプリをRenderへ公開し、本番環境でデータをどう扱うべきかを整理できました。

第12章では、CIが成功したときだけRenderへ反映するCDの流れを作ります。Pull Requestではテストを実行し、`main` へマージされたらRenderへデプロイされる流れを確認します。
