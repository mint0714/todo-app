# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第9章 GitHub ActionsでCIを作る |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 90〜120分 |
| 難易度 | 実践 |
| この章で作るもの | Pull RequestとpushでE2Eテストを自動実行するCI workflow |
| この章で変更するファイル | `.github/workflows/ci.yml`。必要に応じて `requirements-dev.txt`、`pytest.ini` |

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

この章では、GitHub Actionsを使って、Pull Requestやpushをきっかけに自動でテストが実行されるCIを作ります。

第8章では、ローカルPCで失敗したE2Eテストを調査する方法を学びました。しかし、ローカルPCで手動実行するだけでは、テスト実行を忘れることがあります。

CIを作ると、GitHub上で変更が送られたタイミングで自動テストを実行できます。

この章を終えると、次のことができるようになります。

- GitHub Actionsのworkflow、job、stepを説明できる
- Pull RequestやpushをきっかけにCIを実行できる
- GitHub Actions上にPython環境を作れる
- CI上でPython依存関係をインストールできる
- CI上でPlaywrightブラウザをインストールできる
- CI上でFlaskアプリを起動してpytestを実行できる
- PR上でCI結果を確認できる
- 失敗調査用のartifactを保存できる

# 2. この章の完成イメージ

この章の最後には、次の流れをGitHub Actionsで自動実行できる状態を目指します。

```text
Pull Requestを作成する
  -> GitHub Actionsが起動する
  -> リポジトリをcheckoutする
  -> Pythonをセットアップする
  -> requirements.txt と requirements-dev.txt をインストールする
  -> Playwrightブラウザをインストールする
  -> FlaskアプリをCI上で起動する
  -> pytestでE2Eテストを実行する
  -> 成功または失敗をPR上に表示する
  -> 失敗時のtraceなどをartifactとして保存する
```

作成するworkflowファイル:

```text
.github/workflows/ci.yml
```

CIの全体像:

```text
GitHub
  -> pull_request / push
  -> GitHub Actions
  -> ubuntu-latest runner
  -> Python + Flask + Playwright
  -> pytest
  -> PRチェック
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン9-6 手順6のあと。
GitHubのPull Request画面で、GitHub Actionsのチェックが成功している状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `.github/workflows/ci.yml` | GitHub ActionsのCI workflowを定義する |
| `requirements.txt` | アプリ本体の依存関係 |
| `requirements-dev.txt` | pytestやPlaywrightなど、テスト用の依存関係 |
| `tests/e2e/` | E2Eテストを置くディレクトリ |
| `test-results/` | Playwrightのtrace、screenshot、videoなどの出力先 |
| `pytest.ini` | 必要に応じてpytest / Playwrightのオプションを設定する |

> 注意:
> この章の教材本文では、`.github/workflows/ci.yml` を作成する手順を扱います。
> `app.py`、`templates/`、`static/` などのアプリ本体は編集しません。

## 3-2. この章で使う主なコマンド

| コマンド | 目的 |
| --- | --- |
| `mkdir -p .github/workflows` | workflowファイルを置くディレクトリを作成する |
| `git status` | 作業状態を確認する |
| `git add .github/workflows/ci.yml` | CI workflowをGitの対象にする |
| `git commit -m "Add CI workflow"` | CI workflowをcommitする |
| `git push` | 作業ブランチをGitHubへ送る |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
```

> 補足:
> この章では、GitHub画面でActionsログやPRチェックも確認します。
> 作業場所がローカルPCなのかGitHub画面なのかを意識しながら進めます。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第7章の完了 | E2Eテストが `tests/e2e/` にある |
| 第8章の理解 | traceやartifactが失敗調査に役立つことを説明できる |
| GitHub | リポジトリがGitHubにpushされている |
| Git | 作業ブランチを作成してpushできる |
| GitHub Actions | GitHubリポジトリのActionsタブを開ける |
| 依存関係 | `requirements.txt` と `requirements-dev.txt` の役割を説明できる |

