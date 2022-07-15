const express = require('express')
const fs = require('fs');
const worker = new Worker('../Worker/index.ts')

const app = express()
export const port = 5555;
const link = `https://localhost:${port}`
let rtn=[];
//get scientific name from input.json
type sciName = {SciName:String}

app.listen(port, () => {
  console.log(`listening on ${link}`)
});

const inputData = JSON.parse(fs.readFileSync('./input.json',{encoding:'utf8', flag:'r'}));
const data=inputData.map(function(i:sciName){
  console.log('sciNameObject',i)
  //send scientific name one by one to worker
  worker.postMessage(i)
})
//get result from worker
// worker.onmessage = function(e){
//   console.log('result',e.data)
//   console.log('result received from worker');
//   if(e.data){
//     app.get(link,(req,res)=>{
//       let animalCommonName = req.
//     })
//   }
// }
