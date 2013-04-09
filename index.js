var Client = require('./lib/elasticsearch');

function createClient () {
  return new Client(arguments);
}

// Make createClient the default function
exports = module.exports = createClient;

// Expose constructors
exports.Client = Client;
exports.Cluster = require('./lib/cluster');
exports.Index = require('./lib/index');

// For backwards compatibility
exports.createClient = createClient;
