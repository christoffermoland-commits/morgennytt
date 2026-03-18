import { WEATHER } from "./config";

export interface TimePeriodWeather {
  label: string;
  time: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

export interface WeatherData {
  city: string;
  periods: TimePeriodWeather[];
}

const TIME_PERIODS = [
  { label: "Morgen", hour: 7 },
  { label: "Formiddag", hour: 10 },
  { label: "Ettermiddag", hour: 14 },
  { label: "Kveld", hour: 19 },
];

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

function findClosestEntry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timeseries: any[],
  targetHourUtc: number
): { instant: Record<string, number>; symbolCode: string; precipitation: number } | null {
  // Finn entry nærmest target-timen
  const today = new Date();
  const targetDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), targetHourUtc)
  );

  let closest = null;
  let closestDiff = Infinity;

  for (const entry of timeseries) {
    const entryTime = new Date(entry.time);
    const diff = Math.abs(entryTime.getTime() - targetDate.getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = entry;
    }
  }

  if (!closest) return null;

  const instant = closest.data.instant.details;
  const next1h = closest.data.next_1_hours || closest.data.next_6_hours;
  const symbolCode = next1h?.summary?.symbol_code || "cloudy";
  const precipitation = next1h?.details?.precipitation_amount ?? 0;

  return { instant, symbolCode, precipitation };
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
    const timeseries = data.properties?.timeseries;
    if (!timeseries || timeseries.length === 0) return null;

    // CET = UTC+1, CEST = UTC+2. Bruk offset 1 (vintertid) som standard.
    // Mars–oktober: offset 2 (sommertid)
    const month = new Date().getUTCMonth(); // 0-indexed
    const cetOffset = month >= 2 && month <= 9 ? 2 : 1;

    const periods: TimePeriodWeather[] = [];

    for (const period of TIME_PERIODS) {
      const targetHourUtc = period.hour - cetOffset;
      const entry = findClosestEntry(timeseries, targetHourUtc);
      if (!entry) continue;

      periods.push({
        label: period.label,
        time: `kl. ${String(period.hour).padStart(2, "0")}`,
        temperature: Math.round(entry.instant.air_temperature),
        windSpeed: entry.instant.wind_speed,
        precipitation: entry.precipitation,
        description:
          SYMBOL_MAP[entry.symbolCode] ||
          entry.symbolCode.replace(/_/g, " "),
      });
    }

    if (periods.length === 0) return null;

    return { city: WEATHER.city, periods };
  } catch (error) {
    console.error("[Morgennytt] Feil ved henting av værdata:", error);
    return null;
  }
}

export function formatWeatherHtml(weather: WeatherData): string {
  const rows = weather.periods
    .map((p) => {
      const wind = describeWind(p.windSpeed);
      const precip = p.precipitation > 0 ? `${p.precipitation} mm` : "—";

      return `
        <tr>
          <td style="padding:6px 12px 6px 0;font-weight:600;white-space:nowrap">${p.label}</td>
          <td style="padding:6px 12px 6px 0;white-space:nowrap"><strong>${p.temperature}°C</strong></td>
          <td style="padding:6px 12px 6px 0">${p.description}</td>
          <td style="padding:6px 12px 6px 0">${wind}</td>
          <td style="padding:6px 0;text-align:right">${precip}</td>
        </tr>`;
    })
    .join("\n");

  return `
    <div style="background:#f0f7ff;border-radius:8px;padding:16px;margin-bottom:20px">
      <h2 style="margin:0 0 12px 0;font-size:18px">☀️ Vær i ${weather.city}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">
            <th style="padding:0 12px 6px 0;text-align:left">Tid</th>
            <th style="padding:0 12px 6px 0;text-align:left">Temp</th>
            <th style="padding:0 12px 6px 0;text-align:left">Vær</th>
            <th style="padding:0 12px 6px 0;text-align:left">Vind</th>
            <th style="padding:0 0 6px 0;text-align:right">Nedbør</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}
