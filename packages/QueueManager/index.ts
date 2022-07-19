const fs = require('fs');
import express,{ Request, Response } from 'express';
import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });

const app = express();
app.use(express.json())
const port = process.env.PORT;
const link = `http://localhost:${port}`
console.log('link',link)
interface result {
  status: String;
  name: String;
  description:String
}

interface Animal {
  SciName: string;
  result :result; 
}

let rtn:Array<Animal>=[]


//get scientific name from input.json
const inputData = JSON.parse(fs.readFileSync('./input.json',{encoding:'utf8', flag:'r'}));
const inputDataLength = inputData.length
interface obj{
  SciName:string,
  hasSent:Boolean
}
// send scientific name one by one to worker

app.get('/',(req:Request,res:Response)=>{
  let sentInput=inputData.find((el:obj)=>!el.hasSent);
  inputData[inputData.indexOf(sentInput)].hasSent = true
  console.log('sentInput',sentInput)
  res.status(200).send(sentInput)
})

//get result from worker
app.post('/',(req:Request,res:Response)=>{
  console.log(req.body);
  let data = req.body.animalData;
  if(Object.values(data).length>0){
    rtn.push(data)
  }
  console.log('rtn',rtn)
})

app.listen(port, () => {
  console.log(`listening on ${link}`)
});

console.log('rtn',rtn)
 