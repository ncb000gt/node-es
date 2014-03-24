var utils = require('./utils');


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['_create', '_id', '_index', '_indices', '_source', '_type', '_types']);

	// http://www.elasticsearch.org/guide/reference/api/bulk/
	// Note: Formats input queries as follows in POST data:
	//
	// { header : {} } \n
	// { data : {} } \n
	// { header : {} } \n
	// { data : {} } \n
	//
	self.bulk = function (options, commands, callback) {
		if (!callback && typeof commands === 'function') {
			callback = commands;
			commands = options;
			options = {};
		}

		if (!Array.isArray(commands)) {
			return callback(new Error('commands provided must be in array format'));
		}

		var
			index = utils.getIndexSyntax(options, null), // specifically don't want default settings
			type = utils.getTypeSyntax(options, null),
			serializedCommands = '';

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			(index ? utils.pathAppend(type) : '') +
			utils.pathAppend('_bulk');

		commands.forEach(function (command) {
			serializedCommands += JSON.stringify(command) + '\n';
		});

		return req.post(options, serializedCommands, callback);
	};

	// convenience method for bulk that specifies index action
	// and automatically creates appropriate action/meta entries
	// for the documents passed
	self.bulkIndex = function (options, documents, callback) {
		if (!callback && typeof documents === 'function') {
			callback = documents;
			documents = options;
			options = {};
		}

		if (!Array.isArray(documents)) {
			return callback(new Error('documents provided must be in array format'));
		}

		var
			action = {},
			commands = [],
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		documents.forEach(function (document) {
			action = {
				index : {
					_index : index,
					_type : type
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

		return self.bulk(options, commands, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/count/
	self.count = function (options, query, callback) {
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

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			(index ? utils.pathAppend(type) : '') +
			utils.pathAppend('_count');

		if (query) {
			return req.post(options, query, callback);
		} else {
			return req.get(options, callback);
		}
	};

	// http://www.elasticsearch.org/guide/reference/api/delete/
	self.delete = function (options, callback) {
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

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend(options._id);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/delete-by-query/
	self.deleteByQuery = function (options, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend('_query');

		return req.delete(options, query, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/get/
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

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend(options._id);

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

	// http://www.elasticsearch.org/guide/reference/api/explain/
	self.explain = function (options, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type', '_id']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend(options._id) +
			utils.pathAppend('_explain');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, query, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/get/
	self.get = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type', '_id']);
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
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend(options._id) +
			(options._source ? utils.pathAppend('_source') : '');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/index_/
	// .add to ease backwards compatibility
	self.index = self.add = function (options, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend(options._id) +
			utils.pathAppend(options.create ? '_create' : '');

		if (options._id) {
			return req.put(options, doc, callback);
		} else {
			return req.post(options, doc, callback);
		}
	};

	// http://www.elasticsearch.org/guide/reference/api/more-like-this/
	self.moreLikeThis = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type', '_id']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend(options._id) +
			utils.pathAppend('_mlt');

		return req.get(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/multi-get/
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

		options.pathname = utils.pathAppend('_mget');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, {docs: docs}, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/multi-search/
	// Note: Formats input queries as follows in POST data:
	//
	// { query : {} } \n
	// { query : {} } \n
	// { query : {} } \n
	//
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
			index = utils.getIndexSyntax(options, null), // specifically want to exclude defaults
			type = utils.getTypeSyntax(options, null),
			serializedQueries = '';

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			(index ? utils.pathAppend(type) : '') +
			utils.pathAppend('_msearch');

		queries.forEach(function (query) {
			serializedQueries += JSON.stringify(query);
			serializedQueries += '\n';
		});

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, serializedQueries, callback);
	};

	// Redesigned in ES 1.0 - modifying for issue #38
	// http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-percolate.html
	self.percolate = function (options, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend('_percolate');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, doc, callback);
	};

	// Redesigned in ES 1.0 - modifying for issue #38
	// http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-percolate.html
	self.registerPercolator = function (options, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_id']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config);

		options.pathname =
			utils.pathAppend(index) +
			utils.pathAppend('.percolator') +
			utils.pathAppend(options._id);

		return req.put(options, query, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/search/
	// .query to ease backwards compatibility
	self.search = self.query = function (options, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend('_search');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, query, callback);
	};

	// http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-scroll.html
	// http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-search-type.html#scan
	self.scroll = function (options, scrollId, callback) {
		if (!callback && typeof scrollId === 'function') {
			callback = scrollId;
			scrollId = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['scroll']);
		if (err) {
			return callback(err);
		}

		options.query = utils.exclude(options, paramExcludes);
		options.pathname = utils.pathAppend('_search/scroll');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, scrollId, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/search/term-suggest/
	// fix for issue #29
	self.suggest = function (options, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend('_suggest');

		return req.post(options, query, callback);
	};

	// Redesigned in ES 1.0 - modifying for issue #38
	// http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-percolate.html
	self.unregisterPercolator = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_id']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname =
			utils.pathAppend(index) +
			utils.pathAppend('.percolator') +
			utils.pathAppend(options._id);

		return req.delete(options, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/update/
	self.update = function (options, doc, callback) {
		if (!callback && typeof doc === 'function') {
			callback = doc;
			doc = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index', '_type', '_id']);
		if (err) {
			return callback(err);
		}

		// fix for #36 - script can be blank, but not missing
		if ((doc.script === null || typeof doc.script === 'undefined') && !doc.doc) {
			return callback(new Error('script or doc is required for update operation'));
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend(options._id) +
			utils.pathAppend('_update');

		return req.post(options, doc, callback);
	};

	// http://www.elasticsearch.org/guide/reference/api/validate/
	self.validate = function (options, query, callback) {
		if (!callback && typeof query === 'function') {
			callback = query;
			query = options;
			options = {};
		}

		var err = utils.optionsUndefined(options, config, ['_index']);
		if (err) {
			return callback(err);
		}

		var
			index = utils.getIndexSyntax(options, config),
			type = utils.getTypeSyntax(options, config);

		options.query = utils.exclude(options, paramExcludes);

		options.pathname = utils.pathAppend(index) +
			utils.pathAppend(type) +
			utils.pathAppend('_validate/query');

		// documentation indicates GET method...
		// sending POST data via GET not typical, using POST instead
		return req.post(options, query, callback);
	};

	return self;
};
