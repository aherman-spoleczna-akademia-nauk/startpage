/*
 * WYSZUKIWARKA
 * - "/" z dowolnego miejsca ustawia kursor w wyszukiwarce, Esc czyści i wychodzi
 * - prefiksy: "yt kot" szuka na YouTube, "al słuchawki" na Allegro itd.
 * - podczas pisania podświetlają się pasujące kafelki; Enter otwiera pierwszy,
 *   Shift+Enter zawsze szuka w Google
 */
(function () {
  const ENGINES = {
    yt: { name: "YouTube", url: "https://www.youtube.com/results?search_query=" },
    al: { name: "Allegro", url: "https://allegro.pl/listing?string=" },
    m: { name: "Mapy Google", url: "https://www.google.com/maps/search/" },
    gh: { name: "GitHub", url: "https://github.com/search?q=" },
    w: { name: "Wikipedia", url: "https://pl.wikipedia.org/w/index.php?search=" },
    tl: { name: "Tłumacz", url: "https://translate.google.com/?sl=auto&tl=pl&text=" },
  };
  const GOOGLE_URL = "https://www.google.com/search?q=";

  const container = document.getElementById("search-container");
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const engineBadge = document.getElementById("search-engine");
  const grid = document.querySelector(".links-grid");
  const cards = [...grid.querySelectorAll(".link-card")];

  // Porównywanie bez wielkości liter i polskich znaków ("plan zajec" = "Plan zajęć")
  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/ł/g, "l")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const cardNames = cards.map((card) =>
    normalize(card.querySelector(".name").textContent.trim()),
  );

  // "yt kot" → { engine: YouTube, term: "kot" }; bez prefiksu → { engine: null, term }
  function parse(value) {
    const match = value.match(/^(\S+)\s+(.*)$/);
    const engine = match && ENGINES[match[1].toLowerCase()];
    if (engine) return { engine, term: match[2].trim() };
    return { engine: null, term: value.trim() };
  }

  // Kafelki, których nazwa (albo któreś jej słowo) zaczyna się od wpisanego tekstu
  function findCards(term) {
    const query = normalize(term);
    if (!query) return [];
    return cards.filter((card, i) => {
      const name = cardNames[i];
      return (
        name.startsWith(query) ||
        name.split(/\s+/).some((word) => word.startsWith(query))
      );
    });
  }

  let firstMatch = null;

  function update() {
    const { engine, term } = parse(input.value);

    engineBadge.hidden = !engine;
    engineBadge.textContent = engine ? engine.name : "";
    container.classList.toggle("has-engine", Boolean(engine));

    const matches = engine ? [] : findCards(term);
    firstMatch = matches[0] || null;
    grid.classList.toggle("is-filtering", matches.length > 0);
    cards.forEach((card) => {
      card.classList.toggle("is-match", matches.includes(card));
      card.classList.toggle("is-first", card === firstMatch);
    });
  }

  function reset() {
    input.value = "";
    update();
  }

  function openInNewTab(url) {
    window.open(url, "_blank", "noopener");
  }

  function submit(forceSearch) {
    const { engine, term } = parse(input.value);

    if (!engine && firstMatch && !forceSearch) {
      openInNewTab(firstMatch.href);
      reset();
      return;
    }

    if (!term) return;
    openInNewTab((engine ? engine.url : GOOGLE_URL) + encodeURIComponent(term));
    reset();
  }

  input.addEventListener("input", update);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(e.shiftKey);
    } else if (e.key === "Escape") {
      reset();
      input.blur();
    }
  });

  // Np. przycisk "Szukaj" na klawiaturze telefonu
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submit(false);
  });

  // "/" z dowolnego miejsca strony (poza polami tekstowymi) → wyszukiwarka
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable;
    if (typing) return;
    e.preventDefault();
    input.focus();
  });
})();
