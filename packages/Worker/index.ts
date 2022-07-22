import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import axios, {AxiosError } from "axios"

let sciName=''

// export interface Animal {
//   SciName: string;
//   result :result; 
// }

// export const animalData: Animal = {
//   SciName:'',
//   result: {
//     status:'',
//     name:'',
//     description:''
//   }
// }


/**
 * @description get sciName request
 * @returns {string} sciName
 */
 const getSciName = async():Promise<string>=>{
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
