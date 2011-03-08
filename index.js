var elasticsearch = require('./lib/elasticsearch'),
    cluster = require('./lib/cluster'),
    utils = require('./lib/utils'),
    exports = module.exports;

exports.createClient = function() {
    return new elasticsearch(arguments);
}
exports.cluster = cluster;
