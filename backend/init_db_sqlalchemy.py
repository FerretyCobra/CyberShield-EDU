from app.main import Base, engine
from app.models import schema

print("Creating tables using SQLAlchemy...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print(f"Error creating tables: {e}")
