import axios from "axios";
import { Page } from "puppeteer";
import {Animal,animalData,axiosErrorHandler} from '../index'

/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @param {string} sciName
 * @returns {Animal} animalData
 */
async function getResultDirectly(page:Page):Promise<Animal>{
  const data = {status:'',name:'',description:''}
  try {
    const commonName = await page.$eval('#firstHeading', (e: { textContent: any; }) => e.textContent);
    // const description = await page.$eval('#mw-content-text > div.mw-parser-output > p:nth-child(4)', (e: { textContent: any; }) => e.textContent);
    data.name = commonName? commonName:''
    // data.description = description? description:''
  } catch(err){
    console.log("getCommonName failed because",err)
  }
  if(data.name && data.description){
    data.status= 'ok'
  }
  animalData.result = data
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
  console.log('animalData',animalData)
  return animalData
}

export{
  getResultDirectly
}
