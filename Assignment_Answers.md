# Amenify Assignment — Section 3: Reasoning & Design

---

## 1. How did you ingest and structure the data from the website?

I built an automated Python web crawler (`backend/scraper.py`) using `requests` and `BeautifulSoup4`.

**Pipeline:**
1. **Fetch** — Each page is fetched with a polite 0.5s delay between requests against 37 Amenify URLs (homepage, all service pages, FAQ, blog, about, careers, etc.)
2. **Link Extraction** — *Before* stripping noise elements, we extract every anchor tag on the page and save them as `{text, href}` pairs. These become the navigation guidance data.
3. **Text Extraction** — Noise elements (scripts, nav, footer, SVG, forms) are stripped; semantic content areas (`<main>`, `<article>`) are prioritized.
4. **Chunking** — Text is split into overlapping word-level chunks (400 words, 80-word overlap). Each chunk stores its `source_url` and the full `page_links` list from its page.
5. **Embedding** — OpenAI `text-embedding-3-small` embeds all chunks into 1536-dimensional vectors.
6. **Indexing** — A FAISS `IndexFlatIP` (inner product on L2-normalized vectors = cosine similarity) stores all vectors for fast retrieval.
7. **Incremental Upsert** — Re-scraping only updates chunks whose source URL is in the current batch; other chunks are preserved. This enables scalable partial updates.

**Self-Updating:** On startup, `background_scrape_loop()` launches as an asyncio task that re-scrapes every 60 minutes, rebuilds the FAISS index, and hot-reloads the KnowledgeBase atomically — **zero downtime updates**.

---

## 2. How did you reduce hallucinations?

A multi-layered approach:

1. **Strict context-only prompt** (`prompt_config.py`): The system prompt explicitly forbids the LLM from using pre-trained knowledge. Every claim must come from the injected RAG context.

2. **Hard fallback condition**: The prompt instructs: *"If the answer cannot be found in the context, respond EXACTLY: 'I don't know.'"* This is enforced at the prompt level, not just hoped for.

3. **Low temperature** (`temperature=0.2`): Minimizes creative speculation and random token sampling.

4. **Score threshold filtering**: Only chunks with cosine similarity ≥ 0.28 are included in the context. Low-relevance chunks (which could introduce off-topic noise) are discarded.

5. **Top-k limiting**: At most 5 chunks are injected. More context does not always mean better answers — it increases the chance of conflicting facts.

6. **Source attribution**: The bot returns which URLs the answer came from — making hallucinations auditable.

---

## 3. What are the limitations of your approach?

1. **Embedding model dependency**: All chunks are embedded with OpenAI's `text-embedding-3-small`. If the OpenAI API is unavailable, the system cannot serve queries — even when using Gemini or Ollama for chat generation.

2. **In-memory FAISS index**: The vector store is entirely in RAM. For 37 pages this is ~200MB — fine for a prototype. At 100,000+ pages this would be prohibitive.

3. **Static scrape list**: The system scrapes a pre-defined list of 37 URLs. Dynamic content not on this list (logged-in booking flows, real-time pricing, user-specific data) is never captured.

4. **Session storage is ephemeral**: Sessions are stored in a Python dict. A server restart or horizontal scale-out event wipes all session history. Not production-safe.

5. **No re-ranking**: Retrieved chunks are ranked purely by cosine similarity. A cross-encoder re-ranker would improve answer quality for ambiguous queries.

6. **Bot cannot take actions**: Ami can only inform — it cannot actually book a service, check user status, or modify a profile.

---

## 4. How would you scale this system?

### Knowledge Base Scaling
- Replace FAISS in-memory with **Pinecone**, **Qdrant**, or **Weaviate** — distributed, persistent, billion-scale vector search with filtering.
- Use **chunking with metadata filtering**: allow querying only chunks from specific page categories (services, FAQ, pricing) based on query intent.
- Add a **semantic cache** (Redis + cosine similarity on query embeddings): repeated similar queries never hit the LLM — massive cost and latency reduction at scale.

