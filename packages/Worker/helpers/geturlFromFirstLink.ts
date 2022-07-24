import { Page } from 'puppeteer';
import {hasSelector} from './scrapeRelatedDataBySciName'
/**
 * @descritpion get the url for the first link on the search result page
 * @param {Page} puppeteer page
 * @return {string} firstLinkUrl
 */
async function getUrlFromFirstLink(page:Page):Promise<string>{
  console.log('getResultFromFirstLink start')
  if(await hasSelector(page,'.mw-search-nonefound')){
    throw new Error('can not find any article.')
  }
  try {
    await page.waitForSelector('.mw-search-result-heading > a')
  } catch (error) {
    throw new Error(`waitForSelector failed because ${error}`)
  }
  console.log('found selector')
  
  const links = await page.$$('.mw-search-result-heading > a')
  if(links.length>0){
    const firstLink = links[0];
    const firstLinkUrl = await firstLink.getProperty('href')
    return firstLinkUrl.toString().replace('JSHandle:','')
  }else{
    throw new Error('can not navigate to reuslt page.')
  }
}

export {
  getUrlFromFirstLink
}