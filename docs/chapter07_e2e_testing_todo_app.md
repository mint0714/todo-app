# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第7章 ToDoアプリのE2Eテスト |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 90〜120分 |
| 難易度 | 実践 |
| この章で作るもの | ToDoアプリの主要操作を確認するE2Eテスト |
| この章で変更するファイル | `tests/e2e/test_todo_flow.py` |

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

この章では、ToDoアプリの主要なユーザー操作をPython版Playwrightで自動化します。

第6章では、トップページが表示されることを確認する最初のE2Eテストを書きました。この章では、フォーム入力、ボタンクリック、ページ遷移、表示確認を組み合わせて、ToDoアプリの基本的な流れをテストにします。

この章を終えると、次のことができるようになります。

- フォーム入力をPlaywrightで自動化できる
- ボタンクリックをPlaywrightで自動化できる
- ページ遷移後の表示を検証できる
- 対象のタスク行をlocatorで絞り込める
- テストごとに必要なデータ状態を準備できる
- 主要なToDo操作をE2Eテスト化できる
- E2Eテストで確認する範囲と、確認しすぎない範囲を説明できる

# 2. この章の完成イメージ

この章の最後には、次のようなE2Eテストファイルを作成します。

```text
tests/e2e/test_todo_flow.py
```

このファイルには、ToDoアプリの主要操作を確認するテストを追加します。

```text
カテゴリを追加する
タスクを追加する
カテゴリ付きタスクを追加する
タスク詳細ページへ移動する
コメントを追加する
完了状態を切り替える
タスクを削除する
```

テスト実行の流れは次のようになります。

```text
ターミナル1
  -> python app.py
  -> Flaskアプリを起動する

ターミナル2
  -> pytest tests/e2e/test_todo_flow.py
  -> Playwrightがブラウザを操作する
  -> 主要操作が成功するか確認する
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン7-7 手順5のあと。
ターミナルに複数のE2Eテストがpassした結果が表示されている状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `tests/e2e/test_todo_flow.py` | ToDoアプリの主要操作を確認するE2Eテスト |
| `tests/e2e/test_home.py` | 第6章で作成したトップページ表示テスト |
| `templates/index.html` | タスク追加、完了、削除、詳細リンクの画面構造を確認する |
| `templates/categories.html` | カテゴリ追加、カテゴリ削除の画面構造を確認する |
| `templates/detail.html` | コメント追加、コメント削除の画面構造を確認する |
| `app.py` | テスト対象となるFlaskアプリ |

> 注意:
> この章の教材本文では、`tests/e2e/test_todo_flow.py` を作成する手順を扱います。
> `app.py`、`templates/`、`static/` などのアプリ本体は編集しません。

## 3-2. この章で使う主なコマンド

| コマンド | 目的 |
| --- | --- |
| `python app.py` | Flaskアプリをローカルで起動する |
| `pytest tests/e2e/test_todo_flow.py` | ToDo操作のE2Eテストを実行する |
| `pytest tests/e2e/test_todo_flow.py --headed` | ブラウザ画面を表示しながらE2Eテストを実行する |
| `pytest tests/e2e/test_todo_flow.py -k add_task` | 名前に `add_task` を含むテストだけ実行する |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py
```

> 補足:
> テストが失敗したときは、まず `--headed` を付けてブラウザの動きを見ると原因をつかみやすくなります。
> 詳しい失敗調査は第8章で扱います。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第6章の完了 | Playwrightとpytestを導入済み |
| Playwrightブラウザ | `playwright install` が完了している |
| テストディレクトリ | `tests/e2e/` がある |
| ローカル起動 | `python app.py` でToDoアプリを起動できる |
| トップページテスト | `tests/e2e/test_home.py` がpassする |

この章の作業前の状態:

```text
ファイル
  -> tests/e2e/test_home.py はある
  -> tests/e2e/test_todo_flow.py はまだない
  -> アプリ本体のファイルは編集しない

実行環境
  -> Flaskアプリを起動できる
  -> pytestとPlaywrightを実行できる
```

この章の作業後の状態:

