# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第0章 開発環境と前提知識 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 60〜90分 |
| 難易度 | 入門 |
| この章で作るもの | Flask ToDoアプリをローカルで起動できる開発環境 |
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

この章では、以降のハンズオンを進めるための開発環境を確認します。

Webアプリ開発では、Pythonの実行環境、依存関係、ローカルサーバ、Git、GitHubを組み合わせて作業します。最初は道具が多く見えますが、この章では「何のために使うか」と「最低限どのコマンドを実行するか」に絞って確認します。

この章を終えると、次のことができるようになります。

- Pythonとpipの役割を説明できる
- 仮想環境を有効化できる
- `requirements.txt` から依存関係をインストールできる
- Flaskアプリをローカルで起動できる
- ブラウザでToDoアプリを手動確認できる
- `git status` で作業状態を確認できる
- branch、commit、push、pull requestの関係を説明できる
- `.gitignore` の役割を説明できる

# 2. この章の完成イメージ

この章の最後には、ローカルPCでFlask ToDoアプリを起動し、ブラウザから次の操作を確認できる状態を目指します。

```text
ローカルPC
  -> Pythonの仮想環境を有効化する
  -> requirements.txt から必要なライブラリを入れる
  -> python app.py でFlaskアプリを起動する

ブラウザ
  -> http://127.0.0.1:5000 を開く
  -> タスクを追加する
  -> 完了、詳細、コメント、削除の入口を確認する

Git / GitHub
  -> git status で状態を確認する
  -> 作業ブランチを作る
  -> pushとpull requestの流れを理解する
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン0-6 手順3のあと。
ToDoリスト画面がブラウザに表示されている状態。
URLバーには `http://127.0.0.1:5000` が表示されている。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `app.py` | Flaskアプリ本体。ローカル起動時に実行する |
| `requirements.txt` | このアプリに必要なPythonライブラリの一覧 |
| `templates/` | ブラウザに表示するHTMLテンプレート |
| `static/` | CSSなどの静的ファイル |
| `instance/` | ローカル実行時のSQLite DBなどが置かれる場所 |
| `.gitignore` | Gitで管理しないファイルやディレクトリの指定 |

> 注意:
> この章ではアプリ本体のファイルは編集しません。
> `app.py`、`templates/`、`static/`、`requirements.txt` は読む、または実行する対象です。

## 3-2. この章で使う主なコマンド

| コマンド | 目的 |
| --- | --- |
| `python --version` | Pythonが使えるか確認する |
| `python -m pip --version` | pipが使えるか確認する |
| `python -m venv venv` | 仮想環境を作成する |
| `pip install -r requirements.txt` | 必要なライブラリをインストールする |
| `python app.py` | Flaskアプリを起動する |
| `git status` | Gitの作業状態を確認する |
| `git switch -c chapter00-practice` | 作業ブランチを作成して切り替える |
| `git push -u origin chapter00-practice` | 作業ブランチをGitHubへ送る |

# 4. 前提確認

この章では、次の準備ができている前提で進めます。

| 項目 | 確認内容 |
| --- | --- |
| ローカルPC | ターミナルを開ける |
| Python | Python 3系を実行できる |
| pip | Pythonライブラリをインストールできる |
| Git | `git` コマンドを実行できる |
| GitHub | GitHubアカウントを持っている |
| ブラウザ | Chrome、Edge、Firefox、Safariなどを使える |
| プロジェクト | ToDoアプリのリポジトリをローカルPCに置いている |

> 補足:
> Pythonはプログラムを実行する道具です。
> pipはPython用ライブラリをインストールする道具です。
> Gitは変更履歴を管理する道具です。
> GitHubはGitの履歴をオンラインで共有するサービスです。

# 5. 概念説明

## 5-1. Python、pip、venv

PythonでWebアプリを動かすには、Python本体に加えて、Flaskなどのライブラリが必要です。

