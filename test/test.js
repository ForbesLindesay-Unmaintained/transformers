var transformers = require('../');
var fs = require('fs');
var path = require('path');
var expect = require('expect.js');

fs.readdirSync(path.join(__dirname, 'simple')).forEach(
  function (transformer) {
    if (!transformers[transformer]) {
      throw new Error(transformer + ' appears to be undefined.');
    }
    transformer = transformers[transformer];
    function locate(name) {
      return path.join(__dirname, 'simple', transformer.name, name + '.txt');
    }
    function read(name) {
      try {
        return fs.readFileSync(locate(name)).toString();
      } catch (ex) {
        return null;
      }
    }
    describe(transformer.name, function () {
      var sampleA = read('sample-a');
      var sampleAExpected = (read('sample-a-expected') || '<p>bob</p>').replace(/\r/g, '');
      var sampleB = read('sample-b');
      var sampleBExpected = (read('sample-b-expected') || '<strong>bob</strong>').replace(/\r/g, '');
      if (transformer.sync) describe('syncronous operation', testSyncronousOperation);
      else describe.skip('syncronous operation', testSyncronousOperation);
      function testSyncronousOperation() {
        it('works from a string', function () {
          expect(transformer.renderSync(sampleA, {user: {name: 'bob'}})).to.be(sampleAExpected);
          expect(transformer.renderSync(sampleB, {user: {name: 'bob'}})).to.be(sampleBExpected);
        });
        it('works from a file', function () {
          expect(transformer.renderFileSync(locate('sample-a'), {user: {name: 'bob'}})).to.be(sampleAExpected);
          expect(transformer.renderFileSync(locate('sample-b'), {user: {name: 'bob'}})).to.be(sampleBExpected);
        });
      }
      describe('asyncronous operation', function () {
        it('works from a string A', function (done) {
          transformer.render(sampleA, {user: {name: 'bob'}}, function (err, res) {
            if (err) return done(err);
            expect(res).to.be(sampleAExpected);
            done();
          });
        });
        it('works from a string B', function (done) {
          transformer.render(sampleB, {user: {name: 'bob'}}, function (err, res) {
            if (err) return done(err);
            expect(res).to.be(sampleBExpected);
            done();
          });
        });
        it('works from a file A', function (done) {
          transformer.renderFile(locate('sample-a'), {user: {name: 'bob'}}, function (err, res) {
            if (err) return done(err);
            expect(res).to.be(sampleAExpected);
            done();
          });
        });
        it('works from a file B', function (done) {
          transformer.renderFile(locate('sample-b'), {user: {name: 'bob'}}, function (err, res) {
            if (err) return done(err);
            expect(res).to.be(sampleBExpected);
            done();
          });
        });
      });
    });
  }
);

function read(name) {
  try {
    return fs.readFileSync(locate(name)).toString();
  } catch (ex) {
    return null;
  }
}

describe('uglify-js', function () {
  var str = fs.readFileSync(path.join(__dirname, 'fixtures', 'uglify-js', 'script.js')).toString();
  it('minifies files', function () {
    var res = transformers['uglify-js'].renderSync(str, {});
    expect(res.length).to.be.lessThan(87);
    var called = false;;
    Function('console', res)({
      log: function (res) {
        called = true;
        expect(res).to.be('Hello Forbes Lindesay!');
      }
    });
    expect(called).to.be(true);
  });
  it('beautifies files with {mangle: false, compress: false, output: {beautify: true}}', function () {
    var res = transformers['uglify-js'].renderSync(str, {mangle: false, compress: false, output: {beautify: true}});
    var called = false;;
    Function('console', res)({
      log: function (res) {
        called = true;
        expect(res).to.be('Hello Forbes Lindesay!');
      }
    });
    expect(called).to.be(true);
  });
});

describe('stylus', function () {
  var p = path.join(__dirname, 'fixtures', 'stylus', 'sample.styl');
  var expected = path.join(__dirname, 'fixtures', 'stylus', 'expected.css');

  it('can define custom variables', function (done){
    transformers['stylus'].renderFile(p, { define: { custom_color: 'red', foo: 'bar' } }, function (err, res) {
      expect(res.replace(/\r/g, '')).to.be(fs.readFileSync(expected, 'utf8').replace(/\r/g, ''))
      done();
    });
  });
});

describe('handlebars', function () {
  var p = path.join(__dirname, 'fixtures', 'handlebars', 'sample.hbs');
  var expected = path.join(__dirname, 'fixtures', 'handlebars', 'expected.html');

  it('can define partials and helpers', function (done){
    var options = {
      user: {
        name: 'bob'
      },
      partials: {
        partial1: "<p>partial1 content</p>\n",
        partial2: "<p>partial2 content</p>\n"
      },
      helpers: {
        helper1: function() {
          return "content from helper";
        }
      }
    };
    transformers['handlebars'].renderFile(p, options, function (err, res) {
      expect(res.replace(/\r/g, '')).to.be(fs.readFileSync(expected, 'utf8').replace(/\r/g, ''));
      done();
    });
  });
});
