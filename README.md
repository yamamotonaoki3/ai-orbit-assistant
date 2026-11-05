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

Node.js 22以上を推奨。開発・公開にはAPIキーやクラウドDBは不要です。

```bash
npm install
npm run dev
```

画面の案内に表示される `http://localhost:5173` を開きます（ポートが使用中の場合はViteの表示するURLを開いてください）。

```bash
npm run build
npm run preview
```

## リポジトリ

ソースコード: https://github.com/yamamotonaoki3/ai-orbit-assistant

本リポジトリは画面の動きを確認するためのMVPです。ルーティング先やログイン画面、実際の通知配信・2段階認証はまだ実装していません。

## GitHub Pagesで公開する

リポジトリの `Settings > Pages > Build and deployment > Source` を **GitHub Actions** に設定します。

`.github/workflows/deploy.yml` にViteのビルドとGitHub Pagesへのデプロイを用意しています。`main` へのpush後、`Actions` の処理が完了すれば `https://yamamotonaoki3.github.io/ai-orbit-assistant/` で表示できます。

このサンプルのVite設定は `base: './'` で、GitHub Pagesのサブパスにも対応しています。

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