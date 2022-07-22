import { Page } from "puppeteer";

interface result{
  name: string;
}


/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @return {result} result type
 */
async function getResultDirectly(page:Page):Promise<result>{
  let data:result = {name:''}
  try {
    const commonName = await page.$eval('#firstHeading', (e: { textContent: any; }) => e.textContent);
    // const description = await page.$eval('#mw-content-text > div.mw-parser-output > p:nth-child(4)', (e: { textContent: any; }) => e.textContent);
    data.name = commonName?? ''
    if(!commonName){
      throw new Error(`no commonName`)
    }
    // data.description = description? description:''
  } catch(err){
    throw new Error(`getCommonName failed because ${err}`)
  }
  const result = data
  return result
}

export{
  getResultDirectly,
  result
}
