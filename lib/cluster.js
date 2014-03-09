var utils = require('./utils');


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['field', 'fields', 'node', 'nodes']);

	// http://www.elasticsearch.org/guide/reference/river/
	self.deleteRiver = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.name) {
			return callback(new Error('name is required'));
		}

		options.pathname = utils.pathAppend('_river') +
			utils.pathAppend(options.name);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-stats/
	self.fieldStats = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.field && !options.fields) {
			return callback(new Error('field is required'));
		}

		var field = utils.getFieldSyntax(options);

		// specific exclude of indices param for this operation only
		options.query = utils.exclude(options, paramExcludes.concat(['indices']));

		options.pathname = utils.pathAppend(options.indices ? '_stats' : '_nodes/stats/indices') +
			utils.pathAppend('fielddata') +
			utils.pathAppend(field);

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-health/
	self.health = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.query = utils.exclude(options, paramExcludes);
		options.pathname = utils.pathAppend('_cluster/health');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-hot-threads/
	// Warning: API is an experiment as documented on ES.org
	self.hotThreads = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var node = utils.getNodeSyntax(options, config);

		options.pathname = utils.pathAppend('_nodes') +
			utils.pathAppend(node) +
			utils.pathAppend('hot_threads');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-info/
	self.nodesInfo = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var node = utils.getNodeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend('_nodes') +
			utils.pathAppend(node);

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-stats/
	self.nodesStats = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var node = utils.getNodeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend('_nodes') +
			utils.pathAppend(node) +
			utils.pathAppend('stats');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/river/
	self.putRiver = function (options, meta, callback) {
		if (!callback && typeof meta === 'function') {
			callback = meta;
			meta = options;
			options = {};
		}

		if (!options.name) {
			return callback(new Error('name is required'));
		}

		options.pathname = utils.pathAppend('_river') +
			utils.pathAppend(options.name) +
			utils.pathAppend('_meta');

		return req.put(options, meta, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-update-reroute/
	self.reroute = function (options, commands, callback) {
		if (!callback && typeof commands === 'function') {
			callback = commands;
			commands = options;
			options = {};
		}


		options.query = utils.exclude(options, paramExcludes);
		options.pathname = utils.pathAppend('_cluster/reroute');

		return req.post(options, commands, callback);
	};

	// http://www.elasticsearch.org/guide/reference/river/
	self.rivers = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.name) {
			return callback(new Error('name is required'));
		}

		options.pathname = utils.pathAppend('_river') +
			utils.pathAppend(options.name) +
			utils.pathAppend('_meta');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-update-settings/
	self.settings = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.pathname = utils.pathAppend('_cluster/settings');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-shutdown/
	self.shutdown = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var node = utils.getNodeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend('_cluster') +
			utils.pathAppend('nodes') +
			utils.pathAppend(node) +
			utils.pathAppend('_shutdown');

		return req.post(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-state/
	self.state = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.query = utils.exclude(options, paramExcludes);
		options.pathname = utils.pathAppend('_cluster/state');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-update-settings/
	self.updateSettings = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		options.pathname = utils.pathAppend('_cluster/settings');

		return req.put(options, data, callback);
	};

	return self;
};
