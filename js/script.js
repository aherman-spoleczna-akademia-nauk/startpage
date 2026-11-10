const NAME = "Andrzej";

/* Lokalizacja pogody (domyślnie Łódź) */
const WEATHER_LAT = 51.75;
const WEATHER_LON = 19.4667;

/* --- POWITANIE ZALEŻNE OD PORY DNIA --- */
function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return "Dzień dobry";
  if (hour >= 12 && hour < 18) return "Miłego popołudnia";
  if (hour >= 18 && hour < 22) return "Dobry wieczór";
  return "Dobrej nocy";
}

function updateGreeting(now) {
  const text = `${getGreeting(now.getHours())}, ${NAME}!`;
  const el = document.getElementById("greeting");
  if (el.textContent !== text) {
    el.textContent = text;
    document.title = text;
  }
}

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

  updateGreeting(now);
}

setInterval(updateTime, 1000);
updateTime();

/* --- POGODA --- */
function getWeatherDetails(code, isDay = true) {
  if (code === 0)
    return isDay
      ? { icon: "fa-sun", desc: "Bezchmurnie" }
      : { icon: "fa-moon", desc: "Bezchmurnie" };
  if (code >= 1 && code <= 3)
    return isDay
      ? { icon: "fa-cloud-sun", desc: "Zachmurzenie" }
      : { icon: "fa-cloud-moon", desc: "Zachmurzenie" };
  if (code >= 45 && code <= 48) return { icon: "fa-smog", desc: "Mgła" };
  if (code >= 51 && code <= 57)
    return { icon: "fa-cloud-rain", desc: "Mżawka" };
  if (code >= 61 && code <= 67)
    return { icon: "fa-cloud-rain", desc: "Deszcz" };
  if (code >= 71 && code <= 77)
    return { icon: "fa-snowflake", desc: "Śnieg" };
  if (code >= 80 && code <= 82)
    return { icon: "fa-cloud-showers-heavy", desc: "Ulewa" };
  if (code >= 85 && code <= 86)
    return { icon: "fa-snowflake", desc: "Śnieżyca" };
  if (code >= 95) return { icon: "fa-bolt", desc: "Burza" };
  return { icon: "fa-cloud", desc: "Pochmurno" };
}