### Scraper Scaling
- Replace single-thread scraper with **Scrapy** or **Playwright** workers in a distributed queue (Celery + Redis).
- Add a **sitemap parser** to auto-discover new pages instead of maintaining a manual URL list.
- Use **webhook triggers** or **GitHub Actions** to trigger scrapes on detected site changes.

### API Scaling
- Containerize with **Docker** + deploy on **Google Cloud Run** (auto-scales to zero, handles burst traffic).
- Add **JWT authentication** for multi-tenant property manager APIs.
- Use **streaming responses** (already implemented) — critical for perceived latency at scale.
- Store sessions in **Redis** for distributed, persistent session management.

### LLM Cost Optimization
- Route simple/repetitive queries to smaller, cheaper models (Gemini Flash, GPT-3.5-turbo).
- Reserve GPT-4o for complex multi-turn conversations where accuracy is critical.
- Implement **output caching** for identical queries in the same session.

---

## 5. What improvements would you make for production use?

1. **Streaming UI already implemented** — SSE streaming (Server-Sent Events) is live. The ChatWidget consumes the stream token-by-token via `fetch` + `ReadableStream`, giving a ChatGPT-like real-time feel.

2. **Multi-modal support** — Allow users to upload images of their space for cleaning estimates or handyman assessments.

3. **Authentication + multi-tenancy** — Property managers should see different knowledge bases than residents. JWT + org-scoped vector namespaces in Pinecone.

4. **Analytics dashboard** — Track: most asked questions, "I don't know" rate, avg session length, bounce rate. Use this to identify knowledge base gaps.

5. **Human handoff** — When confidence is low or the user is frustrated, route to a real Amenify concierge agent via Intercom/Zendesk integration.

6. **A/B testing prompts** — Run different system prompt variants and measure answer quality, session satisfaction, and conversion to booking.

7. **Feedback loop** — Add 👍/👎 buttons per response. Feed negative signals back into a fine-tuning pipeline to improve the model over time.

8. **Proactive suggestions** — Analyze which service page a user is browsing and pre-stage relevant context so the bot can offer contextually relevant tips without being asked.

---

## Example Queries and Outputs

### Q1: What cleaning services does Amenify offer?
**Bot Response:**
> Amenify offers a range of cleaning services, including **apartment cleaning**, **house cleaning**, **deep cleaning**, and **move-out cleaning**. Trained, background-checked professionals follow a thorough checklist customized to your needs.
>
> **How to get there →**
> - [Book Cleaning Services](https://amenify.com/cleaningservices1)
> - [Move-Out Cleaning](https://amenify.com/movingoutservices1)
> - [Get Started — $50 Off](https://amenify.app.link/e/website-search)

---

### Q2: Is Amenify available in Chicago?
**Bot Response:**
> Yes! Amenify is live in **all cities across the US**, including Chicago. You can schedule cleaning, handyman, dog walking, and grocery delivery services directly from the Amenify app.
>
> **How to get there →**
> - [Cleaning Services in Chicago](https://amenify.com/cleaning-services-chicago-1)
> - [Download the Amenify App](https://amenify.app.link/e/website-search)

---

### Q3: What is the capital of France?
**Bot Response:**
> I don't know.

*(Correctly refuses off-topic questions not in the knowledge base.)*

---

### Q4: How do property managers partner with Amenify?
**Bot Response:**
> Property managers can partner with Amenify to access vetted service professionals, automated resident marketing, a real-time booking engine, and 7-day concierge support. Amenify handles all marketing assets, PMS integrations, and resident onboarding.
>
> **How to get there →**
> - [Property Managers Overview](https://amenify.com/property-managers-2)
> - [Leasing Concession Program](https://amenify.com/leasing-concession)
> - [Request a Demo](https://amenify.com/re-sales-lead-capture-form)