| 用語 | 役割 |
| --- | --- |
| Python | Pythonプログラムを実行する |
| pip | Pythonライブラリをインストールする |
| venv | プロジェクト専用のPython環境を作る |

`venv` は仮想環境と呼ばれます。

仮想環境を使うと、プロジェクトごとにライブラリを分けられます。たとえば、あるプロジェクトではFlask 3系を使い、別のプロジェクトでは別のバージョンを使う、という管理がしやすくなります。

> 補足:
> 仮想環境は「プロジェクト専用の道具箱」のようなものです。
> PC全体にライブラリを直接入れるのではなく、このプロジェクト用の場所にまとめます。

## 5-2. `requirements.txt`

`requirements.txt` は、このアプリを動かすために必要なPythonライブラリを書いたファイルです。

このプロジェクトでは、主に次のようなライブラリが使われます。

| ライブラリ | 役割 |
| --- | --- |
| Flask | Webアプリを作るためのフレームワーク |
| Flask-SQLAlchemy | Flaskからデータベースを扱いやすくする |
| SQLAlchemy | Pythonからデータベースを操作する |
| gunicorn | 本番環境でFlaskアプリを動かすためのサーバ |

依存関係は、次のコマンドでまとめてインストールできます。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
pip install -r requirements.txt
```

## 5-3. Flaskアプリのローカル起動

Flaskは、PythonでWebアプリを作るための軽量なフレームワークです。

このプロジェクトでは、`app.py` を実行するとローカルPC上でWebサーバが起動します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
python app.py
```

起動に成功すると、ブラウザから次のURLにアクセスできます。

```text
http://127.0.0.1:5000
```

`127.0.0.1` は、自分のPC自身を表す特別なアドレスです。`5000` はFlaskが使うポート番号です。

## 5-4. GitとGitHub

Gitは、ファイルの変更履歴を管理するツールです。

GitHubは、Gitで管理しているプロジェクトをオンライン上で共有するサービスです。

本教材では、次の流れを何度も使います。

```text
branchを作る
  -> ファイルを変更する
  -> commitする
  -> GitHubへpushする
  -> pull requestを作る
  -> レビューや自動テストを確認する
  -> mainへマージする
```

| 用語 | 役割 |
| --- | --- |
| branch | 作業を分けるための履歴の分岐 |
| commit | 変更のまとまりを履歴として保存したもの |
| push | ローカルPCのcommitをGitHubへ送ること |
| pull request | 変更をmainへ取り込む前に確認するための依頼 |
| merge | branchの変更を別のbranchへ取り込むこと |

> 補足:
> 実務では、いきなりmainに作業するのではなく、作業用branchで変更し、pull requestで確認してからmainへ取り込む流れがよく使われます。

## 5-5. `.gitignore`

`.gitignore` は、Gitで管理しないファイルやディレクトリを指定するファイルです。

このプロジェクトでは、次のようなものをGit管理から外します。

| 指定 | 理由 |
| --- | --- |
| `venv/` | 仮想環境は各自のPCで作り直せるため |
| `instance/` | ローカルDBなど、環境ごとに変わるファイルが入るため |
| `__pycache__/` | Pythonが自動生成するキャッシュのため |
| `*.pyc` | Pythonが自動生成するコンパイル済みファイルのため |
| `.vscode/` | エディタの個人設定が入るため |

> 注意:
> DBファイルや仮想環境をGitHubに上げると、不要な差分が増えたり、環境依存の問題が起きたりします。
> `.gitignore` は、チームで共有するべきファイルと、各自のPCだけに置くファイルを分けるために使います。

# 6. ハンズオン

## ハンズオン0-1: プロジェクトディレクトリを確認する

目的:
作業する場所がToDoアプリのプロジェクトディレクトリであることを確認します。

実行場所:
ローカルPCのターミナル

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
どのディレクトリで作業すればよいか、まだ確認していない状態です。

手順:

