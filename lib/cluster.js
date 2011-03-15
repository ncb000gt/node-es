var utils = require('./utils'),
    qs = require('querystring');

function Cluster() {
}

module.exports = Cluster;

Cluster.prototype.status = function(opts, cb) {
    if (opts && !cb && typeof(opts) == 'function') {
        cb = opts;
        opts = {};
    }
    var def = {
        method: 'GET',
        path: '/_status'
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), null, cb);
}

Cluster.prototype.deleteIndices = function(opts, cb) {
    if (opts && !cb && typeof(opts) == 'function') {
        cb = opts;
        opts = {};
    }
    this.status(function(err, status) {
        var count = 0,
            total = 0,
            active = true,
            keys = Object.keys(status.indices);
        function checkDone(err, res) {
            if (err) {
                active = false;
                cb(err, res);
            } else if (active && count === total) {
                cb(null, {success: true, indices: keys});
            }
        }
        if (keys.length > 0) {
            for (var p in status.indices) {
                total++;

                var def = {
                    method: 'DELETE',
                    path: '/' + p + '/'
                };

                utils.request(utils.mapConfig(def, utils.default_config), undefined, function(err, res) {
                    count++;
                    checkDone(err, res);
                });
            }
        } else {
            checkDone(null);
        }
    });
}

Cluster.prototype.health = function(opts, cb) {
    var health_query = {},
        q_prefix = '';
    if (opts.level) {
        health_query.level = opts.level;
        q_prefix = '?';
    }
    if (opts.wait_for_status) {
        health_query.wait_for_status = opts.wait_for_status;
        q_prefix = '?';
    }
    if (opts.wait_for_relocating_shards) {
        health_query.wait_for_relocating_shards = opts.wait_for_relocating_shards;
        q_prefix = '?';
    }
    if (opts.wait_for_nodes) {
        health_query.wait_for_nodes = opts.wait_for_nodes;
        q_prefix = '?';
    }
    if (opts.timeout) {
        health_query.timeout = opts.timeout;
        q_prefix = '?';
    }

    var def = {
        method: 'GET',
        path: '_cluster/health' + q_prefix + qs.stringify(health_query)
    };
    utils.request(utils.mapConfig(def, utils.default_config, opts), undefined, function(err, res) {
        cb(err, res);
    });
};
