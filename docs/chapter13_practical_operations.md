# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第13章 実務的な運用 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 120〜180分 |
| 難易度 | 実践 |
| この章で作るもの | CI/CDを安全に使う運用ルールと最終課題の実施計画 |
| この章で変更するファイル | 原則なし。最終課題では選んだ機能に応じてアプリ本体とテストを変更する |

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

この章では、これまでに作ったCI/CDを、実務に近い形で安全に運用するための考え方を学びます。

第12章までで、次の流れがつながりました。

```text
作業ブランチ
  -> Pull Request
  -> GitHub ActionsでCI
  -> mainへマージ
  -> RenderへCD
  -> 本番URLで確認
```

この流れが動くようになると、次に大切になるのは「誰が、どの条件で、いつmainへ入れてよいか」です。

実務では、動く仕組みを作るだけでなく、壊れた変更や未確認の変更が本番へ出ないようにします。

この章を終えると、次のことができるようになります。

- branch protectionの役割を説明できる
- required checksの役割を説明できる
- CI成功をマージ条件にする意味を説明できる
- PRレビューの目的を説明できる
- GitHub SecretsとRender環境変数の違いを説明できる
- Renderのデプロイ履歴を見て変更を追跡できる
- rollbackの考え方を説明できる
- health checkの役割を説明できる
- staging環境とproduction環境の違いを説明できる
- 小さな機能追加からテスト、PR、CI、CDまでを自分で実施できる

# 2. この章の完成イメージ

この章の最後には、次のような運用の全体像を説明できる状態を目指します。

```text
mainブランチ
  -> 直接pushしない
  -> Pull Requestを通す
  -> CI成功を必須にする
  -> 必要に応じてレビュー承認を必須にする

Pull Request
  -> 変更内容を確認する
  -> E2Eテストが成功する
  -> レビューコメントを解消する
  -> mainへマージする

Render
  -> mainへの変更を検知する
  -> CI成功後にデプロイする
  -> Deploysで履歴を確認する
  -> 必要に応じてrollbackを検討する
```

最終課題では、学習者自身が小さな機能追加を1つ選び、次の流れを一通り実施します。

```text
機能を選ぶ
  -> 実装する
  -> E2Eテストを書く
  -> ローカルでテストする
  -> 作業ブランチをpushする
  -> Pull Requestを作る
  -> CI成功を確認する
  -> mainへマージする
  -> Renderへのデプロイを確認する
  -> 学習メモをまとめる
```

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-2 手順8のあと。
GitHubのbranch protection設定で、CIチェックが必須条件として設定されている状態。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-5 手順5のあと。
RenderのDeploys画面で、mainマージ後のデプロイ履歴を確認している状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `.github/workflows/ci.yml` | required checksにするCIの定義を確認する |
| `app.py` | 最終課題で選んだ機能によって変更する可能性がある |
| `templates/` | 最終課題で画面を変更する場合に編集する可能性がある |
| `tests/e2e/` | 最終課題でE2Eテストを追加または変更する |
| `requirements.txt` | 本番実行に必要な依存関係を確認する |
| `requirements-dev.txt` | テスト実行に必要な依存関係を確認する |
| `docs/` | 学習メモや教材本文を置く |

> 注意:
> この章の前半では、GitHub画面とRender画面の設定確認が中心です。
> 最終課題に入るまでは、アプリ本体のファイルを編集しません。

## 3-2. この章で使う主なコマンド

最終課題では、これまでの章で使ったコマンドを組み合わせます。

