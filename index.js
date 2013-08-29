var
	cluster = require('./lib/cluster'),
	core = require('./lib/core'),
	indices = require('./lib/indices'),

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
		if (!options[key]) {
			options[key] = defaults[key];
		}
	});

	// backwards compatibility helper... remaps 'index' to '_index'
	if (options.index) {
		options._index = options.index;
		delete options.index;
	}

	var
		request =
			(options.request || require('./lib/request'))
			.initialize(options.server),
		client = core(options, request);

	client.cluster = cluster(options, request);
	client.indices = indices(options, request);
	client.request = request;

	return client;
}

// exports
exports = module.exports = createClient;
exports.createClient = createClient;
