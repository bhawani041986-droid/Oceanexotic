const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log("Navigating to http://localhost:3000/admin/support...");
  await page.goto('http://localhost:3000/admin/support', { waitUntil: 'networkidle2' });
  
  console.log("Waiting a bit...");
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
