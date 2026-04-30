const defaultRestaurants = [
  { id: makeId(), name: "Chick-fil-A", category: "Chicken", favorite: true },
  { id: makeId(), name: "Whataburger", category: "Burgers", favorite: true },
  { id: makeId(), name: "Taco Bell", category: "Tacos", favorite: false },
  { id: makeId(), name: "Raising Cane's", category: "Chicken", favorite: true },
  { id: makeId(), name: "Domino's Pizza", category: "Pizza", favorite: false },
  { id: makeId(), name: "Sonic Drive-In", category: "Burgers", favorite: false },
  { id: makeId(), name: "McDonald's", category: "Burgers", favorite: false },
  { id: makeId(), name: "Arby's", category: "Sandwiches", favorite: false },
  { id: makeId(), name: "KFC", category: "Chicken", favorite: false },
  { id: makeId(), name: "Burger King", category: "Burgers", favorite: false },
  { id: makeId(), name: "Chicken Express", category: "Chicken", favorite: false },
  { id: makeId(), name: "Golden Chick", category: "Chicken", favorite: false },
  { id: makeId(), name: "Wendy's", category: "Burgers", favorite: false },
  { id: makeId(), name: "Alfredo's Mexican", category: "Mexican", favorite: false },
  { id: makeId(), name: "Taco Bueno", category: "Tacos", favorite: false },
  { id: makeId(), name: "Subway", category: "Sandwiches", favorite: false },
  { id: makeId(), name: "IHOP", category: "Breakfast", favorite: false },
];

const categoryColors = {
  Burgers: "#f25c54",
  Chicken: "#f4b942",
  Pizza: "#4b88a2",
  Tacos: "#4d9078",
  Sandwiches: "#8b5cf6",
  Mexican: "#d97706",
  Breakfast: "#2f9e44",
  Dessert: "#d65db1",
  Other: "#7c8491",
};

const restaurantLogos = {
  "Chick-fil-A": "assets/logos/chickfila.png",
  Whataburger: "assets/logos/whataburger.png",
  "Taco Bell": "assets/logos/tacobell.png",
  "Raising Cane's": "assets/logos/raisingcanes.png",
  "Domino's Pizza": "assets/logos/dominos.png",
  "Sonic Drive-In": "assets/logos/sonic.png",
  "McDonald's": "assets/logos/mcdonalds.png",
  "Arby's": "assets/logos/arbys.png",
  KFC: "assets/logos/KFC.png",
  "Burger King": "assets/logos/burgerking.png",
  "Chicken Express": "assets/logos/chickenexpress.png",
  "Golden Chick": "assets/logos/goldenchick.jpeg",
  "Wendy's": "assets/logos/wendys.png",
  "Alfredo's Mexican": "assets/logos/alfredos.png",
  "Taco Bueno": "assets/logos/tacobueno.png",
  Subway: "assets/logos/subway.png",
  IHOP: "assets/logos/ihop.png",
};

const storageKey = "dinner-decider-restaurants-v3";

const wheel = document.querySelector("#wheel");
const spinButton = document.querySelector("#spin-button");
const resultCard = document.querySelector("#result-card");
const resultName = document.querySelector("#result-name");
const resultCategory = document.querySelector("#result-category");
const filterRow = document.querySelector("#filter-row");
const list = document.querySelector("#restaurant-list");
const countLabel = document.querySelector("#count-label");
const favoritesToggle = document.querySelector("#favorites-toggle");
const resetButton = document.querySelector("#reset-button");
const addForm = document.querySelector("#add-form");
const nameInput = document.querySelector("#restaurant-name");
const categoryInput = document.querySelector("#restaurant-category");

