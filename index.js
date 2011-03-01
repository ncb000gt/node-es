var elasticsearch = require('./lib/elasticsearch'),
    query = require('./lib/query');

module.exports['search'] = elasticsearch;
module.exports['query'] = query;
