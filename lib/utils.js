var http = require('http');
var https = require('https');

var default_config = module.exports.default_config = {
    host: 'localhost',
    port: 9200
};

var _request = module.exports.request = function(opts, data, cb) {
    if (data && !cb && typeof(data) == 'function') {
        cb = data;
        data = undefined;
    }

    var callback = function(res) {
        var statusCode = res.statusCode;
        var chunks = [],
            length = 0;
        res.on('data', function(chunk) {
            chunks.push(chunk);
            length += chunk.length; //can't reliably use headers
        });
        res.on('end', function() {
            var buf = new Buffer(length),
                message = '',
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
                    if (res_json.error) {
                      message = res_json.error;
                    } else if (res_json.exists === false) {
                      message = 'Doc with id "'+res_json._id+'" and type "'+res_json._type+'" not found in index "'+res_json._index+'"';
                    }
                    cb(new Error(message));
                } else {
                    cb(null, res_json);
                }
            }
        });
    };

    var onError = function(err) {
        if (cb) {
            cb(err);
        }
    }

    var req;
    if (opts.secure) {
        req = https
            .request(opts, callback)
            .on('error', onError);
    } else {
        req = http
            .request(opts, callback)
            .on('error', onError);
    }

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
