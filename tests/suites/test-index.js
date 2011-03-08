var sys = require('sys'),
    testCase = require('../utils').indexTestCase;

module.exports = testCase({
    'check index status': function(assert) {
        assert.expect(2);
        this.index.status(function(err, status) {
            assert.ifError(err);
            assert.ok(status.ok);
            assert.done();
        });
    }
});
