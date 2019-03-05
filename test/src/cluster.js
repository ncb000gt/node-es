/* eslint camelcase : 0 */
/* eslint no-magic-numbers : 0 */

import chai from 'chai';
import { Cluster } from '../../src/cluster';
import nock from 'nock';

const should = chai.should();

describe('API: cluster', () => {
	let
		cluster,
		defaultOptions;

	beforeEach(() => {
		defaultOptions = {
			_index : 'dieties',
			_type : 'kitteh',
			auth : '',
			hostname : 'localhost',
			port : 9200,
			rejectUnauthorized : true,
			secure : false
		};

		cluster = new Cluster(defaultOptions);
	});

	describe('#deleteRiver', () => {
		it('should require name', (done) => {
			cluster.deleteRiver((err, data) => {
				should.exist(err);
				err.message.should.equal('name is required');
				should.not.exist(data);

				done();
			});
		});

		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.delete('/_river/kitteh')
				.reply(204);

			await cluster.deleteRiver({ name : 'kitteh' });
		});
	});

	describe('#fieldStats', () => {
		it('should allow a single field', async () => {
			let options = {
				field : 'breed'
			};

			nock('http://localhost:9200')
				.get('/_stats/fielddata?fields=breed')
				.reply(200, options);

			await cluster.fieldStats(options);
		});

		it('should allow field to be an array', async () => {
			let options = {
				fields : ['breed', 'name']
			};

			nock('http://localhost:9200')
				.get('/_stats/fielddata?fields=breed%2Cname')
				.reply(200, options);

			await cluster.fieldStats(options);
		});

		it('should support indices param', (done) => {
			let options = {
				fields : ['breed', 'name'],
				indices : true
			};

			nock('http://localhost:9200')
				.get('/_nodes/stats/indices?fields=breed%2Cname')
				.reply(200, options);

			cluster.fieldStats(options, done);
		});

		it('should require field to be present', (done) => {
			cluster.fieldStats((err, data) => {
				should.exist(err);
				should.not.exist(data);
				err.message.should.equal('fields are required');

				done();
			});
		});
	});

	describe('#health', () => {
		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.get('/_cluster/health')
				.reply(200);

			await cluster.health({});
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.get('/_cluster/health')
				.reply(200);

			await cluster.health();
		});
	});

	describe('#hotThreads', () => {
		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.get('/_nodes/superman,batman/hot_threads')
				.reply(200);

			await cluster.hotThreads({ nodes : ['superman', 'batman'] });
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.get('/_nodes/hot_threads')
				.reply(200);

			await cluster.hotThreads();
		});
	});

	describe('#nodesInfo', () => {
		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.get('/_nodes')
				.reply(200);

			await cluster.nodesInfo({});
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.get('/_nodes')
				.reply(200);

			await cluster.nodesInfo();
		});

		it('should reflect a single node when requested', async () => {
			let options = {
				node : 'superman'
			};

			nock('http://localhost:9200')
				.get('/_nodes/superman')
				.reply(200);

			await cluster.nodesInfo(options);
		});

		it('should reflect multiple nodes when requested', async () => {
			let options = {
				nodes : ['superman', 'batman']
			};

			nock('http://localhost:9200')
				.get('/_nodes/superman,batman')
				.reply(200);

			await cluster.nodesInfo(options);
		});

		it('should support node when indicated in default config', async () => {
			defaultOptions.node = 'batman';

			nock('http://localhost:9200')
				.get('/_nodes/batman')
				.reply(200);

			await cluster.nodesInfo();
		});

		it('should also support nodes when indicated in default config', async () => {
			defaultOptions.nodes = ['superman', 'batman'];

			nock('http://localhost:9200')
				.get('/_nodes/superman,batman')
				.reply(200);

			await cluster.nodesInfo();
		});
	});

	describe('#nodesStats', () => {
		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.get('/_nodes/stats')
				.reply(200);

			await cluster.nodesStats({});
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.get('/_nodes/stats')
				.reply(200);

			await cluster.nodesStats();
		});

		it('should reflect a node when requested', async () => {
			let options = {
				node : 'superman'
			};

			nock('http://localhost:9200')
				.get('/_nodes/superman/stats')
				.reply(200);

			await cluster.nodesStats(options);
		});
	});

	describe('#putRiver', () => {
		let meta = {
			type : 'dummy'
		};

		it('should require name', (done) => {
			cluster.putRiver(meta, (err, data) => {
				should.exist(err);
				should.not.exist(data);
				err.message.should.equal('name is required');

				done();
			});
		});

		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.put('/_river/kitteh/_meta')
				.reply(200);

			await cluster.putRiver({ name : 'kitteh' }, meta);
		});
	});

	describe('#reroute', () => {
		let commands = {
			commands : [{
				move : {
					'from_node' : 'node1',
					index : 'test',
					shard : 0,
					'to_node' : 'node2'
				}
			}]
		};

		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.post('/_cluster/reroute?dry_run=true')
				.reply(200);

			await cluster.reroute({ dry_run : true }, commands);
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.post('/_cluster/reroute')
				.reply(200);

			await cluster.reroute(commands);
		});
	});

	describe('#rivers', () => {
		it('should require name', (done) => {
			cluster.rivers((err, data) => {
				should.exist(err);
				should.not.exist(data);
				err.message.should.equal('name is required');

				done();
			});
		});

		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.get('/_river/kitteh/_meta')
				.reply(200);

			await cluster.rivers({ name : 'kitteh' });
		});
	});

	describe('#settings', () => {
		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.get('/_cluster/settings')
				.reply(200);

			await cluster.settings({});
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.get('/_cluster/settings')
				.reply(200);

			await cluster.settings();
		});
	});

	describe('#shutdown', () => {
		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.post('/_cluster/nodes/_shutdown?delay=10s')
				.reply(200);

			await cluster.shutdown({ delay : '10s' });
		});

		it('should properly target nodes when specified', async () => {
			nock('http://localhost:9200')
				.post('/_cluster/nodes/master/_shutdown')
				.reply(200);

			await cluster.shutdown({ node : 'master' });
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.post('/_cluster/nodes/_shutdown')
				.reply(200);

			await cluster.shutdown();
		});
	});

	describe('#state', () => {
		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.get('/_cluster/state?filter_nodes=true')
				.reply(200);

			await cluster.state({ filter_nodes : true });
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.get('/_cluster/state')
				.reply(200);

			await cluster.state();
		});
	});

	describe('#updateSettings', () => {
		let update = {
			transient : {
				'discovery.zen.minimum_master_nodes' : 2
			}
		};

		it('should properly reflect method and path when called', async () => {
			nock('http://localhost:9200')
				.put('/_cluster/settings')
				.reply(200);

			await cluster.updateSettings({});
		});

		it('options should be optional', async () => {
			nock('http://localhost:9200')
				.put('/_cluster/settings')
				.reply(200);

			await cluster.updateSettings(update);
		});
	});
});
