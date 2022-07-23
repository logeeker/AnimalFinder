import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import axios, {AxiosError } from "axios"
import {scrapeRelatedDataBySciName} from './helpers/scrapeRelatedDataBySciName'

async function main() {
  let sciName = await getSciName();
  while(true){
    try {
      let scrapedData = await scrapeRelatedDataBySciName(sciName)
      if(scrapedData.name){
        const result = {SciName:sciName,result:{status:'ok',name:scrapedData.name,description:scrapedData.description}}
        try {
          axios.post(`http://localhost:${process.env.PORT}`,{
            animalData:result
          }) 
        } catch (error:any) {
          axiosErrorHandler(error)
        }
        return result
      }
      const result = {SciName:sciName,result:{status:'error'}}
      try {
        axios.post(`http://localhost:${process.env.PORT}`,{
          animalData:result
        }) 
      } catch (error:any) {
        axiosErrorHandler(error)
      }
      return result
    } catch (error) {
      console.error('get scraped data failed because',error)
    }
  } 
}

main()


/**
 * @description get sciName request
 * @returns {string} sciName
 */
async function getSciName():Promise<string>{
  let sciName:string=''
  try {
    const response = await axios.get(`http://localhost:${process.env.PORT}`)
    sciName = await response.data.SciName
  } catch (error) {
    console.error(`get sciName failed because ${error}`)
  }
  return sciName
}
 
 /**
  * @description handle axios request error
  * @param {AxiosError} error 
  * @return {void} no return 
  */
export function axiosErrorHandler(error:AxiosError){
  if(error.response){
    console.log(error.response.status)
  }else if(error.request){
    console.log(error.request)
  }else{
    console.log('Error',error.message)
  }
  console.log(error.config)
}
