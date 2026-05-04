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
| `GET` | `/api/sensors/aggregate` | Statistical aggregates (24h, custom window) |
| `POST` | `/api/sensors/ingest` | Ingest sensor data |
| `GET` | `/api/consults/vets` | Available vets |
| `GET` | `/api/consults/` | List consult requests |
| `POST` | `/api/consults/` | Create consult request |
| `PATCH` | `/api/consults/{id}` | Update consult status |
| `POST` | `/api/ai/chat` | AI assistant chat |

Full interactive docs: http://localhost:8000/docs

---

## 📡 IoT Sensor Data Flow

This section explains how sensor data from IoT devices flows from collection to frontend display.

### 🏗️ Architecture Overview

```
IoT Sensors → Backend API → Database → Frontend Dashboard
     ↓            ↓            ↓            ↓
  BME280      FastAPI      SQLite      React Components
  (Temp/      /ingest      sensor_     SensorCard
   Humidity)   endpoint     readings   + StatCards
```

### 1. 📥 Data Collection (IoT Sensors)

**Supported Sensors:**
- **BME280**: Temperature (°C) + Humidity (%) 
- **MQ-135**: Ammonia (ppm) - *planned integration*

**Data Format:**
```json
{
  "barn_id": "barn-1",
  "temperature_c": 28.5,
  "humidity_pct": 65.2,
  "ammonia_ppm": 12.3
}
```

**API Endpoint:** `POST /api/sensors/ingest`
- Accepts partial data (nullable fields allowed)
- Automatic status calculation based on thresholds
- Real-time processing with immediate database storage

### 2. 🔄 Backend Processing

**Status Logic:**
```python
status = "ok"
if temperature_c > 35.0:
    status = "warning" 
if ammonia_ppm > 25.0:
    status = "danger"
```

**Database Schema** (`sensor_readings` table):
- `id`: UUID primary key
- `barn_id`: Barn identifier (indexed)
- `temperature_c`: Float (nullable)
- `humidity_pct`: Float (nullable) 
- `ammonia_ppm`: Float (nullable)
- `status`: String ("ok" | "warning" | "danger")
- `timestamp`: DateTime (auto-generated)

**Available Endpoints:**
- `GET /api/sensors/latest` - Most recent reading across all barns
- `GET /api/sensors/aggregate?barn_id=X&window_hours=Y` - Statistical aggregates

### 3. 📊 Frontend Display

**Real-time Updates:**
- Dashboard auto-refreshes every 10 seconds
- Fetches latest sensor data on load
- Displays current readings with status indicators

**Components:**
- **SensorCard**: Real-time temperature, humidity, ammonia with progress bars
- **StatCards**: 24h aggregates (avg temp, humidity, ammonia, data points)
- **Status Colors**: 
  - 🟢 Green: "ok" (normal conditions)
  - 🟡 Yellow: "warning" (elevated readings)  
  - 🔴 Red: "danger" (critical thresholds exceeded)

**Data Flow in Code:**
```typescript
// services/farm2vets.ts
export const fetchLatestSensor = async (): Promise<SensorReading> => {
  const { data } = await api.get<SensorReading>('/sensors/latest');
  return data;
};

// pages/Dashboard.tsx  
const [summary, setSummary] = useState<DashboardSummary | null>(null);
useEffect(() => {
  const interval = setInterval(() => loadDashboardData(), 10000);
  return () => clearInterval(interval);
}, []);
```

### 4. 🚀 Integration Examples

**Simulate Sensor Data:**
```bash
# Send test sensor reading
curl -X POST http://localhost:8000/api/sensors/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "barn_id": "barn-1",
    "temperature_c": 32.1,
    "humidity_pct": 78.5,
    "ammonia_ppm": 18.2
  }'
```

**Query Sensor Data:**
```bash
# Get latest reading
curl http://localhost:8000/api/sensors/latest

# Get 24h aggregates for barn-1
curl "http://localhost:8000/api/sensors/aggregate?barn_id=barn-1&window_hours=24"
```

### 5. 🔧 Configuration & Thresholds

**Alert Thresholds** (configurable in backend):
- **Temperature**: >35°C = Warning
- **Ammonia**: >25 ppm = Danger

**Environment Variables:**
- `VITE_API_URL`: Frontend API base URL (default: http://localhost:8000)

**Database:**
- SQLite file: `backend/farm2vets.db`
- Auto-created on first run
- Persistent storage across restarts

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
