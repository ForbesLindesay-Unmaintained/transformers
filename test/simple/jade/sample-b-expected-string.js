function anonymous(locals) {
jade.debug = [{ lineno: 1, filename: undefined }];
try {
var buf = [];
var locals_ = (locals || {}),user = locals_.user;jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
jade.debug.unshift({ lineno: 1, filename: jade.debug[0].filename });
buf.push("<strong>" + (jade.escape(null == (jade.interp = user.name) ? "" : jade.interp)));
jade.debug.unshift({ lineno: undefined, filename: jade.debug[0].filename });
jade.debug.shift();
buf.push("</strong>");
jade.debug.shift();
jade.debug.shift();;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade.debug[0].filename, jade.debug[0].lineno);
}
}
