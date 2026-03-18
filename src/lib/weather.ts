import { WEATHER } from "./config";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  description: string;
  city: string;
}

const SYMBOL_MAP: Record<string, string> = {
  clearsky_day: "Klarvær",
  clearsky_night: "Klarvær",
  fair_day: "Lettskyet",
  fair_night: "Lettskyet",
  partlycloudy_day: "Delvis skyet",
  partlycloudy_night: "Delvis skyet",
  cloudy: "Skyet",
  lightrainshowers_day: "Lette regnbyger",
  lightrainshowers_night: "Lette regnbyger",
  rainshowers_day: "Regnbyger",
  rainshowers_night: "Regnbyger",
  heavyrainshowers_day: "Kraftige regnbyger",
  heavyrainshowers_night: "Kraftige regnbyger",
  lightrain: "Lett regn",
  rain: "Regn",
  heavyrain: "Kraftig regn",
  lightsleetshowers_day: "Lette sluddbyger",
  lightsleetshowers_night: "Lette sluddbyger",
  sleetshowers_day: "Sluddbyger",
  sleetshowers_night: "Sluddbyger",
  sleet: "Sludd",
  lightsnowshowers_day: "Lette snøbyger",
  lightsnowshowers_night: "Lette snøbyger",
  snowshowers_day: "Snøbyger",
  snowshowers_night: "Snøbyger",
  lightsnow: "Lett snø",
  snow: "Snø",
  heavysnow: "Kraftig snø",
  fog: "Tåke",
  lightrainandthunder: "Lett regn og torden",
  rainandthunder: "Regn og torden",
  heavyrainandthunder: "Kraftig regn og torden",
};

function describeWind(speed: number): string {
  if (speed < 1) return "stille";
  if (speed < 4) return "svak vind";
  if (speed < 8) return "lett bris";
  if (speed < 14) return "frisk bris";
  if (speed < 21) return "liten kuling";
  if (speed < 25) return "sterk kuling";
  return "storm";
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const url = `${WEATHER.apiUrl}?lat=${WEATHER.lat}&lon=${WEATHER.lon}`;
    const response = await fetch(url, {
      headers: { "User-Agent": WEATHER.userAgent },
    });

    if (!response.ok) {
      console.error(`[Morgennytt] Yr.no API feil: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const first = data.properties?.timeseries?.[0];
    if (!first) return null;

    const instant = first.data.instant.details;
    const next1h = first.data.next_1_hours;
    const symbolCode = next1h?.summary?.symbol_code || "cloudy";

    return {
      temperature: Math.round(instant.air_temperature),
      windSpeed: instant.wind_speed,
      precipitation: next1h?.details?.precipitation_amount ?? 0,
      description: SYMBOL_MAP[symbolCode] || symbolCode.replace(/_/g, " "),
      city: WEATHER.city,
    };
  } catch (error) {
    console.error("[Morgennytt] Feil ved henting av værdata:", error);
    return null;
  }
}

export function formatWeatherHtml(weather: WeatherData): string {
  const wind = describeWind(weather.windSpeed);
  const precip =
    weather.precipitation > 0
      ? `, ${weather.precipitation} mm nedbør`
      : "";

  return `
    <div style="background:#f0f7ff;border-radius:8px;padding:16px;margin-bottom:20px">
      <h2 style="margin:0 0 8px 0;font-size:18px">☀️ Vær i ${weather.city}</h2>
      <p style="margin:0;font-size:16px">
        <strong>${weather.temperature}°C</strong> · ${weather.description} · ${wind}${precip}
      </p>
    </div>`;
}
