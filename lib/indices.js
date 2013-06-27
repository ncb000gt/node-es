var utils = require('./utils');


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['_index', 'alias']);

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

	// does not currently support pre 0.90 ways of retrieving aliases
	self.getAliases = function (options, callback) {
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

	self.getMapping = function (options, callback) {
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

	return self;
};
