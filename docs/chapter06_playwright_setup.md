# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第6章 Playwrightの準備 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 60〜90分 |
| 難易度 | 基礎 |
| この章で作るもの | トップページ表示を確認する最初のE2Eテスト |
| この章で変更するファイル | `requirements-dev.txt`、`tests/e2e/test_home.py`、必要に応じて `pytest.ini` |

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

この章では、Python版Playwrightとpytestを導入し、ToDoアプリのトップページが表示されることをE2Eテストで確認します。

第5章では、テストしやすいFlask設計の考え方を学びました。この章では、ブラウザを自動操作するための道具を準備し、最初のテストを1つ書きます。

この章を終えると、次のことができるようになります。

- Playwrightの役割を説明できる
- pytestでテストを実行できる
- Python版Playwrightのpytest pluginを導入できる
- Playwright用ブラウザをインストールできる
- `tests/e2e/` にE2Eテストを置く理由を説明できる
- `page` fixtureの役割を説明できる
- トップページ表示のE2Eテストを書ける
- ローカルでE2Eテストを実行できる

# 2. この章の完成イメージ

この章の最後には、次の流れでE2Eテストを実行できる状態を目指します。

```text
ターミナル1
  -> Flaskアプリを起動する
  -> http://127.0.0.1:5000 で待ち受ける

ターミナル2
  -> pytestを実行する
  -> Playwrightがブラウザを起動する
  -> トップページへアクセスする
  -> ToDoリスト画面が表示されることを検証する
```

作成するテストのイメージ:

```python
from playwright.sync_api import Page, expect


def test_home_page_shows_todo_list(page: Page):
    page.goto("http://127.0.0.1:5000")

    expect(page.get_by_role("heading", name="ToDoリスト")).to_be_visible()
    expect(page.get_by_placeholder("タスクを入力")).to_be_visible()
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン6-5 手順4のあと。
ターミナルに `1 passed` が表示され、トップページ表示テストが成功している状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `requirements-dev.txt` | テストや開発時だけ使うPythonライブラリを書く |
| `tests/` | テストコードを置くディレクトリ |
| `tests/e2e/` | E2Eテストを置くディレクトリ |
| `tests/e2e/test_home.py` | トップページ表示を確認する最初のE2Eテスト |
| `pytest.ini` | 必要に応じてpytestの設定を書く |
| `app.py` | テスト対象となるFlaskアプリ |

> 注意:
> この章では、テスト用ファイルを作成します。
> `app.py`、`templates/`、`static/` などのアプリ本体は編集しません。

## 3-2. この章で使う主なコマンド

| コマンド | 目的 |
| --- | --- |
| `pip install -r requirements-dev.txt` | テスト用依存関係をインストールする |
| `playwright install` | Playwrightが使うブラウザをインストールする |
| `python app.py` | Flaskアプリをローカルで起動する |
| `pytest tests/e2e/test_home.py` | トップページ表示テストを実行する |
| `pytest tests/e2e/test_home.py --headed` | ブラウザ画面を表示しながらテストを実行する |

> 補足:
> Playwrightのテストは、通常はブラウザ画面を表示しないheadlessモードで実行されます。
> `--headed` を付けると、ブラウザの動きを見ながらテストできます。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第4章の理解 | E2Eテストに向いている操作を説明できる |
| 第5章の理解 | テスト用DBや設定切り替えの必要性を説明できる |
| 仮想環境 | 第0章で作成した仮想環境を有効化できる |
| ローカル起動 | `python app.py` でToDoアプリを起動できる |
| ブラウザ | `http://127.0.0.1:5000` を表示できる |
| Git | `git status` で作業状態を確認できる |

この章の作業前の状態:

```text
ファイル
  -> requirements-dev.txt はまだない
  -> tests/e2e/test_home.py はまだない
  -> アプリ本体のファイルは編集しない

実行環境
  -> Flaskアプリは手動で起動できる
  -> Playwrightはまだ導入していない
```

この章の作業後の状態:

```text
ファイル
  -> requirements-dev.txt がある
  -> tests/e2e/test_home.py がある

実行環境
  -> pytestを実行できる
  -> Playwrightがブラウザを操作できる
  -> トップページ表示テストがpassする
```

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| pytest | Pythonのテストを実行するためのテストフレームワーク |
| Playwright | ブラウザを自動操作するためのライブラリ |
| Python版Playwright | PythonからPlaywrightを使うためのパッケージ |
| pytest-playwright | pytestからPlaywrightを使いやすくするplugin |
| E2Eテスト | ユーザー操作に近い流れでアプリ全体を確認するテスト |
| locator | 画面上の要素を探すための指定方法 |
| assertion | 期待した状態になっているか確認する処理 |
| fixture | pytestがテストに渡してくれる準備済みの部品 |
| headless | ブラウザ画面を表示せずに実行するモード |
| headed | ブラウザ画面を表示して実行するモード |

