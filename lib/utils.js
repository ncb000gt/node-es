/*
	Looks through request options and lib config data to determine
	the index to use for an operation.

	Supports (and favors over single index) the multi-index syntax
	if an array of index names are supplied (via indices).

	Output is formatted as 'indexName' or 'indexName1,indexName2' or ''

	http://www.elasticsearch.org/guide/reference/api/multi-index/
*/
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


/*
	Looks through request options to determine the field to use for
	an operation.

	Supports (and favors over single field) multi field syntax
	if an array of field names are supplied (via fields

	Output is formatted as 'fieldName' or 'fieldName1,fieldName2' or ''
*/
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


/*
	Looks through request options and lib config data to determine
	the node to use for an operation.

	Supports (and favors over single node) the multi node syntax
	if an array of node names are supplied (via nodes).

	Output is formatted as 'nodeName' or 'nodeName1,nodeName2' or ''
*/
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


/*
	Looks through request options and lib config data to determine
	the type syntax to use for an operation.

	Supports (and favors over single type) the multi-type syntax
	if an array of type names are supplied (via types).

	Output is formatted as 'typeName' or 'typeName1,typeName2' or ''
*/
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


/*
	Convenience method for ensuring an expected key exists either in
	request options or lib config data. As the operation iterates
	through each key supplied in keys, if it is not found as a property
	in options or config, the function returns an Error.

	If the specified keys are found, false is returned (indicating no
	options are undefined).

	if '_index' or '_type' is specified, the method will accept the
	pluralized versions of those properties without returning an
	Error.
*/
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

/*
	Exclude keys from an object.
*/
exports.exclude = function (obj, excludes) {
	'use strict';

	var result = {};

	Object.keys(obj).forEach(function (key) {
		if (excludes.indexOf(key) === -1) {
			result[key] = obj[key];
		}
	});

	return result;
};

/*
	Convenience method used for building path string used
	when issuing the HTTP/HTTPS request. If the resource param
	is undefined, empty or false an empty sting is returned.

	If the input resource string has a value, it is returned
	with a '/' prepend.

	pathAppend('kitteh')

	Outputs: '/kitteh'
*/
exports.pathAppend = function (resource) {
	'use strict';

	if (resource || resource === 0) {
		return '/' + resource;
	}

	return '';
};
