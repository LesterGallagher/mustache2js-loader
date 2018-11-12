const { JSDOM } = require('jsdom');
const config = require('./config');

const escapeRegExp = text => text.replace(/\r?\n\s*/gm, '\\n').replace(/"/g, '\\"');

const mustacheMatcher = text => text.replace(/{{\s*(\w+)\s*}}/g, ([match, inner]) => {
    return `" + locals.${inner} + "`;
});

const mustacheTextNodeToInstructions = (text) => {
    const content = '"' + mustacheMatcher(escapeRegExp(text)) + '"';
    return config.document.createTextNode(content);
};

exports.parse = (html, { functionName = 'createNode' } = {}) => {
    const { document, Node } = new JSDOM().window;

    var div = document.createElement('div');
    div.innerHTML = html;
    div.normalize();
    var res = 'function ' + functionName + '(locals = {}) {\n';
    var vi = 0;

    if (div.childNodes.length > 1) {
        res += 'var container = ' + config.document.createDocumentFragment() + ';\n';
        res += parseRecursive(div, 'container');
        res += 'return container;\n';
    } else {
        res += parseRecursive(div.childNodes[0], null);
    }
    res + '}';
    return res;

    function parseRecursive(elem, parent) {
        var ret = '';
        switch (elem.nodeType) {
            case Node.ELEMENT_NODE:
            break;
            case Node.TEXT_NODE:
            if (elem.textContent.trim() === '') return '';
            const textNodeInstruction = mustacheTextNodeToInstructions(elem.textContent);
            if (parent) ret += config.elem.appendChild(parent, textNodeInstruction) + ';\n';
            else ret += 'return ' + textNodeInstruction + ';\n';
            return ret;
            default: throw 'element with node type ' + elem.nodeType + ' should not be in loaded with this loader';
        }
        var name = 'e_' + vi++;
        ret += ('var ');
        ret += (name);
        ret += ' = ' + config.document.createElement(JSON.stringify(elem.tagName.toLowerCase())) + ';\n';
        var attrs = Array.prototype.slice.apply(elem.attributes);
        for (var i = 0; i < attrs.length; i++) {
            ret += config.elem.setAttribute(name, JSON.stringify(attrs[i].name), JSON.stringify(attrs[i].value)) + ';\n';
        }
        var children = Array.prototype.slice.apply(elem.childNodes);
        for (var j = 0; j < children.length; j++) {
            ret += parseRecursive(children[j], name);
        }
        if (parent) ret += config.elem.appendChild(parent, name) + ';\n';
        else ret += 'return ' + name + ';\n';
        return ret;
    }
}

const parserError = parsedDocument => {
    // parser and parsererrorNS could be cached on startup for efficiency
    var parser = new DOMParser(),
        errorneousParse = parser.parseFromString('<', 'text/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
        return parsedDocument.getElementsByTagName("parsererror").length > 0
            ? parsedDocument.children[0] : false;
    }

    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0
        ? parsedDocument.children[0] : false;
};