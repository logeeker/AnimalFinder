import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import axios, {AxiosError } from "axios"
import {Page,launch,ElementHandle} from "puppeteer";

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
const scrapeRelatedDataBySciName = async()=>{
  const sciName =await getSciName()
  console.log('sciName',sciName)
  const browser = await launch({headless:false});
  // //open new tab
  const page = await browser.newPage();
  // //go to the page
  isClose = false
  await page.goto(`https://www.wikipedia.org`,{waitUntil: 'load', timeout: 0})
  // //type the search form
  await page.type("#searchInput",sciName)
  await page.click("#search-form fieldset button")
  await page.waitForNavigation({waitUntil: "load",timeout:0})
  const url = await page.url()
  let result:Animal
  if(!url.includes('search')){
    return await getResultDirectly(page,sciName)
  }
  if(await hasSelector(page,'.mw-search-nonefound')){
    return await resultNotFound(page,sciName)
  }
  if(await hasSelector(page,'.searchdidyoumean')){
    return await getResultAfterSpellCorrection(page,sciName)
  }
  return await getResultFromFirstLink(page,sciName);
}

const hasSelector =async(page:Page,selector:string)=>{
  try {
    await page.waitForSelector(selector,{timeout:5000})
    return true
  } catch (error) {
    // console.error('waitForSelectorFailed because',error)
    return false
  }
}

/**
 * @descritpion get result directly from result page
 * @param {Page} result page 
 * @param {string} sciName
 * @returns {Animal} animalData
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
  // console.log('before page close')
  // await page.close()
  // console.log('page close')
  console.log('animalData',animalData)
  return animalData
  // await axios({
  //   method: 'post',
  //   url: `http://localhost:${process.env.PORT}`,
  //   headers: {}, 
  //   data:{animalData:animalData}
  // });
}

async function getResultFromFirstLink(page:Page,name:string){
  try {
    await page.waitForSelector('div.mw-search-result-heading > a')
  } catch (error) {
    console.error('waitForSelector failed because',error)
  }
  // try {
  //   await Promise.all([
  //     page.waitForSelector(".mw-search-result-heading > a")
  //     // page.click("#mw-content-text > div.searchresults.mw-searchresults-has-iw > ul > li:nth-child(1) > div.mw-search-result-heading > a"),
  //     // page.click("div.mw-search-result-heading > a:nth-child(1)"),
  //     // page.waitForNavigation({waitUntil: "load"})
  //   ])
  // } catch (error) {
  //   console.error(`navigate to first link page failed because ${error}`)
  // }
  // return await getResultDirectly(page,name)
}

const getResultAfterSpellCorrection = async(page:Page,name:string)=>{
  console.log('click do you mean link')
  // await page.click('#mw-search-DYM-suggestion')
  console.log('nav to search do you mean result page')
  try {
   await Promise.all([
      page.click('#mw-search-DYM-suggestion'),
      page.waitForNavigation({waitUntil: "load"})
    ])
  } catch (error) {
    console.error(`getResultAfterSpellCorrection failed because ${error}`)
  }
  return await getResultFromFirstLink(page,name)
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
  console.log('before page close')
  await page.close()
  console.log('page close')
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
