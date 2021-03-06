//alert('IMPORTANT: Remove this line from json_parse.js before deployment.');
/*!
    http://www.JSON.org/json_parse.js
    2009-05-31

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

/*members "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
    hasOwnProperty, message, n, name, push, r, t, text
*/

var json_parse = (function () {

// This is a function that can parse a JSON text, producing a JavaScript
// data structure. It is a simple, recursive descent parser. It does not use
// eval or regular expressions, so it can be used as a model for implementing
// a JSON parser in other languages.

// We are defining the function inside of another function to avoid creating
// global variables.

    var at,     // The index of the current character
        ch,     // The current character
        escapee = {
            '"':  '"',
            '\\': '\\',
            '/':  '/',
            b:    '\b',
            f:    '\f',
            n:    '\n',
            r:    '\r',
            t:    '\t'
        },
        text,

        error = function (m) {

// Call error when something is wrong.

            throw {
                name:    'SyntaxError',
                message: m,
                at:      at,
                text:    text
            };
        },

        next = function (c) {

// If a c parameter is provided, verify that it matches the current character.

            if (c && c !== ch) {
                error("Expected '" + c + "' instead of '" + ch + "'");
            }

// Get the next character. When there are no more characters,
// return the empty string.

            ch = text.charAt(at);
            at += 1;
            return ch;
        },

        number = function () {

// Parse a number value.

            var number,
                string = '';

            if (ch === '-') {
                string = '-';
                next('-');
            }
            while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
            }
            if (ch === '.') {
                string += '.';
                while (next() && ch >= '0' && ch <= '9') {
                    string += ch;
                }
            }
            if (ch === 'e' || ch === 'E') {
                string += ch;
                next();
                if (ch === '-' || ch === '+') {
                    string += ch;
                    next();
                }
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
            }
            number = +string;
            if (isNaN(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

        string = function () {

// Parse a string value.

            var hex,
                i,
                string = '',
                uffff;

// When parsing for string values, we must look for " and \ characters.

            if (ch === '"') {
                while (next()) {
                    if (ch === '"') {
                        next();
                        return string;
                    } else if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

        white = function () {

// Skip whitespace.

            while (ch && ch <= ' ') {
                next();
            }
        },

        word = function () {

// true, false, or null.

            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            }
            error("Unexpected '" + ch + "'");
        },

        value,  // Place holder for the value function.

        array = function () {

// Parse an array value.

            var array = [];

            if (ch === '[') {
                next('[');
                white();
                if (ch === ']') {
                    next(']');
                    return array;   // empty array
                }
                while (ch) {
                    array.push(value());
                    white();
                    if (ch === ']') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad array");
        },

        object = function () {

// Parse an object value.

            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                if (ch === '}') {
                    next('}');
                    return object;   // empty object
                }
                while (ch) {
                    key = string();
                    white();
                    next(':');
                    if (Object.hasOwnProperty.call(object, key)) {
                        error('Duplicate key "' + key + '"');
                    }
                    object[key] = value();
                    white();
                    if (ch === '}') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad object");
        };

    value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

        white();
        switch (ch) {
        case '{':
            return object();
        case '[':
            return array();
        case '"':
            return string();
        case '-':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

// Return the json_parse function. It will have access to all of the above
// functions and variables.

    return function (source, reviver) {
        var result;

        text = source;
        at = 0;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

// If there is a reviver function, we recursively walk the new structure,
// passing each name/value pair to the reviver function for possible
// transformation, starting with a temporary root object that holds the result
// in an empty key. If there is not a reviver function, we simply return the
// result.

        return typeof reviver === 'function' ? (function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }({'': result}, '')) : result;
    };
}());// timestamp: Sun, 06 Jan 2008 18:17:45
/*!
  base2 - copyright 2007-2008, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license.php
  
  Contributors:
    Doeke Zanstra
*/

var base2 = {
  name:    "base2",
  version: "1.0 (beta 2)",
  exports:
    "Base,Package,Abstract,Module,Enumerable,Map,Collection,RegGrp,"+
    "assert,assertArity,assertType,assignID,copy,detect,extend,"+
    "forEach,format,global,instanceOf,match,rescape,slice,trim,typeOf,"+
    "I,K,Undefined,Null,True,False,bind,delegate,flip,not,unbind",
  
  global: this, // the window object in a browser environment
  
  // this is defined here because it must be defined in the global scope
  detect: new function(_) {  
    // Two types of detection:
    //  1. Object detection
    //    e.g. detect("(java)");
    //    e.g. detect("!(document.addEventListener)");
    //  2. Platform detection (browser sniffing)
    //    e.g. detect("MSIE");
    //    e.g. detect("MSIE|opera");
        
    var global = _;
    var jscript = NaN/*@cc_on||@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
    var java = _.java ? true : false;
    if (_.navigator) {
      var MSIE = /MSIE[\d.]+/g;
      var element = document.createElement("span");
      // Close up the space between name and version number.
      //  e.g. MSIE 6 -> MSIE6
      var userAgent = navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
      // Fix opera's (and others) user agent string.
      if (!jscript) userAgent = userAgent.replace(MSIE, "");
      if (MSIE.test(userAgent)) userAgent = userAgent.match(MSIE)[0] + " " + userAgent.replace(MSIE, "");
      userAgent = navigator.platform + " " + userAgent;
      java &= navigator.javaEnabled();
    }
    
    return function(expression) {
      var r = false;
      var not = expression.charAt(0) == "!";
      if (not) expression = expression.slice(1);
      if (expression.charAt(0) == "(") {
        // Object detection.
        try {
          eval("r=!!" + expression);
        } catch (e) {
          // the test failed
        }
      } else {
        // Browser sniffing.
        r = new RegExp("(" + expression + ")", "i").test(userAgent);
      }
      return !!(not ^ r);
    };
  }(this)
};

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// base2/lang/header.js
// =========================================================================

var _namespace = "function base(o,a){return o.base.apply(o,a)};";
eval(_namespace);

var detect = base2.detect;

var Undefined = K(), Null = K(null), True = K(true), False = K(false);

// private
var _FORMAT = /%([1-9])/g;
var _LTRIM = /^\s\s*/;
var _RTRIM = /\s\s*$/;
var _RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;             // safe regular expressions
var _BASE = /eval/.test(detect) ? /\bbase\s*\(/ : /.*/; // some platforms don't allow decompilation
var _HIDDEN = ["constructor", "toString", "valueOf"];   // only override these when prototyping
var _MSIE_NATIVE_FUNCTION = detect("(jscript)") ?
  new RegExp("^" + rescape(isNaN).replace(/isNaN/, "\\w+") + "$") : {test: False};

var _counter = 1;
var _slice = Array.prototype.slice;

var slice = Array.slice || function(array) {
  return _slice.apply(array, _slice.call(arguments, 1));
};

_Function_forEach(); // make sure this is initialised

// =========================================================================
// base2/Base.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/03/base/

var _subclass = function(_instance, _static) {
  // Build the prototype.
  base2.__prototyping = this.prototype;
  var _prototype = new this;
  extend(_prototype, _instance);
  delete base2.__prototyping;
  
  // Create the wrapper for the constructor function.
  var _constructor = _prototype.constructor;
  function _class() {
    // Don't call the constructor function when prototyping.
    if (!base2.__prototyping) {
      if (this.constructor == arguments.callee || this.__constructing) {
        // Instantiation.
        this.__constructing = true;
        _constructor.apply(this, arguments);
        delete this.__constructing;
      } else {
        // Casting.
        return extend(arguments[0], _prototype);
      }
    }
    return this;
  };
  _prototype.constructor = _class;
  
  // Build the static interface.
  for (var i in Base) _class[i] = this[i];
  _class.ancestor = this;
  _class.base = Undefined;
  _class.init = Undefined;
  extend(_class, _static);
  _class.prototype = _prototype;
  _class.init();
  
  // introspection (removed when packed)
  ;;; _class.toString = K(String(_constructor));
  ;;; _class["#implements"] = [];
  ;;; _class["#implemented_by"] = [];
  
  return _class;
};

var Base = _subclass.call(Object, {
  constructor: function() {
    if (arguments.length > 0) {
      this.extend(arguments[0]);
    }
  },
  
  base: function() {
    // Call this method from any other method to invoke the current method's ancestor (super).
  },
  
  extend: delegate(extend)  
}, Base = {
  ancestorOf: delegate(_ancestorOf),
  
  extend: _subclass,
    
  forEach: delegate(_Function_forEach),
  
  implement: function(source) {
    if (typeof source == "function") {
      // If we are implementing another classs/module then we can use
      // casting to apply the interface.
      if (_ancestorOf(Base, source)) {
        source(this.prototype); // cast
        // introspection (removed when packed)
        ;;; this["#implements"].push(source);
        ;;; source["#implemented_by"].push(this);
      }
    } else {
      // Add the interface using the extend() function.
      extend(this.prototype, source);
    }
    return this;
  }
});

// =========================================================================
// base2/Package.js
// =========================================================================

var Package = Base.extend({
  constructor: function(_private, _public) {
    this.extend(_public);
    if (this.init) this.init();
    
    if (this.name != "base2") {
      if (!this.parent) this.parent = base2;
      this.parent.addName(this.name, this);
      this.namespace = format("var %1=%2;", this.name, String(this).slice(1, -1));
    }
    
    var LIST = /[^\s,]+/g; // pattern for comma separated list
    
    if (_private) {
      // This string should be evaluated immediately after creating a Package object.
      _private.imports = Array2.reduce(this.imports.match(LIST), function(namespace, name) {
        eval("var ns=base2." + name);
        assert(ns, format("Package not found: '%1'.", name), ReferenceError);
        return namespace += ns.namespace;
      }, _namespace + base2.namespace + JavaScript.namespace);
      
      // This string should be evaluated after you have created all of the objects
      // that are being exported.
      _private.exports = Array2.reduce(this.exports.match(LIST), function(namespace, name) {
        var fullName = this.name + "." + name;
        this.namespace += "var " + name + "=" + fullName + ";";
        return namespace += "if(!" + fullName + ")" + fullName + "=" + name + ";";
      }, "", this);
    }
  },

  exports: "",
  imports: "",
  name: "",
  namespace: "",
  parent: null,

  addName: function(name, value) {
    if (!this[name]) {
      this[name] = value;
      this.exports += "," + name;
      this.namespace += format("var %1=%2.%1;", name, this.name);
    }
  },

  addPackage: function(name) {
    this.addName(name, new Package(null, {name: name, parent: this}));
  },
  
  toString: function() {
    return format("[%1]", this.parent ? String(this.parent).slice(1, -1) + "." + this.name : this.name);
  }
});

// =========================================================================
// base2/Abstract.js
// =========================================================================

var Abstract = Base.extend({
  constructor: function() {
    throw new TypeError("Class cannot be instantiated.");
  }
});

// =========================================================================
// base2/Module.js
// =========================================================================

var Module = Abstract.extend(null, {
  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var module = this.base();
    // Inherit class methods.
    module.implement(this);
    // Implement module (instance AND static) methods.
    module.implement(_interface);
    // Implement static properties and methods.
    extend(module, _static);
    module.init();
    return module;
  },
  
  implement: function(_interface) {
    var module = this;
    if (typeof _interface == "function") {
      if (!_ancestorOf(_interface, module)) {
        this.base(_interface);
      }
      if (_ancestorOf(Module, _interface)) {
        // Implement static methods.
        forEach (_interface, function(property, name) {
          if (!module[name]) {
            if (typeof property == "function" && property.call && _interface.prototype[name]) {
              property = function() { // Late binding.
                return _interface[name].apply(_interface, arguments);
              };
            }
            module[name] = property;
          }
        });
      }
    } else {
      // Add static interface.
      extend(module, _interface);
      // Add instance interface.
      _Function_forEach (Object, _interface, function(source, name) {
        if (name.charAt(0) == "@") { // object detection
          if (detect(name.slice(1))) {
            forEach (source, arguments.callee);
          }
        } else if (typeof source == "function" && source.call) {
          module.prototype[name] = function() { // Late binding.
            var args = _slice.call(arguments);
            args.unshift(this);
            return module[name].apply(module, args);
          };
          ;;; module.prototype[name]._module = module; // introspection
        }
      });
    }
    return module;
  }
});

// =========================================================================
// base2/Enumerable.js
// =========================================================================

var Enumerable = Module.extend({
  every: function(object, test, context) {
    var result = true;
    try {
      this.forEach (object, function(value, key) {
        result = test.call(context, value, key, object);
        if (!result) throw StopIteration;
      });
    } catch (error) {
      if (error != StopIteration) throw error;
    }
    return !!result; // cast to boolean
  },
  
  filter: function(object, test, context) {
    var i = 0;
    return this.reduce(object, function(result, value, key) {
      if (test.call(context, value, key, object)) {
        result[i++] = value;
      }
      return result;
    }, []);
  },
  
  invoke: function(object, method) {
    // Apply a method to each item in the enumerated object.
    var args = _slice.call(arguments, 2);
    return this.map(object, (typeof method == "function") ? function(item) {
      return (item == null) ? undefined : method.apply(item, args);
    } : function(item) {
      return (item == null) ? undefined : item[method].apply(item, args);
    });
  },
  
  map: function(object, block, context) {
    var result = [], i = 0;
    this.forEach (object, function(value, key) {
      result[i++] = block.call(context, value, key, object);
    });
    return result;
  },
  
  pluck: function(object, key) {
    return this.map(object, function(item) {
      return (item == null) ? undefined : item[key];
    });
  },
  
  reduce: function(object, block, result, context) {
    var initialised = arguments.length > 2;
    this.forEach (object, function(value, key) {
      if (initialised) { 
        result = block.call(context, result, value, key, object);
      } else { 
        result = value;
        initialised = true;
      }
    });
    return result;
  },
  
  some: function(object, test, context) {
    return !this.every(object, not(test), context);
  }
}, {
  forEach: forEach
});


// =========================================================================
// base2/Map.js
// =========================================================================

// http://wiki.ecmascript.org/doku.php?id=proposals:dictionary

var _HASH = "#";

var Map = Base.extend({
  constructor: function(values) {
    this.merge(values);
  },

  copy: delegate(copy),

  forEach: function(block, context) {
    for (var key in this) if (key.charAt(0) == _HASH) {
      block.call(context, this[key], key.slice(1), this);
    }
  },

  get: function(key) {
    return this[_HASH + key];
  },

  getKeys: function() {
    return this.map(flip(I));
  },

  getValues: function() {
    return this.map(I);
  },

  // Ancient browsers throw an error when we use "in" as an operator.
  has: function(key) {
  /*@cc_on @*/
  /*@if (@_jscript_version < 5.5)
    return $Legacy.has(this, _HASH + key);
  @else @*/
    return _HASH + key in this;
  /*@end @*/
  },

  merge: function(values) {
    var put = flip(this.put);
    forEach (arguments, function(values) {
      forEach (values, put, this);
    }, this);
    return this;
  },

  remove: function(key) {
    delete this[_HASH + key];
  },

  put: function(key, value) {
    if (arguments.length == 1) value = key;
    // create the new entry (or overwrite the old entry).
    this[_HASH + key] = value;
  },

  size: function() {
    // this is expensive because we are not storing the keys
    var size = 0;
    for (var key in this) if (key.charAt(0) == _HASH) size++;
    return size;
  },

  union: function(values) {
    return this.merge.apply(this.copy(), arguments);
  }
});

Map.implement(Enumerable);

// =========================================================================
// base2/Collection.js
// =========================================================================

// A Map that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, put, insertAt, putAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var _KEYS = "~";

var Collection = Map.extend({
  constructor: function(values) {
    this[_KEYS] = new Array2;
    this.base(values);
  },
  
  add: function(key, item) {
    // Duplicates not allowed using add().
    // But you can still overwrite entries using put().
    assert(!this.has(key), "Duplicate key '" + key + "'.");
    this.put.apply(this, arguments);
  },

  copy: function() {
    var copy = this.base();
    copy[_KEYS] = this[_KEYS].copy();
    return copy;
  },

  forEach: function(block, context) { // optimised (refers to _HASH)
    var keys = this[_KEYS];
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      block.call(context, this[_HASH + keys[i]], keys[i], this);
    }
  },

  getAt: function(index) {
    if (index < 0) index += this[_KEYS].length; // starting from the end
    var key = this[_KEYS][index];
    return (key === undefined)  ? undefined : this[_HASH + key];
  },

  getKeys: function() {
    return this[_KEYS].concat();
  },

  indexOf: function(key) {
    return this[_KEYS].indexOf(String(key));
  },

  insertAt: function(index, key, item) {
    assert(Math.abs(index) < this[_KEYS].length, "Index out of bounds.");
    assert(!this.has(key), "Duplicate key '" + key + "'.");
    this[_KEYS].insertAt(index, String(key));
    this[_HASH + key] == null; // placeholder
    this.put.apply(this, _slice.call(arguments, 1));
  },
  
  item: function(keyOrIndex) {
    return this[typeof keyOrIndex == "number" ? "getAt" : "get"](keyOrIndex);
  },

  put: function(key, item) {
    if (arguments.length == 1) item = key;
    if (!this.has(key)) {
      this[_KEYS].push(String(key));
    }
    var klass = this.constructor;
    if (klass.Item && !instanceOf(item, klass.Item)) {
      item = klass.create.apply(klass, arguments);
    }
    this[_HASH + key] = item;
  },

  putAt: function(index, item) {
    assert(Math.abs(index) < this[_KEYS].length, "Index out of bounds.");
    arguments[0] = this[_KEYS].item(index);
    this.put.apply(this, arguments);
  },

  remove: function(key) {
    // The remove() method of the Array object can be slow so check if the key exists first.
    if (this.has(key)) {
      this[_KEYS].remove(String(key));
      delete this[_HASH + key];
    }
  },

  removeAt: function(index) {
    var key = this[_KEYS].removeAt(index);
    delete this[_HASH + key];
  },

  reverse: function() {
    this[_KEYS].reverse();
    return this;
  },

  size: function() {
    return this[_KEYS].length;
  },

  sort: function(compare) { // optimised (refers to _HASH)
    if (compare) {
      var self = this;
      this[_KEYS].sort(function(key1, key2) {
        return compare(self[_HASH + key1], self[_HASH + key2], key1, key2);
      });
    } else this[_KEYS].sort();
    return this;
  },

  toString: function() {
    return String(this[_KEYS]);
  }
}, {
  Item: null, // If specified, all members of the collection must be instances of Item.
  
  create: function(key, item) {
    return this.Item ? new this.Item(key, item) : item;
  },
  
  extend: function(_instance, _static) {
    var klass = this.base(_instance);
    klass.create = this.create;
    extend(klass, _static);
    if (!klass.Item) {
      klass.Item = this.Item;
    } else if (typeof klass.Item != "function") {
      klass.Item = (this.Item || Base).extend(klass.Item);
    }
    klass.init();
    return klass;
  }
});

// =========================================================================
// base2/RegGrp.js
// =========================================================================

// A collection of regular expressions and their associated replacement values.
// A Base class for creating parsers.

var _RG_BACK_REF        = /\\(\d+)/g,
    _RG_ESCAPE_CHARS    = /\\./g,
    _RG_ESCAPE_BRACKETS = /\(\?[:=!]|\[[^\]]+\]/g,
    _RG_BRACKETS        = /\(/g,
    _RG_LOOKUP          = /\$(\d+)/,
    _RG_LOOKUP_SIMPLE   = /^\$\d+$/;

var RegGrp = Collection.extend({
  constructor: function(values, flags) {
    this.base(values);
    if (typeof flags == "string") {
      this.global = /g/.test(flags);
      this.ignoreCase = /i/.test(flags);
    }
  },

  global: true, // global is the default setting
  ignoreCase: false,

  exec: function(string, replacement) { // optimised (refers to _HASH/_KEYS)
    var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
    string = String(string) + ""; // type-safe
    if (arguments.length == 1) {
      var self = this;
      var keys = this[_KEYS];
      replacement = function(match) {
        if (match) {
          var item, offset = 1, i = 0;
          // Loop through the RegGrp items.
          while ((item = self[_HASH + keys[i++]])) {
            var next = offset + item.length + 1;
            if (arguments[offset]) { // do we have a result?
              var replacement = item.replacement;
              switch (typeof replacement) {
                case "function":
                  return replacement.apply(self, _slice.call(arguments, offset, next));
                case "number":
                  return arguments[offset + replacement];
                default:
                  return replacement;
              }
            }
            offset = next;
          }
        }
        return "";
      };
    }
    return string.replace(new RegExp(this, flags), replacement);
  },

  insertAt: function(index, expression, replacement) {
    if (instanceOf(expression, RegExp)) {
      arguments[1] = expression.source;
    }
    return base(this, arguments);
  },

  test: function(string) {
    return this.exec(string) != string;
  },
  
  toString: function() {
    var length = 0;
    return "(" + this.map(function(item) {
      // Fix back references.
      var ref = String(item).replace(_RG_BACK_REF, function(match, index) {
        return "\\" + (1 + Number(index) + length);
      });
      length += item.length + 1;
      return ref;
    }).join(")|(") + ")";
  }
}, {
  IGNORE: "$0",
  
  init: function() {
    forEach ("add,get,has,put,remove".split(","), function(name) {
      _override(this, name, function(expression) {
        if (instanceOf(expression, RegExp)) {
          arguments[0] = expression.source;
        }
        return base(this, arguments);
      });
    }, this.prototype);
  },
  
  Item: {
    constructor: function(expression, replacement) {
      if (typeof replacement == "number") replacement = String(replacement);
      else if (replacement == null) replacement = "";    
      
      // does the pattern use sub-expressions?
      if (typeof replacement == "string" && _RG_LOOKUP.test(replacement)) {
        // a simple lookup? (e.g. "$2")
        if (_RG_LOOKUP_SIMPLE.test(replacement)) {
          // store the index (used for fast retrieval of matched strings)
          replacement = parseInt(replacement.slice(1));
        } else { // a complicated lookup (e.g. "Hello $2 $1")
          // build a function to do the lookup
          var Q = /'/.test(replacement.replace(/\\./g, "")) ? '"' : "'";
          replacement = replacement.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q +
            "+(arguments[$1]||" + Q+Q + ")+" + Q);
          replacement = new Function("return " + Q + replacement.replace(/(['"])\1\+(.*)\+\1\1$/, "$1") + Q);
        }
      }
      
      this.length = RegGrp.count(expression);
      this.replacement = replacement;
      this.toString = K(String(expression));
    },
    
    length: 0,
    replacement: ""
  },
  
  count: function(expression) {
    // Count the number of sub-expressions in a RegExp/RegGrp.Item.
    expression = String(expression).replace(_RG_ESCAPE_CHARS, "").replace(_RG_ESCAPE_BRACKETS, "");
    return match(expression, _RG_BRACKETS).length;
  }
});

// =========================================================================
// JavaScript/package.js
// =========================================================================

var JavaScript = {
  name:      "JavaScript",
  version:   base2.version,
  exports:   "Array2,Date2,String2",
  namespace: "", // fixed later
  
  bind: function(host) {
    forEach (this.exports.match(/\w+/g), function(name2) {
      var name = name2.slice(0, -1);
      extend(host[name], this[name2]);
      this[name2](host[name].prototype); // cast
    }, this);
    return this;
  }
};

// =========================================================================
// JavaScript/~/Date.js
// =========================================================================

// Fix Date.get/setYear() (IE5-7)

if ((new Date).getYear() > 1900) {
  Date.prototype.getYear = function() {
    return this.getFullYear() - 1900;
  };
  Date.prototype.setYear = function(year) {
    return this.setFullYear(year + 1900);
  };
}

// =========================================================================
// JavaScript/~/Function.js
// =========================================================================

// Some browsers don't define this.

Function.prototype.prototype = {};

// =========================================================================
// JavaScript/~/String.js
// =========================================================================

// A KHTML bug.

if ("".replace(/^/, K("$$")) == "$") {
  extend(String.prototype, "replace", function(expression, replacement) {
    if (typeof replacement == "function") {
      var fn = replacement;
      replacement = function() {
        return String(fn.apply(null, arguments)).split("$").join("$$");
      };
    }
    return this.base(expression, replacement);
  });
}

// =========================================================================
// JavaScript/Array2.js
// =========================================================================

var Array2 = _createObject2(
  Array,
  Array,
  "concat,join,pop,push,reverse,shift,slice,sort,splice,unshift", // generics
  [Enumerable, {
    combine: function(keys, values) {
      // Combine two arrays to make a hash.
      if (!values) values = keys;
      return this.reduce(keys, function(hash, key, index) {
        hash[key] = values[index];
        return hash;
      }, {});
    },

    contains: function(array, item) {
      return this.indexOf(array, item) != -1;
    },

    copy: function(array) {
      var copy = _slice.call(array);
      if (!copy.swap) this(copy); // cast to Array2
      return copy;
    },

    flatten: function(array) {
      var length = 0;
      return this.reduce(array, function(result, item) {
        if (this.like(item)) {
          this.reduce(item, arguments.callee, result, this);
        } else {
          result[length++] = item;
        }
        return result;
      }, [], this);
    },
    
    forEach: _Array_forEach,
    
    indexOf: function(array, item, fromIndex) {
      var length = array.length;
      if (fromIndex == null) {
        fromIndex = 0;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, length + fromIndex);
      }
      for (var i = fromIndex; i < length; i++) {
        if (array[i] === item) return i;
      }
      return -1;
    },
    
    insertAt: function(array, index, item) {
      this.splice(array, index, 0, item);
      return item;
    },
    
    item: function(array, index) {
      if (index < 0) index += array.length; // starting from the end
      return array[index];
    },
    
    lastIndexOf: function(array, item, fromIndex) {
      var length = array.length;
      if (fromIndex == null) {
        fromIndex = length - 1;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, length + fromIndex);
      }
      for (var i = fromIndex; i >= 0; i--) {
        if (array[i] === item) return i;
      }
      return -1;
    },
  
    map: function(array, block, context) {
      var result = [];
      this.forEach (array, function(item, index) {
        result[index] = block.call(context, item, index, array);
      });
      return result;
    },
    
    remove: function(array, item) {
      var index = this.indexOf(array, item);
      if (index != -1) this.removeAt(array, index);
      return item;
    },

    removeAt: function(array, index) {
      return this.splice(array, index, 1);
    },

    swap: function(array, index1, index2) {
      if (index1 < 0) index1 += array.length; // starting from the end
      if (index2 < 0) index2 += array.length;
      var temp = array[index1];
      array[index1] = array[index2];
      array[index2] = temp;
      return array;
    }
  }]
);

Array2.reduce = Enumerable.reduce; // Mozilla does not implement the thisObj argument

Array2.like = function(object) {
  // is the object like an array?
  return !!(object && typeof object == "object" && typeof object.length == "number");
};

// introspection (removed when packed)
;;; Enumerable["#implemented_by"].pop();
;;; Enumerable["#implemented_by"].push(Array2);

// =========================================================================
// JavaScript/Date2.js
// =========================================================================

// http://developer.mozilla.org/es4/proposals/date_and_time.html

// big, ugly, regular expression
var _DATE_PATTERN = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/;  
var _DATE_PARTS = { // indexes to the sub-expressions of the RegExp above
  FullYear: 2,
  Month: 4,
  Date: 6,
  Hours: 8,
  Minutes: 10,
  Seconds: 12,
  Milliseconds: 14
};
var _TIMEZONE_PARTS = { // idem, but without the getter/setter usage on Date object
  Hectomicroseconds: 15, // :-P
  UTC: 16,
  Sign: 17,
  Hours: 18,
  Minutes: 20
};

var _TRIM_ZEROES   = /(((00)?:0+)?:0+)?\.0+$/;
var _TRIM_TIMEZONE = /(T[0-9:.]+)$/;

var Date2 = _createObject2(
  Date, 
  function(yy, mm, dd, h, m, s, ms) {
    switch (arguments.length) {
      case 0: return new Date;
      case 1: return new Date(yy);
      default: return new Date(yy, mm, arguments.length == 2 ? 1 : dd, h || 0, m || 0, s || 0, ms || 0);
    }
  }, "", [{
    toISOString: function(date) {
      var string = "####-##-##T##:##:##.###";
      for (var part in _DATE_PARTS) {
        string = string.replace(/#+/, function(digits) {
          var value = date["getUTC" + part]();
          if (part == "Month") value++; // js month starts at zero
          return ("000" + value).slice(-digits.length); // pad
        });
      }
      // remove trailing zeroes, and remove UTC timezone, when time's absent
      return string.replace(_TRIM_ZEROES, "").replace(_TRIM_TIMEZONE, "$1Z");
    }
  }]
);

Date2.now = function() {
  return (new Date).valueOf(); // milliseconds since the epoch
};

Date2.parse = function(string, defaultDate) {
  if (arguments.length > 1) {
    assertType(defaultDate, "number", "defaultDate should be of type 'number'.")
  }
  // parse ISO date
  var match = String(string).match(_DATE_PATTERN);
  if (match) {
    if (match[_DATE_PARTS.Month]) match[_DATE_PARTS.Month]--; // js months start at zero
    // round milliseconds on 3 digits
    if (match[_TIMEZONE_PARTS.Hectomicroseconds] >= 5) match[_DATE_PARTS.Milliseconds]++;
    var date = new Date(defaultDate || 0);
    var prefix = match[_TIMEZONE_PARTS.UTC] || match[_TIMEZONE_PARTS.Hours] ? "UTC" : "";
    for (var part in _DATE_PARTS) {
      var value = match[_DATE_PARTS[part]];
      if (!value) continue; // empty value
      // set a date part
      date["set" + prefix + part](value);
      // make sure that this setting does not overflow
      if (date["get" + prefix + part]() != match[_DATE_PARTS[part]]) {
        return NaN;
      }
    }
    // timezone can be set, without time being available
    // without a timezone, local timezone is respected
    if (match[_TIMEZONE_PARTS.Hours]) {
      var Hours = Number(match[_TIMEZONE_PARTS.Sign] + match[_TIMEZONE_PARTS.Hours]);
      var Minutes = Number(match[_TIMEZONE_PARTS.Sign] + (match[_TIMEZONE_PARTS.Minutes] || 0));
      date.setUTCMinutes(date.getUTCMinutes() + (Hours * 60) + Minutes);
    } 
    return date.valueOf();
  } else {
    return Date.parse(string);
  }
};

// =========================================================================
// JavaScript/String2.js
// =========================================================================

var String2 = _createObject2(
  String, 
  function(string) {
    return new String(arguments.length == 0 ? "" : string);
  },
  "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase",
  [{trim: trim}]
);

// =========================================================================
// JavaScript/functions.js
// =========================================================================

function _createObject2(Native, constructor, generics, extensions) {
  // Clone native objects and extend them.

  // Create a Module that will contain all the new methods.
  var INative = Module.extend();
  // http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics
  forEach (generics.match(/\w+/g), function(name) {
    INative[name] = unbind(Native.prototype[name]);
  });
  forEach (extensions, INative.implement, INative);

  // create a faux constructor that augments the native object
  var Native2 = function() {
    return INative(this.constructor == INative ? constructor.apply(null, arguments) : arguments[0]);
  };
  Native2.prototype = INative.prototype;

  // Remove methods that are already implemented.
  forEach (INative, function(method, name) {
    if (Native[name]) {
      INative[name] = Native[name];
      delete INative.prototype[name];
    }
    Native2[name] = INative[name];
  });
  Native2.ancestor = Object;
  delete Native2.extend;
  if (Native != Array) delete Native2.forEach; 

  return Native2;
};

// =========================================================================
// lang/extend.js
// =========================================================================

function extend(object, source) { // or extend(object, key, value)
  if (object && source) {
    if (arguments.length > 2) { // Extending with a key/value pair.
      var key = source;
      source = {};
      source[key] = arguments[2];
    }
    var proto = (typeof source == "function" ? Function : Object).prototype;
    // Add constructor, toString etc
    var i = _HIDDEN.length, key;
    if (base2.__prototyping) {
      while (key = _HIDDEN[--i]) {
        var value = source[key];
        if (value != proto[key]) {
          if (_BASE.test(value)) {
            _override(object, key, value)
          } else {
            object[key] = value;
          }
        }
      }
    }
    // Copy each of the source object's properties to the target object.
    for (key in source) {
      if (proto[key] === undefined) {
        var value = source[key];
        // Object detection.
        if (key.charAt(0) == "@") {
          if (detect(key.slice(1))) arguments.callee(object, value);
          continue;
        }
        // Check for method overriding.
        var ancestor = object[key];
        if (ancestor && typeof value == "function") {
          if (value != ancestor && (!ancestor.method || !_ancestorOf(value, ancestor))) {
            if (_BASE.test(value)) {
              _override(object, key, value);
            } else {
              value.ancestor = ancestor;
              object[key] = value;
            }
          }
        } else {
          object[key] = value;
        }
      }
    }
  }
  return object;
};

function _ancestorOf(ancestor, fn) {
  // Check if a function is in another function's inheritance chain.
  while (fn) {
    if (!fn.ancestor) return false;
    fn = fn.ancestor;
    if (fn == ancestor) return true;
  }
  return false;
};

function _override(object, name, method) {
  // Override an existing method.
  var ancestor = object[name];
  var superObject = base2.__prototyping; // late binding for classes
  if (superObject && ancestor != superObject[name]) superObject = null;
  function _base() {
    var previous = this.base;
    this.base = superObject ? superObject[name] : ancestor;
    var returnValue = method.apply(this, arguments);
    this.base = previous;
    return returnValue;
  };
  _base.ancestor = ancestor;
  object[name] = _base;
  // introspection (removed when packed)
  ;;; _base.toString = K(String(method));
};

// =========================================================================
// lang/forEach.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/07/enum/

if (typeof StopIteration == "undefined") {
  StopIteration = new Error("StopIteration");
}

function forEach(object, block, context, fn) {
  if (object == null) return;
  if (!fn) {
    if (typeof object == "function" && object.call) {
      // Functions are a special case.
      fn = Function;
    } else if (typeof object.forEach == "function" && object.forEach != arguments.callee) {
      // The object implements a custom forEach method.
      object.forEach(block, context);
      return;
    } else if (typeof object.length == "number") {
      // The object is array-like.
      _Array_forEach(object, block, context);
      return;
    }
  }
  _Function_forEach(fn || Object, object, block, context);
};

// These are the two core enumeration methods. All other forEach methods
//  eventually call one of these two.

function _Array_forEach(array, block, context) {
  if (array == null) return;
  var length = array.length, i; // preserve length
  if (typeof array == "string") {
    for (i = 0; i < length; i++) {
      block.call(context, array.charAt(i), i, array);
    }
  } else { // Cater for sparse arrays.
    for (i = 0; i < length; i++) {    
    /*@cc_on @*/
    /*@if (@_jscript_version < 5.2)
      if ($Legacy.has(array, i))
    @else @*/
      if (i in array)
    /*@end @*/
        block.call(context, array[i], i, array);
    }
  }
};

function _Function_forEach(fn, object, block, context) {
  // http://code.google.com/p/base2/issues/detail?id=10
  
  // Run the test for Safari's buggy enumeration.
  var Temp = function(){this.i=1};
  Temp.prototype = {i:1};
  var count = 0;
  for (var i in new Temp) count++;
  
  // Overwrite the main function the first time it is called.
  _Function_forEach = (count > 1) ? function(fn, object, block, context) {
    // Safari fix (pre version 3)
    var processed = {};
    for (var key in object) {
      if (!processed[key] && fn.prototype[key] === undefined) {
        processed[key] = true;
        block.call(context, object[key], key, object);
      }
    }
  } : function(fn, object, block, context) {
    // Enumerate an object and compare its keys with fn's prototype.
    for (var key in object) {
      if (fn.prototype[key] === undefined) {
        block.call(context, object[key], key, object);
      }
    }
  };
  
  _Function_forEach(fn, object, block, context);
};

// =========================================================================
// lang/typeOf.js
// =========================================================================

// http://wiki.ecmascript.org/doku.php?id=proposals:typeof

function typeOf(object) {
  var type = typeof object;
  switch (type) {
    case "object":
      return object === null ? "null" : typeof object.call == "function" || _MSIE_NATIVE_FUNCTION.test(object) ? "function" : type;
    case "function":
      return typeof object.call == "function" ? type : "object";
    default:
      return type;
  }
};

// =========================================================================
// lang/instanceOf.js
// =========================================================================

function instanceOf(object, klass) {
  // Handle exceptions where the target object originates from another frame.
  // This is handy for JSON parsing (amongst other things).
  
  if (typeof klass != "function") {
    throw new TypeError("Invalid 'instanceOf' operand.");
  }

  if (object == null) return false;
  
  /*@cc_on  
  // COM objects don't have a constructor
  if (typeof object.constructor != "function") {
    return typeOf(object) == typeof klass.prototype.valueOf();
  }
  @*/
  /*@if (@_jscript_version < 5.1)
    if ($Legacy.instanceOf(object, klass)) return true;
  @else @*/
    if (object instanceof klass) return true;
  /*@end @*/

  // If the class is a base2 class then it would have passed the test above.
  if (Base.ancestorOf == klass.ancestorOf) return false;
  
  // base2 objects can only be instances of Object.
  if (Base.ancestorOf == object.constructor.ancestorOf) return klass == Object;
  
  switch (klass) {
    case Array: // This is the only troublesome one.
      return !!(typeof object == "object" && object.join && object.splice);
    case Function:
      return typeOf(object) == "function";
    case RegExp:
      return typeof object.constructor.$1 == "string";
    case Date:
      return !!object.getTimezoneOffset;
    case String:
    case Number:  // These are bullet-proof.
    case Boolean:
      return typeof object == typeof klass.prototype.valueOf();
    case Object:
      return true;
  }
  
  return false;
};

// =========================================================================
// lang/assert.js
// =========================================================================

function assert(condition, message, ErrorClass) {
  if (!condition) {
    throw new (ErrorClass || Error)(message || "Assertion failed.");
  }
};

function assertArity(args, arity, message) {
  if (arity == null) arity = args.callee.length;
  if (args.length < arity) {
    throw new SyntaxError(message || "Not enough arguments.");
  }
};

function assertType(object, type, message) {
  if (type && (typeof type == "function" ? !instanceOf(object, type) : typeOf(object) != type)) {
    throw new TypeError(message || "Invalid type.");
  }
};

// =========================================================================
// lang/core.js
// =========================================================================

function assignID(object) {
  // Assign a unique ID to an object.
  if (!object.base2ID) object.base2ID = "b2_" + _counter++;
  return object.base2ID;
};

function copy(object) {
  var fn = function(){};
  fn.prototype = object;
  return new fn;
};

// String/RegExp.

function format(string) {
  // Replace %n with arguments[n].
  // e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
  // ==> "she sells sea shells"
  // Only %1 - %9 supported.
  var args = arguments;
  var pattern = new RegExp("%([1-" + arguments.length + "])", "g");
  return String(string).replace(pattern, function(match, index) {
    return args[index];
  });
};

function match(string, expression) {
  // Same as String.match() except that this function will return an empty 
  // array if there is no match.
  return String(string).match(expression) || [];
};

function rescape(string) {
  // Make a string safe for creating a RegExp.
  return String(string).replace(_RESCAPE, "\\$1");
};

// http://blog.stevenlevithan.com/archives/faster-trim-javascript
function trim(string) {
  return String(string).replace(_LTRIM, "").replace(_RTRIM, "");
};

// =========================================================================
// lang/functional.js
// =========================================================================

function I(i) {
    return i;
};

function K(k) {
  return function() {
    return k;
  };
};

function bind(fn, context) {
  var args = _slice.call(arguments, 2);
  return args.length == 0 ? function() {
    return fn.apply(context, arguments);
  } : function() {
    return fn.apply(context, args.concat.apply(args, arguments));
  };
};

function delegate(fn, context) {
  return function() {
    var args = _slice.call(arguments);
    args.unshift(this);
    return fn.apply(context, args);
  };
};

function flip(fn) {
  return function() {
    return fn.apply(this, Array2.swap(arguments, 0, 1));
  };
};

function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
};

function unbind(fn) {
  return function(context) {
    return fn.apply(context, _slice.call(arguments, 1));
  };
};

// =========================================================================
// base2/init.js
// =========================================================================

base2 = new Package(this, base2);
eval(this.exports);

base2.extend = extend;

// the enumerable methods are extremely useful so we'll add them to the base2
//  namespace for convenience
forEach (Enumerable, function(method, name) {
  if (!Module[name]) base2.addName(name, bind(method, Enumerable));
});

JavaScript = new Package(this, JavaScript);
eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
// timestamp: Sun, 06 Jan 2008 18:17:46

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// DOM/package.js
// =========================================================================

var DOM = new base2.Package(this, {
  name:    "DOM",
  version: "1.0 (beta 2)",
  exports:
    "Interface,Binding,Node,Document,Element,AbstractView,HTMLDocument,HTMLElement,"+
    "Selector,Traversal,XPathParser,NodeSelector,DocumentSelector,ElementSelector,"+
    "StaticNodeList,Event,EventTarget,DocumentEvent,ViewCSS,CSSStyleDeclaration",
  
  bind: function(node) {
    // Apply a base2 DOM Binding to a native DOM node.
    if (node && node.nodeType) {
      var uid = assignID(node);
      if (!DOM.bind[uid]) {
        switch (node.nodeType) {
          case 1: // Element
            if (typeof node.className == "string") {
              // It's an HTML element, so use bindings based on tag name.
              (HTMLElement.bindings[node.tagName] || HTMLElement).bind(node);
            } else {
              Element.bind(node);
            }
            break;
          case 9: // Document
            if (node.writeln) {
              HTMLDocument.bind(node);
            } else {
              Document.bind(node);
            }
            break;
          default:
            Node.bind(node);
        }
        DOM.bind[uid] = true;
      }
    }
    return node;
  },
  
  "@MSIE5.+win": {  
    bind: function(node) {
      if (node && node.writeln) {
        node.nodeType = 9;
      }
      return this.base(node);
    }
  }
});

eval(this.imports);

var _MSIE = detect("MSIE");
var _MSIE5 = detect("MSIE5");

// =========================================================================
// DOM/Interface.js
// =========================================================================

// The Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
  implement: function(_interface) {
    var module = this;
    if (Interface.ancestorOf(_interface)) {
      forEach (_interface, function(property, name) {
        if (_interface[name]._delegate) {
          module[name] = function() { // Late binding.
            return _interface[name].apply(_interface, arguments);
          };
        }
      });
    } else if (typeof _interface == "object") {
      this.forEach (_interface, function(source, name) {
        if (name.charAt(0) == "@") {
          forEach (source, arguments.callee);
        } else if (typeof source == "function" && source.call) {
          // delegate a static method to the bound object
          //  e.g. for most browsers:
          //    EventTarget.addEventListener(element, type, listener, capture) 
          //  forwards to:
          //    element.addEventListener(type, listener, capture)
          if (!module[name]) {
            var FN = "var fn=function _%1(%2){%3.base=%3.%1.ancestor;var m=%3.base?'base':'%1';return %3[m](%4)}";
            var args = "abcdefghij".split("").slice(-source.length);
            eval(format(FN, name, args, args[0], args.slice(1)));
            fn._delegate = name;
            module[name] = fn;
          }
        }
      });
    }
    return this.base(_interface);
  }
});

// =========================================================================
// DOM/Binding.js
// =========================================================================

var Binding = Interface.extend(null, {
  bind: function(object) {
    return extend(object, this.prototype);
  }
});

// =========================================================================
// DOM/Node.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Node = Binding.extend({  
  "@!(element.compareDocumentPosition)" : {
    compareDocumentPosition: function(node, other) {
      // http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
      
      if (Traversal.contains(node, other)) {
        return 4|16; // following|contained_by
      } else if (Traversal.contains(other, node)) {
        return 2|8;  // preceding|contains
      }
      
      var nodeIndex = _getSourceIndex(node);
      var otherIndex = _getSourceIndex(other);
      
      if (nodeIndex < otherIndex) {
        return 4; // following
      } else if (nodeIndex > otherIndex) {
        return 2; // preceding
      }      
      return 0;
    }
  }
});

var _getSourceIndex = document.documentElement.sourceIndex ? function(node) {
  return node.sourceIndex;
} : function(node) {
  // return a key suitable for comparing nodes
  var key = 0;
  while (node) {
    key = Traversal.getNodeIndex(node) + "." + key;
    node = node.parentNode;
  }
  return key;
};

// =========================================================================
// DOM/Document.js
// =========================================================================

var Document = Node.extend(null, {
  bind: function(document) {
    extend(document, "createElement", function(tagName) {
      return DOM.bind(this.base(tagName));
    });
    AbstractView.bind(document.defaultView);
    if (document != window.document)
      new DOMContentLoadedEvent(document);
    return this.base(document);
  },
  
  "@!(document.defaultView)": {
    bind: function(document) {
      document.defaultView = Traversal.getDefaultView(document);
      return this.base(document);
    }
  }
});

// =========================================================================
// DOM/Element.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// Fix has/get/setAttribute() for IE here instead of HTMLElement.

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

var _EVALUATED = /^(href|src)$/;
var _ATTRIBUTES = {
  "class": "className",
  "for": "htmlFor"
};

var Element = Node.extend({
  "@MSIE.+win": {
    getAttribute: function(element, name, iFlags) {
      if (element.className === undefined) { // XML
        return this.base(element, name);
      }
      var attribute = _MSIE_getAttributeNode(element, name);
      if (attribute && (attribute.specified || name == "value")) {
        if (_EVALUATED.test(name)) {
          return this.base(element, name, 2);
        } else if (name == "style") {
         return element.style.cssText;
        } else {
         return attribute.nodeValue;
        }
      }
      return null;
    },
    
    setAttribute: function(element, name, value) {
      if (element.className === undefined) { // XML
        this.base(element, name, value);
      } else if (name == "style") {
        element.style.cssText = value;
      } else {
        value = String(value);
        var attribute = _MSIE_getAttributeNode(element, name);
        if (attribute) {
          attribute.nodeValue = value;
        } else {
          this.base(element, _ATTRIBUTES[name] || name, value);
        }
      }
    }
  },

  "@!(element.hasAttribute)": {
    hasAttribute: function(element, name) {
      return this.getAttribute(element, name) != null;
    }
  }
});

// remove the base2ID for clones
extend(Element.prototype, "cloneNode", function(deep) {
  var clone = this.base(deep || false);
  clone.base2ID = undefined;
  return clone;
});

if (_MSIE) {
  var _PROPERCASE_ATTRIBUTES = "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc";
  // Convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
  extend(_ATTRIBUTES, Array2.combine(_PROPERCASE_ATTRIBUTES.toLowerCase().split(","), _PROPERCASE_ATTRIBUTES.split(",")));
  
  var _MSIE_getAttributeNode = _MSIE5 ? function(element, name) {
    return element.attributes[name] || element.attributes[_ATTRIBUTES[name.toLowerCase()]];
  } : function(element, name) {
    return element.getAttributeNode(name);
  };
}

// =========================================================================
// DOM/Traversal.js
// =========================================================================

// DOM Traversal. Just the basics.

// Loosely based on this:
// http://www.w3.org/TR/2007/WD-ElementTraversal-20070727/

var TEXT = _MSIE ? "innerText" : "textContent";

var Traversal = Module.extend({
  getDefaultView: function(node) {
    return this.getDocument(node).defaultView;
  },
  
  getNextElementSibling: function(node) {
    // return the next element to the supplied element
    //  nextSibling is not good enough as it might return a text or comment node
    while (node && (node = node.nextSibling) && !this.isElement(node)) continue;
    return node;
  },

  getNodeIndex: function(node) {
    var index = 0;
    while (node && (node = node.previousSibling)) index++;
    return index;
  },
  
  getOwnerDocument: function(node) {
    // return the node's containing document
    return node.ownerDocument;
  },
  
  getPreviousElementSibling: function(node) {
    // return the previous element to the supplied element
    while (node && (node = node.previousSibling) && !this.isElement(node)) continue;
    return node;
  },

  getTextContent: function(node) {
    return node[TEXT];
  },

  isEmpty: function(node) {
    node = node.firstChild;
    while (node) {
      if (node.nodeType == 3 || this.isElement(node)) return false;
      node = node.nextSibling;
    }
    return true;
  },

  setTextContent: function(node, text) {
    return node[TEXT] = text;
  },
  
  "@MSIE": {
    getDefaultView: function(node) {
      return (node.document || node).parentWindow;
    },
  
    "@MSIE5": {
      // return the node's containing document
      getOwnerDocument: function(node) {
        return node.ownerDocument || node.document;
      }
    }
  }
}, {
  contains: function(node, target) {
    while (target && (target = target.parentNode) && node != target) continue;
    return !!target;
  },
  
  getDocument: function(node) {
    // return the document object
    return this.isDocument(node) ? node : this.getOwnerDocument(node);
  },
  
  isDocument: function(node) {
    return !!(node && node.documentElement);
  },
  
  isElement: function(node) {
    return !!(node && node.nodeType == 1);
  },
  
  "@(element.contains)": {  
    contains: function(node, target) {
      return node != target && (this.isDocument(node) ? node == this.getOwnerDocument(target) : node.contains(target));
    }
  },
  
  "@MSIE5": {
    isElement: function(node) {
      return !!(node && node.nodeType == 1 && node.nodeName != "!");
    }
  }
});

// =========================================================================
// DOM/views/AbstractView.js
// =========================================================================

var AbstractView = Binding.extend();

// =========================================================================
// DOM/events/Event.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({
  "@!(document.createEvent)": {
    initEvent: function(event, type, bubbles, cancelable) {
      event.type = type;
      event.bubbles = bubbles;
      event.cancelable = cancelable;
      event.timeStamp = new Date().valueOf();
    },
    
    "@MSIE": {
      initEvent: function(event, type, bubbles, cancelable) {
        this.base(event, type, bubbles, cancelable);
        event.cancelBubble = !event.bubbles;
      },
      
      preventDefault: function(event) {
        if (event.cancelable !== false) {
          event.returnValue = false;
        }
      },
    
      stopPropagation: function(event) {
        event.cancelBubble = true;
      }
    }
  }
}, {
/*  "@WebKit": {
    bind: function(event) {
      if (event.target && event.target.nodeType == 3) { // TEXT_NODE
        event = copy(event);
        event.target = event.target.parentNode;
      }
      return this.base(event);
    }
  }, */
  
  "@!(document.createEvent)": {
    "@MSIE": {
      bind: function(event) {
        if (!event.timeStamp) {
          event.bubbles = !!_BUBBLES[event.type];
          event.cancelable = !!_CANCELABLE[event.type];
          event.timeStamp = new Date().valueOf();
        }
        if (!event.target) {
          event.target = event.srcElement;
        }
        event.relatedTarget = event[(event.type == "mouseout" ? "to" : "from") + "Element"];
        return this.base(event);
      }
    }
  }
});

if (_MSIE) {
  var _BUBBLES    = "abort,error,select,change,resize,scroll"; // + _CANCELABLE
  var _CANCELABLE = "click,mousedown,mouseup,mouseover,mousemove,mouseout,keydown,keyup,submit,reset";
  _BUBBLES = Array2.combine((_BUBBLES + "," + _CANCELABLE).split(","));
  _CANCELABLE = Array2.combine(_CANCELABLE.split(","));
}

// =========================================================================
// DOM/events/EventTarget.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

// TO DO: event capture

var EventTarget = Interface.extend({
  "@!(element.addEventListener)": {
    addEventListener: function(target, type, listener, capture) {
      // assign a unique id to both objects
      var targetID = assignID(target);
      var listenerID = assignID(listener);
      // create a hash table of event types for the target object
      var events = _eventMap[targetID];
      if (!events) events = _eventMap[targetID] = {};
      // create a hash table of event listeners for each object/event pair
      var listeners = events[type];
      var current = target["on" + type];
      if (!listeners) {
        listeners = events[type] = {};
        // store the existing event listener (if there is one)
        if (current) listeners[0] = current;
      }
      // store the event listener in the hash table
      listeners[listenerID] = listener;
      if (current !== undefined) {
        target["on" + type] = _eventMap._handleEvent;
      }
    },
  
    dispatchEvent: function(target, event) {
      return _handleEvent.call(target, event);
    },
  
    removeEventListener: function(target, type, listener, capture) {
      // delete the event listener from the hash table
      var events = _eventMap[target.base2ID];
      if (events && events[type]) {
        delete events[type][listener.base2ID];
      }
    },
    
    "@(element.fireEvent)": {
      dispatchEvent: function(target, event) {
        var type = "on" + event.type;
        event.target = target;
        if (target[type] === undefined) {
          return this.base(target, event);
        } else {
          return target.fireEvent(type, event);
        }
      }
    }
  }
});

var _eventMap = new Base({ 
  _handleEvent: _handleEvent,
  
  "@MSIE": {
    _handleEvent: function() {
      var target = this;
      var window = (target.document || target).parentWindow;
      if (target.Infinity) target = window;
      return _handleEvent.call(target, window.event);
    }
  }
});

function _handleEvent(event) {
  var returnValue = true;
  // get a reference to the hash table of event listeners
  var events = _eventMap[this.base2ID];
  if (events) {
    Event.bind(event); // fix the event object
    var listeners = events[event.type];
    // execute each event listener
    for (var i in listeners) {
      var listener = listeners[i];
      // support the EventListener interface
      if (listener.handleEvent) {
        var result = listener.handleEvent(event);
      } else {
        result = listener.call(this, event);
      }
      if (result === false || event.returnValue === false) returnValue = false;
    }
  }
  return returnValue;
};

// =========================================================================
// DOM/events/DocumentEvent.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-DocumentEvent

var DocumentEvent = Interface.extend({  
  "@!(document.createEvent)": {
    createEvent: function(document, type) {
      return Event.bind({});
    },
  
    "@(document.createEventObject)": {
      createEvent: function(document, type) {
        return Event.bind(document.createEventObject());
      }
    }
  },
  
  "@(document.createEvent)": {
    "@!(document.createEvent('Events'))": { // before Safari 3
      createEvent: function(document, type) {
        return this.base(document, type == "Events" ? "UIEvents" : type);
      }
    }
  }
});

// =========================================================================
// DOM/events/DOMContentLoadedEvent.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/06/again

var DOMContentLoadedEvent = Base.extend({
  constructor: function(document) {
    var fired = false;
    this.fire = function() {
      if (!fired) {
        fired = true;
        // this function will be called from another event handler so we'll user a timer
        //  to drop out of any current event
        setTimeout(function() {
          var event = DocumentEvent.createEvent(document, "Events");
          Event.initEvent(event, "DOMContentLoaded", false, false);
          EventTarget.dispatchEvent(document, event);
        }, 1);
      }
    };
    // use the real event for browsers that support it (opera & firefox)
    EventTarget.addEventListener(document, "DOMContentLoaded", function() {
      fired = true;
    }, false);
    this.listen(document);
  },
  
  listen: function(document) {
    // if all else fails fall back on window.onload
    EventTarget.addEventListener(Traversal.getDefaultView(document), "load", this.fire, false);
  },

  "@MSIE.+win": {
    listen: function(document) {
      if (document.readyState != "complete") {
        // Matthias Miller/Mark Wubben/Paul Sowden/Me
        var event = this;
        document.write("<script id=__ready defer src=//:><\/script>");
        document.all.__ready.onreadystatechange = function() {
          if (this.readyState == "complete") {
            this.removeNode(); // tidy
            event.fire();
          }
        };
      }
    }
  },
  
  "@KHTML": {
    listen: function(document) {
      // John Resig
      if (document.readyState != "complete") {
        var event = this;
        var timer = setInterval(function() {
          if (/loaded|complete/.test(document.readyState)) {
            clearInterval(timer);
            event.fire();
          }
        }, 100);
      }
    }
  }
});

new DOMContentLoadedEvent(document);

// =========================================================================
// DOM/events/implementations.js
// =========================================================================

Document.implement(DocumentEvent);
Document.implement(EventTarget);

Element.implement(EventTarget);

// =========================================================================
// DOM/style/ViewCSS.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var _PIXEL   = /^\d+(px)?$/i;
var _METRICS = /(width|height|top|bottom|left|right|fontSize)$/;
var _COLOR   = /^(color|backgroundColor)$/;

var ViewCSS = Interface.extend({
  "@!(document.defaultView.getComputedStyle)": {
    "@MSIE": {
      getComputedStyle: function(view, element, pseudoElement) {
        // pseudoElement parameter is not supported
        var currentStyle = element.currentStyle;
        var computedStyle = {};
        for (var i in currentStyle) {
          if (_METRICS.test(i)) {
            computedStyle[i] = _MSIE_getPixelValue(element, computedStyle[i]) + "px";
          } else if (_COLOR.test(i)) {
            computedStyle[i] = _MSIE_getColorValue(element, i == "color" ? "ForeColor" : "BackColor");
          } else {
            computedStyle[i] = currentStyle[i];
          }
        }
        return computedStyle;
      }
    }
  },
  
  getComputedStyle: function(view, element, pseudoElement) {
    return _CSSStyleDeclaration_ReadOnly.bind(this.base(view, element, pseudoElement));
  }
}, {
  toCamelCase: function(string) {
    return string.replace(/\-([a-z])/g, function(match, chr) {
      return chr.toUpperCase();
    });
  }
});

function _MSIE_getPixelValue(element, value) {
  if (_PIXEL.test(value)) return parseInt(value);
  var styleLeft = element.style.left;
  var runtimeStyleLeft = element.runtimeStyle.left;
  element.runtimeStyle.left = element.currentStyle.left;
  element.style.left = value || 0;
  value = element.style.pixelLeft;
  element.style.left = styleLeft;
  element.runtimeStyle.left = runtimeStyleLeft;
  return value;
};

function _MSIE_getColorValue(element, value) {
  var range = element.document.body.createTextRange();
  range.moveToElementText(element);
  var color = range.queryCommandValue(value);
  return format("rgb(%1,%2,%3)", color & 0xff, (color & 0xff00) >> 8,  (color & 0xff0000) >> 16);
};

// =========================================================================
// DOM/style/CSSStyleDeclaration.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration

var _CSSStyleDeclaration_ReadOnly = Binding.extend({
  getPropertyValue: function(style, propertyName) {
    return this.base(style, _CSSPropertyNameMap[propertyName] || propertyName);
  },
  
  "@MSIE.+win": {
    getPropertyValue: function(style, propertyName) {
      return propertyName == "float" ? style.styleFloat : style[ViewCSS.toCamelCase(propertyName)];
    }
  }
});

var CSSStyleDeclaration = _CSSStyleDeclaration_ReadOnly.extend({
  setProperty: function(style, propertyName, value, important) {
    return this.base(style, _CSSPropertyNameMap[propertyName] || propertyName, value, important);
  },
  
  "@MSIE.+win": {
    setProperty: function(style, propertyName, value, priority) {
      if (propertyName == "opacity") {
        value *= 100;
        style.opacity = value;
        style.zoom = 1;
        style.filter = "Alpha(opacity=" + value + ")";
      } else {
        style.setAttribute(propertyName, value);
      }
    }
  }
}, {
  "@MSIE": {
    bind: function(style) {
      style.getPropertyValue = this.prototype.getPropertyValue;
      style.setProperty = this.prototype.setProperty;
      return style;
    }
  }
});

var _CSSPropertyNameMap = new Base({
  "@Gecko": {
    opacity: "-moz-opacity"
  },
  
  "@KHTML": {
    opacity: "-khtml-opacity"
  }
});

with (CSSStyleDeclaration.prototype) getPropertyValue.toString = setProperty.toString = function() {
  return "[base2]";
};

// =========================================================================
// DOM/style/implementations.js
// =========================================================================

AbstractView.implement(ViewCSS);

// =========================================================================
// DOM/selectors-api/NodeSelector.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/

var NodeSelector = Interface.extend({
  "@!(element.querySelector)": { // future-proof
    querySelector: function(node, selector) {
      return new Selector(selector).exec(node, 1);
    },
    
    querySelectorAll: function(node, selector) {
      return new Selector(selector).exec(node);
    }
  }
});

// automatically bind objects retrieved using the Selectors API

extend(NodeSelector.prototype, {
  querySelector: function(selector) {
    return DOM.bind(this.base(selector));
  },

  querySelectorAll: function(selector) {
    return extend(this.base(selector), "item", function(index) {
      return DOM.bind(this.base(index));
    });
  }
});

// =========================================================================
// DOM/selectors-api/DocumentSelector.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#documentselector

var DocumentSelector = NodeSelector.extend();

// =========================================================================
// DOM/selectors-api/ElementSelector.js
// =========================================================================

var ElementSelector = NodeSelector.extend({
  "@!(element.matchesSelector)": { // future-proof
    matchesSelector: function(element, selector) {
      return new Selector(selector).test(element);
    }
  }
});

// =========================================================================
// DOM/selectors-api/StaticNodeList.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#staticnodelist

// A wrapper for an array of elements or an XPathResult.
// The item() method provides access to elements.
// Implements Enumerable so you can forEach() to your heart's content... :-)

var StaticNodeList = Base.extend({
  constructor: function(nodes) {
    nodes = nodes || [];
    this.length = nodes.length;
    this.item = function(index) {
      return nodes[index];
    };
  },
  
  length: 0,
  
  forEach: function(block, context) {
    for (var i = 0; i < this.length; i++) {
      block.call(context, this.item(i), i, this);
    }
  },
  
  item: Undefined, // defined in the constructor function
  
  "@(XPathResult)": {
    constructor: function(nodes) {
  //- if (nodes instanceof XPathResult) { // doesn't work in Safari
      if (nodes && nodes.snapshotItem) {
        this.length = nodes.snapshotLength;
        this.item = function(index) {
          return nodes.snapshotItem(index);
        };
      } else this.base(nodes);
    }
  }
});

StaticNodeList.implement(Enumerable);

// =========================================================================
// DOM/selectors-api/CSSParser.js
// =========================================================================

var _CSS_ESCAPE =           /'(\\.|[^'\\])*'|"(\\.|[^"\\])*"/g,
    _CSS_IMPLIED_ASTERISK = /([\s>+~,]|[^(]\+|^)([#.:\[])/g,
    _CSS_IMPLIED_SPACE =    /(^|,)([^\s>+~])/g,
    _CSS_WHITESPACE =       /\s*([\s>+~(),]|^|$)\s*/g,
    _CSS_WILD_CARD =        /\s\*\s/g,
    _CSS_UNESCAPE =         /\x01(\d+)/g,
    _QUOTE =                /'/g;
  
var CSSParser = RegGrp.extend({
  constructor: function(items) {
    this.base(items);
    this.cache = {};
    this.sorter = new RegGrp;
    this.sorter.add(/:not\([^)]*\)/, RegGrp.IGNORE);
    this.sorter.add(/([ >](\*|[\w-]+))([^: >+~]*)(:\w+-child(\([^)]+\))?)([^: >+~]*)/, "$1$3$6$4");
  },
  
  cache: null,
  ignoreCase: true,
  
  escape: function(selector) {
    // remove strings
    var strings = this._strings = [];
    return this.optimise(this.format(String(selector).replace(_CSS_ESCAPE, function(string) {      
      return "\x01" + strings.push(string.slice(1, -1).replace(_QUOTE, "\\'"));
    })));
  },
  
  format: function(selector) {
    return selector
      .replace(_CSS_WHITESPACE, "$1")
      .replace(_CSS_IMPLIED_SPACE, "$1 $2")
      .replace(_CSS_IMPLIED_ASTERISK, "$1*$2");
  },
  
  optimise: function(selector) {
    // optimise wild card descendant selectors
    return this.sorter.exec(selector.replace(_CSS_WILD_CARD, ">* "));
  },
  
  parse: function(selector) {
    return this.cache[selector] ||
      (this.cache[selector] = this.unescape(this.exec(this.escape(selector))));
  },
  
  unescape: function(selector) {
    // put string values back
    var strings = this._strings;
    return selector.replace(_CSS_UNESCAPE, function(match, index) {
      return strings[index - 1];
    });
  }
});

function _nthChild(match, args, position, last, not, and, mod, equals) {
  // ugly but it works for both CSS and XPath
  last = /last/i.test(match) ? last + "+1-" : "";
  if (!isNaN(args)) args = "0n+" + args;
  else if (args == "even") args = "2n";
  else if (args == "odd") args = "2n+1";
  args = args.split("n");
  var a = args[0] ? (args[0] == "-") ? -1 : parseInt(args[0]) : 1;
  var b = parseInt(args[1]) || 0;
  var negate = a < 0;
  if (negate) {
    a = -a;
    if (a == 1) b++;
  }
  var query = format(a == 0 ? "%3%7" + (last + b) : "(%4%3-%2)%6%1%70%5%4%3>=%2", a, b, position, last, and, mod, equals);
  if (negate) query = not + "(" + query + ")";
  return query;
};

// =========================================================================
// DOM/selectors-api/XPathParser.js
// =========================================================================

// XPath parser
// converts CSS expressions to *optimised* XPath queries

// This code used to be quite readable until I added code to optimise *-child selectors. 

var XPathParser = CSSParser.extend({
  constructor: function() {
    this.base(XPathParser.rules);
    // The sorter sorts child selectors to the end because they are slow.
    // For XPath we need the child selectors to be sorted to the beginning,
    // so we reverse the sort order. That's what this line does:
    this.sorter.putAt(1, "$1$4$3$6");
  },
  
  escape: function(selector) {
    return this.base(selector).replace(/,/g, "\x02");
  },
  
  unescape: function(selector) {
    return this.base(selector
      .replace(/\[self::\*\]/g, "")   // remove redundant wild cards
      .replace(/(^|\x02)\//g, "$1./") // context
      .replace(/\x02/g, " | ")        // put commas back      
    ).replace(/'[^'\\]*\\'(\\.|[^'\\])*'/g, function(match) { // escape single quotes
      return "concat(" + match.split("\\'").join("',\"'\",'") + ")";
    });
  },
  
  "@opera": {
    unescape: function(selector) {
      // opera does not seem to support last() but I can't find any 
      //  documentation to confirm this
      return this.base(selector.replace(/last\(\)/g, "count(preceding-sibling::*)+count(following-sibling::*)+1"));
    }
  }
}, {
  init: function() {
    // build the prototype
    this.values.attributes[""] = "[@$1]";
    forEach (this.types, function(add, type) {
      forEach (this.values[type], add, this.rules);
    }, this);
  },
  
  optimised: {    
    pseudoClasses: {
      "first-child": "[1]",
      "last-child":  "[last()]",
      "only-child":  "[last()=1]"
    }
  },
  
  rules: extend({}, {
    "@!KHTML": { // these optimisations do not work on Safari
      // fast id() search
      "(^|\\x02) (\\*|[\\w-]+)#([\\w-]+)": "$1id('$3')[self::$2]",
      // optimise positional searches
      "([ >])(\\*|[\\w-]+):([\\w-]+-child(\\(([^)]+)\\))?)": function(match, token, tagName, pseudoClass, $4, args) {
        var replacement = (token == " ") ? "//*" : "/*";
        if (/^nth/i.test(pseudoClass)) {
          replacement += _xpath_nthChild(pseudoClass, args, "position()");
        } else {
          replacement += XPathParser.optimised.pseudoClasses[pseudoClass];
        }
        return replacement + "[self::" + tagName + "]";
      }
    }
  }),
  
  types: {
    identifiers: function(replacement, token) {
      this[rescape(token) + "([\\w-]+)"] = replacement;
    },
    
    combinators: function(replacement, combinator) {
      this[rescape(combinator) + "(\\*|[\\w-]+)"] = replacement;
    },
    
    attributes: function(replacement, operator) {
      this["\\[([\\w-]+)\\s*" + rescape(operator) +  "\\s*([^\\]]*)\\]"] = replacement;
    },
    
    pseudoClasses: function(replacement, pseudoClass) {
      this[":" + pseudoClass.replace(/\(\)$/, "\\(([^)]+)\\)")] = replacement;
    }
  },
  
  values: {
    identifiers: {
      "#": "[@id='$1'][1]", // ID selector
      ".": "[contains(concat(' ',@class,' '),' $1 ')]" // class selector
    },
    
    combinators: {
      " ": "/descendant::$1", // descendant selector
      ">": "/child::$1", // child selector
      "+": "/following-sibling::*[1][self::$1]", // direct adjacent selector
      "~": "/following-sibling::$1" // indirect adjacent selector
    },
    
    attributes: { // attribute selectors
      "*=": "[contains(@$1,'$2')]",
      "^=": "[starts-with(@$1,'$2')]",
      "$=": "[substring(@$1,string-length(@$1)-string-length('$2')+1)='$2']",
      "~=": "[contains(concat(' ',@$1,' '),' $2 ')]",
      "|=": "[contains(concat('-',@$1,'-'),'-$2-')]",
      "!=": "[not(@$1='$2')]",
      "=":  "[@$1='$2']"
    },
    
    pseudoClasses: { // pseudo class selectors
      "empty":            "[not(child::*) and not(text())]",
//-   "lang()":           "[boolean(lang('$1') or boolean(ancestor-or-self::*[@lang][1][starts-with(@lang,'$1')]))]",
      "first-child":      "[not(preceding-sibling::*)]",
      "last-child":       "[not(following-sibling::*)]",
      "not()":            _xpath_not,
      "nth-child()":      _xpath_nthChild,
      "nth-last-child()": _xpath_nthChild,
      "only-child":       "[not(preceding-sibling::*) and not(following-sibling::*)]",
      "root":             "[not(parent::*)]"
    }
  },
  
  "@opera": {  
    init: function() {
      this.optimised.pseudoClasses["last-child"] = this.values.pseudoClasses["last-child"];
      this.optimised.pseudoClasses["only-child"] = this.values.pseudoClasses["only-child"];
      this.base();
    }
  }
});

