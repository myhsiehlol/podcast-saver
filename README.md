# Podcast Saver — Samsung A52s / Android 14

一個不需伺服器、不需 API Key、不需帳號的 YouTube Podcast 播放進度書籤 PWA。

## 重要使用限制

- 本工具**不能直接讀取 YouTube App 的當前播放秒數**；你必須在 YouTube「分享」時開啟「時間戳」選項。
- 如果分享訊息不帶時間戳，本工具不會自動覆蓋舊進度，而會開啟編輯視窗讓你確認。
- 點「繼續播放」會打開 YouTube 的時間戳 URL。在手機設定允許的情況下可交由 YouTube App 開啟；Google／Android 最終決定連結交給 App 還是 Chrome。若開在 Chrome，檢查 Android「設定 → 應用程式 → YouTube → 設為預設 → 開啟支援的連結」。
- 觀看 YouTube 後**不會自動同步**回此工具；下一次下車時還要重新分享。
- 儲存在裝置的 `localStorage`，不會傳給本網站主機；資料不會跨手機同步。若刪除網站資料，可能遺失。
- 本 PWA 的 HTML/JS/CSS 可以離線開啟與管理紀錄，但真正的 YouTube 影片播放需要網路。

## 五分鐘部署：GitHub Pages（建議；免費 HTTPS）

1. 電腦開啟 GitHub，登入或註冊；右上角 `+ → New repository`，名稱例如 `podcast-saver`，選 **Public**，建立 repo。
2. 在 repo 點 `Add file → Upload files`，把 ZIP **解壓縮後** `podcast-saver` 資料夾裡的內容**直接上傳到 repo 根目錄**：`index.html`, `app.js`, `logic.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `icons/` 等。不要只上傳 ZIP，也不要額外包一層 `podcast-saver/`。
3. 點 `Commit changes`。
4. `Settings → Pages → Build and deployment → Source: Deploy from a branch`，Branch 選 `main`、資料夾選 `/(root)`，Save。
5. 網站網址通常是：`https://你的帳號.github.io/podcast-saver/`。以實際 GitHub Pages 顯示的網址為準。
6. **Samsung A52s：使用 Chrome** 打開網址 → 右上角 `⋮` → `安裝應用程式` / `Install app` → 安裝。必須安裝成 PWA/WebAPK；若只出現新增捷徑，系統分享選單可能無法註冊此 App。Chrome 安裝期間需網路。
7. 開啟 YouTube：暫停 Podcast → 分享 → 確認顯示時間戳的開關已開啟 → Android 分享清單選 `Podcast Saver`。如果看不到，試著展開「更多」、重新安裝 PWA、確認是 Chrome 安裝。
8. 在 Podcast Saver 裡命名該影片；下次按 `▶ 繼續播放`。

注意：安裝 PWA 的原始網站網址與 GitHub 帳號 / repo 名稱改變後，原本的安裝可能無法繼續正常接收分享。

## 本機測試

電腦裝有 Python 時，在本資料夾執行：

```bash
python -m http.server 8000
```

瀏覽 `http://localhost:8000`。可測試手動新增、調整進度；Android 透過其他裝置的 HTTP IP 網址不能正常安裝 PWA，實際安裝請使用 HTTPS 網站。

測試時間戳解析（有 Node.js 時）：

```bash
node tests/test.js
```

## 檔案說明

- `index.html`：主畫面和編輯視窗
- `style.css`：手機介面樣式
- `app.js`：資料儲存、分享接收、清單與操作
- `logic.js`：YouTube 網址及時間戳解析
- `manifest.webmanifest`：PWA 安裝與 Android 分享接收註冊
- `sw.js`：離線快取
- `icons/`：PWA 圖示
- `tests/`：解析單元測試

## 安全與隱私

沒有分析碼、廣告、追蹤器或外部依賴。分享資料透過 URL 參數傳入你的靜態 GitHub Pages 主頁後，由瀏覽器本機 JavaScript 寫入 localStorage。URL 參數**可能**出現在靜態主機的請求日誌中，所以不要分享私人影片 URL 或其他敏感內容。如果不想讓網址暴露在任何主機的日誌中，需要另用原生 Android 分享接收器，而不是 GET 方式的 PWA。
