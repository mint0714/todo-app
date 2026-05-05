# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第8章 失敗したテストの調査 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 60〜90分 |
| 難易度 | 実践 |
| この章で作るもの | 失敗したE2Eテストを調査し、原因を直して再実行する手順 |
| この章で変更するファイル | 既存のE2Eテストを一時的に変更。必要に応じて `pytest.ini` |

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

この章では、E2Eテストが失敗したときに、どこで何が起きたのかを調べる方法を学びます。

第7章では、ToDoアプリの主要操作をPlaywrightでE2Eテスト化しました。自動テストは、成功している間は心強い道具ですが、失敗したときに出力を読めないと原因を直せません。

この章では、あえて失敗するテストを用意し、pytestの出力、Playwright trace、screenshot、video、`test-results/` を使って原因を調べます。

この章を終えると、次のことができるようになります。

- pytestの失敗出力を読める
- どのテスト関数が失敗したか確認できる
- どのassertionやlocatorで失敗したか確認できる
- Playwright traceの役割を説明できる
- screenshotやvideoの役割を説明できる
- `test-results/` に保存される調査用ファイルを説明できる
- 失敗原因を仮説立てして修正できる
- CIで調査しやすい出力設定を説明できる

# 2. この章の完成イメージ

この章の最後には、次の流れで失敗したテストを調査できる状態を目指します。

```text
あえて失敗するテストを用意する
  -> pytestを実行する
  -> 失敗したテスト名を確認する
  -> 失敗した行と期待値を読む
  -> trace / screenshot / video を確認する
  -> 原因を仮説立てする
  -> テストまたはアプリの問題を直す
  -> 再実行してpassを確認する
```

Playwright traceでは、次のような情報を確認できます。

```text
どの操作を実行したか
どのlocatorを使ったか
失敗した時点の画面がどうなっていたか
どのネットワークリクエストが発生したか
どの行のコードで失敗したか
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン8-3 手順5のあと。
Playwright Trace Viewerで、失敗した操作、画面の状態、エラー箇所が表示されている状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `tests/e2e/test_todo_flow.py` | 第7章で作成したE2Eテスト。一時的に失敗させる |
| `pytest.ini` | 必要に応じてpytest / Playwrightの実行オプションを書く |
| `test-results/` | Playwrightのtrace、screenshot、videoなどの出力先 |
| `app.py` | テスト対象のFlaskアプリ。読むだけで編集しない |
| `templates/` | locatorや表示テキストを確認するために読む |

> 注意:
> この章では、失敗調査の練習としてE2Eテストを一時的に変更します。
> 調査後は、必ず元の成功するテストに戻します。

## 3-2. この章で使う主なコマンド

| コマンド | 目的 |
| --- | --- |
| `pytest tests/e2e/test_todo_flow.py -k add_task` | 対象のテストだけ実行する |
| `pytest tests/e2e/test_todo_flow.py -k add_task -vv` | 詳細なpytest出力で実行する |
| `pytest tests/e2e/test_todo_flow.py --headed` | ブラウザ画面を表示しながら実行する |
| `pytest tests/e2e/test_todo_flow.py --tracing retain-on-failure` | 失敗時にtraceを残す |
| `pytest tests/e2e/test_todo_flow.py --screenshot only-on-failure` | 失敗時にscreenshotを残す |
| `pytest tests/e2e/test_todo_flow.py --video retain-on-failure` | 失敗時にvideoを残す |
| `playwright show-trace trace.zip` | traceをTrace Viewerで開く |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py --tracing retain-on-failure
```

> 補足:
> trace、screenshot、videoの保存先は、通常 `test-results/` 配下です。
> 実際のパスはテスト名や実行環境によって変わることがあります。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第7章の完了 | `tests/e2e/test_todo_flow.py` がある |
| Playwright | `pytest-playwright` とブラウザのインストールが完了している |
| ローカル起動 | `python app.py` でToDoアプリを起動できる |
| E2Eテスト | 第7章のE2Eテストが通常はpassする |
| Git | `git status` で一時変更を確認できる |