let restaurants = loadRestaurants();
let selectedCategory = "All";
let favoritesOnly = false;
let currentRotation = 0;
let isSpinning = false;

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `restaurant-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadRestaurants() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return defaultRestaurants;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultRestaurants;
  } catch {
    return defaultRestaurants;
  }
}

function saveRestaurants() {
  localStorage.setItem(storageKey, JSON.stringify(restaurants));
}

function getVisibleRestaurants() {
  return restaurants.filter((restaurant) => {
    const matchesCategory = selectedCategory === "All" || restaurant.category === selectedCategory;
    const matchesFavorite = !favoritesOnly || restaurant.favorite;
    return matchesCategory && matchesFavorite;
  });
}

function getCategories() {
  return ["All", ...new Set(restaurants.map((restaurant) => restaurant.category))];
}

function createLogoImage(restaurant, className) {
  const logoPath = restaurantLogos[restaurant.name];
  if (!logoPath) return null;

  const image = document.createElement("img");
  image.className = className;
  image.src = logoPath;
  image.alt = `${restaurant.name} logo`;
  image.loading = "eager";
  return image;
}

function renderFilters() {
  filterRow.innerHTML = "";

  getCategories().forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip${selectedCategory === category ? " is-active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      selectedCategory = category;
      render();
    });
    filterRow.append(button);
  });
}

function renderWheel() {
  const visible = getVisibleRestaurants();

  wheel.innerHTML = "";

  if (!visible.length) {
    wheel.style.background = "conic-gradient(#d7dce2, #eef1f4, #d7dce2)";
    spinButton.disabled = true;
    return;
  }

  spinButton.disabled = isSpinning;

  const step = 360 / visible.length;
  const gradient = visible
    .map((restaurant, index) => {
      const color = categoryColors[restaurant.category] || categoryColors.Other;
      return `${color} ${index * step}deg ${(index + 1) * step}deg`;
    })
    .join(", ");

  wheel.style.background = `
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0 18%, transparent 19%),
    repeating-conic-gradient(from -90deg, rgba(255,255,255,0.36) 0 1deg, transparent 1deg ${step}deg),
    conic-gradient(from -90deg, ${gradient})
  `;

  visible.forEach((restaurant, index) => {
    const label = document.createElement("div");
    const logo = createLogoImage(restaurant, "wheel-logo");

    label.className = "wheel-segment-label";
    label.style.setProperty("--angle", `${index * step + step / 2 - 90}deg`);
    if (logo) label.append(logo);
    wheel.append(label);
  });
}

function renderList() {
  const visible = getVisibleRestaurants();
  list.innerHTML = "";
  countLabel.textContent = `${visible.length} ${visible.length === 1 ? "choice" : "choices"}`;
  favoritesToggle.classList.toggle("is-active", favoritesOnly);

  if (!visible.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No restaurants match this view. Switch filters or add a new place.";
    list.append(empty);
    return;
  }

  visible.forEach((restaurant) => {
    const item = document.createElement("li");
    const logo = createLogoImage(restaurant, "restaurant-logo");
    const main = document.createElement("div");
    const name = document.createElement("span");
    const category = document.createElement("span");
    const actions = document.createElement("div");
    const favoriteButton = document.createElement("button");
    const removeButton = document.createElement("button");

    item.className = "restaurant-item";
    main.className = "restaurant-main";
    name.className = "restaurant-name";
    category.className = "restaurant-category";
    actions.className = "restaurant-actions";
    favoriteButton.className = `favorite-button${restaurant.favorite ? " is-active" : ""}`;
    removeButton.className = "remove-button";

    name.textContent = restaurant.name;
    category.textContent = restaurant.category;
    favoriteButton.type = "button";
    favoriteButton.textContent = "*";
    favoriteButton.setAttribute("aria-label", `Favorite ${restaurant.name}`);
    removeButton.type = "button";
    removeButton.textContent = "x";
    removeButton.setAttribute("aria-label", `Remove ${restaurant.name}`);

    main.append(name, category);
    actions.append(favoriteButton, removeButton);
    if (logo) item.append(logo);
    item.append(main, actions);

    favoriteButton.addEventListener("click", () => {
      restaurant.favorite = !restaurant.favorite;
      saveRestaurants();
      render();
    });

    removeButton.addEventListener("click", () => {
      restaurants = restaurants.filter((itemRestaurant) => itemRestaurant.id !== restaurant.id);
      if (!getCategories().includes(selectedCategory)) selectedCategory = "All";
      saveRestaurants();
      render();
    });

    list.append(item);
  });
}

function render() {
  renderFilters();
  renderWheel();
  renderList();
}

function pickWinner() {
  const visible = getVisibleRestaurants();
  if (!visible.length || isSpinning) return;

  isSpinning = true;
  spinButton.disabled = true;
  resultCard.classList.remove("is-idle", "is-winner");
  resultCard.classList.add("is-spinning");
  resultName.textContent = "Spinning...";
  resultCategory.textContent = "The wheel is thinking.";

  const winningIndex = Math.floor(Math.random() * visible.length);
  const segmentSize = 360 / visible.length;
  const winningCenter = winningIndex * segmentSize + segmentSize / 2;
  const targetAtPointer = 360 - winningCenter;
  const fullTurns = 5 + Math.floor(Math.random() * 3);
  currentRotation += fullTurns * 360 + targetAtPointer - (currentRotation % 360);
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  window.setTimeout(() => {
    const winner = visible[winningIndex];
    const logo = createLogoImage(winner, "winner-logo");
    const winnerText = document.createElement("span");

    resultCard.style.setProperty("--winner-color", categoryColors[winner.category] || categoryColors.Other);
    resultName.innerHTML = "";
    winnerText.textContent = winner.name;

    if (logo) resultName.append(logo);
    resultName.append(winnerText);
    resultCategory.textContent = `${winner.category} has spoken. Dinner is decided.`;
    resultCard.classList.remove("is-spinning");
    resultCard.classList.add("is-winner");
    isSpinning = false;
    spinButton.disabled = false;
  }, 4150);
}

spinButton.addEventListener("click", pickWinner);

favoritesToggle.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  render();
});

resetButton.addEventListener("click", () => {
  restaurants = defaultRestaurants.map((restaurant) => ({ ...restaurant, id: makeId() }));
  selectedCategory = "All";
  favoritesOnly = false;
  currentRotation = 0;
  wheel.style.transform = "rotate(0deg)";
  resultCard.classList.remove("is-spinning", "is-winner");
  resultCard.classList.add("is-idle");
  resultName.textContent = "Ready when you are";
  resultCategory.textContent = "Spin the wheel to decide.";
  saveRestaurants();
  render();
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const category = categoryInput.value;

  if (!name) {
    nameInput.focus();
    return;
  }

  restaurants.push({
    id: makeId(),
    name,
    category,
    favorite: false,
  });

  nameInput.value = "";
  selectedCategory = "All";
  saveRestaurants();
  render();
});

resultCard.classList.add("is-idle");
render();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