```text
ファイル
  -> tests/e2e/test_todo_flow.py がある

テスト
  -> カテゴリ追加、タスク追加、詳細表示、コメント追加、完了切り替え、削除を確認できる

理解
  -> Playwrightでフォーム入力、クリック、表示検証を組み合わせられる
```

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| locator | 画面上の要素を探すための指定 |
| user-facing locator | ボタン名や見出しなど、ユーザーから見える情報を使うlocator |
| CSS locator | `.task-item` のようなCSSセレクタで要素を探すlocator |
| `fill()` | 入力欄に文字を入れる操作 |
| `click()` | ボタンやリンクをクリックする操作 |
| `select_option()` | セレクトボックスの選択肢を選ぶ操作 |
| `filter(has_text=...)` | 指定した文字を含む要素に絞り込む操作 |
| test data | テストで使うカテゴリ名、タスク名、コメント本文などのデータ |
| cleanup | テストで作ったデータを削除する後片付け |

## 5-2. この章で使うlocatorの方針

Playwrightでは、画面上の要素を探すためにlocatorを使います。

公式ドキュメントでは、ユーザーが見たり操作したりする情報に近いlocatorが推奨されています。

この章では、まず次のようなlocatorを使います。

| 目的 | locator例 |
| --- | --- |
| 見出しを探す | `page.get_by_role("heading", name="ToDoリスト")` |
| 入力欄を探す | `page.get_by_placeholder("タスクを入力")` |
| ボタンを探す | `page.get_by_role("button", name="追加")` |
| リンクを探す | `page.get_by_role("link", name="詳細")` |
| 表示テキストを探す | `page.get_by_text(task_title)` |

ただし、現在のToDoアプリでは、タスクごとに同じ名前のボタンが複数表示されます。

たとえば、複数のタスクがあると、`完了` ボタンや `削除` ボタンが複数あります。

その場合は、まず対象のタスク行に絞り込み、その中のボタンをクリックします。

```python
task_row = page.locator(".task-item").filter(has_text=task_title)
task_row.get_by_role("button", name="完了").click()
```

> 補足:
> 将来的にテストをさらに安定させたい場合は、HTMLに `data-testid` のようなテスト用属性を追加する方法もあります。
> この章ではアプリ本体を編集せず、現在のHTMLで読めるlocatorを使います。

## 5-3. テストデータ名を一意にする

現在のアプリは、テストごとにDBを自動でリセットする構成にはまだなっていません。

そのため、この章ではテストデータ名にランダムな文字列を付け、前回のテストデータと衝突しにくくします。

これは、第5章で学んだ「テスト用DBを毎回同じ状態にする」方法の代わりになるものではありません。
この教材では、まずアプリ本体を変更せずにE2Eテストを書く経験を優先するため、一意なテストデータ名で衝突を避けます。
テストが増えてきたら、テスト用DBの初期化や後片付けを導入する方が安定します。

例:

```python
from uuid import uuid4


def unique_name(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"
```

この関数を使うと、次のような名前を作れます。

```text
E2Eタスク-a1b2c3d4
E2Eカテゴリ-9f8e7d6c
```

> 注意:
> 一意な名前にしても、DBの後片付けが不要になるわけではありません。
> 本格的な自動テストでは、テスト用DBを毎回初期化するか、テスト後にデータを削除する方針を取ります。

## 5-4. E2Eテストで確認する範囲

E2Eテストは、ユーザー操作に近い流れを確認できます。

この章では、次のような確認を行います。

| 操作 | 確認すること |
| --- | --- |
| カテゴリ追加 | 入力したカテゴリ名がカテゴリ管理画面に表示される |
| タスク追加 | 入力したタスク名がタスク一覧に表示される |
| カテゴリ付きタスク追加 | タスク行にカテゴリ名が表示される |
| 詳細ページ遷移 | 詳細リンクからタスク詳細画面へ移動できる |
| コメント追加 | 入力したコメントが詳細画面に表示される |
| 完了切り替え | 完了ボタンを押すと未完了ボタンに切り替わる |
| 削除 | 削除ボタンを押すとタスクが一覧から消える |

E2Eテストでは、アプリ内部のすべての条件分岐を確認しようとしません。

ユーザーにとって重要な流れを、少数のテストで守ることを優先します。

## 5-5. テストファイルの基本形

この章では、`tests/e2e/test_todo_flow.py` に次のような共通部品を書きます。

```python
from uuid import uuid4

from playwright.sync_api import Page, expect


BASE_URL = "http://127.0.0.1:5000"


def unique_name(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"
```

`BASE_URL` はテスト対象アプリのURLです。

`unique_name()` は、テストデータ名を一意にするための補助関数です。

