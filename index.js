//DOM-elements
const weatherDisplayEl = document.getElementById('weatherDisplay');
const forecastSection = document.getElementById('forecastSection');
const nextBtn = document.getElementById("btn");
nextBtn.disabled = true; //Disable button until fetch
//City array
const cities = [
    { name: "Stockholm", lon: 18.0686, lat: 59.3293 },
    { name: "Göteborg", lon: 11.9746, lat: 57.7089 },
    { name: "Malmö", lon: 13.0038, lat: 55.6050 },
    { name: "Linköping", lon: 15.6214, lat: 58.4109 },
    { name: "Lund", lon: 13.191445, lat: 55.703647 },
    { name: "Kalmar", lon: 16.3616, lat: 56.6616 },
    { name: "Helsingfors", lon: 12.6134, lat: 56.0356 }
];
let allCitiesWeather = []; // Store current weather data for all cities
let allCitiesForecasts = []; // Store 4-day forecasts for all cities
let currentCityIndex = 0; //Keep track of the currently displayed city
// Function to get day name from date
const getDayName = (dateString) => {
    const date = new Date(dateString);
    const today = new Date(); 
    const tomorrow = new Date(today); 
    tomorrow.setDate(today.getDate() + 1); 
    if (date.toDateString() === today.toDateString())
        return 'Today';
    if (date.toDateString() === tomorrow.toDateString())
        return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};
