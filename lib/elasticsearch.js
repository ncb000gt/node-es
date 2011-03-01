var http = require('http');

function mapConfig(origin, mapper) {
    for (var p in mapper) {
        origin[p] = mapper[p];
    }
    return origin;
}

function ElasticSearch(opts) {
    var def = {
        host: 'localhost',
        port: '9200'
    };
    if (!(opts.index)) {
        throw new Error('Must specify an index for ES.');
    }
    this.config = mapConfig(def, opts);
}

module.exports = ElasticSearch;

ElasticSearch.prototype.query = function query(opts, cb) {
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'POST'
    };
    var query = opts.query;
    delete opts.query;

    var _config = mapConfig(def, opts);

    var req = http.request(_config, function response_cb(res) {
        var chunks = [],
            length = 0;
        res.on('data', function data_cb(chunk) {
            chunks.push(chunk);
            length += chunk.length; //can't reliably use headers
        });
        res.on('end', function end_cb() {
            var buf = new Buffer(length),
                total = 0;
            chunks.forEach(function chunk_cb(chunk) {
                chunk.copy(buf, total, 0);
                total += buf.length;
            });
            console.log('data: ' + buf.toString());
        });
    });

    req.write(JSON.stringify(query));
    req.end();
}
