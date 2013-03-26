node-elasticsearch
==================

This is a Node.js module for the [elasticsearch](http://www.elasticsearch.org/) REST API.


Usage
=====

```js
var elasticsearch = require('elasticsearch');
var es = elasticsearch({index: 'kitteh'});

es.query({query: {field: {field1: 'hai'}}}, function(err, results) {
  console.log(results);
});
```


API
===

TBD


Testing
=======

```
npm install
npm test
```    


Requirements
============

* Node.js
* elasticsearch
* The need for search


License
=======

MIT
