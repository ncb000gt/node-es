var coreLib = requireWithCoverage('core');


describe('API: core', function () {
	var
		core,
		defaultOptions,
		doc;

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

		requestError = null;

		core = coreLib(defaultOptions, req);
	});

	describe('_index and _type syntax', function () {
		var query = {
			query : {
				breed : 'manx'
			}
		};

		it('should favor _indices over _index', function (done) {
			var options = {
				_indices : ['dieties', 'hellions']
			}
			core.search(options, query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties,hellions/kitteh/_search');

				done();
			});
		});

		it('should favor _types over _type', function (done) {
			var options = {
				_types : ['kitteh', 'squirrel']
			}
			core.search(options, query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh,squirrel/_search');

				done();
			});
		});

		it('should favor _indices over _index in defaultConfig if supplied', function (done) {
			defaultOptions._indices = ['dieties', 'hellions'];
			core.search(query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties,hellions/kitteh/_search');

				delete defaultOptions._indices;

				done();
			});
		});

		it('should favor _types over _type in defaultConfig if supplied', function (done) {
			defaultOptions._types = ['kitteh', 'squirrel'];
			core.search(query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh,squirrel/_search');

				delete defaultOptions._types;

				done();
			});
		});

		it('should allow _types and _indices when requiring _type and _index', function (done) {
			core.get({ _id : 1, _types : ['kitteh', 'squirrel'], _source : true }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh,squirrel/1/_source');

				done();
			});
		});
	});

	describe('#add', function () {
		it('should do what .index does (backwards compat check)', function (done) {
			core.add(doc, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/kitteh');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#bulk', function () {
		var commands = [
			{ index : { _index : 'dieties', _type : 'kitteh' } },
			{ name : 'hamish', breed : 'manx', color : 'tortoise' },
			{ index : { _index : 'dieties', _type : 'kitteh' } },
			{ name : 'dugald', breed : 'siamese', color : 'white' },
			{ index : { _index : 'dieties', _type : 'kitteh' } },
			{ name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
		];

		it('should allow options to be optional', function (done) {
			core.bulk(commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_bulk');

				done();
			});
		});

		it('should require commands to be an array', function (done) {
			core.bulk(commands[0], function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should only apply index to url with passed with options', function (done) {
			core.bulk({ _index : 'dieties' }, commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/dieties/_bulk');

				done();
			});
		});

		it('should only apply type to url when index and type are passed with options', function (done) {
			core.bulk({ _index : 'dieties', _type : 'kitteh' }, commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/dieties/kitteh/_bulk');

				done();
			});
		});

		it('should properly format out as newline delimited text', function (done) {
			core.bulk(commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.inputData.match(/\n/g).should.have.length(6);

				done();
			});
		});
	});

	describe('#bulkIndex', function () {
		var commands = [
			{ index : { _index : 'dieties', _type : 'kitteh' } },
			{ name : 'hamish', breed : 'manx', color : 'tortoise' },
			{ index : { _index : 'dieties', _type : 'kitteh' } },
			{ name : 'dugald', breed : 'siamese', color : 'white' },
			{ index : { _index : 'dieties', _type : 'kitteh' } },
			{ name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
		];

		var documents = [
			{ name : 'hamish', breed : 'manx', color : 'tortoise' },
			{ name : 'dugald', breed : 'siamese', color : 'white' },
			{ name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
		];

		it('should allow options to be optional', function (done) {
			core.bulkIndex(documents, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_bulk');

				done();
			});
		});

		it('should require documents to be an array', function (done) {
			core.bulkIndex(documents[0], function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should only apply type to url when index and type are passed with options or config', function (done) {
			core.bulkIndex({ _index : 'test', _type : 'test' }, documents, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/test/test/_bulk');

				done();
			});
		});

		it('should properly format out as newline delimited text', function (done) {
			core.bulkIndex(documents, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.inputData.match(/\n/g).should.have.length(6);

				done();
			});
		});

		it('should properly handle _id supplied with documents', function (done) {
			// add an _id to each document
			for (var i = 0; i < documents.length; i++) {
				documents[i]._id = i;
			}

			core.bulkIndex(documents, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.inputData.match(/_id/g).should.have.length(3);

				done();
			});
		});
	});

	describe('#count', function () {
		var query = {
			query : {
				breed : 'manx'
			}
		};

		it('should allow options to be optional', function (done) {
			core.count({}, query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh/_count');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow count without index', function (done) {
			delete defaultOptions._index;
			core.count({}, query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/_count');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow count without type', function (done) {
			delete defaultOptions._type;
			core.count(query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/_count');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow count without query', function (done) {
			delete defaultOptions._index;
			delete defaultOptions._type;
			core.count(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/_count');
				data.options.method.should.equals('GET');

				done();
			});
		});
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
				data.options.path.should.equals('/dieties/kitteh');
				data.options.method.should.equals('DELETE');

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.delete({ _id : 1 }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/kitteh/1');
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

	describe('#deleteByQuery', function () {
		var query = {
			query : {
				term : { tag : 'indoor' }
			}
		};

		it('should require index', function (done) {
			delete defaultOptions._index;
			core.deleteByQuery({}, query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', function (done) {
			core.deleteByQuery(query, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/kitteh/_query');
				data.options.method.should.equals('DELETE');

				done();
			});
		});

		it('should have correct path and method when type is not supplied', function (done) {
			delete defaultOptions._type;
			core.deleteByQuery(query, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/_query');
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
				data.options.path.should.equals('/dieties/kitteh/1');
				data.options.method.should.equals('HEAD');

				done();
			});
		});

		it('should allow options to be optional', function (done) {
			core.exists(function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/kitteh');
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

	describe('#explain', function () {
		var query = {
			query : {
				field : {
					breed : 'manx'
				}
			}
		};

		it('should require index', function (done) {
			delete defaultOptions._index;
			core.explain({}, query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions._type;
			core.explain({}, query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require id', function (done) {
			core.explain(query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.explain({ _id : 1 }, query, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/kitteh/1/_explain');
				data.options.method.should.equals('POST');

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
				data.options.path.should.equals('/dieties/kitteh/1');
				data.options.method.should.equals('GET');

				done();
			});
		});

		// not sure I like this behavior... it's not explicit as to the purpose of the method
		it('should make request a multiGet if id is passed as an array', function (done) {
			core.get({ _id : [1, 2, 3] }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/_mget');
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
				data.options.path.should.equals('/dieties/kitteh');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.index({ _id : 1 }, doc, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/kitteh/1');
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

	describe('#moreLikeThis', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			core.moreLikeThis({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions._type;
			core.moreLikeThis({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require id', function (done) {
			core.moreLikeThis(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.moreLikeThis({ _id : 1 }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/dieties/kitteh/1/_mlt');
				data.options.method.should.equals('GET');

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
				data.options.path.should.equals('/_mget');
				data.options.method.should.equals('POST');
				data.inputData.docs[0]._index.should.equals('testIndex');
				data.inputData.docs[0]._type.should.equals('testType');

				done();
			});
		});

		it('should have correct index and type when omitted', function (done) {
			delete docs[0]._index;
			delete docs[0]._type;
			core.multiGet(docs, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('/_mget');
				data.options.method.should.equals('POST');
				data.inputData.docs[0]._index.should.equals('dieties');
				data.inputData.docs[0]._type.should.equals('kitteh');

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
				data.options.path.should.equals('/_msearch');

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
				data.options.path.should.equals('/dieties/_msearch');

				done();
			});
		});

		it('should only apply type to url when index and type are passed with options', function (done) {
			core.multiSearch({ _index : 'dieties', _type : 'kitteh' }, queries, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/dieties/kitteh/_msearch');

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

	describe('#percolate', function () {
		var doc = {
			doc : {
				breed : 'siamese'
			}
		};

		it('should require index', function (done) {
			delete defaultOptions._index;
			core.percolate(doc, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions._type;
			core.percolate(doc, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should set proper method and url path', function (done) {
			core.percolate(doc, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/dieties/kitteh/_percolate');

				done();
			});
		});
	});

	describe('#query', function () {
		var query = {
			query : {
				breed : 'manx'
			}
		};

		it('should do what .search does (backwards compat check)', function (done) {
			core.query(query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh/_search');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#registerPercolator', function () {
		var query = {
			query : {
				term : {
					name : 'fluffy'
				}
			}
		};

		it('should require index', function (done) {
			delete defaultOptions._index;
			core.registerPercolator(query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require _id', function (done) {
			core.registerPercolator(query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should set proper method and url path', function (done) {
			core.registerPercolator({ _id : 1 }, doc, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('/dieties/.percolator/1');

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
				data.options.path.should.equals('/dieties/kitteh/_search');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow search without type', function (done) {
			delete defaultOptions._type;
			core.search(query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/_search');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#scroll', function () {
		var scroll_id = 'test scroll value'

		it('should require scroll', function (done) {
			delete defaultOptions._index;
			core.scroll({}, scroll_id, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should properly request scroll', function (done) {
			core.scroll({ scroll : '10m'}, scroll_id, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/_search/scroll?scroll=10m');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#suggest', function () {
		var suggest = {
			'my-suggestion' : {
				text : 'manx',
				term : {
					field : 'breed'
				}
			}
		};

		it('should allow request without index', function (done) {
			delete defaultOptions._index;
			delete defaultOptions._type;
			core.suggest({}, suggest, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/_suggest');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow suggest without type', function (done) {
			delete defaultOptions._type;
			core.suggest(suggest, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/_suggest');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow options to be optional', function (done) {
			core.suggest({}, suggest, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh/_suggest');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#unregisterPercolator', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			core.unregisterPercolator(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require _id', function (done) {
			core.unregisterPercolator(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should set proper method and url path', function (done) {
			core.unregisterPercolator({ _id : 1 }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('DELETE');
				data.options.path.should.equals('/dieties/.percolator/1');

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
				data.options.path.should.equals('/dieties/kitteh/1/_update');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it ('should accept blank script', function (done) {
			doc1.script = '';
			core.update({ _id : 1 }, doc1, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh/1/_update');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it ('should accept doc', function (done) {
			core.update({ _id : 2 }, doc2, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh/2/_update');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});

	describe('#validate', function () {
		var query = {
			query : {
				breed : 'manx'
			}
		};

		it('should require index', function (done) {
			delete defaultOptions._index;
			core.validate({}, query, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should allow options to be optional', function (done) {
			core.validate({}, query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/kitteh/_validate/query');
				data.options.method.should.equals('POST');

				done();
			});
		});

		it('should allow validate without type', function (done) {
			delete defaultOptions._type;
			core.validate(query, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.path.should.equals('/dieties/_validate/query');
				data.options.method.should.equals('POST');

				done();
			});
		});
	});
});
