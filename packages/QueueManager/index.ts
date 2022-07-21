import { resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, "../../.env") });
import {readFileSync} from 'fs'
import express,{ Request, Response } from 'express';

const app = express();
app.use(express.json())
const port = process.env.PORT;
const link = `http://localhost:${port}`
console.log('link',link)
interface result {
  status: string;
  name: string;
  description:string
}

interface Animal {
  SciName: string;
  result :result; 
}

const rtn:Array<Animal>=[]


//get scientific name from input.json
const inputData = JSON.parse(readFileSync('./input.json',{encoding:'utf8', flag:'r'}));
interface obj{
  SciName:string,
  hasSent:boolean
}
// send scientific name one by one to worker

app.get('/',(req:Request,res:Response)=>{
  const sentInput=inputData.find((el:obj)=>!el.hasSent);
  inputData[inputData.indexOf(sentInput)].hasSent = true
  console.log('sentInput',sentInput)
  res.status(200).send(sentInput)
})

//get result from worker
app.post('/',(req:Request,res:Response)=>{
  console.log(req.body);
  const data = req.body.animalData;
  if(Object.values(data).length>0){
    rtn.push(data)
  }
  console.log('rtn',rtn)
  res.status(200).send(data)
})

app.listen(port, () => {
  console.log(`listening on ${link}`)
});

console.log('rtn',rtn)
 