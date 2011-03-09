var Index = require('../../lib/index'),
    ES = require('../../lib/elasticsearch'),
    lib = require('../../index');

/* Must have some magic in here where the indexes are cleaned out of the system... Not exactly magic, but we have to assume that index deletion works in some sense just like we assume creation works on the other test suites.
 */
module.exports = {
    'check init index': function(assert) {
        assert.expect(2);
        var idx_name = 'test'+(new Date()).getTime();
        var index = new Index({name: idx_name}); 
        assert.equal(index.name, idx_name);
        assert.deepEqual(index.idx_config, {});
        assert.done();
    },
    'check init index invalid': function(assert) {
        assert.expect(1);
        assert.throws(function() {new Index()});
        assert.done();
    },
    'check init index invalid - no name': function(assert) {
        assert.expect(1);
        assert.throws(function() {new Index({})});
        assert.done();
    }
};

