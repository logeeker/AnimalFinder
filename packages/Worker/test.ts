import {scrapeRelatedDataBySciName} from './helpers/scrapeRelatedDataBySciName'

/**
 * @description test workflow of scraping data 
 * @returns 
 */
async function test() {
 return await scrapeRelatedDataBySciName('Choriotis kori')
}

test()