function getParameters (options, excludes) {
	'use strict';

	var params;

	Object.keys(options).forEach(function (key) {
		if (excludes.indexOf(key) === -1) {
			params = (params || '') + key + '=' + options[key] + '&';
			delete options[key];
		}
	});

	return params ? params.substring(0, params.length - 1) : '';
}


function pathAppend (resource) {
	'use strict';

	if (resource) {
		return '/' + resource;
	}

	return '';
}


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['id', '_create']);

	self.delete = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.index && !config.index) {
			return callback(new Error('index is required'));
		}

		var
			params = getParameters(options, paramExcludes),
			path = options.index || config.index +
				pathAppend(options.type || config.type) +
				pathAppend(options.id);

		options.path = path + (params ? '?' + params : '');

		return req.delete(options, callback);
	};

	self.exists = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.index && !config.index) {
			return callback(new Error('index is required'));
		}

		var
			params = getParameters(options, paramExcludes),
			path = options.index || config.index +
				pathAppend(options.type || config.type) +
				pathAppend(options.id);

		options.path = path + (params ? '?' + params : '');

		return req.head(options, function (err, data) {
			if (err) {
				return callback(err);
			}

			data.exists = (data ? data.statusCode === 200 : false);
			return callback(null, data);
		});
	};

	self.get = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.index && !config.index) {
			return callback(new Error('index is required'));
		}

		if (!options.type && !config.type) {
			return callback(new Error('type is required'));
		}

		if (!options.id) {
			return callback(new Error('id is required'));
		}

		var
			params = getParameters(options, paramExcludes),
			path = options.index || config.index +
				pathAppend(options.type || config.type) +
				pathAppend(options.id);

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.index = function (options, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		if (!options.index && !config.index) {
			return callback(new Error('index is required'));
		}

		if (!options.type && !config.type) {
			return callback(new Error('type is required'));
		}

		var
			params = getParameters(options, paramExcludes),
			path = options.index || config.index +
				pathAppend(options.type || config.type) +
				pathAppend(options.id) +
				pathAppend(options.create ? '_create' : '');

		options.path = path + (params ? '?' + params : '');

		if (options.id) {
			return req.put(options, doc, callback);
		} else {
			return req.post(options, doc, callback);
		}
	};

	return self;
};