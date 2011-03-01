var http = require('http');

function ElasticSearch(opts) {
    this.config = {
        host: 'localhost',
        port: '9200'
    };
    if (!(opts.index)) {
        throw new Error('Must specify an index for ES.');
    }
    for (var p in opts) {
        this.config[p] = opts[p];
    }
}

module.exports = ElasticSearch;

ElasticSearch.prototype.query = function(query, cb) {
    var options = {
        host: this.config.host,
        port: this.config.port,
        method: 'POST'
    };
    http.request();
}