# 6. ハンズオン

## ハンズオン7-1: カテゴリ追加テストを書く

目的:
カテゴリ管理画面でカテゴリを追加し、追加したカテゴリ名が表示されることをE2Eテストで確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
`tests/e2e/` ディレクトリがあり、Flaskアプリをローカルで起動できる状態です。

手順:

1. `tests/e2e/test_todo_flow.py` を作成します。
2. 共通部品を書きます。

```python
from uuid import uuid4

from playwright.sync_api import Page, expect


BASE_URL = "http://127.0.0.1:5000"


def unique_name(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"
```

3. カテゴリ追加テストを追加します。

```python
def test_add_category(page: Page):
    category_name = unique_name("E2Eカテゴリ")

    page.goto(f"{BASE_URL}/categories")
    page.get_by_placeholder("カテゴリ名を入力").fill(category_name)
    page.get_by_role("button", name="追加").click()

    expect(page.get_by_text(category_name)).to_be_visible()
```

4. Flaskアプリを起動します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
python app.py
```

5. 別ターミナルでテストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k add_category
```

期待される結果:
カテゴリ追加テストがpassします。

作業後の状態:
`tests/e2e/test_todo_flow.py` にカテゴリ追加テストが追加されています。

確認ポイント:

画面上の確認:
カテゴリ管理画面に、テストで追加したカテゴリ名が表示されます。

裏側の確認:
`fill()` で入力し、`click()` で送信し、`expect(...).to_be_visible()` で表示を検証していることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン7-1 手順5のあと。
カテゴリ追加テストがpassし、ターミナルにテスト成功結果が表示されている状態。

## ハンズオン7-2: タスク追加テストを書く

目的:
トップページでタスクを追加し、追加したタスク名が一覧に表示されることをE2Eテストで確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
カテゴリ追加テストが書かれており、Playwrightでフォーム入力とクリックを実行できます。

手順:

1. `tests/e2e/test_todo_flow.py` にタスク追加テストを追加します。

```python
def test_add_task(page: Page):
    task_title = unique_name("E2Eタスク")

    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()

    expect(page.get_by_text(task_title)).to_be_visible()
```

2. テストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k add_task
```

期待される結果:
タスク追加テストがpassします。

作業後の状態:
タスク追加のE2Eテストが追加されています。

確認ポイント:

画面上の確認:
ToDoリスト画面に、テストで追加したタスク名が表示されます。

裏側の確認:
`POST /add` に相当する操作を、ブラウザ操作として自動化できていることを説明できます。

## ハンズオン7-3: カテゴリ付きタスク追加テストを書く

目的:
カテゴリを追加したあと、そのカテゴリを選択してタスクを追加し、タスク行にカテゴリ名が表示されることを確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
カテゴリ追加とタスク追加を、それぞれ単独でテストできています。

手順:

1. `tests/e2e/test_todo_flow.py` にカテゴリ付きタスク追加テストを追加します。

```python
def test_add_task_with_category(page: Page):
    category_name = unique_name("E2Eカテゴリ")
    task_title = unique_name("E2Eカテゴリ付きタスク")

    page.goto(f"{BASE_URL}/categories")
    page.get_by_placeholder("カテゴリ名を入力").fill(category_name)
    page.get_by_role("button", name="追加").click()
    expect(page.get_by_text(category_name)).to_be_visible()

    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.locator("select[name='category_id']").select_option(label=category_name)
    page.get_by_role("button", name="追加").click()

    task_row = page.locator(".task-item").filter(has_text=task_title)
    expect(task_row).to_contain_text(category_name)
```

2. テストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k task_with_category
```

期待される結果:
カテゴリ付きタスク追加テストがpassします。

作業後の状態:
カテゴリ追加、カテゴリ選択、タスク追加、カテゴリ表示までの流れをE2Eテストで確認できています。

確認ポイント:

画面上の確認:
追加したタスク行に、追加したカテゴリ名が表示されます。

裏側の確認:
`select_option(label=category_name)` でセレクトボックスの選択肢を選び、対象タスク行を `filter(has_text=task_title)` で絞り込んでいることを説明できます。

> 補足:
> 現在のHTMLでは、カテゴリ選択の `select` にラベルがありません。
> そのため、この章では `select[name='category_id']` というCSS locatorを使っています。

## ハンズオン7-4: タスク詳細ページ遷移テストを書く