この章の作業前の状態:

```text
ローカルPC
  -> E2Eテストを実行できる
  -> Gitで作業ブランチをpushできる

GitHub
  -> リポジトリが存在する
  -> Pull Requestを作成できる

ファイル
  -> .github/workflows/ci.yml はまだない
```

この章の作業後の状態:

```text
ファイル
  -> .github/workflows/ci.yml がある

GitHub Actions
  -> Pull RequestやpushでCIが実行される
  -> pytestの結果をPR上で確認できる
  -> 失敗時にtest-results/をartifactとして確認できる
```

> 補足:
> 教材では基本ブランチを `main` として説明します。
> `develop` を使う運用の場合は、workflow内の `main` を `develop` に読み替えます。

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| CI | Continuous Integration。変更のたびに自動でテストや確認を行う仕組み |
| GitHub Actions | GitHub上でworkflowを実行する自動化機能 |
| workflow | GitHub Actionsで実行する一連の処理 |
| event | workflowを起動するきっかけ |
| job | 同じrunner上で実行される処理のまとまり |
| step | jobの中の1つ1つの処理 |
| runner | jobを実行する仮想マシン |
| action | checkoutやPythonセットアップなどを行う再利用可能な処理 |
| artifact | workflow実行後に保存してダウンロードできるファイル |

## 5-2. GitHub Actions

GitHub Actionsは、GitHub上で自動処理を実行する仕組みです。

たとえば、Pull Requestを作成したときに、次のような処理を自動で実行できます。

```text
コードを取得する
Pythonを用意する
依存関係をインストールする
テストを実行する
結果をPRに表示する
```

このように、変更を取り込む前に自動でテストを実行する仕組みをCIと呼びます。

## 5-3. workflow、job、step

GitHub Actionsでは、処理をworkflow、job、stepという単位で考えます。

| 単位 | 役割 |
| --- | --- |
| workflow | 自動実行する処理全体 |
| job | runner上で実行される処理のまとまり |
| step | jobの中で順番に実行される1つの処理 |

この章で作るworkflowは、次のような構造になります。

```text
workflow: CI
  job: e2e-tests
    step: リポジトリをcheckoutする
    step: Pythonをセットアップする
    step: 依存関係をインストールする
    step: Playwrightブラウザをインストールする
    step: Flaskアプリを起動する
    step: pytestを実行する
    step: artifactを保存する
```

## 5-4. event

eventは、workflowを起動するきっかけです。

この章では、次の2つを使います。

| event | きっかけ |
| --- | --- |
| `pull_request` | Pull Requestが作成、更新されたとき |
| `push` | 指定したbranchへpushされたとき |

例:

```yaml
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
```

この設定では、`main` に向けたPull Requestと、`main` へのpushでworkflowが実行されます。

## 5-5. runner

runnerは、GitHub Actionsのjobを実行する環境です。

この章では、GitHubが用意しているUbuntu runnerを使います。

```yaml
runs-on: ubuntu-latest
```

CI上のrunnerは、毎回新しく用意される環境です。

そのため、ローカルPCに入っているPythonライブラリやPlaywrightブラウザは使えません。workflowの中で毎回セットアップします。

## 5-6. actions/checkoutとactions/setup-python

`actions/checkout` は、GitHub上のリポジトリのコードをrunnerへ取得するactionです。

`actions/setup-python` は、runner上に指定したPythonを用意するactionです。

例:

```yaml
- uses: actions/checkout@v5

- name: Set up Python
  uses: actions/setup-python@v6
  with:
    python-version: "3.12"
```

> 補足:
> actionのmajor versionは時間とともに変わります。
> 実際に教材を運用する時点で、公式ドキュメントの最新例を確認してください。

## 5-7. PlaywrightをCIで動かす注意点

PlaywrightのE2Eテストは、ブラウザを起動してWebアプリを操作します。