1. ターミナルを開きます。
2. ToDoアプリのプロジェクトディレクトリへ移動します。

実行場所: ローカルPCのターミナル

```bash
cd todo-app
```

3. 現在の場所を確認します。

Linux / macOS:

```bash
pwd
```

Windows PowerShell:

```powershell
Get-Location
```

4. ファイル一覧を確認します。

Linux / macOS:

```bash
ls
```

Windows PowerShell:

```powershell
dir
```

期待される結果:
ファイル一覧に、少なくとも次のファイルやディレクトリが表示されます。

```text
app.py
requirements.txt
templates/
static/
docs/
```

作業後の状態:
`app.py` と `requirements.txt` があるプロジェクトディレクトリで作業できています。

確認ポイント:
`app.py` と `requirements.txt` があるディレクトリで作業できていれば成功です。

> 注意:
> `python app.py` や `pip install -r requirements.txt` は、原則として `requirements.txt` があるプロジェクトディレクトリで実行します。

## ハンズオン0-2: Pythonとpipを確認する

目的:
Flaskアプリを動かすために、Pythonとpipが使える状態か確認します。

実行場所:
ローカルPCのターミナル、プロジェクトディレクトリ

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
Pythonとpipを実行できるか、まだ確認していない状態です。

手順:

1. Pythonのバージョンを確認します。

Linux / macOS:

```bash
python3 --version
```

Windows PowerShell:

```powershell
python --version
```

2. pipのバージョンを確認します。

Linux / macOS:

```bash
python3 -m pip --version
```

Windows PowerShell:

```powershell
python -m pip --version
```

期待される結果:
Pythonとpipのバージョンが表示されます。

例:

```text
Python 3.12.x
pip xx.x from ...
```

作業後の状態:
Pythonとpipのバージョンを確認できています。

確認ポイント:
バージョン番号が表示されれば、Pythonとpipを実行できています。

> 補足:
> 環境によって、Pythonのコマンド名は `python` または `python3` です。
> この章では、Linux / macOSでは `python3`、Windows PowerShellでは `python` として表記します。

## ハンズオン0-3: 仮想環境を作成して有効化する

目的:
このプロジェクト専用のPython環境を用意します。

実行場所:
ローカルPCのターミナル、プロジェクトディレクトリ

変更するファイル:
`venv/`。ローカル環境用のディレクトリで、Git管理対象にはしません。

手順の種類:
実行する手順

作業前の状態:
このプロジェクト専用の仮想環境がまだ有効になっていない状態です。

手順:

1. 仮想環境を作成します。

Linux / macOS:

```bash
python3 -m venv venv
```

Windows PowerShell:

```powershell
python -m venv venv
```

2. 仮想環境を有効化します。

| 環境 | 仮想環境の有効化コマンド |
| --- | --- |
| Linux / macOS | `source venv/bin/activate` |
| Windows PowerShell | `.\venv\Scripts\Activate.ps1` |

Linux / macOS:

```bash
source venv/bin/activate
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

3. Pythonの場所を確認します。

Linux / macOS:

```bash
which python
```

Windows PowerShell:

```powershell
where.exe python
```

期待される結果:
ターミナルの表示に `(venv)` が付き、Pythonの場所が `venv` 配下を指します。

例:

```text
(venv)
```

作業後の状態:
仮想環境が作成され、ターミナルで有効化されています。

確認ポイント:
`(venv)` が表示されていれば、仮想環境が有効です。

> 注意:
> すでに `venv/` が存在する場合でも、この手順をもう一度実行して大きな問題になることは通常ありません。
> ただし、チームや講師から指定された仮想環境がある場合は、その指示を優先してください。

## ハンズオン0-4: 依存関係をインストールする

目的:
`requirements.txt` に書かれたライブラリを仮想環境にインストールします。

実行場所:
ローカルPCのターミナル、プロジェクトディレクトリ

変更するファイル:
`venv/`。仮想環境内にPythonライブラリがインストールされます。

手順の種類:
実行する手順

作業前の状態:
仮想環境は有効ですが、必要なライブラリはまだインストールしていない状態です。

手順:

1. 仮想環境が有効であることを確認します。

```text
(venv)
```

2. 依存関係をインストールします。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
pip install -r requirements.txt
```