目的:
タスク一覧の `詳細` リンクをクリックし、タスク詳細画面へ移動できることを確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
タスク追加テストが書かれており、対象タスク行をlocatorで絞り込む考え方を確認しています。

手順:

1. `tests/e2e/test_todo_flow.py` にタスク詳細ページ遷移テストを追加します。

```python
def test_open_task_detail_page(page: Page):
    task_title = unique_name("E2E詳細タスク")

    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()

    task_row = page.locator(".task-item").filter(has_text=task_title)
    task_row.get_by_role("link", name="詳細").click()

    expect(page.get_by_role("heading", name=task_title)).to_be_visible()
    expect(page.get_by_text("状態：未完了")).to_be_visible()
```

2. テストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k detail_page
```

期待される結果:
タスク詳細ページ遷移テストがpassします。

作業後の状態:
一覧画面から詳細画面へ移動する流れをE2Eテストで確認できています。

確認ポイント:

画面上の確認:
詳細画面にタスク名の見出しと、状態表示が表示されます。

裏側の確認:
対象タスク行の中にある `詳細` リンクをクリックしていることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン7-4 手順2のあと。
詳細ページ遷移テストがpassし、詳細画面の見出し検証が成功している状態。

## ハンズオン7-5: コメント追加テストを書く

目的:
タスク詳細画面でコメントを追加し、追加したコメントが表示されることを確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
タスク詳細ページへ移動するテストが書かれています。

手順:

1. `tests/e2e/test_todo_flow.py` にコメント追加テストを追加します。

```python
def test_add_comment_to_task(page: Page):
    task_title = unique_name("E2Eコメント対象タスク")
    comment_body = unique_name("E2Eコメント")

    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()

    task_row = page.locator(".task-item").filter(has_text=task_title)
    task_row.get_by_role("link", name="詳細").click()

    page.get_by_placeholder("コメントを入力").fill(comment_body)
    page.get_by_role("button", name="追加").click()

    expect(page.get_by_text(comment_body)).to_be_visible()
```

2. テストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k add_comment
```

期待される結果:
コメント追加テストがpassします。

作業後の状態:
タスク作成、詳細遷移、コメント入力、コメント表示までの流れをE2Eテストで確認できています。

確認ポイント:

画面上の確認:
詳細画面に、追加したコメント本文が表示されます。

裏側の確認:
`POST /task/<task_id>/comment` に相当する操作を、ブラウザ操作として自動化できていることを説明できます。

## ハンズオン7-6: 完了切り替えテストを書く

目的:
タスク一覧で `完了` ボタンを押すと、対象タスクのボタン表示が `未完了` に切り替わることを確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
タスク追加テストが書かれており、対象タスク行を絞り込める状態です。

手順:

1. `tests/e2e/test_todo_flow.py` に完了切り替えテストを追加します。

```python
def test_toggle_task_complete(page: Page):
    task_title = unique_name("E2E完了切り替えタスク")

    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()

    task_row = page.locator(".task-item").filter(has_text=task_title)
    task_row.get_by_role("button", name="完了").click()

    task_row = page.locator(".task-item").filter(has_text=task_title)
    expect(task_row.get_by_role("button", name="未完了")).to_be_visible()
```

2. テストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k toggle_task_complete
```

期待される結果:
完了切り替えテストがpassします。

作業後の状態:
対象タスクだけを絞り込み、その中の `完了` ボタンをクリックする流れをE2Eテストで確認できています。

確認ポイント:

画面上の確認:
対象タスクのボタン表示が `完了` から `未完了` に切り替わります。

裏側の確認:
複数のタスクがある場合でも、対象タスク行に絞って操作していることを説明できます。

## ハンズオン7-7: 削除テストを書く

目的:
タスク一覧で対象タスクを削除し、削除したタスクが一覧に表示されなくなることを確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
対象タスク行を絞り込み、その中のボタンをクリックする書き方を確認しています。

手順:

1. `tests/e2e/test_todo_flow.py` に削除テストを追加します。

```python
def test_delete_task(page: Page):
    task_title = unique_name("E2E削除タスク")

    page.goto(BASE_URL)
    page.get_by_placeholder("タスクを入力").fill(task_title)
    page.get_by_role("button", name="追加").click()
    expect(page.get_by_text(task_title)).to_be_visible()

    task_row = page.locator(".task-item").filter(has_text=task_title)
    task_row.get_by_role("button", name="削除").click()

    expect(page.get_by_text(task_title)).not_to_be_visible()
