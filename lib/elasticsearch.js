var http = require('http_compat'),
    utils = require('./utils'),
    Query = require('./query'),
    Index = require('./index'),
    sys = require('sys');

function ElasticSearch(args) {
    var opts = args[0],
        cb = ((args.length>1)?args[1]:undefined);
    if (!(opts.index)) {
        throw new Error('Must specify an index for ES.');
    } else if (!(opts.index instanceof Index)) {
        var index;
        if (opts.index instanceof String) {
            index = new Index({name: opts.index});
        } else {
            index = new Index(opts.index);
        }
    }
    this.config = utils.mapConfig(utils.default_config, opts);
}

module.exports = ElasticSearch;

ElasticSearch.prototype.status = function(opts, cb) {
    if (opts && !cb) {
        cb = opts;
        opts = {};
    }
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'GET',
        path: '/'+this.config.index+'/_status'
    };

    utils.request(utils.mapConfig(def, opts), cb);
}

ElasticSearch.prototype.add = function(opts, doc, cb) {
    if (opts && doc && !cb && typeof (doc) == 'function') {
        cb = doc;
        doc = opts;
        opts = {};
    }
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: ((opts.id)?'PUT':'POST'),
        path: '/' + this.config.index + '/' + (opts.type || 'doc') + '/' + (opts.id || '')
    };

    utils.request(utils.mapConfig(def, opts), doc, cb);
}


ElasticSearch.prototype.delete = function(opts, cb) {
    if (opts && !cb && typeof (opts) == 'function') {
        cb = opts;
        opts = {};
    }
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'DELETE',
        path: '/' + this.config.index + '/' + ((opts.type)?(opts.type+(opts.id)?'/'+opts.id:''):'')
    };

    utils.request(utils.mapConfig(def, opts), undefined, cb);
}

ElasticSearch.prototype.query = function(opts, query, cb) {
    if (opts && query && !cb && typeof (query) == 'function') {
        cb = query;
        query = opts;
        opts = {};
    }
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'POST',
        path: '/' + this.config.index + '/_search'
    };

    utils.request(utils.mapConfig(def, opts), query, cb);
}

ElasticSearch.prototype.queryAll = function(opts, query, cb) {
    var def = {
        host: this.config.host,
        port: this.config.port,
        method: 'POST',
        path: '/_search'
    };

    utils.request(utils.mapConfig(def, opts), query, cb);
}
