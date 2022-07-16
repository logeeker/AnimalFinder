const fs = require('fs');
import express,{ Request, Response } from 'express';

const app = express();
const port = 5555;
const link = `http://localhost:${port}`
let rtn=[];

type sciName = {SciName:String}
//get scientific name from input.json
const inputData = JSON.parse(fs.readFileSync('./input.json',{encoding:'utf8', flag:'r'}));

//send scientific name one by one to worker

app.post(`/sciname`,(req, res,next)=>{
  inputData.map(function(i:sciName){
  })
})

//get result from worker

app.listen(port, () => {
  console.log(`listening on ${link}`)
});


 