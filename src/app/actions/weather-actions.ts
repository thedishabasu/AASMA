"use server"

export async function getLiveWeather() {
    const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
    const LAT = "37.7749";
    const LON = "-122.4194";

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`,
            { next: { revalidate: 600 } }
        );

        if (!response.ok) throw new Error("Weather service unavailable");

        const data = await response.json();
        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            feelsLike: data.main.feels_like,
            unit: "°C"
        };
    } catch (error) {
        console.error("Weather Fetch Error:", error);
        return {
            temp: 22.5,
            humidity: 45,
            pressure: 1012,
            feelsLike: 23,
            unit: "°C",
            isFallback: true
        };
    }
}
