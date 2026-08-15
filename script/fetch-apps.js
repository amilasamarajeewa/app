const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DEV_URL = 'https://play.google.com/store/apps/dev?id=6407847081352449241';
const OUTPUT_PATH = path.join(__dirname, '../data/apps.json');

async function updateApps() {
  try {
    console.log('Fetching developer page from Google Play...');
    const { data } = await axios.get(DEV_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const apps = [];

    // Parse app links from the developer page HTML
    $('a[href*="/store/apps/details"]').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).find('span').text().trim() || $(el).attr('aria-label') || 'App';
      const icon = $(el).find('img').attr('src') || '';

      const fullUrl = href.startsWith('http') ? href : `https://play.google.com${href}`;

      // Prevent duplicate app entries
      if (!apps.some(app => app.url === fullUrl)) {
        apps.push({
          title: title,
          icon: icon,
          description: 'Available on Google Play',
          url: fullUrl
        });
      }
    });

    console.log(`Found ${apps.length} apps.`);

    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    // Only overwrite if we found apps, otherwise keep existing data
    if (apps.length > 0) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(apps, null, 2));
      console.log('Successfully saved to data/apps.json!');
    } else {
      console.log('No apps parsed. Preserving existing data/apps.json.');
    }
  } catch (error) {
    console.error('Error fetching Google Play data:', error.message);
    process.exit(1);
  }
}

updateApps();