CIでPlaywrightを動かすには、次の準備が必要です。

```text
Python依存関係をインストールする
Playwrightブラウザをインストールする
Linux上でブラウザに必要な依存ライブラリを入れる
テスト対象のFlaskアプリを起動する
pytestを実行する
```

Playwrightでは、CI上でブラウザに必要な依存関係をまとめて入れるために、次のコマンドを使えます。

```bash
python -m playwright install --with-deps chromium
```

この教材では、pytest-playwrightの標準に合わせて、まずChromiumでE2Eテストを実行します。

## 5-8. artifact

artifactは、workflow実行後にGitHub上からダウンロードできるファイルです。

E2Eテストが失敗したとき、`test-results/` にtrace、screenshot、videoなどが保存されます。

CIではブラウザ画面を直接見られないため、`test-results/` をartifactとして保存しておくと、あとから原因を調べられます。

例:

```yaml
- name: Upload Playwright artifacts
  if: ${{ !cancelled() }}
  uses: actions/upload-artifact@v5
  with:
    name: playwright-artifacts
    path: test-results/
    if-no-files-found: ignore
```

# 6. ハンズオン

## ハンズオン9-1: CI workflowの構成を設計する

目的:
workflowファイルを書く前に、CIで実行する処理の順番を整理します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
ローカルPCでE2Eテストを実行できる状態です。

手順:

1. ローカルでE2Eテストを実行するときの流れを確認します。

```text
仮想環境を有効化する
Flaskアプリを起動する
pytestを実行する
```

2. CIではrunnerが毎回新しい環境になることを確認します。
3. CIで必要な処理を順番に並べます。

```text
リポジトリをcheckoutする
Pythonをセットアップする
依存関係をインストールする
Playwrightブラウザをインストールする
Flaskアプリを起動する
pytestを実行する
artifactを保存する
```

4. どの処理がGitHub Actionsのstepになるか確認します。

期待される結果:
CI workflowで実行する処理の順番を説明できます。

作業後の状態:
`.github/workflows/ci.yml` に書く内容の全体像が整理されています。

確認ポイント:

画面上の確認:
CI workflowの処理順を図や文章で説明できます。

裏側の確認:
CI runnerはローカルPCとは別環境なので、依存関係やブラウザを毎回準備する必要があると説明できます。

## ハンズオン9-2: `.github/workflows/ci.yml` を作る

目的:
GitHub Actionsのworkflowファイルを作成し、Pull RequestとpushでCIが起動する設定を書きます。

実行場所:
ローカルPC

変更するファイル:
`.github/workflows/ci.yml`

手順の種類:
実行する手順

作業前の状態:
CI workflowの処理順を整理済みです。

手順:

1. workflowディレクトリを作成します。

Linux / macOS:

```bash
mkdir -p .github/workflows
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force .github\workflows
```

2. `.github/workflows/ci.yml` を作成します。
3. まず、workflow名と起動条件を書きます。

```yaml
name: CI

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
  workflow_dispatch:
```

4. jobの土台を書きます。

```yaml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
```

期待される結果:
`.github/workflows/ci.yml` にworkflow名、起動条件、jobの土台が書かれます。

作業後の状態:
GitHub Actionsが読み取れるworkflowファイルの土台ができています。

確認ポイント:

画面上の確認:
`.github/workflows/ci.yml` がエディタで表示されます。

裏側の確認:
`pull_request`、`push`、`workflow_dispatch` がworkflowの起動条件であることを説明できます。

> 注意:
> YAMLはインデントが重要です。
> スペースの数がずれると、workflowが正しく読み込まれないことがあります。

## ハンズオン9-3: Python依存関係をインストールするstepを書く

目的:
GitHub Actions上でPythonをセットアップし、アプリ本体とテスト用の依存関係をインストールします。

実行場所:
ローカルPC

変更するファイル:
`.github/workflows/ci.yml`

