'use strict'
/*
<<Example>>
 const configer = require('./lib/configer.js');
 configer.load('./config/config.json');
 var conf = configer.get();
*/
var fs    = require('fs');
var JSON5 = require('json5');
var conf  = null;

function load(confFile,defConf){
  try {
    confFile = confFile || './config/config.json';
    console.log(confFile);
    //let confStr = fs.readFileSync(confFile,'utf8');  
    let confStr = fs.readFileSync(confFile);  
    console.info(`[configer] confStr = ${confStr}`);
    conf = JSON5.parse(confStr);
    //console.info(`[configer] conf = ${JSON.stringify(conf)}`);
  } catch (e) {
    console.error(`[configer] Unable to read ${confFile}, e=${e.message}`);
    if(typeof defConf!=='undefined'){
      fs.writeFileSync(confFile, JSON5.stringify(defConf,null,2), 'utf8');
      return defConf;
    }
    return null;
  }
  return conf;  
}

function get(){
  return conf;
}

exports.load = load;
exports.get  = get;