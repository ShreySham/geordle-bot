const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

/*
* Log in to Geoguessr and save the cookies when the home page is accessed
*/
async function loginSaveCookie(tab){
  try {
    await tab.get("https://www.geoguessr.com/signin");
    await tab.findElement(webdriver.By.name("email")).sendKeys(process.env.GEO_EMAIL);
    await tab.findElement(webdriver.By.name("password")).sendKeys(process.env.GEO_PASS);
    await tab.findElement(webdriver.By.className("button_button__CnARx button_variantPrimary__xc8Hp")).click();
    await tab.wait(webdriver.until.titleIs("GeoGuessr - Let's explore the world!"), 10000);
    let allCookies = await tab.manage().getCookies();
    for(const cookie of allCookies){
      fs.writeFileSync('./cookies.txt', JSON.stringify(cookie) + '\n', { flag: 'a+' }, err => {});
    }
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
  let browser = new webdriver.Builder().forBrowser('chrome');
  browser.setChromeOptions(new chrome.Options().addArguments('--headless=chrome').windowSize({width: 1920, height: 1080}));
  let tab = browser.build();
  try{
    await tab.get("https://www.geoguessr.com/");
    if (fs.existsSync('./cookies.txt')) {
      var fileBuffer = fs.readFileSync('./cookies.txt');
      var fileString = fileBuffer.toString();
      fileString = "[" + fileString.replace(/\n/g, ",");
      fileString = fileString.slice(0,-1) + "]";
      var allCookies = JSON.parse(fileString.toString());
      if (allCookies[0].expiry < Math.round(Date.now() / 1000)) {
        fs.unlinkSync('./cookies.txt');
        loginSaveCookie(tab);
      } 
    } else {
      await loginSaveCookie(tab);
    }
    await tab.manage().deleteAllCookies();
    await tab.get("https://www.geoguessr.com/");
    var fileBuffer = fs.readFileSync('./cookies.txt');
    var fileString = fileBuffer.toString();
    fileString = "[" + fileString.replace(/\n/g, ",");
    fileString = fileString.slice(0,-1) + "]";
    var allCookies = JSON.parse(fileString.toString());
    for(const cookie of allCookies){
      await tab.manage().addCookie(cookie);
    }
    await tab.get("https://www.geoguessr.com/");
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
  } finally {
    await tab.close();
  }
  console.log(challengeLink);
  return challengeLink;
}

module.exports.getChallengeLink = getChallengeLink;