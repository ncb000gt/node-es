var utils = require('./utils'),
    Query = require('./query'),
    Index = require('./index'),
    sys = require('sys');

function ElasticSearch(args) {
    var opts = args[0],
        cb = ((args.length>1)?args[1]:undefined);
        if (!(opts.index)) {
            throw new Error('Must specify an index for ES.');
        } else if (!(opts.index instanceof Index)) {
            if (typeof(opts.index) == 'string') {
                this.index = new Index({name: opts.index});
            } else {
                this.index = new Index(opts.index);
            }
        }
    if (!(this.index.name && this.index.name[0] == '_')) {
        var self = this;
        this.index.create(function(err, res) {
            if (cb) {
                cb(self);
            }
        });
    } else {
        if (cb) {
            cb(this);
        } else {
            return this;
        }
    }
}

module.exports = ElasticSearch;

ElasticSearch.prototype.status = function(opts, cb) {
    this.index.status(opts, cb);
}

ElasticSearch.prototype.add = function(opts, doc, cb) {
    if (opts && doc && !cb && typeof (doc) == 'function') {
        cb = doc;
        doc = opts;
        opts = {};
    }
    var def = {
        method: ((opts.id)?'PUT':'POST'),
        path: '/' + this.index + '/' + (opts.type || 'doc') + '/' + (opts.id || '') + ((opts.refresh)?'?refresh=true':'')
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), doc, cb);
}

ElasticSearch.prototype.delete = function(opts, cb) {
    if (opts && !cb && typeof (opts) == 'function') {
        cb = opts;
        opts = {};
    }
    var def = {
        method: 'DELETE',
        path: '/' + this.index + '/' + ((opts.type)?(''+opts.type+((opts.id)?'/'+opts.id:'')):'') + ((opts.refresh)?'?refresh=true':'')
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), undefined, cb);
}

ElasticSearch.prototype.get = function(opts, cb) {
    var def = {
        method: 'GET',
        path: '/' + this.index + '/' + opts.type + '/' + opts.id
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), cb);
}

ElasticSearch.prototype.query = function(opts, query, cb) {
    if (opts && query && !cb && typeof (query) == 'function') {
        cb = query;
        query = opts;
        opts = {};
    }
    var def = {
        method: 'POST',
        path: '/' + this.index + '/_search'
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), query, cb);
}

ElasticSearch.prototype.queryAll = function(opts, query, cb) {
    var def = {
        method: 'POST',
        path: '/_search'
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), query, cb);
}