| コマンド | 目的 |
| --- | --- |
| `git status` | 作業状態を確認する |
| `git switch -c chapter13-practice` | 第13章用の作業ブランチを作る |
| `pytest tests/e2e` | E2Eテストを実行する |
| `git add ...` | 変更ファイルをcommit対象にする |
| `git commit -m "..."` | 変更をcommitする |
| `git push -u origin chapter13-practice` | 初回pushで作業ブランチをGitHubへ送る |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
git switch -c chapter13-practice
pytest tests/e2e
git status
```

> 補足:
> 既に `chapter13-practice` ブランチがある場合は、新しく作らず、そのブランチへ切り替えます。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第9章の完了 | GitHub ActionsのCIがある |
| 第10章の完了 | Render Web Serviceがある |
| 第11章の理解 | 本番DBや秘密情報を慎重に扱う必要性を理解している |
| 第12章の完了 | CI成功後にRenderへデプロイする流れを確認済み |
| GitHub権限 | repository settingsを開ける。設定変更には管理者権限が必要な場合がある |
| Render権限 | Web ServiceのSettings、Environment、Deploysを開ける |

この章の作業前の状態:

```text
GitHub
  -> CI workflowがある
  -> Pull Requestを作れる
  -> mainへマージできる

Render
  -> Web Serviceがある
  -> Auto Deployを確認できる
  -> Deploys画面を確認できる

運用ルール
  -> branch protectionやrequired checksはまだ整理できていない
  -> Secretsと環境変数の違いをまだ整理できていない
```

この章の作業後の状態:

```text
GitHub
  -> mainブランチ保護の考え方を説明できる
  -> CI成功をマージ条件にする意味を説明できる
  -> PRレビューの流れを説明できる

Render
  -> 環境変数と秘密情報の扱いを説明できる
  -> デプロイ履歴、rollback、health checkの役割を説明できる

最終課題
  -> 小さな機能追加からデプロイ確認までを自分で実施できる
```

> 注意:
> GitHubのbranch protectionやrulesetの設定は、プラン、権限、リポジトリの種類によって表示や利用範囲が変わる場合があります。
> 設定画面が教材と完全に同じでなくても、mainを直接変更しない、CI成功を必須にする、レビューを通す、という目的を追います。

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| branch protection | 特定のbranchへ変更を入れる前に条件を設定する仕組み |
| ruleset | GitHubでbranchやtagに対するルールをまとめて管理する仕組み |
| required checks | マージ前に成功している必要があるCIなどのチェック |
| required reviews | マージ前に必要なレビュー承認 |
| PRレビュー | Pull Requestの変更内容を確認し、コメントや承認を行うこと |
| Secrets | GitHub Actionsなどで使う秘密情報を安全に保存する仕組み |
| 環境変数 | 実行環境ごとに設定値を渡す仕組み |
| rollback | 問題が起きたときに、以前の成功デプロイへ戻すこと |
| health check | アプリが正常に応答できるかを外部から確認する仕組み |
| deploy history | いつ、どのcommitが、どの結果でデプロイされたかの履歴 |
| staging | 本番前に確認する環境 |
| production | 実際の利用者が使う本番環境 |

## 5-2. branch protection

branch protectionは、大切なbranchを守るための仕組みです。

この教材では、`main` を本番反映につながる基本ブランチとして扱っています。

そのため、`main` に対して次のようなルールを設定します。

```text
mainへ直接pushしない
Pull Requestを必須にする
CI成功を必須にする
必要に応じてレビュー承認を必須にする
force pushや削除を制限する
```

branch protectionがない場合、次のようなことが起きやすくなります。

```text
テストしていない変更がmainへ入る
レビュー前の変更が本番へ出る
誤ってmainを直接変更する
force pushで履歴が分かりにくくなる
```

branch protectionは、開発者を縛るためではなく、うっかり事故を防ぐための安全柵です。

> 補足:
> GitHubでは、従来のbranch protection ruleに加えて、rulesetとしてルールを管理する方法もあります。
> この章では初学者向けにbranch protectionを中心に説明します。

## 5-3. required checks

required checksは、Pull Requestをマージする前に成功している必要があるチェックです。

この教材では、第9章で作ったGitHub ActionsのCIをrequired checksとして使います。

```text
Pull Request
  -> GitHub Actions CI
  -> E2Eテスト成功
  -> required checksが通る
  -> mainへマージできる
