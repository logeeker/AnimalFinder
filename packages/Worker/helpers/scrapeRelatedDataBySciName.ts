import { launch, Page } from "puppeteer";
import { getResultAfterSpellCorrection } from "./getResultAfterSpellCorrection";
import { getResultDirectly,result } from "./getResultDirectly";
import { getUrlFromFirstLink } from "./geturlFromFirstLink";

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
  try {
    const url = await page.url()
    let firstUrl:string=''
    if(!url.includes('search')){
      const result= await getResultDirectly(page)
      console.log('result',result)
      await page.close()
      await browser.close()
      return result
    }
    if(await hasSelector(page,'.mw-search-nonefound')){
      await page.close()
      await browser.close()
      throw new Error('can not found any article')
    }
    if(await hasSelector(page,'.searchdidyoumean')){
      console.log('getResultAfterSpellCorrection')
      await getResultAfterSpellCorrection(page)
      console.log('getResultFromFirstLink')
      console.log('getUrlFromFirstLink')
      try {
        firstUrl = await getUrlFromFirstLink(page)
      } catch (error) {
        throw new Error(`getUrlFromFirstLink failed because ${error}`)
      }
      const result = await scrapeArrticlePageWithUrl(page,firstUrl)
      await page.close()
      await browser.close()
      return result
    }
    try {
      firstUrl =await getUrlFromFirstLink(page); 
    } catch (error) {
      throw new Error(`getUrlFromFirstLink failed because ${error}`)
    }
    const result = await scrapeArrticlePageWithUrl(page,firstUrl)
    console.log('result',result)
    await page.close()
    await browser.close()
    return result
  } catch (error) {
    throw new Error(`scrapeRelatedDataBySciName failed because ${error}`)
  }
}

async function scrapeArrticlePageWithUrl(page:Page,articleUrl:string):Promise<result>{
    await page.goto(articleUrl,{waitUntil:'networkidle0'})
    const result=await getResultDirectly(page)
    console.log('getResultDirectly')
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
  scrapeRelatedDataBySciName,
  hasSelector
}