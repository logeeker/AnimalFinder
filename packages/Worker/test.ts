import {scrapeRelatedDataBySciName} from './helpers/scrapeRelatedDataBySciName'

async function test() {
 return await scrapeRelatedDataBySciName('Fregata magnificans')
}

test()