```

required checksを設定すると、CIが失敗しているPull Requestをmainへ入れにくくなります。

| 状態 | マージ判断 |
| --- | --- |
| CI成功 | マージ候補になる |
| CI失敗 | 修正して再実行する |
| CI実行中 | 結果を待つ |
| CI未実行 | workflow設定やbranch条件を確認する |

> 注意:
> required checksに設定するチェック名は、GitHub Actionsのjob名や表示名と対応します。
> 複数workflowで同じjob名を使うと、どのチェックを必須にしているか分かりにくくなるため、job名は重複しないようにします。

## 5-4. PRレビュー

PRレビューは、変更内容を他の人が確認する流れです。

レビューでは、ただ間違い探しをするのではなく、次の観点を確認します。

```text
目的に合った変更か
不要な変更が混ざっていないか
テストが追加されているか
画面や操作の流れが自然か
本番データや秘密情報を危険にさらしていないか
```

GitHubのPull Requestでは、変更ファイルを見ながらコメントできます。

レビューの結果には、主に次の種類があります。

| 種類 | 意味 |
| --- | --- |
| Comment | 意見や質問を残す |
| Approve | マージしてよいと承認する |
| Request changes | 修正が必要であると伝える |

個人学習では、他のレビュワーがいない場合もあります。

その場合でも、自分でPRのFiles changedを開き、次のようなセルフレビューをします。

```text
変更ファイルは想定どおりか
テストは追加または更新されているか
不要なデバッグ出力はないか
秘密情報を書いていないか
```

## 5-5. GitHub Secrets

GitHub Secretsは、GitHub Actionsなどのworkflowで使う秘密情報を保存する仕組みです。

たとえば、次のような値はGitHub Secretsで扱います。

```text
Deploy Hook URL
外部APIキー
本番DB接続情報
クラウドサービスのアクセストークン
```

Secretsは、workflowの中で明示的に参照したときだけ使われます。

例:

```yaml
env:
  DEPLOY_HOOK_URL: ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

この教材では、RenderのAuto Deployを中心に扱っているため、必ずGitHub Secretsを作る必要はありません。

ただし、Deploy Hookを使う構成や、外部サービスへ接続するworkflowを作る場合は、Secrets管理が重要になります。

> 注意:
> Secretsに入れる値を、コード、Markdown、スクリーンショット、GitHubのPR本文にそのまま書いてはいけません。

## 5-6. Render環境変数

Render環境変数は、Render上で動くWeb Serviceへ設定値を渡す仕組みです。

第10章では、`PYTHON_VERSION` を環境変数として設定しました。

第11章では、将来的に `DATABASE_URL` でDB接続先を切り替える考え方を学びました。

Render環境変数の例:

```text
PYTHON_VERSION
DATABASE_URL
SECRET_KEY
外部APIキー
```

GitHub SecretsとRender環境変数の違いは、値を使う場所です。

| 項目 | 主に使う場所 | 例 |
| --- | --- | --- |
| GitHub Secrets | GitHub Actionsのworkflow | Deploy Hook URL、CI用APIキー |
| Render環境変数 | Renderで動くアプリ | `DATABASE_URL`、`SECRET_KEY` |

どちらも秘密情報を扱えますが、置く場所を間違えると、値が必要な環境から読めなかったり、不要な場所へ権限を広げたりします。

## 5-7. デプロイ履歴

デプロイ履歴は、いつ、どのcommitが、どの結果でRenderへ反映されたかを確認するための情報です。

デプロイ履歴を見ると、次のようなことを追跡できます。

```text
どのcommitが本番に出たか
いつデプロイされたか
誰の変更が含まれているか
デプロイが成功したか失敗したか
buildや起動ログに問題がないか
```

問題が起きたときには、まず次の順番で確認します。

```text
GitHubのPR
  -> mainへ入ったcommit
  -> GitHub ActionsのCI結果
  -> RenderのDeploys
  -> Renderのログ
```

