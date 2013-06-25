var common = require('./common');
var test = common.test;
var es = common.elasticsearch({index: common.INDEX});
var esi = new common.elasticsearch.Index({name: common.INDEX});

var DOC = {
  field1: 'a test field',
  field2: 'another test field'
};

test('stat check', function (t) {
  t.plan(2);
  // Create index, ignoring errors if it already exists
  esi.create(function () {
    es.status(function (err, res) {
      t.error(err, 'no error on status');
      t.ok(res.ok, 'client is ok');
    });
  });
});

test('add and get doc', function (t) {
  t.plan(3);
  es.add({type: 'stereo', id: '1', refresh: true}, DOC, function (err) {
    t.error(err, 'no error on add');
    es.get({type: 'stereo', id: '1'}, function (err, res) {
      t.error(err, 'no error on get');
      t.deepEqual(res._source, DOC, 'got the right doc');
    });
  });
});

test('find doc', function (t) {
  t.plan(3);
  es.query({query: {field: {field1: 'test'}}}, function (err, res) {
    t.error(err, 'no error on query');
    t.equal(res.hits.total, 1, 'only 1 hit');
    t.deepEqual(res.hits.hits[0] && res.hits.hits[0]._source, DOC, 'that\'s our doc');
  });
});

test('get and delete doc', function (t) {
  t.plan(3);
  es.get({type: 'stereo', id: '1'}, function (err, res) {
    t.error(err, 'no error on get');
    es.delete({type: res._type, id: res._id}, function (err, res) {
      t.error(err, 'no error on delete');
      es.get({type: 'stereo', id: '1'}, function (err) {
        t.ok(err, 'no doc left to get');
      });
    });
  });
});
