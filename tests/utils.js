var nodeunit = require('nodeunit'),
    sys = require('sys'),
    lib = require('../index'), //library index (more for noding this piece)
    Index = require('../lib/index'), //search index
    exports = module.exports;

function clientTestCase(suite) {
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

    return clientTestCase.super_.call(this, suite);
}

sys.inherits(clientTestCase, nodeunit.testCase);
exports.clientTestCase = clientTestCase;

function indexTestCase(suite) {
    suite.setUp = function(done) {
        var self = this;
        this.idx_name = 'test'+(new Date()).getTime();
        this.index = new Index({name: this.idx_name});
        this.index.create(function(err, res) {
            done();
        });
    }
    suite.tearDown = function(done) {
        this.index.delete(function() {
            //ignore errors here, i don't much care about them as this should all be tested elsewhere.
            done();
        });
    }

    return indexTestCase.super_.call(this, suite);
}

sys.inherits(indexTestCase, nodeunit.testCase);
exports.indexTestCase = indexTestCase;
