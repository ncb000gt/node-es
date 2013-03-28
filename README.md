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

Unless otherwise stated, all callbacks are called with `cb(err, res)`, with `res` being the parsed JSON response from elasticsearch.

elasticsearch(opts)
-------------------
Shortcut for `elasticsearch.createClient(opts)`.

elasticsearch.createClient(opts)
--------------------------------
Returns a new client object. Options:
* `index`: The name of the index to attach to.

We'll call the returned client `es`.

es.status(opts, cb)
-------------------
Get the status of the index. *GET /index/_status*

es.add(opts, doc, cb)
---------------------
Add a document to the index. *PUT /index/type/id* or *POST /index/type*

Options:
* `id`: Optional ID for the document. A UUID will be chosen by elasticsearch if no ID is specified.
* `type`: Optional type for the document (default: `doc`).
* `refresh`: Set this to true to refresh the index after add.

es.delete(opts, cb)
-------------------
Delete a document or documents from the index. *DELETE /index/type/id*

Options:
* `id`: Optional ID for the document. All documents of this type will be deleted if no ID is specified.
* `type`: Optional type for the document (default: `doc`).
* `refresh`: Set this to true to refresh the index after delete.

es.get(opts, cb)
----------------
Get a document from the index. *GET /index/type/id*

Options:
* `id`: ID for the document.
* `type`: Optional type for the document (default: `doc`).

es.query(opts, query, cb)
-------------------------
Query the index. *POST /index/_search*

es.count(opts, query, cb)
-------------------------
Get the count of a query result set. *POST /index/_count*

es.queryAll(opts, query, cb)
----------------------------
Query all indexes. *POST /_search*


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
