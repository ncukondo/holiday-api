// Google提供の「日本の祝日」カレンダーから、今年の分だけを抽出するサンプル。
//
// Example;
// $ npm install
// $ node get_japan_holiday.js
//
const ICal = require( 'ical' );
const axios = require('axios')
const moment = require('moment');
const fs = require('fs');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const JSON_FILE_PATH = 'json/japanese-holiday.json';
const HOLIDAY_CALENDAR_URL =
  'https://calendar.google.com/calendar/ical/japanese__ja@holiday.calendar.google.com/public/full.ics';

function compareDateString(date1,date2){
  return Date.parse(date1)-Date.parse(date2);
}

function mergeData(prevData,newData,startDate,endDate){
  const threshold = moment(startDate).format('YYYY-MM-01');
  console.log(threshold);
  let buf = {};
  const result = {};
  for(const [key, value] of Object.entries(prevData)){
    if(compareDateString(key,threshold)<0){
      buf[key]= value;
    }
  }
  buf =  {...buf,...newData};
  const keys = Object.keys( buf ).sort();
  keys.forEach( function( key ) {
    result[key]=buf[key];
  });
  return result;
}

async function getData(){
  const contentRes = await axios.get(HOLIDAY_CALENDAR_URL)
  const text = contentRes.data;
  const data = ICal.parseICS(text);
  const holidays = {};
  const keys = Object.keys( data );
  keys.forEach( function( key ) {
      var holiday = data[key];
      var start = moment(holiday.start);
      holidays[start.format("YYYY-MM-DD")]=holiday.summary;
  });
  const dates = Object.keys(holidays).sort();
  const startDate = dates[0]
  const endDate = dates[dates.length-1];
  return {holidays,startDate,endDate};
}

async function loadJson(filePath){
  try {
      const text = await readFileAsync(filePath, {encoding : 'utf8'});
      if(text) return JSON.parse(text);
      console.log(text);
  } catch (error) {
      console.log(error);
  }
  return {};
}

async function saveJson(filePath,json){
  try {
      await writeFileAsync(filePath, JSON.stringify(json,undefined,2),{encoding : 'utf8'});
  } catch (error) {
      console.log(error);
  }
}

async function refreshJson(){
  const prevData = await loadJson(JSON_FILE_PATH);
  const newData = await getData();
  const result = mergeData(prevData,newData.holidays,newData.startDate,newData.endDate)
  await saveJson(JSON_FILE_PATH,result);

}


module.exports = getData;
refreshJson();
