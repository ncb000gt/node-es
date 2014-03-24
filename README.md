# node-es

This is a Node.js module for the [elasticsearch](http://www.elasticsearch.org/) REST API.

[![Build Status](https://travis-ci.org/ncb000gt/node-es.png)](https://travis-ci.org/ncb000gt/node-es) [![Coverage Status](https://coveralls.io/repos/ncb000gt/node-es/badge.png)](https://coveralls.io/r/ncb000gt/node-es)

## Install

```Javascript
npm install es
```

## Usage

```Javascript
var
  elasticsearch = require('es'),
  config = {
    _index : 'kittehs'
  },
  es = elasticsearch(config);

es.search({
    query : {
      field : {
        animal : 'kitteh'
      }
    }
  }, function (err, data) {
    // work with data here
    // response data is according to ElasticSearch spec
  });
```


## API

Unless otherwise stated, all callback signatures are `function (err, data)`, with `data` being the parsed JSON response from elasticsearch.

#### createClient

Calling `elasticsearch.createClient(config)` is the same as `elasticsearch(config)`.

```Javascript
var
  elasticsearch = require('es'),
  es = elasticsearch.createClient(config);
```

##### config._index

When initializing the library, you may choose to specify an index and/or type to work with at the start to save from having to supply this information in the options for each operation request:

```Javascript
var config = {
  _index : 'pet',
  _type : 'kitteh'
};
```

Additionally, if working with multiple indexes or types, you may specify them as arrays:

```Javascript
var config = {
  _indices : ['pet', 'family'],
  _types : ['kitteh', 'canine']
};
```

*Note:* When index, indices, type or types are supplied via operation options, those settings will take precedent over the base configuration for the library:

```Javascript

var
  elasticsearch = require('es'),
  config = {
    _index : 'kitteh'
  },
  es = elasticsearch.createClient(config);

es.indices.exist({ _index : 'canine' }, function (err, data) {
  // will result in a HEAD request to /canine instead of /kitteh
});
```

##### config.server

If omitted from configuration, the server settings default to the following:

```Javascript
var config = {
  // optional - when not supplied, defaults to the following:
  server : {
    host : 'localhost',
    port : 9200
  }
};
```

Anything specified within the server element of config is passed directly through to each HTTP/HTTPS request. You may configure additional options for connecting to Elasticsearch:

```Javascript
var config = {
  server : {
    agent : false,
    auth : 'user:pass',
    host : 'localhost',
    port : 9243,
    rejectUnauthorized : false,
    secure : true // toggles between https and http
  }
};
```

#### cluster support and failover

Elasticsearch is pretty much rad at clustering. If you want to specify multiple servers to failover to, you may do so by either supplying an array as the value for the property `hosts` or `hostnames`:

```Javascript
var elasticsearch = require('es');
var config = {
  _index : 'bawss',
  server : {
    hostnames : ['es1.myhost.com', 'es2.myhost.com', 'es3.myhost.com']
    secure : true
  }
};

var es = elasticsearch(config);
```

If you run on different ports for each server, use the `hosts` property:

```Javascript
var elasticsearch = require('es');
var config = {
  _index : 'bawss',
  server : {
    hosts : ['localhost:9200', 'localhost:9201', 'localhost:9202']
  }
};

var es = elasticsearch(config);
```

#### operation timeout

The default timeout for any operation against Elasticsearch is set at 30 seconds. You can override this value by specifying a timeout property in the options for the operation:

```Javascript
var options = {
  timeout : 60000 // 60 seconds
};

es.bulk(options, commands, function (err, data) {
  // teh datas
});
```

#### request event

An event named `request` with a signature of `function (options) { }` is emitted for each API call.

```Javascript
var elasticsearch = require('es');

var config = {
  _index : 'bawss',
  server : {
    hosts : ['localhost:9200', 'localhost:9201', 'localhost:9202']
  }
};

var es = elasticsearch(config);

es.request.on('request', function (options) {
  console.log('request initiated');
  console.log(options);
});

es.count(function (err, results) {
  // event results in request options being logged to console...
});
```

#### options for any operation

For each ES operation, options may be specified as the first argument to the function. In most cases, these are entirely optional, but when supplied, the values specified will take precedent over the config values passed to the library constructor.
Additionally, if there are extra option keys supplied beyond what is required for the operation, they are mapped directly to the querystring.

```
var options = {
  _index : 'bawss',
  _type : 'man',
  refresh : true
};

var doc = {
  field1 : 'test value'
};

es.index(options, doc, function (err, data) {
  // this will result in a POST with path /bawss/man?refresh=true
});
```

### Core

For more specifics and details regarding the core API for ElasticSearch, please refer to the documentation at <http://www.elasticsearch.org/guide/reference/api/>.

##### Bulk

*Please Note:* The default timeout is set at 30 seconds... if you are performing a large bulk insert you may need to increase this limit by specifying a higher value for `timeout` in the options parameter.

This method doesn't take into account the underlying config that was used when instantiating the client. It requires index and type to be specified via the commands array or via the options parameter. Conflict will occur if one specifies a different index and type in the options than what is specified via the commands parameter.

At a high level, when performing a bulk update, you must supply an array with an action object followed by the object that the action will use during execution. In the following example, the first item in the array specifies the action is `index` and the second item represents the data to index:

```Javascript
[
  { index : { _index : 'dieties', _type : 'kitteh' } },
  { name : 'hamish', breed : 'manx', color : 'tortoise' }
]
```

In this example, two `index` actions will be performed on the 'dieties' index and 'kitteh' type in ElasticSearch:

```Javascript
[
  { index : { _index : 'dieties', _type : 'kitteh' } },
  { name : 'dugald', breed : 'siamese', color : 'white' },
  { index : { _index : 'dieties', _type : 'kitteh' } },
  { name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
]
```

For more information regarding bulk, please see the ElasticSearch documentation at <http://www.elasticsearch.org/guide/reference/api/bulk/>

`es.bulk(options, commands, callback)`

```Javascript
var
  elasticsearch = require('es'),
  es = elasticsearch();

var commands = [
  { index : { _index : 'dieties', _type : 'kitteh' } },
  { name : 'hamish', breed : 'manx', color : 'tortoise' },
  { index : { _index : 'dieties', _type : 'kitteh' } },
  { name : 'dugald', breed : 'siamese', color : 'white' },
  { index : { _index : 'dieties', _type : 'kitteh' } },
  { name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
];

es.bulk(options, commands, function (err, data) {
  // teh datas
});
```

##### Bulk Index

This is not a core action for ElasticSearch, but is a convenience method added to this ElasticSearch client to make bulk indexing more straight forward. Simply supply an array of documents you wish to bulk index in ElasticSearch and the method will take of the details for you.

`es.bulkIndex(options, documents, callback)`

```Javascript
var
  elasticsearch = require('es'),
  es = elasticsearch();

var documents = [
  { name : 'hamish', breed : 'manx', color : 'tortoise' },
  { name : 'dugald', breed : 'siamese', color : 'white' },
  { name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
];

var options = {
  _index : 'dieties',
  _type : 'kitteh'
}

es.bulkIndex(options, documents, function (err, data) {
  // teh datas
});
```

##### Count

`es.count(options, callback)`

```Javascript
var
  elasticsearch = require('es');
  es = elasticsearch();

es.count(function (err, data) {
  // teh datas
});

// count docs in a specific index/type
var options = {
  _index : 'bawss',
  _type : 'kitteh'
}

es.count(options, function (err, data) {
  // counted... like a bawss
});
```

##### Delete

Requires `_index` be specified either via lib config (as shown below) or via options when calling the operation.

`es.delete(options, callback)`

```Javascript
var
  elasticsearch = require('es'),
  es = elasticsearch();

core.delete({ _id : 'mbQZc_XhQDWmNCQX5KwPeA' }, function (err, data) {
  // teh datas
});
```

##### Delete By Query

Requires `_index` be specified either via lib config (as shown below) or via options when calling the operation.

`es.deleteByQuery(options, query, callback)`

```Javascript
var
  elasticsearch = require('es'),
  es = elasticsearch({ _index : 'kitteh' });

var query = {
  query : {
    field : { breed : 'siamese' }
  }
};

es.deleteByQuery(query, function (err, data) {
  // teh datas
});
```

##### Exists

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.exists(options, callback)`

```Javascript
var
  elasticsearch = require('es'),
  es = elasticsearch();

es.exists({ _index : 'kitteh' }, function (err, data) {
  // teh datas
});
```

##### Explain

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.explain(options, query, callback)`

##### Get

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.get(options, callback)`

##### Index

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.

`es.index(options, doc, callback)`

##### More Like This

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.moreLikeThis(options, callback)`

##### Multi Get

If `_index` and/or `_type` are supplied via options (or lib config), the will applied to the doc that is transmitted for the operation.

`es.multiGet(options, docs, callback)`

##### Multi Search

`es.multiSearch(options, queries, callback)`

##### Percolate

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.percolate(options, doc, callback)`

Requires `_index` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.registerPercolator(options, query, callback)`

Requires `_index` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.unregisterPercolator(options, callback)`

##### Search

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.search(options, query, callback)`

##### Scroll

Requires `scroll` be specified via options when calling the method. The following code snippet shows how to perform a search with a subsequent scroll.

```Javascript
var
  elasticsearch = require('es'),
  config = {
    _index : 'kittehs'
  },
  es = elasticsearch(config);

// first search, specifying scan search_type
es.search({
    search_type : 'scan',
    scroll : '10m'
  }, {
    query : {
      match_all : {}
    }
  }, function (err, data) {
    // next, perform the scroll with the _scroll_id value returned
    es.scroll({ scroll : '10m' }, data['_scroll_id'], callback);
  });
```

##### Suggest

`es.suggest(options, query, callback)`

##### Update

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.update(options, doc, callback)`

##### Validate

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.validate(options, query, callback)`

### Indices

All operations here interact with the indices segment of the Elasticsearch API.

##### Alias

`es.indices.alias(options, data, callback)`

##### Aliases

Requires `alias`, but this must be specified via options.

`es.indices.aliases(options, callback)`

##### Analyze

`es.indices.analyze(options, data, callback)`

##### Clear Cache

`es.indices.clearCache(options, callback)`

##### Close Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.closeIndex(options, callback)`

##### Create Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.createIndex(options, data, callback)`

##### Create Template

Requires `name`, but this must be specified via options.

`es.indices.createTemplate(options, template, callback)`

##### Delete Alias

Requires `_index` and `_alias` be specified either via lib config or via options when calling the operation.

`es.indices.deleteAlias(opitons, callback)`

##### Delete Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.deleteIndex(options, callback)`

##### Delete Mapping

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.

`es.indices.deleteMapping(options, callback)`

##### Delete Template

Requires `name`, but this must be specified via options.

`es.indices.deleteTemplate(options, callback)`

##### Delete Warmer

Requires `_index` be specified either via lib config or via options when calling the operation.
Also requires `name`, but this must be specified via options.

`es.indices.deleteWarmer(options, callback)`

##### Exists

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.exists(options, callback)`

##### Flush

`es.indices.flush(options, callback)`

##### Mappings

`es.indices.mappings(options, callback)`

##### Open Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.openIndex(options, callback)`

##### Optimize

`es.indices.optimize(options, callback)`

##### Put Mapping

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.

`es.indices.putMapping(options, mapping, callback)`

##### Put Warmer

Requires `name`, but this must be specified via options.

`es.indices.putWarmer(options, warmer, callback)`

##### Refresh

`es.indices.refresh(options, callback)`

##### Segments

`es.indices.segments(options, callback)`

##### Settings

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.settings(options, callback)`

##### Snapshot

`es.indices.snapshot(options, callback)`

##### Stats

`es.indices.stats(options, callback)`

##### Status

`es.indices.status(options, callback`

##### Templates

Requires `name`, but this must be specified via options.

`es.indices.templates(options, callback)`

##### Update Settings

`es.indices.updateSettings(options, settings, callback)`

##### Warmers

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.warmers(options, callback)`

### Cluster

All operations here interact with the Cluster portion of the Elasticsearch API.

##### Delete River

Requires `name`, but this must be specified via options.

`es.cluster.deleteRiver(options, callback)`

##### Field Stats

Requires `field` or `fields`, but this must be specified via options.

`es.cluster.fieldStats(options, callback)`

##### Health

`es.cluster.health(options, callback)`

##### Hot Threads

`es.cluster.hotThreads(options, callback)`

##### Nodes Info

`es.cluster.nodesInfo(options, callback)`

##### Nodes Stats

`es.cluster.nodesStats(options, callback)`

##### Put River

Requires `name`, but this must be specified via options.

`es.cluster.putRiver(options, meta, callback)`

##### Reroute

`es.cluster.reroute(options, commands, callback)`

##### Rivers

Requires `name`, but this must be specified via options.

`es.cluster.rivers(options, callback)`

##### Settings

`es.cluster.settings(options, callback)`

##### Shutdown

`es.cluster.shutdown(options, callback)`

##### State

`es.cluster.state(options, callback)`

##### Update Settings

`es.cluster.updateSettings(options, updates, callback)`

# Testing

Note that a test coverage report is sent to coveralls.io during CI... running locally will result in a response similar to `Bad response: 500 {"message":"Build processing error.","error":true,"url":""}`.
Code coverage data generated from npm test is located in `./lib-cov` and is not included in the git repo.

```Javascript
npm install
npm test
```

To run code coverage and generate local report at `./reports/coverage.html`:

```Javascript
npm run-script coverage
```

# Requirements

* Node.js
* elasticsearch
* The need for search

# License

MIT