この章の作業前の状態:

```text
ファイル
  -> tests/e2e/test_todo_flow.py がある
  -> テストは通常passする状態

実行環境
  -> Flaskアプリを起動できる
  -> pytestとPlaywrightを実行できる
```

この章の作業後の状態:

```text
理解
  -> pytestの失敗出力を読める
  -> trace、screenshot、videoの使いどころを説明できる
  -> 失敗原因を仮説立てして修正できる

ファイル
  -> 一時的に失敗させたテストを元に戻している
  -> 必要に応じて pytest.ini の方針を整理できている
```

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| failure | テストの期待結果と実際の結果が違う失敗 |
| error | テスト準備や実行中に例外が起きた状態 |
| traceback | どのファイル、どの行で失敗したかを示す出力 |
| assertion | 期待する状態を確認する処理 |
| locator | 画面上の要素を探す指定 |
| trace | テスト中の操作、画面、ログ、通信などを記録したファイル |
| screenshot | 失敗時などの画面画像 |
| video | テスト中のブラウザ操作を録画したファイル |
| `test-results/` | Playwrightの調査用ファイルが保存されるディレクトリ |
| 最小再現 | 失敗を再現するために必要な最小の手順やテスト |

## 5-2. pytestの失敗出力

pytestでテストが失敗すると、ターミナルに失敗したテスト名、失敗した行、エラーメッセージが表示されます。

まず見るべき場所は、次の3つです。

| 見る場所 | 確認すること |
| --- | --- |
| 失敗したテスト名 | どのテストが失敗したか |
| 失敗した行 | どのassertionや操作で止まったか |
| エラーメッセージ | 何を期待し、実際に何が起きたか |

E2Eテストでは、失敗原因が大きく分けて次のどれかになります。

| 原因の種類 | 例 |
| --- | --- |
| アプリが起動していない | `http://127.0.0.1:5000` に接続できない |
| locatorが合っていない | ボタン名やplaceholderが実画面と違う |
| 期待値が違う | `ToDoリスト` を期待したが、実際は別の文字 |
| データ状態が違う | 前回のテストデータが残っている |
| アプリの挙動が壊れている | 本当に画面や保存処理が壊れている |

## 5-3. Playwright trace

Playwright traceは、テスト中に何が起きたかを後から確認するための記録です。

traceを残すには、pytest実行時に `--tracing` を指定します。

```bash
pytest tests/e2e/test_todo_flow.py --tracing retain-on-failure
```

`retain-on-failure` は、失敗したテストのtraceだけを残す設定です。

traceは、Trace Viewerで開けます。

```bash
playwright show-trace path/to/trace.zip
```

Trace Viewerでは、次の情報を確認できます。

- どの操作を実行したか
- どのlocatorを使ったか
- 操作前後の画面がどうなっていたか
- どのネットワークリクエストが発生したか
- どの行のコードで失敗したか
- ブラウザのconsoleやnetworkの情報

## 5-4. screenshotとvideo

screenshotは、失敗した時点の画面画像です。

videoは、テスト中のブラウザ操作を録画したものです。

pytest-playwrightでは、次のようなオプションを使えます。

```bash
pytest tests/e2e/test_todo_flow.py --screenshot only-on-failure
```

```bash
pytest tests/e2e/test_todo_flow.py --video retain-on-failure
```

| 出力 | 向いている確認 |
| --- | --- |
| screenshot | 失敗時の画面状態を一目で確認する |
| video | どの操作のあとに画面が変わったかを確認する |
| trace | 操作、画面、ログ、network、ソース行をまとめて確認する |

## 5-5. 最小再現

失敗したテストを調べるときは、まず失敗を小さく再現できる形にします。

