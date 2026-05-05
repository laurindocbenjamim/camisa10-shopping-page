import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

const indexHtmlPath = path.join(rootDir, 'index.html');
const robotsTxtPath = path.join(rootDir, 'public', 'robots.txt');
const sitemapXmlPath = path.join(rootDir, 'public', 'sitemap.xml');

let exitCode = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        exitCode = 1;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

console.log('--- Running SEO Tests ---');

// 1. Check index.html for SEO tags
if (fs.existsSync(indexHtmlPath)) {
    const content = fs.readFileSync(indexHtmlPath, 'utf-8');
    assert(content.includes('<meta name="description"'), 'index.html has description meta tag');
    assert(content.includes('<meta property="og:title"'), 'index.html has og:title meta tag');
    assert(content.includes('<meta name="twitter:card"'), 'index.html has twitter:card meta tag');
    assert(content.includes('<link rel="canonical"'), 'index.html has canonical link');
} else {
    assert(false, 'index.html exists');
}

// 2. Check robots.txt
assert(fs.existsSync(robotsTxtPath), 'public/robots.txt exists');

// 3. Check sitemap.xml
assert(fs.existsSync(sitemapXmlPath), 'public/sitemap.xml exists');

console.log('-------------------------');
process.exit(exitCode);
