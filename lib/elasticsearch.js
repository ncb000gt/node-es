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

ElasticSearch.prototype.add = function(opts, doc, cb) {
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: ((opts.id)?'PUT':'POST'),
        path: '/' + this.config.index + '/' + opts.type + '/' + (opts.id || '')
    };
    var query = {};
    if (opts.query) {
        query = {query: opts.query};
        delete opts.query;
    }

    this._add(mapConfig(def, opts), query, cb);
}

ElasticSearch.prototype._add = function(opts, doc, cb) {
    var req = http.request(opts, function(res) {
        var chunks = [],
            length = 0;
        res.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length; //can't reliably use headers
        });
        res.on('error', cb);
        res.on('end', function() {
            var buf = new Buffer(length),
                total = 0;
            chunks.forEach(function chunk_cb(chunk) {
                chunk.copy(buf, total, 0);
                total += buf.length;
            });

            if (cb) {
                cb(null, buf);
            }
        });
    });

    req.write(JSON.stringify(doc));
    req.end();
}

ElasticSearch.prototype.delete = function(opts, cb) {
}

ElasticSearch.prototype._delete = function(opts, cb) {
}

ElasticSearch.prototype.query = function(opts, query, cb) {
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'POST',
        noend: true,
        path: '/' + this.config.index + '/_search'
    };

    this._query(mapConfig(def, opts), query, cb);
}

ElasticSearch.prototype.queryAll = function(opts, query, cb) {
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'POST',
        path: '/_search'
    };

    this._query(mapConfig(def, opts), query, cb);
}

ElasticSearch.prototype._query = function(opts, query, cb) {
    var req = http.request(opts, function(res) {
        var chunks = [],
            length = 0;
        res.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length; //can't reliably use headers
        });
        res.on('error', cb);
        res.on('end', function() {
            var buf = new Buffer(length),
                total = 0;
            chunks.forEach(function chunk_cb(chunk) {
                chunk.copy(buf, total, 0);
                total += buf.length;
            });

            if (cb) {
                cb(null, buf);
            }
        });
    });

    req.write(JSON.stringify(query));
    req.end();
}

