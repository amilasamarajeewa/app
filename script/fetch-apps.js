const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '../data/apps.json');
const DEV_ID = '6407847081352449241';

async function updateApps() {
  try {
    console.log('Fetching Google Play Store catalogue...');
    
    // Query Google Play API mirror for developer apps
    const response = await axios.get(`https://play-store-api-proxy.vercel.app/api/developer?id=${DEV_ID}`, {
      timeout: 10000
    }).catch(() => null);

    let apps = [];

    if (response && response.data && Array.isArray(response.data)) {
      apps = response.data;
    } else {
      console.log('API proxy unavailable. Falling back to Google Play store scrape...');
      // Direct Play Store fallback fetch
      const devUrl = `https://play.google.com/store/apps/dev?id=${DEV_ID}&hl=en`;
      const page = await axios.get(devUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      const html = page.data;
      // Extract package names matching Google Play patterns
      const matches = [...html.matchAll(/\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/g)];
      const uniquePackages = [...new Set(matches.map(m => m[1]))];

      apps = uniquePackages.map(pkg => ({
        title: pkg.split('.').pop().replace(/_/g, ' ').toUpperCase(),
        icon: 'assets/logo.png',
        description: 'Official application on Google Play Store.',
        url: `https://play.google.com/store/apps/details?id=${pkg}`
      }));
    }

    if (apps.length > 0) {
      const dir = path.dirname(OUTPUT_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(apps, null, 2));
      console.log(`Successfully saved ${apps.length} apps to data/apps.json!`);
    } else {
      console.log('No apps detected automatically. Keeping existing data.');
    }
  } catch (err) {
    console.error('Error fetching apps:', err.message);
    process.exit(0); // Exit gracefully without breaking workflow
  }
}

updateApps();
