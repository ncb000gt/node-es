import * as utils from './utils';
import { Request } from 'reqlib';

class Core {
	constructor (config, request) {
		this.config = config;
		this.paramExcludes = Object
			.keys(config)
			.concat(['_create', '_id', '_index', '_indices', '_source', '_type', '_types']);
		this.request = request || new Request(config);
	}

	// http://www.elasticsearch.org/guide/reference/api/index_/
	// .add to ease backwards compatibility
	add (options = {}, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		// handle scenarios where options are not provided
		if (!doc) {
			doc = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		// check for _create
		let endpointName = (options.create || options._create) ? '_create' : '';
		endpointName = endpointName || '_doc';

		let index = utils.getIndexSyntax(options, this.config);
		options.query = utils.exclude(options, this.paramExcludes);
		options.path = utils.pathAppend(
			index,
			endpointName,
			options._id);

		if (options._id) {
			return this.request.put(options, doc, callback);
		} else {
			return this.request.post(options, doc, callback);
		}
	}

	// http://www.elasticsearch.org/guide/reference/api/bulk/
	// Note: Formats input queries as follows in POST data:
	//
	// { header : {} } \n
	// { data : {} } \n
	// { header : {} } \n
	// { data : {} } \n
	//
	bulk (options = {}, commands, callback) {
		if (!callback && typeof commands === 'function') {
			callback = commands;
			commands = options;
			options = {};
		}

		// handle scenarios where options are not provided
		if (!commands) {
			commands = options;
			options = {};
		}

		if (!Array.isArray(commands)) {
			return utils.promiseRejectOrCallback(
				new Error('commands provided must be in array format'),
				callback);
		}

		let
			index = utils.getIndexSyntax(options, null), // specifically don't want default settings
			serializedCommands = '';
		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_bulk');

		commands.forEach((command) => {
			serializedCommands += JSON.stringify(command) + '\n';
		});

		return this.request.post(options, serializedCommands, callback);
	}

	// convenience method for bulk that specifies index action
	// and automatically creates appropriate action/meta entries
	// for the documents passed
	bulkIndex (options = {}, documents, callback) {
		if (!callback && typeof documents === 'function') {
			callback = documents;
			documents = options;
			options = {};
		}

		// handle scenarios where options are not provided
		if (!documents) {
			documents = options;
			options = {};
		}

		if (!Array.isArray(documents)) {
			return utils.promiseRejectOrCallback(
				new Error('documents provided must be in array format'),
				callback);
		}

		let
			action = {},
			commands = [],
			index = utils.getIndexSyntax(options, this.config);

		documents.forEach((document) => {
			action = {
				index : {
					_index : index
				}
			};

			// fix for issue #28, ability to handle _id property on document
			if (document.hasOwnProperty('_id')) {
				action.index._id = document._id;
				delete document._id;
			}

			commands.push(action);
			commands.push(document);
		});

		return this.bulk(options, commands, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/count/
	count (options = {}, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		if (!callback && !query && typeof options === 'function') {
			callback = options;
			query = null;
			options = {};
		}

		// correct situation if count is called without a query
		if (query && !query.query) {
			options = query;
			query = null;
		}

		// look for scenarios where options are omitted
		if (!query && options.query) {
			query = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);
		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_count');

		if (query) {
			return this.request.post(options, query, callback);
		} else {
			return this.request.get(options, callback);
		}
	}

	// http://www.elasticsearch.org/guide/reference/api/delete/
	delete (options = {}, callback) {
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
			'_doc',
			options._id);

		return this.request.delete(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/delete-by-query/
	deleteByQuery (options = {}, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		// handle scenarios where options are not provided
		if (!query) {
			query = options;
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
			'_query');

		return this.request.delete(options, query, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/explain/
	explain (options = {}, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index', '_id']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		let index = utils.getIndexSyntax(options, this.config);
		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_explain',
			options._id);

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return this.request.post(options, query, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/get/
	get (options = {}, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index', '_id']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		if (Array.isArray(options._id)) {
			let docs = [];

			options._id.forEach((id) => {
				docs.push({
					_id : id
				});
			});

			return this.multiGet(options, docs, callback);
		}

		let
			includeSource = options._source && options._source !== false,
			index = utils.getIndexSyntax(options, this.config);

		options.query = utils.exclude(options, this.paramExcludes);
		options.path = utils.pathAppend(
			index,
			includeSource ? '_source' : '_doc',
			options._id);

		// optionally add source filters if _source is not a boolean value
		if (includeSource && typeof options._source !== 'boolean') {
			options.query._source = options._source;
		}

		return this.request.get(options, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/index_/
	// .add to ease backwards compatibility
	index (...args) {
		return this.add(...args);
	}

	// http://www.elasticsearch.org/guide/reference/api/multi-get/
	multiGet (options = {}, docs, callback) {
		if (!callback && typeof docs === 'function') {
			callback = docs;
			docs = options;
			options = {};
		}

		if (!callback && typeof options === 'function') {
			callback = options;
			docs = null;
			options = {};
		}

		// handle scenarios where options are not provided
		if (!docs && Array.isArray(options)) {
			docs = options;
			options = {};
		}

		let
			missingIndex = false,
			self = this;

		docs.forEach((doc) => {
			doc._index = doc._index || options._index || self.config._index || null;

			if (!doc._index || doc._index === null) {
				missingIndex = true;
				return;
			}
		});

		if (missingIndex) {
			return utils.promiseRejectOrCallback(
				new Error('at least 1 or more docs supplied is missing index'),
				callback);
		}

		options.path = utils.pathAppend('_mget');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return this.request.post(options, { docs }, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/multi-search/
	// Note: Formats input queries as follows in POST data:
	//
	// { query : {} } \n
	// { query : {} } \n
	// { query : {} } \n
	//
	multiSearch (options = {}, queries, callback) {
		if (!callback && typeof queries === 'function') {
			callback = queries;
			queries = options;
			options = {};
		}

		// handle scenarios where options are not provided
		if (!queries && Array.isArray(options)) {
			queries = options;
			options = {};
		}

		if (!Array.isArray(queries)) {
			return utils.promiseRejectOrCallback(
				new Error('queries provided must be in array format'),
				callback);
		}

		let
			index = utils.getIndexSyntax(options, null), // specifically want to exclude defaults
			serializedQueries = '';
		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_msearch');

		queries.forEach((query) => {
			serializedQueries += JSON.stringify(query);
			serializedQueries += '\n';
		});

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return this.request.post(options, serializedQueries, callback);
	}

	query (options = {}, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		// handle scenarios where only the query is provided
		if (!query) {
			query = options;
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
			'_search');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return this.request.post(options, query, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/search/
	// .query to ease backwards compatibility
	search (...args) {
		return this.query(...args);
	}

	// http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-scroll.html
	scroll (options = {}, scrollId, callback) {
		if (!callback && typeof scrollId === 'function') {
			callback = scrollId;
			scrollId = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['scroll']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		options.query = utils.exclude(options, this.paramExcludes);
		options.path = utils.pathAppend('_search/scroll');

		// re-map to payload expected by ES6
		if (typeof scrollId === 'string') {
			scrollId = {
				scroll : options.scroll,
				'scroll_id' : scrollId
			};
		}

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return this.request.post(options, scrollId, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/search/term-suggest/
	// fix for issue #29
	suggest (options = {}, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		// check for scenarios where options are not provided
		if (!query && options.suggest) {
			query = options;
			options = {};
		}

		let index = utils.getIndexSyntax(options, this.config);
		options.query = utils.exclude(options, this.paramExcludes);

		// NOTE: in 5.0 _suggest deprecated in favor of _search endpoint
		// https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html
		options.path = utils.pathAppend(
			index,
			'_search');

		return this.request.post(options, query, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/update/
	update (options = {}, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		// attempt to account for missing options
		if (!doc && (options.script || options.doc)) {
			doc = options;
			options = {};
		}

		let err = utils.optionsUndefined(options, this.config, ['_index', '_id']);

		if (err) {
			return utils.promiseRejectOrCallback(err, callback);
		}

		// fix for #36 - script can be blank, but not missing
		if ((doc.script === null || typeof doc.script === 'undefined') && !doc.doc) {
			return utils.promiseRejectOrCallback(
				new Error('script or doc is required for update operation'),
				callback);
		}

		let index = utils.getIndexSyntax(options, this.config);
		options.query = utils.exclude(options, this.paramExcludes);

		options.path = utils.pathAppend(
			index,
			'_update',
			options._id);

		return this.request.post(options, doc, callback);
	}

	// http://www.elasticsearch.org/guide/reference/api/validate/
	validate (options = {}, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		// handle scenarios where options are not provided
		if (!query && options.query) {
			query = options;
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
			'_validate/query');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return this.request.post(options, query, callback);
	}
}

module.exports = { Core };
