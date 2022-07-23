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
const sciNames = JSON.parse(readFileSync('./sampleInput.json',{encoding:'utf8', flag:'r'}));
interface obj{
  SciName:string,
  hasSent:boolean
}
// send scientific name one by one to worker

app.get('/',(req:Request,res:Response)=>{
  const sentSciName=sciNames.find((sciName:obj)=>!sciName.hasSent);
  if(!sentSciName.SciName){
    return res.status(404).send('can not find sciName.')
  }else{
    sciNames[sciNames.indexOf(sentSciName)].hasSent = true
    console.log('sentSciName',sentSciName)
    return res.status(200).send(sentSciName)
  }
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
 