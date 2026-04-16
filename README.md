# Instagram Affiliate Landing Page

This is a simple static landing page you can use in your Instagram bio to share Amazon affiliate product links.

## Files

- `index.html` — front page for your followers.
- `styles.css` — styling for the card layout.
- `script.js` — product list and Amazon affiliate links.

## How to use

1. Install Node.js 18 or newer.
2. Install dependencies with `npm install`.
3. Start the server with `npm start`.
4. Open the page in your browser at `http://localhost:3000`.
5. Open the storefront at `http://localhost:3000/`.
6. Click the top section 10 times to open the hidden admin panel.
7. Enter the admin password: `Alone_77` (change this via `process.env.ADMIN_PASSWORD` or in `server.js`).
8. Add product title, price label, description, image URL, category, and affiliate link.
9. Host the app on any Node-capable host or deploy using services like Railway, Render, Fly.io, or Heroku.

## Deployment

This app is ready for public hosting as a Node.js app. Use the included `Procfile` for platforms like Heroku, or deploy the repository directly to Railway / Render.

### Deploy on Railway

1. Push this repo to GitHub.
2. Open https://railway.app and create a new project.
3. Connect your GitHub repository to Railway.
4. Railway will detect `package.json` and `Procfile` automatically.
5. Set `ADMIN_PASSWORD` in Railway environment variables if you want to keep it private.
6. Deploy the project.

Your app will be available at a Railway public URL once deployment finishes. Add products from the admin panel and they will appear publicly on the category page.

## Example affiliate link format

`https://www.amazon.com/dp/PRODUCT_ID/?tag=YOUR_AFFILIATE_ID`

## Notes

- Instagram supports one link in your bio, so this page acts as a gateway for your product links.
- When followers tap a product, they are redirected to Amazon with your affiliate tag.
- Make sure your Amazon Associates account and affiliate tag are valid.
