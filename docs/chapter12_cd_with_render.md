# 表紙

| 項目 | 内容 |
| --- | --- |
| 教材タイトル | Flask ToDoアプリで学ぶ Webアプリ開発・テスト自動化・CI/CD |
| 章タイトル | 第12章 CDの実装 |
| 対象 | Webアプリケーション初学者 |
| 所要時間 | 90〜120分 |
| 難易度 | 実践 |
| この章で作るもの | CI成功後にRenderへ反映されるCDの流れ |
| この章で変更するファイル | なし。RenderとGitHub画面で設定と流れを確認する |

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

この章では、GitHub ActionsのCIとRenderのAuto Deployをつなげて、CIが成功した変更だけをRenderへ反映するCDの流れを作ります。

第9章では、Pull Requestやpushで自動テストを実行するCIを作りました。

第10章では、RenderへFlask ToDoアプリをデプロイしました。

第11章では、本番環境でDBを扱うときの考え方を整理しました。

この章では、ここまでの内容をつなげます。

```text
Pull Requestを作る
  -> GitHub ActionsでCIが動く
  -> CI成功を確認する
  -> mainへマージする
  -> mainへのpushをきっかけにCIが動く
  -> CI成功後にRenderがデプロイする
  -> 本番URLで変更を確認する
```

この章を終えると、次のことができるようになります。

- CIとCDの違いを説明できる
- PR時はテスト、本番反映はmainマージ後に行う理由を説明できる
- Render Auto Deployの役割を説明できる
- `After CI Checks Pass` の役割を説明できる
- Deploy Hookとの違いを説明できる
- staging / productionの考え方を説明できる
- Renderのデプロイ履歴でCDが動いたことを確認できる

# 2. この章の完成イメージ

この章の最後には、次のような流れを説明し、画面で確認できる状態を目指します。

```text
開発者
  -> 作業ブランチをpushする
  -> Pull Requestを作成する

GitHub
  -> Pull RequestでCIを実行する
  -> テスト結果をPRに表示する
  -> mainへマージする
  -> mainへのpushでCIを実行する

Render
  -> mainの変更を検知する
  -> CI成功を待つ
  -> CIが成功したら自動デプロイする
  -> デプロイ履歴に結果を残す
```

この章で確認する設定:

| 場所 | 確認する内容 |
| --- | --- |
| GitHub Actions | `pull_request` と `push` でCIが動く |
| GitHub Pull Request | CIチェックが成功してからマージする |
| Render Web Service | Auto Deployが有効になっている |
| Render Web Service | `After CI Checks Pass` が選ばれている |
| Render Deploys | mainマージ後のデプロイ履歴を確認できる |

スクリーンショット挿入予定:
撮影タイミング: ハンズオン12-3 手順5のあと。
RenderのAuto Deploy設定で、CI成功後にデプロイする設定が表示されている状態。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン12-5 手順5のあと。
RenderのDeploys画面で、mainマージ後のデプロイが成功している状態。

# 3. この章で使うファイル・コマンド

## 3-1. この章で使う主なファイル

| ファイル・ディレクトリ | 役割 |
| --- | --- |
| `.github/workflows/ci.yml` | CIの起動条件とテスト内容を確認する |
| `docs/` | 必要に応じて学習メモを置く |
| `app.py` | デプロイ対象のFlaskアプリ本体 |
| `requirements.txt` | Renderのbuildで使われる依存関係 |

> 注意:
> この章では、アプリ本体のファイルを編集しません。
> `ci.yml` も原則として確認のみです。第9章で `push` on `main` が設定されている前提で進めます。

## 3-2. この章で使う主なコマンド

この章の中心は、GitHub画面とRender画面での確認です。

ローカルPCでは、必要に応じてGit状態を確認します。

| コマンド | 目的 |
| --- | --- |
| `git status` | ローカルに意図しない変更がないか確認する |
| `git branch` | 現在のbranchを確認する |
| `git log --oneline -5` | 直近のcommitを確認する |

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
git branch
git log --oneline -5
```

> 補足:
> 実際にPRを作るかどうかは、学習環境や講師の指示に従います。
> この章の目的は、CDの流れを画面で追えるようになることです。

# 4. 前提確認

この章では、次の状態から始めます。

| 項目 | 確認内容 |
| --- | --- |
| 第9章の完了 | GitHub ActionsでCIが動く |
| 第10章の完了 | Render Web Serviceが作成済み |
| 第11章の理解 | 本番環境ではDBやデータを慎重に扱う必要がある |
| GitHub | Pull Requestを作成し、mainへマージできる |
| Render | Web ServiceのSettingsとDeploysを開ける |
| Branch | 教材では `main` を基本ブランチとして扱う |

この章の作業前の状態:

```text
GitHub
  -> CI workflowがある
  -> Pull RequestでCIを確認できる

