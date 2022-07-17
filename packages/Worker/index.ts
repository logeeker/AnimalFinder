const axios = require('axios');

const getSciName = async()=>{
  let res;
  try {
    res=await axios.get('http://localhost:5555')
  } catch (error) {
    throw new Error(`get sciName failed because ${error}`)
  }
  if(res){
    return res.data
  }else{
    return null
  }
}

const scrapeRelatedDataBySciName = async()=>{
  let sciName = await getSciName();
  console.log('sciName',sciName)
}
scrapeRelatedDataBySciName()


