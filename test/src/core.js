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

		core = new Core(defaultOptions);
	});

	describe('_index and _type syntax', () => {
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
				.post('/dieties,hellions/kitteh/_search')
				.reply(200);

			return core.search(options, query);
		});

		it('should favor _types over _type', async () => {
			let options = {
				_types : ['kitteh', 'squirrel']
			};

			nock('http://localhost:9200')
				.post('/dieties/kitteh,squirrel/_search')
				.reply(200);

			await core.search(options, query);
		});

		it('should favor _indices over _index in defaultConfig if supplied', async () => {
			nock('http://localhost:9200')
				.post('/dieties,hellions/kitteh/_search')
				.reply(200);

			defaultOptions._indices = ['dieties', 'hellions'];
			await core.search(query);
		});

		it('should favor _types over _type in defaultConfig if supplied', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh,squirrel/_search')
				.reply(200);

			defaultOptions._types = ['kitteh', 'squirrel'];
			await core.search(query);
		});

		it('should allow _types and _indices when requiring _type and _index', async () => {
			nock('http://localhost:9200')
				.get('/dieties/kitteh,squirrel/1/_source')
				.reply(200);

			core.get({ '_id' : 1, '_types' : ['kitteh', 'squirrel'], '_source' : true });
		});

		it('should properly handle when _source is not a boolean', async () => {
			nock('http://localhost:9200')
				.get('/dieties/kitteh/1/_source?_source=name%2Cbreed')
				.reply(200);

			await core.get({ '_id' : 1, '_type' : 'kitteh', '_source' : ['name', 'breed'] });
		});

		it('should properly handle _index and _type override', async () => {
			nock('http://localhost:9200')
				.get('/non-dieties/dogs/_count')
				.reply(200);

			await core.count({ '_index' : 'non-dieties', '_type' : 'dogs' });
		});
	});

	describe('#add', () => {
		it('should do what .index does (backwards compat check)', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh')
				.reply(200);

			await core.add(doc);
		});
	});

	describe('#bulk', () => {
		let commands;

		beforeEach(() => {
			commands = [
				{ index : { _index : 'dieties', _type : 'kitteh' } },
				{ name : 'hamish', breed : 'manx', color : 'tortoise' },
				{ index : { _index : 'dieties', _type : 'kitteh' } },
				{ name : 'dugald', breed : 'siamese', color : 'white' },
				{ index : { _index : 'dieties', _type : 'kitteh' } },
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

		it('should only apply type to url when index and type are passed with options', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh/_bulk')
				.reply(200);

			await core.bulk({ _index : 'dieties', _type : 'kitteh' }, commands);
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

		it('should only apply type to url when index and type are passed with options or config', async () => {
			nock('http://localhost:9200')
				.post('/test/test/_bulk')
				.reply(200);

			await core.bulkIndex({ _index : 'test', _type : 'test' }, documents);
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
				.post('/dieties/kitteh/_count')
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

		it('should allow count without type', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_count')
				.reply(200);

			delete defaultOptions._type;

			await core.count(query);
		});

		it('should allow count without query', async () => {
			nock('http://localhost:9200')
				.get('/_count')
				.reply(200);

			delete defaultOptions._index;
			delete defaultOptions._type;

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
				.delete('/dieties/kitteh')
				.reply(200);

			await core.delete({});
		});

		it('should have correct path and method when id is supplied', async () => {
			nock('http://localhost:9200')
				.delete('/dieties/kitteh/1')
				.reply(200);

			await core.delete({ _id : 1 });
		});

		it('should treat options as optional', async () => {
			nock('http://localhost:9200')
				.delete('/dieties/kitteh')
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
				.delete('/dieties/kitteh/_query')
				.reply(200);

			await core.deleteByQuery(query);
		});

		it('should have correct path and method when type is not supplied', async () => {
			nock('http://localhost:9200')
				.delete('/dieties/_query')
				.reply(200);

			delete defaultOptions._type;
			await core.deleteByQuery(query);
		});
	});

	describe('#exists', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			core.exists({}, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', async () => {
			nock('http://localhost:9200')
				.head('/dieties/kitteh/1')
				.reply(200);

			await core.exists({ _id : 1 });
		});

		it('should allow options to be optional', async () => {
			nock('http://localhost:9200')
				.head('/dieties/kitteh')
				.reply(200);

			await core.exists();
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

		it('should require type', (done) => {
			delete defaultOptions._type;
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
				.post('/dieties/kitteh/1/_explain')
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

		it('should require type', (done) => {
			delete defaultOptions._type;
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
				.get('/dieties/kitteh/1')
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

		it('should require type', (done) => {
			delete defaultOptions._type;
			core.index({}, doc, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh')
				.reply(200);

			await core.index({}, doc);
		});

		it('should have correct path and method when id is supplied', async () => {
			nock('http://localhost:9200')
				.put('/dieties/kitteh/1')
				.reply(200);

			await core.index({ _id : 1 }, doc);
		});

		it('should correctly append querystring options', async () => {
			nock('http://localhost:9200')
				.post(/\/dieties\/kitteh\?[a-z0-9\&\*\=\_]*/i)
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

			requestPath.should.contain('dieties/kitteh?');
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
				.post('/dieties/kitteh/_create')
				.reply(200);

			let options = {
				_create : true
			};

			await core.index(options, doc);
		});

		it('should treat options as optional', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh')
				.reply(200);

			await core.index(doc);
		});
	});

	describe('#moreLikeThis', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			core.moreLikeThis({}, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', (done) => {
			delete defaultOptions._type;
			core.moreLikeThis({}, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require id', (done) => {
			core.moreLikeThis((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have correct path and method when id is supplied', async () => {
			nock('http://localhost:9200')
				.get('/dieties/kitteh/1/_mlt')
				.reply(200);

			await core.moreLikeThis({ _id : 1 });
		});
	});

	describe('#multiGet', () => {
		let docs;

		beforeEach(() => {
			docs = [{
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

		it('should require type', (done) => {
			delete defaultOptions._type;
			delete docs[0]._type;
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
			requestBody.docs[0]._type.should.equals('testType');
			requestBody.docs[1]._index.should.equals('testIndex');
			requestBody.docs[1]._type.should.equals('testType');
			requestBody.docs[2]._index.should.equals('testIndex');
			requestBody.docs[2]._type.should.equals('testType');
		});

		it('should have correct index and type when omitted', async () => {
			let requestBody;

			nock('http://localhost:9200')
				.post('/_mget')
				.reply(200, (uri, body) => {
					requestBody = body;

					return;
				});

			delete docs[0]._index;
			delete docs[0]._type;
			delete docs[1]._index;
			delete docs[1]._type;
			delete docs[2]._index;
			delete docs[2]._type;

			await core.multiGet(docs);

			requestBody.docs[0]._index.should.equals('dieties');
			requestBody.docs[0]._type.should.equals('kitteh');
			requestBody.docs[1]._index.should.equals('dieties');
			requestBody.docs[1]._type.should.equals('kitteh');
			requestBody.docs[2]._index.should.equals('dieties');
			requestBody.docs[2]._type.should.equals('kitteh');
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

		it('should only apply type to url when index and type are passed with options', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh/_msearch')
				.reply(200);

			await core.multiSearch({ _index : 'dieties', _type : 'kitteh' }, queries);
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
				.post('/dieties/kitteh/_search')
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
				.post('/dieties/kitteh/_search')
				.reply(200);

			await core.search({}, query);
		});

		it('should allow search without type', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_search')
				.reply(200);

			delete defaultOptions._type;

			await core.search(query);
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
			delete defaultOptions._type;

			core.suggest({}, query, done);
		});

		it('should allow options to be optional', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh/_search')
				.reply(200);

			await core.suggest(query);
		});

		it('should allow suggest without type', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_search')
				.reply(200);

			delete defaultOptions._type;

			await core.suggest({}, query);
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

		it('should require type', (done) => {
			delete defaultOptions._type;
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
				.post('/dieties/kitteh/1/_update')
				.reply(200);

			await core.update({ _id : 1 }, doc1);
		});

		it ('should accept blank script', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh/1/_update')
				.reply(200);

			doc1.script = '';

			await core.update({ _id : 1 }, doc1);
		});

		it ('should accept doc', async () => {
			nock('http://localhost:9200')
				.post('/dieties/kitteh/2/_update')
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
				.post('/dieties/kitteh/_validate/query')
				.reply(200);

			core.validate({}, query, done);
		});

		it('should allow validate without type', async () => {
			nock('http://localhost:9200')
				.post('/dieties/_validate/query')
				.reply(200);

			delete defaultOptions._type;

			await core.validate(query);
		});
	});
});
