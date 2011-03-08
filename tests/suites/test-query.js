var es = require('../index'),
    assert = require('assert');

module.exports = {
    'add field': function() {
        var field = {query: 'text'}, name = 'test';
        var def = {query: {field: {'test': field}}};

        assert.deepEqual((new es.query()).addField(name, field).query, def);
    },
    'add fields chained': function() {
        var field1 = {query: 'text'}, name = 'test1',field2 = {query: 'text'}, name2 = 'test2';
        var def = {query: {field: {'test1': field1, 'test2': field2}}};

        var new_query = (new es.query()).addField(name, field1).addField(name2, field2);
        assert.deepEqual(new_query.query, def);
    }
};
