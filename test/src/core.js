/* eslint camelcase : 0 */
/* eslint no-magic-numbers : 0 */
/* eslint sort-keys : 0 */
/* eslint sort-vars : 0 */

import chai from 'chai';
import { Core } from '../../src/core';
import nock from 'nock';

const should = chai.should();

describe('API: core', () => {
	let
		core,
		defaultOptions,
		doc;

	beforeEach(() => {
		defaultOptions = {
			_index : 'dieties',
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

		core = new Core(defaultOptions);
	});

	describe('_index syntax', () => {
		let query;

		beforeEach(() => {
			query = {
				query : {
					breed : 'manx'
				}
			};
		});

		it('should favor _indices over _index', () => {
			let options = {
				_indices : ['dieties', 'hellions']
			};

			nock('http://localhost:9200')
				.post('/dieties,hellions/_search')
				.reply(200);

			return core.search(options, query);
		});

		it('should favor _indices over _index in defaultConfig if supplied', async () => {
			nock('http://localhost:9200')
				.post('/dieties,hellions/_search')
				.reply(200);

			defaultOptions._indices = ['dieties', 'hellions'];
			await core.search(query);
		});

		it('should properly handle when _source is not a boolean', async () => {
			nock('http://localhost:9200')
				.get('/dieties/_source/1?_source=name%2Cbreed')
				.reply(200);

			await core.get({ '_id' : 1, '_source' : ['name', 'breed'] });
		});

		it('should properly handle _index override', async () => {
			nock('http://localhost:9200')
				.get('/non-dieties/_count')
				.reply(200);

			await core.count({ '_index' : 'non-dieties' });
		});
	});

	describe('#add', () => {
		it('should do what .index does (backwards compat check)', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_doc')
				.reply(200);

			await core.add(doc);
		});
	});

	describe('#bulk', () => {
		let commands;

		beforeEach(() => {
			commands = [
				{ index : { _index : 'dieties' } },
				{ name : 'hamish', breed : 'manx', color : 'tortoise' },
				{ index : { _index : 'dieties' } },
				{ name : 'dugald', breed : 'siamese', color : 'white' },
				{ index : { _index : 'dieties' } },
				{ name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
			];
		});

		it('should allow options to be optional', async () => {
			nock('http://localhost:9200')
				.post('/_bulk')
				.reply(200);

			await core.bulk(commands);
		});

		it('should require commands to be an array', (done) => {
			core
				.bulk(commands[0])
				.then(() => done(new Error('should require commands to be an Array')))
				.catch((ex) => {
					should.exist(ex);
					ex.message.should.equal('commands provided must be in array format');

					return done();
				});
		});

		it('should only apply index to url with passed with options', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_bulk')
				.reply(200);

			await core.bulk({ _index : 'dieties' }, commands);
		});

		it('should properly format out as newline delimited text', async () => {
			let requestBody;

			// capture the body submitted
			core.request.on('request', (context) => {
				requestBody = context.state.data;
			});

			nock('http://localhost:9200')
				.post('/_bulk')
				.reply(200);

			await core.bulk(commands);

			should.exist(requestBody);
			requestBody.match(/\n/g).should.have.length(6);
		});
	});

	describe('#bulkIndex', () => {
		let documents;

		beforeEach(() => {
			documents = [
				{ name : 'hamish', breed : 'manx', color : 'tortoise' },
				{ name : 'dugald', breed : 'siamese', color : 'white' },
				{ name : 'keelin', breed : 'domestic long-hair', color : 'russian blue' }
			];
		});

		it('should allow options to be optional', (done) => {
			nock('http://localhost:9200')
				.post('/_bulk')
				.reply(200);

			core.bulkIndex(documents, done);
		});

		it('should require documents to be an Array', () => {
			return core
				.bulkIndex(documents[0])
				.then(() => Promise.reject(new Error('should require documents to be an Array')))
				.catch((err) => {
					err.message.should.equal('documents provided must be in array format');
				});
		});

		it('should properly format out as newline delimited text', async () => {
			let requestBody;

			// capture the body submitted
			core.request.on('request', (context) => {
				requestBody = context.state.data;
			});

			nock('http://localhost:9200')
				.post('/_bulk')
				.reply(200);

			await core.bulk(documents);

			should.exist(requestBody);
			requestBody.match(/\n/g).should.have.length(3);
		});

		it('should properly handle _id supplied with documents', async () => {
			// add an _id to each document
			for (let i = 0; i < documents.length; i++) {
				documents[i]._id = i;
			}

			let requestBody;

			// capture the body submitted
			core.request.on('request', (context) => {
				requestBody = context.state.data;
			});

			nock('http://localhost:9200')
				.post('/_bulk')
				.reply(200);

			await core.bulk(documents);

			should.exist(requestBody);
			requestBody.match(/_id/g).should.have.length(3);
		});
	});

	describe('#count', () => {
		let query;

		beforeEach(() => {
			query = {
				query : {
					breed : 'manx'
				}
			};
		});

		it('should allow options to be optional', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_count')
				.reply(200);

			await core.count({}, query);
		});

		it('should allow count without index', async () => {
			nock('http://localhost:9200')
				.post('/_count')
				.reply(200);

			delete defaultOptions._index;

			await core.count({}, query);
		});

		it('should allow count without query', async () => {
			nock('http://localhost:9200')
				.get('/_count')
				.reply(200);

			delete defaultOptions._index;

			await core.count();
		});
	});

	describe('#delete', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			core.delete({}, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', async () => {
			nock('http://localhost:9200')
				.delete('/dieties/_doc')
				.reply(200);

			await core.delete({});
		});

		it('should have correct path and method when id is supplied', async () => {
			nock('http://localhost:9200')
				.delete('/dieties/_doc/1')
				.reply(200);

			await core.delete({ _id : 1 });
		});

		it('should treat options as optional', async () => {
			nock('http://localhost:9200')
				.delete('/dieties/_doc')
				.reply(200);

			await core.delete();
		});
	});

	describe('#deleteByQuery', () => {
		let query;

		beforeEach(() => {
			query = {
				query : {
					term : { tag : 'indoor' }
				}
			};
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			core.deleteByQuery({}, query, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', async () => {
			nock('http://localhost:9200')
				.delete('/dieties/_query')
				.reply(200);

			await core.deleteByQuery(query);
		});
	});

	describe('#explain', () => {
		let query;

		beforeEach(() => {
			query = {
				query : {
					field : {
						breed : 'manx'
					}
				}
			};
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			core.explain({}, query, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require id', (done) => {
			core.explain(query, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_explain/1')
				.reply(200);

			await core.explain({ _id : 1 }, query);
		});
	});

	describe('#get', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			core.get({}, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require id', (done) => {
			core.get((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', (done) => {
			nock('http://localhost:9200')
				.get('/dieties/_doc/1')
				.reply(200);

			core.get({ _id : 1 }, (err) => {
				should.not.exist(err);

				done();
			});
		});

		// not sure I like this behavior... it's not explicit as to the purpose of the method
		it('should make request a multiGet if id is passed as an array', async () => {
			nock('http://localhost:9200')
				.post('/_mget')
				.reply(200);

			await core.get({ _id : [1, 2, 3] });
		});
	});

	describe('#index', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			core.index({}, doc, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_doc')
				.reply(200);

			await core.index({}, doc);
		});

		it('should have correct path and method when id is supplied', async () => {
			nock('http://localhost:9200')
				.put('/dieties/_doc/1')
				.reply(200);

			await core.index({ _id : 1 }, doc);
		});

		it('should correctly append querystring options', async () => {
			nock('http://localhost:9200')
				.post(/\/dieties\/\_doc\?[a-z0-9\&\*\=\_]*/i)
				.reply(200);

			let
				options = {
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
				},
				requestPath;

			core.request.on('request', (context) => {
				requestPath = context.options.path;
			});

			await core.index(options, doc);

			requestPath.should.contain('dieties/_doc?');
			requestPath.should.contain('consistency=quorum');
			requestPath.should.contain('distributed=true');
			requestPath.should.contain('op_type=create');
			requestPath.should.contain('parent=1');
			requestPath.should.contain('percolate=*');
			requestPath.should.contain('refresh=true');
			requestPath.should.contain('replication=async');
			requestPath.should.contain('routing=kimchy');
			requestPath.should.contain('timeout=5m');
			requestPath.should.contain('ttl=1d');
			requestPath.should.contain('version=1');
		});

		it('should support _create as parameter', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_create')
				.reply(200);

			let options = {
				_create : true
			};

			await core.index(options, doc);
		});

		it('should treat options as optional', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_doc')
				.reply(200);

			await core.index(doc);
		});
	});

	describe('#multiGet', () => {
		let docs;

		beforeEach(() => {
			docs = [{
				_id : 1,
				_index : 'testIndex'
			}, {
				_id : 2,
				_index : 'testIndex'
			}, {
				_id : 3,
				_index : 'testIndex'
			}];
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			delete docs[0]._index;
			core.multiGet(docs, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', async () => {
			let requestBody;

			nock('http://localhost:9200')
				.post('/_mget')
				.reply(200, (uri, body) => {
					requestBody = body;

					return;
				});

			await core.multiGet(docs);

			requestBody.docs[0]._index.should.equals('testIndex');
			requestBody.docs[1]._index.should.equals('testIndex');
			requestBody.docs[2]._index.should.equals('testIndex');
		});

		it('should have correct index when omitted', async () => {
			let requestBody;

			nock('http://localhost:9200')
				.post('/_mget')
				.reply(200, (uri, body) => {
					requestBody = body;

					return;
				});

			delete docs[0]._index;
			delete docs[1]._index;
			delete docs[2]._index;

			await core.multiGet(docs);

			requestBody.docs[0]._index.should.equals('dieties');
			requestBody.docs[1]._index.should.equals('dieties');
			requestBody.docs[2]._index.should.equals('dieties');
		});
	});

	describe('#multiSearch', () => {
		let queries;

		beforeEach(() => {
			queries = [
				{},
				{ query : { match_all : {} }, from : 0, size : 100 },
				{ search_type : 'count' },
				{ query : { field : { breed : 'manx' } } }
			];
		});

		it('should allow options to be optional', (done) => {
			nock('http://localhost:9200')
				.post('/_msearch')
				.reply(200);

			core.multiSearch(queries, done);
		});

		it('should require queries to be an array', (done) => {
			core.multiSearch(queries[0], (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should only apply index to url with passed with options', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_msearch')
				.reply(200);

			await core.multiSearch({ _index : 'dieties' }, queries);
		});

		it('should properly format out as newline delimited text', async () => {
			nock('http://localhost:9200')
				.post('/_msearch')
				.reply(200);

			let requestData;

			core.request.on('request', (context) => {
				requestData = context.state.data;
			});

			await core.multiSearch(queries);

			requestData.match(/\n/g).should.have.length(4);
		});
	});

	describe('#query', () => {
		let query;

		beforeEach(() => {
			query = {
				query : {
					breed : 'manx'
				}
			};
		});

		it('should do what .search does (backwards compat check)', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_search')
				.reply(200);

			await core.query(query);
		});
	});

	describe('#search', () => {
		let query;

		beforeEach(() => {
			query = {
				query : {
					breed : 'manx'
				}
			};
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			core.search({}, query, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should allow options to be optional', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_search')
				.reply(200);

			await core.search({}, query);
		});
	});

	describe('#scroll', () => {
		let scroll_id;

		beforeEach(() => {
			scroll_id = 'test scroll value';
		});

		it('should require scroll', (done) => {
			delete defaultOptions._index;
			core.scroll({}, scroll_id, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should properly request scroll', async () => {
			nock('http://localhost:9200')
				.post('/_search/scroll?scroll=10m')
				.reply(200);

			await core.scroll({ scroll : '10m' }, scroll_id);
		});
	});

	describe('#suggest', () => {
		let query;

		beforeEach(() => {
			query = {
				suggest : {
					'my-suggestion' : {
						text : 'manx',
						term : {
							field : 'breed'
						}
					}
				}
			};
		});

		it('should allow request without index', (done) => {
			nock('http://localhost:9200')
				.post('/_search')
				.reply(200);

			delete defaultOptions._index;

			core.suggest({}, query, done);
		});

		it('should allow options to be optional', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_search')
				.reply(200);

			await core.suggest(query);
		});
	});

	describe('#update', () => {
		let
			doc1,
			doc2;

		beforeEach(() => {
			doc1 = {
				script : 'ctx._source.field1 = updateData',
				params : {
					updateData : 'testing'
				}
			};

			doc2 = {
				doc : {
					field1 : 'new value'
				}
			};
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			core.update({ _id : 1 }, doc1, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it ('should require id', (done) => {
			core.update(doc1, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it ('should require script or doc', (done) => {
			delete doc1.script;
			core.update({ _id : 1 }, doc1, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				doc1.script = 'ctx._source.field1 = updateData';

				done();
			});
		});

		it ('should accept script', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_update/1')
				.reply(200);

			await core.update({ _id : 1 }, doc1);
		});

		it ('should accept blank script', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_update/1')
				.reply(200);

			doc1.script = '';

			await core.update({ _id : 1 }, doc1);
		});

		it ('should accept doc', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_update/2')
				.reply(200);

			await core.update({ _id : 2 }, doc2);
		});
	});

	describe('#validate', () => {
		let query;

		beforeEach(() => {
			query = {
				query : {
					breed : 'manx'
				}
			};
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			core.validate({}, query, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should allow options to be optional', (done) => {
			nock('http://localhost:9200')
				.post('/dieties/_validate/query')
				.reply(200);

			core.validate({}, query, done);
		});
	});
});