```

2. ここまでのテストをまとめて実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py
```

3. ブラウザの動きを見たい場合は、headedモードで実行します。

```bash
pytest tests/e2e/test_todo_flow.py --headed
```

4. テスト結果を確認します。
5. すべてのテストがpassしていることを確認します。

期待される結果:
`tests/e2e/test_todo_flow.py` に書いたE2Eテストがすべてpassします。

作業後の状態:
ToDoアプリの主要操作をE2Eテストで確認できています。

確認ポイント:

画面上の確認:
削除したタスクが一覧から消えることを確認できます。

裏側の確認:
タスク追加、カテゴリ追加、詳細遷移、コメント追加、完了切り替え、削除の一連のE2Eテストを実行できることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン7-7 手順5のあと。
ターミナルに複数のE2Eテストがpassした結果が表示されている状態。

> 注意:
> この章のテストは、現在のローカルDBにデータを作成します。
> 本格的には、テストごとにテスト用DBを初期化する構成にすることで、より安定したテストになります。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| カテゴリ追加 | 追加したカテゴリ名がカテゴリ管理画面に表示される |
| タスク追加 | 追加したタスク名がタスク一覧に表示される |
| カテゴリ付きタスク | タスク行にカテゴリ名が表示される |
| 詳細ページ遷移 | 詳細画面にタスク名の見出しが表示される |
| コメント追加 | 詳細画面にコメント本文が表示される |
| 完了切り替え | 対象タスクのボタンが `未完了` に切り替わる |
| 削除 | 削除したタスクが一覧に表示されなくなる |
| pytest実行 | `pytest tests/e2e/test_todo_flow.py` がpassする |

確認:
ToDoアプリの主要操作をPlaywrightで自動化し、まとめてテストがpassすれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. `fill()` は何のために使いますか？
2. `click()` は何のために使いますか？
3. `select_option()` はどのような場面で使いますか？
4. 複数の `完了` ボタンがある画面で、対象タスクのボタンだけをクリックするにはどうしますか？
5. `filter(has_text=task_title)` は何をしていますか？
6. テストデータ名にランダムな文字列を付ける理由は何ですか？
7. E2Eテストですべての内部処理を確認しようとしない理由は何ですか？
8. この章のテストをさらに安定させるには、どのような改善が考えられますか？

# 9. 理解チェックの回答例

1. `fill()` は入力欄に文字を入れるために使います。タスク名やカテゴリ名、コメント本文の入力で使います。
2. `click()` はボタンやリンクをクリックするために使います。追加、完了、削除、詳細リンクなどの操作で使います。
3. `select_option()` はセレクトボックスの選択肢を選ぶときに使います。この章では、カテゴリ付きタスクを追加するときに使います。
4. まず対象タスクの行をlocatorで絞り込み、その行の中にある `完了` ボタンをクリックします。
5. `.task-item` の中から、指定したタスク名を含む要素だけに絞り込んでいます。
6. 前回のテストで作ったデータと名前が重複しにくくするためです。DBを毎回初期化していない段階では、テストデータの衝突を避ける助けになります。
7. E2Eテストは実行時間や保守コストが大きくなりやすいためです。ユーザーにとって重要な流れを中心に確認し、内部の細かい条件分岐は単体テストや結合テストで確認する方が向いています。
8. テスト用DBを毎回初期化する、テスト後にデータを削除する、HTMLに `data-testid` を追加してlocatorを安定させる、などが考えられます。

# 10. 次章への接続

この章では、ToDoアプリの主要なユーザー操作をPlaywrightでE2Eテスト化しました。

この章でできるようになったこと:

- フォーム入力をPlaywrightで自動化できる
- ボタンクリックをPlaywrightで自動化できる
- ページ遷移後の表示を検証できる
- 対象タスク行をlocatorで絞り込める
- テストごとに必要なデータ名を一意にできる
- ToDoアプリの主要操作をE2Eテスト化できる

第8章では、テストが失敗したときに、ログ、スクリーンショット、traceを使って原因を調べる方法を学びます。

自動テストは、書いて終わりではありません。
失敗したときに、どの操作で、何が期待と違ったのかを読めることが重要です。

次章では、あえて失敗するテストを用意し、pytestの出力やPlaywright traceを使って原因を調べます。
