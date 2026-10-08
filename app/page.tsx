"use client";

import { useEffect, useState } from "react";
import WeatherMap from "./WeatherMap";

type Location = {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

type Weather = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  weatherCode: number;
  daily: {
    time: string[];
    weatherCode: number[];
    max: number[];
    min: number[];
  };
};

type WeatherInfo = {
  label: string;
  icon: string;
  personality: string;
};

export default function Home() {
  const [city, setCity] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [recentCities, setRecentCities] = useState<string[]>([]);

  // Load Mangalagiri when the app opens
  useEffect(() => {
    const saved = localStorage.getItem("skytxt-recent-cities");

  if (saved) {
    setRecentCities(JSON.parse(saved));
  }
    loadCity("Mangalagiri");
  }, []);

  async function loadCity(cityName: string) {
    setLoading(true);
    setError("");

    try {
      // 1. Find the city coordinates
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );

      if (!locationResponse.ok) {
        throw new Error("Could not search for that city.");
      }

      const locationData = await locationResponse.json();

      if (!locationData.results || locationData.results.length === 0) {
        throw new Error(`I couldn't find "${cityName}".`);
      }

      const result = locationData.results[0];

      const foundLocation: Location = {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country,
        admin1: result.admin1,
      };

      // 2. Get weather for those coordinates
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error("The weather service is unavailable right now.");
      }

      const weatherData = await weatherResponse.json();

      setLocation(foundLocation);

      const updatedRecent = [
  foundLocation.name,
  ...recentCities.filter(
    (savedCity) =>
      savedCity.toLowerCase() !== foundLocation.name.toLowerCase()
  ),
].slice(0, 5);

setRecentCities(updatedRecent);

localStorage.setItem(
  "skytxt-recent-cities",
  JSON.stringify(updatedRecent)
);

      setWeather({
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        pressure: weatherData.current.surface_pressure,
        weatherCode: weatherData.current.weather_code,
        daily: {
          time: weatherData.daily.time,
          weatherCode: weatherData.daily.weather_code,
          max: weatherData.daily.temperature_2m_max,
          min: weatherData.daily.temperature_2m_min,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while checking the sky."
      );
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

    function useMyLocation() {
    setSearching(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      setSearching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        let detectedCity = "Your Location";
let detectedCountry = "GPS";

try {
  const locationResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
  );

  if (locationResponse.ok) {
    const locationData = await locationResponse.json();

    const address = locationData.address;

    detectedCity =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "Your Location";

    detectedCountry = address.country || "GPS";
  }
} catch {
  // If reverse geocoding fails, keep the fallback name.
}

        try {
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
          );

          if (!weatherResponse.ok) {
            throw new Error("The weather service is unavailable right now.");
          }

          const weatherData = await weatherResponse.json();

          setLocation({
            name: detectedCity,
            latitude,
            longitude,
            country: detectedCountry,
          });

          setWeather({
            temperature: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: weatherData.current.wind_speed_10m,
            pressure: weatherData.current.surface_pressure,
            weatherCode: weatherData.current.weather_code,
            daily: {
              time: weatherData.daily.time,
              weatherCode: weatherData.daily.weather_code,
              max: weatherData.daily.temperature_2m_max,
              min: weatherData.daily.temperature_2m_min,
            },
          });
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while checking your location."
          );
        } finally {
          setSearching(false);
        }
      },
      (error) => {
        setSearching(false);

        if (error.code === error.PERMISSION_DENIED) {
          setError("Location permission was denied. You can still search for a city.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setError("Your location could not be determined.");
        } else {
          setError("We couldn't get your location. Try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  function handleSearch() {
    const trimmedCity = city.trim();

    if (!trimmedCity) return;

    setSearching(true);
    loadCity(trimmedCity);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  const weatherInfo = weather
    ? getWeatherInfo(weather.weatherCode, weather.temperature)
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#121214] text-[#F3ECE0]">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#4A1521] blur-3xl" />

        <div className="absolute right-[-180px] top-[20%] h-[450px] w-[450px] rounded-full bg-[#6B2938] blur-3xl" />

        <div className="absolute bottom-[-250px] left-[30%] h-[500px] w-[500px] rounded-full bg-[#4A1521] blur-3xl" />

        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        {/* HEADER */}
        <header className="flex items-start justify-between border-b border-[#A68B91]/30 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-4xl font-black tracking-tight sm:text-5xl">
                SKY
                <span className="text-[#C58F9B]">TXT</span>
              </h1>

              <span className="rotate-[-8deg] rounded-full border border-[#C58F9B] px-2 py-1 text-xs text-[#C58F9B]">
                weather.exe
              </span>
            </div>

            <p className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-[#A68B91]">
              a weather app that talks like the internet
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="font-mono text-xs text-[#A68B91]">
              STATUS // ONLINE
            </p>

            <p className="mt-1 text-sm text-[#F3ECE0]">
              ✦ somewhere under the sky
            </p>
          </div>
        </header>

        {/* HERO */}
        <section className="relative py-10 lg:py-16">
          <div className="absolute right-2 top-8 hidden rotate-6 font-serif text-lg italic text-[#C58F9B] md:block">
            look outside ↓
          </div>

          <div className="max-w-4xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-[#A68B91]">
              // atmospheric conditions
            </p>

            <h2 className="font-serif text-5xl font-black leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              WHAT&apos;S
              <br />
              THE SKY
              <br />
              <span className="text-[#C58F9B]">DOING?</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#D7CDD0]">
              Real weather data, tiny weather thoughts, questionable sky
              opinions. Basically, a little internet diary for whatever is
              happening outside.
            </p>
          </div>

          {/* SEARCH */}
          <div className="mt-8 max-w-3xl">
            <div className="relative flex items-center border-2 border-[#F3ECE0] bg-[#F3ECE0] p-1 shadow-[8px_8px_0_#6B2938]">
              <span className="px-4 text-xl text-[#4A1521]">⌕</span>

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type a city..."
                className="min-w-0 flex-1 bg-transparent px-2 py-4 font-mono text-sm text-[#121214] outline-none placeholder:text-[#A68B91]"
              />

              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-[#4A1521] px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#F3ECE0] transition hover:bg-[#6B2938] disabled:cursor-wait disabled:opacity-60"
              >
                {searching ? "Checking..." : "Search"}
              </button>
            </div>

            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[#A68B91]">
              try: Hyderabad · Tokyo · Seoul · London
            </p>

            {recentCities.length > 0 && (
  <div className="mt-6">
    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-[#A68B91]">
      // recent skies
    </p>

    <div className="flex flex-wrap gap-2">
      {recentCities.map((recentCity) => (
        <button
          key={recentCity}
          onClick={() => loadCity(recentCity)}
          disabled={searching}
          className="border border-[#A68B91]/50 bg-[#121214]/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#F3ECE0] transition hover:border-[#C58F9B] hover:bg-[#4A1521] disabled:opacity-50"
        >
          {recentCity} ↗
        </button>
      ))}
    </div>
  </div>
)}
                        <button
              onClick={useMyLocation}
              disabled={searching}
              className="mt-4 border border-[#C58F9B] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#C58F9B] transition hover:bg-[#C58F9B] hover:text-[#121214] disabled:cursor-wait disabled:opacity-50"
            >
              {searching ? "Locating..." : "⌖ Use My Location"}
            </button>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-8 border border-[#C58F9B] bg-[#4A1521] p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-[#C58F9B]">
              transmission failed
            </p>

            <p className="mt-2 font-serif text-lg text-[#F3ECE0]">
              {error}
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading && !error ? (
          <div className="border border-[#A68B91]/40 bg-[#F3ECE0] p-10 text-center text-[#121214]">
            <div className="text-5xl">☁</div>

            <p className="mt-4 font-serif text-2xl font-bold">
              asking the sky...
            </p>

            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#A68B91]">
              receiving atmospheric transmission
            </p>
          </div>
        ) : (
          <>
            {/* MAIN WEATHER */}
            {location && weather && weatherInfo && (
              <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
                {/* WEATHER CARD */}
                <div className="relative overflow-hidden border border-[#A68B91]/40 bg-[#F3ECE0] text-[#121214]">
                  <div className="absolute right-5 top-4 font-mono text-[10px] text-[#A68B91]">
                    SKYTXT / LIVE
                  </div>

                  <div className="absolute bottom-3 left-4 rotate-[-6deg] font-serif text-sm italic text-[#A68B91]">
                    still here. still looking up.
                  </div>

                  <div className="p-7 sm:p-9">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#6B2938]">
                          current weather
                        </p>

                        <h3 className="mt-3 font-serif text-4xl font-black sm:text-5xl">
                          {location.name}
                        </h3>

                        

                        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[#A68B91]">
                          {location.admin1
                            ? `${location.admin1} / ${location.country}`
                            : location.country}
                        </p>
                      </div>

                      {/* Weather doodle */}
                      <div className="relative mr-2 mt-2 h-24 w-24 sm:h-32 sm:w-32">
                        <div className="absolute right-2 top-1 h-16 w-16 rounded-full bg-[#C58F9B] sm:h-20 sm:w-20" />

                        <div className="absolute bottom-2 left-0 h-10 w-20 rounded-full bg-[#D7CDD0] sm:h-12 sm:w-24" />

                        <div className="absolute bottom-5 left-4 h-9 w-9 rounded-full bg-[#FAF7F2] sm:h-10 sm:w-10" />

                        <span className="absolute right-0 top-0 text-xl text-[#6B2938]">
                          {weatherInfo.icon}
                        </span>

                        <span className="absolute left-0 top-4 text-sm text-[#6B2938]">
                          +
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 flex items-end gap-5">
                      <span className="font-serif text-8xl font-black leading-none sm:text-9xl">
                        {Math.round(weather.temperature)}°
                      </span>

                      <div className="pb-2">
                        <p className="font-serif text-2xl font-bold">
                          {weatherInfo.label}
                        </p>

                        <p className="mt-1 max-w-[190px] text-sm leading-5 text-[#6B2938]">
                          feels like {Math.round(weather.feelsLike)}°.
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 grid grid-cols-3 border-t border-[#A68B91]/40">
                      <WeatherStat
                        icon="♡"
                        label="humidity"
                        value={`${Math.round(weather.humidity)}%`}
                      />

                      <WeatherStat
                        icon="↝"
                        label="wind"
                        value={`${Math.round(weather.windSpeed)} km/h`}
                      />

                      <WeatherStat
                        icon="⌁"
                        label="pressure"
                        value={`${Math.round(weather.pressure)} hPa`}
                      />
                    </div>
                  </div>
                </div>

                {/* PERSONALITY CARD */}
                <div className="relative border border-[#6B2938] bg-[#4A1521] p-7 shadow-[10px_10px_0_#A68B91] sm:p-9">
                  <span className="absolute right-5 top-4 text-2xl text-[#C58F9B]">
                    ☁
                  </span>

                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#C58F9B]">
                    sky.txt / today&apos;s note
                  </p>

                  <h3 className="mt-8 font-serif text-4xl font-black leading-tight text-[#F3ECE0]">
                    {getPersonalityTitle(
                      weather.weatherCode,
                      weather.temperature
                    )}
                  </h3>

                  <p className="mt-6 text-sm leading-7 text-[#D7CDD0]">
                    {weatherInfo.personality}
                  </p>

                  <div className="mt-8 border border-[#A68B91]/40 bg-[#121214]/30 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#C58F9B]">
                      field note
                    </p>

                    <p className="mt-2 font-serif text-xl italic text-[#F3ECE0]">
                      {getFieldNote(weather.weatherCode, weather.temperature)}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-between font-mono text-[10px] uppercase tracking-widest text-[#A68B91]">
                    <span>
                      mood: {getMood(weather.weatherCode)}
                    </span>

                    <span>outside: yes</span>
                  </div>
                </div>
              </section>
            )}

                        {location && (
              <section className="mt-12">
                <div className="mb-5 border-b border-[#A68B91]/30 pb-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#A68B91]">
                    // coordinates from the outside world
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-black sm:text-4xl">
                    WHERE THE SKY LIVES
                  </h2>
                </div>

                <WeatherMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  city={location.name}
                />
              </section>
            )}

            {/* FORECAST */}
            {weather && (
              <section className="mt-12">
                <div className="mb-5 flex items-end justify-between border-b border-[#A68B91]/30 pb-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#A68B91]">
                      // incoming transmission
                    </p>

                    <h2 className="mt-1 font-serif text-3xl font-black sm:text-4xl">
                      THE NEXT 7 DAYS
                    </h2>
                  </div>

                  <span className="hidden rotate-[-4deg] font-serif text-sm italic text-[#C58F9B] sm:block">
                    will it rain? probably.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-px border border-[#A68B91]/30 bg-[#A68B91]/30 sm:grid-cols-4 lg:grid-cols-7">
                  {weather.daily.time.map((date, index) => {
                    const info = getWeatherInfo(
                      weather.daily.weatherCode[index],
                      weather.daily.max[index]
                    );

                    return (
                      <ForecastDay
                        key={date}
                        day={formatDay(date, index)}
                        icon={info.icon}
                        high={`${Math.round(weather.daily.max[index])}°`}
                        low={`${Math.round(weather.daily.min[index])}°`}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {/* FOOTER */}
        <section className="relative mt-12 border-t border-[#A68B91]/30 py-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-serif text-2xl italic text-[#C58F9B]">
                the sky knows something.
              </p>

              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#A68B91]">
                we are simply trying to read it.
              </p>
            </div>

            <div className="font-mono text-[10px] uppercase tracking-widest text-[#A68B91]">
              made somewhere on earth ✦ 2026
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------- */
/* WEATHER HELPERS                  */
/* -------------------------------- */

function getWeatherInfo(code: number, temperature: number): WeatherInfo {
  if (code === 0) {
    return {
      label: "Clear skies.",
      icon: "☀",
      personality:
        temperature >= 32
          ? "The sky is showing off, but the temperature is absolutely not playing around."
          : "The sky decided to be nice today. Take the win.",
    };
  }

  if (code === 1 || code === 2) {
    return {
      label: "Mostly chill.",
      icon: "◐",
      personality:
        "A little sun, a little cloud. The atmosphere cannot seem to make up its mind.",
    };
  }

  if (code === 3) {
    return {
      label: "Cloudy.",
      icon: "☁",
      personality:
        "The sun has apparently left the group chat. Very grey. Very atmospheric.",
    };
  }

  if (code >= 45 && code <= 48) {
    return {
      label: "Foggy.",
      icon: "≋",
      personality:
        "Visibility has entered mysterious mode. Everything feels slightly cinematic.",
    };
  }

  if (code >= 51 && code <= 57) {
    return {
      label: "Drizzling.",
      icon: "☂",
      personality:
        "Not quite rain. Not quite dry. The sky is being annoyingly indecisive.",
    };
  }

  if (code >= 61 && code <= 67) {
    return {
      label: "Rain.",
      icon: "☂",
      personality:
        "The clouds chose violence. Umbrella propaganda is officially justified.",
    };
  }

  if (code >= 71 && code <= 77) {
    return {
      label: "Snowing.",
      icon: "✦",
      personality:
        "The sky has decided to become aggressively pretty. Please dress accordingly.",
    };
  }

  if (code >= 80 && code <= 82) {
    return {
      label: "Showers.",
      icon: "☂",
      personality:
        "Random sky water detected. The weather cannot commit to a full rain event.",
    };
  }

  if (code >= 95) {
    return {
      label: "Thunderstorm.",
      icon: "⚡",
      personality:
        "The atmosphere is having a dramatic episode. Maybe stay indoors for a bit.",
    };
  }

  return {
    label: "Interesting.",
    icon: "✦",
    personality:
      "The sky is doing something slightly weird. Honestly, we respect it.",
  };
}

function getPersonalityTitle(code: number, temperature: number) {
  if (code >= 95) return <>the sky chose<br /><span className="text-[#C58F9B]">violence.</span></>;

  if (code >= 61 && code <= 82) {
    return <>rain has<br /><span className="text-[#C58F9B]">entered the chat.</span></>;
  }

  if (temperature >= 34) {
    return <>respectfully,<br /><span className="text-[#C58F9B]">stay inside.</span></>;
  }

  if (temperature <= 12) {
    return <>jacket<br /><span className="text-[#C58F9B]">propaganda.</span></>;
  }

  if (code === 3 || (code >= 45 && code <= 48)) {
    return <>the sky is<br /><span className="text-[#C58F9B]">buffering.</span></>;
  }

  return <>main character<br /><span className="text-[#C58F9B]">weather.</span></>;
}

function getFieldNote(code: number, temperature: number) {
  if (code >= 95) return `"maybe don't go outside."`;
  if (code >= 61 && code <= 82) return `"umbrella. now."`;
  if (temperature >= 34) return `"water is not optional."`;
  if (temperature <= 12) return `"jacket propaganda continues."`;
  if (code === 3) return `"the sun has gone missing."`;

  return `"go touch some grass."`;
}

function getMood(code: number) {
  if (code >= 95) return "chaotic";
  if (code >= 61 && code <= 82) return "dramatic";
  if (code === 3) return "moody";
  if (code === 0) return "✦✦✦✦";
  return "✦✦✦";
}

function formatDay(dateString: string, index: number) {
  if (index === 0) return "TODAY";

  const date = new Date(`${dateString}T12:00:00`);

  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
    })
    .toUpperCase();
}

/* -------------------------------- */
/* UI COMPONENTS                    */
/* -------------------------------- */

function WeatherStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center gap-2">
        <span className="text-lg text-[#6B2938]">{icon}</span>

        <span className="font-mono text-[9px] uppercase tracking-widest text-[#A68B91]">
          {label}
        </span>
      </div>

      <p className="mt-2 font-serif text-xl font-bold">{value}</p>
    </div>
  );
}

function ForecastDay({
  day,
  icon,
  high,
  low,
}: {
  day: string;
  icon: string;
  high: string;
  low: string;
}) {
  return (
    <div className="group bg-[#121214] p-4 transition hover:bg-[#4A1521]">
      <p className="font-mono text-[10px] font-bold tracking-widest text-[#A68B91]">
        {day}
      </p>

      <div className="my-6 font-serif text-4xl text-[#F3ECE0] transition group-hover:rotate-[-8deg]">
        {icon}
      </div>

      <div className="flex items-end gap-2">
        <span className="font-serif text-xl font-bold text-[#F3ECE0]">
          {high}
        </span>

        <span className="font-mono text-xs text-[#A68B91]">{low}</span>
      </div>
    </div>
  );
}