## 5-2. pytest

pytestは、Pythonのテストを実行するためのテストフレームワークです。

pytestでは、`test_` で始まるファイルや関数がテストとして見つけられます。

例:

```text
tests/e2e/test_home.py
```

```python
def test_home_page_shows_todo_list():
    ...
```

pytestを実行すると、テストファイルを探し、テスト関数を実行し、成功または失敗をターミナルに表示します。

## 5-3. Playwright

Playwrightは、ブラウザを自動操作するためのライブラリです。

Playwrightを使うと、次のような操作をプログラムで実行できます。

- ページを開く
- 入力欄に文字を入れる
- ボタンをクリックする
- 表示されているテキストを確認する
- スクリーンショットやtraceを取得する

この教材では、Python版Playwrightをpytestと組み合わせて使います。

## 5-4. pytest-playwright

`pytest-playwright` は、pytestからPlaywrightを使いやすくするpluginです。

このpluginを使うと、テスト関数に `page` という引数を書くだけで、ブラウザページを操作できるようになります。

例:

```python
from playwright.sync_api import Page


def test_example(page: Page):
    page.goto("http://127.0.0.1:5000")
```

この `page` は、pytest-playwrightが用意してくれるfixtureです。

## 5-5. `page` fixture

fixtureは、pytestがテスト実行時に用意してくれる部品です。

`page` fixtureは、Playwrightが操作するブラウザページを表します。

`page` を使うと、次のような操作ができます。

| 操作 | 例 |
| --- | --- |
| ページを開く | `page.goto("http://127.0.0.1:5000")` |
| 見出しを探す | `page.get_by_role("heading", name="ToDoリスト")` |
| 入力欄を探す | `page.get_by_placeholder("タスクを入力")` |
| ボタンを探す | `page.get_by_role("button", name="追加")` |

## 5-6. locator

locatorは、画面上の要素を探すための指定方法です。

Playwrightでは、ユーザーが画面をどう見ているかに近い指定方法を使えます。

例:

```python
page.get_by_role("heading", name="ToDoリスト")
```

これは、「`ToDoリスト` という名前の見出し」を探す指定です。

例:

```python
page.get_by_placeholder("タスクを入力")
```

これは、「placeholderが `タスクを入力` の入力欄」を探す指定です。

## 5-7. assertion

assertionは、期待した状態になっているか確認する処理です。

Playwrightでは、`expect` を使って画面の状態を確認できます。

例:

```python
expect(page.get_by_role("heading", name="ToDoリスト")).to_be_visible()
```

これは、「`ToDoリスト` という見出しが表示されていること」を確認しています。

期待どおりであればテストは成功します。期待と違っていればテストは失敗します。

## 5-8. headlessとheaded

Playwrightのテストは、通常はheadlessモードで実行されます。

| モード | 意味 | 使う場面 |
| --- | --- | --- |
| headless | ブラウザ画面を表示しない | CIや普段の自動実行 |
| headed | ブラウザ画面を表示する | 動きを見ながら確認したいとき |

headedモードで実行するには、pytest実行時に `--headed` を付けます。

```bash
pytest tests/e2e/test_home.py --headed
```

# 6. ハンズオン

## ハンズオン6-1: テスト用依存関係を整理する

目的:
アプリ本体の依存関係と、テスト用の依存関係を分けて管理できるようにします。

実行場所:
ローカルPC

変更するファイル:
`requirements-dev.txt`

手順の種類:
実行する手順

作業前の状態:
`requirements.txt` にはアプリ実行に必要なライブラリが書かれていますが、テスト用の依存関係ファイルはまだありません。

手順:

1. プロジェクトディレクトリに `requirements-dev.txt` を作成します。
2. 次の内容を書きます。

```text
pytest
pytest-playwright
```

3. 仮想環境が有効であることを確認します。

```text
(venv)
```

