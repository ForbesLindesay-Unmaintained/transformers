var transform = require('transform');
var transformers = require('transformers');
var express = require('express');
var loadEngine = require('load-engine');

var all = require('all');

var engines = [{}];
/*
Object.keys(transformers)
  .forEach(function (name) {
    if (transformers[name].name === name && name != 'html2jade' && name != 'dust') {
      engines.push(loadEngine(transformers[name].engines, {repl: false}));
    }
  })
*/
all(engines)
  .then(function () {
    var t = transform(__dirname)
      .using(function (t) {
        t.add('.jade', '.html', [['jade', {filter_mixin: filterMixin, pretty: false}], renderFilters])
        t.add('.js', '.js', 'uglify-js');
      })
      .grep(function (path) { return !(/node_modules/.test(path) || /build\.js/.test(path) || /includes\.jade/.test(path)); });
    var app = express();
    app.use(t.dynamically());
    app.listen(3000);
    //t.statically(require('path').join(__dirname, '..'));
  })
  .then(null, function (err) {
    process.nextTick(function () {
      throw err;
    });
  });


var nextRenderID = 0;
var renders = {};
function filterMixin(buf, type, options) {
  var start = buf.length;
  this.block();
  var str = buf.splice(start).join('');
  var indent = /^\n?( *)/.exec(str)[1];
  if (indent) {
    str = str.replace(new RegExp('^' + indent, 'gm'), '');
  }
  renders[nextRenderID] = [str, type, options || this.attributes || {}];
  buf.push('<RENDER>' + (nextRenderID++) + '</RENDER>');
}

function renderFilters(str, filename, cb) {
  var pattern = /<RENDER>(\d+)<\/RENDER>/g;
  var waiting = [];
  var results = {};
  var match;
  while (match = pattern.exec(str)) {
    (function (n) {
      var src = renders[n][0];
      var name = renders[n][1];
      var options = renders[n][2];
      if (!options.filename) {
        options.filename = filename;
      }
      waiting.push(transformers[name].render(src, options)
        .then(function (res) {
          results[n] = res;
        }));
    }(match[1]));
  }
  all(waiting)
    .then(function () {
      process.nextTick(function () {
        cb(null, str.replace(/<RENDER>(\d+)<\/RENDER>/g, function (_, n) {
          return results[n];
        }));
      });
    }, function (err) {
      process.nextTick(function () {
        cb(err);
      });
    });
}