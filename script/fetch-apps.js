const gplay = require('google-play-scraper');
const fs = require('fs');
const path = require('path');

// Pass string developer name instead of raw ID
const DEV_NAME = 'AS TechnoArt'; 
const OUTPUT_PATH = path.join(__dirname, '../data/apps.json');

async function updateApps() {
  try {
    console.log(`Fetching apps for developer: ${DEV_NAME}...`);
    
    // Fetch apps by developer name
    const apps = await gplay.developer({ devId: DEV_NAME });

    const formattedApps = apps.map(app => ({
      title: app.title,
      icon: app.icon,
      description: app.summary || app.description || '',
      url: app.url
    }));

    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(formattedApps, null, 2));
    console.log(`Updated ${formattedApps.length} apps in data/apps.json.`);
  } catch (error) {
    console.error('Scraper error:', error);
    process.exit(1);
  }
}

updateApps();