4. テスト用依存関係をインストールします。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
pip install -r requirements-dev.txt
```

5. pytestが使えることを確認します。

```bash
pytest --version
```

期待される結果:
pytestとpytest-playwrightがインストールされ、`pytest --version` でバージョンが表示されます。

作業後の状態:
`requirements-dev.txt` にテスト用依存関係が整理されています。

確認ポイント:

画面上の確認:
ターミナルにpytestのバージョンが表示されます。

裏側の確認:
アプリ本体用の `requirements.txt` と、テスト用の `requirements-dev.txt` を分ける理由を説明できます。

> 補足:
> 教材配布時に完全に同じ環境を再現したい場合は、バージョン番号を固定する方針もあります。
> まずは、テスト用依存関係を分けて管理する考え方を理解します。

## ハンズオン6-2: Playwrightブラウザをインストールする

目的:
Playwrightがブラウザを自動操作できるように、必要なブラウザをインストールします。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
`pytest-playwright` をインストール済みですが、Playwright用ブラウザはまだインストールしていません。

手順:

1. 次のコマンドを実行します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
playwright install
```

2. インストールが完了するまで待ちます。
3. 必要に応じて、インストール済みブラウザを確認します。

```bash
playwright install --list
```

期待される結果:
Playwrightが使うブラウザがインストールされます。

作業後の状態:
pytestからPlaywrightを使ってブラウザを起動できる準備ができています。

確認ポイント:

画面上の確認:
ターミナルでブラウザのインストールが完了したことを確認できます。

裏側の確認:
Playwright本体とは別に、操作対象となるブラウザをインストールする必要があることを説明できます。

> 注意:
> `playwright install` はブラウザをダウンロードするため、ネットワーク接続が必要です。
> CI環境では、OS依存ライブラリの追加が必要になる場合があります。

## ハンズオン6-3: テストディレクトリを作る

目的:
E2Eテストを置くためのディレクトリを作成します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/`、必要に応じて `pytest.ini`

手順の種類:
実行する手順

作業前の状態:
プロジェクト内にE2Eテスト用ディレクトリがまだありません。

手順:

1. `tests/e2e/` ディレクトリを作成します。

Linux / macOS:

```bash
mkdir -p tests/e2e
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force tests\e2e
```

2. 必要に応じて、`pytest.ini` を作成します。

```ini
[pytest]
testpaths = tests
```

3. ディレクトリ構成を確認します。

Linux / macOS:

```bash
ls tests
```

Windows PowerShell:

```powershell
dir tests
```

期待される結果:
`tests/e2e/` ディレクトリが作成されます。

作業後の状態:
E2Eテストを置く場所が準備できています。

確認ポイント:

画面上の確認:
エディタやターミナルで `tests/e2e/` が見えます。

裏側の確認:
テストコードをアプリ本体のコードと分けて管理する理由を説明できます。

> 補足:
> `pytest.ini` はpytestの設定ファイルです。
> 小さなプロジェクトでは必須ではありませんが、テストが増えると設定をまとめる場所として便利です。

## ハンズオン6-4: トップページ表示テストを書く

目的:
PlaywrightでToDoアプリのトップページを開き、見出しと入力欄が表示されることを確認するテストを書きます。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_home.py`

手順の種類:
実行する手順

作業前の状態:
`tests/e2e/` ディレクトリが作成され、Playwright用ブラウザをインストール済みです。

手順:

1. `tests/e2e/test_home.py` を作成します。
2. 次の内容を書きます。

```python
from playwright.sync_api import Page, expect


BASE_URL = "http://127.0.0.1:5000"


def test_home_page_shows_todo_list(page: Page):
    page.goto(BASE_URL)

    expect(page.get_by_role("heading", name="ToDoリスト")).to_be_visible()
    expect(page.get_by_placeholder("タスクを入力")).to_be_visible()
    expect(page.get_by_role("button", name="追加")).to_be_visible()
```

3. コードの意味を確認します。

| コード | 意味 |
| --- | --- |
| `Page` | Playwrightのページ操作用の型 |
| `expect` | 期待する状態を確認するための関数 |
| `BASE_URL` | テスト対象アプリのURL |
| `page.goto(BASE_URL)` | ToDoアプリのトップページを開く |
| `get_by_role("heading", name="ToDoリスト")` | `ToDoリスト` という見出しを探す |
| `to_be_visible()` | 画面に表示されていることを確認する |

期待される結果:
トップページの見出し、タスク入力欄、追加ボタンを確認するE2Eテストが作成されます。

作業後の状態:
`tests/e2e/test_home.py` に、最初のPlaywrightテストが書かれています。

確認ポイント:

画面上の確認:
ブラウザでトップページを開くと、`ToDoリスト` 見出し、タスク入力欄、`追加` ボタンが表示されます。

