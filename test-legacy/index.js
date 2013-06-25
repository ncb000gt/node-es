var common = require('./common');
var test = common.test;
var esi = new common.elasticsearch.Index({name: common.INDEX});

test('create index', function (t) {
  t.plan(2);
  // Delete first and ignore errors if it doesn't exist
  esi.delete(function () {
    esi.create(function (err, res) {
      t.error(err, 'no error on index create');
      t.ok(res && res.ok, 'create is ok');
    });
  });
});

test('index status', function (t) {
  t.plan(2);
  esi.status(function (err, res) {
    t.error(err, 'no error on status check');
    t.ok(res.ok, 'index is ok');
  });
});

test('delete index', function (t) {
  t.plan(2);
  esi.delete(function (err, res) {
    t.error(err, 'no error on index delete');
    t.ok(res.ok, 'delete response ok');
  });
});