// Function to create 4-day forecast from timeSeries data
const createForecast = (timeSeries) => {
    const dailyData = {};
    // Group data by date (next 4 days)
    const today = new Date(); 
    for (let i = 0; i < 4; i++) { 
        const date = new Date(today); //
        date.setDate(today.getDate() + i);
        const dateKey = date.toDateString();
        dailyData[dateKey] = { temps: [], symbols: [], times: [] };
    }
    // Process timeSeries data
    timeSeries.forEach(item => {
        const itemDate = new Date(item.time);
        const dateKey = itemDate.toDateString();
        if (dailyData[dateKey]) {
            dailyData[dateKey].temps.push(item.data.air_temperature);
            dailyData[dateKey].symbols.push(item.data.symbol_code);
            dailyData[dateKey].times.push(item.time);
        }
    });
    // Create forecast array
    const forecast = [];
    Object.keys(dailyData).forEach((dateKey, index) => {
        const data = dailyData[dateKey];
        if (data && data.temps.length > 0) {
            const tempHigh = Math.round(Math.max(...data.temps));
            const tempLow = Math.round(Math.min(...data.temps));
            // Use most common symbol (simplified - could be more sophisticated)
            const symbol_code = data.symbols[Math.floor(data.symbols.length / 2)] || 1;
            forecast.push({
                day: getDayName(dateKey),
                date: dateKey,
                icon: weatherSymbols[symbol_code]?.iconDay || weatherSymbols[1]?.iconDay || "./weather_icons/aligned/solid/day/01.svg",
                tempHigh,
                tempLow,
                symbol_code
            });
        }
    });
    return forecast.slice(0, 4); // Ensure only 4 days
};
for (const city of cities) { // Looping through City array
    const url = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${city.lon}/lat/${city.lat}/data.json`;
    fetch(url) //Fetches data from the SMHI API
        .then(response => response.json())
        .then((data) => {
        const simplifiedData = data.timeSeries.map((p) => ({
            city: city.name, //saves the data into a new list of data
            time: p.time,
            air_temperature: p.data.air_temperature,
            symbol_code: p.data.symbol_code,
        }));
        if (simplifiedData.length > 0) { //Guard, if we get the weather..
            allCitiesWeather.push(simplifiedData[0]); //we want to save the current weather data
            // Create and store 4-day forecast for this city
            const cityForecast = createForecast(data.timeSeries);
            allCitiesForecasts.push(cityForecast);
            // Om detta är första staden som kommer tillbaka, visa den!
            if (allCitiesWeather.length === 1 && allCitiesForecasts[0]) {
                showWeather(allCitiesWeather[0]);
                showForecast(allCitiesForecasts[0]);
                nextBtn.disabled = false;
            }
        }
    });
}
;
//================WEATHER-TEXT AND SYMBOLS======================
const weatherSymbols = {
    1: { text: "Clear sky", iconDay: "./weather_icons/aligned/solid/day/01.svg", iconNight: "./weather_icons/aligned/solid/night/01.svg" },
    2: { text: "Nearly clear sky", iconDay: "./weather_icons/aligned/solid/day/02.svg", iconNight: "./weather_icons/aligned/solid/night/02.svg" },
    3: { text: "Variable cloudiness", iconDay: "./weather_icons/aligned/solid/day/03.svg", iconNight: "./weather_icons/aligned/solid/night/03.svg" },
    4: { text: "Halfclear sky", iconDay: "./weather_icons/aligned/solid/day/04.svg", iconNight: "./weather_icons/aligned/solid/night/04.svg" },
    5: { text: "Cloudy sky", iconDay: "./weather_icons/aligned/solid/day/05.svg", iconNight: "./weather_icons/aligned/solid/night/05.svg" },
    6: { text: "Overcast", iconDay: "./weather_icons/aligned/solid/day/06.svg", iconNight: "./weather_icons/aligned/solid/night/06.svg" },
    7: { text: "Fog", iconDay: "./weather_icons/aligned/solid/day/07.svg", iconNight: "./weather_icons/aligned/solid/night/07.svg" },
    8: { text: "Light rain showers", iconDay: "./weather_icons/aligned/solid/day/08.svg", iconNight: "./weather_icons/aligned/solid/night/08.svg" },
    9: { text: "Moderate rain showers", iconDay: "./weather_icons/aligned/solid/day/09.svg", iconNight: "./weather_icons/aligned/solid/night/09.svg" },
    10: { text: "Heavy rain showers", iconDay: "./weather_icons/aligned/solid/day/10.svg", iconNight: "./weather_icons/aligned/solid/night/10.svg" },
    11: { text: "Thunderstorm", iconDay: "./weather_icons/aligned/solid/day/11.svg", iconNight: "./weather_icons/aligned/solid/night/11.svg" },
    12: { text: "Light sleet showers", iconDay: "./weather_icons/aligned/solid/day/12.svg", iconNight: "./weather_icons/aligned/solid/night/12.svg" },
    13: { text: "Moderate sleet showers", iconDay: "./weather_icons/aligned/solid/day/13.svg", iconNight: "./weather_icons/aligned/solid/night/13.svg" },
    14: { text: "Heavy sleet showers", iconDay: "./weather_icons/aligned/solid/day/14.svg", iconNight: "./weather_icons/aligned/solid/night/14.svg" },
    15: { text: "Light snow showers", iconDay: "./weather_icons/aligned/solid/day/15.svg", iconNight: "./weather_icons/aligned/solid/night/15.svg" },
    16: { text: "Moderate snow showers", iconDay: "./weather_icons/aligned/solid/day/16.svg", iconNight: "./weather_icons/aligned/solid/night/16.svg" },
    17: { text: "Heavy snow showers", iconDay: "./weather_icons/aligned/solid/day/17.svg", iconNight: "./weather_icons/aligned/solid/night/17.svg" },
    18: { text: "Light rain", iconDay: "./weather_icons/aligned/solid/day/18.svg", iconNight: "./weather_icons/aligned/solid/night/18.svg" },
    19: { text: "Moderate rain", iconDay: "./weather_icons/aligned/solid/day/19.svg", iconNight: "./weather_icons/aligned/solid/night/19.svg" },
    20: { text: "Heavy rain", iconDay: "./weather_icons/aligned/solid/day/20.svg", iconNight: "./weather_icons/aligned/solid/night/20.svg" },
    21: { text: "Thunder", iconDay: "./weather_icons/aligned/solid/day/21.svg", iconNight: "./weather_icons/aligned/solid/night/21.svg" },
    22: { text: "Light sleet", iconDay: "./weather_icons/aligned/solid/day/22.svg", iconNight: "./weather_icons/aligned/solid/night/22.svg" },
    23: { text: "Moderate sleet", iconDay: "./weather_icons/aligned/solid/day/23.svg", iconNight: "./weather_icons/aligned/solid/night/23.svg" },
    24: { text: "Heavy sleet", iconDay: "./weather_icons/aligned/solid/day/24.svg", iconNight: "./weather_icons/aligned/solid/night/24.svg" },
    25: { text: "Light snowfall", iconDay: "./weather_icons/aligned/solid/day/25.svg", iconNight: "./weather_icons/aligned/solid/night/25.svg" },
    26: { text: "Moderate snowfall", iconDay: "./weather_icons/aligned/solid/day/26.svg", iconNight: "./weather_icons/aligned/solid/night/26.svg" },
    27: { text: "Heavy snowfall", iconDay: "./weather_icons/aligned/solid/day/27.svg", iconNight: "./weather_icons/aligned/solid/night/27.svg" },
};
//Display the weather for the currently selected city
const displayCurrentCity = () => {
    if (!allCitiesWeather.length || !allCitiesForecasts.length)
        return; //Guard   
    const currentWeather = allCitiesWeather[currentCityIndex];
    const currentForecast = allCitiesForecasts[currentCityIndex];
    if (!currentForecast)
        return;
    weatherDisplayEl.innerHTML = '';
    forecastSection.innerHTML = '';
    showWeather(currentWeather);
    showForecast(currentForecast);
};
// Function to display 4-day forecast
const showForecast = (forecast) => {
    if (!forecastSection || !forecast.length)
        return;
    forecastSection.innerHTML = forecast.map(day => `
    <div class="forecast-day">
      <span class="forecast-day-name">${day.day}</span>
      <img src="${day.icon}" alt="Weather" class="forecast-icon">
      <div class="forecast-temps">
        <span class="forecast-temp-high">${day.tempHigh}°</span>
        <span class="forecast-temp-separator">/</span>
        <span class="forecast-temp-low">${day.tempLow}°</span>
      </div>
    </div>
  `).join('');
};
//Show weather function
const showWeather = (p) => {
    if (!weatherDisplayEl)
        return; //Guard
    const formattedTime = new Date(p.time).toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const symbol = weatherSymbols[p.symbol_code];
    const weatherText = symbol?.text || "Unknown weather";
    //const weatherIcon = symbol?.icon;
    const isDayTime = () => {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18;
    };
    const icon = isDayTime()
        ? weatherSymbols[p.symbol_code]?.iconDay
        : weatherSymbols[p.symbol_code]?.iconNight;
    weatherDisplayEl.innerHTML += `
  <div class="weather-card">
    <img src="${icon}" alt="${weatherText}" class="weather-icon-top">
    <div class="weather-content">
      <p class="temperature">${p.air_temperature}<span class="degree">°</span><sup>c</sup></p>
      <h3 class="city-name">${p.city}</h3>
      <p class="weather-text">${weatherText}</p>
    </div>
    </div>
  `;
};

// when the button push
nextBtn.onclick = () => {
    if (allCitiesWeather.length === 0 || allCitiesForecasts.length === 0)
        return; // Säkerhet
    currentCityIndex = (currentCityIndex + 1) % allCitiesWeather.length;
    const currentForecast = allCitiesForecasts[currentCityIndex];
    if (!currentForecast)
        return;
    weatherDisplayEl.innerHTML = '';
    forecastSection.innerHTML = '';
    showWeather(allCitiesWeather[currentCityIndex]);
    showForecast(currentForecast);
};
export {};
// Visa den nya staden
/*   const currentWeather = allCitiesWeather[currentCityIndex];
  showWeather(currentWeather);
}
 */
// fetch(APIURL)
//   .then((response) => {
//     if (!response.ok) throw new Error("HTTP error " + response.status);
//     return response.json();
//   })
//   .then((data: SMHIResponse) => {
//     // Typen SMHIResponse gör att TypeScript vet vad 'data.timeSeries' innehåller
//     const simplifiedData = data.timeSeries.map((p) => ({
//       time: p.time,
//       air_temperature: p.data.air_temperature,
//       symbol_code: p.data.symbol_code,
//     }));
//     console.log(simplifiedData);
//   })
//   .catch((error) => {
//     console.error("Error fetching weather data:", error);
//   });
/*
Kravlista:
Grader (air_temperature)

City name (Ändra long lat)

weather description (symbol_code)

4 dagar forecast (ändra     const firstSeries = data.timeSeries[0];) denna)


function buildUrl(lon: number, lat: number) {
  // Du använder snow1g i exemplet – behåll det. (Funkar också med pmp3g/metfcst.)
  return `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${lon}/lat/${lat}/data.json`;
}



// ✅ Example: Use a specific city
// const url = buildUrl(cities[0].lon, cities[0].lat); // Stockholm
// console.log(url);


// Or, for another city:

// let url = buildUrl(cities[2].lon, cities[2].lat); // Malmö*/
//# sourceMappingURL=index.js.map