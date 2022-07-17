const axios = require('axios');
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import * as puppeteer from "puppeteer";

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
    // scrapeRelatedDataBySciName(sciName)
  } 
}
getSciName()

/**
 * @description scrape commonName,first paragraph,status
 * @returns {Any {commonName:String,description:String,status:Number}}
 */
const scrapeRelatedDataBySciName = async()=>{
  let sciName = "Chlamydosaurus kingii"
  interface result {
    status: String;
    name: String;
    description:String
  }

  interface Animal {
    SciName: string;
    reuslt :result; 
  }

  let animalData: Animal = {
    SciName:sciName ,
    reuslt: {
      status:'',
      name:'',
      description:''
    }
  }
  //launch browser
  const browser = await puppeteer.launch();
  //open new tab
  const page = await browser.newPage();
  //go to the page
  await page.goto(`https://www.wikipedia.org`)
  //type the search form
  await page.type("#searchInput",'Chlamydosaurus kingii')
  await page.click("#search-form fieldset button")
  await page.waitForNavigation()
  //go to result page directly
  try {
    const commonName = await page.$eval('#firstHeading > i', e => e.textContent);
    let description = await page.$eval('#mw-content-text > div.mw-parser-output > p:nth-child(4)', e => e.textContent);
    animalData.reuslt.name = commonName? commonName:''
    animalData.reuslt.description = description? description:''
  } catch(err){
    console.log(err)
  }
  if(animalData.reuslt.description&& animalData.reuslt.name){
    animalData.reuslt.status='ok'
  }
  console.log('animalData',animalData)
  await browser.close()
}
scrapeRelatedDataBySciName()



