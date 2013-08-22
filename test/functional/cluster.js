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

});
