var dirname = require('path').dirname;
var Transformer = require('./shared');

/**
 * Minifiers
 */

var uglifyJS = require('uglify-js');
exports.uglify = exports.uglifyJS = exports['uglify-js'] = new Transformer({
  name: 'uglify-js',
  engines: ['.'],
  outputFormats: ['js'],
  isMinifier: true,
  sync: function (str, options) {
    options.fromString = true;
    return this.cache(options) || this.cache(options, uglifyJS.minify(str, options).code);
  }
});

var uglifyCSS = require('css');
exports.uglifyCSS = exports['uglify-css'] = new Transformer({
  name: 'uglify-css',
  engines: ['.'],
  outputFormats: ['css'],
  isMinifier: true,
  sync: function (str, options) {
    options.compress = options.compress !== false && options.beautify !== true;
    return this.cache(options) || this.cache(options, uglifyCSS.stringify(uglifyCSS.parse(str), options));
  }
});

exports.uglifyJSON = exports['uglify-json'] = new Transformer({
  name: 'uglify-json',
  engines: ['.'],
  outputFormats: ['json'],
  isMinifier: true,
  sync: function (str, options) {
    return JSON.stringify(JSON.parse(str), null, options.beautify);
  }
});

/**
 * Synchronous Templating Languages
 */

function sync(str, options) {
  var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
  return tmpl(options);
}

exports.swig = new Transformer({
  name: 'swig',
  engines: ['swig'],
  outputFormats: ['xml'],
  sync: sync
});

exports.atpl = new Transformer({
  name: 'atpl',
  engines: ['atpl'],
  outputFormats: ['xml'],
  sync: function sync(str, options) {
    var tmpl = this.cache(options);
    if (!tmpl) {
      var cInfo = {cache: options.cache, filename: options.filename};
      if (options.filename) {
        delete options.filename; //atpl can't handle absolute windows file paths properly
      }
      tmpl = this.cache(cInfo, this.engine.compile(str, options));
    }
    return tmpl(options);
  }
});

exports.dot = new Transformer({
  name: 'dot',
  engines: ['dot'],
  outputFormats: ['xml'],
  sync: function sync(str, options) {
    var tmpl = this.cache(options) || this.cache(options, this.engine.template(str));
    return tmpl(options);
  }
});

exports.liquor = new Transformer({
  name: 'liquor',
  engines: ['liquor'],
  outputFormats: ['xml'],
  sync: sync
});

exports.ejs = new Transformer({
  name: 'ejs',
  engines: ['ejs'],
  outputFormats: ['xml', 'js'],
  sync: function (str, options) {
    if(this.outputFormat === 'xml'){
      return this.engine.render(str, options);
    } else {
      //compile to js
      try {
        options.client = true;
        return this.engine.compile(str, options).toString();
      } catch (err) {
        cb(err);
      }
    }
  }
});

exports.eco = new Transformer({
  name: 'eco',
  engines: ['eco'],
  outputFormats: ['xml'],
  sync: sync//N.B. eco's internal this.cache isn't quite right but this bypasses it
});

exports.jqtpl = new Transformer({
  name: 'jqtpl',
  engines: ['jqtpl'],
  outputFormats: ['xml'],
  sync: function (str, options) {
    var engine = this.engine;
    var key = (options.cache && options.filename) ? options.filename : '@';
    engine.compile(str, key);
    var res = this.engine.render(key, options);
    if (!(options.cache && options.filename)) {
      delete engine.cache[key];
    }
    this.cache(options, true); // caching handled internally
    return res;
  }
});

exports.haml = new Transformer({
  name: 'haml',
  engines: ['hamljs'],
  outputFormats: ['xml'],
  sync: sync
});

exports['haml-coffee'] = new Transformer({
  name: 'haml-coffee',
  engines: ['haml-coffee'],
  outputFormats: ['xml'],
  sync: sync
});

exports.whiskers = new Transformer({
  name: 'whiskers',
  engines: ['whiskers'],
  outputFormats: ['xml'],
  sync: sync
});

exports.hogan = new Transformer({
  name: 'hogan',
  engines: ['hogan.js'],
  outputFormats: ['xml'],
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    return tmpl.render(options, options.partials);
  }
});

