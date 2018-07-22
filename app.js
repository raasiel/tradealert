// Load puppeteer
const puppeteer = require('puppeteer');
// Load properties reader
const propertiesReader = require('properties-reader');
// Load fs for file write
const fs = require('fs');
// Constants & Variables
const width = 1366;
const height = 768;
// My profile, will change in other user directory
const userProfileDir = 'C:\\Users\\Abhijit\\Downloads\\tradealert-master\\tradealert-master\\profile';
// Properties file location, will change in other user directory
var inputFileLocation = 'C:\\Users\\Abhijit\\Downloads\\tradealert-master\\tradealert-master\\input.txt';
var properties = propertiesReader(inputFileLocation);
// The following info will change in different user accounts
var chartViewPage = properties.get('URL');
var userName = properties.get('Username');
var userPass = properties.get('Password');
var outputFileLocation = properties.get('Output File Location');
var timeInterval = properties.get('TimeInterval') * 1000;
// Launch puppeteer
(async () => {
    const browser = await puppeteer.launch({
    //userDataDir: userProfileDir,
    headless: false,
    slowMo: 20, // slow down by 250ms,
    args: [
        '--start-maximized'
    ]
});
try {
    const page = await browser.newPage();
    // Set view port to a propersize for ui render 1366x768
    page.setViewport({ width: width, height: height, isMobile: false });

    // Open the trading view home page for login
    await page.goto('https://www.tradingview.com/');
    await page.waitFor(4000);

    // Click Sign In button
    await page.click('.tv-header__link--signin');
    await page.waitFor(2000);

    // login as Mahedi
    await page.type("input[name=username]", userName);
    await page.type("input[name=password]", userPass);
    await page.click('button[type=submit]');
    await page.waitFor(4000);

    //   After logging in, go to the chart view page
    await page.goto(chartViewPage);
    await page.waitFor(4000);

    // Load jQuery
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
    await page.waitFor(4000);

    await page.exposeFunction("saveToFile", function (msgToSave) {
        fileName = '';
        /*If alert description text is Long, then do the following:
        1. Delete file named "short.txt" from the output location
        2. Check if "long.txt" file exists
        3. If exists, do not create the file again. Keep the file as it is.
        4. If not exists, create the file and write the alert description to it.*/
        if (msgToSave.toString() === 'Long') {
            try {
                fileName = outputFileLocation + "/long.txt";
                fs.unlinkSync(outputFileLocation + "/short.txt");
            } catch (delFile) {

            }
            if (!fs.existsSync(fileName)) {
                console.log(fileName);
                fs.writeFileSync(fileName, msgToSave + "\n", 'utf-8');
            }
        }
        /*If alert description text is Short, then do the following:
        1. Delete file named "long.txt" from the output location
        2. Check if "short.txt" file exists
        3. If exists, do not create the file again. Keep the file as it is.
        4. If not exists, create the file and write the alert description to it.*/
        else if (msgToSave.toString() === 'Short') {
            try {
                fileName = outputFileLocation + "/short.txt";
                fs.unlinkSync(outputFileLocation + "/long.txt");
            } catch (delFile) {

            }
            if (!fs.existsSync(fileName)) {
                fs.writeFileSync(fileName, msgToSave + "\n", 'utf-8');
            }
        }
    });
    var code = "function lastalert(){try{var t=$(\"table.alert-list>tbody\")[1]; var d=$(t).find(\"tr div.description-inner\"); if (d.length > 0){window.saveToFile($(d[0]).text());}}catch (e){console.log(e)}};setInterval(\"lastalert()\"," + timeInterval + ");";
    await page.evaluate(code);
} catch (e) {
    console.log(e);
}
})();