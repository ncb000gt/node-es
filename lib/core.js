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


function optionsUndefined (options, config, keys) {
	'use strict';

	var error;

	keys.every(function (key) {
		if (!options.hasOwnProperty(key) && !config.hasOwnProperty(key)) {
			error = new Error(key + ' is required');
			return false;
		}

		return true;
	});

	return error || false;
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
		.concat(['_id', '_create']);

	self.delete = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var
			params = getParameters(options, paramExcludes),
			path = options._index || config._index +
				pathAppend(options._type || config._type) +
				pathAppend(options._id);

		options.path = path + (params ? '?' + params : '');

		return req.delete(options, callback);
	};

	self.exists = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var
			params = getParameters(options, paramExcludes),
			path = options._index || config._index +
				pathAppend(options._type || config._type) +
				pathAppend(options._id);

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

		var err = optionsUndefined(options, config, ['_index', '_type', '_id']);
		if (err) {
			return callback(err);
		}

		if (Array.isArray(options._id)) {
			var docs = [];
			options._id.forEach(function (id) {
				docs.push({
					_id : id
				});
			});
			return self.multiGet(options, docs, callback);
		}

		var
			params = getParameters(options, paramExcludes),
			path = options._index || config._index +
				pathAppend(options._type || config._type) +
				pathAppend(options._id);

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.index = function (options, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		var err = optionsUndefined(options, config, ['_index', '_type']);
		if (err) {
			return callback(err);
		}

		var
			params = getParameters(options, paramExcludes),
			path = options._index || config._index +
				pathAppend(options._type || config._type) +
				pathAppend(options._id) +
				pathAppend(options.create ? '_create' : '');

		options.path = path + (params ? '?' + params : '');

		if (options._id) {
			return req.put(options, doc, callback);
		} else {
			return req.post(options, doc, callback);
		}
	};

	self.multiGet = function (options, docs, callback) {
		if (!callback && typeof docs === 'function') {
			callback = docs;
			docs = options;
			options = {};
		}

		var
			missingIndex = false,
			missingType = false;

		docs.every(function (doc) {
			doc._index = doc._index || options._index || config._index || null;
			doc._type = doc._type || options._type || config._type || null;

			if (!doc._index || doc._index === null) {
				missingIndex = true;
				return false;
			}

			if (!doc._type) {
				missingType = true;
				return false;
			}

			return true;
		});

		if (missingIndex) {
			return callback(new Error('at least 1 or more docs supplied is missing index'));
		}

		if (missingType) {
			return callback(new Error('at least 1 or more docs supplied is missing type'));
		}

		options.path = '_mget';

		return req.post(options, docs, callback);
	};

	self.multiSearch = function (options, queries, callback) {
		if (!callback && typeof queries === 'function') {
			callback = queries;
			queries = options;
			options = {};
		}

		if (!Array.isArray(queries)) {
			return callback(new Error('queries provided must be in array format'));
		}

		var
			params = getParameters(options, paramExcludes),
			path = (options._index || '') +
				(options._index ? pathAppend(options._type) : '') +
				(options._index ? pathAppend('_msearch') : '_msearch'),
			serializedQueries = '';

		queries.forEach(function (query) {
			serializedQueries += JSON.stringify(query);
			serializedQueries += '\n';
		});

		options.path = path + (params ? '?' + params : '');

		return req.post(options, serializedQueries, callback);
	};

	self.search = function (options, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		var err = optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var
			params = getParameters(options, paramExcludes),
			path = options._index || config._index +
				pathAppend(options._type || config._type) +
				pathAppend('_search');

		options.path = path + (params ? '?' + params : '');

		return req.post(options, query, callback);
	};

	self.update = function (options, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		var err = optionsUndefined(options, config, ['_index', '_type', '_id']);
		if (err) {
			return callback(err);
		}

		if (!doc.script && !doc.doc) {
			return callback(new Error('script or doc is required for update operation'));
		}

		var
			params = getParameters(options, paramExcludes),
			path = options._index || config._index +
				pathAppend(options._type || config._type) +
				pathAppend(options._id) +
				pathAppend('_update');

		options.path = path + (params ? '?' + params : '');

		return req.post(options, doc, callback);
	};

	return self;
};