デプロイ履歴を追えると、「いつから壊れたか」「どの変更が関係していそうか」を考えやすくなります。

## 5-8. rollback

rollbackは、問題が起きたときに以前の成功デプロイへ戻すことです。

Renderでは、過去の成功デプロイへrollbackできる場合があります。

rollbackは、次のような場面で検討します。

```text
本番で重大な不具合が起きた
修正に時間がかかる
直前の安定版へ戻した方が安全
```

ただし、rollbackは万能ではありません。

特にDB変更がある場合は注意が必要です。

```text
アプリだけ戻してもDB構造は戻らない場合がある
新しいデータ形式で保存されたデータを古いアプリが読めない場合がある
Auto Deployが有効なままだと、次のpushで問題の変更が再度デプロイされる場合がある
```

Render Dashboardからrollbackする場合、Render側の安全策としてAuto Deployが無効になることがあります。
その場合は、問題の原因を修正したあとで、Auto Deployを再度有効にするか確認します。

rollbackは「とりあえず押せば安全」ではなく、影響範囲を見て判断する操作です。

## 5-9. health check

health checkは、アプリが正常に応答できるかを外部から確認する仕組みです。

RenderのWeb Serviceでは、health check endpointを設定できます。

health checkでは、Renderが指定したpathへHTTP `GET` リクエストを送り、アプリが正常に応答するかを確認します。

例:

```text
GET /health
  -> 200 OK
```

この教材の現在のToDoアプリには、専用の `/health` ルートはありません。

そのため、この章ではhealth checkの役割を確認するだけにします。

将来的に本格運用するなら、次のようなhealth checkを検討します。

```text
アプリが起動している
DBへ接続できる
必要な外部サービスへ接続できる
```

> 注意:
> health check endpointを追加するには、`app.py` にルートを追加する必要があります。
> この章ではアプリ本体を編集しないため、設定場所と考え方の確認にとどめます。

## 5-10. stagingとproduction

productionは、実際の利用者が使う本番環境です。

stagingは、本番へ出す前に動作確認するための環境です。

```text
staging
  -> チーム内で確認する
  -> 本番に近い設定で試す
  -> 失敗しても利用者影響を抑えやすい

production
  -> 利用者が使う
  -> データや秘密情報を慎重に扱う
  -> 変更はCIやレビューを通して反映する
```

この教材では、1つのRender Web Serviceをproduction相当として扱います。

stagingを追加する場合は、たとえば次のような構成にします。

```text
developブランチ
  -> staging用Render Web Service
  -> staging用DB

mainブランチ
  -> production用Render Web Service
  -> production用DB
```

stagingを作ると安心感は増えますが、環境が増える分、設定やDB管理も増えます。

まずは1つのproduction相当環境で、CI/CDの流れを正しく理解します。

# 6. ハンズオン

## ハンズオン13-1: mainブランチ保護を設定する

目的:
`main` ブランチへ直接変更が入らないように、branch protectionの設定を確認します。

実行場所:
GitHub画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
GitHubリポジトリがあり、Settings画面を開ける状態です。

手順:

1. GitHubで教材のリポジトリを開きます。
2. `Settings` を開きます。
3. `Branches` または `Rules` に関する設定を開きます。
4. branch protection ruleを追加する画面を開きます。
5. Branch name patternに次の値を入力します。

```text
main
```

6. `Require a pull request before merging` を有効にします。
7. 必要に応じて、`Require approvals` を有効にします。
8. force pushやbranch削除を許可しない設定になっていることを確認します。
9. 設定を保存します。

期待される結果:
`main` へ変更を入れるときにPull Requestを通す前提ができます。

作業後の状態:
`main` ブランチが、直接変更されにくい状態になります。

確認ポイント:

画面上の確認:
GitHubのbranch protection設定で、`main` に対するルールが表示されています。

