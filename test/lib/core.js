var coreLib = requireWithCoverage('core');


describe('core', function () {

	var stubMethod = function (method, options, data, callback) {
		options.method = method;
		if (returnError) {
			return callback(returnError);
		}

		return callback(null, {
				options : options
			});
	}

	var
		core,
		defaultOptions,
		doc,
		req,
		returnError;

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
			post : function (options, data, callback) {
				stubMethod('POST', options, data, callback);
			},
			put : function (options, data, callback) {
				stubMethod('PUT', options, data, callback);
			}
		};

		returnError = null;

		core = coreLib(defaultOptions, req);
	});

	describe('#index', function () {
		it('should require doc', function (done) {
			core.index({}, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require options.type', function (done) {
			delete defaultOptions.type;
			core.index({}, doc, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require index', function (done) {
			delete defaultOptions.index;
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

			var querystring = '';
			Object.keys(options).forEach(function (key) {
				querystring += key + '=' + options[key] + '&';
			});
			querystring = querystring.substr(0, querystring.length - 1);

			core.index(options, doc, function (err, data) {
				should.not.exist(err);
				data.options.path.should.equals('dieties/kitteh?' + querystring);
				data.options.method.should.equals('POST');

				done();
			});
		});
	});
});
