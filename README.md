# AI-Powered Enterprise Architecture Intelligence Platform

## Overview

This project is an AI-powered enterprise architecture recommendation platform that analyzes business and technical requirements to generate scalable solution architectures.

The platform uses LLM orchestration, Retrieval-Augmented Generation (RAG), vector retrieval, and persistent architecture memory to recommend architecture patterns, services, infrastructure components, and governance workflows.

Users can:
- Enter requirements directly
- Upload requirement documents
- Generate architecture recommendations
- View architecture history
- Track governance status
- Retrieve similar architectures using RAG


--------------------------------------------------
TECH STACK
--------------------------------------------------

Frontend
- React
- Vite
- TailwindCSS
- Axios
- React Router

Backend
- FastAPI
- Python
- SQLAlchemy
- PostgreSQL

AI / Retrieval Layer
- Gemini
- LangChain
- ChromaDB
- Sentence Transformers


--------------------------------------------------
CORE FEATURES
--------------------------------------------------

- AI-powered architecture generation
- RAG-based architecture retrieval
- Enterprise architecture recommendations
- Governance workflow tracking
- Architecture history and persistence
- Frontend dashboard and detail views
- PostgreSQL persistence layer
- ChromaDB vector retrieval memory
- LangChain orchestration pipeline


--------------------------------------------------
SYSTEM WORKFLOW
--------------------------------------------------

```
Frontend Dashboard
        ↓
Requirement Input / Document Upload
        ↓
FastAPI Backend
        ↓
LangChain Orchestration
        ↓
RAG Retrieval using ChromaDB
        ↓
Gemini Architecture Generation
        ↓
PostgreSQL Persistence
        ↓
Structured API Response
        ↓
Frontend Visualization
```


--------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------

```
solution-agent/
│
├── backend/
│   ├── app/
│   │   ├── db/
│   │   ├── llm/
│   │   ├── rag/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```


--------------------------------------------------
SETUP GUIDE
--------------------------------------------------

Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL


--------------------------------------------------
BACKEND SETUP
--------------------------------------------------

1. Navigate to backend

cd backend


2. Create virtual environment

python -m venv .venv


3. Activate environment

Windows:
.venv\Scripts\activate

Mac/Linux:
source .venv/bin/activate


4. Install dependencies

pip install -r requirements.txt


5. Configure environment variables

Create a .env file inside backend:

GEMINI_API_KEY=your_api_key

POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=solution_agent
POSTGRES_HOST=localhost
POSTGRES_PORT=5432


6. Start backend server

python -m uvicorn app.main:app --reload


Backend runs on:
http://127.0.0.1:8000

Swagger Docs:
http://127.0.0.1:8000/docs


--------------------------------------------------
FRONTEND SETUP
--------------------------------------------------

1. Navigate to frontend

cd frontend


2. Install dependencies

npm install


3. Start frontend server

npm run dev


Frontend runs on:
http://localhost:5173


--------------------------------------------------
PRODUCTION BUILD
--------------------------------------------------

Frontend Build:

npm run build


--------------------------------------------------
API ENDPOINTS
--------------------------------------------------

Generate Architecture
POST /architecture/generate


Architecture History
GET /architecture/history


Architecture Detail
GET /architecture/{id}


Update Governance Status
PATCH /architecture/{id}/status


--------------------------------------------------
RAG WORKFLOW
--------------------------------------------------

The system uses Retrieval-Augmented Generation (RAG) to improve architecture recommendations.

Workflow:
1. Requirements are converted into embeddings
2. Similar architectures are retrieved from ChromaDB
3. Retrieved context is passed into Gemini
4. Architecture recommendations are generated
5. Generated architectures are stored in PostgreSQL
6. Embeddings are stored back into ChromaDB


--------------------------------------------------
CURRENT CAPABILITIES
--------------------------------------------------

- Architecture recommendation generation
- RAG retrieval pipeline
- PostgreSQL persistence
- Frontend dashboard integration
- Governance workflow
- Architecture history tracking
- Enterprise architecture reasoning


--------------------------------------------------
FUTURE IMPROVEMENTS
--------------------------------------------------

- Docker containerization
- Kubernetes deployment
- Authentication and RBAC
- Architecture comparison engine
- CI/CD integration
- Advanced analytics dashboard
- Multi-user governance workflows


--------------------------------------------------
NOTES
--------------------------------------------------

This project is under active development and focuses on enterprise AI orchestration, architecture intelligence, and retrieval-aware generation workflows.
