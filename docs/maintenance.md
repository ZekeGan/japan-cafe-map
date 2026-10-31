# 維護操作與回歸清單

最後整理：2026-10-30。本輪 21 項隔離回歸、型別、lint、離線 DB 建置及 8 項唯讀 HTTP 檢查通過；先前完成 23 項真實 DB／HTTP 檢查及核心瀏覽器操作。授權普通測試信的 Resend 狀態為 Delivered；手機尺寸、Places 搜尋及密碼重設信連結仍未完整驗證，詳見 [測試紀錄](archive/test-results-2026-10-30.md)。

本專案為低流量個人展示作品，採事件觸發維護：有問題時局部修正、展示前執行核心人工回歸、收到安全／服務通知時評估更新。不要求固定巡檢、全面重構或完整測試覆蓋。

## 環境設定

使用 pnpm 與既有 `pnpm-lock.yaml`。`package.json` 未固定 Node.js／pnpm 版本；已核對安裝中的 Next.js 16.1.4 要求 Node.js >=20.9.0，建議沿用已驗證的 Node.js 24.13.0／pnpm 10.33.3。針對性測試 loader 以 Node.js 24 驗證。

| 變數 | 用途 | 程式碼來源 |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 瀏覽器載入 Maps 與搜尋 Places | `src/components/map.tsx` |
| `DATABASE_URL` | MongoDB 連線 | `prisma/schema.prisma` |
| `JWT_SECRET` | 登入 JWT 簽署與驗證 | `src/app/api/auth/`、`src/lib/auth/authWrapper.ts` |
| `RESEND_API_KEY` | 密碼重設郵件 | `src/lib/mail.ts` |
| `NEXT_PUBLIC_APP_URL` | 密碼重設連結的網站來源網址 | `src/lib/mail.ts` |

`NODE_ENV` 影響 production cookie 與 Prisma client 重用，由執行環境管理。文件不包含密鑰值，本次也未讀取 `.env` 內容。

README 已補齊上述變數，建議本機使用被 Git 忽略的 `.env`，讓 Prisma CLI 與 Next.js 都能載入。PLAN 是歷史紀錄，其舊環境變數清單不作為設定依據。

## 指令與副作用

| 指令 | 用途與注意事項 |
| --- | --- |
| `pnpm install --frozen-lockfile` | 安裝既有依賴；會下載並寫入 node_modules，不是唯讀檢查 |
| `pnpm exec prisma generate` | 產生 Prisma client，不是同步資料庫 schema |
| `pnpm dev` | 啟動開發服務，會產生 `.next`；頁面渲染會透過 DatabaseGuard 存取資料庫 |
| `pnpm dev:https` | 啟動實驗性本機 HTTPS，可能產生憑證 |
| `pnpm lint` | 執行 ESLint；script 沒有 `--fix` |
| `pnpm typecheck` | `tsc --noEmit --incremental false`，避免產生 tsbuildinfo |
| `pnpm check` | 依序執行 lint、typecheck、test |
| `pnpm test`（`node --test "tests/*.test.mjs"`） | 針對三項修補的隔離回歸；以既有 TypeScript 編譯實際 handler，只替換 DB 與 request cookie 邊界，不需密鑰、啟動網站或連接服務；目前在 Node 24 驗證 |
| `pnpm build` | `prisma generate && next build`，會寫入產物，需要環境設定與可能的 Google 字型網路連線；已驗證無法連 DB 仍可建置 |
| `pnpm start` | 啟動已建置的正式模式服務 |
| `pnpm prettier` | `pnpm dlx prettier --write .`，可能下載工具並改寫整個專案，不作為唯讀檢查 |

沒有測試 script 或已找到的專案內 CI，但已提供上述針對性測試。後續程式碼變更依影響執行檢查，不預設每次完整 build；文件變更只需事實、連結與差異檢查。將未執行、環境阻擋和實際失敗分開記錄。

## 人工回歸

執行前使用獨立測試帳號與非正式資料庫，記錄版本／commit、瀏覽器、環境、結果及錯誤。搜尋會建檔、回報與收藏會寫資料、忘記密碼會寄信；不要把這些當純瀏覽。