Render
  -> Web Serviceがある
  -> GitHubリポジトリとmainブランチが連携されている

CD設定
  -> Auto Deployの状態をまだ整理できていない
  -> CI成功後にデプロイする流れをまだ確認していない
```

この章の作業後の状態:

```text
GitHub
  -> PRでCI成功を確認できる
  -> mainマージ後にもCIが動くことを説明できる

Render
  -> Auto Deployの設定を確認できる
  -> After CI Checks Passの意味を説明できる
  -> Deploys画面でデプロイ履歴を確認できる
```

> 補足:
> 教材では基本ブランチを `main` として説明します。
> `develop` を使う運用の場合は、`main` を `develop` に読み替えます。

# 5. 概念説明

## 5-1. この章で出てくる用語

| 用語 | 短い説明 |
| --- | --- |
| CI | 変更ごとに自動でテストや確認を行う仕組み |
| CD | テスト済みの変更を自動または半自動で本番環境へ反映する仕組み |
| Auto Deploy | GitHubなどの変更をきっかけにRenderが自動でデプロイする設定 |
| `After CI Checks Pass` | GitHubのCIチェック成功後にRenderがデプロイする設定 |
| deploy | アプリを実行環境に反映し、利用できる状態にすること |
| Deploys | Renderで過去のデプロイ履歴を確認する画面 |
| Deploy Hook | 特定のURLを呼び出してRenderのデプロイを開始する仕組み |
| staging | 本番前に動作確認するための環境 |
| production | 実際の利用者が使う本番環境 |

## 5-2. CIとCDの違い

CIは、変更が壊れていないかを確認する仕組みです。

CDは、確認済みの変更を実行環境へ反映する仕組みです。

| 項目 | CI | CD |
| --- | --- | --- |
| 主な目的 | 変更を検証する | 変更を反映する |
| 代表例 | pytest、E2Eテスト、lint | Renderへのデプロイ |
| 実行タイミング | PR作成、push | mainマージ後、CI成功後 |
| 成功の意味 | 変更が期待通り動きそう | 本番環境に反映された |

この教材では、次のように役割を分けます。

```text
Pull Request
  -> CIでテストする
  -> まだ本番には出さない

mainへのマージ
  -> mainのCIを実行する
  -> CI成功後にRenderへデプロイする
```

## 5-3. PR時に本番反映しない理由

Pull Requestは、変更を確認する段階です。

まだレビューやテストの途中であり、本番へ出してよいとは限りません。

もしPRを作るたびに本番へデプロイされると、次のような危険があります。

```text
未完成の変更が本番に出る
失敗するテストがある状態で本番に出る
レビュー前のコードが利用者に見える
複数PRの変更が本番環境で混ざる
```

そのため、この教材では次の流れにします。

```text
PR
  -> CIで確認する
  -> レビューする
  -> mainへマージする
  -> mainのCI成功後にデプロイする
```

## 5-4. Render Auto Deploy

Render Auto Deployは、連携したGitHubリポジトリのbranchに変更が入ったとき、Renderが自動でデプロイを開始する設定です。

第10章で作成したRender Web Serviceは、GitHubリポジトリとbranchに紐づいています。

```text
Render Web Service
  -> GitHubリポジトリ
  -> mainブランチ
```

Auto Deployを使うと、mainへ変更が入ったときにRenderがデプロイできます。

ただし、CIと組み合わせる場合は「mainへ変更が入ったらすぐデプロイする」のではなく、「CIが成功してからデプロイする」形が安全です。

## 5-5. `After CI Checks Pass`

`After CI Checks Pass` は、RenderがGitHubのCIチェック結果を見て、チェックが成功した後にデプロイするための設定です。

この教材の流れでは、次のように使います。

```text
mainへcommitが入る
  -> GitHub Actionsがpush eventでCIを実行する
  -> CIが成功する
  -> Renderがデプロイする
```

ここで重要なのは、第9章のCI workflowが `push` on `main` でも動くことです。

```yaml
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
```

PRでCIが成功していても、mainへマージしたcommitに対してCIが動かない設定だと、Renderが「main上のCI成功」を確認できない場合があります。

そのため、CDと組み合わせるCIでは、PR用の `pull_request` だけでなく、デプロイ対象branchへの `push` も設定します。

## 5-6. Deploy Hookとの違い

RenderにはDeploy Hookという仕組みもあります。

Deploy Hookは、Renderが発行する特別なURLを呼び出すことで、デプロイを開始する仕組みです。

```text
GitHub Actions
  -> テスト成功
  -> Deploy Hook URLを呼び出す
  -> Renderがデプロイする
