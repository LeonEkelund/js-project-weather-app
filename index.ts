//DOM-elements
const weatherDisplayEl = document.getElementById(
  "weatherDisplay"
) as HTMLDivElement;
const forecastSection = document.getElementById(
  "forecastSection"
) as HTMLDivElement;
const nextBtn = document.getElementById("btn") as HTMLButtonElement;

nextBtn.disabled = true; //Disable button until fetch

//================INTERFACES AND TYPES=========================

interface SMHIResponse {
  timeSeries: {
    time: string;
    data: {
      air_temperature: number;
      symbol_code: number;
    };
  }[];
}

type City = {
  name: string;
  lon: number;
  lat: number;
};

type WeatherItem = {
  city: string;
  time: string;
  air_temperature: number;
  symbol_code: number;
};

type ForecastDay = {
  day: string;
  date: string;
  icon: string;
  tempHigh: number;
  tempLow: number;
  symbol_code: number;
};

//============================City array==========================================
const cities: City[] = [
  { name: "Stockholm", lon: 18.0686, lat: 59.3293 },
  { name: "Göteborg", lon: 11.9746, lat: 57.7089 },
  { name: "Malmö", lon: 13.0038, lat: 55.605 },
  { name: "Linköping", lon: 15.6214, lat: 58.4109 },
  { name: "Lund", lon: 13.191445, lat: 55.703647 },
  { name: "Kalmar", lon: 16.3616, lat: 56.6616 },
  { name: "Helsingfors", lon: 12.6134, lat: 56.0356 },
];

// ========Global state: store weather data and track current city================
let allCitiesWeather: any = []; // Store current weather data for all cities
let allCitiesForecasts: ForecastDay[][] = []; // Store 4-day forecasts for all cities
let currentCityIndex = 0; //Keep track of the currently displayed city

//========= Function to get day name from date=====================================
const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", { weekday: "short" });
};

//========== Function to create 4-day forecast from timeSeries data==================
const createForecast = (
  timeSeries: SMHIResponse["timeSeries"]
): ForecastDay[] => {
  // 1. Prepare a data structure to group weather data by date
  // The key is a date string (e.g., "Tue Oct 22 2025"), and the value stores temperatures, symbols, and times
  const dailyData: {
    [key: string]: { temps: number[]; symbols: number[]; times: string[] };
  } = {};

  //  2. Initialize an empty structure for the next 4 days
  // (creates a placeholder for each day we want to display)
  const today = new Date(); // Create a Date object for today
  for (let i = 0; i < 4; i++) {
    const date = new Date(today); // Copy today's date
    date.setDate(today.getDate() + i); // Add i days ahead
    const dateKey = date.toDateString(); // Convert date to string for use as a key
    dailyData[dateKey] = { temps: [], symbols: [], times: [] }; // Initialize entry for this day
  }

  // 3. Process the SMHI timeSeries data and sort it into the correct day
  // (adds temperature, weather symbol, and time to each day's entry)
  timeSeries.forEach((item) => {
    const itemDate = new Date(item.time);
    const dateKey = itemDate.toDateString();

    if (dailyData[dateKey]) {
      dailyData[dateKey].temps.push(item.data.air_temperature);
      dailyData[dateKey].symbols.push(item.data.symbol_code);
      dailyData[dateKey].times.push(item.time);
    }
  });

  // 4. Convert grouped data into an array of ForecastDay objects
  const forecast: ForecastDay[] = [];

  // Loop through each date in dailyData (one entry per day)
  Object.keys(dailyData).forEach((dateKey, index) => {
    const data = dailyData[dateKey];

    //Ensure we have temperature data before calculating
    if (data && data.temps.length > 0) {
      //  Calculate daily high and low temperatures
      const tempHigh = Math.round(Math.max(...data.temps));
      const tempLow = Math.round(Math.min(...data.temps));
      // Use most common symbol (simplified - could be more sophisticated)
      const symbol_code =
        data.symbols[Math.floor(data.symbols.length / 2)] || 1;

      //  Build a ForecastDay object and add it to the forecast array
      forecast.push({
        day: getDayName(dateKey),
        date: dateKey,
        icon:
          weatherSymbols[symbol_code]?.iconDay ||
          weatherSymbols[1]?.iconDay ||
          "./weather_icons/aligned/solid/day/01.svg",
        tempHigh,
        tempLow,
        symbol_code,
      });
    }
  });

  return forecast.slice(0, 4); // Ensure only 4 days
};

