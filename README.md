node-elasticsearch
==================

This is a Node.js module for the [elasticsearch](http://www.elasticsearch.org/) REST API.

[![Build Status](https://travis-ci.org/ncb000gt/node-elasticsearch.png?branch=master)](https://travis-ci.org/ncb000gt/node-elasticsearch)

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
Returns a new client object.

Options:
* `auth`: Basic authentication for elasticsearch in 'username:password' format
* `index`: The name of the index to act upon
* `host`: The hostname of the elasticsearch server (defaults to localhost)
* `port`: The port of the elasticsearch server (defaults to 9200)
* `rejectUnauthorized`: If specifying secure this may be set to false to bypass certificate validation
* `secure`: Specify true if the elasticsearch server requires TLS/SSL

We'll call the returned client `es`.

es.status(opts, cb)
-------------------
Get the status of the index. Maps to *GET /index/_status*.

es.add(opts, doc, cb)
---------------------
Add a document to the index. Maps to *PUT /index/type/id* or *POST /index/type*.

Options:
* `id`: Optional ID for the document. A UUID will be chosen by elasticsearch if no ID is specified.
* `type`: Optional type for the document (default: `doc`).
* `refresh`: Set this to true to refresh the index after add.

es.delete(opts, cb)
-------------------
Delete a document or documents from the index. Maps to *DELETE /index/type/id*.

Options:
* `id`: Optional ID for the document. All documents of this type will be deleted if no ID is specified.
* `type`: Optional type for the document (default: `doc`).
* `refresh`: Set this to true to refresh the index after delete.

es.get(opts, cb)
----------------
Get a document from the index. Maps to *GET /index/type/id*.

Options:
* `id`: ID for the document.
* `type`: Optional type for the document (default: `doc`).

es.query(opts, query, cb)
-------------------------
Query the index. Maps to *POST /index/_search*.

es.count(opts, query, cb)
-------------------------
Get the count of a query result set. Maps to *POST /index/_count*.

es.queryAll(opts, query, cb)
----------------------------
Query all indexes. Maps to *POST /_search*.

es.putRiver(opts, river, cb)
----------------------------
Put a new or updated river. Maps to *PUT /_river/name/_meta*.

Options:
* `name`: Name for the river.

es.getRiver(opts, name, cb)
---------------------------
Get a river. Maps to *GET /_river/name/_meta*.

es.deleteRiver(opts, name, cb)
-------------------------------
Delete a river. Maps to *DELETE /_river/name/*.

es.putMapping(opts, config, cb)
-------------------------------
Put a new or updated mapping. Maps to *PUT /index/name/_mapping*.

`name` is defined by `config.name` and `mapping` by `config.mapping`.

es.getMapping(opts, type, cb)
-----------------------------
Get a mapping. Maps to *GET /index/type/_mapping*.

If type is an array its values will be joined.

es.deleteMapping(opts, config, cb)
----------------------------------
Delete a mapping. Maps to *DELETE /index/name/_mapping*.

`name` is defined by `config.name`.

new elasticsearch.Index(opts)
-----------------------------
Returns a new index object.

Options:
* `name`: The name of the index to act upon.

We'll call the returned index `index`.

index.status(opts, cb)
----------------------
Get the status of the index. Maps to *GET /index/_status*.

index.refresh(opts, cb)
-----------------------
Refresh the index. Maps to *POST /index/_refresh*.

index.create(opts, config, cb)
------------------------------
Create the index. Maps to *PUT /index/* or *POST /index/* depending on the existence of `config.mappings`.

index.delete(cb)
----------------
Delete the index. Maps to *DELETE /index*.

new elasticsearch.Cluster()
---------------------------
Returns a new cluster object.

We'll call the returned cluster `cluster`.

cluster.status(opts, cb)
------------------------
Get the status of the cluster. Maps to *GET /_status*.

cluster.deleteIndices(opts, cb)
-------------------------------
Delete all indices in this cluster. Maps to multiple calls to *DELETE /index/*.

cluster.health(opts, cb)
------------------------
Get health of the cluster. Maps to *GET _cluster/health*.

Options map to query parameters.


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
