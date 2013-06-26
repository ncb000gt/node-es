var
	http = require('http'),
	https = require('https');


exports.initialize = function (options, self) {
	'use strict';

	self = self || {};
	self.defaults = options || {};

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
			req.write(JSON.stringify(data));
		}

		req.end();

		return req;
	}

	function getRequestOptions (options) {
		var returnOptions = self.defaults;
		Object.keys(options).forEach(function (field) {
			returnOptions[field] = options[field];
		});

		return returnOptions;
	}

	self.delete = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'DELETE';
		return exec(getRequestOptions(options), data, callback);
	};

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

	self.get = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'GET';
		return exec(getRequestOptions(options), data, callback);
	};

	self.head = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'HEAD';
		return exec(getRequestOptions(options), data, callback);
	};

	self.pathAppend = function (resource) {
		if (resource) {
			return '/' + resource;
		}

		return '';
	};

	self.post = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'POST';
		return exec(getRequestOptions(options), data, callback);
	};

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