裏側の確認:
Playwrightの `page` fixture、locator、assertionの役割を説明できます。

> 注意:
> このテストは、`http://127.0.0.1:5000` でFlaskアプリが起動している前提です。
> テスト実行前に、別ターミナルで `python app.py` を起動しておきます。

## ハンズオン6-5: pytestでE2Eテストを実行する

目的:
pytestでPlaywrightのE2Eテストを実行し、トップページ表示を自動確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
`tests/e2e/test_home.py` があり、Flaskアプリを起動できる状態です。

手順:

1. ターミナルを2つ用意します。
2. ターミナル1でFlaskアプリを起動します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
python app.py
```

3. ブラウザで次のURLを開き、ToDoアプリが表示されることを確認します。

```text
http://127.0.0.1:5000
```

4. ターミナル2でE2Eテストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_home.py
```

5. テスト結果を確認します。
6. ブラウザの動きを見たい場合は、headedモードで実行します。

```bash
pytest tests/e2e/test_home.py --headed
```

期待される結果:
ターミナルに `1 passed` のような結果が表示されます。

作業後の状態:
pytestとPlaywrightで、ToDoアプリのトップページ表示を自動確認できています。

確認ポイント:

画面上の確認:
headedモードでは、ブラウザが自動で開き、ToDoアプリへアクセスする様子を確認できます。

裏側の確認:
pytestが `tests/e2e/test_home.py` を実行し、Playwrightがブラウザを操作し、`expect` で画面状態を検証していることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン6-5 手順5のあと。
ターミナルに `1 passed` が表示されている状態。

> 注意:
> `pytest` 実行時に接続エラーになる場合は、Flaskアプリが起動しているか、URLが `http://127.0.0.1:5000` になっているかを確認します。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| テスト用依存関係 | `requirements-dev.txt` に `pytest` と `pytest-playwright` がある |
| pytest | `pytest --version` でバージョンが表示される |
| Playwrightブラウザ | `playwright install` が完了している |
| テストディレクトリ | `tests/e2e/` がある |
| トップページテスト | `tests/e2e/test_home.py` がある |
| Flask起動 | `http://127.0.0.1:5000` でToDoアプリが表示される |
| pytest実行 | `pytest tests/e2e/test_home.py` がpassする |

確認:
pytestでトップページ表示テストが `1 passed` になれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. pytestは何のために使いますか？
2. Playwrightは何のために使いますか？
3. `pytest-playwright` を入れると、何が使いやすくなりますか？
4. `playwright install` は何をするコマンドですか？
5. `page` fixtureは何を表していますか？
6. locatorは何のために使いますか？
7. `expect(...).to_be_visible()` は何を確認していますか？
8. headlessモードとheadedモードの違いは何ですか？

# 9. 理解チェックの回答例

1. pytestは、Pythonのテストファイルやテスト関数を見つけて実行し、成功や失敗を表示するために使います。
2. Playwrightは、ブラウザを自動操作して、ユーザーに近い流れでWebアプリを確認するために使います。
3. pytestからPlaywrightを使うためのfixtureやCLIオプションが使いやすくなります。特に `page` fixtureを使ってブラウザページを操作できます。
4. Playwrightが操作するために必要なブラウザをインストールするコマンドです。
5. `page` fixtureは、Playwrightが操作するブラウザページを表します。ページを開いたり、要素を探したり、クリックしたりできます。
6. locatorは、画面上の要素を探すために使います。見出し、入力欄、ボタンなどを指定できます。
7. 指定した要素が画面に表示されていることを確認しています。
8. headlessモードはブラウザ画面を表示せずに実行するモードです。headedモードはブラウザ画面を表示しながら実行するモードです。

# 10. 次章への接続

この章では、Python版Playwrightとpytestを導入し、トップページ表示のE2Eテストを作成しました。

この章でできるようになったこと:

- pytestでテストを実行できる
- Python版Playwrightのpytest pluginを導入できる
- Playwright用ブラウザをインストールできる
- `tests/e2e/` にE2Eテストを配置できる
- `page` fixture、locator、assertionの基本を説明できる
- トップページ表示をE2Eテストで確認できる

第7章では、ToDoアプリの主要なユーザー操作をE2Eテストとして実装します。

タスクを追加する。
カテゴリを追加する。
コメントを追加する。
完了状態を切り替える。

次章では、これらの操作をPlaywrightで自動化し、ToDoアプリの主要な流れをテストで守れるようにします。
