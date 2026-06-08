import mysql.connector
import json
import datetime
import random
import os

# Configuración de BD
DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_USER = os.environ.get("DB_USERNAME", "root")
DB_PASS = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_DATABASE", "eva_db")

def connect_db():
    try:
        return mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
    except Exception as e:
        print(f"Error conectando a la BD: {e}")
        return None

def generate_demand_forecast():
    # Fechas especificas
    today = datetime.date.today()
    forecast = []
    base_sales = random.randint(80, 150)
    for i in range(1, 8):
        target_date = today + datetime.timedelta(days=i)
        
        # Simular picos los fines de semana
        multiplier = 1.3 if target_date.weekday() >= 5 else 1.0
        
        expected = int(base_sales * multiplier * random.uniform(0.9, 1.1))
        forecast.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day_name": target_date.strftime("%A"),
            "expected_sales": expected,
            "confidence": round(random.uniform(0.75, 0.95), 2)
        })
    return forecast

def generate_combo_suggestions():
    return [
        {
            "products": ["Café Americano", "Croissant Clásico"],
            "confidence": 0.92,
            "reason": "Comprados juntos en el 45% de las transacciones matutinas."
        },
        {
            "products": ["Frappuccino Moca", "Galleta con Chispas"],
            "confidence": 0.85,
            "reason": "Tendencia al alza en compras de estudiantes por la tarde."
        }
    ]

def generate_restock_alerts():
    return [
        {
            "ingredient": "Leche Entera",
            "quantity": 15,
            "unit": "Litros",
            "urgency": "Alta",
            "reason": "Pronóstico de alta demanda de cafés con leche este fin de semana."
        },
        {
            "ingredient": "Granos de Café Espresso",
            "quantity": 5,
            "unit": "Kg",
            "urgency": "Media",
            "reason": "Consumo 20% mayor al promedio en los últimos 3 días."
        }
    ]

def sync_ai():
    print("Iniciando sincronización de IA (Modo Mocker)...")
    db = connect_db()
    if not db:
        print("Saliendo por error de conexión.")
        return

    cursor = db.cursor()

    try:
        # Limpiar caché anterior
        cursor.execute("TRUNCATE TABLE ai_recommendations")
        
        # Generar datos
        forecast = generate_demand_forecast()
        combos = generate_combo_suggestions()
        restock = generate_restock_alerts()

        # Insertar
        insert_query = "INSERT INTO ai_recommendations (type, data, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())"
        cursor.executemany(insert_query, [
            ("demand_forecast", json.dumps(forecast)),
            ("combo_suggestion", json.dumps(combos)),
            ("restock_alert", json.dumps(restock))
        ])

        db.commit()
        print("✅ Sincronización IA completada exitosamente.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error durante sincronización: {e}")
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    sync_ai()
