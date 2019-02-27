var qs = require('querystring');

var stubMethod = function (method, options, data, callback) {
	'use strict';

	options.method = method;
	if (requestError) {
		return callback(requestError);
	}

	return callback(null, {
			inputData : data,
			options : global.req.getRequestOptions(options)
		});
};

global.clientOptions = {};

global.req = {};

req.getRequestOptions = (source) => {
	if (!source) {
		return source;
	}

	let options = JSON.parse(JSON.stringify(source));

	if (options.pathname) {
		options.path = options.pathname;
	}

	if (options.query && Object.keys(options.query).length) {
		// fix for #48 (arrays in querystring are properly serialized)
		Object.keys(options.query).forEach(function (param) {
			if (Array.isArray(options.query[param]) && options.query[param].length > 1) {
				options.query[param] = options.query[param].join(',');
			}
		});

		options.path += '?' + qs.stringify(options.query);
	}

	return options;
};

req.delete = function (options, data, callback) {
	'use strict';

	if (!callback && typeof data === 'function') {
		callback = data;
		data = null;
	}
	stubMethod('DELETE', options, data, callback);
};


req.get = function (options, data, callback) {
	'use strict';

	if (!callback && typeof data === 'function') {
		callback = data;
		data = null;
	}
	stubMethod('GET', options, data, callback);
};


req.head = function (options, data, callback) {
	'use strict';

	if (!callback && typeof data === 'function') {
		callback = data;
		data = null;
	}
	stubMethod('HEAD', options, data, callback);
};


req.post = function (options, data, callback) {
	'use strict';

	if (!callback && typeof data === 'function') {
		callback = data;
		data = null;
	}

	stubMethod('POST', options, data, callback);
};


req.put = function (options, data, callback) {
	'use strict';

	if (!callback && typeof data === 'function') {
		callback = data;
		data = null;
	}

	stubMethod('PUT', options, data, callback);
};


global.requestError = null;


var chai = require('chai');
global.should = chai.should();
global.assert = chai.assert;