たとえば、全部のE2Eテストを毎回実行するのではなく、失敗しているテストだけを実行します。

```bash
pytest tests/e2e/test_todo_flow.py -k add_task
```

さらに詳しい出力を見たいときは、`-vv` を付けます。

```bash
pytest tests/e2e/test_todo_flow.py -k add_task -vv
```

最小再現にすると、調査の時間が短くなり、どの操作が原因なのかを見つけやすくなります。

## 5-6. CIで調査しやすい出力

ローカルPCでは、headedモードでブラウザを見ながら調査できます。

しかし、GitHub ActionsのようなCIでは、通常ブラウザ画面を直接見られません。

そのため、CIでは失敗時に調査用ファイルを残すことが重要です。

例:

```text
test-results/
  -> trace.zip
  -> screenshot
  -> video
```

第9章では、これらのファイルをGitHub Actionsのartifactとして保存する考え方を扱います。

# 6. ハンズオン

## ハンズオン8-1: あえて失敗するテストを用意する

目的:
失敗調査の練習のために、E2Eテストを一時的に失敗させます。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py` を一時的に変更

手順の種類:
実行する手順

作業前の状態:
第7章で作成したE2Eテストが通常はpassする状態です。

手順:

1. `tests/e2e/test_todo_flow.py` を開きます。
2. `test_add_task` を探します。
3. 期待する表示テキストを、あえて間違った値に変更します。

変更前:

```python
expect(page.get_by_text(task_title)).to_be_visible()
```

変更後:

```python
expect(page.get_by_text("存在しないタスク名")).to_be_visible()
```

4. Flaskアプリを起動します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
python app.py
```

5. 別ターミナルで、対象テストだけ実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k add_task
```

期待される結果:
`test_add_task` が失敗します。

作業後の状態:
失敗出力を読むための練習用状態になっています。

確認ポイント:

画面上の確認:
テスト結果が失敗として表示されます。

裏側の確認:
失敗原因が「アプリの不具合」ではなく、「テストの期待値をあえて間違えたこと」だと説明できます。

> 注意:
> この変更は練習用の一時変更です。
> ハンズオン8-4で必ず元に戻します。

## ハンズオン8-2: pytestの失敗出力を読む

目的:
pytestの失敗出力から、失敗したテスト名、失敗した行、原因の手がかりを読み取ります。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
ハンズオン8-1で、`test_add_task` が失敗する状態になっています。

手順:

1. 詳細表示つきで対象テストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k add_task -vv
```

2. 出力の中から、失敗したテスト名を探します。

```text
FAILED tests/e2e/test_todo_flow.py::test_add_task
```

3. 失敗した行を探します。

```text
expect(page.get_by_text("存在しないタスク名")).to_be_visible()
```

4. エラーメッセージを読みます。
5. 期待しているテキストと、実際の画面状態が合っていないことを確認します。

期待される結果:
pytestの出力から、どのテストのどの行で失敗したかを読み取れます。

作業後の状態:
失敗出力を見て、失敗箇所を特定できています。

確認ポイント:

画面上の確認:
ターミナルで失敗したテスト名と失敗行を確認できます。

裏側の確認:
今回の失敗は、画面に存在しない文字を期待したために起きたと説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン8-2 手順3のあと。
pytestの失敗出力に、失敗したテスト名と失敗行が表示されている状態。

## ハンズオン8-3: Playwright traceを確認する

目的:
Playwright traceを記録し、Trace Viewerで失敗時の画面や操作を確認します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
`test_add_task` が失敗する状態になっています。

手順:

1. traceを残す設定でテストを実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k add_task --tracing retain-on-failure
```

2. `test-results/` 配下に `trace.zip` が作成されていることを確認します。

Linux / macOS:

```bash
find test-results -name trace.zip
```

Windows PowerShell:

```powershell
Get-ChildItem -Recurse test-results -Filter trace.zip
```

3. 表示された `trace.zip` のパスを確認します。
4. Trace Viewerでtraceを開きます。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
playwright show-trace path/to/trace.zip
```

