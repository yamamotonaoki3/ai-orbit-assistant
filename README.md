# AI Orbit Assistant — 3Dゲーム風Web UI試作品

React + TypeScript + Vite + React Three Fiber を使った **無料で実行できるUIデモ** です。

## できること

- 左側：AIキャラクター（2Dイラスト）＋ WebGLの発光リング＋3Dパース付き回転メニュー
- PC：メニュークリック／横ドラッグで選択
- スマートフォン：左右スワイプで選択
- 自動回転と一時停止、左右矢印でのメニュー切り替え
- 右側：プロフィール・通知・タスク・セキュリティ・分析の動作確認用画面
- 設定変更に応じてAIの吹き出しとおすすめToDoを自動更新（TypeScriptのルールベース）
- 設定はブラウザ内のlocalStorageに保存
- 外部AI APIなし・DBなし・外部の有料ライブラリなし

## 現時点の制限

デザイン画像と完全に同一ではありません。キャラクターは生成済みコンセプト画像から切り出した**2D立ち絵**で、3Dモデルのアニメーションは未対応です。3DパートはThree.js / React Three Fiber製のエフェクトと、CSS 3Dの回転カードです。

通知ON/OFF、2段階認証、タスク登録は**デモ用の画面状態**です。実際の通知・ログイン・データベース登録は行いません。

## ローカルで動かす

**Node.js 24.22.2以上（24系LTS）** を使用してください。Node.jsはセキュリティ更新に合わせて最新版の24.xへ更新します。クラウドDBやAPIキーは不要です。

```bash
npm ci
npm run dev
```

ローカル環境で表示される `http://127.0.0.1:5173` を開きます（ポートが使用中の場合はViteの表示するURLを開いてください）。

```bash
npm run build
npm run preview
```

## リポジトリ

ソースコード: https://github.com/yamamotonaoki3/ai-orbit-assistant

本リポジトリは画面の動きを確認するためのMVPです。ルーティング先やログイン画面、実際の通知配信・2段階認証はまだ実装していません。

## 公開状態とセキュリティ（2026-11-05）

**この試作品のGitHub Pages公開は停止しています。** 自動デプロイ用の `.github/workflows/deploy.yml` も削除済みです。コード変更やセキュリティチェックによってWebサイトが再公開されないようにしています。再公開する場合は、明示的な承認のもと、公開設定とデプロイ構成を改めて見直してください。

- `.github/workflows/security.yml`: `main` へのpush・プルリクエスト・毎週月曜日の定期検査で、依存パッケージ監査とビルドを実行（**デプロイしない**）。
- `.github/dependabot.yml`: npmパッケージとGitHub Actionsの更新確認を毎週実行。
- GitHub Actionsの権限は `contents: read` を指定し、外部ActionsをコミットSHAで参照。
- デモの「2段階認証」は本物の認証ではありません。名前・自己紹介はブラウザの `localStorage` に保存されるため、機密情報を入力しないでください。
- `package-lock.json` をバージョン固定ファイルとしてコミット済み。CI・ローカルともに `npm ci` で再現性のあるインストールを行います。
- Vite開発サーバーとプレビューは`127.0.0.1`にのみバインドし、LANからの意図しないアクセスを防ぎます。
- 本番ビルド時のみ、外部スクリプト・外部API等を制限するCSP（HTML meta）を追加します。GitHub Pagesでは`frame-ancestors`などHTTPレスポンスヘッダーが必要な制御は適用できず、完全なヘッダー保護を提供するものではありません。
- GitHub Actionsには最小権限（`contents: read`）とコミットSHA固定を適用。認証情報はcheckout後に残しません。
- Node.jsの次回セキュリティ更新が2026-11-11頃に予告されています。新しい24.xの修正版が公開されたらローカル環境を更新してください。CIは24系の最新パッチを使用します。

ローカルでの監査とビルドは次のコマンドで実行できます。

```bash
npm ci
npm audit --audit-level=moderate
npm run build
```

## アーキテクチャ

```
src/
  App.tsx             ... 画面、回転メニュー、入力処理、切替
  OrbitalAura.tsx     ... React Three Fiberによる3Dエフェクト
  data.ts             ... 型、メニュー、推奨ルール
  styles.css          ... ゲーム風のレイアウトとレスポンシブ
  assets/assistant.webp ... AIキャラのイラスト（試作）
```

## 今後の開発候補

- AIキャラクターをBlender等で制作した `.glb` 3Dモデルへ差し替え
- スクロール位置とメニュー選択の連動、タッチ操作の微調整
- アクセシビリティ（ロービジョン・動きの軽減）
- Hono API、認証、PostgreSQLで実データを保存
- 必要時のみAI推論APIを呼ぶガイド機能

## 料金・ライセンス

本プロジェクトの主要な依存ライブラリ（React、Three.js、React Three Fiber、Vite等）は無料のオープンソースです。GitHub PagesはGitHub Freeの公開リポジトリなら無料で利用できます。依存ライブラリやホスティングの利用条件は、それぞれの公式サイトを確認してください。

画像アセット `src/assets/assistant.webp` は本会話で生成したコンセプト画像をもとにした試作用の素材です。