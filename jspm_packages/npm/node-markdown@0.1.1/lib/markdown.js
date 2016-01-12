/* */ 
var Showdown = new (require('./vendor/showdown/src/showdown').Showdown.converter)();
this.Markdown = function(text, stripUnwanted, allowedTags, allowedAttributes, forceProtocol) {
  var md = Showdown.makeHtml(text);
  if (stripUnwanted)
    return stripUnwantedHTML(md, allowedTags, allowedAttributes, forceProtocol);
  else
    return md;
};
var stripUnwantedHTML = function(html) {
  var allowedTags = arguments[1] || 'a|b|blockquote|code|del|dd|dl|dt|em|h1|h2|h3|' + 'i|img|li|ol|p|pre|sup|sub|strong|strike|ul|br|hr',
      allowedAttributes = arguments[2] || {
        'img': 'src|width|height|alt',
        'a': 'href',
        '*': 'title'
      },
      forceProtocol = arguments[3] || false,
      testAllowed = new RegExp('^(' + allowedTags.toLowerCase() + ')$'),
      findTags = /<(\/?)\s*([\w:\-]+)([^>]*)>/g,
      findAttribs = /(\s*)([\w:-]+)\s*=\s*(?:(?:(["'])([^\3]+?)(?:\3))|([^\s]+))/g;
  for (var i in allowedAttributes) {
    if (allowedAttributes.hasOwnProperty(i) && typeof allowedAttributes[i] === 'string') {
      allowedAttributes[i] = new RegExp('^(' + allowedAttributes[i].toLowerCase() + ')$');
    }
  }
  return html.replace(findTags, function(original, lslash, tag, params) {
    var tagAttr,
        wildcardAttr,
        rslash = params.substr(-1) == "/" && "/" || "";
    tag = tag.toLowerCase();
    if (!tag.match(testAllowed))
      return "";
    else {
      tagAttr = tag in allowedAttributes && allowedAttributes[tag];
      wildcardAttr = "*" in allowedAttributes && allowedAttributes["*"];
      if (!tagAttr && !wildcardAttr)
        return "<" + lslash + tag + rslash + ">";
      params = params.trim();
      if (rslash) {
        params = params.substr(0, params.length - 1);
      }
      params = params.replace(findAttribs, function(original, space, name, quot, value) {
        name = name.toLowerCase();
        if (!value && !quot) {
          value = "";
          quot = '"';
        } else if (!value) {
          value = quot;
          quot = '"';
        }
        if ((name == "href" || name == "src") && (value.trim().substr(0, "javascript:".length) == "javascript:" || value.trim().substr(0, "data:".length) == "data:")) {
          value = "#";
        }
        if (forceProtocol && (name == "href" || name == "src") && !/^[a-zA-Z]{3,5}:\/\//.test(value)) {
          value = "http://" + value;
        }
        if ((wildcardAttr && name.match(wildcardAttr)) || (tagAttr && name.match(tagAttr))) {
          return space + name + "=" + quot + value + quot;
        } else
          return "";
      });
      return "<" + lslash + tag + (params ? " " + params : "") + rslash + ">";
    }
  });
};
