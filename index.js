var elasticsearch = require('./lib/elasticsearch'),
    query = require('./lib/query')
    exports = module.exports;

exports.createClient = function() {
    return new elasticsearch(arguments);
}
exports.query = query;
