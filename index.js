//DOM-elements
const weatherDisplayEl = document.getElementById('weatherDisplay');
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
];
let allCitiesWeather = []; // Store  weather data for all cities
let currentCityIndex = 0; //Keep track of the currently displayed city
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
            allCitiesWeather.push(simplifiedData[0]); //we want to save the weather data 
            // Om detta är första staden som kommer tillbaka, visa den!
            if (allCitiesWeather.length === 1) {
                showWeather(allCitiesWeather[0]);
                nextBtn.disabled = false;
            }
        }
    });
}
;
//Display the weather for the currently selected city
const displayCurrentCity = () => {
    if (!allCitiesWeather.length)
        return; //Guard   
    const currentWeather = allCitiesWeather[currentCityIndex];
    weatherDisplayEl.innerHTML = '';
    showWeather(currentWeather);
};
//Show weather funktion
const showWeather = (p) => {
    if (!weatherDisplayEl)
        return; //Guard
    const formattedTime = new Date(p.time).toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit'
    });
    weatherDisplayEl.innerHTML += `
  <div class="weather-card">
   <p class="temperature">${p.air_temperature}<span class="degree">°</span><sup>c</sup></p>
    <h3 class="city-name">${p.city}</h3>
      <p>Time: ${formattedTime}</p>
    </div>
  `;
};
// När knappen klickas:
nextBtn.onclick = () => {
    if (allCitiesWeather.length === 0)
        return; // Säkerhet
    currentCityIndex = (currentCityIndex + 1) % allCitiesWeather.length;
    weatherDisplayEl.innerHTML = '';
    showWeather(allCitiesWeather[currentCityIndex]);
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