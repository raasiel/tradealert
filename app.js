// Load puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');

// Constants & Variables
const width = 1366;
const height=768;


// Launch puppeteer
(async () => {
    const browser = await puppeteer.launch({
        //userDataDir: '/home/ahmed/proj/alert/profile',
        //   userDataDir: userProfileDir,
        headless: false,
        slowMo: 20, // slow down by 250ms,
        args:[
            '--start-maximized'
        ]
    });
    try {
        const page = await browser.newPage();
        // Set view port to a propersize for ui render 1366x768
        page.setViewport({width:width, height:height, isMobile:false});

        // Open the trading view home page for login
        await page.goto('https://www.tradingview.com/');
        await page.waitFor(4000);

        // Click Sign In button
        await page.click('.tv-header__link--signin');
        await page.waitFor(2000);

        // login as shafqat
        await page.type("input[name=username]", "shafqatahmed");
        await page.type("input[name=password]", "orion123@");
        await page.click('button[type=submit]');
        await page.waitFor(4000);

        //   After logging in, go to the chart view page
        await page.goto('https://www.tradingview.com/chart/QMs4haTU/');
        await page.waitFor(4000);

        // Load jQuery
        await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});
        await page.waitFor(4000);

        await page.exposeFunction("saveToFile", function (msgToSave) {
            var filename = __dirname + "/result.txt";
            try {
                fs.unlinkSync( filename)
            } catch (delFile) {

            }
            fs.writeFileSync (filename, msgToSave + "\n", 'utf-8');
        });

        var code = "function lastalert(){try{var t=$(\"table.alert-list>tbody\")[1]; var d=$(t).find(\"tr div.description-inner\"); if (d.length > 0){window.saveToFile($(d[0]).text());}}catch (e){console.log(e)}};setInterval(\"lastalert()\", 1000);";
        await page.evaluate(code);

    } catch (e) {
        console.log(e);
    }
})();

