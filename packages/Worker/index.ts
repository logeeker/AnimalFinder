const axios = require('axios');
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
const puppeteer = require('puppeteer');

let baseUrl = `http://localhost:${process.env.PORT}`
let commonName=''

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
  // commonName = await page.$eval("firstHeading i",el=>el.innerText as string)
  try {
    const elemText = await page.$eval("#firstHeading > i", elem => elem.innerText)
    console.log('element innerText:', elemText)
  } catch(err){
    console.log(err)
  }
  await browser.close()
}
scrapeRelatedDataBySciName()
console.log('commonName',commonName,'type',typeof commonName)



