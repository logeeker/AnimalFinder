import { Page } from "puppeteer";
import { clickDoYouMean } from "./clickDoYouMean";
import { getResultDirectlyFromResultPage,result } from "./getResultDirectlyFromResultPage";
import { getUrlFromFirstLink } from "./geturlFromFirstLink";

/**
 * @description scrape animalData by sciName
 * @param {string} name
 * @return {result} result{name:string,description:string}
 */
async function scrapeRelatedDataBySciName(name:string,page:Page):Promise<result>{
  
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
    let firstUrl=''
    if(!url.includes('search')){
      const result= await getResultDirectlyFromResultPage(page)
      console.log('result',result)
      return result
    }
    if(await hasSelector(page,'.mw-search-nonefound')){
      throw new Error('can not found any article')
    }
    if(await hasSelector(page,'.searchdidyoumean')){
      console.log('clickDoYouMean')
      await clickDoYouMean(page)
    }
    try {
      firstUrl =await getUrlFromFirstLink(page); 
    } catch (error) {
      throw new Error(`getUrlFromFirstLink failed because ${error}`)
    }
    const result = await scrapeArrticlePageWithUrl(page,firstUrl)
    console.log('result',result)
    return result
  } catch (error) {
    throw new Error(`scrapeRelatedDataBySciName failed because ${error}`)
  }
}

/**
 * @description scrape the Article page after going to the article url
 * @param {Page} puppeteer
 * @param {string} articleUrl 
 * @returns {result} result:{name:string,description:string}
 */
async function scrapeArrticlePageWithUrl(page:Page,articleUrl:string):Promise<result>{
    await page.goto(articleUrl,{waitUntil:'networkidle0'})
    const result=await getResultDirectlyFromResultPage(page)
    console.log('getResultDirectlyFromResultPage')
    return result  
}

/**
 * @description check if the selector is existed or not
 * @param {Page} page 
 * @param {string} selector 
 * @returns {Boolean} 
 */
async function hasSelector(page:Page,selector:string):Promise<boolean>{
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