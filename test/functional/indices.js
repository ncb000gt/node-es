var
  createClient = require('../../'),
  createStack = require('stact');

describe('Functional: indices', function () {
  var
    index = 'elasticsearch_test_functional_indices_' + Date.now(),
    client;

  before(function (done) {
    client = createClient({_index: index});
    client.indices.createIndex(done);
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

  describe('#alias', function () {
    it('should be able to create an alias', function (done) {
      client.indices.alias({alias: 'books'}, {}, function (err) {
        assert.ifError(err);
        done();
      });
    });

    it('should be able to query via alias', function (done) {
      client.get({_index: 'books', _type: 'book', _id: 'node1'}, function (err, result) {
        assert.ifError(err);
        assert.equal(result._source.title, 'What Is Node?');
        done();
      });
    });
  });

  describe('#aliases', function () {
    it('works');
  });

  describe('#analyze', function () {
    it('works');
  });

  describe('#clearCache', function () {
    it('works');
  });

  describe('#closeIndex', function () {
    it('works');
  });

  describe('#createIndex', function () {
    it('works');
  });

  describe('#createTemplate', function () {
    it('works');
  });

  describe('#deleteAlias', function () {
    it('should be able to delete an alias', function (done) {
      client.indices.deleteAlias({alias: 'books'}, function (err) {
        assert.ifError(err);
        client.get({_index: 'books', _type: 'book', _id: 'node2'}, function (err, result) {
          assert.equal(err.statusCode, 404);
          done();
        });
      });
    });
  });

  describe('#deleteIndex', function () {
    it('works');
  });

  describe('#deleteMapping', function () {
    it('works');
  });

  describe('#deleteTemplate', function () {
    it('works');
  });

  describe('#deleteWarmer', function () {
    it('works');
  });

  describe('#exists', function () {
    it('works');
  });

  describe('#flush', function () {
    it('works');
  });

  describe('#mappings', function () {
    it('works');
  });

  describe('#openIndex', function () {
    it('works');
  });

  describe('#optimize', function () {
    it('works');
  });

  describe('#putMapping', function () {
    it('works');
  });

  describe('#putWarmer', function () {
    it('works');
  });

  describe('#refresh', function () {
    it('works');
  });

  describe('#segments', function () {
    it('works');
  });

  describe('#settings', function () {
    it('works');
  });

  describe('#snapshot', function () {
    it('works');
  });

  describe('#stats', function () {
    it('works');
  });

  describe('#status', function () {
    it('works');
  });

  describe('#templates', function () {
    it('works');
  });

  describe('#updateSettings', function () {
    it('works');
  });

  describe('#warmers', function () {
    it('works');
  });
});
