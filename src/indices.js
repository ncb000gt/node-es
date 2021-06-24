import * as utils from './utils';
import { Request } from 'reqlib';

const
	HTTP_STATUS_NOT_FOUND = 404,
	HTTP_STATUS_SUCCESS = 200;

class Indices {
	constructor (config, request) {
		this.config = config;
		this.paramExcludes = Object
			.keys(config)
			.concat(['_index', '_indices', 'alias']);
		this.request = request || new Request(config);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-aliases/
	alias (options = {}, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			(options.alias && index ? index : null),
			(options.alias && index ? '_alias' : '_aliases'),
			(options.alias && index ? options.alias : null));

		if (options.alias && index) {
			return this.request.put(options, data, callback);
		}

		return this.request.post(options, data, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-aliases/
	// Disclaimer: does not currently support pre 0.90 ways of retrieving aliases
	aliases (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options.alias) {
			options.alias = '*';
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_alias',
			options.alias);

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-analyze/
	analyze (options = {}, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_analyze');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return this.request.post(options, data, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-clearcache/
	clearCache (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_cache/clear');

		return this.request.post(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-open-close/
	closeIndex (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.path = utils.pathAppend(index, '_close');

		return this.request.post(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-create-index/
	createIndex (options = {}, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		if (!callback && !data && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.path = utils.pathAppend(index);

		return this.request.put(options, data, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-templates/
	createTemplate (options = {}, template, callback) {
		if (!callback && typeof template === 'function') {
			callback = template;
			template = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['name']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		options.path = utils.pathAppend('_template', options.name);

		return this.request.put(options, template, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-aliases/
	deleteAlias (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index', 'alias']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.path = utils.pathAppend(
			index,
			'_alias',
			options.alias);

		return this.request.delete(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-delete-index/
	deleteIndex (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.path = utils.pathAppend(index);

		return this.request.delete(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-delete-mapping/
	deleteMapping (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);
		options.path = utils.pathAppend(index);

		return this.request.delete(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-templates/
	deleteTemplate (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['name']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		options.path = utils.pathAppend('_template', options.name);

		return this.request.delete(options, callback);
	}

	// https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-exists.html
	// https://www.elastic.co/guide/en/elasticsearch/reference/5.5/indices-types-exists.html
	// Also replicated (somewhat) in core... core.exists is more flexible, however
	exists (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let
			index = utils.getIndexSyntax(options, this.config),
			statusCode;

		options.path = utils.pathAppend(index);

		this.request.once('response', (context) => (statusCode = context.state.statusCode));

		return this.request.head(options, (err, data) => {
			if (err) {
				if (err.statusCode && err.statusCode === HTTP_STATUS_NOT_FOUND) {
					data = {
						exists : false,
						statusCode : err.statusCode
					};

					return utils.promiseResolveOrCallback(data, callback);
				}

				return utils.promiseRejectOrCallback(err, callback);
			}

			// must listen to event...
			data = {
				exists : statusCode === HTTP_STATUS_SUCCESS
			};

			return utils.promiseResolveOrCallback(data, callback);
		});
	}

	flush (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_flush');

		return this.request.post(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-get-mapping/
	mappings (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_mapping');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-open-close/
	openIndex (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_open');

		return this.request.post(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-put-mapping/
	putMapping (options = {}, mapping, callback) {
		if (!callback && typeof mapping === 'function') {
			callback = mapping;
			mapping = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		// prepare mapping if necessary
		let outer = mapping;
		if (outer.properties) {
			outer = { 
				mappings : {
					_doc : mapping
				}
			};
		}

		// prepare URL
		let index = utils.getIndexSyntax(options, this.config);
		options.query = utils.exclude(options, this.paramExcludes);
		options.path = utils.pathAppend(index); 

		return this.request.put(options, outer, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-refresh/
	refresh (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_refresh');

		return this.request.post(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-segments/
	segments (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_segments');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-get-settings/
	settings (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_settings');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-gateway-snapshot/
	snapshot (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.path = utils.pathAppend(index, '_gateway/snapshot');

		return this.request.post(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-stats/
	stats (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);
		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_stats');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-status/
	status (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_status');

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-templates/
	templates (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['name']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		options.query = utils.exclude(options, this.paramExcludes.concat('name'));

		options.path = utils.pathAppend('_template', options.name);

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/admin-indices-update-settings/
	updateSettings (options = {}, settings, callback) {
		if (!callback && typeof settings === 'function') {
			callback = settings;
			settings = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(index, '_settings');

		return this.request.put(options, settings, callback);
	}
}

module.exports = { Indices };
