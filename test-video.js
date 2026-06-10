const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-fake-ui-for-media-stream'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log("Navigating to Admin Support...");
  await page.goto('http://localhost:3000/admin/support', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('NODE')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));

  const videoBtn = await page.$('button[title="Initiate Secure Video Link"]');
  if (videoBtn) {
    console.log("Clicking Video Call button...");
    await videoBtn.click();
    await new Promise(r => setTimeout(r, 10000));
  } else {
    console.log("Video Call button not found!");
  }
  
  await browser.close();
  console.log("Done.");
})();
