var
  createClient = require('../../'),
  createStack = require('stact');

describe('Functional: cluster', function () {
  // upping default timeout for Travis-CI builds
  this.timeout(8000);

  var
    index = 'elasticsearch_test_functional_cluster_' + Date.now(),
    client;

  before(function (done) {
    clientOptions._index = index;
    client = createClient(clientOptions);
    client.indices.createIndex(function (err) {
      assert.ifError(err);
      client.cluster.health({wait_for_status: 'yellow'}, function (err, result) {
        assert.ifError(err);
        done();
      });
    });
  });

  after(function (done) {
    client.indices.deleteIndex(done);
  });


  describe('#deleteRiver', function () {
    it('works');
  });

  describe('#fieldStats', function () {
    it('should be able to get field stats', function (done) {
      client.cluster.fieldStats({field: '*'}, function (err, result) {
        assert.ifError(err);
        assert(result.nodes);
        done();
      })
    });
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
    it('should be able to get the hot threads', function (done) {
      client.cluster.hotThreads(function (result) {
        assert(result.message.indexOf('cpu usage') > 0);
        done();
      });
    });
  });

  describe('#nodesInfo', function () {
    it('should be able to get nodes info', function (done) {
      client.cluster.nodesInfo(function (err, result) {
        assert.ifError(err);
        assert(result.nodes);
        done();
      });
    });
  });

  describe('#nodesStats', function () {
    it('should be able to get node stats', function (done) {
      client.cluster.nodesStats(function (err, result) {
        assert.ifError(err);
        assert(result.nodes);
        done();
      });
    });
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
    it('should be able to get the state', function (done) {
      client.cluster.state(function (err, result) {
        assert.ifError(err);
        assert(result.metadata);
        done();
      })
    });
  });

  describe('#updateSettings', function () {
    it('works');
  });
});
