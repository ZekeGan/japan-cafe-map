# ☕ Japan Cafe Map

[English](README.md) | **繁體中文** | [日本語](README.ja.md)

<p align="center">
  <img src="./public/preview1.png" height="500" alt="地圖畫面" />
  <img src="./public/preview2.png" height="500" alt="店家詳情" />
</p>

> 尋找日本**適合工作的咖啡店**的社群地圖：結合 Google Maps 資料與使用者回報的設施資訊。

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Google Maps API](https://img.shields.io/badge/Google%20Maps%20API-4285F4?style=flat&logo=googlemaps&logoColor=white)

[🌐 線上展示](https://japan-cafe-map.vercel.app/)

---

## 簡介

Google Maps 能告訴你咖啡店在哪，卻不會說有沒有插座、Wi-Fi，或噪音是否能讓人專心工作三小時。Japan Cafe Map 從 Google Maps 取得店家，再疊加**使用者回報的資訊**，讓遠端工作者與工程師出門前就能挑到合適的店。

多數地圖應用以美食與人氣為主，不是為了工作效率。作者是住在日本的遠端工程師，常找不到 Wi-Fi 穩定、有插座、環境舒適的咖啡店，因此做了這個專案。

---

## 功能

- 🗺️ **Google Maps 整合**：以 Places API 搜尋附近咖啡店（名稱、地址、位置）
- 📝 **社群回報**：登入使用者可回報與工作相關的資訊：
  - 🔌 插座
  - 📶 Wi-Fi
  - 🔇 噪音
  - 🪑 座位
  - ⏱️ 限時、低消、預約、吸菸規定
- 🔍 **篩選與探索**：依回報的設施篩選（多個條件為「符合任一」）
- ❤️ **收藏**：把店家存進自己的清單
- 📍 **定位**：將地圖移到目前位置並搜尋周邊
- 🌏 **三種語言**：English、日本語、繁體中文

---

## 路線圖

- 社群留言
- AI 咖啡店推薦

---

## 技術棧

| 層級   | 技術                                     |
| ------ | ---------------------------------------- |
| 前端   | Next.js（App Router）、React、TypeScript |
| 樣式   | Tailwind CSS、shadcn/ui（Radix）         |
| 地圖   | Google Maps JavaScript API、Places API   |
| 後端   | Next.js Route Handlers                   |
| 資料庫 | MongoDB + Prisma                         |
| 郵件   | Resend（密碼重設）                       |
| 部署   | Vercel                                   |

---

## 架構重點

- **瀏覽器端 Places 搜尋**：由 Maps JavaScript API 找附近店家，再由 Next.js API 依 Google Place ID upsert。既有店家資料不會自動從 Google 更新。
- **需登入的貢獻**：回報與收藏 API 以伺服器驗證的登入身分為準，不信任客戶端傳來的 userId；送出失敗會保留表單內容。
- **社群聚合**：布林欄位採嚴格過半，類別採眾數，菸品類型採出現頻率門檻。「未知」與 false 分開處理；每位使用者對每間店只能回報一次。
- **請求時檢查資料庫**：頁面為動態渲染，建置期間資料庫離線不會被固定成靜態畫面；資料庫恢復後重新整理即可。

---

## 快速開始

### 前置需求

- 建議 Node.js 24（Next.js 16 至少需要 20.9）
- pnpm（版本固定於 `package.json`）
- 已啟用 **Maps JavaScript API** 與 **Places API** 的 [Google Cloud](https://console.cloud.google.com/) 專案
- 支援交易的 MongoDB（replica set 或 MongoDB Atlas）
- 用於密碼重設郵件的 Resend 帳號

### 安裝

```bash
git clone https://github.com/ZekeGan/japan-cafe-map.git
cd japan-cafe-map
pnpm install --frozen-lockfile
```

### 環境變數

在專案根目錄建立 `.env`（已被 Git 忽略，請勿提交金鑰）：

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_maps_key
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_random_server_secret
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- 在 Google Cloud 為瀏覽器 Maps 金鑰限制網站與 API。
- `DATABASE_URL`、`JWT_SECRET`、`RESEND_API_KEY` 只能放在伺服器端。
- `NEXT_PUBLIC_APP_URL` 會用於密碼重設連結，請設為實際網址；修改設定後需重啟伺服器。
- 寄件者為 `onboarding@resend.dev`（`src/lib/mail.ts`），只能寄給 Resend 帳號本身的信箱。若要寄給其他人，須在 Resend 驗證網域並更換寄件者。

第一次執行前先產生 Prisma client（不會變更資料庫結構或索引）：

```bash
pnpm exec prisma generate
```

### 本機執行

```bash
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

### 指令

| 指令                 | 用途                                        |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | 開發伺服器                                  |
| `pnpm check`         | lint、型別檢查與測試（不需資料庫或寄信）    |
| `pnpm build`         | 產生 Prisma client 並建置；字型可能需要網路 |
| `pnpm start`         | 啟動正式建置                                |
| `pnpm format <檔案>` | 用 Prettier 格式化指定檔案                  |

正式環境請在代管平台設定環境變數。

---

## 維護文件

這是依需求維護的小型個人展示作品，以下文件以繁體中文撰寫：
[維護指南](docs/maintenance.md) · [架構](docs/architecture.md) · [目前問題](docs/project-status.md) · [變更紀錄](CHANGELOG.md)

---

## 作者

**Zeke Gan** — [GitHub](https://github.com/ZekeGan)
