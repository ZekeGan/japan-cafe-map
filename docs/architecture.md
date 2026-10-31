# 專案架構與資料流

最後核對：2026-10-30。依本機程式碼、隔離回歸與本機實際資料庫／瀏覽器測試整理；未驗證遠端部署與真實郵件收件。

## 系統邊界

瀏覽器執行地圖、定位、篩選、表單與會員狀態。Next.js Route Handlers 負責會員 API、店家建檔、回報與收藏；Prisma 連接 MongoDB。密碼重設郵件由伺服器透過 Resend 發送。

Google Places 搜尋目前直接在瀏覽器執行，並非 README 所描述的全由伺服器取回。`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 是瀏覽器可見設定，金鑰限制須在 Google Cloud 核對。

## 目錄與頁面

| 位置 | 職責 |
| --- | --- |
| `src/app/page.tsx` | `/` 導向 `/map` |
| `src/app/map/page.tsx` | 地圖與店家詳情抽屜 |
| `src/app/map/[id]/page.tsx` | 店家獨立頁，先查資料庫確認存在，再由共用 `ShopInfo` 請求詳情 |
| `src/app/favorite/page.tsx` | `/favorite` 收藏清單與移除操作 |
| `src/app/(auth)/` | 登入、註冊、個人頁、忘記與重設密碼；路由群組不出現在 URL |
| `src/app/api/` | HTTP API，見下表 |
| `src/components/map.tsx` | 地圖呈現、標記與篩選 |
| `src/components/mapHooks.ts` | `useGeolocation`、`useCafeShops`（Places 搜尋、結果合併） |
| `src/components/shopInfo.tsx` | 詳情容器：載入資料、收藏切換、詳情／編輯切換 |
| `src/components/shop/` | `shopDetail`（詳情呈現）、`shopForm`（回報表單）、`shopParts`（共用小元件） |
| `src/components/ui/` | 共用 UI 元件 |
| `src/lib/validations/` | Zod 表單／會員驗證定義；不代表所有 API 都已套用 |
| `src/constant/` | 路由名稱、預設座標 |

`src/app/layout.tsx` 設定 `dynamic = 'force-dynamic'`，依序包入 `DatabaseGuard`、`AuthProvider`、`LanguageProvider`，並顯示 Sonner 通知。`DatabaseGuard` 在請求階段 ping MongoDB；失敗時回傳資料庫不可用 main，不再巢狀輸出 html/body。DB 恢復後重新整理即可重試，不將離線畫面在建置時固定為靜態頁。此選擇讓整站逐請求渲染，適用目前低流量用途。

## 核心資料流

### 地圖搜尋

1. `Map` 載入 Google Maps JavaScript API（目前設定 `beta` 與 `places`）。預設使用常數座標；定位按鈕透過瀏覽器 geolocation 更新位置。
2. 使用者點擊搜尋此區域，取得地圖中心，呼叫 `Place.searchNearby` 搜尋 cafe。
3. 搜尋半徑在 zoom >= 17 時為 500 公尺，其餘為 1500 公尺。與上次搜尋位置距離小於 800 公尺時略過搜尋。
4. 瀏覽器將 Google 店家欄位送到 `POST /api/cafe/query`。此端點雖名為 query，實際會寫入資料庫。
5. API 依 `googlePlaceId` upsert；既有店家使用空的 `update`，不更新 Google 欄位。回應內的 `id` 已是本地 MongoDB ID。
6. 前端依本地 ID 合併新結果與已載入結果，並合併會員收藏。篩選在前端進行，多個條件目前採任一符合（OR）。「無時限」只符合 timeLimit=false，unknown/null 不算符合；詳情與表單一致，true 表示限時。

定位授權成功才顯示目前位置標記。拒絕定位、搜尋失敗與快速連續操作的實際體驗尚待人工驗證。

### 店家詳情與回報

1. 地圖點選標記後，以本地店家 ID 開啟 `ShopInfo`。
2. `GET /api/cafe/[id]` 回傳店家與 `_count.reports`，型別宣告在 `src/types/global.d.ts`。
3. 登入者在前端填寫 `reportSchema` 表單，送出到 `POST /api/report`。API 驗證 JWT、由 token 取得 userId，使用去除 userId 的 schema 驗證回報並移除未定義欄位。
4. API 在 transaction 中建立 Report、查詢該店所有回報，再以 `CafeStatsAggregator` 更新 Cafe 聚合欄位。
5. 布林值略過 null/undefined，有效票嚴格過半為 true，平票為 false；預設最少 1 票。
6. 列舉使用眾數，平票結果依目前迭代順序決定；查詢沒有指定排序，不應視為穩定的產品規則。
7. 菸品類型保留出現次數大於總回報數 20% 的項目。`getUnion` 名稱不代表無條件保留所有項目。

此為分類欄位的社群聚合，不是一般五星或數值平均評分。目前 API 建立回報，未提供編輯／刪除回報端點；資料庫有一人一店一份回報的唯一約束，重複建立回傳 409。表單檢查 HTTP 結果，失敗時保留輸入並顯示三語系錯誤通知；成功後重新取得店家聚合及會員狀態，再關閉編輯。提交期間停用送出按鈕以避免重複請求。

### 會員與收藏

- 註冊／登入 API 使用 Zod；密碼以 bcrypt hash 儲存。登入簽發有效期 24 小時的 HS256 JWT。
- JWT 存在 `auth-token` cookie，設定 httpOnly、sameSite=lax、path=/；production 時 secure=true。
- `AuthProvider` 呼叫 `/api/auth/me` 驗證 JWT 並取得會員與關聯資料；`refreshUser` 供操作後更新狀態。
- `src/lib/auth/authWrapper.ts` 提供 `getAuthUser`，收藏與回報 API 使用它驗證 HS256 JWT 與 ObjectId 格式的 sub；缺少 token／密鑰或驗證失敗回傳 null。
- `src/proxy.ts` 匹配 `/profile/:path*` 與 `/favorite/:path*`，驗證 HS256 JWT、期限與 sub 格式；缺失／偽造／過期 token 導向登入頁。API 仍自行驗證身分，不能以頁面導向代替資料權限。
- 收藏 GET 查詢已驗證會員的收藏；POST 依已驗證會員與 body 的 `cafeId` 切換新增／刪除。舊前端傳來的 userId 不作為資料存取依據，cafeId 必須符合 ObjectId 格式。
- 忘記密碼建立 32-byte 隨機 token，原值與一小時有效期限存入 User；郵件使用 `NEXT_PUBLIC_APP_URL` 組合連結。重設成功會清空 token 與期限。
- `sendResetPasswordEmail` 檢查 Resend 回傳的 error，失敗拋出例外，forgot-password API 回 500；不再以已完成的 Promise 當作寄信成功。寄送前仍會儲存 token，相關重試策略留待後續。

## API 導覽

| 方法與路徑 | 行為 | 目前的驗證／限制 |
| --- | --- | --- |
| POST `/api/auth/register` | 建立使用者 | registerSchema、重複 email 查詢 |
| POST `/api/auth/login` | 驗證密碼並設定 cookie | loginSchema、bcrypt |
| POST `/api/auth/logout` | 刪除 cookie | 無資料庫寫入 |
| GET `/api/auth/me` | 取得目前會員與關聯 | JWT 驗證 |
| POST `/api/auth/forgot-password` | 建立 token 並寄信 | 查詢 email；未套用 forgotPasswordSchema |
| POST `/api/auth/reset-password/[token]` | 更新密碼 | 檢查 token 與期限；使用 resetPasswordSchema 的 password 欄位規則，保留只送 password 的請求格式 |
| POST `/api/cafe/query` | 批次建檔／取回店家 | 確認 body 是陣列且每筆為含字串 `id` 的物件，無完整逐筆 schema 或登入驗證 |
| GET `/api/cafe/[id]` | 店家詳情與回報數 | 不存在時 404；未預先驗證 ID 格式 |
| POST `/api/report` | 建立回報與更新聚合 | JWT 身分、回報 schema、ObjectId 格式 cafeId；重複回報 409 |
| GET `/api/favorite` | 查詢目前會員收藏 | JWT 身分；忽略客戶端 userId |
| POST `/api/favorite` | 切換收藏 | JWT 身分、ObjectId 格式 cafeId；忽略客戶端 userId |

## 資料模型

來源：`prisma/schema.prisma`。User、Cafe、Favorite、Report 的主鍵與關聯使用 MongoDB ObjectId。

| 模型 | 重要欄位／約束 |
| --- | --- |
| User | email 唯一、password hash、name、密碼重設 token／期限 |
| Cafe | googlePlaceId 唯一、Google 基本資料、內嵌 Location、社群聚合欄位 |
| Favorite | userId、cafeId、createdAt；目前沒有兩者的複合唯一約束 |
| Report | userId、cafeId、設施／規範回報；`@@unique([cafeId, userId])` |

Cafe 與 Report 共用 Wi-Fi、插座、座位、噪音、吸菸、低消、限時及預約等欄位。null 表示未知，不可一律當作 false。schema 的唯一約束是否已同步到實際資料庫，本次未驗證。

## 多語系與型別注意事項

- `src/lib/i18n/locales/` 提供 en、ja、zh。預設 en，LanguageProvider 優先讀 localStorage `lang`，再參考瀏覽器語言。
- Server 郵件由 `getServerTranslation` 取得翻譯。
- `/api/auth/me` 的 reports 回傳 id 與 cafeId，供既有 UI 判斷已回報店家。`authContext.tsx` 的 UserData 只宣告實際選取的會員與關聯欄位。