裏側の確認:
`main` を守ることで、未確認の変更が本番反映につながる危険を減らせると説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-1 手順9のあと。
GitHubのbranch protection設定で、`main` に対するルールが作成されている状態。

> 注意:
> 設定変更には管理者権限が必要な場合があります。
> 個人学習で設定できない場合は、画面の場所と設定項目を確認するだけでも構いません。

## ハンズオン13-2: CI成功をマージ条件にする

目的:
GitHub ActionsのCIが成功していないPull Requestをマージしにくくします。

実行場所:
GitHub画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
`main` のbranch protection ruleを作成済みです。

手順:

1. GitHubのbranch protection rule編集画面を開きます。
2. `Require status checks to pass before merging` を有効にします。
3. `Require branches to be up to date before merging` を有効にするか確認します。
4. required checksとして、第9章で作成したGitHub ActionsのCIを選びます。
5. PR画面で表示されているチェック名を確認します。

表示例:

```text
e2e-tests
```

または:

```text
CI / e2e-tests
```

6. required checksの一覧に、対象のCIチェックが入っていることを確認します。
7. 設定を保存します。
8. Pull Request画面で、CIがマージ条件として表示されることを確認します。

期待される結果:
CIが失敗しているPull Requestをmainへマージしにくくなります。

作業後の状態:
`main` へ入れる変更には、GitHub ActionsのCI成功が必要になります。

確認ポイント:

画面上の確認:
Pull Request画面で、CIチェックがマージ条件として表示されます。

裏側の確認:
CI成功をマージ条件にすることで、壊れた変更がRenderへデプロイされる危険を減らせると説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-2 手順8のあと。
Pull Request画面で、required checkとしてCIが表示されている状態。

> 注意:
> required checksの候補は、過去にそのbranchで実行されたチェックが表示される場合があります。
> 候補が見つからない場合は、一度Pull RequestでCIを実行してから再度確認します。

## ハンズオン13-3: PRレビューの流れを確認する

目的:
Pull Requestの変更内容を確認し、レビューコメントや承認の流れを理解します。

実行場所:
GitHub画面

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
Pull Requestを作成できる状態です。

手順:

1. GitHubでPull Requestを開きます。
2. `Files changed` タブを開きます。
3. 変更ファイルを1つずつ確認します。
4. 確認済みのファイルがあれば、`Viewed` を使って確認済みにします。
5. 気になる行にコメントを残せることを確認します。
6. `Review changes` を開きます。
7. レビューの種類を確認します。

| 種類 | 使う場面 |
| --- | --- |
| Comment | 意見や質問だけを残す |
| Approve | 変更を承認する |
| Request changes | 修正が必要な点を伝える |

8. 個人学習の場合は、実際に承認せず、セルフレビュー観点を確認します。

セルフレビュー観点:

```text
変更目的がPR本文に書かれている
変更ファイルが想定どおり
E2Eテストが追加または更新されている
不要なデバッグ出力がない
秘密情報が含まれていない
```

期待される結果:
PRレビューで何を確認すべきか説明できます。

作業後の状態:
Pull Requestをマージする前に、変更内容とテスト結果を確認する習慣が整理されています。

確認ポイント:

画面上の確認:
GitHubのPull Requestで、Files changed、コメント、Review changesを確認できます。

裏側の確認:
レビューは単なる承認作業ではなく、変更の目的、影響範囲、テスト、秘密情報を確認する工程だと説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-3 手順7のあと。
GitHubのPull Request画面で、Review changesの選択肢が表示されている状態。

> 補足:
> Pull Requestの作成者は、自分自身のPRを承認できない場合があります。
> 個人学習では、承認操作そのものよりも、レビュー観点を持つことを重視します。

## ハンズオン13-4: Secretsと環境変数の違いを整理する

目的:
GitHub SecretsとRender環境変数の使い分けを理解します。

実行場所:
GitHub画面 / Render画面

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
GitHubリポジトリとRender Web Serviceを開ける状態です。

