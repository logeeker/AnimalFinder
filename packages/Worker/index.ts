const axios = require('axios');
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import * as puppeteer from "puppeteer";

let baseUrl = `http://localhost:${process.env.PORT}`
let sciName:string=''
interface result {
  status: String;
  name: String;
  description:String
}

interface Animal {
  SciName: string;
  result :result; 
}

let animalData: Animal = {
  SciName:'',
  result: {
    status:'',
    name:'',
    description:''
  }
}

let state=0

//get sciName
const getSciName = async():Promise<string>=>{
  try {
    const response = await axios.get(`${baseUrl}`)
    sciName = await response.data.SciName
  } catch (error) {
    console.error(`get sciName failed because ${error}`)
  }
  return sciName
}


const scrapeRelatedDataBySciName = async()=>{
  let sciName =await getSciName()
  console.log('sciName',sciName)
  const browser = await puppeteer.launch();
  // //open new tab
  const page = await browser.newPage();
  // //go to the page
  await page.goto(`https://www.wikipedia.org`)
  // //type the search form
  await page.type("#searchInput",sciName)
  await page.click("#search-form fieldset button")
  await page.waitForNavigation()
  const pageContent = await page.content();
  const url = await page.url()
  if(pageContent.includes('#mw-content-text > div.searchresults > p.mw-search-nonefound')){
    await resultNotFound(page)
  }else if(pageContent.includes('#mw-content-text > div.searchdidyoumean')){
    await getResultAfterSpellCorrection(page)
    await getResultFromFirstLink(page);
   return  await getResultDirectly(page,sciName)
  }else if(url.includes('search')){
    await getResultFromFirstLink(page);
    await getResultDirectly(page,sciName)
  }else{
    return await getResultDirectly(page,sciName)
  }
}
scrapeRelatedDataBySciName()

const getResultDirectly = async(page:puppeteer.Page,name:string)=>{

  const data = {status:'',name:'',description:''}
  try {
    let commonName = await page.$eval('#firstHeading > i', e => e.textContent);
    let description = await page.$eval('#mw-content-text > div.mw-parser-output > p:nth-child(4)', e => e.textContent);
    data.name = commonName? commonName:''
    data.description = description? description:''
  } catch(err){
    console.log(err)
  }
  if(data.name && data.description){
    data.status= 'ok'
  }
  animalData.SciName = name;
  animalData.result = data
  await axios({
    method: 'post',
    url: baseUrl,
    headers: {}, 
    data:{animalData:animalData}
  });
  await page.close()
  await scrapeRelatedDataBySciName()
}

const getResultFromFirstLink = async(page:puppeteer.Page)=>{
  await page.click("#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading")
  await page.waitForNavigation()
}

const getResultAfterSpellCorrection = async(page:puppeteer.Page)=>{
  await page.click('#mw-search-DYM-suggestion')
    await page.waitForNavigation()
}

const resultNotFound = async(page:puppeteer.Page)=>{
  animalData.result.status = 'error'
  await axios({
    method: 'post',
    url: `${baseUrl}`,
    headers: {}, 
    data:animalData
  });
}

