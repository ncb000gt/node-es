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


global.requireWithCoverage = function (libName) {
	'use strict';

	if (process.env.NODE_ELASTICSEARCH_COVERAGE) {
		return require('../lib-cov/' + libName + '.js');
	}

	if (libName === 'index') {
		return require('../lib');
	} else {
		return require('../lib/' + libName + '.js');
	}
};

global.clientOptions = {};

global.req = require('../lib/request').initialize({});


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
