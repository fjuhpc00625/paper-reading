# Paper Reading Hub — 實證期刊文獻互動導讀與學術英語精讀平台

本專案為「**建立自己的 `AGENTS.md` 開發規則與可擴充式靜態網頁**」實作成果。透過將 [`paper-reading`](.agents/skills/paper-reading/SKILL.md) 文獻精讀工作流規範化於 [`AGENTS.md`](AGENTS.md)，讓 AI 只要接收到新的期刊論文（URL 或 PDF），就能依據固定模板與資料結構，快速產生風格一致的互動式文獻導讀頁面並上架至首頁目錄。

---

## ✨ 專案特色

- **規則驅動擴充 (Rule-Driven Scalability)**：透過 `AGENTS.md` 明確規範目錄結構、設計系統、無障礙標準、JSON 資料格式與新增 SOP。
- **統一的四大核心導讀模組**：
  1. **模組 1｜論文核心結構化拆解**：主題與 PICO 架構、研究方法互動彈窗、完整統計數據分頁、學術/臨床重要性與行動建議。
  2. **模組 2｜30–60 秒電梯簡報 (Elevator Pitch)**：Hook &rarr; Action &rarr; Punchline &rarr; Impact 口語化報告腳本與一鍵複製。
  3. **模組 3｜實證文獻批判 (Critiques)**：研究優勢、研究限制與偏差風險 (Risk of Bias) 折疊評析。
  4. **模組 4｜英文文獻閱讀與句型精讀**：高階英文摘要短文、代表性學術句型解析與專業單字庫。
- **雙模態 Paper 重點劃線系統 (Dual-Mode Highlighting)**：
  - **AI 預標註重點**：自動以黃（核心發現）、藍（研究方法）、綠（實務結論）、紫（英文金句）四色螢光筆標出論文精華，支援一鍵切換顯示/隱藏。
  - **讀者互動反白畫線**：讀者在網頁上反白任何句子即可浮現三色螢光筆畫重點，自動儲存於瀏覽器 `localStorage` 並彙整於底部「個人重點劃線筆記本」，支援一鍵複製為 Markdown 筆記。
- **資料驅動目錄 (`data/papers.json`)**：首頁自動讀取 JSON 索引生成卡片牆，並支援即時關鍵字搜尋與領域標籤篩選。
- **零建置部署 (Zero-Build)**：純靜態 HTML + Tailwind CSS CDN + 原生現代瀏覽器 API（`<dialog>`、`<details>`、ARIA Toolbar & Tabs），可直接部署至 GitHub Pages。

---

## 📂 專案結構

```text
.
├── AGENTS.md                       # AI 專案規範、風格系統與新增論文 SOP
├── README.md                       # 專案說明文件
├── .nojekyll                       # 停用 GitHub Pages Jekyll 編譯以保留原始靜態檔
├── index.html                      # 網站入口首頁（搜尋、篩選、文獻目錄）
├── data/
│   └── papers.json                 # 文獻目錄資料索引 (Single Source of Truth)
├── papers/
│   └── jmir-2026-cpg-ai.html       # 示範頁面：JMIR (2026) 臨床指引與 AI 評鑑研究
├── templates/
│   └── paper-template.html         # 供 AI 複製擴充的標準論文模板
└── assets/
    ├── css/main.css                # 共用樣式表、重點螢光筆與無障礙設計系統
    └── js/
        ├── catalog.js              # 首頁搜尋與標籤篩選邏輯
        └── paper-page.js           # 內頁共用互動邏輯（重點劃線、Tabs、原生 Dialog、側欄）
```

---

## 🚀 本機預覽與 GitHub Pages 部署

### 本機預覽
直接於專案根目錄啟動靜態伺服器即可預覽（或直接雙擊 `index.html`）：

```bash
python3 -m http.server 8080
```
接著開啟瀏覽器造訪 `http://localhost:8080`。

### 部署至 GitHub Pages
1. 將本專案上傳至 GitHub Repository（預設分支 `main`）。
2. 進入 Repository 的 **Settings &rarr; Pages**。
3. **Source** 選擇 `Deploy from a branch`，Branch 選擇 `main` / `/ (root)`，點擊 **Save**。
4. 等待約 1 分鐘即可取得公開網址瀏覽！
