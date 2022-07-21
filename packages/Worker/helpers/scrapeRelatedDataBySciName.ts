import { launch } from "puppeteer";
import { getResultAfterSpellCorrection } from "./getResultAfterSpellCorrection";
import { getResultDirectly } from "./getResultDirectly";
import { getResultFromFirstLink } from "./getResultFromFirstLink";
import { resultNotFound } from "./resultNotFound";
import {hasSelector} from '../index'

/**
 * @description scrape animalData by sciName
 * @param {string} name
 */
async function scrapeRelatedDataBySciName(name:string){
  const browser = await launch({headless:false});
  // //open new tab
  const page = await browser.newPage();
  // //go to the page
  await page.goto(`https://www.wikipedia.org`,{waitUntil:"networkidle0"})
  // //type the search form
  await page.type("#searchInput",name)
  await page.click("#search-form fieldset button")
  await page.waitForNavigation({waitUntil: "load",timeout:0})
  const url = await page.url()
  if(!url.includes('search')){
    return await getResultDirectly(page,name)
  }
  if(await hasSelector(page,'.mw-search-nonefound')){
    return await resultNotFound(page,name)
  }
  if(await hasSelector(page,'.searchdidyoumean')){
    return await getResultAfterSpellCorrection(page,name)
  }
  return await getResultFromFirstLink(page,name);
}

export{
  scrapeRelatedDataBySciName
}