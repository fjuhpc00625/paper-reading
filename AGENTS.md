# AGENTS.md — Paper Reading Hub 專案開發與擴充規範

本文件為 **Paper Reading Hub（實證期刊文獻互動導讀與學術英語精讀平台）** 之最高指導規範。任何 AI Coding Agent 在閱讀、修改或為本專案新增頁面時，**必須先完整閱讀並嚴格遵守本文件所有規則**，確保未來每一篇新增的文獻導讀頁面都能維持一致的結構、風格、無障礙體驗與資料同步。

---

## 1. 專案目的 (Project Purpose)

本專案旨在將學術文獻精讀流程（定義於 [`.agents/skills/paper-reading/SKILL.md`](.agents/skills/paper-reading/SKILL.md)）轉化為**可持續累積、零建置步驟（Zero-Build）、可直接部署於 GitHub Pages** 的靜態學術網頁知識庫。

當使用者提供一篇新的期刊文章網址（URL）或 PDF 檔案時，AI 應能依據本文件的**頁面結構、模板、重點劃線系統、資料索引格式與風格規範**，在數分鐘內自動產出一致且高品質的新文獻導讀頁面並上架至首頁。

---

## 2. 目錄結構與檔案命名規範 (Directory & Naming Conventions)

```text
.
├── AGENTS.md                       # 【本文件】AI 開發規則、結構、風格與擴充 SOP
├── README.md                       # GitHub 專案說明與 GitHub Pages 部署指南
├── index.html                      # 網站入口首頁（搜尋、標籤篩選、文獻目錄卡片牆）
├── data/
│   └── papers.json                 # 單一資料來源 (Single Source of Truth)：登記所有文獻 metadata
├── papers/                         # 存放所有獨立文獻導讀頁面（每篇論文一個檔案）
│   └── jmir-2026-cpg-ai.html       # JMIR 2026 臨床指引與 AI 評鑑研究
├── templates/
│   └── paper-template.html         # 新增論文頁面時必用的標準 HTML 模板
├── assets/
│   ├── css/
│   │   └── main.css                # 共用設計系統樣式表（色彩、字體、螢光筆劃線、dialog/tab/table）
│   └── js/
│       ├── catalog.js              # 首頁讀取 data/papers.json 並處理搜尋與標籤篩選
│       └── paper-page.js           # 內頁共用互動邏輯（重點劃線、側欄導覽、Tabs、原生 <dialog>）
└── .agents/
    └── skills/
        └── paper-reading/SKILL.md  # 定義四大內容模組與重點標註原則之文獻解析 Skill
```

### 檔案命名規則
- **文獻 HTML 頁面**：一律放於 `papers/` 資料夾下，使用**全小寫英文 + 連字號 (kebab-case)**，格式為：
  `papers/<journal-or-topic>-<year>-<short-keyword>.html`
  - 正確範例：`papers/jmir-2026-cpg-ai.html`、`papers/nejm-2025-glp1-heart.html`
  - 禁止事項：不可包含空白、中文或大寫字母。
- **頁面 ID (`id` in `data/papers.json`)**：必須與檔名去除 `.html` 後完全一致（例如 `jmir-2026-cpg-ai`）。

---

## 3. 網頁整體風格與設計系統 (Visual Style & Design System)

本專案採用「**Editorial Medical / Academic Dashboard（學術實證儀表板）**」視覺風格：沉穩、清晰、高對比且重視資訊層級。

### 色彩與字體規範
- **背景與卡片**：頁面底色為淺灰藍（`#f8fafc` / `bg-slate-50`），內容卡片為純白（`#ffffff`）搭配細邊框（`border-slate-200`）與大圓角（`rounded-3xl` / `rounded-2xl`）。
- **主色調與語意色**：
  - 主品牌色：Royal Blue（`#1d4ed8` / `bg-blue-700`）— 用於主要行動按鈕與導覽焦點。
  - 語意輔助色：
    - **Emerald (翠綠)**：正向數據、優勢 (Strengths)、PICO 結局指標。
    - **Amber (琥珀)**：電梯簡報 (Elevator Pitch)、重點筆記區提醒。
    - **Rose (玫瑰紅)**：研究限制、偏差風險 (Critiques)、低品質警訊。
    - **Violet / Indigo (靛紫)**：英文文獻閱讀與句型精讀模組。
- **字體系統**（已定義於 `assets/css/main.css`）：
  - 中文內文：`Noto Sans TC`
  - 英文標題與內文：`Plus Jakarta Sans`
  - 統計數值、DOI 與程式碼：`.font-mono-metric`（`JetBrains Mono`）

