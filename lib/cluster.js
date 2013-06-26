module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['_create', '_id', '_index', '_indices', '_source', '_type', '_types']);

	self.health = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			params = req.formatParameters(options, paramExcludes),
			path = '_cluster/health';

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.state = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			params = req.formatParameters(options, paramExcludes),
			path = '_cluster/state';

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	return self;
};
