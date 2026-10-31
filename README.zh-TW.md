# ☕ Japan Cafe Map

[English](README.md) | **繁體中文** | [日本語](README.ja.md)

<p align="center">
  <img src="./public/preview1.png" height="500" alt="地圖畫面" />
  <img src="./public/preview2.png" height="500" alt="店家詳情" />
</p>

> 幫你在日本找到**適合工作的咖啡店**。店家資料來自 Google Maps，並加上使用者回報的實際設施資訊。

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Google Maps API](https://img.shields.io/badge/Google%20Maps%20API-4285F4?style=flat&logo=googlemaps&logoColor=white)

[🌐 線上展示](https://japan-cafe-map.vercel.app/)

---

## 簡介

Google Maps 只告訴你咖啡店在哪裡，卻不會告訴你有沒有插座、Wi-Fi 穩不穩，或是安靜到足以連續工作三小時。Japan Cafe Map 從 Google Maps 取得店家，再加上**使用者回報的資訊**，讓遠端工作者和工程師出門前就能找到適合工作的店。

大多數地圖應用著重在美食和人氣，不太在意能不能工作。作者是住在日本的遠端工程師，常常找不到 Wi-Fi 穩定、有插座、待起來舒服的咖啡店，所以做了這個專案。

---

## 功能

- 🗺️ **Google Maps 整合**：用 Places API 搜尋附近的咖啡店（名稱、地址、位置）
- 📝 **社群回報**：登入後可以回報和工作有關的資訊：
  - 🔌 插座
  - 📶 Wi-Fi
  - 🔇 噪音
  - 🪑 座位
  - ⏱️ 限時、低消、預約、吸菸規定
- 🔍 **篩選**：依回報的設施條件篩選店家（同時選多個條件時，符合其中任一個就會顯示）
- ❤️ **收藏**：把喜歡的店家加入自己的清單
- 📍 **定位**：把地圖移到你目前的位置，並搜尋附近的店家
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

- **在瀏覽器搜尋店家**：前端用 Maps JavaScript API 搜尋附近的咖啡店，再交給 Next.js API 依 Google Place ID 寫入資料庫（已存在就不重複建立）。已存在的店家資料不會自動向 Google 重新同步。
- **回報與收藏需要登入**：這兩個 API 只採用伺服器驗證過的登入身分，不會相信前端傳來的 userId。送出失敗時，表單內容會保留。
- **社群回報的彙整方式**：是非欄位以過半數的結果為準，選項欄位取出現最多的，菸品類型則要出現達一定比例才保留。「未知」和「否」會分開處理，每位使用者對同一間店只能回報一次。
- **每次請求都檢查資料庫**：頁面採動態渲染，因此建置時資料庫剛好離線，也不會把「資料庫無法使用」的畫面固定進網站。資料庫恢復後，重新整理頁面即可。

---

## 快速開始

### 前置需求

- 建議 Node.js 24（Next.js 16 至少需要 20.9）
- pnpm（版本固定於 `package.json`）
- 一個 [Google Cloud](https://console.cloud.google.com/) 專案，並已啟用 **Maps JavaScript API** 和 **Places API**
- 支援交易（transaction）的 MongoDB，例如 replica set 或 MongoDB Atlas
- Resend 帳號，用來寄送密碼重設郵件

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

- 請在 Google Cloud 限制瀏覽器用的 Maps 金鑰，只允許你的網站和需要的 API 使用。
- `DATABASE_URL`、`JWT_SECRET`、`RESEND_API_KEY` 只能在伺服器端使用，不要公開。
- `NEXT_PUBLIC_APP_URL` 用來組成密碼重設連結，請填入實際的網站網址。修改設定後要重新啟動伺服器。
- 寄件者目前是 `onboarding@resend.dev`（見 `src/lib/mail.ts`），只能寄到你註冊 Resend 時使用的信箱。想寄給其他人，需要先在 Resend 驗證自己的網域，再更換寄件者。

第一次執行前，先產生 Prisma client（這個動作不會更動資料庫的結構或索引）：

```bash
pnpm exec prisma generate
```

### 本機執行

```bash
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

### 指令

| 指令                 | 用途                                              |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | 開發伺服器                                        |
| `pnpm check`         | lint、型別檢查與測試（不需資料庫或寄信）          |
| `pnpm build`         | 產生 Prisma client 並建置；下載字型時可能需要網路 |
| `pnpm start`         | 啟動建置好的正式版本                              |
| `pnpm format <檔案>` | 用 Prettier 格式化指定的檔案                      |

部署到正式環境時，請在代管平台上設定這些環境變數。

---

## 維護文件

這是一個小型的個人展示作品，有需要時才會維護。以下文件以繁體中文撰寫：
[維護指南](docs/maintenance.md) · [架構](docs/architecture.md) · [目前問題](docs/project-status.md) · [變更紀錄](CHANGELOG.md)

---

## 作者

**Zeke Gan** — [GitHub](https://github.com/ZekeGan)
