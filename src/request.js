var
	events = require('events'),
	http = require('http'),
	https = require('https'),
	qs = require('querystring'),

	DEFAULT_TIMEOUT = 30000,
	EVENT_REQUEST = 'request';


/*
	A closure that enables basic configuration of the request
	that will be applied for every operation of the lib.
*/
exports.initialize = function (settings, self) {
	'use strict';

	self = self || Object.create(events.EventEmitter.prototype);
	self.failover = {
		count : 0,
		index : 0,
		key : '',
		values : []
	};
	self.settings = settings || {};

	// enable events on request
	events.EventEmitter.call(self);

	/*
		If failover information is provided, store the options for use
		in the event of a connection failure.
	*/
	['hosts', 'hostnames'].forEach(function (hostsKey) {
		if (self.settings[hostsKey] && Array.isArray(self.settings[hostsKey])) {
			// remove the "s" from the key
			self.failover.key = hostsKey.slice(0, -1);
			self.failover.values = self.settings[hostsKey];

			// set the current default host/hostname
			self.settings[self.failover.key] = self.failover.values[self.failover.index];

			// check for port specification in host/hostname
			var portIndex = self.settings[self.failover.key].indexOf(':');
			if (portIndex > 0) {
				self.settings.port = self.settings[self.failover.key].substr(portIndex + 1);
				self.settings[self.failover.key] = self.settings[self.failover.key].substr(0, portIndex);
			}

			// clear the failover settings from the default settings
			delete self.settings[hostsKey];
		}
	});

	/*
		Actually executes a request given the supplied options,
		writing the specified data and returning the result to the
		supplied callback.

		In the event that an exception occurs on the request, the
		Error is captured and returned via the callback.
	*/
	function exec (options, data, callback) {
		options = self.getRequestOptions(options);
		data = data || '';
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}
		if (!options.headers) {
			options.headers = {};
		}
		options.headers['Content-Length'] = Buffer.byteLength(data);

		// issue #23 - ability to log http(s) requests (emit an event update)
		if (self.emit) {
			self.emit(EVENT_REQUEST, options);
		}

		var req =
			(options.secure ? https : http).request(options, function (res) {
				var
					body = '',
					chunks = [],
					json = {},
					statusCode = res.statusCode;

				res.setEncoding('utf-8');

				res.on('data', function (chunk) {
					chunks.push(chunk);
				});

				res.once('end', function () {
					body = chunks.join('');

					if (statusCode >= 400) {
						var err = new Error(body);
						err.statusCode = statusCode;
						return callback(err);
					}

					if (!body && options.method === 'HEAD') {
						json = {
							statusCode : statusCode
						};
					} else {
						try {
							json = JSON.parse(body);
						} catch (err) {
							return callback(new Error(body, err));
						}
					}

					self.failover.count = 0;
					return callback(null, json);
				});
			});

		req.on('error', function (err) {
			var
				failover =
					self.failover.values.length > 1 &&
					err.code &&
					(err.code === 'ENOTFOUND' ||
					err.code === 'ECONNREFUSED' ||
					err.code === 'ECONNRESET'),
				hostOverridden =
					(options.hostname || options.host) !==
					(self.settings.hostname || self.settings.host);

			// if there is a connection error and the host/hostname settings
			// weren't overridden in the options, let's failover to the
			// next host/hostname if one is available
			if (failover && !hostOverridden) {
				self.failover.count++;
				self.failover.index =
					self.failover.index === self.failover.values.length - 1 ?
					0 :
					self.failover.index + 1;

				if (self.failover.count <= self.failover.values.length) {
					self.settings[self.failover.key] = self.failover.values[self.failover.index];
					options[self.failover.key] = self.settings[self.failover.key];

					return exec(options, data, callback);
				}
			}

			self.failover.count = 0;
			return callback(err, null);
		});

		// timeout the connection
		if (options.timeout) {
			req.setTimeout(options.timeout, function() {
				req.abort();
			});
		}

		if (data) {
			req.write(data);
		}

		req.end();

		return req;
	}

	/*
		Effectively merges request options with preconfigured
		information. Priority is given to the input options...

		This could get wonky if a client thinks to encapsulate
		settings for the server within a server sub-document of
		the options document.

		i.e.

		// this will override base config.host
		options.host = '127.0.0.1'

		// this will result in config.server being set... host
		// will not effectively be overriden for the request
		options.server.host = '127.0.0.1'
	*/
	self.getRequestOptions = function (options) {
		var returnOptions = {};

		Object.keys(self.settings).forEach(function (field) {
			returnOptions[field] = self.settings[field];
		});

		Object.keys(options).forEach(function (field) {
			returnOptions[field] = options[field];
		});

		// ensure default timeout is applied if one is not supplied
		if (typeof returnOptions.timeout === 'undefined') {
			returnOptions.timeout = DEFAULT_TIMEOUT;
		}

		// create `path` from pathname and query.
		returnOptions.path = returnOptions.pathname;
		if (returnOptions.query && Object.keys(returnOptions.query).length) {
			// fix for #48 (arrays in querystring are properly serialized)
			Object.keys(returnOptions.query).forEach(function (param) {
				if (Array.isArray(returnOptions.query[param]) && returnOptions.query[param].length > 1) {
					returnOptions.query[param] = returnOptions.query[param].join(',');
				}
			});

			returnOptions.path += '?' + qs.stringify(returnOptions.query);
		}

		return returnOptions;
	};

	/*
		Issues a DELETE request with data (if supplied) to the server

		Disclaimer: It's not a common practice to pass POST
		data via the DELETE method. This, however, is how the
		ES API operates:

		http://www.elasticsearch.org/guide/reference/api/delete-by-query/
	*/
	self.delete = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'DELETE';
		return exec(options, data, callback);
	};

	/*
		Issues a GET request with data (if supplied) to the server

		Disclaimer: It's not a common practice to pass POST
		data via the GET method. This, however, is how the
		ES API operates:

		http://www.elasticsearch.org/guide/reference/api/search/
		http://www.elasticsearch.org/guide/reference/api/multi-get/
		http://www.elasticsearch.org/guide/reference/api/multi-search/
		http://www.elasticsearch.org/guide/reference/api/percolate/
		http://www.elasticsearch.org/guide/reference/api/validate/
	*/
	self.get = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'GET';
		return exec(options, data, callback);
	};

	/*
		Issues a HEAD request with data (if supplied) to the server

		Disclaimer: It's not a common practice to pass POST
		data via the HEAD method.

		It's in here, however, because ES does this for other
		methods (i.e. GET and DELETE)... there is no immediate
		need for this.
	*/
	self.head = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'HEAD';
		return exec(options, data, callback);
	};

	/*
		Issues a POST request with data (if supplied) to the server
	*/
	self.post = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'POST';
		return exec(options, data, callback);
	};

	/*
		Issues a PUT request with data (if supplied) to the server
	*/
	self.put = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'PUT';
		return exec(options, data, callback);
	};

	return self;
};
