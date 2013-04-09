var common = require('./common');
var test = common.test;
var esc = new common.elasticsearch.Cluster();
var esi = new common.elasticsearch.Index({name: common.INDEX});

test('cluster status', function (t) {
  t.plan(2);
  esc.status(function (err, res) {
    t.error(err, 'no error on status');
    t.ok(res.ok, 'status is ok');
  });
});

test('cluster health', function (t) {
  t.plan(3);
  esc.health({}, function (err, res) {
    t.error(err, 'no error on health');
    t.ok(res.status, 'health status is ok');
    t.ok(res.cluster_name, 'health returns cluster name');
  });
});

test('cluster delete indices', function (t) {
  t.plan(3);
  // Create index, ignoring errors if it exists already
  esi.create(function () {
    esc.deleteIndices(function (err, res) {
      t.error(err, 'no error on indices deletion');
      t.ok(res.success, 'indices deleted successfully');
      t.equal(res.indices.length, 1, 'only one index');
    });
  });
});
