# 教材作成 引継ぎ資料

この資料は、新しいチャットでFlask ToDoアプリ教材の作業を再開するための引継ぎメモです。

最終更新時点の状況:

```text
作業ディレクトリ: /home/matsu/todo-app
確認時点のブランチ: main
教材の正本: docs/chapterXX_*.md
DOCX生成: まだ行っていない
```

## 1. プロジェクト概要

題材にしているアプリ:

- Flask製ToDoアプリ
- SQLite + SQLAlchemyを使用
- タスク、カテゴリ、コメント機能がある
- Python版PlaywrightでE2Eテストを学ぶ
- GitHub ActionsでCIを学ぶ
- Renderでデプロイ、DB運用、CDを学ぶ

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
  -> 学習者向け配布版。まだ生成していない。
```

## 3. 必ず参照するファイル

新しいチャットでは、まず次の3ファイルを読む。

```text
docs/material_reference.md
docs/curriculum_plan.md
docs/handoff_for_next_chat.md
```

役割:

```text
material_reference.md
  -> どう書くか。章構成、ハンズオン形式、表記ルール。

curriculum_plan.md
  -> 何を書くか。章ごとの目的、到達目標、ハンズオン計画。

handoff_for_next_chat.md
  -> 現在の作業状況と次にやること。
```

## 4. 現在の教材ファイル

Markdown正本は第0章から第13章まで作成済み。

```text
docs/chapter00_environment_and_prerequisites.md
docs/chapter01_web_application_basics.md
docs/chapter02_flask_application_structure.md
docs/chapter03_database_basics.md
docs/chapter04_testing_concepts.md
docs/chapter05_testable_flask_design.md
docs/chapter06_playwright_setup.md
docs/chapter07_e2e_testing_todo_app.md
docs/chapter08_debugging_failed_tests.md
docs/chapter09_github_actions_ci.md
docs/chapter10_render_deployment.md
docs/chapter11_render_database_operations.md
docs/chapter12_cd_with_render.md
docs/chapter13_practical_operations.md
```

補助資料:

```text
docs/material_reference.md
docs/curriculum_plan.md
docs/handoff_for_next_chat.md
```

旧DOCX:

```text
docs/chapter0_environment_and_prerequisites.docx
```

旧DOCXは正本として扱わない。必要なら参考程度に見る。

## 5. 完了済みの作業

完了済み:

- 第0章から第13章までのMarkdown正本を作成
- `docs/material_reference.md` を教材作成基準として整備
- `docs/curriculum_plan.md` を章計画として整備
- 全章をレビューし、構成と章間接続を補強
- 第0章のハンズオン形式を他章と同じ標準構成に統一
- DOCXは未生成
- アプリ本体の実装ファイルは教材作成では編集していない

直近のレビュー修正で補強した主な点:

- 第5章、第6章、第7章のつながりを明確化
  - 第5章は「テストしやすい設計方針」を学ぶ章
  - 第6章、第7章は「現行アプリ構成のままPlaywrightを導入する」章
  - 一意なテストデータ名は、テスト用DB初期化の代替ではなく暫定策だと補足
- 第9章に、CI runner上のSQLiteがローカルDBや本番DBと分かれることを補足
- 第11章に、第5章とのDB分離の視点の違いを補足
  - 第5章: テスト安定化のためのDB分離
  - 第11章: 本番データ運用のためのDB分離
- 第13章に、Render rollback後のAuto Deploy確認を補足
- 第0章のスクリーンショット枠に撮影タイミングを追加

## 6. 教材シリーズの章立て

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

流れ:

```text
第0〜3章
  -> Webアプリ、Flask、DBの土台を理解する

第4〜8章
  -> テスト観点、Playwright、E2Eテスト、失敗調査を学ぶ

第9〜13章
  -> GitHub Actions、Render、DB運用、CD、実務運用を学ぶ
```

## 7. 重要な内容整理

DBに関する整理:

```text
開発用DB
  -> ローカルで手動確認するときに使うDB

テスト用DB
  -> Playwrightやpytestで自動テストするときに使うDB

本番用DB
  -> Render上で公開アプリが使うDB
```

現在のアプリはSQLiteを使っている。

教材上の扱い:

- 第0〜3章: 今あるSQLiteの仕組みを理解する
- 第5章: テスト用DBを分ける考え方を学ぶ
- 第6〜7章: まず現行アプリ構成のままE2Eテストを書く
- 第7章: DB初期化の代わりに一意なテストデータ名で衝突を避ける
- 第9章: GitHub Actions runner上でE2Eテストを実行する
- 第10章: Renderへ初回デプロイする
- 第11章: 本番DB運用としてSQLiteとPostgreSQL、`DATABASE_URL`、migrationを整理する
- 第12章: CI成功後にRenderへ反映するCDを扱う
- 第13章: branch protection、required checks、Secrets、rollback、最終課題を扱う

## 8. リファレンス上の重要ルール

`docs/material_reference.md` に従う。

特に重要:

- 章末にエラー集の専用セクションは入れない
- 各章は共通テンプレートに沿う
- 各ハンズオンには、目的、実行場所、変更するファイル、手順の種類、作業前の状態、手順、期待される結果、作業後の状態、確認ポイントを入れる
- ファイルを編集しない場合も `変更するファイル: なし` と明記する
- コマンドは本文に埋め込まずコードブロックにする
- OS差があるコマンドはLinux / macOSとWindows PowerShellを分ける
- スクリーンショット枠には撮影タイミングを書く
- 理解チェックと回答例を入れる
- 章末に次章への接続を入れる
- 教材作成だけの依頼ではアプリ本体を編集しない

## 9. 次にやること

次チャットでおすすめの作業:

1. `docs/material_reference.md`、`docs/curriculum_plan.md`、この引継ぎ資料を読む
2. `git status --short` で作業状態を確認する
3. 第0章から第13章まで、必要なら最終レビューを行う
4. 問題なければ、MarkdownからDOCXを生成する作業に進む

まだ行っていないこと:

- DOCX生成
- 1つの統合Markdownへの結合
- 目次やページ番号など、DOCX向けの体裁調整
- 実際のGitHub Actions workflowファイル作成
- 実際のRender設定作成

注意:

- 第9章以降の `.github/workflows/ci.yml`、Render設定、Render Postgresなどは、教材本文内のハンズオン手順として説明している。
- 教材作成作業として、実ファイルの `.github/workflows/ci.yml` や `render.yaml` を作成したわけではない。
- 最終課題を実施する場合のみ、学習者が選んだ機能に応じて `app.py`、`templates/`、`tests/e2e/` などを編集する。

## 10. 次チャットへの依頼文例

次チャットでは、たとえば次のように依頼する。

```text
このプロジェクトでは、Flask製ToDoアプリを題材に、Webアプリ開発・テスト自動化・CI/CDを学ぶ教材を作成しています。

まず以下のファイルを読んでください。

- docs/material_reference.md
- docs/curriculum_plan.md
- docs/handoff_for_next_chat.md

現在、第0章から第13章までのMarkdown正本は作成済みです。

次に、DOCX化に進む前の最終確認をしてください。

重視する観点:
- 章間の流れが自然か
- ハンズオン形式がそろっているか
- DOCX変換時に崩れそうなMarkdown表記がないか
- アプリ本体のファイルに不要な変更がないか

注意:
- まだDOCXは生成しないでください
- まず確認結果だけ提示してください
```