手順:

1. GitHubで教材リポジトリを開きます。
2. `Settings` を開きます。
3. `Secrets and variables` から `Actions` を開きます。
4. repository secretsを追加する場所を確認します。
5. Render DashboardでToDoアプリのWeb Serviceを開きます。
6. `Environment` を開きます。
7. Render環境変数を追加する場所を確認します。
8. GitHub SecretsとRender環境変数の使い分けを表で整理します。

| 値 | 置く場所 | 理由 |
| --- | --- | --- |
| GitHub Actionsから使うDeploy Hook URL | GitHub Secrets | workflow内で使うため |
| Render上の `DATABASE_URL` | Render環境変数 | アプリの実行時に使うため |
| Render上の `SECRET_KEY` | Render環境変数 | Flaskアプリの実行時に使うため |
| CIだけで使う外部APIキー | GitHub Secrets | テストや自動処理だけで使うため |

9. 実際の秘密情報を表示したままスクリーンショットを撮らないことを確認します。

期待される結果:
GitHub Actionsで使う秘密情報と、Renderで動くアプリが使う設定値を区別できます。

作業後の状態:
秘密情報をコードに書かず、必要な環境にだけ設定する考え方を説明できます。

確認ポイント:

画面上の確認:
GitHubのSecrets設定画面とRenderのEnvironment画面を確認できます。

裏側の確認:
秘密情報をGitにcommitしてはいけない理由を説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-4 手順4のあと。
GitHubのActions secrets設定画面で、secret追加場所が表示されている状態。秘密情報の値は写さない。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-4 手順7のあと。
RenderのEnvironment画面で、環境変数の追加場所が表示されている状態。秘密情報の値は写さない。

> 注意:
> 実際の `DATABASE_URL`、APIキー、パスワード、Deploy Hook URLは秘密情報です。
> 教材メモやPR本文に貼り付ける場合は、必ず伏せ字にします。

## ハンズオン13-5: Renderのデプロイ履歴を確認する

目的:
Renderのデプロイ履歴、rollback、health checkの確認場所を把握します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
Render Web Serviceがあり、少なくとも1回デプロイ済みです。

手順:

1. Render Dashboardを開きます。
2. ToDoアプリのWeb Serviceを開きます。
3. `Deploys` またはデプロイ履歴を確認できる画面を開きます。
4. 最新のデプロイを確認します。
5. commit、時刻、結果、ログを確認します。
6. 過去の成功デプロイにrollbackできる場所を確認します。
7. rollbackは確認だけにし、実行しません。
8. `Settings` でhealth check pathの設定場所を確認します。
9. 現在のアプリには専用の `/health` ルートがないため、health check endpointの追加は行わないことを確認します。

期待される結果:
Render上で、いつ、どの変更がデプロイされたかを追えるようになります。

作業後の状態:
デプロイ履歴、rollback、health checkの確認場所を説明できる状態です。

確認ポイント:

画面上の確認:
RenderのDeploys画面で、デプロイ履歴とログを確認できます。

裏側の確認:
本番で問題が起きたとき、GitHubのPR、CI結果、Renderのデプロイ履歴を対応づけて調査できると説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-5 手順5のあと。
RenderのDeploys画面で、commit、時刻、デプロイ結果が表示されている状態。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-5 手順8のあと。
RenderのSettings画面で、health check pathの設定場所が表示されている状態。

> 注意:
> rollbackは本番挙動に影響する操作です。
> 学習中は場所を確認するだけにし、実行する場合は講師やチームの指示に従います。

## ハンズオン13-6: 最終課題に取り組む

目的:
小さな機能追加を題材に、実装、テスト、PR、CI、CDまでを自分で一通り実施します。

実行場所:
ローカルPC / GitHub画面 / Render画面

変更するファイル:
選んだ機能によって異なります。例: `app.py`、`templates/`、`tests/e2e/`

手順の種類:
実行する手順

