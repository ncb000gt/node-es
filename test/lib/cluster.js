var clusterLib = requireWithCoverage('cluster');


describe('cluster', function () {
	var
		cluster,
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

		cluster = clusterLib(defaultOptions, req);
	});

	describe('#health', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.health({}, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('_cluster/health');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.health(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('_cluster/health');

				done();
			});
		});
	});
});