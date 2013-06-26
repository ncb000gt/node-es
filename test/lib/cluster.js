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

	describe('#settings', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.settings({}, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('_cluster/settings');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.settings(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('_cluster/settings');

				done();
			});
		});
	});

	describe('#state', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.state({ filter_nodes : true }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('_cluster/state?filter_nodes=true');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.state(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('_cluster/state');

				done();
			});
		});
	});

	describe('#updateSettings', function () {
		var update = {
			transient : {
				'discovery.zen.minimum_master_nodes' : 2
			}
		};

		it('should properly reflect method and path when called', function (done) {
			cluster.updateSettings({}, update, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('_cluster/settings');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.updateSettings(update, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('_cluster/settings');

				done();
			});
		});
	});
});