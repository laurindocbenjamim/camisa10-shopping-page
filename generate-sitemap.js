import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');

// Define static routes
const routes = [
  '/',
  '/cart',
  '/checkout'
];

// In a real scenario, we might also fetch dynamic product routes from an API
// For now, we generate the sitemap with static core routes.

const generateSitemap = () => {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `
  <url>
    <loc>https://camisa10.com.br${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log('✅ Sitemap successfully generated at public/sitemap.xml');
};

generateSitemap();
