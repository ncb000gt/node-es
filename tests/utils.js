var nodeunit = require('nodeunit'),
    sys = require('sys'),
    lib = require('../index'),
    exports = module.exports;

function testCase(suite) {
    suite.setUp = function(done) {
        var self = this,
            idx_name = 'test'+(new Date()).getTime();
        lib.createClient({index: idx_name}, function(client) {
            self.client = client;
            done();
        });
    }
    suite.tearDown = function(done) {
        this.client.index.delete(function() {
            done();
        });
    }

    return testCase.super_.call(this, suite);
}

sys.inherits(testCase, nodeunit.testCase);
exports.testCase = testCase;