手順の種類:
実行する手順

作業前の状態:
`.github/workflows/ci.yml` にjobの土台があります。

手順:

1. `Checkout repository` stepの下に、Pythonセットアップstepを追加します。

```yaml
      - name: Set up Python
        uses: actions/setup-python@v6
        with:
          python-version: "3.12"
          cache: "pip"
```

2. 依存関係インストールstepを追加します。

```yaml
      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
```

3. `requirements.txt` と `requirements-dev.txt` の役割を確認します。

| ファイル | 役割 |
| --- | --- |
| `requirements.txt` | Flaskなど、アプリ実行に必要な依存関係 |
| `requirements-dev.txt` | pytest、pytest-playwrightなど、テスト実行に必要な依存関係 |

期待される結果:
CI上でPythonと依存関係を準備するstepが追加されます。

作業後の状態:
runner上でFlaskアプリとpytestを実行するためのPython環境を作れるworkflowになっています。

確認ポイント:

画面上の確認:
workflowファイルに `actions/setup-python` と `pip install` のstepが書かれています。

裏側の確認:
CI runnerは毎回新しい環境なので、依存関係をworkflow内でインストールする必要があると説明できます。

## ハンズオン9-4: Playwrightブラウザをインストールするstepを書く

目的:
CI上でPlaywrightのE2Eテストを実行するために、ブラウザとLinux依存関係をインストールします。

実行場所:
ローカルPC

変更するファイル:
`.github/workflows/ci.yml`

手順の種類:
実行する手順

作業前の状態:
Python依存関係をインストールするstepが追加されています。

手順:

1. 依存関係インストールstepの下に、Playwrightブラウザインストールstepを追加します。

```yaml
      - name: Install Playwright browsers
        run: python -m playwright install --with-deps chromium
```

2. `--with-deps` の意味を確認します。

| オプション | 意味 |
| --- | --- |
| `--with-deps` | Linux上でブラウザ実行に必要なOS依存関係もインストールする |
| `chromium` | この章ではChromiumだけをインストールする |

期待される結果:
CI上でPlaywrightがChromiumを起動できる準備ができます。

作業後の状態:
E2EテストをCI上で実行するためのブラウザ環境を作れるworkflowになっています。

確認ポイント:

画面上の確認:
workflowファイルに `python -m playwright install --with-deps chromium` が書かれています。

裏側の確認:
Playwright本体だけでなく、操作対象のブラウザとOS依存関係が必要であることを説明できます。

## ハンズオン9-5: pytest実行stepを書く

目的:
CI上でFlaskアプリを起動し、pytestでE2Eテストを実行するstepを書きます。

実行場所:
ローカルPC

変更するファイル:
`.github/workflows/ci.yml`

手順の種類:
実行する手順

作業前の状態:
Python依存関係とPlaywrightブラウザをインストールするstepが追加されています。

手順:

1. Playwrightブラウザインストールstepの下に、Flaskアプリ起動stepを追加します。

```yaml
      - name: Start Flask app
        run: |
          python -m flask --app app run --host 127.0.0.1 --port 5000 &
          sleep 5
```

2. pytest実行stepを追加します。

```yaml
      - name: Run E2E tests
        run: |
          pytest tests/e2e \
            --tracing retain-on-failure \
            --screenshot only-on-failure \
            --video retain-on-failure \
            --output test-results
```

3. 現時点のworkflow全体を確認します。

```yaml
name: CI

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Set up Python
        uses: actions/setup-python@v6
        with:
          python-version: "3.12"
          cache: "pip"

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Install Playwright browsers
        run: python -m playwright install --with-deps chromium

      - name: Start Flask app
        run: |
          python -m flask --app app run --host 127.0.0.1 --port 5000 &
          sleep 5

      - name: Run E2E tests
        run: |
          pytest tests/e2e \
            --tracing retain-on-failure \
            --screenshot only-on-failure \
            --video retain-on-failure \
            --output test-results
```

