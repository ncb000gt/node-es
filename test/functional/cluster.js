/* eslint camelcase : 0 */
/* eslint no-invalid-this : 0 */
/* eslint no-magic-numbers : 0 */
/* eslint sort-keys : 0 */
/* eslint sort-vars : 0 */

import chai from 'chai';
import createClient from '../../src';

const assert = chai.assert;

describe('Functional: cluster', function () {
  // upping default timeout for Travis-CI builds
  this.timeout(8000);

  let
    index = 'elasticsearch_test_functional_cluster_' + Date.now(),
    client,
    clientOptions;

  before(function (done) {
    clientOptions = {};
    clientOptions['_index'] = index;
    client = createClient(clientOptions);
    client.indices.createIndex(function (err) {
      if (err) {
        return done(err);
      }
      client.cluster.health({ 'wait_for_status': 'yellow' }, function (err) {
        if (err) {
          return done(err);
        }
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
      client.cluster.fieldStats({ field: '*' }, function (err, result) {
        if (err) {
          return done(err);
        }
        assert(result.indices);
        done();
      });
    });
  });

  describe('#health', function () {
    it('should be able to get the cluster health', function (done) {
      client.cluster.health({ 'wait_for_status': 'yellow' }, function (err, result) {
        if (err) {
          return done(err);
        }
        assert.equal(result.status, 'yellow');
        done();
      });
    });
  });

  describe('#hotThreads', function () {
    it('should be able to get the hot threads', function (done) {
      client.cluster.hotThreads(function (err, result) {
        if (err) {
          return done(err);
        }
        assert(result);
        done();
      });
    });
  });

  describe('#nodesInfo', function () {
    it('should be able to get nodes info', function (done) {
      client.cluster.nodesInfo(function (err, result) {
        if (err) {
          return done(err);
        }
        assert(result.nodes);
        done();
      });
    });
  });

  describe('#nodesStats', function () {
    it('should be able to get node stats', function (done) {
      client.cluster.nodesStats(function (err, result) {
        if (err) {
          return done(err);
        }
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
        if (err) {
          return done(err);
        }
        assert(result.metadata);
        done();
      });
    });
  });

  describe('#updateSettings', function () {
    it('works');
  });
});
