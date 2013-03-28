var utils = require('./utils'),
    Index = require('./index');

function ElasticSearch(args) {
    var opts = args[0] || {},
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
                cb(err, self);
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
        path: '/' + this.index + '/' + (opts.type || 'doc') + '/' + (opts.id || '') + (opts.refresh?'?refresh=true':'')
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
        path: '/' + this.index + '/' + (opts.type || 'doc') + (opts.id?'/'+opts.id:'') + (opts.refresh?'?refresh=true':'')
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), undefined, cb);
}

ElasticSearch.prototype.get = function(opts, cb) {
    var def = {
        method: 'GET',
        path: '/' + this.index + '/' + (opts.type || 'doc') + '/' + opts.id
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

ElasticSearch.prototype.count = function(opts, query, cb) {
    if (opts && query && !cb && typeof (query) == 'function') {
        cb = query;
        query = opts;
        opts = {};
    }
    var def = {
        method: 'POST',
        path: '/' + this.index + '/_count'
    };

    utils.request(utils.mapConfig(def, utils.default_config, opts), query, cb);
}

ElasticSearch.prototype.terms = function(opts, query, cb) {
    if (opts && query && !cb && typeof (query) == 'function') {
        cb = query;
        query = opts;
        opts = {};
    }
    var def = {
        method: 'GET',
        path: '/' + this.index + '/_terms'
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

ElasticSearch.prototype.deleteRiver = function(opts, name, cb) {
    if (opts && name && !cb && typeof(name) == 'function') {
        cb = name;
        name = opts;
        opts = {};
    }
    var def = {
        method: 'DELETE',
        path: '/_river/'+name+'/'
    };
    utils.request(utils.mapConfig(def, utils.default_config, opts), cb);
}

ElasticSearch.prototype.putRiver = function(opts, river, cb) {
    if (opts && river && !cb ) {
        cb = river;
        river = opts;
        opts = {};
    }
    var name = opts.name || river.index && river.index.index;
    var def = {
        method: 'PUT',	
        path: '/_river/'+name+'/_meta'
    };
    utils.request(utils.mapConfig(def, utils.default_config, opts), river, cb);
}

ElasticSearch.prototype.getRiver = function(opts, name, cb) {
    if (opts && name && !cb ) {
        cb = name;
        name = opts;
        opts = {};
    }
    var def = {
        method: 'GET',	
        path: '/_river/'+name+'/_meta'
    };
    utils.request(utils.mapConfig(def, utils.default_config, opts), cb);
}

ElasticSearch.prototype.getMapping = function(opts, type, cb) {
    if (opts && type && !cb ) {
        cb = type;
        type = opts;
        opts = {};
    }
    if ( type.constructor.name === 'Array' ) type = type.join();
    var def = {
        method : 'GET',
        path : '/'+this.index+'/'+type+'/_mapping'
    };
    utils.request(utils.mapConfig(def, utils.default_config, opts), cb);
};

ElasticSearch.prototype.putMapping = function(opts, config, cb) {
    if (opts && config && !cb ) {
        cb = config;
        config = opts;
        opts = {};
    }
    var def = {
        method : 'PUT',
        path : '/'+this.index+'/'+config.name+'/_mapping'
    };
    utils.request(utils.mapConfig(def, utils.default_config, opts), config.mapping, cb);
};

ElasticSearch.prototype.deleteMapping = function(opts, config, cb) {
    if (opts && config && !cb ) {
        cb = config;
        config = opts;
        opts = {};
    }
    var def = {
        method : 'DELETE',
        path : '/'+this.index+'/'+config.name+'/_mapping'
    };
    utils.request(utils.mapConfig(def, utils.default_config, opts), cb);
};

exports.createMapping = function( type, mapping, callback ){
	client.createMapping( opts, type, callback );
};

exports.deleteMapping = function( type, callback ){
	client.deleteMapping( opts, type, callback );
};
