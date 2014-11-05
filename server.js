var tesla,
    express = require('express'), // GET EXPRESS
    app = module.exports = express(), // DEFINE THE APP
    request = require('superagent'),
    open = require('open'),
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

function check( url ) {
  request.get(url, function(error, res){

      // console.log(res.text);
      var html = res.text,
      $ = cheerio.load(html);

      var items = $('.play-button.devices');

      if ($('.play-button.devices').text().indexOf('cart') > -1) {
          growl('Nexus 6 is Available!');
          open(url);
      } else {

        console.log('Out of stock');
        setTimeout(check(url), 2000);

      }

  });
}


check('https://play.google.com/store/devices/details/Nexus_6_64GB_Cloud_White?id=nexus_6_white_64gb');


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
