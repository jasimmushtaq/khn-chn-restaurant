import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1200,800']
    });

    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            fs.appendFileSync('error.txt', `CONSOLE ERROR: ${msg.text()}\n`);
            const location = msg.location();
            if (location) {
                fs.appendFileSync('error.txt', `Location: ${location.url} ${location.lineNumber}\n`);
            }
        }
    });

    page.on('pageerror', error => {
        fs.appendFileSync('error.txt', `PAGE ERROR STR: ${error.toString()}\nPAGE ERROR STACK: ${error.stack}\n`);
    });

    console.log("Navigating to home...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log("Adding items to cart...");
    await page.goto('http://localhost:3000/menu', { waitUntil: 'networkidle2' });

    await page.waitForSelector('button', { timeout: 5000 });

    const addButtons = await page.$$('button');
    for (let btn of addButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.trim().startsWith('ADD')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 500));
            break; // add one item
        }
    }

    console.log("Navigating to orders page...");
    try {
        await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle2' });
    } catch (e) {
        console.log("Failed to goto orders", e);
    }

    console.log("Waiting a bit to capture errors...");
    await new Promise(r => setTimeout(r, 2000));

    const content = await page.content();
    console.log("BODY TAG CONTENT LENGTH:", content.length);

    await browser.close();
})();
