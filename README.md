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

- 🕒 **Zegar i data** – aktualizowane co sekundę, w formacie polskim (`pl-PL`), w strefie czasowej Twojej lokalizacji (np. w Tokio pokażą czas tokijski). Bez zgody na lokalizację – czas systemowy.
- 🌤️ **Pogoda** – aktualna temperatura z [Open-Meteo](https://open-meteo.com/) dla Twojej lokalizacji, której nazwa wyświetla się pod opisem pogody. Bez zgody na lokalizację pokazuje pogodę dla Łodzi. Po kliknięciu rozwija się panel z temperaturą odczuwalną, wilgotnością, wiatrem, wschodem i zachodem słońca, prognozą na 12 godzin i na 4 dni. Nie wymaga klucza API i odświeża się co 30 minut.
- 🔍 **Wyszukiwarka Google** – zapytanie otwiera się w nowej karcie.
- 🔗 **Kafelki z linkami** – siatka skrótów z jednokolorowymi ikonami: logo marek z [Simple Icons](https://simpleicons.org/) albo pasujące ikony z Font Awesome.
- ✨ **Animowane tło** – „zorza” z rozmytych, powoli przepływających plam koloru, w czystym CSS (bez WebGL). Jedna plama powoli podąża za kursorem.
- 🌗 **Tryb jasny i ciemny** – przełącznik *Jasny / Ciemny / Auto* na dole strony. *Auto* podąża za ustawieniem systemu, a wybór jest zapamiętywany w przeglądarce.
- 📱 **Responsywność** – układ działa na telefonie, tablecie i komputerze.

## Struktura projektu

```text
startpage/
├── index.html      # Struktura strony i lista linków
├── css/
│   └── style.css   # Wygląd, kolory, animacje, responsywność
├── js/
│   ├── theme.js    # Tryb jasny / ciemny / auto (ładowany w <head>)
│   └── script.js   # Zegar, pogoda, lokalizacja, zorza za kursorem
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
  <i class="card-icon fa-solid fa-star" aria-hidden="true"></i>
  <span class="name">Example</span>
</a>
```

Ikonę wybierasz na dwa sposoby:

- **Dowolna ikona Font Awesome** – zmień `fa-star` na ikonę z [katalogu Font Awesome](https://fontawesome.com/search?o=r&m=free), np. `fa-solid fa-music` albo `fa-brands fa-spotify`.
- **Logo marki z Simple Icons** – użyj `<span class="card-icon si-NAZWA" aria-hidden="true"></span>` i dopisz w `css/style.css` regułę `.si-NAZWA { --icon: url("https://cdn.jsdelivr.net/npm/simple-icons@16.30.0/icons/NAZWA.svg"); }`. Nazwy znajdziesz na [simpleicons.org](https://simpleicons.org/).

Kolor wszystkich ikon ustawiają zmienne `--icon-color` i `--icon-color-hover` w `css/style.css`. Wyróżniony kafelek (`link-card--featured`) ma różowo-pomarańczowe kolory, a jego ikona dostaje gradient, poświatę i animację „bicia serca”.

### Lokalizacja zapasowa

Pogoda pobiera się dla Twojej lokalizacji (przeglądarka zapyta o zgodę przy pierwszym wejściu). Na początku `js/script.js` możesz zmienić lokalizację zapasową, używaną bez zgody na lokalizację:

```js
const DEFAULT_LOCATION = { lat: 51.75, lon: 19.47, name: "Łódź", country: "Polska" };
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

Kolory trybu jasnego są w bloku `:root[data-theme="light"]` zaraz pod nim. Każda zmienna ma tam swój jasny odpowiednik.

Kolory, rozmiary i tempo zorzy w tle ustawia się w `css/style.css`, w klasach `.aurora-blob--1` … `--4` i animacjach `auroraDrift1` … `4`.

Kafelek można wyróżnić, dodając mu klasę `link-card--featured`.

Tytuł karty przeglądarki zmienisz w `index.html`, w elemencie `<title>`.

## Wykorzystane biblioteki

| Biblioteka | Zastosowanie |
| --- | --- |
| [Font Awesome 6](https://fontawesome.com/) | Ikony (wyszukiwarka, pogoda) |
| [Unbounded](https://fonts.google.com/specimen/Unbounded) | Czcionka zegara |
| [Manrope](https://fonts.google.com/specimen/Manrope) | Czcionka reszty strony |
| [Open-Meteo API](https://open-meteo.com/) | Dane pogodowe |
| [BigDataCloud](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Nazwa miejscowości ze współrzędnych |
| [Simple Icons 16.30.0](https://simpleicons.org/) | Logo marek w kafelkach |

Wszystkie są ładowane z CDN lub pobierane z darmowych API bez klucza, więc nie trzeba niczego instalować.

---

<div align="center">
<sub>Andrzej Herman @ Strona startowa</sub>
</div>
