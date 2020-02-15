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


async function getData(){
  const contentRes = await axios.get(HOLIDAY_CALENDAR_URL)
  var text = contentRes.data;
  var data = ICal.parseICS(text);
  var keys = Object.keys( data ).sort();
  const holidays = {};
  keys.forEach( function( key ) {
      var holiday = data[key];
      var startDate = moment(holiday.start);
      holidays[startDate.format("YYYY-MM-DD")]=holiday.summary;
  });
  console.log(holidays)
  return holidays;
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
      await writeFileAsync(filePath, JSON.stringify(json),{encoding : 'utf8'});
  } catch (error) {
      console.log(error);
  }
}

async function refreshJson(){
  const prev = await loadJson(JSON_FILE_PATH);
  const newData = await getData();
  await saveJson(JSON_FILE_PATH,{...prev,...newData});

}


module.exports = getData;
refreshJson();