5. Trace Viewerで、失敗した操作と画面状態を確認します。
6. `存在しないタスク名` を探しているが、画面には追加したタスク名が表示されていることを確認します。

期待される結果:
Trace Viewerで、どの操作のあとに、どのexpectが失敗したかを確認できます。

作業後の状態:
traceを使って、テスト失敗時の画面と操作を調査できています。

確認ポイント:

画面上の確認:
Trace Viewerで、失敗時点の画面や操作の流れを確認できます。

裏側の確認:
traceには、操作、locator、画面スナップショット、network、sourceなどの調査情報が含まれることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン8-3 手順5のあと。
Trace Viewerで失敗したexpectの前後の画面状態が表示されている状態。

> 注意:
> traceには画面内容や入力値が含まれる場合があります。
> 秘密情報を含むテストのtraceを外部へ共有しないように注意します。

## ハンズオン8-4: 原因を直して再実行する

目的:
一時的に間違えた期待値を元に戻し、テストがpassすることを確認します。

実行場所:
ローカルPC

変更するファイル:
`tests/e2e/test_todo_flow.py`

手順の種類:
実行する手順

作業前の状態:
`test_add_task` が、間違った期待値によって失敗しています。

手順:

1. `tests/e2e/test_todo_flow.py` を開きます。
2. 間違った期待値を元に戻します。

変更前:

```python
expect(page.get_by_text("存在しないタスク名")).to_be_visible()
```

変更後:

```python
expect(page.get_by_text(task_title)).to_be_visible()
```

3. 対象テストだけ再実行します。

実行場所: ローカルPCの別ターミナル、プロジェクトディレクトリ

```bash
pytest tests/e2e/test_todo_flow.py -k add_task
```

4. テストがpassすることを確認します。
5. 必要に応じて、全体のE2Eテストを再実行します。

```bash
pytest tests/e2e/test_todo_flow.py
```

期待される結果:
`test_add_task` がpassし、必要に応じて全体のE2Eテストもpassします。

作業後の状態:
一時的に失敗させたテストが元に戻り、正常な状態になっています。

確認ポイント:

画面上の確認:
ターミナルに `passed` が表示されます。

裏側の確認:
失敗原因を特定し、期待値を正しい値に戻して再実行できたことを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン8-4 手順4のあと。
pytestの出力に、修正後のテストがpassした結果が表示されている状態。

## ハンズオン8-5: CIで調査しやすい出力を整理する

目的:
GitHub ActionsなどのCIでテストが失敗したときに調査しやすいよう、Playwrightの出力設定を整理します。

実行場所:
ローカルPC

変更するファイル:
必要に応じて `pytest.ini`

手順の種類:
確認のみ

作業前の状態:
ローカルでtraceを記録し、Trace Viewerで確認する流れを体験しています。

手順:

1. CIではブラウザ画面を直接見られないことを確認します。
2. 失敗時に残したい出力を整理します。

| 出力 | 設定例 | 目的 |
| --- | --- | --- |
| trace | `--tracing retain-on-failure` | 失敗時の操作、画面、networkを後から見る |
| screenshot | `--screenshot only-on-failure` | 失敗時の画面を画像で見る |
| video | `--video retain-on-failure` | 失敗までの操作の流れを見る |
| output | `--output test-results` | 調査用ファイルの保存先をそろえる |

3. `pytest.ini` に設定を書く場合の例を確認します。

```ini
[pytest]
addopts =
    --tracing retain-on-failure
    --screenshot only-on-failure
    --video retain-on-failure
    --output test-results
```

4. ローカルでこの設定を使う場合は、出力ファイルが増えることを理解します。
5. 第9章では、`test-results/` をGitHub Actionsのartifactとして保存する方針を確認します。

期待される結果:
CIで失敗調査に必要なPlaywright出力を説明できます。