期待される結果:
CI上でFlaskアプリを起動し、E2Eテストを実行するworkflowになります。

作業後の状態:
GitHub Actionsでpytestを実行できる最低限のCI workflowができています。

確認ポイント:

画面上の確認:
workflowファイルにFlask起動stepとpytest実行stepが書かれています。

裏側の確認:
E2EテストはWebアプリへアクセスするため、pytest実行前にFlaskアプリを起動する必要があると説明できます。

> 補足:
> `sleep 5` は、Flaskアプリが起動するまで少し待つための簡易的な方法です。
> 実務では、HTTPで起動確認する待機処理にすることもあります。

## ハンズオン9-6: PRでCIが動くことを確認する

目的:
作成したworkflowをGitHubへpushし、Pull Request上でCIが動くことを確認します。

実行場所:
ローカルPC / GitHub画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
`.github/workflows/ci.yml` が作成され、ローカルでGit管理できる状態です。

手順:

1. Gitの状態を確認します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
```

2. workflowファイルをcommitします。

```bash
git add .github/workflows/ci.yml
git commit -m "Add CI workflow"
```

3. 作業ブランチをGitHubへpushします。

```bash
git push
```

4. GitHub画面でPull Requestを作成します。
5. Pull Request画面で、GitHub Actionsのチェックが表示されることを確認します。
6. チェックが成功するまで待ちます。
7. 詳細を確認したい場合は、`Details` またはActionsタブからworkflowログを開きます。

期待される結果:
Pull Request上でCIが実行され、E2Eテストが成功します。

作業後の状態:
Pull Requestに対して自動テストが実行される状態になっています。

確認ポイント:

画面上の確認:
Pull Request画面にGitHub Actionsのチェック結果が表示されます。

裏側の確認:
GitHub Actionsログで、checkout、Pythonセットアップ、依存関係インストール、Playwrightインストール、pytest実行が順に行われたことを確認できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン9-6 手順6のあと。
Pull Request画面にCIチェック成功が表示されている状態。

> 注意:
> workflowファイルはGitHubへpushされて初めてGitHub Actionsで実行されます。
> ローカルにファイルを作っただけでは、GitHub上のCIは動きません。

## ハンズオン9-7: artifact保存を追加する

目的:
E2Eテストが失敗したときに調査できるように、`test-results/` をartifactとして保存します。

実行場所:
ローカルPC / GitHub Actionsログ

変更するファイル:
`.github/workflows/ci.yml`

手順の種類:
実行する手順

作業前の状態:
Pull Request上でCIが実行されることを確認済みです。

手順:

1. `Run E2E tests` stepの下に、artifact保存stepを追加します。

```yaml
      - name: Upload Playwright artifacts
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v5
        with:
          name: playwright-artifacts
          path: test-results/
          if-no-files-found: ignore
```

2. 最終的なworkflow全体を確認します。

```yaml
name: CI

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Set up Python
        uses: actions/setup-python@v6
        with:
          python-version: "3.12"
          cache: "pip"

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Install Playwright browsers
        run: python -m playwright install --with-deps chromium

      - name: Start Flask app
        run: |
          python -m flask --app app run --host 127.0.0.1 --port 5000 &
          sleep 5

      - name: Run E2E tests
        run: |
          pytest tests/e2e \
            --tracing retain-on-failure \
            --screenshot only-on-failure \
            --video retain-on-failure \
            --output test-results

      - name: Upload Playwright artifacts
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v5
        with:
          name: playwright-artifacts
          path: test-results/
          if-no-files-found: ignore
