var
  createClient = require('../../'),
  createStack = require('stact');

describe('Functional: cluster', function () {
  var
    index = 'elasticsearch_test_functional_cluster_' + Date.now(),
    client;

  before(function (done) {
    client = createClient({_index: index});
    client.indices.createIndex(done);
  });

  after(function (done) {
    client.indices.deleteIndex(done);
  });


  describe('#deleteRiver', function () {
    it('works');
  });

  describe('#fieldStats', function () {
    it('works');
  });

  describe('#health', function () {
    it('should be able to get the cluster health', function (done) {
      client.cluster.health({wait_for_status: 'yellow'}, function (err, result) {
        assert.ifError(err);
        assert.equal(result.status, 'yellow');
        done();
      });
    });
  });

  describe('#hotThreads', function () {
    it('works');
  });

  describe('#nodesInfo', function () {
    it('works');
  });

  describe('#nodesStats', function () {
    it('works');
  });

  describe('#putRiver', function () {
    it('works');
  });

  describe('#reroute', function () {
    it('works');
  });

  describe('#rivers', function () {
    it('works');
  });

  describe('#settings', function () {
    it('works');
  });

  describe('#shutdown', function () {
    it('works');
  });

  describe('#state', function () {
    it('works');
  });

  describe('#updateSettings', function () {
    it('works');
  });
});
