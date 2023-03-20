import { Builder } from "selenium-webdriver";
/**
 * Spin up WebDriver to access Goeguessr since they don't have any public APIs.
 * @returns The url of a Geoguessr challenge.
 */
export async function getChallengeLink() {
  const webdriver = require("selenium-webdriver");
  let browser = new webdriver.Builder();
  let tab = browser.forBrowser("chrome").build();
  let page = tab.get("https://www.geoguessr.com/signin");
  page.then(function () {
    let findTimeOutP =
            tab.manage().setTimeouts({
                implicit: 1000, // 1 second
            });
            console.log("got login page");
    return findTimeOutP
  }).then(function () {
    let challengeTab = tab.findElement(webdriver.By.className("text-input_textInput__HPC_k")); 
  }).catch(error => alert(error.message));
  return "";
  // const data = await response.json();
  // const posts = data.data.children
  //   .map((post) => {
  //     if (post.is_gallery) {
  //       return "";
  //     }
  //     return (
  //       post.data?.media?.reddit_video?.fallback_url ||
  //       post.data?.secure_media?.reddit_video?.fallback_url ||
  //       post.data?.url
  //     );
  //   })
  //   .filter((post) => !!post);
  // const randomIndex = Math.floor(Math.random() * posts.length);
  // const randomPost = posts[randomIndex];
  // return randomPost;
}
