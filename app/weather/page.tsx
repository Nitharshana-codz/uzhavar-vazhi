'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Loader2, MapPin, Sprout, Sun } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import districts from '@/data/districts.json';
import crops from '@/data/crops.json';
import { districtCoords } from '@/lib/district-coords';

type WeatherData = {
  maxTemp: number;
  minTemp: number;
  rainfall: number;
  daily: { name: string; max: number; min: number; precipitation: number }[];
};

export default function WeatherPage() {
  const [districtId, setDistrictId] = useState('coimbatore');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedDistrict = useMemo(() => districts.find((district) => district.id === districtId), [districtId]);
  const recommendedCrops = useMemo(() => {
    if (districtId === 'coimbatore') return crops.filter((crop) => ['cotton', 'maize', 'coconut', 'turmeric'].includes(crop.id));
    if (districtId === 'thanjavur') return crops.filter((crop) => ['paddy', 'sugarcane', 'coconut'].includes(crop.id));
    return crops.slice(0, 4);
  }, [districtId]);

  async function fetchWeather(id = districtId) {
    const coords = districtCoords[id];
    if (!coords) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=7`);
      if (!response.ok) throw new Error('Weather failed');
      const data = await response.json();
      setWeather({
        maxTemp: data.daily.temperature_2m_max[0],
        minTemp: data.daily.temperature_2m_min[0],
        rainfall: data.daily.precipitation_sum.reduce((sum: number, value: number) => sum + value, 0),
        daily: data.daily.time.map((date: string, index: number) => ({
          name: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
          max: data.daily.temperature_2m_max[index],
          min: data.daily.temperature_2m_min[index],
          precipitation: data.daily.precipitation_sum[index],
        })),
      });
    } catch {
      setError('Could not fetch weather. Please try again. / வானிலை தகவலை பெற முடியவில்லை.');
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
            <p className="font-tamil text-lg text-paddy">வானிலை மற்றும் பயிர் பரிந்துரை</p>
            <p className="text-sm text-soil/60 mt-1">Seven-day forecast for Tamil Nadu districts with practical crop planning hints.</p>
          </div>

          <div className="bg-white rounded-xl border border-straw shadow-sm p-5 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <label>
                <span className="font-medium text-soil">District</span>
                <p className="font-tamil text-sm text-soil/60">மாவட்டம்</p>
                <select
                  value={districtId}
                  onChange={(event) => {
                    setDistrictId(event.target.value);
                    setWeather(null);
                  }}
                  className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none"
                >
                  {districts.map((district) => <option key={district.id} value={district.id}>{district.en}</option>)}
                </select>
              </label>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => fetchWeather()} className="self-end bg-turmeric text-white rounded-lg font-semibold h-11 px-6 shadow-lg shadow-turmeric/30 flex items-center justify-center gap-2">
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
                </div>
                <div className="mt-6 rounded-lg bg-white/10 p-4">
                  <p className="text-sm text-white/80">Weekly Rainfall</p>
                  <p className="text-2xl font-semibold">{weather.rainfall.toFixed(1)} mm</p>
                </div>
              </section>

              <section className="bg-white rounded-xl border border-straw shadow-sm p-5">
                <h2 className="font-semibold text-soil mb-1">7-Day Forecast</h2>
                <p className="font-tamil text-sm text-soil/60 mb-4">7 நாட்கள் வானிலை</p>
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
            <p className="font-tamil text-sm text-soil/60 mb-4">இந்த பருவத்தில் சிறந்த பயிர்கள்</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recommendedCrops.map((crop) => (
                <div key={crop.id} className="rounded-lg border border-straw p-4">
                  <p className="font-semibold text-soil">{crop.en}</p>
                  <p className="font-tamil text-sm text-soil/60">{crop.ta}</p>
                  <span className="inline-flex mt-3 px-3 py-1 rounded-full text-xs bg-paddy-light text-paddy">Good match</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