// these functions defined here to make the code more readable
var _notParser = new XPathParser;
function _xpath_not(match, args) {
  return "[not(" + _notParser.exec(trim(args))
    .replace(/\[1\]/g, "") // remove the "[1]" introduced by ID selectors
    .replace(/^(\*|[\w-]+)/, "[self::$1]") // tagName test
    .replace(/\]\[/g, " and ") // merge predicates
    .slice(1, -1)
  + ")]";
};

function _xpath_nthChild(match, args, position) {
  return "[" + _nthChild(match, args, position || "count(preceding-sibling::*)+1", "last()", "not", " and ", " mod ", "=") + "]";
};

// =========================================================================
// DOM/selectors-api/Selector.js
// =========================================================================

// This object can be instantiated, however it is probably better to use
// the querySelector/querySelectorAll methods on DOM nodes.

// There is no public standard for this object.

var Selector = Base.extend({
  constructor: function(selector) {
    this.toString = K(trim(selector));
  },
  
  exec: function(context, single) {
    return Selector.parse(this)(context, single);
  },
  
  test: function(element) {
    //-dean: improve this for simple selectors
    var selector = new Selector(this + "[b2-test]");
    element.setAttribute("b2-test", true);
    var result = selector.exec(Traversal.getOwnerDocument(element), true);
    element.removeAttribute("b2-test");
    return result == element;
  },
  
  toXPath: function() {
    return Selector.toXPath(this);
  },
  
  "@(XPathResult)": {
    exec: function(context, single) {
      // use DOM methods if the XPath engine can't be used
      if (_NOT_XPATH.test(this)) {
        return this.base(context, single);
      }
      var document = Traversal.getDocument(context);
      var type = single
        ? 9 /* FIRST_ORDERED_NODE_TYPE */
        : 7 /* ORDERED_NODE_SNAPSHOT_TYPE */;
      var result = document.evaluate(this.toXPath(), context, null, type, null);
      return single ? result.singleNodeValue : result;
    }
  },
  
  "@MSIE": {
    exec: function(context, single) {
      if (typeof context.selectNodes != "undefined" && !_NOT_XPATH.test(this)) { // xml
        var method = single ? "selectSingleNode" : "selectNodes";
        return context[method](this.toXPath());
      }
      return this.base(context, single);
    }
  },
  
  "@(true)": {
    exec: function(context, single) {
      try {
        var result = this.base(context || document, single);
      } catch (error) { // probably an invalid selector =)
        throw new SyntaxError(format("'%1' is not a valid CSS selector.", this));
      }
      return single ? result : new StaticNodeList(result);
    }
  }
}, {  
  toXPath: function(selector) {
    if (!_xpathParser) _xpathParser = new XPathParser;
    return _xpathParser.parse(selector);
  }
});

