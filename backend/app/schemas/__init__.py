# backend/app/schemas/__init__.py
from .livestock import LivestockCreate, LivestockUpdate, LivestockOut
from .treatment import TreatmentCreate, TreatmentUpdate, TreatmentOut
from .sensor import SensorReadingCreate, SensorSummaryOut
from .consult import ConsultCreate, ConsultUpdate, ConsultOut
from .auth import LoginRequest, TokenOut, UserOut
from .ai import ChatRequest, ChatResponse
from .dashboard import DashboardSummaryOut

__all__ = [
    "LivestockCreate", "LivestockUpdate", "LivestockOut",
    "TreatmentCreate", "TreatmentUpdate", "TreatmentOut",
    "SensorReadingCreate", "SensorSummaryOut",
    "ConsultCreate", "ConsultUpdate", "ConsultOut",
    "LoginRequest", "TokenOut", "UserOut",
    "ChatRequest", "ChatResponse",
    "DashboardSummaryOut",
]
