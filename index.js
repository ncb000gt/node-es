var elasticsearch = require('./lib/elasticsearch'),
    query = require('./lib/query'),
    utils = require('./lib/utils'),
    exports = module.exports;

exports.createClient = function() {
    return new elasticsearch(arguments);
}
exports.deleteAllIndices = utils.deleteAllIndices(this);
exports.query = query;
