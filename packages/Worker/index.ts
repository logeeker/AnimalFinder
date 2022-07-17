const axios = require('axios');
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });

const getSciName = async()=>{
  let res;
  try {
    res=await axios.get(`http://localhost:${process.env.PORT}`)
  } catch (error) {
    throw new Error(`get sciName failed because ${error}`)
  }
  if(res){
    return res.data
  }else{
    return null
  }
}

const scrapeRelatedDataBySciName = async()=>{
  let sciName = await getSciName();
  console.log('sciName',sciName)
}
scrapeRelatedDataBySciName()


