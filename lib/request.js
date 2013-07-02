var
	http = require('http'),
	https = require('https');


/*
	A closure that enables basic configuration of the request
	that will be applied for every operation of the lib.
*/
exports.initialize = function (options, self) {
	'use strict';

	self = self || {};
	self.defaults = options || {};

	/*
		Actually executes a request given the supplied options,
		writing the specified data and returning the result to the
		supplied callback.

		In the event that an exception occurs on the request, the
		Error is captured and returned via the callback.
	*/
	function exec (options, data, callback) {
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

					return callback(null, json);
				});
			});

		req.on('error', function (err) {
			return callback(err, null);
		});

		if (data) {
			if (typeof data !== 'string') {
				data = JSON.stringify(data);
			}

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
	function getRequestOptions (options) {
		var returnOptions = self.defaults;
		Object.keys(options).forEach(function (field) {
			returnOptions[field] = options[field];
		});

		return returnOptions;
	}

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
		return exec(getRequestOptions(options), data, callback);
	};

	/*
		Used to format any options NOT specified in excludes as a
		querystring.

		formatParameters({ test : true, excludeMe : 'yes', other : 'kitteh' }, ['excludeMe']);

		Outputs: 'test=true&other=ktteh'
	*/
	self.formatParameters = function (options, excludes) {
		var params;

		Object.keys(options).forEach(function (key) {
			if (excludes.indexOf(key) === -1) {
				params = (params || '') + key + '=' + options[key] + '&';
				delete options[key];
			}
		});

		return params ? params.substring(0, params.length - 1) : '';
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
		return exec(getRequestOptions(options), data, callback);
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
		return exec(getRequestOptions(options), data, callback);
	};

	/*
		Convenience method used for building path string used
		when issuing the HTTP/HTTPS request. If the resource param
		is undefined, empty or false an empty sting is returned.

		If the input resource string has a value, it is returned
		with a '/' prepend.

		pathAppend('kitteh')

		Outputs: '/kitteh'
	*/
	self.pathAppend = function (resource) {
		if (resource) {
			return '/' + resource;
		}

		return '';
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
		return exec(getRequestOptions(options), data, callback);
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
		return exec(getRequestOptions(options), data, callback);
	};

	return self;
};