//================= Fetch and process weather data for all cities=====================
for (const city of cities) {
  //  1. Build the SMHI API URL for this specific city
  const url = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${city.lon}/lat/${city.lat}/data.json`;

  //2. Fetch weather data from the SMHI API
  fetch(url) //Fetches data from the SMHI API
    .then((response) => response.json())
    .then((data: SMHIResponse) => {
      // 3. Simplify SMHI data into a lighter structure. Keep only what’s needed: city name, time, temperature, and symbol
      const simplifiedData = data.timeSeries.map((p) => ({
        city: city.name,
        time: p.time,
        air_temperature: p.data.air_temperature,
        symbol_code: p.data.symbol_code,
      }));

      // 4. Proceed only if data was successfully received
      if (simplifiedData.length > 0) {
        // 5. Save current weather (first entry represents "now")
        allCitiesWeather.push(simplifiedData[0]); //we want to save the current weather data

        // 6. Generate and store a 4-day forecast for this city
        const cityForecast = createForecast(data.timeSeries);
        allCitiesForecasts.push(cityForecast);

        //  7. If this is the first city loaded, display its data in the UI
        if (allCitiesWeather.length === 1 && allCitiesForecasts[0]) {
          showWeather(allCitiesWeather[0]);
          showForecast(allCitiesForecasts[0]);
          nextBtn.disabled = false;
        }
      }
    });
}

//================WEATHER-TEXT AND SYMBOLS======================
const weatherSymbols: {
  [key: number]: { text: string; iconDay: string; iconNight: string };
} = {
  1: {
    text: "Clear sky",
    iconDay: "./weather_icons/aligned/solid/day/01.svg",
    iconNight: "./weather_icons/aligned/solid/night/01.svg",
  },
  2: {
    text: "Nearly clear sky",
    iconDay: "./weather_icons/aligned/solid/day/02.svg",
    iconNight: "./weather_icons/aligned/solid/night/02.svg",
  },
  3: {
    text: "Variable cloudiness",
    iconDay: "./weather_icons/aligned/solid/day/03.svg",
    iconNight: "./weather_icons/aligned/solid/night/03.svg",
  },
  4: {
    text: "Halfclear sky",
    iconDay: "./weather_icons/aligned/solid/day/04.svg",
    iconNight: "./weather_icons/aligned/solid/night/04.svg",
  },
  5: {
    text: "Cloudy sky",
    iconDay: "./weather_icons/aligned/solid/day/05.svg",
    iconNight: "./weather_icons/aligned/solid/night/05.svg",
  },
  6: {
    text: "Overcast",
    iconDay: "./weather_icons/aligned/solid/day/06.svg",
    iconNight: "./weather_icons/aligned/solid/night/06.svg",
  },
  7: {
    text: "Fog",
    iconDay: "./weather_icons/aligned/solid/day/07.svg",
    iconNight: "./weather_icons/aligned/solid/night/07.svg",
  },
  8: {
    text: "Light rain showers",
    iconDay: "./weather_icons/aligned/solid/day/08.svg",
    iconNight: "./weather_icons/aligned/solid/night/08.svg",
  },
  9: {
    text: "Moderate rain showers",
    iconDay: "./weather_icons/aligned/solid/day/09.svg",
    iconNight: "./weather_icons/aligned/solid/night/09.svg",
  },
  10: {
    text: "Heavy rain showers",
    iconDay: "./weather_icons/aligned/solid/day/10.svg",
    iconNight: "./weather_icons/aligned/solid/night/10.svg",
  },
  11: {
    text: "Thunderstorm",
    iconDay: "./weather_icons/aligned/solid/day/11.svg",
    iconNight: "./weather_icons/aligned/solid/night/11.svg",
  },
  12: {
    text: "Light sleet showers",
    iconDay: "./weather_icons/aligned/solid/day/12.svg",
    iconNight: "./weather_icons/aligned/solid/night/12.svg",
  },
  13: {
    text: "Moderate sleet showers",
    iconDay: "./weather_icons/aligned/solid/day/13.svg",
    iconNight: "./weather_icons/aligned/solid/night/13.svg",
  },
  14: {
    text: "Heavy sleet showers",
    iconDay: "./weather_icons/aligned/solid/day/14.svg",
    iconNight: "./weather_icons/aligned/solid/night/14.svg",
  },
  15: {
    text: "Light snow showers",
    iconDay: "./weather_icons/aligned/solid/day/15.svg",
    iconNight: "./weather_icons/aligned/solid/night/15.svg",
  },
  16: {
    text: "Moderate snow showers",
    iconDay: "./weather_icons/aligned/solid/day/16.svg",
    iconNight: "./weather_icons/aligned/solid/night/16.svg",
  },
  17: {
    text: "Heavy snow showers",
    iconDay: "./weather_icons/aligned/solid/day/17.svg",
    iconNight: "./weather_icons/aligned/solid/night/17.svg",
  },
  18: {
    text: "Light rain",
    iconDay: "./weather_icons/aligned/solid/day/18.svg",
    iconNight: "./weather_icons/aligned/solid/night/18.svg",
  },
  19: {
    text: "Moderate rain",
    iconDay: "./weather_icons/aligned/solid/day/19.svg",
    iconNight: "./weather_icons/aligned/solid/night/19.svg",
  },
  20: {
    text: "Heavy rain",
    iconDay: "./weather_icons/aligned/solid/day/20.svg",
    iconNight: "./weather_icons/aligned/solid/night/20.svg",
  },
  21: {
    text: "Thunder",
    iconDay: "./weather_icons/aligned/solid/day/21.svg",
    iconNight: "./weather_icons/aligned/solid/night/21.svg",
  },
  22: {
    text: "Light sleet",
    iconDay: "./weather_icons/aligned/solid/day/22.svg",
    iconNight: "./weather_icons/aligned/solid/night/22.svg",
  },
  23: {
    text: "Moderate sleet",
    iconDay: "./weather_icons/aligned/solid/day/23.svg",
    iconNight: "./weather_icons/aligned/solid/night/23.svg",
  },
  24: {
    text: "Heavy sleet",
    iconDay: "./weather_icons/aligned/solid/day/24.svg",
    iconNight: "./weather_icons/aligned/solid/night/24.svg",
  },
  25: {
    text: "Light snowfall",
    iconDay: "./weather_icons/aligned/solid/day/25.svg",
    iconNight: "./weather_icons/aligned/solid/night/25.svg",
  },
  26: {
    text: "Moderate snowfall",
    iconDay: "./weather_icons/aligned/solid/day/26.svg",
    iconNight: "./weather_icons/aligned/solid/night/26.svg",
  },
  27: {
    text: "Heavy snowfall",
    iconDay: "./weather_icons/aligned/solid/day/27.svg",
    iconNight: "./weather_icons/aligned/solid/night/27.svg",
  },
};

//============ Function: Display the weather and forecast for the currently selected city============
const displayCurrentCity = (): void => {
  if (!allCitiesWeather.length || !allCitiesForecasts.length) return; //Guard
  const currentWeather = allCitiesWeather[currentCityIndex];
  const currentForecast = allCitiesForecasts[currentCityIndex];
  if (!currentForecast) return;

  weatherDisplayEl.innerHTML = "";
  forecastSection.innerHTML = "";
  showWeather(currentWeather);
  showForecast(currentForecast);
};

// ========= Function: Render the 4-day weather forecast in the UI ===========
const showForecast = (forecast: ForecastDay[]): void => {
  //1. Guard clause – ensure forecast data and container exist
  if (!forecastSection || !forecast.length) return;

  //2. Generate HTML for each forecast day and inject into the DOM
  forecastSection.innerHTML = forecast
    .map(
      (day) => `
    <div class="forecast-day">
      <span class="forecast-day-name">${day.day}</span>
      <img src="${day.icon}" alt="Weather" class="forecast-icon">
      <div class="forecast-temps">
        <span class="forecast-temp-high">${day.tempHigh}°</span>
        <span class="forecast-temp-separator">/</span>
        <span class="forecast-temp-low">${day.tempLow}°</span>
      </div>
    </div>
  `
    )
    .join("");
};

//================Function: Display current weather for a given city========================
const showWeather = (p: WeatherItem): void => {
  //1. Guard clause – ensure the weather display element exists
  if (!weatherDisplayEl) return; //Guard

  //2. Format the timestamp into readable local time
  const formattedTime = new Date(p.time).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  //3. Get weather symbol and text description
  const symbol = weatherSymbols[p.symbol_code];
  const weatherText = symbol?.text || "Unknown weather";

  // 4. Helper – determine if it’s currently day or night
  const isDayTime = (): boolean => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  };

  //5. Select appropriate icon based on time of day
  const icon = isDayTime()
    ? weatherSymbols[p.symbol_code]?.iconDay
    : weatherSymbols[p.symbol_code]?.iconNight;

  //6. Render weather card HTML into the UI
  weatherDisplayEl!.innerHTML += `
  <div class="weather-card">
    <img src="${icon}" alt="${weatherText}" class="weather-icon-top">
    <div class="weather-content">
      <p class="temperature">${Math.round(
        p.air_temperature
      )}<span class="degree">°</span><sup>c</sup></p>
      <h3 class="city-name">${p.city}</h3>
      <p class="weather-text">${weatherText}</p>
    </div>
    </div>
  `;
};

//============= Event: Handle "Next" button click to display the next city====================
nextBtn.onclick = () => {
  // 1. Guard clause – ensure weather data exists
  if (allCitiesWeather.length === 0 || allCitiesForecasts.length === 0) return; // Säkerhet

  //2. Move to the next city (wrap around when reaching the end)
  currentCityIndex = (currentCityIndex + 1) % allCitiesWeather.length;

  //  3. Retrieve the corresponding forecast for the current city
  const currentForecast = allCitiesForecasts[currentCityIndex];
  if (!currentForecast) return;

  //4. Clear previous weather and forecast from the display
  weatherDisplayEl.innerHTML = "";
  forecastSection.innerHTML = "";

  //5. Render the weather and forecast for the selected city
  showWeather(allCitiesWeather[currentCityIndex]);
  showForecast(currentForecast);
};
