var lib = require('../../index'),
    sys = require('sys'),
    testCase = require('../utils').testCase;

module.exports = testCase({
    'test client connection': function(assert) {
        assert.expect(1);
        this.client.status(function(err, status) {
            assert.ok(status.ok);
            assert.done();
        });
    },
    'add and get document': function(assert) {
        assert.expect(3);
        var self = this,
            config = {type:'info', id:'1', refresh: true},
            doc = {field1: 'test field', field2: 'second test field'};
        this.client.add(config, doc, function(err, result) {
            assert.ok(result.ok);
            self.client.get(config, function(err, result) {
                assert.ifError(err);
                assert.deepEqual(result._source, doc);
                assert.done();
            });
        });
    },
    'add and find document': function(assert) {
        assert.expect(3);
        var self = this,
            doc = {field1: 'test field', field2: 'second test field'}; 
        this.client.add({type:'info', id:'1', refresh: true}, doc, function(err, result) {
            assert.ok(result.ok);
            self.client.query({query: {field: {field1: "test"}}}, function(err, result) {
                if (err) {
                    assert.fail(err);
                }
                assert.equal(result.hits.total, 1);
                assert.deepEqual(result.hits.hits[0]._source, doc);
                assert.done();
            });
        });
    },
    'add, get and delete a document': function(assert) {
        assert.expect(6);
        var self = this,
            config = {type:'info', id:'1', refresh: true},
            doc = {field1: 'test field', field2: 'second test field'}; 
        this.client.add(config, doc, function(err, result) {
            assert.ifError(err);
            assert.ok(result.ok);
            self.client.get(config, function(err, result) {
                assert.ifError(err);
                assert.deepEqual(result._source, doc);
                self.client.delete(config, function(err, result) {
                    assert.ifError(err);
                    self.client.get(config, function(err, result) {
                        assert.ok(err);
                        assert.done();
                    });
                });
            });
        });
    }
})
