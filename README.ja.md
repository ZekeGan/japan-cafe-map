# ☕ Japan Cafe Map

[English](README.md) | [繁體中文](README.zh-TW.md) | **日本語**

<p align="center">
  <img src="./public/preview1.png" height="500" alt="地図画面" />
  <img src="./public/preview2.png" height="500" alt="店舗詳細" />
</p>

> 日本全国の**作業しやすいカフェ**を探すための、みんなで育てる地図。Google Maps のデータに、ユーザーが報告した設備情報を重ねて表示します。

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Google Maps API](https://img.shields.io/badge/Google%20Maps%20API-4285F4?style=flat&logo=googlemaps&logoColor=white)

[🌐 デモ](https://japan-cafe-map.vercel.app/)

---

## 概要

Google Maps ではカフェの場所は分かっても、電源や Wi-Fi があるか、3 時間作業できる静かさかは分かりません。Japan Cafe Map は Google Maps のカフェに**ユーザーが投稿した情報**を重ね、リモートワーカーやエンジニアが出かける前に作業向きの店を選べるようにします。

多くの地図アプリは料理や人気を重視しており、作業のしやすさは考慮されていません。日本在住のリモートエンジニアである作者が、安定した Wi-Fi と電源があり快適に作業できるカフェを探すのに苦労したことから、このプロジェクトを作りました。

---

## 機能

- 🗺️ **Google Maps 連携**：Places API で近くのカフェ（名前・住所・位置）を検索
- 📝 **みんなの報告**：ログインしたユーザーが作業に関わる情報を報告
  - 🔌 電源
  - 📶 Wi-Fi
  - 🔇 騒音
  - 🪑 座席
  - ⏱️ 時間制限、最低注文、予約、喫煙ルール
- 🔍 **絞り込み**：報告された設備でカフェを絞り込み（複数条件は「いずれかに一致」）
- ❤️ **お気に入り**：気に入った店を自分のリストに保存
- 📍 **現在地**：地図を現在地に移動し、周辺を検索
- 🌏 **3 言語対応**：English、日本語、繁體中文

---

## ロードマップ

- コミュニティコメント
- AI によるカフェのおすすめ

---

## 技術スタック

| 層             | 技術                                     |
| -------------- | ---------------------------------------- |
| フロントエンド | Next.js（App Router）、React、TypeScript |
| スタイル       | Tailwind CSS、shadcn/ui（Radix）         |
| 地図           | Google Maps JavaScript API、Places API   |
| バックエンド   | Next.js Route Handlers                   |
| データベース   | MongoDB + Prisma                         |
| メール         | Resend（パスワード再設定）               |
| デプロイ       | Vercel                                   |

---

## アーキテクチャの要点

- **ブラウザ側の Places 検索**：Maps JavaScript API で近くの店を探し、Next.js API が Google Place ID で upsert します。既存の店舗データは Google から自動更新されません。
- **認証付きの投稿**：報告・お気に入り API はサーバーで検証したセッションの ID を使い、クライアントから送られた userId は信用しません。送信に失敗してもフォームの入力内容は残ります。
- **コミュニティ集計**：真偽値は厳密な過半数、カテゴリは最頻値、喫煙の種類は出現頻度のしきい値で決めます。「不明」は false と区別され、同じ店への報告は 1 人 1 回です。
- **リクエスト時のデータベース確認**：ページは動的に描画されるため、ビルド中の DB 停止が静的な画面として固定されることはありません。復旧後は再読み込みで再試行できます。

---

## はじめに

### 必要なもの

- Node.js 24 推奨（Next.js 16 は 20.9 以上が必要）
- pnpm（バージョンは `package.json` で固定）
- **Maps JavaScript API** と **Places API** を有効にした [Google Cloud](https://console.cloud.google.com/) プロジェクト
- トランザクション対応の MongoDB（レプリカセットまたは MongoDB Atlas）
- パスワード再設定メール用の Resend アカウント

### インストール

```bash
git clone https://github.com/ZekeGan/japan-cafe-map.git
cd japan-cafe-map
pnpm install --frozen-lockfile
```

### 環境変数

プロジェクトのルートに `.env` を作成します（Git の管理対象外です。認証情報は絶対にコミットしないでください）。

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_maps_key
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_random_server_secret
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- ブラウザ用の Maps キーは、Google Cloud でウェブサイトと API を制限してください。
- `DATABASE_URL`、`JWT_SECRET`、`RESEND_API_KEY` はサーバー側のみで使用します。
- `NEXT_PUBLIC_APP_URL` はパスワード再設定リンクに使われます。実際のオリジンを設定し、変更後はサーバーを再起動してください。
- 送信元は `onboarding@resend.dev`（`src/lib/mail.ts`）で、Resend アカウントのメールアドレスにしか送れません。他の宛先に送るには、Resend でドメインを認証し送信元を変更してください。

初回実行前に Prisma クライアントを生成します（データベースのスキーマやインデックスは変更されません）。

```bash
pnpm exec prisma generate
```

### ローカルで実行

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

### コマンド

| コマンド                 | 用途                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `pnpm dev`               | 開発サーバー                                                                |
| `pnpm check`             | lint、型チェック、テスト（DB・メール送信は不要）                            |
| `pnpm build`             | Prisma クライアント生成とビルド。フォント取得にネットワークが必要な場合あり |
| `pnpm start`             | 本番ビルドを起動                                                            |
| `pnpm format <ファイル>` | 指定ファイルを Prettier で整形                                              |

本番環境では、ホスティング先で環境変数を設定してください。

---

## メンテナンス用ドキュメント

必要に応じて保守する小さな個人の展示作品です。以下のドキュメントは繁体字中国語で書かれています。
[保守ガイド](docs/maintenance.md) · [アーキテクチャ](docs/architecture.md) · [現在の課題](docs/project-status.md) · [変更履歴](CHANGELOG.md)

---

## 作者

**Zeke Gan** — [GitHub](https://github.com/ZekeGan)
