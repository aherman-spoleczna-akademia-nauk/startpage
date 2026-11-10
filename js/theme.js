/*
 * TRYB JASNY / CIEMNY / AUTO
 * Ładowany w <head> (bez defer), żeby ustawić tryb przed narysowaniem strony
 * – dzięki temu nie ma mignięcia złego koloru przy ładowaniu.
 *
 * Wybór zapisuje się w przeglądarce (localStorage). "Auto" podąża za
 * ustawieniem systemu i zmienia się razem z nim.
 */
(function () {
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");

  function readPreference() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : "auto";
    } catch {
      return "auto";
    }
  }

  function savePreference(pref) {
    try {
      if (pref === "auto") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // Brak dostępu do pamięci – wybór działa do zamknięcia karty
    }
  }

  let preference = readPreference();

  function resolve(pref) {
    if (pref === "auto") return systemLight.matches ? "light" : "dark";
    return pref;
  }

  function updateButtons() {
    document.querySelectorAll(".theme-option").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themeValue === preference),
      );
    });
  }

  function apply() {
    root.dataset.theme = resolve(preference);
    updateButtons();
  }

  // Płynne przejście kolorów tylko przy zmianie trybu, nie przy ładowaniu
  function applyWithTransition() {
    root.classList.add("theme-transition");
    apply();
    setTimeout(() => root.classList.remove("theme-transition"), 450);
  }

  apply();

  systemLight.addEventListener("change", () => {
    if (preference === "auto") applyWithTransition();
  });

  document.addEventListener("DOMContentLoaded", () => {
    updateButtons();
    document.querySelectorAll(".theme-option").forEach((button) => {
      button.addEventListener("click", () => {
        preference = button.dataset.themeValue;
        savePreference(preference);
        applyWithTransition();
      });
    });
  });
})();
