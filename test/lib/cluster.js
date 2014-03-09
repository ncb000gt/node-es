var clusterLib = requireWithCoverage('cluster');


describe('API: cluster', function () {
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

	describe('#deleteRiver', function () {
		it('should require name', function (done) {
			cluster.deleteRiver(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should properly reflect method and path when called', function (done) {
			cluster.deleteRiver({ name : 'kitteh' }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('DELETE');
				data.options.path.should.equals('/_river/kitteh');

				done();
			});
		});
	});

	describe('#fieldStats', function () {
		it('should allow field', function (done) {
			var options = {
				field : 'breed'
			};

			cluster.fieldStats(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/stats/indices/fielddata/breed');

				done();
			});
		});

		it('should allow field to an array', function (done) {
			var options = {
				fields : ['breed', 'name'],
				os : true,
				process : true
			};

			cluster.fieldStats(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/stats/indices/fielddata/breed,name?os=true&process=true');

				done();
			});
		});

		it('should require field to be present', function (done) {
			cluster.fieldStats(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});
	});

	describe('#health', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.health({}, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_cluster/health');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.health(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_cluster/health');

				done();
			});
		});
	});

	describe('#hotThreads', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.hotThreads({ nodes : ['superman', 'batman'] }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/superman,batman/hot_threads');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.hotThreads(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/hot_threads');

				done();
			});
		});
	});

	describe('#nodesInfo', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.nodesInfo({}, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.nodesInfo(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes');

				done();
			});
		});

		it('should reflect a single node when requested', function (done) {
			var options = {
				node : 'superman'
			};

			cluster.nodesInfo(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/superman');

				done();
			});
		});

		it('should reflect multiple nodes when requested', function (done) {
			var options = {
				nodes : ['superman', 'batman']
			};

			cluster.nodesInfo(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/superman,batman');

				done();
			});
		});

		it('should support node when indicated in default config', function (done) {
			defaultOptions.node = 'batman';
			cluster.nodesInfo(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/batman');

				delete defaultOptions.node;

				done();
			});
		});

		it('should also support nodes when indicated in default config', function (done) {
			defaultOptions.nodes = ['superman', 'batman'];
			cluster.nodesInfo(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/superman,batman');

				delete defaultOptions.nodes;

				done();
			});
		});
	});

	describe('#nodesStats', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.nodesStats({}, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/stats');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.nodesStats(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/stats');

				done();
			});
		});

		it('should reflect a node when requested', function (done) {
			var options = {
				node : 'superman'
			};

			cluster.nodesStats(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_nodes/superman/stats');

				done();
			});
		});
	});

	describe('#putRiver', function () {
		var meta = {
			type : 'dummy'
		};

		it('should require name', function (done) {
			cluster.putRiver(meta, function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should properly reflect method and path when called', function (done) {
			cluster.putRiver({ name : 'kitteh' }, meta, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('/_river/kitteh/_meta');

				done();
			});
		});
	});

	describe('#reroute', function () {
		var commands = {
			commands : [{
				move : {
					index : 'test',
					shard : 0,
					from_node : 'node1',
					to_node : 'node2'
				}
			}]
		};

		it('should properly reflect method and path when called', function (done) {
			cluster.reroute({ dry_run : true }, commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_cluster/reroute?dry_run=true');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.reroute(commands, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_cluster/reroute');

				done();
			});
		});
	});

	describe('#rivers', function () {
		it('should require name', function (done) {
			cluster.rivers(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should properly reflect method and path when called', function (done) {
			cluster.rivers({ name : 'kitteh' }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_river/kitteh/_meta');

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
				data.options.path.should.equals('/_cluster/settings');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.settings(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_cluster/settings');

				done();
			});
		});
	});

	describe('#shutdown', function () {
		it('should properly reflect method and path when called', function (done) {
			cluster.shutdown({ delay : '10s' }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_cluster/nodes/_shutdown?delay=10s');

				done();
			});
		});

		it('should properly target nodes when specified', function (done) {
			cluster.shutdown({ node : '_master' }, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_cluster/nodes/_master/_shutdown');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.shutdown(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('POST');
				data.options.path.should.equals('/_cluster/nodes/_shutdown');

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
				data.options.path.should.equals('/_cluster/state?filter_nodes=true');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.state(function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('GET');
				data.options.path.should.equals('/_cluster/state');

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
				data.options.path.should.equals('/_cluster/settings');

				done();
			});
		});

		it('options should be optional', function (done) {
			cluster.updateSettings(update, function (err, data) {
				should.not.exist(err);
				should.exist(data);
				data.options.method.should.equals('PUT');
				data.options.path.should.equals('/_cluster/settings');

				done();
			});
		});
	});
});