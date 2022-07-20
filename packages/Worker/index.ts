import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import axios, { Axios, AxiosError } from "axios"
import { resolve } from 'path';
import {Page,launch} from "puppeteer";

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

let isClose = true

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
const scrapeRelatedDataBySciName = async():Promise<boolean>=>{
  const sciName =await getSciName()
  console.log('sciName',sciName)
  const browser = await launch();
  // //open new tab
  const page = await browser.newPage();
  // //go to the page
  isClose = false
  await page.goto(`https://www.wikipedia.org`,{waitUntil: 'load', timeout: 0})
  // //type the search form
  await page.type("#searchInput",sciName)
  await page.click("#search-form fieldset button")
  await page.waitForNavigation({waitUntil: "domcontentloaded",timeout:0})
  const pageContent = await page.content();
  const url = await page.url()
  if(pageContent.includes('#mw-content-text > div.searchresults > p.mw-search-nonefound')){
    await resultNotFound()
  }else if(pageContent.includes('#mw-content-text > div.searchdidyoumean')){
    await getResultAfterSpellCorrection(page,sciName)
  }else if(url.includes('search')){
    await getResultFromFirstLink(page,sciName);
  }else{
    await getResultDirectly(page,sciName)
  }
  await page.close()
  isClose = true
  return isClose
}

/**
 * @descritpion get result directly from result page
 * @param {puppeteer.page} result page 
 * @param {string} sciName
 */
const getResultDirectly = async(page:Page,name:string):Promise<Animal>=>{

  const data = {status:'',name:'',description:''}
  try {
    const commonName = await page.$eval('#firstHeading > i', (e: { textContent: any; }) => e.textContent);
    const description = await page.$eval('#mw-content-text > div.mw-parser-output > p:nth-child(4)', (e: { textContent: any; }) => e.textContent);
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
  try {
    await axios.post(`http://localhost:${process.env.PORT}`,{
      animalData:animalData
    })
  } catch (error:any) {
    axiosErrorHandler(error)
  }
  await page.close()
  console.log('animalData',animalData)
  return animalData
  // await axios({
  //   method: 'post',
  //   url: `http://localhost:${process.env.PORT}`,
  //   headers: {}, 
  //   data:{animalData:animalData}
  // });
}

const getResultFromFirstLink = async(page:Page,name:string):Promise<Animal>=>{
  // await page.waitForSelector("#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a", {visible: true});
  // await page.waitForSelector('#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a')
  // await page.click('#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a'),
  // await page.waitForNavigation({waitUntil: "domcontentloaded"})
  // await getResultDirectly(page,name)
  let firstLink = await page.$("#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a");
  await firstLink.click();
  await page.waitForNavigation({waitUntil: "domcontentloaded"})
  let result = animalData
  try {
    result = await getResultDirectly(page,name);
    
  } catch (error) {
    console.error('getResultDirectly failed because',error)
  }
  return result;
}

const getResultAfterSpellCorrection = async(page:Page,name:string):Promise<Animal>=>{
  await page.click('#mw-search-DYM-suggestion')
  await page.waitForNavigation({waitUntil: "domcontentloaded"})
  let result = animalData
  try {
    result=await getResultFromFirstLink(page,name)
  } catch (error) {
    console.error('getResultDirectly failed because',error)
  }
  return result
}

/**
 * @description handle search result not found
 * @return {Animal} animalData
 */
const resultNotFound = async(page:Page,name:string):Promise<Animal>=>{
  animalData.result.status = 'error'
  animalData.SciName = name
  // await axios({
  //   method: 'post',
  //   url: `http://localhost:${process.env.PORT}`,
  //   headers: {}, 
  //   data:animalData
  // });
  try {
   await axios.post(`http://localhost:${process.env.PORT}`,{
    animalData:animalData
   })
  } catch (error:any) {
    axiosErrorHandler(error)
  }
  await page.close()
  return animalData
}

/**
 * @description central control of state
 */
 scrapeRelatedDataBySciName()

 /**
  * @description handle axios request error
  * @param {AxiosError} error 
  * @return {void} no return 
  */
function axiosErrorHandler(error:AxiosError){
  if(error.response){
    console.log(error.response.status)
  }else if(error.request){
    console.log(error.request)
  }else{
    console.log('Error',error.message)
  }
  console.log(error.config)
}
