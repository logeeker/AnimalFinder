import { launch, Page } from "puppeteer";
import { getResultAfterSpellCorrection } from "./getResultAfterSpellCorrection";
import { getResultDirectly,result } from "./getResultDirectly";
import { getUrlFromFirstLink } from "./geturlFromFirstLink";
import {hasSelector} from '../index'

/**
 * @description scrape animalData by sciName
 * @param {string} name
 * @return {result} result{name:string,description:string}
 */
async function scrapeRelatedDataBySciName(name:string):Promise<result>{
  const browser = await launch({headless:false});
  // //open new tab
  const page = await browser.newPage();
  await page.goto(`https://www.wikipedia.org`,{waitUntil: "networkidle0"})
  await page.type("#searchInput",name)
  try {
    await Promise.all([
      page.click("#search-form fieldset button"),
      page.waitForNavigation({waitUntil:"networkidle0"})
    ])
  } catch (error) {
    console.error('search reuslt failed because',error)
  }
  const url = await page.url()
  if(!url.includes('search')){
    const result= await getResultDirectly(page)
    console.log('result',result)
    return result
  }
  if(await hasSelector(page,'.mw-search-nonefound')){
    throw new Error('can not found any article')
  }
  if(await hasSelector(page,'.searchdidyoumean')){
    console.log('getResultAfterSpellCorrection')
    await getResultAfterSpellCorrection(page)
    console.log('getResultFromFirstLink')
    console.log('getUrlFromFirstLink')
    const url=await getUrlFromFirstLink(page)
    const result = await scrapeArrticlePageWithUrl(page,url)
    return result
  }
  await getUrlFromFirstLink(page);
  const result=await getResultDirectly(page)
  console.log('result',result)
  return result
}

async function scrapeArrticlePageWithUrl(page:Page,articleUrl:string):Promise<result>{
  await page.goto(articleUrl,{waitUntil:'networkidle0'})
  console.log('getResultDirectly')
  const result=await getResultDirectly(page)
  console.log('result',result)
  return result
}

async function hasSelector(page:Page,selector:string) {
  try {
    await page.waitForSelector(selector,{timeout:500})
    return true
  } catch (error) {
    return false
  }
}

export{
  scrapeRelatedDataBySciName
}