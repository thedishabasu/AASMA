import asyncio
import random
from datetime import datetime
from database import SessionLocal, Patient, Vitals, EnvironmentalData, init_db

# Initialize database
init_db()

async def stream_patient_vitals(patient_id: int):
    """Asynchronous wearable telemetry stream generating vitals every 10 seconds."""
    print(f"[Telemetry Stream] Starting wearable vitals generation for Patient {patient_id}")
    while True:
        try:
            with SessionLocal() as db:
                db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
                if not db_patient:
                    # Create a dummy patient if not exists for simulation
                    db_patient = Patient(
                        id=patient_id, 
                        name=f"Synthetic Patient {patient_id}", 
                        age=random.randint(45, 80),
                        base_risk_score=random.uniform(0.1, 0.9),
                        comorbidities="Hypertension, Diabetes" if random.random() > 0.5 else "None"
                    )
                    db.add(db_patient)
                    db.commit()

                # Generate realistic vitals (with some noise)
                hr = random.uniform(60.0, 110.0)
                hrv = random.uniform(20.0, 80.0)
                sys_bp = random.uniform(110.0, 160.0)
                dia_bp = random.uniform(70.0, 100.0)
                spo2 = random.uniform(92.0, 100.0)
                temp = random.uniform(36.1, 38.5)
                activity = random.uniform(0.0, 10.0)

                vitals = Vitals(
                    patient_id=patient_id,
                    timestamp=datetime.utcnow(),
                    heart_rate=hr,
                    hrv=hrv,
                    systolic_bp=sys_bp,
                    diastolic_bp=dia_bp,
                    spo2=spo2,
                    temperature=temp,
                    activity_level=activity
                )
                db.add(vitals)
                db.commit()
                # print(f"[Telemetry] Vitals updated for patient {patient_id}: HR={hr:.1f}, SpO2={spo2:.1f}%")
        except Exception as e:
            print(f"[Telemetry Error] Patient {patient_id}: {e}")
        
        await asyncio.sleep(10) # 10 seconds intervals


async def stream_environmental_data():
    """Simultaneously reads PM2.5 and AQI values from hyperlocal sensor feeds."""
    print("[Environment Stream] Starting hyperlocal environmental data feed")
    while True:
        try:
            with SessionLocal() as db:
                # Generate environment data
                pm25 = random.uniform(10.0, 150.0)
                aqi = pm25 * 1.5 + random.uniform(-10, 10)
                
                env_data = EnvironmentalData(
                    timestamp=datetime.utcnow(),
                    location="New York Area - Sensor A",
                    pm25=pm25,
                    aqi=aqi
                )
                db.add(env_data)
                db.commit()
                # print(f"[Environment] Update: PM2.5={pm25:.1f} µg/m³, AQI={aqi:.1f}")
        except Exception as e:
            print(f"[Environment Error]: {e}")
            
        await asyncio.sleep(60) # Generate roughly every minute for env data

async def run_data_ingestion_simulation(num_patients: int = 5):
    """Start telemetry streams for N patients and 1 environmental feed."""
    tasks = [stream_environmental_data()]
    for i in range(1, num_patients + 1):
        tasks.append(stream_patient_vitals(i))
    
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    try:
        asyncio.run(run_data_ingestion_simulation(2))
    except KeyboardInterrupt:
        print("Data Ingestion Terminated.")
