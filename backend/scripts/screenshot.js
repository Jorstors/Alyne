const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const EMAIL = 'justus1274@gmail.com';
const APP_URL = 'http://localhost:5173';

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("Taking Unauthenticated Screenshots...");
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_LoginPage.png') });

    // Generate Magic link and Login
    console.log("Generating login link...");
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: EMAIL,
      options: { redirectTo: `${APP_URL}/dashboard` }
    });

    if (error) {
      console.error("Auth Error:", error);
      process.exit(1);
    }

    const loginUrl = data.properties.action_link;
    console.log("Logging in via magic link...");
    await page.goto(loginUrl, { waitUntil: 'networkidle0' });
    await delay(5000); // Give React and Supabase time to process the #access_token and render Dashboard

    console.log("Taking Dashboard Screenshot...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_DashboardPage.png') });

    console.log("Navigating to Create Event Page...");
    await page.goto(`${APP_URL}/create`, { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_CreateEventPage.png') });

    console.log("Creating an event for the screenshot...");
    // Assuming there's a title input and button
    await page.type('input[placeholder="New Event Name"]', 'Project Final Presentation');
    // wait for create button to be enabled (disabled check)
    await delay(500);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(()=>delay(2000));
    await delay(2000); // Wait for event to render

    const eventUrl = page.url(); // Should be /event/:id
    console.log("Taking Event Page (New) Screenshot...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_EventPageNew.png') });

    console.log("Submitting availability...");
    await page.click('button:has-text("Save availability")').catch(()=>console.log("No save btn found"));
    await delay(2000);

    console.log("Taking Event Page (Submitted) Screenshot...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_EventPageSubmitted.png') });

    console.log("Navigating to Create Team Page...");
    await page.goto(`${APP_URL}/teams/new`, { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_CreateTeamPage.png') });

    console.log("Navigating to Teams Page...");
    await page.goto(`${APP_URL}/teams`, { waitUntil: 'networkidle0' });
    await delay(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_TeamsPage.png') });

    // Get first team id and go to Team Details
    console.log("Navigating to a Team Details Page...");
    const teamLinks = await page.$$eval('a[href^="/teams/"]', links => links.map(a => a.href));
    const specificTeamLink = teamLinks.find(link => !link.includes('/new'));
    if (specificTeamLink) {
      await page.goto(specificTeamLink, { waitUntil: 'networkidle0' });
      await delay(2000);
      // Expand members if collapsed
      await page.click('button:has-text("Show All Members")').catch(()=>null);
      await delay(500);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_TeamDetailsPage.png') });
    }

    // Join Team page mock
    console.log("Navigating to Join Team Page...");
    if (specificTeamLink) {
       const teamId = specificTeamLink.split('/').pop();
       await page.goto(`${APP_URL}/join/${teamId}`, { waitUntil: 'networkidle0' });
       await delay(2000);
       await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_JoinTeamPage.png') });
    }

    console.log("Navigating to Events Page...");
    await page.goto(`${APP_URL}/events`, { waitUntil: 'networkidle0' });
    await delay(2000);
    // Try to click edit dropdown
    await page.click('button[id^="radix-"]').catch(()=>null);
    await delay(500);
    await page.click('[role="menuitem"]:has-text("Edit Event")').catch(()=>null);
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_EventsPageEdit.png') });

    console.log("Navigating to Settings Page...");
    await page.goto(`${APP_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_SettingsPage.png') });

    console.log("DONE");
    await browser.close();
  } catch (err) {
    console.error("FATAL ERROR IN SCRIPT:", err);
    process.exit(1);
  }
})();
