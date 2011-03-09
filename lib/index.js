var utils = require('./utils');

function Index(opts) {
    if (!opts) {
        throw new Error('Must specify config options.');
    }
    if (!(opts.deleting)) {
        if (!(opts.name)) {
            throw new Error('Must specify an index name.');
        }
    }

    this.name = opts.name;
    this.idx_config = (opts.config || {});
}

module.exports = Index;

Index.prototype.status = function(opts, cb) {
    if (opts && !cb && typeof(opts) == 'function') {
        cb = opts;
        opts = {};
    }
    var def = {
        method: 'GET',
        path: '/'+this.name+'/_status'
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), null, cb);
}

Index.prototype.refresh = function(opts, cb) {
    if (opts && !cb && typeof(opts) == 'function') {
        cb = opts;
        opts = {};
    }
    var def = {
        method: 'POST',
        path: '/'+this.name+'/_refresh'
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), null, cb);
}

Index.prototype.create = function(opts, config, cb) {
    if (opts && !(config || cb) && typeof(opts) == 'function') {
        cb = opts;
        config = {}
        opts = {};
    } else if (config && !cb && typeof(config) == 'function') {
        cb = config;
        config = {}
    }
    
    config = utils.mapConfig({settings: {number_of_shards: 5, number_of_replicas: 1}}, config);
    var req_opts = {
        method: ((config.mappings)?'POST':'PUT'),
        path: '/'+this.name+'/'
    };
    utils.request(utils.mapConfig(utils.default_config, req_opts, opts), config, cb);
}

Index.prototype.delete = function(cb) {
    var req_opts = {
        method: 'DELETE',
        path: '/'+this.name+'/'
    };
    utils.request(utils.mapConfig(utils.default_config, req_opts), cb); 
}

Index.prototype.toString = function() {
    return this.name;
}
