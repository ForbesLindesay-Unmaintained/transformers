# transformers

  String/Data transformations for use in templating libraries, static site generators and web frameworks.  This gathers the most useful transformations you can apply to text or data into one library with a consistent API.  Transformations can be pretty much anything but most are either compilers or templating engines.

## API

  To apply a transformation called `foo-bar` to a string `str` and a file at path `pth` with options `opts`:

  **N.B. note that you will need to also have the foo-bar library installed**

```javascript
var transfomers = require('tramsformers');

var transformer = transformers['foo-bar'];

var rendered = transformer.renderSync(str, opts);

transformer.render(str, opts, function (err, rendered) {
  //Some transformations can only be used asyncronously
});

var rendered = transformer.renderFileSync(pth, opts);

transformer.renderFile(pth, opts, function (err, res) {
  //Some transformations can only be used asyncronously
});
```

You can also make use of:

```javascript
transformers['foo-bar'].outputFormat;// => `xml`, `css` or `js`
transformers['foo-bar'].sync;// => `true` if it can be used syncronously
transformers['foo-bar'].sudoSync;// => `true` if not always syncronous (see `Libraries that don't work synchronously`)
transformers['foo-bar'].engines;// => an array of possible npm packages to use as the implementation
```

## Libraries that don't work synchronously

  The following transformations will always throw an exception if you attempt to run them synchronously:

   1. dust
   2. qejs

The following transformations sometimes throw an exception if run syncronously, typically they only throw an exception if you are doing something like including another file.  If you are not doing the things that cause them to fail then they are consistently safe to use syncronously.

   - jade (only when using `then-jade` instead of `jade`)
   - less (when `@import` is used)
   - stylus (when `@import` is used)
   - jazz (I don't have an example of where this fails, but I also don't know whether it does or not)

The following libraries look like they might sometimes throw exceptions when used syncronously (if you read the source) but they never actually do so:

   - just
   - ect

## Supported transforms

### Template engines

  - [atpl](http://documentup.com/soywiz/atpl.js) - Compatible with twig templates
  - [dust](http://documentup.com/akdubya/dustjs) [(website)](http://akdubya.github.com/dustjs/) - asyncronous templates
  - [eco](http://documentup.com/sstephenson/eco) - Embedded CoffeeScript templates
  - [ect](http://documentup.com/baryshev/ect) [(website)](http://ectjs.com/) - Embedded CoffeeScript templates
  - [ejs](http://documentup.com/visionmedia/ejs) - Embedded JavaScript templates
  - [haml](http://documentup.com/visionmedia/haml.js) [(website)](http://haml-lang.com/) - dry indented markup
  - [haml-coffee](http://documentup.com/netzpirat/haml-coffee/) [(website)](http://haml-lang.com/) - haml with embedded CoffeeScript
  - [handlebars](http://documentup.com/wycats/handlebars.js/) [(website)](http://handlebarsjs.com/) - extension of mustache templates
  - [hogan](http://documentup.com/twitter/hogan.js) [(website)](http://twitter.github.com/hogan.js/) - Mustache templates
  - [jade](http://documentup.com/visionmedia/jade) [(website)](http://jade-lang.com/) - robust, elegant, feature rich template engine
  - [jazz](http://documentup.com/shinetech/jazz)
  - [jqtpl](http://documentup.com/kof/jqtpl) [(website)](http://api.jquery.com/category/plugins/templates/) - extensible logic-less templates
  - [JUST](http://documentup.com/baryshev/just)
  - [liquor](http://documentup.com/chjj/liquor) - extended EJS with significant white space
  - [mustache](http://documentup.com/janl/mustache.js) - logic less templates
  - [QEJS](http://documentup.com/jepso/QEJS) - Promises + EJS for async templating
  - [swig](http://documentup.com/paularmstrong/swig) [(website)](http://paularmstrong.github.com/swig/) - Django-like templating engine
  - [toffee](http://documentup.com/malgorithms/toffee) - templating language based on coffeescript
  - [underscore](http://documentup.com/documentcloud/underscore) [(website)](http://documentcloud.github.com/underscore/)
  - [walrus](http://documentup.com/jeremyruppel/walrus) - A bolder kind of mustache
  - [whiskers](http://documentup.com/gsf/whiskers.js/tree/) - logic-less focused on readability

### Other

  - markdown - You can use `marked`, `supermarked`, `markdown-js` or `markdown
  - [coffee](http://coffeescript.org/) - `npm install coffee-script`
  - cdata - No need to install anything, just wrapps text in `<![CDATA[\nYOUR TEXT\n]]>`
  - [uglify](http://documentup.com/mishoo/UglifyJS2) - `npm install uglify-js` minifies javascript

Pull requests to add more transforms will always be accepted providing they are open-source, come with unit tests, and don't cause any of the tests to fail.