/* Pomocnik do tworzenia elementów */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function weatherIcon(code, isDay) {
  const icon = el("i", `fas ${getWeatherDetails(code, isDay).icon}`);
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function precipBadge(probability) {
  if (!probability) return null;
  const badge = el("span", "precip");
  badge.append(el("i", "fas fa-droplet"), ` ${probability}%`);
  return badge;
}

function renderCurrent(current) {
  const isDay = current.is_day === 1;
  const info = getWeatherDetails(current.weather_code, isDay);
  document.getElementById("temp").textContent =
    `${Math.round(current.temperature_2m)}°C`;
  document.getElementById("weather-icon").className =
    `weather-icon fas ${info.icon}`;
  document.getElementById("weather-desc").textContent = info.desc;
}

function renderDetails(current, daily) {
  const items = [
    ["fa-temperature-half", "Odczuwalna", `${Math.round(current.apparent_temperature)}°C`],
    ["fa-droplet", "Wilgotność", `${current.relative_humidity_2m}%`],
    ["fa-wind", "Wiatr", `${Math.round(current.wind_speed_10m)} km/h`],
    ["fa-sun", "Wschód", daily.sunrise[0].slice(11, 16)],
    ["fa-moon", "Zachód", daily.sunset[0].slice(11, 16)],
  ];
  const container = document.getElementById("weather-details");
  container.replaceChildren(
    ...items.map(([icon, label, value]) => {
      const item = el("span", "detail");
      item.append(el("i", `fas ${icon}`), `${label}: `, el("strong", "", value));
      return item;
    }),
  );
}

function renderHourly(hourly, currentTime) {
  // Pierwsza pełna godzina od teraz (czasy ISO można porównywać jak tekst)
  const currentHour = currentTime.slice(0, 13) + ":00";
  const start = Math.max(0, hourly.time.findIndex((t) => t >= currentHour));
  const container = document.getElementById("weather-hourly");

  const hours = [];
  for (let i = start; i < Math.min(start + 12, hourly.time.length); i++) {
    const hour = el("div", "hour");
    hour.append(
      el("span", "hour-time", i === start ? "Teraz" : hourly.time[i].slice(11, 16)),
      weatherIcon(hourly.weather_code[i], hourly.is_day[i] === 1),
      el("span", "hour-temp", `${Math.round(hourly.temperature_2m[i])}°`),
    );
    const precip = precipBadge(hourly.precipitation_probability[i]);
    if (precip) hour.append(precip);
    hours.push(hour);
  }
  container.replaceChildren(...hours);
}

function renderDaily(daily) {
  const container = document.getElementById("weather-daily");
  container.replaceChildren(
    ...daily.time.map((date, i) => {
      let name;
      if (i === 0) name = "Dziś";
      else if (i === 1) name = "Jutro";
      else {
        name = new Date(`${date}T12:00`).toLocaleDateString("pl-PL", {
          weekday: "long",
        });
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }

      const day = el("div", "day");
      const temps = el("span", "day-temps");
      temps.append(
        el("strong", "", `${Math.round(daily.temperature_2m_max[i])}°`),
        el("span", "day-min", `${Math.round(daily.temperature_2m_min[i])}°`),
      );
      day.append(
        el("span", "day-name", name),
        weatherIcon(daily.weather_code[i], true),
        el("span", "day-desc", getWeatherDetails(daily.weather_code[i]).desc),
        temps,
      );
      const precip = precipBadge(daily.precipitation_probability_max[i]);
      if (precip) day.append(precip);
      return day;
    }),
  );
}

async function fetchWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day" +
    "&hourly=temperature_2m,weather_code,precipitation_probability,is_day" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max" +
    "&timezone=Europe%2FWarsaw&forecast_days=4";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    renderCurrent(data.current);
    renderDetails(data.current, data.daily);
    renderHourly(data.hourly, data.current.time);
    renderDaily(data.daily);
  } catch (error) {
    console.error("Błąd pobierania pogody:", error);
    const iconEl = document.getElementById("weather-icon");
    iconEl.className = "weather-icon fas fa-triangle-exclamation";
    document.getElementById("weather-desc").textContent = "Błąd pogody";
  }
}
fetchWeather();
setInterval(fetchWeather, 1800000);

/* Rozwijanie / zwijanie prognozy */
const weatherWidget = document.getElementById("weather-widget");
const weatherPanel = document.getElementById("weather-panel");

function setWeatherPanel(open) {
  weatherPanel.hidden = !open;
  weatherWidget.setAttribute("aria-expanded", String(open));
  weatherWidget.title = open ? "Ukryj prognozę" : "Pokaż prognozę";
}

weatherWidget.addEventListener("click", () => setWeatherPanel(weatherPanel.hidden));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !weatherPanel.hidden) setWeatherPanel(false);
});

/* --- ZORZA PODĄŻAJĄCA ZA KURSOREM --- */
(function auroraFollow() {
  const blob = document.getElementById("aurora-cursor");
  if (!blob || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;

  const EASE = 0.035; // Im mniej, tym wolniej plama dogania kursor
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let frame = null;

  function place() {
    blob.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }

  function step() {
    x += (targetX - x) * EASE;
    y += (targetY - y) * EASE;
    place();
    // Zatrzymaj animację, gdy plama dotrze na miejsce – nie obciąża procesora
    if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
      frame = requestAnimationFrame(step);
    } else {
      frame = null;
    }
  }

  place();

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      targetX = e.clientX;
      targetY = e.clientY;
      blob.classList.add("is-active");
      if (!frame) frame = requestAnimationFrame(step);
    },
    { passive: true },
  );

  document.documentElement.addEventListener("mouseleave", () =>
    blob.classList.remove("is-active"),
  );
})();
