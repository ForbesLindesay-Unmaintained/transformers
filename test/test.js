var transformers = require('../');
var fs = require('fs');
var path = require('path');
var expect = require('expect.js');

fs.readdirSync(path.join(__dirname, 'transformers'))
  .forEach(function (transformer) {
    if (!transformers[transformer]) {
      throw new Error(transformer + ' appears to be undefined.');
    }
    transformer = transformers[transformer];
    function locate(name) {
      return path.join(__dirname, 'transformers', transformer.name, name + '.txt');
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
      })
    });
  });