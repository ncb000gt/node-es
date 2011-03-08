var http = require('http_compat'),
    sys = require('sys');

var default_config = module.exports.default_config = {
    host: 'localhost',
    port: 9200
};
var _request = module.exports.request = function(opts, data, cb) {
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
                } else if (cb) {
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

var mapConfig = module.exports.mapConfig = function() {
    var cb = arguments[arguments.length-1];
    var sub_idx = 1;
    if (!(typeof(cb) == 'function')) {
        sub_idx = 0;
        cb = undefined;
    }
    var new_config = {};
    var len = arguments.length-sub_idx;
    for (var i = 0; i < len; i++) {
        var o = arguments[i];
        for (var p in o) {
            new_config[p] = o[p];
        }
    }
    if (cb) {
        cb(new_config);
    } else {
        return new_config;
    }
}

module.exports.deleteAllIndices = function(lib) {
    return function(cb) {
        lib.createClient({deleting: true}, function(client) {
            client.status(function(err, status) {
                var count = 0,
                total = 0;
                function checkDone() {
                    if (count === total) {
                        console.log('Done');
                        cb(null, {success: true});
                    }
                }
                for (var p in status.indices) {
                    total++;

                    var def = {
                        method: 'DELETE',
                        path: '/' + p + '/'
                    };

                    _request(mapConfig(def, default_config), undefined, function() {console.log('Deleted'); count++; checkDone();});
                }
            });
        });
    }
}
