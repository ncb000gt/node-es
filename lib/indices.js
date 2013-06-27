var utils = require('./utils');


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['_index', '_indices', '_type', '_types', 'alias']);

	self.alias = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = (options.alias && index ? req.pathAppend(index) : '') +
				(options.alias && index ? req.pathAppend('_alias') : req.pathAppend('_aliases')) +
				(options.alias && index ? req.pathAppend(options.alias) : '');

		options.path = path + (params ? '?' + params : '');

		if (options.alias && index) {
			return req.put(options, data, callback);
		} else {
			return req.post(options, data, callback);
		}
	};

	// does not currently support pre 0.90 ways of retrieving aliases
	self.aliases = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.alias) {
			return callback(new Error('alias is required'));
		}

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend('_alias') +
				req.pathAppend(options.alias);

		options.path = path;

		return req.get(options, callback);
	};

	self.analyze = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend(index) +
				req.pathAppend('_analyze');

		options.path = path + (params ? '?' + params : '');

		// documentation indicates GET method...
		// sending POST data via GET not typical
		return req.get(options, data, callback);
	};

	self.closeIndex = function (options, callback) {
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
			path = req.pathAppend(index) +
				req.pathAppend('_close');

		options.path = path;

		return req.post(options, callback);
	};

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

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index);

		options.path = path;

		if (data && data.mappings) {
			return req.post(options, data, callback);
		} else {
			return req.put(options, data, callback);
		}
	};

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

		var path = req.pathAppend('_template') +
			req.pathAppend(options.name);

		options.path = path;

		return req.put(options, template, callback);
	};

	self.deleteAlias = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', 'alias']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend('_alias') +
				req.pathAppend(options.alias);

		options.path = path;

		return req.delete(options, callback);
	};

	self.deleteIndex = function (options, callback) {
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
			path = req.pathAppend(index);

		options.path = path;

		return req.delete(options, callback);
	};

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
			type = utils.getTypeSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend(type);

		options.path = path;

		return req.delete(options, callback);
	};

	self.deleteTemplate = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['name']);
		if (err) {
			return callback(err);
		}

		var path = req.pathAppend('_template') +
				req.pathAppend(options.name);

		options.path = path;

		return req.delete(options, callback);
	};

	self.deleteWarmer = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', 'name']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend('_warmer') +
				req.pathAppend(options.name);

		options.path = path;

		return req.delete(options, callback);
	};

	self.flush = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend(index) +
				req.pathAppend('_flush');

		options.path = path + (params ? '?' + params : '');

		return req.post(options, callback);
	};

	self.mappings = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config),
			path = req.pathAppend(index) +
				(index ? req.pathAppend(type) : '') +
				req.pathAppend('_mapping');

		options.path = path;

		return req.get(options, callback);
	};

	self.openIndex = function (options, callback) {
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
			path = req.pathAppend(index) +
				req.pathAppend('_open');

		options.path = path;

		return req.post(options, callback);
	};

	self.optimize = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend(index) +
				req.pathAppend('_optimize');

		options.path = path + (params ? '?' + params : '');

		return req.post(options, callback);
	};

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
			type = utils.getTypeSyntax(options, config),
			path = req.pathAppend(index) +
				(index ? req.pathAppend(type) : '') +
				req.pathAppend('_mapping');

		options.path = path;

		return req.put(options, mapping, callback);
	};

	self.putWarmer = function (options, warmer, callback) {
		if (!callback && typeof warmer === 'function') {
			callback = warmer;
			warmer = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['name', 'name']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend(type) +
				req.pathAppend('_warmer') +
				req.pathAppend(options.name);

		options.path = path;

		return req.put(options, warmer, callback);
	};

	self.refresh = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend('_refresh');

		options.path = path;

		return req.post(options, callback);
	};

	self.segments = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend('_segments');

		options.path = path;

		return req.get(options, callback);
	};

	self.settings = function (options, callback) {
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
			path = req.pathAppend(index) +
				req.pathAppend('_settings');

		options.path = path;

		return req.get(options, callback);
	};

	self.snapshot = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend('_gateway/snapshot');

		options.path = path;

		return req.post(options, callback);
	};

	self.stats = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			type= utils.getTypeSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend(index) +
				req.pathAppend('_stats') +
				req.pathAppend(type);

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.status = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend(index) +
				req.pathAppend('_status');

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.templates = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['name']);
		if (err) {
			return callback(err);
		}

		var path = req.pathAppend('_template') +
			req.pathAppend(options.name);

		options.path = path;

		return req.get(options, callback);
	};

	self.updateSettings = function (options, settings, callback) {
		if (!callback && typeof settings === 'function') {
			callback = settings;
			settings = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			path = req.pathAppend(index) +
				req.pathAppend('_settings');

		options.path = path;

		return req.put(options, settings, callback);
	};

	self.warmers = function (options, callback) {
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
			path = req.pathAppend(index) +
				req.pathAppend('_warmer') +
				req.pathAppend(options.name);

		options.path = path;

		return req.get(options, callback);
	};

	return self;
};
