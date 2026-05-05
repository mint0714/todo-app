# 教材作成 引継ぎ資料

この資料は、新しいチャットでFlask ToDoアプリ教材の作成を再開するための引継ぎメモです。

## 1. プロジェクト概要

作業ディレクトリ:

```text
/home/matsu/todo-app
```

題材にするアプリ:

- Flask製ToDoアプリ
- SQLite + SQLAlchemyを使用
- タスク、カテゴリ、コメント機能がある
- 将来的にPython版PlaywrightでE2Eテストを追加する
- GitHub ActionsでCIを構築する
- RenderでCDとデプロイを扱う

主なファイル:

```text
app.py
requirements.txt
templates/
static/
docs/
```

## 2. 重要な作業方針

教材作成の依頼では、原則としてアプリ本体のファイルを編集しない。

編集しない対象の例:

```text
app.py
templates/
static/
requirements.txt
```

教材ファイルは `docs/` 配下に作成する。

各章は、まずMarkdownを正本として作る。その後、内容確認をしてからDOCXを生成する。

```text
chapterXX_xxx.md
  -> 正本。レビュー・修正・差分確認用。

chapterXX_xxx.docx
  -> 学習者向け配布版。
```

最初からDOCXを生成しない。

## 3. 既存の教材関連ファイル

```text
docs/material_reference.md
docs/curriculum_plan.md
docs/chapter0_environment_and_prerequisites.docx
docs/handoff_for_next_chat.md
```

### `docs/material_reference.md`

教材作成の書き方の基準。

主な内容:

- 章共通テンプレート
- 表紙、目次、見出しルール
- ハンズオンの標準構成
- コマンド表記ルール
- スクリーンショット枠
- 動作確認の標準
- 理解チェックと回答例
- 章末の締め方

### `docs/curriculum_plan.md`

教材内容の計画書。

主な内容:

- 教材全体の目的
- 想定読者
- 扱う技術
- 扱わないこと
- 第0章〜第13章の計画
- 各章の到達目標、主な内容、ハンズオン、作成・変更ファイル、次章への接続
- 最終課題

### `docs/chapter0_environment_and_prerequisites.docx`

初期に試作した第0章DOCX。

今後はこのDOCXを正本にしない。必要なら参考程度に見る。

## 4. 教材作成時に必ず参照するファイル

新しいチャットでは、まず次の2ファイルを読む。

```text
docs/material_reference.md
docs/curriculum_plan.md
```

役割:

```text
material_reference.md
  -> どう書くか。

curriculum_plan.md
  -> 何を書くか。
```

## 5. 教材シリーズの章立て

```text
第0章: 開発環境と前提知識
第1章: Webアプリの基本
第2章: Flaskアプリの構造
第3章: データベースの基本
第4章: テストの考え方
第5章: テストしやすいFlask設計
第6章: Playwrightの準備
第7章: ToDoアプリのE2Eテスト
第8章: 失敗したテストの調査
第9章: GitHub ActionsでCIを作る
第10章: Renderへのデプロイ
第11章: RenderとDB運用
第12章: CDの実装
第13章: 実務的な運用
```

## 6. 次にやること

次に作成するファイル:

```text
docs/chapter00_environment_and_prerequisites.md
```

目的:

第0章のMarkdown正本を作成する。

注意:

- まずMarkdownだけ作る
- DOCXはまだ生成しない
- 旧DOCXは正本として扱わない
- アプリ本体は編集しない

## 7. 第0章で扱う内容

第0章タイトル:

```text
第0章: 開発環境と前提知識
```

扱う内容:

- 開発環境と前提知識
- Python / pip / venv
- `requirements.txt`
- Flaskアプリのローカル起動
- ブラウザでの手動動作確認
- Git / GitHubの基本
- branch / commit / push / pull request
- `.gitignore`
- 次章への接続

到達目標:

- Pythonとpipの役割を説明できる
- 仮想環境を有効化できる
- `requirements.txt` から依存関係をインストールできる
- Flaskアプリをローカルで起動できる
- `git status` で作業状態を確認できる
- branch、commit、push、pull requestの関係を説明できる

## 8. 第0章の想定ハンズオン

| 番号 | 内容 | 実行場所 |
| --- | --- | --- |
| 0-1 | プロジェクトディレクトリを確認する | ローカルPC |
| 0-2 | Pythonとpipを確認する | ローカルPC |
| 0-3 | 仮想環境を有効化する | ローカルPC |
| 0-4 | 依存関係をインストールする | ローカルPC |
| 0-5 | Flaskアプリを起動する | ローカルPC |
| 0-6 | ToDoアプリを手動操作する | ブラウザ |
| 0-7 | Gitの状態を確認する | ローカルPC |
| 0-8 | 作業ブランチを作る | ローカルPC |
| 0-9 | GitHubへpushする流れを確認する | ローカルPC / GitHub画面 |

## 9. データベースに関する認識

教材では、DBを目的ごとに分けて考える。

```text
開発用DB
  -> ローカルで手動確認するときに使うDB

テスト用DB
  -> Playwrightやpytestで自動テストするときに使うDB

本番用DB
  -> Render上で公開アプリが使うDB
```

現在のアプリはSQLiteを使っている。

教材の流れ:

- 第0〜3章: 今あるSQLiteの仕組みを理解する
- 第5章: テスト用DBを分ける考え方を学ぶ
- 第6〜8章: E2Eテストではテスト用SQLite DBを使う
- 第10〜12章: Render本番ではSQLiteではなくPostgreSQLを使う方針を学ぶ

## 10. リファレンス上の重要ルール

`docs/material_reference.md` に従う。

特に重要:

- 章末にエラー集の専用セクションは入れない
- 各章は共通テンプレートに沿う
- 各ハンズオンには目的、実行場所、手順、期待される結果、確認ポイントを入れる
- コマンドは本文に埋め込まずコードブロックにする
- 理解チェックと回答例を入れる
- 章末に次章への接続を入れる
- 教材作成だけの依頼ではアプリ本体を編集しない

## 11. 新しいチャットへの依頼文例

新しいチャットでは、次のように依頼する。

```text
このプロジェクトでは、Flask製ToDoアプリを題材に、Webアプリ開発・テスト自動化・CI/CDを学ぶ教材を作成しています。

まず以下のファイルを読んでください。

- docs/material_reference.md
- docs/curriculum_plan.md
- docs/handoff_for_next_chat.md

そのうえで、第0章のMarkdown正本を作成してください。

作成するファイル:
docs/chapter00_environment_and_prerequisites.md

注意:
- まずMarkdownだけ作成してください
- DOCXはまだ生成しないでください
- アプリ本体のファイルは編集しないでください
- docs/material_reference.md の基準に従ってください
- docs/curriculum_plan.md の第0章計画に沿ってください
```