```

Deploy Hookを使う場合、GitHub Actions側にDeploy Hook URLをsecretとして保存し、workflowから呼び出す構成になります。

この教材では、初学者が流れを追いやすいように、RenderのAuto Deployと `After CI Checks Pass` を中心に扱います。

| 方法 | 特徴 |
| --- | --- |
| Auto Deploy | Render側の設定でbranch変更を検知する |
| `After CI Checks Pass` | GitHubのCI成功後にRenderがデプロイする |
| Deploy Hook | CIなど外部処理からURLを呼び出してデプロイする |

Deploy Hookは便利ですが、secret管理やworkflowの追加が必要になるため、この章では比較として理解するだけにします。

## 5-7. stagingとproduction

実務では、本番環境へ出す前にstaging環境で確認することがあります。

```text
staging
  -> 本番前に確認する環境
  -> 開発者やチームが確認する

production
  -> 実際の利用者が使う環境
  -> 変更は慎重に反映する
```

この教材では、1つのRender Web Serviceをproduction相当として扱います。

学習段階では、まず次の流れを理解することを優先します。

```text
PRでCI
  -> mainマージ
  -> CI成功
  -> production相当のRenderへデプロイ
```

staging環境を別に作る場合は、Render Web Serviceをもう1つ作り、別branchや別DBに紐づけます。

ただし、本教材ではstaging環境の本格運用までは扱いません。

# 6. ハンズオン

## ハンズオン12-1: CI/CDの流れを図にする

目的:
PRからmainマージ、Renderデプロイまでの流れを図で整理します。

実行場所:
ローカルPC

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
GitHub ActionsのCIとRender Web Serviceが作成済みです。

手順:

1. PR時の流れを確認します。

```text
作業ブランチ
  -> Pull Request
  -> GitHub Actions CI
  -> テスト成功
  -> レビュー
```

2. mainマージ後の流れを確認します。

```text
mainへマージ
  -> mainへpushされた状態になる
  -> GitHub Actions CI
  -> CI成功
  -> Render Auto Deploy
  -> 本番URLに反映
