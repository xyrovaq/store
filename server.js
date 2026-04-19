const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Alone_77";
const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || "admin-hidden";
const ADMIN_API_PREFIX = `/api/${ADMIN_SECRET_PATH}`;
const DATA_FILE = path.join(__dirname, "products.json");

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.get(["/", "/index.html"], (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  html = html.replace(/__ADMIN_API_BASE__/g, ADMIN_API_PREFIX);
  res.type("html").send(html);
});

app.use(express.static(__dirname));

function loadProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read products.json", error);
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function validateProductPayload(body) {
  const missingFields = [];
  if (isEmpty(body.title)) missingFields.push("title");
  if (isEmpty(body.price)) missingFields.push("price");
  if (isEmpty(body.description)) missingFields.push("description");
  if (isEmpty(body.image)) missingFields.push("image");
  if (isEmpty(body.category)) missingFields.push("category");
  return missingFields;
}

app.post(`${ADMIN_API_PREFIX}/login`, (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: "Invalid password" });
});

app.get("/api/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

app.post(`${ADMIN_API_PREFIX}/products`, (req, res) => {
  const { title, price, description, image, url, category } = req.body;
  const missingFields = validateProductPayload({ title, price, description, image, category });
  if (missingFields.length) {
    return res.status(400).json({ error: `Missing product fields: ${missingFields.join(", ")}` });
  }
  const products = loadProducts();
  const newProduct = {
    id: Date.now().toString(),
    title,
    price,
    description,
    image,
    url: url || "",
    category,
  };
  products.unshift(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

app.put(`${ADMIN_API_PREFIX}/products/:id`, (req, res) => {
  const { id } = req.params;
  const { title, price, description, image, url, category } = req.body;
  const missingFields = validateProductPayload({ title, price, description, image, category });
  if (missingFields.length) {
    return res.status(400).json({ error: `Missing product fields: ${missingFields.join(", ")}` });
  }
  const products = loadProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products[index] = { id, title, price, description, image, url: url || "", category };
  saveProducts(products);
  res.json(products[index]);
});

app.delete(`${ADMIN_API_PREFIX}/products/:id`, (req, res) => {
  const { id } = req.params;
  const products = loadProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products.splice(index, 1);
  saveProducts(products);
  res.status(204).end();
});

const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
