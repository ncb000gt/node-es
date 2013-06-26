function getFieldSyntax (options) {
	'use strict';

	var syntax = '';

	if (options.fields && Array.isArray(options.fields)) {
		syntax = options.fields.join(',');
	} else if (options.field) {
		syntax = options.field;
	}

	return syntax;
}


function getNodeSyntax (options, config) {
	'use strict';

	var syntax = '';

	if (options.nodes && Array.isArray(options.nodes)) {
		syntax = options.nodes.join(',');
	} else if (options.node) {
		syntax = options.node;
	} else if (config && config.nodes && Array.isArray(config.nodes)) {
		syntax = config.nodes.join(',');
	} else if (config && config.node) {
		syntax = config.node;
	}

	return syntax;
}


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['field', 'fields', 'node', 'nodes']);

	self.fieldStats = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.field && !options.fields) {
			return callback(new Error('field is required'));
		}

		var
			field = getFieldSyntax(options),
			// specific exclude of indices param for this operation only
			params = req.formatParameters(options, paramExcludes.concat(['indices'])),
			path = req.pathAppend(options.indices ? '_stats' : '_nodes/stats/indices') +
				req.pathAppend('fielddata') +
				req.pathAppend(field);

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.health = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend('_cluster/health');

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	// WARNING
	// API is an experiment as documented on ES.org
	self.hotThreads = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			node = getNodeSyntax(options, config),
			path = req.pathAppend('_nodes') +
				req.pathAppend(node) +
				req.pathAppend('hot_threads');

		options.path = path;

		return req.get(options, callback);
	};

	self.nodeInfo = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			node = getNodeSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend('_cluster/nodes') +
				req.pathAppend(node);

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.nodeStats = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			node = getNodeSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend('_cluster/nodes') +
				req.pathAppend(node) +
				req.pathAppend('stats');

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.reroute = function (options, commands, callback) {
		if (!callback && typeof commands === 'function') {
			callback = commands;
			commands = options;
			options = {};
		}

		var
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend('_cluster/reroute');

		options.path = path + (params ? '?' + params : '');

		return req.post(options, commands, callback);
	};

	self.settings = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.path = req.pathAppend('_cluster/settings');

		return req.get(options, callback);
	};

	self.shutdown = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			node = getNodeSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend('_cluster') +
				req.pathAppend('nodes') +
				req.pathAppend(node) +
				req.pathAppend('_shutdown');

		options.path = path + (params ? '?' + params : '');

		return req.post(options, callback);
	};

	self.state = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			params = req.formatParameters(options, paramExcludes),
			path = req.pathAppend('_cluster/state');

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.updateSettings = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		options.path = req.pathAppend('_cluster/settings');

		return req.put(options, data, callback);
	};

	return self;
};
