import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# Define SQLite database path
DATABASE_URL = "sqlite:///aasma.db"
engine = create_engine(DATABASE_URL, echo=False)

Base = declarative_base()

class Patient(Base):
    __tablename__ = 'patients'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    base_risk_score = Column(Float, nullable=False, default=0.0) # EHR feature
    comorbidities = Column(String, default="") # JSON or comma-separated EHR feature
    
    vitals = relationship("Vitals", back_populates="patient", cascade="all, delete-orphan")
    
class Vitals(Base):
    """Stores telemetry from wearables every 10 seconds."""
    __tablename__ = 'vitals'
    
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Direct wearable signals
    heart_rate = Column(Float, nullable=False)
    hrv = Column(Float, nullable=False) # Heart Rate Variability
    systolic_bp = Column(Float, nullable=False)
    diastolic_bp = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    activity_level = Column(Float, nullable=False) # e.g., 0.0 to 10.0 scale
    
    patient = relationship("Patient", back_populates="vitals")

class EnvironmentalData(Base):
    """Stores hyperlocal environmental feeds."""
    __tablename__ = 'environmental_data'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    location = Column(String, nullable=False, default="Local")
    
    pm25 = Column(Float, nullable=False)
    aqi = Column(Float, nullable=False)

# Session factory for DB operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
