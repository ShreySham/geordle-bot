const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const puppeteer = require('puppeteer');
const fs = require('fs');

/*
* Log in to Geoguessr and save the cookies when the home page is accessed
*/
async function loginSaveCookie(tab){
  try {
    await tab.goto('https://www.geoguessr.com/signin');
    await tab.type('email', process.env.GEO_EMAIL);
    await tab.type('password', process.env.GEO_EMAIL);
    await tab.click('.form-field_formField__beWhf form-field_typeActions__tMY1O');
    await tab.waitForSelector('[content="https://www.geoguessr.com/"]');
    const cookie = await tab.cookies();
    fs.writeFileSync('./cookes.json', JSON.stringify(cookie));

  /*
    await tab.get("https://www.geoguessr.com/signin");
    await tab.findElement(webdriver.By.name("email")).sendKeys(process.env.GEO_EMAIL);
    await tab.findElement(webdriver.By.name("password")).sendKeys(process.env.GEO_PASS);
    await tab.findElement(webdriver.By.className("button_button__CnARx button_variantPrimary__xc8Hp")).click();
    await tab.wait(webdriver.until.titleIs("GeoGuessr - Let's explore the world!"), 10000);
    let allCookies = await tab.manage().getCookies();
    for(const cookie of allCookies){
      fs.writeFileSync('./cookies.txt', JSON.stringify(cookie) + '\n', { flag: 'a+' }, err => {});
    }
  */
  } catch(error) {
    console.error("Error logging in: " + error);
  }

}

/**
 * Spin up WebDriver to access Goeguessr since they don't have any public APIs.
 * @returns The url of a Geoguessr challenge.
 */
async function getChallengeLink(optionalMap) {

  let mapName = optionalMap || "A Diverse World";
  let challengeLink = "";
  //let browser = new webdriver.Builder().forBrowser('chrome');
  //browser.setChromeOptions(new chrome.Options().addArguments('--headless=chrome', '--no-sandbox', '--single-process').windowSize({width: 1920, height: 1080}));
  //let tab = browser.build();
  try{
    const browser = await puppeteer.launch();
    const tab = await browser.newPage();
    if (fs.existsSync('./cookies.json')) {
      const cookies = JSON.parse(await fs.readFile('./cookies.json', 'utf8'));
      if (cookies[0].expiry < Math.round(Date.now() / 1000)) {
        fs.unlinkSync('./cookies.json');
        await loginSaveCookie(tab);
      }
    } else {
      await loginSaveCookie(tab);
    }
    await tab.deleteCookie();
    var fileBuffer = fs.readFileSync('./cookies.json');
    var allCookies = JSON.parse(fileBuffer);
    tab.setCookie(...allCookies);
    await tab.goto("https://www.geoguessr.com/");
    await tab.waitForFunction('document.querySelector');
    await tab.wait(webdriver.until.titleIs("GeoGuessr - Let's explore the world!"), 10000);
    console.log("gotHome");
    await tab.wait(await webdriver.until.elementLocated(await webdriver.By.className("quick-search_searchInputButton__kK9Hz")), 2000).click();
    await tab.wait(await webdriver.until.elementLocated(await webdriver.By.className("quick-search_searchInput__i7C6O")), 2000).click();
    await tab.findElement(webdriver.By.className("quick-search_searchInput__i7C6O")).sendKeys(mapName);
    await tab.wait(await webdriver.until.elementLocated(await webdriver.By.className("search-result_wrapper__jwHxo search-result_isFocused__ZAXVX")), 2000).click();
    await tab.wait(webdriver.until.titleContains("Map"), 10000);
    console.log("gotMap");
    await tab.findElement(webdriver.By.className("button_button__CnARx button_variantPrimary__xc8Hp button_sizeLarge__Va8YG")).click();
    await tab.wait(webdriver.until.titleContains("Start a game"), 10000);
    await tab.findElement(webdriver.By.css('*[data-qa="game-type-challenge"]')).click();
    await tab.findElement(webdriver.By.css('*[data-qa="invite-friends-button"]')).click();
    await tab.wait(await webdriver.until.elementLocated(await webdriver.By.className("text-input_textInput__HPC_k")), 2000).click();
    challengeLink = await tab.findElement(webdriver.By.className("text-input_textInput__HPC_k")).getAttribute("value");
  } catch(error) {
    console.error("Error navigating GeoGuessr: " + error);
  } finally {
    await tab.close();
  }
  console.log(challengeLink);
  return challengeLink;
}

module.exports.getChallengeLink = getChallengeLink;