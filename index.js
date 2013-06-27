var
	cluster = require('./lib/cluster'),
	core = require('./lib/core'),
	indices = require('./lib/indices'),
	request = require('./lib/request'),

	// defaults applied to request if
	// not supplied on instantiation
	defaults = {
		server : {
			host : 'localhost',
			port : 9200
		}
	};


// let the magic begin
function createClient (options) {
	'use strict';

	options = options || {};
	Object.keys(defaults).forEach(function (key) {
		if (!options.hasOwnProperty(key)) {
			options[key] = defaults[key];
		}
	});

	// backwards compatibility helper... remaps 'index' to '_index'
	if (options.index) {
		options._index = options.index;
		delete options.index;
	}

	var req = request.initialize(options.server);

	// this is breaking from v0.2.x
	return {
		core : core(options, req),
		cluster : cluster(options, req),
		indices : indices(options, req),

		// backwards compatibility helper
		index : indices
	};
}

// exports
exports = module.exports = createClient;
exports.createClient = createClient;
