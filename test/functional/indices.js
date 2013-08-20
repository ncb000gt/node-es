var
  createClient = require('../../'),
  createStack = require('stact');

describe('Functional: indices', function () {
  var
    index = 'elasticsearch_test_functional_' + Date.now(),
    client;

  before(function (done) {
    client = createClient({_index: index});
    client.indices.createIndex(done);
  });

  after(function (done) {
    client.indices.deleteIndex(done);
  });

  it('#alias');

  it('#aliases');

  it('#analyze');

  it('#clearCache');

  it('#closeIndex');

  it('#createIndex');

  it('#createTemplate');

  it('#deleteAlias');

  it('#deleteIndex');

  it('#deleteMapping');

  it('#deleteTemplate');

  it('#deleteWarmer');

  it('#exists');

  it('#flush');

  it('#mappings');

  it('#openIndex');

  it('#optimize');

  it('#putMapping');

  it('#putWarmer');

  it('#refresh');

  it('#segments');

  it('#settings');

  it('#snapshot');

  it('#stats');

  it('#status');

  it('#templates');

  it('#updateSettings');

  it('#warmers');
});
