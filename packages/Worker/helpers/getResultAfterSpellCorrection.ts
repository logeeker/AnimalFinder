import { Page } from 'puppeteer';

/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @param {string} sciName
 */
async function getResultAfterSpellCorrection(page:Page,name:string) {
    console.log('click do you mean link')
  // await page.click('#mw-search-DYM-suggestion')
  console.log('nav to search do you mean result page')
  try {
   await Promise.all([
      page.waitForNavigation({waitUntil:"networkidle0"}),
      page.click('#mw-search-DYM-suggestion')
    ])
  } catch (error) {
    console.error(`getResultAfterSpellCorrection failed because ${error}`)
  }
}

export{
  getResultAfterSpellCorrection
}