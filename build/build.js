var transform = require('transform');
var transformers = require('transformers');
var express = require('express');
var loadEngine = require('load-engine');

var all = require('then-all');

var engines = [];
/*
Object.keys(transformers)
  .forEach(function (name) {
    if (transformers[name].name === name && name != 'html2jade' && name != 'dust') {
      engines.push(loadEngine(transformers[name].engines, {repl: false}));
    }
  })
*/

function forward(v) {
  if (/home\.jade$/.test(v)) {
    return v.replace(/home\.jade$/, 'index.html');
  } else if (/\.jade$/.test(v)) {
    return v.replace(/\.jade$/, '/index.html');
  } else {
    return null;
  }
}
function backward(v) {
  if (/src(\/|\\)\w+(\/|\\)index\.html$/.test(v)) {
    return v.replace(/(\/|\\)index\.html$/, '.jade');
  } else  if (/(\/|\\)index\.html$/.test(v)) {
    return v.replace(/index\.html$/, 'home.jade');
  } else {
    return null;
  }
}
all(engines)
  .then(function () {
    var t = transform(require('path').join(__dirname, 'src'))
      .using(function (t) {
        t.add(forward, backward, [['jade', {filter_mixin: filterMixin, pretty: false}], renderFilters])
        t.add('.js', '.js', 'uglify-js');
        t.add('style.less', 'style.css', ['less', 'uglify-css']);
      })
      .grep(function (path) { return !(/node_modules/.test(path) || /build\.js/.test(path) || /head\.jade/.test(path) || /mixins\.jade/.test(path)); });
    var app = express();
    app.use(express.logger('dev'));
    app.use(function (req, res, next) {
      if (!/\./.test(req.path)) {
        if (!/\/$/g.test(req.path)) {
          return res.redirect(req.path + '/');
        }
        req.url = (req.url + '/index.html').replace(/\/\//g, '/');
      }
      next();
    });
    app.use(t.dynamically());
    app.listen(3000);
    t.statically(require('path').join(__dirname, '..'));
  })
  .then(null, function (err) {
    process.nextTick(function () {
      throw err;
    });
  });


var nextRenderID = 0;
var renders = {};
function filterMixin(buf, type, options, highlight) {
  var start = buf.length;
  this.block();
  var str = buf.splice(start).join('');
  var indent = /^\n?( *)/.exec(str)[1];
  if (indent) {
    str = str.replace(new RegExp('^' + indent, 'gm'), '');
  }
  renders[nextRenderID] = [str, type, options || this.attributes || {}, highlight];
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
      var highlight = renders[n][3];
      if (!options.filename) {
        options.filename = filename;
      }
      waiting.push((name === '@' ? new require('promise')(function (resolver) { resolver.fulfill(src) }) : transformers[name].render(src, options))
        .then(function (res) {
          if (highlight) {
            if (highlight === true) highlight = {};
            results[n] = transformers['highlight'].renderSync(res, typeof highlight === 'string' ? {lang: highlight} : highlight);
          } else {
            results[n] = res;
          }
        }, function (err) {
          results[n] = err.stack || err.message || JSON.stringify(err);
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