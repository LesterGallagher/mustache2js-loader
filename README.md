![npm][npm][npm-url]
![deps][deps][deps-url]
![test][test][test-url]
![coverage][cover][cover-url]
![chat][chat][chat-url]

<div align="center">
  <img width="200" height="200"
    src="https://worldvectorlogo.com/logos/html5.svg">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" vspace="" hspace="25"
      src="https://worldvectorlogo.com/logos/webpack.svg">
  </a>
</div>

# html2js-loader

Exports HTML to javascript instructions. Create javascript functions from HTML templates.

## Install

```bash
npm i -D https://github.com/LesterGallagher/html2js-loader
```

## Usage

Add the html2js-loader to your webpack.config.js.

```js
{
  test: /\.html$/,
  use: {
    loader: 'html2js-loader',
    options: {}
  }
}
```

Now, simply import/require any html. For example:

```js
cosnt createList = require('./templates/list.html');
```

```html
<!-- templates/list.html -->
<ul role="list">
    <li>Item one</li>
    <li>Item two</li>
    <li>Item three</li>
</ul>
```

this will be converted to the following javascript:

```javascript
function createNode() {
var e_0 = document.createElement("ul");
e_0.setAttribute("role", "list");
var e_1 = document.createElement("li");
e_1.appendChild(document.createTextNode("Item one"));
e_0.appendChild(e_1);
var e_2 = document.createElement("li");
e_2.appendChild(document.createTextNode("Item two"));
e_0.appendChild(e_2);
var e_3 = document.createElement("li");
e_3.appendChild(document.createTextNode("Item three"));
e_0.appendChild(e_3);
return e_0;
}
```

You can use this online tool: [html2js.esstudio.site](https://html2js.esstudio.site) which will convert your html to javascript on the fly.  

The loader will optimize this code by injecting the following base code into your bundle:

```javascript
module.exports = {
    document_createDocumentFragment: () => {
        return document.createDocumentFragment();
    },
    document_createElement: name => {
        return document.createElement(name);
    },
    document_createTextNode: text => {
        return document.createTextNode(text);
    },
    appendChild: (parent, child) => {
        parent.appendChild(child);
    },
    setAttribute: (elem, key, value) => {
        elem.setAttribute(key, value);
    }
};
```

This will enable the compiler to name mangle these function calls. For example if we convert the following html:

```html
<ul role="list">
    <li>Item one</li>
    <li>Item two</li>
    <li>Item three</li>
</ul>
```

That will produce the following minified base code (this will only be included once):

```javascript
var a=function(e){return document.createElement(e)},b=function(e){return document.createTextNode(e)},c=function(e,f,g){return e.setAttribute(f,g)},d=function(e,f){return e.appendChild(f)}
```

And the following minified javascript instructions for the html template:

```javascript
var e=a("ul");c(e,"role","list");var f=a("li");d(f,b("Item one"));d(e,f);f=a("li");d(f,b("Item two"));d(e,f);f=a("li");d(f,b("Item three"));d(e,f);
```






