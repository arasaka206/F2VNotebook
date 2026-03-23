# 🌾 Farm2Vets Notebook

An AI-powered, notebook-style livestock management platform that connects **farmers** with **veterinarians**. Built with React + Vite + TypeScript (frontend) and FastAPI (backend).

---

## 📁 Project Structure

```
F2VNotebook/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # FastAPI (Python)
├── docker-compose.yml # Full-stack local startup
└── README.md
```

---

## 🚀 Quick Start

### Option A — Docker Compose (recommended)

```bash
# Copy env examples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start all services
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

---

### Option B — Run Independently

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at http://localhost:8000  
Swagger UI: http://localhost:8000/docs

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run dev server
npm run dev
```

Frontend will be available at http://localhost:5173

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `Farm2Vets API` | Application name |
| `DEBUG` | `true` | Enable debug mode |
| `CORS_ORIGINS` | `http://localhost:5173 http://localhost:3000` | Allowed CORS origins (space-separated) |
| `SECRET_KEY` | `change-me-in-production` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT expiry |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## 🗺️ API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/login` | Login (stub) |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/dashboard/summary` | Dashboard summary |
| `GET` | `/api/livestock/` | List livestock |
| `POST` | `/api/livestock/` | Create livestock |
| `GET` | `/api/livestock/{id}` | Get livestock |
| `PATCH` | `/api/livestock/{id}` | Update livestock |
| `DELETE` | `/api/livestock/{id}` | Delete livestock |
| `GET` | `/api/treatments/` | List treatments |
| `POST` | `/api/treatments/` | Create treatment |
| `GET` | `/api/sensors/latest` | Latest sensor reading |
| `POST` | `/api/sensors/ingest` | Ingest sensor data |
| `GET` | `/api/consults/vets` | Available vets |
| `GET` | `/api/consults/` | List consult requests |
| `POST` | `/api/consults/` | Create consult request |
| `PATCH` | `/api/consults/{id}` | Update consult status |
| `POST` | `/api/ai/chat` | AI assistant chat |

Full interactive docs: http://localhost:8000/docs

---

## 🎨 UI Features

- **Dark-mode dashboard** with notebook-style UX
- **Left sidebar** navigation: Dashboard, AI Herd Notebook, Livestock Profiles, Disease Risk Map, Vet Connect, Inventory, Reports
- **Dashboard cards**: Herd Health Score, Active Treatments, IoT Sensor readings, Disease Alert Level
- **Herd Growth Chart** (SVG placeholder, ready for Recharts)
- **AI Activity Stream** with event types (ai_note, treatment, consult, sensor)
- **Right panel**: Quick Actions (Voice Note, Photo Analysis, SOS), AI Chatbot, Vet Status + Consult Request

---

## 🧑‍💻 Development

### Stub Credentials (for auth testing)

| Username | Password | Role |
|----------|----------|------|
| `farmer1` | `farmer123` | Farmer |
| `vet1` | `vet123` | Vet |

---

## 🔮 Roadmap

- [ ] PostgreSQL integration (replace in-memory stores)
- [ ] JWT authentication middleware
- [ ] Real-time sensor WebSocket feed
- [ ] LLM integration for AI assistant (OpenAI / local model)
- [ ] Disease Risk Map (Leaflet.js / MapLibre)
- [ ] Mobile app (React Native)
