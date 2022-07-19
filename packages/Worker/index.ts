import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import axios, { AxiosError } from 'axios'
import { resolve } from 'path';
import {launch, Page} from "puppeteer";

let sciName=''
interface result {
  status: string;
  name: string;
  description:string
}

interface Animal {
  SciName: string;
  result :result; 
}

const animalData: Animal = {
  SciName:'',
  result: {
    status:'',
    name:'',
    description:''
  }
}

// let isClose = true

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
 * @description scrape animalData by sciName
 * @returns {void} no return
 */
const scrapeRelatedDataBySciName = async():Promise<Animal>=>{
  const sciName =await getSciName()
  console.log('sciName',sciName)
  const browser = await launch({
    headless:false
  });
  // //open new tab
  const page = await browser.newPage();
  // //go to the page
  isClose = false
  await page.goto(`https://www.wikipedia.org`,{waitUntil: 'load', timeout: 0})
  // //type the search form
  await page.type("#searchInput",sciName)
  await page.click("#search-form fieldset button")
  await page.waitForNavigation({waitUntil: "domcontentloaded",timeout:0})
  const url = await page.url()
  if(await hasSelector(page,'#mw-content-text > div.searchresults > p.mw-search-nonefound')){
    return await resultNotFound(page)
  }
  if(await hasSelector(page,'#mw-content-text > div.searchdidyoumean')){
    return await getResultAfterSpellCorrection(page,sciName)
  }
  if(url.includes('search')){
    return await getResultFromFirstLink(page,sciName);
  }else{
    return await getResultDirectly(page,sciName)
  }
}

async function hasSelector(page:Page,selector:string) {
  try {
    await page.waitForSelector(selector,{timeout:500})
    true
  } catch (error) {
    return false
  }
}

/**
 * @descritpion get result directly from result page
 * @param {puppeteer.page} result page 
 * @param {string} sciName
 */
const getResultDirectly = async(page: Page,name:string):Promise<Animal>=>{

  const data = {status:'',name:'',description:''}
  try {
    const commonName = await page.$eval('#firstHeading > i', e => e.textContent);
    const description = await page.$eval('#mw-content-text > div.mw-parser-output > p:nth-child(4)', e => e.textContent);
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
  console.log('posting data')
  try {
    await axios.post(`http://localhost:${process.env.PORT}`,{
      data:{animalData:animalData}
    })
  } catch (error) {
    console.error('axios post failed because',error)
  }
  try {
    await axios.post(`http://localhost:${process.env.PORT}`,{
      animalData:animalData
    })
  } catch (error) {
    handleAxiosError(error)
  }
  // await axios({
  //   method: 'post',
  //   url: `http://localhost:${process.env.PORT}`,
  //   headers: {}, 
  //   data:{animalData:animalData}
  // });
  console.log('closing page')
  await page.close()
  console.log('page closed')
  return animalData
}

const getResultFromFirstLink = async(page:Page,name:string):Promise<Animal>=>{
  await page.waitForSelector('#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a',{timeout:5000})
  await page.click('#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a'),
  await page.waitForNavigation({waitUntil: "domcontentloaded"})
  const result=await getResultDirectly(page,name)
  return result
}

const getResultAfterSpellCorrection = async(page:Page,name:string):Promise<Animal>=>{
  await page.click('#mw-search-DYM-suggestion')
  await page.waitForNavigation({waitUntil: "domcontentloaded"})
  const result=await getResultFromFirstLink(page,name)
  return result
}

const resultNotFound = async():Promise<Animal>=>{
  animalData.result.status = 'error'
  await axios({
    method: 'post',
    url: `${`http://localhost:${process.env.PORT}`}`,
    headers: {}, 
    data:animalData
  });
  return animalData
}

/**
 * @description central control of state
 */
 scrapeRelatedDataBySciName()


function handleAxiosError(err:AxiosError){
  if(err.response){
    console.log(err.response.status);
  }else if(err.request){
    console.log(err.request);
  }else{
    console.log('Error', err.message);
  }
  console.log(err.config)
}