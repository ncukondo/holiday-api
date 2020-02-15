const axios = require('axios')
const Iconv = require('iconv-lite');
const googleHolidays = require('../lib/googleHolidays.js')

function convert(data){
  const buffer = Buffer.from(data, 0);
  return Iconv.decode(buffer, "utf-8");
}

function toISOString(dateStr){
  if(!dateStr) return '';
  var date = new Date(Date.parse(dateStr));
  if(!date) return '';
  var year = date.getFullYear();
  var month = ('0'+(date.getMonth()+1)).slice(-2)
  var day = ('0'+(date.getDate())).slice(-2)
  var result = year+'-'+month+'-'+day
  console.log(result);
  return result;
}


async function getData(){
  const contentRes = await axios.get('https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv')
  var text = contentRes.data;
  text = text.split('\n').splice(1).map(t=>toISOString(t.split(',')[0])).join('\n');
  console.log(text);
  return text;
}

async function doFunction(req, res) {
  try{
    const data = await googleHolidays();
    res.setHeader('content-type', 'text/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).send(data)
  }catch(e){
    console.log(e)
    res.status(500).send('Internal Server Error.')
  }
}

module.exports = doFunction;
googleHolidays();