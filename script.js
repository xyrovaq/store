const API_BASE = "/api";
const ADMIN_API_BASE = window.ADMIN_API_BASE || "/api/admin-hidden";
const categories = [
  { id: "all", label: "All Categories", description: "Browse everything", icon: "✨" },
  { id: "Clothing", label: "Clothing", description: "Fashion, outfits, and apparel", icon: "👕" },
  { id: "Footwear", label: "Footwear", description: "Shoes, sneakers, and sandals", icon: "👟" },
  { id: "Accessories", label: "Accessories", description: "Bags, jewelry, and more", icon: "👜" },
  { id: "Toys & Games", label: "Toys & Games", description: "Fun for all ages", icon: "🧸" },
  { id: "Household", label: "Household / Office", description: "Home, office, and furniture", icon: "🛋️" },
  { id: "Tech", label: "Tech", description: "Gadgets, devices, and accessories", icon: "💻" },
];

const productGrid = document.getElementById("productGrid");
const categoryGrid = document.getElementById("categoryGrid");
const selectedCategoryTitle = document.getElementById("selectedCategoryTitle");
const clearFilterBtn = document.getElementById("clearFilterBtn");
const adminOverlay = document.getElementById("adminOverlay");
const isIndexPage = window.location.pathname.endsWith("/") || window.location.pathname.endsWith("index.html");
const adminCloseBtn = document.getElementById("adminCloseBtn");
const adminLogin = document.getElementById("adminLogin");
const adminContent = document.getElementById("adminContent");
const adminPasswordInput = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const productForm = document.getElementById("productForm");
const productTitle = document.getElementById("productTitle");
const productPrice = document.getElementById("productPrice");
const productImage = document.getElementById("productImage");
const productImageFile = document.getElementById("productImageFile");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");
const productUrl = document.getElementById("productUrl");
const productCancelBtn = document.getElementById("productCancelBtn");
const adminMessage = document.getElementById("adminMessage");
const adminProductList = document.getElementById("adminProductList");
const adminAvatar = document.querySelector(".avatar");

let adminRevealCount = 0;
let adminRevealTimer = null;

let products = [];
let editingProductId = null;
let selectedCategory = "all";
let adminLoggedIn = false;
const STORAGE_KEY = "affiliateProductsLocal";
const DEFAULT_ADMIN_PASSWORD = "Alone_77";

function loadLocalProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function saveLocalProducts(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function shouldOpenAdminFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return window.location.pathname.endsWith("admin.html") || params.has("admin");
}

function revealAdminAccess() {
  adminRevealCount += 1;
  clearTimeout(adminRevealTimer);
  adminRevealTimer = setTimeout(() => {
    adminRevealCount = 0;
  }, 7000);
  if (adminRevealCount >= 50) {
    openAdmin();
    adminRevealCount = 0;
  }
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      throw new Error("Server unavailable");
    }
    products = await response.json();
    saveLocalProducts(products);
  } catch (error) {
    console.warn("Product fetch failed, using local fallback:", error);
    products = loadLocalProducts();
    showAdminMessage("Loaded products locally. You can still add items.", "info");
  }
  renderCategoryGrid();
  renderProducts();
}

function getFilteredProducts() {
  return selectedCategory === "all"
    ? products
    : products.filter((product) => product.category === selectedCategory);
}

