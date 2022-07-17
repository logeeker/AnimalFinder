const axios = require('axios');
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
const puppeteer = require('puppeteer');

let baseUrl = `http://localhost:${process.env.PORT}`

const getSciNameLength = async():Promise<Number>=>{
  let data=0
  try {
    const response = await axios.get(`${baseUrl}`)
    data = await response.data
  } catch (error) {
    console.error(`get sciNameLength failed because ${error}`)
  }
  return data
}
//similar to dynamic route implementation
const getSciName = async()=>{
  let sciNamesLength = await getSciNameLength();
  for(var i=0;i<sciNamesLength;i++){
    let url = `${baseUrl}/${i}`;
    let sciName = ''
    try {
      const response = await axios.get(`${baseUrl}/${i}`)
      sciName = await response.data.SciName
    } catch (error) {
      console.error(`get sciName failed because ${error}`)
    }
    scrapeRelatedDataBySciName(sciName)
  } 
}
getSciName()

/**
 * @description scrape commonName,first paragraph,status
 * @returns {Any {commonName:String,description:String,status:Number}}
 */
const scrapeRelatedDataBySciName = async(name:string)=>{
  //launch browser
  const browser = await puppeteer.launch();
  //open new tab
  const page = await browser.newPage();
  //go to the page
  await page.goto(`https://www.wikipedia.org/${name}`)
  let commonName = await page.evaluate(()=>document.querySelector('#firstHeading i'))
  console.log('commonName',commonName,'type',typeof commonName)
}