var _NOT_XPATH = ":(checked|disabled|enabled|contains)|^(#[\\w-]+\\s*)?\\w+$";
if (detect("KHTML")) {
  if (detect("WebKit5")) {
    _NOT_XPATH += "|nth\\-|,";
  } else {
    _NOT_XPATH = ".";
  }
}
_NOT_XPATH = new RegExp(_NOT_XPATH);

// Selector.parse() - converts CSS selectors to DOM queries.

// Hideous code but it produces fast DOM queries.
// Respect due to Alex Russell and Jack Slocum for inspiration.

var _OPERATORS = {
  "=":  "%1=='%2'",
  "!=": "%1!='%2'", //  not standard but other libraries support it
  "~=": /(^| )%1( |$)/,
  "|=": /^%1(-|$)/,
  "^=": /^%1/,
  "$=": /%1$/,
  "*=": /%1/
};
_OPERATORS[""] = "%1!=null";

var _PSEUDO_CLASSES = { //-dean: lang()
  "checked":     "e%1.checked",
  "contains":    "e%1[TEXT].indexOf('%2')!=-1",
  "disabled":    "e%1.disabled",
  "empty":       "Traversal.isEmpty(e%1)",
  "enabled":     "e%1.disabled===false",
  "first-child": "!Traversal.getPreviousElementSibling(e%1)",
  "last-child":  "!Traversal.getNextElementSibling(e%1)",
  "only-child":  "!Traversal.getPreviousElementSibling(e%1)&&!Traversal.getNextElementSibling(e%1)",
  "root":        "e%1==Traversal.getDocument(e%1).documentElement"
};

