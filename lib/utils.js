module.exports.default_config = {
    host: 'localhost',
    port: 9200
};
module.exports.request = function(opts, data, cb) {
    if (data && !cb && typeof(data) == 'function') {
        cb = data;
        data = undefined;
    }
    var req = http.request(opts, function(res) {
        var statusCode = res.statusCode;
        var chunks = [],
            length = 0;
        res.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length; //can't reliably use headers
        });
        if (cb) {
            res.on('error', cb);
        }
        res.on('end', function() {
            var buf = new Buffer(length),
                total = 0;
            chunks.forEach(function chunk_cb(chunk) {
                chunk.copy(buf, total, 0);
                total += chunk.length;
            });

            //TODO: figure out a better way to do this, not sure it's possible with inconsistent messages from ES... 
            var res_json = {};
            try {
                res_json = JSON.parse(buf.toString());
            } catch(e) {
                res_json = {status: statusCode, error: buf.toString()};
            }
            if (cb) {
                //Success based status codes.
                if (!((""+statusCode).match(/2\d\d/))) {
                    cb(res_json);
                } else {
                    cb(null, res_json);
                }
            }
        });
    });

    if (data) {
        req.write(JSON.stringify(data));
    }
    if (!(opts.noend)) {
        req.end();
    }
}

module.exports.mapConfig = function(origin, mapper, cb) {
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
