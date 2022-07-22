import { Page } from "puppeteer";

interface result{
  name: string,
  description:string
}


/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @return {result} result type
 */
async function getResultDirectly(page:Page):Promise<result>{
  const data:result = {name:'',description:''}
  try {
    const commonName = await page.$eval('#firstHeading', (e: { textContent: any; }) => e.textContent);
    data.name = commonName?? ''
    if(!commonName){
      throw new Error(`no commonName`)
    }
  } catch(err){
    throw new Error(`getCommonName failed because ${err}`)
  }
  try {
    const description = await page.$$eval('.mw-parser-output > p',paragraphs=>{
      if(paragraphs.length>0){
        const paragraph = paragraphs[1].textContent
        return paragraph? paragraph.replace('\n',''):''
      }
    });
    console.log('description',description)
    data.description=description?? ''
    console.log('data.description',data.description)
    if(!description){
      throw new Error(`no description.`)
    }
  } catch (err) {
    throw new Error(`getDescription failed because ${err}`)
  }
  console.log('data',data)
  const result = data
  return result
}

export{
  getResultDirectly,
  result
}
