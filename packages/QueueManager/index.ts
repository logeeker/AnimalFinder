const fs = require('fs');
import express,{ Request, Response } from 'express';
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });

const app = express();
const port = process.env.PORT;
const link = `http://localhost:${port}`
console.log('link',link)
let rtn=[];

type sciName = {SciName:String}
//get scientific name from input.json
const inputData = JSON.parse(fs.readFileSync('./input.json',{encoding:'utf8', flag:'r'}));
const inputDataLength = inputData.length
// send scientific name one by one to worker
app.get('/',(req:Request,res:Response)=>{
  return res.status(200).json(inputDataLength)
})

app.get('/:index',(req:Request,res:Response)=>{
  return res.status(200).json(inputData[req.params.index])
})



//get result from worker

app.listen(port, () => {
  console.log(`listening on ${link}`)
});


 