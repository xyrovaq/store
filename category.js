const API_BASE = "/api";
const categories = [
  { id: "all", label: "All Categories", description: "Browse everything", icon: "✨" },
  { id: "Clothing", label: "Clothing", description: "Fashion, outfits, and apparel", icon: "👕" },
  { id: "Footwear", label: "Footwear", description: "Shoes, sneakers, and sandals", icon: "👟" },
  { id: "Accessories", label: "Accessories", description: "Bags, jewelry, and more", icon: "👜" },
  { id: "Toys & Games", label: "Toys & Games", description: "Fun for all ages", icon: "🧸" },
  { id: "Household", label: "Household / Office", description: "Home, office, and furniture", icon: "🛋️" },
  { id: "Tech", label: "Tech", description: "Gadgets, devices, and accessories", icon: "💻" },
];

const selectedCategoryTitle = document.getElementById("selectedCategoryTitle");
const pageTitle = document.getElementById("pageTitle");
const productGrid = document.getElementById("productGrid");
const messageElement = document.getElementById("noProductsMessage");

const urlParams = new URLSearchParams(window.location.search);
const requestedCategoryId = urlParams.get("category");
const category = categories.find((item) => item.id === requestedCategoryId) || categories.find((item) => item.id === "all");
let products = [];

function loadLocalProducts() {
  try {
    return JSON.parse(localStorage.getItem("affiliateProductsLocal") || "[]");
  } catch (error) {
    return [];
  }
}

function saveLocalProducts(items) {
  localStorage.setItem("affiliateProductsLocal", JSON.stringify(items));
}

function getFilteredProducts() {
  if (!category || category.id === "all") {
    return products;
  }
  return products.filter((product) => product.category === category.id);
}

function renderProducts() {
  if (!productGrid || !messageElement) return;
  productGrid.innerHTML = "";
  const visibleProducts = getFilteredProducts();

  selectedCategoryTitle.textContent = category ? category.label : "Category";
  pageTitle.textContent = category ? `Shop ${category.label}` : "Shop category";

  if (!visibleProducts.length) {
    messageElement.classList.remove("hidden");
    messageElement.textContent = category && category.id !== "all"
      ? `No ${category.label} products available right now.`
      : "No products added yet. Check back soon.";
    return;
  }

  messageElement.classList.add("hidden");
  visibleProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" />
      <div class="product-info">
        <h2 class="product-title">${product.title}</h2>
        <p class="product-price">${product.price}</p>
        <p class="product-desc">${product.description || ""}</p>
        ${product.url ? `
          <a class="product-button" href="${product.url}" target="_blank" rel="noopener noreferrer">
            View on Amazon
          </a>
        ` : `
          <p class="product-link-placeholder">Affiliate link not added yet.</p>
        `}
      </div>
    `;
    productGrid.appendChild(card);
  });
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      throw new Error("Failed to load products");
    }
    products = await response.json();
    saveLocalProducts(products);
  } catch (error) {
    products = loadLocalProducts();
  }
  renderProducts();
}

fetchProducts();
