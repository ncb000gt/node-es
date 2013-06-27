var indicesLib = requireWithCoverage('indices');


describe('indices', function () {
	var
		indices,
		defaultOptions;

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

		requestError = null;

		indices = indicesLib(defaultOptions, req);
	});

	describe('#alias', function () {
		var commands = {
			actions : [{
				add : {
					index : 'kitteh',
					alias : 'cat'
				}
			}]
		};

		it('should have proper path and method for creating aliases', function (done) {
			indices.alias(commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_aliases');

				done();
			});
		});

		it('should have proper path and method for creating a single alias', function (done) {
			var options = {
				_index : 'kitteh',
				alias : 'cat'
			};

			indices.alias(options, commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('/kitteh/_alias/cat');

				done();
			});
		});
	});

	describe('#analyze', function () {
		it('should have proper path and method', function (done) {
			var options = {
				tokenizer : 'keyword'
			};

			indices.analyze(options, 'kittehs be cray', function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/dieties/_analyze?tokenizer=keyword');

				done();
			});
		});

		it('should have proper path and method when index is not specified', function (done) {
			var options = {
				analyzer : 'standard'
			};

			delete defaultOptions._index;
			indices.analyze(options, 'kittehs be cray', function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_analyze?analyzer=standard');

				done();
			});
		});

		it('options should be optional', function (done) {
			indices.analyze('kittehs be cray', function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/dieties/_analyze');

				done();
			});
		});
	});

	describe('#closeIndex', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			indices.closeIndex(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', function (done) {
			indices.closeIndex({ _index : 'kitteh' }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/kitteh/_close');

				done();
			});
		});
	});

	describe('#createIndex', function () {
		var settings = {
			settings : {
				number_of_shards : 3,
				number_of_replicas : 2
			}
		};

		it('should require index', function (done) {
			delete defaultOptions._index;
			indices.createIndex(settings, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', function (done) {
			indices.createIndex({ _index : 'kitteh' }, settings, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('/kitteh');

				done();
			});
		});

		it('should allow data and options to be optional', function (done) {
			indices.createIndex(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('/dieties');

				done();
			});
		});

		it('should support creating a mapping during index create', function (done) {
			settings.mappings = {
				kitteh : {
					_source : { enabled : true },
					properties : {
						breed : { type : 'string' },
						name : { type : 'string' }
					}
				}
			};

			indices.createIndex(settings, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/dieties');

				done();
			});
		});
	});

	describe('#deleteAlias', function () {
		it('should require alias', function (done) {
			indices.deleteAlias(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require index', function (done) {
			delete defaultOptions._index;
			indices.deleteAlias({ alias : 'cat' }, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper path and method', function (done) {
			var options = {
				_index : 'dieties',
				alias : 'cat'
			};

			indices.deleteAlias(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('DELETE');
				data.options.path.should.equals('/dieties/_alias/cat');

				done();
			});
		});
	});

	describe('#deleteAlias', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			indices.deleteIndex(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper path and method', function (done) {
			indices.deleteIndex(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('DELETE');
				data.options.path.should.equals('/dieties');

				done();
			});
		});
	});

	describe('#getAliases', function () {
		it('should require alias to retrieve alias details', function (done) {
			indices.getAliases(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper path and method for retrieving aliases without index', function (done) {
			delete defaultOptions._index;
			indices.getAliases({ alias : 'cat' }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_alias/cat');

				done();
			});
		});

		it('should have proper path and method for retrieving aliases with indices', function (done) {
			var options = {
				_indices : ['devils', 'dieties'],
				alias : 'cat'
			};

			indices.getAliases(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/devils,dieties/_alias/cat');

				done();
			});
		});
	});

	describe('#openIndex', function () {
		it('should require index', function (done) {
			delete defaultOptions._index;
			indices.openIndex(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', function (done) {
			indices.openIndex({ _index : 'kitteh' }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/kitteh/_open');

				done();
			});
		});
	});
});