function renderProducts() {
  if (!productGrid) return;
  const visibleProducts = getFilteredProducts();
  productGrid.innerHTML = "";
  const message = document.getElementById("noProductsMessage");
  if (!message) return;

  if (!visibleProducts.length) {
    message.classList.remove("hidden");
    message.textContent = selectedCategory === "all"
      ? "No products added yet. Use Admin to add your picks."
      : `No ${selectedCategory} products available right now.`;
    return;
  }

  message.classList.add("hidden");
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

function renderCategoryGrid() {
  if (!categoryGrid) return;
  categoryGrid.innerHTML = "";
  categories.forEach((category) => {
    const card = document.createElement("a");
    card.className = "category-card";
    card.href = `category.html?category=${encodeURIComponent(category.id)}`;
    card.innerHTML = `
      <div class="category-icon">${category.icon}</div>
      <div>
        <h3 class="category-title">${category.label}</h3>
        <p class="category-desc">${category.description}</p>
      </div>
    `;
    categoryGrid.appendChild(card);
  });
}

function setCategory(categoryId) {
  selectedCategory = categoryId;
  const category = categories.find((item) => item.id === categoryId);
  selectedCategoryTitle.textContent = category ? category.label : "All Categories";
  renderCategoryGrid();
  renderProducts();
}

function showAdminLogin() {
  adminOverlay.classList.remove("hidden");
  if (adminLogin) adminLogin.classList.remove("hidden");
  if (adminContent) adminContent.classList.add("hidden");
  if (adminPasswordInput) adminPasswordInput.value = "";
  showAdminMessage("Enter admin password to continue.");
}

function showAdminContent() {
  if (adminLogin) adminLogin.classList.add("hidden");
  if (adminContent) adminContent.classList.remove("hidden");
  renderAdminList();
  showAdminMessage("Admin mode enabled. Add or edit products below.");
}

function openAdmin() {
  if (adminLoggedIn) {
    showAdminContent();
  } else {
    showAdminLogin();
  }
  resetForm();
}

function closeAdmin() {
  adminOverlay.classList.add("hidden");
}

function showAdminMessage(message, type = "info") {
  if (!adminMessage) return;
  adminMessage.textContent = message;
  adminMessage.style.color = type === "error" ? "#fca5a5" : "#e2e8f0";
}

function renderAdminList() {
  adminProductList.innerHTML = "";
  if (!products.length) {
    adminProductList.innerHTML = "<p>No products available yet.</p>";
    return;
  }

  products.forEach((product) => {
    const item = document.createElement("div");
    item.className = "admin-product-item";
    item.innerHTML = `
      <p><strong>${product.title}</strong></p>
      <p>${product.price} · ${product.category}</p>
      <p>${product.description || ""}</p>
      ${product.url ? `<p><a href="${product.url}" target="_blank" rel="noopener noreferrer">Open affiliate link</a></p>` : `<p class="admin-no-link">No affiliate link yet.</p>`}
      <div class="item-actions">
        <button class="edit-btn" data-id="${product.id}">Edit</button>
        <button class="delete-btn" data-id="${product.id}">Delete</button>
      </div>
    `;
    adminProductList.appendChild(item);
  });
}

function fillForm(product) {
  productTitle.value = product.title;
  productPrice.value = product.price;
  productDescription.value = product.description || "";
  productImage.value = product.image;
  if (productImageFile) {
    productImageFile.value = "";
  }
  productCategory.value = product.category || "Accessories";
  productUrl.value = product.url;
}

function resetForm() {
  productForm.reset();
  if (productImageFile) {
    productImageFile.value = "";
  }
  editingProductId = null;
  showAdminMessage("Ready to add a new product.");
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const password = adminPasswordInput?.value.trim();

  if (!password) {
    showAdminMessage("Enter the password.", "error");
    return;
  }

  try {
    const response = await fetch(`${ADMIN_API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Invalid credentials");
    }

    await response.json();
    adminLoggedIn = true;
    showAdminContent();
    await fetchProducts();
  } catch (error) {
    if (password === DEFAULT_ADMIN_PASSWORD) {
      adminLoggedIn = true;
      showAdminContent();
      products = loadLocalProducts();
      renderCategoryGrid();
      renderProducts();
      showAdminMessage("Admin enabled locally. Server may be unavailable.", "info");
      return;
    }
    showAdminMessage(error?.message || "Invalid login. Try again.", "error");
  }
}

async function handleProductSubmit(event) {
  event.preventDefault();
  const title = productTitle.value.trim();
  const price = productPrice.value.trim();
  const description = productDescription.value.trim();
  const image = productImage.value.trim();
  const category = productCategory.value;
  const url = productUrl.value.trim();

  if (!title || !price || !description || !image || !category) {
    showAdminMessage("Title, price, description, image, and category are required.", "error");
    return;
  }

  const body = { title, price, description, image, category, url };

  try {
    const response = await fetch(
      editingProductId ? `${ADMIN_API_BASE}/products/${editingProductId}` : `${ADMIN_API_BASE}/products`,
      {
        method: editingProductId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.error || response.statusText || "Failed to save product";
      throw new Error(errorMsg);
    }
    editingProductId = null;
    productForm.reset();
    await fetchProducts();
    renderAdminList();
    showAdminMessage("Product saved successfully.");
  } catch (error) {
    const product = {
      id: editingProductId || Date.now().toString(),
      title,
      price,
      description,
      image,
      url,
      category,
    };
    if (editingProductId) {
      products = products.map((item) => (item.id === editingProductId ? product : item));
    } else {
      products.unshift(product);
    }
    saveLocalProducts(products);
    editingProductId = null;
    productForm.reset();
    renderCategoryGrid();
    renderAdminList();
    showAdminMessage("Product saved locally. Server unavailable.", "info");
  }
}

async function handleAdminAction(event) {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;

  if (target.matches(".edit-btn")) {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    editingProductId = id;
    fillForm(product);
    showAdminMessage("Editing product. Save to update.");
  }

  if (target.matches(".delete-btn")) {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      await fetchProducts();
      renderAdminList();
      resetForm();
      showAdminMessage("Product deleted.");
    } catch (error) {
      products = products.filter((item) => item.id !== id);
      saveLocalProducts(products);
      renderCategoryGrid();
      renderAdminList();
      resetForm();
      showAdminMessage("Product deleted locally. Server unavailable.", "info");
    }
  }
}

if (adminCloseBtn) {
  adminCloseBtn.addEventListener("click", closeAdmin);
}
if (adminLoginBtn) {
  adminLoginBtn.addEventListener("click", handleAdminLogin);
}
if (productForm) {
  productForm.addEventListener("submit", handleProductSubmit);
}
if (productCancelBtn) {
  productCancelBtn.addEventListener("click", resetForm);
}
if (productImageFile) {
  productImageFile.addEventListener("change", () => {
    const file = productImageFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        productImage.value = reader.result;
        showAdminMessage("Image loaded from your file.");
      }
    };
    reader.readAsDataURL(file);
  });
}
if (adminProductList) {
  adminProductList.addEventListener("click", handleAdminAction);
}
if (categoryGrid && !window.location.pathname.endsWith("category.html")) {
  categoryGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".category-card");
    if (!card) return;
    if (card.tagName.toLowerCase() === "a") return;
    setCategory(card.dataset.category);
  });
}
if (clearFilterBtn) {
  clearFilterBtn.addEventListener("click", () => setCategory("all"));
}

if (adminAvatar) {
  adminAvatar.addEventListener("click", revealAdminAccess);
}

fetchProducts().then(() => {
  if (shouldOpenAdminFromUrl()) {
    openAdmin();
  }
});