exports.handlebars = new Transformer({
  name: 'handlebars',
  engines: ['handlebars'],
  outputFormats: ['xml'],
  sync: function(str, options){
    for (var partial in options.partials) {
      this.engine.registerPartial(partial, options.partials[partial]);
    }
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    return tmpl(options);
  }
});

exports.underscore = new Transformer({
  name: 'underscore',
  engines: ['underscore'],
  outputFormats: ['xml'],
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.template(str));
    return tmpl(options);
  }
});

exports.walrus = new Transformer({
  name: 'walrus',
  engines: ['walrus'],
  outputFormats: ['xml'],
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.parse(str));
    return tmpl.compile(options);
  }
});

exports.mustache = new Transformer({
  name: 'mustache',
  engines: ['mustache'],
  outputFormats: ['xml'],
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str));
    return tmpl(options, options.partials);
  }
});

exports.templayed = new Transformer({
  name: 'templayed',
  engines: ['templayed'],
  outputFormats: ['xml'],
  sync: function(str, options){
    var tmpl = this.cache(options) || this.cache(options, this.engine(str));
    return tmpl(options);
  }
});

exports.plates = new Transformer({
  name: 'plates',
  engines: ['plates'],
  outputFormats: ['xml'],
  sync: function(str, options){
    str = this.cache(options) || this.cache(options, str);
    return this.engine.bind(str, options, options.map);
  }
});

exports.mote = new Transformer({
  name: 'mote',
  engines: ['mote'],
  outputFormats: ['xml'],
  sync: sync
});

exports.toffee = new Transformer({
  name: 'toffee',
  engines: ['toffee'],
  outputFormats: ['xml'],
  sync: function (str, options) {
    var View = this.engine.view;
    var v = this.cache(options) || this.cache(options, new View(str, options));
    var res = v.run(options, require('vm').createContext({}));
    if (res[0]) throw res[0];
    else return res[1];
  }
});

exports.coffeekup = exports.coffeecup = new Transformer({
  name: 'coffeecup',
  engines: ['coffeecup', 'coffeekup'],
  outputFormats: ['xml'],
  sync: function (str, options) {
    var compiled = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    return compiled(options);
  }
});

/**
 * Asynchronous Templating Languages
 */

exports.just = new Transformer({
  name: 'just',
  engines: ['just'],
  outputFormats: ['xml'],
  sudoSync: true,
  async: function (str, options, cb) {
    var JUST = this.engine;
    var tmpl = this.cache(options) || this.cache(options, new JUST({ root: { page: str }}));
    tmpl.render('page', options, cb);
  }
});

exports.ect = new Transformer({
  name: 'ect',
  engines: ['ect'],
  outputFormats: ['xml'],
  sudoSync: true, // Always runs synchronously
  async: function (str, options, cb) {
    var ECT = this.engine;
    var tmpl = this.cache(options) || this.cache(options, new ECT({ root: { page: str }}));
    tmpl.render('page', options, cb);
  }
});

exports.jade = new Transformer({
  name: 'jade',
  engines: ['jade', 'then-jade'],
  outputFormats: ['xml', 'js'],
  sudoSync: 'The jade file FILENAME could not be rendered synchronously.  N.B. then-jade does not support synchronous rendering.',
  async: function (str, options, cb) {
    this.cache(options, true);//jade handles this.cache internally
    if(this.outputFormat === 'xml'){
      this.engine.render(str, options, cb);
    } else {
      //compile to js
      options.client = true;
      try {
        cb(null, this.engine.compile(str, options).toString());
      } catch (err) {
        cb(err);
      }
    }
  }
});

exports.dust = new Transformer({
  name: 'dust',
  engines: ['dust', 'dustjs-linkedin'],
  outputFormats: ['xml'],
  sudoSync: false,
  async: function (str, options, cb) {
    var ext = 'dust';
    var views = '.';

    if (options) {
      if (options.ext) ext = options.ext;
      if (options.views) views = options.views;
      if (options.settings && options.settings.views) views = options.settings.views;
    }

    this.engine.onLoad = function(path, callback){
      if ('' === extname(path)) path += '.' + ext;
      if ('/' !== path[0]) path = views + '/' + path;
      read(path, options, callback);
    };

    var tmpl = this.cache(options) || this.cache(options, this.engine.compileFn(str));
    if (options && !options.cache) this.engine.cache = {};//invalidate dust's internal cache
    tmpl(options, cb);
  }
});

