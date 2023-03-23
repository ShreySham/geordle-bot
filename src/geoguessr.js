import * as webdriver from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome.js";
/**
 * Sleep function to allow for pages to load
 * @returns A promise that resolves after the given ms.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Spin up WebDriver to access Goeguessr since they don't have any public APIs.
 * @returns The url of a Geoguessr challenge.
 */
export async function getChallengeLink(optionalMap) {
  let mapName = optionalMap || "A Diverse World";
  let challengeLink = "";
  let browser = new webdriver.Builder().forBrowser('chrome');
  browser.setChromeOptions(new chrome.Options().headless().windowSize({width: 1920, height: 1080}));
  let tab = browser.build();
  try{
    await tab.get("https://www.geoguessr.com/signin");
    console.log("gotLogin");
    await tab.findElement(webdriver.By.name("email")).sendKeys(process.env.GEO_EMAIL);
    await tab.findElement(webdriver.By.name("password")).sendKeys(process.env.GEO_PASS);
    await tab.findElement(webdriver.By.className("button_button__CnARx button_variantPrimary__xc8Hp")).click();
    await tab.wait(webdriver.until.titleIs("GeoGuessr - Let's explore the world!"), 10000);
    console.log("gotHome");
    await tab.wait(await webdriver.until.elementLocated(await webdriver.By.className("quick-search_searchInputButton__kK9Hz")), 2000).click();
    //await tab.findElement(webdriver.By.className("quick-search_searchInputButton__kK9Hz")).click();
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
  }finally{
    await tab.close();
  }
  console.log(challengeLink);
  return challengeLink;
}
