var Client = require('./lib/elasticsearch');

function createClient () {
  return new Client(arguments);
}

// Make createClient the default function
exports = module.exports = createClient;

// Expose constructors
exports.Client = Client;
exports.Cluster = require('./lib/cluster');

// For backwards compatibility
exports.createClient = createClient;
