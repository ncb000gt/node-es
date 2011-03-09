var testCase = require('../utils').indexTestCase;

module.exports = testCase({
    'check index status': function(assert) {
        assert.expect(2);
        this.index.status(function(err, status) {
            assert.ifError(err);
            assert.ok(status.ok);
            assert.done();
        });
    },
    'delete index': function(assert) {
        assert.expect(4);
        var self = this;
        this.index.delete(function(err, status) {
            assert.ifError(err);
            assert.deepEqual(status, {ok: true, acknowledged: true});
            self.index.status(function(err, status) {
                assert.ok(err);
                assert.deepEqual(err, {"error":"IndexMissingException[["+self.idx_name+"] missing]", "status":404});
                assert.done();
            });
        });
    },
    'refresh index': function(assert) {
        assert.expect(2);
        this.index.refresh(function(err, status) {
            assert.ifError(err);
            assert.ok(status.ok);
            assert.done();
        });
    }
});
