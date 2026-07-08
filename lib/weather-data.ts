// lib/weather-data.ts
// Two things live here:
// 1. GPS coordinates for all 38 districts (needed to call Open-Meteo)
// 2. Crop suitability rules — what weather conditions each crop needs

// ─── District Coordinates ─────────────────────────────────────────────────────
// Open-Meteo needs lat/lon to fetch weather for a specific location.
// These are the approximate centre coordinates for each district in Tamil Nadu.
export type DistrictCoords = {
  name: string;
  lat: number;   // latitude
  lon: number;   // longitude
};

export const DISTRICT_COORDS: DistrictCoords[] = [
  { name: "Ariyalur", lat: 11.1400, lon: 79.0786 },
  { name: "Chengalpattu", lat: 12.6840, lon: 79.9833 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Cuddalore", lat: 11.7480, lon: 79.7714 },
  { name: "Dharmapuri", lat: 12.1211, lon: 78.1582 },
  { name: "Dindigul", lat: 10.3624, lon: 77.9695 },
  { name: "Erode", lat: 11.3410, lon: 77.7172 },
  { name: "Kallakurichi", lat: 11.7383, lon: 78.9639 },
  { name: "Kanchipuram", lat: 12.8342, lon: 79.7036 },
  { name: "Kanyakumari", lat: 8.0883, lon: 77.5385 },
  { name: "Karur", lat: 10.9601, lon: 78.0766 },
  { name: "Krishnagiri", lat: 12.5186, lon: 78.2137 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Mayiladuthurai", lat: 11.1085, lon: 79.6534 },
  { name: "Nagapattinam", lat: 10.7672, lon: 79.8449 },
  { name: "Namakkal", lat: 11.2189, lon: 78.1674 },
  { name: "Nilgiris", lat: 11.4064, lon: 76.6932 },
  { name: "Perambalur", lat: 11.2334, lon: 78.8822 },
  { name: "Pudukkottai", lat: 10.3797, lon: 78.8205 },
  { name: "Ramanathapuram", lat: 9.3639, lon: 78.8320 },
  { name: "Ranipet", lat: 12.9274, lon: 79.3331 },
  { name: "Salem", lat: 11.6643, lon: 78.1460 },
  { name: "Sivaganga", lat: 9.8433, lon: 78.4809 },
  { name: "Tenkasi", lat: 8.9595, lon: 77.3161 },
  { name: "Thanjavur", lat: 10.7870, lon: 79.1378 },
  { name: "Theni", lat: 10.0104, lon: 77.4768 },
  { name: "Thoothukudi", lat: 8.7642, lon: 78.1348 },
  { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047 },
  { name: "Tirunelveli", lat: 8.7139, lon: 77.7567 },
  { name: "Tirupathur", lat: 12.4984, lon: 78.5663 },
  { name: "Tiruppur", lat: 11.1085, lon: 77.3411 },
  { name: "Tiruvallur", lat: 13.1432, lon: 79.9093 },
  { name: "Tiruvannamalai", lat: 12.2253, lon: 79.0747 },
  { name: "Tiruvarur", lat: 10.7661, lon: 79.6344 },
  { name: "Vellore", lat: 12.9165, lon: 79.1325 },
  { name: "Viluppuram", lat: 11.9401, lon: 79.4861 },
  { name: "Virudhunagar", lat: 9.5872, lon: 77.9514 },
];

// Helper: find coordinates for a district by name
export function getCoordsForDistrict(
  districtName: string
): DistrictCoords | undefined {
  return DISTRICT_COORDS.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase()
  );
}

// ─── Crop Suitability Rules ───────────────────────────────────────────────────
// Each crop has ideal ranges for temperature, rainfall, and humidity.
// If current weather falls within these ranges → recommend it.
// If weather is clearly outside the range → add it to avoid list with reason.

export type CropSuitabilityRule = {
  crop: string;
  tamilName: string;
  // Temperature range in Celsius
  minTempC: number;
  maxTempC: number;
  // Rainfall range in mm (monthly average equivalent)
  minRainfallMM: number;
  maxRainfallMM: number;
  // Humidity range in percentage
  minHumidity: number;
  maxHumidity: number;
  // Season this crop is best planted
  bestSeason: string;
  tamilBestSeason: string;
  // Why this crop suits these conditions
  suitabilityReason: string;
  tamilSuitabilityReason: string;
  // Why it fails in bad conditions
  avoidReason: string;
  tamilAvoidReason: string;
};

export const CROP_SUITABILITY_RULES: CropSuitabilityRule[] = [
  {
    crop: "Paddy",
    tamilName: "நெல்",
    minTempC: 20,
    maxTempC: 35,
    minRainfallMM: 4,
    maxRainfallMM: 25,
    minHumidity: 60,
    maxHumidity: 90,
    bestSeason: "Kharif (June–November)",
    tamilBestSeason: "குறுவை / சம்பா (ஜூன் - நவம்பர்)",
    suitabilityReason: "Current temperature and humidity are ideal for paddy growth. Good moisture levels support germination.",
    tamilSuitabilityReason: "தற்போதைய வெப்பநிலை மற்றும் ஈரப்பதம் நெல் வளர்ச்சிக்கு சிறந்தது. நல்ல ஈரப்பதம் முளைப்புக்கு உதவுகிறது.",
    avoidReason: "Paddy needs high humidity and consistent rainfall. Current conditions risk crop failure.",
    tamilAvoidReason: "நெல்லுக்கு அதிக ஈரப்பதம் மற்றும் சீரான மழை தேவை. தற்போதைய வறண்ட நிலை பயிர் இழப்பை ஏற்படுத்தும்.",
  },
  {
    crop: "Sorghum",
    tamilName: "சோளம்",
    minTempC: 20,
    maxTempC: 40,
    minRainfallMM: 1,
    maxRainfallMM: 10,
    minHumidity: 40,
    maxHumidity: 75,
    bestSeason: "Kharif / Rabi (Jan-Feb / Jul-Aug)",
    tamilBestSeason: "தை / ஆடிப் பட்டம்",
    suitabilityReason: "Warm weather and moderate humidity favor sorghum vegetative and grain-filling phases.",
    tamilSuitabilityReason: "வெப்பமான தட்பவெப்பநிலை மற்றும் மிதமான ஈரப்பதம் சோளத்தின் வளர்ச்சி மற்றும் கதிர் பிடிக்கும் பருவத்திற்கு உகந்தது.",
    avoidReason: "Excessive rainfall or severe waterlogging stunts sorghum growth and deteriorates roots.",
    tamilAvoidReason: "அதிகப்படியான மழைப்பொழிவு அல்லது நீர் தேங்குதல் சோளத்தின் வளர்ச்சியை பாதித்து வேர்களை அழுகச் செய்யும்.",
  },
  {
    crop: "Cumbu",
    tamilName: "கம்பு",
    minTempC: 25,
    maxTempC: 40,
    minRainfallMM: 0.5,
    maxRainfallMM: 8,
    minHumidity: 30,
    maxHumidity: 65,
    bestSeason: "Kharif (July–October)",
    tamilBestSeason: "ஆடிப் பட்டம் (ஜூலை - அக்டோபர்)",
    suitabilityReason: "Cumbu thrives in hot, dry weather — ideal for low rainfall districts.",
    tamilSuitabilityReason: "கம்பு வெப்பமான, வறண்ட காலநிலையில் நன்றாக வளரும் — குறைந்த மழை மாவட்டங்களுக்கு ஏற்றது.",
    avoidReason: "Cumbu is highly drought tolerant but waterlogging kills it quickly.",
    tamilAvoidReason: "கம்பு வறட்சியை தாங்கும் ஆனால் தேங்கும் நீர்நிலை இதனை மிக விரைவாக அழித்துவிடும்.",
  },
  {
    crop: "Maize",
    tamilName: "மக்காச்சோளம்",
    minTempC: 18,
    maxTempC: 35,
    minRainfallMM: 2,
    maxRainfallMM: 15,
    minHumidity: 50,
    maxHumidity: 80,
    bestSeason: "Kharif or Rabi",
    tamilBestSeason: "ஆடிப் பட்டம் / புரட்டாசிப் பட்டம்",
    suitabilityReason: "Moderate temperature and rainfall suit maize well. Good conditions for even germination.",
    tamilSuitabilityReason: "மிதமான வெப்பநிலை மக்காச்சோளத்திற்கு ஏற்றது. சீரான முளைப்புக்கு நல்ல சூழல்.",
    avoidReason: "Maize is sensitive to waterlogging. Current high rainfall may damage root system.",
    tamilAvoidReason: "மக்காச்சோளம் நீர்த்தேக்கத்திற்கு உணர்திறன் கொண்டது. அதிக மழை வேர் அமைப்பை சேதப்படுத்தலாம்.",
  },
  {
    crop: "Ragi",
    tamilName: "ராகி (கேழ்வரகு)",
    minTempC: 15,
    maxTempC: 32,
    minRainfallMM: 1,
    maxRainfallMM: 12,
    minHumidity: 30,
    maxHumidity: 70,
    bestSeason: "Kharif (July–September)",
    tamilBestSeason: "ஆடிப் பட்டம் (ஜூலை - செப்டம்பர்)",
    suitabilityReason: "Ragi is drought tolerant and thrives in moderate dry conditions.",
    tamilSuitabilityReason: "ராகி வறட்சியை தாங்கும் மற்றும் மிதமான வறண்ட சூழலில் நன்றாக வளரும்.",
    avoidReason: "Ragi does not tolerate waterlogging. Excess rain leads to root disease.",
    tamilAvoidReason: "ராகி நீர்த்தேக்கத்தை தாங்காது. அதிகப்படியான மழை வேர் அழுகல் நோய்க்கு வழிவகுக்கும்.",
  },
  {
    crop: "Redgram",
    tamilName: "துவரை",
    minTempC: 18,
    maxTempC: 35,
    minRainfallMM: 1,
    maxRainfallMM: 12,
    minHumidity: 45,
    maxHumidity: 75,
    bestSeason: "Kharif (June–July)",
    tamilBestSeason: "ஆனி / ஆடிப் பட்டம்",
    suitabilityReason: "Warm temperatures favor optimal vegetative growth and flowering profiles for pulses.",
    tamilSuitabilityReason: "வெப்பமான தட்பவெப்பநிலை துவரையின் சிறந்த பயிர் வளர்ச்சி மற்றும் பூக்கும் திறனுக்கு சாதகமாக இருக்கும்.",
    avoidReason: "Heavy continuous rains during flowering trigger severe flower drop and pod rot.",
    tamilAvoidReason: "பூக்கும் தருணத்தில் பெய்யும் தொடர் கனமழை பூக்கள் உதிர்வதற்கும் காய்கள் அழுகுவதற்கும் காரணமாகும்.",
  },
  {
    crop: "Greengram",
    tamilName: "பாசிப்பயறு",
    minTempC: 25,
    maxTempC: 35,
    minRainfallMM: 1,
    maxRainfallMM: 10,
    minHumidity: 45,
    maxHumidity: 75,
    bestSeason: "Kharif / Rabi / Rice Fallows",
    tamilBestSeason: "ஆடி / புரட்டாசி / நவரைப் பட்டம்",
    suitabilityReason: "Warm climate conditions accelerate early maturation and healthy pod development.",
    tamilSuitabilityReason: "வெப்பமான காலநிலை பாசிப்பயறின் விரைவான முதிர்ச்சிக்கும் ஆரோக்கியமான காய் வளர்ச்சிக்கும் உதவுகிறது.",
    avoidReason: "High moisture and heavy rain downpours cause foliage dampness and fungal spots.",
    tamilAvoidReason: "அதிகப்படியான ஈரப்பதம் மற்றும் பலத்த மழை இலைகளில் பூஞ்சை நோய்களை உருவாக்கி பயிரை கெடுக்கும்.",
  },
  {
    crop: "Blackgram",
    tamilName: "உளுந்து",
    minTempC: 25,
    maxTempC: 38,
    minRainfallMM: 1,
    maxRainfallMM: 10,
    minHumidity: 40,
    maxHumidity: 75,
    bestSeason: "Kharif or Rabi",
    tamilBestSeason: "காரிஃப் அல்லது ரபி (ஆடி / தைப் பட்டம்)",
    suitabilityReason: "Warm dry weather suits blackgram for pod filling and maturity.",
    tamilSuitabilityReason: "வெப்பமான வறண்ட காலநிலை உளுந்து காய் நிரப்புதல் மற்றும் முதிர்ச்சிக்கு ஏற்றது.",
    avoidReason: "Blackgram flowers drop in excessive humidity or rain, causing yield loss.",
    tamilAvoidReason: "அதிக ஈரப்பதம் அல்லது மழையில் உளுந்து பூக்கள் உதிரும், மகசூல் பெருமளவு குறையும்.",
  },
  {
    crop: "Bengalgram",
    tamilName: "கொண்டைக்கடலை",
    minTempC: 15,
    maxTempC: 30,
    minRainfallMM: 0.5,
    maxRainfallMM: 6,
    minHumidity: 30,
    maxHumidity: 65,
    bestSeason: "Rabi (October–November)",
    tamilBestSeason: "புரட்டாசி / ஐப்பசிப் பட்டம்",
    suitabilityReason: "Cooler initial temperatures and low ambient moisture stimulate excellent branching and yield.",
    tamilSuitabilityReason: "குறைந்த இரவு வெப்பநிலையும் மிதமான ஈரப்பதமும் கொண்டைக்கடலையின் கிளைப்புத் திறனையும் மகசூலையும் அதிகரிக்கும்.",
    avoidReason: "Excess humidity and cloudy conditions during winter enhance blight and pod borer issues.",
    tamilAvoidReason: "அதிக ஈரப்பதம் மற்றும் மேகமூட்டமான சூழல் கருகல் நோய் மற்றும் காய்ப்புழு தாக்குதலை ஊக்குவிக்கும்.",
  },
  {
    crop: "Cotton",
    tamilName: "பருத்தி",
    minTempC: 21,
    maxTempC: 37,
    minRainfallMM: 1,
    maxRainfallMM: 10,
    minHumidity: 40,
    maxHumidity: 70,
    bestSeason: "Kharif (June–October)",
    tamilBestSeason: "ஆடி / ஆவணிப் பட்டம்",
    suitabilityReason: "Warm and dry conditions are perfect for cotton. Low humidity prevents boll rot.",
    tamilSuitabilityReason: "வெப்பமான மற்றும் வறண்ட சூழல் பருத்திக்கு சிறந்தது. குறைந்த ஈரப்பதம் சப்பைகள் அழுகுவதை தடுக்கிறது.",
    avoidReason: "Excess humidity causes cotton boll rot. High rainfall damages the crop severely.",
    tamilAvoidReason: "அதிக ஈரப்பதம் பருத்தி காய் அழுகலை ஏற்படுத்தும். அதிக மழை அறுவடைத் தரத்தைக் கெடுக்கும்.",
  },
  {
    crop: "Groundnut",
    tamilName: "நிலக்கடலை",
    minTempC: 25,
    maxTempC: 38,
    minRainfallMM: 1,
    maxRainfallMM: 8,
    minHumidity: 35,
    maxHumidity: 65,
    bestSeason: "Kharif (June–September)",
    tamilBestSeason: "சித்திரை / ஆடிப் பட்டம்",
    suitabilityReason: "Hot and moderately dry weather suits groundnut perfectly. Good for pod formation.",
    tamilSuitabilityReason: "வெப்பமான மற்றும் மிதமாக வறண்ட காலநிலை நிலக்கடலைக்கு சிறந்தது; மண் இளக்கமாக இருக்க உதவும்.",
    avoidReason: "Groundnut pod development fails in waterlogged or overly humid conditions.",
    tamilAvoidReason: "நீர் தேங்கிய நிலத்திலோ அல்லது மிக அதிக ஈரப்பதத்திலோ நிலக்கடலை காய்கள் பிடிப்பது தடைபடும்.",
  },
  {
    crop: "Sugarcane",
    tamilName: "கரும்பு",
    minTempC: 21,
    maxTempC: 38,
    minRainfallMM: 3,
    maxRainfallMM: 20,
    minHumidity: 50,
    maxHumidity: 85,
    bestSeason: "Year-round (best Jan–March plant)",
    tamilBestSeason: "மார்கழி / தைப் பட்டம்",
    suitabilityReason: "Warm temperature with moderate rainfall creates ideal conditions for sugarcane growth.",
    tamilSuitabilityReason: "வெப்பமான வெப்பநிலை மற்றும் மிதமான மழை கரும்பு வளர்ச்சிக்கும் அதிக சர்க்கரை சத்துக்கும் சிறந்த சூழலாகும்.",
    avoidReason: "Sugarcane struggles in extremely dry or cold conditions. Growth rate drops significantly.",
    tamilAvoidReason: "மிகவும் வறண்ட வறட்சி நிலை அல்லது கடும் குளிர் சூழலில் கரும்பின் வளர்ச்சி வேகம் பெருமளவு குறையும்.",
  },
  {
    crop: "Sunflower",
    tamilName: "சூரியகாந்தி",
    minTempC: 20,
    maxTempC: 35,
    minRainfallMM: 1,
    maxRainfallMM: 10,
    minHumidity: 50,
    maxHumidity: 80,
    bestSeason: "Year-round (Kharif / Rabi focus)",
    tamilBestSeason: "சித்திரை / ஆடி / கார்த்திகைப் பட்டம்",
    suitabilityReason: "Bright sunlight hours coupled with balanced warmth support maximum oil synthesis.",
    tamilSuitabilityReason: "நல்ல சூரிய வெளிச்சமும் சீரான வெப்பமும் சூரியகாந்தியின் வித்துக்களில் எண்ணெய் சத்து கூட உதவுகிறது.",
    avoidReason: "Heavy precipitation during the flowering period stops pollination and leads to hollow seeds.",
    tamilAvoidReason: "பூக்கும் தருவாயில் பொழியும் பலத்த மழை மகரந்தச் சேர்க்கையை தடுத்து வெற்று விதைகள் உருவாகக் காரணமாகும்.",
  },
  {
    crop: "Soyabean",
    tamilName: "சோயாபீன்ஸ்",
    minTempC: 20,
    maxTempC: 35,
    minRainfallMM: 2,
    maxRainfallMM: 12,
    minHumidity: 50,
    maxHumidity: 80,
    bestSeason: "Kharif (June–July)",
    tamilBestSeason: "ஆடிப் பட்டம்",
    suitabilityReason: "Sufficient solar radiation and intermediate humidity favor steady bean expansion.",
    tamilSuitabilityReason: "போதுமான சூரிய ஒளியும் மிதமான ஈரப்பதமும் சோயாபீன்ஸ் காய்கள் சீராக பருப்பதற்குக் களம் அமைக்கும்.",
    avoidReason: "Prolonged water stress or soaking soil horizons hinders vital nitrogen fixation cycles.",
    tamilAvoidReason: "நீண்ட கால வறட்சி அல்லது வயலில் நீர் தேங்கி நிற்பது வேர்முடிச்சுகளின் நைட்ரஜன் சேகரிப்பை முடக்கும்.",
  },
  {
    crop: "Sesamum",
    tamilName: "எள்",
    minTempC: 25,
    maxTempC: 40,
    minRainfallMM: 0.5,
    maxRainfallMM: 6,
    minHumidity: 35,
    maxHumidity: 70,
    bestSeason: "Rabi / Summer (Dec-Feb)",
    tamilBestSeason: "மாசிப் பட்டம் / கோடைச் சாகுபடி",
    suitabilityReason: "High thermal units with nominal moisture levels prevent stem rot and preserve seeds.",
    tamilSuitabilityReason: "அதிக வெப்பமும் குறைந்த ஈரப்பதமும் எள்ளைத் தாக்கும் தண்டு அழுகல் நோயைத் தடுத்து விளைச்சலைக் காக்கும்.",
    avoidReason: "Even mild water stagnation results in instant wilting and massive crop destruction.",
    tamilAvoidReason: "சிறிதளவு நீர் தேங்கினாலும் எள் பயிர் உடனடியாக வாடி அழுகிவிடும் தன்மையுடையது.",
  },
  {
    crop: "Copra",
    tamilName: "கொப்பரை (உலர்த்துதல்)",
    minTempC: 25,
    maxTempC: 42,
    minRainfallMM: 0,
    maxRainfallMM: 4,
    minHumidity: 30,
    maxHumidity: 60,
    bestSeason: "Dry Months (March–June)",
    tamilBestSeason: "பங்குனி - ஆனி (கோடைக்காலம்)",
    suitabilityReason: "Hot sunshine patterns combined with lower humidity accelerate the natural drying parameters.",
    tamilSuitabilityReason: "தீவிர வெயிலும் குறைந்த காவி ஈரப்பதமும் தேங்காயைக் கொப்பரையாக விரைவாகவும் தரமாகவும் மாற்றும்.",
    avoidReason: "High moisture spikes and unexpected rain showers spark immediate mold and discoloration.",
    tamilAvoidReason: "அதிக ஈரப்பதம் மற்றும் எதிர்பாராத மழைப்பொழிவு கொப்பரையில் காளான் பூத்து நிறம் மாறச் செய்யும்.",
  },
  {
    crop: "Coconut",
    tamilName: "தென்னை (தேங்காய்)",
    minTempC: 20,
    maxTempC: 35,
    minRainfallMM: 3,
    maxRainfallMM: 20,
    minHumidity: 55,
    maxHumidity: 90,
    bestSeason: "Year-round",
    tamilBestSeason: "ஆண்டு முழுவதும் (ஜூன்-சூலை நடவு உகந்தது)",
    suitabilityReason: "Coconut adapts well to current warm humid conditions. Good for long-term plantation.",
    tamilSuitabilityReason: "தென்னை மரம் தற்போதைய வெப்பமான மற்றும் கடலோர ஈரப்பதச் சூழலை நன்கு ஏற்று நீண்ட காலப் பலன் தரும்.",
    avoidReason: "Coconut growth and button shedding issues accelerate in dry, low humidity conditions.",
    tamilAvoidReason: "நீண்ட வறண்ட காற்று மற்றும் குறைந்த ஈரப்பதம் காரணமாகத் தென்னையில் குரும்பைகள் உதிர்வது அதிகரிக்கும்.",
  },
];

// ─── Core Matching Logic ──────────────────────────────────────────────────────
// This function is the brain — it takes live weather numbers
// and returns which crops to recommend and which to avoid

export type WeatherConditions = {
  tempC: number;
  rainfallMM: number;   // daily rainfall
  humidity: number;     // percentage
};

export type CropRecommendation = {
  crop: string;
  tamilName: string;
  status: "recommended" | "avoid";
  bestSeason: string;
  tamilBestSeason: string;
  reason: string;
  tamilReason: string;
  suitabilityScore: number; // 0-100, how well weather matches
};

export function matchCropsToWeather(
  weather: WeatherConditions
): CropRecommendation[] {
  const results: CropRecommendation[] = [];

  for (const rule of CROP_SUITABILITY_RULES) {
    // Check each condition
    const tempOk =
      weather.tempC >= rule.minTempC && weather.tempC <= rule.maxTempC;
    const rainOk =
      weather.rainfallMM >= rule.minRainfallMM &&
      weather.rainfallMM <= rule.maxRainfallMM;
    const humidityOk =
      weather.humidity >= rule.minHumidity &&
      weather.humidity <= rule.maxHumidity;

    // Count how many conditions pass (out of 3)
    const passCount = [tempOk, rainOk, humidityOk].filter(Boolean).length;

    // Calculate a suitability score out of 100
    // Temperature is weighted highest (40%), then humidity (35%), then rainfall (25%)
    let score = 0;
    if (tempOk) score += 40;
    if (humidityOk) score += 35;
    if (rainOk) score += 25;

    if (passCount >= 2) {
      // At least 2 of 3 conditions pass → recommend
      results.push({
        crop: rule.crop,
        tamilName: rule.tamilName,
        status: "recommended",
        bestSeason: rule.bestSeason,
        tamilBestSeason: rule.tamilBestSeason,
        reason: rule.suitabilityReason,
        tamilReason: rule.tamilSuitabilityReason,
        suitabilityScore: score,
      });
    } else {
      // Less than 2 conditions pass → avoid
      results.push({
        crop: rule.crop,
        tamilName: rule.tamilName,
        status: "avoid",
        bestSeason: rule.bestSeason,
        tamilBestSeason: rule.tamilBestSeason,
        reason: rule.avoidReason,
        tamilReason: rule.tamilAvoidReason,
        suitabilityScore: score,
      });
    }
  }

  // Sort: recommended first (by score desc), then avoid (by score desc)
  return results.sort((a, b) => {
    if (a.status === b.status) return b.suitabilityScore - a.suitabilityScore;
    return a.status === "recommended" ? -1 : 1;
  });
}