3. Flaskが入ったことを確認します。

```bash
python -m flask --version
```

期待される結果:
Flaskのバージョン情報が表示されます。

例:

```text
Python 3.x.x
Flask 3.x.x
Werkzeug 3.x.x
```

作業後の状態:
仮想環境内にFlaskなどの依存関係がインストールされています。

確認ポイント:
`pip install -r requirements.txt` が完了し、Flaskのバージョンが表示されれば成功です。

> 注意:
> `pip install` は仮想環境を有効化したあとに実行します。
> 仮想環境を有効化しないまま実行すると、PC全体のPython環境にライブラリが入ることがあります。

## ハンズオン0-5: Flaskアプリを起動する

目的:
ToDoアプリをローカルPC上で起動します。

実行場所:
ローカルPCのターミナル、プロジェクトディレクトリ

変更するファイル:
なし。起動時に `instance/` 配下へローカルDBが作られる場合があります。

手順の種類:
実行する手順

作業前の状態:
依存関係はインストール済みですが、Flaskアプリはまだ起動していない状態です。

手順:

1. 仮想環境が有効であることを確認します。

```text
(venv)
```

2. Flaskアプリを起動します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
python app.py
```

3. ターミナルに表示されるURLを確認します。

期待される結果:
ターミナルに次のような表示が出ます。

```text
Running on http://127.0.0.1:5000
```

作業後の状態:
FlaskアプリがローカルPC上で起動し、ブラウザからアクセスできる状態です。

確認ポイント:
`http://127.0.0.1:5000` が表示され、ターミナルが起動中の状態になっていれば成功です。

> 注意:
> Flaskアプリを起動している間、そのターミナルはサーバ用に使われます。
> 別のコマンドを実行したい場合は、新しいターミナルを開きます。

> 補足:
> 起動を止めるときは、サーバを起動しているターミナルで `Ctrl + C` を押します。

## ハンズオン0-6: ToDoアプリを手動操作する

目的:
ブラウザからToDoアプリを操作し、ローカル起動が正しくできていることを確認します。

実行場所:
ブラウザ

変更するファイル:
なし。操作により、ローカルSQLite DBにタスクやコメントのデータが保存されます。

手順の種類:
実行する手順

作業前の状態:
Flaskアプリがローカルで起動し、ブラウザからアクセスできる状態です。

手順:

1. ブラウザを開きます。
2. 次のURLにアクセスします。

```text
http://127.0.0.1:5000
```

3. ToDoリスト画面が表示されることを確認します。
4. タスク入力欄に次の文字を入力します。

```text
第0章の動作確認
```

5. `追加` ボタンを押します。
6. 追加したタスクが一覧に表示されることを確認します。
7. `完了` ボタンを押し、表示が切り替わることを確認します。
8. `詳細` リンクを押し、タスク詳細画面が開くことを確認します。
9. コメント欄に次の文字を入力します。

```text
ローカルで動作確認できた
```

10. `追加` ボタンを押し、コメントが表示されることを確認します。
11. 画面上部の `タスク一覧` リンクで一覧に戻ります。

期待される結果:
タスクの追加、完了状態の切り替え、詳細画面の表示、コメント追加ができます。

作業後の状態:
ローカルDBに、手動確認で追加したタスクやコメントが保存されています。

確認ポイント:
ブラウザ操作によって画面が変わり、入力したタスクやコメントが表示されれば成功です。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン0-6 手順6のあと。
タスク一覧画面に `第0章の動作確認` というタスクが表示されている状態。
タスクの近くに `詳細`、`完了`、`削除` の操作が表示されている。

