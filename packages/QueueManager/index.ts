const express = require('express')
const fs = require('fs');

const app = express()
export const port = 5555;
const link = `https://localhost:${port}`
let rtn=[];

type sciName = {SciName:String}
//get scientific name from input.json
const inputData = JSON.parse(fs.readFileSync('./input.json',{encoding:'utf8', flag:'r'}));

app.listen(port, () => {
  console.log(`listening on ${link}`)
});

//send scientific name one by one to worker
interface MyRequest extends Request {
  SciName:String
}
interface MyResponse {
  status: Number;
  message: string;
}
app.post(`${link}/post`,(req: MyRequest, res: MyResponse)=>{
  inputData.map(function(i:sciName){
    req.SciName = i.SciName
    
  })
})


//get result from worker

