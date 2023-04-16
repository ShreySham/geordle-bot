const puppeteer = require('puppeteer');
const fs = require('fs');

/*
* Log in to Geoguessr and save the cookies when the home page is accessed
*/
async function loginSaveCookie(tab){
  try {
    await tab.goto('https://www.geoguessr.com/signin');
    await tab.type('[name="email"]', process.env.GEO_EMAIL);
    await tab.type('[name="password"]', process.env.GEO_PASS);
    const navigationPromise = tab.waitForNavigation();
    await tab.click('[data-qa="login-cta-button"]');
    await navigationPromise;
    const cookie = await tab.cookies();
    fs.writeFileSync('./cookies.json', JSON.stringify(cookie), { flag: 'a+' }, err => {console.error(err)});
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

  try{
    const browser = await puppeteer.launch({
      args: [`--window-size=1920,1080`]
    });
    const tab = await browser.newPage();
    if (fs.existsSync('./cookies.json')) {
      const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf8'));
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
    await tab.setCookie(...allCookies);
    await Promise.all([
      tab.waitForNavigation({timeout: 7000}),
      tab.goto("https://www.geoguessr.com/"),
    ])
    console.log("gotHome");
    await Promise.all([
      tab.waitForSelector('.quick-search_searchInput__i7C6O',{timeout: 7000}),
      tab.click(".quick-search_searchInputButton__kK9Hz"),
    ])
    await tab.type(".quick-search_searchInput__i7C6O", mapName);
    await tab.waitForSelector('.quick-search_resultList__cLjml',{timeout: 7000});
    
    await Promise.all([
      tab.waitForNavigation({timeout: 7000}),
      tab.click('li[class="search-result_wrapper__jwHxo search-result_isFocused__ZAXVX"]'),
    ]);

    await Promise.all([
      tab.waitForNavigation({timeout: 7000}),
      tab.goto(tab.url()+'/play'),
    ]);

    await tab.evaluate(() => {
      document.querySelector("#__next > div.background_wrapper__OlrxG.background_backgroundClassic__ySr_Z > div.version4_layout__KcIcs > div.version4_content__oaYfe > main > div > div > div > div > div.section_sectionMedium__yXgE6 > div > div > div:nth-child(2) > input").click();
    });

    await tab.evaluate(() => {
      document.querySelector("#__next > div.background_wrapper__OlrxG.background_backgroundClassic__ySr_Z > div.version4_layout__KcIcs > div.version4_content__oaYfe > main > div > div > div > div > div.section_sectionMedium__yXgE6 > div > div.game-options_optionGroup__qNKx1 > div > div.game-options_wrappingGroup__u3pGi > label:nth-child(1) > div.game-options_optionInput__TAqdI > input").click();
    });

    const sliderSelector = ".styles_handle__zYRZ7"
    const sliderElement = await tab.$(sliderSelector);
    var slider = await tab.waitForSelector(sliderSelector);
    await tab.evaluate((item) => item.scrollIntoView(), slider);
    const pos = await sliderElement.boundingBox();

    await tab.mouse.move(pos.x + pos.width / 2, pos.y + pos.height / 2);
    await tab.mouse.down();
    await tab.mouse.move(pos.x + 2.0 , pos.y + pos.height / 2);
    await tab.mouse.up();
    await tab.mouse.down();
    await tab.mouse.up();


    await tab.evaluate(() => {
      document.querySelector("#__next > div.background_wrapper__OlrxG.background_backgroundClassic__ySr_Z > div.version4_layout__KcIcs > div.version4_content__oaYfe > main > div > div > div > div > div:nth-child(2) > div:nth-child(2) > label > input[type=radio]").click();
    });

    await Promise.all([
      tab.waitForSelector("#__next > div.background_wrapper__OlrxG.background_backgroundClassic__ySr_Z > div.version4_layout__KcIcs > div.version4_content__oaYfe > main > div > div > div > div > section > article > div > span > input",{timeout: 7000}),
      tab.evaluate(() => {
        document.querySelector("#__next > div.background_wrapper__OlrxG.background_backgroundClassic__ySr_Z > div.version4_layout__KcIcs > div.version4_content__oaYfe > main > div > div > div > div > div.start-challenge-game_body__sWqnL > button > div").click();
      }),
    ]);

    const linkBox = await tab.waitForSelector("#__next > div.background_wrapper__OlrxG.background_backgroundClassic__ySr_Z > div.version4_layout__KcIcs > div.version4_content__oaYfe > main > div > div > div > div > section > article > div > span > input");
    challengeLink = await tab.evaluate(x => x.value, linkBox);
  } catch(error) {
    console.error("Error navigating GeoGuessr: ");
    throw error;
  }
  console.log(challengeLink);
  return challengeLink;
}

module.exports.getChallengeLink = getChallengeLink;