module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	function pathAppend(resource) {
		if (resource) {
			return '/' + resource;
		}

		return '';
	}

	self.index = function(options, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = null;

			return callback(new Error('doc parameter is required'));
		}

		if (!options.index && !config.index) {
			return callback(new Error('index is required'));
		}

		if (!options.type && !config.type) {
			return callback(new Error('options.type is required'));
		}

		var
			path = options.index || config.index +
				pathAppend(options.type || config.type) +
				pathAppend(options.id) +
				pathAppend(options.create ? '_create' : ''),
			query;

		Object.keys(options).forEach(function (key) {
			if (key === 'consistency' ||
				key === 'distributed' ||
				key === 'op_type' ||
				key === 'parent' ||
				key === 'percolate' ||
				key === 'refresh' ||
				key === 'replication' ||
				key === 'routing' ||
				key === 'timeout' ||
				key === 'timestamp' ||
				key === 'ttl' ||
				key === 'version') {
				query = (query || '?') + key + '=' + options[key] + '&';
				delete options[key];
			}
		});

		options.path = path + (query ? query.substring(0, query.length - 1) : '');

		if (options.id) {
			return req.put(options, doc, callback);
		} else {
			return req.post(options, doc, callback);
		}
	};

	return self;
};