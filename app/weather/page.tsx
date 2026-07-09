'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Loader2, MapPin, Sprout, Sun } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import districts from '@/data/districts.json';
import { districtCoords } from '@/lib/district-coords';

type CropRecommendation = {
  crop: string;
  tamilName: string;
  status: 'recommended' | 'avoid';
  bestSeason: string;
  reason: string;
  suitabilityScore: number;
};

type WeatherData = {
  maxTemp: number;
  minTemp: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  summary: string;
  advisory: string;
  daily: { name: string; max: number; min: number; precipitation: number }[];
  recommended: CropRecommendation[];
  avoid: CropRecommendation[];
};

type OpenMeteoResponse = {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
  };
};

const fallbackRecommendations: CropRecommendation[] = [
  {
    crop: 'Paddy',
    tamilName: 'Paddy',
    status: 'recommended',
    bestSeason: 'Kharif',
    reason: 'Monitor the 7-day rainfall outlook before sowing and keep drainage ready.',
    suitabilityScore: 78,
  },
  {
    crop: 'Ragi',
    tamilName: 'Ragi',
    status: 'recommended',
    bestSeason: 'Kharif / Rabi',
    reason: 'Useful as a resilient option when rainfall is uncertain.',
    suitabilityScore: 72,
  },
];

export default function WeatherPage() {
  const [districtId, setDistrictId] = useState('coimbatore');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedDistrict = useMemo(
    () => districts.find((district) => district.id === districtId),
    [districtId],
  );

  async function fetchWeather(id = districtId) {
    const district = districts.find((item) => item.id === id);
    if (!district) return;

    setIsLoading(true);
    setError('');

    try {
      const coords = districtCoords[district.id];
      if (!coords) throw new Error('Missing district coordinates');

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=7`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather failed');

      const data = (await response.json()) as OpenMeteoResponse;
      const daily = data.daily?.time?.map((date, index) => ({
        date,
        maxTempC: data.daily?.temperature_2m_max?.[index] ?? 0,
        minTempC: data.daily?.temperature_2m_min?.[index] ?? 0,
        rainfallMM: data.daily?.precipitation_sum?.[index] ?? 0,
      })) ?? [];
      const weeklyRainfall = daily.reduce((sum, day) => sum + day.rainfallMM, 0);
      const todayMax = daily[0]?.maxTempC ?? 0;
      const todayMin = daily[0]?.minTempC ?? 0;
      const summary = weeklyRainfall > 30 ? 'rainy week expected' : weeklyRainfall > 5 ? 'light rainfall expected' : 'mostly dry forecast';

      setWeather({
        maxTemp: todayMax,
        minTemp: todayMin,
        rainfall: weeklyRainfall,
        humidity: 0,
        windSpeed: 0,
        summary,
        advisory: weeklyRainfall > 30
          ? 'Heavy rainfall is possible this week. Delay fresh sowing and clear drainage channels.'
          : 'Use the 7-day forecast to time irrigation, fertilizer, and field preparation.',
        daily: daily.map((day) => ({
          name: new Date(day.date).toLocaleDateString('en', { weekday: 'short' }),
          max: day.maxTempC,
          min: day.minTempC,
          precipitation: day.rainfallMM,
        })),
        recommended: fallbackRecommendations,
        avoid: weeklyRainfall > 30 ? [{
          crop: 'Cotton',
          tamilName: 'Cotton',
          status: 'avoid',
          bestSeason: 'Kharif',
          reason: 'Avoid during heavy rainfall windows because excess moisture can damage bolls.',
          suitabilityScore: 35,
        }] : [],
      });
    } catch {
      setError('Could not fetch weather. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-soil">Weather and Crop Recommendation</h1>
            <p className="font-tamil text-lg text-paddy">Weather-based crop planning</p>
            <p className="text-sm text-soil/60 mt-1">Seven-day forecast for Tamil Nadu districts with practical crop planning hints.</p>
          </div>

          <div className="bg-white rounded-xl border border-straw shadow-sm p-5 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <label>
                <span className="font-medium text-soil">District</span>
                <p className="font-tamil text-sm text-soil/60">District selection</p>
                <select
                  value={districtId}
                  onChange={(event) => {
                    setDistrictId(event.target.value);
                    setWeather(null);
                  }}
                  className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none"
                >
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>{district.en}</option>
                  ))}
                </select>
              </label>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchWeather()}
                className="self-end bg-turmeric text-white rounded-lg font-semibold h-11 px-6 shadow-lg shadow-turmeric/30 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sun className="w-4 h-4" />}
                Get Forecast
              </motion.button>
            </div>
            {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
          </div>

          {weather && (
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-5 mb-5">
              <section className="bg-paddy rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 text-white/80"><MapPin className="w-4 h-4" /> {selectedDistrict?.en}</div>
                <p className="font-tamil text-sm text-white/70">{selectedDistrict?.ta}</p>
                <div className="mt-6">
                  <p className="text-5xl font-semibold">{Math.round(weather.maxTemp)}°C</p>
                  <p className="text-white/80">High today · Low {Math.round(weather.minTemp)}°C</p>
                  <p className="mt-2 text-sm capitalize text-white/80">{weather.summary}</p>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-white/80">Weekly Rainfall</p>
                    <p className="text-xl font-semibold">{weather.rainfall.toFixed(1)} mm</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-white/80">Humidity</p>
                    <p className="text-xl font-semibold">{Math.round(weather.humidity)}%</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-white/80">Wind</p>
                    <p className="text-xl font-semibold">{Math.round(weather.windSpeed)} km/h</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-straw shadow-sm p-5">
                <h2 className="font-semibold text-soil mb-1">7-Day Forecast</h2>
                <p className="font-tamil text-sm text-soil/60 mb-4">Weekly weather outlook</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {weather.daily.map((day) => (
                    <div key={day.name} className={`rounded-lg p-3 text-center ${day.precipitation > 5 ? 'bg-turmeric-light' : 'bg-paddy-light'}`}>
                      <p className="text-xs text-soil/60">{day.name}</p>
                      {day.precipitation > 5 ? <CloudRain className="w-5 h-5 mx-auto text-turmeric my-2" /> : <Sun className="w-5 h-5 mx-auto text-paddy my-2" />}
                      <p className="text-sm font-semibold text-soil">{Math.round(day.min)}°-{Math.round(day.max)}°</p>
                      <p className="text-xs text-soil/60">{day.precipitation}mm</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          <section className="bg-white rounded-xl border border-straw shadow-sm p-5">
            <h2 className="font-semibold text-soil flex items-center gap-2"><Sprout className="w-5 h-5 text-paddy" /> Best Crops for {selectedDistrict?.en}</h2>
            <p className="font-tamil text-sm text-soil/60 mb-4">Recommended crops for current weather</p>

            {!weather ? (
              <p className="text-sm text-soil/60">Choose a district and fetch the forecast to see live crop recommendations.</p>
            ) : (
              <>
                <p className="mb-4 rounded-lg bg-paddy-light p-3 text-sm text-soil">{weather.advisory}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {weather.recommended.slice(0, 4).map((crop) => (
                    <div key={crop.crop} className="rounded-lg border border-straw p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-soil">{crop.crop}</p>
                          <p className="font-tamil text-sm text-soil/60">{crop.tamilName}</p>
                        </div>
                        <span className="rounded-full bg-paddy-light px-2 py-1 text-xs font-semibold text-paddy">{crop.suitabilityScore}%</span>
                      </div>
                      <p className="mt-3 text-xs text-soil/60">{crop.bestSeason}</p>
                      <p className="mt-2 line-clamp-3 text-sm text-soil/70">{crop.reason}</p>
                      <span className="inline-flex mt-3 px-3 py-1 rounded-full text-xs bg-paddy-light text-paddy">Good match</span>
                    </div>
                  ))}
                </div>
                {weather.avoid.length > 0 && (
                  <div className="mt-5 rounded-lg border border-terracotta/20 bg-terracotta/5 p-4">
                    <p className="font-semibold text-soil">Avoid for current weather</p>
                    <p className="mt-1 text-sm text-soil/60">
                      {weather.avoid.slice(0, 4).map((crop) => crop.crop).join(', ')}
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
