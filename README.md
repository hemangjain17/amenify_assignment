<h1 align="center">Amenify AI Customer Support Bot</h1>

<p align="justify">
  A production-ready, full-stack AI-powered customer support bot for Amenify. Features a cloud-native Serverless RAG pipeline, real-time SSE streaming, and a robust fault-tolerant LLM router built for scale.

Deplyed Link - <a>https://amenify-frontend.vercel.app</a>

</p>

---

## 🏗 Architecture & Core Concepts (The Pipeline)

### 1. Data Ingestion & ETL (Firecrawl Scraper)

- **Dual-Extraction Strategy:** Utilizing the Firecrawl API, the scraper extracts both raw Markdown (for dense embeddings) and structured JSON schemas (summaries, CTAs, FAQs) per page.
- **Incremental Batch Indexing:** `scraper.py` utilizes MD5 content-hash diffing. It only re-embeds and updates records if the page content has mathematically changed, saving massive API overhead and compute time during cron updates.

### 2. Cloud Vector Storage (Pinecone Serverless)

- **Zero Local Overhead:** Instead of spinning up local Milvus/ChromaDB instances which suffer from Windows compatibility and heavy RAM usage, the bot uses **Pinecone Serverless**.
- **Instant Cold Starts:** Embeddings (`sentence-transformers/all-MiniLM-L6-v2`) are generated dynamically via the **Hugging Face Inference API** and upserted to Pinecone.

### 3. Fault-Tolerant LLM Router (`llm_provider.py`)

- **Primary Engine:** Hugging Face Inference API for instantaneous, low-latency generation.
- **Fallback Engine:** Hard-coded graceful fallback to **Gemini 3.1 Pro**. If the Hugging Face API rate limits or encounters downtime, the backend automatically intercepts the exception and seamlessly streams the answer via Gemini. The frontend user experiences zero disruption.

### 4. Advanced Agentic RAG

- **Context Grounding:** The system `prompt_config.py` enforces strict contextual boundaries. If the Pinecone search yields low-relevance scores, the LLM is instructed to cleanly decline the prompt rather than hallucinate Amenify policies.
- **Structured Link Injection:** Extracted JSON Call-To-Action (CTA) links are explicitly fed into the RAG context, allowing the bot to natively append markdown navigation buttons ("Book Cleaning", "See Pricing") in its responses.

---

## 🚀 Standout Features for Production & Latency

Why is this pipeline built for production?

| Feature                      | How it solves Production/Latency constraints                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Streaming SSE Interfaces** | **Perceived Latency = 0**. Tokens are piped over Server-Sent Events from FastAPI directly to the React ChatWidget UI the millisecond they are generated.                                                            |
| **Provider Fallback Chain**  | Guarantees high availability. Most bots die when an OpenAI/HF endpoint goes down. This bot silently routes to a secondary Google Gemini engine.                                                                     |
| **Cloud-Native Search**      | Relying on Pinecone AWS us-east-1 eliminates server disk I/O bottlenecks. Cross-encoder reranking isolates only the top 3 best chunks to keep the LLM context window small, speeding up Token-To-First-Word (TTFW). |
| **Stateless Scalability**    | The FastAPI container holds zero state. All memory is injected per-request, meaning you can auto-scale horizontally to 100+ instances behind a load balancer without data syncing issues.                           |

---

## ⚡ Step-by-Step Setup

Follow these steps to get the bot running on your local machine.

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/hemangjain17/amenify_assignment
cd amenify_assignemnt

# Setup Backend Virtual Environment
cd backend
python -m venv venv

```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configuration (.env)

Create a `.env` file in the `backend/` directory using the `.env.example`:

```env
# ── Firecrawl (Required for Data Extraction) ─────────────
FIRECRAWL_API_KEY=fc-YOUR-KEY

# ── Cloud Vector DB (Required for RAG) ───────────────────
PINECONE_API_KEY=pcsk_YOUR-KEY

# ── LLM Inference & Embedding ────────────────────────────
HF_TOKEN=hf_YOUR-KEY

# ── Fallback Setup (Used by LLM Provider) ────────────────
GEMINI_API_KEY=AIzaSy...
```

### 4. Build the Knowledge Base

Extract the Amenify website and build the Pinecone Index.

```bash
cd backend
# 1. Scrape the website into structured JSON
python scraper.py

# 2. Embed the JSON and Upsert to Pinecone Serverless
python knowledge_base.py
```

### 5. Start the Backend API

```bash
cd backend
uvicorn main:app --reload --port 8000
```

> The API server is ready at **http://localhost:8000**

### 6. Start the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

> Navigate to **http://localhost:5173** to interact with the responsive Amenify UI and Chatbot!

---

## 📡 Key Endpoints

| Method | Path                 | Description                            |
| ------ | -------------------- | -------------------------------------- |
| `POST` | `/api/chat`          | Streaming AI response with RAG context |
| `POST` | `/api/scrape`        | Trigger background re-scrape           |
| `GET`  | `/api/scrape-status` | Track scraping progress                |
| `GET`  | `/api/health`        | System health check                    |
