# 🗺️ 台灣旅遊美食 AI 智慧推薦助手 (Taiwan Travel & Food AI Planner)

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![n8n](https://img.shields.io/badge/n8n-Workflow_Automation-orange)
![Hugging Face](https://img.shields.io/badge/Hugging_Face-Docker_Space-yellow)
![Vercel](https://img.shields.io/badge/Vercel-Frontend_Hosting-black)

> **結合 GIS 路徑演算法與 Generative AI，為您規劃「順路」的旅遊美食行程。**

本專案是一個前後端分離的智慧旅遊規劃應用。前端採用輕量化 Leaflet 地圖框架，後端透過 **n8n** 自動化流程整合 **交通部觀光署 API** 與 **LLM (Large Language Model)**。系統採用「漸進式載入 (Progressive Loading)」架構，能在 0.5 秒內回傳沿途景點，並在背景透過 AI 分析最佳行程推薦。

---

## ✨ 核心功能 (Features)

* **🚗 沿途搜尋演算法 (Route-based Search)**：
    * 整合 OSRM Routing API，計算起點至終點的實際行車路徑。
    * 使用 GIS 邊界框 (Bounding Box) 與動態採樣技術，精準篩選路徑緩衝區內的景點與美食。
* **🤖 AI 智慧推薦 (AI-Powered Insights)**：
    * 系統自動將篩選後的候選地點（包含景點與美食的智慧配額）傳送至 LLM。
    * AI 根據當日天氣、用戶興趣偏好，生成具備在地口吻的推薦理由。
* **🌦️ 智慧天氣整合**：自動擷取目的地即時氣象，AI 依據降雨機率動態調整室內/室外行程權重。
* **❤️ 行程收藏與導航**：支援手動收藏想去的景點，並一鍵輸出成 Google Maps 連接導航路線。

---

## 🏗️ 系統架構 (Architecture)

本專案採用 **Serverless + Container** 混合架構，實現「低成本」的高效能部署：

| 元件 | 技術選型 | 說明 |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Vanilla JS, Leaflet | 託管於 **Vercel**，透過 Serverless Function 轉發 API 請求。 |
| **Backend** | n8n (Docker) | 託管於 **Hugging Face Spaces** (16GB RAM)，負責複雜邏輯與 API 串接。 |
| **Database** | PostgreSQL | 託管於 **Supabase**，作為 n8n 的長久數據存儲。使用額外的n8n流程每三天打一次防止7天未使用暫停。 |
| **Monitoring** | UptimeRobot | 監控並防止 Hugging Face 進入休眠狀態。 |
| **AI Model** | Gemini 2.5 Flash | 負責生成自然語言推薦。 |

---

## 🚀 部署指南 (Deployment Guide)

若您希望自行部署此專案，請依照以下順序進行：

### 1. 資料庫設定 (Supabase)
由於 Hugging Face Spaces 重啟後會重置，需使用外部資料庫儲存 n8n 數據。
1.  註冊 [Supabase](https://supabase.com/) 並建立新專案。
2.  取得 **Connection String** (格式：`postgres://user:pass@host/db`)。

### 2. 後端部署 (Hugging Face Spaces)
1.  建立新的 Space，SDK 選擇 **Docker**。
2.  建立 `Dockerfile`：
    ```dockerfile
    FROM n8nio/n8n:latest
    ENV N8N_PORT=7860
    EXPOSE 7860
    CMD ["n8n", "start"]
    ```
3.  在 **Settings** > **Variables and secrets** 設定以下環境變數：
    * `DB_TYPE`: `postgresdb`
    * `DB_POSTGRESDB_HOST`, `_USER`, `_PASSWORD`, `_DATABASE`: 填入 Supabase 的資訊。
    * `N8N_BASIC_AUTH_ACTIVE`: `true`
    * `N8N_BASIC_AUTH_USER` / `_PASSWORD`: 設定您的 n8n 登入帳密。
    * `N8N_ENCRYPTION_KEY`: 任意亂數。

### 3. n8n 流程設定
1.  進入 n8n 後台，匯入本專案的 Workflow JSON 檔。
2.  設定 **Webhook 節點**，並記下 Production URL。
3.  設定並聯架構：`Webhook` -> `Http request` -> `Merge (Append)` -> `Code (GIS Logic)` -> `AI `。

### 4. 前端部署 (Vercel)
1.  Fork 本專案至您的 GitHub。
2.  在 Vercel 匯入專案。
3.  設定環境變數 (Environment Variables)：
    * `N8N_WEBHOOK_URL`: 填入 n8n 的 Webhook 網址。
    * `N8N_SECRET_KEY`: (選填) 若有設定 Header 驗證。

### 5. 監控設定 (UptimeRobot)
為了防止 Hugging Face 免費版在 48 小時後休眠：
1.  註冊 UptimeRobot。
2.  新增 HTTP(s) Monitor。
3.  目標網址：`https://<Space名稱>.hf.space/healthz`。

---

## 📂 專案目錄結構

```bash
.
├── index.html          # 前端主頁面 (UI/UX)
├── api
│   └── proxy.js        # Vercel Serverless Function (隱藏真實 n8n 網址 & CORS 處理)
└── README.md           # 專案說明文件