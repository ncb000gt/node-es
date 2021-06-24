# v0.8.0 / 2021-06-23

* Adjustments to support Elasticsearch v7 and up (<https://www.elastic.co/guide/en/elasticsearch/reference/current/removal-of-types.html>)
  * Updated core.add (core.index): added `/_doc` to path and eliminated `_type` parameter requirement
  * Updated core.delete: added `/_doc` to path
  * Updated core.get: added `/_doc` to path and eliminated `_type` parameter requirement
  * Removed core.moreLikeThis: is now accomplished via search query (<https://www.elastic.co/guide/en/elasticsearch/reference/7.13/query-dsl-mlt-query.html>)
  * Updated core.multiGet: removed `_type` from path and eliminated `_type` parameter requirement
  * Updated core.update: removed `_type` from path and eliminated `_type` parameter requirement
  * Updated core.bulkIndex: removed `_type` from payload interpolation
  * Updated core.explain: removed `_type` from path and eliminated `_type` parameter requirement
  * Updated core.search: removed `_type` from path
  * Updated core.suggest: removed `_type` from path
  * Updated core.count: removed `_type` from path
  * Updated core.multiSearch: removed `_type` from path
  * Updated core.deleteByQuery: removed `_type` from path
  * Removed core.exists: fully deprecated in ES 7.x
  * Updated indices.putMapping: removed `/_mapping/_type` from resource and eliminated `_type` parameter requirement
  * Updated indices.stats: removed `_type` from path
  * Updated indices.deleteMapping: removed `_type` from path and elimited `_type` parameter requirement
  * Updated indices.exists: removed `_type` from path
  * Updated indices.mappings: removed `_type` from path

# v0.7.4 / 2021-06-22

* Updated dependencies

# v0.7.3 / 2019-03-19

* Modified `package.json` and moved to `prepare` instead of `prepublish`
* Updated `reqlib` dependency with tighter request body handling

# v0.7.2 / 2019-03-19

* Removed extraneous `console.log` statements in functional test

# v0.7.1 / 2019-03-05

* Adjusted `scroll` method to construct proper scroll payload when only the ID is specified

# v0.7.0 / 2019-02-20

* Replaced `thenify` and `bluebird` dependencies with `babel`
* Modified to support ElasticSearch 6.x.x
  * `suggest` method adjusted to use `_search` endpoint instead of deprecated `_suggest`
* Fixed issue where `cluster.hotThreads` callback returned result as `err`
* Adjusted failover behavior for `hosts` key, specifically to better align with the URL module in Node core
* Adjusted mappings in the functional tests according to changes in Elasticsearch 6.x

# v0.6.0 / 2017-10-02

* Modified to support ElasticSearch 5.5.x
  * `indices.createIndex` method adjusted to only call `put` (deprecated `post`)
  * `indices.optimize` method deprecated
  * `indices.status` method deprecated
  * `Warmers` deprecated
  * `Percolators` deprecated
  * `scan` search_type deprecated
  * `and` filter deprecate and replaced by `bool` query
  * unit and functional tests udpated

# v0.5.2 / 2016-10-05

* Added fix for scenario where `_index` and `_type` overrides would not always work (Issue #62)
* Adjusted functional tests to appropriately work with Elasticsearch versions greater than v2.0

# v0.5.1 / 2016-01-22

* Updated documentation for `count` method

# v0.5.0 / 2016-01-22

* Added support for promises while maintaining backwards compatibility in existing API (persuant to issue #58)
* Moved to eslint from jshint
* Factored mocha options into an options file
* Moved code coverage work to Travis-CI to eliminate developer side error when running `npm test`
* Moved to Istanbul from jscoverage and cleaned up NPM scripts used for testing

# v0.4.8 / 2015-10-15

* Fixed issue where `_source` parameter was not properly added to the URL when using `get`

# 0.4.7 / 2015-09-21

* Adjusted `es.indices.putMapping` to match [Elasticsearch documentation](<https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-put-mapping.html>)

# 0.4.6 / 2015-09-16

* Added support for `_create` as an option when calling `es.index` function

# 0.4.5 / 2015-08-06

* Added support for supplying additional parameters to `es.indices.putMapping` (i.e. `ignore_conflicts`)
* Minor updates to reflect additions and changes in versions of Elasticsearch post v1.3.x

# 0.4.4 / 2014-04-26

* Fix for issue #48 - querystring parameters as arrays were not properly formatted when sent

# 0.4.3 / 2014-04-22

* Fix for issue #47 - updating jscoverage dependency version

# 0.4.2 / 2014-04-22

* Fix for issue #46 - request defaults to port 80

# 0.4.1 / 2014-03-09

* Modifed to support ElasticSearch 1.0.x
  * `cluster.nodesInfo` method updated
  * `cluster.nodesStatus` method updated
  * `registerPercolator` method updated
  * `unregisterPercolator` method updated
  * unit and functional tests updated

# 0.3.16 / 2014-01-03

* Added support for `scroll()` method in core module

# 0.3.15 / 2013-12-21

* Fix to allow _id values of 0

# 0.3.14 / 2013-11-14

* Fix for update() method not allowing script field to be a blank value

# 0.3.13 / 2013-10-29

* Fix for EventEmitter listener Node warning

# 0.3.12 / 2013-10-02

* Switched module name to `es` from `elasticsearch`
* Fixed documentation spelling errors
* Added longer timeout for functional tests
* Added support for suggest API method

# 0.3.11 / 2013-09-19

* Rewrote mechanism for logging HTTP requests to use events instead
* Fixed bulk index method to handle passing in ids properly

# 0.3.10 / 2013-08-29

* Added ability to log HTTP requests

# 0.3.9 / 2013-08-27

* Expose underlying request API to clients for easier override
* Added functional test suite and configured in Travis-CI
* Fixed bug in multiGet method
* Fixed bug in deleteByQuery method

# 0.3.8 / 2013-08-15

* Changed underlying request and utils modules for better extensibility
* Added ability to override/extend core request module

# 0.3.7 / 2013-08-05

* Added bulkIndex method to core for convenience
* Enhanced documentation

# 0.3.6 / 2013-07-18

* Fixed bug in constructor where default server settings were ignored in some cases
* Set content length on request for reverse proxy support
* Tightened up dependency version requirements in NPM

# 0.3.5 / 2013-07-02

* Improved error messaging by passing HTTP status codes back to clients

# 0.3.4 / 2013-07-02

* Removed line of debugging code

# 0.3.3 / 2013-07-02

* Failover support for ElasticSearch clusters

# 0.3.2 / 2013-07-01

* Fixed bug on bulk index call

# 0.3.1 / 2013-07-01

* Completed all API methods for ElasticSearch in module
* Added suite of unit tests and integration with Coveralls.io to display test coverage
* Split API into 3 areas (Core, Indices and Cluster) mapping closely to ElasticSearch API components

# 0.2.6 / 2013-06-22

* Enchanced error event exposure for clients

# 0.2.5 / 2013-06-11

* Addressed minor JSHint item in code

# 0.2.4 / 2013-06-11

* Minor bug fix related to server config

# 0.2.3 / 2013-06-10

* Added support for SSL and BasicAuth

# 0.2.2 / 2013-04-09

* Added additional module constructor for ease of use
* Improved error messages
* Converted functional tests to use node-tap

# 0.2.1 / 2013-04-08

* Added URL for homepage for NPM
* Added support for configurable hostname and port number
* Added functional test support in Travis configuration

# 0.2.0 / 2013-04-04

* Implemented Travis-CI
* Updated API documentation of component
