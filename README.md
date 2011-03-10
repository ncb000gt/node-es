node-elasticsearch
============

This is a module around the REST API for [http://www.elasticsearch.org/](Elastic Search) built for NodeJS.


Details
=============

This works with node 0.4.x and with 0.2.x. I needed it for both and so wrote an [http://github.com/ncb000gt/node-http_compat](http compatability) layer.


Usage
=============

     var lib = require('elasticsearch'), sys = require('sys'); //replace sys with util if you're on node 0.4.x
     lib.createClient(function(client) {
         client.query({query: {field: {field1: 'hai'}}}, function(err, results) {
             console.log(sys.inspect(results, true, 10));
         });
     });


API
==============

*Will go here when I'm ready to post it.*


Requirements
=============

* NodeJS
* Elastic Search
* nodeunit (for testing)
* The need for search


License
=============

MIT