```

3. PR時とmainマージ後の違いを表にします。

| タイミング | CI | Renderデプロイ |
| --- | --- | --- |
| Pull Request作成時 | 実行する | 原則しない |
| Pull Request更新時 | 実行する | 原則しない |
| mainマージ後 | 実行する | CI成功後に実行する |

4. なぜPR時に本番反映しないのかを確認します。

期待される結果:
CIとCDが別の役割を持つことを説明できます。

作業後の状態:
PRからRenderデプロイまでの流れが整理されています。

確認ポイント:

画面上の確認:
教材内の図を見ながら、PR時とmainマージ後の違いを説明できます。

裏側の確認:
CIは検証、CDは反映であることを説明できます。

## ハンズオン12-2: RenderのAuto Deploy設定を確認する

目的:
Render Web ServiceでAuto Deployの設定場所と現在の状態を確認します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
RenderにToDoアプリ用のWeb Serviceがあります。

手順:

1. Render Dashboardを開きます。
2. 第10章で作成したToDoアプリのWeb Serviceを開きます。
3. `Settings` 画面を開きます。
4. GitHubリポジトリとbranchの設定を確認します。

確認例:

```text
Repository: todo-app
Branch: main
```

5. Auto Deployに関する設定を探します。
6. 現在のAuto Deploy設定を確認します。

確認する項目:

| 項目 | 確認する内容 |
| --- | --- |
| Auto Deploy | 有効か無効か |
| Deploy対象branch | `main` または教材で使うbranchか |
| CIとの連携 | CI成功後にデプロイする設定が選べるか |

期待される結果:
RenderのAuto Deploy設定場所と現在の状態を確認できます。

作業後の状態:
Renderがどのbranchの変更を見てデプロイするか説明できます。

確認ポイント:

画面上の確認:
Render Web ServiceのSettingsで、Auto Deploy関連の設定を確認できます。

裏側の確認:
Renderは連携したbranchの変更をきっかけにデプロイできることを説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン12-2 手順5のあと。
Render Web ServiceのSettings画面で、Auto Deploy設定の場所が表示されている状態。

> 注意:
> Renderの画面表示や設定名は変更されることがあります。
> `Auto Deploy`、`Auto-Deploy`、`Deploy` など似た表記がある場合は、branch変更をきっかけにデプロイする設定を探します。

## ハンズオン12-3: `After CI Checks Pass` を設定する

目的:
RenderがmainのCI成功後にデプロイするように設定します。

実行場所:
Render画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
Render Web ServiceのAuto Deploy設定場所を確認済みです。

手順:

1. Render Web ServiceのSettings画面を開きます。
2. Auto Deployの設定を編集します。
3. 選択肢の中から、CI成功後にデプロイする設定を選びます。

表示例:

```text
After CI Checks Pass
```

4. 保存ボタンを押します。
5. 設定後の状態を確認します。
6. 第9章のCI workflowが、`push` on `main` でも動く設定になっていることを確認します。

確認する内容:

```yaml
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
```

期待される結果:
RenderがmainのCIチェック成功後にデプロイする設定になります。

作業後の状態:
Auto Deployが、CI成功後に実行される設定になっています。

確認ポイント:

画面上の確認:
RenderのAuto Deploy設定で、CI成功後にデプロイする設定が選ばれています。

裏側の確認:
`push` on `main` のCIがないと、mainマージ後のチェック成功をRenderが確認できない場合があると説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン12-3 手順5のあと。
RenderのAuto Deploy設定で、`After CI Checks Pass` が選択されている状態。

> 注意:
> `After CI Checks Pass` は、GitHub上のチェック結果と連携してデプロイを待つ設定です。
> PR上のCI成功だけでなく、デプロイ対象branchに入ったcommitのCIが成功することを意識します。

## ハンズオン12-4: PRからmainマージまでの流れを確認する

目的:
Pull RequestでCIが成功した変更をmainへマージし、CDの起点を作ります。

実行場所:
GitHub画面

変更するファイル:
なし

手順の種類:
実行する手順

作業前の状態:
RenderのAuto Deployが、CI成功後にデプロイする設定になっています。

手順:

1. GitHubで作業ブランチのPull Requestを開きます。
2. Checks欄でGitHub ActionsのCI結果を確認します。
3. CIが成功していることを確認します。
4. 必要に応じて変更内容を確認します。
5. `Merge pull request` を押します。
6. `Confirm merge` を押します。
7. Pull Requestがmerged状態になったことを確認します。
8. GitHub ActionsのActionsタブを開きます。
9. mainへのpushをきっかけにCIが実行されていることを確認します。
10. main上のCIが成功するまで待ちます。

期待される結果:
PRがmainへマージされ、mainへのpush eventでCIが実行されます。

作業後の状態:
Renderがデプロイを開始できる条件がそろっています。

確認ポイント:

画面上の確認:
Pull Requestがmergedになり、GitHub ActionsでmainのCI実行を確認できます。

裏側の確認:
PRのCI成功と、mainマージ後のCI成功は別のタイミングで確認する必要があると説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン12-4 手順10のあと。
GitHub Actions画面で、mainへのpushに対するCIが成功している状態。

> 注意:
> 実際のチーム開発では、レビュー、branch protection、承認ルールを設定してからマージします。
> これらの実務的な運用は第13章で扱います。

## ハンズオン12-5: Renderのデプロイ履歴を確認する

目的:
mainのCI成功後に、Renderで自動デプロイが実行されたことを確認します。

実行場所:
Render画面 / ブラウザ

変更するファイル:
なし

手順の種類:
確認のみ

作業前の状態:
Pull Requestをmainへマージし、main上のCIが成功しています。

手順:

1. Render Dashboardを開きます。
2. ToDoアプリのWeb Serviceを開きます。
3. `Deploys` 画面を開きます。
4. mainマージ後のcommitに対応するデプロイがあるか確認します。
5. デプロイの状態が成功していることを確認します。

確認例:

```text
Live
Deploy succeeded
```

6. デプロイ詳細を開きます。
7. build commandとstart commandが実行されていることを確認します。
8. 本番URLを開きます。
9. 変更が反映されていることを確認します。

期待される結果:
mainのCI成功後にRenderのデプロイが実行され、本番URLへ反映されています。

作業後の状態:
CIからCDまでの一連の流れを画面で説明できます。

確認ポイント:

画面上の確認:
RenderのDeploys画面に、mainマージ後のデプロイ履歴が表示されます。

裏側の確認:
GitHubのmain CI成功とRenderのデプロイ履歴を対応づけて説明できます。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン12-5 手順5のあと。
RenderのDeploys画面で、デプロイ成功の履歴が表示されている状態。

スクリーンショット挿入予定:
撮影タイミング: ハンズオン12-5 手順9のあと。
Renderの本番URLで、mainへマージした変更が反映されている状態。

> 補足:
> Renderのデプロイ開始には少し時間がかかることがあります。
> GitHub ActionsのCI成功直後に表示されない場合は、Deploys画面を更新して状態を確認します。

# 7. 動作確認

この章の最後に、次の項目を確認します。

| 確認項目 | 成功の目安 |
| --- | --- |
| CI/CDの流れ | PR、CI、mainマージ、CI、Renderデプロイの順番を説明できる |
| PR時のCI | Pull RequestでGitHub ActionsのCIが成功する |
| mainのCI | mainへのpushでGitHub ActionsのCIが成功する |
| Auto Deploy | RenderのAuto Deploy設定を確認できる |
| `After CI Checks Pass` | CI成功後にデプロイする設定を説明できる |
| Deploys画面 | Renderのデプロイ履歴を確認できる |
| 本番URL | Renderの本番URLで変更を確認できる |
| Deploy Hook | Deploy Hookは別方式であると説明できる |
| staging / production | 本番前確認環境と本番環境の違いを説明できる |

画面上の確認:
GitHub ActionsでmainのCI成功を確認し、RenderのDeploys画面でデプロイ成功を確認できます。

裏側の確認:
Renderがmainの変更を検知し、CI成功後にデプロイしたことを説明できます。

Git状態の確認:
この章ではローカルファイルを変更していないため、原則としてGitに新しい差分は増えません。

実行場所: ローカルPCのターミナル、プロジェクトディレクトリ

```bash
git status
```

確認:
PRからmainマージ、mainのCI成功、Renderデプロイ、本番URL確認まで説明できれば、この章のゴールは達成です。

# 8. 理解チェック

次の質問に、自分の言葉で答えてみましょう。

1. CIとCDの違いは何ですか？
2. Pull Request作成時に本番へデプロイしない理由は何ですか？
3. mainへマージした後にCIを実行する理由は何ですか？
4. Render Auto Deployは何をきっかけにデプロイしますか？
5. `After CI Checks Pass` は何のための設定ですか？
6. 第9章のCI workflowで `push` on `main` が必要になるのはなぜですか？
7. Deploy HookはAuto Deployと何が違いますか？
8. RenderのDeploys画面では何を確認しますか？
9. stagingとproductionは何が違いますか？

# 9. 理解チェックの回答例

1. CIは変更を自動で検証する仕組みです。CDは検証済みの変更を実行環境へ反映する仕組みです。
2. PRはまだ確認中の変更だからです。未完成、テスト失敗、レビュー前の変更を本番へ出さないために、PR時は原則として本番反映しません。
3. mainに入ったcommitが、本番へ出す対象だからです。PR上で成功していても、mainへ入った状態でCIを確認すると、Renderがデプロイ前にチェック成功を確認しやすくなります。
4. 連携したGitHubリポジトリの対象branchに変更が入ったことをきっかけにデプロイします。
5. GitHubのCIチェックが成功した後にRenderがデプロイするための設定です。テストが失敗した変更を本番へ出しにくくできます。
6. Renderはデプロイ対象branchに入ったcommitのチェック成功を確認します。mainへのpushでCIが動かないと、main上の変更に対するCI成功を確認できない場合があります。
7. Auto DeployはRenderがbranch変更を検知してデプロイします。Deploy Hookは、特定のURLを外部から呼び出してデプロイを開始します。
8. どのcommitがいつデプロイされたか、デプロイが成功したか、buildや起動ログに問題がないかを確認します。
9. stagingは本番前に確認する環境です。productionは実際の利用者が使う本番環境です。

# 10. 次章への接続

この章では、GitHub ActionsのCIとRenderのAuto Deployをつなげ、CI成功後にRenderへ反映されるCDの流れを確認しました。

この章でできるようになったこと:

- CIとCDの違いを説明できる
- PR時はテスト、本番反映はmainマージ後に行う理由を説明できる
- Render Auto Deployの設定を確認できる
- `After CI Checks Pass` の役割を説明できる
- Deploy Hookとの違いを説明できる
- Renderのデプロイ履歴でCDが動いたことを確認できる

これで、変更、テスト、PR、mainマージ、デプロイまでの基本的な流れがつながりました。

第13章では、この流れを実務に近い形で安全に運用するための考え方を学びます。branch protection、PRレビュー、Secrets管理、デプロイ履歴の見方を整理し、最後に小さな変更を題材にした総合演習を行います。
