var elasticsearch = require('./lib/elasticsearch'),
    cluster = require('./lib/cluster'),
    query = require('./lib/query'),
    utils = require('./lib/utils'),
    exports = module.exports;

exports.createClient = function() {
    return new elasticsearch(arguments);
}
exports.query = query;
exports.cluster = cluster;
