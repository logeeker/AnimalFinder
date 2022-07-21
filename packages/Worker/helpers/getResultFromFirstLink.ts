import { Page } from 'puppeteer';
import {getResultDirectly} from './getResultDirectly'

/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @param {string} sciName
 */
async function getResultFromFirstLink(page:Page,name:string){
    try {
        await page.waitForSelector('.mw-search-result-heading > a')
    } catch (error) {
        console.error('waitForSelector failed because',error)
    }

    try {
        const links = await page.$$('.mw-search-result-heading > a')
        if(links.length>0){
          await Promise.all([
            await page.waitForNavigation({waitUntil:"networkidle0"}),
            await links[0].click()
          ])
        }
    } catch (error) {
        console.error('navigate to first link page failed because',error)
    }
    return await getResultDirectly(page,name)
}

export {
    getResultFromFirstLink
}