var _INDEXED = detect("(element.sourceIndex)") ;
var _VAR = "var p%2=0,i%2,e%2,n%2=e%1.";
var _ID = _INDEXED ? "e%1.sourceIndex" : "assignID(e%1)";
var _TEST = "var g=" + _ID + ";if(!p[g]){p[g]=1;";
var _STORE = "r[r.length]=e%1;if(s)return e%1;";
//var _SORT = "r.sort(sorter);";
var _FN = "var _selectorFunction=function(e0,s){_indexed++;var r=[],p={},reg=[%1]," +
  "d=Traversal.getDocument(e0),c=d.body?'toUpperCase':'toString';";
  
var _xpathParser;

//var sorter = _INDEXED ? function(a, b) {
//  return a.sourceIndex - b.sourceIndex;
//} : Node.compareDocumentPosition;

// variables used by the parser

var _reg; // a store for RexExp objects
var _index;
var _wild; // need to flag certain _wild card selectors as _MSIE includes comment nodes
var _list; // are we processing a node _list?
var _duplicate; // possible duplicates?
var _cache = {}; // store parsed selectors

// a hideous parser
var _parser = new CSSParser({
  "^ \\*:root": function(match) { // :root pseudo class
    _wild = false;
    var replacement = "e%2=d.documentElement;if(Traversal.contains(e%1,e%2)){";
    return format(replacement, _index++, _index);
  },
  
  " (\\*|[\\w-]+)#([\\w-]+)": function(match, tagName, id) { // descendant selector followed by ID
    _wild = false;
    var replacement = "var e%2=_byId(d,'%4');if(e%2&&";
    if (tagName != "*") replacement += "e%2.nodeName=='%3'[c]()&&";
    replacement += "Traversal.contains(e%1,e%2)){";
    if (_list) replacement += format("i%1=n%1.length;", _list);
    return format(replacement, _index++, _index, tagName, id);
  },
  
  " (\\*|[\\w-]+)": function(match, tagName) { // descendant selector
    _duplicate++; // this selector may produce duplicates
    _wild = tagName == "*";
    var replacement = _VAR;
    // IE5.x does not support getElementsByTagName("*");
    replacement += (_wild && _MSIE5) ? "all" : "getElementsByTagName('%3')";
    replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
    return format(replacement, _index++, _list = _index, tagName);
  },
  
  ">(\\*|[\\w-]+)": function(match, tagName) { // child selector
    var children = _MSIE && _list;
    _wild = tagName == "*";
    var replacement = _VAR;
    // use the children property for _MSIE as it does not contain text nodes
    //  (but the children collection still includes comments).
    // the document object does not have a children collection
    replacement += children ? "children": "childNodes";
    if (!_wild && children) replacement += ".tags('%3')";
    replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
    if (_wild) {
      replacement += "if(e%2.nodeType==1){";
      _wild = _MSIE5;
    } else {
      if (!children) replacement += "if(e%2.nodeName=='%3'[c]()){";
    }
    return format(replacement, _index++, _list = _index, tagName);
  },
  
  "\\+(\\*|[\\w-]+)": function(match, tagName) { // direct adjacent selector
    var replacement = "";
    if (_wild && _MSIE) replacement += "if(e%1.nodeName!='!'){";
    _wild = false;
    replacement += "e%1=Traversal.getNextElementSibling(e%1);if(e%1";
    if (tagName != "*") replacement += "&&e%1.nodeName=='%2'[c]()";
    replacement += "){";
    return format(replacement, _index, tagName);
  },
  
  "~(\\*|[\\w-]+)": function(match, tagName) { // indirect adjacent selector
    var replacement = "";
    if (_wild && _MSIE) replacement += "if(e%1.nodeName!='!'){";
    _wild = false;
    _duplicate = 2; // this selector may produce duplicates
    replacement += "while(e%1=e%1.nextSibling){if(e%1.b2_adjacent==_indexed)break;if(";
    if (tagName == "*") {
      replacement += "e%1.nodeType==1";
      if (_MSIE5) replacement += "&&e%1.nodeName!='!'";
    } else replacement += "e%1.nodeName=='%2'[c]()";
    replacement += "){e%1.b2_adjacent=_indexed;";
    return format(replacement, _index, tagName);
  },
  
  "#([\\w-]+)": function(match, id) { // ID selector
    _wild = false;
    var replacement = "if(e%1.id=='%2'){";
    if (_list) replacement += format("i%1=n%1.length;", _list);
    return format(replacement, _index, id);
  },
  
  "\\.([\\w-]+)": function(match, className) { // class selector
    _wild = false;
    // store RegExp objects - slightly faster on IE
    _reg.push(new RegExp("(^|\\s)" + rescape(className) + "(\\s|$)"));
    return format("if(e%1.className&&reg[%2].test(e%1.className)){", _index, _reg.length - 1);
  },
  
  ":not\\((\\*|[\\w-]+)?([^)]*)\\)": function(match, tagName, filters) { // :not pseudo class
    var replacement = (tagName && tagName != "*") ? format("if(e%1.nodeName=='%2'[c]()){", _index, tagName) : "";
    replacement += _parser.exec(filters);
    return "if(!" + replacement.slice(2, -1).replace(/\)\{if\(/g, "&&") + "){";
  },
  
  ":nth(-last)?-child\\(([^)]+)\\)": function(match, last, args) { // :nth-child pseudo classes
    _wild = false;
    last = format("e%1.parentNode.b2_length", _index);
    var replacement = "if(p%1!==e%1.parentNode)p%1=_register(e%1.parentNode);";
    replacement += "var i=e%1[p%1.b2_lookup];if(p%1.b2_lookup!='b2_index')i++;if(";
    return format(replacement, _index) + _nthChild(match, args, "i", last, "!", "&&", "%", "==") + "){";
  },
  
  ":([\\w-]+)(\\(([^)]+)\\))?": function(match, pseudoClass, $2, args) { // other pseudo class selectors
    return "if(" + format(_PSEUDO_CLASSES[pseudoClass] || "throw", _index, args || "") + "){";
  },
  
  "\\[([\\w-]+)\\s*([^=]?=)?\\s*([^\\]]*)\\]": function(match, attr, operator, value) { // attribute selectors
    var alias = _ATTRIBUTES[attr] || attr;
    if (operator) {
      var getAttribute = "e%1.getAttribute('%2',2)";
      if (!_EVALUATED.test(attr)) {
        getAttribute = "e%1.%3||" + getAttribute;
      }
      attr = format("(" + getAttribute + ")", _index, attr, alias);
    } else {
      attr = format("Element.getAttribute(e%1,'%2')", _index, attr);
    }
    var replacement = _OPERATORS[operator || ""];
    if (instanceOf(replacement, RegExp)) {
      _reg.push(new RegExp(format(replacement.source, rescape(_parser.unescape(value)))));
      replacement = "reg[%2].test(%1)";
      value = _reg.length - 1;
    }
    return "if(" + format(replacement, attr, value) + "){";
  }
});

new function(_) {
  // IE confuses the name attribute with id for form elements,
  // use document.all to retrieve all elements with name/id instead
  var _byId = _MSIE ? function(document, id) {
    var result = document.all[id] || null;
    // returns a single element or a collection
    if (!result || result.id == id) return result;
    // document.all has returned a collection of elements with name/id
    for (var i = 0; i < result.length; i++) {
      if (result[i].id == id) return result[i];
    }
    return null;
  } : function(document, id) {
    return document.getElementById(id);
  };

  // register a node and index its children
  var _indexed = 1;
  function _register(element) {
    if (element.rows) {
      element.b2_length = element.rows.length;
      element.b2_lookup = "rowIndex";
    } else if (element.cells) {
      element.b2_length = element.cells.length;
      element.b2_lookup = "cellIndex";
    } else if (element.b2_indexed != _indexed) {
      var index = 0;
      var child = element.firstChild;
      while (child) {
        if (child.nodeType == 1 && child.nodeName != "!") {
          child.b2_index = ++index;
        }
        child = child.nextSibling;
      }
      element.b2_length = index;
      element.b2_lookup = "b2_index";
    }
    element.b2_indexed = _indexed;
    return element;
  };
  
  Selector.parse = function(selector) {
    if (!_cache[selector]) {
      _reg = []; // store for RegExp objects
      var fn = "";
      var selectors = _parser.escape(selector).split(",");
      for (var i = 0; i < selectors.length; i++) {
        _wild = _index = _list = 0; // reset
        _duplicate = selectors.length > 1 ? 2 : 0; // reset
        var block = _parser.exec(selectors[i]) || "throw;";
        if (_wild && _MSIE) { // IE's pesky comment nodes
          block += format("if(e%1.nodeName!='!'){", _index);
        }
        // check for duplicates before storing results
        var store = (_duplicate > 1) ? _TEST : "";
        block += format(store + _STORE, _index);
        // add closing braces
        block += Array(match(block, /\{/g).length + 1).join("}");
        fn += block;
      }
//    if (selectors.length > 1) fn += _SORT;
      eval(format(_FN, _reg) + _parser.unescape(fn) + "return s?null:r}");
      _cache[selector] = _selectorFunction;
    }
    return _cache[selector];
  };
};

// =========================================================================
// DOM/selectors-api/implementations.js
// =========================================================================

Document.implement(DocumentSelector);
Element.implement(ElementSelector);

// =========================================================================
// DOM/html/HTMLDocument.js
// =========================================================================

// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend(null, {
  // http://www.whatwg.org/specs/web-apps/current-work/#activeelement  
  "@(document.activeElement===undefined)": {
    bind: function(document) {
      document.activeElement = null;
      EventTarget.addEventListener(document, "focus", function(event) { //-dean: is onfocus good enough?
        document.activeElement = event.target;
      }, false);
      return this.base(document);
    }
  }
});

// =========================================================================
// DOM/html/HTMLElement.js
// =========================================================================

// The className methods are not standard but are extremely handy. :-)

var HTMLElement = Element.extend({
  addClass: function(element, className) {
    if (!this.hasClass(element, className)) {
      element.className += (element.className ? " " : "") + className;
    }
  },
  
  hasClass: function(element, className) {
    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
    return regexp.test(element.className);
  },

  removeClass: function(element, className) {
    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
    element.className = trim(element.className.replace(regexp, "$2"));
  },

  toggleClass: function(element, className) {
    if (this.hasClass(element, className)) {
      this.removeClass(element, className);
    } else {
      this.addClass(element, className);
    }
  }
}, {
  bindings: {},
  tags: "*",
  
  bind: function(element) {
    CSSStyleDeclaration.bind(element.style);
    return this.base(element);
  },
  
  extend: function() {
    // Maintain HTML element bindings.
    // This allows us to map specific interfaces to elements by reference
    // to tag name.
    var binding = base(this, arguments);
    var tags = (binding.tags || "").toUpperCase().split(",");
    forEach (tags, function(tagName) {
      HTMLElement.bindings[tagName] = binding;
    });
    return binding;
  },
  
  "@!(element.ownerDocument)": {
    bind: function(element) {
      element.ownerDocument = Traversal.getOwnerDocument(element);
      return this.base(element);
    }
  }
});

