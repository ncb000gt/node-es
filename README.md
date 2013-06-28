# node-elasticsearch

This is a Node.js module for the [elasticsearch](http://www.elasticsearch.org/) REST API.

[![Build Status](https://travis-ci.org/ncb000gt/node-elasticsearch.png)](https://travis-ci.org/ncb000gt/node-elasticsearch) [![Coverage Status](https://coveralls.io/repos/ncb000gt/node-elasticsearch/badge.png)](https://coveralls.io/r/ncb000gt/node-elasticsearch)

## Install

```Javascript
npm install elasticsearch
```

## Usage

```Javascript
var elasticsearch = require('elasticsearch');

var config = {
	// optional (defaults to undefined)
	_index : 'kittehs',

	/*
		optional - when not supplied, defaults to the following:
			server : {
				host : 'localhost',
				port : 9200
			}
	*/
	server : {
		/*
			Any configuration elements here are passed directly through
			to http || https request, configure any keys to meet your need.
		*/
		agent : false,
		auth : 'user:pass',
		host : 'localhost',
		port : 9200,
		secure : false // toggles between https and http
	}
};

var
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
	elasticsearch = require('elasticsearch'),
	es = elasticsearch.createClient(config);
```

#### options

For each ES operation, options may be specified as the first argument to the function. In most cases, these are entirely optional, but when supplied, the values specified will take precident over the config values passed to the library constructor.
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

#### Bulk

`es.bulk(options, commands, callback)`

```Javascript
var
	elasticsearch = require('elasticsearch');
	es = elasticsearch();

var commands = [
	{ index : { _index : 'dieties', _type : 'kitteh' } },
	{ name : 'hamish', breed : 'manx', color : 'tortoise' },
	{ index : { _index : 'dieties', _type : 'kitteh' } },
	{ name : 'dugald', breed : 'siamese', color : 'white' },
	{ index : { _index : 'dieties', _type : 'kitteh' } },
	{ name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
];

es.bulk(commands, function (err, data) {
	// teh datas
});
```

#### Count

`es.count(options, callback)`

```Javascript
var
	elasticsearch = require('elasticsearch');
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

#### Delete

Requires `_index` be specified either via lib config (as shown below) or via options when calling the operation.

`es.count(options, callback)`

```Javascript
var
	elasticsearch = require('elasticsearch');
	es = elasticsearch();

core.count(function (err, data) {
	// teh datas
});
```

#### Delete By Query

Requires `_index` be specified either via lib config (as shown below) or via options when calling the operation.

`es.deleteByQuery(options, query, callback)`

```Javascript
var
	elasticsearch = require('elasticsearch');
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

#### Exists

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.exists(options, callback)`

```Javascript
var
	elasticsearch = require('elasticsearch');
	es = elasticsearch();

es.exists({ _index : 'kitteh' }, function (err, data) {
	// teh datas
});
```

#### Explain

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.explain(options, query, callback)`

#### Get

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.get(options, callback)`

#### Index

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.

`es.index(options, doc, callback)`

#### More Like This

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.moreLikeThis(options, callback)`

#### Multi Get

If `_index` and/or `_type` are supplied via options (or lib config), the will applied to the doc that is transmitted for the operation.

`es.multiGet(options, docs, callback)`

#### Multi Search

`es.multiSearch(options, queries, callback)`

#### Percolate

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.

`es.percolate(options, doc, callback)`

Requires `_index` be specified either via lib config or via options when calling the operation.
Also requires `name`, but this must be specified via options.

`es.registerPercolator(options, query, callback)`

Requires `_index` be specified either via lib config or via options when calling the operation.
Also requires `name`, but this must be specified via options.

`es.unregisterPercolator(options, callback)`

#### Search

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.search(options, query, callback)`

#### Update

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.
Also requires `_id`, but this must be specified via options.

`es.update(options, doc, callback)`

#### Validate

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.validate(options, query, callback)`

### Indices

All operations here interact with the indices segment of the Elasticsearch API.

#### Alias

`es.indices.alias(options, data, callback)`

#### Aliases

Requires `alias`, but this must be specified via options.

`es.indices.aliases(options, callback)`

#### Analyze

`es.indices.analyze(options, data, callback)`

#### Clear Cache

`es.indices.clearCache(options, callback)`

#### Close Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.closeIndex(options, callback)`

#### Create Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.createIndex(options, data, callback)`

#### Create Template

Requires `name`, but this must be specified via options.

`es.indices.createTemplate(options, template, callback)`

#### Delete Alias

Requires `_index` and `_alias` be specified either via lib config or via options when calling the operation.

`es.indices.deleteAlias(opitons, callback)`

#### Delete Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.deleteIndex(options, callback)`

#### Delete Mapping

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.

`es.indices.deleteMapping(options, callback)`

#### Delete Template

Requires `name`, but this must be specified via options.

`es.indices.deleteTemplate(options, callback)`

#### Delete Warmer

Requires `_index` be specified either via lib config or via options when calling the operation.
Also requires `name`, but this must be specified via options.

`es.indices.deleteWarmer(options, callback)`

#### Exists

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.exists(options, callback)`

#### Flush

`es.indices.flush(options, callback)`

#### Mappings

`es.indices.mappings(options, callback)`

#### Open Index

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.openIndex(options, callback)`

#### Optimize

`es.indices.optimize(options, callback)`

#### Put Mapping

Requires `_index` and `_type` be specified either via lib config or via options when calling the operation.

`es.indices.putMapping(options, mapping, callback)`

#### Put Warmer

Requires `name`, but this must be specified via options.

`es.indices.putWarmer(options, warmer, callback)`

#### Refresh

`es.indices.refresh(options, callback)`

#### Segments

`es.indices.segments(options, callback)`

#### Settings

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.settings(options, callback)`

#### Snapshot

`es.indices.snapshot(options, callback)`

#### Stats

`es.indices.stats(options, callback)`

#### Status

`es.indices.status(options, callback`

#### Templates

Requires `name`, but this must be specified via options.

`es.indices.templates(options, callback)`

#### Update Settings

`es.indices.updateSettings(options, settings, callback)`

#### Warmers

Requires `_index` be specified either via lib config or via options when calling the operation.

`es.indices.warmers(options, callback)`

### Cluster

#### Delete River

#### Health

#### Hot Threads

#### Nodes Info

#### Nodes Status

#### Put River

#### Reroute

#### Rivers

#### Settings

#### Shutdown

#### State

#### Update Settings

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
