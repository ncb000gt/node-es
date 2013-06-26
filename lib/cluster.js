function getNodeSyntax (options, config) {
	'use strict';

	var syntax = '';

	if (options.nodes && Array.isArray(options.nodes)) {
		syntax = options.nodes.join(',');
	} else if (options.node) {
		syntax = options.node;
	} else if (config && config.nodes && Array.isArray(config.nodes)) {
		syntax = config.nodes.join(',');
	} else if (config && config.node) {
		syntax = config.node;
	}

	return syntax;
}


module.exports = function (config, req, self) {
	'use strict';

	self = self || {};

	var paramExcludes = Object.keys(config)
		.concat(['node', 'nodes']);

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

	self.nodeInfo = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		var
			node = getNodeSyntax(options, config),
			params = req.formatParameters(options, paramExcludes),
			path = '_cluster/nodes' +
				req.pathAppend(node);

		options.path = path + (params ? '?' + params : '');

		return req.get(options, callback);
	};

	self.settings = function (options, callback) {
		if (!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}

		options.path = '_cluster/settings';

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

	self.updateSettings = function (options, data, callback) {
		if (!callback && typeof data === 'function') {
			callback = data;
			data = options;
			options = {};
		}

		options.path = '_cluster/settings';

		return req.put(options, data, callback);
	};

	return self;
};
