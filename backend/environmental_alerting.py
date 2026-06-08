def check_environmental_alerts(pm25, aqi):
    """
    Checks for environmental spikes based on PM2.5 and AQI levels.
    """
    pm25 = float(pm25)
    aqi = float(aqi)
    
    alerts = []
    
    # PM2.5 Spike Threshold (Hyperlocal sensing)
    if pm25 > 55:
        alerts.append({
            "type": "PM2.5 Spike",
            "level": "Hazardous",
            "value": pm25,
            "message": "Hyperlocal PM2.5 spike detected (>55 µg/m³). Respiratory protection required if outdoors."
        })
    elif pm25 > 35:
        alerts.append({
            "type": "PM2.5 Elevate",
            "level": "Warning",
            "value": pm25,
            "message": "Moderate PM2.5 levels. Consider closing windows."
        })
        
    # AQI Threshold
    if aqi > 100:
        alerts.append({
            "type": "AQI Warning",
            "level": "Unhealthy",
            "value": aqi,
            "message": "Unhealthy AQI levels for sensitive groups. Stay indoors."
        })
        
    return alerts

if __name__ == "__main__":
    print("Testing Alerts for high PM2.5:")
    print(check_environmental_alerts(60, 45))
    print("\nTesting Alerts for high AQI:")
    print(check_environmental_alerts(10, 150))
