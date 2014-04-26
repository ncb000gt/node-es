var
  createClient = require('../../'),
  createStack = require('stact');

describe('Functional: core', function () {
  // upping default timeout for Travis-CI builds
  this.timeout(8000);

  var
    index = 'elasticsearch_test_functional_core_' + Date.now(),
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
    client.indices.putMapping({_type: 'person'}, {
      person: {
        properties: {
          name: {type: 'string'},
          color: {type: 'string', index: 'not_analyzed'}
        }
      }
    }, done);
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

  describe('request hosts in cluster', function () {
    it('works', function (done) {
      var failoverClient = createClient({
        _index : index,
        server : {
          hosts : ['localhost:9200', 'localhost:9200']
        }
      });

      failoverClient.search({query: {match_all: {}}}, function (err, result) {
        assert.ifError(err);
        done();
      });
    });
  });

  describe('#bulk', function () {
    it('works');
  });

  describe('#bulkIndex', function () {
    it('works');
  });

  describe('#count', function () {
    it('works', function (done) {
      var stack = createStack(function (next) {
        client.index({_type: 'number', _id: this}, {num: this}, next);
      });
      stack.add(1);
      stack.add(2);
      stack.add(3);
      stack.add(4);
      stack.add(5);
      stack.run(function (err) {
        assert.ifError(err);
        client.indices.refresh(function (err) {
          assert.ifError(err);
          client.count({_type: 'foo'}, null, function (err, result) {
            assert.ifError(err);
            assert.equal(result.count, 0);
            client.count({_type: 'number'}, null, function (err, result) {
              assert.ifError(err);
              assert.equal(result.count, 5);
              done();
            });
          });
        });
      });
    });
  });

  describe('#delete', function () {
    it('works', function (done) {
      client.index({_type: 'person', _id: 'joe'}, {name: 'Joe', color: 'red'}, function (err, result) {
        assert.ifError(err);
        client.get({_type: 'person', _id: 'joe'}, function (err, result) {
          assert.ifError(err);
          assert.equal(result._source.name, 'Joe');
          client.delete({_type: 'person', _id: 'joe'}, function (err, result) {
            assert.ifError(err);
            client.get({_type: 'person', _id: 'joe'}, function (err, result) {
              assert(err);
              assert.equal(err.statusCode, 404);
              done();
            });
          });
        });
      });
    });
  });

  describe('#deleteByQuery', function () {
    it('works', function (done) {
      var stack = createStack(function (next) {
        client.index({_type: 'person', _id: this._id}, this, next);
      });
      stack.add({_id: 'bill', name: 'Bill', color: 'green'});
      stack.add({_id: 'bob', name: 'Bob', color: 'blue'});
      stack.add({_id: 'babe', name: 'Babe', color: 'green'});
      stack.run(function (err) {
        assert.ifError(err);
        client.get({_type: 'person', _id: 'bob'}, function (err, result) {
          assert.ifError(err);
          assert.equal(result._source.name, 'Bob');
          client.indices.refresh(function (err) {
            assert.ifError(err);
            client.deleteByQuery({query:{term:{color: 'green'}}}, function (err, result) {
              assert.ifError(err);
              client.indices.refresh(function (err) {
                assert.ifError(err);
                client.get({_type: 'person', _id: 'babe'}, function (err, result) {
                  assert(err);
                  assert(err.statusCode, 404);
                  client.get({_type: 'person', _id: 'bob'}, function (err, result) {
                    assert.ifError(err);
                    assert.equal(result._source.name, 'Bob');
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('#exists', function () {
    it('works', function (done) {
      client.index({_type: 'person', _id: 'mary'}, {name: 'Mary', color: 'purple'}, function (err, result) {
        assert.ifError(err);
        client.exists({_type: 'person', _id: 'mary'}, function (err, result) {
          assert.ifError(err);
          assert(result.exists);
          done();
        });
      });
    });
  });

  describe('#explain', function () {
    it('works', function (done) {
      client.index({_type: 'person', _id: 'mary'}, {name: 'Mary', color: 'purple'}, function (err, result) {
        assert.ifError(err);
        client.indices.refresh(function (err) {
          assert.ifError(err);
          client.explain({_type: 'person', _id: 'mary'}, {query: {term: {color: 'purple'}}}, function (err, result) {
            assert.ifError(err);
            assert.equal(result.matched, true);
            assert(result.explanation.value);
            done();
          });
        });
      });
    });
  });

  describe('#get', function () {
    it('works', function (done) {
      client.index({_type: 'person', _id: 'brian'}, {name: 'Brian', color: 'blue'}, function (err, result) {
        assert.ifError(err);
        client.get({_type: 'person', _id: 'brian'}, function (err, result) {
          assert.ifError(err);
          assert.equal(result._source.name, 'Brian');
          done();
        });
      });
    });
  });

  describe('#index', function () {
    it('works', function (done) {
      client.index({_type: 'person', _id: 'brian'}, {name: 'Brian', color: 'blue'}, function (err, result) {
        assert.ifError(err);
        client.get({_type: 'person', _id: 'brian'}, function (err, result) {
          assert.ifError(err);
          assert.equal(result._source.name, 'Brian');
          done();
        });
      });
    });
  });

  describe('#moreLike', function () {
    it('works');
  });

  describe('#multiGet', function () {
    it('works', function (done) {
      client.multiGet({_type: 'book'}, [{_id: 'node1'}, {_id: 'fish1'}], function (err, result) {
        assert.ifError(err);
        assert.equal(result.docs.length, 2);
        assert.equal(result.docs[0]._source.title, 'What Is Node?');
        assert.equal(result.docs[1]._source.title, 'Fishing for Dummies');
        done();
      });
    });
  });

  describe('#multiSearch', function () {
    it('works', function (done) {
      var queries = [
        {},
        {query: {query_string: {query: 'fish'}}},
        {},
        {query: {match: {author: 'TJ Holowaychuk'}}}
      ];
      client.multiSearch({_index: index, _type: 'book'}, queries, function (err, result) {
        var books = [];
        assert.ifError(err);
        assert.equal(result.responses.length, 2);
        assert.equal(result.responses[0].hits.total, 1);
        assert.equal(result.responses[1].hits.total, 1);
        books.push(result.responses[0].hits.hits[0]._id);
        books.push(result.responses[1].hits.hits[0]._id);
        assert(books.indexOf('fish1') >= 0);
        assert(books.indexOf('node2') >= 0);
        done();
      });
    });
  });

  describe('Percolators', function () {
    var
      query = {query: { query_string: {query: 'fish'}}},
      book = {
        _id: 'fish2',
        title: 'Fish & Shellfish: The Cook\'s Indispensable Companion',
        author: 'James Peterson',
        summary: 'Every few decades a chef or a teacher writes a cookbook that is so comprehensive and offers such depth of subject matter and cooking inspiration that it becomes a virtual bible for amateur and professional alike. Author James Peterson, who wrote the book Sauces, a James Beard Cookbook of the Year winner, and the incomparable Splendid Soups, once again demonstrates his connoisseurship with Fish & Shellfish, a monumental cookbook that will take its rightful place as the first and last word on seafood preparation and cooking.'
      };

    it('should be able to register a percolator', function (done) {
      client.registerPercolator({_id: 1}, query, function (err, result) {
        assert.ifError(err);
        done();
      });
    });

    it('should be able to percolate a document', function (done) {
      client.percolate({_type: 'book'}, {doc: book}, function (err, result) {
        assert.ifError(err);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0]._id, 1);
        done();
      });
    });

    it('should be able to unregister a percolator', function (done) {
      client.unregisterPercolator({_id: 1}, function (err, result) {
        assert.ifError(err);
        client.percolate({_type: 'book'}, {doc: book}, function (err, result) {
          assert.ifError(err);
          assert.equal(result.matches.length, 0);
          done();
        });
      });
    });
  });

  describe('#search', function () {
    it('works', function (done) {
      client.search({_type: 'book'}, {query: {match: {summary: 'javascript'}}}, function (err, result) {
        assert.ifError(err);
        assert.equal(result.hits.total, 3);
        client.search({_type: 'book'}, {query: {match: {summary: 'fish'}}}, function (err, result) {
          assert.ifError(err);
          assert.equal(result.hits.total, 1);
          done();
        });
      });
    });

    // test for issue #48
    it('works with fields parameter', function (done) {
      client.search({_type: 'book', fields : ['title', 'author']}, {query: {match_all: {}}}, function (err, result) {
        assert.ifError(err);
        assert.equal(Object.keys(result.hits.hits[0].fields).length, 2);
        done();
      });
    });
  });

  describe('#scroll', function () {
    it('works', function (done) {
      client.search({search_type:'scan',scroll:'10m'}, {query:{match_all:{}}}, function (err, result) {
        assert.ifError(err);
        assert.ok(result.hits.total > 0);
        client.scroll({scroll:'10m'}, result['_scroll_id'], function (err, result) {
          assert.ifError(err);
          assert.ok(result.hits.total > 0);
          done();
        });
      });
    });
  });

  describe('#suggest', function () {
    it('works', function (done) {
      client.suggest({'test-suggest-1': {text: 'noed', term: {field: 'title'}}}, function (err, result) {
        assert.ifError(err);
        assert.ok(result['test-suggest-1']);

        client.suggest({'test-suggest-2': {text: 'noed', term: {field: 'summary'}}}, function (err, result) {
          assert.ifError(err);
          assert.ok(result['test-suggest-2']);

          done();
        });
      });
    });
  });

  describe('#update', function () {
    it('works', function (done) {
      var
        review = {
          _id: 'review1',
          book_id: 'fish2',
          author: 'Joe',
          body: 'This recipies in this book literally saved my marriage! Now that I can whip up all manner of fancy fish delights, my wife is a very happy woman.',
          date: '2013-08-20T10:11:12',
          views: 0
        },
        doc;

      client.index({_type: 'review', _id: review._id}, review, function (err) {
        assert.ifError(err);
        doc = {
          script: 'ctx._source.views += 1'
        };
        client.update({_type: 'review', _id: review._id}, doc, function (err) {
          assert.ifError(err);
          client.get({_type: 'review', _id: review._id}, function (err, result) {
            assert.ifError(err);
            assert.equal(result._source.views, 1);
            doc = {
              doc: {
                replies: ['Glad to hear it!']
              }
            };
            client.update({_type: 'review', _id: review._id}, doc, function (err) {
              assert.ifError(err);
              client.get({_type: 'review', _id: review._id}, function (err, result) {
                assert.ifError(err);
                assert.equal(result._source.replies.length, 1);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('#validate', function () {
    it('works', function (done) {
      var review = {
        _id: 'review2',
        book_id: 'node2',
        author: 'Jeff',
        body: 'After reading and completing the excercises in the book, my level of Node.js proficiency skyrocketed!',
        date: '2013-08-20T15:11:12',
        views: 0
      };
      client.index({_type: 'review', _id: review._id}, review, function (err) {
        assert.ifError(err);
        client.validate({_type: 'review'}, {query: {match: {author: 'Jeff'}}}, function (err, result) {
          assert.ifError(err);
          assert(result.valid);
          client.validate({_type: 'review', explain: true}, {query: {match: {date: 'foo'}}}, function (err, result) {
            assert.ifError(err);
            assert.equal(result.valid, false);
            assert.equal(result.explanations.length, 1);
            assert(result.explanations[0].error.indexOf('Invalid format: "foo"') > 0);
            done();
          });
        });
      });
    });
  });
});
