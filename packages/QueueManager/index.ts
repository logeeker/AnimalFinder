const fs = require('fs');
import express,{ Request, Response } from 'express';

const app = express();
const port = process.env.PORT;
const link = `http://localhost:${port}`
let rtn=[];

type sciName = {SciName:String}
//get scientific name from input.json
const inputData = JSON.parse(fs.readFileSync('./input.json',{encoding:'utf8', flag:'r'}));

//send scientific name one by one to worker
inputData.map(function(i:sciName){
  app.get('/',(req,res)=>{
    return res.status(200).send(i)
  })
})


//get result from worker

app.listen(port, () => {
  console.log(`listening on ${link}`)
});


 