### Paper 重點劃線系統規範 (Dual-Mode Highlighting System)
每一篇論文內頁都具備「**AI 預標註重點 + 讀者互動式反白畫線**」雙模態功能（由 `assets/css/main.css` 與 `assets/js/paper-page.js` 驅動）：
1. **AI 預標註重點（Semantic `<mark>`）**：AI 在撰寫內頁時，必須在各模組挑出最關鍵的 6–10 個核心句子，使用以下 4 種語意標籤包覆：
   - `<mark class="ai-hl ai-hl-finding">`（黃底）：核心研究發現與最重要統計數據。
   - `<mark class="ai-hl ai-hl-method">`（藍底）：關鍵研究設計、創新方法或架構。
   - `<mark class="ai-hl ai-hl-takeaway">`（綠底）：臨床/實務最重要的行動結論。
   - `<mark class="ai-hl ai-hl-english">`（紫底）：模組 4 英文摘要中的核心學術金句。
2. **頂部固定工具列 (`#highlight-toolbar`) 與讀者反白畫線**：
   - 使用 `role="toolbar" focusgroup="toolbar wrap"`，提供「AI 重點劃線」顯示開關（`aria-pressed="true"`）、讀者反白三色螢光筆（黃/綠/紫）、一鍵複製全部重點為 Markdown 筆記，以及清除本頁自訂劃線。
   - 讀者在內文反白文字時會自動浮現 `#selection-hl-popover` 色盤，畫線結果自動存入瀏覽器 `localStorage` 並同步顯示於頁面底部的 `#user-highlights-section`。

### 無障礙與現代 HTML 元件規範
1. **彈出視窗 (Modal)**：必須使用原生 `<dialog closedby="any" aria-labelledby="modal-title">` 與 `<form method="dialog">` 關閉鈕，不可自製 `div` 遮罩。
2. **結果切換分頁 (Tabs)**：必須使用 `role="tablist"`、`role="tab"`（搭配 `aria-selected` 與 `data-panel`）及 `role="tabpanel"`（隱藏面板使用 `hidden="until-found"`）。
3. **折疊批判區 (Accordions)**：必須使用原生 `<details>` 與 `<summary>`，且不可在 `<summary>` 內嵌套 `<h1>`–`<h6>`。
4. **英文語系標記**：模組 4 的英文短文與單字須加上 `lang="en"` 屬性。
5. **響應式資料表**：表格必須包覆於 `.table-wrapper` 並使用 `<caption>` 與 `<th scope="col">` / `<th scope="row">`。

---

## 4. 頁面結構與四大核心模組規範 (Page Structure & Content Rules)

### 入口首頁 (`index.html`)
- **職責**：展示平台說明、四大導讀模組規格，並透過 `assets/js/catalog.js` 自動讀取 `data/papers.json` 渲染可即時搜尋與標籤篩選的文獻卡片牆。
- **禁止手動編寫卡片**：首頁卡片完全由資料驅動，AI 新增論文時**不可**直接把卡片 HTML 硬寫進 `index.html` 的 `<div id="papers-grid">` 中。

### 單篇論文導讀頁 (`papers/<slug>.html`)
每一篇論文頁面都必須依序包含以下區塊（完整對應 `paper-reading` Skill）：

1. **頂部重點劃線工具列 (`#highlight-toolbar`)** 與 **論文概覽 (`#overview`)**：
   - 中英文完整標題、含 `<mark class="ai-hl ...">` 重點標註之核心摘要、作者群、研究單位、期刊引用格式、DOI 外部連結、Impact Factor / 分區排名、以及 3 張關鍵統計指標卡片。
2. **模組 1：論文核心結構化拆解**：
   - **1.1 主題與 PICO 架構 (`#module-1-pico`)**：用 4 張清晰卡片分別列出 **P** (Population/Problem)、**I** (Intervention/Exposure)、**C** (Comparison/Control)、**O** (Outcomes)。
   - **1.2 研究方法 (`#module-1-method`)**：卡片概覽 + 搭配 `window.PAPER_METHOD_DETAILS` 驅動原生 `<dialog>` 顯示研究設計、樣本數、場域與統計檢定模型細節。
   - **1.3 研究發現與統計數據 (`#module-1-results`)**：使用 Accessible Tabs 呈現主要與次要結局，必須包含**點估計、Effect Size / OR / RR / HR、95% CI、$p$ 值**。
   - **1.4–1.5 重要性與結論建議 (`#module-1-significance`)**：區分「學術重要性」與「臨床/實務價值」，並列出 3 項具體行動建議。
3. **模組 2：電梯簡報 (`#module-2-pitch`)**：
   - 模擬 30–60 秒向主任、指導教授或專家口語報告的腳本，拆分為 4 步驟：**Hook（痛點）&rarr; Action（研究作為）&rarr; Punchline（關鍵震撼數據）&rarr; Impact（對實務的意義）**，並保留 `#btn-copy-pitch` 一鍵複製功能。
