import { Page } from 'puppeteer';
import {getResultDirectly} from './getResultDirectly'

/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @param {string} sciName
 */
async function getUrlFromFirstLink(page:Page):Promise<string>{
    console.log('getResultFromFirstLink start')
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
    //   await Promise.all([
    //     page.waitForNavigation({waitUntil:"networkidle0"}),
    //     links[0].click()
    //   ])
    }else{
        throw new Error('can not navigate to reuslt page.')
    }
}

export {
    getUrlFromFirstLink
}