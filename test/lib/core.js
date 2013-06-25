var coreLib = requireWithCoverage('core');


describe('core', function () {

	var stubMethod = function (method, options, data, callback) {
		options.method = method;
		if (requestError) {
			return callback(requestError);
		}

		return callback(null, {
				inputData : data,
				options : options
			});
	}

	var
		core,
		defaultOptions,
		doc,
		req,
		requestError;

	beforeEach(function () {
		defaultOptions = {
			_index : 'dieties',
			_type : 'kitteh',
			auth : '',
			hostname : 'localhost',
			port : 9200,
			rejectUnauthorized : true,
			secure : false
		};

		doc = {
			breed : 'manx',
			color : 'tortoise'
		};

		req = {
			delete : function (options, callback) {
				stubMethod('DELETE', options, null, callback);
			},
			get : function (options, callback) {
				stubMethod('GET', options, null, callback);
			},
			head : function (options, callback) {
				stubMethod('HEAD', options, null, callback);
			},
			post : function (options, data, callback) {
				stubMethod('POST', options, data, callback);
			},
			put : function (options, data, callback) {
				stubMethod('PUT', options, data, callback);
			}
		};

		requestError = null;

		core = coreLib(defaultOptions, req);
	});

	describe('#delete', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			core.delete({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', function (done) {
			core.delete({}, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh');
				data.options.method.should.equals('DELETE');

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.delete({ _id : 1 }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh/1');
				data.options.method.should.equals('DELETE');

				done();
			});
		});

		it('should treat options as optional', function (done) {
			core.delete(function(err, data) {
				should.not.exist(err);
				data.options.method.should.equals('DELETE');

				done();
			});
		});
	});

	describe('#exists', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			core.exists({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.exists({ _id : 1 }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh/1');
				data.options.method.should.equals('HEAD');

				done();
			});
		});

		it('should allow options to be optional', function (done) {
			core.exists(function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh');
				data.options.method.should.equals('HEAD');

				done();
			});
		});

		it('should properly return request errors', function (done) {
			requestError = new Error('should return to me');
			core.exists(function (err, data) {
				should.exist(err);
				should.not.exist(data);
				err.should.equals(requestError);

				done();
			});
		});
	});

	describe('#get', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			core.get({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions._type;
			core.get({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require id', function (done) {
			core.get(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.get({ _id : 1 }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh/1');
				data.options.method.should.equals('GET');

				done();
			});
		});

		// not sure I like this behavior... it's not explicit as to the purpose of the method
		it('should make request a multiGet if id is passed as an array', function (done) {
			core.get({ _id : [1, 2, 3] }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('_mget');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#index', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			core.index({}, doc, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions._type;
			core.index({}, doc, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', function (done) {
			core.index({}, doc, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.index({ _id : 1 }, doc, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh/1');
				data.options.method.should.equals('PUT');

				done();
			});
		});

		it('should correctly append querystring options', function (done) {
			var options = {
				consistency : 'quorum',
				distributed : true,
				op_type : 'create',
				parent : 1,
				percolate : '*',
				refresh : true,
				replication : 'async',
				routing : 'kimchy',
				timeout : '5m',
				ttl : '1d',
				version : 1
			};

			core.index(options, doc, function (err, data) {
				should.not.exist(err);
				data.options.path.should.contain('dieties/kitteh?');
				data.options.path.should.contain('consistency=quorum');
				data.options.path.should.contain('distributed=true');
				data.options.path.should.contain('op_type=create');
				data.options.path.should.contain('parent=1');
				data.options.path.should.contain('percolate=*');
				data.options.path.should.contain('refresh=true');
				data.options.path.should.contain('replication=async');
				data.options.path.should.contain('routing=kimchy');
				data.options.path.should.contain('timeout=5m');
				data.options.path.should.contain('ttl=1d');
				data.options.path.should.contain('version=1');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should treat options as optional', function (done) {
			core.index(doc, function(err, data) {
				should.not.exist(err);
				data.options.method.should.equals('POST');
				data.inputData.should.equals(doc);

				done();
			});
		});
	});

	describe('#multiGet', function () {
		var docs = [{
			_id : 1,
			_index : 'testIndex',
			_type : 'testType'
		}, {
			_id : 2,
			_index : 'testIndex',
			_type : 'testType'
		}, {
			_id : 3,
			_index : 'testIndex',
			_type : 'testType'
		}];

		it('should require index', function (done) {
			delete defaultOptions._index;
			delete docs[0]._index;
			core.multiGet(docs, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				docs[0]._index = 'testIndex';

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions._type;
			delete docs[0]._type;
			core.multiGet(docs, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				docs[0]._type = 'testType';

				done();
			});
		});

		it('should have correct path and method', function (done) {
			core.multiGet(docs, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('_mget');
				data.options.method.should.equals('POST');
				data.inputData[0]._index.should.equals('testIndex');
				data.inputData[0]._type.should.equals('testType');

				done();
			});
		});

		it('should have correct index and type when omitted', function (done) {
			delete docs[0]._index;
			delete docs[0]._type;
			core.multiGet(docs, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('_mget');
				data.options.method.should.equals('POST');
				data.inputData[0]._index.should.equals('dieties');
				data.inputData[0]._type.should.equals('kitteh');

				done();
			});
		});
	});

	describe('#multiSearch', function () {
		var queries = [
			{},
			{ query : { match_all : {} }, from : 0, size : 100 },
			{ search_type : 'count' },
			{ query : { field : { breed : 'manx' } } }
		];

		it('should allow options to be optional', function (done) {
			core.multiSearch(queries, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('_msearch');

				done();
			});
		});

		it('should require queries to be an array', function (done) {
			core.multiSearch(queries[0], function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should only apply index to url with passed with options', function (done) {
			core.multiSearch({ _index : 'dieties' }, queries, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('dieties/_msearch');

				done();
			});
		});

		it('should only apply type to url when index and type are passed with options', function (done) {
			core.multiSearch({ _index : 'dieties', _type : 'kitteh' }, queries, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('dieties/kitteh/_msearch');

				done();
			});
		});

		it('should properly format out as newline delimited text', function (done) {
			core.multiSearch(queries, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.inputData.match(/\n/g).should.have.length(4);

				done();
			});
		});
	});

	describe('#search', function () {
		var query = {
			query : {
				breed : 'manx'
			}
		};

		it('should require index', function (done) {
			delete defaultOptions._index;
			core.search({}, query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should allow options to be optional', function (done) {
			core.search({}, query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('dieties/kitteh/_search');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow search without type', function (done) {
			delete defaultOptions._type;
			core.search(query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('dieties/_search');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#update', function () {
		var
			doc1 = {
				script : 'ctx._source.field1 = updateData',
				params : {
					updateData : 'testing'
				}
			},
			doc2 = {
				doc : {
					field1 : 'new value'
				}
			};

		it('should require index', function (done) {
			delete defaultOptions._index;
			core.update({ _id : 1 }, doc1, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions._type;
			core.update({ _id : 1 }, doc1, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it ('should require id', function (done) {
			core.update(doc1, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it ('should require script or doc', function (done) {
			delete doc1.script;
			core.update({ _id : 1 }, doc1, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				doc1.script = 'ctx._source.field1 = updateData';

				done();
			});
		});

		it ('should accept script', function (done) {
			core.update({ _id : 1 }, doc1, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('dieties/kitteh/1/_update');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it ('should accept doc', function (done) {
			core.update({ _id : 2 }, doc2, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('dieties/kitteh/2/_update');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});
});
