import axios from "axios";
import { Page } from "puppeteer";
import {axiosErrorHandler} from '../index'

interface result{
  name: string;
}


/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @param {string} sciName
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
  // try {
  //   await axios.post(`http://localhost:${process.env.PORT}`,{
  //     animalData:animalData
  //   })
  // } catch (error:any) {
  //   axiosErrorHandler(error)
  // }
  // console.log('before page close')
  // await page.close()
  // console.log('page close')
  return result
}

export{
  getResultDirectly,
  result
}
