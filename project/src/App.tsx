import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Loader2, 
  MapPin, 
  ThermometerSun, 
  Wind, 
  Droplets, 
  Clock, 
  Sun, 
  Sunset, 
  Eye, 
  CloudRain,
  AlertTriangle,
  Gauge,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface WeatherData {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    weathercode: number[];
    precipitation_probability: number[];
    uv_index: number[];
    visibility: number[];
    relativehumidity_2m: number[];
    windspeed_10m: number[];
    windgusts_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
  hourly_units: {
    temperature_2m: string;
    apparent_temperature: string;
  };
}

const getWeatherDescription = (code: number): string => {
  if (code <= 3) return "Clear to Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  return "Thunderstorm";
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

const getUVIndexDescription = (uvIndex: number): string => {
  if (uvIndex <= 2) return "Low";
  if (uvIndex <= 5) return "Moderate";
  if (uvIndex <= 7) return "High";
  if (uvIndex <= 10) return "Very High";
  return "Extreme";
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelsius, setShowCelsius] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true&hourly=temperature_2m,apparent_temperature,weathercode,precipitation_probability,uv_index,visibility,relativehumidity_2m,windspeed_10m,windgusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=America/New_York'
        );
        
        if (!response.ok) throw new Error('Weather data fetch failed');
        
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError('Failed to load weather data');
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentHourIndex = weather ? weather.hourly.time.findIndex((time) => {
    return new Date(time).getHours() === new Date().getHours();
  }) : -1;
  
  const nextSixHours = weather?.hourly.time.slice(currentHourIndex, currentHourIndex + 6) || [];
  const hourlyTemps = weather?.hourly.temperature_2m.slice(currentHourIndex, currentHourIndex + 6) || [];
  const hourlyFeelsLike = weather?.hourly.apparent_temperature.slice(currentHourIndex, currentHourIndex + 6) || [];
  const hourlyWeatherCodes = weather?.hourly.weathercode.slice(currentHourIndex, currentHourIndex + 6) || [];

  const formatTemp = (temp: number) => {
    if (showCelsius) {
      return `${Math.round(temp)}°C`;
    }
    return `${Math.round(celsiusToFahrenheit(temp))}°F`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-gray-600" />
            <h1 className="text-xl font-semibold text-gray-800">New York</h1>
          </div>
          <button
            onClick={() => setShowCelsius(!showCelsius)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-600 text-sm font-medium transition-colors"
          >
            Switch to {showCelsius ? '°F' : '°C'}
          </button>
        </div>

        {weather && (
          <>
            <div className="text-sm text-gray-600 mb-6">
              {formatDate(weather.current_weather.time)}
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2">
                <ThermometerSun className="text-orange-500 w-6 h-6" />
                <span className="text-4xl font-bold text-gray-800">
                  {formatTemp(weather.current_weather.temperature)}
                </span>
              </div>
              <div className="text-gray-600 mt-1">
                Feels like {formatTemp(hourlyFeelsLike[0])}
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <ArrowUp className="text-red-500 w-4 h-4" />
                  <span className="text-sm">{formatTemp(weather.daily.temperature_2m_max[0])}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDown className="text-blue-500 w-4 h-4" />
                  <span className="text-sm">{formatTemp(weather.daily.temperature_2m_min[0])}</span>
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                {getWeatherDescription(weather.current_weather.weathercode)}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Sun className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">UV Index</p>
                  <p className="font-semibold text-gray-800">
                    {Math.round(weather.hourly.uv_index[currentHourIndex])} ({getUVIndexDescription(weather.hourly.uv_index[currentHourIndex])})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Wind className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Wind</p>
                  <p className="font-semibold text-gray-800">
                    {weather.current_weather.windspeed} km/h {getWindDirection(weather.current_weather.winddirection)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Gauge className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Wind Gusts</p>
                  <p className="font-semibold text-gray-800">
                    {Math.round(weather.hourly.windgusts_10m[currentHourIndex])} km/h
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Droplets className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="font-semibold text-gray-800">
                    {weather.hourly.relativehumidity_2m[currentHourIndex]}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Eye className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Visibility</p>
                  <p className="font-semibold text-gray-800">
                    {(weather.hourly.visibility[currentHourIndex] / 1000).toFixed(1)} km
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <CloudRain className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Precipitation</p>
                  <p className="font-semibold text-gray-800">
                    {weather.hourly.precipitation_probability[currentHourIndex]}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Sun className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Sunrise</p>
                  <p className="font-semibold text-gray-800">
                    {formatTime(weather.daily.sunrise[0])}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Sunset className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Sunset</p>
                  <p className="font-semibold text-gray-800">
                    {formatTime(weather.daily.sunset[0])}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-gray-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Hourly Forecast</h2>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {nextSixHours.map((time, index) => (
                  <div key={time} className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">{formatTime(time)}</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{formatTemp(hourlyTemps[index])}</p>
                    <p className="text-xs text-gray-500 mt-1">Feels {formatTemp(hourlyFeelsLike[index])}</p>
                    <p className="text-xs text-gray-600 mt-1">{getWeatherDescription(hourlyWeatherCodes[index])}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;