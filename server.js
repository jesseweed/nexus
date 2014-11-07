var tesla,
    express = require('express'), // GET EXPRESS
    app = module.exports = express(), // DEFINE THE APP
    request = require('superagent'),
    fs = require('fs'),
    browser = require('open'),
    growl = require('growl'),
    cheerio = require('cheerio'),
    server = require('http').createServer(app); // CREATE THE SERVER
    require('colors'); // PRETTY CONSOLE LOGGING
    require('fs'); // FILE SYSTEM
    process.env.NODE_ENV = process.env.NODE_ENV || 'development'; // SET DEFAULT ENVIRONMENT

// LOAD CONFIG & TESLA CLASS
require('./config/_settings')(app); // MAIN APP SETTINGS
tesla = require('./lib/tesla')(app);
tesla.inform(app, 'start'); // WELCOME MESSAGE

// REQUIRED SETTINGS & CONFIG FILES
require('./config/environment/' + process.env.NODE_ENV)(app); // ENVIRONMENT SPECIFIC SETTINGS


growl('Checking Nexus 6 stock...');

function checkGoogle( name, url ) {
  request.get(url, function(error, res){

      // console.log(res.text);
      var html = res.text,
      $ = cheerio.load(html);

      if ($('.play-button.devices').text().indexOf('cart') > -1) {
          growl(name.rainbow + ' is available @ Google!');
          console.log(name.rainbow + ' is available @ Google!'.rainbow);
          fs.appendFile('availability.log', name + ' was available from Google Play on ' + new Date().toString() + '\n');
          browser(url);
      } else {

        console.log(name.red + ' is sold out @ Google : '.red + new Date().toString().red);
        checkGoogle(name, url);

      }

  });
}


function checkMotorola( url ) {
  request.get(url, function(error, res){

      // console.log(res.text);
      var html = res.text,
      $ = cheerio.load(html);

      var items = $('.play-button.devices');

      if ($('.button.blue-1.medium.disabled').text().indexOf('Out of Stock') > -1) {
        console.log('Nexus 6 is sold out @ Motorola : '.yellow + new Date().toString().yellow);
        checkMotorola(url);
      } else {
        growl('Nexus 6 is available @ Motorola!');
        console.log('Nexus 6 is available @ Motorola!'.rainbow);
        fs.appendFile('availability.log', 'Nexus 6 was available from Motorola.com on ' + new Date().toString() + '\n');
        browser(url);
      }

  });
}


// CHECK ALL THE THINGZ
checkGoogle('32GB White Nexus 6', 'https://play.google.com/store/devices/details/Nexus_6_32GB_Cloud_White?id=nexus_6_white_32gb');
checkGoogle('64GB White Nexus 6', 'https://play.google.com/store/devices/details/Nexus_6_64GB_Cloud_White?id=nexus_6_white_64gb');
checkGoogle('32GB Blue Nexus 6', 'https://play.google.com/store/devices/details/Nexus_6_32GB_Midnight_Blue?id=nexus_6_blue_32gb');
checkGoogle('64GB Blue Nexus 6', 'https://play.google.com/store/devices/details/Nexus_6_64GB_Midnight_Blue?id=nexus_6_blue_64gb');
checkMotorola('http://www.motorola.com/us/consumers/nexus-6-header/Nexus-6/nexus-6-motorola-us.html');


// START THE APP BY LISTEN ON <PORT>
server.listen( process.env.PORT || app.config.port, function( err ) {

  if ( !err ) { // IF THERE'S NO ERRORS
    tesla.inform(app, 'done');
  } else { // OH NOES! SOMETHING WENT WRONG!
    tesla.inform(app, 'error', err);
  }

});

// HANDLE UNCAUGHT ERRORS
process.on('uncaughtException', function(err) {

  if(err.errno === 'EADDRINUSE') {
    tesla.inform(app, 'eaddr');
  } else {
    tesla.inform(app, 'error', err);
  }

  process.exit(1);

});

// EXPOSE APP
exports = module.exports = app;
