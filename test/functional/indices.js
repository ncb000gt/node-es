var
  createClient = require('../../'),
  createStack = require('stact');

describe('Functional: indices', function () {
  // upping default timeout for Travis-CI builds
  this.timeout(8000);

  var
    index = 'elasticsearch_test_functional_indices_' + Date.now(),
    client;

  before(function (done) {
    clientOptions._index = index;
    client = createClient(clientOptions);
    client.indices.createIndex(function (err) {
      assert.ifError(err);
      client.cluster.health({wait_for_status: 'yellow'}, function (err, result) {
        assert.ifError(err);
        done();
      });
    });
  });

  before(function (done) {
    client.indices.putMapping({_type: 'book'}, {
      book: {
        properties: {
          title: {type: 'string', store: 'yes', boost: 5.0},
          author: {type: 'string', store: 'yes', index: 'not_analyzed'},
          summary: {type: 'string', index: 'analyzed', term_vector: 'with_positions_offsets'}
        }
      }
    }, done);
  });

  before(function (done) {
    var stack = createStack(function (next) {
      client.index({_type: 'book', _id: this._id}, this, next);
    });
    stack.add({
      _id: 'node1',
      title: 'What Is Node?',
      author: 'Brett McLaughlin',
      summary: 'Node.js. It’s the latest in a long line of “Are you cool enough to use me?” programming languages, APIs, and toolkits. In that sense, it lands squarely in the tradition of Rails,and Ajax, and Hadoop, and even to some degree iPhone programming and HTML5. Dig a little deeper, and you’ll hear that Node.js (or, as it’s more briefly called by many,simply “Node”) is a server-side solution for JavaScript, and in particular, for receiving and responding to HTTP requests. If that doesn’t completely boggle your mind, by the time the conversation heats up with discussion of ports, sockets, and threads, you’ll tend to glaze over. Is this really JavaScript? In fact, why in the world would anyone want to run JavaScript outside of a browser, let alone the server? The good news is that you’re hearing (and thinking) about the right things. Node really is concerned with network programming and server-side request/response processing.The bad news is that like Rails, Ajax, and Hadoop before it, there’s precious little clear information available. There will be, in time — as there now is for these other “cool”frameworks that have matured — but why wait for a book or tutorial when you might be able to use Node today, and dramatically improve the maintainability.'
    });
    stack.add({
      _id: 'node2',
      title: 'Node.js in Action',
      author: 'TJ Holowaychuk',
      summary: 'Node.js is an elegant server-side JavaScript development environment perfect for scalable, high-performance web applications. Node allows developers to access HTTP and general TCP/IP functionality using a minimalist server-side JavaScript interface. Node.js in Action is an example-driven tutorial that starts at square one and goes through all the features, techniques, and concepts needed to build production-quality Node applications. First it shows how to set up a Node development environment and the community-created extensions. Then it runs through some simple demonstration programs and introduces asynchronous programming, a requirement for real-time applications such as chat, online games, and live statistics. It also shows how to create serious web applications using Node\'s HTTP API and introduces community frameworks that make web development easier and faster.'
    });
    stack.add({
      _id: 'node3',
      title: 'Learning Node.js: A Hands-On Guide to Building Web Applications in JavaScript',
      author: 'Marc Wandschneider',
      summary: 'Node.js makes it far easier to create fast, compact, and reliable web/network applications and web servers, and is rapidly becoming indispensable to modern web developers. Learning Node.js brings together the knowledge and JavaScript code you need to build master the Node.js platform and build server-side applications with extraordinary speed and scalability. You’ll start by installing and running Node.js, understanding the extensions it uses, and quickly writing your first app. Next, building on the basics, you’ll write more capable application servers and extend them with today’s most powerful Node.js tools and modules. Finally, you’ll discover today’s best practices for testing, running Node.js code on production servers, and writing command-line utilities. Throughout the book, author Marc Wandschneider teaches by walking you line-by-line through carefully crafted examples, demonstrating proven techniques for creating highly efficient applications and servers.'
    });
    stack.add({
      _id: 'fish1',
      title: 'Fishing for Dummies',
      author: 'Peter Kaminsky',
      summary: 'Make fishing easier and more rewarding every time you pick up your rod and reel. No one can promise that you will catch fish all the time. For as long as we\'ve been catching fish, fish have been outsmarting us. But there are tips and pointers that even the most seasoned anglers can pick up! Fishing For Dummies helps you prepare for what awaits beyond the shore. From trout to carp and bass to bonefish, you\'ll get coverage of the latest and greatest techniques to fish like a pro. The latest in fishing line and equipment technology, including new electronics and gadgets An expanded section on casting methods for spinning tackle and bait casting 8 pages of full-color fish illustrations If you\'re one of the millions of people who enjoy fishing, whether for fun or sport, this hands-on, friendly guide gives you everything you need to keep "The Big One" from getting away!'
    });
    stack.run(function (err) {
      assert.ifError(err);
      client.indices.refresh(done);
    });
  });

  after(function (done) {
    client.indices.deleteIndex(done);
  });

  describe('Aliases', function () {

    describe('#alias', function () {
      it('should be able to create an alias', function (done) {
        client.indices.alias({alias: index + '_test'}, {}, function (err) {
          assert.ifError(err);
          done();
        });
      });

      it('should be able to query via alias', function (done) {
        client.get({_index: index + '_test', _type: 'book', _id: 'node1'}, function (err, result) {
          assert.ifError(err);
          assert.equal(result._source.title, 'What Is Node?');
          done();
        });
      });

      it('should be able to create multiple aliases (with filters)', function (done) {
        var data = {
          actions: [
            {add: {index: index, alias: index + '_functional_tests_indices'}},
            {add: {index: index, alias: index + '_node_books', filter: {
              and: [
                {type: {value: 'book'}},
                {query: {query_string: {query: 'Node.js'}}}
              ]
            }}}
          ]
        };
        client.indices.alias(data, function (err) {
          assert.ifError(err);
          client.search({_index: index + '_node_books'}, {query: {match_all: {}}}, function (err, result) {
            assert.ifError(err);
            assert.equal(result.hits.total, 3);
            done();
          });
        });
      });
    });

    describe('#aliases', function () {
      it('should be able to list all aliases for the default index', function (done) {
        client.indices.aliases(function (err, result) {
          assert.ifError(err);
          assert(result[index].aliases[index +  '_test']);
          done();
        });
      });
      it('should be able to find a specific alias', function (done) {
        client.indices.aliases({alias: index + '_test'}, function (err, result) {
          assert.ifError(err);
          assert(result[index].aliases[index + '_test']);
          done();
        });
      });
    });

    describe('#deleteAlias', function () {
      it('should be able to delete an alias', function (done) {
        client.indices.deleteAlias({alias: index + '_test'}, function (err) {
          assert.ifError(err);
          client.get({_index: index + '_test', _type: 'book', _id: 'node2'}, function (err, result) {
            assert.equal(err.statusCode, 404);
            client.indices.deleteAlias({alias: index + '_functional_tests_indices'}, function (err) {
              assert.ifError(err);
              client.indices.deleteAlias({alias: index + '_node_books'}, function (err) {
                assert.ifError(err);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('Indexes', function () {

    afterEach(function (done) {
      this.timeout(5000);
      client.cluster.health({wait_for_status: 'yellow'}, done);
    });

    describe('#createIndex', function () {
      it('should be able to create an index', function (done) {
        client.indices.createIndex({_index: index + '_foo'}, {}, function (err) {
          assert.ifError(err);
          client.indices.createIndex({_index: index + '_foo'}, {}, function (err) {
            assert(err);
            done();
          });
        });
      });
    });

    describe('#closeIndex', function () {
      it('should be able to close an index', function (done) {
        client.indices.closeIndex({_index: index + '_foo'}, function (err) {
          assert.ifError(err);
          client.index({_index: index + '_foo', _type: 'bar'}, {my: 'data'}, function (err) {
            assert.equal(err.statusCode, 403);
            done();
          });
        });
      });
    });

    describe('#openIndex', function () {
      it('should be able to open an index', function (done) {
        client.indices.openIndex({_index: index + '_foo'}, function (err) {
          assert.ifError(err);
          client.index({_index: index + '_foo', _type: 'bar', _id: 'thing'}, {_id: 'thing', my: 'data'}, function (err) {
            assert.ifError(err);
            done();
          });
        });
      });
    });

    describe('#deleteIndex', function () {
      it('should be able to delete an index', function (done) {
        client.indices.deleteIndex({_index: index + '_foo'}, function (err) {
          assert.ifError(err);
          client.indices.deleteIndex({_index: index + '_foo'}, function (err) {
            assert(err);
            done();
          });
        });
      });
    });
  });

  describe('Templates', function () {

    describe('#createTemplate', function () {
      it('should be able to create a template', function (done) {
        var template = {
          template: 'test*',
          mappings: {
            widget: {
              _source: {enabled: false}
            }
          }
        };
        client.indices.createTemplate({name: index + '_template'}, template, function (err) {
          assert.ifError(err);
          done();
        });
      });
    });

    describe('#templates', function () {
      it('should be able to list templates', function (done) {
        client.indices.templates({name: index + '_template'}, function (err, result) {
          assert.ifError(err);
          assert.equal(result[index + '_template'].template, 'test*');
          done();
        });
      });
    });

    describe('#deleteTemplate', function () {
      it('should be able to delete a template', function (done) {
        client.indices.deleteTemplate({name: index + '_template'}, function (err) {
          assert.ifError(err);
          client.cluster.state(function (err, result) {
            assert.ifError(err);
            assert(typeof result.metadata.templates[index + '_template'] === 'undefined');
            done();
          });
        });
      });
    });
  });

  describe('Mappings', function () {

    describe('#putMapping', function () {
      it('should be able to put a mapping', function (done) {
        var mapping = {
          baz: {
            properties: {
              name: {
                type: 'string',
                index: 'analyzed'
              }
            }
          }
        };
        client.indices.putMapping({_type: 'baz'}, mapping, function (err) {
          assert.ifError(err);
          done();
        });
      });
    });

    describe('#mappings', function () {
      it('should be able to list mappings', function (done) {
        client.indices.mappings(function (err, result) {
          assert.ifError(err);
          assert(result[index].mappings.baz);
          assert(result[index].mappings.baz.properties.name);
          done();
        });
      });
    });

    describe('#deleteMapping', function () {
      it('should be able to delete mappings', function (done) {
        client.indices.deleteMapping({_type: 'baz'}, function (err) {
          assert.ifError(err);
          client.indices.mappings({_type: 'baz'}, function (err, result) {
            assert.equal(Object.keys(result).length, 0);
            done();
          });
        });
      });
    });
  });

  describe('Warmers', function () {

    describe('#putWarmer', function () {
      it('should be able to put a warmer', function (done) {
        var warmer = {
          query: {
            match_all: {}
          },
          facets: {
            author: {
              terms: {
                field: 'author'
              }
            }
          }
        };
        client.indices.putWarmer({name: index + '_warmer', _type: 'book'}, warmer, function (err) {
          assert.ifError(err);
          done();
        });
      });
    });

    describe('#warmers', function () {
      it('should be able to list warmers', function (done) {
        client.indices.warmers({_type: 'book'}, function (err, result) {
          assert.ifError(err);
          assert.equal(result[index].warmers[index + '_warmer'].source.facets.author.terms.field, 'author');
          done();
        });
      });
    });

    describe('#deleteWarmer', function () {
      it('should be able to delete warmers', function (done) {
        client.indices.deleteWarmer({name: index + '_warmer'}, function (err) {
          assert.ifError(err);
          client.indices.warmers({_type: 'book'}, function (err, result) {
            assert.ifError(err);
            assert.deepEqual(result, {});
            done();
          });
        });
      });
    });
  });

  describe('Misc.', function () {

    describe('#analyze', function () {
      it('should be able to analyze text with a specific analyzer', function (done) {
        client.indices.analyze({analyzer: 'standard'}, 'this is a test', function (err, result) {
          assert.ifError(err);
          assert.equal(result.tokens.length, 4);
          done();
        });
      });
    });

    describe('#clearCache', function () {
      it('should be able to clear the cache', function (done) {
        client.indices.clearCache(function (err) {
          assert.ifError(err);
          // @todo Not sure how to test if the cache clear worked.
          done();
        });
      });
    });

    describe('#exists', function () {
      it('should be able to check if an index exists', function(done){
        client.indices.exists(function (err, result) {
          assert.ifError(err);
          assert(result.exists);
          client.indices.exists({_index: index + '_doesnotexist'}, function (err, result) {
            assert.ifError(err);
            assert(result.exists === false);
            done();
          });
        });
      });

      it('should be able to check if a type exists', function(done){
        client.indices.exists({_type: 'book'}, function (err, result) {
          assert.ifError(err);
          assert(result.exists);
          client.indices.exists({_type: index + '_doesnotexist'}, function (err, result) {
            assert.ifError(err);
            assert(result.exists === false);
            done();
          });
        });
      });
    });

    describe('#flush', function () {
      it('should be able to flush an index', function (done) {
        client.indices.flush(function (err) {
          assert.ifError(err);
          done();
        });
      });
    });

    describe('#optimize', function () {
      it('should be able to optimize an index', function (done) {
        client.indices.optimize(function (err) {
          assert.ifError(err);
          done();
        });
      });
    });

    describe('#refresh', function () {
      it('should be able to refresh an index', function (done) {
        var book = {
          _id: 'short',
          title: 'Short book',
          author: 'Me',
          summary: 'Short summary'
        };
        client.index({_type: 'book', _id: book._id}, book, function (err) {
          assert.ifError(err);
          client.search({_type: 'book'}, {query: {match: {title: 'Short book'}}}, function (err, result) {
            assert.ifError(err);
            assert.equal(result.hits.total, 0);
            client.indices.refresh(function (err) {
              assert.ifError(err);
              client.search({_type: 'book'}, {query: {match: {title: 'Short book'}}}, function (err, result) {
                assert.ifError(err);
                assert.equal(result.hits.total, 1);
                done();
              });
            });
          });
        });
      });
    });

    describe('#segments', function () {
      it('should be able to get segment information', function (done) {
        client.indices.segments(function (err, result) {
          assert.ifError(err);
          assert(result.indices[index]);
          done();
        });
      });
    });

    describe('#settings', function () {
      it('should be able to get settings', function (done) {
        client.indices.settings(function (err, result) {
          assert.ifError(err);
          assert(result[index].settings);
          done();
        });
      });
    });

    describe('#snapshot', function () {
      it('works');
    });

    describe('#stats', function () {
      it('should be able to get the stats', function (done) {
        client.indices.stats(function (err, result) {
          assert.ifError(err);
          assert.equal(result.indices[index].total.docs.count, 5);
          done();
        });
      });
    });

    describe('#status', function () {
      it('should be able to get the status', function (done) {
        client.indices.status(function (err, result) {
          assert.ifError(err);
          assert.equal(result.indices[index].docs.num_docs, 5);
          done();
        });
      });
    });

    describe('#updateSettings', function () {
      it('should be able to update settings', function (done) {
        var settings = {
          index: {
            refresh_interval: '24s'
          }
        };
        client.indices.updateSettings(settings, function (err) {
          assert.ifError(err);
          client.indices.settings(function (err, result) {
            assert.ifError(err);
            assert.equal(result[index].settings.index['refresh_interval'], '24s');
            done();
          });
        });
      });
    });

  });
});
