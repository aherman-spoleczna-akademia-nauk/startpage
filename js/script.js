/* --- ZEGAR --- */
function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("clock").textContent = timeString;

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateString = now.toLocaleDateString("pl-PL", options);
  document.getElementById("date").textContent =
    dateString.charAt(0).toUpperCase() + dateString.slice(1);
}
setInterval(updateTime, 1000);
updateTime();

/* --- POGODA --- */
async function fetchWeather() {
  const lat = 51.75;
  const lon = 19.4667;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const weatherCode = data.current_weather.weathercode;
    const temperature = Math.round(data.current_weather.temperature);

    document.getElementById("temp").textContent = `${temperature}°C`;
    const weatherInfo = getWeatherDetails(weatherCode);
    const iconEl = document.getElementById("weather-icon");
    iconEl.className = `weather-icon fas ${weatherInfo.icon}`;
    iconEl.classList.remove("fa-spin");
    document.getElementById("weather-desc").textContent =
      weatherInfo.desc;
  } catch (error) {
    console.error("Błąd pobierania pogody:", error);
    document.getElementById("weather-desc").textContent = "Błąd pogody";
  }
}

function getWeatherDetails(code) {
  if (code === 0) return { icon: "fa-sun", desc: "Bezchmurnie" };
  if (code >= 1 && code <= 3)
    return { icon: "fa-cloud-sun", desc: "Zachmurzenie" };
  if (code >= 45 && code <= 48) return { icon: "fa-smog", desc: "Mgła" };
  if (code >= 51 && code <= 67)
    return { icon: "fa-cloud-rain", desc: "Deszcz" };
  if (code >= 71 && code <= 77)
    return { icon: "fa-snowflake", desc: "Śnieg" };
  if (code >= 80 && code <= 82)
    return { icon: "fa-cloud-showers-heavy", desc: "Ulewa" };
  if (code >= 95) return { icon: "fa-bolt", desc: "Burza" };
  return { icon: "fa-cloud", desc: "Pochmurno" };
}
fetchWeather();
setInterval(fetchWeather, 1800000);