目前使用者確認沒有獨立測試環境；如依明確授權在共用資料庫測試，只使用專用帳號與可辨識資料，記錄新增內容，不修改或刪除其他使用者資料。2026-10-30 第二輪新增 2 帳號、1 店家、2 回報，均已安全清理並驗證無殘留。

下列為待執行的驗收清單，不代表現有功能均已通過：

- [ ] `/` 導向 `/map`；桌面與手機寬度可正常使用，抽屜與返回操作正常。
- [ ] 未登入可以搜尋、篩選、看詳情；會員操作具有正確的登入與權限限制。
- [ ] 定位同意、拒絕、逾時皆可繼續操作；拒絕時不顯示假定位標記。
- [ ] 搜尋不同區域、相近區域、空結果、快速重複搜尋；結果、loading、重試與錯誤通知合理。
- [ ] 單一與多個篩選條件符合預期；目前實作是 OR，若要改為 AND 應先確認需求。
- [ ] 抽屜與 `/map/[id]` 正常顯示；不存在、格式錯誤 ID 與快速切換店家有合理結果。
- [ ] 註冊、重複 email、錯誤密碼、登入、重新整理與登出正常。
- [ ] 無 cookie、偽造／過期 cookie、不同帳號的資料存取皆被正確處理；不能只確認頁面按鈕。
- [ ] 新增／取消收藏後，詳情、收藏頁、地圖標記同步；重複點擊不產生重複紀錄。
- [ ] 回報成功後店家聚合與已回報狀態更新；重複回報、非法值與 API 失敗顯示合理訊息。
- [ ] 密碼重設郵件可送達，連結指向正確環境；過期與使用過的連結失效，新密碼符合規則。
- [ ] 中、英、日切換與重新整理後偏好保留，相關頁面與郵件文字完整。
- [ ] 資料庫、Maps 或寄信服務失敗時，有可理解的提示與足夠的伺服器錯誤紀錄。

## 部署與回復

README 記載部署於 Vercel，但帳號、分支對應、實際部署設定與正式 DB 拓樸尚未驗證；不能據此假設有自動部署或自動備份。

部署前記錄目前可用的 commit／部署版本與這次檢查結果，確認目標環境設定。schema、索引與資料變更須另列操作計畫；`pnpm build` 不負責同步資料庫。程式碼回退也不會還原資料庫資料。

部署後使用已授權的環境執行核心 smoke check；若失敗，使用已確認的部署平台回復流程並核對資料相容性。平台存取方式與具體操作步驟待實際核對後補入，不記錄登入憑證。

資料庫維護待確認：

- 備份提供者、排程、保留期限、負責人與最近一次成功備份。
- 在獨立測試環境還原備份，確認 User／Cafe／Favorite／Report 數量、關聯與唯一索引。
- 回報 transaction 所需 MongoDB 拓樸是否滿足目前部署條件。
- 可接受的資料損失時間與恢復時間；目前未設定／未驗證。

## 常見故障定位

| 現象 | 優先檢查 |
| --- | --- |
| 全站顯示 DB 不可用 | DatabaseGuard、伺服器連線錯誤、DB 服務／網路與環境變數是否提供；不要輸出連線字串 |
| 地圖載入或搜尋失敗 | 瀏覽器 console／network、Maps 與 Places 啟用狀態、金鑰網站/API 限制、額度及帳務 |
| 回報 500 | transaction 條件與資料庫服務；重複回報目前回 409、格式錯誤回 400、未登入回 401；其他 catch 尚未記錄原因 |
| 登入後會員資料為空 | cookie、JWT 設定、me 回應與伺服器 DB；me 目前把多種例外合併為 401 |
| 密碼重設信未送達 | Resend 設定、寄件者（目前為 onboarding@resend.dev，只能寄給 Resend 註冊信箱）、寄件限制、收件結果與連結來源；SDK 回傳 error 時程式現在會拋錯並由 API 回 500 |

`src/lib/db.ts` 啟用 query log。收集紀錄時避免附上密碼、JWT、重設 token、完整連線字串與個資。外部服務費用、告警、額度和備份狀態須從實際管理平台確認，本次未查證。

頁面已設定逐請求動態渲染，DatabaseGuard 不再於 build 固定產生離線頁。DB 不可用時會顯示降級畫面，恢復後重新整理即可重試。降級畫面仍可能回 HTTP 200，因此展示前必須核對實際內容，不以 HTTP 200 當作健康檢查。
