import { Cluster } from './cluster';
import { Core } from './core';
import { Indices } from './indices';
import { Request } from 'reqlib';

// defaults applied to request if
// not supplied on instantiation
const defaults = {
	server : {
		host : 'localhost',
		port : 9200
	}
};

// let the magic begin
function createClient (options = {}) {
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

	let
		client,
		request = options.request || new Request(options);

	client = new Core(options, request);

	client.cluster = new Cluster(options, request);
	client.indices = new Indices(options, request);
	client.request = request;

	return client;
}

// exports
exports = module.exports = createClient;
exports.createClient = createClient;
