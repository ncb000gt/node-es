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