```

3. 変更をcommitしてpushします。

```bash
git add .github/workflows/ci.yml
git commit -m "Upload Playwright artifacts"
git push
```

4. GitHub Actionsのworkflow実行画面を開きます。
5. workflow summaryのartifact欄を確認します。
6. テストが失敗した場合、artifactをダウンロードしてtraceやscreenshotを確認できることを説明します。

期待される結果:
GitHub Actions上で、`test-results/` がartifactとして保存されます。

作業後の状態:
CIでE2Eテストが失敗したときに、調査用ファイルを取得できるworkflowになっています。

確認ポイント:

画面上の確認:
GitHub Actionsのworkflow summaryでartifactを確認できます。

裏側の確認:
CIではブラウザ画面を直接見られないため、traceやscreenshotをartifactとして保存する必要があると説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン9-7 手順5のあと。
GitHub Actionsのworkflow summaryにartifactが表示されている状態。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| workflowファイル | `.github/workflows/ci.yml` がある |
| 起動条件 | `pull_request` と `push` でCIが動く |
| checkout | GitHub Actions上でリポジトリを取得できる |
| Python | `actions/setup-python` でPythonをセットアップできる |
| 依存関係 | `requirements.txt` と `requirements-dev.txt` をインストールできる |
| Playwright | `python -m playwright install --with-deps chromium` が成功する |
| Flask起動 | CI上でFlaskアプリを起動できる |
| pytest | `pytest tests/e2e` が成功する |
| PRチェック | Pull Request上でCI結果を確認できる |
| artifact | `test-results/` を保存できる |

確認:
Pull Request上でGitHub Actionsのチェックが成功し、必要に応じてartifactを確認できれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. CIは何のために使いますか？
2. GitHub Actionsのworkflow、job、stepの違いを説明してください。
3. `pull_request` と `push` は、それぞれどのようなeventですか？
4. `actions/checkout` は何をするactionですか？
5. `actions/setup-python` は何をするactionですか？
6. CIでPlaywrightブラウザをインストールする必要があるのはなぜですか？
7. E2Eテスト実行前にFlaskアプリを起動する必要があるのはなぜですか？
8. artifactは何のために保存しますか？

# 9. 理解チェックの回答例

1. 変更が入るたびに自動でテストを実行し、壊れていないか早く確認するために使います。Pull Requestの確認漏れを減らせます。
2. workflowは自動処理全体です。jobはrunner上で実行される処理のまとまりです。stepはjobの中で順番に実行される1つ1つの処理です。
3. `pull_request` はPull Requestが作成または更新されたときのeventです。`push` は指定したbranchへcommitがpushされたときのeventです。
4. リポジトリのコードをGitHub Actionsのrunnerへ取得するactionです。これがないと、runner上でプロジェクトのファイルを使えません。
5. runner上に指定したPythonバージョンを用意するactionです。
6. CI runnerは毎回新しい環境で、ローカルPCに入っているブラウザを使えないためです。Playwrightが操作するブラウザをworkflow内で準備します。
7. E2Eテストはブラウザから `http://127.0.0.1:5000` にアクセスするためです。Flaskアプリが起動していないと、接続できずテストが失敗します。
8. CIで失敗したときに、trace、screenshot、videoなどを後から確認するためです。CIではブラウザ画面を直接見られないため、artifactが調査に役立ちます。

# 10. 次章への接続

この章では、GitHub ActionsでCIを作り、Pull RequestやpushをきっかけにE2Eテストを自動実行する仕組みを作りました。

この章でできるようになったこと:

- GitHub Actionsのworkflow、job、stepを説明できる
- Pull RequestやpushをきっかけにCIを実行できる
- GitHub Actions上にPython環境を作れる
- PlaywrightブラウザをCI上にインストールできる
- CI上でFlaskアプリを起動し、pytestを実行できる
- PR上でCI結果を確認できる
- 失敗調査用のartifactを保存できる

第10章では、CIで確認できる状態になったアプリをRenderへデプロイします。

ローカルで動く。
E2Eテストで確認できる。
Pull Requestでも自動テストが動く。

次章では、この状態のFlaskアプリをRenderのWeb Serviceとして公開し、本番URLで表示できるようにします。