作業後の状態:
第9章でCI workflowを作るときに、`test-results/` を保存する理由が理解できています。

確認ポイント:

画面上の確認:
CIでは画面を直接見られないため、traceやscreenshotが重要だと説明できます。

裏側の確認:
Playwrightの失敗時出力を `test-results/` に集め、artifactとして保存する方針を説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン8-5 手順3のあと。
`pytest.ini` のPlaywright出力設定例が表示されている状態。

> 補足:
> `pytest.ini` に常にvideo保存を設定すると、ローカルでも出力ファイルが増えます。
> プロジェクトの方針によって、CIだけで有効にする方法も検討します。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| 失敗テストの作成 | あえて失敗するテストを用意できる |
| pytest出力 | 失敗したテスト名、失敗行、エラーメッセージを読める |
| trace記録 | `--tracing retain-on-failure` でtraceを残せる |
| Trace Viewer | `playwright show-trace` でtraceを開ける |
| screenshot | `--screenshot only-on-failure` の役割を説明できる |
| video | `--video retain-on-failure` の役割を説明できる |
| 修正と再実行 | 原因を直してテストをpassに戻せる |
| CI準備 | `test-results/` をartifactとして保存する理由を説明できる |

確認:
失敗したE2Eテストについて、pytest出力とtraceから原因を説明し、修正してpassに戻せれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. pytestの失敗出力で最初に確認するべき情報は何ですか？
2. failureとerrorの違いを説明してください。
3. Playwright traceでは、どのような情報を確認できますか？
4. `--tracing retain-on-failure` は何をするオプションですか？
5. screenshotとvideoは、それぞれどのような調査に向いていますか？
6. 失敗したテストだけを実行するメリットは何ですか？
7. CIでは、なぜtraceやscreenshotを残す必要がありますか？
8. traceを共有するときに注意することは何ですか？

# 9. 理解チェックの回答例

1. 失敗したテスト名、失敗したファイルと行、エラーメッセージを確認します。どのexpectやlocatorで失敗したかを見ることが大切です。
2. failureは期待結果と実際の結果が違ってassertionが失敗した状態です。errorはテスト準備や実行中に例外が起き、テストが正常に進められなかった状態です。
3. テスト中の操作、locator、画面スナップショット、network、console、sourceの行、エラー箇所などを確認できます。
4. 失敗したテストのtraceだけを残すオプションです。成功したテストのtraceは残さないため、調査対象を絞りやすくなります。
5. screenshotは失敗時点の画面状態を一目で見るのに向いています。videoは失敗までの操作の流れを追うのに向いています。
6. 実行時間を短くでき、失敗箇所に集中できます。原因調査のたびに全テストを実行する必要がなくなります。
7. CIではブラウザ画面を直接見られないためです。あとからtraceやscreenshotをダウンロードして、失敗時の状態を調べる必要があります。
8. traceには画面内容、入力値、URL、通信情報などが含まれる場合があります。秘密情報や個人情報を含むtraceを不用意に共有しないようにします。

# 10. 次章への接続

この章では、失敗したE2Eテストを調査する方法を学びました。

この章でできるようになったこと:

- pytestの失敗出力を読める
- 失敗したテスト名と失敗行を確認できる
- Playwright traceを記録して開ける
- screenshotとvideoの役割を説明できる
- 失敗原因を仮説立てして修正できる
- CIで調査しやすい出力を整理できる

第9章では、ローカルで動くテストをGitHub Actions上で自動実行するCIを作ります。

ローカルPCで `pytest` を実行するだけでは、変更のたびに人が忘れず確認する必要があります。
Pull Requestを作ったときに、自動でテストが走るようにすれば、変更による壊れ方に早く気づけます。

次章では、GitHub ActionsでPython環境を作り、Playwrightのブラウザをインストールし、E2Eテストを自動実行するworkflowを作ります。