exports.jazz = new Transformer({
  name: 'jazz',
  engines: ['jazz'],
  outputFormats: ['xml'],
  sudoSync: true, // except when an async function is passed to locals
  async: function (str, options, cb) {
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    tmpl.eval(options, function(str){
      cb(null, str);
    });
  }
});

exports.qejs = new Transformer({
  name: 'qejs',
  engines: ['qejs'],
  outputFormats: ['xml'],
  sudoSync: false,
  async: function (str, options, cb) {
    var tmpl = this.cache(options) || this.cache(options, this.engine.compile(str, options));
    tmpl(options).done(function (result) {
        cb(null, result);
    }, function (err) {
        cb(err);
    });
  }
});

/**
 * Stylesheet Languages
 */

exports.less = new Transformer({
  name: 'less',
  engines: ['less'],
  outputFormats: ['css'],
  sudoSync: 'The less file FILENAME could not be rendered synchronously.  This is usually because the file contains `@import url` statements.',
  async: function (str, options, cb) {
    var self = this;
    if (self.cache(options)) return cb(null, self.cache(options));
    if (options.filename) {
      options.paths = options.paths || [dirname(options.filename)];
    }
    //If this.cache is enabled, compress by default
    if (options.compress !== true && options.compress !== false) {
      options.compress = options.cache || false;
    }
    if (options.sudoSync) {
      options.syncImport = true;
    }
    var parser = new(this.engine.Parser)(options);
    parser.parse(str, function (err, tree) {
      try {
        if (err) throw err;
        var res = tree.toCSS(options);
        self.cache(options, res);
        cb(null, res);
      } catch (ex) {
        if (ex.constructor.name === 'LessError' && typeof ex === 'object') {
          ex.filename = ex.filename || '"Unkown Source"';
          var err = new Error(self.engine.formatError(ex, options).replace(/^[^:]+:/, ''), ex.filename, ex.line);
          err.name = ex.type;
          ex = err;
        }
        return cb(ex);
      }
    });
  }
});

exports.styl = exports.stylus = new Transformer({
  name: 'stylus',
  engines: ['stylus'],
  outputFormats: ['css'],
  sudoSync: true,// always runs synchronously
  async: function (str, options, cb) {
    var self = this;
    if (self.cache(options)) return cb(null, self.cache(options));
    if (options.filename) {
      options.paths = options.paths || [dirname(options.filename)];
    }
    //If this.cache is enabled, compress by default
    if (options.compress !== true && options.compress !== false) {
      options.compress = options.cache || false;
    }
    var stylus = this.engine(str);
    if (options.inline) {
      stylus = stylus.define('url', this.engine.url());
      delete options.inline;
    }
    for (var option in options) {
      if (option == 'use') continue; // skip for now
      stylus = stylus.set(option, options[option]);
    }
    if (options.use) {
      for (var i = 0; i < options.use.length; i++) {
        stylus = stylus.use(options.use[i]());
      }
      delete options.use;
    }
    stylus.render(function (err, res) {
      if (err) return cb(err);
      self.cache(options, res);
      cb(null, res);
    });
  }
});

exports.sass = new Transformer({
  name: 'sass',
  engines: ['sass'],
  outputFormats: ['css'],
  sync: function (str, options) {
    try {
      return this.cache(options) || this.cache(options, this.engine.render(str));
    } catch (ex) {
      if (options.filename) ex.message += ' in ' + options.filename;
      throw ex;
    }
  }
});

/**
 * Miscellaneous
 */

exports.md = exports.markdown = new Transformer({
  name: 'markdown',
  engines: ['marked', 'supermarked', 'markdown-js', 'markdown'],
  outputFormats: ['html'],
  sync: function (str, options) {
    var arg = options;
    if (this.engineName === 'markdown') arg = options.dialect; //even if undefined
    return this.cache(options) || this.cache(options, this.engine.parse(str, arg));
  }
});

exports.coffee = exports['coffee-script'] = exports.coffeescript = exports.coffeeScript = new Transformer({
  name: 'coffee-script',
  engines: ['coffee-script'],
  outputFormats: ['js'],
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, this.engine.compile(str, options));
  }
});

exports.cson = new Transformer({
  name: 'cson',
  engines: ['cson'],
  outputFormats: ['json'],
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, JSON.stringify(this.engine.parseSync(str)));
  }
});

