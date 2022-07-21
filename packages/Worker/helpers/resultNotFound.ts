import axios from "axios";
import { Page } from "puppeteer";
import {Animal,animalData,axiosErrorHandler} from '../index'

/**
 * @description handle search result not found
 * @return {Animal} animalData
 */
async function resultNotFound(page:Page,name:string):Promise<Animal>{
  animalData.result.status = 'error'
  animalData.SciName = name
  try {
   await axios.post(`http://localhost:${process.env.PORT}`,{
    animalData:animalData
   })
  } catch (error:any) {
    axiosErrorHandler(error)
  }
  console.log('before page close')
  await page.close()
  console.log('page close')
  return animalData
}

export{
  resultNotFound
}