4. **模組 3：文獻批判 (`#module-3-critiques`)**：
   - 使用 `<details>` 分別呈現 **研究優勢 (Strengths)** 與 **研究限制與偏差風險 (Weaknesses & Limitations)**（須討論 Bias 與外推性 External Validity）。
5. **模組 4：英文文獻閱讀與句型精讀 (`#module-4-english`)**：
   - **1. 論文核心英文摘要精讀**：2–3 段流暢的高階學術英文改寫短文（須標註 `lang="en"` 並使用 `<mark class="ai-hl ai-hl-english">` 標註核心金句）。
   - **2. 精選高頻學術句型**：挑出 2–3 個代表性句型，說明句構特點與寫作應用。
   - **3. 核心學術單字庫**：表格化呈現 5–8 個專業詞彙（英文詞彙、詞性、中文釋義、論文語境與用法解析）。
6. **個人重點劃線筆記本 (`#user-highlights-section`)**：
   - 自動彙整讀者於頁面上反白儲存之個人螢光筆重點。

---

## 5. 新增論文頁面的標準流程 (Add-Paper SOP)

當使用者要求「新增一篇論文到網站」時，AI 必須依序執行以下 4 個步驟：

### Step 1：依據 `paper-reading` Skill 解析原文
完整閱讀使用者提供的 PDF 或網址，萃取 PICO、研究方法、全部統計數據、電梯簡報、文獻批判、英文精讀材料與核心重點劃線句。

### Step 2：複製模板建立新頁面
複製 `templates/paper-template.html` 到 `papers/<slug>.html`，將所有 `{{...}}` 佔位符替換為真實解析內容，並在關鍵句子加上 `<mark class="ai-hl ai-hl-finding|ai-hl-method|ai-hl-takeaway|ai-hl-english">`，同時確認相對路徑皆正確指向：
- 樣式：`../assets/css/main.css`
- 腳本：`../assets/js/paper-page.js`
- 回首頁連結：`../index.html`

### Step 3：更新單一資料來源 `data/papers.json`（及首頁離線備援）
在 `data/papers.json` 陣列中新增一筆符合以下 Schema 的 JSON 物件（同時同步更新 `index.html` 內的 `<script id="papers-fallback">` 以確保本機 `file://` 開啟也能瀏覽）：

```json
{
  "id": "journal-year-keyword",
  "title_zh": "中文論文標題",
  "title_en": "Original English Title",
  "authors": "FirstAuthor A, SecondAuthor B, et al.",
  "journal": "期刊全名或簡稱",
  "year": 2026,
  "impact_factor": "5.8",
  "quartile": "Q1",
  "doi": "10.xxxx/xxxxx",
  "tags": ["領域標籤1", "研究設計標籤2", "主題標籤3"],
  "key_metrics": [
    { "label": "指標一", "value": "數值" },
    { "label": "指標二", "value": "數值" },
    { "label": "指標三", "value": "數值" }
  ],
  "elevator_hook": "1～2 句濃縮本研究核心亮點與數據的電梯簡報摘要。",
  "url": "papers/journal-year-keyword.html",
  "added_at": "YYYY-MM-DD"
}
```

### Step 4：執行上線前檢查清單
1. 確認 `data/papers.json` 為合法 JSON 格式（無尾隨逗號或語法錯誤）。
2. 確認新頁面的 `id="module-1-pico"` 至 `id="user-highlights-section"` 皆有內容且無殘留 `{{...}}` 佔位符。
3. 確認新頁面包含至少 5 處 `<mark class="ai-hl ...">` 語意重點劃線。

---

## 6. AI 修改或新增內容時必須遵守的嚴格規則 (AI Guardrails)

1. **絕對禁止編造數據 (No Fabrication)**：
   - 所有樣本數（$N$）、ICC、OR/RR/HR、95% 信賴區間與 $p$ 值必須直接來自原論文或使用者提供之資料。若原文未報告某項指標，應明確標註「`文獻未報告 (Not reported)`」，絕不可推估或捏造。
2. **禁止破壞既有論文頁面 (Preserve Existing Papers)**：
   - 新增論文時，**不可**修改或刪除 `papers/` 資料夾內已存在的其他論文 HTML 檔案。
3. **禁止覆寫核心共用架構**：
   - 除非使用者明確要求全域改版，否則不可隨意更改 `assets/css/main.css`、`assets/js/paper-page.js` 與 `assets/js/catalog.js` 的介面契約。
4. **必須保持中英對照與雙語語系標記**：
   - 凡涉及英文原文段落、詞彙表英文欄與英文標題，皆須加上 `lang="en"` 以符合無障礙與螢幕閱讀器規範。
5. **保持純靜態可攜性**：
   - 不可引入需要 Node.js / Vite / Webpack 編譯才能運行的框架語法（如 JSX、`.vue`），確保專案可直接透過 GitHub Pages 部署或本機瀏覽器直接打開。