exports.cdata = new Transformer({
  name: 'cdata',
  engines: ['.'],// `.` means "no dependency"
  outputFormats: ['xml'],
  sync: function (str, options) {
    var escaped = str.replace(/\]\]>/g, "]]]]><![CDATA[>");
    return this.cache(options) || this.cache(options, '<![CDATA[' + escaped + ']]>');
  }
});

exports["cdata-js"] = new Transformer({
  name: 'cdata-js',
  engines: ['.'],// `.` means "no dependency"
  outputFormats: ['xml'],
  sync: function (str, options) {
    var escaped = str.replace(/\]\]>/g, "]]]]><![CDATA[>");
    return this.cache(options) || this.cache(options, '//<![CDATA[\n' + escaped + '\n//]]>');
  }
});

exports["cdata-css"] = new Transformer({
  name: 'cdata-css',
  engines: ['.'],// `.` means "no dependency"
  outputFormats: ['xml'],
  sync: function (str, options) {
    var escaped = str.replace(/\]\]>/g, "]]]]><![CDATA[>");
    return this.cache(options) || this.cache(options, '/*<![CDATA[*/\n' + escaped + '\n/*]]>*/');
  }
});

exports.verbatim = new Transformer({
  name: 'verbatim',
  engines: ['.'],// `.` means "no dependency"
  outputFormat: 'xml',
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, str);
  }
});

exports.component = exports['component-js'] = new Transformer({
  name: 'component-js',
  engines: ['component-builder'],
  outputFormats: ['js'],
  async: function (str, options, cb) {
    if (this.cache(options)) return this.cache(options);
    var self = this;
    var builder = new this.engine(dirname(options.filename));
    if (options.development) {
      builder.development();
    }
    if (options.sourceURLs === true || (options.sourceURLs !== false && options.development)) {
      builder.addSourceURLs();
    }
    var path = require('path');
    builder.paths = (options.paths || ['components']).map(function (p) {
      if (path.resolve(p) === p) {
        return p;
      } else {
        return path.join(dirname(options.filename), p);
      }
    });
    builder.build(function (err, obj) {
      if (err) return cb(err);
      else return cb(null, self.cache(options, obj.require + obj.js));
    });
  }
});

exports['component-css'] = new Transformer({
  name: 'component-css',
  engines: ['component-builder'],
  outputFormats: ['css'],
  async: function (str, options, cb) {
    if (this.cache(options)) return this.cache(options);
    var self = this;
    var builder = new this.engine(dirname(options.filename));
    if (options.development) {
      builder.development();
    }
    if (options.sourceURLs === true || (options.sourceURLs !== false && options.development)) {
      builder.addSourceURLs();
    }
    var path = require('path');
    builder.paths = (options.paths || ['components']).map(function (p) {
      if (path.resolve(p) === p) {
        return p;
      } else {
        return path.join(dirname(options.filename), p);
      }
    });
    builder.build(function (err, obj) {
      if (err) return cb(err);
      else return cb(null, self.cache(options, obj.css));
    });
  }
});

exports['html2jade'] = new Transformer({
  name: 'html2jade',
  engines: ['html2jade'],
  outputFormats: ['jade'],
  async: function (str, options, cb) {
    return this.cache(options) || this.cache(options, this.engine.convertHtml(str, options, cb));
  }
});

exports['highlight'] = new Transformer({
  name: 'highlight',
  engines: ['highlight.js'],
  outputFormats: ['xml'],
  sync: function (str, options, cb) {
    if (this.cache(options)) return this.cache(options);
    if (options.lang) {
      try {
        return this.cache(options, this.engine.highlight(options.lang, str).value);
      } catch (ex) {}
    }
    if (options.auto || !options.lang) {
      try {
        return this.cache(options, this.engine.highlightAuto(str).value);
      } catch (ex) {}
    }
    return this.cache(options, str);
  }
});

/**
 * Marker transformers (they don't actually apply a transformation, but let you declare the 'outputFormats')
 */

exports.css = new Transformer({
  name: 'css',
  engines: ['.'],// `.` means "no dependency"
  outputFormats: ['css'],
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, str);
  }
});

exports.js = new Transformer({
  name: 'js',
  engines: ['.'],// `.` means "no dependency"
  outputFormats: ['js'],
  sync: function (str, options) {
    return this.cache(options) || this.cache(options, str);
  }
});
