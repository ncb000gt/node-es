var
  createClient = require('../../'),
  createStack = require('stact');

describe('Functional: indices', function () {
  var
    index = 'elasticsearch_test_functional_' + Date.now(),
    client;

  before(function (done) {
    client = createClient({_index: index});
    client.indices.createIndex(done);
  });

  after(function (done) {
    client.indices.deleteIndex(done);
  });

  describe('#alias', function () {
    it('works');
  });

  describe('#aliases', function () {
    it('works');
  });

  describe('#analyze', function () {
    it('works');
  });

  describe('#clearCache', function () {
    it('works');
  });

  describe('#closeIndex', function () {
    it('works');
  });

  describe('#createIndex', function () {
    it('works');
  });

  describe('#createTemplate', function () {
    it('works');
  });

  describe('#deleteAlias', function () {
    it('works');
  });

  describe('#deleteIndex', function () {
    it('works');
  });

  describe('#deleteMapping', function () {
    it('works');
  });

  describe('#deleteTemplate', function () {
    it('works');
  });

  describe('#deleteWarmer', function () {
    it('works');
  });

  describe('#exists', function () {
    it('works');
  });

  describe('#flush', function () {
    it('works');
  });

  describe('#mappings', function () {
    it('works');
  });

  describe('#openIndex', function () {
    it('works');
  });

  describe('#optimize', function () {
    it('works');
  });

  describe('#putMapping', function () {
    it('works');
  });

  describe('#putWarmer', function () {
    it('works');
  });

  describe('#refresh', function () {
    it('works');
  });

  describe('#segments', function () {
    it('works');
  });

  describe('#settings', function () {
    it('works');
  });

  describe('#snapshot', function () {
    it('works');
  });

  describe('#stats', function () {
    it('works');
  });

  describe('#status', function () {
    it('works');
  });

  describe('#templates', function () {
    it('works');
  });

  describe('#updateSettings', function () {
    it('works');
  });

  describe('#warmers', function () {
    it('works');
  });
});
