/* eslint camelcase : 0 */
/* eslint no-magic-numbers : 0 */
/* eslint sort-keys : 0 */
/* eslint sort-vars : 0 */

import chai from 'chai';
import { Indices } from '../../src/indices';
import nock from 'nock';

const should = chai.should();

describe('API: indices', () => {
	let
		indices,
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

		indices = new Indices(defaultOptions);
	});

	describe('#alias', () => {
		let commands;

		beforeEach(() => {
			commands = {
				actions : [{
					add : {
						index : 'kitteh',
						alias : 'cat'
					}
				}]
			};
		});

		it('should have proper path and method for creating aliases', (done) => {
			nock('http://localhost:9200')
				.post('/_aliases')
				.reply(200);

			indices.alias(commands, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper path and method for creating a single alias', (done) => {
			let options = {
				_index : 'kitteh',
				alias : 'cat'
			};

			nock('http://localhost:9200')
				.put('/kitteh/_alias/cat')
				.reply(200);

			indices.alias(options, commands, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#aliases', () => {
		it('should default alias to wildcard if not specified', (done) => {
			nock('http://localhost:9200')
				.get('/dieties/_alias/*')
				.reply(200);

			indices.aliases((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper path and method for retrieving aliases without index', (done) => {
			nock('http://localhost:9200')
				.get('/_alias/cat')
				.reply(200);

			delete defaultOptions._index;
			indices.aliases({ alias : 'cat' }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper path and method for retrieving aliases with indices', (done) => {
			let options = {
				_indices : ['devils', 'dieties'],
				alias : 'cat'
			};

			nock('http://localhost:9200')
				.get('/devils,dieties/_alias/cat')
				.reply(200);

			indices.aliases(options, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#analyze', () => {
		it('should have proper path and method', (done) => {
			let options = {
				tokenizer : 'keyword'
			};

			nock('http://localhost:9200')
				.post('/dieties/_analyze?tokenizer=keyword')
				.reply(200);

			indices.analyze(options, 'kittehs be cray', (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper path and method when index is not specified', (done) => {
			let options = {
				analyzer : 'standard'
			};

			nock('http://localhost:9200')
				.post('/_analyze?analyzer=standard')
				.reply(200);

			delete defaultOptions._index;
			indices.analyze(options, 'kittehs be cray', (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('options should be optional', (done) => {
			nock('http://localhost:9200')
				.post('/dieties/_analyze')
				.reply(200);

			indices.analyze('kittehs be cray', (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#clearCache', () => {
		it('should have proper index and path when index is omitted', (done) => {
			nock('http://localhost:9200')
				.post('/_cache/clear')
				.reply(200);

			delete defaultOptions._index;
			indices.clearCache((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.post('/dieties,devils/_cache/clear?bloom=true')
				.reply(200);

			indices.clearCache({ _indices : ['dieties', 'devils'], bloom : true }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#closeIndex', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.closeIndex((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.post('/kitteh/_close')
				.reply(200);

			indices.closeIndex({ _index : 'kitteh' }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#createIndex', () => {
		let settings = {
			settings : {
				number_of_shards : 3,
				number_of_replicas : 2
			}
		};

		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.createIndex(settings, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.put('/kitteh')
				.reply(200);

			indices.createIndex({ _index : 'kitteh' }, settings, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should allow data and options to be optional', (done) => {
			nock('http://localhost:9200')
				.put('/dieties')
				.reply(200);

			indices.createIndex((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should support creating a mapping during index create', (done) => {
			settings.mappings = {
				kitteh : {
					_source : { enabled : true },
					properties : {
						breed : { type : 'string' },
						name : { type : 'string' }
					}
				}
			};

			nock('http://localhost:9200')
				.put('/dieties')
				.reply(200);

			indices.createIndex(settings, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#createTemplate', () => {
		let template;

		beforeEach(() => {
			template = {
				template : '*',
				settings : {
					number_of_shards : 3,
					number_of_replicas : 2
				}
			};
		});

		it('should require name', (done) => {
			indices.createTemplate(template, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.put('/_template/cat')
				.reply(200);

			indices.createTemplate({ name : 'cat' }, template, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#deleteAlias', () => {
		it('should require alias', (done) => {
			indices.deleteAlias((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.deleteAlias({ alias : 'cat' }, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper path and method', (done) => {
			let options = {
				_index : 'dieties',
				alias : 'cat'
			};

			nock('http://localhost:9200')
				.delete('/dieties/_alias/cat')
				.reply(200);

			indices.deleteAlias(options, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#deleteIndex', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.deleteIndex((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper path and method', (done) => {
			nock('http://localhost:9200')
				.delete('/dieties')
				.reply(200);

			indices.deleteIndex((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#deleteMapping', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.deleteMapping((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should require type', (done) => {
			delete defaultOptions._type;
			indices.deleteMapping((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path when type is supplied', (done) => {
			nock('http://localhost:9200')
				.delete('/dieties,devils/kitteh')
				.reply(200);

			indices.deleteMapping({ _indices : ['dieties', 'devils'] }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#deleteTemplate', () => {
		it('should require name', (done) => {
			indices.deleteTemplate((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper path and method', (done) => {
			nock('http://localhost:9200')
				.delete('/_template/cat')
				.reply(200);

			indices.deleteTemplate({ name : 'cat' }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#exists', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.exists({}, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path when type is omitted', (done) => {
			nock('http://localhost:9200')
				.head('/dieties')
				.reply(200);

			delete defaultOptions._type;
			indices.exists((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.head('/dieties/_mapping/kitteh,cat')
				.reply(200);

			indices.exists({ _types : ['kitteh', 'cat'] }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#flush', () => {
		it('should have proper index and path when index is omitted', (done) => {
			nock('http://localhost:9200')
				.post('/_flush')
				.reply(200);

			delete defaultOptions._index;
			indices.flush((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.post('/dieties,devils/_flush?refresh=true')
				.reply(200);

			indices.flush({ _indices : ['dieties', 'devils'], refresh : true }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#mappings', () => {
		it('should have proper method and path without index', (done) => {
			nock('http://localhost:9200')
				.get('/_mapping')
				.reply(200);

			delete defaultOptions._index;
			indices.mappings((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.get('/dieties/_mapping')
				.reply(200);

			delete defaultOptions._type;
			indices.mappings((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path when type is supplied', (done) => {
			nock('http://localhost:9200')
				.get('/kitteh/evil,kind/_mapping')
				.reply(200);

			indices.mappings({ _index : 'kitteh', _types : ['evil', 'kind'] }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#openIndex', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.openIndex((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.post('/kitteh/_open')
				.reply(200);

			indices.openIndex({ _index : 'kitteh' }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#putMapping', () => {
		let mapping;

		beforeEach(() => {
			mapping = {
				kitteh : {
					_source : { enabled : true },
					properties : {
						breed : { type : 'string' },
						name : { type : 'string' }
					}
				}
			};
		});

		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.putMapping(mapping, (err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path when type is supplied', (done) => {
			nock('http://localhost:9200')
				.put('/dieties,devils')
				.reply(200);

			indices.putMapping({ _indices : ['dieties', 'devils'] }, mapping, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#refresh', () => {
		it('should have proper index and path when index is omitted', (done) => {
			nock('http://localhost:9200')
				.post('/_refresh')
				.reply(200);

			delete defaultOptions._index;
			indices.refresh((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.post('/dieties,devils/_refresh')
				.reply(200);

			indices.refresh({ _indices : ['dieties', 'devils'] }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#segments', () => {
		it('should have proper path and method when index is omitted', (done) => {
			nock('http://localhost:9200')
				.get('/_segments')
				.reply(200);

			delete defaultOptions._index;
			indices.segments((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper path and method', (done) => {
			nock('http://localhost:9200')
				.get('/dieties/_segments')
				.reply(200);

			indices.segments((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#settings', () => {
		it('should require index', (done) => {
			delete defaultOptions._index;
			indices.settings((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.get('/kitteh/_settings')
				.reply(200);

			indices.settings({ _index : 'kitteh' }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#snapshot', () => {
		it('should have proper index and path when index is omitted', (done) => {
			nock('http://localhost:9200')
				.post('/_gateway/snapshot')
				.reply(200);

			delete defaultOptions._index;
			indices.snapshot((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.post('/dieties,devils/_gateway/snapshot')
				.reply(200);

			indices.snapshot({ _indices : ['dieties', 'devils'], refresh : true }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#stats', () => {
		it('should have proper index and path when index and type are omitted', (done) => {
			nock('http://localhost:9200')
				.get('/_stats')
				.reply(200);

			delete defaultOptions._index;
			delete defaultOptions._type;
			indices.stats((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.get('/dieties,devils/_stats/kitteh?indexing=true&clear=true')
				.reply(200);

			indices.stats({ _indices : ['dieties', 'devils'], indexing : true, clear : true }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#status', () => {
		it('should have proper path and method when index is omitted', (done) => {
			nock('http://localhost:9200')
				.get('/_status')
				.reply(200);

			delete defaultOptions._index;
			indices.status((err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper path and method', (done) => {
			nock('http://localhost:9200')
				.get('/dieties/_status?recovery=true')
				.reply(200);

			indices.status({ recovery : true }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#templates', () => {
		it('should require name', (done) => {
			indices.templates((err, data) => {
				should.exist(err);
				should.not.exist(data);

				done();
			});
		});

		it('should have proper path and method', (done) => {
			nock('http://localhost:9200')
				.get('/_template/cat')
				.reply(200);

			indices.templates({ name : 'cat' }, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});

	describe('#updateSettings', () => {
		let settings;

		beforeEach(() => {
			settings = {
				index : {
					number_of_replicas : 4
				}
			};
		});

		it('should have proper method and path when index is not supplied', (done) => {
			nock('http://localhost:9200')
				.put('/_settings')
				.reply(200);

			delete defaultOptions._index;
			indices.updateSettings(settings, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});

		it('should have proper method and path', (done) => {
			nock('http://localhost:9200')
				.put('/kitteh/_settings')
				.reply(200);

			indices.updateSettings({ _index : 'kitteh' }, settings, (err) => {
				if (err) {
					return done(err);
				}

				done();
			});
		});
	});
});
