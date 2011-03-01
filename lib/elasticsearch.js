var http = require('http_compat'),
    sys = require('sys');

function mapConfig(origin, mapper, cb) {
    var new_config = {};
    for (var p in origin) {
        new_config[p] = origin[p];
    }
    for (var p in mapper) {
        new_config[p] = mapper[p];
    }
    if (cb) {
        cb(new_config);
    } else {
        return new_config;
    }
}

function ElasticSearch(args) {
    var opts = args[0],
        cb = ((args.length>1)?args[1]:undefined);
    var def = {
        host: 'localhost',
        port: 9200
    };
    if (!(opts.index)) {
        throw new Error('Must specify an index for ES.');
    }
    this.config = mapConfig(def, opts);
}

module.exports = ElasticSearch;

ElasticSearch.prototype.query = function(opts, cb) {
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'POST',
        path: '/' + this.config.index + '/_search?pretty=true'
    };
    var query = {};
    if (opts.query) {
        query = opts.query;
        delete opts.query;
    }

    var _config = mapConfig(def, opts);

    var req = http.request(_config, function(res) {
        var chunks = [],
            length = 0;
        res.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length; //can't reliably use headers
        });
        res.on('end', function() {
            var buf = new Buffer(length),
                total = 0;
            chunks.forEach(function chunk_cb(chunk) {
                chunk.copy(buf, total, 0);
                total += buf.length;
            });
            console.log('data: ' + buf.toString());
            if (cb) {
                cb(null, buf);
            }
        });
    });

    req.write(JSON.stringify(query));
    req.end();
}

