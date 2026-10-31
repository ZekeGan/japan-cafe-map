# AI 維護入口

Japan Cafe Map 是尋找適合工作的日本咖啡店地圖，已完成功能開發，目前以維護為主。優先處理可重現的錯誤、資料正確性與維護成本；避免無關的全面重構。

這是低流量個人展示作品：預設單一 agent、按需閱讀、局部修改、依影響驗證。不自動啟用子 agent、全面掃描或多輪審查；文件依任務查閱，不每次全讀。有問題或展示前再檢查，不安排定期 agent 巡檢。回覆簡述改動、驗證與未解事項。

## 開始任務

1. 先讀本檔，再依任務閱讀下列文件與相關程式碼。
2. 執行 `git status --short`，保留使用者既有變更。
3. 利用下表定位檔案，避免每次重新掃描整個專案。文件是導覽，實際行為仍須核對相關實作。
4. 修改前說明具體問題與範圍；一次處理一個可驗證的問題。已授權的例行工作可直接進行。

| 需求 | 先讀文件／程式碼 |
| --- | --- |
| 架構與資料流 | [docs/architecture.md](docs/architecture.md) |
| 執行、部署、故障與回歸 | [docs/maintenance.md](docs/maintenance.md) |
| 已知問題、檢查結果、下一步 | [docs/project-status.md](docs/project-status.md) |
| 地圖、搜尋、篩選、定位 | `src/components/map.tsx`、`src/app/api/cafe/query/route.ts` |
| 店家詳情與社群回報 | `src/components/shopInfo.tsx`、`src/app/api/report/route.ts`、`src/lib/cafeStats.ts` |
| 登入與權限 | `src/app/api/auth/`、`src/context/authContext.tsx`、`src/proxy.ts`、`src/lib/auth/authWrapper.ts` |
| 收藏 | `src/app/favorite/page.tsx`、`src/app/api/favorite/route.ts` |
| 資料模型 | `prisma/schema.prisma`、`src/lib/db.ts` |
| 多語系 | `src/context/languageContext.tsx`、`src/lib/i18n/` |

## 技術與指令

- Next.js App Router、React、TypeScript strict、Tailwind CSS、Radix/shadcn 元件。
- MongoDB + Prisma；Google Maps JavaScript / Places；Resend 密碼重設郵件。
- 套件管理使用 pnpm，版本依 `package.json` 與 `pnpm-lock.yaml`，不要順手更換管理工具或升級依賴。
- 開發：`pnpm dev`；lint：`pnpm lint`。
- 型別檢查：`pnpm typecheck`；一次跑 lint、型別與測試：`pnpm check`。
- 建置：`pnpm build`，會執行 Prisma client 產生與 Next.js 建置；需要環境設定，字型可能需網路。已驗證 DB 離線可建置，頁面執行階段才檢查連線。
- 針對性回歸：`pnpm test`（Node 內建測試，不連資料庫）；改 API 只需跑它，改元件跑 `pnpm typecheck`。目前無專案內 CI。

## 修改原則

- 先修正有證據的問題，區分已確認的程式碼事實與待驗證的影響；不要只為寫法偏好重構。
- API 權限應由伺服器驗證，不能以隱藏前端按鈕或相信傳入的 `userId` 取代。
- 不讀取或輸出 `.env*` 的密鑰值；文件只記錄環境變數名稱、用途與取得方式。
- 維護既有中、英、日語系；新增可見文字時核對三份翻譯。
- 不手動編輯 `.next/`、`node_modules/`、Prisma 產物。`pnpm prettier` 會格式化整個專案，不適合局部維護。
- 資料庫 schema、索引或資料轉換須說明相容性、備份與回復方式；以開發／測試資料驗證。不要將正式環境當測試資料來源。
- 本次文件建立不代表已授權部署、正式資料操作或寄送郵件。後續依使用者實際任務授權處理。

## 完成任務

- 執行與變更相關的檢查；只改文件時檢查連結、事實與 diff 即可。
- 回報改動、驗證結果及未驗證項目，不把「未執行」寫成通過。
- 架構／API／資料模型改動時更新 `docs/architecture.md`；操作方式改動時更新 `docs/maintenance.md`。
- 問題確認或修正、檢查基準變更時更新 `docs/project-status.md`，附日期與依據。一般小修改不必累積流水帳。
- `PLAN.md` 是既有歷史計畫，未勾選功能不是新的開發授權；目前優先順序看狀態文件與使用者最新指示。
