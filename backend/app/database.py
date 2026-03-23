from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Dùng SQLite để lưu dữ liệu thành 1 file vật lý (farm2vets.db) trong thư mục backend
SQLALCHEMY_DATABASE_URL = "sqlite:///./farm2vets.db"

# Nếu sau này dùng PostgreSQL, bạn chỉ cần đổi URL ở trên thành:
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # Chỉ cần thiết cho SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency để cấp phát Session cho mỗi request API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()