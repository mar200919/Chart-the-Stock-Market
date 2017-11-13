"use strict";
var mongoose = require('mongoose');
var app = require('express')();
var Stock = require('./stock');
var moment = require('moment');
          var yahooFinance = require('yahoo-finance');

mongoose.Promise = global.Promise;
require('dotenv').config();
mongoose.connect(process.env.database);
// view engine setup
var swig = require('swig');
var server = require('http').Server(app);
app.engine('html', swig.renderFile);
app.set('view engine', 'html');


var io = require('socket.io')(server);
// socket.io demo
io.on('connection', function (socket) {
  socket.on('client event', function (data) {
    var nome = data.value;
    var newStock = new Stock();
    newStock.id_stock = nome;
    newStock.save(function(err){
        if(err) throw err;
    })
    io.emit('update label', data);
  });
  socket.on('client event2', function (data) {
   Stock.remove({id_stock:data.value},function(err){
     if(err) throw err;
   })
    
    io.emit('remove label', data);
  });
});
server.listen(8080);
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/stocks',function(req,res){
    Stock.find({},{_id:0,__v:0},function(err,data){
        if(err) throw (err);
        res.send(data);
    });
})
app.get('/stocks/:id',function(req,res){
  var yahooFinance = require('yahoo-finance');
  var now = moment().format("YYYY-MM-D");
  var now7=moment().subtract(7, 'days').format("YYYY-MM-D");
yahooFinance.historical({
  symbol: req.params.id,
  from: now7,
  to: now,
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
}, function (err, quotes) {
  if(err) res.send("Errore"+err);
  if(quotes.length>0){
    res.send(quotes);
  }
  else{
    res.send("Code not valid");
  }
  
})
})
app.get('/infostocks',function(req,res){
   Stock.find({},{_id:0,__v:0},function(err,data){
        if(err) throw (err);
        var result =  [];
        result[0]=(data);
        var i=0;
        var count = 0;
        for(let i=0;i<data.length;i++){
          
  (function(i){
  var now = moment().format("YYYY-MM-D");
  var now7=moment().subtract(7, 'days').format("YYYY-MM-D");
yahooFinance.historical({
  symbol: data[i].id_stock,
  from: now7,
  to: now,
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
}, function (err, quotes) {
   count++;
    result[i+1]=quotes;
    if(count==data.length){
      res.send(result);
    }
  
  
  
})
})(i);
        }
    });
})


/*
var yahooFinance = require('yahoo-finance');

yahooFinance.historical({
  symbol: 'AAPL',
  from: '2012-01-01',
  to: '2012-12-31',
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
}, function (err, quotes) {
  console.log(quotes);
});

yahooFinance.snapshot({
  symbol: 'AAPL',
  fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
}, function (err, snapshot) {
  console.log(snapshot);
});
*/


