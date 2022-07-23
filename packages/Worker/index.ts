import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import axios, {AxiosError } from "axios"
import {scrapeRelatedDataBySciName} from './helpers/scrapeRelatedDataBySciName'

interface animalData{
  SciName:string,
  result:{
    status:string,
    name:string,
    description:string
  }
}

async function main() {
  while(true){
    try {
      let sciName:string=''
      try {
        sciName = await getSciName();
      } catch (error) {
        console.error('getSciName failed because',error)
      }
      console.log('sciName',sciName)
      const rtn = {SciName:sciName,result:{status:'',name:'',description:''}}
      try {
        let scrapedData = await scrapeRelatedDataBySciName(sciName)
        if(scrapedData.name){
          rtn.result.status = 'ok'
          rtn.result.name = scrapedData.name
          rtn.result.description = scrapedData.description
        }else{
          rtn.result.status = 'error'
        }
      } catch (error) {
        console.error('scrapeRelatedDataBySciName failed because',error)
        rtn.result.status = 'error'
      }
      try {
        await axios.post(`http://localhost:${process.env.PORT}`,{
          animalData:rtn
        }) 
      } catch (error:any) {
        axiosErrorHandler(error)
      } 
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
