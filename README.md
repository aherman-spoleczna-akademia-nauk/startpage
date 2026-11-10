<div align="center">

<img src="img/icon.png" alt="Ikona" width="64" />

# Strona startowa

Prosta strona startowa przeglądarki w ciemnym stylu, z zegarem, pogodą, wyszukiwarką i kafelkami ulubionych stron.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Bez builda](https://img.shields.io/badge/build-brak-6366f1)

</div>

---

## Funkcje

- 🕒 **Zegar i data** – aktualizowane co sekundę, w formacie polskim (`pl-PL`).
- 🌤️ **Pogoda** – aktualna temperatura i opis z [Open-Meteo](https://open-meteo.com/). Nie wymaga klucza API i odświeża się co 30 minut.
- 🔍 **Wyszukiwarka Google** – zapytanie otwiera się w nowej karcie.
- 🔗 **Kafelki z linkami** – siatka skrótów, która dopasowuje się do szerokości ekranu.
- ✨ **Animowane tło** – „zorza” z rozmytych, powoli przepływających plam koloru, w czystym CSS (bez WebGL).
- 📱 **Responsywność** – układ działa na telefonie, tablecie i komputerze.

## Struktura projektu

```text
startpage/
├── index.html      # Struktura strony i lista linków
├── css/
│   └── style.css   # Wygląd, kolory, animacje, responsywność
├── js/
│   └── script.js   # Zegar i pogoda
└── img/
    └── icon.png    # Favicon
```

## Uruchomienie

Projekt nie wymaga instalacji ani budowania. Wystarczy otworzyć `index.html` w przeglądarce.

Opcjonalnie można uruchomić lokalny serwer:

```bash
npx serve .
# lub
python -m http.server 8080
```

### Ustawienie jako strony startowej

1. Opublikuj stronę (np. GitHub Pages) albo użyj lokalnej ścieżki `file:///…/index.html`.
2. W ustawieniach przeglądarki wybierz **Przy uruchomieniu → Otwórz konkretną stronę** i wklej adres.
3. Aby strona otwierała się też w nowej karcie, użyj rozszerzenia typu *New Tab Redirect*.

## Personalizacja

### Dodanie linku

W `index.html`, w sekcji `.links-grid`, dodaj kafelek:

```html
<!-- Nazwa -->
<a href="https://example.com/" class="link-card" target="_blank">
  <div class="letters">EX</div>
  <span class="name">Example</span>
</a>
```

`letters` to dwuliterowy skrót wyświetlany w kółku na kafelku.

### Lokalizacja pogody

W `js/script.js`, w funkcji `fetchWeather()`, zmień współrzędne (domyślnie Łódź):

```js
const lat = 51.75;
const lon = 19.4667;
```

### Kolory

Główne kolory są zdefiniowane jako zmienne CSS na początku `css/style.css`:

```css
:root {
  --bg-color: #0f0f13;
  --accent-color: #6366f1; /* Indigo */
  ...
}
```

Kolory, rozmiary i tempo zorzy w tle ustawia się w `css/style.css`, w klasach `.aurora-blob--1` … `--4` i animacjach `auroraDrift1` … `4`.

Kafelek można wyróżnić, dodając mu klasę `link-card--featured`.

### Powitanie

Tekst powitania zmienisz w `index.html`, w elementach `<title>` i `.greeting`.

## Wykorzystane biblioteki

| Biblioteka | Zastosowanie |
| --- | --- |
| [Font Awesome 6](https://fontawesome.com/) | Ikony (wyszukiwarka, pogoda) |
| [Inter](https://fonts.google.com/specimen/Inter) | Czcionka |
| [Open-Meteo API](https://open-meteo.com/) | Dane pogodowe |

Wszystkie są ładowane z CDN, więc nie trzeba ich instalować.

---

<div align="center">
<sub>Andrzej Herman @ Strona startowa</sub>
</div>
