var
	http = require('http'),
	https = require('https');

exports.request = function (options, self) {
	'use strict';

	self = self || {};
	self.defaults = options || {};

	function exec (options, data, callback) {
		var req =
			(options.secure ? http : https).request(options, function (res) {
				var
					body = '',
					chunks = [],
					json = {},
					statusCode = res.statusCode;

				res.setEncoding('utf-8');

				res.on('data', function (chunk) {
					chunks.push(chunk);
				});

				res.on('end', function () {
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

		req.on('error', callback);

		if (data) {
			req.write(data);
		}

		req.end();

		return req;
	}

	function getRequestOptions (options) {
		var returnOptions = self.defaults;
		Object.keys(options).forEach(function (field) {
			returnOptions[field] = options[field];
		});
	}

	self.delete = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = null;
		}

		options.method = 'DELETE';
		return exec(getRequestOptions(options), data, callback);
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

	self.post = function (options, data, callback) {
		options.method = 'POST';
		return exec(getRequestOptions(options), data, callback);
	};

	self.put = function (options, data, callback) {
		options.method = 'PUT';
		return exec(getRequestOptions(options), data, callback);
	};

	return self;
};