var transformers = require('../');
var fs = require('fs');
var path = require('path');
var expect = require('expect.js');
var clone = require('clone');

var opts = {
  user: {name: 'bob'}
};

fs.readdirSync(path.join(__dirname, 'simple'))
  .forEach(function (transformer) {
    if (!transformers[transformer]) {
      throw new Error(transformer + ' appears to be undefined.');
    }
    transformer = transformers[transformer];
    function locate(name) {
      return path.join(__dirname, 'simple', transformer.name, name);
    }
    var sampleLocate = {
      a: locate('sample-a.txt'),
      b: locate('sample-b.txt')
    };

    function read(name) {
      try {
        return (fs.readFileSync(locate(name)).toString()).trim().replace(/\r/g, '');
      } catch (ex) {
        return null;
      }
    }
    var sample = {
      a: read('sample-a.txt'),
      b: read('sample-b.txt')
    };
    transformer.outputFormats.forEach(function (format) {
      describe(transformer.name + ' > ' + format, function () {
        var t = clone(transformer); //bind to local context
        t.outputFormat = format;

        var sampleExpect = {
          a: read('sample-a-expected.' + t.outputFormat) || '<p>bob</p>',
          b: read('sample-b-expected.' + t.outputFormat) || '<strong>bob</strong>'
        };

        function testSyncronousOperation() {
          ['a', 'b'].forEach(function (l) {
            it('works from a string ' + l, function () {
              var new_opts = clone(opts);
              delete new_opts['filename']; //somehow the filename param was getting carried over from the last test... had to get rid of this
              var expected = read('sample-' + l + '-expected-string.' + t.outputFormat) || sampleExpect[l];
              var res = t.renderSync(sample[l], new_opts);
              expect(res.trim()).to.eql(expected);
            });
            it('works from a file ' + l, function () {
              var res = t.renderFileSync(sampleLocate[l], opts);
              expect(res.trim().replace(sampleLocate[l], 'FILENAME')).to.eql(sampleExpect[l]);
            });
          });
        }

        if (t.sync)
          describe('syncronous operation', testSyncronousOperation);
        else
          describe.skip('syncronous operation', testSyncronousOperation);

        describe('asyncronous operation', function () {
          ['a', 'b'].forEach(function (l) {
            it('works from a string ' + l, function (done) {
              var new_opts = clone(opts);
              delete new_opts['filename'];
              t.render(sample[l], new_opts, function (err, res) {
                var expected = read('sample-' + l + '-expected-string.' + t.outputFormat) || sampleExpect[l];
                if (err) return done(err);
                expect(res.trim()).to.eql(expected);
                done();
              });
            });
            it('works from a file ' + l, function (done) {
              t.renderFile(sampleLocate[l], opts, function (err, res) {
                if (err) return done(err);
                expect(res.trim().replace(sampleLocate[l], 'FILENAME')).to.eql(sampleExpect[l]);
                done();
              });
            });
          });
        });
      });
    });
  });

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
    expect(res.length).to.be.lessThan(82);
    expect(require('vm').runInNewContext(res)).to.be('Hello Forbes Lindesay!');
  });
  it('beautifies files with {mangle: false, compress: false, output: {beautify: true}}', function () {
    var res = transformers['uglify-js'].renderSync(str, {mangle: false, compress: false, output: {beautify: true}});
    expect(res).to.be('(function(name) {\n    function hello(world) {\n        return "Hello " + world + "!";\n    }\n    return hello(name);\n})("Forbes Lindesay");');
    expect(require('vm').runInNewContext(res)).to.be('Hello Forbes Lindesay!');
  });
});

describe('component', function () {
  var p = path.join(__dirname, 'fixtures', 'component', 'component.json');
  var output = path.join(__dirname, 'fixtures', 'component', 'build');
  function simplifyCSS(str) {
    return transformers['uglify-css'].renderSync(str);
  }
  describe('component-js', function () {
    it('builds the JavaScript file', function (done) {
      transformers['component-js'].renderFile(p, {}, function (err, res) {
        if (err) return done(err);
        expect(require('vm').runInNewContext(res + '\nrequire("foo")')).to.be('foo');
        done();
      });
    });
  });
  describe('component-css', function () {
    it('builds the CSS file', function (done) {
      transformers['component-css'].renderFile(p, {}, function (err, res) {
        if (err) return done(err);
        expect(simplifyCSS(res)).to.be("#foo{name:'bar'}#baz{name:'bing'}");
        done();
      });
    });
  });
});