作業前の状態:
CI/CDの流れを説明でき、ToDoアプリのコードとE2Eテストを編集できる状態です。

手順:

1. 次の中から、機能追加を1つ選びます。

| 候補 | 難易度 | 内容 |
| --- | --- | --- |
| タスク名の編集 | 基礎 | 既存タスクのタイトルを変更できるようにする |
| カテゴリ名の編集 | 基礎 | 既存カテゴリ名を変更できるようにする |
| 未完了タスクのみ表示 | 基礎 | 一覧に絞り込みリンクを追加する |
| 完了済みタスクのみ表示 | 基礎 | 完了状態で一覧を絞り込む |
| コメント編集 | 実践 | コメント本文を変更できるようにする |

2. 作業ブランチを作成します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git switch -c chapter13-practice
```

3. どのファイルを変更するかを先にメモします。

例:

```text
機能: 未完了タスクのみ表示
変更するファイル:
  app.py
  templates/index.html
  tests/e2e/test_todo_flow.py
```

4. アプリ本体を変更します。
5. 画面で手動確認します。
6. 追加した機能を確認するE2Eテストを書きます。
7. ローカルでテストを実行します。

```bash
pytest tests/e2e
```

8. Gitの状態を確認します。

```bash
git status
```

9. 変更内容をcommitします。

```bash
git add app.py templates tests
git commit -m "Add final practice feature"
```

> 補足:
> 変更したファイルに合わせて `git add` の対象は調整します。
> 変更していないファイルを無理に指定する必要はありません。

10. 作業ブランチをGitHubへpushします。

```bash
git push -u origin chapter13-practice
```

> 補足:
> すでにupstreamが設定されているbranchでは、2回目以降は `git push` だけでpushできます。

11. GitHubでPull Requestを作成します。
12. Pull Request本文に、変更内容と確認結果を書きます。

PR本文の例:

```text
## 変更内容
- 未完了タスクのみ表示できるリンクを追加
- 未完了タスクだけが一覧に表示されるE2Eテストを追加

## 確認
- ローカルで pytest tests/e2e が成功
- GitHub ActionsのCIが成功
```

13. GitHub ActionsのCIが成功することを確認します。
14. required checksとレビュー条件が満たされていることを確認します。
15. `main` へマージします。
16. RenderのDeploys画面でデプロイが成功することを確認します。
17. 本番URLで、追加した機能が反映されていることを確認します。
18. 学習メモをまとめます。

学習メモの例:

```text
選んだ機能:

変更したファイル:

追加・変更したテスト:

ローカル確認結果:

GitHub Actionsの結果:

Renderデプロイ結果:

詰まった点:

次に改善したい点:
```

期待される結果:
小さな機能追加から本番URLでの確認まで、自分で一通り完了できます。

作業後の状態:
教材全体で学んだWebアプリ開発、テスト自動化、CI/CDの流れを実践できています。

確認ポイント:

画面上の確認:
GitHubのPull RequestでCIが成功し、Renderの本番URLで追加機能を確認できます。

裏側の確認:
実装、テスト、PR、CI、CD、デプロイ履歴を対応づけて説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-6 手順13のあと。
Pull Request画面でGitHub ActionsのCIが成功している状態。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-6 手順16のあと。
RenderのDeploys画面で最終課題のデプロイが成功している状態。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン13-6 手順17のあと。
Renderの本番URLで、追加した機能が動作している状態。

> 注意:
> 最終課題では、アプリ本体を変更します。
> 本番DBや秘密情報に関わる変更を含める場合は、必ず事前に影響範囲を確認します。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| branch protection | `main` を直接変更しない運用を説明できる |
| required checks | CI成功をマージ条件にする意味を説明できる |
| PRレビュー | Files changed、コメント、Approve、Request changesの役割を説明できる |
| GitHub Secrets | GitHub Actionsで使う秘密情報の置き場所を説明できる |
| Render環境変数 | Render上で動くアプリが使う設定値の置き場所を説明できる |
| デプロイ履歴 | Renderでcommit、時刻、結果、ログを確認できる |
| rollback | 以前の成功デプロイへ戻す考え方と注意点を説明できる |
| health check | アプリの正常性確認に使うことを説明できる |
| 最終課題 | 実装、テスト、PR、CI、CDまで完了できる |

画面上の確認:
GitHubでbranch protection、required checks、PRレビューの画面を確認できます。RenderでEnvironment、Deploys、health check設定場所を確認できます。

裏側の確認:
変更がmainへ入り、本番に反映されるまでの各段階で、何を確認すべきか説明できます。

Git状態の確認:
最終課題後は、ローカルの作業状態を確認します。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
```

