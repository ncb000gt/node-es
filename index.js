var es = require('./lib/elasticsearch'),
query = require('./lib/query');

module.exports['search'] = es;
module.exports['query'] = query;
