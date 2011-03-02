var lib = require('../index'),
    assert = require('assert');

module.exports = {
    'test client connection': function(beforeExit) {
        var n = 0;
        var client = lib.createClient({index:'_all'});
        client.status({}, function(err, status) {
            status = JSON.parse(status.toString());
            assert.ok(status.ok);
            n++;
        });
        beforeExit(function() {
            assert.equal(1, n, 'callbacks');
        });
    },
    'add and find document': function(beforeExit) {
        var n = 0;
        var doc = {field1: 'test field', field2: 'second test field'}; 
        var client = lib.createClient({index:'test'});
        client.add({type:'info', id:'1'}, doc, function(err, result) {
            result = JSON.parse(result.toString());
            assert.ok(result.ok);
            n++;
            client.query({query: {field: {field1: 'test'}}}, function(err, result) {
                result = JSON.parse(result.toString());
                assert.equal(result.hits.total, 1);
                assert.deepEqual(result.hits.hits[0]._source, doc);
                n++;
            });
        });
        beforeExit(function() {
            assert.equal(2, n, 'callbacks');
        });
    }
}