確認:
最終課題のPull Request、CI成功、mainマージ、Renderデプロイ、本番URL確認まで説明できれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. branch protectionは何のために使いますか？
2. required checksを設定する理由は何ですか？
3. PRレビューでは、どのような観点を確認しますか？
4. GitHub SecretsとRender環境変数は何が違いますか？
5. 秘密情報をGitHubリポジトリにcommitしてはいけない理由は何ですか？
6. Renderのデプロイ履歴では何を確認しますか？
7. rollbackを使うときに注意すべきことは何ですか？
8. health checkは何のために使いますか？
9. stagingとproductionは何が違いますか？
10. 最終課題で、ローカルテスト、CI、CDをすべて確認する理由は何ですか？

# 9. 理解チェックの回答例

1. 大切なbranchへ未確認の変更が入らないようにするためです。Pull Request、CI、レビューなどの条件を設定できます。
2. CIが失敗している変更をmainへマージしにくくするためです。mainがRenderへのデプロイにつながる場合、本番へ壊れた変更を出す危険を減らせます。
3. 変更目的、影響範囲、不要な変更の有無、テストの有無、秘密情報の混入、画面操作の自然さなどを確認します。
4. GitHub Secretsは主にGitHub Actionsのworkflowで使う秘密情報です。Render環境変数はRender上で動くアプリが実行時に読む設定値です。
5. APIキー、DB接続URL、パスワードなどが漏れると、外部から不正利用されたり、本番データにアクセスされたりする危険があるためです。
6. どのcommitがいつデプロイされたか、成功したか失敗したか、buildや起動ログに問題がないかを確認します。
7. rollbackしてもDB構造やデータが元に戻るとは限りません。また、rollback後にAuto Deployが無効になっている場合は、原因修正後に再度有効化する必要があります。
8. アプリが正常に応答できるかを確認するためです。RenderではWeb Serviceの正常性確認やデプロイ時の判断に使われます。
9. stagingは本番前に確認する環境です。productionは実際の利用者が使う本番環境です。
10. ローカルでは開発者の環境で動くこと、CIではGitHub上のクリーンな環境で動くこと、CDでは本番環境へ正しく反映されることを確認するためです。

# 10. 次章への接続

この章で、教材シリーズは完了です。

この章でできるようになったこと:

- branch protectionの役割を説明できる
- required checksをマージ条件にする意味を説明できる
- PRレビューの目的を説明できる
- GitHub SecretsとRender環境変数の違いを説明できる
- Renderのデプロイ履歴を見て変更を追跡できる
- rollbackとhealth checkの考え方を説明できる
- 小さな機能追加からテスト、PR、CI、CDまでを一通り実施できる

ここまでで、Flask ToDoアプリを題材に、Webアプリ開発、テスト自動化、CI/CDの入口を一通り経験しました。

学習の最終到達点は、コマンドや画面操作を丸暗記することではありません。

```text
変更する
  -> テストする
  -> Pull Requestで確認する
  -> CIで自動確認する
  -> 安全にmainへ入れる
  -> Renderへデプロイする
  -> 本番URLとデプロイ履歴で確認する
```

この流れを、自分の言葉で説明し、自分の手で再現できることが、この教材のゴールです。
