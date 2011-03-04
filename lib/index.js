var utils = require('./utils');

function Index(opts) {
    if (!(opts.name)) {
        throw new Error('Must specify an index name.');
    }

    this.name = opts.name;
    this.config = 
    this.idx_config = opts.config;
}

module.exports = Index;

Index.prototype.create = function(opts, cb) {
    if (opts && typeof(opts) == 'function') {
        cb = opts;
        opts = {};
    }
    var config = utils.mapConfig(this.config, opts);
    var req_opts = {
        method: ((config.mappings)?'POST':'PUT'),
    };
    utils.request(req_opts, config, cb); 
}
