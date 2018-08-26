//SPDX-License-Identifier: Apache-2.0

var prod = require('./controller.js');

module.exports = function(app){

  app.get('/get_product/:id', function(req, res){
    prod.get_product(req, res);
  });
  app.post('/add_product/', function(req, res){
    prod.record_product(req, res);
  });
  app.get('/get_all_products', function(req, res){
    prod.get_all_products(req, res);
  });
  app.post('/change_holder/', function(req, res){
    prod.change_holder(req, res);
  });
}
