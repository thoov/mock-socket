(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":9}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * IPv6 Support
 *
 * Version: 1.17.0
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.IPv6 = factory(root);
  }
}(this, function (root) {
  'use strict';

  /*
  var _in = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";
  var _out = IPv6.best(_in);
  var _expected = "fe80::204:61ff:fe9d:f156";

  console.log(_in, _out, _expected, _out === _expected);
  */

  // save current IPv6 variable, if any
  var _IPv6 = root && root.IPv6;

  function bestPresentation(address) {
    // based on:
    // Javascript to test an IPv6 address for proper format, and to
    // present the "best text representation" according to IETF Draft RFC at
    // http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04
    // 8 Feb 2010 Rich Brown, Dartware, LLC
    // Please feel free to use this code as long as you provide a link to
    // http://www.intermapper.com
    // http://intermapper.com/support/tools/IPV6-Validator.aspx
    // http://download.dartware.com/thirdparty/ipv6validator.js

    var _address = address.toLowerCase();
    var segments = _address.split(':');
    var length = segments.length;
    var total = 8;

    // trim colons (:: or ::a:b:c… or …a:b:c::)
    if (segments[0] === '' && segments[1] === '' && segments[2] === '') {
      // must have been ::
      // remove first two items
      segments.shift();
      segments.shift();
    } else if (segments[0] === '' && segments[1] === '') {
      // must have been ::xxxx
      // remove the first item
      segments.shift();
    } else if (segments[length - 1] === '' && segments[length - 2] === '') {
      // must have been xxxx::
      segments.pop();
    }

    length = segments.length;

    // adjust total segments for IPv4 trailer
    if (segments[length - 1].indexOf('.') !== -1) {
      // found a "." which means IPv4
      total = 7;
    }

    // fill empty segments them with "0000"
    var pos;
    for (pos = 0; pos < length; pos++) {
      if (segments[pos] === '') {
        break;
      }
    }

    if (pos < total) {
      segments.splice(pos, 1, '0000');
      while (segments.length < total) {
        segments.splice(pos, 0, '0000');
      }

      length = segments.length;
    }

    // strip leading zeros
    var _segments;
    for (var i = 0; i < total; i++) {
      _segments = segments[i].split('');
      for (var j = 0; j < 3 ; j++) {
        if (_segments[0] === '0' && _segments.length > 1) {
          _segments.splice(0,1);
        } else {
          break;
        }
      }

      segments[i] = _segments.join('');
    }

    // find longest sequence of zeroes and coalesce them into one segment
    var best = -1;
    var _best = 0;
    var _current = 0;
    var current = -1;
    var inzeroes = false;
    // i; already declared

    for (i = 0; i < total; i++) {
      if (inzeroes) {
        if (segments[i] === '0') {
          _current += 1;
        } else {
          inzeroes = false;
          if (_current > _best) {
            best = current;
            _best = _current;
          }
        }
      } else {
        if (segments[i] === '0') {
          inzeroes = true;
          current = i;
          _current = 1;
        }
      }
    }

    if (_current > _best) {
      best = current;
      _best = _current;
    }

    if (_best > 1) {
      segments.splice(best, _best, '');
    }

    length = segments.length;

    // assemble remaining segments
    var result = '';
    if (segments[0] === '')  {
      result = ':';
    }

    for (i = 0; i < length; i++) {
      result += segments[i];
      if (i === length - 1) {
        break;
      }

      result += ':';
    }

    if (segments[length - 1] === '') {
      result += ':';
    }

    return result;
  }

  function noConflict() {
    /*jshint validthis: true */
    if (root.IPv6 === this) {
      root.IPv6 = _IPv6;
    }
  
    return this;
  }

  return {
    best: bestPresentation,
    noConflict: noConflict
  };
}));

},{}],5:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
 *
 * Version: 1.17.0
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.SecondLevelDomains = factory(root);
  }
}(this, function (root) {
  'use strict';

  // save current SecondLevelDomains variable, if any
  var _SecondLevelDomains = root && root.SecondLevelDomains;

  var SLD = {
    // list of known Second Level Domains
    // converted list of SLDs from https://github.com/gavingmiller/second-level-domains
    // ----
    // publicsuffix.org is more current and actually used by a couple of browsers internally.
    // downside is it also contains domains like "dyndns.org" - which is fine for the security
    // issues browser have to deal with (SOP for cookies, etc) - but is way overboard for URI.js
    // ----
    list: {
      'ac':' com gov mil net org ',
      'ae':' ac co gov mil name net org pro sch ',
      'af':' com edu gov net org ',
      'al':' com edu gov mil net org ',
      'ao':' co ed gv it og pb ',
      'ar':' com edu gob gov int mil net org tur ',
      'at':' ac co gv or ',
      'au':' asn com csiro edu gov id net org ',
      'ba':' co com edu gov mil net org rs unbi unmo unsa untz unze ',
      'bb':' biz co com edu gov info net org store tv ',
      'bh':' biz cc com edu gov info net org ',
      'bn':' com edu gov net org ',
      'bo':' com edu gob gov int mil net org tv ',
      'br':' adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
      'bs':' com edu gov net org ',
      'bz':' du et om ov rg ',
      'ca':' ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
      'ck':' biz co edu gen gov info net org ',
      'cn':' ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
      'co':' com edu gov mil net nom org ',
      'cr':' ac c co ed fi go or sa ',
      'cy':' ac biz com ekloges gov ltd name net org parliament press pro tm ',
      'do':' art com edu gob gov mil net org sld web ',
      'dz':' art asso com edu gov net org pol ',
      'ec':' com edu fin gov info med mil net org pro ',
      'eg':' com edu eun gov mil name net org sci ',
      'er':' com edu gov ind mil net org rochest w ',
      'es':' com edu gob nom org ',
      'et':' biz com edu gov info name net org ',
      'fj':' ac biz com info mil name net org pro ',
      'fk':' ac co gov net nom org ',
      'fr':' asso com f gouv nom prd presse tm ',
      'gg':' co net org ',
      'gh':' com edu gov mil org ',
      'gn':' ac com gov net org ',
      'gr':' com edu gov mil net org ',
      'gt':' com edu gob ind mil net org ',
      'gu':' com edu gov net org ',
      'hk':' com edu gov idv net org ',
      'hu':' 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
      'id':' ac co go mil net or sch web ',
      'il':' ac co gov idf k12 muni net org ',
      'in':' ac co edu ernet firm gen gov i ind mil net nic org res ',
      'iq':' com edu gov i mil net org ',
      'ir':' ac co dnssec gov i id net org sch ',
      'it':' edu gov ',
      'je':' co net org ',
      'jo':' com edu gov mil name net org sch ',
      'jp':' ac ad co ed go gr lg ne or ',
      'ke':' ac co go info me mobi ne or sc ',
      'kh':' com edu gov mil net org per ',
      'ki':' biz com de edu gov info mob net org tel ',
      'km':' asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
      'kn':' edu gov net org ',
      'kr':' ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
      'kw':' com edu gov net org ',
      'ky':' com edu gov net org ',
      'kz':' com edu gov mil net org ',
      'lb':' com edu gov net org ',
      'lk':' assn com edu gov grp hotel int ltd net ngo org sch soc web ',
      'lr':' com edu gov net org ',
      'lv':' asn com conf edu gov id mil net org ',
      'ly':' com edu gov id med net org plc sch ',
      'ma':' ac co gov m net org press ',
      'mc':' asso tm ',
      'me':' ac co edu gov its net org priv ',
      'mg':' com edu gov mil nom org prd tm ',
      'mk':' com edu gov inf name net org pro ',
      'ml':' com edu gov net org presse ',
      'mn':' edu gov org ',
      'mo':' com edu gov net org ',
      'mt':' com edu gov net org ',
      'mv':' aero biz com coop edu gov info int mil museum name net org pro ',
      'mw':' ac co com coop edu gov int museum net org ',
      'mx':' com edu gob net org ',
      'my':' com edu gov mil name net org sch ',
      'nf':' arts com firm info net other per rec store web ',
      'ng':' biz com edu gov mil mobi name net org sch ',
      'ni':' ac co com edu gob mil net nom org ',
      'np':' com edu gov mil net org ',
      'nr':' biz com edu gov info net org ',
      'om':' ac biz co com edu gov med mil museum net org pro sch ',
      'pe':' com edu gob mil net nom org sld ',
      'ph':' com edu gov i mil net ngo org ',
      'pk':' biz com edu fam gob gok gon gop gos gov net org web ',
      'pl':' art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
      'pr':' ac biz com edu est gov info isla name net org pro prof ',
      'ps':' com edu gov net org plo sec ',
      'pw':' belau co ed go ne or ',
      'ro':' arts com firm info nom nt org rec store tm www ',
      'rs':' ac co edu gov in org ',
      'sb':' com edu gov net org ',
      'sc':' com edu gov net org ',
      'sh':' co com edu gov net nom org ',
      'sl':' com edu gov net org ',
      'st':' co com consulado edu embaixada gov mil net org principe saotome store ',
      'sv':' com edu gob org red ',
      'sz':' ac co org ',
      'tr':' av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
      'tt':' aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
      'tw':' club com ebiz edu game gov idv mil net org ',
      'mu':' ac co com gov net or org ',
      'mz':' ac co edu gov org ',
      'na':' co com ',
      'nz':' ac co cri geek gen govt health iwi maori mil net org parliament school ',
      'pa':' abo ac com edu gob ing med net nom org sld ',
      'pt':' com edu gov int net nome org publ ',
      'py':' com edu gov mil net org ',
      'qa':' com edu gov mil net org ',
      're':' asso com nom ',
      'ru':' ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
      'rw':' ac co com edu gouv gov int mil net ',
      'sa':' com edu gov med net org pub sch ',
      'sd':' com edu gov info med net org tv ',
      'se':' a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
      'sg':' com edu gov idn net org per ',
      'sn':' art com edu gouv org perso univ ',
      'sy':' com edu gov mil net news org ',
      'th':' ac co go in mi net or ',
      'tj':' ac biz co com edu go gov info int mil name net nic org test web ',
      'tn':' agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
      'tz':' ac co go ne or ',
      'ua':' biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
      'ug':' ac co go ne or org sc ',
      'uk':' ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
      'us':' dni fed isa kids nsn ',
      'uy':' com edu gub mil net org ',
      've':' co com edu gob info mil net org web ',
      'vi':' co com k12 net org ',
      'vn':' ac biz com edu gov health info int name net org pro ',
      'ye':' co com gov ltd me net org plc ',
      'yu':' ac co edu gov org ',
      'za':' ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
      'zm':' ac co com edu gov net org sch '
    },
    // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
    // in both performance and memory footprint. No initialization required.
    // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
    // Following methods use lastIndexOf() rather than array.split() in order
    // to avoid any memory allocations.
    has: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') >= 0;
    },
    is: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset >= 0) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
    },
    get: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return null;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return null;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return null;
      }
      if (sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') < 0) {
        return null;
      }
      return domain.slice(sldOffset+1);
    },
    noConflict: function(){
      if (root.SecondLevelDomains === this) {
        root.SecondLevelDomains = _SecondLevelDomains;
      }
      return this;
    }
  };

  return SLD;
}));

},{}],6:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.17.0
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */
(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory(require('./punycode'), require('./IPv6'), require('./SecondLevelDomains'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    var _urlSupplied = arguments.length >= 1;
    var _baseSupplied = arguments.length >= 2;

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      if (_urlSupplied) {
        if (_baseSupplied) {
          return new URI(url, base);
        }

        return new URI(url);
      }

      return new URI();
    }

    if (url === undefined) {
      if (_urlSupplied) {
        throw new TypeError('undefined is not a valid argument for URI');
      }

      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  URI.version = '1.17.0';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (getType(value) === 'RegExp') {
      lookup = null;
    } else if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      /*jshint laxbreak: true */
      var _match = lookup && lookup[data[i]] !== undefined
        || !lookup && value.test(data[i]);
      /*jshint laxbreak: false */
      if (_match) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  function trimSlashes(text) {
    var trim_expression = /^\/+|\/+$/g;
    return text.replace(trim_expression, '');
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\.-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/
  };
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . -
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    },
    urnpath: {
      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
      // note that the colon character is not featured in the encoding map; this is because URI.js
      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
      // should not appear unencoded in a segment itself.
      // See also the note above about RFC3986 and capitalalized hex digits.
      encode: {
        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
        map: {
          '%21': '!',
          '%24': '$',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%40': '@'
        }
      },
      // These characters are the characters called out by RFC2141 as "reserved" characters that
      // should never appear in a URN, plus the colon character (see note above).
      decode: {
        expression: /[\/\?#:]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23',
          ':': '%3A'
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
  }

  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
    return function(string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function(string) {
          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
        };
      }

      var segments = (string + '').split(_sep);

      for (var i = 0, length = segments.length; i < length; i++) {
        segments[i] = actualCodingFunc(segments[i]);
      }

      return segments.join(_sep);
    };
  };

  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {};
    }
    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3) === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
    // See: https://code.google.com/p/chromium/issues/detail?id=25916
    // https://github.com/medialize/URI.js/pull/233
    string = string.replace(/\\/g, '/');

    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else {
      var firstColon = string.indexOf(':');
      var firstSlash = string.indexOf('/');
      var nextColon = string.indexOf(':', firstColon + 1);
      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
        // IPv6 host contains multiple colons - but no port
        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
        parts.hostname = string.substring(0, pos) || null;
        parts.port = null;
      } else {
        t = string.substring(0, pos).split(':');
        parts.hostname = t[0] || null;
        parts.port = t[1] || null;
      }
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string' || items[name] === null) {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);

      if (parts.password) {
        t += ':' + URI.encode(parts.password);
      }

      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (hasOwn.call(data, key) && key) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };
  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (getType(name) === 'RegExp') {
      for (key in data) {
        if (name.test(key)) {
          data[key] = undefined;
        }
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (getType(value) === 'RegExp') {
          if (!isArray(data[name]) && value.test(data[name])) {
            data[name] = undefined;
          } else {
            data[name] = filterArrayValues(data[name], value);
          }
        } else if (data[name] === String(value) && (!isArray(value) || value.length === 1)) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          if (!URI.hasQuery(data, key, name[key])) {
            return false;
          }
        }
      }

      return true;
    } else if (typeof name !== 'string') {
      throw new TypeError('URI.hasQuery() accepts an object, string as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end).replace(_trim, '');
      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    if (v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-] and Punycode.js is not available');
      }

      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }
    }
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
    } else {
      if (this._parts.urn) {
        this._parts.path = v ? URI.recodeUrnPath(v) : '';
      } else {
        this._parts.path = v ? URI.recodePath(v) : '/';
      }
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v !== undefined) {
      if (v) {
        // accept trailing ://
        v = v.replace(/:(\/\/)?$/, '');

        if (!v.match(URI.protocol_expression)) {
          throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
        }
      }
    }
    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        if (v.match(/[^0-9]/)) {
          throw new TypeError('Port "' + v + '" contains characters other than [0-9]');
        }
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = {};
      var res = URI.parseHost(v, x);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      v = x.hostname;
    }
    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.origin = function(v, build) {
    var parts;

    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var protocol = this.protocol();
      var authority = this.authority();
      if (!authority) return '';
      return (protocol ? protocol + '://' : '') + this.authority();
    } else {
      var origin = URI(v);
      this
        .protocol(origin.protocol())
        .authority(origin.authority())
        .build(!build);
      return this;
    }
  };
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      var res = URI.parseHost(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      var res = URI.parseAuthority(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      if (!this._parts.username) {
        return '';
      }

      var t = URI.buildUserinfo(this._parts);
      return t.substring(0, t.length -1);
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v) {
        URI.ensureValidHostname(v);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      URI.ensureValidHostname(v);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(trimSlashes(v[i]));
        }
      } else if (v || typeof v === 'string') {
        v = trimSlashes(v);
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = trimSlashes(v);
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    var _path = this._parts.path;
    if (!_path) {
      return this;
    }

    if (this._parts.urn) {
      this._parts.path = URI.recodeUrnPath(this._parts.path);
      this.build(!build);
      return this;
    }

    if (this._parts.path === '/') {
      return this;
    }

    var _was_relative;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // handle relative files (as opposed to directories)
    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
      _path += '/';
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.indexOf('/..');
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    _path = URI.recodePath(_path);
    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (!resolved._parts.protocol) {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else if (resolved._parts.path.substring(-2) === '..') {
      resolved._parts.path += '/';
    }

    if (resolved.path().charAt(0) !== '/') {
      basedir = base.directory();
      basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
      resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
      resolved.normalizePath();
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relativePath, basePath);

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));

},{"./IPv6":4,"./SecondLevelDomains":5,"./punycode":7}],7:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.3 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    length,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.3',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return punycode;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],9:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":8,"_process":3,"inherits":2}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersEventObject = require('./helpers/event-object');

var _helpersEventObject2 = _interopRequireDefault(_helpersEventObject);

var _helpersEnvironmentCheck = require('./helpers/environment-check');

var _helpersEnvironmentCheck2 = _interopRequireDefault(_helpersEnvironmentCheck);

/*
* Natively you cannot set or modify the properties: target, srcElement, and currentTarget on Event or
* MessageEvent objects. So in order to set them to the correct values we "overwrite" them to the same
* property but without the restriction of not writable.
*
* @param {object} event - an event object to extend
* @param {object} target - the value that should be set for target, srcElement, and currentTarget
*/
function extendEvent(event, target) {
  Object.defineProperties(event, {
    target: {
      configurable: true,
      writable: true
    },
    srcElement: {
      configurable: true,
      writable: true
    },
    currentTarget: {
      configurable: true,
      writable: true
    }
  });

  if (target) {
    event.target = target;
    event.srcElement = target;
    event.currentTarget = target;
  }

  return event;
}

/*
 * This will return either the native Event/MessageEvent/CloseEvent
 * if we are in the browser or it will return the mocked event.
 */
function eventFactory(eventClassName, type, config) {
  if (!_helpersEnvironmentCheck2['default'].globalContext[eventClassName]) {
    return new _helpersEventObject2['default']({ type: type });
  }

  if (!config) {
    return new _helpersEnvironmentCheck2['default'].globalContext[eventClassName](type);
  }

  return new _helpersEnvironmentCheck2['default'].globalContext[eventClassName](type, config);
}

/*
* Creates an Event object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target
*/
function createEvent(config) {
  var type = config.type;
  var target = config.target;

  var event = eventFactory('Event', type);

  if (!event.path) {
    event = JSON.parse(JSON.stringify(event));
  }

  return extendEvent(event, target);
}

/*
* Creates a MessageEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type, origin, data and optionally target
*/
function createMessageEvent(config) {
  var type = config.type;
  var origin = config.origin;
  var data = config.data;
  var target = config.target;

  var messageEvent = eventFactory('MessageEvent', type);

  if (!messageEvent.path) {
    messageEvent = JSON.parse(JSON.stringify(messageEvent));
  }

  extendEvent(messageEvent, target);

  if (messageEvent.initMessageEvent) {
    messageEvent.initMessageEvent(type, false, false, data, origin, '');
  } else {
    messageEvent.data = data;
    messageEvent.origin = origin;
  }

  return messageEvent;
}

/*
* Creates a CloseEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target, code, and reason
*/
function createCloseEvent(config) {
  var code = config.code;
  var reason = config.reason;
  var type = config.type;
  var target = config.target;
  var wasClean = config.wasClean;

  if (!wasClean) {
    wasClean = code === 1000;
  }

  var closeEvent = eventFactory('CloseEvent', type, {
    code: code,
    reason: reason,
    wasClean: wasClean
  });

  if (!closeEvent.path || !closeEvent.code) {
    closeEvent = JSON.parse(JSON.stringify(closeEvent));
    closeEvent.code = code || 0;
    closeEvent.reason = reason || '';
    closeEvent.wasClean = wasClean;
  }

  return extendEvent(closeEvent, target);
}

exports.createEvent = createEvent;
exports.createMessageEvent = createMessageEvent;
exports.createCloseEvent = createCloseEvent;
},{"./helpers/environment-check":15,"./helpers/event-object":16}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersArrayHelpers = require('./helpers/array-helpers');

/*
* EventTarget is an interface implemented by objects that can
* receive events and may have listeners for them.
*
* https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
*/

var EventTarget = (function () {
  function EventTarget() {
    _classCallCheck(this, EventTarget);

    this.listeners = {};
  }

  /*
  * Ties a listener function to a event type which can later be invoked via the
  * dispatchEvent method.
  *
  * @param {string} type - the type of event (ie: 'open', 'message', etc.)
  * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
  * @param {boolean} useCapture - N/A TODO: implement useCapture functionality
  */

  _createClass(EventTarget, [{
    key: 'addEventListener',
    value: function addEventListener(type, listener /* , useCapture */) {
      if (typeof listener === 'function') {
        if (!Array.isArray(this.listeners[type])) {
          this.listeners[type] = [];
        }

        // Only add the same function once
        if ((0, _helpersArrayHelpers.filter)(this.listeners[type], function (item) {
          return item === listener;
        }).length === 0) {
          this.listeners[type].push(listener);
        }
      }
    }

    /*
    * Removes the listener so it will no longer be invoked via the dispatchEvent method.
    *
    * @param {string} type - the type of event (ie: 'open', 'message', etc.)
    * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
    * @param {boolean} useCapture - N/A TODO: implement useCapture functionality
    */
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, removingListener /* , useCapture */) {
      var arrayOfListeners = this.listeners[type];
      this.listeners[type] = (0, _helpersArrayHelpers.reject)(arrayOfListeners, function (listener) {
        return listener === removingListener;
      });
    }

    /*
    * Invokes all listener functions that are listening to the given event.type property. Each
    * listener will be passed the event as the first argument.
    *
    * @param {object} event - event object which will be passed to all listeners of the event.type property
    */
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(event) {
      var _this = this;

      for (var _len = arguments.length, customArguments = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        customArguments[_key - 1] = arguments[_key];
      }

      var eventName = event.type;
      var listeners = this.listeners[eventName];

      if (!Array.isArray(listeners)) {
        return false;
      }

      listeners.forEach(function (listener) {
        if (customArguments.length > 0) {
          listener.apply(_this, customArguments);
        } else {
          listener.call(_this, event);
        }
      });
    }
  }]);

  return EventTarget;
})();

exports['default'] = EventTarget;
module.exports = exports['default'];
},{"./helpers/array-helpers":12}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reject = reject;
exports.filter = filter;

function reject(array, callback) {
  var results = [];
  array.forEach(function (itemInArray) {
    if (!callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}

function filter(array, callback) {
  var results = [];
  array.forEach(function (itemInArray) {
    if (callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}
},{}],13:[function(require,module,exports){
/*
* https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var codes = {
  CLOSE_NORMAL: 1000,
  CLOSE_GOING_AWAY: 1001,
  CLOSE_PROTOCOL_ERROR: 1002,
  CLOSE_UNSUPPORTED: 1003,
  CLOSE_NO_STATUS: 1005,
  CLOSE_ABNORMAL: 1006,
  CLOSE_TOO_LARGE: 1009
};

exports["default"] = codes;
module.exports = exports["default"];
},{}],14:[function(require,module,exports){
/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function delay(callback, context) {
  setTimeout(function timeout(timeoutContext) {
    callback.call(timeoutContext);
  }, 4, context);
}

exports["default"] = delay;
module.exports = exports["default"];
},{}],15:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function isNode() {
  if (typeof window === 'undefined') {
    return true;
  }

  return false;
}

exports['default'] = {
  globalContext: isNode() ? global : window,
  isNode: isNode
};
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function NodeEvent(config) {
  var _this = this;

  var event = {
    bubbles: false,
    cancelBublle: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    path: [],
    returnValue: true,
    timeStamp: Date.now(),
    type: config.type,
    lastEventId: ''
  };

  Object.keys(event).forEach(function (keyName) {
    _this[keyName] = event[keyName];
  });
}

exports['default'] = NodeEvent;
module.exports = exports['default'];
},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersArrayHelpers = require('./helpers/array-helpers');

/*
* The network bridge is a way for the mock websocket object to 'communicate' with
* all avalible servers. This is a singleton object so it is important that you
* clean up urlMap whenever you are finished.
*/

var NetworkBridge = (function () {
  function NetworkBridge() {
    _classCallCheck(this, NetworkBridge);

    this.urlMap = {};
  }

  /*
  * Attaches a websocket object to the urlMap hash so that it can find the server
  * it is connected to and the server in turn can find it.
  *
  * @param {object} websocket - websocket object to add to the urlMap hash
  * @param {string} url
  */

  _createClass(NetworkBridge, [{
    key: 'attachWebSocket',
    value: function attachWebSocket(websocket, url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) === -1) {
        connectionLookup.websockets.push(websocket);
        return connectionLookup.server;
      }
    }

    /*
    * Attaches a websocket to a room
    */
  }, {
    key: 'addMembershipToRoom',
    value: function addMembershipToRoom(websocket, room) {
      var connectionLookup = this.urlMap[websocket.url];

      if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) !== -1) {
        if (!connectionLookup.roomMemberships[room]) {
          connectionLookup.roomMemberships[room] = [];
        }

        connectionLookup.roomMemberships[room].push(websocket);
      }
    }

    /*
    * Attaches a server object to the urlMap hash so that it can find a websockets
    * which are connected to it and so that websockets can in turn can find it.
    *
    * @param {object} server - server object to add to the urlMap hash
    * @param {string} url
    */
  }, {
    key: 'attachServer',
    value: function attachServer(server, url) {
      var connectionLookup = this.urlMap[url];

      if (!connectionLookup) {
        this.urlMap[url] = {
          server: server,
          websockets: [],
          roomMemberships: {}
        };

        return server;
      }
    }

    /*
    * Finds the server which is 'running' on the given url.
    *
    * @param {string} url - the url to use to find which server is running on it
    */
  }, {
    key: 'serverLookup',
    value: function serverLookup(url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        return connectionLookup.server;
      }
    }

    /*
    * Finds all websockets which is 'listening' on the given url.
    *
    * @param {string} url - the url to use to find all websockets which are associated with it
    * @param {string} room - if a room is provided, will only return sockets in this room
    */
  }, {
    key: 'websocketsLookup',
    value: function websocketsLookup(url, room) {
      var connectionLookup = this.urlMap[url];

      if (!connectionLookup) {
        return [];
      }

      if (room) {
        var members = connectionLookup.roomMemberships[room];
        return members ? members : [];
      }

      return connectionLookup.websockets;
    }

    /*
    * Removes the entry associated with the url.
    *
    * @param {string} url
    */
  }, {
    key: 'removeServer',
    value: function removeServer(url) {
      delete this.urlMap[url];
    }

    /*
    * Removes the individual websocket from the map of associated websockets.
    *
    * @param {object} websocket - websocket object to remove from the url map
    * @param {string} url
    */
  }, {
    key: 'removeWebSocket',
    value: function removeWebSocket(websocket, url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        connectionLookup.websockets = (0, _helpersArrayHelpers.reject)(connectionLookup.websockets, function (socket) {
          return socket === websocket;
        });
      }
    }

    /*
    * Removes a websocket from a room
    */
  }, {
    key: 'removeMembershipFromRoom',
    value: function removeMembershipFromRoom(websocket, room) {
      var connectionLookup = this.urlMap[websocket.url];
      var memberships = connectionLookup.roomMemberships[room];

      if (connectionLookup && memberships !== null) {
        connectionLookup.roomMemberships[room] = (0, _helpersArrayHelpers.reject)(memberships, function (socket) {
          return socket === websocket;
        });
      }
    }
  }]);

  return NetworkBridge;
})();

exports['default'] = new NetworkBridge();
// Note: this is a singleton
module.exports = exports['default'];
},{"./helpers/array-helpers":12}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _eventFactory = require('./event-factory');

/*
* https://github.com/websockets/ws#server-example
*/

var Server = (function (_EventTarget) {
  _inherits(Server, _EventTarget);

  /*
  * @param {string} url
  */

  function Server(url) {
    _classCallCheck(this, Server);

    _get(Object.getPrototypeOf(Server.prototype), 'constructor', this).call(this);
    this.url = (0, _urijs2['default'])(url).toString();
    var server = _networkBridge2['default'].attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }
  }

  /*
   * Alternative constructor to support namespaces in socket.io
   *
   * http://socket.io/docs/rooms-and-namespaces/#custom-namespaces
   */

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {function} callback - The callback which should be called when a certain event is fired.
  */

  _createClass(Server, [{
    key: 'on',
    value: function on(type, callback) {
      this.addEventListener(type, callback);
    }

    /*
    * This send function will notify all mock clients via their onmessage callbacks that the server
    * has a message for them.
    *
    * @param {*} data - Any javascript object which will be crafted into a MessageObject.
    */
  }, {
    key: 'send',
    value: function send(data) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.emit('message', data, options);
    }

    /*
    * Sends a generic message event to all mock clients.
    */
  }, {
    key: 'emit',
    value: function emit(event, data) {
      var _this2 = this;

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var websockets = options.websockets;

      if (!websockets) {
        websockets = _networkBridge2['default'].websocketsLookup(this.url);
      }

      websockets.forEach(function (socket) {
        socket.dispatchEvent((0, _eventFactory.createMessageEvent)({
          type: event,
          data: data,
          origin: _this2.url,
          target: socket
        }));
      });
    }

    /*
    * Closes the connection and triggers the onclose method of all listening
    * websockets. After that it removes itself from the urlMap so another server
    * could add itself to the url.
    *
    * @param {object} options
    */
  }, {
    key: 'close',
    value: function close() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var code = options.code;
      var reason = options.reason;
      var wasClean = options.wasClean;

      var listeners = _networkBridge2['default'].websocketsLookup(this.url);

      listeners.forEach(function (socket) {
        socket.readyState = _websocket2['default'].CLOSE;
        socket.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'close',
          target: socket,
          code: code || _helpersCloseCodes2['default'].CLOSE_NORMAL,
          reason: reason || '',
          wasClean: wasClean
        }));
      });

      this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close' }), this);
      _networkBridge2['default'].removeServer(this.url);
    }

    /*
    * Returns an array of websockets which are listening to this server
    */
  }, {
    key: 'clients',
    value: function clients() {
      return _networkBridge2['default'].websocketsLookup(this.url);
    }

    /*
    * Prepares a method to submit an event to members of the room
    *
    * e.g. server.to('my-room').emit('hi!');
    */
  }, {
    key: 'to',
    value: function to(room) {
      var _this = this;
      var websockets = _networkBridge2['default'].websocketsLookup(this.url, room);
      return {
        emit: function emit(event, data) {
          _this.emit(event, data, { websockets: websockets });
        }
      };
    }
  }]);

  return Server;
})(_eventTarget2['default']);

Server.of = function of(url) {
  return new Server(url);
};

exports['default'] = Server;
module.exports = exports['default'];
},{"./event-factory":10,"./event-target":11,"./helpers/close-codes":13,"./network-bridge":17,"./websocket":20,"urijs":6}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _eventFactory = require('./event-factory');

/*
* The socket-io class is designed to mimick the real API as closely as possible.
*
* http://socket.io/docs/
*/

var SocketIO = (function (_EventTarget) {
  _inherits(SocketIO, _EventTarget);

  /*
  * @param {string} url
  */

  function SocketIO() {
    var _this = this;

    var url = arguments.length <= 0 || arguments[0] === undefined ? 'socket.io' : arguments[0];
    var protocol = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    _classCallCheck(this, SocketIO);

    _get(Object.getPrototypeOf(SocketIO.prototype), 'constructor', this).call(this);

    this.binaryType = 'blob';
    this.url = (0, _urijs2['default'])(url).toString();
    this.readyState = SocketIO.CONNECTING;
    this.protocol = '';

    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this.protocol = protocol[0];
    }

    var server = _networkBridge2['default'].attachWebSocket(this, this.url);

    /*
    * Delay triggering the connection events so they can be defined in time.
    */
    (0, _helpersDelay2['default'])(function delayCallback() {
      if (server) {
        this.readyState = SocketIO.OPEN;
        server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connection' }), server, this);
        server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connect' }), server, this); // alias
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connect', target: this }));
      } else {
        this.readyState = SocketIO.CLOSED;
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
        this.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'close',
          target: this,
          code: _helpersCloseCodes2['default'].CLOSE_NORMAL
        }));

        console.error('Socket.io connection to \'' + this.url + '\' failed');
      }
    }, this);

    /**
      Add an aliased event listener for close / disconnect
     */
    this.addEventListener('close', function (event) {
      _this.dispatchEvent((0, _eventFactory.createCloseEvent)({
        type: 'disconnect',
        target: event.target,
        code: event.code
      }));
    });
  }

  /*
  * Closes the SocketIO connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  */

  _createClass(SocketIO, [{
    key: 'close',
    value: function close() {
      if (this.readyState !== SocketIO.OPEN) {
        return undefined;
      }

      var server = _networkBridge2['default'].serverLookup(this.url);
      _networkBridge2['default'].removeWebSocket(this, this.url);

      this.readyState = SocketIO.CLOSED;
      this.dispatchEvent((0, _eventFactory.createCloseEvent)({
        type: 'close',
        target: this,
        code: _helpersCloseCodes2['default'].CLOSE_NORMAL
      }));

      if (server) {
        server.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'disconnect',
          target: this,
          code: _helpersCloseCodes2['default'].CLOSE_NORMAL
        }), server);
      }
    }

    /*
    * Alias for Socket#close
    *
    * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L383
    */
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.close();
    }

    /*
    * Submits an event to the server with a payload
    */
  }, {
    key: 'emit',
    value: function emit(event, data) {
      if (this.readyState !== SocketIO.OPEN) {
        throw new Error('SocketIO is already in CLOSING or CLOSED state');
      }

      var messageEvent = (0, _eventFactory.createMessageEvent)({
        type: event,
        origin: this.url,
        data: data
      });

      var server = _networkBridge2['default'].serverLookup(this.url);

      if (server) {
        server.dispatchEvent(messageEvent, data);
      }
    }

    /*
    * Submits a 'message' event to the server.
    *
    * Should behave exactly like WebSocket#send
    *
    * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L113
    */
  }, {
    key: 'send',
    value: function send(data) {
      this.emit('message', data);
    }

    /*
    * For registering events to be received from the server
    */
  }, {
    key: 'on',
    value: function on(type, callback) {
      this.addEventListener(type, callback);
    }

    /*
     * Join a room on a server
     *
     * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
     */
  }, {
    key: 'join',
    value: function join(room) {
      _networkBridge2['default'].addMembershipToRoom(this, room);
    }

    /*
     * Get the websocket to leave the room
     *
     * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
     */
  }, {
    key: 'leave',
    value: function leave(room) {
      _networkBridge2['default'].removeMembershipFromRoom(this, room);
    }

    /*
     * Invokes all listener functions that are listening to the given event.type property. Each
     * listener will be passed the event as the first argument.
     *
     * @param {object} event - event object which will be passed to all listeners of the event.type property
     */
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(event) {
      var _this2 = this;

      for (var _len = arguments.length, customArguments = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        customArguments[_key - 1] = arguments[_key];
      }

      var eventName = event.type;
      var listeners = this.listeners[eventName];

      if (!Array.isArray(listeners)) {
        return false;
      }

      listeners.forEach(function (listener) {
        if (customArguments.length > 0) {
          listener.apply(_this2, customArguments);
        } else {
          // Regular WebSockets expect a MessageEvent but Socketio.io just wants raw data
          //  payload instanceof MessageEvent works, but you can't isntance of NodeEvent
          //  for now we detect if the output has data defined on it
          listener.call(_this2, event.data ? event.data : event);
        }
      });
    }
  }]);

  return SocketIO;
})(_eventTarget2['default']);

SocketIO.CONNECTING = 0;
SocketIO.OPEN = 1;
SocketIO.CLOSING = 2;
SocketIO.CLOSED = 3;

/*
* Static constructor methods for the IO Socket
*/
var IO = function ioConstructor(url) {
  return new SocketIO(url);
};

/*
* Alias the raw IO() constructor
*/
IO.connect = function ioConnect(url) {
  /* eslint-disable new-cap */
  return IO(url);
  /* eslint-enable new-cap */
};

exports['default'] = IO;
module.exports = exports['default'];
},{"./event-factory":10,"./event-target":11,"./helpers/close-codes":13,"./helpers/delay":14,"./network-bridge":17,"urijs":6}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _eventFactory = require('./event-factory');

/*
* The main websocket class which is designed to mimick the native WebSocket class as close
* as possible.
*
* https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
*/

var WebSocket = (function (_EventTarget) {
  _inherits(WebSocket, _EventTarget);

  /*
  * @param {string} url
  */

  function WebSocket(url) {
    var protocol = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    _classCallCheck(this, WebSocket);

    _get(Object.getPrototypeOf(WebSocket.prototype), 'constructor', this).call(this);

    if (!url) {
      throw new TypeError('Failed to construct \'WebSocket\': 1 argument required, but only 0 present.');
    }

    this.binaryType = 'blob';
    this.url = (0, _urijs2['default'])(url).toString();
    this.readyState = WebSocket.CONNECTING;
    this.protocol = '';

    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this.protocol = protocol[0];
    }

    /*
    * In order to capture the callback function we need to define custom setters.
    * To illustrate:
    *   mySocket.onopen = function() { alert(true) };
    *
    * The only way to capture that function and hold onto it for later is with the
    * below code:
    */
    Object.defineProperties(this, {
      onopen: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.open;
        },
        set: function set(listener) {
          this.addEventListener('open', listener);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.message;
        },
        set: function set(listener) {
          this.addEventListener('message', listener);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.close;
        },
        set: function set(listener) {
          this.addEventListener('close', listener);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.error;
        },
        set: function set(listener) {
          this.addEventListener('error', listener);
        }
      }
    });

    var server = _networkBridge2['default'].attachWebSocket(this, this.url);

    /*
    * This delay is needed so that we dont trigger an event before the callbacks have been
    * setup. For example:
    *
    * var socket = new WebSocket('ws://localhost');
    *
    * // If we dont have the delay then the event would be triggered right here and this is
    * // before the onopen had a chance to register itself.
    *
    * socket.onopen = () => { // this would never be called };
    *
    * // and with the delay the event gets triggered here after all of the callbacks have been
    * // registered :-)
    */
    (0, _helpersDelay2['default'])(function delayCallback() {
      if (server) {
        this.readyState = WebSocket.OPEN;
        server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connection' }), server, this);
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'open', target: this }));
      } else {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
        this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close', target: this, code: _helpersCloseCodes2['default'].CLOSE_NORMAL }));

        console.error('WebSocket connection to \'' + this.url + '\' failed');
      }
    }, this);
  }

  /*
  * Transmits data to the server over the WebSocket connection.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#send()
  */

  _createClass(WebSocket, [{
    key: 'send',
    value: function send(data) {
      if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
        throw new Error('WebSocket is already in CLOSING or CLOSED state');
      }

      var messageEvent = (0, _eventFactory.createMessageEvent)({
        type: 'message',
        origin: this.url,
        data: data
      });

      var server = _networkBridge2['default'].serverLookup(this.url);

      if (server) {
        server.dispatchEvent(messageEvent, data);
      }
    }

    /*
    * Closes the WebSocket connection or connection attempt, if any.
    * If the connection is already CLOSED, this method does nothing.
    *
    * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#close()
    */
  }, {
    key: 'close',
    value: function close() {
      if (this.readyState !== WebSocket.OPEN) {
        return undefined;
      }

      var server = _networkBridge2['default'].serverLookup(this.url);
      var closeEvent = (0, _eventFactory.createCloseEvent)({
        type: 'close',
        target: this,
        code: _helpersCloseCodes2['default'].CLOSE_NORMAL
      });

      _networkBridge2['default'].removeWebSocket(this, this.url);

      this.readyState = WebSocket.CLOSED;
      this.dispatchEvent(closeEvent);

      if (server) {
        server.dispatchEvent(closeEvent, server);
      }
    }
  }]);

  return WebSocket;
})(_eventTarget2['default']);

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

exports['default'] = WebSocket;
module.exports = exports['default'];
},{"./event-factory":10,"./event-target":11,"./helpers/close-codes":13,"./helpers/delay":14,"./network-bridge":17,"urijs":6}],21:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcSocketIo = require('../src/socket-io');

var _srcSocketIo2 = _interopRequireDefault(_srcSocketIo);

var _srcServer = require('../src/server');

var _srcServer2 = _interopRequireDefault(_srcServer);

describe('Functional - SocketIO', function functionalTest() {
  it('client triggers the server connection event', function (done) {
    var server = new _srcServer2['default']('foobar');
    var socket = (0, _srcSocketIo2['default'])('foobar');

    server.on('connection', function () {
      _assert2['default'].ok(true);
      socket.disconnect();
      server.close();
      done();
    });
  });

  it('client triggers the server connect event', function (done) {
    var server = new _srcServer2['default']('foobar');
    var socket = (0, _srcSocketIo2['default'])('foobar');

    server.on('connect', function () {
      _assert2['default'].ok(true);
      socket.disconnect();
      server.close();
      done();
    });
  });

  it('server triggers the client connect event', function (done) {
    var server = new _srcServer2['default']('foobar');
    var socket = (0, _srcSocketIo2['default'])('foobar');

    socket.on('connect', function () {
      _assert2['default'].ok(true);
      socket.disconnect();
      server.close();
      done();
    });
  });

  it('no connection triggers the client error event', function (done) {
    var socket = (0, _srcSocketIo2['default'])('foobar');

    socket.on('error', function () {
      _assert2['default'].ok(true);
      socket.disconnect();
      done();
    });
  });

  it('client and server receive an event', function (done) {
    var server = new _srcServer2['default']('foobar');
    server.on('client-event', function (data) {
      server.emit('server-response', data);
    });

    var socket = (0, _srcSocketIo2['default'])('foobar');
    socket.on('server-response', function (data) {
      _assert2['default'].equal('payload', data);
      socket.disconnect();
      server.close();
      done();
    });

    socket.on('connect', function () {
      socket.emit('client-event', 'payload');
    });
  });

  it('Server closing triggers the client disconnect event', function (done) {
    var server = new _srcServer2['default']('foobar');
    server.on('connect', function () {
      server.close();
    });

    var socket = (0, _srcSocketIo2['default'])('foobar');
    socket.on('disconnect', function () {
      _assert2['default'].ok(true);
      socket.disconnect();
      done();
    });
  });

  it('Server receives disconnect when socket is closed', function (done) {
    var server = new _srcServer2['default']('foobar');
    server.on('disconnect', function () {
      _assert2['default'].ok(true);
      server.close();
      done();
    });

    var socket = (0, _srcSocketIo2['default'])('foobar');
    socket.on('connect', function () {
      socket.disconnect();
    });
  });

  it('Client can submit an event without a payload', function (done) {
    var server = new _srcServer2['default']('foobar');
    server.on('client-event', function () {
      _assert2['default'].ok(true);
      server.close();
      done();
    });

    var socket = (0, _srcSocketIo2['default'])('foobar');
    socket.on('connect', function () {
      socket.emit('client-event');
    });
  });

  it('Client also has the send method available', function (done) {
    var server = new _srcServer2['default']('foobar');
    server.on('message', function (data) {
      _assert2['default'].equal(data, 'hullo!');
      server.close();
      done();
    });

    var socket = (0, _srcSocketIo2['default'])('foobar');
    socket.on('connect', function () {
      socket.send('hullo!');
    });
  });

  it('a socket can join and leave a room', function (done) {
    var server = new _srcServer2['default']('ws://roomy');
    var socket = (0, _srcSocketIo2['default'])('ws://roomy');

    socket.on('good-response', function () {
      _assert2['default'].ok(true);
      server.close();
      done();
    });

    socket.on('connect', function () {
      socket.join('room');
      server.to('room').emit('good-response');
    });
  });
});
},{"../src/server":18,"../src/socket-io":19,"assert":1}],22:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcServer = require('../src/server');

var _srcServer2 = _interopRequireDefault(_srcServer);

var _srcWebsocket = require('../src/websocket');

var _srcWebsocket2 = _interopRequireDefault(_srcWebsocket);

var _srcNetworkBridge = require('../src/network-bridge');

var _srcNetworkBridge2 = _interopRequireDefault(_srcNetworkBridge);

describe('Functional - WebSockets', function functionalTest() {
  afterEach(function after() {
    _srcNetworkBridge2['default'].urlMap = {};
  });

  it('that creating a websocket with no server invokes the onerror method', function (done) {
    var mockSocket = new _srcWebsocket2['default']('ws://localhost:8080');
    mockSocket.onerror = function error(event) {
      _assert2['default'].equal(event.target.readyState, _srcWebsocket2['default'].CLOSED, 'onerror fires as expected');
      done();
    };
  });

  it('that onopen is called after successfully connection to the server', function (done) {
    var server = new _srcServer2['default']('ws://localhost:8080');
    var mockSocket = new _srcWebsocket2['default']('ws://localhost:8080');

    mockSocket.onopen = function open(event) {
      _assert2['default'].equal(event.target.readyState, _srcWebsocket2['default'].OPEN, 'onopen fires as expected');
      done();
    };
  });

  it('that onmessage is called after the server sends a message', function (done) {
    var test = new _srcServer2['default']('ws://localhost:8080');

    test.on('connection', function connection(server) {
      server.send('Testing');
    });

    var mockSocket = new _srcWebsocket2['default']('ws://localhost:8080');

    mockSocket.onmessage = function message(event) {
      _assert2['default'].equal(event.data, 'Testing', 'onmessage fires as expected');
      done();
    };
  });

  it('that onclose is called after the client closes the connection', function (done) {
    var test = new _srcServer2['default']('ws://localhost:8080');

    test.on('connection', function connection(server) {
      server.send('Testing');
    });

    var mockSocket = new _srcWebsocket2['default']('ws://localhost:8080');

    mockSocket.onmessage = function message() {
      mockSocket.close();
    };

    mockSocket.onclose = function close(event) {
      _assert2['default'].equal(event.target.readyState, _srcWebsocket2['default'].CLOSED, 'onclose fires as expected');
      done();
    };
  });

  it('that the server gets called when the client sends a message', function (done) {
    var test = new _srcServer2['default']('ws://localhost:8080');

    test.on('message', function message(data) {
      _assert2['default'].equal(data, 'Testing', 'on message fires as expected');
      done();
    });

    var mockSocket = new _srcWebsocket2['default']('ws://localhost:8080');

    mockSocket.onopen = function open() {
      this.send('Testing');
    };
  });

  it('that the onopen function will only be called once for each client', function (done) {
    var socketUrl = 'ws://localhost:8080';
    var mockServer = new _srcServer2['default'](socketUrl);
    var websocketFoo = new _srcWebsocket2['default'](socketUrl);
    var websocketBar = new _srcWebsocket2['default'](socketUrl);

    websocketFoo.onopen = function open() {
      _assert2['default'].ok(true, 'mocksocket onopen fires as expected');
    };

    websocketBar.onopen = function open() {
      _assert2['default'].ok(true, 'mocksocket onopen fires as expected');
      mockServer.close();
      done();
    };
  });

  it('closing a client will only close itself and not other clients', function (done) {
    var server = new _srcServer2['default']('ws://localhost:8080');
    var websocketFoo = new _srcWebsocket2['default']('ws://localhost:8080');
    var websocketBar = new _srcWebsocket2['default']('ws://localhost:8080');

    websocketFoo.onclose = function close() {
      _assert2['default'].ok(false, 'mocksocket should not close');
    };

    websocketBar.onopen = function open() {
      this.close();
    };

    websocketBar.onclose = function close() {
      _assert2['default'].ok(true, 'mocksocket onclose fires as expected');
      done();
    };
  });

  it('mock clients can send messages to the right mock server', function (done) {
    var serverFoo = new _srcServer2['default']('ws://localhost:8080');
    var serverBar = new _srcServer2['default']('ws://localhost:8081');
    var dataFoo = 'foo';
    var dataBar = 'bar';
    var socketFoo = new _srcWebsocket2['default']('ws://localhost:8080');
    var socketBar = new _srcWebsocket2['default']('ws://localhost:8081');

    serverFoo.on('connection', function connection(server) {
      _assert2['default'].ok(true, 'mock server on connection fires as expected');

      server.on('message', function message(data) {
        _assert2['default'].equal(data, dataFoo);
      });
    });

    serverBar.on('connection', function connection(server) {
      _assert2['default'].ok(true, 'mock server on connection fires as expected');

      server.on('message', function message(data) {
        _assert2['default'].equal(data, dataBar);
        done();
      });
    });

    socketFoo.onopen = function open() {
      _assert2['default'].ok(true, 'mocksocket onopen fires as expected');
      this.send(dataFoo);
    };

    socketBar.onopen = function open() {
      _assert2['default'].ok(true, 'mocksocket onopen fires as expected');
      this.send(dataBar);
    };
  });

  it('that closing a websocket removes it from the network bridge', function (done) {
    var server = new _srcServer2['default']('ws://localhost:8080');
    var socket = new _srcWebsocket2['default']('ws://localhost:8080');

    socket.onopen = function open() {
      var urlMap = _srcNetworkBridge2['default'].urlMap['ws://localhost:8080/'];
      _assert2['default'].equal(urlMap.websockets.length, 1, 'the websocket is in the network bridge');
      _assert2['default'].deepEqual(urlMap.websockets[0], this, 'the websocket is in the network bridge');
      this.close();
    };

    socket.onclose = function close() {
      var urlMap = _srcNetworkBridge2['default'].urlMap['ws://localhost:8080/'];
      _assert2['default'].equal(urlMap.websockets.length, 0, 'the websocket was removed from the network bridge');
      server.close();
      done();
    };
  });
});
},{"../src/network-bridge":17,"../src/server":18,"../src/websocket":20,"assert":1}],23:[function(require,module,exports){
/*
* This loads all of the globals needed for mocksockets and mockserver to work correctly.
* This should be the first import in the test loader.
*/
'use strict';

require('../unit-network-bridge-test');

require('../unit-event-target-test');

require('../unit-factory-test');

require('../unit-websocket-test');

require('../unit-server-test');

require('../unit-socket-io-test');

require('../functional-websockets-test');

require('../functional-socket-io-test');

require('../issue-13-test');

require('../issue-19-test');

require('../issue-64-test');

require('../issue-65-test');
},{"../functional-socket-io-test":21,"../functional-websockets-test":22,"../issue-13-test":24,"../issue-19-test":25,"../issue-64-test":26,"../issue-65-test":27,"../unit-event-target-test":28,"../unit-factory-test":29,"../unit-network-bridge-test":30,"../unit-server-test":31,"../unit-socket-io-test":32,"../unit-websocket-test":33}],24:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcServer = require('../src/server');

var _srcServer2 = _interopRequireDefault(_srcServer);

var _srcWebsocket = require('../src/websocket');

var _srcWebsocket2 = _interopRequireDefault(_srcWebsocket);

describe('Issue #13: Sockets send messages multiple times', function issueTest() {
  it('mock sockets sends double messages', function (done) {
    var socketUrl = 'ws://localhost:8080';
    var mockServer = new _srcServer2['default'](socketUrl);
    var mockSocketA = new _srcWebsocket2['default'](socketUrl);
    var mockSocketB = new _srcWebsocket2['default'](socketUrl);

    var numMessagesSent = 0;
    var numMessagesReceived = 0;
    var connectionsCreated = 0;

    var serverMessageHandler = function handlerFunc() {
      numMessagesReceived++;
    };

    mockServer.on('connection', function connectionFunc(server) {
      connectionsCreated++;
      server.on('message', serverMessageHandler);
    });

    mockSocketA.onopen = function open() {
      numMessagesSent++;
      this.send('1');
    };

    mockSocketB.onopen = function open() {
      numMessagesSent++;
      this.send('2');
    };

    setTimeout(function timeout() {
      _assert2['default'].equal(numMessagesReceived, numMessagesSent);
      mockServer.close();
      done();
    }, 500);
  });
});
},{"../src/server":18,"../src/websocket":20,"assert":1}],25:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcServer = require('../src/server');

var _srcServer2 = _interopRequireDefault(_srcServer);

var _srcWebsocket = require('../src/websocket');

var _srcWebsocket2 = _interopRequireDefault(_srcWebsocket);

describe('Issue #19: Mock Server on(message) argument should be a string and not an object.', function issueTest() {
  it('that server on(message) argument should be a string and not an object', function (done) {
    var socketUrl = 'ws://localhost:8080';
    var mockServer = new _srcServer2['default'](socketUrl);
    var mockSocket = new _srcWebsocket2['default'](socketUrl);

    mockServer.on('connection', function (socket) {
      socket.on('message', function (message) {
        _assert2['default'].equal(typeof message, 'string', 'message should be a string and not an object');
        mockServer.close();
        done();
      });
    });

    mockSocket.onopen = function open() {
      this.send('1');
    };
  });
});
},{"../src/server":18,"../src/websocket":20,"assert":1}],26:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcServer = require('../src/server');

var _srcServer2 = _interopRequireDefault(_srcServer);

var _srcSocketIo = require('../src/socket-io');

var _srcSocketIo2 = _interopRequireDefault(_srcSocketIo);

describe('Issue #64: `on` allows multiple handlers for the same event', function issueTest() {
  it('mock sockets invokes each handler', function (done) {
    var socketUrl = 'ws://roomy';
    var server = new _srcServer2['default'](socketUrl);
    var socket = new _srcSocketIo2['default'](socketUrl);

    var handler1Called = false;
    var handler2Called = false;

    socket.on('custom-event', function () {
      _assert2['default'].ok(true);
      handler1Called = true;
    });

    socket.on('custom-event', function () {
      _assert2['default'].ok(true);
      handler2Called = true;
    });

    socket.on('connect', function () {
      socket.join('room');
      server.to('room').emit('custom-event');
    });

    setTimeout(function timeout() {
      _assert2['default'].equal(handler1Called, true);
      _assert2['default'].equal(handler2Called, true);
      server.close();
      done();
    }, 500);
  });
});
},{"../src/server":18,"../src/socket-io":19,"assert":1}],27:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcServer = require('../src/server');

var _srcServer2 = _interopRequireDefault(_srcServer);

var _srcSocketIo = require('../src/socket-io');

var _srcSocketIo2 = _interopRequireDefault(_srcSocketIo);

describe('Issue #65: `on` allows multiple handlers for the same event with different contexts', function issueTest() {
  it('mock socket invokes each handler with unique reference', function (done) {
    var socketUrl = 'ws://roomy';
    var server = new _srcServer2['default'](socketUrl);
    var socket = new _srcSocketIo2['default'](socketUrl);

    var handlerInvoked = 0;
    var handler3 = function handlerFunc() {
      _assert2['default'].ok(true);
      handlerInvoked++;
    };

    // Same functions but different scopes/contexts
    socket.on('custom-event', handler3.bind(Object.create(null)));
    socket.on('custom-event', handler3.bind(Object.create(null)));

    // Same functions with same scope/context (only one should be added)
    socket.on('custom-event', handler3);
    socket.on('custom-event', handler3); // not expected

    socket.on('connect', function () {
      socket.join('room');
      server.to('room').emit('custom-event');
    });

    setTimeout(function timeoutCallback() {
      _assert2['default'].equal(handlerInvoked, 3, 'handler invoked too many times');
      server.close();
      done();
    }, 500);
  });

  it('mock socket invokes each handler per socket', function (done) {
    var socketUrl = 'ws://roomy';
    var server = new _srcServer2['default'](socketUrl);
    var socketA = new _srcSocketIo2['default'](socketUrl);
    var socketB = new _srcSocketIo2['default'](socketUrl);

    var handlerInvoked = 0;
    var handler3 = function handlerFunc() {
      _assert2['default'].ok(true);
      handlerInvoked++;
    };

    // Same functions but different scopes/contexts
    socketA.on('custom-event', handler3.bind(socketA));
    socketB.on('custom-event', handler3.bind(socketB));

    // Same functions with same scope/context (only one should be added)
    socketA.on('custom-event', handler3);
    socketA.on('custom-event', handler3); // not expected

    socketB.on('custom-event', handler3.bind(socketB)); // expected because bind creates a new method

    socketA.on('connect', function () {
      socketA.join('room');
      socketB.join('room');
      server.to('room').emit('custom-event');
    });

    setTimeout(function timeoutFunc() {
      _assert2['default'].equal(handlerInvoked, 4, 'handler invoked too many times');
      server.close();
      done();
    }, 500);
  });
});
},{"../src/server":18,"../src/socket-io":19,"assert":1}],28:[function(require,module,exports){
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcEventFactory = require('../src/event-factory');

var _srcEventTarget = require('../src/event-target');

var _srcEventTarget2 = _interopRequireDefault(_srcEventTarget);

var Mock = (function (_EventTarget) {
  _inherits(Mock, _EventTarget);

  function Mock() {
    _classCallCheck(this, Mock);

    _get(Object.getPrototypeOf(Mock.prototype), 'constructor', this).apply(this, arguments);
  }

  return Mock;
})(_srcEventTarget2['default']);

var MockFoo = (function (_EventTarget2) {
  _inherits(MockFoo, _EventTarget2);

  function MockFoo() {
    _classCallCheck(this, MockFoo);

    _get(Object.getPrototypeOf(MockFoo.prototype), 'constructor', this).apply(this, arguments);
  }

  return MockFoo;
})(_srcEventTarget2['default']);

describe('Unit - EventTarget', function unitTest() {
  it('has all the required methods', function () {
    var mock = new Mock();

    _assert2['default'].ok(mock.addEventListener);
    _assert2['default'].ok(mock.removeEventListener);
    _assert2['default'].ok(mock.dispatchEvent);
  });

  it('adding/removing "message" event listeners works', function () {
    var mock = new Mock();
    var eventObject = (0, _srcEventFactory.createEvent)({
      type: 'message'
    });

    var fooListener = function fooListener(event) {
      _assert2['default'].equal(event.type, 'message');
    };
    var barListener = function barListener(event) {
      _assert2['default'].equal(event.type, 'message');
    };

    mock.addEventListener('message', fooListener);
    mock.addEventListener('message', barListener);
    mock.dispatchEvent(eventObject);

    mock.removeEventListener('message', fooListener);
    mock.dispatchEvent(eventObject);

    mock.removeEventListener('message', barListener);
    mock.dispatchEvent(eventObject);
  });

  it('events to different object should not share events', function () {
    var mock = new Mock();
    var mockFoo = new MockFoo();
    var eventObject = (0, _srcEventFactory.createEvent)({
      type: 'message'
    });

    var fooListener = function fooListener(event) {
      _assert2['default'].equal(event.type, 'message');
    };
    var barListener = function barListener(event) {
      _assert2['default'].equal(event.type, 'message');
    };

    mock.addEventListener('message', fooListener);
    mockFoo.addEventListener('message', barListener);
    mock.dispatchEvent(eventObject);
    mockFoo.dispatchEvent(eventObject);

    mock.removeEventListener('message', fooListener);
    mock.dispatchEvent(eventObject);
    mockFoo.dispatchEvent(eventObject);

    mockFoo.removeEventListener('message', barListener);
    mock.dispatchEvent(eventObject);
    mockFoo.dispatchEvent(eventObject);
  });

  it('that adding the same function twice for the same event type is only added once', function () {
    var mock = new Mock();
    var fooListener = function fooListener(event) {
      _assert2['default'].equal(event.type, 'message');
    };
    var barListener = function barListener(event) {
      _assert2['default'].equal(event.type, 'message');
    };

    mock.addEventListener('message', fooListener);
    mock.addEventListener('message', fooListener);
    mock.addEventListener('message', barListener);

    _assert2['default'].equal(mock.listeners.message.length, 2);
  });
});
},{"../src/event-factory":10,"../src/event-target":11,"assert":1}],29:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcEventFactory = require('../src/event-factory');

var fakeObject = { foo: 'bar' };

describe('Unit - Factory', function unitTest() {
  it('that the create methods throw errors if no type if specified', function () {
    _assert2['default'].throws(function () {
      (0, _srcEventFactory.createEvent)();
    }, 'Cannot read property \'type\' of undefined');

    _assert2['default'].throws(function () {
      (0, _srcEventFactory.createMessageEvent)();
    }, 'Cannot read property \'type\' of undefined');
  });

  it('that createEvent correctly creates an event', function () {
    var event = (0, _srcEventFactory.createEvent)({
      type: 'open'
    });

    _assert2['default'].equal(event.type, 'open', 'the type property is set');
    _assert2['default'].equal(event.target, null, 'target is null as no target was passed');
    _assert2['default'].equal(event.srcElement, null, 'srcElement is null as no target was passed');
    _assert2['default'].equal(event.currentTarget, null, 'currentTarget is null as no target was passed');

    event = (0, _srcEventFactory.createEvent)({
      type: 'open',
      target: fakeObject
    });

    _assert2['default'].deepEqual(event.target, fakeObject, 'target is set to fakeObject');
    _assert2['default'].deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
    _assert2['default'].deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');
  });

  it('that createMessageEvent correctly creates an event', function () {
    var event = (0, _srcEventFactory.createMessageEvent)({
      type: 'message',
      origin: 'ws://localhost:8080',
      data: 'Testing'
    });

    _assert2['default'].equal(event.type, 'message', 'the type property is set');
    _assert2['default'].equal(event.data, 'Testing', 'the data property is set');
    _assert2['default'].equal(event.origin, 'ws://localhost:8080', 'the origin property is set');
    _assert2['default'].equal(event.target, null, 'target is null as no target was passed');
    _assert2['default'].equal(event.lastEventId, '', 'lastEventId is an empty string');
    _assert2['default'].equal(event.srcElement, null, 'srcElement is null as no target was passed');
    _assert2['default'].equal(event.currentTarget, null, 'currentTarget is null as no target was passed');

    event = (0, _srcEventFactory.createMessageEvent)({
      type: 'close',
      origin: 'ws://localhost:8080',
      data: 'Testing',
      target: fakeObject
    });

    _assert2['default'].equal(event.lastEventId, '', 'lastEventId is an empty string');
    _assert2['default'].deepEqual(event.target, fakeObject, 'target is set to fakeObject');
    _assert2['default'].deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
    _assert2['default'].deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');
  });

  it('that createCloseEvent correctly creates an event', function () {
    var event = (0, _srcEventFactory.createCloseEvent)({
      type: 'close'
    });

    _assert2['default'].equal(event.code, 0, 'the code property is set');
    _assert2['default'].equal(event.reason, '', 'the reason property is set');
    _assert2['default'].equal(event.target, null, 'target is null as no target was passed');
    _assert2['default'].equal(event.wasClean, false, 'wasClean is false as the code is not 1000');
    _assert2['default'].equal(event.srcElement, null, 'srcElement is null as no target was passed');
    _assert2['default'].equal(event.currentTarget, null, 'currentTarget is null as no target was passed');

    event = (0, _srcEventFactory.createCloseEvent)({
      type: 'close',
      code: 1001,
      reason: 'my bad',
      target: fakeObject
    });

    _assert2['default'].equal(event.code, 1001, 'the code property is set');
    _assert2['default'].equal(event.reason, 'my bad', 'the reason property is set');
    _assert2['default'].deepEqual(event.target, fakeObject, 'target is set to fakeObject');
    _assert2['default'].deepEqual(event.srcElement, fakeObject, 'srcElement is set to fakeObject');
    _assert2['default'].deepEqual(event.currentTarget, fakeObject, 'currentTarget is set to fakeObject');

    event = (0, _srcEventFactory.createCloseEvent)({
      type: 'close',
      code: 1000
    });

    _assert2['default'].equal(event.wasClean, true, 'wasClean is true as the code is 1000');
  });
});
},{"../src/event-factory":10,"assert":1}],30:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcNetworkBridge = require('../src/network-bridge');

var _srcNetworkBridge2 = _interopRequireDefault(_srcNetworkBridge);

var fakeObject = { foo: 'bar' };

describe('Unit - Network Bridge', function unitTest() {
  afterEach(function after() {
    _srcNetworkBridge2['default'].urlMap = {};
  });

  it('that network bridge has no connections be defualt', function () {
    _assert2['default'].deepEqual(_srcNetworkBridge2['default'].urlMap, {}, 'Url map is empty by default');
  });

  it('that network bridge has no connections be defualt', function () {
    var result = _srcNetworkBridge2['default'].attachWebSocket(fakeObject, 'ws://localhost:8080');

    _assert2['default'].ok(!result, 'no server was returned as a server must be added first');
    _assert2['default'].deepEqual(_srcNetworkBridge2['default'].urlMap, {}, 'nothing was added to the url map');
  });

  it('that attachServer adds a server to url map', function () {
    var result = _srcNetworkBridge2['default'].attachServer(fakeObject, 'ws://localhost:8080');
    var connection = _srcNetworkBridge2['default'].urlMap['ws://localhost:8080'];

    _assert2['default'].deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
    _assert2['default'].deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
    _assert2['default'].equal(connection.websockets.length, 0, 'websocket property was set to an empty array');
  });

  it('that attachServer does nothing if a server is already attached to a given url', function () {
    var result = _srcNetworkBridge2['default'].attachServer(fakeObject, 'ws://localhost:8080');
    var result2 = _srcNetworkBridge2['default'].attachServer({ hello: 'world' }, 'ws://localhost:8080');
    var connection = _srcNetworkBridge2['default'].urlMap['ws://localhost:8080'];

    _assert2['default'].ok(!result2, 'no server was returned as a server was already listening to that url');
    _assert2['default'].deepEqual(result, fakeObject, 'the server was returned because it was successfully added to the url map');
    _assert2['default'].deepEqual(connection.server, fakeObject, 'fakeObject was added to the server property');
    _assert2['default'].equal(connection.websockets.length, 0, 'websocket property was set to an empty array');
  });

  it('that attachWebSocket will add a websocket to the url map', function () {
    var resultServer = _srcNetworkBridge2['default'].attachServer(fakeObject, 'ws://localhost:8080');
    var resultWebSocket = _srcNetworkBridge2['default'].attachWebSocket(fakeObject, 'ws://localhost:8080');
    var connection = _srcNetworkBridge2['default'].urlMap['ws://localhost:8080'];

    _assert2['default'].deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
    _assert2['default'].deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
    _assert2['default'].deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
    _assert2['default'].equal(connection.websockets.length, 1, 'websocket property contains only the websocket object');
  });

  it('that attachWebSocket will add the same websocket only once', function () {
    var resultServer = _srcNetworkBridge2['default'].attachServer(fakeObject, 'ws://localhost:8080');
    var resultWebSocket = _srcNetworkBridge2['default'].attachWebSocket(fakeObject, 'ws://localhost:8080');
    var resultWebSocket2 = _srcNetworkBridge2['default'].attachWebSocket(fakeObject, 'ws://localhost:8080');
    var connection = _srcNetworkBridge2['default'].urlMap['ws://localhost:8080'];

    _assert2['default'].deepEqual(resultServer, fakeObject, 'server returned because it was successfully added to the url map');
    _assert2['default'].deepEqual(resultWebSocket, fakeObject, 'server returned as the websocket was successfully added to the map');
    _assert2['default'].ok(!resultWebSocket2, 'nothing added as the websocket already existed inside the url map');
    _assert2['default'].deepEqual(connection.websockets[0], fakeObject, 'fakeObject was added to the websockets array');
    _assert2['default'].equal(connection.websockets.length, 1, 'websocket property contains only the websocket object');
  });

  it('that server and websocket lookups return the correct objects', function () {
    _srcNetworkBridge2['default'].attachServer(fakeObject, 'ws://localhost:8080');
    _srcNetworkBridge2['default'].attachWebSocket(fakeObject, 'ws://localhost:8080');

    var serverLookup = _srcNetworkBridge2['default'].serverLookup('ws://localhost:8080');
    var websocketLookup = _srcNetworkBridge2['default'].websocketsLookup('ws://localhost:8080');

    _assert2['default'].deepEqual(serverLookup, fakeObject, 'server correctly returned');
    _assert2['default'].deepEqual(websocketLookup, [fakeObject], 'websockets correctly returned');
    _assert2['default'].deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');
  });

  it('that removing server and websockets works correctly', function () {
    _srcNetworkBridge2['default'].attachServer(fakeObject, 'ws://localhost:8080');
    _srcNetworkBridge2['default'].attachWebSocket(fakeObject, 'ws://localhost:8080');

    var websocketLookup = _srcNetworkBridge2['default'].websocketsLookup('ws://localhost:8080');
    _assert2['default'].deepEqual(websocketLookup.length, 1, 'the correct number of websockets are returned');

    _srcNetworkBridge2['default'].removeWebSocket(fakeObject, 'ws://localhost:8080');

    websocketLookup = _srcNetworkBridge2['default'].websocketsLookup('ws://localhost:8080');
    _assert2['default'].deepEqual(websocketLookup.length, 0, 'the correct number of websockets are returned');

    _srcNetworkBridge2['default'].removeServer('ws://localhost:8080');
    _assert2['default'].deepEqual(_srcNetworkBridge2['default'].urlMap, {}, 'Url map is back in its default state');
  });

  it('a socket can join and leave a room', function () {
    var fakeSocket = { url: 'ws://roomy' };

    _srcNetworkBridge2['default'].attachServer(fakeObject, 'ws://roomy');
    _srcNetworkBridge2['default'].attachWebSocket(fakeSocket, 'ws://roomy');

    var inRoom = undefined;
    inRoom = _srcNetworkBridge2['default'].websocketsLookup('ws://roomy', 'room');
    _assert2['default'].equal(inRoom.length, 0, 'there are no sockets in the room to start with');

    _srcNetworkBridge2['default'].addMembershipToRoom(fakeSocket, 'room');

    inRoom = _srcNetworkBridge2['default'].websocketsLookup('ws://roomy', 'room');
    _assert2['default'].equal(inRoom.length, 1, 'there is 1 socket in the room after joining');
    _assert2['default'].deepEqual(inRoom[0], fakeSocket);

    _srcNetworkBridge2['default'].removeMembershipFromRoom(fakeSocket, 'room');

    inRoom = _srcNetworkBridge2['default'].websocketsLookup('ws://roomy', 'room');
    _assert2['default'].equal(inRoom.length, 0, 'there are no sockets in the room after leaving');
  });
});
},{"../src/network-bridge":17,"assert":1}],31:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcServer = require('../src/server');

var _srcServer2 = _interopRequireDefault(_srcServer);

var _srcWebsocket = require('../src/websocket');

var _srcWebsocket2 = _interopRequireDefault(_srcWebsocket);

var _srcEventTarget = require('../src/event-target');

var _srcEventTarget2 = _interopRequireDefault(_srcEventTarget);

var _srcNetworkBridge = require('../src/network-bridge');

var _srcNetworkBridge2 = _interopRequireDefault(_srcNetworkBridge);

describe('Unit - Server', function unitTest() {
  it('that server inherents EventTarget methods', function () {
    var myServer = new _srcServer2['default']('ws://not-real');
    _assert2['default'].ok(myServer instanceof _srcEventTarget2['default']);
    myServer.close();
  });

  it('that after creating a server it is added to the network bridge', function () {
    var myServer = new _srcServer2['default']('ws://not-real/');
    var urlMap = _srcNetworkBridge2['default'].urlMap['ws://not-real/'];

    _assert2['default'].deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
    myServer.close();
    _assert2['default'].deepEqual(_srcNetworkBridge2['default'].urlMap, {}, 'the urlMap was cleared after the close call');
  });

  it('that callback functions can be added to the listeners object', function () {
    var myServer = new _srcServer2['default']('ws://not-real/');

    myServer.on('message', function () {});
    myServer.on('close', function () {});

    _assert2['default'].equal(myServer.listeners.message.length, 1);
    _assert2['default'].equal(myServer.listeners.close.length, 1);

    myServer.close();
  });

  it('that calling clients() returns the correct clients', function () {
    var myServer = new _srcServer2['default']('ws://not-real/');
    var socketFoo = new _srcWebsocket2['default']('ws://not-real/');
    var socketBar = new _srcWebsocket2['default']('ws://not-real/');

    _assert2['default'].equal(myServer.clients().length, 2, 'calling clients returns the 2 websockets');
    _assert2['default'].deepEqual(myServer.clients(), [socketFoo, socketBar], 'The clients matches [socketFoo, socketBar]');

    myServer.close();
  });

  it('that calling send will trigger the onmessage of websockets', function (done) {
    var myServer = new _srcServer2['default']('ws://not-real/');

    myServer.on('connection', function (server, socket) {
      myServer.send('Testing', { websocket: socket });
    });

    var socketFoo = new _srcWebsocket2['default']('ws://not-real/');
    var socketBar = new _srcWebsocket2['default']('ws://not-real/');
    socketFoo.onmessage = function () {
      _assert2['default'].ok(true, 'socketFoo onmessage was correctly called');
    };

    socketBar.onmessage = function () {
      _assert2['default'].ok(true, 'socketBar onmessage was correctly called');
      myServer.close();
      done();
    };
  });

  it('that calling close will trigger the onclose of websockets', function (done) {
    var myServer = new _srcServer2['default']('ws://not-real/');
    var counter = 0;

    myServer.on('connection', function () {
      counter++;
      if (counter === 2) {
        myServer.close({
          code: 1005,
          reason: 'Some reason'
        });
      }
    });

    var socketFoo = new _srcWebsocket2['default']('ws://not-real/');
    var socketBar = new _srcWebsocket2['default']('ws://not-real/');
    socketFoo.onclose = function (event) {
      _assert2['default'].ok(true, 'socketFoo onmessage was correctly called');
      _assert2['default'].equal(event.code, 1005, 'the correct code was recieved');
      _assert2['default'].equal(event.reason, 'Some reason', 'the correct reason was recieved');
    };

    socketBar.onclose = function (event) {
      _assert2['default'].ok(true, 'socketBar onmessage was correctly called');
      _assert2['default'].equal(event.code, 1005, 'the correct code was recieved');
      _assert2['default'].equal(event.reason, 'Some reason', 'the correct reason was recieved');
      done();
    };
  });

  it('a namespaced server is added to the network bridge', function () {
    var myServer = _srcServer2['default'].of('/my-namespace');
    var urlMap = _srcNetworkBridge2['default'].urlMap['/my-namespace'];

    _assert2['default'].deepEqual(urlMap.server, myServer, 'server was correctly added to the urlMap');
    myServer.close();
    _assert2['default'].deepEqual(_srcNetworkBridge2['default'].urlMap, {}, 'the urlMap was cleared after the close call');
  });
});
},{"../src/event-target":11,"../src/network-bridge":17,"../src/server":18,"../src/websocket":20,"assert":1}],32:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcSocketIo = require('../src/socket-io');

var _srcSocketIo2 = _interopRequireDefault(_srcSocketIo);

describe('Unit - SocketIO', function unitTest() {
  it('it can be instantiated without a url', function () {
    var socket = (0, _srcSocketIo2['default'])();
    _assert2['default'].ok(socket);
  });

  it('it accepts a url', function () {
    var socket = (0, _srcSocketIo2['default'])('http://localhost');
    _assert2['default'].ok(socket);
  });

  it('it accepts an opts object paramter', function () {
    var socket = (0, _srcSocketIo2['default'])('http://localhost', { a: 'apple' });
    _assert2['default'].ok(socket);
  });

  it('it can equivalently use a connect method', function () {
    var socket = _srcSocketIo2['default'].connect('http://localhost');
    _assert2['default'].ok(socket);
  });
});
},{"../src/socket-io":19,"assert":1}],33:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _srcWebsocket = require('../src/websocket');

var _srcWebsocket2 = _interopRequireDefault(_srcWebsocket);

var _srcEventTarget = require('../src/event-target');

var _srcEventTarget2 = _interopRequireDefault(_srcEventTarget);

describe('Unit - WebSocket', function unitTest() {
  it('that not passing a url throws an error', function () {
    _assert2['default'].throws(function () {
      var ws = new _srcWebsocket2['default']();
    }, 'Failed to construct \'WebSocket\': 1 argument required, but only 0 present');
  });

  it('that websockets inherents EventTarget methods', function () {
    var mySocket = new _srcWebsocket2['default']('ws://not-real');
    _assert2['default'].ok(mySocket instanceof _srcEventTarget2['default']);
  });

  it('that websockets inherents EventTarget methods', function () {
    var mySocket = new _srcWebsocket2['default']('ws://not-real');
    _assert2['default'].ok(mySocket instanceof _srcEventTarget2['default']);
  });

  it('that on(open, message, error, and close) can be set', function () {
    var mySocket = new _srcWebsocket2['default']('ws://not-real');

    mySocket.onopen = function () {};
    mySocket.onmessage = function () {};
    mySocket.onclose = function () {};
    mySocket.onerror = function () {};

    var listeners = mySocket.listeners;

    _assert2['default'].equal(listeners.open.length, 1);
    _assert2['default'].equal(listeners.message.length, 1);
    _assert2['default'].equal(listeners.close.length, 1);
    _assert2['default'].equal(listeners.error.length, 1);
  });

  it('that passing protocols into the constructor works', function () {
    var mySocket = new _srcWebsocket2['default']('ws://not-real', 'foo');
    var myOtherSocket = new _srcWebsocket2['default']('ws://not-real', ['bar']);

    _assert2['default'].equal(mySocket.protocol, 'foo', 'the correct protocol is set when it was passed in as a string');
    _assert2['default'].equal(myOtherSocket.protocol, 'bar', 'the correct protocol is set when it was passed in as an array');
  });

  it('that sending when the socket is closed throws an expection', function () {
    var mySocket = new _srcWebsocket2['default']('ws://not-real', 'foo');
    mySocket.readyState = _srcWebsocket2['default'].CLOSED;
    _assert2['default'].throws(function throws() {
      mySocket.send('testing');
    }, 'WebSocket is already in CLOSING or CLOSED state', 'an expection is thrown when sending while closed');
  });
});
},{"../src/event-target":11,"../src/websocket":20,"assert":1}]},{},[23])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy91cmlqcy9zcmMvSVB2Ni5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy91cmlqcy9zcmMvU2Vjb25kTGV2ZWxEb21haW5zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3VyaWpzL3NyYy9VUkkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdXJpanMvc3JjL3B1bnljb2RlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwic3JjL2V2ZW50LWZhY3RvcnkuanMiLCJzcmMvZXZlbnQtdGFyZ2V0LmpzIiwic3JjL2hlbHBlcnMvYXJyYXktaGVscGVycy5qcyIsInNyYy9oZWxwZXJzL2Nsb3NlLWNvZGVzLmpzIiwic3JjL2hlbHBlcnMvZGVsYXkuanMiLCJzcmMvaGVscGVycy9lbnZpcm9ubWVudC1jaGVjay5qcyIsInNyYy9oZWxwZXJzL2V2ZW50LW9iamVjdC5qcyIsInNyYy9uZXR3b3JrLWJyaWRnZS5qcyIsInNyYy9zZXJ2ZXIuanMiLCJzcmMvc29ja2V0LWlvLmpzIiwic3JjL3dlYnNvY2tldC5qcyIsInRlc3QvZnVuY3Rpb25hbC1zb2NrZXQtaW8tdGVzdC5qcyIsInRlc3QvZnVuY3Rpb25hbC13ZWJzb2NrZXRzLXRlc3QuanMiLCJ0ZXN0L2hlbHBlcnMvdGVzdC1sb2FkZXIuanMiLCJ0ZXN0L2lzc3VlLTEzLXRlc3QuanMiLCJ0ZXN0L2lzc3VlLTE5LXRlc3QuanMiLCJ0ZXN0L2lzc3VlLTY0LXRlc3QuanMiLCJ0ZXN0L2lzc3VlLTY1LXRlc3QuanMiLCJ0ZXN0L3VuaXQtZXZlbnQtdGFyZ2V0LXRlc3QuanMiLCJ0ZXN0L3VuaXQtZmFjdG9yeS10ZXN0LmpzIiwidGVzdC91bml0LW5ldHdvcmstYnJpZGdlLXRlc3QuanMiLCJ0ZXN0L3VuaXQtc2VydmVyLXRlc3QuanMiLCJ0ZXN0L3VuaXQtc29ja2V0LWlvLXRlc3QuanMiLCJ0ZXN0L3VuaXQtd2Vic29ja2V0LXRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBodHRwOi8vd2lraS5jb21tb25qcy5vcmcvd2lraS9Vbml0X1Rlc3RpbmcvMS4wXG4vL1xuLy8gVEhJUyBJUyBOT1QgVEVTVEVEIE5PUiBMSUtFTFkgVE8gV09SSyBPVVRTSURFIFY4IVxuLy9cbi8vIE9yaWdpbmFsbHkgZnJvbSBuYXJ3aGFsLmpzIChodHRwOi8vbmFyd2hhbGpzLm9yZylcbi8vIENvcHlyaWdodCAoYykgMjAwOSBUaG9tYXMgUm9iaW5zb24gPDI4MG5vcnRoLmNvbT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG9cbi8vIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXG4vLyByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Jcbi8vIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOXG4vLyBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gd2hlbiB1c2VkIGluIG5vZGUsIHRoaXMgd2lsbCBhY3R1YWxseSBsb2FkIHRoZSB1dGlsIG1vZHVsZSB3ZSBkZXBlbmQgb25cbi8vIHZlcnN1cyBsb2FkaW5nIHRoZSBidWlsdGluIHV0aWwgbW9kdWxlIGFzIGhhcHBlbnMgb3RoZXJ3aXNlXG4vLyB0aGlzIGlzIGEgYnVnIGluIG5vZGUgbW9kdWxlIGxvYWRpbmcgYXMgZmFyIGFzIEkgYW0gY29uY2VybmVkXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwvJyk7XG5cbnZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLy8gMS4gVGhlIGFzc2VydCBtb2R1bGUgcHJvdmlkZXMgZnVuY3Rpb25zIHRoYXQgdGhyb3dcbi8vIEFzc2VydGlvbkVycm9yJ3Mgd2hlbiBwYXJ0aWN1bGFyIGNvbmRpdGlvbnMgYXJlIG5vdCBtZXQuIFRoZVxuLy8gYXNzZXJ0IG1vZHVsZSBtdXN0IGNvbmZvcm0gdG8gdGhlIGZvbGxvd2luZyBpbnRlcmZhY2UuXG5cbnZhciBhc3NlcnQgPSBtb2R1bGUuZXhwb3J0cyA9IG9rO1xuXG4vLyAyLiBUaGUgQXNzZXJ0aW9uRXJyb3IgaXMgZGVmaW5lZCBpbiBhc3NlcnQuXG4vLyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHsgbWVzc2FnZTogbWVzc2FnZSxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogZXhwZWN0ZWQgfSlcblxuYXNzZXJ0LkFzc2VydGlvbkVycm9yID0gZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3Iob3B0aW9ucykge1xuICB0aGlzLm5hbWUgPSAnQXNzZXJ0aW9uRXJyb3InO1xuICB0aGlzLmFjdHVhbCA9IG9wdGlvbnMuYWN0dWFsO1xuICB0aGlzLmV4cGVjdGVkID0gb3B0aW9ucy5leHBlY3RlZDtcbiAgdGhpcy5vcGVyYXRvciA9IG9wdGlvbnMub3BlcmF0b3I7XG4gIGlmIChvcHRpb25zLm1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2U7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5tZXNzYWdlID0gZ2V0TWVzc2FnZSh0aGlzKTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSB0cnVlO1xuICB9XG4gIHZhciBzdGFja1N0YXJ0RnVuY3Rpb24gPSBvcHRpb25zLnN0YWNrU3RhcnRGdW5jdGlvbiB8fCBmYWlsO1xuXG4gIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHN0YWNrU3RhcnRGdW5jdGlvbik7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gbm9uIHY4IGJyb3dzZXJzIHNvIHdlIGNhbiBoYXZlIGEgc3RhY2t0cmFjZVxuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoKTtcbiAgICBpZiAoZXJyLnN0YWNrKSB7XG4gICAgICB2YXIgb3V0ID0gZXJyLnN0YWNrO1xuXG4gICAgICAvLyB0cnkgdG8gc3RyaXAgdXNlbGVzcyBmcmFtZXNcbiAgICAgIHZhciBmbl9uYW1lID0gc3RhY2tTdGFydEZ1bmN0aW9uLm5hbWU7XG4gICAgICB2YXIgaWR4ID0gb3V0LmluZGV4T2YoJ1xcbicgKyBmbl9uYW1lKTtcbiAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAvLyBvbmNlIHdlIGhhdmUgbG9jYXRlZCB0aGUgZnVuY3Rpb24gZnJhbWVcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzdHJpcCBvdXQgZXZlcnl0aGluZyBiZWZvcmUgaXQgKGFuZCBpdHMgbGluZSlcbiAgICAgICAgdmFyIG5leHRfbGluZSA9IG91dC5pbmRleE9mKCdcXG4nLCBpZHggKyAxKTtcbiAgICAgICAgb3V0ID0gb3V0LnN1YnN0cmluZyhuZXh0X2xpbmUgKyAxKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGFjayA9IG91dDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIGFzc2VydC5Bc3NlcnRpb25FcnJvciBpbnN0YW5jZW9mIEVycm9yXG51dGlsLmluaGVyaXRzKGFzc2VydC5Bc3NlcnRpb25FcnJvciwgRXJyb3IpO1xuXG5mdW5jdGlvbiByZXBsYWNlcihrZXksIHZhbHVlKSB7XG4gIGlmICh1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgIHJldHVybiAnJyArIHZhbHVlO1xuICB9XG4gIGlmICh1dGlsLmlzTnVtYmVyKHZhbHVlKSAmJiAhaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgaWYgKHV0aWwuaXNGdW5jdGlvbih2YWx1ZSkgfHwgdXRpbC5pc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIHRydW5jYXRlKHMsIG4pIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocykpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPCBuID8gcyA6IHMuc2xpY2UoMCwgbik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TWVzc2FnZShzZWxmKSB7XG4gIHJldHVybiB0cnVuY2F0ZShKU09OLnN0cmluZ2lmeShzZWxmLmFjdHVhbCwgcmVwbGFjZXIpLCAxMjgpICsgJyAnICtcbiAgICAgICAgIHNlbGYub3BlcmF0b3IgKyAnICcgK1xuICAgICAgICAgdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5leHBlY3RlZCwgcmVwbGFjZXIpLCAxMjgpO1xufVxuXG4vLyBBdCBwcmVzZW50IG9ubHkgdGhlIHRocmVlIGtleXMgbWVudGlvbmVkIGFib3ZlIGFyZSB1c2VkIGFuZFxuLy8gdW5kZXJzdG9vZCBieSB0aGUgc3BlYy4gSW1wbGVtZW50YXRpb25zIG9yIHN1YiBtb2R1bGVzIGNhbiBwYXNzXG4vLyBvdGhlciBrZXlzIHRvIHRoZSBBc3NlcnRpb25FcnJvcidzIGNvbnN0cnVjdG9yIC0gdGhleSB3aWxsIGJlXG4vLyBpZ25vcmVkLlxuXG4vLyAzLiBBbGwgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgbXVzdCB0aHJvdyBhbiBBc3NlcnRpb25FcnJvclxuLy8gd2hlbiBhIGNvcnJlc3BvbmRpbmcgY29uZGl0aW9uIGlzIG5vdCBtZXQsIHdpdGggYSBtZXNzYWdlIHRoYXRcbi8vIG1heSBiZSB1bmRlZmluZWQgaWYgbm90IHByb3ZpZGVkLiAgQWxsIGFzc2VydGlvbiBtZXRob2RzIHByb3ZpZGVcbi8vIGJvdGggdGhlIGFjdHVhbCBhbmQgZXhwZWN0ZWQgdmFsdWVzIHRvIHRoZSBhc3NlcnRpb24gZXJyb3IgZm9yXG4vLyBkaXNwbGF5IHB1cnBvc2VzLlxuXG5mdW5jdGlvbiBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsIG9wZXJhdG9yLCBzdGFja1N0YXJ0RnVuY3Rpb24pIHtcbiAgdGhyb3cgbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7XG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICBleHBlY3RlZDogZXhwZWN0ZWQsXG4gICAgb3BlcmF0b3I6IG9wZXJhdG9yLFxuICAgIHN0YWNrU3RhcnRGdW5jdGlvbjogc3RhY2tTdGFydEZ1bmN0aW9uXG4gIH0pO1xufVxuXG4vLyBFWFRFTlNJT04hIGFsbG93cyBmb3Igd2VsbCBiZWhhdmVkIGVycm9ycyBkZWZpbmVkIGVsc2V3aGVyZS5cbmFzc2VydC5mYWlsID0gZmFpbDtcblxuLy8gNC4gUHVyZSBhc3NlcnRpb24gdGVzdHMgd2hldGhlciBhIHZhbHVlIGlzIHRydXRoeSwgYXMgZGV0ZXJtaW5lZFxuLy8gYnkgISFndWFyZC5cbi8vIGFzc2VydC5vayhndWFyZCwgbWVzc2FnZV9vcHQpO1xuLy8gVGhpcyBzdGF0ZW1lbnQgaXMgZXF1aXZhbGVudCB0byBhc3NlcnQuZXF1YWwodHJ1ZSwgISFndWFyZCxcbi8vIG1lc3NhZ2Vfb3B0KTsuIFRvIHRlc3Qgc3RyaWN0bHkgZm9yIHRoZSB2YWx1ZSB0cnVlLCB1c2Vcbi8vIGFzc2VydC5zdHJpY3RFcXVhbCh0cnVlLCBndWFyZCwgbWVzc2FnZV9vcHQpOy5cblxuZnVuY3Rpb24gb2sodmFsdWUsIG1lc3NhZ2UpIHtcbiAgaWYgKCF2YWx1ZSkgZmFpbCh2YWx1ZSwgdHJ1ZSwgbWVzc2FnZSwgJz09JywgYXNzZXJ0Lm9rKTtcbn1cbmFzc2VydC5vayA9IG9rO1xuXG4vLyA1LiBUaGUgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHNoYWxsb3csIGNvZXJjaXZlIGVxdWFsaXR5IHdpdGhcbi8vID09LlxuLy8gYXNzZXJ0LmVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmVxdWFsID0gZnVuY3Rpb24gZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9IGV4cGVjdGVkKSBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5lcXVhbCk7XG59O1xuXG4vLyA2LiBUaGUgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igd2hldGhlciB0d28gb2JqZWN0cyBhcmUgbm90IGVxdWFsXG4vLyB3aXRoICE9IGFzc2VydC5ub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RFcXVhbCA9IGZ1bmN0aW9uIG5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9JywgYXNzZXJ0Lm5vdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gNy4gVGhlIGVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBhIGRlZXAgZXF1YWxpdHkgcmVsYXRpb24uXG4vLyBhc3NlcnQuZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmRlZXBFcXVhbCA9IGZ1bmN0aW9uIGRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmICghX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ2RlZXBFcXVhbCcsIGFzc2VydC5kZWVwRXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpIHtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmICh1dGlsLmlzQnVmZmVyKGFjdHVhbCkgJiYgdXRpbC5pc0J1ZmZlcihleHBlY3RlZCkpIHtcbiAgICBpZiAoYWN0dWFsLmxlbmd0aCAhPSBleHBlY3RlZC5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0dWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYWN0dWFsW2ldICE9PSBleHBlY3RlZFtpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuXG4gIC8vIDcuMi4gSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgRGF0ZSBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgRGF0ZSBvYmplY3QgdGhhdCByZWZlcnMgdG8gdGhlIHNhbWUgdGltZS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzRGF0ZShhY3R1YWwpICYmIHV0aWwuaXNEYXRlKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIFJlZ0V4cCBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgUmVnRXhwIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNvdXJjZSBhbmRcbiAgLy8gcHJvcGVydGllcyAoYGdsb2JhbGAsIGBtdWx0aWxpbmVgLCBgbGFzdEluZGV4YCwgYGlnbm9yZUNhc2VgKS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzUmVnRXhwKGFjdHVhbCkgJiYgdXRpbC5pc1JlZ0V4cChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLnNvdXJjZSA9PT0gZXhwZWN0ZWQuc291cmNlICYmXG4gICAgICAgICAgIGFjdHVhbC5nbG9iYWwgPT09IGV4cGVjdGVkLmdsb2JhbCAmJlxuICAgICAgICAgICBhY3R1YWwubXVsdGlsaW5lID09PSBleHBlY3RlZC5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgYWN0dWFsLmxhc3RJbmRleCA9PT0gZXhwZWN0ZWQubGFzdEluZGV4ICYmXG4gICAgICAgICAgIGFjdHVhbC5pZ25vcmVDYXNlID09PSBleHBlY3RlZC5pZ25vcmVDYXNlO1xuXG4gIC8vIDcuNC4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICghdXRpbC5pc09iamVjdChhY3R1YWwpICYmICF1dGlsLmlzT2JqZWN0KGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gNy41IEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNBcmd1bWVudHMob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYikge1xuICBpZiAodXRpbC5pc051bGxPclVuZGVmaW5lZChhKSB8fCB1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG4gIC8vIGlmIG9uZSBpcyBhIHByaW1pdGl2ZSwgdGhlIG90aGVyIG11c3QgYmUgc2FtZVxuICBpZiAodXRpbC5pc1ByaW1pdGl2ZShhKSB8fCB1dGlsLmlzUHJpbWl0aXZlKGIpKSB7XG4gICAgcmV0dXJuIGEgPT09IGI7XG4gIH1cbiAgdmFyIGFJc0FyZ3MgPSBpc0FyZ3VtZW50cyhhKSxcbiAgICAgIGJJc0FyZ3MgPSBpc0FyZ3VtZW50cyhiKTtcbiAgaWYgKChhSXNBcmdzICYmICFiSXNBcmdzKSB8fCAoIWFJc0FyZ3MgJiYgYklzQXJncykpXG4gICAgcmV0dXJuIGZhbHNlO1xuICBpZiAoYUlzQXJncykge1xuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIF9kZWVwRXF1YWwoYSwgYik7XG4gIH1cbiAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgIGtiID0gb2JqZWN0S2V5cyhiKSxcbiAgICAgIGtleSwgaTtcbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghX2RlZXBFcXVhbChhW2tleV0sIGJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gOC4gVGhlIG5vbi1lcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgZm9yIGFueSBkZWVwIGluZXF1YWxpdHkuXG4vLyBhc3NlcnQubm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdERlZXBFcXVhbCA9IGZ1bmN0aW9uIG5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnbm90RGVlcEVxdWFsJywgYXNzZXJ0Lm5vdERlZXBFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDkuIFRoZSBzdHJpY3QgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHN0cmljdCBlcXVhbGl0eSwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuc3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBzdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT09JywgYXNzZXJ0LnN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gMTAuIFRoZSBzdHJpY3Qgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igc3RyaWN0IGluZXF1YWxpdHksIGFzXG4vLyBkZXRlcm1pbmVkIGJ5ICE9PS4gIGFzc2VydC5ub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RTdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIG5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPT0nLCBhc3NlcnQubm90U3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIGlmICghYWN0dWFsIHx8ICFleHBlY3RlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXhwZWN0ZWQpID09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgcmV0dXJuIGV4cGVjdGVkLnRlc3QoYWN0dWFsKTtcbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGV4cGVjdGVkLmNhbGwoe30sIGFjdHVhbCkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX3Rocm93cyhzaG91bGRUaHJvdywgYmxvY2ssIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIHZhciBhY3R1YWw7XG5cbiAgaWYgKHV0aWwuaXNTdHJpbmcoZXhwZWN0ZWQpKSB7XG4gICAgbWVzc2FnZSA9IGV4cGVjdGVkO1xuICAgIGV4cGVjdGVkID0gbnVsbDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgYmxvY2soKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGFjdHVhbCA9IGU7XG4gIH1cblxuICBtZXNzYWdlID0gKGV4cGVjdGVkICYmIGV4cGVjdGVkLm5hbWUgPyAnICgnICsgZXhwZWN0ZWQubmFtZSArICcpLicgOiAnLicpICtcbiAgICAgICAgICAgIChtZXNzYWdlID8gJyAnICsgbWVzc2FnZSA6ICcuJyk7XG5cbiAgaWYgKHNob3VsZFRocm93ICYmICFhY3R1YWwpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdNaXNzaW5nIGV4cGVjdGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICghc2hvdWxkVGhyb3cgJiYgZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdHb3QgdW53YW50ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKChzaG91bGRUaHJvdyAmJiBhY3R1YWwgJiYgZXhwZWN0ZWQgJiZcbiAgICAgICFleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkgfHwgKCFzaG91bGRUaHJvdyAmJiBhY3R1YWwpKSB7XG4gICAgdGhyb3cgYWN0dWFsO1xuICB9XG59XG5cbi8vIDExLiBFeHBlY3RlZCB0byB0aHJvdyBhbiBlcnJvcjpcbi8vIGFzc2VydC50aHJvd3MoYmxvY2ssIEVycm9yX29wdCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQudGhyb3dzID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL2Vycm9yLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3MuYXBwbHkodGhpcywgW3RydWVdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG4vLyBFWFRFTlNJT04hIFRoaXMgaXMgYW5ub3lpbmcgdG8gd3JpdGUgb3V0c2lkZSB0aGlzIG1vZHVsZS5cbmFzc2VydC5kb2VzTm90VGhyb3cgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFtmYWxzZV0uY29uY2F0KHBTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbn07XG5cbmFzc2VydC5pZkVycm9yID0gZnVuY3Rpb24oZXJyKSB7IGlmIChlcnIpIHt0aHJvdyBlcnI7fX07XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qIVxuICogVVJJLmpzIC0gTXV0YXRpbmcgVVJMc1xuICogSVB2NiBTdXBwb3J0XG4gKlxuICogVmVyc2lvbjogMS4xNy4wXG4gKlxuICogQXV0aG9yOiBSb2RuZXkgUmVobVxuICogV2ViOiBodHRwOi8vbWVkaWFsaXplLmdpdGh1Yi5pby9VUkkuanMvXG4gKlxuICogTGljZW5zZWQgdW5kZXJcbiAqICAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZVxuICogICBHUEwgdjMgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0dQTC0zLjBcbiAqXG4gKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QuSVB2NiA9IGZhY3Rvcnkocm9vdCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKHJvb3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gIHZhciBfaW4gPSBcImZlODA6MDAwMDowMDAwOjAwMDA6MDIwNDo2MWZmOmZlOWQ6ZjE1NlwiO1xuICB2YXIgX291dCA9IElQdjYuYmVzdChfaW4pO1xuICB2YXIgX2V4cGVjdGVkID0gXCJmZTgwOjoyMDQ6NjFmZjpmZTlkOmYxNTZcIjtcblxuICBjb25zb2xlLmxvZyhfaW4sIF9vdXQsIF9leHBlY3RlZCwgX291dCA9PT0gX2V4cGVjdGVkKTtcbiAgKi9cblxuICAvLyBzYXZlIGN1cnJlbnQgSVB2NiB2YXJpYWJsZSwgaWYgYW55XG4gIHZhciBfSVB2NiA9IHJvb3QgJiYgcm9vdC5JUHY2O1xuXG4gIGZ1bmN0aW9uIGJlc3RQcmVzZW50YXRpb24oYWRkcmVzcykge1xuICAgIC8vIGJhc2VkIG9uOlxuICAgIC8vIEphdmFzY3JpcHQgdG8gdGVzdCBhbiBJUHY2IGFkZHJlc3MgZm9yIHByb3BlciBmb3JtYXQsIGFuZCB0b1xuICAgIC8vIHByZXNlbnQgdGhlIFwiYmVzdCB0ZXh0IHJlcHJlc2VudGF0aW9uXCIgYWNjb3JkaW5nIHRvIElFVEYgRHJhZnQgUkZDIGF0XG4gICAgLy8gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaWV0Zi02bWFuLXRleHQtYWRkci1yZXByZXNlbnRhdGlvbi0wNFxuICAgIC8vIDggRmViIDIwMTAgUmljaCBCcm93biwgRGFydHdhcmUsIExMQ1xuICAgIC8vIFBsZWFzZSBmZWVsIGZyZWUgdG8gdXNlIHRoaXMgY29kZSBhcyBsb25nIGFzIHlvdSBwcm92aWRlIGEgbGluayB0b1xuICAgIC8vIGh0dHA6Ly93d3cuaW50ZXJtYXBwZXIuY29tXG4gICAgLy8gaHR0cDovL2ludGVybWFwcGVyLmNvbS9zdXBwb3J0L3Rvb2xzL0lQVjYtVmFsaWRhdG9yLmFzcHhcbiAgICAvLyBodHRwOi8vZG93bmxvYWQuZGFydHdhcmUuY29tL3RoaXJkcGFydHkvaXB2NnZhbGlkYXRvci5qc1xuXG4gICAgdmFyIF9hZGRyZXNzID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBzZWdtZW50cyA9IF9hZGRyZXNzLnNwbGl0KCc6Jyk7XG4gICAgdmFyIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcbiAgICB2YXIgdG90YWwgPSA4O1xuXG4gICAgLy8gdHJpbSBjb2xvbnMgKDo6IG9yIDo6YTpiOmPigKYgb3Ig4oCmYTpiOmM6OilcbiAgICBpZiAoc2VnbWVudHNbMF0gPT09ICcnICYmIHNlZ21lbnRzWzFdID09PSAnJyAmJiBzZWdtZW50c1syXSA9PT0gJycpIHtcbiAgICAgIC8vIG11c3QgaGF2ZSBiZWVuIDo6XG4gICAgICAvLyByZW1vdmUgZmlyc3QgdHdvIGl0ZW1zXG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgICAgc2VnbWVudHMuc2hpZnQoKTtcbiAgICB9IGVsc2UgaWYgKHNlZ21lbnRzWzBdID09PSAnJyAmJiBzZWdtZW50c1sxXSA9PT0gJycpIHtcbiAgICAgIC8vIG11c3QgaGF2ZSBiZWVuIDo6eHh4eFxuICAgICAgLy8gcmVtb3ZlIHRoZSBmaXJzdCBpdGVtXG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudHNbbGVuZ3RoIC0gMV0gPT09ICcnICYmIHNlZ21lbnRzW2xlbmd0aCAtIDJdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4geHh4eDo6XG4gICAgICBzZWdtZW50cy5wb3AoKTtcbiAgICB9XG5cbiAgICBsZW5ndGggPSBzZWdtZW50cy5sZW5ndGg7XG5cbiAgICAvLyBhZGp1c3QgdG90YWwgc2VnbWVudHMgZm9yIElQdjQgdHJhaWxlclxuICAgIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXS5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAvLyBmb3VuZCBhIFwiLlwiIHdoaWNoIG1lYW5zIElQdjRcbiAgICAgIHRvdGFsID0gNztcbiAgICB9XG5cbiAgICAvLyBmaWxsIGVtcHR5IHNlZ21lbnRzIHRoZW0gd2l0aCBcIjAwMDBcIlxuICAgIHZhciBwb3M7XG4gICAgZm9yIChwb3MgPSAwOyBwb3MgPCBsZW5ndGg7IHBvcysrKSB7XG4gICAgICBpZiAoc2VnbWVudHNbcG9zXSA9PT0gJycpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvcyA8IHRvdGFsKSB7XG4gICAgICBzZWdtZW50cy5zcGxpY2UocG9zLCAxLCAnMDAwMCcpO1xuICAgICAgd2hpbGUgKHNlZ21lbnRzLmxlbmd0aCA8IHRvdGFsKSB7XG4gICAgICAgIHNlZ21lbnRzLnNwbGljZShwb3MsIDAsICcwMDAwJyk7XG4gICAgICB9XG5cbiAgICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBzdHJpcCBsZWFkaW5nIHplcm9zXG4gICAgdmFyIF9zZWdtZW50cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsOyBpKyspIHtcbiAgICAgIF9zZWdtZW50cyA9IHNlZ21lbnRzW2ldLnNwbGl0KCcnKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMyA7IGorKykge1xuICAgICAgICBpZiAoX3NlZ21lbnRzWzBdID09PSAnMCcgJiYgX3NlZ21lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBfc2VnbWVudHMuc3BsaWNlKDAsMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VnbWVudHNbaV0gPSBfc2VnbWVudHMuam9pbignJyk7XG4gICAgfVxuXG4gICAgLy8gZmluZCBsb25nZXN0IHNlcXVlbmNlIG9mIHplcm9lcyBhbmQgY29hbGVzY2UgdGhlbSBpbnRvIG9uZSBzZWdtZW50XG4gICAgdmFyIGJlc3QgPSAtMTtcbiAgICB2YXIgX2Jlc3QgPSAwO1xuICAgIHZhciBfY3VycmVudCA9IDA7XG4gICAgdmFyIGN1cnJlbnQgPSAtMTtcbiAgICB2YXIgaW56ZXJvZXMgPSBmYWxzZTtcbiAgICAvLyBpOyBhbHJlYWR5IGRlY2xhcmVkXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgaWYgKGluemVyb2VzKSB7XG4gICAgICAgIGlmIChzZWdtZW50c1tpXSA9PT0gJzAnKSB7XG4gICAgICAgICAgX2N1cnJlbnQgKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnplcm9lcyA9IGZhbHNlO1xuICAgICAgICAgIGlmIChfY3VycmVudCA+IF9iZXN0KSB7XG4gICAgICAgICAgICBiZXN0ID0gY3VycmVudDtcbiAgICAgICAgICAgIF9iZXN0ID0gX2N1cnJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2VnbWVudHNbaV0gPT09ICcwJykge1xuICAgICAgICAgIGluemVyb2VzID0gdHJ1ZTtcbiAgICAgICAgICBjdXJyZW50ID0gaTtcbiAgICAgICAgICBfY3VycmVudCA9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX2N1cnJlbnQgPiBfYmVzdCkge1xuICAgICAgYmVzdCA9IGN1cnJlbnQ7XG4gICAgICBfYmVzdCA9IF9jdXJyZW50O1xuICAgIH1cblxuICAgIGlmIChfYmVzdCA+IDEpIHtcbiAgICAgIHNlZ21lbnRzLnNwbGljZShiZXN0LCBfYmVzdCwgJycpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIC8vIGFzc2VtYmxlIHJlbWFpbmluZyBzZWdtZW50c1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICBpZiAoc2VnbWVudHNbMF0gPT09ICcnKSAge1xuICAgICAgcmVzdWx0ID0gJzonO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0ICs9IHNlZ21lbnRzW2ldO1xuICAgICAgaWYgKGkgPT09IGxlbmd0aCAtIDEpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdCArPSAnOic7XG4gICAgfVxuXG4gICAgaWYgKHNlZ21lbnRzW2xlbmd0aCAtIDFdID09PSAnJykge1xuICAgICAgcmVzdWx0ICs9ICc6JztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbm9Db25mbGljdCgpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUgKi9cbiAgICBpZiAocm9vdC5JUHY2ID09PSB0aGlzKSB7XG4gICAgICByb290LklQdjYgPSBfSVB2NjtcbiAgICB9XG4gIFxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiZXN0OiBiZXN0UHJlc2VudGF0aW9uLFxuICAgIG5vQ29uZmxpY3Q6IG5vQ29uZmxpY3RcbiAgfTtcbn0pKTtcbiIsIi8qIVxuICogVVJJLmpzIC0gTXV0YXRpbmcgVVJMc1xuICogU2Vjb25kIExldmVsIERvbWFpbiAoU0xEKSBTdXBwb3J0XG4gKlxuICogVmVyc2lvbjogMS4xNy4wXG4gKlxuICogQXV0aG9yOiBSb2RuZXkgUmVobVxuICogV2ViOiBodHRwOi8vbWVkaWFsaXplLmdpdGh1Yi5pby9VUkkuanMvXG4gKlxuICogTGljZW5zZWQgdW5kZXJcbiAqICAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZVxuICogICBHUEwgdjMgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0dQTC0zLjBcbiAqXG4gKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zID0gZmFjdG9yeShyb290KTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAocm9vdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gc2F2ZSBjdXJyZW50IFNlY29uZExldmVsRG9tYWlucyB2YXJpYWJsZSwgaWYgYW55XG4gIHZhciBfU2Vjb25kTGV2ZWxEb21haW5zID0gcm9vdCAmJiByb290LlNlY29uZExldmVsRG9tYWlucztcblxuICB2YXIgU0xEID0ge1xuICAgIC8vIGxpc3Qgb2Yga25vd24gU2Vjb25kIExldmVsIERvbWFpbnNcbiAgICAvLyBjb252ZXJ0ZWQgbGlzdCBvZiBTTERzIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2dhdmluZ21pbGxlci9zZWNvbmQtbGV2ZWwtZG9tYWluc1xuICAgIC8vIC0tLS1cbiAgICAvLyBwdWJsaWNzdWZmaXgub3JnIGlzIG1vcmUgY3VycmVudCBhbmQgYWN0dWFsbHkgdXNlZCBieSBhIGNvdXBsZSBvZiBicm93c2VycyBpbnRlcm5hbGx5LlxuICAgIC8vIGRvd25zaWRlIGlzIGl0IGFsc28gY29udGFpbnMgZG9tYWlucyBsaWtlIFwiZHluZG5zLm9yZ1wiIC0gd2hpY2ggaXMgZmluZSBmb3IgdGhlIHNlY3VyaXR5XG4gICAgLy8gaXNzdWVzIGJyb3dzZXIgaGF2ZSB0byBkZWFsIHdpdGggKFNPUCBmb3IgY29va2llcywgZXRjKSAtIGJ1dCBpcyB3YXkgb3ZlcmJvYXJkIGZvciBVUkkuanNcbiAgICAvLyAtLS0tXG4gICAgbGlzdDoge1xuICAgICAgJ2FjJzonIGNvbSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdhZSc6JyBhYyBjbyBnb3YgbWlsIG5hbWUgbmV0IG9yZyBwcm8gc2NoICcsXG4gICAgICAnYWYnOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2FsJzonIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnYW8nOicgY28gZWQgZ3YgaXQgb2cgcGIgJyxcbiAgICAgICdhcic6JyBjb20gZWR1IGdvYiBnb3YgaW50IG1pbCBuZXQgb3JnIHR1ciAnLFxuICAgICAgJ2F0JzonIGFjIGNvIGd2IG9yICcsXG4gICAgICAnYXUnOicgYXNuIGNvbSBjc2lybyBlZHUgZ292IGlkIG5ldCBvcmcgJyxcbiAgICAgICdiYSc6JyBjbyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBycyB1bmJpIHVubW8gdW5zYSB1bnR6IHVuemUgJyxcbiAgICAgICdiYic6JyBiaXogY28gY29tIGVkdSBnb3YgaW5mbyBuZXQgb3JnIHN0b3JlIHR2ICcsXG4gICAgICAnYmgnOicgYml6IGNjIGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ2JuJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdibyc6JyBjb20gZWR1IGdvYiBnb3YgaW50IG1pbCBuZXQgb3JnIHR2ICcsXG4gICAgICAnYnInOicgYWRtIGFkdiBhZ3IgYW0gYXJxIGFydCBhdG8gYiBiaW8gYmxvZyBibWQgY2ltIGNuZyBjbnQgY29tIGNvb3AgZWNuIGVkdSBlbmcgZXNwIGV0YyBldGkgZmFyIGZsb2cgZm0gZm5kIGZvdCBmc3QgZzEyIGdnZiBnb3YgaW1iIGluZCBpbmYgam9yIGp1cyBsZWwgbWF0IG1lZCBtaWwgbXVzIG5ldCBub20gbm90IG50ciBvZG8gb3JnIHBwZyBwcm8gcHNjIHBzaSBxc2wgcmVjIHNsZyBzcnYgdG1wIHRyZCB0dXIgdHYgdmV0IHZsb2cgd2lraSB6bGcgJyxcbiAgICAgICdicyc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnYnonOicgZHUgZXQgb20gb3YgcmcgJyxcbiAgICAgICdjYSc6JyBhYiBiYyBtYiBuYiBuZiBubCBucyBudCBudSBvbiBwZSBxYyBzayB5ayAnLFxuICAgICAgJ2NrJzonIGJpeiBjbyBlZHUgZ2VuIGdvdiBpbmZvIG5ldCBvcmcgJyxcbiAgICAgICdjbic6JyBhYyBhaCBiaiBjb20gY3EgZWR1IGZqIGdkIGdvdiBncyBneCBneiBoYSBoYiBoZSBoaSBobCBobiBqbCBqcyBqeCBsbiBtaWwgbmV0IG5tIG54IG9yZyBxaCBzYyBzZCBzaCBzbiBzeCB0aiB0dyB4aiB4eiB5biB6aiAnLFxuICAgICAgJ2NvJzonIGNvbSBlZHUgZ292IG1pbCBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ2NyJzonIGFjIGMgY28gZWQgZmkgZ28gb3Igc2EgJyxcbiAgICAgICdjeSc6JyBhYyBiaXogY29tIGVrbG9nZXMgZ292IGx0ZCBuYW1lIG5ldCBvcmcgcGFybGlhbWVudCBwcmVzcyBwcm8gdG0gJyxcbiAgICAgICdkbyc6JyBhcnQgY29tIGVkdSBnb2IgZ292IG1pbCBuZXQgb3JnIHNsZCB3ZWIgJyxcbiAgICAgICdkeic6JyBhcnQgYXNzbyBjb20gZWR1IGdvdiBuZXQgb3JnIHBvbCAnLFxuICAgICAgJ2VjJzonIGNvbSBlZHUgZmluIGdvdiBpbmZvIG1lZCBtaWwgbmV0IG9yZyBwcm8gJyxcbiAgICAgICdlZyc6JyBjb20gZWR1IGV1biBnb3YgbWlsIG5hbWUgbmV0IG9yZyBzY2kgJyxcbiAgICAgICdlcic6JyBjb20gZWR1IGdvdiBpbmQgbWlsIG5ldCBvcmcgcm9jaGVzdCB3ICcsXG4gICAgICAnZXMnOicgY29tIGVkdSBnb2Igbm9tIG9yZyAnLFxuICAgICAgJ2V0JzonIGJpeiBjb20gZWR1IGdvdiBpbmZvIG5hbWUgbmV0IG9yZyAnLFxuICAgICAgJ2ZqJzonIGFjIGJpeiBjb20gaW5mbyBtaWwgbmFtZSBuZXQgb3JnIHBybyAnLFxuICAgICAgJ2ZrJzonIGFjIGNvIGdvdiBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ2ZyJzonIGFzc28gY29tIGYgZ291diBub20gcHJkIHByZXNzZSB0bSAnLFxuICAgICAgJ2dnJzonIGNvIG5ldCBvcmcgJyxcbiAgICAgICdnaCc6JyBjb20gZWR1IGdvdiBtaWwgb3JnICcsXG4gICAgICAnZ24nOicgYWMgY29tIGdvdiBuZXQgb3JnICcsXG4gICAgICAnZ3InOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdndCc6JyBjb20gZWR1IGdvYiBpbmQgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdndSc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnaGsnOicgY29tIGVkdSBnb3YgaWR2IG5ldCBvcmcgJyxcbiAgICAgICdodSc6JyAyMDAwIGFncmFyIGJvbHQgY2FzaW5vIGNpdHkgY28gZXJvdGljYSBlcm90aWthIGZpbG0gZm9ydW0gZ2FtZXMgaG90ZWwgaW5mbyBpbmdhdGxhbiBqb2dhc3oga29ueXZlbG8gbGFrYXMgbWVkaWEgbmV3cyBvcmcgcHJpdiByZWtsYW0gc2V4IHNob3Agc3BvcnQgc3VsaSBzemV4IHRtIHRvenNkZSB1dGF6YXMgdmlkZW8gJyxcbiAgICAgICdpZCc6JyBhYyBjbyBnbyBtaWwgbmV0IG9yIHNjaCB3ZWIgJyxcbiAgICAgICdpbCc6JyBhYyBjbyBnb3YgaWRmIGsxMiBtdW5pIG5ldCBvcmcgJyxcbiAgICAgICdpbic6JyBhYyBjbyBlZHUgZXJuZXQgZmlybSBnZW4gZ292IGkgaW5kIG1pbCBuZXQgbmljIG9yZyByZXMgJyxcbiAgICAgICdpcSc6JyBjb20gZWR1IGdvdiBpIG1pbCBuZXQgb3JnICcsXG4gICAgICAnaXInOicgYWMgY28gZG5zc2VjIGdvdiBpIGlkIG5ldCBvcmcgc2NoICcsXG4gICAgICAnaXQnOicgZWR1IGdvdiAnLFxuICAgICAgJ2plJzonIGNvIG5ldCBvcmcgJyxcbiAgICAgICdqbyc6JyBjb20gZWR1IGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ2pwJzonIGFjIGFkIGNvIGVkIGdvIGdyIGxnIG5lIG9yICcsXG4gICAgICAna2UnOicgYWMgY28gZ28gaW5mbyBtZSBtb2JpIG5lIG9yIHNjICcsXG4gICAgICAna2gnOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgcGVyICcsXG4gICAgICAna2knOicgYml6IGNvbSBkZSBlZHUgZ292IGluZm8gbW9iIG5ldCBvcmcgdGVsICcsXG4gICAgICAna20nOicgYXNzbyBjb20gY29vcCBlZHUgZ291diBrIG1lZGVjaW4gbWlsIG5vbSBub3RhaXJlcyBwaGFybWFjaWVucyBwcmVzc2UgdG0gdmV0ZXJpbmFpcmUgJyxcbiAgICAgICdrbic6JyBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdrcic6JyBhYyBidXNhbiBjaHVuZ2J1ayBjaHVuZ25hbSBjbyBkYWVndSBkYWVqZW9uIGVzIGdhbmd3b24gZ28gZ3dhbmdqdSBneWVvbmdidWsgZ3llb25nZ2kgZ3llb25nbmFtIGhzIGluY2hlb24gamVqdSBqZW9uYnVrIGplb25uYW0gayBrZyBtaWwgbXMgbmUgb3IgcGUgcmUgc2Mgc2VvdWwgdWxzYW4gJyxcbiAgICAgICdrdyc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAna3knOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2t6JzonIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnbGInOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2xrJzonIGFzc24gY29tIGVkdSBnb3YgZ3JwIGhvdGVsIGludCBsdGQgbmV0IG5nbyBvcmcgc2NoIHNvYyB3ZWIgJyxcbiAgICAgICdscic6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbHYnOicgYXNuIGNvbSBjb25mIGVkdSBnb3YgaWQgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdseSc6JyBjb20gZWR1IGdvdiBpZCBtZWQgbmV0IG9yZyBwbGMgc2NoICcsXG4gICAgICAnbWEnOicgYWMgY28gZ292IG0gbmV0IG9yZyBwcmVzcyAnLFxuICAgICAgJ21jJzonIGFzc28gdG0gJyxcbiAgICAgICdtZSc6JyBhYyBjbyBlZHUgZ292IGl0cyBuZXQgb3JnIHByaXYgJyxcbiAgICAgICdtZyc6JyBjb20gZWR1IGdvdiBtaWwgbm9tIG9yZyBwcmQgdG0gJyxcbiAgICAgICdtayc6JyBjb20gZWR1IGdvdiBpbmYgbmFtZSBuZXQgb3JnIHBybyAnLFxuICAgICAgJ21sJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgcHJlc3NlICcsXG4gICAgICAnbW4nOicgZWR1IGdvdiBvcmcgJyxcbiAgICAgICdtbyc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbXQnOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ212JzonIGFlcm8gYml6IGNvbSBjb29wIGVkdSBnb3YgaW5mbyBpbnQgbWlsIG11c2V1bSBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnbXcnOicgYWMgY28gY29tIGNvb3AgZWR1IGdvdiBpbnQgbXVzZXVtIG5ldCBvcmcgJyxcbiAgICAgICdteCc6JyBjb20gZWR1IGdvYiBuZXQgb3JnICcsXG4gICAgICAnbXknOicgY29tIGVkdSBnb3YgbWlsIG5hbWUgbmV0IG9yZyBzY2ggJyxcbiAgICAgICduZic6JyBhcnRzIGNvbSBmaXJtIGluZm8gbmV0IG90aGVyIHBlciByZWMgc3RvcmUgd2ViICcsXG4gICAgICAnbmcnOicgYml6IGNvbSBlZHUgZ292IG1pbCBtb2JpIG5hbWUgbmV0IG9yZyBzY2ggJyxcbiAgICAgICduaSc6JyBhYyBjbyBjb20gZWR1IGdvYiBtaWwgbmV0IG5vbSBvcmcgJyxcbiAgICAgICducCc6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ25yJzonIGJpeiBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgJyxcbiAgICAgICdvbSc6JyBhYyBiaXogY28gY29tIGVkdSBnb3YgbWVkIG1pbCBtdXNldW0gbmV0IG9yZyBwcm8gc2NoICcsXG4gICAgICAncGUnOicgY29tIGVkdSBnb2IgbWlsIG5ldCBub20gb3JnIHNsZCAnLFxuICAgICAgJ3BoJzonIGNvbSBlZHUgZ292IGkgbWlsIG5ldCBuZ28gb3JnICcsXG4gICAgICAncGsnOicgYml6IGNvbSBlZHUgZmFtIGdvYiBnb2sgZ29uIGdvcCBnb3MgZ292IG5ldCBvcmcgd2ViICcsXG4gICAgICAncGwnOicgYXJ0IGJpYWx5c3RvayBiaXogY29tIGVkdSBnZGEgZ2RhbnNrIGdvcnpvdyBnb3YgaW5mbyBrYXRvd2ljZSBrcmFrb3cgbG9keiBsdWJsaW4gbWlsIG5ldCBuZ28gb2xzenR5biBvcmcgcG96bmFuIHB3ciByYWRvbSBzbHVwc2sgc3pjemVjaW4gdG9ydW4gd2Fyc3phd2Egd2F3IHdyb2Mgd3JvY2xhdyB6Z29yYSAnLFxuICAgICAgJ3ByJzonIGFjIGJpeiBjb20gZWR1IGVzdCBnb3YgaW5mbyBpc2xhIG5hbWUgbmV0IG9yZyBwcm8gcHJvZiAnLFxuICAgICAgJ3BzJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgcGxvIHNlYyAnLFxuICAgICAgJ3B3JzonIGJlbGF1IGNvIGVkIGdvIG5lIG9yICcsXG4gICAgICAncm8nOicgYXJ0cyBjb20gZmlybSBpbmZvIG5vbSBudCBvcmcgcmVjIHN0b3JlIHRtIHd3dyAnLFxuICAgICAgJ3JzJzonIGFjIGNvIGVkdSBnb3YgaW4gb3JnICcsXG4gICAgICAnc2InOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3NjJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdzaCc6JyBjbyBjb20gZWR1IGdvdiBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ3NsJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdzdCc6JyBjbyBjb20gY29uc3VsYWRvIGVkdSBlbWJhaXhhZGEgZ292IG1pbCBuZXQgb3JnIHByaW5jaXBlIHNhb3RvbWUgc3RvcmUgJyxcbiAgICAgICdzdic6JyBjb20gZWR1IGdvYiBvcmcgcmVkICcsXG4gICAgICAnc3onOicgYWMgY28gb3JnICcsXG4gICAgICAndHInOicgYXYgYmJzIGJlbCBiaXogY29tIGRyIGVkdSBnZW4gZ292IGluZm8gazEyIG5hbWUgbmV0IG9yZyBwb2wgdGVsIHRzayB0diB3ZWIgJyxcbiAgICAgICd0dCc6JyBhZXJvIGJpeiBjYXQgY28gY29tIGNvb3AgZWR1IGdvdiBpbmZvIGludCBqb2JzIG1pbCBtb2JpIG11c2V1bSBuYW1lIG5ldCBvcmcgcHJvIHRlbCB0cmF2ZWwgJyxcbiAgICAgICd0dyc6JyBjbHViIGNvbSBlYml6IGVkdSBnYW1lIGdvdiBpZHYgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdtdSc6JyBhYyBjbyBjb20gZ292IG5ldCBvciBvcmcgJyxcbiAgICAgICdteic6JyBhYyBjbyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ25hJzonIGNvIGNvbSAnLFxuICAgICAgJ256JzonIGFjIGNvIGNyaSBnZWVrIGdlbiBnb3Z0IGhlYWx0aCBpd2kgbWFvcmkgbWlsIG5ldCBvcmcgcGFybGlhbWVudCBzY2hvb2wgJyxcbiAgICAgICdwYSc6JyBhYm8gYWMgY29tIGVkdSBnb2IgaW5nIG1lZCBuZXQgbm9tIG9yZyBzbGQgJyxcbiAgICAgICdwdCc6JyBjb20gZWR1IGdvdiBpbnQgbmV0IG5vbWUgb3JnIHB1YmwgJyxcbiAgICAgICdweSc6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ3FhJzonIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAncmUnOicgYXNzbyBjb20gbm9tICcsXG4gICAgICAncnUnOicgYWMgYWR5Z2V5YSBhbHRhaSBhbXVyIGFya2hhbmdlbHNrIGFzdHJha2hhbiBiYXNoa2lyaWEgYmVsZ29yb2QgYmlyIGJyeWFuc2sgYnVyeWF0aWEgY2JnIGNoZWwgY2hlbHlhYmluc2sgY2hpdGEgY2h1a290a2EgY2h1dmFzaGlhIGNvbSBkYWdlc3RhbiBlLWJ1cmcgZWR1IGdvdiBncm96bnkgaW50IGlya3V0c2sgaXZhbm92byBpemhldnNrIGphciBqb3Noa2FyLW9sYSBrYWxteWtpYSBrYWx1Z2Ega2FtY2hhdGthIGthcmVsaWEga2F6YW4ga2NociBrZW1lcm92byBraGFiYXJvdnNrIGtoYWthc3NpYSBraHYga2lyb3Yga29lbmlnIGtvbWkga29zdHJvbWEga3Jhbm95YXJzayBrdWJhbiBrdXJnYW4ga3Vyc2sgbGlwZXRzayBtYWdhZGFuIG1hcmkgbWFyaS1lbCBtYXJpbmUgbWlsIG1vcmRvdmlhIG1vc3JlZyBtc2sgbXVybWFuc2sgbmFsY2hpayBuZXQgbm5vdiBub3Ygbm92b3NpYmlyc2sgbnNrIG9tc2sgb3JlbmJ1cmcgb3JnIG9yeW9sIHBlbnphIHBlcm0gcHAgcHNrb3YgcHR6IHJuZCByeWF6YW4gc2FraGFsaW4gc2FtYXJhIHNhcmF0b3Ygc2ltYmlyc2sgc21vbGVuc2sgc3BiIHN0YXZyb3BvbCBzdHYgc3VyZ3V0IHRhbWJvdiB0YXRhcnN0YW4gdG9tIHRvbXNrIHRzYXJpdHN5biB0c2sgdHVsYSB0dXZhIHR2ZXIgdHl1bWVuIHVkbSB1ZG11cnRpYSB1bGFuLXVkZSB2bGFkaWthdmtheiB2bGFkaW1pciB2bGFkaXZvc3RvayB2b2xnb2dyYWQgdm9sb2dkYSB2b3JvbmV6aCB2cm4gdnlhdGthIHlha3V0aWEgeWFtYWwgeWVrYXRlcmluYnVyZyB5dXpobm8tc2FraGFsaW5zayAnLFxuICAgICAgJ3J3JzonIGFjIGNvIGNvbSBlZHUgZ291diBnb3YgaW50IG1pbCBuZXQgJyxcbiAgICAgICdzYSc6JyBjb20gZWR1IGdvdiBtZWQgbmV0IG9yZyBwdWIgc2NoICcsXG4gICAgICAnc2QnOicgY29tIGVkdSBnb3YgaW5mbyBtZWQgbmV0IG9yZyB0diAnLFxuICAgICAgJ3NlJzonIGEgYWMgYiBiZCBjIGQgZSBmIGcgaCBpIGsgbCBtIG4gbyBvcmcgcCBwYXJ0aSBwcCBwcmVzcyByIHMgdCB0bSB1IHcgeCB5IHogJyxcbiAgICAgICdzZyc6JyBjb20gZWR1IGdvdiBpZG4gbmV0IG9yZyBwZXIgJyxcbiAgICAgICdzbic6JyBhcnQgY29tIGVkdSBnb3V2IG9yZyBwZXJzbyB1bml2ICcsXG4gICAgICAnc3knOicgY29tIGVkdSBnb3YgbWlsIG5ldCBuZXdzIG9yZyAnLFxuICAgICAgJ3RoJzonIGFjIGNvIGdvIGluIG1pIG5ldCBvciAnLFxuICAgICAgJ3RqJzonIGFjIGJpeiBjbyBjb20gZWR1IGdvIGdvdiBpbmZvIGludCBtaWwgbmFtZSBuZXQgbmljIG9yZyB0ZXN0IHdlYiAnLFxuICAgICAgJ3RuJzonIGFncmluZXQgY29tIGRlZmVuc2UgZWR1bmV0IGVucyBmaW4gZ292IGluZCBpbmZvIGludGwgbWluY29tIG5hdCBuZXQgb3JnIHBlcnNvIHJucnQgcm5zIHJudSB0b3VyaXNtICcsXG4gICAgICAndHonOicgYWMgY28gZ28gbmUgb3IgJyxcbiAgICAgICd1YSc6JyBiaXogY2hlcmthc3N5IGNoZXJuaWdvdiBjaGVybm92dHN5IGNrIGNuIGNvIGNvbSBjcmltZWEgY3YgZG4gZG5lcHJvcGV0cm92c2sgZG9uZXRzayBkcCBlZHUgZ292IGlmIGluIGl2YW5vLWZyYW5raXZzayBraCBraGFya292IGtoZXJzb24ga2htZWxuaXRza2l5IGtpZXYga2lyb3ZvZ3JhZCBrbSBrciBrcyBrdiBsZyBsdWdhbnNrIGx1dHNrIGx2aXYgbWUgbWsgbmV0IG5pa29sYWV2IG9kIG9kZXNzYSBvcmcgcGwgcG9sdGF2YSBwcCByb3ZubyBydiBzZWJhc3RvcG9sIHN1bXkgdGUgdGVybm9waWwgdXpoZ29yb2QgdmlubmljYSB2biB6YXBvcml6aHpoZSB6aGl0b21pciB6cCB6dCAnLFxuICAgICAgJ3VnJzonIGFjIGNvIGdvIG5lIG9yIG9yZyBzYyAnLFxuICAgICAgJ3VrJzonIGFjIGJsIGJyaXRpc2gtbGlicmFyeSBjbyBjeW0gZ292IGdvdnQgaWNuZXQgamV0IGxlYSBsdGQgbWUgbWlsIG1vZCBuYXRpb25hbC1saWJyYXJ5LXNjb3RsYW5kIG5lbCBuZXQgbmhzIG5pYyBubHMgb3JnIG9yZ24gcGFybGlhbWVudCBwbGMgcG9saWNlIHNjaCBzY290IHNvYyAnLFxuICAgICAgJ3VzJzonIGRuaSBmZWQgaXNhIGtpZHMgbnNuICcsXG4gICAgICAndXknOicgY29tIGVkdSBndWIgbWlsIG5ldCBvcmcgJyxcbiAgICAgICd2ZSc6JyBjbyBjb20gZWR1IGdvYiBpbmZvIG1pbCBuZXQgb3JnIHdlYiAnLFxuICAgICAgJ3ZpJzonIGNvIGNvbSBrMTIgbmV0IG9yZyAnLFxuICAgICAgJ3ZuJzonIGFjIGJpeiBjb20gZWR1IGdvdiBoZWFsdGggaW5mbyBpbnQgbmFtZSBuZXQgb3JnIHBybyAnLFxuICAgICAgJ3llJzonIGNvIGNvbSBnb3YgbHRkIG1lIG5ldCBvcmcgcGxjICcsXG4gICAgICAneXUnOicgYWMgY28gZWR1IGdvdiBvcmcgJyxcbiAgICAgICd6YSc6JyBhYyBhZ3JpYyBhbHQgYm91cnNlIGNpdHkgY28gY3liZXJuZXQgZGIgZWR1IGdvdiBncm9uZGFyIGlhY2Nlc3MgaW10IGluY2EgbGFuZGVzaWduIGxhdyBtaWwgbmV0IG5nbyBuaXMgbm9tIG9saXZldHRpIG9yZyBwaXggc2Nob29sIHRtIHdlYiAnLFxuICAgICAgJ3ptJzonIGFjIGNvIGNvbSBlZHUgZ292IG5ldCBvcmcgc2NoICdcbiAgICB9LFxuICAgIC8vIGdvcmhpbGwgMjAxMy0xMC0yNTogVXNpbmcgaW5kZXhPZigpIGluc3RlYWQgUmVnZXhwKCkuIFNpZ25pZmljYW50IGJvb3N0XG4gICAgLy8gaW4gYm90aCBwZXJmb3JtYW5jZSBhbmQgbWVtb3J5IGZvb3RwcmludC4gTm8gaW5pdGlhbGl6YXRpb24gcmVxdWlyZWQuXG4gICAgLy8gaHR0cDovL2pzcGVyZi5jb20vdXJpLWpzLXNsZC1yZWdleC12cy1iaW5hcnktc2VhcmNoLzRcbiAgICAvLyBGb2xsb3dpbmcgbWV0aG9kcyB1c2UgbGFzdEluZGV4T2YoKSByYXRoZXIgdGhhbiBhcnJheS5zcGxpdCgpIGluIG9yZGVyXG4gICAgLy8gdG8gYXZvaWQgYW55IG1lbW9yeSBhbGxvY2F0aW9ucy5cbiAgICBoYXM6IGZ1bmN0aW9uKGRvbWFpbikge1xuICAgICAgdmFyIHRsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicpO1xuICAgICAgaWYgKHRsZE9mZnNldCA8PSAwIHx8IHRsZE9mZnNldCA+PSAoZG9tYWluLmxlbmd0aC0xKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgc2xkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJywgdGxkT2Zmc2V0LTEpO1xuICAgICAgaWYgKHNsZE9mZnNldCA8PSAwIHx8IHNsZE9mZnNldCA+PSAodGxkT2Zmc2V0LTEpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRMaXN0ID0gU0xELmxpc3RbZG9tYWluLnNsaWNlKHRsZE9mZnNldCsxKV07XG4gICAgICBpZiAoIXNsZExpc3QpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNsZExpc3QuaW5kZXhPZignICcgKyBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0KzEsIHRsZE9mZnNldCkgKyAnICcpID49IDA7XG4gICAgfSxcbiAgICBpczogZnVuY3Rpb24oZG9tYWluKSB7XG4gICAgICB2YXIgdGxkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICBpZiAodGxkT2Zmc2V0IDw9IDAgfHwgdGxkT2Zmc2V0ID49IChkb21haW4ubGVuZ3RoLTEpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQtMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0ID49IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZExpc3QgPSBTTEQubGlzdFtkb21haW4uc2xpY2UodGxkT2Zmc2V0KzEpXTtcbiAgICAgIGlmICghc2xkTGlzdCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xkTGlzdC5pbmRleE9mKCcgJyArIGRvbWFpbi5zbGljZSgwLCB0bGRPZmZzZXQpICsgJyAnKSA+PSAwO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihkb21haW4pIHtcbiAgICAgIHZhciB0bGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIGlmICh0bGRPZmZzZXQgPD0gMCB8fCB0bGRPZmZzZXQgPj0gKGRvbWFpbi5sZW5ndGgtMSkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgc2xkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJywgdGxkT2Zmc2V0LTEpO1xuICAgICAgaWYgKHNsZE9mZnNldCA8PSAwIHx8IHNsZE9mZnNldCA+PSAodGxkT2Zmc2V0LTEpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIHNsZExpc3QgPSBTTEQubGlzdFtkb21haW4uc2xpY2UodGxkT2Zmc2V0KzEpXTtcbiAgICAgIGlmICghc2xkTGlzdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChzbGRMaXN0LmluZGV4T2YoJyAnICsgZG9tYWluLnNsaWNlKHNsZE9mZnNldCsxLCB0bGRPZmZzZXQpICsgJyAnKSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gZG9tYWluLnNsaWNlKHNsZE9mZnNldCsxKTtcbiAgICB9LFxuICAgIG5vQ29uZmxpY3Q6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAocm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPT09IHRoaXMpIHtcbiAgICAgICAgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPSBfU2Vjb25kTGV2ZWxEb21haW5zO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTTEQ7XG59KSk7XG4iLCIvKiFcbiAqIFVSSS5qcyAtIE11dGF0aW5nIFVSTHNcbiAqXG4gKiBWZXJzaW9uOiAxLjE3LjBcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJy4vcHVueWNvZGUnKSwgcmVxdWlyZSgnLi9JUHY2JyksIHJlcXVpcmUoJy4vU2Vjb25kTGV2ZWxEb21haW5zJykpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoWycuL3B1bnljb2RlJywgJy4vSVB2NicsICcuL1NlY29uZExldmVsRG9tYWlucyddLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QuVVJJID0gZmFjdG9yeShyb290LnB1bnljb2RlLCByb290LklQdjYsIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zLCByb290KTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAocHVueWNvZGUsIElQdjYsIFNMRCwgcm9vdCkge1xuICAndXNlIHN0cmljdCc7XG4gIC8qZ2xvYmFsIGxvY2F0aW9uLCBlc2NhcGUsIHVuZXNjYXBlICovXG4gIC8vIEZJWE1FOiB2Mi4wLjAgcmVuYW1jZSBub24tY2FtZWxDYXNlIHByb3BlcnRpZXMgdG8gdXBwZXJjYXNlXG4gIC8qanNoaW50IGNhbWVsY2FzZTogZmFsc2UgKi9cblxuICAvLyBzYXZlIGN1cnJlbnQgVVJJIHZhcmlhYmxlLCBpZiBhbnlcbiAgdmFyIF9VUkkgPSByb290ICYmIHJvb3QuVVJJO1xuXG4gIGZ1bmN0aW9uIFVSSSh1cmwsIGJhc2UpIHtcbiAgICB2YXIgX3VybFN1cHBsaWVkID0gYXJndW1lbnRzLmxlbmd0aCA+PSAxO1xuICAgIHZhciBfYmFzZVN1cHBsaWVkID0gYXJndW1lbnRzLmxlbmd0aCA+PSAyO1xuXG4gICAgLy8gQWxsb3cgaW5zdGFudGlhdGlvbiB3aXRob3V0IHRoZSAnbmV3JyBrZXl3b3JkXG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFVSSSkpIHtcbiAgICAgIGlmIChfdXJsU3VwcGxpZWQpIHtcbiAgICAgICAgaWYgKF9iYXNlU3VwcGxpZWQpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFVSSSh1cmwsIGJhc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBVUkkodXJsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBVUkkoKTtcbiAgICB9XG5cbiAgICBpZiAodXJsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChfdXJsU3VwcGxpZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5kZWZpbmVkIGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50IGZvciBVUkknKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdXJsID0gbG9jYXRpb24uaHJlZiArICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXJsID0gJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ocmVmKHVybCk7XG5cbiAgICAvLyByZXNvbHZlIHRvIGJhc2UgYWNjb3JkaW5nIHRvIGh0dHA6Ly9kdmNzLnczLm9yZy9oZy91cmwvcmF3LWZpbGUvdGlwL092ZXJ2aWV3Lmh0bWwjY29uc3RydWN0b3JcbiAgICBpZiAoYmFzZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5hYnNvbHV0ZVRvKGJhc2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgVVJJLnZlcnNpb24gPSAnMS4xNy4wJztcblxuICB2YXIgcCA9IFVSSS5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4KHN0cmluZykge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2NvbW1pdC84NWFjMjE3ODNjMTFmOGNjYWIwNjEwNmRiYTk3MzVhMzFhODY5MjRkI2NvbW1pdGNvbW1lbnQtODIxOTYzXG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oWy4qKz9ePSE6JHt9KCl8W1xcXVxcL1xcXFxdKS9nLCAnXFxcXCQxJyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUeXBlKHZhbHVlKSB7XG4gICAgLy8gSUU4IGRvZXNuJ3QgcmV0dXJuIFtPYmplY3QgVW5kZWZpbmVkXSBidXQgW09iamVjdCBPYmplY3RdIGZvciB1bmRlZmluZWQgdmFsdWVcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdVbmRlZmluZWQnO1xuICAgIH1cblxuICAgIHJldHVybiBTdHJpbmcoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSkuc2xpY2UoOCwgLTEpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gZ2V0VHlwZShvYmopID09PSAnQXJyYXknO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsdGVyQXJyYXlWYWx1ZXMoZGF0YSwgdmFsdWUpIHtcbiAgICB2YXIgbG9va3VwID0ge307XG4gICAgdmFyIGksIGxlbmd0aDtcblxuICAgIGlmIChnZXRUeXBlKHZhbHVlKSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgIGxvb2t1cCA9IG51bGw7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbG9va3VwW3ZhbHVlW2ldXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvb2t1cFt2YWx1ZV0gPSB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIC8qanNoaW50IGxheGJyZWFrOiB0cnVlICovXG4gICAgICB2YXIgX21hdGNoID0gbG9va3VwICYmIGxvb2t1cFtkYXRhW2ldXSAhPT0gdW5kZWZpbmVkXG4gICAgICAgIHx8ICFsb29rdXAgJiYgdmFsdWUudGVzdChkYXRhW2ldKTtcbiAgICAgIC8qanNoaW50IGxheGJyZWFrOiBmYWxzZSAqL1xuICAgICAgaWYgKF9tYXRjaCkge1xuICAgICAgICBkYXRhLnNwbGljZShpLCAxKTtcbiAgICAgICAgbGVuZ3RoLS07XG4gICAgICAgIGktLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5Q29udGFpbnMobGlzdCwgdmFsdWUpIHtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuXG4gICAgLy8gdmFsdWUgbWF5IGJlIHN0cmluZywgbnVtYmVyLCBhcnJheSwgcmVnZXhwXG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAvLyBOb3RlOiB0aGlzIGNhbiBiZSBvcHRpbWl6ZWQgdG8gTyhuKSAoaW5zdGVhZCBvZiBjdXJyZW50IE8obSAqIG4pKVxuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFhcnJheUNvbnRhaW5zKGxpc3QsIHZhbHVlW2ldKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgX3R5cGUgPSBnZXRUeXBlKHZhbHVlKTtcbiAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoX3R5cGUgPT09ICdSZWdFeHAnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdFtpXSA9PT0gJ3N0cmluZycgJiYgbGlzdFtpXS5tYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChsaXN0W2ldID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhcnJheXNFcXVhbChvbmUsIHR3bykge1xuICAgIGlmICghaXNBcnJheShvbmUpIHx8ICFpc0FycmF5KHR3bykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBhcnJheXMgY2FuJ3QgYmUgZXF1YWwgaWYgdGhleSBoYXZlIGRpZmZlcmVudCBhbW91bnQgb2YgY29udGVudFxuICAgIGlmIChvbmUubGVuZ3RoICE9PSB0d28ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgb25lLnNvcnQoKTtcbiAgICB0d28uc29ydCgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvbmUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAob25lW2ldICE9PSB0d29baV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJpbVNsYXNoZXModGV4dCkge1xuICAgIHZhciB0cmltX2V4cHJlc3Npb24gPSAvXlxcLyt8XFwvKyQvZztcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHRyaW1fZXhwcmVzc2lvbiwgJycpO1xuICB9XG5cbiAgVVJJLl9wYXJ0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm90b2NvbDogbnVsbCxcbiAgICAgIHVzZXJuYW1lOiBudWxsLFxuICAgICAgcGFzc3dvcmQ6IG51bGwsXG4gICAgICBob3N0bmFtZTogbnVsbCxcbiAgICAgIHVybjogbnVsbCxcbiAgICAgIHBvcnQ6IG51bGwsXG4gICAgICBwYXRoOiBudWxsLFxuICAgICAgcXVlcnk6IG51bGwsXG4gICAgICBmcmFnbWVudDogbnVsbCxcbiAgICAgIC8vIHN0YXRlXG4gICAgICBkdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnM6IFVSSS5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsXG4gICAgICBlc2NhcGVRdWVyeVNwYWNlOiBVUkkuZXNjYXBlUXVlcnlTcGFjZVxuICAgIH07XG4gIH07XG4gIC8vIHN0YXRlOiBhbGxvdyBkdXBsaWNhdGUgcXVlcnkgcGFyYW1ldGVycyAoYT0xJmE9MSlcbiAgVVJJLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyA9IGZhbHNlO1xuICAvLyBzdGF0ZTogcmVwbGFjZXMgKyB3aXRoICUyMCAoc3BhY2UgaW4gcXVlcnkgc3RyaW5ncylcbiAgVVJJLmVzY2FwZVF1ZXJ5U3BhY2UgPSB0cnVlO1xuICAvLyBzdGF0aWMgcHJvcGVydGllc1xuICBVUkkucHJvdG9jb2xfZXhwcmVzc2lvbiA9IC9eW2Etel1bYS16MC05ListXSokL2k7XG4gIFVSSS5pZG5fZXhwcmVzc2lvbiA9IC9bXmEtejAtOVxcLi1dL2k7XG4gIFVSSS5wdW55Y29kZV9leHByZXNzaW9uID0gLyh4bi0tKS9pO1xuICAvLyB3ZWxsLCAzMzMuNDQ0LjU1NS42NjYgbWF0Y2hlcywgYnV0IGl0IHN1cmUgYWluJ3Qgbm8gSVB2NCAtIGRvIHdlIGNhcmU/XG4gIFVSSS5pcDRfZXhwcmVzc2lvbiA9IC9eXFxkezEsM31cXC5cXGR7MSwzfVxcLlxcZHsxLDN9XFwuXFxkezEsM30kLztcbiAgLy8gY3JlZGl0cyB0byBSaWNoIEJyb3duXG4gIC8vIHNvdXJjZTogaHR0cDovL2ZvcnVtcy5pbnRlcm1hcHBlci5jb20vdmlld3RvcGljLnBocD9wPTEwOTYjMTA5NlxuICAvLyBzcGVjaWZpY2F0aW9uOiBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmM0MjkxLnR4dFxuICBVUkkuaXA2X2V4cHJlc3Npb24gPSAvXlxccyooKChbMC05QS1GYS1mXXsxLDR9Oil7N30oWzAtOUEtRmEtZl17MSw0fXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7Nn0oOlswLTlBLUZhLWZdezEsNH18KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXs1fSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDJ9KXw6KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXs0fSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDN9KXwoKDpbMC05QS1GYS1mXXsxLDR9KT86KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7M30oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw0fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCwyfTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXsyfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDV9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDN9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezF9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNn0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsNH06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KDooKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw3fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCw1fTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKSkoJS4rKT9cXHMqJC87XG4gIC8vIGV4cHJlc3Npb24gdXNlZCBpcyBcImdydWJlciByZXZpc2VkXCIgKEBncnViZXIgdjIpIGRldGVybWluZWQgdG8gYmUgdGhlXG4gIC8vIGJlc3Qgc29sdXRpb24gaW4gYSByZWdleC1nb2xmIHdlIGRpZCBhIGNvdXBsZSBvZiBhZ2VzIGFnbyBhdFxuICAvLyAqIGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL2RlbW8vdXJsLXJlZ2V4XG4gIC8vICogaHR0cDovL3JvZG5leXJlaG0uZGUvdC91cmwtcmVnZXguaHRtbFxuICBVUkkuZmluZF91cmlfZXhwcmVzc2lvbiA9IC9cXGIoKD86W2Etel1bXFx3LV0rOig/OlxcL3sxLDN9fFthLXowLTklXSl8d3d3XFxkezAsM31bLl18W2EtejAtOS5cXC1dK1suXVthLXpdezIsNH1cXC8pKD86W15cXHMoKTw+XSt8XFwoKFteXFxzKCk8Pl0rfChcXChbXlxccygpPD5dK1xcKSkpKlxcKSkrKD86XFwoKFteXFxzKCk8Pl0rfChcXChbXlxccygpPD5dK1xcKSkpKlxcKXxbXlxcc2AhKClcXFtcXF17fTs6J1wiLiw8Pj/Cq8K74oCc4oCd4oCY4oCZXSkpL2lnO1xuICBVUkkuZmluZFVyaSA9IHtcbiAgICAvLyB2YWxpZCBcInNjaGVtZTovL1wiIG9yIFwid3d3LlwiXG4gICAgc3RhcnQ6IC9cXGIoPzooW2Etel1bYS16MC05ListXSo6XFwvXFwvKXx3d3dcXC4pL2dpLFxuICAgIC8vIGV2ZXJ5dGhpbmcgdXAgdG8gdGhlIG5leHQgd2hpdGVzcGFjZVxuICAgIGVuZDogL1tcXHNcXHJcXG5dfCQvLFxuICAgIC8vIHRyaW0gdHJhaWxpbmcgcHVuY3R1YXRpb24gY2FwdHVyZWQgYnkgZW5kIFJlZ0V4cFxuICAgIHRyaW06IC9bYCEoKVxcW1xcXXt9OzonXCIuLDw+P8KrwrvigJzigJ3igJ7igJjigJldKyQvXG4gIH07XG4gIC8vIGh0dHA6Ly93d3cuaWFuYS5vcmcvYXNzaWdubWVudHMvdXJpLXNjaGVtZXMuaHRtbFxuICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfVENQX2FuZF9VRFBfcG9ydF9udW1iZXJzI1dlbGwta25vd25fcG9ydHNcbiAgVVJJLmRlZmF1bHRQb3J0cyA9IHtcbiAgICBodHRwOiAnODAnLFxuICAgIGh0dHBzOiAnNDQzJyxcbiAgICBmdHA6ICcyMScsXG4gICAgZ29waGVyOiAnNzAnLFxuICAgIHdzOiAnODAnLFxuICAgIHdzczogJzQ0MydcbiAgfTtcbiAgLy8gYWxsb3dlZCBob3N0bmFtZSBjaGFyYWN0ZXJzIGFjY29yZGluZyB0byBSRkMgMzk4NlxuICAvLyBBTFBIQSBESUdJVCBcIi1cIiBcIi5cIiBcIl9cIiBcIn5cIiBcIiFcIiBcIiRcIiBcIiZcIiBcIidcIiBcIihcIiBcIilcIiBcIipcIiBcIitcIiBcIixcIiBcIjtcIiBcIj1cIiAlZW5jb2RlZFxuICAvLyBJJ3ZlIG5ldmVyIHNlZW4gYSAobm9uLUlETikgaG9zdG5hbWUgb3RoZXIgdGhhbjogQUxQSEEgRElHSVQgLiAtXG4gIFVSSS5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMgPSAvW15hLXpBLVowLTlcXC4tXS87XG4gIC8vIG1hcCBET00gRWxlbWVudHMgdG8gdGhlaXIgVVJJIGF0dHJpYnV0ZVxuICBVUkkuZG9tQXR0cmlidXRlcyA9IHtcbiAgICAnYSc6ICdocmVmJyxcbiAgICAnYmxvY2txdW90ZSc6ICdjaXRlJyxcbiAgICAnbGluayc6ICdocmVmJyxcbiAgICAnYmFzZSc6ICdocmVmJyxcbiAgICAnc2NyaXB0JzogJ3NyYycsXG4gICAgJ2Zvcm0nOiAnYWN0aW9uJyxcbiAgICAnaW1nJzogJ3NyYycsXG4gICAgJ2FyZWEnOiAnaHJlZicsXG4gICAgJ2lmcmFtZSc6ICdzcmMnLFxuICAgICdlbWJlZCc6ICdzcmMnLFxuICAgICdzb3VyY2UnOiAnc3JjJyxcbiAgICAndHJhY2snOiAnc3JjJyxcbiAgICAnaW5wdXQnOiAnc3JjJywgLy8gYnV0IG9ubHkgaWYgdHlwZT1cImltYWdlXCJcbiAgICAnYXVkaW8nOiAnc3JjJyxcbiAgICAndmlkZW8nOiAnc3JjJ1xuICB9O1xuICBVUkkuZ2V0RG9tQXR0cmlidXRlID0gZnVuY3Rpb24obm9kZSkge1xuICAgIGlmICghbm9kZSB8fCAhbm9kZS5ub2RlTmFtZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgbm9kZU5hbWUgPSBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gPGlucHV0PiBzaG91bGQgb25seSBleHBvc2Ugc3JjIGZvciB0eXBlPVwiaW1hZ2VcIlxuICAgIGlmIChub2RlTmFtZSA9PT0gJ2lucHV0JyAmJiBub2RlLnR5cGUgIT09ICdpbWFnZScpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIFVSSS5kb21BdHRyaWJ1dGVzW25vZGVOYW1lXTtcbiAgfTtcblxuICBmdW5jdGlvbiBlc2NhcGVGb3JEdW1iRmlyZWZveDM2KHZhbHVlKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzkxXG4gICAgcmV0dXJuIGVzY2FwZSh2YWx1ZSk7XG4gIH1cblxuICAvLyBlbmNvZGluZyAvIGRlY29kaW5nIGFjY29yZGluZyB0byBSRkMzOTg2XG4gIGZ1bmN0aW9uIHN0cmljdEVuY29kZVVSSUNvbXBvbmVudChzdHJpbmcpIHtcbiAgICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZylcbiAgICAgIC5yZXBsYWNlKC9bIScoKSpdL2csIGVzY2FwZUZvckR1bWJGaXJlZm94MzYpXG4gICAgICAucmVwbGFjZSgvXFwqL2csICclMkEnKTtcbiAgfVxuICBVUkkuZW5jb2RlID0gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50O1xuICBVUkkuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuICBVUkkuaXNvODg1OSA9IGZ1bmN0aW9uKCkge1xuICAgIFVSSS5lbmNvZGUgPSBlc2NhcGU7XG4gICAgVVJJLmRlY29kZSA9IHVuZXNjYXBlO1xuICB9O1xuICBVUkkudW5pY29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIFVSSS5lbmNvZGUgPSBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQ7XG4gICAgVVJJLmRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbiAgfTtcbiAgVVJJLmNoYXJhY3RlcnMgPSB7XG4gICAgcGF0aG5hbWU6IHtcbiAgICAgIGVuY29kZToge1xuICAgICAgICAvLyBSRkMzOTg2IDIuMTogRm9yIGNvbnNpc3RlbmN5LCBVUkkgcHJvZHVjZXJzIGFuZCBub3JtYWxpemVycyBzaG91bGRcbiAgICAgICAgLy8gdXNlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCBkaWdpdHMgZm9yIGFsbCBwZXJjZW50LWVuY29kaW5ncy5cbiAgICAgICAgZXhwcmVzc2lvbjogLyUoMjR8MjZ8MkJ8MkN8M0J8M0R8M0F8NDApL2lnLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAvLyAtLl9+IScoKSpcbiAgICAgICAgICAnJTI0JzogJyQnLFxuICAgICAgICAgICclMjYnOiAnJicsXG4gICAgICAgICAgJyUyQic6ICcrJyxcbiAgICAgICAgICAnJTJDJzogJywnLFxuICAgICAgICAgICclM0InOiAnOycsXG4gICAgICAgICAgJyUzRCc6ICc9JyxcbiAgICAgICAgICAnJTNBJzogJzonLFxuICAgICAgICAgICclNDAnOiAnQCdcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRlY29kZToge1xuICAgICAgICBleHByZXNzaW9uOiAvW1xcL1xcPyNdL2csXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICcvJzogJyUyRicsXG4gICAgICAgICAgJz8nOiAnJTNGJyxcbiAgICAgICAgICAnIyc6ICclMjMnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc2VydmVkOiB7XG4gICAgICBlbmNvZGU6IHtcbiAgICAgICAgLy8gUkZDMzk4NiAyLjE6IEZvciBjb25zaXN0ZW5jeSwgVVJJIHByb2R1Y2VycyBhbmQgbm9ybWFsaXplcnMgc2hvdWxkXG4gICAgICAgIC8vIHVzZSB1cHBlcmNhc2UgaGV4YWRlY2ltYWwgZGlnaXRzIGZvciBhbGwgcGVyY2VudC1lbmNvZGluZ3MuXG4gICAgICAgIGV4cHJlc3Npb246IC8lKDIxfDIzfDI0fDI2fDI3fDI4fDI5fDJBfDJCfDJDfDJGfDNBfDNCfDNEfDNGfDQwfDVCfDVEKS9pZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgLy8gZ2VuLWRlbGltc1xuICAgICAgICAgICclM0EnOiAnOicsXG4gICAgICAgICAgJyUyRic6ICcvJyxcbiAgICAgICAgICAnJTNGJzogJz8nLFxuICAgICAgICAgICclMjMnOiAnIycsXG4gICAgICAgICAgJyU1Qic6ICdbJyxcbiAgICAgICAgICAnJTVEJzogJ10nLFxuICAgICAgICAgICclNDAnOiAnQCcsXG4gICAgICAgICAgLy8gc3ViLWRlbGltc1xuICAgICAgICAgICclMjEnOiAnIScsXG4gICAgICAgICAgJyUyNCc6ICckJyxcbiAgICAgICAgICAnJTI2JzogJyYnLFxuICAgICAgICAgICclMjcnOiAnXFwnJyxcbiAgICAgICAgICAnJTI4JzogJygnLFxuICAgICAgICAgICclMjknOiAnKScsXG4gICAgICAgICAgJyUyQSc6ICcqJyxcbiAgICAgICAgICAnJTJCJzogJysnLFxuICAgICAgICAgICclMkMnOiAnLCcsXG4gICAgICAgICAgJyUzQic6ICc7JyxcbiAgICAgICAgICAnJTNEJzogJz0nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHVybnBhdGg6IHtcbiAgICAgIC8vIFRoZSBjaGFyYWN0ZXJzIHVuZGVyIGBlbmNvZGVgIGFyZSB0aGUgY2hhcmFjdGVycyBjYWxsZWQgb3V0IGJ5IFJGQyAyMTQxIGFzIGJlaW5nIGFjY2VwdGFibGVcbiAgICAgIC8vIGZvciB1c2FnZSBpbiBhIFVSTi4gUkZDMjE0MSBhbHNvIGNhbGxzIG91dCBcIi1cIiwgXCIuXCIsIGFuZCBcIl9cIiBhcyBhY2NlcHRhYmxlIGNoYXJhY3RlcnMsIGJ1dFxuICAgICAgLy8gdGhlc2UgYXJlbid0IGVuY29kZWQgYnkgZW5jb2RlVVJJQ29tcG9uZW50LCBzbyB3ZSBkb24ndCBoYXZlIHRvIGNhbGwgdGhlbSBvdXQgaGVyZS4gQWxzb1xuICAgICAgLy8gbm90ZSB0aGF0IHRoZSBjb2xvbiBjaGFyYWN0ZXIgaXMgbm90IGZlYXR1cmVkIGluIHRoZSBlbmNvZGluZyBtYXA7IHRoaXMgaXMgYmVjYXVzZSBVUkkuanNcbiAgICAgIC8vIGdpdmVzIHRoZSBjb2xvbnMgaW4gVVJOcyBzZW1hbnRpYyBtZWFuaW5nIGFzIHRoZSBkZWxpbWl0ZXJzIG9mIHBhdGggc2VnZW1lbnRzLCBhbmQgc28gaXRcbiAgICAgIC8vIHNob3VsZCBub3QgYXBwZWFyIHVuZW5jb2RlZCBpbiBhIHNlZ21lbnQgaXRzZWxmLlxuICAgICAgLy8gU2VlIGFsc28gdGhlIG5vdGUgYWJvdmUgYWJvdXQgUkZDMzk4NiBhbmQgY2FwaXRhbGFsaXplZCBoZXggZGlnaXRzLlxuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIGV4cHJlc3Npb246IC8lKDIxfDI0fDI3fDI4fDI5fDJBfDJCfDJDfDNCfDNEfDQwKS9pZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgJyUyMSc6ICchJyxcbiAgICAgICAgICAnJTI0JzogJyQnLFxuICAgICAgICAgICclMjcnOiAnXFwnJyxcbiAgICAgICAgICAnJTI4JzogJygnLFxuICAgICAgICAgICclMjknOiAnKScsXG4gICAgICAgICAgJyUyQSc6ICcqJyxcbiAgICAgICAgICAnJTJCJzogJysnLFxuICAgICAgICAgICclMkMnOiAnLCcsXG4gICAgICAgICAgJyUzQic6ICc7JyxcbiAgICAgICAgICAnJTNEJzogJz0nLFxuICAgICAgICAgICclNDAnOiAnQCdcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIFRoZXNlIGNoYXJhY3RlcnMgYXJlIHRoZSBjaGFyYWN0ZXJzIGNhbGxlZCBvdXQgYnkgUkZDMjE0MSBhcyBcInJlc2VydmVkXCIgY2hhcmFjdGVycyB0aGF0XG4gICAgICAvLyBzaG91bGQgbmV2ZXIgYXBwZWFyIGluIGEgVVJOLCBwbHVzIHRoZSBjb2xvbiBjaGFyYWN0ZXIgKHNlZSBub3RlIGFib3ZlKS5cbiAgICAgIGRlY29kZToge1xuICAgICAgICBleHByZXNzaW9uOiAvW1xcL1xcPyM6XS9nLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAnLyc6ICclMkYnLFxuICAgICAgICAgICc/JzogJyUzRicsXG4gICAgICAgICAgJyMnOiAnJTIzJyxcbiAgICAgICAgICAnOic6ICclM0EnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIFVSSS5lbmNvZGVRdWVyeSA9IGZ1bmN0aW9uKHN0cmluZywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIHZhciBlc2NhcGVkID0gVVJJLmVuY29kZShzdHJpbmcgKyAnJyk7XG4gICAgaWYgKGVzY2FwZVF1ZXJ5U3BhY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXNjYXBlUXVlcnlTcGFjZSA9IFVSSS5lc2NhcGVRdWVyeVNwYWNlO1xuICAgIH1cblxuICAgIHJldHVybiBlc2NhcGVRdWVyeVNwYWNlID8gZXNjYXBlZC5yZXBsYWNlKC8lMjAvZywgJysnKSA6IGVzY2FwZWQ7XG4gIH07XG4gIFVSSS5kZWNvZGVRdWVyeSA9IGZ1bmN0aW9uKHN0cmluZywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIHN0cmluZyArPSAnJztcbiAgICBpZiAoZXNjYXBlUXVlcnlTcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlc2NhcGVRdWVyeVNwYWNlID0gVVJJLmVzY2FwZVF1ZXJ5U3BhY2U7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBVUkkuZGVjb2RlKGVzY2FwZVF1ZXJ5U3BhY2UgPyBzdHJpbmcucmVwbGFjZSgvXFwrL2csICclMjAnKSA6IHN0cmluZyk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvLyB3ZSdyZSBub3QgZ29pbmcgdG8gbWVzcyB3aXRoIHdlaXJkIGVuY29kaW5ncyxcbiAgICAgIC8vIGdpdmUgdXAgYW5kIHJldHVybiB0aGUgdW5kZWNvZGVkIG9yaWdpbmFsIHN0cmluZ1xuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy84N1xuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy85MlxuICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG4gIH07XG4gIC8vIGdlbmVyYXRlIGVuY29kZS9kZWNvZGUgcGF0aCBmdW5jdGlvbnNcbiAgdmFyIF9wYXJ0cyA9IHsnZW5jb2RlJzonZW5jb2RlJywgJ2RlY29kZSc6J2RlY29kZSd9O1xuICB2YXIgX3BhcnQ7XG4gIHZhciBnZW5lcmF0ZUFjY2Vzc29yID0gZnVuY3Rpb24oX2dyb3VwLCBfcGFydCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBVUklbX3BhcnRdKHN0cmluZyArICcnKS5yZXBsYWNlKFVSSS5jaGFyYWN0ZXJzW19ncm91cF1bX3BhcnRdLmV4cHJlc3Npb24sIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICByZXR1cm4gVVJJLmNoYXJhY3RlcnNbX2dyb3VwXVtfcGFydF0ubWFwW2NdO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gd2UncmUgbm90IGdvaW5nIHRvIG1lc3Mgd2l0aCB3ZWlyZCBlbmNvZGluZ3MsXG4gICAgICAgIC8vIGdpdmUgdXAgYW5kIHJldHVybiB0aGUgdW5kZWNvZGVkIG9yaWdpbmFsIHN0cmluZ1xuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzg3XG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvOTJcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIGZvciAoX3BhcnQgaW4gX3BhcnRzKSB7XG4gICAgVVJJW19wYXJ0ICsgJ1BhdGhTZWdtZW50J10gPSBnZW5lcmF0ZUFjY2Vzc29yKCdwYXRobmFtZScsIF9wYXJ0c1tfcGFydF0pO1xuICAgIFVSSVtfcGFydCArICdVcm5QYXRoU2VnbWVudCddID0gZ2VuZXJhdGVBY2Nlc3NvcigndXJucGF0aCcsIF9wYXJ0c1tfcGFydF0pO1xuICB9XG5cbiAgdmFyIGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uID0gZnVuY3Rpb24oX3NlcCwgX2NvZGluZ0Z1bmNOYW1lLCBfaW5uZXJDb2RpbmdGdW5jTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIC8vIFdoeSBwYXNzIGluIG5hbWVzIG9mIGZ1bmN0aW9ucywgcmF0aGVyIHRoYW4gdGhlIGZ1bmN0aW9uIG9iamVjdHMgdGhlbXNlbHZlcz8gVGhlXG4gICAgICAvLyBkZWZpbml0aW9ucyBvZiBzb21lIGZ1bmN0aW9ucyAoYnV0IGluIHBhcnRpY3VsYXIsIFVSSS5kZWNvZGUpIHdpbGwgb2NjYXNpb25hbGx5IGNoYW5nZSBkdWVcbiAgICAgIC8vIHRvIFVSSS5qcyBoYXZpbmcgSVNPODg1OSBhbmQgVW5pY29kZSBtb2Rlcy4gUGFzc2luZyBpbiB0aGUgbmFtZSBhbmQgZ2V0dGluZyBpdCB3aWxsIGVuc3VyZVxuICAgICAgLy8gdGhhdCB0aGUgZnVuY3Rpb25zIHdlIHVzZSBoZXJlIGFyZSBcImZyZXNoXCIuXG4gICAgICB2YXIgYWN0dWFsQ29kaW5nRnVuYztcbiAgICAgIGlmICghX2lubmVyQ29kaW5nRnVuY05hbWUpIHtcbiAgICAgICAgYWN0dWFsQ29kaW5nRnVuYyA9IFVSSVtfY29kaW5nRnVuY05hbWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWN0dWFsQ29kaW5nRnVuYyA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgICAgIHJldHVybiBVUklbX2NvZGluZ0Z1bmNOYW1lXShVUklbX2lubmVyQ29kaW5nRnVuY05hbWVdKHN0cmluZykpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VnbWVudHMgPSAoc3RyaW5nICsgJycpLnNwbGl0KF9zZXApO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2VnbWVudHNbaV0gPSBhY3R1YWxDb2RpbmdGdW5jKHNlZ21lbnRzW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzLmpvaW4oX3NlcCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBUaGlzIHRha2VzIHBsYWNlIG91dHNpZGUgdGhlIGFib3ZlIGxvb3AgYmVjYXVzZSB3ZSBkb24ndCB3YW50LCBlLmcuLCBlbmNvZGVVcm5QYXRoIGZ1bmN0aW9ucy5cbiAgVVJJLmRlY29kZVBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignLycsICdkZWNvZGVQYXRoU2VnbWVudCcpO1xuICBVUkkuZGVjb2RlVXJuUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCc6JywgJ2RlY29kZVVyblBhdGhTZWdtZW50Jyk7XG4gIFVSSS5yZWNvZGVQYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJy8nLCAnZW5jb2RlUGF0aFNlZ21lbnQnLCAnZGVjb2RlJyk7XG4gIFVSSS5yZWNvZGVVcm5QYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJzonLCAnZW5jb2RlVXJuUGF0aFNlZ21lbnQnLCAnZGVjb2RlJyk7XG5cbiAgVVJJLmVuY29kZVJlc2VydmVkID0gZ2VuZXJhdGVBY2Nlc3NvcigncmVzZXJ2ZWQnLCAnZW5jb2RlJyk7XG5cbiAgVVJJLnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nLCBwYXJ0cykge1xuICAgIHZhciBwb3M7XG4gICAgaWYgKCFwYXJ0cykge1xuICAgICAgcGFydHMgPSB7fTtcbiAgICB9XG4gICAgLy8gW3Byb3RvY29sXCI6Ly9cIlt1c2VybmFtZVtcIjpcInBhc3N3b3JkXVwiQFwiXWhvc3RuYW1lW1wiOlwicG9ydF1cIi9cIj9dW3BhdGhdW1wiP1wicXVlcnlzdHJpbmddW1wiI1wiZnJhZ21lbnRdXG5cbiAgICAvLyBleHRyYWN0IGZyYWdtZW50XG4gICAgcG9zID0gc3RyaW5nLmluZGV4T2YoJyMnKTtcbiAgICBpZiAocG9zID4gLTEpIHtcbiAgICAgIC8vIGVzY2FwaW5nP1xuICAgICAgcGFydHMuZnJhZ21lbnQgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpIHx8IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBxdWVyeVxuICAgIHBvcyA9IHN0cmluZy5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKHBvcyA+IC0xKSB7XG4gICAgICAvLyBlc2NhcGluZz9cbiAgICAgIHBhcnRzLnF1ZXJ5ID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKSB8fCBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpO1xuICAgIH1cblxuICAgIC8vIGV4dHJhY3QgcHJvdG9jb2xcbiAgICBpZiAoc3RyaW5nLnN1YnN0cmluZygwLCAyKSA9PT0gJy8vJykge1xuICAgICAgLy8gcmVsYXRpdmUtc2NoZW1lXG4gICAgICBwYXJ0cy5wcm90b2NvbCA9IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKDIpO1xuICAgICAgLy8gZXh0cmFjdCBcInVzZXI6cGFzc0Bob3N0OnBvcnRcIlxuICAgICAgc3RyaW5nID0gVVJJLnBhcnNlQXV0aG9yaXR5KHN0cmluZywgcGFydHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3MgPSBzdHJpbmcuaW5kZXhPZignOicpO1xuICAgICAgaWYgKHBvcyA+IC0xKSB7XG4gICAgICAgIHBhcnRzLnByb3RvY29sID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpIHx8IG51bGw7XG4gICAgICAgIGlmIChwYXJ0cy5wcm90b2NvbCAmJiAhcGFydHMucHJvdG9jb2wubWF0Y2goVVJJLnByb3RvY29sX2V4cHJlc3Npb24pKSB7XG4gICAgICAgICAgLy8gOiBtYXkgYmUgd2l0aGluIHRoZSBwYXRoXG4gICAgICAgICAgcGFydHMucHJvdG9jb2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxLCBwb3MgKyAzKSA9PT0gJy8vJykge1xuICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMyk7XG5cbiAgICAgICAgICAvLyBleHRyYWN0IFwidXNlcjpwYXNzQGhvc3Q6cG9ydFwiXG4gICAgICAgICAgc3RyaW5nID0gVVJJLnBhcnNlQXV0aG9yaXR5KHN0cmluZywgcGFydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgcGFydHMudXJuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdoYXQncyBsZWZ0IG11c3QgYmUgdGhlIHBhdGhcbiAgICBwYXJ0cy5wYXRoID0gc3RyaW5nO1xuXG4gICAgLy8gYW5kIHdlJ3JlIGRvbmVcbiAgICByZXR1cm4gcGFydHM7XG4gIH07XG4gIFVSSS5wYXJzZUhvc3QgPSBmdW5jdGlvbihzdHJpbmcsIHBhcnRzKSB7XG4gICAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gICAgLy8gQmFjayBzbGFzaGVzIGJlZm9yZSB0aGUgcXVlcnkgc3RyaW5nIGdldCBjb252ZXJ0ZWQgdG8gZm9yd2FyZCBzbGFzaGVzXG4gICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvYmxvYi8zODZmZDI0ZjQ5YjBlOWQxYThhMDc2NTkyYTQwNDE2OGZhZWVjYzM0L2xpYi91cmwuanMjTDExNS1MMTI0XG4gICAgLy8gU2VlOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MjU5MTZcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9wdWxsLzIzM1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbiAgICAvLyBleHRyYWN0IGhvc3Q6cG9ydFxuICAgIHZhciBwb3MgPSBzdHJpbmcuaW5kZXhPZignLycpO1xuICAgIHZhciBicmFja2V0UG9zO1xuICAgIHZhciB0O1xuXG4gICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgIHBvcyA9IHN0cmluZy5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5jaGFyQXQoMCkgPT09ICdbJykge1xuICAgICAgLy8gSVB2NiBob3N0IC0gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaWV0Zi02bWFuLXRleHQtYWRkci1yZXByZXNlbnRhdGlvbi0wNCNzZWN0aW9uLTZcbiAgICAgIC8vIEkgY2xhaW0gbW9zdCBjbGllbnQgc29mdHdhcmUgYnJlYWtzIG9uIElQdjYgYW55d2F5cy4gVG8gc2ltcGxpZnkgdGhpbmdzLCBVUkkgb25seSBhY2NlcHRzXG4gICAgICAvLyBJUHY2K3BvcnQgaW4gdGhlIGZvcm1hdCBbMjAwMTpkYjg6OjFdOjgwIChmb3IgdGhlIHRpbWUgYmVpbmcpXG4gICAgICBicmFja2V0UG9zID0gc3RyaW5nLmluZGV4T2YoJ10nKTtcbiAgICAgIHBhcnRzLmhvc3RuYW1lID0gc3RyaW5nLnN1YnN0cmluZygxLCBicmFja2V0UG9zKSB8fCBudWxsO1xuICAgICAgcGFydHMucG9ydCA9IHN0cmluZy5zdWJzdHJpbmcoYnJhY2tldFBvcyArIDIsIHBvcykgfHwgbnVsbDtcbiAgICAgIGlmIChwYXJ0cy5wb3J0ID09PSAnLycpIHtcbiAgICAgICAgcGFydHMucG9ydCA9IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmaXJzdENvbG9uID0gc3RyaW5nLmluZGV4T2YoJzonKTtcbiAgICAgIHZhciBmaXJzdFNsYXNoID0gc3RyaW5nLmluZGV4T2YoJy8nKTtcbiAgICAgIHZhciBuZXh0Q29sb24gPSBzdHJpbmcuaW5kZXhPZignOicsIGZpcnN0Q29sb24gKyAxKTtcbiAgICAgIGlmIChuZXh0Q29sb24gIT09IC0xICYmIChmaXJzdFNsYXNoID09PSAtMSB8fCBuZXh0Q29sb24gPCBmaXJzdFNsYXNoKSkge1xuICAgICAgICAvLyBJUHY2IGhvc3QgY29udGFpbnMgbXVsdGlwbGUgY29sb25zIC0gYnV0IG5vIHBvcnRcbiAgICAgICAgLy8gdGhpcyBub3RhdGlvbiBpcyBhY3R1YWxseSBub3QgYWxsb3dlZCBieSBSRkMgMzk4NiwgYnV0IHdlJ3JlIGEgbGliZXJhbCBwYXJzZXJcbiAgICAgICAgcGFydHMuaG9zdG5hbWUgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykgfHwgbnVsbDtcbiAgICAgICAgcGFydHMucG9ydCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpLnNwbGl0KCc6Jyk7XG4gICAgICAgIHBhcnRzLmhvc3RuYW1lID0gdFswXSB8fCBudWxsO1xuICAgICAgICBwYXJ0cy5wb3J0ID0gdFsxXSB8fCBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJ0cy5ob3N0bmFtZSAmJiBzdHJpbmcuc3Vic3RyaW5nKHBvcykuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHBvcysrO1xuICAgICAgc3RyaW5nID0gJy8nICsgc3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcuc3Vic3RyaW5nKHBvcykgfHwgJy8nO1xuICB9O1xuICBVUkkucGFyc2VBdXRob3JpdHkgPSBmdW5jdGlvbihzdHJpbmcsIHBhcnRzKSB7XG4gICAgc3RyaW5nID0gVVJJLnBhcnNlVXNlcmluZm8oc3RyaW5nLCBwYXJ0cyk7XG4gICAgcmV0dXJuIFVSSS5wYXJzZUhvc3Qoc3RyaW5nLCBwYXJ0cyk7XG4gIH07XG4gIFVSSS5wYXJzZVVzZXJpbmZvID0gZnVuY3Rpb24oc3RyaW5nLCBwYXJ0cykge1xuICAgIC8vIGV4dHJhY3QgdXNlcm5hbWU6cGFzc3dvcmRcbiAgICB2YXIgZmlyc3RTbGFzaCA9IHN0cmluZy5pbmRleE9mKCcvJyk7XG4gICAgdmFyIHBvcyA9IHN0cmluZy5sYXN0SW5kZXhPZignQCcsIGZpcnN0U2xhc2ggPiAtMSA/IGZpcnN0U2xhc2ggOiBzdHJpbmcubGVuZ3RoIC0gMSk7XG4gICAgdmFyIHQ7XG5cbiAgICAvLyBhdXRob3JpdHlAIG11c3QgY29tZSBiZWZvcmUgL3BhdGhcbiAgICBpZiAocG9zID4gLTEgJiYgKGZpcnN0U2xhc2ggPT09IC0xIHx8IHBvcyA8IGZpcnN0U2xhc2gpKSB7XG4gICAgICB0ID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpLnNwbGl0KCc6Jyk7XG4gICAgICBwYXJ0cy51c2VybmFtZSA9IHRbMF0gPyBVUkkuZGVjb2RlKHRbMF0pIDogbnVsbDtcbiAgICAgIHQuc2hpZnQoKTtcbiAgICAgIHBhcnRzLnBhc3N3b3JkID0gdFswXSA/IFVSSS5kZWNvZGUodC5qb2luKCc6JykpIDogbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnVzZXJuYW1lID0gbnVsbDtcbiAgICAgIHBhcnRzLnBhc3N3b3JkID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xuICBVUkkucGFyc2VRdWVyeSA9IGZ1bmN0aW9uKHN0cmluZywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLy8gdGhyb3cgb3V0IHRoZSBmdW5reSBidXNpbmVzcyAtIFwiP1wiW25hbWVcIj1cInZhbHVlXCImXCJdK1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC8mKy9nLCAnJicpLnJlcGxhY2UoL15cXD8qJip8JiskL2csICcnKTtcblxuICAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgdmFyIGl0ZW1zID0ge307XG4gICAgdmFyIHNwbGl0cyA9IHN0cmluZy5zcGxpdCgnJicpO1xuICAgIHZhciBsZW5ndGggPSBzcGxpdHMubGVuZ3RoO1xuICAgIHZhciB2LCBuYW1lLCB2YWx1ZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHYgPSBzcGxpdHNbaV0uc3BsaXQoJz0nKTtcbiAgICAgIG5hbWUgPSBVUkkuZGVjb2RlUXVlcnkodi5zaGlmdCgpLCBlc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIC8vIG5vIFwiPVwiIGlzIG51bGwgYWNjb3JkaW5nIHRvIGh0dHA6Ly9kdmNzLnczLm9yZy9oZy91cmwvcmF3LWZpbGUvdGlwL092ZXJ2aWV3Lmh0bWwjY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgICAgdmFsdWUgPSB2Lmxlbmd0aCA/IFVSSS5kZWNvZGVRdWVyeSh2LmpvaW4oJz0nKSwgZXNjYXBlUXVlcnlTcGFjZSkgOiBudWxsO1xuXG4gICAgICBpZiAoaGFzT3duLmNhbGwoaXRlbXMsIG5hbWUpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbXNbbmFtZV0gPT09ICdzdHJpbmcnIHx8IGl0ZW1zW25hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgaXRlbXNbbmFtZV0gPSBbaXRlbXNbbmFtZV1dO1xuICAgICAgICB9XG5cbiAgICAgICAgaXRlbXNbbmFtZV0ucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbiAgfTtcblxuICBVUkkuYnVpbGQgPSBmdW5jdGlvbihwYXJ0cykge1xuICAgIHZhciB0ID0gJyc7XG5cbiAgICBpZiAocGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHQgKz0gcGFydHMucHJvdG9jb2wgKyAnOic7XG4gICAgfVxuXG4gICAgaWYgKCFwYXJ0cy51cm4gJiYgKHQgfHwgcGFydHMuaG9zdG5hbWUpKSB7XG4gICAgICB0ICs9ICcvLyc7XG4gICAgfVxuXG4gICAgdCArPSAoVVJJLmJ1aWxkQXV0aG9yaXR5KHBhcnRzKSB8fCAnJyk7XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzLnBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAocGFydHMucGF0aC5jaGFyQXQoMCkgIT09ICcvJyAmJiB0eXBlb2YgcGFydHMuaG9zdG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHQgKz0gJy8nO1xuICAgICAgfVxuXG4gICAgICB0ICs9IHBhcnRzLnBhdGg7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwYXJ0cy5xdWVyeSA9PT0gJ3N0cmluZycgJiYgcGFydHMucXVlcnkpIHtcbiAgICAgIHQgKz0gJz8nICsgcGFydHMucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwYXJ0cy5mcmFnbWVudCA9PT0gJ3N0cmluZycgJiYgcGFydHMuZnJhZ21lbnQpIHtcbiAgICAgIHQgKz0gJyMnICsgcGFydHMuZnJhZ21lbnQ7XG4gICAgfVxuICAgIHJldHVybiB0O1xuICB9O1xuICBVUkkuYnVpbGRIb3N0ID0gZnVuY3Rpb24ocGFydHMpIHtcbiAgICB2YXIgdCA9ICcnO1xuXG4gICAgaWYgKCFwYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0gZWxzZSBpZiAoVVJJLmlwNl9leHByZXNzaW9uLnRlc3QocGFydHMuaG9zdG5hbWUpKSB7XG4gICAgICB0ICs9ICdbJyArIHBhcnRzLmhvc3RuYW1lICsgJ10nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ICs9IHBhcnRzLmhvc3RuYW1lO1xuICAgIH1cblxuICAgIGlmIChwYXJ0cy5wb3J0KSB7XG4gICAgICB0ICs9ICc6JyArIHBhcnRzLnBvcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHQ7XG4gIH07XG4gIFVSSS5idWlsZEF1dGhvcml0eSA9IGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgcmV0dXJuIFVSSS5idWlsZFVzZXJpbmZvKHBhcnRzKSArIFVSSS5idWlsZEhvc3QocGFydHMpO1xuICB9O1xuICBVUkkuYnVpbGRVc2VyaW5mbyA9IGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgdmFyIHQgPSAnJztcblxuICAgIGlmIChwYXJ0cy51c2VybmFtZSkge1xuICAgICAgdCArPSBVUkkuZW5jb2RlKHBhcnRzLnVzZXJuYW1lKTtcblxuICAgICAgaWYgKHBhcnRzLnBhc3N3b3JkKSB7XG4gICAgICAgIHQgKz0gJzonICsgVVJJLmVuY29kZShwYXJ0cy5wYXNzd29yZCk7XG4gICAgICB9XG5cbiAgICAgIHQgKz0gJ0AnO1xuICAgIH1cblxuICAgIHJldHVybiB0O1xuICB9O1xuICBVUkkuYnVpbGRRdWVyeSA9IGZ1bmN0aW9uKGRhdGEsIGR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIC8vIGFjY29yZGluZyB0byBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2IG9yIGh0dHA6Ly9sYWJzLmFwYWNoZS5vcmcvd2ViYXJjaC91cmkvcmZjL3JmYzM5ODYuaHRtbFxuICAgIC8vIGJlaW5nIMK7LS5ffiEkJicoKSorLDs9OkAvP8KrICVIRVggYW5kIGFsbnVtIGFyZSBhbGxvd2VkXG4gICAgLy8gdGhlIFJGQyBleHBsaWNpdGx5IHN0YXRlcyA/L2ZvbyBiZWluZyBhIHZhbGlkIHVzZSBjYXNlLCBubyBtZW50aW9uIG9mIHBhcmFtZXRlciBzeW50YXghXG4gICAgLy8gVVJJLmpzIHRyZWF0cyB0aGUgcXVlcnkgc3RyaW5nIGFzIGJlaW5nIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9SRUMtaHRtbDQwL2ludGVyYWN0L2Zvcm1zLmh0bWwjZm9ybS1jb250ZW50LXR5cGVcblxuICAgIHZhciB0ID0gJyc7XG4gICAgdmFyIHVuaXF1ZSwga2V5LCBpLCBsZW5ndGg7XG4gICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKGhhc093bi5jYWxsKGRhdGEsIGtleSkgJiYga2V5KSB7XG4gICAgICAgIGlmIChpc0FycmF5KGRhdGFba2V5XSkpIHtcbiAgICAgICAgICB1bmlxdWUgPSB7fTtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBkYXRhW2tleV0ubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2tleV1baV0gIT09IHVuZGVmaW5lZCAmJiB1bmlxdWVbZGF0YVtrZXldW2ldICsgJyddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgdCArPSAnJicgKyBVUkkuYnVpbGRRdWVyeVBhcmFtZXRlcihrZXksIGRhdGFba2V5XVtpXSwgZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICAgICAgICAgIGlmIChkdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB1bmlxdWVbZGF0YVtrZXldW2ldICsgJyddID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkYXRhW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHQgKz0gJyYnICsgVVJJLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoa2V5LCBkYXRhW2tleV0sIGVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHQuc3Vic3RyaW5nKDEpO1xuICB9O1xuICBVUkkuYnVpbGRRdWVyeVBhcmFtZXRlciA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MC9pbnRlcmFjdC9mb3Jtcy5odG1sI2Zvcm0tY29udGVudC10eXBlIC0tIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAgIC8vIGRvbid0IGFwcGVuZCBcIj1cIiBmb3IgbnVsbCB2YWx1ZXMsIGFjY29yZGluZyB0byBodHRwOi8vZHZjcy53My5vcmcvaGcvdXJsL3Jhdy1maWxlL3RpcC9PdmVydmlldy5odG1sI3VybC1wYXJhbWV0ZXItc2VyaWFsaXphdGlvblxuICAgIHJldHVybiBVUkkuZW5jb2RlUXVlcnkobmFtZSwgZXNjYXBlUXVlcnlTcGFjZSkgKyAodmFsdWUgIT09IG51bGwgPyAnPScgKyBVUkkuZW5jb2RlUXVlcnkodmFsdWUsIGVzY2FwZVF1ZXJ5U3BhY2UpIDogJycpO1xuICB9O1xuXG4gIFVSSS5hZGRRdWVyeSA9IGZ1bmN0aW9uKGRhdGEsIG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKG5hbWUsIGtleSkpIHtcbiAgICAgICAgICBVUkkuYWRkUXVlcnkoZGF0YSwga2V5LCBuYW1lW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChkYXRhW25hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhW25hbWVdID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRhW25hbWVdID0gW2RhdGFbbmFtZV1dO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gW3ZhbHVlXTtcbiAgICAgIH1cblxuICAgICAgZGF0YVtuYW1lXSA9IChkYXRhW25hbWVdIHx8IFtdKS5jb25jYXQodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuYWRkUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlcicpO1xuICAgIH1cbiAgfTtcbiAgVVJJLnJlbW92ZVF1ZXJ5ID0gZnVuY3Rpb24oZGF0YSwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgaSwgbGVuZ3RoLCBrZXk7XG5cbiAgICBpZiAoaXNBcnJheShuYW1lKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gbmFtZS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBkYXRhW25hbWVbaV1dID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ2V0VHlwZShuYW1lKSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgICAgaWYgKG5hbWUudGVzdChrZXkpKSB7XG4gICAgICAgICAgZGF0YVtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAoa2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKG5hbWUsIGtleSkpIHtcbiAgICAgICAgICBVUkkucmVtb3ZlUXVlcnkoZGF0YSwga2V5LCBuYW1lW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChnZXRUeXBlKHZhbHVlKSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkgJiYgdmFsdWUudGVzdChkYXRhW25hbWVdKSkge1xuICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YVtuYW1lXSA9IGZpbHRlckFycmF5VmFsdWVzKGRhdGFbbmFtZV0sIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YVtuYW1lXSA9PT0gU3RyaW5nKHZhbHVlKSAmJiAoIWlzQXJyYXkodmFsdWUpIHx8IHZhbHVlLmxlbmd0aCA9PT0gMSkpIHtcbiAgICAgICAgICBkYXRhW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICBkYXRhW25hbWVdID0gZmlsdGVyQXJyYXlWYWx1ZXMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkYXRhW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkucmVtb3ZlUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nLCBSZWdFeHAgYXMgdGhlIGZpcnN0IHBhcmFtZXRlcicpO1xuICAgIH1cbiAgfTtcbiAgVVJJLmhhc1F1ZXJ5ID0gZnVuY3Rpb24oZGF0YSwgbmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKG5hbWUsIGtleSkpIHtcbiAgICAgICAgICBpZiAoIVVSSS5oYXNRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5oYXNRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChnZXRUeXBlKHZhbHVlKSkge1xuICAgICAgY2FzZSAnVW5kZWZpbmVkJzpcbiAgICAgICAgLy8gdHJ1ZSBpZiBleGlzdHMgKGJ1dCBtYXkgYmUgZW1wdHkpXG4gICAgICAgIHJldHVybiBuYW1lIGluIGRhdGE7IC8vIGRhdGFbbmFtZV0gIT09IHVuZGVmaW5lZDtcblxuICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgIC8vIHRydWUgaWYgZXhpc3RzIGFuZCBub24tZW1wdHlcbiAgICAgICAgdmFyIF9ib29seSA9IEJvb2xlYW4oaXNBcnJheShkYXRhW25hbWVdKSA/IGRhdGFbbmFtZV0ubGVuZ3RoIDogZGF0YVtuYW1lXSk7XG4gICAgICAgIHJldHVybiB2YWx1ZSA9PT0gX2Jvb2x5O1xuXG4gICAgICBjYXNlICdGdW5jdGlvbic6XG4gICAgICAgIC8vIGFsbG93IGNvbXBsZXggY29tcGFyaXNvblxuICAgICAgICByZXR1cm4gISF2YWx1ZShkYXRhW25hbWVdLCBuYW1lLCBkYXRhKTtcblxuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3AgPSB3aXRoaW5BcnJheSA/IGFycmF5Q29udGFpbnMgOiBhcnJheXNFcXVhbDtcbiAgICAgICAgcmV0dXJuIG9wKGRhdGFbbmFtZV0sIHZhbHVlKTtcblxuICAgICAgY2FzZSAnUmVnRXhwJzpcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgcmV0dXJuIEJvb2xlYW4oZGF0YVtuYW1lXSAmJiBkYXRhW25hbWVdLm1hdGNoKHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdpdGhpbkFycmF5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5Q29udGFpbnMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuXG4gICAgICBjYXNlICdOdW1iZXInOlxuICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICAgIGlmICghaXNBcnJheShkYXRhW25hbWVdKSkge1xuICAgICAgICAgIHJldHVybiBkYXRhW25hbWVdID09PSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghd2l0aGluQXJyYXkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJyYXlDb250YWlucyhkYXRhW25hbWVdLCB2YWx1ZSk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5oYXNRdWVyeSgpIGFjY2VwdHMgdW5kZWZpbmVkLCBib29sZWFuLCBzdHJpbmcsIG51bWJlciwgUmVnRXhwLCBGdW5jdGlvbiBhcyB0aGUgdmFsdWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuICB9O1xuXG5cbiAgVVJJLmNvbW1vblBhdGggPSBmdW5jdGlvbihvbmUsIHR3bykge1xuICAgIHZhciBsZW5ndGggPSBNYXRoLm1pbihvbmUubGVuZ3RoLCB0d28ubGVuZ3RoKTtcbiAgICB2YXIgcG9zO1xuXG4gICAgLy8gZmluZCBmaXJzdCBub24tbWF0Y2hpbmcgY2hhcmFjdGVyXG4gICAgZm9yIChwb3MgPSAwOyBwb3MgPCBsZW5ndGg7IHBvcysrKSB7XG4gICAgICBpZiAob25lLmNoYXJBdChwb3MpICE9PSB0d28uY2hhckF0KHBvcykpIHtcbiAgICAgICAgcG9zLS07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3MgPCAxKSB7XG4gICAgICByZXR1cm4gb25lLmNoYXJBdCgwKSA9PT0gdHdvLmNoYXJBdCgwKSAmJiBvbmUuY2hhckF0KDApID09PSAnLycgPyAnLycgOiAnJztcbiAgICB9XG5cbiAgICAvLyByZXZlcnQgdG8gbGFzdCAvXG4gICAgaWYgKG9uZS5jaGFyQXQocG9zKSAhPT0gJy8nIHx8IHR3by5jaGFyQXQocG9zKSAhPT0gJy8nKSB7XG4gICAgICBwb3MgPSBvbmUuc3Vic3RyaW5nKDAsIHBvcykubGFzdEluZGV4T2YoJy8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb25lLnN1YnN0cmluZygwLCBwb3MgKyAxKTtcbiAgfTtcblxuICBVUkkud2l0aGluU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nLCBjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgdmFyIF9zdGFydCA9IG9wdGlvbnMuc3RhcnQgfHwgVVJJLmZpbmRVcmkuc3RhcnQ7XG4gICAgdmFyIF9lbmQgPSBvcHRpb25zLmVuZCB8fCBVUkkuZmluZFVyaS5lbmQ7XG4gICAgdmFyIF90cmltID0gb3B0aW9ucy50cmltIHx8IFVSSS5maW5kVXJpLnRyaW07XG4gICAgdmFyIF9hdHRyaWJ1dGVPcGVuID0gL1thLXowLTktXT1bXCInXT8kL2k7XG5cbiAgICBfc3RhcnQubGFzdEluZGV4ID0gMDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIG1hdGNoID0gX3N0YXJ0LmV4ZWMoc3RyaW5nKTtcbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGFydCA9IG1hdGNoLmluZGV4O1xuICAgICAgaWYgKG9wdGlvbnMuaWdub3JlSHRtbCkge1xuICAgICAgICAvLyBhdHRyaWJ1dChlPVtcIiddPyQpXG4gICAgICAgIHZhciBhdHRyaWJ1dGVPcGVuID0gc3RyaW5nLnNsaWNlKE1hdGgubWF4KHN0YXJ0IC0gMywgMCksIHN0YXJ0KTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZU9wZW4gJiYgX2F0dHJpYnV0ZU9wZW4udGVzdChhdHRyaWJ1dGVPcGVuKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBlbmQgPSBzdGFydCArIHN0cmluZy5zbGljZShzdGFydCkuc2VhcmNoKF9lbmQpO1xuICAgICAgdmFyIHNsaWNlID0gc3RyaW5nLnNsaWNlKHN0YXJ0LCBlbmQpLnJlcGxhY2UoX3RyaW0sICcnKTtcbiAgICAgIGlmIChvcHRpb25zLmlnbm9yZSAmJiBvcHRpb25zLmlnbm9yZS50ZXN0KHNsaWNlKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZW5kID0gc3RhcnQgKyBzbGljZS5sZW5ndGg7XG4gICAgICB2YXIgcmVzdWx0ID0gY2FsbGJhY2soc2xpY2UsIHN0YXJ0LCBlbmQsIHN0cmluZyk7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMCwgc3RhcnQpICsgcmVzdWx0ICsgc3RyaW5nLnNsaWNlKGVuZCk7XG4gICAgICBfc3RhcnQubGFzdEluZGV4ID0gc3RhcnQgKyByZXN1bHQubGVuZ3RoO1xuICAgIH1cblxuICAgIF9zdGFydC5sYXN0SW5kZXggPSAwO1xuICAgIHJldHVybiBzdHJpbmc7XG4gIH07XG5cbiAgVVJJLmVuc3VyZVZhbGlkSG9zdG5hbWUgPSBmdW5jdGlvbih2KSB7XG4gICAgLy8gVGhlb3JldGljYWxseSBVUklzIGFsbG93IHBlcmNlbnQtZW5jb2RpbmcgaW4gSG9zdG5hbWVzIChhY2NvcmRpbmcgdG8gUkZDIDM5ODYpXG4gICAgLy8gdGhleSBhcmUgbm90IHBhcnQgb2YgRE5TIGFuZCB0aGVyZWZvcmUgaWdub3JlZCBieSBVUkkuanNcblxuICAgIGlmICh2Lm1hdGNoKFVSSS5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMpKSB7XG4gICAgICAvLyB0ZXN0IHB1bnljb2RlXG4gICAgICBpZiAoIXB1bnljb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0hvc3RuYW1lIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuLV0gYW5kIFB1bnljb2RlLmpzIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHB1bnljb2RlLnRvQVNDSUkodikubWF0Y2goVVJJLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXScpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBub0NvbmZsaWN0XG4gIFVSSS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24ocmVtb3ZlQWxsKSB7XG4gICAgaWYgKHJlbW92ZUFsbCkge1xuICAgICAgdmFyIHVuY29uZmxpY3RlZCA9IHtcbiAgICAgICAgVVJJOiB0aGlzLm5vQ29uZmxpY3QoKVxuICAgICAgfTtcblxuICAgICAgaWYgKHJvb3QuVVJJVGVtcGxhdGUgJiYgdHlwZW9mIHJvb3QuVVJJVGVtcGxhdGUubm9Db25mbGljdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB1bmNvbmZsaWN0ZWQuVVJJVGVtcGxhdGUgPSByb290LlVSSVRlbXBsYXRlLm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3QuSVB2NiAmJiB0eXBlb2Ygcm9vdC5JUHY2Lm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLklQdjYgPSByb290LklQdjYubm9Db25mbGljdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAocm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgJiYgdHlwZW9mIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLlNlY29uZExldmVsRG9tYWlucyA9IHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuY29uZmxpY3RlZDtcbiAgICB9IGVsc2UgaWYgKHJvb3QuVVJJID09PSB0aGlzKSB7XG4gICAgICByb290LlVSSSA9IF9VUkk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5idWlsZCA9IGZ1bmN0aW9uKGRlZmVyQnVpbGQpIHtcbiAgICBpZiAoZGVmZXJCdWlsZCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5fZGVmZXJyZWRfYnVpbGQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoZGVmZXJCdWlsZCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuX2RlZmVycmVkX2J1aWxkKSB7XG4gICAgICB0aGlzLl9zdHJpbmcgPSBVUkkuYnVpbGQodGhpcy5fcGFydHMpO1xuICAgICAgdGhpcy5fZGVmZXJyZWRfYnVpbGQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBwLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBVUkkodGhpcyk7XG4gIH07XG5cbiAgcC52YWx1ZU9mID0gcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmJ1aWxkKGZhbHNlKS5fc3RyaW5nO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcihfcGFydCl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0c1tfcGFydF0gfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wYXJ0c1tfcGFydF0gPSB2IHx8IG51bGw7XG4gICAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoX3BhcnQsIF9rZXkpe1xuICAgIHJldHVybiBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHNbX3BhcnRdIHx8ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHYgIT09IG51bGwpIHtcbiAgICAgICAgICB2ID0gdiArICcnO1xuICAgICAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gX2tleSkge1xuICAgICAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BhcnRzW19wYXJ0XSA9IHY7XG4gICAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHAucHJvdG9jb2wgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCdwcm90b2NvbCcpO1xuICBwLnVzZXJuYW1lID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcigndXNlcm5hbWUnKTtcbiAgcC5wYXNzd29yZCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3Bhc3N3b3JkJyk7XG4gIHAuaG9zdG5hbWUgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCdob3N0bmFtZScpO1xuICBwLnBvcnQgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCdwb3J0Jyk7XG4gIHAucXVlcnkgPSBnZW5lcmF0ZVByZWZpeEFjY2Vzc29yKCdxdWVyeScsICc/Jyk7XG4gIHAuZnJhZ21lbnQgPSBnZW5lcmF0ZVByZWZpeEFjY2Vzc29yKCdmcmFnbWVudCcsICcjJyk7XG5cbiAgcC5zZWFyY2ggPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIHZhciB0ID0gdGhpcy5xdWVyeSh2LCBidWlsZCk7XG4gICAgcmV0dXJuIHR5cGVvZiB0ID09PSAnc3RyaW5nJyAmJiB0Lmxlbmd0aCA/ICgnPycgKyB0KSA6IHQ7XG4gIH07XG4gIHAuaGFzaCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgdmFyIHQgPSB0aGlzLmZyYWdtZW50KHYsIGJ1aWxkKTtcbiAgICByZXR1cm4gdHlwZW9mIHQgPT09ICdzdHJpbmcnICYmIHQubGVuZ3RoID8gKCcjJyArIHQpIDogdDtcbiAgfTtcblxuICBwLnBhdGhuYW1lID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIHZhciByZXMgPSB0aGlzLl9wYXJ0cy5wYXRoIHx8ICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/ICcvJyA6ICcnKTtcbiAgICAgIHJldHVybiB2ID8gKHRoaXMuX3BhcnRzLnVybiA/IFVSSS5kZWNvZGVVcm5QYXRoIDogVVJJLmRlY29kZVBhdGgpKHJlcykgOiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgICAgdGhpcy5fcGFydHMucGF0aCA9IHYgPyBVUkkucmVjb2RlVXJuUGF0aCh2KSA6ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGFydHMucGF0aCA9IHYgPyBVUkkucmVjb2RlUGF0aCh2KSA6ICcvJztcbiAgICAgIH1cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5wYXRoID0gcC5wYXRobmFtZTtcbiAgcC5ocmVmID0gZnVuY3Rpb24oaHJlZiwgYnVpbGQpIHtcbiAgICB2YXIga2V5O1xuXG4gICAgaWYgKGhyZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdHJpbmcgPSAnJztcbiAgICB0aGlzLl9wYXJ0cyA9IFVSSS5fcGFydHMoKTtcblxuICAgIHZhciBfVVJJID0gaHJlZiBpbnN0YW5jZW9mIFVSSTtcbiAgICB2YXIgX29iamVjdCA9IHR5cGVvZiBocmVmID09PSAnb2JqZWN0JyAmJiAoaHJlZi5ob3N0bmFtZSB8fCBocmVmLnBhdGggfHwgaHJlZi5wYXRobmFtZSk7XG4gICAgaWYgKGhyZWYubm9kZU5hbWUpIHtcbiAgICAgIHZhciBhdHRyaWJ1dGUgPSBVUkkuZ2V0RG9tQXR0cmlidXRlKGhyZWYpO1xuICAgICAgaHJlZiA9IGhyZWZbYXR0cmlidXRlXSB8fCAnJztcbiAgICAgIF9vYmplY3QgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyB3aW5kb3cubG9jYXRpb24gaXMgcmVwb3J0ZWQgdG8gYmUgYW4gb2JqZWN0LCBidXQgaXQncyBub3QgdGhlIHNvcnRcbiAgICAvLyBvZiBvYmplY3Qgd2UncmUgbG9va2luZyBmb3I6XG4gICAgLy8gKiBsb2NhdGlvbi5wcm90b2NvbCBlbmRzIHdpdGggYSBjb2xvblxuICAgIC8vICogbG9jYXRpb24ucXVlcnkgIT0gb2JqZWN0LnNlYXJjaFxuICAgIC8vICogbG9jYXRpb24uaGFzaCAhPSBvYmplY3QuZnJhZ21lbnRcbiAgICAvLyBzaW1wbHkgc2VyaWFsaXppbmcgdGhlIHVua25vd24gb2JqZWN0IHNob3VsZCBkbyB0aGUgdHJpY2tcbiAgICAvLyAoZm9yIGxvY2F0aW9uLCBub3QgZm9yIGV2ZXJ5dGhpbmcuLi4pXG4gICAgaWYgKCFfVVJJICYmIF9vYmplY3QgJiYgaHJlZi5wYXRobmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBocmVmID0gaHJlZi50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaHJlZiA9PT0gJ3N0cmluZycgfHwgaHJlZiBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgdGhpcy5fcGFydHMgPSBVUkkucGFyc2UoU3RyaW5nKGhyZWYpLCB0aGlzLl9wYXJ0cyk7XG4gICAgfSBlbHNlIGlmIChfVVJJIHx8IF9vYmplY3QpIHtcbiAgICAgIHZhciBzcmMgPSBfVVJJID8gaHJlZi5fcGFydHMgOiBocmVmO1xuICAgICAgZm9yIChrZXkgaW4gc3JjKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbCh0aGlzLl9wYXJ0cywga2V5KSkge1xuICAgICAgICAgIHRoaXMuX3BhcnRzW2tleV0gPSBzcmNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbnZhbGlkIGlucHV0Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIGlkZW50aWZpY2F0aW9uIGFjY2Vzc29yc1xuICBwLmlzID0gZnVuY3Rpb24od2hhdCkge1xuICAgIHZhciBpcCA9IGZhbHNlO1xuICAgIHZhciBpcDQgPSBmYWxzZTtcbiAgICB2YXIgaXA2ID0gZmFsc2U7XG4gICAgdmFyIG5hbWUgPSBmYWxzZTtcbiAgICB2YXIgc2xkID0gZmFsc2U7XG4gICAgdmFyIGlkbiA9IGZhbHNlO1xuICAgIHZhciBwdW55Y29kZSA9IGZhbHNlO1xuICAgIHZhciByZWxhdGl2ZSA9ICF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICBpZiAodGhpcy5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIHJlbGF0aXZlID0gZmFsc2U7XG4gICAgICBpcDQgPSBVUkkuaXA0X2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpcDYgPSBVUkkuaXA2X2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpcCA9IGlwNCB8fCBpcDY7XG4gICAgICBuYW1lID0gIWlwO1xuICAgICAgc2xkID0gbmFtZSAmJiBTTEQgJiYgU0xELmhhcyh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpZG4gPSBuYW1lICYmIFVSSS5pZG5fZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIHB1bnljb2RlID0gbmFtZSAmJiBVUkkucHVueWNvZGVfZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHdoYXQudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAncmVsYXRpdmUnOlxuICAgICAgICByZXR1cm4gcmVsYXRpdmU7XG5cbiAgICAgIGNhc2UgJ2Fic29sdXRlJzpcbiAgICAgICAgcmV0dXJuICFyZWxhdGl2ZTtcblxuICAgICAgLy8gaG9zdG5hbWUgaWRlbnRpZmljYXRpb25cbiAgICAgIGNhc2UgJ2RvbWFpbic6XG4gICAgICBjYXNlICduYW1lJzpcbiAgICAgICAgcmV0dXJuIG5hbWU7XG5cbiAgICAgIGNhc2UgJ3NsZCc6XG4gICAgICAgIHJldHVybiBzbGQ7XG5cbiAgICAgIGNhc2UgJ2lwJzpcbiAgICAgICAgcmV0dXJuIGlwO1xuXG4gICAgICBjYXNlICdpcDQnOlxuICAgICAgY2FzZSAnaXB2NCc6XG4gICAgICBjYXNlICdpbmV0NCc6XG4gICAgICAgIHJldHVybiBpcDQ7XG5cbiAgICAgIGNhc2UgJ2lwNic6XG4gICAgICBjYXNlICdpcHY2JzpcbiAgICAgIGNhc2UgJ2luZXQ2JzpcbiAgICAgICAgcmV0dXJuIGlwNjtcblxuICAgICAgY2FzZSAnaWRuJzpcbiAgICAgICAgcmV0dXJuIGlkbjtcblxuICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgcmV0dXJuICF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICAgIGNhc2UgJ3Vybic6XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3BhcnRzLnVybjtcblxuICAgICAgY2FzZSAncHVueWNvZGUnOlxuICAgICAgICByZXR1cm4gcHVueWNvZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLy8gY29tcG9uZW50IHNwZWNpZmljIGlucHV0IHZhbGlkYXRpb25cbiAgdmFyIF9wcm90b2NvbCA9IHAucHJvdG9jb2w7XG4gIHZhciBfcG9ydCA9IHAucG9ydDtcbiAgdmFyIF9ob3N0bmFtZSA9IHAuaG9zdG5hbWU7XG5cbiAgcC5wcm90b2NvbCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHYpIHtcbiAgICAgICAgLy8gYWNjZXB0IHRyYWlsaW5nIDovL1xuICAgICAgICB2ID0gdi5yZXBsYWNlKC86KFxcL1xcLyk/JC8sICcnKTtcblxuICAgICAgICBpZiAoIXYubWF0Y2goVVJJLnByb3RvY29sX2V4cHJlc3Npb24pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvdG9jb2wgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4rLV0gb3IgZG9lc25cXCd0IHN0YXJ0IHdpdGggW0EtWl0nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3Byb3RvY29sLmNhbGwodGhpcywgdiwgYnVpbGQpO1xuICB9O1xuICBwLnNjaGVtZSA9IHAucHJvdG9jb2w7XG4gIHAucG9ydCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodiA9PT0gMCkge1xuICAgICAgICB2ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHYpIHtcbiAgICAgICAgdiArPSAnJztcbiAgICAgICAgaWYgKHYuY2hhckF0KDApID09PSAnOicpIHtcbiAgICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodi5tYXRjaCgvW14wLTldLykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQb3J0IFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFswLTldJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9wb3J0LmNhbGwodGhpcywgdiwgYnVpbGQpO1xuICB9O1xuICBwLmhvc3RuYW1lID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB4ID0ge307XG4gICAgICB2YXIgcmVzID0gVVJJLnBhcnNlSG9zdCh2LCB4KTtcbiAgICAgIGlmIChyZXMgIT09ICcvJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdIb3N0bmFtZSBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05Li1dJyk7XG4gICAgICB9XG5cbiAgICAgIHYgPSB4Lmhvc3RuYW1lO1xuICAgIH1cbiAgICByZXR1cm4gX2hvc3RuYW1lLmNhbGwodGhpcywgdiwgYnVpbGQpO1xuICB9O1xuXG4gIC8vIGNvbXBvdW5kIGFjY2Vzc29yc1xuICBwLm9yaWdpbiA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgdmFyIHBhcnRzO1xuXG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sKCk7XG4gICAgICB2YXIgYXV0aG9yaXR5ID0gdGhpcy5hdXRob3JpdHkoKTtcbiAgICAgIGlmICghYXV0aG9yaXR5KSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gKHByb3RvY29sID8gcHJvdG9jb2wgKyAnOi8vJyA6ICcnKSArIHRoaXMuYXV0aG9yaXR5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBvcmlnaW4gPSBVUkkodik7XG4gICAgICB0aGlzXG4gICAgICAgIC5wcm90b2NvbChvcmlnaW4ucHJvdG9jb2woKSlcbiAgICAgICAgLmF1dGhvcml0eShvcmlnaW4uYXV0aG9yaXR5KCkpXG4gICAgICAgIC5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmhvc3QgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gVVJJLmJ1aWxkSG9zdCh0aGlzLl9wYXJ0cykgOiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlcyA9IFVSSS5wYXJzZUhvc3QodiwgdGhpcy5fcGFydHMpO1xuICAgICAgaWYgKHJlcyAhPT0gJy8nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0hvc3RuYW1lIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuLV0nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmF1dGhvcml0eSA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUgPyBVUkkuYnVpbGRBdXRob3JpdHkodGhpcy5fcGFydHMpIDogJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXMgPSBVUkkucGFyc2VBdXRob3JpdHkodiwgdGhpcy5fcGFydHMpO1xuICAgICAgaWYgKHJlcyAhPT0gJy8nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0hvc3RuYW1lIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuLV0nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnVzZXJpbmZvID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMudXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgdCA9IFVSSS5idWlsZFVzZXJpbmZvKHRoaXMuX3BhcnRzKTtcbiAgICAgIHJldHVybiB0LnN1YnN0cmluZygwLCB0Lmxlbmd0aCAtMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2W3YubGVuZ3RoLTFdICE9PSAnQCcpIHtcbiAgICAgICAgdiArPSAnQCc7XG4gICAgICB9XG5cbiAgICAgIFVSSS5wYXJzZVVzZXJpbmZvKHYsIHRoaXMuX3BhcnRzKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5yZXNvdXJjZSA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgdmFyIHBhcnRzO1xuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aCgpICsgdGhpcy5zZWFyY2goKSArIHRoaXMuaGFzaCgpO1xuICAgIH1cblxuICAgIHBhcnRzID0gVVJJLnBhcnNlKHYpO1xuICAgIHRoaXMuX3BhcnRzLnBhdGggPSBwYXJ0cy5wYXRoO1xuICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gcGFydHMucXVlcnk7XG4gICAgdGhpcy5fcGFydHMuZnJhZ21lbnQgPSBwYXJ0cy5mcmFnbWVudDtcbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gZnJhY3Rpb24gYWNjZXNzb3JzXG4gIHAuc3ViZG9tYWluID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIC8vIGNvbnZlbmllbmNlLCByZXR1cm4gXCJ3d3dcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBncmFiIGRvbWFpbiBhbmQgYWRkIGFub3RoZXIgc2VnbWVudFxuICAgICAgdmFyIGVuZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMuZG9tYWluKCkubGVuZ3RoIC0gMTtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoMCwgZW5kKSB8fCAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sZW5ndGggLSB0aGlzLmRvbWFpbigpLmxlbmd0aDtcbiAgICAgIHZhciBzdWIgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoMCwgZSk7XG4gICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoJ14nICsgZXNjYXBlUmVnRXgoc3ViKSk7XG5cbiAgICAgIGlmICh2ICYmIHYuY2hhckF0KHYubGVuZ3RoIC0gMSkgIT09ICcuJykge1xuICAgICAgICB2ICs9ICcuJztcbiAgICAgIH1cblxuICAgICAgaWYgKHYpIHtcbiAgICAgICAgVVJJLmVuc3VyZVZhbGlkSG9zdG5hbWUodik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5kb21haW4gPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gY29udmVuaWVuY2UsIHJldHVybiBcImV4YW1wbGUub3JnXCIgZnJvbSBcInd3dy5leGFtcGxlLm9yZ1wiXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgLy8gaWYgaG9zdG5hbWUgY29uc2lzdHMgb2YgMSBvciAyIHNlZ21lbnRzLCBpdCBtdXN0IGJlIHRoZSBkb21haW5cbiAgICAgIHZhciB0ID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubWF0Y2goL1xcLi9nKTtcbiAgICAgIGlmICh0ICYmIHQubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGdyYWIgdGxkIGFuZCBhZGQgYW5vdGhlciBzZWdtZW50XG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy50bGQoYnVpbGQpLmxlbmd0aCAtIDE7XG4gICAgICBlbmQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sYXN0SW5kZXhPZignLicsIGVuZCAtMSkgKyAxO1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZyhlbmQpIHx8ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXYpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2Fubm90IHNldCBkb21haW4gZW1wdHknKTtcbiAgICAgIH1cblxuICAgICAgVVJJLmVuc3VyZVZhbGlkSG9zdG5hbWUodik7XG5cbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy5kb21haW4oKSkgKyAnJCcpO1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC50bGQgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIFwib3JnXCIgZnJvbSBcInd3dy5leGFtcGxlLm9yZ1wiXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgdmFyIHBvcyA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICB2YXIgdGxkID0gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKHBvcyArIDEpO1xuXG4gICAgICBpZiAoYnVpbGQgIT09IHRydWUgJiYgU0xEICYmIFNMRC5saXN0W3RsZC50b0xvd2VyQ2FzZSgpXSkge1xuICAgICAgICByZXR1cm4gU0xELmdldCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkgfHwgdGxkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGxkO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVwbGFjZTtcblxuICAgICAgaWYgKCF2KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Nhbm5vdCBzZXQgVExEIGVtcHR5Jyk7XG4gICAgICB9IGVsc2UgaWYgKHYubWF0Y2goL1teYS16QS1aMC05LV0vKSkge1xuICAgICAgICBpZiAoU0xEICYmIFNMRC5pcyh2KSkge1xuICAgICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHRoaXMudGxkKCkpICsgJyQnKTtcbiAgICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVExEIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTldJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdjYW5ub3Qgc2V0IFRMRCBvbiBub24tZG9tYWluIGhvc3QnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHRoaXMudGxkKCkpICsgJyQnKTtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuZGlyZWN0b3J5ID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5wYXRoICYmICF0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcvJztcbiAgICAgIH1cblxuICAgICAgdmFyIGVuZCA9IHRoaXMuX3BhcnRzLnBhdGgubGVuZ3RoIC0gdGhpcy5maWxlbmFtZSgpLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgcmVzID0gdGhpcy5fcGFydHMucGF0aC5zdWJzdHJpbmcoMCwgZW5kKSB8fCAodGhpcy5fcGFydHMuaG9zdG5hbWUgPyAnLycgOiAnJyk7XG5cbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGgocmVzKSA6IHJlcztcblxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZSA9IHRoaXMuX3BhcnRzLnBhdGgubGVuZ3RoIC0gdGhpcy5maWxlbmFtZSgpLmxlbmd0aDtcbiAgICAgIHZhciBkaXJlY3RvcnkgPSB0aGlzLl9wYXJ0cy5wYXRoLnN1YnN0cmluZygwLCBlKTtcbiAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cCgnXicgKyBlc2NhcGVSZWdFeChkaXJlY3RvcnkpKTtcblxuICAgICAgLy8gZnVsbHkgcXVhbGlmaWVyIGRpcmVjdG9yaWVzIGJlZ2luIHdpdGggYSBzbGFzaFxuICAgICAgaWYgKCF0aGlzLmlzKCdyZWxhdGl2ZScpKSB7XG4gICAgICAgIGlmICghdikge1xuICAgICAgICAgIHYgPSAnLyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodi5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgICAgIHYgPSAnLycgKyB2O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGRpcmVjdG9yaWVzIGFsd2F5cyBlbmQgd2l0aCBhIHNsYXNoXG4gICAgICBpZiAodiAmJiB2LmNoYXJBdCh2Lmxlbmd0aCAtIDEpICE9PSAnLycpIHtcbiAgICAgICAgdiArPSAnLyc7XG4gICAgICB9XG5cbiAgICAgIHYgPSBVUkkucmVjb2RlUGF0aCh2KTtcbiAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuZmlsZW5hbWUgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSB0cnVlKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnBhdGggfHwgdGhpcy5fcGFydHMucGF0aCA9PT0gJy8nKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgdmFyIHBvcyA9IHRoaXMuX3BhcnRzLnBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgIHZhciByZXMgPSB0aGlzLl9wYXJ0cy5wYXRoLnN1YnN0cmluZyhwb3MrMSk7XG5cbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGhTZWdtZW50KHJlcykgOiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBtdXRhdGVkRGlyZWN0b3J5ID0gZmFsc2U7XG5cbiAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHYubWF0Y2goL1xcLj9cXC8vKSkge1xuICAgICAgICBtdXRhdGVkRGlyZWN0b3J5ID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHRoaXMuZmlsZW5hbWUoKSkgKyAnJCcpO1xuICAgICAgdiA9IFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgdGhpcy5fcGFydHMucGF0aCA9IHRoaXMuX3BhcnRzLnBhdGgucmVwbGFjZShyZXBsYWNlLCB2KTtcblxuICAgICAgaWYgKG11dGF0ZWREaXJlY3RvcnkpIHtcbiAgICAgICAgdGhpcy5ub3JtYWxpemVQYXRoKGJ1aWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnN1ZmZpeCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCB0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgZmlsZW5hbWUgPSB0aGlzLmZpbGVuYW1lKCk7XG4gICAgICB2YXIgcG9zID0gZmlsZW5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIHZhciBzLCByZXM7XG5cbiAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgLy8gc3VmZml4IG1heSBvbmx5IGNvbnRhaW4gYWxudW0gY2hhcmFjdGVycyAoeXVwLCBJIG1hZGUgdGhpcyB1cC4pXG4gICAgICBzID0gZmlsZW5hbWUuc3Vic3RyaW5nKHBvcysxKTtcbiAgICAgIHJlcyA9ICgvXlthLXowLTklXSskL2kpLnRlc3QocykgPyBzIDogJyc7XG4gICAgICByZXR1cm4gdiA/IFVSSS5kZWNvZGVQYXRoU2VnbWVudChyZXMpIDogcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodi5jaGFyQXQoMCkgPT09ICcuJykge1xuICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdWZmaXggPSB0aGlzLnN1ZmZpeCgpO1xuICAgICAgdmFyIHJlcGxhY2U7XG5cbiAgICAgIGlmICghc3VmZml4KSB7XG4gICAgICAgIGlmICghdikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFydHMucGF0aCArPSAnLicgKyBVUkkucmVjb2RlUGF0aCh2KTtcbiAgICAgIH0gZWxzZSBpZiAoIXYpIHtcbiAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgoJy4nICsgc3VmZml4KSArICckJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeChzdWZmaXgpICsgJyQnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgICAgdiA9IFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuc2VnbWVudCA9IGZ1bmN0aW9uKHNlZ21lbnQsIHYsIGJ1aWxkKSB7XG4gICAgdmFyIHNlcGFyYXRvciA9IHRoaXMuX3BhcnRzLnVybiA/ICc6JyA6ICcvJztcbiAgICB2YXIgcGF0aCA9IHRoaXMucGF0aCgpO1xuICAgIHZhciBhYnNvbHV0ZSA9IHBhdGguc3Vic3RyaW5nKDAsIDEpID09PSAnLyc7XG4gICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdChzZXBhcmF0b3IpO1xuXG4gICAgaWYgKHNlZ21lbnQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSBzZWdtZW50O1xuICAgICAgc2VnbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZWdtZW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgc2VnbWVudCBcIicgKyBzZWdtZW50ICsgJ1wiLCBtdXN0IGJlIDAtYmFzZWQgaW50ZWdlcicpO1xuICAgIH1cblxuICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgc2VnbWVudHMuc2hpZnQoKTtcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudCA8IDApIHtcbiAgICAgIC8vIGFsbG93IG5lZ2F0aXZlIGluZGV4ZXMgdG8gYWRkcmVzcyBmcm9tIHRoZSBlbmRcbiAgICAgIHNlZ21lbnQgPSBNYXRoLm1heChzZWdtZW50cy5sZW5ndGggKyBzZWdtZW50LCAwKTtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvKmpzaGludCBsYXhicmVhazogdHJ1ZSAqL1xuICAgICAgcmV0dXJuIHNlZ21lbnQgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IHNlZ21lbnRzXG4gICAgICAgIDogc2VnbWVudHNbc2VnbWVudF07XG4gICAgICAvKmpzaGludCBsYXhicmVhazogZmFsc2UgKi9cbiAgICB9IGVsc2UgaWYgKHNlZ21lbnQgPT09IG51bGwgfHwgc2VnbWVudHNbc2VnbWVudF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGlzQXJyYXkodikpIHtcbiAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgLy8gY29sbGFwc2UgZW1wdHkgZWxlbWVudHMgd2l0aGluIGFycmF5XG4gICAgICAgIGZvciAodmFyIGk9MCwgbD12Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghdltpXS5sZW5ndGggJiYgKCFzZWdtZW50cy5sZW5ndGggfHwgIXNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtMV0ubGVuZ3RoKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCAmJiAhc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0xXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlZ21lbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlZ21lbnRzLnB1c2godHJpbVNsYXNoZXModltpXSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHYgfHwgdHlwZW9mIHYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHYgPSB0cmltU2xhc2hlcyh2KTtcbiAgICAgICAgaWYgKHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtMV0gPT09ICcnKSB7XG4gICAgICAgICAgLy8gZW1wdHkgdHJhaWxpbmcgZWxlbWVudHMgaGF2ZSB0byBiZSBvdmVyd3JpdHRlblxuICAgICAgICAgIC8vIHRvIHByZXZlbnQgcmVzdWx0cyBzdWNoIGFzIC9mb28vL2JhclxuICAgICAgICAgIHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtMV0gPSB2O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZ21lbnRzLnB1c2godik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHYpIHtcbiAgICAgICAgc2VnbWVudHNbc2VnbWVudF0gPSB0cmltU2xhc2hlcyh2KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlZ21lbnRzLnNwbGljZShzZWdtZW50LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgIHNlZ21lbnRzLnVuc2hpZnQoJycpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnBhdGgoc2VnbWVudHMuam9pbihzZXBhcmF0b3IpLCBidWlsZCk7XG4gIH07XG4gIHAuc2VnbWVudENvZGVkID0gZnVuY3Rpb24oc2VnbWVudCwgdiwgYnVpbGQpIHtcbiAgICB2YXIgc2VnbWVudHMsIGksIGw7XG5cbiAgICBpZiAodHlwZW9mIHNlZ21lbnQgIT09ICdudW1iZXInKSB7XG4gICAgICBidWlsZCA9IHY7XG4gICAgICB2ID0gc2VnbWVudDtcbiAgICAgIHNlZ21lbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnQoc2VnbWVudCwgdiwgYnVpbGQpO1xuICAgICAgaWYgKCFpc0FycmF5KHNlZ21lbnRzKSkge1xuICAgICAgICBzZWdtZW50cyA9IHNlZ21lbnRzICE9PSB1bmRlZmluZWQgPyBVUkkuZGVjb2RlKHNlZ21lbnRzKSA6IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBzZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBzZWdtZW50c1tpXSA9IFVSSS5kZWNvZGUoc2VnbWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICB9XG5cbiAgICBpZiAoIWlzQXJyYXkodikpIHtcbiAgICAgIHYgPSAodHlwZW9mIHYgPT09ICdzdHJpbmcnIHx8IHYgaW5zdGFuY2VvZiBTdHJpbmcpID8gVVJJLmVuY29kZSh2KSA6IHY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB2Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2W2ldID0gVVJJLmVuY29kZSh2W2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zZWdtZW50KHNlZ21lbnQsIHYsIGJ1aWxkKTtcbiAgfTtcblxuICAvLyBtdXRhdGluZyBxdWVyeSBzdHJpbmdcbiAgdmFyIHEgPSBwLnF1ZXJ5O1xuICBwLnF1ZXJ5ID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodiA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YXIgZGF0YSA9IFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIHZhciByZXN1bHQgPSB2LmNhbGwodGhpcywgZGF0YSk7XG4gICAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IFVSSS5idWlsZFF1ZXJ5KHJlc3VsdCB8fCBkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIGlmICh2ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHYgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IFVSSS5idWlsZFF1ZXJ5KHYsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHEuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gICAgfVxuICB9O1xuICBwLnNldFF1ZXJ5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIGJ1aWxkKSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG5cbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnIHx8IG5hbWUgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgIGRhdGFbbmFtZV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIGRhdGFba2V5XSA9IG5hbWVba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuYWRkUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlcicpO1xuICAgIH1cblxuICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkoZGF0YSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBidWlsZCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5hZGRRdWVyeSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBidWlsZCkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIFVSSS5hZGRRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHZhbHVlKTtcbiAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IFVSSS5idWlsZFF1ZXJ5KGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgYnVpbGQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAucmVtb3ZlUXVlcnkgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgYnVpbGQpIHtcbiAgICB2YXIgZGF0YSA9IFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBVUkkucmVtb3ZlUXVlcnkoZGF0YSwgbmFtZSwgdmFsdWUpO1xuICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkoZGF0YSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBidWlsZCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5oYXNRdWVyeSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCB3aXRoaW5BcnJheSkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIHJldHVybiBVUkkuaGFzUXVlcnkoZGF0YSwgbmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KTtcbiAgfTtcbiAgcC5zZXRTZWFyY2ggPSBwLnNldFF1ZXJ5O1xuICBwLmFkZFNlYXJjaCA9IHAuYWRkUXVlcnk7XG4gIHAucmVtb3ZlU2VhcmNoID0gcC5yZW1vdmVRdWVyeTtcbiAgcC5oYXNTZWFyY2ggPSBwLmhhc1F1ZXJ5O1xuXG4gIC8vIHNhbml0aXppbmcgVVJMc1xuICBwLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB0aGlzXG4gICAgICAgIC5ub3JtYWxpemVQcm90b2NvbChmYWxzZSlcbiAgICAgICAgLm5vcm1hbGl6ZVBhdGgoZmFsc2UpXG4gICAgICAgIC5ub3JtYWxpemVRdWVyeShmYWxzZSlcbiAgICAgICAgLm5vcm1hbGl6ZUZyYWdtZW50KGZhbHNlKVxuICAgICAgICAuYnVpbGQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICAgICAgLm5vcm1hbGl6ZVByb3RvY29sKGZhbHNlKVxuICAgICAgLm5vcm1hbGl6ZUhvc3RuYW1lKGZhbHNlKVxuICAgICAgLm5vcm1hbGl6ZVBvcnQoZmFsc2UpXG4gICAgICAubm9ybWFsaXplUGF0aChmYWxzZSlcbiAgICAgIC5ub3JtYWxpemVRdWVyeShmYWxzZSlcbiAgICAgIC5ub3JtYWxpemVGcmFnbWVudChmYWxzZSlcbiAgICAgIC5idWlsZCgpO1xuICB9O1xuICBwLm5vcm1hbGl6ZVByb3RvY29sID0gZnVuY3Rpb24oYnVpbGQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzLnByb3RvY29sID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcGFydHMucHJvdG9jb2wgPSB0aGlzLl9wYXJ0cy5wcm90b2NvbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZUhvc3RuYW1lID0gZnVuY3Rpb24oYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLmlzKCdJRE4nKSAmJiBwdW55Y29kZSkge1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHB1bnljb2RlLnRvQVNDSUkodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzKCdJUHY2JykgJiYgSVB2Nikge1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IElQdjYuYmVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVQb3J0ID0gZnVuY3Rpb24oYnVpbGQpIHtcbiAgICAvLyByZW1vdmUgcG9ydCBvZiBpdCdzIHRoZSBwcm90b2NvbCdzIGRlZmF1bHRcbiAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzLnByb3RvY29sID09PSAnc3RyaW5nJyAmJiB0aGlzLl9wYXJ0cy5wb3J0ID09PSBVUkkuZGVmYXVsdFBvcnRzW3RoaXMuX3BhcnRzLnByb3RvY29sXSkge1xuICAgICAgdGhpcy5fcGFydHMucG9ydCA9IG51bGw7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplUGF0aCA9IGZ1bmN0aW9uKGJ1aWxkKSB7XG4gICAgdmFyIF9wYXRoID0gdGhpcy5fcGFydHMucGF0aDtcbiAgICBpZiAoIV9wYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gVVJJLnJlY29kZVVyblBhdGgodGhpcy5fcGFydHMucGF0aCk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMucGF0aCA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgX3dhc19yZWxhdGl2ZTtcbiAgICB2YXIgX2xlYWRpbmdQYXJlbnRzID0gJyc7XG4gICAgdmFyIF9wYXJlbnQsIF9wb3M7XG5cbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHNcbiAgICBpZiAoX3BhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIF93YXNfcmVsYXRpdmUgPSB0cnVlO1xuICAgICAgX3BhdGggPSAnLycgKyBfcGF0aDtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgZmlsZXMgKGFzIG9wcG9zZWQgdG8gZGlyZWN0b3JpZXMpXG4gICAgaWYgKF9wYXRoLnNsaWNlKC0zKSA9PT0gJy8uLicgfHwgX3BhdGguc2xpY2UoLTIpID09PSAnLy4nKSB7XG4gICAgICBfcGF0aCArPSAnLyc7XG4gICAgfVxuXG4gICAgLy8gcmVzb2x2ZSBzaW1wbGVzXG4gICAgX3BhdGggPSBfcGF0aFxuICAgICAgLnJlcGxhY2UoLyhcXC8oXFwuXFwvKSspfChcXC9cXC4kKS9nLCAnLycpXG4gICAgICAucmVwbGFjZSgvXFwvezIsfS9nLCAnLycpO1xuXG4gICAgLy8gcmVtZW1iZXIgbGVhZGluZyBwYXJlbnRzXG4gICAgaWYgKF93YXNfcmVsYXRpdmUpIHtcbiAgICAgIF9sZWFkaW5nUGFyZW50cyA9IF9wYXRoLnN1YnN0cmluZygxKS5tYXRjaCgvXihcXC5cXC5cXC8pKy8pIHx8ICcnO1xuICAgICAgaWYgKF9sZWFkaW5nUGFyZW50cykge1xuICAgICAgICBfbGVhZGluZ1BhcmVudHMgPSBfbGVhZGluZ1BhcmVudHNbMF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVzb2x2ZSBwYXJlbnRzXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIF9wYXJlbnQgPSBfcGF0aC5pbmRleE9mKCcvLi4nKTtcbiAgICAgIGlmIChfcGFyZW50ID09PSAtMSkge1xuICAgICAgICAvLyBubyBtb3JlIC4uLyB0byByZXNvbHZlXG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmIChfcGFyZW50ID09PSAwKSB7XG4gICAgICAgIC8vIHRvcCBsZXZlbCBjYW5ub3QgYmUgcmVsYXRpdmUsIHNraXAgaXRcbiAgICAgICAgX3BhdGggPSBfcGF0aC5zdWJzdHJpbmcoMyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBfcG9zID0gX3BhdGguc3Vic3RyaW5nKDAsIF9wYXJlbnQpLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICBpZiAoX3BvcyA9PT0gLTEpIHtcbiAgICAgICAgX3BvcyA9IF9wYXJlbnQ7XG4gICAgICB9XG4gICAgICBfcGF0aCA9IF9wYXRoLnN1YnN0cmluZygwLCBfcG9zKSArIF9wYXRoLnN1YnN0cmluZyhfcGFyZW50ICsgMyk7XG4gICAgfVxuXG4gICAgLy8gcmV2ZXJ0IHRvIHJlbGF0aXZlXG4gICAgaWYgKF93YXNfcmVsYXRpdmUgJiYgdGhpcy5pcygncmVsYXRpdmUnKSkge1xuICAgICAgX3BhdGggPSBfbGVhZGluZ1BhcmVudHMgKyBfcGF0aC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgX3BhdGggPSBVUkkucmVjb2RlUGF0aChfcGF0aCk7XG4gICAgdGhpcy5fcGFydHMucGF0aCA9IF9wYXRoO1xuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVQYXRobmFtZSA9IHAubm9ybWFsaXplUGF0aDtcbiAgcC5ub3JtYWxpemVRdWVyeSA9IGZ1bmN0aW9uKGJ1aWxkKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl9wYXJ0cy5xdWVyeSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucXVlcnkubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucXVlcnkoVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZUZyYWdtZW50ID0gZnVuY3Rpb24oYnVpbGQpIHtcbiAgICBpZiAoIXRoaXMuX3BhcnRzLmZyYWdtZW50KSB7XG4gICAgICB0aGlzLl9wYXJ0cy5mcmFnbWVudCA9IG51bGw7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplU2VhcmNoID0gcC5ub3JtYWxpemVRdWVyeTtcbiAgcC5ub3JtYWxpemVIYXNoID0gcC5ub3JtYWxpemVGcmFnbWVudDtcblxuICBwLmlzbzg4NTkgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBleHBlY3QgdW5pY29kZSBpbnB1dCwgaXNvODg1OSBvdXRwdXRcbiAgICB2YXIgZSA9IFVSSS5lbmNvZGU7XG4gICAgdmFyIGQgPSBVUkkuZGVjb2RlO1xuXG4gICAgVVJJLmVuY29kZSA9IGVzY2FwZTtcbiAgICBVUkkuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuICAgIHRyeSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBVUkkuZW5jb2RlID0gZTtcbiAgICAgIFVSSS5kZWNvZGUgPSBkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBwLnVuaWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBleHBlY3QgaXNvODg1OSBpbnB1dCwgdW5pY29kZSBvdXRwdXRcbiAgICB2YXIgZSA9IFVSSS5lbmNvZGU7XG4gICAgdmFyIGQgPSBVUkkuZGVjb2RlO1xuXG4gICAgVVJJLmVuY29kZSA9IHN0cmljdEVuY29kZVVSSUNvbXBvbmVudDtcbiAgICBVUkkuZGVjb2RlID0gdW5lc2NhcGU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIFVSSS5lbmNvZGUgPSBlO1xuICAgICAgVVJJLmRlY29kZSA9IGQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAucmVhZGFibGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdXJpID0gdGhpcy5jbG9uZSgpO1xuICAgIC8vIHJlbW92aW5nIHVzZXJuYW1lLCBwYXNzd29yZCwgYmVjYXVzZSB0aGV5IHNob3VsZG4ndCBiZSBkaXNwbGF5ZWQgYWNjb3JkaW5nIHRvIFJGQyAzOTg2XG4gICAgdXJpLnVzZXJuYW1lKCcnKS5wYXNzd29yZCgnJykubm9ybWFsaXplKCk7XG4gICAgdmFyIHQgPSAnJztcbiAgICBpZiAodXJpLl9wYXJ0cy5wcm90b2NvbCkge1xuICAgICAgdCArPSB1cmkuX3BhcnRzLnByb3RvY29sICsgJzovLyc7XG4gICAgfVxuXG4gICAgaWYgKHVyaS5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIGlmICh1cmkuaXMoJ3B1bnljb2RlJykgJiYgcHVueWNvZGUpIHtcbiAgICAgICAgdCArPSBwdW55Y29kZS50b1VuaWNvZGUodXJpLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICAgIGlmICh1cmkuX3BhcnRzLnBvcnQpIHtcbiAgICAgICAgICB0ICs9ICc6JyArIHVyaS5fcGFydHMucG9ydDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdCArPSB1cmkuaG9zdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1cmkuX3BhcnRzLmhvc3RuYW1lICYmIHVyaS5fcGFydHMucGF0aCAmJiB1cmkuX3BhcnRzLnBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHQgKz0gJy8nO1xuICAgIH1cblxuICAgIHQgKz0gdXJpLnBhdGgodHJ1ZSk7XG4gICAgaWYgKHVyaS5fcGFydHMucXVlcnkpIHtcbiAgICAgIHZhciBxID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMCwgcXAgPSB1cmkuX3BhcnRzLnF1ZXJ5LnNwbGl0KCcmJyksIGwgPSBxcC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGt2ID0gKHFwW2ldIHx8ICcnKS5zcGxpdCgnPScpO1xuICAgICAgICBxICs9ICcmJyArIFVSSS5kZWNvZGVRdWVyeShrdlswXSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSlcbiAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJTI2Jyk7XG5cbiAgICAgICAgaWYgKGt2WzFdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBxICs9ICc9JyArIFVSSS5kZWNvZGVRdWVyeShrdlsxXSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mL2csICclMjYnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdCArPSAnPycgKyBxLnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICB0ICs9IFVSSS5kZWNvZGVRdWVyeSh1cmkuaGFzaCgpLCB0cnVlKTtcbiAgICByZXR1cm4gdDtcbiAgfTtcblxuICAvLyByZXNvbHZpbmcgcmVsYXRpdmUgYW5kIGFic29sdXRlIFVSTHNcbiAgcC5hYnNvbHV0ZVRvID0gZnVuY3Rpb24oYmFzZSkge1xuICAgIHZhciByZXNvbHZlZCA9IHRoaXMuY2xvbmUoKTtcbiAgICB2YXIgcHJvcGVydGllcyA9IFsncHJvdG9jb2wnLCAndXNlcm5hbWUnLCAncGFzc3dvcmQnLCAnaG9zdG5hbWUnLCAncG9ydCddO1xuICAgIHZhciBiYXNlZGlyLCBpLCBwO1xuXG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVUk5zIGRvIG5vdCBoYXZlIGFueSBnZW5lcmFsbHkgZGVmaW5lZCBoaWVyYXJjaGljYWwgY29tcG9uZW50cycpO1xuICAgIH1cblxuICAgIGlmICghKGJhc2UgaW5zdGFuY2VvZiBVUkkpKSB7XG4gICAgICBiYXNlID0gbmV3IFVSSShiYXNlKTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc29sdmVkLl9wYXJ0cy5wcm90b2NvbCkge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnByb3RvY29sID0gYmFzZS5fcGFydHMucHJvdG9jb2w7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgKHAgPSBwcm9wZXJ0aWVzW2ldKTsgaSsrKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHNbcF0gPSBiYXNlLl9wYXJ0c1twXTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc29sdmVkLl9wYXJ0cy5wYXRoKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHMucGF0aCA9IGJhc2UuX3BhcnRzLnBhdGg7XG4gICAgICBpZiAoIXJlc29sdmVkLl9wYXJ0cy5xdWVyeSkge1xuICAgICAgICByZXNvbHZlZC5fcGFydHMucXVlcnkgPSBiYXNlLl9wYXJ0cy5xdWVyeTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJlc29sdmVkLl9wYXJ0cy5wYXRoLnN1YnN0cmluZygtMikgPT09ICcuLicpIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wYXRoICs9ICcvJztcbiAgICB9XG5cbiAgICBpZiAocmVzb2x2ZWQucGF0aCgpLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICBiYXNlZGlyID0gYmFzZS5kaXJlY3RvcnkoKTtcbiAgICAgIGJhc2VkaXIgPSBiYXNlZGlyID8gYmFzZWRpciA6IGJhc2UucGF0aCgpLmluZGV4T2YoJy8nKSA9PT0gMCA/ICcvJyA6ICcnO1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnBhdGggPSAoYmFzZWRpciA/IChiYXNlZGlyICsgJy8nKSA6ICcnKSArIHJlc29sdmVkLl9wYXJ0cy5wYXRoO1xuICAgICAgcmVzb2x2ZWQubm9ybWFsaXplUGF0aCgpO1xuICAgIH1cblxuICAgIHJlc29sdmVkLmJ1aWxkKCk7XG4gICAgcmV0dXJuIHJlc29sdmVkO1xuICB9O1xuICBwLnJlbGF0aXZlVG8gPSBmdW5jdGlvbihiYXNlKSB7XG4gICAgdmFyIHJlbGF0aXZlID0gdGhpcy5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuICAgIHZhciByZWxhdGl2ZVBhcnRzLCBiYXNlUGFydHMsIGNvbW1vbiwgcmVsYXRpdmVQYXRoLCBiYXNlUGF0aDtcblxuICAgIGlmIChyZWxhdGl2ZS5fcGFydHMudXJuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VSTnMgZG8gbm90IGhhdmUgYW55IGdlbmVyYWxseSBkZWZpbmVkIGhpZXJhcmNoaWNhbCBjb21wb25lbnRzJyk7XG4gICAgfVxuXG4gICAgYmFzZSA9IG5ldyBVUkkoYmFzZSkubm9ybWFsaXplKCk7XG4gICAgcmVsYXRpdmVQYXJ0cyA9IHJlbGF0aXZlLl9wYXJ0cztcbiAgICBiYXNlUGFydHMgPSBiYXNlLl9wYXJ0cztcbiAgICByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZS5wYXRoKCk7XG4gICAgYmFzZVBhdGggPSBiYXNlLnBhdGgoKTtcblxuICAgIGlmIChyZWxhdGl2ZVBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVVJJIGlzIGFscmVhZHkgcmVsYXRpdmUnKTtcbiAgICB9XG5cbiAgICBpZiAoYmFzZVBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGN1bGF0ZSBhIFVSSSByZWxhdGl2ZSB0byBhbm90aGVyIHJlbGF0aXZlIFVSSScpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLnByb3RvY29sID09PSBiYXNlUGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlUGFydHMucHJvdG9jb2wgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLnVzZXJuYW1lICE9PSBiYXNlUGFydHMudXNlcm5hbWUgfHwgcmVsYXRpdmVQYXJ0cy5wYXNzd29yZCAhPT0gYmFzZVBhcnRzLnBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy5wcm90b2NvbCAhPT0gbnVsbCB8fCByZWxhdGl2ZVBhcnRzLnVzZXJuYW1lICE9PSBudWxsIHx8IHJlbGF0aXZlUGFydHMucGFzc3dvcmQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLmhvc3RuYW1lID09PSBiYXNlUGFydHMuaG9zdG5hbWUgJiYgcmVsYXRpdmVQYXJ0cy5wb3J0ID09PSBiYXNlUGFydHMucG9ydCkge1xuICAgICAgcmVsYXRpdmVQYXJ0cy5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZVBhcnRzLnBvcnQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXRoID09PSBiYXNlUGF0aCkge1xuICAgICAgcmVsYXRpdmVQYXJ0cy5wYXRoID0gJyc7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICAvLyBkZXRlcm1pbmUgY29tbW9uIHN1YiBwYXRoXG4gICAgY29tbW9uID0gVVJJLmNvbW1vblBhdGgocmVsYXRpdmVQYXRoLCBiYXNlUGF0aCk7XG5cbiAgICAvLyBJZiB0aGUgcGF0aHMgaGF2ZSBub3RoaW5nIGluIGNvbW1vbiwgcmV0dXJuIGEgcmVsYXRpdmUgVVJMIHdpdGggdGhlIGFic29sdXRlIHBhdGguXG4gICAgaWYgKCFjb21tb24pIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIHZhciBwYXJlbnRzID0gYmFzZVBhcnRzLnBhdGhcbiAgICAgIC5zdWJzdHJpbmcoY29tbW9uLmxlbmd0aClcbiAgICAgIC5yZXBsYWNlKC9bXlxcL10qJC8sICcnKVxuICAgICAgLnJlcGxhY2UoLy4qP1xcLy9nLCAnLi4vJyk7XG5cbiAgICByZWxhdGl2ZVBhcnRzLnBhdGggPSAocGFyZW50cyArIHJlbGF0aXZlUGFydHMucGF0aC5zdWJzdHJpbmcoY29tbW9uLmxlbmd0aCkpIHx8ICcuLyc7XG5cbiAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgfTtcblxuICAvLyBjb21wYXJpbmcgVVJJc1xuICBwLmVxdWFscyA9IGZ1bmN0aW9uKHVyaSkge1xuICAgIHZhciBvbmUgPSB0aGlzLmNsb25lKCk7XG4gICAgdmFyIHR3byA9IG5ldyBVUkkodXJpKTtcbiAgICB2YXIgb25lX21hcCA9IHt9O1xuICAgIHZhciB0d29fbWFwID0ge307XG4gICAgdmFyIGNoZWNrZWQgPSB7fTtcbiAgICB2YXIgb25lX3F1ZXJ5LCB0d29fcXVlcnksIGtleTtcblxuICAgIG9uZS5ub3JtYWxpemUoKTtcbiAgICB0d28ubm9ybWFsaXplKCk7XG5cbiAgICAvLyBleGFjdCBtYXRjaFxuICAgIGlmIChvbmUudG9TdHJpbmcoKSA9PT0gdHdvLnRvU3RyaW5nKCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGV4dHJhY3QgcXVlcnkgc3RyaW5nXG4gICAgb25lX3F1ZXJ5ID0gb25lLnF1ZXJ5KCk7XG4gICAgdHdvX3F1ZXJ5ID0gdHdvLnF1ZXJ5KCk7XG4gICAgb25lLnF1ZXJ5KCcnKTtcbiAgICB0d28ucXVlcnkoJycpO1xuXG4gICAgLy8gZGVmaW5pdGVseSBub3QgZXF1YWwgaWYgbm90IGV2ZW4gbm9uLXF1ZXJ5IHBhcnRzIG1hdGNoXG4gICAgaWYgKG9uZS50b1N0cmluZygpICE9PSB0d28udG9TdHJpbmcoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHF1ZXJ5IHBhcmFtZXRlcnMgaGF2ZSB0aGUgc2FtZSBsZW5ndGgsIGV2ZW4gaWYgdGhleSdyZSBwZXJtdXRlZFxuICAgIGlmIChvbmVfcXVlcnkubGVuZ3RoICE9PSB0d29fcXVlcnkubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgb25lX21hcCA9IFVSSS5wYXJzZVF1ZXJ5KG9uZV9xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgdHdvX21hcCA9IFVSSS5wYXJzZVF1ZXJ5KHR3b19xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG5cbiAgICBmb3IgKGtleSBpbiBvbmVfbWFwKSB7XG4gICAgICBpZiAoaGFzT3duLmNhbGwob25lX21hcCwga2V5KSkge1xuICAgICAgICBpZiAoIWlzQXJyYXkob25lX21hcFtrZXldKSkge1xuICAgICAgICAgIGlmIChvbmVfbWFwW2tleV0gIT09IHR3b19tYXBba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghYXJyYXlzRXF1YWwob25lX21hcFtrZXldLCB0d29fbWFwW2tleV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hlY2tlZFtrZXldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGtleSBpbiB0d29fbWFwKSB7XG4gICAgICBpZiAoaGFzT3duLmNhbGwodHdvX21hcCwga2V5KSkge1xuICAgICAgICBpZiAoIWNoZWNrZWRba2V5XSkge1xuICAgICAgICAgIC8vIHR3byBjb250YWlucyBhIHBhcmFtZXRlciBub3QgcHJlc2VudCBpbiBvbmVcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBzdGF0ZVxuICBwLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyA9IGZ1bmN0aW9uKHYpIHtcbiAgICB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSAhIXY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5lc2NhcGVRdWVyeVNwYWNlID0gZnVuY3Rpb24odikge1xuICAgIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UgPSAhIXY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIFVSSTtcbn0pKTtcbiIsIi8qISBodHRwOi8vbXRocy5iZS9wdW55Y29kZSB2MS4yLjMgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXiAtfl0vLCAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvXFx4MkV8XFx1MzAwMnxcXHVGRjBFfFxcdUZGNjEvZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBgQXJyYXkjbWFwYCB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnkgYXJyYXlcblx0ICogaXRlbS5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwKGFycmF5LCBmbikge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0d2hpbGUgKGxlbmd0aC0tKSB7XG5cdFx0XHRhcnJheVtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiBhcnJheTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNpbXBsZSBgQXJyYXkjbWFwYC1saWtlIHdyYXBwZXIgdG8gd29yayB3aXRoIGRvbWFpbiBuYW1lIHN0cmluZ3MuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnlcblx0ICogY2hhcmFjdGVyLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IHN0cmluZyBvZiBjaGFyYWN0ZXJzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFja1xuXHQgKiBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0cmV0dXJuIG1hcChzdHJpbmcuc3BsaXQocmVnZXhTZXBhcmF0b3JzKSwgZm4pLmpvaW4oJy4nKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIG51bWVyaWMgY29kZSBwb2ludHMgb2YgZWFjaCBVbmljb2RlXG5cdCAqIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLiBXaGlsZSBKYXZhU2NyaXB0IHVzZXMgVUNTLTIgaW50ZXJuYWxseSxcblx0ICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcblx0ICogVUNTLTIgZXhwb3NlcyBhcyBzZXBhcmF0ZSBjaGFyYWN0ZXJzKSBpbnRvIGEgc2luZ2xlIGNvZGUgcG9pbnQsXG5cdCAqIG1hdGNoaW5nIFVURi0xNi5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG5cdCAqIEBzZWUgPGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGRlY29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBVbmljb2RlIGlucHV0IHN0cmluZyAoVUNTLTIpLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZW5jb2RlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuZXcgVW5pY29kZSBzdHJpbmcgKFVDUy0yKS5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuXHQgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpbiB0aGUgcmFuZ2UgYDBgIHRvIGBiYXNlIC0gMWAsIG9yIGBiYXNlYCBpZlxuXHQgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGRpZ2l0L2ludGVnZXIgaW50byBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlnaXQgVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuXHQgKiBgMGAgdG8gYGJhc2UgLSAxYC4gSWYgYGZsYWdgIGlzIG5vbi16ZXJvLCB0aGUgdXBwZXJjYXNlIGZvcm0gaXNcblx0ICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcblx0ICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cblx0ICovXG5cdGZ1bmN0aW9uIGRpZ2l0VG9CYXNpYyhkaWdpdCwgZmxhZykge1xuXHRcdC8vICAwLi4yNSBtYXAgdG8gQVNDSUkgYS4ueiBvciBBLi5aXG5cdFx0Ly8gMjYuLjM1IG1hcCB0byBBU0NJSSAwLi45XG5cdFx0cmV0dXJuIGRpZ2l0ICsgMjIgKyA3NSAqIChkaWdpdCA8IDI2KSAtICgoZmxhZyAhPSAwKSA8PCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuXHQgKiBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGxlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIHRvIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHlcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIHRvIFVuaWNvZGUuIE9ubHkgdGhlXG5cdCAqIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS4gaXQgZG9lc24ndFxuXHQgKiBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNvbnZlcnRlZCB0b1xuXHQgKiBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgUHVueWNvZGUgZG9tYWluIG5hbWUgdG8gY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGRvbWFpbikge1xuXHRcdHJldHVybiBtYXBEb21haW4oZG9tYWluLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSB0byBQdW55Y29kZS4gT25seSB0aGVcblx0ICogbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLiBpdCBkb2Vzbid0XG5cdCAqIG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgdG8gY29udmVydCwgYXMgYSBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZS5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoZG9tYWluKSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihkb21haW4sIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjIuMycsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH1cdGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7IC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfaGVscGVyc0V2ZW50T2JqZWN0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2V2ZW50LW9iamVjdCcpO1xuXG52YXIgX2hlbHBlcnNFdmVudE9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRXZlbnRPYmplY3QpO1xuXG52YXIgX2hlbHBlcnNFbnZpcm9ubWVudENoZWNrID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Vudmlyb25tZW50LWNoZWNrJyk7XG5cbnZhciBfaGVscGVyc0Vudmlyb25tZW50Q2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0Vudmlyb25tZW50Q2hlY2spO1xuXG4vKlxuKiBOYXRpdmVseSB5b3UgY2Fubm90IHNldCBvciBtb2RpZnkgdGhlIHByb3BlcnRpZXM6IHRhcmdldCwgc3JjRWxlbWVudCwgYW5kIGN1cnJlbnRUYXJnZXQgb24gRXZlbnQgb3JcbiogTWVzc2FnZUV2ZW50IG9iamVjdHMuIFNvIGluIG9yZGVyIHRvIHNldCB0aGVtIHRvIHRoZSBjb3JyZWN0IHZhbHVlcyB3ZSBcIm92ZXJ3cml0ZVwiIHRoZW0gdG8gdGhlIHNhbWVcbiogcHJvcGVydHkgYnV0IHdpdGhvdXQgdGhlIHJlc3RyaWN0aW9uIG9mIG5vdCB3cml0YWJsZS5cbipcbiogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gYW4gZXZlbnQgb2JqZWN0IHRvIGV4dGVuZFxuKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IC0gdGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHNldCBmb3IgdGFyZ2V0LCBzcmNFbGVtZW50LCBhbmQgY3VycmVudFRhcmdldFxuKi9cbmZ1bmN0aW9uIGV4dGVuZEV2ZW50KGV2ZW50LCB0YXJnZXQpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXZlbnQsIHtcbiAgICB0YXJnZXQ6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBzcmNFbGVtZW50OiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgY3VycmVudFRhcmdldDoge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICBldmVudC50YXJnZXQgPSB0YXJnZXQ7XG4gICAgZXZlbnQuc3JjRWxlbWVudCA9IHRhcmdldDtcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG4vKlxuICogVGhpcyB3aWxsIHJldHVybiBlaXRoZXIgdGhlIG5hdGl2ZSBFdmVudC9NZXNzYWdlRXZlbnQvQ2xvc2VFdmVudFxuICogaWYgd2UgYXJlIGluIHRoZSBicm93c2VyIG9yIGl0IHdpbGwgcmV0dXJuIHRoZSBtb2NrZWQgZXZlbnQuXG4gKi9cbmZ1bmN0aW9uIGV2ZW50RmFjdG9yeShldmVudENsYXNzTmFtZSwgdHlwZSwgY29uZmlnKSB7XG4gIGlmICghX2hlbHBlcnNFbnZpcm9ubWVudENoZWNrMlsnZGVmYXVsdCddLmdsb2JhbENvbnRleHRbZXZlbnRDbGFzc05hbWVdKSB7XG4gICAgcmV0dXJuIG5ldyBfaGVscGVyc0V2ZW50T2JqZWN0MlsnZGVmYXVsdCddKHsgdHlwZTogdHlwZSB9KTtcbiAgfVxuXG4gIGlmICghY29uZmlnKSB7XG4gICAgcmV0dXJuIG5ldyBfaGVscGVyc0Vudmlyb25tZW50Q2hlY2syWydkZWZhdWx0J10uZ2xvYmFsQ29udGV4dFtldmVudENsYXNzTmFtZV0odHlwZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IF9oZWxwZXJzRW52aXJvbm1lbnRDaGVjazJbJ2RlZmF1bHQnXS5nbG9iYWxDb250ZXh0W2V2ZW50Q2xhc3NOYW1lXSh0eXBlLCBjb25maWcpO1xufVxuXG4vKlxuKiBDcmVhdGVzIGFuIEV2ZW50IG9iamVjdCBhbmQgZXh0ZW5kcyBpdCB0byBhbGxvdyBmdWxsIG1vZGlmaWNhdGlvbiBvZlxuKiBpdHMgcHJvcGVydGllcy5cbipcbiogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIHdpdGhpbiBjb25maWcgeW91IHdpbGwgbmVlZCB0byBwYXNzIHR5cGUgYW5kIG9wdGlvbmFsbHkgdGFyZ2V0XG4qL1xuZnVuY3Rpb24gY3JlYXRlRXZlbnQoY29uZmlnKSB7XG4gIHZhciB0eXBlID0gY29uZmlnLnR5cGU7XG4gIHZhciB0YXJnZXQgPSBjb25maWcudGFyZ2V0O1xuXG4gIHZhciBldmVudCA9IGV2ZW50RmFjdG9yeSgnRXZlbnQnLCB0eXBlKTtcblxuICBpZiAoIWV2ZW50LnBhdGgpIHtcbiAgICBldmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZXZlbnQpKTtcbiAgfVxuXG4gIHJldHVybiBleHRlbmRFdmVudChldmVudCwgdGFyZ2V0KTtcbn1cblxuLypcbiogQ3JlYXRlcyBhIE1lc3NhZ2VFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnIHlvdSB3aWxsIG5lZWQgdG8gcGFzcyB0eXBlLCBvcmlnaW4sIGRhdGEgYW5kIG9wdGlvbmFsbHkgdGFyZ2V0XG4qL1xuZnVuY3Rpb24gY3JlYXRlTWVzc2FnZUV2ZW50KGNvbmZpZykge1xuICB2YXIgdHlwZSA9IGNvbmZpZy50eXBlO1xuICB2YXIgb3JpZ2luID0gY29uZmlnLm9yaWdpbjtcbiAgdmFyIGRhdGEgPSBjb25maWcuZGF0YTtcbiAgdmFyIHRhcmdldCA9IGNvbmZpZy50YXJnZXQ7XG5cbiAgdmFyIG1lc3NhZ2VFdmVudCA9IGV2ZW50RmFjdG9yeSgnTWVzc2FnZUV2ZW50JywgdHlwZSk7XG5cbiAgaWYgKCFtZXNzYWdlRXZlbnQucGF0aCkge1xuICAgIG1lc3NhZ2VFdmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobWVzc2FnZUV2ZW50KSk7XG4gIH1cblxuICBleHRlbmRFdmVudChtZXNzYWdlRXZlbnQsIHRhcmdldCk7XG5cbiAgaWYgKG1lc3NhZ2VFdmVudC5pbml0TWVzc2FnZUV2ZW50KSB7XG4gICAgbWVzc2FnZUV2ZW50LmluaXRNZXNzYWdlRXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlLCBkYXRhLCBvcmlnaW4sICcnKTtcbiAgfSBlbHNlIHtcbiAgICBtZXNzYWdlRXZlbnQuZGF0YSA9IGRhdGE7XG4gICAgbWVzc2FnZUV2ZW50Lm9yaWdpbiA9IG9yaWdpbjtcbiAgfVxuXG4gIHJldHVybiBtZXNzYWdlRXZlbnQ7XG59XG5cbi8qXG4qIENyZWF0ZXMgYSBDbG9zZUV2ZW50IG9iamVjdCBhbmQgZXh0ZW5kcyBpdCB0byBhbGxvdyBmdWxsIG1vZGlmaWNhdGlvbiBvZlxuKiBpdHMgcHJvcGVydGllcy5cbipcbiogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyAtIHdpdGhpbiBjb25maWcgeW91IHdpbGwgbmVlZCB0byBwYXNzIHR5cGUgYW5kIG9wdGlvbmFsbHkgdGFyZ2V0LCBjb2RlLCBhbmQgcmVhc29uXG4qL1xuZnVuY3Rpb24gY3JlYXRlQ2xvc2VFdmVudChjb25maWcpIHtcbiAgdmFyIGNvZGUgPSBjb25maWcuY29kZTtcbiAgdmFyIHJlYXNvbiA9IGNvbmZpZy5yZWFzb247XG4gIHZhciB0eXBlID0gY29uZmlnLnR5cGU7XG4gIHZhciB0YXJnZXQgPSBjb25maWcudGFyZ2V0O1xuICB2YXIgd2FzQ2xlYW4gPSBjb25maWcud2FzQ2xlYW47XG5cbiAgaWYgKCF3YXNDbGVhbikge1xuICAgIHdhc0NsZWFuID0gY29kZSA9PT0gMTAwMDtcbiAgfVxuXG4gIHZhciBjbG9zZUV2ZW50ID0gZXZlbnRGYWN0b3J5KCdDbG9zZUV2ZW50JywgdHlwZSwge1xuICAgIGNvZGU6IGNvZGUsXG4gICAgcmVhc29uOiByZWFzb24sXG4gICAgd2FzQ2xlYW46IHdhc0NsZWFuXG4gIH0pO1xuXG4gIGlmICghY2xvc2VFdmVudC5wYXRoIHx8ICFjbG9zZUV2ZW50LmNvZGUpIHtcbiAgICBjbG9zZUV2ZW50ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjbG9zZUV2ZW50KSk7XG4gICAgY2xvc2VFdmVudC5jb2RlID0gY29kZSB8fCAwO1xuICAgIGNsb3NlRXZlbnQucmVhc29uID0gcmVhc29uIHx8ICcnO1xuICAgIGNsb3NlRXZlbnQud2FzQ2xlYW4gPSB3YXNDbGVhbjtcbiAgfVxuXG4gIHJldHVybiBleHRlbmRFdmVudChjbG9zZUV2ZW50LCB0YXJnZXQpO1xufVxuXG5leHBvcnRzLmNyZWF0ZUV2ZW50ID0gY3JlYXRlRXZlbnQ7XG5leHBvcnRzLmNyZWF0ZU1lc3NhZ2VFdmVudCA9IGNyZWF0ZU1lc3NhZ2VFdmVudDtcbmV4cG9ydHMuY3JlYXRlQ2xvc2VFdmVudCA9IGNyZWF0ZUNsb3NlRXZlbnQ7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfaGVscGVyc0FycmF5SGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycy9hcnJheS1oZWxwZXJzJyk7XG5cbi8qXG4qIEV2ZW50VGFyZ2V0IGlzIGFuIGludGVyZmFjZSBpbXBsZW1lbnRlZCBieSBvYmplY3RzIHRoYXQgY2FuXG4qIHJlY2VpdmUgZXZlbnRzIGFuZCBtYXkgaGF2ZSBsaXN0ZW5lcnMgZm9yIHRoZW0uXG4qXG4qIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldFxuKi9cblxudmFyIEV2ZW50VGFyZ2V0ID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRXZlbnRUYXJnZXQoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50VGFyZ2V0KTtcblxuICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gIH1cblxuICAvKlxuICAqIFRpZXMgYSBsaXN0ZW5lciBmdW5jdGlvbiB0byBhIGV2ZW50IHR5cGUgd2hpY2ggY2FuIGxhdGVyIGJlIGludm9rZWQgdmlhIHRoZVxuICAqIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBldmVudCAoaWU6ICdvcGVuJywgJ21lc3NhZ2UnLCBldGMuKVxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuZXZlciBhIGV2ZW50IGlzIGRpc3BhdGNoZWQgbWF0Y2hpbmcgdGhlIGdpdmVuIHR5cGVcbiAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmUgLSBOL0EgVE9ETzogaW1wbGVtZW50IHVzZUNhcHR1cmUgZnVuY3Rpb25hbGl0eVxuICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhFdmVudFRhcmdldCwgW3tcbiAgICBrZXk6ICdhZGRFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciAvKiAsIHVzZUNhcHR1cmUgKi8pIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMubGlzdGVuZXJzW3R5cGVdKSkge1xuICAgICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmx5IGFkZCB0aGUgc2FtZSBmdW5jdGlvbiBvbmNlXG4gICAgICAgIGlmICgoMCwgX2hlbHBlcnNBcnJheUhlbHBlcnMuZmlsdGVyKSh0aGlzLmxpc3RlbmVyc1t0eXBlXSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaXRlbSA9PT0gbGlzdGVuZXI7XG4gICAgICAgIH0pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFJlbW92ZXMgdGhlIGxpc3RlbmVyIHNvIGl0IHdpbGwgbm8gbG9uZ2VyIGJlIGludm9rZWQgdmlhIHRoZSBkaXNwYXRjaEV2ZW50IG1ldGhvZC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIHRoZSB0eXBlIG9mIGV2ZW50IChpZTogJ29wZW4nLCAnbWVzc2FnZScsIGV0Yy4pXG4gICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciAtIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugd2hlbmV2ZXIgYSBldmVudCBpcyBkaXNwYXRjaGVkIG1hdGNoaW5nIHRoZSBnaXZlbiB0eXBlXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmUgLSBOL0EgVE9ETzogaW1wbGVtZW50IHVzZUNhcHR1cmUgZnVuY3Rpb25hbGl0eVxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVFdmVudExpc3RlbmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCByZW1vdmluZ0xpc3RlbmVyIC8qICwgdXNlQ2FwdHVyZSAqLykge1xuICAgICAgdmFyIGFycmF5T2ZMaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1t0eXBlXTtcbiAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdID0gKDAsIF9oZWxwZXJzQXJyYXlIZWxwZXJzLnJlamVjdCkoYXJyYXlPZkxpc3RlbmVycywgZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lciA9PT0gcmVtb3ZpbmdMaXN0ZW5lcjtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBJbnZva2VzIGFsbCBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCBhcmUgbGlzdGVuaW5nIHRvIHRoZSBnaXZlbiBldmVudC50eXBlIHByb3BlcnR5LiBFYWNoXG4gICAgKiBsaXN0ZW5lciB3aWxsIGJlIHBhc3NlZCB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgICpcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCAtIGV2ZW50IG9iamVjdCB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byBhbGwgbGlzdGVuZXJzIG9mIHRoZSBldmVudC50eXBlIHByb3BlcnR5XG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2Rpc3BhdGNoRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50KSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgY3VzdG9tQXJndW1lbnRzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBjdXN0b21Bcmd1bWVudHNbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgZXZlbnROYW1lID0gZXZlbnQudHlwZTtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tldmVudE5hbWVdO1xuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBpZiAoY3VzdG9tQXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ZW5lci5hcHBseShfdGhpcywgY3VzdG9tQXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKF90aGlzLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFdmVudFRhcmdldDtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEV2ZW50VGFyZ2V0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnJlamVjdCA9IHJlamVjdDtcbmV4cG9ydHMuZmlsdGVyID0gZmlsdGVyO1xuXG5mdW5jdGlvbiByZWplY3QoYXJyYXksIGNhbGxiYWNrKSB7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW1JbkFycmF5KSB7XG4gICAgaWYgKCFjYWxsYmFjayhpdGVtSW5BcnJheSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChpdGVtSW5BcnJheSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZnVuY3Rpb24gZmlsdGVyKGFycmF5LCBjYWxsYmFjaykge1xuICB2YXIgcmVzdWx0cyA9IFtdO1xuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtSW5BcnJheSkge1xuICAgIGlmIChjYWxsYmFjayhpdGVtSW5BcnJheSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChpdGVtSW5BcnJheSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVzdWx0cztcbn0iLCIvKlxuKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2xvc2VFdmVudFxuKi9cblwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xudmFyIGNvZGVzID0ge1xuICBDTE9TRV9OT1JNQUw6IDEwMDAsXG4gIENMT1NFX0dPSU5HX0FXQVk6IDEwMDEsXG4gIENMT1NFX1BST1RPQ09MX0VSUk9SOiAxMDAyLFxuICBDTE9TRV9VTlNVUFBPUlRFRDogMTAwMyxcbiAgQ0xPU0VfTk9fU1RBVFVTOiAxMDA1LFxuICBDTE9TRV9BQk5PUk1BTDogMTAwNixcbiAgQ0xPU0VfVE9PX0xBUkdFOiAxMDA5XG59O1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvZGVzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCIvKlxuKiBUaGlzIGRlbGF5IGFsbG93cyB0aGUgdGhyZWFkIHRvIGZpbmlzaCBhc3NpZ25pbmcgaXRzIG9uKiBtZXRob2RzXG4qIGJlZm9yZSBpbnZva2luZyB0aGUgZGVsYXkgY2FsbGJhY2suIFRoaXMgaXMgcHVyZWx5IGEgdGltaW5nIGhhY2suXG4qIGh0dHA6Ly9nZWVrYWJ5dGUuYmxvZ3Nwb3QuY29tLzIwMTQvMDEvamF2YXNjcmlwdC1lZmZlY3Qtb2Ytc2V0dGluZy1zZXR0aW1lb3V0Lmh0bWxcbipcbiogQHBhcmFtIHtjYWxsYmFjazogZnVuY3Rpb259IHRoZSBjYWxsYmFjayB3aGljaCB3aWxsIGJlIGludm9rZWQgYWZ0ZXIgdGhlIHRpbWVvdXRcbiogQHBhcm1hIHtjb250ZXh0OiBvYmplY3R9IHRoZSBjb250ZXh0IGluIHdoaWNoIHRvIGludm9rZSB0aGUgZnVuY3Rpb25cbiovXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIGRlbGF5KGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZW91dCh0aW1lb3V0Q29udGV4dCkge1xuICAgIGNhbGxiYWNrLmNhbGwodGltZW91dENvbnRleHQpO1xuICB9LCA0LCBjb250ZXh0KTtcbn1cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBkZWxheTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIGlzTm9kZSgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHtcbiAgZ2xvYmFsQ29udGV4dDogaXNOb2RlKCkgPyBnbG9iYWwgOiB3aW5kb3csXG4gIGlzTm9kZTogaXNOb2RlXG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIE5vZGVFdmVudChjb25maWcpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB2YXIgZXZlbnQgPSB7XG4gICAgYnViYmxlczogZmFsc2UsXG4gICAgY2FuY2VsQnVibGxlOiBmYWxzZSxcbiAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0UHJldmVudGVkOiBmYWxzZSxcbiAgICBldmVudFBoYXNlOiAwLFxuICAgIHBhdGg6IFtdLFxuICAgIHJldHVyblZhbHVlOiB0cnVlLFxuICAgIHRpbWVTdGFtcDogRGF0ZS5ub3coKSxcbiAgICB0eXBlOiBjb25maWcudHlwZSxcbiAgICBsYXN0RXZlbnRJZDogJydcbiAgfTtcblxuICBPYmplY3Qua2V5cyhldmVudCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5TmFtZSkge1xuICAgIF90aGlzW2tleU5hbWVdID0gZXZlbnRba2V5TmFtZV07XG4gIH0pO1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSBOb2RlRXZlbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9oZWxwZXJzQXJyYXlIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2FycmF5LWhlbHBlcnMnKTtcblxuLypcbiogVGhlIG5ldHdvcmsgYnJpZGdlIGlzIGEgd2F5IGZvciB0aGUgbW9jayB3ZWJzb2NrZXQgb2JqZWN0IHRvICdjb21tdW5pY2F0ZScgd2l0aFxuKiBhbGwgYXZhbGlibGUgc2VydmVycy4gVGhpcyBpcyBhIHNpbmdsZXRvbiBvYmplY3Qgc28gaXQgaXMgaW1wb3J0YW50IHRoYXQgeW91XG4qIGNsZWFuIHVwIHVybE1hcCB3aGVuZXZlciB5b3UgYXJlIGZpbmlzaGVkLlxuKi9cblxudmFyIE5ldHdvcmtCcmlkZ2UgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBOZXR3b3JrQnJpZGdlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBOZXR3b3JrQnJpZGdlKTtcblxuICAgIHRoaXMudXJsTWFwID0ge307XG4gIH1cblxuICAvKlxuICAqIEF0dGFjaGVzIGEgd2Vic29ja2V0IG9iamVjdCB0byB0aGUgdXJsTWFwIGhhc2ggc28gdGhhdCBpdCBjYW4gZmluZCB0aGUgc2VydmVyXG4gICogaXQgaXMgY29ubmVjdGVkIHRvIGFuZCB0aGUgc2VydmVyIGluIHR1cm4gY2FuIGZpbmQgaXQuXG4gICpcbiAgKiBAcGFyYW0ge29iamVjdH0gd2Vic29ja2V0IC0gd2Vic29ja2V0IG9iamVjdCB0byBhZGQgdG8gdGhlIHVybE1hcCBoYXNoXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhOZXR3b3JrQnJpZGdlLCBbe1xuICAgIGtleTogJ2F0dGFjaFdlYlNvY2tldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGF0dGFjaFdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCAmJiBjb25uZWN0aW9uTG9va3VwLnNlcnZlciAmJiBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMuaW5kZXhPZih3ZWJzb2NrZXQpID09PSAtMSkge1xuICAgICAgICBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMucHVzaCh3ZWJzb2NrZXQpO1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEF0dGFjaGVzIGEgd2Vic29ja2V0IHRvIGEgcm9vbVxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdhZGRNZW1iZXJzaGlwVG9Sb29tJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkTWVtYmVyc2hpcFRvUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG5cbiAgICAgIGlmIChjb25uZWN0aW9uTG9va3VwICYmIGNvbm5lY3Rpb25Mb29rdXAuc2VydmVyICYmIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cy5pbmRleE9mKHdlYnNvY2tldCkgIT09IC0xKSB7XG4gICAgICAgIGlmICghY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV0pIHtcbiAgICAgICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV0ucHVzaCh3ZWJzb2NrZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBBdHRhY2hlcyBhIHNlcnZlciBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgYSB3ZWJzb2NrZXRzXG4gICAgKiB3aGljaCBhcmUgY29ubmVjdGVkIHRvIGl0IGFuZCBzbyB0aGF0IHdlYnNvY2tldHMgY2FuIGluIHR1cm4gY2FuIGZpbmQgaXQuXG4gICAgKlxuICAgICogQHBhcmFtIHtvYmplY3R9IHNlcnZlciAtIHNlcnZlciBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdhdHRhY2hTZXJ2ZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhdHRhY2hTZXJ2ZXIoc2VydmVyLCB1cmwpIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbdXJsXTtcblxuICAgICAgaWYgKCFjb25uZWN0aW9uTG9va3VwKSB7XG4gICAgICAgIHRoaXMudXJsTWFwW3VybF0gPSB7XG4gICAgICAgICAgc2VydmVyOiBzZXJ2ZXIsXG4gICAgICAgICAgd2Vic29ja2V0czogW10sXG4gICAgICAgICAgcm9vbU1lbWJlcnNoaXBzOiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzZXJ2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEZpbmRzIHRoZSBzZXJ2ZXIgd2hpY2ggaXMgJ3J1bm5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgdG8gdXNlIHRvIGZpbmQgd2hpY2ggc2VydmVyIGlzIHJ1bm5pbmcgb24gaXRcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnc2VydmVyTG9va3VwJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VydmVyTG9va3VwKHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEZpbmRzIGFsbCB3ZWJzb2NrZXRzIHdoaWNoIGlzICdsaXN0ZW5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgdG8gdXNlIHRvIGZpbmQgYWxsIHdlYnNvY2tldHMgd2hpY2ggYXJlIGFzc29jaWF0ZWQgd2l0aCBpdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHJvb20gLSBpZiBhIHJvb20gaXMgcHJvdmlkZWQsIHdpbGwgb25seSByZXR1cm4gc29ja2V0cyBpbiB0aGlzIHJvb21cbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnd2Vic29ja2V0c0xvb2t1cCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHdlYnNvY2tldHNMb29rdXAodXJsLCByb29tKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICAgIGlmICghY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIGlmIChyb29tKSB7XG4gICAgICAgIHZhciBtZW1iZXJzID0gY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV07XG4gICAgICAgIHJldHVybiBtZW1iZXJzID8gbWVtYmVycyA6IFtdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIHRoZSBlbnRyeSBhc3NvY2lhdGVkIHdpdGggdGhlIHVybC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZVNlcnZlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVNlcnZlcih1cmwpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnVybE1hcFt1cmxdO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIHRoZSBpbmRpdmlkdWFsIHdlYnNvY2tldCBmcm9tIHRoZSBtYXAgb2YgYXNzb2NpYXRlZCB3ZWJzb2NrZXRzLlxuICAgICpcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSB3ZWJzb2NrZXQgLSB3ZWJzb2NrZXQgb2JqZWN0IHRvIHJlbW92ZSBmcm9tIHRoZSB1cmwgbWFwXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZVdlYlNvY2tldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMgPSAoMCwgX2hlbHBlcnNBcnJheUhlbHBlcnMucmVqZWN0KShjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgICByZXR1cm4gc29ja2V0ID09PSB3ZWJzb2NrZXQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIGEgd2Vic29ja2V0IGZyb20gYSByb29tXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG4gICAgICB2YXIgbWVtYmVyc2hpcHMgPSBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXTtcblxuICAgICAgaWYgKGNvbm5lY3Rpb25Mb29rdXAgJiYgbWVtYmVyc2hpcHMgIT09IG51bGwpIHtcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV0gPSAoMCwgX2hlbHBlcnNBcnJheUhlbHBlcnMucmVqZWN0KShtZW1iZXJzaGlwcywgZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICAgIHJldHVybiBzb2NrZXQgPT09IHdlYnNvY2tldDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE5ldHdvcmtCcmlkZ2U7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBuZXcgTmV0d29ya0JyaWRnZSgpO1xuLy8gTm90ZTogdGhpcyBpcyBhIHNpbmdsZXRvblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3g0LCBfeDUsIF94NikgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDQsIHByb3BlcnR5ID0gX3g1LCByZWNlaXZlciA9IF94NjsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDQgPSBwYXJlbnQ7IF94NSA9IHByb3BlcnR5OyBfeDYgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3VyaWpzID0gcmVxdWlyZSgndXJpanMnKTtcblxudmFyIF91cmlqczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF91cmlqcyk7XG5cbnZhciBfd2Vic29ja2V0ID0gcmVxdWlyZSgnLi93ZWJzb2NrZXQnKTtcblxudmFyIF93ZWJzb2NrZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2Vic29ja2V0KTtcblxudmFyIF9ldmVudFRhcmdldCA9IHJlcXVpcmUoJy4vZXZlbnQtdGFyZ2V0Jyk7XG5cbnZhciBfZXZlbnRUYXJnZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXZlbnRUYXJnZXQpO1xuXG52YXIgX25ldHdvcmtCcmlkZ2UgPSByZXF1aXJlKCcuL25ldHdvcmstYnJpZGdlJyk7XG5cbnZhciBfbmV0d29ya0JyaWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9uZXR3b3JrQnJpZGdlKTtcblxudmFyIF9oZWxwZXJzQ2xvc2VDb2RlcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jbG9zZS1jb2RlcycpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNDbG9zZUNvZGVzKTtcblxudmFyIF9ldmVudEZhY3RvcnkgPSByZXF1aXJlKCcuL2V2ZW50LWZhY3RvcnknKTtcblxuLypcbiogaHR0cHM6Ly9naXRodWIuY29tL3dlYnNvY2tldHMvd3Mjc2VydmVyLWV4YW1wbGVcbiovXG5cbnZhciBTZXJ2ZXIgPSAoZnVuY3Rpb24gKF9FdmVudFRhcmdldCkge1xuICBfaW5oZXJpdHMoU2VydmVyLCBfRXZlbnRUYXJnZXQpO1xuXG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuXG4gIGZ1bmN0aW9uIFNlcnZlcih1cmwpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2VydmVyKTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNlcnZlci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuICAgIHRoaXMudXJsID0gKDAsIF91cmlqczJbJ2RlZmF1bHQnXSkodXJsKS50b1N0cmluZygpO1xuICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hTZXJ2ZXIodGhpcywgdGhpcy51cmwpO1xuXG4gICAgaWYgKCFzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnZXJyb3InIH0pKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQSBtb2NrIHNlcnZlciBpcyBhbHJlYWR5IGxpc3RlbmluZyBvbiB0aGlzIHVybCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEFsdGVybmF0aXZlIGNvbnN0cnVjdG9yIHRvIHN1cHBvcnQgbmFtZXNwYWNlcyBpbiBzb2NrZXQuaW9cbiAgICpcbiAgICogaHR0cDovL3NvY2tldC5pby9kb2NzL3Jvb21zLWFuZC1uYW1lc3BhY2VzLyNjdXN0b20tbmFtZXNwYWNlc1xuICAgKi9cblxuICAvKlxuICAqIFRoaXMgaXMgdGhlIG1haW4gZnVuY3Rpb24gZm9yIHRoZSBtb2NrIHNlcnZlciB0byBzdWJzY3JpYmUgdG8gdGhlIG9uIGV2ZW50cy5cbiAgKlxuICAqIGllOiBtb2NrU2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdhIG1vY2sgY2xpZW50IGNvbm5lY3RlZCcpOyB9KTtcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIGV2ZW50IGtleSB0byBzdWJzY3JpYmUgdG8uIFZhbGlkIGtleXMgYXJlOiBjb25uZWN0aW9uLCBtZXNzYWdlLCBhbmQgY2xvc2UuXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgd2hpY2ggc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGEgY2VydGFpbiBldmVudCBpcyBmaXJlZC5cbiAgKi9cblxuICBfY3JlYXRlQ2xhc3MoU2VydmVyLCBbe1xuICAgIGtleTogJ29uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFRoaXMgc2VuZCBmdW5jdGlvbiB3aWxsIG5vdGlmeSBhbGwgbW9jayBjbGllbnRzIHZpYSB0aGVpciBvbm1lc3NhZ2UgY2FsbGJhY2tzIHRoYXQgdGhlIHNlcnZlclxuICAgICogaGFzIGEgbWVzc2FnZSBmb3IgdGhlbS5cbiAgICAqXG4gICAgKiBAcGFyYW0geyp9IGRhdGEgLSBBbnkgamF2YXNjcmlwdCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBjcmFmdGVkIGludG8gYSBNZXNzYWdlT2JqZWN0LlxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdzZW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChkYXRhKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogU2VuZHMgYSBnZW5lcmljIG1lc3NhZ2UgZXZlbnQgdG8gYWxsIG1vY2sgY2xpZW50cy5cbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnZW1pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGRhdGEpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzJdO1xuICAgICAgdmFyIHdlYnNvY2tldHMgPSBvcHRpb25zLndlYnNvY2tldHM7XG5cbiAgICAgIGlmICghd2Vic29ja2V0cykge1xuICAgICAgICB3ZWJzb2NrZXRzID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG4gICAgICB9XG5cbiAgICAgIHdlYnNvY2tldHMuZm9yRWFjaChmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHNvY2tldC5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VFdmVudCkoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgb3JpZ2luOiBfdGhpczIudXJsLFxuICAgICAgICAgIHRhcmdldDogc29ja2V0XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBDbG9zZXMgdGhlIGNvbm5lY3Rpb24gYW5kIHRyaWdnZXJzIHRoZSBvbmNsb3NlIG1ldGhvZCBvZiBhbGwgbGlzdGVuaW5nXG4gICAgKiB3ZWJzb2NrZXRzLiBBZnRlciB0aGF0IGl0IHJlbW92ZXMgaXRzZWxmIGZyb20gdGhlIHVybE1hcCBzbyBhbm90aGVyIHNlcnZlclxuICAgICogY291bGQgYWRkIGl0c2VsZiB0byB0aGUgdXJsLlxuICAgICpcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICAgICAgdmFyIGNvZGUgPSBvcHRpb25zLmNvZGU7XG4gICAgICB2YXIgcmVhc29uID0gb3B0aW9ucy5yZWFzb247XG4gICAgICB2YXIgd2FzQ2xlYW4gPSBvcHRpb25zLndhc0NsZWFuO1xuXG4gICAgICB2YXIgbGlzdGVuZXJzID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG5cbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgc29ja2V0LnJlYWR5U3RhdGUgPSBfd2Vic29ja2V0MlsnZGVmYXVsdCddLkNMT1NFO1xuICAgICAgICBzb2NrZXQuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICB0YXJnZXQ6IHNvY2tldCxcbiAgICAgICAgICBjb2RlOiBjb2RlIHx8IF9oZWxwZXJzQ2xvc2VDb2RlczJbJ2RlZmF1bHQnXS5DTE9TRV9OT1JNQUwsXG4gICAgICAgICAgcmVhc29uOiByZWFzb24gfHwgJycsXG4gICAgICAgICAgd2FzQ2xlYW46IHdhc0NsZWFuXG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoeyB0eXBlOiAnY2xvc2UnIH0pLCB0aGlzKTtcbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZVNlcnZlcih0aGlzLnVybCk7XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFJldHVybnMgYW4gYXJyYXkgb2Ygd2Vic29ja2V0cyB3aGljaCBhcmUgbGlzdGVuaW5nIHRvIHRoaXMgc2VydmVyXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2NsaWVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGllbnRzKCkge1xuICAgICAgcmV0dXJuIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwpO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBQcmVwYXJlcyBhIG1ldGhvZCB0byBzdWJtaXQgYW4gZXZlbnQgdG8gbWVtYmVycyBvZiB0aGUgcm9vbVxuICAgICpcbiAgICAqIGUuZy4gc2VydmVyLnRvKCdteS1yb29tJykuZW1pdCgnaGkhJyk7XG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG8ocm9vbSkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIHZhciB3ZWJzb2NrZXRzID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCwgcm9vbSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbWl0OiBmdW5jdGlvbiBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgX3RoaXMuZW1pdChldmVudCwgZGF0YSwgeyB3ZWJzb2NrZXRzOiB3ZWJzb2NrZXRzIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTZXJ2ZXI7XG59KShfZXZlbnRUYXJnZXQyWydkZWZhdWx0J10pO1xuXG5TZXJ2ZXIub2YgPSBmdW5jdGlvbiBvZih1cmwpIHtcbiAgcmV0dXJuIG5ldyBTZXJ2ZXIodXJsKTtcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNlcnZlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MywgX3g0LCBfeDUpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gzLCBwcm9wZXJ0eSA9IF94NCwgcmVjZWl2ZXIgPSBfeDU7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gzID0gcGFyZW50OyBfeDQgPSBwcm9wZXJ0eTsgX3g1ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF91cmlqcyA9IHJlcXVpcmUoJ3VyaWpzJyk7XG5cbnZhciBfdXJpanMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXJpanMpO1xuXG52YXIgX2hlbHBlcnNEZWxheSA9IHJlcXVpcmUoJy4vaGVscGVycy9kZWxheScpO1xuXG52YXIgX2hlbHBlcnNEZWxheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRGVsYXkpO1xuXG52YXIgX2V2ZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi9ldmVudC10YXJnZXQnKTtcblxudmFyIF9ldmVudFRhcmdldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ldmVudFRhcmdldCk7XG5cbnZhciBfbmV0d29ya0JyaWRnZSA9IHJlcXVpcmUoJy4vbmV0d29yay1icmlkZ2UnKTtcblxudmFyIF9uZXR3b3JrQnJpZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX25ldHdvcmtCcmlkZ2UpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Nsb3NlLWNvZGVzJyk7XG5cbnZhciBfaGVscGVyc0Nsb3NlQ29kZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0Nsb3NlQ29kZXMpO1xuXG52YXIgX2V2ZW50RmFjdG9yeSA9IHJlcXVpcmUoJy4vZXZlbnQtZmFjdG9yeScpO1xuXG4vKlxuKiBUaGUgc29ja2V0LWlvIGNsYXNzIGlzIGRlc2lnbmVkIHRvIG1pbWljayB0aGUgcmVhbCBBUEkgYXMgY2xvc2VseSBhcyBwb3NzaWJsZS5cbipcbiogaHR0cDovL3NvY2tldC5pby9kb2NzL1xuKi9cblxudmFyIFNvY2tldElPID0gKGZ1bmN0aW9uIChfRXZlbnRUYXJnZXQpIHtcbiAgX2luaGVyaXRzKFNvY2tldElPLCBfRXZlbnRUYXJnZXQpO1xuXG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuXG4gIGZ1bmN0aW9uIFNvY2tldElPKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgdXJsID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gJ3NvY2tldC5pbycgOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIHByb3RvY29sID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJycgOiBhcmd1bWVudHNbMV07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU29ja2V0SU8pO1xuXG4gICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoU29ja2V0SU8ucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuYmluYXJ5VHlwZSA9ICdibG9iJztcbiAgICB0aGlzLnVybCA9ICgwLCBfdXJpanMyWydkZWZhdWx0J10pKHVybCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrZXRJTy5DT05ORUNUSU5HO1xuICAgIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sKSAmJiBwcm90b2NvbC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xbMF07XG4gICAgfVxuXG4gICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAvKlxuICAgICogRGVsYXkgdHJpZ2dlcmluZyB0aGUgY29ubmVjdGlvbiBldmVudHMgc28gdGhleSBjYW4gYmUgZGVmaW5lZCBpbiB0aW1lLlxuICAgICovXG4gICAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uIGRlbGF5Q2FsbGJhY2soKSB7XG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLk9QRU47XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdjb25uZWN0aW9uJyB9KSwgc2VydmVyLCB0aGlzKTtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Nvbm5lY3QnIH0pLCBzZXJ2ZXIsIHRoaXMpOyAvLyBhbGlhc1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Nvbm5lY3QnLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ0xPU0VEO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Vycm9yJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUNsb3NlRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICBjb2RlOiBfaGVscGVyc0Nsb3NlQ29kZXMyWydkZWZhdWx0J10uQ0xPU0VfTk9STUFMXG4gICAgICAgIH0pKTtcblxuICAgICAgICBjb25zb2xlLmVycm9yKCdTb2NrZXQuaW8gY29ubmVjdGlvbiB0byBcXCcnICsgdGhpcy51cmwgKyAnXFwnIGZhaWxlZCcpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICBBZGQgYW4gYWxpYXNlZCBldmVudCBsaXN0ZW5lciBmb3IgY2xvc2UgLyBkaXNjb25uZWN0XG4gICAgICovXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgX3RoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQsXG4gICAgICAgIGNvZGU6IGV2ZW50LmNvZGVcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICogQ2xvc2VzIHRoZSBTb2NrZXRJTyBjb25uZWN0aW9uIG9yIGNvbm5lY3Rpb24gYXR0ZW1wdCwgaWYgYW55LlxuICAqIElmIHRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHkgQ0xPU0VELCB0aGlzIG1ldGhvZCBkb2VzIG5vdGhpbmcuXG4gICovXG5cbiAgX2NyZWF0ZUNsYXNzKFNvY2tldElPLCBbe1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBTb2NrZXRJTy5PUEVOKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgICAgX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ucmVtb3ZlV2ViU29ja2V0KHRoaXMsIHRoaXMudXJsKTtcblxuICAgICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ0xPU0VEO1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUNsb3NlRXZlbnQpKHtcbiAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICBjb2RlOiBfaGVscGVyc0Nsb3NlQ29kZXMyWydkZWZhdWx0J10uQ0xPU0VfTk9STUFMXG4gICAgICB9KSk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgY29kZTogX2hlbHBlcnNDbG9zZUNvZGVzMlsnZGVmYXVsdCddLkNMT1NFX05PUk1BTFxuICAgICAgICB9KSwgc2VydmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogQWxpYXMgZm9yIFNvY2tldCNjbG9zZVxuICAgICpcbiAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NrZXRpby9zb2NrZXQuaW8tY2xpZW50L2Jsb2IvbWFzdGVyL2xpYi9zb2NrZXQuanMjTDM4M1xuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzY29ubmVjdCgpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogU3VibWl0cyBhbiBldmVudCB0byB0aGUgc2VydmVyIHdpdGggYSBwYXlsb2FkXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2VtaXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBTb2NrZXRJTy5PUEVOKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU29ja2V0SU8gaXMgYWxyZWFkeSBpbiBDTE9TSU5HIG9yIENMT1NFRCBzdGF0ZScpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbWVzc2FnZUV2ZW50ID0gKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlTWVzc2FnZUV2ZW50KSh7XG4gICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9KTtcblxuICAgICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQobWVzc2FnZUV2ZW50LCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogU3VibWl0cyBhICdtZXNzYWdlJyBldmVudCB0byB0aGUgc2VydmVyLlxuICAgICpcbiAgICAqIFNob3VsZCBiZWhhdmUgZXhhY3RseSBsaWtlIFdlYlNvY2tldCNzZW5kXG4gICAgKlxuICAgICogaHR0cHM6Ly9naXRodWIuY29tL3NvY2tldGlvL3NvY2tldC5pby1jbGllbnQvYmxvYi9tYXN0ZXIvbGliL3NvY2tldC5qcyNMMTEzXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3NlbmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kKGRhdGEpIHtcbiAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGRhdGEpO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBGb3IgcmVnaXN0ZXJpbmcgZXZlbnRzIHRvIGJlIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlclxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogSm9pbiBhIHJvb20gb24gYSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9yb29tcy1hbmQtbmFtZXNwYWNlcy8jam9pbmluZy1hbmQtbGVhdmluZ1xuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnam9pbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGpvaW4ocm9vbSkge1xuICAgICAgX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uYWRkTWVtYmVyc2hpcFRvUm9vbSh0aGlzLCByb29tKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEdldCB0aGUgd2Vic29ja2V0IHRvIGxlYXZlIHRoZSByb29tXG4gICAgICpcbiAgICAgKiBodHRwOi8vc29ja2V0LmlvL2RvY3Mvcm9vbXMtYW5kLW5hbWVzcGFjZXMvI2pvaW5pbmctYW5kLWxlYXZpbmdcbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2xlYXZlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbGVhdmUocm9vbSkge1xuICAgICAgX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ucmVtb3ZlTWVtYmVyc2hpcEZyb21Sb29tKHRoaXMsIHJvb20pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogSW52b2tlcyBhbGwgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgYXJlIGxpc3RlbmluZyB0byB0aGUgZ2l2ZW4gZXZlbnQudHlwZSBwcm9wZXJ0eS4gRWFjaFxuICAgICAqIGxpc3RlbmVyIHdpbGwgYmUgcGFzc2VkIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gYWxsIGxpc3RlbmVycyBvZiB0aGUgZXZlbnQudHlwZSBwcm9wZXJ0eVxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgY3VzdG9tQXJndW1lbnRzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBjdXN0b21Bcmd1bWVudHNbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgZXZlbnROYW1lID0gZXZlbnQudHlwZTtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tldmVudE5hbWVdO1xuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBpZiAoY3VzdG9tQXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ZW5lci5hcHBseShfdGhpczIsIGN1c3RvbUFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmVndWxhciBXZWJTb2NrZXRzIGV4cGVjdCBhIE1lc3NhZ2VFdmVudCBidXQgU29ja2V0aW8uaW8ganVzdCB3YW50cyByYXcgZGF0YVxuICAgICAgICAgIC8vICBwYXlsb2FkIGluc3RhbmNlb2YgTWVzc2FnZUV2ZW50IHdvcmtzLCBidXQgeW91IGNhbid0IGlzbnRhbmNlIG9mIE5vZGVFdmVudFxuICAgICAgICAgIC8vICBmb3Igbm93IHdlIGRldGVjdCBpZiB0aGUgb3V0cHV0IGhhcyBkYXRhIGRlZmluZWQgb24gaXRcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKF90aGlzMiwgZXZlbnQuZGF0YSA/IGV2ZW50LmRhdGEgOiBldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTb2NrZXRJTztcbn0pKF9ldmVudFRhcmdldDJbJ2RlZmF1bHQnXSk7XG5cblNvY2tldElPLkNPTk5FQ1RJTkcgPSAwO1xuU29ja2V0SU8uT1BFTiA9IDE7XG5Tb2NrZXRJTy5DTE9TSU5HID0gMjtcblNvY2tldElPLkNMT1NFRCA9IDM7XG5cbi8qXG4qIFN0YXRpYyBjb25zdHJ1Y3RvciBtZXRob2RzIGZvciB0aGUgSU8gU29ja2V0XG4qL1xudmFyIElPID0gZnVuY3Rpb24gaW9Db25zdHJ1Y3Rvcih1cmwpIHtcbiAgcmV0dXJuIG5ldyBTb2NrZXRJTyh1cmwpO1xufTtcblxuLypcbiogQWxpYXMgdGhlIHJhdyBJTygpIGNvbnN0cnVjdG9yXG4qL1xuSU8uY29ubmVjdCA9IGZ1bmN0aW9uIGlvQ29ubmVjdCh1cmwpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbmV3LWNhcCAqL1xuICByZXR1cm4gSU8odXJsKTtcbiAgLyogZXNsaW50LWVuYWJsZSBuZXctY2FwICovXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBJTztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF91cmlqcyA9IHJlcXVpcmUoJ3VyaWpzJyk7XG5cbnZhciBfdXJpanMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXJpanMpO1xuXG52YXIgX2hlbHBlcnNEZWxheSA9IHJlcXVpcmUoJy4vaGVscGVycy9kZWxheScpO1xuXG52YXIgX2hlbHBlcnNEZWxheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRGVsYXkpO1xuXG52YXIgX2V2ZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi9ldmVudC10YXJnZXQnKTtcblxudmFyIF9ldmVudFRhcmdldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ldmVudFRhcmdldCk7XG5cbnZhciBfbmV0d29ya0JyaWRnZSA9IHJlcXVpcmUoJy4vbmV0d29yay1icmlkZ2UnKTtcblxudmFyIF9uZXR3b3JrQnJpZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX25ldHdvcmtCcmlkZ2UpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Nsb3NlLWNvZGVzJyk7XG5cbnZhciBfaGVscGVyc0Nsb3NlQ29kZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0Nsb3NlQ29kZXMpO1xuXG52YXIgX2V2ZW50RmFjdG9yeSA9IHJlcXVpcmUoJy4vZXZlbnQtZmFjdG9yeScpO1xuXG4vKlxuKiBUaGUgbWFpbiB3ZWJzb2NrZXQgY2xhc3Mgd2hpY2ggaXMgZGVzaWduZWQgdG8gbWltaWNrIHRoZSBuYXRpdmUgV2ViU29ja2V0IGNsYXNzIGFzIGNsb3NlXG4qIGFzIHBvc3NpYmxlLlxuKlxuKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0XG4qL1xuXG52YXIgV2ViU29ja2V0ID0gKGZ1bmN0aW9uIChfRXZlbnRUYXJnZXQpIHtcbiAgX2luaGVyaXRzKFdlYlNvY2tldCwgX0V2ZW50VGFyZ2V0KTtcblxuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cblxuICBmdW5jdGlvbiBXZWJTb2NrZXQodXJsKSB7XG4gICAgdmFyIHByb3RvY29sID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJycgOiBhcmd1bWVudHNbMV07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgV2ViU29ja2V0KTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFdlYlNvY2tldC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuXG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnV2ViU29ja2V0XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5iaW5hcnlUeXBlID0gJ2Jsb2InO1xuICAgIHRoaXMudXJsID0gKDAsIF91cmlqczJbJ2RlZmF1bHQnXSkodXJsKS50b1N0cmluZygpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DT05ORUNUSU5HO1xuICAgIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sKSAmJiBwcm90b2NvbC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xbMF07XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEluIG9yZGVyIHRvIGNhcHR1cmUgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdlIG5lZWQgdG8gZGVmaW5lIGN1c3RvbSBzZXR0ZXJzLlxuICAgICogVG8gaWxsdXN0cmF0ZTpcbiAgICAqICAgbXlTb2NrZXQub25vcGVuID0gZnVuY3Rpb24oKSB7IGFsZXJ0KHRydWUpIH07XG4gICAgKlxuICAgICogVGhlIG9ubHkgd2F5IHRvIGNhcHR1cmUgdGhhdCBmdW5jdGlvbiBhbmQgaG9sZCBvbnRvIGl0IGZvciBsYXRlciBpcyB3aXRoIHRoZVxuICAgICogYmVsb3cgY29kZTpcbiAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG9ub3Blbjoge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5vcGVuO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9ubWVzc2FnZToge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5tZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uY2xvc2U6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuY2xvc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uZXJyb3I6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuZXJyb3I7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAvKlxuICAgICogVGhpcyBkZWxheSBpcyBuZWVkZWQgc28gdGhhdCB3ZSBkb250IHRyaWdnZXIgYW4gZXZlbnQgYmVmb3JlIHRoZSBjYWxsYmFja3MgaGF2ZSBiZWVuXG4gICAgKiBzZXR1cC4gRm9yIGV4YW1wbGU6XG4gICAgKlxuICAgICogdmFyIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vbG9jYWxob3N0Jyk7XG4gICAgKlxuICAgICogLy8gSWYgd2UgZG9udCBoYXZlIHRoZSBkZWxheSB0aGVuIHRoZSBldmVudCB3b3VsZCBiZSB0cmlnZ2VyZWQgcmlnaHQgaGVyZSBhbmQgdGhpcyBpc1xuICAgICogLy8gYmVmb3JlIHRoZSBvbm9wZW4gaGFkIGEgY2hhbmNlIHRvIHJlZ2lzdGVyIGl0c2VsZi5cbiAgICAqXG4gICAgKiBzb2NrZXQub25vcGVuID0gKCkgPT4geyAvLyB0aGlzIHdvdWxkIG5ldmVyIGJlIGNhbGxlZCB9O1xuICAgICpcbiAgICAqIC8vIGFuZCB3aXRoIHRoZSBkZWxheSB0aGUgZXZlbnQgZ2V0cyB0cmlnZ2VyZWQgaGVyZSBhZnRlciBhbGwgb2YgdGhlIGNhbGxiYWNrcyBoYXZlIGJlZW5cbiAgICAqIC8vIHJlZ2lzdGVyZWQgOi0pXG4gICAgKi9cbiAgICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gZGVsYXlDYWxsYmFjaygpIHtcbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0Lk9QRU47XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdjb25uZWN0aW9uJyB9KSwgc2VydmVyLCB0aGlzKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdvcGVuJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnZXJyb3InLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoeyB0eXBlOiAnY2xvc2UnLCB0YXJnZXQ6IHRoaXMsIGNvZGU6IF9oZWxwZXJzQ2xvc2VDb2RlczJbJ2RlZmF1bHQnXS5DTE9TRV9OT1JNQUwgfSkpO1xuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1dlYlNvY2tldCBjb25uZWN0aW9uIHRvIFxcJycgKyB0aGlzLnVybCArICdcXCcgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICAvKlxuICAqIFRyYW5zbWl0cyBkYXRhIHRvIHRoZSBzZXJ2ZXIgb3ZlciB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24uXG4gICpcbiAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0I3NlbmQoKVxuICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhXZWJTb2NrZXQsIFt7XG4gICAga2V5OiAnc2VuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NJTkcgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViU29ja2V0IGlzIGFscmVhZHkgaW4gQ0xPU0lORyBvciBDTE9TRUQgc3RhdGUnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG1lc3NhZ2VFdmVudCA9ICgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VFdmVudCkoe1xuICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgIG9yaWdpbjogdGhpcy51cmwsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2VydmVyID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uc2VydmVyTG9va3VwKHRoaXMudXJsKTtcblxuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChtZXNzYWdlRXZlbnQsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBDbG9zZXMgdGhlIFdlYlNvY2tldCBjb25uZWN0aW9uIG9yIGNvbm5lY3Rpb24gYXR0ZW1wdCwgaWYgYW55LlxuICAgICogSWYgdGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBDTE9TRUQsIHRoaXMgbWV0aG9kIGRvZXMgbm90aGluZy5cbiAgICAqXG4gICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0I2Nsb3NlKClcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnY2xvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgICAgdmFyIGNsb3NlRXZlbnQgPSAoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgY29kZTogX2hlbHBlcnNDbG9zZUNvZGVzMlsnZGVmYXVsdCddLkNMT1NFX05PUk1BTFxuICAgICAgfSk7XG5cbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZVdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCwgc2VydmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gV2ViU29ja2V0O1xufSkoX2V2ZW50VGFyZ2V0MlsnZGVmYXVsdCddKTtcblxuV2ViU29ja2V0LkNPTk5FQ1RJTkcgPSAwO1xuV2ViU29ja2V0Lk9QRU4gPSAxO1xuV2ViU29ja2V0LkNMT1NJTkcgPSAyO1xuV2ViU29ja2V0LkNMT1NFRCA9IDM7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFdlYlNvY2tldDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY1NvY2tldElvID0gcmVxdWlyZSgnLi4vc3JjL3NvY2tldC1pbycpO1xuXG52YXIgX3NyY1NvY2tldElvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY1NvY2tldElvKTtcblxudmFyIF9zcmNTZXJ2ZXIgPSByZXF1aXJlKCcuLi9zcmMvc2VydmVyJyk7XG5cbnZhciBfc3JjU2VydmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY1NlcnZlcik7XG5cbmRlc2NyaWJlKCdGdW5jdGlvbmFsIC0gU29ja2V0SU8nLCBmdW5jdGlvbiBmdW5jdGlvbmFsVGVzdCgpIHtcbiAgaXQoJ2NsaWVudCB0cmlnZ2VycyB0aGUgc2VydmVyIGNvbm5lY3Rpb24gZXZlbnQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBzZXJ2ZXIgPSBuZXcgX3NyY1NlcnZlcjJbJ2RlZmF1bHQnXSgnZm9vYmFyJyk7XG4gICAgdmFyIHNvY2tldCA9ICgwLCBfc3JjU29ja2V0SW8yWydkZWZhdWx0J10pKCdmb29iYXInKTtcblxuICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSk7XG4gICAgICBzb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdjbGllbnQgdHJpZ2dlcnMgdGhlIHNlcnZlciBjb25uZWN0IGV2ZW50JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgc2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ2Zvb2JhcicpO1xuICAgIHZhciBzb2NrZXQgPSAoMCwgX3NyY1NvY2tldElvMlsnZGVmYXVsdCddKSgnZm9vYmFyJyk7XG5cbiAgICBzZXJ2ZXIub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHRydWUpO1xuICAgICAgc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBpdCgnc2VydmVyIHRyaWdnZXJzIHRoZSBjbGllbnQgY29ubmVjdCBldmVudCcsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHNlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKCdmb29iYXInKTtcbiAgICB2YXIgc29ja2V0ID0gKDAsIF9zcmNTb2NrZXRJbzJbJ2RlZmF1bHQnXSkoJ2Zvb2JhcicpO1xuXG4gICAgc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlKTtcbiAgICAgIHNvY2tldC5kaXNjb25uZWN0KCk7XG4gICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ25vIGNvbm5lY3Rpb24gdHJpZ2dlcnMgdGhlIGNsaWVudCBlcnJvciBldmVudCcsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHNvY2tldCA9ICgwLCBfc3JjU29ja2V0SW8yWydkZWZhdWx0J10pKCdmb29iYXInKTtcblxuICAgIHNvY2tldC5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHRydWUpO1xuICAgICAgc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ2NsaWVudCBhbmQgc2VydmVyIHJlY2VpdmUgYW4gZXZlbnQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBzZXJ2ZXIgPSBuZXcgX3NyY1NlcnZlcjJbJ2RlZmF1bHQnXSgnZm9vYmFyJyk7XG4gICAgc2VydmVyLm9uKCdjbGllbnQtZXZlbnQnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VydmVyLmVtaXQoJ3NlcnZlci1yZXNwb25zZScsIGRhdGEpO1xuICAgIH0pO1xuXG4gICAgdmFyIHNvY2tldCA9ICgwLCBfc3JjU29ja2V0SW8yWydkZWZhdWx0J10pKCdmb29iYXInKTtcbiAgICBzb2NrZXQub24oJ3NlcnZlci1yZXNwb25zZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKCdwYXlsb2FkJywgZGF0YSk7XG4gICAgICBzb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzb2NrZXQuZW1pdCgnY2xpZW50LWV2ZW50JywgJ3BheWxvYWQnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ1NlcnZlciBjbG9zaW5nIHRyaWdnZXJzIHRoZSBjbGllbnQgZGlzY29ubmVjdCBldmVudCcsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHNlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKCdmb29iYXInKTtcbiAgICBzZXJ2ZXIub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIHZhciBzb2NrZXQgPSAoMCwgX3NyY1NvY2tldElvMlsnZGVmYXVsdCddKSgnZm9vYmFyJyk7XG4gICAgc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlKTtcbiAgICAgIHNvY2tldC5kaXNjb25uZWN0KCk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdTZXJ2ZXIgcmVjZWl2ZXMgZGlzY29ubmVjdCB3aGVuIHNvY2tldCBpcyBjbG9zZWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBzZXJ2ZXIgPSBuZXcgX3NyY1NlcnZlcjJbJ2RlZmF1bHQnXSgnZm9vYmFyJyk7XG4gICAgc2VydmVyLm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgdmFyIHNvY2tldCA9ICgwLCBfc3JjU29ja2V0SW8yWydkZWZhdWx0J10pKCdmb29iYXInKTtcbiAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuICB9KTtcblxuICBpdCgnQ2xpZW50IGNhbiBzdWJtaXQgYW4gZXZlbnQgd2l0aG91dCBhIHBheWxvYWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBzZXJ2ZXIgPSBuZXcgX3NyY1NlcnZlcjJbJ2RlZmF1bHQnXSgnZm9vYmFyJyk7XG4gICAgc2VydmVyLm9uKCdjbGllbnQtZXZlbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHRydWUpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG5cbiAgICB2YXIgc29ja2V0ID0gKDAsIF9zcmNTb2NrZXRJbzJbJ2RlZmF1bHQnXSkoJ2Zvb2JhcicpO1xuICAgIHNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNvY2tldC5lbWl0KCdjbGllbnQtZXZlbnQnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgaXQoJ0NsaWVudCBhbHNvIGhhcyB0aGUgc2VuZCBtZXRob2QgYXZhaWxhYmxlJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgc2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ2Zvb2JhcicpO1xuICAgIHNlcnZlci5vbignbWVzc2FnZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGRhdGEsICdodWxsbyEnKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgdmFyIHNvY2tldCA9ICgwLCBfc3JjU29ja2V0SW8yWydkZWZhdWx0J10pKCdmb29iYXInKTtcbiAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzb2NrZXQuc2VuZCgnaHVsbG8hJyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdhIHNvY2tldCBjYW4gam9pbiBhbmQgbGVhdmUgYSByb29tJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgc2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vcm9vbXknKTtcbiAgICB2YXIgc29ja2V0ID0gKDAsIF9zcmNTb2NrZXRJbzJbJ2RlZmF1bHQnXSkoJ3dzOi8vcm9vbXknKTtcblxuICAgIHNvY2tldC5vbignZ29vZC1yZXNwb25zZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSk7XG4gICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIHNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNvY2tldC5qb2luKCdyb29tJyk7XG4gICAgICBzZXJ2ZXIudG8oJ3Jvb20nKS5lbWl0KCdnb29kLXJlc3BvbnNlJyk7XG4gICAgfSk7XG4gIH0pO1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbnZhciBfYXNzZXJ0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Fzc2VydCk7XG5cbnZhciBfc3JjU2VydmVyID0gcmVxdWlyZSgnLi4vc3JjL3NlcnZlcicpO1xuXG52YXIgX3NyY1NlcnZlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zcmNTZXJ2ZXIpO1xuXG52YXIgX3NyY1dlYnNvY2tldCA9IHJlcXVpcmUoJy4uL3NyYy93ZWJzb2NrZXQnKTtcblxudmFyIF9zcmNXZWJzb2NrZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3JjV2Vic29ja2V0KTtcblxudmFyIF9zcmNOZXR3b3JrQnJpZGdlID0gcmVxdWlyZSgnLi4vc3JjL25ldHdvcmstYnJpZGdlJyk7XG5cbnZhciBfc3JjTmV0d29ya0JyaWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zcmNOZXR3b3JrQnJpZGdlKTtcblxuZGVzY3JpYmUoJ0Z1bmN0aW9uYWwgLSBXZWJTb2NrZXRzJywgZnVuY3Rpb24gZnVuY3Rpb25hbFRlc3QoKSB7XG4gIGFmdGVyRWFjaChmdW5jdGlvbiBhZnRlcigpIHtcbiAgICBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS51cmxNYXAgPSB7fTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgY3JlYXRpbmcgYSB3ZWJzb2NrZXQgd2l0aCBubyBzZXJ2ZXIgaW52b2tlcyB0aGUgb25lcnJvciBtZXRob2QnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBtb2NrU29ja2V0ID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcbiAgICBtb2NrU29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiBlcnJvcihldmVudCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC50YXJnZXQucmVhZHlTdGF0ZSwgX3NyY1dlYnNvY2tldDJbJ2RlZmF1bHQnXS5DTE9TRUQsICdvbmVycm9yIGZpcmVzIGFzIGV4cGVjdGVkJyk7XG4gICAgICBkb25lKCk7XG4gICAgfTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgb25vcGVuIGlzIGNhbGxlZCBhZnRlciBzdWNjZXNzZnVsbHkgY29ubmVjdGlvbiB0byB0aGUgc2VydmVyJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgc2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcbiAgICB2YXIgbW9ja1NvY2tldCA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG5cbiAgICBtb2NrU29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIG9wZW4oZXZlbnQpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQudGFyZ2V0LnJlYWR5U3RhdGUsIF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10uT1BFTiwgJ29ub3BlbiBmaXJlcyBhcyBleHBlY3RlZCcpO1xuICAgICAgZG9uZSgpO1xuICAgIH07XG4gIH0pO1xuXG4gIGl0KCd0aGF0IG9ubWVzc2FnZSBpcyBjYWxsZWQgYWZ0ZXIgdGhlIHNlcnZlciBzZW5kcyBhIG1lc3NhZ2UnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciB0ZXN0ID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcblxuICAgIHRlc3Qub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbiBjb25uZWN0aW9uKHNlcnZlcikge1xuICAgICAgc2VydmVyLnNlbmQoJ1Rlc3RpbmcnKTtcbiAgICB9KTtcblxuICAgIHZhciBtb2NrU29ja2V0ID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcblxuICAgIG1vY2tTb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gbWVzc2FnZShldmVudCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC5kYXRhLCAnVGVzdGluZycsICdvbm1lc3NhZ2UgZmlyZXMgYXMgZXhwZWN0ZWQnKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9O1xuICB9KTtcblxuICBpdCgndGhhdCBvbmNsb3NlIGlzIGNhbGxlZCBhZnRlciB0aGUgY2xpZW50IGNsb3NlcyB0aGUgY29ubmVjdGlvbicsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHRlc3QgPSBuZXcgX3NyY1NlcnZlcjJbJ2RlZmF1bHQnXSgnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuXG4gICAgdGVzdC5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uIGNvbm5lY3Rpb24oc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIuc2VuZCgnVGVzdGluZycpO1xuICAgIH0pO1xuXG4gICAgdmFyIG1vY2tTb2NrZXQgPSBuZXcgX3NyY1dlYnNvY2tldDJbJ2RlZmF1bHQnXSgnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuXG4gICAgbW9ja1NvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiBtZXNzYWdlKCkge1xuICAgICAgbW9ja1NvY2tldC5jbG9zZSgpO1xuICAgIH07XG5cbiAgICBtb2NrU29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiBjbG9zZShldmVudCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC50YXJnZXQucmVhZHlTdGF0ZSwgX3NyY1dlYnNvY2tldDJbJ2RlZmF1bHQnXS5DTE9TRUQsICdvbmNsb3NlIGZpcmVzIGFzIGV4cGVjdGVkJyk7XG4gICAgICBkb25lKCk7XG4gICAgfTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgdGhlIHNlcnZlciBnZXRzIGNhbGxlZCB3aGVuIHRoZSBjbGllbnQgc2VuZHMgYSBtZXNzYWdlJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgdGVzdCA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG5cbiAgICB0ZXN0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gbWVzc2FnZShkYXRhKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGRhdGEsICdUZXN0aW5nJywgJ29uIG1lc3NhZ2UgZmlyZXMgYXMgZXhwZWN0ZWQnKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIHZhciBtb2NrU29ja2V0ID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcblxuICAgIG1vY2tTb2NrZXQub25vcGVuID0gZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgIHRoaXMuc2VuZCgnVGVzdGluZycpO1xuICAgIH07XG4gIH0pO1xuXG4gIGl0KCd0aGF0IHRoZSBvbm9wZW4gZnVuY3Rpb24gd2lsbCBvbmx5IGJlIGNhbGxlZCBvbmNlIGZvciBlYWNoIGNsaWVudCcsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHNvY2tldFVybCA9ICd3czovL2xvY2FsaG9zdDo4MDgwJztcbiAgICB2YXIgbW9ja1NlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG4gICAgdmFyIHdlYnNvY2tldEZvbyA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG4gICAgdmFyIHdlYnNvY2tldEJhciA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG5cbiAgICB3ZWJzb2NrZXRGb28ub25vcGVuID0gZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSwgJ21vY2tzb2NrZXQgb25vcGVuIGZpcmVzIGFzIGV4cGVjdGVkJyk7XG4gICAgfTtcblxuICAgIHdlYnNvY2tldEJhci5vbm9wZW4gPSBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlLCAnbW9ja3NvY2tldCBvbm9wZW4gZmlyZXMgYXMgZXhwZWN0ZWQnKTtcbiAgICAgIG1vY2tTZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9O1xuICB9KTtcblxuICBpdCgnY2xvc2luZyBhIGNsaWVudCB3aWxsIG9ubHkgY2xvc2UgaXRzZWxmIGFuZCBub3Qgb3RoZXIgY2xpZW50cycsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHNlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgdmFyIHdlYnNvY2tldEZvbyA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgdmFyIHdlYnNvY2tldEJhciA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG5cbiAgICB3ZWJzb2NrZXRGb28ub25jbG9zZSA9IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayhmYWxzZSwgJ21vY2tzb2NrZXQgc2hvdWxkIG5vdCBjbG9zZScpO1xuICAgIH07XG5cbiAgICB3ZWJzb2NrZXRCYXIub25vcGVuID0gZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9O1xuXG4gICAgd2Vic29ja2V0QmFyLm9uY2xvc2UgPSBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSwgJ21vY2tzb2NrZXQgb25jbG9zZSBmaXJlcyBhcyBleHBlY3RlZCcpO1xuICAgICAgZG9uZSgpO1xuICAgIH07XG4gIH0pO1xuXG4gIGl0KCdtb2NrIGNsaWVudHMgY2FuIHNlbmQgbWVzc2FnZXMgdG8gdGhlIHJpZ2h0IG1vY2sgc2VydmVyJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgc2VydmVyRm9vID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcbiAgICB2YXIgc2VydmVyQmFyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODEnKTtcbiAgICB2YXIgZGF0YUZvbyA9ICdmb28nO1xuICAgIHZhciBkYXRhQmFyID0gJ2Jhcic7XG4gICAgdmFyIHNvY2tldEZvbyA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgdmFyIHNvY2tldEJhciA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL2xvY2FsaG9zdDo4MDgxJyk7XG5cbiAgICBzZXJ2ZXJGb28ub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbiBjb25uZWN0aW9uKHNlcnZlcikge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlLCAnbW9jayBzZXJ2ZXIgb24gY29ubmVjdGlvbiBmaXJlcyBhcyBleHBlY3RlZCcpO1xuXG4gICAgICBzZXJ2ZXIub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiBtZXNzYWdlKGRhdGEpIHtcbiAgICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChkYXRhLCBkYXRhRm9vKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VydmVyQmFyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24gY29ubmVjdGlvbihzZXJ2ZXIpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSwgJ21vY2sgc2VydmVyIG9uIGNvbm5lY3Rpb24gZmlyZXMgYXMgZXhwZWN0ZWQnKTtcblxuICAgICAgc2VydmVyLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gbWVzc2FnZShkYXRhKSB7XG4gICAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZGF0YSwgZGF0YUJhcik7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc29ja2V0Rm9vLm9ub3BlbiA9IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHRydWUsICdtb2Nrc29ja2V0IG9ub3BlbiBmaXJlcyBhcyBleHBlY3RlZCcpO1xuICAgICAgdGhpcy5zZW5kKGRhdGFGb28pO1xuICAgIH07XG5cbiAgICBzb2NrZXRCYXIub25vcGVuID0gZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSwgJ21vY2tzb2NrZXQgb25vcGVuIGZpcmVzIGFzIGV4cGVjdGVkJyk7XG4gICAgICB0aGlzLnNlbmQoZGF0YUJhcik7XG4gICAgfTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgY2xvc2luZyBhIHdlYnNvY2tldCByZW1vdmVzIGl0IGZyb20gdGhlIG5ldHdvcmsgYnJpZGdlJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgc2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcbiAgICB2YXIgc29ja2V0ID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcblxuICAgIHNvY2tldC5vbm9wZW4gPSBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgdmFyIHVybE1hcCA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnVybE1hcFsnd3M6Ly9sb2NhbGhvc3Q6ODA4MC8nXTtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwodXJsTWFwLndlYnNvY2tldHMubGVuZ3RoLCAxLCAndGhlIHdlYnNvY2tldCBpcyBpbiB0aGUgbmV0d29yayBicmlkZ2UnKTtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKHVybE1hcC53ZWJzb2NrZXRzWzBdLCB0aGlzLCAndGhlIHdlYnNvY2tldCBpcyBpbiB0aGUgbmV0d29yayBicmlkZ2UnKTtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9O1xuXG4gICAgc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgIHZhciB1cmxNYXAgPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS51cmxNYXBbJ3dzOi8vbG9jYWxob3N0OjgwODAvJ107XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKHVybE1hcC53ZWJzb2NrZXRzLmxlbmd0aCwgMCwgJ3RoZSB3ZWJzb2NrZXQgd2FzIHJlbW92ZWQgZnJvbSB0aGUgbmV0d29yayBicmlkZ2UnKTtcbiAgICAgIHNlcnZlci5jbG9zZSgpO1xuICAgICAgZG9uZSgpO1xuICAgIH07XG4gIH0pO1xufSk7IiwiLypcbiogVGhpcyBsb2FkcyBhbGwgb2YgdGhlIGdsb2JhbHMgbmVlZGVkIGZvciBtb2Nrc29ja2V0cyBhbmQgbW9ja3NlcnZlciB0byB3b3JrIGNvcnJlY3RseS5cbiogVGhpcyBzaG91bGQgYmUgdGhlIGZpcnN0IGltcG9ydCBpbiB0aGUgdGVzdCBsb2FkZXIuXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuLi91bml0LW5ldHdvcmstYnJpZGdlLXRlc3QnKTtcblxucmVxdWlyZSgnLi4vdW5pdC1ldmVudC10YXJnZXQtdGVzdCcpO1xuXG5yZXF1aXJlKCcuLi91bml0LWZhY3RvcnktdGVzdCcpO1xuXG5yZXF1aXJlKCcuLi91bml0LXdlYnNvY2tldC10ZXN0Jyk7XG5cbnJlcXVpcmUoJy4uL3VuaXQtc2VydmVyLXRlc3QnKTtcblxucmVxdWlyZSgnLi4vdW5pdC1zb2NrZXQtaW8tdGVzdCcpO1xuXG5yZXF1aXJlKCcuLi9mdW5jdGlvbmFsLXdlYnNvY2tldHMtdGVzdCcpO1xuXG5yZXF1aXJlKCcuLi9mdW5jdGlvbmFsLXNvY2tldC1pby10ZXN0Jyk7XG5cbnJlcXVpcmUoJy4uL2lzc3VlLTEzLXRlc3QnKTtcblxucmVxdWlyZSgnLi4vaXNzdWUtMTktdGVzdCcpO1xuXG5yZXF1aXJlKCcuLi9pc3N1ZS02NC10ZXN0Jyk7XG5cbnJlcXVpcmUoJy4uL2lzc3VlLTY1LXRlc3QnKTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9hc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxudmFyIF9hc3NlcnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXNzZXJ0KTtcblxudmFyIF9zcmNTZXJ2ZXIgPSByZXF1aXJlKCcuLi9zcmMvc2VydmVyJyk7XG5cbnZhciBfc3JjU2VydmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY1NlcnZlcik7XG5cbnZhciBfc3JjV2Vic29ja2V0ID0gcmVxdWlyZSgnLi4vc3JjL3dlYnNvY2tldCcpO1xuXG52YXIgX3NyY1dlYnNvY2tldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zcmNXZWJzb2NrZXQpO1xuXG5kZXNjcmliZSgnSXNzdWUgIzEzOiBTb2NrZXRzIHNlbmQgbWVzc2FnZXMgbXVsdGlwbGUgdGltZXMnLCBmdW5jdGlvbiBpc3N1ZVRlc3QoKSB7XG4gIGl0KCdtb2NrIHNvY2tldHMgc2VuZHMgZG91YmxlIG1lc3NhZ2VzJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICB2YXIgc29ja2V0VXJsID0gJ3dzOi8vbG9jYWxob3N0OjgwODAnO1xuICAgIHZhciBtb2NrU2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oc29ja2V0VXJsKTtcbiAgICB2YXIgbW9ja1NvY2tldEEgPSBuZXcgX3NyY1dlYnNvY2tldDJbJ2RlZmF1bHQnXShzb2NrZXRVcmwpO1xuICAgIHZhciBtb2NrU29ja2V0QiA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG5cbiAgICB2YXIgbnVtTWVzc2FnZXNTZW50ID0gMDtcbiAgICB2YXIgbnVtTWVzc2FnZXNSZWNlaXZlZCA9IDA7XG4gICAgdmFyIGNvbm5lY3Rpb25zQ3JlYXRlZCA9IDA7XG5cbiAgICB2YXIgc2VydmVyTWVzc2FnZUhhbmRsZXIgPSBmdW5jdGlvbiBoYW5kbGVyRnVuYygpIHtcbiAgICAgIG51bU1lc3NhZ2VzUmVjZWl2ZWQrKztcbiAgICB9O1xuXG4gICAgbW9ja1NlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uIGNvbm5lY3Rpb25GdW5jKHNlcnZlcikge1xuICAgICAgY29ubmVjdGlvbnNDcmVhdGVkKys7XG4gICAgICBzZXJ2ZXIub24oJ21lc3NhZ2UnLCBzZXJ2ZXJNZXNzYWdlSGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICBtb2NrU29ja2V0QS5vbm9wZW4gPSBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgbnVtTWVzc2FnZXNTZW50Kys7XG4gICAgICB0aGlzLnNlbmQoJzEnKTtcbiAgICB9O1xuXG4gICAgbW9ja1NvY2tldEIub25vcGVuID0gZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgIG51bU1lc3NhZ2VzU2VudCsrO1xuICAgICAgdGhpcy5zZW5kKCcyJyk7XG4gICAgfTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZW91dCgpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwobnVtTWVzc2FnZXNSZWNlaXZlZCwgbnVtTWVzc2FnZXNTZW50KTtcbiAgICAgIG1vY2tTZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9LCA1MDApO1xuICB9KTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY1NlcnZlciA9IHJlcXVpcmUoJy4uL3NyYy9zZXJ2ZXInKTtcblxudmFyIF9zcmNTZXJ2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3JjU2VydmVyKTtcblxudmFyIF9zcmNXZWJzb2NrZXQgPSByZXF1aXJlKCcuLi9zcmMvd2Vic29ja2V0Jyk7XG5cbnZhciBfc3JjV2Vic29ja2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY1dlYnNvY2tldCk7XG5cbmRlc2NyaWJlKCdJc3N1ZSAjMTk6IE1vY2sgU2VydmVyIG9uKG1lc3NhZ2UpIGFyZ3VtZW50IHNob3VsZCBiZSBhIHN0cmluZyBhbmQgbm90IGFuIG9iamVjdC4nLCBmdW5jdGlvbiBpc3N1ZVRlc3QoKSB7XG4gIGl0KCd0aGF0IHNlcnZlciBvbihtZXNzYWdlKSBhcmd1bWVudCBzaG91bGQgYmUgYSBzdHJpbmcgYW5kIG5vdCBhbiBvYmplY3QnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBzb2NrZXRVcmwgPSAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCc7XG4gICAgdmFyIG1vY2tTZXJ2ZXIgPSBuZXcgX3NyY1NlcnZlcjJbJ2RlZmF1bHQnXShzb2NrZXRVcmwpO1xuICAgIHZhciBtb2NrU29ja2V0ID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oc29ja2V0VXJsKTtcblxuICAgIG1vY2tTZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICBzb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKHR5cGVvZiBtZXNzYWdlLCAnc3RyaW5nJywgJ21lc3NhZ2Ugc2hvdWxkIGJlIGEgc3RyaW5nIGFuZCBub3QgYW4gb2JqZWN0Jyk7XG4gICAgICAgIG1vY2tTZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBtb2NrU29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICB0aGlzLnNlbmQoJzEnKTtcbiAgICB9O1xuICB9KTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY1NlcnZlciA9IHJlcXVpcmUoJy4uL3NyYy9zZXJ2ZXInKTtcblxudmFyIF9zcmNTZXJ2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3JjU2VydmVyKTtcblxudmFyIF9zcmNTb2NrZXRJbyA9IHJlcXVpcmUoJy4uL3NyYy9zb2NrZXQtaW8nKTtcblxudmFyIF9zcmNTb2NrZXRJbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zcmNTb2NrZXRJbyk7XG5cbmRlc2NyaWJlKCdJc3N1ZSAjNjQ6IGBvbmAgYWxsb3dzIG11bHRpcGxlIGhhbmRsZXJzIGZvciB0aGUgc2FtZSBldmVudCcsIGZ1bmN0aW9uIGlzc3VlVGVzdCgpIHtcbiAgaXQoJ21vY2sgc29ja2V0cyBpbnZva2VzIGVhY2ggaGFuZGxlcicsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIHNvY2tldFVybCA9ICd3czovL3Jvb215JztcbiAgICB2YXIgc2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oc29ja2V0VXJsKTtcbiAgICB2YXIgc29ja2V0ID0gbmV3IF9zcmNTb2NrZXRJbzJbJ2RlZmF1bHQnXShzb2NrZXRVcmwpO1xuXG4gICAgdmFyIGhhbmRsZXIxQ2FsbGVkID0gZmFsc2U7XG4gICAgdmFyIGhhbmRsZXIyQ2FsbGVkID0gZmFsc2U7XG5cbiAgICBzb2NrZXQub24oJ2N1c3RvbS1ldmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSk7XG4gICAgICBoYW5kbGVyMUNhbGxlZCA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBzb2NrZXQub24oJ2N1c3RvbS1ldmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sodHJ1ZSk7XG4gICAgICBoYW5kbGVyMkNhbGxlZCA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzb2NrZXQuam9pbigncm9vbScpO1xuICAgICAgc2VydmVyLnRvKCdyb29tJykuZW1pdCgnY3VzdG9tLWV2ZW50Jyk7XG4gICAgfSk7XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uIHRpbWVvdXQoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGhhbmRsZXIxQ2FsbGVkLCB0cnVlKTtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoaGFuZGxlcjJDYWxsZWQsIHRydWUpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICBkb25lKCk7XG4gICAgfSwgNTAwKTtcbiAgfSk7XG59KTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9hc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxudmFyIF9hc3NlcnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXNzZXJ0KTtcblxudmFyIF9zcmNTZXJ2ZXIgPSByZXF1aXJlKCcuLi9zcmMvc2VydmVyJyk7XG5cbnZhciBfc3JjU2VydmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY1NlcnZlcik7XG5cbnZhciBfc3JjU29ja2V0SW8gPSByZXF1aXJlKCcuLi9zcmMvc29ja2V0LWlvJyk7XG5cbnZhciBfc3JjU29ja2V0SW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3JjU29ja2V0SW8pO1xuXG5kZXNjcmliZSgnSXNzdWUgIzY1OiBgb25gIGFsbG93cyBtdWx0aXBsZSBoYW5kbGVycyBmb3IgdGhlIHNhbWUgZXZlbnQgd2l0aCBkaWZmZXJlbnQgY29udGV4dHMnLCBmdW5jdGlvbiBpc3N1ZVRlc3QoKSB7XG4gIGl0KCdtb2NrIHNvY2tldCBpbnZva2VzIGVhY2ggaGFuZGxlciB3aXRoIHVuaXF1ZSByZWZlcmVuY2UnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBzb2NrZXRVcmwgPSAnd3M6Ly9yb29teSc7XG4gICAgdmFyIHNlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG4gICAgdmFyIHNvY2tldCA9IG5ldyBfc3JjU29ja2V0SW8yWydkZWZhdWx0J10oc29ja2V0VXJsKTtcblxuICAgIHZhciBoYW5kbGVySW52b2tlZCA9IDA7XG4gICAgdmFyIGhhbmRsZXIzID0gZnVuY3Rpb24gaGFuZGxlckZ1bmMoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHRydWUpO1xuICAgICAgaGFuZGxlckludm9rZWQrKztcbiAgICB9O1xuXG4gICAgLy8gU2FtZSBmdW5jdGlvbnMgYnV0IGRpZmZlcmVudCBzY29wZXMvY29udGV4dHNcbiAgICBzb2NrZXQub24oJ2N1c3RvbS1ldmVudCcsIGhhbmRsZXIzLmJpbmQoT2JqZWN0LmNyZWF0ZShudWxsKSkpO1xuICAgIHNvY2tldC5vbignY3VzdG9tLWV2ZW50JywgaGFuZGxlcjMuYmluZChPYmplY3QuY3JlYXRlKG51bGwpKSk7XG5cbiAgICAvLyBTYW1lIGZ1bmN0aW9ucyB3aXRoIHNhbWUgc2NvcGUvY29udGV4dCAob25seSBvbmUgc2hvdWxkIGJlIGFkZGVkKVxuICAgIHNvY2tldC5vbignY3VzdG9tLWV2ZW50JywgaGFuZGxlcjMpO1xuICAgIHNvY2tldC5vbignY3VzdG9tLWV2ZW50JywgaGFuZGxlcjMpOyAvLyBub3QgZXhwZWN0ZWRcblxuICAgIHNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNvY2tldC5qb2luKCdyb29tJyk7XG4gICAgICBzZXJ2ZXIudG8oJ3Jvb20nKS5lbWl0KCdjdXN0b20tZXZlbnQnKTtcbiAgICB9KTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZW91dENhbGxiYWNrKCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChoYW5kbGVySW52b2tlZCwgMywgJ2hhbmRsZXIgaW52b2tlZCB0b28gbWFueSB0aW1lcycpO1xuICAgICAgc2VydmVyLmNsb3NlKCk7XG4gICAgICBkb25lKCk7XG4gICAgfSwgNTAwKTtcbiAgfSk7XG5cbiAgaXQoJ21vY2sgc29ja2V0IGludm9rZXMgZWFjaCBoYW5kbGVyIHBlciBzb2NrZXQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBzb2NrZXRVcmwgPSAnd3M6Ly9yb29teSc7XG4gICAgdmFyIHNlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG4gICAgdmFyIHNvY2tldEEgPSBuZXcgX3NyY1NvY2tldElvMlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG4gICAgdmFyIHNvY2tldEIgPSBuZXcgX3NyY1NvY2tldElvMlsnZGVmYXVsdCddKHNvY2tldFVybCk7XG5cbiAgICB2YXIgaGFuZGxlckludm9rZWQgPSAwO1xuICAgIHZhciBoYW5kbGVyMyA9IGZ1bmN0aW9uIGhhbmRsZXJGdW5jKCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlKTtcbiAgICAgIGhhbmRsZXJJbnZva2VkKys7XG4gICAgfTtcblxuICAgIC8vIFNhbWUgZnVuY3Rpb25zIGJ1dCBkaWZmZXJlbnQgc2NvcGVzL2NvbnRleHRzXG4gICAgc29ja2V0QS5vbignY3VzdG9tLWV2ZW50JywgaGFuZGxlcjMuYmluZChzb2NrZXRBKSk7XG4gICAgc29ja2V0Qi5vbignY3VzdG9tLWV2ZW50JywgaGFuZGxlcjMuYmluZChzb2NrZXRCKSk7XG5cbiAgICAvLyBTYW1lIGZ1bmN0aW9ucyB3aXRoIHNhbWUgc2NvcGUvY29udGV4dCAob25seSBvbmUgc2hvdWxkIGJlIGFkZGVkKVxuICAgIHNvY2tldEEub24oJ2N1c3RvbS1ldmVudCcsIGhhbmRsZXIzKTtcbiAgICBzb2NrZXRBLm9uKCdjdXN0b20tZXZlbnQnLCBoYW5kbGVyMyk7IC8vIG5vdCBleHBlY3RlZFxuXG4gICAgc29ja2V0Qi5vbignY3VzdG9tLWV2ZW50JywgaGFuZGxlcjMuYmluZChzb2NrZXRCKSk7IC8vIGV4cGVjdGVkIGJlY2F1c2UgYmluZCBjcmVhdGVzIGEgbmV3IG1ldGhvZFxuXG4gICAgc29ja2V0QS5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNvY2tldEEuam9pbigncm9vbScpO1xuICAgICAgc29ja2V0Qi5qb2luKCdyb29tJyk7XG4gICAgICBzZXJ2ZXIudG8oJ3Jvb20nKS5lbWl0KCdjdXN0b20tZXZlbnQnKTtcbiAgICB9KTtcblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdGltZW91dEZ1bmMoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGhhbmRsZXJJbnZva2VkLCA0LCAnaGFuZGxlciBpbnZva2VkIHRvbyBtYW55IHRpbWVzJyk7XG4gICAgICBzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIGRvbmUoKTtcbiAgICB9LCA1MDApO1xuICB9KTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY0V2ZW50RmFjdG9yeSA9IHJlcXVpcmUoJy4uL3NyYy9ldmVudC1mYWN0b3J5Jyk7XG5cbnZhciBfc3JjRXZlbnRUYXJnZXQgPSByZXF1aXJlKCcuLi9zcmMvZXZlbnQtdGFyZ2V0Jyk7XG5cbnZhciBfc3JjRXZlbnRUYXJnZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3JjRXZlbnRUYXJnZXQpO1xuXG52YXIgTW9jayA9IChmdW5jdGlvbiAoX0V2ZW50VGFyZ2V0KSB7XG4gIF9pbmhlcml0cyhNb2NrLCBfRXZlbnRUYXJnZXQpO1xuXG4gIGZ1bmN0aW9uIE1vY2soKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1vY2spO1xuXG4gICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTW9jay5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIE1vY2s7XG59KShfc3JjRXZlbnRUYXJnZXQyWydkZWZhdWx0J10pO1xuXG52YXIgTW9ja0ZvbyA9IChmdW5jdGlvbiAoX0V2ZW50VGFyZ2V0Mikge1xuICBfaW5oZXJpdHMoTW9ja0ZvbywgX0V2ZW50VGFyZ2V0Mik7XG5cbiAgZnVuY3Rpb24gTW9ja0ZvbygpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTW9ja0Zvbyk7XG5cbiAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihNb2NrRm9vLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gTW9ja0Zvbztcbn0pKF9zcmNFdmVudFRhcmdldDJbJ2RlZmF1bHQnXSk7XG5cbmRlc2NyaWJlKCdVbml0IC0gRXZlbnRUYXJnZXQnLCBmdW5jdGlvbiB1bml0VGVzdCgpIHtcbiAgaXQoJ2hhcyBhbGwgdGhlIHJlcXVpcmVkIG1ldGhvZHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1vY2sgPSBuZXcgTW9jaygpO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayhtb2NrLmFkZEV2ZW50TGlzdGVuZXIpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sobW9jay5yZW1vdmVFdmVudExpc3RlbmVyKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKG1vY2suZGlzcGF0Y2hFdmVudCk7XG4gIH0pO1xuXG4gIGl0KCdhZGRpbmcvcmVtb3ZpbmcgXCJtZXNzYWdlXCIgZXZlbnQgbGlzdGVuZXJzIHdvcmtzJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2NrID0gbmV3IE1vY2soKTtcbiAgICB2YXIgZXZlbnRPYmplY3QgPSAoMCwgX3NyY0V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoe1xuICAgICAgdHlwZTogJ21lc3NhZ2UnXG4gICAgfSk7XG5cbiAgICB2YXIgZm9vTGlzdGVuZXIgPSBmdW5jdGlvbiBmb29MaXN0ZW5lcihldmVudCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC50eXBlLCAnbWVzc2FnZScpO1xuICAgIH07XG4gICAgdmFyIGJhckxpc3RlbmVyID0gZnVuY3Rpb24gYmFyTGlzdGVuZXIoZXZlbnQpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQudHlwZSwgJ21lc3NhZ2UnKTtcbiAgICB9O1xuXG4gICAgbW9jay5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZm9vTGlzdGVuZXIpO1xuICAgIG1vY2suYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGJhckxpc3RlbmVyKTtcbiAgICBtb2NrLmRpc3BhdGNoRXZlbnQoZXZlbnRPYmplY3QpO1xuXG4gICAgbW9jay5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZm9vTGlzdGVuZXIpO1xuICAgIG1vY2suZGlzcGF0Y2hFdmVudChldmVudE9iamVjdCk7XG5cbiAgICBtb2NrLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBiYXJMaXN0ZW5lcik7XG4gICAgbW9jay5kaXNwYXRjaEV2ZW50KGV2ZW50T2JqZWN0KTtcbiAgfSk7XG5cbiAgaXQoJ2V2ZW50cyB0byBkaWZmZXJlbnQgb2JqZWN0IHNob3VsZCBub3Qgc2hhcmUgZXZlbnRzJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2NrID0gbmV3IE1vY2soKTtcbiAgICB2YXIgbW9ja0ZvbyA9IG5ldyBNb2NrRm9vKCk7XG4gICAgdmFyIGV2ZW50T2JqZWN0ID0gKDAsIF9zcmNFdmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHtcbiAgICAgIHR5cGU6ICdtZXNzYWdlJ1xuICAgIH0pO1xuXG4gICAgdmFyIGZvb0xpc3RlbmVyID0gZnVuY3Rpb24gZm9vTGlzdGVuZXIoZXZlbnQpIHtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQudHlwZSwgJ21lc3NhZ2UnKTtcbiAgICB9O1xuICAgIHZhciBiYXJMaXN0ZW5lciA9IGZ1bmN0aW9uIGJhckxpc3RlbmVyKGV2ZW50KSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50LnR5cGUsICdtZXNzYWdlJyk7XG4gICAgfTtcblxuICAgIG1vY2suYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZvb0xpc3RlbmVyKTtcbiAgICBtb2NrRm9vLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBiYXJMaXN0ZW5lcik7XG4gICAgbW9jay5kaXNwYXRjaEV2ZW50KGV2ZW50T2JqZWN0KTtcbiAgICBtb2NrRm9vLmRpc3BhdGNoRXZlbnQoZXZlbnRPYmplY3QpO1xuXG4gICAgbW9jay5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZm9vTGlzdGVuZXIpO1xuICAgIG1vY2suZGlzcGF0Y2hFdmVudChldmVudE9iamVjdCk7XG4gICAgbW9ja0Zvby5kaXNwYXRjaEV2ZW50KGV2ZW50T2JqZWN0KTtcblxuICAgIG1vY2tGb28ucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGJhckxpc3RlbmVyKTtcbiAgICBtb2NrLmRpc3BhdGNoRXZlbnQoZXZlbnRPYmplY3QpO1xuICAgIG1vY2tGb28uZGlzcGF0Y2hFdmVudChldmVudE9iamVjdCk7XG4gIH0pO1xuXG4gIGl0KCd0aGF0IGFkZGluZyB0aGUgc2FtZSBmdW5jdGlvbiB0d2ljZSBmb3IgdGhlIHNhbWUgZXZlbnQgdHlwZSBpcyBvbmx5IGFkZGVkIG9uY2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1vY2sgPSBuZXcgTW9jaygpO1xuICAgIHZhciBmb29MaXN0ZW5lciA9IGZ1bmN0aW9uIGZvb0xpc3RlbmVyKGV2ZW50KSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50LnR5cGUsICdtZXNzYWdlJyk7XG4gICAgfTtcbiAgICB2YXIgYmFyTGlzdGVuZXIgPSBmdW5jdGlvbiBiYXJMaXN0ZW5lcihldmVudCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC50eXBlLCAnbWVzc2FnZScpO1xuICAgIH07XG5cbiAgICBtb2NrLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmb29MaXN0ZW5lcik7XG4gICAgbW9jay5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZm9vTGlzdGVuZXIpO1xuICAgIG1vY2suYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGJhckxpc3RlbmVyKTtcblxuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwobW9jay5saXN0ZW5lcnMubWVzc2FnZS5sZW5ndGgsIDIpO1xuICB9KTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY0V2ZW50RmFjdG9yeSA9IHJlcXVpcmUoJy4uL3NyYy9ldmVudC1mYWN0b3J5Jyk7XG5cbnZhciBmYWtlT2JqZWN0ID0geyBmb286ICdiYXInIH07XG5cbmRlc2NyaWJlKCdVbml0IC0gRmFjdG9yeScsIGZ1bmN0aW9uIHVuaXRUZXN0KCkge1xuICBpdCgndGhhdCB0aGUgY3JlYXRlIG1ldGhvZHMgdGhyb3cgZXJyb3JzIGlmIG5vIHR5cGUgaWYgc3BlY2lmaWVkJywgZnVuY3Rpb24gKCkge1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10udGhyb3dzKGZ1bmN0aW9uICgpIHtcbiAgICAgICgwLCBfc3JjRXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSgpO1xuICAgIH0sICdDYW5ub3QgcmVhZCBwcm9wZXJ0eSBcXCd0eXBlXFwnIG9mIHVuZGVmaW5lZCcpO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS50aHJvd3MoZnVuY3Rpb24gKCkge1xuICAgICAgKDAsIF9zcmNFdmVudEZhY3RvcnkuY3JlYXRlTWVzc2FnZUV2ZW50KSgpO1xuICAgIH0sICdDYW5ub3QgcmVhZCBwcm9wZXJ0eSBcXCd0eXBlXFwnIG9mIHVuZGVmaW5lZCcpO1xuICB9KTtcblxuICBpdCgndGhhdCBjcmVhdGVFdmVudCBjb3JyZWN0bHkgY3JlYXRlcyBhbiBldmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXZlbnQgPSAoMCwgX3NyY0V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoe1xuICAgICAgdHlwZTogJ29wZW4nXG4gICAgfSk7XG5cbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50LnR5cGUsICdvcGVuJywgJ3RoZSB0eXBlIHByb3BlcnR5IGlzIHNldCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQudGFyZ2V0LCBudWxsLCAndGFyZ2V0IGlzIG51bGwgYXMgbm8gdGFyZ2V0IHdhcyBwYXNzZWQnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50LnNyY0VsZW1lbnQsIG51bGwsICdzcmNFbGVtZW50IGlzIG51bGwgYXMgbm8gdGFyZ2V0IHdhcyBwYXNzZWQnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50LmN1cnJlbnRUYXJnZXQsIG51bGwsICdjdXJyZW50VGFyZ2V0IGlzIG51bGwgYXMgbm8gdGFyZ2V0IHdhcyBwYXNzZWQnKTtcblxuICAgIGV2ZW50ID0gKDAsIF9zcmNFdmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHtcbiAgICAgIHR5cGU6ICdvcGVuJyxcbiAgICAgIHRhcmdldDogZmFrZU9iamVjdFxuICAgIH0pO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoZXZlbnQudGFyZ2V0LCBmYWtlT2JqZWN0LCAndGFyZ2V0IGlzIHNldCB0byBmYWtlT2JqZWN0Jyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoZXZlbnQuc3JjRWxlbWVudCwgZmFrZU9iamVjdCwgJ3NyY0VsZW1lbnQgaXMgc2V0IHRvIGZha2VPYmplY3QnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChldmVudC5jdXJyZW50VGFyZ2V0LCBmYWtlT2JqZWN0LCAnY3VycmVudFRhcmdldCBpcyBzZXQgdG8gZmFrZU9iamVjdCcpO1xuICB9KTtcblxuICBpdCgndGhhdCBjcmVhdGVNZXNzYWdlRXZlbnQgY29ycmVjdGx5IGNyZWF0ZXMgYW4gZXZlbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV2ZW50ID0gKDAsIF9zcmNFdmVudEZhY3RvcnkuY3JlYXRlTWVzc2FnZUV2ZW50KSh7XG4gICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICBvcmlnaW46ICd3czovL2xvY2FsaG9zdDo4MDgwJyxcbiAgICAgIGRhdGE6ICdUZXN0aW5nJ1xuICAgIH0pO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC50eXBlLCAnbWVzc2FnZScsICd0aGUgdHlwZSBwcm9wZXJ0eSBpcyBzZXQnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50LmRhdGEsICdUZXN0aW5nJywgJ3RoZSBkYXRhIHByb3BlcnR5IGlzIHNldCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQub3JpZ2luLCAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcsICd0aGUgb3JpZ2luIHByb3BlcnR5IGlzIHNldCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQudGFyZ2V0LCBudWxsLCAndGFyZ2V0IGlzIG51bGwgYXMgbm8gdGFyZ2V0IHdhcyBwYXNzZWQnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50Lmxhc3RFdmVudElkLCAnJywgJ2xhc3RFdmVudElkIGlzIGFuIGVtcHR5IHN0cmluZycpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQuc3JjRWxlbWVudCwgbnVsbCwgJ3NyY0VsZW1lbnQgaXMgbnVsbCBhcyBubyB0YXJnZXQgd2FzIHBhc3NlZCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQuY3VycmVudFRhcmdldCwgbnVsbCwgJ2N1cnJlbnRUYXJnZXQgaXMgbnVsbCBhcyBubyB0YXJnZXQgd2FzIHBhc3NlZCcpO1xuXG4gICAgZXZlbnQgPSAoMCwgX3NyY0V2ZW50RmFjdG9yeS5jcmVhdGVNZXNzYWdlRXZlbnQpKHtcbiAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICBvcmlnaW46ICd3czovL2xvY2FsaG9zdDo4MDgwJyxcbiAgICAgIGRhdGE6ICdUZXN0aW5nJyxcbiAgICAgIHRhcmdldDogZmFrZU9iamVjdFxuICAgIH0pO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC5sYXN0RXZlbnRJZCwgJycsICdsYXN0RXZlbnRJZCBpcyBhbiBlbXB0eSBzdHJpbmcnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChldmVudC50YXJnZXQsIGZha2VPYmplY3QsICd0YXJnZXQgaXMgc2V0IHRvIGZha2VPYmplY3QnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChldmVudC5zcmNFbGVtZW50LCBmYWtlT2JqZWN0LCAnc3JjRWxlbWVudCBpcyBzZXQgdG8gZmFrZU9iamVjdCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKGV2ZW50LmN1cnJlbnRUYXJnZXQsIGZha2VPYmplY3QsICdjdXJyZW50VGFyZ2V0IGlzIHNldCB0byBmYWtlT2JqZWN0Jyk7XG4gIH0pO1xuXG4gIGl0KCd0aGF0IGNyZWF0ZUNsb3NlRXZlbnQgY29ycmVjdGx5IGNyZWF0ZXMgYW4gZXZlbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV2ZW50ID0gKDAsIF9zcmNFdmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoe1xuICAgICAgdHlwZTogJ2Nsb3NlJ1xuICAgIH0pO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC5jb2RlLCAwLCAndGhlIGNvZGUgcHJvcGVydHkgaXMgc2V0Jyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC5yZWFzb24sICcnLCAndGhlIHJlYXNvbiBwcm9wZXJ0eSBpcyBzZXQnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGV2ZW50LnRhcmdldCwgbnVsbCwgJ3RhcmdldCBpcyBudWxsIGFzIG5vIHRhcmdldCB3YXMgcGFzc2VkJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC53YXNDbGVhbiwgZmFsc2UsICd3YXNDbGVhbiBpcyBmYWxzZSBhcyB0aGUgY29kZSBpcyBub3QgMTAwMCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQuc3JjRWxlbWVudCwgbnVsbCwgJ3NyY0VsZW1lbnQgaXMgbnVsbCBhcyBubyB0YXJnZXQgd2FzIHBhc3NlZCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQuY3VycmVudFRhcmdldCwgbnVsbCwgJ2N1cnJlbnRUYXJnZXQgaXMgbnVsbCBhcyBubyB0YXJnZXQgd2FzIHBhc3NlZCcpO1xuXG4gICAgZXZlbnQgPSAoMCwgX3NyY0V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgY29kZTogMTAwMSxcbiAgICAgIHJlYXNvbjogJ215IGJhZCcsXG4gICAgICB0YXJnZXQ6IGZha2VPYmplY3RcbiAgICB9KTtcblxuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQuY29kZSwgMTAwMSwgJ3RoZSBjb2RlIHByb3BlcnR5IGlzIHNldCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQucmVhc29uLCAnbXkgYmFkJywgJ3RoZSByZWFzb24gcHJvcGVydHkgaXMgc2V0Jyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoZXZlbnQudGFyZ2V0LCBmYWtlT2JqZWN0LCAndGFyZ2V0IGlzIHNldCB0byBmYWtlT2JqZWN0Jyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoZXZlbnQuc3JjRWxlbWVudCwgZmFrZU9iamVjdCwgJ3NyY0VsZW1lbnQgaXMgc2V0IHRvIGZha2VPYmplY3QnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChldmVudC5jdXJyZW50VGFyZ2V0LCBmYWtlT2JqZWN0LCAnY3VycmVudFRhcmdldCBpcyBzZXQgdG8gZmFrZU9iamVjdCcpO1xuXG4gICAgZXZlbnQgPSAoMCwgX3NyY0V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgY29kZTogMTAwMFxuICAgIH0pO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC53YXNDbGVhbiwgdHJ1ZSwgJ3dhc0NsZWFuIGlzIHRydWUgYXMgdGhlIGNvZGUgaXMgMTAwMCcpO1xuICB9KTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY05ldHdvcmtCcmlkZ2UgPSByZXF1aXJlKCcuLi9zcmMvbmV0d29yay1icmlkZ2UnKTtcblxudmFyIF9zcmNOZXR3b3JrQnJpZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY05ldHdvcmtCcmlkZ2UpO1xuXG52YXIgZmFrZU9iamVjdCA9IHsgZm9vOiAnYmFyJyB9O1xuXG5kZXNjcmliZSgnVW5pdCAtIE5ldHdvcmsgQnJpZGdlJywgZnVuY3Rpb24gdW5pdFRlc3QoKSB7XG4gIGFmdGVyRWFjaChmdW5jdGlvbiBhZnRlcigpIHtcbiAgICBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS51cmxNYXAgPSB7fTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgbmV0d29yayBicmlkZ2UgaGFzIG5vIGNvbm5lY3Rpb25zIGJlIGRlZnVhbHQnLCBmdW5jdGlvbiAoKSB7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10udXJsTWFwLCB7fSwgJ1VybCBtYXAgaXMgZW1wdHkgYnkgZGVmYXVsdCcpO1xuICB9KTtcblxuICBpdCgndGhhdCBuZXR3b3JrIGJyaWRnZSBoYXMgbm8gY29ubmVjdGlvbnMgYmUgZGVmdWFsdCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uYXR0YWNoV2ViU29ja2V0KGZha2VPYmplY3QsICd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG5cbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKCFyZXN1bHQsICdubyBzZXJ2ZXIgd2FzIHJldHVybmVkIGFzIGEgc2VydmVyIG11c3QgYmUgYWRkZWQgZmlyc3QnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS51cmxNYXAsIHt9LCAnbm90aGluZyB3YXMgYWRkZWQgdG8gdGhlIHVybCBtYXAnKTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgYXR0YWNoU2VydmVyIGFkZHMgYSBzZXJ2ZXIgdG8gdXJsIG1hcCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uYXR0YWNoU2VydmVyKGZha2VPYmplY3QsICd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgdmFyIGNvbm5lY3Rpb24gPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS51cmxNYXBbJ3dzOi8vbG9jYWxob3N0OjgwODAnXTtcblxuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKHJlc3VsdCwgZmFrZU9iamVjdCwgJ3RoZSBzZXJ2ZXIgd2FzIHJldHVybmVkIGJlY2F1c2UgaXQgd2FzIHN1Y2Nlc3NmdWxseSBhZGRlZCB0byB0aGUgdXJsIG1hcCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKGNvbm5lY3Rpb24uc2VydmVyLCBmYWtlT2JqZWN0LCAnZmFrZU9iamVjdCB3YXMgYWRkZWQgdG8gdGhlIHNlcnZlciBwcm9wZXJ0eScpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoY29ubmVjdGlvbi53ZWJzb2NrZXRzLmxlbmd0aCwgMCwgJ3dlYnNvY2tldCBwcm9wZXJ0eSB3YXMgc2V0IHRvIGFuIGVtcHR5IGFycmF5Jyk7XG4gIH0pO1xuXG4gIGl0KCd0aGF0IGF0dGFjaFNlcnZlciBkb2VzIG5vdGhpbmcgaWYgYSBzZXJ2ZXIgaXMgYWxyZWFkeSBhdHRhY2hlZCB0byBhIGdpdmVuIHVybCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uYXR0YWNoU2VydmVyKGZha2VPYmplY3QsICd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgdmFyIHJlc3VsdDIgPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hTZXJ2ZXIoeyBoZWxsbzogJ3dvcmxkJyB9LCAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuICAgIHZhciBjb25uZWN0aW9uID0gX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10udXJsTWFwWyd3czovL2xvY2FsaG9zdDo4MDgwJ107XG5cbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKCFyZXN1bHQyLCAnbm8gc2VydmVyIHdhcyByZXR1cm5lZCBhcyBhIHNlcnZlciB3YXMgYWxyZWFkeSBsaXN0ZW5pbmcgdG8gdGhhdCB1cmwnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChyZXN1bHQsIGZha2VPYmplY3QsICd0aGUgc2VydmVyIHdhcyByZXR1cm5lZCBiZWNhdXNlIGl0IHdhcyBzdWNjZXNzZnVsbHkgYWRkZWQgdG8gdGhlIHVybCBtYXAnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChjb25uZWN0aW9uLnNlcnZlciwgZmFrZU9iamVjdCwgJ2Zha2VPYmplY3Qgd2FzIGFkZGVkIHRvIHRoZSBzZXJ2ZXIgcHJvcGVydHknKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGNvbm5lY3Rpb24ud2Vic29ja2V0cy5sZW5ndGgsIDAsICd3ZWJzb2NrZXQgcHJvcGVydHkgd2FzIHNldCB0byBhbiBlbXB0eSBhcnJheScpO1xuICB9KTtcblxuICBpdCgndGhhdCBhdHRhY2hXZWJTb2NrZXQgd2lsbCBhZGQgYSB3ZWJzb2NrZXQgdG8gdGhlIHVybCBtYXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdFNlcnZlciA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFNlcnZlcihmYWtlT2JqZWN0LCAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuICAgIHZhciByZXN1bHRXZWJTb2NrZXQgPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hXZWJTb2NrZXQoZmFrZU9iamVjdCwgJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcbiAgICB2YXIgY29ubmVjdGlvbiA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnVybE1hcFsnd3M6Ly9sb2NhbGhvc3Q6ODA4MCddO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwocmVzdWx0U2VydmVyLCBmYWtlT2JqZWN0LCAnc2VydmVyIHJldHVybmVkIGJlY2F1c2UgaXQgd2FzIHN1Y2Nlc3NmdWxseSBhZGRlZCB0byB0aGUgdXJsIG1hcCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKHJlc3VsdFdlYlNvY2tldCwgZmFrZU9iamVjdCwgJ3NlcnZlciByZXR1cm5lZCBhcyB0aGUgd2Vic29ja2V0IHdhcyBzdWNjZXNzZnVsbHkgYWRkZWQgdG8gdGhlIG1hcCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKGNvbm5lY3Rpb24ud2Vic29ja2V0c1swXSwgZmFrZU9iamVjdCwgJ2Zha2VPYmplY3Qgd2FzIGFkZGVkIHRvIHRoZSB3ZWJzb2NrZXRzIGFycmF5Jyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChjb25uZWN0aW9uLndlYnNvY2tldHMubGVuZ3RoLCAxLCAnd2Vic29ja2V0IHByb3BlcnR5IGNvbnRhaW5zIG9ubHkgdGhlIHdlYnNvY2tldCBvYmplY3QnKTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgYXR0YWNoV2ViU29ja2V0IHdpbGwgYWRkIHRoZSBzYW1lIHdlYnNvY2tldCBvbmx5IG9uY2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdFNlcnZlciA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFNlcnZlcihmYWtlT2JqZWN0LCAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuICAgIHZhciByZXN1bHRXZWJTb2NrZXQgPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hXZWJTb2NrZXQoZmFrZU9iamVjdCwgJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcbiAgICB2YXIgcmVzdWx0V2ViU29ja2V0MiA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldChmYWtlT2JqZWN0LCAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuICAgIHZhciBjb25uZWN0aW9uID0gX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10udXJsTWFwWyd3czovL2xvY2FsaG9zdDo4MDgwJ107XG5cbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChyZXN1bHRTZXJ2ZXIsIGZha2VPYmplY3QsICdzZXJ2ZXIgcmV0dXJuZWQgYmVjYXVzZSBpdCB3YXMgc3VjY2Vzc2Z1bGx5IGFkZGVkIHRvIHRoZSB1cmwgbWFwJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwocmVzdWx0V2ViU29ja2V0LCBmYWtlT2JqZWN0LCAnc2VydmVyIHJldHVybmVkIGFzIHRoZSB3ZWJzb2NrZXQgd2FzIHN1Y2Nlc3NmdWxseSBhZGRlZCB0byB0aGUgbWFwJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayghcmVzdWx0V2ViU29ja2V0MiwgJ25vdGhpbmcgYWRkZWQgYXMgdGhlIHdlYnNvY2tldCBhbHJlYWR5IGV4aXN0ZWQgaW5zaWRlIHRoZSB1cmwgbWFwJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoY29ubmVjdGlvbi53ZWJzb2NrZXRzWzBdLCBmYWtlT2JqZWN0LCAnZmFrZU9iamVjdCB3YXMgYWRkZWQgdG8gdGhlIHdlYnNvY2tldHMgYXJyYXknKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGNvbm5lY3Rpb24ud2Vic29ja2V0cy5sZW5ndGgsIDEsICd3ZWJzb2NrZXQgcHJvcGVydHkgY29udGFpbnMgb25seSB0aGUgd2Vic29ja2V0IG9iamVjdCcpO1xuICB9KTtcblxuICBpdCgndGhhdCBzZXJ2ZXIgYW5kIHdlYnNvY2tldCBsb29rdXBzIHJldHVybiB0aGUgY29ycmVjdCBvYmplY3RzJywgZnVuY3Rpb24gKCkge1xuICAgIF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFNlcnZlcihmYWtlT2JqZWN0LCAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuICAgIF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldChmYWtlT2JqZWN0LCAnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuXG4gICAgdmFyIHNlcnZlckxvb2t1cCA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnNlcnZlckxvb2t1cCgnd3M6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuICAgIHZhciB3ZWJzb2NrZXRMb29rdXAgPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS53ZWJzb2NrZXRzTG9va3VwKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG5cbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChzZXJ2ZXJMb29rdXAsIGZha2VPYmplY3QsICdzZXJ2ZXIgY29ycmVjdGx5IHJldHVybmVkJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwod2Vic29ja2V0TG9va3VwLCBbZmFrZU9iamVjdF0sICd3ZWJzb2NrZXRzIGNvcnJlY3RseSByZXR1cm5lZCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKHdlYnNvY2tldExvb2t1cC5sZW5ndGgsIDEsICd0aGUgY29ycmVjdCBudW1iZXIgb2Ygd2Vic29ja2V0cyBhcmUgcmV0dXJuZWQnKTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgcmVtb3Zpbmcgc2VydmVyIGFuZCB3ZWJzb2NrZXRzIHdvcmtzIGNvcnJlY3RseScsIGZ1bmN0aW9uICgpIHtcbiAgICBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hTZXJ2ZXIoZmFrZU9iamVjdCwgJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcbiAgICBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hXZWJTb2NrZXQoZmFrZU9iamVjdCwgJ3dzOi8vbG9jYWxob3N0OjgwODAnKTtcblxuICAgIHZhciB3ZWJzb2NrZXRMb29rdXAgPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS53ZWJzb2NrZXRzTG9va3VwKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwod2Vic29ja2V0TG9va3VwLmxlbmd0aCwgMSwgJ3RoZSBjb3JyZWN0IG51bWJlciBvZiB3ZWJzb2NrZXRzIGFyZSByZXR1cm5lZCcpO1xuXG4gICAgX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ucmVtb3ZlV2ViU29ja2V0KGZha2VPYmplY3QsICd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG5cbiAgICB3ZWJzb2NrZXRMb29rdXAgPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS53ZWJzb2NrZXRzTG9va3VwKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwod2Vic29ja2V0TG9va3VwLmxlbmd0aCwgMCwgJ3RoZSBjb3JyZWN0IG51bWJlciBvZiB3ZWJzb2NrZXRzIGFyZSByZXR1cm5lZCcpO1xuXG4gICAgX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ucmVtb3ZlU2VydmVyKCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10udXJsTWFwLCB7fSwgJ1VybCBtYXAgaXMgYmFjayBpbiBpdHMgZGVmYXVsdCBzdGF0ZScpO1xuICB9KTtcblxuICBpdCgnYSBzb2NrZXQgY2FuIGpvaW4gYW5kIGxlYXZlIGEgcm9vbScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmFrZVNvY2tldCA9IHsgdXJsOiAnd3M6Ly9yb29teScgfTtcblxuICAgIF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFNlcnZlcihmYWtlT2JqZWN0LCAnd3M6Ly9yb29teScpO1xuICAgIF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldChmYWtlU29ja2V0LCAnd3M6Ly9yb29teScpO1xuXG4gICAgdmFyIGluUm9vbSA9IHVuZGVmaW5lZDtcbiAgICBpblJvb20gPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS53ZWJzb2NrZXRzTG9va3VwKCd3czovL3Jvb215JywgJ3Jvb20nKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGluUm9vbS5sZW5ndGgsIDAsICd0aGVyZSBhcmUgbm8gc29ja2V0cyBpbiB0aGUgcm9vbSB0byBzdGFydCB3aXRoJyk7XG5cbiAgICBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hZGRNZW1iZXJzaGlwVG9Sb29tKGZha2VTb2NrZXQsICdyb29tJyk7XG5cbiAgICBpblJvb20gPSBfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS53ZWJzb2NrZXRzTG9va3VwKCd3czovL3Jvb215JywgJ3Jvb20nKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGluUm9vbS5sZW5ndGgsIDEsICd0aGVyZSBpcyAxIHNvY2tldCBpbiB0aGUgcm9vbSBhZnRlciBqb2luaW5nJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoaW5Sb29tWzBdLCBmYWtlU29ja2V0KTtcblxuICAgIF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbShmYWtlU29ja2V0LCAncm9vbScpO1xuXG4gICAgaW5Sb29tID0gX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ud2Vic29ja2V0c0xvb2t1cCgnd3M6Ly9yb29teScsICdyb29tJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChpblJvb20ubGVuZ3RoLCAwLCAndGhlcmUgYXJlIG5vIHNvY2tldHMgaW4gdGhlIHJvb20gYWZ0ZXIgbGVhdmluZycpO1xuICB9KTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY1NlcnZlciA9IHJlcXVpcmUoJy4uL3NyYy9zZXJ2ZXInKTtcblxudmFyIF9zcmNTZXJ2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3JjU2VydmVyKTtcblxudmFyIF9zcmNXZWJzb2NrZXQgPSByZXF1aXJlKCcuLi9zcmMvd2Vic29ja2V0Jyk7XG5cbnZhciBfc3JjV2Vic29ja2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY1dlYnNvY2tldCk7XG5cbnZhciBfc3JjRXZlbnRUYXJnZXQgPSByZXF1aXJlKCcuLi9zcmMvZXZlbnQtdGFyZ2V0Jyk7XG5cbnZhciBfc3JjRXZlbnRUYXJnZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3JjRXZlbnRUYXJnZXQpO1xuXG52YXIgX3NyY05ldHdvcmtCcmlkZ2UgPSByZXF1aXJlKCcuLi9zcmMvbmV0d29yay1icmlkZ2UnKTtcblxudmFyIF9zcmNOZXR3b3JrQnJpZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY05ldHdvcmtCcmlkZ2UpO1xuXG5kZXNjcmliZSgnVW5pdCAtIFNlcnZlcicsIGZ1bmN0aW9uIHVuaXRUZXN0KCkge1xuICBpdCgndGhhdCBzZXJ2ZXIgaW5oZXJlbnRzIEV2ZW50VGFyZ2V0IG1ldGhvZHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG15U2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbm90LXJlYWwnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKG15U2VydmVyIGluc3RhbmNlb2YgX3NyY0V2ZW50VGFyZ2V0MlsnZGVmYXVsdCddKTtcbiAgICBteVNlcnZlci5jbG9zZSgpO1xuICB9KTtcblxuICBpdCgndGhhdCBhZnRlciBjcmVhdGluZyBhIHNlcnZlciBpdCBpcyBhZGRlZCB0byB0aGUgbmV0d29yayBicmlkZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG15U2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbm90LXJlYWwvJyk7XG4gICAgdmFyIHVybE1hcCA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnVybE1hcFsnd3M6Ly9ub3QtcmVhbC8nXTtcblxuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZGVlcEVxdWFsKHVybE1hcC5zZXJ2ZXIsIG15U2VydmVyLCAnc2VydmVyIHdhcyBjb3JyZWN0bHkgYWRkZWQgdG8gdGhlIHVybE1hcCcpO1xuICAgIG15U2VydmVyLmNsb3NlKCk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwoX3NyY05ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10udXJsTWFwLCB7fSwgJ3RoZSB1cmxNYXAgd2FzIGNsZWFyZWQgYWZ0ZXIgdGhlIGNsb3NlIGNhbGwnKTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgY2FsbGJhY2sgZnVuY3Rpb25zIGNhbiBiZSBhZGRlZCB0byB0aGUgbGlzdGVuZXJzIG9iamVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbXlTZXJ2ZXIgPSBuZXcgX3NyY1NlcnZlcjJbJ2RlZmF1bHQnXSgnd3M6Ly9ub3QtcmVhbC8nKTtcblxuICAgIG15U2VydmVyLm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKCkge30pO1xuICAgIG15U2VydmVyLm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHt9KTtcblxuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwobXlTZXJ2ZXIubGlzdGVuZXJzLm1lc3NhZ2UubGVuZ3RoLCAxKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKG15U2VydmVyLmxpc3RlbmVycy5jbG9zZS5sZW5ndGgsIDEpO1xuXG4gICAgbXlTZXJ2ZXIuY2xvc2UoKTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgY2FsbGluZyBjbGllbnRzKCkgcmV0dXJucyB0aGUgY29ycmVjdCBjbGllbnRzJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBteVNlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKCd3czovL25vdC1yZWFsLycpO1xuICAgIHZhciBzb2NrZXRGb28gPSBuZXcgX3NyY1dlYnNvY2tldDJbJ2RlZmF1bHQnXSgnd3M6Ly9ub3QtcmVhbC8nKTtcbiAgICB2YXIgc29ja2V0QmFyID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbm90LXJlYWwvJyk7XG5cbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKG15U2VydmVyLmNsaWVudHMoKS5sZW5ndGgsIDIsICdjYWxsaW5nIGNsaWVudHMgcmV0dXJucyB0aGUgMiB3ZWJzb2NrZXRzJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwobXlTZXJ2ZXIuY2xpZW50cygpLCBbc29ja2V0Rm9vLCBzb2NrZXRCYXJdLCAnVGhlIGNsaWVudHMgbWF0Y2hlcyBbc29ja2V0Rm9vLCBzb2NrZXRCYXJdJyk7XG5cbiAgICBteVNlcnZlci5jbG9zZSgpO1xuICB9KTtcblxuICBpdCgndGhhdCBjYWxsaW5nIHNlbmQgd2lsbCB0cmlnZ2VyIHRoZSBvbm1lc3NhZ2Ugb2Ygd2Vic29ja2V0cycsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIG15U2VydmVyID0gbmV3IF9zcmNTZXJ2ZXIyWydkZWZhdWx0J10oJ3dzOi8vbm90LXJlYWwvJyk7XG5cbiAgICBteVNlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uIChzZXJ2ZXIsIHNvY2tldCkge1xuICAgICAgbXlTZXJ2ZXIuc2VuZCgnVGVzdGluZycsIHsgd2Vic29ja2V0OiBzb2NrZXQgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgc29ja2V0Rm9vID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbm90LXJlYWwvJyk7XG4gICAgdmFyIHNvY2tldEJhciA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL25vdC1yZWFsLycpO1xuICAgIHNvY2tldEZvby5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHRydWUsICdzb2NrZXRGb28gb25tZXNzYWdlIHdhcyBjb3JyZWN0bHkgY2FsbGVkJyk7XG4gICAgfTtcblxuICAgIHNvY2tldEJhci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHRydWUsICdzb2NrZXRCYXIgb25tZXNzYWdlIHdhcyBjb3JyZWN0bHkgY2FsbGVkJyk7XG4gICAgICBteVNlcnZlci5jbG9zZSgpO1xuICAgICAgZG9uZSgpO1xuICAgIH07XG4gIH0pO1xuXG4gIGl0KCd0aGF0IGNhbGxpbmcgY2xvc2Ugd2lsbCB0cmlnZ2VyIHRoZSBvbmNsb3NlIG9mIHdlYnNvY2tldHMnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHZhciBteVNlcnZlciA9IG5ldyBfc3JjU2VydmVyMlsnZGVmYXVsdCddKCd3czovL25vdC1yZWFsLycpO1xuICAgIHZhciBjb3VudGVyID0gMDtcblxuICAgIG15U2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgY291bnRlcisrO1xuICAgICAgaWYgKGNvdW50ZXIgPT09IDIpIHtcbiAgICAgICAgbXlTZXJ2ZXIuY2xvc2Uoe1xuICAgICAgICAgIGNvZGU6IDEwMDUsXG4gICAgICAgICAgcmVhc29uOiAnU29tZSByZWFzb24nXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHNvY2tldEZvbyA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL25vdC1yZWFsLycpO1xuICAgIHZhciBzb2NrZXRCYXIgPSBuZXcgX3NyY1dlYnNvY2tldDJbJ2RlZmF1bHQnXSgnd3M6Ly9ub3QtcmVhbC8nKTtcbiAgICBzb2NrZXRGb28ub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlLCAnc29ja2V0Rm9vIG9ubWVzc2FnZSB3YXMgY29ycmVjdGx5IGNhbGxlZCcpO1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC5jb2RlLCAxMDA1LCAndGhlIGNvcnJlY3QgY29kZSB3YXMgcmVjaWV2ZWQnKTtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQucmVhc29uLCAnU29tZSByZWFzb24nLCAndGhlIGNvcnJlY3QgcmVhc29uIHdhcyByZWNpZXZlZCcpO1xuICAgIH07XG5cbiAgICBzb2NrZXRCYXIub25jbG9zZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayh0cnVlLCAnc29ja2V0QmFyIG9ubWVzc2FnZSB3YXMgY29ycmVjdGx5IGNhbGxlZCcpO1xuICAgICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChldmVudC5jb2RlLCAxMDA1LCAndGhlIGNvcnJlY3QgY29kZSB3YXMgcmVjaWV2ZWQnKTtcbiAgICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwoZXZlbnQucmVhc29uLCAnU29tZSByZWFzb24nLCAndGhlIGNvcnJlY3QgcmVhc29uIHdhcyByZWNpZXZlZCcpO1xuICAgICAgZG9uZSgpO1xuICAgIH07XG4gIH0pO1xuXG4gIGl0KCdhIG5hbWVzcGFjZWQgc2VydmVyIGlzIGFkZGVkIHRvIHRoZSBuZXR3b3JrIGJyaWRnZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbXlTZXJ2ZXIgPSBfc3JjU2VydmVyMlsnZGVmYXVsdCddLm9mKCcvbXktbmFtZXNwYWNlJyk7XG4gICAgdmFyIHVybE1hcCA9IF9zcmNOZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnVybE1hcFsnL215LW5hbWVzcGFjZSddO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5kZWVwRXF1YWwodXJsTWFwLnNlcnZlciwgbXlTZXJ2ZXIsICdzZXJ2ZXIgd2FzIGNvcnJlY3RseSBhZGRlZCB0byB0aGUgdXJsTWFwJyk7XG4gICAgbXlTZXJ2ZXIuY2xvc2UoKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmRlZXBFcXVhbChfc3JjTmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS51cmxNYXAsIHt9LCAndGhlIHVybE1hcCB3YXMgY2xlYXJlZCBhZnRlciB0aGUgY2xvc2UgY2FsbCcpO1xuICB9KTtcbn0pOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2Fzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG52YXIgX2Fzc2VydDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc3NlcnQpO1xuXG52YXIgX3NyY1NvY2tldElvID0gcmVxdWlyZSgnLi4vc3JjL3NvY2tldC1pbycpO1xuXG52YXIgX3NyY1NvY2tldElvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY1NvY2tldElvKTtcblxuZGVzY3JpYmUoJ1VuaXQgLSBTb2NrZXRJTycsIGZ1bmN0aW9uIHVuaXRUZXN0KCkge1xuICBpdCgnaXQgY2FuIGJlIGluc3RhbnRpYXRlZCB3aXRob3V0IGEgdXJsJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBzb2NrZXQgPSAoMCwgX3NyY1NvY2tldElvMlsnZGVmYXVsdCddKSgpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2soc29ja2V0KTtcbiAgfSk7XG5cbiAgaXQoJ2l0IGFjY2VwdHMgYSB1cmwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNvY2tldCA9ICgwLCBfc3JjU29ja2V0SW8yWydkZWZhdWx0J10pKCdodHRwOi8vbG9jYWxob3N0Jyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayhzb2NrZXQpO1xuICB9KTtcblxuICBpdCgnaXQgYWNjZXB0cyBhbiBvcHRzIG9iamVjdCBwYXJhbXRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc29ja2V0ID0gKDAsIF9zcmNTb2NrZXRJbzJbJ2RlZmF1bHQnXSkoJ2h0dHA6Ly9sb2NhbGhvc3QnLCB7IGE6ICdhcHBsZScgfSk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayhzb2NrZXQpO1xuICB9KTtcblxuICBpdCgnaXQgY2FuIGVxdWl2YWxlbnRseSB1c2UgYSBjb25uZWN0IG1ldGhvZCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc29ja2V0ID0gX3NyY1NvY2tldElvMlsnZGVmYXVsdCddLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLm9rKHNvY2tldCk7XG4gIH0pO1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbnZhciBfYXNzZXJ0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2Fzc2VydCk7XG5cbnZhciBfc3JjV2Vic29ja2V0ID0gcmVxdWlyZSgnLi4vc3JjL3dlYnNvY2tldCcpO1xuXG52YXIgX3NyY1dlYnNvY2tldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zcmNXZWJzb2NrZXQpO1xuXG52YXIgX3NyY0V2ZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi4vc3JjL2V2ZW50LXRhcmdldCcpO1xuXG52YXIgX3NyY0V2ZW50VGFyZ2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NyY0V2ZW50VGFyZ2V0KTtcblxuZGVzY3JpYmUoJ1VuaXQgLSBXZWJTb2NrZXQnLCBmdW5jdGlvbiB1bml0VGVzdCgpIHtcbiAgaXQoJ3RoYXQgbm90IHBhc3NpbmcgYSB1cmwgdGhyb3dzIGFuIGVycm9yJywgZnVuY3Rpb24gKCkge1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10udGhyb3dzKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB3cyA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCk7XG4gICAgfSwgJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnV2ViU29ja2V0XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQnKTtcbiAgfSk7XG5cbiAgaXQoJ3RoYXQgd2Vic29ja2V0cyBpbmhlcmVudHMgRXZlbnRUYXJnZXQgbWV0aG9kcycsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbXlTb2NrZXQgPSBuZXcgX3NyY1dlYnNvY2tldDJbJ2RlZmF1bHQnXSgnd3M6Ly9ub3QtcmVhbCcpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10ub2sobXlTb2NrZXQgaW5zdGFuY2VvZiBfc3JjRXZlbnRUYXJnZXQyWydkZWZhdWx0J10pO1xuICB9KTtcblxuICBpdCgndGhhdCB3ZWJzb2NrZXRzIGluaGVyZW50cyBFdmVudFRhcmdldCBtZXRob2RzJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBteVNvY2tldCA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL25vdC1yZWFsJyk7XG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5vayhteVNvY2tldCBpbnN0YW5jZW9mIF9zcmNFdmVudFRhcmdldDJbJ2RlZmF1bHQnXSk7XG4gIH0pO1xuXG4gIGl0KCd0aGF0IG9uKG9wZW4sIG1lc3NhZ2UsIGVycm9yLCBhbmQgY2xvc2UpIGNhbiBiZSBzZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG15U29ja2V0ID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbm90LXJlYWwnKTtcblxuICAgIG15U29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIG15U29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgIG15U29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICBteVNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24gKCkge307XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gbXlTb2NrZXQubGlzdGVuZXJzO1xuXG4gICAgX2Fzc2VydDJbJ2RlZmF1bHQnXS5lcXVhbChsaXN0ZW5lcnMub3Blbi5sZW5ndGgsIDEpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwobGlzdGVuZXJzLm1lc3NhZ2UubGVuZ3RoLCAxKTtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLmVxdWFsKGxpc3RlbmVycy5jbG9zZS5sZW5ndGgsIDEpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwobGlzdGVuZXJzLmVycm9yLmxlbmd0aCwgMSk7XG4gIH0pO1xuXG4gIGl0KCd0aGF0IHBhc3NpbmcgcHJvdG9jb2xzIGludG8gdGhlIGNvbnN0cnVjdG9yIHdvcmtzJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBteVNvY2tldCA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL25vdC1yZWFsJywgJ2ZvbycpO1xuICAgIHZhciBteU90aGVyU29ja2V0ID0gbmV3IF9zcmNXZWJzb2NrZXQyWydkZWZhdWx0J10oJ3dzOi8vbm90LXJlYWwnLCBbJ2JhciddKTtcblxuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwobXlTb2NrZXQucHJvdG9jb2wsICdmb28nLCAndGhlIGNvcnJlY3QgcHJvdG9jb2wgaXMgc2V0IHdoZW4gaXQgd2FzIHBhc3NlZCBpbiBhcyBhIHN0cmluZycpO1xuICAgIF9hc3NlcnQyWydkZWZhdWx0J10uZXF1YWwobXlPdGhlclNvY2tldC5wcm90b2NvbCwgJ2JhcicsICd0aGUgY29ycmVjdCBwcm90b2NvbCBpcyBzZXQgd2hlbiBpdCB3YXMgcGFzc2VkIGluIGFzIGFuIGFycmF5Jyk7XG4gIH0pO1xuXG4gIGl0KCd0aGF0IHNlbmRpbmcgd2hlbiB0aGUgc29ja2V0IGlzIGNsb3NlZCB0aHJvd3MgYW4gZXhwZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBteVNvY2tldCA9IG5ldyBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddKCd3czovL25vdC1yZWFsJywgJ2ZvbycpO1xuICAgIG15U29ja2V0LnJlYWR5U3RhdGUgPSBfc3JjV2Vic29ja2V0MlsnZGVmYXVsdCddLkNMT1NFRDtcbiAgICBfYXNzZXJ0MlsnZGVmYXVsdCddLnRocm93cyhmdW5jdGlvbiB0aHJvd3MoKSB7XG4gICAgICBteVNvY2tldC5zZW5kKCd0ZXN0aW5nJyk7XG4gICAgfSwgJ1dlYlNvY2tldCBpcyBhbHJlYWR5IGluIENMT1NJTkcgb3IgQ0xPU0VEIHN0YXRlJywgJ2FuIGV4cGVjdGlvbiBpcyB0aHJvd24gd2hlbiBzZW5kaW5nIHdoaWxlIGNsb3NlZCcpO1xuICB9KTtcbn0pOyJdfQ==
