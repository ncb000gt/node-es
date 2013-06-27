exports.getIndexSyntax = function (options, config) {
	'use strict';

	var syntax = '';

	if (options._indices && Array.isArray(options._indices)) {
		syntax = options._indices.join(',');
	} else if (options._index) {
		syntax = options._index;
	} else if (config && config._indices && Array.isArray(config._indices)) {
		syntax = config._indices.join(',');
	} else if (config && config._index) {
		syntax = config._index;
	}

	return syntax;
};


exports.getFieldSyntax = function (options) {
	'use strict';

	var syntax = '';

	if (options.fields && Array.isArray(options.fields)) {
		syntax = options.fields.join(',');
	} else if (options.field) {
		syntax = options.field;
	}

	return syntax;
};


exports.getNodeSyntax = function (options, config) {
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
};


exports.getTypeSyntax = function (options, config) {
	'use strict';

	var syntax = '';

	if (options._types && Array.isArray(options._types)) {
		syntax = options._types.join(',');
	} else if (options._type) {
		syntax = options._type;
	} else if (config && config._types && Array.isArray(config._types)) {
		syntax = config._types.join(',');
	} else if (config && config._type) {
		syntax = config._type;
	}

	return syntax;
};


exports.optionsUndefined = function (options, config, keys) {
	'use strict';

	var error;

	keys.every(function (key) {
		if (key === '_index' &&
				(options.hasOwnProperty('_indices') ||
				config.hasOwnProperty('_indices'))) {
			return true;
		}

		if (key === '_type' &&
				(options.hasOwnProperty('_types') ||
				config.hasOwnProperty('_types'))) {
			return true;
		}

		if (!options.hasOwnProperty(key) && !config.hasOwnProperty(key)) {
			error = new Error(key + ' is required');
			return false;
		}

		return true;
	});

	return error || false;
};