HTMLElement.extend(null, {
  tags: "APPLET,EMBED",  
  bind: I // Binding not allowed for these elements.
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
/*!
 * Raphael 1.3.1 - JavaScript Vector Library
 *
 * Copyright (c) 2008 - 2009 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
 
 
Raphael = (function () {
    var separator = /[, ]+/,
        elements = /^(circle|rect|path|ellipse|text|image)$/,
        doc = document,
        win = window,
        oldRaphael = {
            was: "Raphael" in win,
            is: win.Raphael
        },
        R = function () {
            if (R.is(arguments[0], "array")) {
                var a = arguments[0],
                    cnv = create[apply](R, a.splice(0, 3 + R.is(a[0], nu))),
                    res = cnv.set();
                for (var i = 0, ii = a[length]; i < ii; i++) {
                    var j = a[i] || {};
                    elements.test(j.type) && res[push](cnv[j.type]().attr(j));
                }
                return res;
            }
            return create[apply](R, arguments);
        },
        Paper = function () {},
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        E = "",
        S = " ",
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup"[split](S),
        has = "hasOwnProperty",
        join = "join",
        length = "length",
        proto = "prototype",
        lowerCase = String[proto].toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        nu = "number",
        toString = "toString",
        objectToString = Object[proto][toString],
        paper = {},
        pow = math.pow,
        push = "push",
        rg = /^(?=[\da-f]$)/,
        ISURL = /^url\(['"]?([^\)]+)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgb\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|rgb\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\)|hs[bl]\(\s*([\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+)\s*\)|hs[bl]\(\s*([\d\.]+%\s*,\s*[\d\.]+%\s*,\s*[\d\.]+%)\s*\))\s*$/i,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = String[proto].toUpperCase,
        availableAttrs = {"clip-rect": "0 0 1e9 1e9", cursor: "default", cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
        availableAnimAttrs = {along: "along", "clip-rect": "csv", cx: nu, cy: nu, fill: "colour", "fill-opacity": nu, "font-size": nu, height: nu, opacity: nu, path: "path", r: nu, rotation: "csv", rx: nu, ry: nu, scale: "csv", stroke: "colour", "stroke-opacity": nu, "stroke-width": nu, translation: "csv", width: nu, x: nu, y: nu},
        rp = "replace";
    R.version = "1.3.1";
    R.type = (win.SVGAngle || doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = document.createElement("div");
        d.innerHTML = '<!--[if vml]><br><br><![endif]-->';
        if (d.childNodes[length] != 2) {
            return null;
        }
    }
    R.svg = !(R.vml = R.type == "VML");
    Paper[proto] = R[proto];
    R._id = 0;
    R._oid = 0;
    R.fn = {};
    R.is = function (o, type) {
        type = lowerCase.call(type);
        return ((type == "object" || type == "undefined") && typeof o == type) || (o == null && type == "null") || lowerCase.call(objectToString.call(o).slice(8, -1)) == type;
    };
    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            toHex = cacher(function (color) {
                var bod;
                color = (color + E)[rp](trim, E);
                try {
                    var docum = new ActiveXObject("htmlfile");
                    docum.write("<body>");
                    docum.close();
                    bod = docum.body;
                } catch(e) {
                    bod = createPopup().document.body;
                }
                var range = bod.createTextRange();
                try {
                    bod.style.color = color;
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value[toString](16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            doc.body[appendChild](i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    };
    R.hsb2rgb = cacher(function (hue, saturation, brightness) {
        if (R.is(hue, "object") && "h" in hue && "s" in hue && "b" in hue) {
            brightness = hue.b;
            saturation = hue.s;
            hue = hue.h;
        }
        var red,
            green,
            blue;
        if (brightness == 0) {
            return {r: 0, g: 0, b: 0, hex: "#000"};
        }
        if (hue > 1 || saturation > 1 || brightness > 1) {
            hue /= 255;
            saturation /= 255;
            brightness /= 255;
        }
        var i = ~~(hue * 6),
            f = (hue * 6) - i,
            p = brightness * (1 - saturation),
            q = brightness * (1 - (saturation * f)),
            t = brightness * (1 - (saturation * (1 - f)));
        red = [brightness, q, p, p, t, brightness, brightness][i];
        green = [t, brightness, brightness, q, p, p, t][i];
        blue = [p, p, t, brightness, brightness, q, p][i];
        red *= 255;
        green *= 255;
        blue *= 255;
        var rgb = {r: red, g: green, b: blue},
            r = (~~red)[toString](16),
            g = (~~green)[toString](16),
            b = (~~blue)[toString](16);
        r = r[rp](rg, "0");
        g = g[rp](rg, "0");
        b = b[rp](rg, "0");
        rgb.hex = "#" + r + g + b;
        return rgb;
    }, R);
    R.rgb2hsb = cacher(function (red, green, blue) {
        if (R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (R.is(red, "string")) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            hue,
            saturation,
            brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            hue < 0 && hue++;
            hue > 1 && hue--;
        }
        return {h: hue, s: saturation, b: brightness};
    }, R);
    var p2s = /,?([achlmqrstvxz]),?/gi;
    R._path2string = function () {
        return this.join(",")[rp](p2s, "$1");
    };
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array[proto].slice.call(arguments, 0),
                args = arg[join]("\u25ba"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count[length] >= 1e3 && delete cache[count.shift()];
            count[push](args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }
 
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = colour + E).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        !(({hs: 1, rg: 1})[has](colour.substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            t,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                rgb = rgb[4][split](/\s*,\s*/);
                red = toFloat(rgb[0]);
                green = toFloat(rgb[1]);
                blue = toFloat(rgb[2]);
            }
            if (rgb[5]) {
                rgb = rgb[5][split](/\s*,\s*/);
                red = toFloat(rgb[0]) * 2.55;
                green = toFloat(rgb[1]) * 2.55;
                blue = toFloat(rgb[2]) * 2.55;
            }
            if (rgb[6]) {
                rgb = rgb[6][split](/\s*,\s*/);
                red = toFloat(rgb[0]);
                green = toFloat(rgb[1]);
                blue = toFloat(rgb[2]);
                return R.hsb2rgb(red, green, blue);
            }
            if (rgb[7]) {
                rgb = rgb[7][split](/\s*,\s*/);
                red = toFloat(rgb[0]) * 2.55;
                green = toFloat(rgb[1]) * 2.55;
                blue = toFloat(rgb[2]) * 2.55;
                return R.hsb2rgb(red, green, blue);
            }
            rgb = {r: red, g: green, b: blue};
            var r = (~~red)[toString](16),
                g = (~~green)[toString](16),
                b = (~~blue)[toString](16);
            r = r[rp](rg, "0");
            g = g[rp](rg, "0");
            b = b[rp](rg, "0");
            rgb.hex = "#" + r + g + b;
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1};
    }, R);
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, "array") && R.is(pathString[0], "array")) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data[length]) {
            (pathString + E)[rp](/([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c[rp](/(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig, function (a, b) {
                    b && params[push](+b);
                });
                while (params[length] >= paramCounts[name]) {
                    data[push]([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    };
                }
            });
        }
        data[toString] = R._path2string;
        return data;
    });
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            x = pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
            y = pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t * t * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t * t * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t * t * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t * t * (p2y - 2 * c2y + c1y),
            ax = (1 - t) * p1x + t * c1x,
            ay = (1 - t) * p1y + t * c1y,
            cx = (1 - t) * c2x + t * p2x,
            cy = (1 - t) * c2y + t * p2y,
            alpha = (90 - math.atan((mx - nx) / (my - ny)) * 180 / math.PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {x: x, y: y, m: {x: mx, y: my}, n: {x: nx, y: ny}, start: {x: ax, y: ay}, end: {x: cx, y: cy}, alpha: alpha};
    };
    var pathDimensions = cacher(function (path) {
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path[length]; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X[push](x);
                Y[push](y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y);
        return {
            x: xmin,
            y: ymin,
            width: mmax[apply](0, X) - xmin,
            height: mmax[apply](0, Y) - ymin
        };
    }),
        pathClone = function (pathArray) {
            var res = [];
            if (!R.is(pathArray, "array") || !R.is(pathArray && pathArray[0], "array")) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            for (var i = 0, ii = pathArray[length]; i < ii; i++) {
                res[i] = [];
                for (var j = 0, jj = pathArray[i][length]; j < jj; j++) {
                    res[i][j] = pathArray[i][j];
                }
            }
            res[toString] = R._path2string;
            return res;
        },
        pathToRelative = cacher(function (pathArray) {
            if (!R.is(pathArray, "array") || !R.is(pathArray && pathArray[0], "array")) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[push](["M", x, y]);
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i][length];
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, 0, pathClone),
        pathToAbsolute = cacher(function (pathArray) {
            if (!R.is(pathArray, "array") || !R.is(pathArray && pathArray[0], "array")) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else {
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    default:
                        x = res[i][res[i][length] - 2];
                        y = res[i][res[i][length] - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, null, pathClone),
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var PI = math.PI,
                _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                rx = mmax(rx, math.abs(x));
                ry = mmax(ry, math.abs(y));
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1){
                   rx = math.sqrt(h) * rx;
                   ry = math.sqrt(h) * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(7)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(7));
 
                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (math.abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res)[join]()[split](",");
                var newres = [];
                for (var i = 0, ii = res[length]; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            math.abs(t1) > 1e12 && (t1 = .5);
            math.abs(t2) > 1e12 && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            math.abs(t1) > 1e12 && (t1 = .5);
            math.abs(t2) > 1e12 && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = cacher(function (path, path2) {
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i][length] > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi[length]) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                };
            for (var i = 0, ii = mmax(p[length], p2 && p2[length] || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg[length],
                    seg2len = p2 && seg2[length];
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient[length]; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots[push](dot);
            }
            for (var i = 1, ii = dots[length] - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        getContainer = function () {
            var container,
                x,
                y,
                width,
                height;
            if (R.is(arguments[0], "string") || R.is(arguments[0], "object")) {
                if (R.is(arguments[0], "string")) {
                    container = doc.getElementById(arguments[0]);
                } else {
                    container = arguments[0];
                }
                if (container.tagName) {
                    if (arguments[1] == null) {
                        return {
                            container: container,
                            width: container.style.pixelWidth || container.offsetWidth,
                            height: container.style.pixelHeight || container.offsetHeight
                        };
                    } else {
                        return {container: container, width: arguments[1], height: arguments[2]};
                    }
                }
            } else if (R.is(arguments[0], nu) && arguments[length] > 3) {
                return {container: 1, x: arguments[0], y: arguments[1], width: arguments[2], height: arguments[3]};
            }
        },
        plugins = function (con, add) {
            var that = this;
            for (var prop in add) if (add[has](prop) && !(prop in con)) {
                switch (typeof add[prop]) {
                    case "function":
                        (function (f) {
                            con[prop] = con === that ? f : function () { return f[apply](that, arguments); };
                        })(add[prop]);
                    break;
                    case "object":
                        con[prop] = con[prop] || {};
                        plugins.call(this, con[prop], add[prop]);
                    break;
                    default:
                        con[prop] = add[prop];
                    break;
                }
            }
        },
        tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        removed = function (methodname) {
            return function () {
                throw new Error("Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object");
            };
        },
        radial_gradient = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/;
 
    // SVG
    if (R.svg) {
        Paper[proto].svgns = "http://www.w3.org/2000/svg";
        Paper[proto].xlink = "http://www.w3.org/1999/xlink";
        var round = function (num) {
            return +num + (~~num === num) * .5;
        },
            roundPath = function (path) {
                for (var i = 0, ii = path[length]; i < ii; i++) {
                    if (lowerCase.call(path[i][0]) != "a") {
                        for (var j = 1, jj = path[i][length]; j < jj; j++) {
                            path[i][j] = round(path[i][j]);
                        }
                    } else {
                        path[i][6] = round(path[i][6]);
                        path[i][7] = round(path[i][7]);
                    }
                }
                return path;
            },
            $ = function (el, attr) {
                if (attr) {
                    for (var key in attr) if (attr[has](key)) {
                        el[setAttribute](key, attr[key]);
                    }
                } else {
                    return doc.createElementNS(Paper[proto].svgns, el);
                }
            };
        R[toString] = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas[appendChild](el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            var type = "linear",
                fx = .5, fy = .5,
                s = o.style;
            gradient = (gradient + E)[rp](radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(angle * math.PI / 180), math.sin(angle * math.PI / 180)],
                    max = 1 / (mmax(math.abs(vector[2]), math.abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            var el = $(type + "Gradient");
            el.id = "r" + (R._id++)[toString](36);
            $(el, type == "radial" ? {fx: fx, fy: fy} : {x1: vector[0], y1: vector[1], x2: vector[2], y2: vector[3]});
            SVG.defs[appendChild](el);
            for (var i = 0, ii = dots[length]; i < ii; i++) {
                var stop = $("stop");
                $(stop, {
                    offset: dots[i].offset ? dots[i].offset : !i ? "0%" : "100%",
                    "stop-color": dots[i].color || "#fff"
                });
                el[appendChild](stop);
            };
            $(o, {
                fill: "url(#" + el.id + ")",
                opacity: 1,
                "fill-opacity": 1
            });
            s.fill = E;
            s.opacity = 1;
            s.fillOpacity = 1;
            return 1;
        };
        var updatePosition = function (o) {
            var bbox = o.getBBox();
            $(o.pattern, {patternTransform: R.format("translate({0},{1})", bbox.x, bbox.y)});
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                    "": [0],
                    "none": [0],
                    "-": [3, 1],
                    ".": [1, 1],
                    "-.": [3, 1, 1, 1],
                    "-..": [3, 1, 1, 1, 1, 1],
                    ". ": [1, 3],
                    "- ": [4, 3],
                    "--": [8, 3],
                    "- .": [4, 3, 1, 3],
                    "--.": [8, 3, 1, 3],
                    "--..": [8, 3, 1, 3, 1, 3]
                },
                node = o.node,
                attrs = o.attrs,
                rot = o.rotate(),
                addDashes = function (o, value) {
                    value = dasharray[lowerCase.call(value)];
                    if (value) {
                        var width = o.attrs["stroke-width"] || "1",
                            butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                            dashes = [];
                        var i = value[length];
                        while (i--) {
                            dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                        }
                        $(node, {"stroke-dasharray": dashes[join](",")});
                    }
                };
            params[has]("rotation") && (rot = params.rotation);
            var rotxy = (rot + E)[split](separator);
            if (!(rotxy.length - 1)) {
                rotxy = null;
            } else {
                rotxy[1] = +rotxy[1];
                rotxy[2] = +rotxy[2];
            }
            toFloat(rot) && o.rotate(0, true);
            for (var att in params) if (params[has](att)) {
                if (!availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "rotation":
                        o.rotate(value, true);
                        break;
                    // Hyperlink
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (lowerCase.call(pn.tagName) != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl[appendChild](node);
                            pn = hl;
                        }
                        pn.setAttributeNS(o.paper.xlink, att, value);
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "clip-rect":
                        var rect = (value + E)[split](separator);
                        if (rect[length] == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = "r" + (R._id++)[toString](36);
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el[appendChild](rc);
                            o.paper.defs[appendChild](el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var clip = doc.getElementById(node.getAttribute("clip-path")[rp](/(^url\(#|\)$)/g, E));
                            clip && clip.parentNode.removeChild(clip);
                            $(node, {"clip-path": E});
                            delete o.clip;
                        }
                    break;
                    case "path":
                        if (value && o.type == "path") {
                            attrs.path = roundPath(pathToAbsolute(value));
                            $(node, {d: attrs.path});
                        }
                        break;
                    case "width":
                        node[setAttribute](att, value);
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        rotxy && (att == "x" || att == "cx") && (rotxy[1] += value - attrs[att]);
                        node[setAttribute](att, round(value));
                        o.pattern && updatePosition(o);
                        break;
                    case "height":
                        node[setAttribute](att, value);
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        rotxy && (att == "y" || att == "cy") && (rotxy[2] += value - attrs[att]);
                        node[setAttribute](att, round(value));
                        o.pattern && updatePosition(o);
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node[setAttribute](att, value);
                        }
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(o.paper.xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        node.style.strokeWidth = value;
                        // Need following line for Firefox
                        node[setAttribute](att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"]);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value);
                        break;
                    case "translation":
                        var xy = (value + E)[split](separator);
                        xy[0] = +xy[0] || 0;
                        xy[1] = +xy[1] || 0;
                        if (rotxy) {
                            rotxy[1] += xy[0];
                            rotxy[2] += xy[1];
                        }
                        translate.call(o, xy[0], xy[1]);
                        break;
                    case "scale":
                        var xy = (value + E)[split](separator);
                        o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
                        break;
                    case "fill":
                        var isURL = (value + E).match(ISURL);
                        if (isURL) {
                            var el = $("pattern"),
                                ig = $("image");
                            el.id = "r" + (R._id++)[toString](36);
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                            $(ig, {x: 0, y: 0});
                            ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                            el[appendChild](ig);
 
                            var img = doc.createElement("img");
                            img.style.cssText = "position:absolute;left:-9999em;top-9999em";
                            img.onload = function () {
                                $(el, {width: this.offsetWidth, height: this.offsetHeight});
                                $(ig, {width: this.offsetWidth, height: this.offsetHeight});
                                doc.body.removeChild(this);
                                o.paper.safari();
                            };
                            doc.body[appendChild](img);
                            img.src = isURL[1];
                            o.paper.defs[appendChild](el);
                            node.style.fill = "url(#" + el.id + ")";
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        if (!R.getRGB(value).error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((({circle: 1, ellipse: 1})[has](o.type) || (value + E).charAt() != "r") && addGradientFill(node, value, o.paper)) {
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                    case "stroke":
                        node[setAttribute](att, R.getRGB(value).hex);
                        break;
                    case "gradient":
                        (({circle: 1, ellipse: 1})[has](o.type) || (value + E).charAt() != "r") && addGradientFill(node, value, o.paper);
                        break;
                    case "opacity":
                    case "fill-opacity":
                        if (attrs.gradient) {
                            var gradient = doc.getElementById(node.getAttribute("fill")[rp](/^url\(#|\)$/g, E));
                            if (gradient) {
                                var stops = gradient.getElementsByTagName("stop");
                                stops[stops[length] - 1][setAttribute]("stop-opacity", value);
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att[rp](/(\-.)/g, function (w) {
                            return upperCase.call(w.substring(1));
                        });
                        node.style[cssrule] = value;
                        // Need following line for Firefox
                        node[setAttribute](att, value);
                        break;
                }
            }
            
            tuneText(o, params);
            if (rotxy) {
                o.rotate(rotxy.join(S));
            } else {
                toFloat(rot) && o.rotate(rot, true);
            }
        };
        var leading = 1.2;
        var tuneText = function (el, params) {
            if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                return;
            }
            var a = el.attrs,
                node = el.node,
                fontSize = node.firstChild ? toInt(doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;
 
            if (params[has]("text")) {
                a.text = params.text;
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                var texts = (params.text + E)[split]("\n");
                for (var i = 0, ii = texts[length]; i < ii; i++) if (texts[i]) {
                    var tspan = $("tspan");
                    i && $(tspan, {dy: fontSize * leading, x: a.x});
                    tspan[appendChild](doc.createTextNode(texts[i]));
                    node[appendChild](tspan);
                }
            } else {
                var texts = node.getElementsByTagName("tspan");
                for (var i = 0, ii = texts[length]; i < ii; i++) {
                    i && $(texts[i], {dy: fontSize * leading, x: a.x});
                }
            }
            $(node, {y: a.y});
            var bb = el.getBBox(),
                dif = a.y - (bb.y + bb.height / 2);
            dif && isFinite(dif) && $(node, {y: a.y + dif});
        };
        var Element = function (node, svg) {
            var X = 0,
                Y = 0;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.paper = svg;
            this.attrs = this.attrs || {};
            this.transformations = []; // rotate, translate, scale
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg: 0, cx: 0, cy: 0},
                sx: 1,
                sy: 1
            };
            !svg.bottom && (svg.bottom = this);
            this.prev = svg.top;
            svg.top && (svg.top.next = this);
            svg.top = this;
            this.next = null;
        };
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = (deg + E)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            (cy == null) && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = R.format("rotate({0} {1} {2})", this._.rt.deg, cx, cy);
                this.clip && $(this.clip, {transform: R.format("rotate({0} {1} {2})", -this._.rt.deg, cx, cy)});
            } else {
                this.transformations[0] = E;
                this.clip && $(this.clip, {transform: E});
            }
            $(this.node, {transform: this.transformations[join](S)});
            return this;
        };
        Element[proto].hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.node.style.display = "");
            return this;
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                    (bb.x + bb.width - bbox.x > bbox.width) && (bbox.width = bb.x + bb.width - bbox.x);
                }
            }
            hide && this.hide();
            return bbox;
        };
        Element[proto].attr = function () {
            if (this.removed) {
                return this;
            }
            if (arguments[length] == 0) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (arguments[length] == 1 && R.is(arguments[0], "string")) {
                if (arguments[0] == "translation") {
                    return translate.call(this);
                }
                if (arguments[0] == "rotation") {
                    return this.rotate();
                }
                if (arguments[0] == "scale") {
                    return this.scale();
                }
                if (arguments[0] == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[arguments[0]];
            }
            if (arguments[length] == 1 && R.is(arguments[0], "array")) {
                var values = {};
                for (var j in arguments[0]) if (arguments[0][has](j)) {
                    values[arguments[0][j]] = this.attrs[arguments[0][j]];
                }
                return values;
            }
            if (arguments[length] == 2) {
                var params = {};
                params[arguments[0]] = arguments[1];
                setFillAndStroke(this, params);
            } else if (arguments[length] == 1 && R.is(arguments[0], "object")) {
                setFillAndStroke(this, arguments[0]);
            }
            return this;
        };
        Element[proto].toFront = function () {
            if (this.removed) {
                return this;
            }
            this.node.parentNode[appendChild](this.node);
            var svg = this.paper;
            svg.top != this && tofront(this, svg);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                toback(this, this.paper);
                var svg = this.paper;
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode[appendChild](this.node);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node;
            node.parentNode.insertBefore(this.node, node);
            insertbefore(this, element, this.paper);
            return this;
        };
        var theCircle = function (svg, x, y, r) {
            x = round(x);
            y = round(y);
            var el = $("circle");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
            res.type = "circle";
            $(el, res.attrs);
            return res;
        };
        var theRect = function (svg, x, y, w, h, r) {
            x = round(x);
            y = round(y);
            var el = $("rect");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
            res.type = "rect";
            $(el, res.attrs);
            return res;
        };
        var theEllipse = function (svg, x, y, rx, ry) {
            x = round(x);
            y = round(y);
            var el = $("ellipse");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
            res.type = "ellipse";
            $(el, res.attrs);
            return res;
        };
        var theImage = function (svg, src, x, y, w, h) {
            var el = $("image");
            $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
            el.setAttributeNS(svg.xlink, "href", src);
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, src: src};
            res.type = "image";
            return res;
        };
        var theText = function (svg, x, y, text) {
            var el = $("text");
            $(el, {x: x, y: y, "text-anchor": "middle"});
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, "text-anchor": "middle", text: text, font: availableAttrs.font, stroke: "none", fill: "#000"};
            res.type = "text";
            setFillAndStroke(res, res.attrs);
            return res;
        };
        var setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas[setAttribute]("width", this.width);
            this.canvas[setAttribute]("height", this.height);
            return this;
        };
        var create = function () {
            var con = getContainer[apply](null, arguments),
                container = con && con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("SVG container not found.");
            }
            var cnvs = $("svg");
            width = width || 512;
            height = height || 342;
            $(cnvs, {
                xmlns: "http://www.w3.org/2000/svg",
                version: 1.1,
                width: width,
                height: height
            });
            if (container == 1) {
                cnvs.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px";
                doc.body[appendChild](cnvs);
            } else {
                if (container.firstChild) {
                    container.insertBefore(cnvs, container.firstChild);
                } else {
                    container[appendChild](cnvs);
                }
            }
            container = new Paper;
            container.width = width;
            container.height = height;
            container.canvas = cnvs;
            plugins.call(container, container, R.fn);
            container.clear();
            return container;
        };
        Paper[proto].clear = function () {
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc"))[appendChild](doc.createTextNode("Created with Rapha\xebl"));
            c[appendChild](this.desc);
            c[appendChild](this.defs = $("defs"));
        };
        Paper[proto].remove = function () {
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
        };
    }
 
    // VML
    if (R.vml) {
        var path2vml = function (path) {
            var total =  /[ahqstv]/ig,
                command = pathToAbsolute;
            (path + E).match(total) && (command = path2curve);
            total = /[clmz]/g;
            if (command == pathToAbsolute && !(path + E).match(total)) {
                var map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
                    bites = /([clmz]),?([^clmz]*)/gi,
                    val = /-?[^,\s-]+/g;
                var res = (path + E)[rp](bites, function (all, command, args) {
                    var vals = [];
                    args[rp](val, function (value) {
                        vals[push](round(value));
                    });
                    return map[command] + vals;
                });
                return res;
            }
            var pa = command(path), p, res = [], r;
            for (var i = 0, ii = pa[length]; i < ii; i++) {
                p = pa[i];
                r = lowerCase.call(pa[i][0]);
                r == "z" && (r = "x");
                for (var j = 1, jj = p[length]; j < jj; j++) {
                    r += round(p[j]) + (j != jj - 1 ? "," : E);
                }
                res[push](r);
            }
            return res[join](S);
        };
        
        R[toString] = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, VML) {
            var g = createNode("group");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + VML.width + "px;height:" + VML.height + "px";
            g.coordsize = VML.coordsize;
            g.coordorigin = VML.coordorigin;
            var el = createNode("shape"), ol = el.style;
            ol.width = VML.width + "px";
            ol.height = VML.height + "px";
            el.coordsize = this.coordsize;
            el.coordorigin = this.coordorigin;
            g[appendChild](el);
            var p = new Element(el, g, VML);
            p.isAbsolute = true;
            p.type = "path";
            p.path = [];
            p.Path = E;
            pathString && setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            VML.canvas[appendChild](g);
            return p;
        };
        var setFillAndStroke = function (o, params) {
            o.attrs = o.attrs || {};
            var node = o.node,
                a = o.attrs,
                s = node.style,
                xy,
                res = o;
            for (var par in params) if (params[has](par)) {
                a[par] = params[par];
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            params.cursor && (s.cursor = params.cursor);
            if (params.path && o.type == "path") {
                a.path = params.path;
                node.path = path2vml(a.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                xy = (params.translation + E)[split](separator);
                translate.call(o, xy[0], xy[1]);
                if (o._.rt.cx != null) {
                    o._.rt.cx +=+ xy[0];
                    o._.rt.cy +=+ xy[1];
                    o.setBox(o.attrs, xy[0], xy[1]);
                }
            }
            if (params.scale) {
                xy = (params.scale + E)[split](separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if ("clip-rect" in params) {
                var rect = (params["clip-rect"] + E)[split](separator);
                if (rect[length] == 4) {
                    rect[2] = +rect[2] + (+rect[0]);
                    rect[3] = +rect[3] + (+rect[1]);
                    var div = node.clipRect || doc.createElement("div"),
                        dstyle = div.style,
                        group = node.parentNode;
                    dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                    if (!node.clipRect) {
                        dstyle.position = "absolute";
                        dstyle.top = 0;
                        dstyle.left = 0;
                        dstyle.width = o.paper.width + "px";
                        dstyle.height = o.paper.height + "px";
                        group.parentNode.insertBefore(div, group);
                        div[appendChild](group);
                        node.clipRect = div;
                    }
                }
                if (!params["clip-rect"]) {
                    node.clipRect && (node.clipRect.style.clip = E);
                }
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = " progid:DXImageTransform.Microsoft.Alpha(opacity=" + (params.opacity * 100) + ")";
                s.filter = (node.filterMatrix || E) + (node.filterOpacity || E);
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"][split](",")[0][rp](/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (params.opacity != null || 
                params["stroke-width"] != null ||
                params.fill != null ||
                params.stroke != null ||
                params["stroke-width"] != null ||
                params["stroke-opacity"] != null ||
                params["fill-opacity"] != null ||
                params["stroke-dasharray"] != null ||
                params["stroke-miterlimit"] != null ||
                params["stroke-linejoin"] != null ||
                params["stroke-linecap"] != null) {
                node = o.shape || node;
                var fill = (node.getElementsByTagName("fill") && node.getElementsByTagName("fill")[0]),
                    newfill = false;
                !fill && (newfill = fill = createNode("fill"));
                if ("fill-opacity" in params || "opacity" in params) {
                    var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1);
                    opacity < 0 && (opacity = 0);
                    opacity > 1 && (opacity = 1);
                    fill.opacity = opacity;
                }
                params.fill && (fill.on = true);
                if (fill.on == null || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(ISURL);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = E;
                        fill.type = "solid";
                        if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || (params.fill + E).charAt() != "r") && addGradientFill(res, params.fill)) {
                            a.fill = "none";
                            a.gradient = params.fill;
                        }
                    }
                }
                newfill && node[appendChild](fill);
                var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                newstroke = false;
                !stroke && (newstroke = stroke = createNode("stroke"));
                if ((params.stroke && params.stroke != "none") ||
                    params["stroke-width"] ||
                    params["stroke-opacity"] != null ||
                    params["stroke-dasharray"] ||
                    params["stroke-miterlimit"] ||
                    params["stroke-linejoin"] ||
                    params["stroke-linecap"]) {
                    stroke.on = true;
                }
                (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                stroke.on && params.stroke && (stroke.color = R.getRGB(params.stroke).hex);
                var opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1),
                    width = (toFloat(params["stroke-width"]) || 1) * .75;
                opacity < 0 && (opacity = 0);
                opacity > 1 && (opacity = 1);
                params["stroke-width"] == null && (width = a["stroke-width"]);
                params["stroke-width"] && (stroke.weight = width);
                width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                stroke.opacity = opacity;
                
                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                }
                newstroke && node[appendChild](stroke);
            }
            if (res.type == "text") {
                var s = res.paper.span.style;
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.string && (res.paper.span.innerHTML = (res.node.string + E)[rp](/</g, "&#60;")[rp](/&/g, "&#38;")[rp](/\n/g, "<br>"));
                res.W = a.w = res.paper.span.offsetWidth;
                res.H = a.h = res.paper.span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + round(res.H / 2);
 
                // text-anchor emulationm
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = round(res.W / 2);
                    break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -round(res.W / 2);
                    break;
                    default:
                        res.node.style["v-text-align"] = "center";
                    break;
                }
            }
        };
        var addGradientFill = function (o, gradient) {
            o.attrs = o.attrs || {};
            var attrs = o.attrs,
                fill = o.node.getElementsByTagName("fill"),
                type = "linear",
                fxfy = ".5 .5";
            o.attrs.gradient = gradient;
            gradient = (gradient + E)[rp](radial_gradient, function (all, fx, fy) {
                type = "radial";
                if (fx && fy) {
                    fx = toFloat(fx);
                    fy = toFloat(fy);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                    fxfy = fx + S + fy;
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            o = o.shape || o.node;
            fill = fill[0] || createNode("fill");
            if (dots[length]) {
                fill.on = true;
                fill.method = "none";
                fill.type = (type == "radial") ? "gradientradial" : "gradient";
                fill.color = dots[0].color;
                fill.color2 = dots[dots[length] - 1].color;
                var clrs = [];
                for (var i = 0, ii = dots[length]; i < ii; i++) {
                    dots[i].offset && clrs[push](dots[i].offset + S + dots[i].color);
                }
                fill.colors && (fill.colors.value = clrs[length] ? clrs[join](",") : "0% " + fill.color);
                if (type == "radial") {
                    fill.focus = "100%";
                    fill.focussize = fxfy;
                    fill.focusposition = fxfy;
                } else {
                    fill.angle = (270 - angle) % 360;
                }
            }
            return 1;
        };
        var Element = function (node, group, vml) {
            var Rotation = 0,
                RotX = 0,
                RotY = 0,
                Scale = 1;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
            !vml.bottom && (vml.bottom = this);
            this.prev = vml.top;
            vml.top && (vml.top.next = this);
            vml.top = this;
            this.next = null;
        };
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            deg = (deg + E)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            cy == null && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(this.attrs, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName("fill");
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // !R.is(fill.angle, "undefined") && (fill.angle = b);
            return this;
        };
        Element[proto].setBox = function (params, cx, cy) {
            if (this.removed) {
                return this;
            }
            var gs = this.Group.style,
                os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) if (params[has](i)) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs,
                x,
                y,
                w,
                h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "rect":
                case "image":
                    x = +attr.x;
                    y = +attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", round(attr.x), ", ", round(attr.y - 2), "l", round(attr.x) + 1, ", ", round(attr.y - 2)][join](E);
                    x = attr.x - round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path);
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                top = cy - this.paper.height / 2;
            if (this.type == "path" || this.type == "text") {
                (gs.left != left + "px") && (gs.left = left + "px");
                (gs.top != top + "px") && (gs.top = top + "px");
                this.X = this.type == "text" ? x : -left;
                this.Y = this.type == "text" ? y : -top;
                this.W = w;
                this.H = h;
                (os.left != -left + "px") && (os.left = -left + "px");
                (os.top != -top + "px") && (os.top = -top + "px");
            } else {
                (gs.left != left + "px") && (gs.left = left + "px");
                (gs.top != top + "px") && (gs.top = top + "px");
                this.X = x;
                this.Y = y;
                this.W = w;
                this.H = h;
                (gs.width != this.paper.width + "px") && (gs.width = this.paper.width + "px");
                (gs.height != this.paper.height + "px") && (gs.height = this.paper.height + "px");
                (os.left != x - left + "px") && (os.left = x - left + "px");
                (os.top != y - top + "px") && (os.top = y - top + "px");
                (os.width != w + "px") && (os.width = w + "px");
                (os.height != h + "px") && (os.height = h + "px");
                var arcsize = (+params.r || 0) / mmin(w, h);
                if (this.type == "rect" && this.arcsize.toFixed(4) != arcsize.toFixed(4) && (arcsize || this.arcsize)) {
                    // We should replace element with the new one
                    var o = createNode("roundrect"),
                        a = {},
                        i = 0,
                        ii = this.events && this.events[length];
                    o.arcsize = arcsize;
                    o.raphael = this;
                    this.Group[appendChild](o);
                    this.Group.removeChild(this.node);
                    this[0] = this.node = o;
                    this.arcsize = arcsize;
                    for (var i in attr) {
                        a[i] = attr[i];
                    }
                    delete a.scale;
                    this.attr(a);
                    if (this.events) for (; i < ii; i++) {
                        this.events[i].unbind = addEvent(this.node, this.events[i].name, this.events[i].f, this);
                    }
                }
            }
        };
        Element[proto].hide = function () {
            !this.removed && (this.Group.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.Group.style.display = "block");
            return this;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].attr = function () {
            if (this.removed) {
                return this;
            }
            if (arguments[length] == 0) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (arguments[length] == 1 && R.is(arguments[0], "string")) {
                if (arguments[0] == "translation") {
                    return translate.call(this);
                }
                if (arguments[0] == "rotation") {
                    return this.rotate();
                }
                if (arguments[0] == "scale") {
                    return this.scale();
                }
                if (arguments[0] == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[arguments[0]];
            }
            if (this.attrs && arguments[length] == 1 && R.is(arguments[0], "array")) {
                var values = {};
                for (var i = 0, ii = arguments[0][length]; i < ii; i++) {
                    values[arguments[0][i]] = this.attrs[arguments[0][i]];
                };
                return values;
            }
            var params;
            if (arguments[length] == 2) {
                params = {};
                params[arguments[0]] = arguments[1];
            }
            arguments[length] == 1 && R.is(arguments[0], "object") && (params = arguments[0]);
            if (params) {
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                setFillAndStroke(this, params);
                if (params.gradient && (({circle: 1, ellipse: 1})[has](this.type) || (params.gradient + E).charAt() != "r")) {
                    addGradientFill(this, params.gradient);
                }
                (this.type != "path" || this._.rt.deg) && this.setBox(this.attrs);
            }
            return this;
        };
        Element[proto].toFront = function () {
            !this.removed && this.Group.parentNode[appendChild](this.Group);
            this.paper.top != this && tofront(this, this.paper);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
                toback(this, this.paper);
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode[appendChild](this.Group);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            insertbefore(this, element, this.paper);
            return this;
        };
 
        var theCircle = function (vml, x, y, r) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas[appendChild](g);
            return res;
        },
        theRect = function (vml, x, y, w, h, r) {
            var g = createNode("group"),
                o = createNode("roundrect"),
                arcsize = (+r || 0) / (mmin(w, h));
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            o.arcsize = arcsize;
            var res = new Element(o, g, vml);
            res.type = "rect";
            setFillAndStroke(res, {stroke: "#000"});
            res.arcsize = arcsize;
            res.setBox({x: x, y: y, width: w, height: h, r: r});
            vml.canvas[appendChild](g);
            return res;
        },
        theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas[appendChild](g);
            return res;
        },
        theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group"),
                o = createNode("image"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            o.src = src;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.src = src;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas[appendChild](g);
            return res;
        },
        theText = function (vml, x, y, text) {
            var g = createNode("group"),
                el = createNode("shape"),
                ol = el.style,
                path = createNode("path"),
                ps = path.style,
                o = createNode("textpath");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            path.v = R.format("m{0},{1}l{2},{1}", round(x), round(y), round(x) + 1);
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            o.string = text + E;
            o.on = true;
            el[appendChild](o);
            el[appendChild](path);
            g[appendChild](el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.text = text;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas[appendChild](g);
            return res;
        },
        setSize = function (width, height) {
            var cs = this.canvas.style;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            return this;
        },
        createNode;
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        var create = function () {
            var con = getContainer[apply](null, arguments),
                container = con.container,
                height = con.height,
                s,
                width = con.width,
                x = con.x,
                y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = new Paper,
                c = res.canvas = doc.createElement("div"),
                cs = c.style;
            width = width || 512;
            height = height || 342;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.width = 1e3;
            res.height = 1e3;
            res.coordsize = "1000 1000";
            res.coordorigin = "0 0";
            res.span = doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            c[appendChild](res.span);
            cs.cssText = R.format("width:{0};height:{1};position:absolute;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                doc.body[appendChild](c);
                cs.left = x + "px";
                cs.top = y + "px";
            } else {
                container.style.width = width;
                container.style.height = height;
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container[appendChild](c);
                }
            }
            plugins.call(res, res, R.fn);
            return res;
        };
        Paper[proto].clear = function () {
            this.canvas.innerHTML = E;
            this.span = doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            this.canvas[appendChild](this.span);
            this.bottom = this.top = null;
        };
        Paper[proto].remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
        };
    }
 
    // rest
    // Safari or Chrome (WebKit) rendering bug workaround method
    if ((/^Apple|^Google/).test(navigator.vendor) && !(navigator.userAgent.indexOf("Version/4.0") + 1)) {
        Paper[proto].safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99);
            setTimeout(function () {rect.remove();});
        };
    } else {
        Paper[proto].safari = function () {};
    }
 
    // Events
    var addEvent = (function () {
        if (doc.addEventListener) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e);
                };
                obj.addEventListener(type, f, false);
                return function () {
                    obj.removeEventListener(type, f, false);
                    return true;
                };
            };
        } else if (doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e || win.event);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })();
    for (var i = events[length]; i--;) {
        (function (eventName) {
            Element[proto][eventName] = function (fn) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node, eventName, fn, this)});
                }
                return this;
            };
            Element[proto]["un" + eventName] = function (fn) {
                var events = this.events,
                    l = events[length];
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    Element[proto].hover = function (f_in, f_out) {
        return this.mouseover(f_in).mouseout(f_out);
    };
    Element[proto].unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    Paper[proto].circle = function (x, y, r) {
        return theCircle(this, x || 0, y || 0, r || 0);
    };
    Paper[proto].rect = function (x, y, w, h, r) {
        return theRect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    };
    Paper[proto].ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x || 0, y || 0, rx || 0, ry || 0);
    };
    Paper[proto].path = function (pathString) {
        pathString && !R.is(pathString, "string") && !R.is(pathString[0], "array") && (pathString += E);
        return thePath(R.format[apply](R, arguments), this);
    };
    Paper[proto].image = function (src, x, y, w, h) {
        return theImage(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    };
    Paper[proto].text = function (x, y, text) {
        return theText(this, x || 0, y || 0, text || E);
    };
    Paper[proto].set = function (itemsArray) {
        arguments[length] > 1 && (itemsArray = Array[proto].splice.call(arguments, 0, arguments[length]));
        return new Set(itemsArray);
    };
    Paper[proto].setSize = setSize;
    Paper[proto].top = Paper[proto].bottom = null;
    Paper[proto].raphael = R;
    function x_y() {
        return this.x + S + this.y;
    };
    Element[proto].scale = function (x, y, cx, cy) {
        if (x == null && y == null) {
            return {
                x: this._.sx,
                y: this._.sy,
                toString: x_y
            };
        }
        y = y || x;
        !+y && (y = x);
        var dx,
            dy,
            dcx,
            dcy,
            a = this.attrs;
        if (x != 0) {
            var bb = this.getBBox(),
                rcx = bb.x + bb.width / 2,
                rcy = bb.y + bb.height / 2,
                kx = x / this._.sx,
                ky = y / this._.sy;
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var dirx = ~~(x / math.abs(x)),
                diry = ~~(y / math.abs(y)),
                s = this.node.style,
                ncx = cx + (rcx - cx) * kx,
                ncy = cy + (rcy - cy) * ky;
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * dirx * kx,
                        newh = a.height * diry * ky;
                    this.attr({
                        height: newh,
                        r: a.r * mmin(dirx * kx, diry * ky),
                        width: neww,
                        x: ncx - neww / 2,
                        y: ncy - newh / 2
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * dirx * kx,
                        ry: a.ry * diry * ky,
                        r: a.r * mmin(dirx * kx, diry * ky),
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                        skip = true;
                    for (var i = 0, ii = path[length]; i < ii; i++) {
                        var p = path[i],
                            j,
                            P0 = upperCase.call(p[0]);
                        if (P0 == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (P0 == "A") {
                            p[path[i][length] - 2] *= kx;
                            p[path[i][length] - 1] *= ky;
                            p[1] *= dirx * kx;
                            p[2] *= diry * ky;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else if (P0 == "H") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= kx;
                            }
                        } else if (P0 == "V") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= ky;
                            }
                         } else {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= (j % 2) ? kx : ky;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path),
                        dx = ncx - dim2.x - dim2.width / 2,
                        dy = ncy - dim2.y - dim2.height / 2;
                    path[0][1] += dx;
                    path[0][2] += dy;
                    this.attr({path: path});
                break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale("[concat](dirx, ",", diry, ")");
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = " progid:DXImageTransform.Microsoft.Matrix(M11="[concat](dirx,
                        ", M12=0, M21=0, M22=", diry,
                        ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = E;
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = E;
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            }
            a.scale = [x, y, cx, cy][join](S);
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };
    Element[proto].clone = function () {
        var attr = this.attr();
        delete attr.scale;
        delete attr.translation;
        return this.paper[this.type]().attr(attr);
    };
    var getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = segmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], (length - len) / l);
                            sp += ["C", point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) return sp;
                            subpaths.start = sp;
                            sp = ["M", point.x, point.y + "C", point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]][join]();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], (length - len) / l);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    },
    segmentLength = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        var old = {x: 0, y: 0},
            len = 0;
        for (var i = 0; i < 1.01; i+=.01) {
            var dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i);
            i && (len += math.sqrt(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2)));
            old = dot;
        }
        return len;
    });
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    Element[proto].getTotalLength = function () {
        if (this.type != "path") return;
        return getTotalLength(this.attrs.path);
    };
    Element[proto].getPointAtLength = function (length) {
        if (this.type != "path") return;
        return getPointAtLength(this.attrs.path, length);
    };
    Element[proto].getSubpath = function (from, to) {
        if (this.type != "path") return;
        if (math.abs(this.getTotalLength() - to) < 1e-6) {
            return getSubpathsAtLength(this.attrs.path, from).end;
        }
        var a = getSubpathsAtLength(this.attrs.path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };

    // animation easing formulas
    R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 3);
        },
        ">": function (n) {
            return pow(n - 1, 3) + 1;
        },
        "<>": function (n) {
            n = n * 2;
            if (n < 1) {
                return pow(n, 3) / 2;
            }
            n -= 2;
            return (pow(n, 3) + 2) / 2;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = .3,
                s = p / 4;
            return pow(2, -10 * n) * math.sin((n - s) * (2 * math.PI) / p) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
 
    var animationElements = {length : 0},
        animation = function () {
            var Now = +new Date;
            for (var l in animationElements) if (l != "length" && animationElements[has](l)) {
                var e = animationElements[l];
                if (e.stop) {
                    delete animationElements[l];
                    animationElements[length]--;
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    prev = e.prev || 0,
                    that = e.el,
                    callback = e.callback,
                    set = {},
                    now;
                if (time < ms) {
                    var pos = R.easing_formulas[easing] ? R.easing_formulas[easing](time / ms) : time / ms;
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case "along":
                                now = pos * ms * diff[attr];
                                to.back && (now = to.len - now);
                                var point = getPointAtLength(to[attr], now);
                                that.translate(diff.sx - diff.x || 0, diff.sy - diff.y || 0);
                                diff.x = point.x;
                                diff.y = point.y;
                                that.translate(point.x - diff.sx, point.y - diff.sy);
                                to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                                break;
                            case "number":
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ][join](",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i][join](S);
                                }
                                now = now[join](S);
                                break;
                            case "csv":
                                switch (attr) {
                                    case "translation":
                                        var x = diff[attr][0] * (time - prev),
                                            y = diff[attr][1] * (time - prev);
                                        t.x += x;
                                        t.y += y;
                                        now = x + S + y;
                                    break;
                                    case "rotation":
                                        now = +from[attr][0] + pos * ms * diff[attr][0];
                                        from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                    break;
                                    case "scale":
                                        now = [+from[attr][0] + pos * ms * diff[attr][0], +from[attr][1] + pos * ms * diff[attr][1], (2 in to[attr] ? to[attr][2] : E), (3 in to[attr] ? to[attr][3] : E)][join](S);
                                    break;
                                    case "clip-rect":
                                        now = [];
                                        var i = 4;
                                        while (i--) {
                                            now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                        }
                                    break;
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    that._run && that._run.call(that);
                } else {
                    if (to.along) {
                        var point = getPointAtLength(to.along, to.len * !to.back);
                        that.translate(diff.sx - (diff.x || 0) + point.x - diff.sx, diff.sy - (diff.y || 0) + point.y - diff.sy);
                        to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                    }
                    (t.x || t.y) && that.translate(-t.x, -t.y);
                    to.scale && (to.scale = to.scale + E);
                    that.attr(to);
                    delete animationElements[l];
                    animationElements[length]--;
                    that.in_animation = null;
                    R.is(callback, "function") && callback.call(that);
                }
                e.prev = time;
            }
            R.svg && that && that.paper.safari();
            animationElements[length] && setTimeout(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : (color < 0 ? 0 : color);
        },
        translate = function (x, y) {
            if (x == null) {
                return {x: this._.tx, y: this._.ty, toString: x_y};
            }
            this._.tx += +x;
            this._.ty += +y;
            switch (this.type) {
                case "circle":
                case "ellipse":
                    this.attr({cx: +x + this.attrs.cx, cy: +y + this.attrs.cy});
                    break;
                case "rect":
                case "image":
                case "text":
                    this.attr({x: +x + this.attrs.x, y: +y + this.attrs.y});
                    break;
                case "path":
                    var path = pathToRelative(this.attrs.path);
                    path[0][1] += +x;
                    path[0][2] += +y;
                    this.attr({path: path});
                break;
            }
            return this;
        };
    Element[proto].animateWith = function (element, params, ms, easing, callback) {
        animationElements[element.id] && (params.start = animationElements[element.id].start);
        return this.animate(params, ms, easing, callback);
    };
    Element[proto].animateAlong = along();
    Element[proto].animateAlongBack = along(1);
    function along(isBack) {
        return function (path, ms, rotate, callback) {
            var params = {back: isBack};
            R.is(rotate, "function") ? (callback = rotate) : (params.rot = rotate);
            path && path.constructor == Element && (path = path.attrs.path);
            path && (params.along = path);
            return this.animate(params, ms, callback);
        };
    }
    Element[proto].onAnimation = function (f) {
        this._run = f || 0;
        return this;
    };
    Element[proto].animate = function (params, ms, easing, callback) {
        if (R.is(easing, "function") || !easing) {
            callback = easing || null;
        }
        var from = {},
            to = {},
            diff = {};
        for (var attr in params) if (params[has](attr)) {
            if (availableAnimAttrs[has](attr)) {
                from[attr] = this.attr(attr);
                (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "along":
                        var len = getTotalLength(params[attr]),
                            point = getPointAtLength(params[attr], len * !!params.back),
                            bb = this.getBBox();
                        diff[attr] = len / ms;
                        diff.tx = bb.x;
                        diff.ty = bb.y;
                        diff.sx = point.x;
                        diff.sy = point.y;
                        to.rot = params.rot;
                        to.back = params.back;
                        to.len = len;
                        params.rot && (diff.r = toFloat(this.rotate()) || 0);
                        break;
                    case "number":
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = path2curve(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        var toPath = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = (params[attr] + E)[split](separator),
                            from2 = (from[attr] + E)[split](separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                            break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                            break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = (from[attr] + E)[split](separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                            break;
                            case "clip-rect":
                                from[attr] = (from[attr] + E)[split](separator);
                                diff[attr] = [];
                                var i = 4;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            break;
                        }
                        to[attr] = values;
                }
            }
        }
        this.stop();
        this.in_animation = 1;
        animationElements[this.id] = {
            start: params.start || +new Date,
            ms: ms,
            easing: easing,
            from: from,
            diff: diff,
            to: to,
            el: this,
            callback: callback,
            t: {x: 0, y: 0}
        };
        ++animationElements[length] == 1 && animation();
        return this;
    };
    Element[proto].stop = function () {
        animationElements[this.id] && animationElements[length]--;
        delete animationElements[this.id];
        return this;
    };
    Element[proto].translate = function (x, y) {
        return this.attr({translation: x + " " + y});
    };
    Element[proto][toString] = function () {
        return "Rapha\xebl\u2019s object";
    };
    R.ae = animationElements;
 
    // Set
    var Set = function (items) {
        this.items = [];
        this[length] = 0;
        if (items) {
            for (var i = 0, ii = items[length]; i < ii; i++) {
                if (items[i] && (items[i].constructor == Element || items[i].constructor == Set)) {
                    this[this.items[length]] = this.items[this.items[length]] = items[i];
                    this[length]++;
                }
            }
        }
    };
    Set[proto][push] = function () {
        var item,
            len;
        for (var i = 0, ii = arguments[length]; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == Element || item.constructor == Set)) {
                len = this.items[length];
                this[len] = this.items[len] = item;
                this[length]++;
            }
        }
        return this;
    };
    Set[proto].pop = function () {
        delete this[this[length]--];
        return this.items.pop();
    };
    for (var method in Element[proto]) if (Element[proto][has](method)) {
        Set[proto][method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items[length]; i < ii; i++) {
                    this.items[i][methodname][apply](this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set[proto].attr = function (name, value) {
        if (name && R.is(name, "array") && R.is(name[0], "object")) {
            for (var j = 0, jj = name[length]; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                this.items[i].attr[apply](this.items[i], arguments);
            }
        }
        return this;
    };
    Set[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
            i = len,
            set = this,
            collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        this.items[--i].animate(params, ms, easing || collector, collector);
        while (i--) {
            this.items[i].animateWith(this.items[len - 1], params, ms, easing || collector, collector);
        }
        return this;
    };
    Set[proto].insertAfter = function (el) {
        var i = this.items[length];
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    Set[proto].getBBox = function () {
        var x = [],
            y = [],
            w = [],
            h = [];
        for (var i = this.items[length]; i--;) {
            var box = this.items[i].getBBox();
            x[push](box.x);
            y[push](box.y);
            w[push](box.x + box.width);
            h[push](box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };
 
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family][push](fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d[rp](/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    Paper[proto].getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family[rp](/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font[length]; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    Paper[proto].print = function (x, y, string, font, size, origin) {
        origin = origin || "middle"; // baseline|middle
        var out = this.set(),
            letters = (string + E)[split](E),
            shift = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox.split(separator),
                top = +bb[0],
                height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters[length]; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) : 0;
                curr && curr.d && out[push](this.path(curr.d).attr({fill: "#000", stroke: "none", translation: [shift, 0]}));
            }
            out.scale(scale, scale, top, height).translate(x - top, y - height);
        }
        return out;
    };
 
    R.format = function (token) {
        var args = R.is(arguments[1], "array") ? [0][concat](arguments[1]) : arguments,
            rg = /\{(\d+)\}/g;
        token && R.is(token, "string") && args[length] - 1 && (token = token[rp](rg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    R.ninja = function () {
        var r = Raphael;
        if (oldRaphael.was) {
            Raphael = oldRaphael.is;
        } else {
            delete Raphael;
        }
        return r;
    };
    R.el = Element[proto];
    return R;
})();/*!
 * AjaxRequest
 * @version $Rev$
 */
/**
 * Make XHR requests, and parse JSON responses.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 */
AjaxRequest = base2.Base.extend({
    /**
     * Constructor to create a new AjaxRequest object.
     * 
     * If options.url is set, an XHR request will be made
     * immediately.
     * 
     * @constructor
     * @param Object options object, can contain url String,
     * function onsuccess, Function onerror, nNumber timeout,
     * [GET|POST] type, [raw|json] dataType, Boolean async, String data
     * 
     */
    constructor : function(options) {
        if ( options == undefined ) options = {};
        if ( options.url ) this.url = options.url;
        for ( var p in options ) this.options[p] = options[p];
        //this.____http = this.getHttp();
        this.response = this.getResponse();
        if ( this.url ) this.makeRequest();
    },
    /**
     * Get an http transport object (cross browser).
     * 
     * @private
     * @param {String|Object|Array|Boolean|Number} paramName Describe this parameter
     * @returns Describe what it returns
     * @type String|Object|Array|Boolean|Number
     */
    getHttp : function() {
        if ( AjaxRequest._http ) return AjaxRequest._http;
        var http = ( window.XMLHttpRequest ) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        if ( !http ) return null;
        var that = this;
        http.onreadystatechange = function() {
            that.onReadyStateChange();
        }
        AjaxRequest._http = http;
        return http;
    },
    /**
     * Get an AjaxResponse object.
     * 
     * @return AjaxResponse AjaxResponse object
     */
    getResponse : function() {
        if ( this.response ) return this.response;
        this.response = new AjaxResponse();
        return this.response;
    },
    /**
     * Make an actual request
     * 
     * @param Object options object, can contain url String,
     * function onsuccess, Function onerror, nNumber timeout,
     * [GET|POST] type, [raw|json] dataType, Boolean async, String data
     */
    makeRequest : function(options) {
        if ( options == undefined ) options = {};
        for ( var p in this.options ) if ( options[p] == undefined ) options[p] = this.options[p];
        var that = this;
        this.timeout = setTimeout(function() {
            that.onTimeout()
        },options.timeout);
        this.getHttp().open(options.type, options.url, options.async);
        this.getHttp().send(options.data)
    },
    /**
     * Event fired by ready state changes in http transport
     */
    onReadyStateChange : function() {
        this.response.readyState = this.getHttp().readyState;
        if ( this.getHttp().readyState == 4 ) {
            clearTimeout(this.timeout);
            this.parseResult();
        }
    },
    /**
     * Event fired by timeout in http transport.  Fires onerror.
     */
    onTimeout : function() {
        this.getHttp().abort();
        this.response.status = 0;
        this.response.ok = false;
        this.options.onerror(this.response,this);
    },
    /**
     * Parses the result of a request.  Will decode JSON if dataType
     * is set to 'JSON'.
     */
    parseResult : function() {
        this.response.status = this.getHttp().status;
        this.response.responseText = this.getHttp().responseText;
        this.response.responseXML = this.getHttp().responseXML;
        this.response.ok = AjaxRequest.okStatus(this.getHttp().status);
        if ( this.options.dataType.toLowerCase() == 'json' ) {
            this.response.responseData = json_parse(this.getHttp().responseText);
        }
        if ( this.response.ok ) {
            this.options.onsuccess(this.response,this);
        } else {
            this.options.onerror(this.response,this);
        }
    },
    /**
     * Default set of options.
     */
    options : {
        onsuccess : function(rsp,req) {},
        onerror : function(rsp,req) {},
        timeout : 10000,
        type : "GET",
        dataType : "raw",
        async : true,
        data : null
    }
},
{
    /**
     * Static method to classify an "OK" http status code.
     * 
     * @return Boolean
     */
    okStatus : function(status) {
        return ( status == 200 || status == 304 );
    }
});

/**
 * AjaxResponse objects contain Number status, Boolean ok,
 * String responseText, String responseXML and Object
 * responseData
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires AjaxRequest
 */
AjaxResponse = base2.Base.extend({
    status : 0,
    ok : false,
    responseText : null,
    responseXML : null,
    responseData : null
})

/*!
 * Class StageItem()
 */
StageItem = base2.Base.extend({
    constructor : function() {
        this.items = new base2.Map();
    },
    toString : function() {
        return 'StageItem';
    },
    item : function(i) {
        if ( !i ) i = StageItem.key;
        return this.items.get(i);
    },
    add : function(itemObject,key) {
        if ( !key ) key = StageItem.key;
        this.remove(key);
        this.items.put(key,itemObject);
    },
    remove : function(key) {
        if ( key == undefined ) {
            this.items.forEach(function(i){i.remove()}, this);
        } else {
            if ( this.items.has(key) ) this.items.get(key).remove();
        }
        //if ( this.item !== undefined ) this.item.remove();
    },
    attr : function(o, key) {
        if ( key == undefined ) {
            this.items.forEach(function(i){i.attr(o)}, this);
        } else {
            this.items.get(key).attr(o);
        }
    },
    animate : function(o,t,e, key) {
        if ( key == undefined ) {
            this.items.forEach(function(i){i.animate(o,t,e)}, this);
        } else {
            this.items.get(key).animate(o,t,e);
        }
    },
    stop : function( key ) {
        // undocumented use of Raphael - stop() the animation
        if ( key == undefined ) {
            this.items.forEach(function(i){ i.stop(); });
        } else {
            this.items.get(key).stop();
        }
    },
    grabData : function(o,klass) {
        if ( o == undefined ) o = {}
        for ( var p in klass.defaults ) 
            if ( o[p] == undefined ) 
                o[p] = klass.defaults[p];
        for ( var p in o ) this[p] = o[p];
    },
    getNode : function(i) {
        if ( i == undefined ) i = StageItem.key;
        var node = base2.DOM.bind(this.items.get(i).node);
        return node;
    },
    getNodes : function() {
        return new base2.Map(this.items.map( function(i){return base2.DOM.bind(i.node)} ));
    },
    isTouching : function(otherItem) {
        var dx = otherItem.x - this.x;
        var dy = otherItem.y - this.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        return ( d < this.radius + otherItem.radius );
    },
    pathString : function(ox,oy,nx,ny) {
        return "M"+ox+" "+oy+"L"+nx+" "+ny;
    }
},
{
    key : "item",
    defaults : {}
});

/*!
 * Class TextItem()
 */
TextItem = StageItem.extend({
    constructor : function(data,paper,screen) {
        this.base();
        this.grabData(data,TextItem);
        this.paper = paper;
        this.screen = screen;
        this.write();
    },
    write : function(x,y,text,attribs) {
        this.setup(x,y,text,attribs);
        this.writeText();
    },
    setup : function(x,y,text,attribs) {
        text = text || this.text;
        x = x || this.x;
        y = y || this.y;
        attribs = attribs || this.attribs;
        this.text = text;
        this.x = x;
        this.y = y;
        this.attribs = attribs;
    },
    writeText : function(s) {
        if ( s == undefined ) s = this.text
        //this.remove("text");
        this.add(this.paper.text(this.x,this.y,s), "text");
        this.attr({font:this.font}, "text");
        this.attr({fill:this.fill}, "text");
        this.attr(this.attribs, "text");
    }
},
{
   defaults : {
       text : "Default",
       font : '20px Arial, Helvetica',
       fill : '#fff',
       attribs : {},
       events : {}
   } 
});

/**
 * Clickable buttons.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires TextItem
 */
ButtonItem = TextItem.extend({
    _className : 'ButtonItem',
    constructor : function(data,paper,screen) {
        this.grabData(data,ButtonItem);
        this.base(data,paper,screen);
    },
    toString : function() {
        return 'ButtonItem';
    },
    write : function(x,y,text,attribs) {
        this.base(x,y,text,attribs);
        this.addBackground();
        this.addEvents();
    },
    addBackground : function() {
        var bbox = this.item('text').getBBox();
        var bg = {
            x : bbox.x - this.padding,
            y : bbox.y - this.padding,
            width : bbox.width + this.padding*2,
            height : bbox.height + this.padding*2
        }
        this.add(this.paper.rect(bg.x,bg.y,bg.width,bg.height,5), 'bg');
        this.attr({fill:this.bgfill}, 'bg');
        this.getNode('text').style.cursor = 'pointer';
        this.getNode('bg').style.cursor = 'pointer';
        this.item('text').toFront();
    },
    addEvents : function() {
        var that = this, fn, args=[];
        for ( var ev in this.events ) {
            fn = this.events[ev];
            this.getNodes().forEach(function(n) {n.addEventListener(ev, function(){that.screen[fn](), false})});
            //this.getNode('bg').addEventListener(ev, function(){that.screen[fn]()}, false);
            //this.getNode('text').addEventListener(ev, function(){that.screen[fn]()}, false);
        }
    }
},
{
   defaults : {
       text : 'Default',
       font : '20px Arial, Helvetica',
       fill : '#000',
       attribs : {},
       events : {},
       padding : 5,
       bgfill : '90-#090-#6f6'
   } 
})

/*!
 * Class Screen()
 */
Screen = base2.Base.extend({
    paper : null,
    game : null,
    constructor : function(paper,game) {
        this.paper = paper;
        this.game = game;
        this.items = {};
    },
    remove : function() {
        for (var item in this.items) {
            this.items[item].remove();
            //delete this.items[item];
        }
        this.items = {}
    }
},
{
    
})

/**
 * Arrow shown when the Projectile is outside viewport.
 * @author pete
 * @version $Rev$
 * @requires StageItem
 */
Arrow = StageItem.extend({
    centre : {x:400,y:250},
    visible : false,
    items : [],
    constructor : function(data,level) {
        this.base();
        this.grabData(data,Arrow);
        var paper = this.paper = level.game.paper;
        this.x = 400;
        this.y = 250;
    },
    place : function(x,y) {
        if ( Game.isOffScreen(x,y) ) {
            this.show();
            var o_hyp = Math.sqrt(x*x + y*y);
            var t_txt = Math.round(o_hyp);
            x = (x<0) ? 0 : (x>800) ? 800 : x;
            y = (y<0) ? 0 : (y>500) ? 500 : y;
            var cx = x - this.centre.x;
            var cy = y - this.centre.y;
            var rd = Math.atan2(cy,cx);
            var dg = rd * 180 / Math.PI;
            dg += 90;
            rd += Math.PI/2;
            var dx = x - this.x;
            var dy = y - this.y;
            this.item('arrow').translate(dx,dy);
            this.x = x;
            this.y = y;
            this.item('arrow').rotate(dg,this.x,this.y);
        } else {
            this.hide();
        }
    },
    hide : function() {
        if ( this.visible ) {
            this.visible = false;
            this.remove();
        }
    },
    show : function() {
        if ( !this.visible ) {
            this.visible = true;
            this.add(this.paper.path("M400 250L390 262,L397 260,L400 275,L403 260,L410 262,L400 250"), 'arrow');
            this.attr({stroke:'none',fill:'#fff'}, 'arrow');
            this.x = 400;
            this.y = 250;
            this.item('arrow').toFront();
        }
    }
},
{
    defaults : {}
});


/**
 * Catapult which fires the Projectile.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires StageItem
 * @requires Projectile
 */
Catapult = StageItem.extend({
    _lines : {},
    _points : {},
    constructor : function (data, level) {
        this.base();
        this.level = level;
        var paper = this.paper = level.game.paper;
        this.grabData(data,Catapult);
    	//this.rband = this.line('rband',0,0,100,100);
        this._points['point1'] = paper.circle(0, 0, this.pointRadius);
    	this._points['point2'] = paper.circle(0, 0, this.pointRadius);
    	//this.rotate(this.angle);
    	this.attr({
    	    fill : "darkblue",
    	    stroke : "lightsteelblue"
    	});
    	
    },
    
    attr : function(o, x, y) {
        if ( x == undefined ) x = this.x;
        if ( y == undefined ) y = this.y;
        var o1 = Cloner.cloneObject(o);
        var o2 = Cloner.cloneObject(o);
        var t = o['translation'];
        var pc = this.getPointCoords(this.angle);
        o1.translation = pc[0][0] + " " + pc[0][1];
        o2.translation = pc[1][0] + " " + pc[1][1];
        //this.rband = this.line("rband",pc[0][0],pc[0][1],pc[1][0],pc[1][1]);
        this._line("rband1",this.x,this.y,pc[0][0],pc[0][1]);
        this._line("rband2",this.x,this.y,pc[1][0],pc[1][1]);
        this._points['point1'].attr(o1);
        this._points['point2'].attr(o2);
    },
    remove : function() {
        this._removeLines();
        this._removePoints();
    },
    getPointCoords : function(a) {
        return [ this._rCoords(a,1), this._rCoords(a,-1) ];
    },
    _rCoords : function(a,f) {
        a *= -1; // +ve rotation is clockwise
        var h = this.width/2;
        var r = a*Math.PI/180;
        var p1_x = this.x + h * Math.cos(r) * f;
        var p1_y = this.y - h * Math.sin(r) * f;
        return [p1_x, p1_y];
    },
    position : function(x,y) {
        this.x = x;
        this.y = y;
        this.rotate(this.angle);
    },
    rotate : function(a) {
        this.angle = a;
        this.line();
    },
    _line : function(id,x1,y1,x2,y2) {
        if ( this._lines[id] ) this._lines[id].remove();
        this._lines[id] = this.paper.path(this.pathString(x1,y1,x2,y2));
        this._lines[id].attr('stroke',this.lineColor);
        return this._lines[id];
    },
    _removeLine : function(id) {
        this._lines[id].remove();
    },
    _removeLines : function() {
        for ( var id in this._lines ) {
            this._removeLine(id);
        }
    },
    _point : function(id,x,y) {
        if ( this._points[id] ) this._points[id].remove();
        this._points[id] = this.paper.circle(x,y,this.pointRadius);
    	this._points[id].attr({
    	    fill : "darkblue",
    	    stroke : "lightsteelblue"
    	});
    },
    _removePoint : function(id) {
        this._points[id].remove();
    },
    _removePoints : function() {
        for ( var id in this._points ) {
            this._removePoint(id);
        }
    },
    fire : function(t) {
        this.projectile.fire(t);
        this.pullTo(this.x,this.y);
    },
    pullTo : function(x,y) {
        var dx =  x - this.x;
        var dy = -y + this.y;
        this.angle = 90 - (180 * Math.atan2(dy,dx) / Math.PI);
        var points = this.getPointCoords(this.angle);
        
        this._line('rband1',points[0][0],points[0][1],x,y);
        this._line('rband2',points[1][0],points[1][1],x,y);
        this._point('point1',points[0][0],points[0][1]);
        this._point('point2',points[1][0],points[1][1]);
    }
    
},
{
    defaults : {
        width : 40,
        pointRadius : 3,
        lineColor : '#fff'
    }
})


/**
 * Clones objects
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 */
Cloner = base2.Base.extend({
    
},{
    cloneObject : function(obj) {
        var clone = {};
        for(var i in obj) {
            if(typeof(obj[i])=="object")
                clone[i] = cloneObject(obj[i]);
            else
                clone[i] = obj[i];
        }
        return clone;
    }
});
/*!
 * Class EndScreen()
 */
EndScreen = Screen.extend({
    constructor : function(paper,game) {
        this.base(paper,game);
        var score = game.score;
        this.items.title = new TextItem({text:"Game.",x:400,y:180,font:"70px Helvetica Neue, Arial, Helvetica",attribs:{"font-weight":"bold"}},paper,this);
        this.items.subtitle = new TextItem({text:"Over ...",x:400,y:270,font:"25px Helvetica Neue, Arial, Helvetica"},paper,this);
        this.items.start = new ButtonItem({text:"RESTART",x:650,y:400,events:{click:"startGame"}},paper,this);
        this.items.help = new TextItem({text:"Score : "+score,x:150,y:400,events:{click:"showHelp"}},paper,this);
    },
    startGame : function() {
        this.remove();
        var l = 0, m;
        if ( m = document.location.href.match(/\?.*loadLevel=(\d+)/) ) {
            l = parseInt(m[1]);
        }
        this.game.loadLevel(l);
    },
    showHelp : function() {
        this.remove();
        this.game.showHelpScreen();
    },
    log : function(s) {
        console.log(s,this.log);
    }
});

/**
 * Parent Game class, which manages the levels
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 */
Game = base2.Base.extend({
    levels : new Array(),
    curLevel : -1,
    score : 0,
    constructor : function(domId) {
        this.paper = this.makePaper(domId, 800, 500);
        this.showWelcomeScreen();
    },
    makePaper : function(domId, width, height) {
        return Raphael(domId, width, height);
    },
    loadLevels : function(url) {
		var that = this;
        new AjaxRequest({
            type : "GET",
            url : url,
            dataType : "json",
            onsuccess : function(response,request) {
                that.addLevels(response.responseData);
            }
        })
    },
    addLevels : function(data) {
        for ( var i=0, imax=data.levels.length; i<imax; i++ ) {
            this.levels.push( data.levels[i] );
        }
    },
    loadLevel : function(n) {
        this.curLevel = n;
        if ( this.levels[n] ) {
            this._applyLevel(this.levels[n]);
        } else {
            var url = Game.baseUrl + 'level-'+n+'.js';
            new AjaxRequest({
                type: "GET",
                url : url,
                dataType : "json",
                onsuccess : function(response,request) {
                    game.levels[n] = response.responseData;
                    game._applyLevel(response.responseData);
                }
            });
        }
    },
    _applyLevel : function(level) {
        if ( this.level ) {
            this.clearLevel();
            delete this.level;
        }
        this.level = new Level(level, this);
    },
    nextLevel : function() {
        if ( this.curLevel < this.levels.length - 1 ) {
            this.loadLevel(this.curLevel+1);
        } else {
            this.clearLevel();
            this.showEndScreen();
        }
    },
    clearLevel : function() {
        this.addScore(this.level.getScore());
        this.level.clear();
    },
    reloadLevel : function() {
        this.loadLevel(this.curLevel);
    },
    showWelcomeScreen : function() {
        this.welcomeScreen = new WelcomeScreen(this.paper,this);
    },
    showEndScreen : function() {
        this.endScreen = new EndScreen(this.paper,this);
    },
    showHelpScreen : function() {
        this.helpScreen = new HelpScreen(this.paper,this);
    },
    setScore : function(n) {
        this.score = parseFloat(n);
    },
    addScore : function(n) {
        this.score += parseFloat(n);
    },
    getScore : function(dontRound) {
        return (dontRound) ?  this.score : Math.round(this.score);
    }
},
{
    baseUrl : './',
    interval : 50,
    scoreFactor : 1,
    isOffScreen : function(x,y) {
        if ( x<0 || y<0 || x>800 || y>500 ) {
            return true;
        } else {
            return false;
        }
    }
});

/**
 * HelpScreen class for help in playing the game.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires Screen
 */
HelpScreen = Screen.extend({
    constructor : function(paper,game) {
        this.base(paper,game);
        this.items.title = new TextItem({text:"Help",x:400,y:50,font:"70px Helvetica Neue, Arial, Helvetica"},paper,this);
        this.items.back = new ButtonItem({text:"BACK",x:650,y:400,events:{click:"closeHelp"}},paper,this);
        this.items.bodyCopy = new TextItem({text:this.getBodyCopy(),x:100,y:200},paper,this);
        this.items.bodyCopy.attr({'text-anchor':'start'});
    },
    getBodyCopy : function() {
        var s = "";
        s += "Your aim is to fire the projectile in the catapult into the wormhole.\n";
        s += "You can use the gravity of planets to bend the motion of the projectile.\n";
        s += "The longer that your path takes, the higher your score! ";
        return s;
    },
    closeHelp : function() {
        this.remove();
        this.game.showWelcomeScreen();
    }
});

/**
 * Level class for each level of the game
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires Game
 */
Level = base2.Base.extend({
    scoreFactor : 1,
    constructor : function(data, game) {
        this.data = data;
        if ( data.scoreFactor !== undefined ) this.scoreFactor = data.scoreFactor;
        this.game = game;
        var planet;
        this.planets = new Array();
        for ( var i=0, imax=data.planets.length; i<imax; i++ ) {
            this.planets.push(new Planet(data.planets[i], this));
        }
        this.target = new Target(data.target, this);
        this.catapult = new Catapult(data.catapult, this);
        this.projectile = new Projectile(data.projectile, this);
        this.score = new Score({x:700,y:20,text:"0"},this.game.paper,this);
        this.title = new LevelTitle(game.paper,game,this.data.title);
        this.reset = new ButtonItem({text:"Reset",x:25,y:20,events:{click:"resetLevel"},font:"10px Arial",'bgfill':'90-#060-#2c2'},game.paper,this);
        //this.reset.attr({"opacity":"0.5"});
    },
    clear : function() {
        for ( var i=0, imax=this.planets.length; i<imax; i++ ) {
            console.log('removing planet ',i);
            this.planets[0].remove();
            this.planets.splice(0,1);
        }
        if ( this.target ) {
            this.target.remove(); delete this.target;
            this.catapult.remove(); delete this.catapult;
            this.projectile.remove(); delete this.projectile;
            this.score.remove(); delete this.score;
            this.reset.remove(); delete this.reset;
        }
    },
    addScore : function(n) {
        if ( this.score ) this.score.addScore(n);
    },
    getScore : function(n) {
        return (this.score) ? this.score.getScore() : 0;
    },
    setScore : function(n) {
        this.score.setScore(n);
    },
    resetLevel : function() {
        this.game.reloadLevel();
    }
});


/**
 * LevelTitle, shown at the start of each Level.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires Screen
 */
LevelTitle = Screen.extend({
    fadeOutTime : 1000,
    fadeOutWait : 1000,
    constructor : function(paper,game,title) {
        this.base(paper,game);
        this.items.bg = paper.rect(0,400,800,100);
        this.items.bg.attr({stroke:'none'});
        //this.items.bg.attr({'fill':'#000'});
        title = "Level " +(game.curLevel+1)+ " : " + title;
        this.items.title = new TextItem({text:title,x:400,y:450,font:"35px Helvetica Neue, Helvetica, Arial",attribs:{fill:'#fff'}},paper,this);
        //this.items.title.item.attr({'fill':'#fff'});
        var that = this;
        setTimeout(function() {
            that.items.title.animate({'fill-opacity':0},that.fadeOutTime);
        },this.fadeOutWait);
        setTimeout(function() {
            that.remove();
        },this.fadeOutWait + this.fadeOutTime + 500);
    },
    remove : function() {
        this.base();
        delete this;
    }
})

/**
 * Planet class.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires StageItem
 */
Planet = StageItem.extend({
    constructor : function (data, level) {
        this.base();
        this.level = level;
        var paper = this.paper = level.game.paper;
        this.grabData(data,Planet);
        this.add(paper.circle(this.x, this.y, this.radius));
        this.attr({
            "fill" : "r(0.3,0.3)"+data.color1+"-"+data.color2,
            "stroke" : data.color3
        });
    }
},
{
    
})


/**
 * Projectile fired by Catapult.
 * @author Pete Otaqui <pete@otaqui.com>
 * @version $Rev$
 * @requires StageItem
 * @requires Catapult
 */
Projectile = StageItem.extend({
    showTrails : true,
    trailPos : {x:0,y:0},
    offset : {left:0,top:0},
    arrow : {},
    constructor : function(data,level) {
        this.base();
        this.arrow = new Arrow(data,level);
        var demo = document.querySelector('#demo');
        this.offset.left = demo.offsetLeft;
        this.offset.top  = demo.offsetTop;
        this.level = level;
        var paper = this.paper = level.game.paper;
        var catapult = this.catapult = level.catapult;
        this.grabData(data,Projectile);
        this.catapult = catapult;
        this.x = catapult.x;
        this.y = catapult.y;
        this.trailPos.x = this.x;
        this.trailPos.y = this.y;
        this.catapult.projectile = this;
        this.add(paper.circle(catapult.x,catapult.y,this.radius));
        this.attr({
            "fill" : "r(0.3,0.3)#fff-#000",
            "stroke" : "none"
        });
        this.trails = [];
        var that = this;
        var node = this.getNode();
        node.style.cursor = "pointer";
        var mdown = function(e) {
            that.pull(e);
            e.preventDefault();
            return false;
        }
        var mup = function(e) {
            node.removeEventListener('mousedown',mdown,false)
        }
        node.addEventListener("mousedown",mdown,false);
        node.addEventListener("mouseup",mup,false);
    },
    trails : [],
    remove : function() {
        this.base();
        for ( var i=0, imax=this.trails.length; i<imax; i++ ) {
            this.trails[0].remove();
            this.trails.splice(0,1);
        }
        if ( this.tempTrail ) this.tempTrail.remove();
        this.arrow.remove();
        clearInterval(this.timer);
    },
    pull : function(e) {
        var that = this;
        var canvas = document.querySelector('#demo');
        canvas.style.cursor = "pointer";
        var drag = function(e) {
            e.preventDefault();
            that.drag(e);
        }
        var drop = function(e) {
            canvas.style.cursor = "";
            canvas.removeEventListener('mousemove',drag,false)
            canvas.removeEventListener('mouseup',drop,false)
            that.release(e);
        }
        canvas.addEventListener('mousemove',drag,false)
        canvas.addEventListener('mouseup',drop,false);
        e.preventDefault();
        return false;
    },
    
    drag : function(e) {
        var mx, my, dx, dy, d, cx, cy, r, offset;
        offset = this.offset;
        mx = e.pageX - offset.left;
        my = e.pageY - offset.top;
        var aAndT = this._getAngleAndTension(mx,my);
        cx = aAndT.dx - this.x + this.catapult.x;
        cy = aAndT.dy - this.y + this.catapult.y;
        this.x += cx;
        this.y += cy;
        this.catapult.pullTo(this.x,this.y);
        this.attr({
            "translation" : cx+" "+cy
        });
    },
    getAngle : function() {
        return this._getAngleAndTension().angle;
    },
    getTension : function() {
        return this._getAngleAndTension().tension;
    },
    _getAngleAndTension : function(x,y) {
        // cache for multiple calls per "move"
        if ( x==undefined && y==undefined && this._angleAndTension !== undefined )
            return this._angleAndTension;
        var dx, dy, d, r, a;
        if ( x == undefined ) x = this.x;
        if ( y == undefined ) y = this.y;
        dx = x - this.catapult.x;
        dy = y - this.catapult.y;
        r = Math.atan2(dy,dx);
        d = Math.sqrt(dx*dx+dy*dy);
        if ( d > this.catapult.maxTension ) {
            d = this.catapult.maxTension;
            dx = d*Math.cos(r);
            dy = d*Math.sin(r);
        }
        r = Math.atan2(dy, dx);
        a = 180*r/Math.PI;
        this._angleAndTension = { angle:a, radians:r, tension:-d, dx:dx, dy:dy };
        return this._angleAndTension;
    },
    _clearAngleAndTension : function() {
        this._angleAndTension = false;
    },
    release : function() {
        var t, r, a;
        var aAndT = this._getAngleAndTension();
        this.fire(aAndT.tension,aAndT.angle);
    },
    getAngle : function() {
        var mx, my, dx, dy, d;
    },
    fire : function(tension,angle) {
        this.velocity = tension;
        this.angle = angle;
        this.count = 0;
        this.start = new Date().getTime();
        var that = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            that._fire();
        },Game.interval);
    },
    _fire : function() {
        // check for end
        if ( new Date().getTime() > 300000+this.start ) {
            alert('Timed out!  Try again.');
            clearInterval(this.timer);
            this.level.game.reloadLevel();
            return;
        }
        var r = Math.PI*this.angle/180;
        var vx = this.velocity*Math.cos(r);
        var vy = this.velocity*Math.sin(r);
        var planet, gx, gy, gd, gg, dx, dy, gr;
        for ( var i=0, imax=this.level.planets.length; i<imax; i++ ) {
            planet = this.level.planets[i];
            if ( this.isTouching(planet) ) {
                //console.log('COLLISION');
                this.level.setScore(0);
                this.level.game.reloadLevel();
                return;
            }
            dx = planet.x - this.x;
            dy = planet.y - this.y;
            gd = Math.sqrt(dy*dy+dx*dx);
            gg = planet.gravity / (gd*gd);
            gx = gg * dx;
            gy = gg * dy;
            vx += gx;
            vy += gy;
        }
        this.x += vx;
        this.y += vy;
        this.angle = Math.atan2(vy,vx)*180/Math.PI;
        this.velocity = Math.sqrt(vx*vx+vy*vy);
        this.attr({
            "translation" : vx+" "+vy
        });
        this.arrow.place(this.x,this.y);
        
        // add trail
        if ( this.showTrails && ++this.count % Trail.interval == 0 ) {
            var ox = this.trailPos.x;
            var oy = this.trailPos.y;
            if ( !Game.isOffScreen(this.x,this.y) || !Game.isOffScreen(ox,oy) ) {
                if ( this.tempTrail ) this.tempTrail.remove();
                this.trails.push(new Trail({x:this.x,y:this.y,ox:ox,oy:oy},this.level));
            }
            this.trailPos.x = this.x;
            this.trailPos.y = this.y;
        } else if ( this.showTrails ) {
            if ( this.tempTrail ) this.tempTrail.remove();
            var tp = this.trailPos;
            this.tempTrail = this.paper.path(this.pathString(tp.x,tp.y,this.x,this.y));
            this.tempTrail.attr({"stroke":Trail.strokeColor,"stroke-width":Trail.strokeWidth});
        }
        
        this.level.addScore(this.level.scoreFactor);
        //console.log(this.level.getScore());
        
        if ( this.isTouching(this.level.target) ) {
            //console.log("WIN!");
            this.level.game.nextLevel();
            return;
        }
        
        var that = this;
        this.timer = setTimeout(function() {
            that._fire();
        },Game.interval);
    },
    
    
    
},
{
    defaults : {
        radius : 5
    }
});


/*!
 * Class Score()
 */
Score = TextItem.extend({
    score : 0,
    constructor : function(data, paper ,level) {
        if ( data.score == undefined ) data.score = parseInt(data.text);
        this.base(data,paper,level);
    },
    writeText : function() {
        this.base('Score : '+Math.round(this.score));
    },
    setScore : function(n) {
        this.score = n;
        this.writeText();
    },
    addScore : function(n) {
        this.score += n;
        this.writeText();
    },
    getScore : function(n) {
        return this.score;
    }
})


/*!
 * Class Target()
 */
Target = StageItem.extend({
    constructor : function (data, level) {
        this.base();
        //console.log('Target',data,level)
        this.level = level;
        var paper = this.paper = level.game.paper;
        this.grabData(data,Target);
        this.add(paper.circle(this.x,this.y,this.radius));
        this.attr({
            "fill" : "r(0.5,0.5)#58f-#000-#58f-#000-#58f",
            "stroke" : "#9cf"
        })
    }
},
{
    defaults : {
        radius : 20
    }
})



/*!
 * Class Trail()
 */
Trail = StageItem.extend({
    constructor : function(data,level) {
        this.base();
        this.grabData(data,Trail);
        var paper = this.paper = level.game.paper;
        var p = this.projectile = level.projectile;
        this.removed = false;
        //this.item = paper.circle(p.x,p.y,p.radius/1.5);
        this.add(paper.path(this.pathString(this.ox,this.oy,this.x,this.y)));
        this.attr({stroke:Trail.strokeColor,"stroke-width":Trail.strokeWidth});
        var a = this.animate({stroke:'#030'},Trail.fadeTime-1000,">");
        var that = this;
    },
    remove : function() {
        this.stop();
        this.base();
    }
},
{
    defaults : {
        opacity : 1
    },
    fadeTime : 10000,
    strokeWidth : 1,
    strokeColor : '#cfc',
    interval : 1
});



/*!
 * Class WelcomeScreen()
 */
WelcomeScreen = Screen.extend({
    constructor : function(paper,game) {
        this.base(paper,game);
        this.items.title = new TextItem({text:"Gravity.",x:400,y:180,font:"70px Helvetica Neue, Arial, Helvetica",attribs:{"font-weight":"bold"}},paper,this);
        this.items.subtitle = new TextItem({text:"Well ...",x:400,y:270,font:"25px Helvetica Neue, Arial, Helvetica"},paper,this);
        this.items.start = new ButtonItem({text:"START",x:650,y:400,events:{click:"startGame"}},paper,this);
        this.items.help = new ButtonItem({text:"Help",x:150,y:400,events:{click:"showHelp"}},paper,this);
    },
    startGame : function() {
        this.remove();
        var l = 0, m;
        if ( m = document.location.href.match(/\?.*loadLevel=(\d+)/) ) {
            l = parseInt(m[1]);
        }
        this.game.loadLevel(l);
    },
    showHelp : function() {
        this.remove();
        this.game.showHelpScreen();
    },
    log : function(s) {
        console.log(s,this.log);
    }
});
