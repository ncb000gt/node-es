var utils = require('./utils');


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['_index', '_indices', '_type', '_types', 'alias']);

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-aliases/
	self.alias = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = (options.alias && index ? utils.pathAppend(index) : '') +
			(options.alias && index ? utils.pathAppend('_alias') : utils.pathAppend('_aliases')) +
			(options.alias && index ? utils.pathAppend(options.alias) : '');

		if (options.alias && index) {
			return req.put(options, data, callback);
		} else {
			return req.post(options, data, callback);
		}
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-aliases/
	// Disclaimer: does not currently support pre 0.90 ways of retrieving aliases
	self.aliases = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.alias) {
			options.alias = '*';
		}

		var index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_alias') +
			utils.pathAppend(options.alias);

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-analyze/
	self.analyze = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_analyze');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, data, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-clearcache/
	self.clearCache = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_cache/clear');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-open-close/
	self.closeIndex = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_close');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-create-index/
	self.createIndex = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		if (!callback && !data && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index);

		if (data && data.mappings) {
			return req.post(options, data, callback);
		} else {
			return req.put(options, data, callback);
		}
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-templates/
	self.createTemplate = function (options, template, callback) {
		if (!callback && typeof template === 'function') {
			callback = template;
			template = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['name']);
		if (err) {
			return callback(err);
		}

		options.pathname = utils.pathAppend('_template') +
			utils.pathAppend(options.name);

		return req.put(options, template, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-aliases/
	self.deleteAlias = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', 'alias']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_alias') +
			utils.pathAppend(options.alias);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-delete-index/
	self.deleteIndex = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-delete-mapping/
	self.deleteMapping = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-templates/
	self.deleteTemplate = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['name']);
		if (err) {
			return callback(err);
		}

		options.pathname = utils.pathAppend('_template') +
			utils.pathAppend(options.name);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-warmers/
	self.deleteWarmer = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', 'name']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_warmer') +
			utils.pathAppend(options.name);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-indices-exists/
	// http://www.elasticsearch.org/guide/reference/api/admin-indices-types-exists/
	// Also replicated (somewhat) in core... core.exists is more flexible, however
	self.exists = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type);

		return req.head(options, function (err, data) {
			if (err) {
				if (err.statusCode && err.statusCode === 404) {
					data = {
						exists : false,
						statusCode : err.statusCode
					};

					return callback(null, data);
				}

				return callback(err);
			}

			data.exists = (data ? data.statusCode === 200 : false);
			return callback(null, data);
		});
	};

	self.flush = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_flush');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-get-mapping/
	self.mappings = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			(index ? utils.pathAppend(type) : '') +
			utils.pathAppend('_mapping');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-open-close/
	self.openIndex = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_open');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-optimize/
	self.optimize = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_optimize');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-put-mapping/
	self.putMapping = function (options, mapping, callback) {
		if (!callback && typeof mapping === 'function') {
			callback = mapping;
			mapping = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			(index ? utils.pathAppend(type) : '') +
			utils.pathAppend('_mapping');

		return req.put(options, mapping, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-warmers/
	self.putWarmer = function (options, warmer, callback) {
		if (!callback && typeof warmer === 'function') {
			callback = warmer;
			warmer = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['name']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend('_warmer') +
			utils.pathAppend(options.name);

		return req.put(options, warmer, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-refresh/
	self.refresh = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_refresh');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-segments/
	self.segments = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_segments');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-get-settings/
	self.settings = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_settings');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-gateway-snapshot/
	self.snapshot = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_gateway/snapshot');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-stats/
	self.stats = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_stats') +
			utils.pathAppend(type);

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-status/
	self.status = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_status');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-templates/
	self.templates = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['name']);
		if (err) {
			return callback(err);
		}

		options.pathname = utils.pathAppend('_template') +
			utils.pathAppend(options.name);

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-update-settings/
	self.updateSettings = function (options, settings, callback) {
		if (!callback && typeof settings === 'function') {
			callback = settings;
			settings = options;
			options = {};
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_settings');

		return req.put(options, settings, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-warmers/
	self.warmers = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var index = utils.getIndexSyntax(options, config);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend('_warmer') +
			utils.pathAppend(options.name);

		return req.get(options, callback);
	};

	return self;
};