> 補足:
> このアプリはSQLiteを使っています。
> ローカル起動時に、`instance/` 配下にDBファイルが作られることがあります。

## ハンズオン0-7: Gitの状態を確認する

目的:
`git status` を使って、現在の作業状態を確認します。

実行場所:
ローカルPCのターミナル、プロジェクトディレクトリ

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
ローカルでアプリを起動し、手動操作まで確認済みです。

手順:

1. Flaskアプリを起動しているターミナルとは別のターミナルを開きます。
2. プロジェクトディレクトリへ移動します。
3. Gitの状態を確認します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
```

4. `.gitignore` の内容を確認します。

Linux / macOS:

```bash
cat .gitignore
```

Windows PowerShell:

```powershell
Get-Content .gitignore
```

期待される結果:
`git status` に現在のbranch名、変更されたファイル、未追跡ファイルなどが表示されます。

`.gitignore` には、次のような指定が含まれます。

```text
venv/
instance/
__pycache__/
*.pyc
.vscode/
```

作業後の状態:
現在のbranch、変更状態、Git管理しないファイルの方針を確認できています。

確認ポイント:
`git status` の表示を見て、現在どのbranchにいるか、変更があるかを確認できれば成功です。

> 補足:
> `instance/` や `venv/` は `.gitignore` に含まれているため、通常はGitの変更として扱われません。
> 手動操作で作られたローカルDBは、GitHubにpushしないのが基本です。

## ハンズオン0-8: 作業ブランチを作る

目的:
mainやdevelopに直接作業せず、学習用の作業ブランチを作成します。

実行場所:
ローカルPCのターミナル、プロジェクトディレクトリ

変更するファイル:
なし。Gitのbranch状態を変更します。

手順の種類:
実行する手順

作業前の状態:
`main` または `develop` などの基本ブランチにいる状態です。

手順:

1. 現在のbranchを確認します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git branch --show-current
```

2. 作業ブランチを作成して切り替えます。

```bash
git switch -c chapter00-practice
```

3. もう一度、現在のbranchを確認します。

```bash
git branch --show-current
```

4. Gitの状態を確認します。

```bash
git status
```

期待される結果:
現在のbranch名として `chapter00-practice` が表示されます。

作業後の状態:
学習用の作業ブランチ `chapter00-practice` に切り替わっています。

確認ポイント:
`git branch --show-current` の結果が `chapter00-practice` であれば成功です。

> 注意:
> `chapter00-practice` というbranchがすでにある場合は、次のコマンドで切り替えます。
>
> ```bash
> git switch chapter00-practice
> ```

## ハンズオン0-9: GitHubへpushする流れを確認する

目的:
ローカルPCの作業ブランチをGitHubへ送る流れを確認します。

実行場所:
ローカルPCのターミナル / GitHub画面

変更するファイル:
なし。GitHub上に作業ブランチを送ります。

手順の種類:
実行する手順

作業前の状態:
ローカルPCで `chapter00-practice` branchに切り替わっている状態です。

手順:

