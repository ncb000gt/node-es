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
			auth : '',
			hostname : 'localhost',
			index : 'dieties',
			port : 9200,
			rejectUnauthorized : true,
			secure : false,
			type : 'kitteh'
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
			delete defaultOptions.index;
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
			core.delete({ id : 1 }, function (err, data) {
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
			delete defaultOptions.index;
			core.exists({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', function (done) {
			core.exists({ id : 1 }, function (err, data) {
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
			delete defaultOptions.index;
			core.get({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions.type;
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
			core.get({ id : 1 }, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh/1');
				data.options.method.should.equals('GET');

				done();
			});
		});
	});

	describe('#index', function () {
		it('should require index', function (done) {
			delete defaultOptions.index;
			core.index({}, doc, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', function (done) {
			delete defaultOptions.type;
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
			core.index({ id : 1 }, doc, function (err, data) {
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
});
