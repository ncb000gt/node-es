import * as utils from './utils';
import { Request } from 'reqlib';

class Cluster {
	constructor (config, request) {
		this.config = config;
		this.paramExcludes = Object
			.keys(config)
			.concat(['field', 'fields', 'node', 'nodes']);
		this.request = request || new Request(this.config);
	}

	// http://www.elasticsearch.org/guide/reference/river/
	deleteRiver (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.name) {
			return callback(new Error('name is required'));
		}

		options.path = utils.pathAppend('_river', options.name);

		return this.request.delete(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-stats/
	fieldStats (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.field && !options.fields) {
			return callback(new Error('fields are required'));
		}

		let fields = utils.getFieldSyntax(options);

		// specific exclude of indices param for this operation only
		options.query = utils.exclude(options, this.paramExcludes.concat('indices'));
		options.query.fields = fields;

		options.path = utils.pathAppend(
			options.indices ? '_nodes/stats/indices' : '_stats/fielddata');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-health/
	health (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.query = utils.exclude(options, this.paramExcludes);
		options.path = utils.pathAppend('_cluster/health');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-hot-threads/
	// Warning: API is an experiment as documented on ES.org
	hotThreads (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let node = utils.getNodeSyntax(options, this.config);

		options.path = utils.pathAppend('_nodes', node, 'hot_threads');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-info/
	nodesInfo (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let node = utils.getNodeSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend('_nodes', node);

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-stats/
	nodesStats (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let node = utils.getNodeSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend('_nodes', node, 'stats');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/river/
	putRiver (options = {}, meta, callback) {
		if (!callback && typeof meta === 'function') {
			callback = meta;
			meta = options;
			options = {};
		}

		if (!options.name) {
			return callback(new Error('name is required'));
		}

		options.path = utils.pathAppend('_river', options.name, '_meta');

		return this.request.put(options, meta, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-update-reroute/
	reroute (options = {}, commands, callback) {
		if (!callback && typeof commands === 'function') {
			callback = commands;
			commands = options;
			options = {};
		}

		if (!commands && options && options.commands) {
			commands = options;
			options = {};
		}

		options.query = utils.exclude(options, this.paramExcludes);
		options.path = utils.pathAppend('_cluster/reroute');

		return this.request.post(options, commands, callback);
	}

	// http://www.elasticsearch.org/guide/reference/river/
	rivers (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.name) {
			return callback(new Error('name is required'));
		}

		options.path = utils.pathAppend('_river', options.name, '_meta');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-update-settings/
	settings (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.path = utils.pathAppend('_cluster/settings');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-nodes-shutdown/
	shutdown (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let node = utils.getNodeSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend('_cluster', 'nodes', node, '_shutdown');

		return this.request.post(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-state/
	state (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.query = utils.exclude(options, this.paramExcludes);
		options.path = utils.pathAppend('_cluster/state');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-cluster-update-settings/
	updateSettings (options = {}, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		if (!data && options && (options.persistent || options.transient)) {
			data = options;
			options = {};
		}

		options.path = utils.pathAppend('_cluster/settings');

		return this.request.put(options, data, callback);
	}
}

module.exports = { Cluster };