1. GitHubの接続先を確認します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git remote -v
```

2. `origin` という名前の接続先が表示されることを確認します。

表示例:

```text
origin  git@github.com:ユーザー名/todo-app.git (fetch)
origin  git@github.com:ユーザー名/todo-app.git (push)
```

3. 作業ブランチをGitHubへpushします。

```bash
git push -u origin chapter00-practice
```

4. ブラウザでGitHubのリポジトリ画面を開きます。
5. `chapter00-practice` branchがGitHub上に表示されることを確認します。
6. GitHubに `Compare & pull request` ボタンが表示される場合は、pull request作成画面を開きます。
7. この章では、pull requestを作成する前に画面の構成だけ確認します。

期待される結果:
GitHub上で `chapter00-practice` branchを確認できます。

作業後の状態:
ローカルPCの作業ブランチがGitHub上にも存在しています。

確認ポイント:
ローカルPCで作ったbranchがGitHub画面でも見えれば成功です。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン0-9 手順6のあと。
GitHubのリポジトリ画面に `chapter00-practice` branch、または `Compare & pull request` ボタンが表示されている状態。

> 補足:
> pull requestは、作業ブランチの変更をmainやdevelopへ取り込む前に確認するための仕組みです。
> この章では流れの確認にとどめ、以降の章で実際の変更、テスト、pull requestを扱います。

> 注意:
> `git remote -v` で何も表示されない場合、まだGitHubリポジトリとの接続が設定されていません。
> その場合は、講師または教材のセットアップ手順に従ってリモートリポジトリを設定してください。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| Python | `python --version` または `python3 --version` でバージョンが表示される |
| pip | `python -m pip --version` または `python3 -m pip --version` でバージョンが表示される |
| 仮想環境 | ターミナルに `(venv)` が表示される |
| 依存関係 | `python -m flask --version` でFlaskの情報が表示される |
| ローカル起動 | `python app.py` で `http://127.0.0.1:5000` が表示される |
| ブラウザ確認 | ToDoリスト画面でタスクを追加できる |
| Git状態確認 | `git status` で現在の状態を確認できる |
| branch | `chapter00-practice` branchを作成できる |
| GitHub | 作業branchをGitHub上で確認できる |

確認:
ブラウザでToDoアプリを開き、タスクを追加できれば、以降の章に進むためのローカル開発環境は準備できています。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. Pythonとpipは、それぞれ何のために使いますか？
2. 仮想環境を使う理由は何ですか？
3. `requirements.txt` には何が書かれていますか？
4. `python app.py` を実行すると、何が起きますか？
5. `http://127.0.0.1:5000` の `127.0.0.1` は何を表しますか？
6. `git status` では何を確認できますか？
7. branch、commit、push、pull requestの関係を説明してください。
8. `.gitignore` は何のために使いますか？

# 9. 理解チェックの回答例

1. PythonはPythonプログラムを実行するために使います。pipはFlaskなどのPythonライブラリをインストールするために使います。
2. プロジェクトごとに使うライブラリやバージョンを分けるためです。PC全体のPython環境を汚さずに作業できます。
3. このアプリを動かすために必要なPythonライブラリと、そのバージョンが書かれています。
4. Flaskのローカルサーバが起動し、ブラウザからToDoアプリにアクセスできるようになります。
5. `127.0.0.1` は自分のPC自身を表すアドレスです。ローカルで起動したアプリにアクセスするときに使います。
6. 現在のbranch、変更されたファイル、未追跡ファイル、commitすべき変更があるかなどを確認できます。
7. branchは作業を分ける場所です。commitは変更を履歴として保存したものです。pushはcommitをGitHubへ送ることです。pull requestは、作業branchの変更をmainやdevelopへ取り込む前に確認するための依頼です。
8. Gitで管理しないファイルを指定するために使います。たとえば仮想環境、ローカルDB、キャッシュ、個人のエディタ設定などをGitHubに上げないようにできます。

# 10. 次章への接続

この章では、Flask ToDoアプリをローカルPCで起動し、ブラウザから手動操作できる状態を作りました。

この章でできるようになったこと:

- Python、pip、venvの役割を説明できる
- `requirements.txt` から依存関係をインストールできる
- `python app.py` でFlaskアプリを起動できる
- ブラウザでToDoアプリを手動確認できる
- `git status` で作業状態を確認できる
- branch、commit、push、pull requestの関係を説明できる
- `.gitignore` の役割を説明できる

第1章では、ブラウザ操作の裏側で発生しているHTTPリクエストとレスポンスを学びます。

タスクを追加したとき、ブラウザはサーバへ何を送っているのか。
サーバはどのようにHTMLを返しているのか。

次章では、この画面操作の裏側を、Webアプリの基本として整理します。
