import axios from "axios";
import { Page } from "puppeteer";
import {axiosErrorHandler} from '../index'

/**
 * @description handle search result not found
 * 
 */
async function resultNotFound(){
  console.log('before page close')
  console.log('page close')
  return;
}

export{
  resultNotFound
}