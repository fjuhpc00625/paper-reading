# Paper Reading Hub — 實證期刊文獻互動導讀與學術英語精讀平台

**Paper Reading Hub** 是一個專為臨床研究者、實證醫學團隊與學術讀者打造的互動式期刊文獻精讀知識庫。平台將繁複的國際期刊論文轉化為結構化的**四大核心導讀模組**（PICO 與方法學拆解、30 秒電梯簡報、實證文獻批判、學術英語精讀），並內建**雙模態 Paper 重點劃線與個人筆記匯出系統**。

同時，專案結合 [`AGENTS.md`](AGENTS.md) 與 [`paper-reading`](.agents/skills/paper-reading/SKILL.md) 標準化工作流，讓新增文獻時能維持一致的視覺設計、統計呈現深度與無障礙互動體驗。

---

## ✨ 專案特色

- **統一的四大核心導讀模組**：
  1. **模組 1｜論文核心結構化拆解**：主題與 PICO 架構、研究方法互動彈窗、完整統計數據分頁（含 Effect Size、95% CI 與 $p$ 值）、學術/臨床重要性與行動建議。
  2. **模組 2｜30–60 秒電梯簡報 (Elevator Pitch)**：Hook &rarr; Action &rarr; Punchline &rarr; Impact 口語化報告腳本與一鍵複製。
  3. **模組 3｜實證文獻批判 (Critiques)**：研究優勢、研究限制與偏差風險 (Risk of Bias) 折疊評析。
  4. **模組 4｜英文文獻閱讀與句型精讀**：高階英文摘要短文、代表性學術句型解析與專業單字庫。
- **雙模態 Paper 重點劃線系統 (Dual-Mode Highlighting)**：
  - **AI 預標註重點**：自動以黃（核心發現）、藍（研究方法）、綠（實務結論）、紫（英文金句）四色螢光筆標出論文精華，支援一鍵切換顯示/隱藏。
  - **讀者互動反白畫線**：讀者在網頁上反白任何句子即可浮現三色螢光筆畫重點，自動儲存於瀏覽器 `localStorage` 並彙整於底部「個人重點劃線筆記本」，支援一鍵複製為 Markdown 筆記。
- **資料驅動目錄 (`data/papers.json`)**：首頁自動讀取 JSON 索引生成卡片牆，並支援即時關鍵字搜尋與領域標籤篩選。
- **模組化擴充架構**：透過 `AGENTS.md` 與 `templates/paper-template.html` 定義統一結構，確保後續新增的每篇論文導讀皆維持一致品質。

---

## 📂 專案結構

```text
.
├── AGENTS.md                       # 專案架構規範、設計系統與新增論文標準流程
├── README.md                       # 專案說明文件
├── .nojekyll                       # 停用 GitHub Pages Jekyll 編譯以保留原始靜態檔
├── index.html                      # 網站入口首頁（搜尋、篩選、文獻目錄）
├── data/
│   └── papers.json                 # 文獻目錄資料索引 (Single Source of Truth)
├── papers/
│   └── jmir-2026-cpg-ai.html       # JMIR (2026) 臨床實踐指引與 AI Agent 評鑑品質研究
├── templates/
│   └── paper-template.html         # 標準論文導讀頁面模板
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
