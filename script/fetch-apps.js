const gplay = require('google-play-scraper');
const fs = require('fs');
const path = require('path');

const DEV_ID = '6407847081352449241';
const OUTPUT_PATH = path.join(__dirname, '../data/apps.json');

async function updateApps() {
  try {
    console.log(`Fetching apps for developer ID: ${DEV_ID}...`);
    
    // Fetch developer apps list
    const apps = await gplay.developer({ devId: DEV_ID, fullDetail: true });

    // Format app objects for index.html
    const formattedApps = apps.map(app => ({
      title: app.title,
      icon: app.icon,
      description: app.summary || app.description || '',
      url: app.url
    }));

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save formatted output
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(formattedApps, null, 2));
    console.log(`Successfully updated ${formattedApps.length} apps in data/apps.json.`);
  } catch (error) {
    console.error('Failed to update app catalogue:', error);
    // Exit with non-zero code to prevent overwriting existing apps.json on error
    process.exit(1);
  }
}

updateApps();