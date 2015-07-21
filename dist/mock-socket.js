(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * IPv6 Support
 *
 * Version: 1.15.2
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
})(this, function (root) {
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
      for (var j = 0; j < 3; j++) {
        if (_segments[0] === '0' && _segments.length > 1) {
          _segments.splice(0, 1);
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
    if (segments[0] === '') {
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
});
},{}],2:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
 *
 * Version: 1.15.2
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
})(this, function (root) {
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
      'ac': ' com gov mil net org ',
      'ae': ' ac co gov mil name net org pro sch ',
      'af': ' com edu gov net org ',
      'al': ' com edu gov mil net org ',
      'ao': ' co ed gv it og pb ',
      'ar': ' com edu gob gov int mil net org tur ',
      'at': ' ac co gv or ',
      'au': ' asn com csiro edu gov id net org ',
      'ba': ' co com edu gov mil net org rs unbi unmo unsa untz unze ',
      'bb': ' biz co com edu gov info net org store tv ',
      'bh': ' biz cc com edu gov info net org ',
      'bn': ' com edu gov net org ',
      'bo': ' com edu gob gov int mil net org tv ',
      'br': ' adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
      'bs': ' com edu gov net org ',
      'bz': ' du et om ov rg ',
      'ca': ' ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
      'ck': ' biz co edu gen gov info net org ',
      'cn': ' ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
      'co': ' com edu gov mil net nom org ',
      'cr': ' ac c co ed fi go or sa ',
      'cy': ' ac biz com ekloges gov ltd name net org parliament press pro tm ',
      'do': ' art com edu gob gov mil net org sld web ',
      'dz': ' art asso com edu gov net org pol ',
      'ec': ' com edu fin gov info med mil net org pro ',
      'eg': ' com edu eun gov mil name net org sci ',
      'er': ' com edu gov ind mil net org rochest w ',
      'es': ' com edu gob nom org ',
      'et': ' biz com edu gov info name net org ',
      'fj': ' ac biz com info mil name net org pro ',
      'fk': ' ac co gov net nom org ',
      'fr': ' asso com f gouv nom prd presse tm ',
      'gg': ' co net org ',
      'gh': ' com edu gov mil org ',
      'gn': ' ac com gov net org ',
      'gr': ' com edu gov mil net org ',
      'gt': ' com edu gob ind mil net org ',
      'gu': ' com edu gov net org ',
      'hk': ' com edu gov idv net org ',
      'hu': ' 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
      'id': ' ac co go mil net or sch web ',
      'il': ' ac co gov idf k12 muni net org ',
      'in': ' ac co edu ernet firm gen gov i ind mil net nic org res ',
      'iq': ' com edu gov i mil net org ',
      'ir': ' ac co dnssec gov i id net org sch ',
      'it': ' edu gov ',
      'je': ' co net org ',
      'jo': ' com edu gov mil name net org sch ',
      'jp': ' ac ad co ed go gr lg ne or ',
      'ke': ' ac co go info me mobi ne or sc ',
      'kh': ' com edu gov mil net org per ',
      'ki': ' biz com de edu gov info mob net org tel ',
      'km': ' asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
      'kn': ' edu gov net org ',
      'kr': ' ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
      'kw': ' com edu gov net org ',
      'ky': ' com edu gov net org ',
      'kz': ' com edu gov mil net org ',
      'lb': ' com edu gov net org ',
      'lk': ' assn com edu gov grp hotel int ltd net ngo org sch soc web ',
      'lr': ' com edu gov net org ',
      'lv': ' asn com conf edu gov id mil net org ',
      'ly': ' com edu gov id med net org plc sch ',
      'ma': ' ac co gov m net org press ',
      'mc': ' asso tm ',
      'me': ' ac co edu gov its net org priv ',
      'mg': ' com edu gov mil nom org prd tm ',
      'mk': ' com edu gov inf name net org pro ',
      'ml': ' com edu gov net org presse ',
      'mn': ' edu gov org ',
      'mo': ' com edu gov net org ',
      'mt': ' com edu gov net org ',
      'mv': ' aero biz com coop edu gov info int mil museum name net org pro ',
      'mw': ' ac co com coop edu gov int museum net org ',
      'mx': ' com edu gob net org ',
      'my': ' com edu gov mil name net org sch ',
      'nf': ' arts com firm info net other per rec store web ',
      'ng': ' biz com edu gov mil mobi name net org sch ',
      'ni': ' ac co com edu gob mil net nom org ',
      'np': ' com edu gov mil net org ',
      'nr': ' biz com edu gov info net org ',
      'om': ' ac biz co com edu gov med mil museum net org pro sch ',
      'pe': ' com edu gob mil net nom org sld ',
      'ph': ' com edu gov i mil net ngo org ',
      'pk': ' biz com edu fam gob gok gon gop gos gov net org web ',
      'pl': ' art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
      'pr': ' ac biz com edu est gov info isla name net org pro prof ',
      'ps': ' com edu gov net org plo sec ',
      'pw': ' belau co ed go ne or ',
      'ro': ' arts com firm info nom nt org rec store tm www ',
      'rs': ' ac co edu gov in org ',
      'sb': ' com edu gov net org ',
      'sc': ' com edu gov net org ',
      'sh': ' co com edu gov net nom org ',
      'sl': ' com edu gov net org ',
      'st': ' co com consulado edu embaixada gov mil net org principe saotome store ',
      'sv': ' com edu gob org red ',
      'sz': ' ac co org ',
      'tr': ' av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
      'tt': ' aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
      'tw': ' club com ebiz edu game gov idv mil net org ',
      'mu': ' ac co com gov net or org ',
      'mz': ' ac co edu gov org ',
      'na': ' co com ',
      'nz': ' ac co cri geek gen govt health iwi maori mil net org parliament school ',
      'pa': ' abo ac com edu gob ing med net nom org sld ',
      'pt': ' com edu gov int net nome org publ ',
      'py': ' com edu gov mil net org ',
      'qa': ' com edu gov mil net org ',
      're': ' asso com nom ',
      'ru': ' ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
      'rw': ' ac co com edu gouv gov int mil net ',
      'sa': ' com edu gov med net org pub sch ',
      'sd': ' com edu gov info med net org tv ',
      'se': ' a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
      'sg': ' com edu gov idn net org per ',
      'sn': ' art com edu gouv org perso univ ',
      'sy': ' com edu gov mil net news org ',
      'th': ' ac co go in mi net or ',
      'tj': ' ac biz co com edu go gov info int mil name net nic org test web ',
      'tn': ' agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
      'tz': ' ac co go ne or ',
      'ua': ' biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
      'ug': ' ac co go ne or org sc ',
      'uk': ' ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
      'us': ' dni fed isa kids nsn ',
      'uy': ' com edu gub mil net org ',
      've': ' co com edu gob info mil net org web ',
      'vi': ' co com k12 net org ',
      'vn': ' ac biz com edu gov health info int name net org pro ',
      'ye': ' co com gov ltd me net org plc ',
      'yu': ' ac co edu gov org ',
      'za': ' ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
      'zm': ' ac co com edu gov net org sch '
    },
    // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
    // in both performance and memory footprint. No initialization required.
    // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
    // Following methods use lastIndexOf() rather than array.split() in order
    // to avoid any memory allocations.
    has: function has(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= domain.length - 1) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset - 1);
      if (sldOffset <= 0 || sldOffset >= tldOffset - 1) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset + 1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(sldOffset + 1, tldOffset) + ' ') >= 0;
    },
    is: function is(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= domain.length - 1) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset - 1);
      if (sldOffset >= 0) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset + 1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
    },
    get: function get(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= domain.length - 1) {
        return null;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset - 1);
      if (sldOffset <= 0 || sldOffset >= tldOffset - 1) {
        return null;
      }
      var sldList = SLD.list[domain.slice(tldOffset + 1)];
      if (!sldList) {
        return null;
      }
      if (sldList.indexOf(' ' + domain.slice(sldOffset + 1, tldOffset) + ' ') < 0) {
        return null;
      }
      return domain.slice(sldOffset + 1);
    },
    noConflict: function noConflict() {
      if (root.SecondLevelDomains === this) {
        root.SecondLevelDomains = _SecondLevelDomains;
      }
      return this;
    }
  };

  return SLD;
});
},{}],3:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.15.2
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
})(this, function (punycode, IPv6, SLD, root) {
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

  URI.version = '1.15.2';

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
      var _match = lookup && lookup[data[i]] !== undefined || !lookup && value.test(data[i]);
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

  URI._parts = function () {
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
  URI.getDomAttribute = function (node) {
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
    return encodeURIComponent(string).replace(/[!'()*]/g, escapeForDumbFirefox36).replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function () {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function () {
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
  URI.encodeQuery = function (string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function (string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch (e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = { 'encode': 'encode', 'decode': 'decode' };
  var _part;
  var generateAccessor = function generateAccessor(_group, _part) {
    return function (string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function (c) {
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

  var generateSegmentedPathFunction = function generateSegmentedPathFunction(_sep, _codingFuncName, _innerCodingFuncName) {
    return function (string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function (string) {
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

  URI.parse = function (string, parts) {
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
  URI.parseHost = function (string, parts) {
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
  URI.parseAuthority = function (string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function (string, parts) {
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
  URI.parseQuery = function (string, escapeQuerySpace) {
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

  URI.build = function (parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += URI.buildAuthority(parts) || '';

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
  URI.buildHost = function (parts) {
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
  URI.buildAuthority = function (parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function (parts) {
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
  URI.buildQuery = function (data, duplicateQueryParameters, escapeQuerySpace) {
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
  URI.buildQueryParameter = function (name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function (data, name, value) {
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
  URI.removeQuery = function (data, name, value) {
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
        } else if (data[name] === value) {
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
  URI.hasQuery = function (data, name, value, withinArray) {
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

  URI.commonPath = function (one, two) {
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

  URI.withinString = function (string, callback, options) {
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

  URI.ensureValidHostname = function (v) {
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
  URI.noConflict = function (removeAll) {
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

  p.build = function (deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function () {
    return new URI(this);
  };

  p.valueOf = p.toString = function () {
    return this.build(false)._string;
  };

  function generateSimpleAccessor(_part) {
    return function (v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key) {
    return function (v, build) {
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

  p.search = function (v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? '?' + t : t;
  };
  p.hash = function (v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? '#' + t : t;
  };

  p.pathname = function (v, build) {
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
  p.href = function (href, build) {
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
  p.is = function (what) {
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

  p.protocol = function (v, build) {
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
  p.port = function (v, build) {
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
  p.hostname = function (v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = {};
      URI.parseHost(v, x);
      v = x.hostname;
    }
    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.host = function (v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      URI.parseHost(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.authority = function (v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      URI.parseAuthority(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.userinfo = function (v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      if (!this._parts.username) {
        return '';
      }

      var t = URI.buildUserinfo(this._parts);
      return t.substring(0, t.length - 1);
    } else {
      if (v[v.length - 1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function (v, build) {
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
  p.subdomain = function (v, build) {
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
  p.domain = function (v, build) {
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
      end = this._parts.hostname.lastIndexOf('.', end - 1) + 1;
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
  p.tld = function (v, build) {
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
  p.directory = function (v, build) {
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
  p.filename = function (v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos + 1);

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
  p.suffix = function (v, build) {
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
      s = filename.substring(pos + 1);
      res = /^[a-z0-9%]+$/i.test(s) ? s : '';
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
  p.segment = function (segment, v, build) {
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
      return segment === undefined ? segments : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i = 0, l = v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length - 1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length - 1].length) {
            segments.pop();
          }

          segments.push(v[i]);
        }
      } else if (v || typeof v === 'string') {
        if (segments[segments.length - 1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length - 1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = v;
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function (segment, v, build) {
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
      v = typeof v === 'string' || v instanceof String ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function (v, build) {
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
  p.setQuery = function (name, value, build) {
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
  p.addQuery = function (name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function (name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function (name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function () {
    if (this._parts.urn) {
      return this.normalizeProtocol(false).normalizePath(false).normalizeQuery(false).normalizeFragment(false).build();
    }

    return this.normalizeProtocol(false).normalizeHostname(false).normalizePort(false).normalizePath(false).normalizeQuery(false).normalizeFragment(false).build();
  };
  p.normalizeProtocol = function (build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function (build) {
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
  p.normalizePort = function (build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function (build) {
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
    _path = _path.replace(/(\/(\.\/)+)|(\/\.$)/g, '/').replace(/\/{2,}/g, '/');

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
  p.normalizeQuery = function (build) {
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
  p.normalizeFragment = function (build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function () {
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

  p.unicode = function () {
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

  p.readable = function () {
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
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace).replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace).replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function (base) {
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

    for (i = 0; p = properties[i]; i++) {
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
      resolved._parts.path = (basedir ? basedir + '/' : '') + resolved._parts.path;
      resolved.normalizePath();
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function (base) {
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

    var parents = baseParts.path.substring(common.length).replace(/[^\/]*$/, '').replace(/.*?\//g, '../');

    relativeParts.path = parents + relativeParts.path.substring(common.length) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function (uri) {
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
  p.duplicateQueryParameters = function (v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function (v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
});
},{"./IPv6":1,"./SecondLevelDomains":2,"./punycode":4}],4:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.3 by @mathias */
;(function (root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
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
	maxInt = 2147483647,
	    // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	    tMin = 1,
	    tMax = 26,
	    skew = 38,
	    damp = 700,
	    initialBias = 72,
	    initialN = 128,
	    // 0x80
	delimiter = '-',
	    // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	    regexNonASCII = /[^ -~]/,
	    // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g,
	    // RFC 3490 separators

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
				if ((extra & 0xFC00) == 0xDC00) {
					// low surrogate
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
		return map(array, function (value) {
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
		for (; delta > baseMinusTMin * tMax >> 1; k += base) {
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

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base;; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

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
					for (q = delta, k = base;; k += base) {
						t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
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
		return mapDomain(domain, function (string) {
			return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
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
		return mapDomain(domain, function (string) {
			return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
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
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(function () {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) {
			// in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}
})(this);
/* no initialization */ /* no final expression */ /* no condition */ /* no condition */
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
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

  _createClass(EventTarget, [{
    key: 'addEventListener',

    /*
    * Ties a listener function to a event type which can later be invoked via the
    * dispatchEvent method.
    *
    * @param {string} type - the type of event (ie: 'open', 'message', etc.)
    * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
    * @param {boolean} useCapture - N/A TODO: implement useCapture functionallity
    */
    value: function addEventListener(type, listener /*, useCapture */) {
      if (typeof listener === 'function') {

        if (!Array.isArray(this.listeners[type])) {
          this.listeners[type] = [];
        }

        this.listeners[type].push(listener);
      }
    }
  }, {
    key: 'removeEventListener',

    /*
    * Removes the listener so it will no longer be invoked via the dispatchEvent method.
    *
    * @param {string} type - the type of event (ie: 'open', 'message', etc.)
    * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
    * @param {boolean} useCapture - N/A TODO: implement useCapture functionallity
    */
    value: function removeEventListener(type, removingListener /*, useCapture */) {
      var arrayOfListeners = this.listeners[type];
      this.listeners[type] = (0, _helpersArrayHelpers.reject)(arrayOfListeners, function (listener) {
        return listener === removingListener;
      });
    }
  }, {
    key: 'dispatchEvent',

    /*
    * Invokes all listener functions that are listening to the given event.type property. Each
    * listener will be passed the event as the first argument.
    *
    * @param {object} event - event object which will be passed to all listeners of the event.type property
    */
    value: function dispatchEvent(event, customArgument) {
      var eventName = event.type;
      var listeners = this.listeners[eventName];

      if (!Array.isArray(listeners)) {
        return false;
      }

      listeners.forEach(function (listener) {
        if (customArgument) {
          listener.call(null, customArgument);
        } else {
          listener.call(null, event);
        }
      });
    }
  }]);

  return EventTarget;
})();

exports['default'] = EventTarget;
module.exports = exports['default'];
},{"./helpers/array-helpers":7}],6:[function(require,module,exports){
Object.defineProperty(exports, '__esModule', {
  value: true
});
/*
*
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
*
* @param eventType can be Event or MessageEvent
*/
function createEvent(config) {
  var type = config.type;
  var target = config.target;

  if (!type) {
    throw new Error('You must specify an event type');
  }

  var event = new window.Event(type);

  if (!event) {
    throw new Error('Event is not defined in this enviornment');
  }

  return extendEvent(event, target);
}

/*
*
*/
function createMessageEvent(config) {
  var type = config.type;
  var origin = config.origin;
  var data = config.data;
  var target = config.target;

  var messageEvent = new window.MessageEvent(type);

  if (!messageEvent) {
    throw new Error('MessageEvent is not defined in this enviornment');
  }

  if (!type) {
    throw new Error('You must specify an event type');
  }

  extendEvent(messageEvent, target);
  messageEvent.initMessageEvent(type, false, false, data, origin, null);
  return messageEvent;
}

exports.createEvent = createEvent;
exports.createMessageEvent = createMessageEvent;
},{}],7:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reject = reject;

function reject(array, callback) {
  var results = [];
  array.forEach(function (itemInArray) {
    if (!callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}
},{}],8:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
function delay(callback, context) {
  setTimeout(function (context) {
    callback.call(context);
  }, 4, context);
}

exports["default"] = delay;
module.exports = exports["default"];
},{}],9:[function(require,module,exports){
Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

exports['default'] = {
  WebSocket: _websocket2['default'],
  Server: _server2['default']
};
module.exports = exports['default'];
},{"./server":11,"./websocket":12}],10:[function(require,module,exports){
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersArrayHelpers = require('./helpers/array-helpers');

/*
*
*/

var NetworkBridge = (function () {
  function NetworkBridge() {
    _classCallCheck(this, NetworkBridge);

    this.urlMap = {};
  }

  _createClass(NetworkBridge, [{
    key: 'attachWebSocket',

    /*
    * Attaches a websocket object to the urlMap hash so that it can find the server
    * it is connected to and the server in turn can find it.
    *
    * @param {object} websocket - websocket object to add to the urlMap hash
    * @param {string} url
    */
    value: function attachWebSocket(websocket, url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup && connectionLookup.server) {

        if (connectionLookup.websockets.indexOf(websocket) === -1) {
          connectionLookup.websockets.push(websocket);
          return connectionLookup.server;
        }
      }
    }
  }, {
    key: 'attachServer',

    /*
    * Attaches a server object to the urlMap hash so that it can find a websockets
    * which are connected to it and so that websockets can in turn can find it.
    *
    * @param {object} server - server object to add to the urlMap hash
    * @param {string} url
    */
    value: function attachServer(server, url) {
      var connectionLookup = this.urlMap[url];

      if (!connectionLookup) {

        this.urlMap[url] = {
          server: server,
          websockets: []
        };

        return server;
      }
    }
  }, {
    key: 'serverLookup',

    /*
    * Finds the server which is 'running' on the given url.
    *
    * @param {string} url - the url to use to find which server is running on it
    */
    value: function serverLookup(url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        return connectionLookup.server;
      }
    }
  }, {
    key: 'websocketsLookup',

    /*
    * Finds all websockets which is 'listening' on the given url.
    *
    * @param {string} url - the url to use to find all websockets which are associated with it
    */
    value: function websocketsLookup(url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        return connectionLookup.websockets;
      }

      return [];
    }
  }, {
    key: 'removeServer',

    /*
    * Removes the entry associated with the url.
    *
    * @param {string} url
    */
    value: function removeServer(url) {
      delete this.urlMap[url];
    }
  }, {
    key: 'removeWebSocket',

    /*
    * Removes the individual websocket from the map of associated websockets.
    *
    * @param {object} websocket - websocket object to remove from the url map
    * @param {string} url
    */
    value: function removeWebSocket(websocket, url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        connectionLookup.websockets = (0, _helpersArrayHelpers.reject)(connectionLookup.websockets, function (socket) {
          return socket === websocket;
        });
      }
    }
  }]);

  return NetworkBridge;
})();

exports['default'] = new NetworkBridge();
module.exports = exports['default'];
},{"./helpers/array-helpers":7}],11:[function(require,module,exports){
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _URIJs = require('../URI.js');

var _URIJs2 = _interopRequireDefault(_URIJs);

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _factory = require('./factory');

/*
*
*/

var Server = (function (_EventTarget) {
  _inherits(Server, _EventTarget);

  /*
  * @param {string} url
  */

  function Server(url) {
    _classCallCheck(this, Server);

    _get(Object.getPrototypeOf(Server.prototype), 'constructor', this).call(this);
    this.url = (0, _URIJs2['default'])(url).toString();
    var server = _networkBridge2['default'].attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent((0, _factory.createEvent)({ type: 'error' }));
    }
  }

  _createClass(Server, [{
    key: 'on',

    /*
    * This is the main function for the mock server to subscribe to the on events.
    *
    * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
    *
    * @param {type: string}: The event key to subscribe to. Valid keys are: connection, message, and close.
    * @param {callback: function}: The callback which should be called when a certain event is fired.
    */
    value: function on(type, callback) {
      this.addEventListener(type, callback);
    }
  }, {
    key: 'send',

    /*
    * This send function will notify all mock clients via their onmessage callbacks that the server
    * has a message for them.
    *
    * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
    */
    value: function send(data) {
      var _this = this;

      var websockets = _networkBridge2['default'].websocketsLookup(this.url);

      websockets.forEach(function (socket) {
        var messageEvent = (0, _factory.createMessageEvent)({
          type: 'message',
          data: data,
          origin: _this.url,
          target: socket
        });

        socket.dispatchEvent(messageEvent);
      });
    }
  }, {
    key: 'close',

    /*
    * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
    */
    value: function close() {
      var listeners = _networkBridge2['default'].websocketsLookup(this.url);

      listeners.forEach(function (socket) {
        socket.readyState = _websocket2['default'].CLOSE;
        socket.dispatchEvent((0, _factory.createEvent)({
          type: 'close',
          target: socket
        }));
      });

      this.dispatchEvent((0, _factory.createEvent)({ type: 'close' }), this);
      _networkBridge2['default'].removeServer(this.url);
    }
  }]);

  return Server;
})(_eventTarget2['default']);

exports['default'] = Server;
module.exports = exports['default'];
},{"../URI.js":3,"./event-target":5,"./factory":6,"./network-bridge":10,"./websocket":12}],12:[function(require,module,exports){
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _URIJs = require('../URI.js');

var _URIJs2 = _interopRequireDefault(_URIJs);

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _factory = require('./factory');

var WebSocket = (function (_EventTarget) {
  _inherits(WebSocket, _EventTarget);

  /*
  * @param {string} url
  */

  function WebSocket(url) {
    _classCallCheck(this, WebSocket);

    _get(Object.getPrototypeOf(WebSocket.prototype), 'constructor', this).call(this);

    /*
    *
    */
    this.binaryType = 'blob';
    this.url = (0, _URIJs2['default'])(url).toString();
    this.readyState = WebSocket.CONNECTING;

    /*
    *
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

    /*
    *
    */
    (0, _helpersDelay2['default'])(function () {
      var server = _networkBridge2['default'].attachWebSocket(this, this.url);

      if (server) {
        this.readyState = WebSocket.OPEN;
        this.dispatchEvent((0, _factory.createEvent)({ type: 'open', target: this }));
        server.dispatchEvent((0, _factory.createEvent)({ type: 'connection' }), server);
      } else {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent((0, _factory.createEvent)({ type: 'error', target: this }));

        console.error('WebSocket connection to \'' + this.url + '\' failed');
      }
    }, this);
  }

  _createClass(WebSocket, [{
    key: 'send',

    /*
    * This is a mock for the native send function found on the WebSocket object. It notifies the
    * service that it has sent a message.
    *
    * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
    */
    value: function send(data) {
      var messageEvent = (0, _factory.createMessageEvent)({
        type: 'message',
        origin: this.url,
        data: data
      });

      var server = _networkBridge2['default'].serverLookup(this.url);

      if (server) {
        server.dispatchEvent(messageEvent, data);
      }
    }
  }, {
    key: 'close',

    /*
    * This is a mock for the native close function found on the WebSocket object. It notifies the
    * service that it is closing the connection.
    */
    value: function close() {
      var server = _networkBridge2['default'].serverLookup(this.url);
      var closeEvent = (0, _factory.createEvent)({ type: 'close', target: this });

      this.readyState = WebSocket.CLOSED;
      this.dispatchEvent(closeEvent);

      if (server) {
        server.dispatchEvent(closeEvent, server);
      }

      // TODO: remove server from network-bridge
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
},{"../URI.js":3,"./event-target":5,"./factory":6,"./helpers/delay":8,"./network-bridge":10}]},{},[9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm9jY29saS1mYXN0LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIklQdjYuanMiLCJTZWNvbmRMZXZlbERvbWFpbnMuanMiLCJVUkkuanMiLCJwdW55Y29kZS5qcyIsInNyYy9ldmVudC10YXJnZXQuanMiLCJzcmMvZmFjdG9yeS5qcyIsInNyYy9oZWxwZXJzL2FycmF5LWhlbHBlcnMuanMiLCJzcmMvaGVscGVycy9kZWxheS5qcyIsInNyYy9tYWluLmpzIiwic3JjL25ldHdvcmstYnJpZGdlLmpzIiwic3JjL3NlcnZlci5qcyIsInNyYy93ZWJzb2NrZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdmlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBVUkkuanMgLSBNdXRhdGluZyBVUkxzXG4gKiBJUHY2IFN1cHBvcnRcbiAqXG4gKiBWZXJzaW9uOiAxLjE1LjJcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5JUHY2ID0gZmFjdG9yeShyb290KTtcbiAgfVxufSkodGhpcywgZnVuY3Rpb24gKHJvb3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gIHZhciBfaW4gPSBcImZlODA6MDAwMDowMDAwOjAwMDA6MDIwNDo2MWZmOmZlOWQ6ZjE1NlwiO1xuICB2YXIgX291dCA9IElQdjYuYmVzdChfaW4pO1xuICB2YXIgX2V4cGVjdGVkID0gXCJmZTgwOjoyMDQ6NjFmZjpmZTlkOmYxNTZcIjtcbiAgIGNvbnNvbGUubG9nKF9pbiwgX291dCwgX2V4cGVjdGVkLCBfb3V0ID09PSBfZXhwZWN0ZWQpO1xuICAqL1xuXG4gIC8vIHNhdmUgY3VycmVudCBJUHY2IHZhcmlhYmxlLCBpZiBhbnlcbiAgdmFyIF9JUHY2ID0gcm9vdCAmJiByb290LklQdjY7XG5cbiAgZnVuY3Rpb24gYmVzdFByZXNlbnRhdGlvbihhZGRyZXNzKSB7XG4gICAgLy8gYmFzZWQgb246XG4gICAgLy8gSmF2YXNjcmlwdCB0byB0ZXN0IGFuIElQdjYgYWRkcmVzcyBmb3IgcHJvcGVyIGZvcm1hdCwgYW5kIHRvXG4gICAgLy8gcHJlc2VudCB0aGUgXCJiZXN0IHRleHQgcmVwcmVzZW50YXRpb25cIiBhY2NvcmRpbmcgdG8gSUVURiBEcmFmdCBSRkMgYXRcbiAgICAvLyBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1pZXRmLTZtYW4tdGV4dC1hZGRyLXJlcHJlc2VudGF0aW9uLTA0XG4gICAgLy8gOCBGZWIgMjAxMCBSaWNoIEJyb3duLCBEYXJ0d2FyZSwgTExDXG4gICAgLy8gUGxlYXNlIGZlZWwgZnJlZSB0byB1c2UgdGhpcyBjb2RlIGFzIGxvbmcgYXMgeW91IHByb3ZpZGUgYSBsaW5rIHRvXG4gICAgLy8gaHR0cDovL3d3dy5pbnRlcm1hcHBlci5jb21cbiAgICAvLyBodHRwOi8vaW50ZXJtYXBwZXIuY29tL3N1cHBvcnQvdG9vbHMvSVBWNi1WYWxpZGF0b3IuYXNweFxuICAgIC8vIGh0dHA6Ly9kb3dubG9hZC5kYXJ0d2FyZS5jb20vdGhpcmRwYXJ0eS9pcHY2dmFsaWRhdG9yLmpzXG5cbiAgICB2YXIgX2FkZHJlc3MgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIHNlZ21lbnRzID0gX2FkZHJlc3Muc3BsaXQoJzonKTtcbiAgICB2YXIgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuICAgIHZhciB0b3RhbCA9IDg7XG5cbiAgICAvLyB0cmltIGNvbG9ucyAoOjogb3IgOjphOmI6Y+KApiBvciDigKZhOmI6Yzo6KVxuICAgIGlmIChzZWdtZW50c1swXSA9PT0gJycgJiYgc2VnbWVudHNbMV0gPT09ICcnICYmIHNlZ21lbnRzWzJdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4gOjpcbiAgICAgIC8vIHJlbW92ZSBmaXJzdCB0d28gaXRlbXNcbiAgICAgIHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudHNbMF0gPT09ICcnICYmIHNlZ21lbnRzWzFdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4gOjp4eHh4XG4gICAgICAvLyByZW1vdmUgdGhlIGZpcnN0IGl0ZW1cbiAgICAgIHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgfSBlbHNlIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXSA9PT0gJycgJiYgc2VnbWVudHNbbGVuZ3RoIC0gMl0gPT09ICcnKSB7XG4gICAgICAvLyBtdXN0IGhhdmUgYmVlbiB4eHh4OjpcbiAgICAgIHNlZ21lbnRzLnBvcCgpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIC8vIGFkanVzdCB0b3RhbCBzZWdtZW50cyBmb3IgSVB2NCB0cmFpbGVyXG4gICAgaWYgKHNlZ21lbnRzW2xlbmd0aCAtIDFdLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgIC8vIGZvdW5kIGEgXCIuXCIgd2hpY2ggbWVhbnMgSVB2NFxuICAgICAgdG90YWwgPSA3O1xuICAgIH1cblxuICAgIC8vIGZpbGwgZW1wdHkgc2VnbWVudHMgdGhlbSB3aXRoIFwiMDAwMFwiXG4gICAgdmFyIHBvcztcbiAgICBmb3IgKHBvcyA9IDA7IHBvcyA8IGxlbmd0aDsgcG9zKyspIHtcbiAgICAgIGlmIChzZWdtZW50c1twb3NdID09PSAnJykge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zIDwgdG90YWwpIHtcbiAgICAgIHNlZ21lbnRzLnNwbGljZShwb3MsIDEsICcwMDAwJyk7XG4gICAgICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoIDwgdG90YWwpIHtcbiAgICAgICAgc2VnbWVudHMuc3BsaWNlKHBvcywgMCwgJzAwMDAnKTtcbiAgICAgIH1cblxuICAgICAgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIHN0cmlwIGxlYWRpbmcgemVyb3NcbiAgICB2YXIgX3NlZ21lbnRzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgX3NlZ21lbnRzID0gc2VnbWVudHNbaV0uc3BsaXQoJycpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgaWYgKF9zZWdtZW50c1swXSA9PT0gJzAnICYmIF9zZWdtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgX3NlZ21lbnRzLnNwbGljZSgwLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZWdtZW50c1tpXSA9IF9zZWdtZW50cy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvLyBmaW5kIGxvbmdlc3Qgc2VxdWVuY2Ugb2YgemVyb2VzIGFuZCBjb2FsZXNjZSB0aGVtIGludG8gb25lIHNlZ21lbnRcbiAgICB2YXIgYmVzdCA9IC0xO1xuICAgIHZhciBfYmVzdCA9IDA7XG4gICAgdmFyIF9jdXJyZW50ID0gMDtcbiAgICB2YXIgY3VycmVudCA9IC0xO1xuICAgIHZhciBpbnplcm9lcyA9IGZhbHNlO1xuICAgIC8vIGk7IGFscmVhZHkgZGVjbGFyZWRcblxuICAgIGZvciAoaSA9IDA7IGkgPCB0b3RhbDsgaSsrKSB7XG4gICAgICBpZiAoaW56ZXJvZXMpIHtcbiAgICAgICAgaWYgKHNlZ21lbnRzW2ldID09PSAnMCcpIHtcbiAgICAgICAgICBfY3VycmVudCArPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluemVyb2VzID0gZmFsc2U7XG4gICAgICAgICAgaWYgKF9jdXJyZW50ID4gX2Jlc3QpIHtcbiAgICAgICAgICAgIGJlc3QgPSBjdXJyZW50O1xuICAgICAgICAgICAgX2Jlc3QgPSBfY3VycmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzZWdtZW50c1tpXSA9PT0gJzAnKSB7XG4gICAgICAgICAgaW56ZXJvZXMgPSB0cnVlO1xuICAgICAgICAgIGN1cnJlbnQgPSBpO1xuICAgICAgICAgIF9jdXJyZW50ID0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfY3VycmVudCA+IF9iZXN0KSB7XG4gICAgICBiZXN0ID0gY3VycmVudDtcbiAgICAgIF9iZXN0ID0gX2N1cnJlbnQ7XG4gICAgfVxuXG4gICAgaWYgKF9iZXN0ID4gMSkge1xuICAgICAgc2VnbWVudHMuc3BsaWNlKGJlc3QsIF9iZXN0LCAnJyk7XG4gICAgfVxuXG4gICAgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuXG4gICAgLy8gYXNzZW1ibGUgcmVtYWluaW5nIHNlZ21lbnRzXG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGlmIChzZWdtZW50c1swXSA9PT0gJycpIHtcbiAgICAgIHJlc3VsdCA9ICc6JztcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSBzZWdtZW50c1tpXTtcbiAgICAgIGlmIChpID09PSBsZW5ndGggLSAxKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQgKz0gJzonO1xuICAgIH1cblxuICAgIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXSA9PT0gJycpIHtcbiAgICAgIHJlc3VsdCArPSAnOic7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlICovXG4gICAgaWYgKHJvb3QuSVB2NiA9PT0gdGhpcykge1xuICAgICAgcm9vdC5JUHY2ID0gX0lQdjY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJlc3Q6IGJlc3RQcmVzZW50YXRpb24sXG4gICAgbm9Db25mbGljdDogbm9Db25mbGljdFxuICB9O1xufSk7IiwiLyohXG4gKiBVUkkuanMgLSBNdXRhdGluZyBVUkxzXG4gKiBTZWNvbmQgTGV2ZWwgRG9tYWluIChTTEQpIFN1cHBvcnRcbiAqXG4gKiBWZXJzaW9uOiAxLjE1LjJcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPSBmYWN0b3J5KHJvb3QpO1xuICB9XG59KSh0aGlzLCBmdW5jdGlvbiAocm9vdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gc2F2ZSBjdXJyZW50IFNlY29uZExldmVsRG9tYWlucyB2YXJpYWJsZSwgaWYgYW55XG4gIHZhciBfU2Vjb25kTGV2ZWxEb21haW5zID0gcm9vdCAmJiByb290LlNlY29uZExldmVsRG9tYWlucztcblxuICB2YXIgU0xEID0ge1xuICAgIC8vIGxpc3Qgb2Yga25vd24gU2Vjb25kIExldmVsIERvbWFpbnNcbiAgICAvLyBjb252ZXJ0ZWQgbGlzdCBvZiBTTERzIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2dhdmluZ21pbGxlci9zZWNvbmQtbGV2ZWwtZG9tYWluc1xuICAgIC8vIC0tLS1cbiAgICAvLyBwdWJsaWNzdWZmaXgub3JnIGlzIG1vcmUgY3VycmVudCBhbmQgYWN0dWFsbHkgdXNlZCBieSBhIGNvdXBsZSBvZiBicm93c2VycyBpbnRlcm5hbGx5LlxuICAgIC8vIGRvd25zaWRlIGlzIGl0IGFsc28gY29udGFpbnMgZG9tYWlucyBsaWtlIFwiZHluZG5zLm9yZ1wiIC0gd2hpY2ggaXMgZmluZSBmb3IgdGhlIHNlY3VyaXR5XG4gICAgLy8gaXNzdWVzIGJyb3dzZXIgaGF2ZSB0byBkZWFsIHdpdGggKFNPUCBmb3IgY29va2llcywgZXRjKSAtIGJ1dCBpcyB3YXkgb3ZlcmJvYXJkIGZvciBVUkkuanNcbiAgICAvLyAtLS0tXG4gICAgbGlzdDoge1xuICAgICAgJ2FjJzogJyBjb20gZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnYWUnOiAnIGFjIGNvIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHBybyBzY2ggJyxcbiAgICAgICdhZic6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2FsJzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2FvJzogJyBjbyBlZCBndiBpdCBvZyBwYiAnLFxuICAgICAgJ2FyJzogJyBjb20gZWR1IGdvYiBnb3YgaW50IG1pbCBuZXQgb3JnIHR1ciAnLFxuICAgICAgJ2F0JzogJyBhYyBjbyBndiBvciAnLFxuICAgICAgJ2F1JzogJyBhc24gY29tIGNzaXJvIGVkdSBnb3YgaWQgbmV0IG9yZyAnLFxuICAgICAgJ2JhJzogJyBjbyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBycyB1bmJpIHVubW8gdW5zYSB1bnR6IHVuemUgJyxcbiAgICAgICdiYic6ICcgYml6IGNvIGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyBzdG9yZSB0diAnLFxuICAgICAgJ2JoJzogJyBiaXogY2MgY29tIGVkdSBnb3YgaW5mbyBuZXQgb3JnICcsXG4gICAgICAnYm4nOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdibyc6ICcgY29tIGVkdSBnb2IgZ292IGludCBtaWwgbmV0IG9yZyB0diAnLFxuICAgICAgJ2JyJzogJyBhZG0gYWR2IGFnciBhbSBhcnEgYXJ0IGF0byBiIGJpbyBibG9nIGJtZCBjaW0gY25nIGNudCBjb20gY29vcCBlY24gZWR1IGVuZyBlc3AgZXRjIGV0aSBmYXIgZmxvZyBmbSBmbmQgZm90IGZzdCBnMTIgZ2dmIGdvdiBpbWIgaW5kIGluZiBqb3IganVzIGxlbCBtYXQgbWVkIG1pbCBtdXMgbmV0IG5vbSBub3QgbnRyIG9kbyBvcmcgcHBnIHBybyBwc2MgcHNpIHFzbCByZWMgc2xnIHNydiB0bXAgdHJkIHR1ciB0diB2ZXQgdmxvZyB3aWtpIHpsZyAnLFxuICAgICAgJ2JzJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnYnonOiAnIGR1IGV0IG9tIG92IHJnICcsXG4gICAgICAnY2EnOiAnIGFiIGJjIG1iIG5iIG5mIG5sIG5zIG50IG51IG9uIHBlIHFjIHNrIHlrICcsXG4gICAgICAnY2snOiAnIGJpeiBjbyBlZHUgZ2VuIGdvdiBpbmZvIG5ldCBvcmcgJyxcbiAgICAgICdjbic6ICcgYWMgYWggYmogY29tIGNxIGVkdSBmaiBnZCBnb3YgZ3MgZ3ggZ3ogaGEgaGIgaGUgaGkgaGwgaG4gamwganMganggbG4gbWlsIG5ldCBubSBueCBvcmcgcWggc2Mgc2Qgc2ggc24gc3ggdGogdHcgeGogeHogeW4gemogJyxcbiAgICAgICdjbyc6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBub20gb3JnICcsXG4gICAgICAnY3InOiAnIGFjIGMgY28gZWQgZmkgZ28gb3Igc2EgJyxcbiAgICAgICdjeSc6ICcgYWMgYml6IGNvbSBla2xvZ2VzIGdvdiBsdGQgbmFtZSBuZXQgb3JnIHBhcmxpYW1lbnQgcHJlc3MgcHJvIHRtICcsXG4gICAgICAnZG8nOiAnIGFydCBjb20gZWR1IGdvYiBnb3YgbWlsIG5ldCBvcmcgc2xkIHdlYiAnLFxuICAgICAgJ2R6JzogJyBhcnQgYXNzbyBjb20gZWR1IGdvdiBuZXQgb3JnIHBvbCAnLFxuICAgICAgJ2VjJzogJyBjb20gZWR1IGZpbiBnb3YgaW5mbyBtZWQgbWlsIG5ldCBvcmcgcHJvICcsXG4gICAgICAnZWcnOiAnIGNvbSBlZHUgZXVuIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaSAnLFxuICAgICAgJ2VyJzogJyBjb20gZWR1IGdvdiBpbmQgbWlsIG5ldCBvcmcgcm9jaGVzdCB3ICcsXG4gICAgICAnZXMnOiAnIGNvbSBlZHUgZ29iIG5vbSBvcmcgJyxcbiAgICAgICdldCc6ICcgYml6IGNvbSBlZHUgZ292IGluZm8gbmFtZSBuZXQgb3JnICcsXG4gICAgICAnZmonOiAnIGFjIGJpeiBjb20gaW5mbyBtaWwgbmFtZSBuZXQgb3JnIHBybyAnLFxuICAgICAgJ2ZrJzogJyBhYyBjbyBnb3YgbmV0IG5vbSBvcmcgJyxcbiAgICAgICdmcic6ICcgYXNzbyBjb20gZiBnb3V2IG5vbSBwcmQgcHJlc3NlIHRtICcsXG4gICAgICAnZ2cnOiAnIGNvIG5ldCBvcmcgJyxcbiAgICAgICdnaCc6ICcgY29tIGVkdSBnb3YgbWlsIG9yZyAnLFxuICAgICAgJ2duJzogJyBhYyBjb20gZ292IG5ldCBvcmcgJyxcbiAgICAgICdncic6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdndCc6ICcgY29tIGVkdSBnb2IgaW5kIG1pbCBuZXQgb3JnICcsXG4gICAgICAnZ3UnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdoayc6ICcgY29tIGVkdSBnb3YgaWR2IG5ldCBvcmcgJyxcbiAgICAgICdodSc6ICcgMjAwMCBhZ3JhciBib2x0IGNhc2lubyBjaXR5IGNvIGVyb3RpY2EgZXJvdGlrYSBmaWxtIGZvcnVtIGdhbWVzIGhvdGVsIGluZm8gaW5nYXRsYW4gam9nYXN6IGtvbnl2ZWxvIGxha2FzIG1lZGlhIG5ld3Mgb3JnIHByaXYgcmVrbGFtIHNleCBzaG9wIHNwb3J0IHN1bGkgc3pleCB0bSB0b3pzZGUgdXRhemFzIHZpZGVvICcsXG4gICAgICAnaWQnOiAnIGFjIGNvIGdvIG1pbCBuZXQgb3Igc2NoIHdlYiAnLFxuICAgICAgJ2lsJzogJyBhYyBjbyBnb3YgaWRmIGsxMiBtdW5pIG5ldCBvcmcgJyxcbiAgICAgICdpbic6ICcgYWMgY28gZWR1IGVybmV0IGZpcm0gZ2VuIGdvdiBpIGluZCBtaWwgbmV0IG5pYyBvcmcgcmVzICcsXG4gICAgICAnaXEnOiAnIGNvbSBlZHUgZ292IGkgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdpcic6ICcgYWMgY28gZG5zc2VjIGdvdiBpIGlkIG5ldCBvcmcgc2NoICcsXG4gICAgICAnaXQnOiAnIGVkdSBnb3YgJyxcbiAgICAgICdqZSc6ICcgY28gbmV0IG9yZyAnLFxuICAgICAgJ2pvJzogJyBjb20gZWR1IGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ2pwJzogJyBhYyBhZCBjbyBlZCBnbyBnciBsZyBuZSBvciAnLFxuICAgICAgJ2tlJzogJyBhYyBjbyBnbyBpbmZvIG1lIG1vYmkgbmUgb3Igc2MgJyxcbiAgICAgICdraCc6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgcGVyICcsXG4gICAgICAna2knOiAnIGJpeiBjb20gZGUgZWR1IGdvdiBpbmZvIG1vYiBuZXQgb3JnIHRlbCAnLFxuICAgICAgJ2ttJzogJyBhc3NvIGNvbSBjb29wIGVkdSBnb3V2IGsgbWVkZWNpbiBtaWwgbm9tIG5vdGFpcmVzIHBoYXJtYWNpZW5zIHByZXNzZSB0bSB2ZXRlcmluYWlyZSAnLFxuICAgICAgJ2tuJzogJyBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdrcic6ICcgYWMgYnVzYW4gY2h1bmdidWsgY2h1bmduYW0gY28gZGFlZ3UgZGFlamVvbiBlcyBnYW5nd29uIGdvIGd3YW5nanUgZ3llb25nYnVrIGd5ZW9uZ2dpIGd5ZW9uZ25hbSBocyBpbmNoZW9uIGplanUgamVvbmJ1ayBqZW9ubmFtIGsga2cgbWlsIG1zIG5lIG9yIHBlIHJlIHNjIHNlb3VsIHVsc2FuICcsXG4gICAgICAna3cnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdreSc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2t6JzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2xiJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbGsnOiAnIGFzc24gY29tIGVkdSBnb3YgZ3JwIGhvdGVsIGludCBsdGQgbmV0IG5nbyBvcmcgc2NoIHNvYyB3ZWIgJyxcbiAgICAgICdscic6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2x2JzogJyBhc24gY29tIGNvbmYgZWR1IGdvdiBpZCBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2x5JzogJyBjb20gZWR1IGdvdiBpZCBtZWQgbmV0IG9yZyBwbGMgc2NoICcsXG4gICAgICAnbWEnOiAnIGFjIGNvIGdvdiBtIG5ldCBvcmcgcHJlc3MgJyxcbiAgICAgICdtYyc6ICcgYXNzbyB0bSAnLFxuICAgICAgJ21lJzogJyBhYyBjbyBlZHUgZ292IGl0cyBuZXQgb3JnIHByaXYgJyxcbiAgICAgICdtZyc6ICcgY29tIGVkdSBnb3YgbWlsIG5vbSBvcmcgcHJkIHRtICcsXG4gICAgICAnbWsnOiAnIGNvbSBlZHUgZ292IGluZiBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnbWwnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgcHJlc3NlICcsXG4gICAgICAnbW4nOiAnIGVkdSBnb3Ygb3JnICcsXG4gICAgICAnbW8nOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdtdCc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ212JzogJyBhZXJvIGJpeiBjb20gY29vcCBlZHUgZ292IGluZm8gaW50IG1pbCBtdXNldW0gbmFtZSBuZXQgb3JnIHBybyAnLFxuICAgICAgJ213JzogJyBhYyBjbyBjb20gY29vcCBlZHUgZ292IGludCBtdXNldW0gbmV0IG9yZyAnLFxuICAgICAgJ214JzogJyBjb20gZWR1IGdvYiBuZXQgb3JnICcsXG4gICAgICAnbXknOiAnIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoICcsXG4gICAgICAnbmYnOiAnIGFydHMgY29tIGZpcm0gaW5mbyBuZXQgb3RoZXIgcGVyIHJlYyBzdG9yZSB3ZWIgJyxcbiAgICAgICduZyc6ICcgYml6IGNvbSBlZHUgZ292IG1pbCBtb2JpIG5hbWUgbmV0IG9yZyBzY2ggJyxcbiAgICAgICduaSc6ICcgYWMgY28gY29tIGVkdSBnb2IgbWlsIG5ldCBub20gb3JnICcsXG4gICAgICAnbnAnOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnbnInOiAnIGJpeiBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgJyxcbiAgICAgICdvbSc6ICcgYWMgYml6IGNvIGNvbSBlZHUgZ292IG1lZCBtaWwgbXVzZXVtIG5ldCBvcmcgcHJvIHNjaCAnLFxuICAgICAgJ3BlJzogJyBjb20gZWR1IGdvYiBtaWwgbmV0IG5vbSBvcmcgc2xkICcsXG4gICAgICAncGgnOiAnIGNvbSBlZHUgZ292IGkgbWlsIG5ldCBuZ28gb3JnICcsXG4gICAgICAncGsnOiAnIGJpeiBjb20gZWR1IGZhbSBnb2IgZ29rIGdvbiBnb3AgZ29zIGdvdiBuZXQgb3JnIHdlYiAnLFxuICAgICAgJ3BsJzogJyBhcnQgYmlhbHlzdG9rIGJpeiBjb20gZWR1IGdkYSBnZGFuc2sgZ29yem93IGdvdiBpbmZvIGthdG93aWNlIGtyYWtvdyBsb2R6IGx1YmxpbiBtaWwgbmV0IG5nbyBvbHN6dHluIG9yZyBwb3puYW4gcHdyIHJhZG9tIHNsdXBzayBzemN6ZWNpbiB0b3J1biB3YXJzemF3YSB3YXcgd3JvYyB3cm9jbGF3IHpnb3JhICcsXG4gICAgICAncHInOiAnIGFjIGJpeiBjb20gZWR1IGVzdCBnb3YgaW5mbyBpc2xhIG5hbWUgbmV0IG9yZyBwcm8gcHJvZiAnLFxuICAgICAgJ3BzJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnIHBsbyBzZWMgJyxcbiAgICAgICdwdyc6ICcgYmVsYXUgY28gZWQgZ28gbmUgb3IgJyxcbiAgICAgICdybyc6ICcgYXJ0cyBjb20gZmlybSBpbmZvIG5vbSBudCBvcmcgcmVjIHN0b3JlIHRtIHd3dyAnLFxuICAgICAgJ3JzJzogJyBhYyBjbyBlZHUgZ292IGluIG9yZyAnLFxuICAgICAgJ3NiJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnc2MnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdzaCc6ICcgY28gY29tIGVkdSBnb3YgbmV0IG5vbSBvcmcgJyxcbiAgICAgICdzbCc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3N0JzogJyBjbyBjb20gY29uc3VsYWRvIGVkdSBlbWJhaXhhZGEgZ292IG1pbCBuZXQgb3JnIHByaW5jaXBlIHNhb3RvbWUgc3RvcmUgJyxcbiAgICAgICdzdic6ICcgY29tIGVkdSBnb2Igb3JnIHJlZCAnLFxuICAgICAgJ3N6JzogJyBhYyBjbyBvcmcgJyxcbiAgICAgICd0cic6ICcgYXYgYmJzIGJlbCBiaXogY29tIGRyIGVkdSBnZW4gZ292IGluZm8gazEyIG5hbWUgbmV0IG9yZyBwb2wgdGVsIHRzayB0diB3ZWIgJyxcbiAgICAgICd0dCc6ICcgYWVybyBiaXogY2F0IGNvIGNvbSBjb29wIGVkdSBnb3YgaW5mbyBpbnQgam9icyBtaWwgbW9iaSBtdXNldW0gbmFtZSBuZXQgb3JnIHBybyB0ZWwgdHJhdmVsICcsXG4gICAgICAndHcnOiAnIGNsdWIgY29tIGViaXogZWR1IGdhbWUgZ292IGlkdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ211JzogJyBhYyBjbyBjb20gZ292IG5ldCBvciBvcmcgJyxcbiAgICAgICdteic6ICcgYWMgY28gZWR1IGdvdiBvcmcgJyxcbiAgICAgICduYSc6ICcgY28gY29tICcsXG4gICAgICAnbnonOiAnIGFjIGNvIGNyaSBnZWVrIGdlbiBnb3Z0IGhlYWx0aCBpd2kgbWFvcmkgbWlsIG5ldCBvcmcgcGFybGlhbWVudCBzY2hvb2wgJyxcbiAgICAgICdwYSc6ICcgYWJvIGFjIGNvbSBlZHUgZ29iIGluZyBtZWQgbmV0IG5vbSBvcmcgc2xkICcsXG4gICAgICAncHQnOiAnIGNvbSBlZHUgZ292IGludCBuZXQgbm9tZSBvcmcgcHVibCAnLFxuICAgICAgJ3B5JzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ3FhJzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ3JlJzogJyBhc3NvIGNvbSBub20gJyxcbiAgICAgICdydSc6ICcgYWMgYWR5Z2V5YSBhbHRhaSBhbXVyIGFya2hhbmdlbHNrIGFzdHJha2hhbiBiYXNoa2lyaWEgYmVsZ29yb2QgYmlyIGJyeWFuc2sgYnVyeWF0aWEgY2JnIGNoZWwgY2hlbHlhYmluc2sgY2hpdGEgY2h1a290a2EgY2h1dmFzaGlhIGNvbSBkYWdlc3RhbiBlLWJ1cmcgZWR1IGdvdiBncm96bnkgaW50IGlya3V0c2sgaXZhbm92byBpemhldnNrIGphciBqb3Noa2FyLW9sYSBrYWxteWtpYSBrYWx1Z2Ega2FtY2hhdGthIGthcmVsaWEga2F6YW4ga2NociBrZW1lcm92byBraGFiYXJvdnNrIGtoYWthc3NpYSBraHYga2lyb3Yga29lbmlnIGtvbWkga29zdHJvbWEga3Jhbm95YXJzayBrdWJhbiBrdXJnYW4ga3Vyc2sgbGlwZXRzayBtYWdhZGFuIG1hcmkgbWFyaS1lbCBtYXJpbmUgbWlsIG1vcmRvdmlhIG1vc3JlZyBtc2sgbXVybWFuc2sgbmFsY2hpayBuZXQgbm5vdiBub3Ygbm92b3NpYmlyc2sgbnNrIG9tc2sgb3JlbmJ1cmcgb3JnIG9yeW9sIHBlbnphIHBlcm0gcHAgcHNrb3YgcHR6IHJuZCByeWF6YW4gc2FraGFsaW4gc2FtYXJhIHNhcmF0b3Ygc2ltYmlyc2sgc21vbGVuc2sgc3BiIHN0YXZyb3BvbCBzdHYgc3VyZ3V0IHRhbWJvdiB0YXRhcnN0YW4gdG9tIHRvbXNrIHRzYXJpdHN5biB0c2sgdHVsYSB0dXZhIHR2ZXIgdHl1bWVuIHVkbSB1ZG11cnRpYSB1bGFuLXVkZSB2bGFkaWthdmtheiB2bGFkaW1pciB2bGFkaXZvc3RvayB2b2xnb2dyYWQgdm9sb2dkYSB2b3JvbmV6aCB2cm4gdnlhdGthIHlha3V0aWEgeWFtYWwgeWVrYXRlcmluYnVyZyB5dXpobm8tc2FraGFsaW5zayAnLFxuICAgICAgJ3J3JzogJyBhYyBjbyBjb20gZWR1IGdvdXYgZ292IGludCBtaWwgbmV0ICcsXG4gICAgICAnc2EnOiAnIGNvbSBlZHUgZ292IG1lZCBuZXQgb3JnIHB1YiBzY2ggJyxcbiAgICAgICdzZCc6ICcgY29tIGVkdSBnb3YgaW5mbyBtZWQgbmV0IG9yZyB0diAnLFxuICAgICAgJ3NlJzogJyBhIGFjIGIgYmQgYyBkIGUgZiBnIGggaSBrIGwgbSBuIG8gb3JnIHAgcGFydGkgcHAgcHJlc3MgciBzIHQgdG0gdSB3IHggeSB6ICcsXG4gICAgICAnc2cnOiAnIGNvbSBlZHUgZ292IGlkbiBuZXQgb3JnIHBlciAnLFxuICAgICAgJ3NuJzogJyBhcnQgY29tIGVkdSBnb3V2IG9yZyBwZXJzbyB1bml2ICcsXG4gICAgICAnc3knOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgbmV3cyBvcmcgJyxcbiAgICAgICd0aCc6ICcgYWMgY28gZ28gaW4gbWkgbmV0IG9yICcsXG4gICAgICAndGonOiAnIGFjIGJpeiBjbyBjb20gZWR1IGdvIGdvdiBpbmZvIGludCBtaWwgbmFtZSBuZXQgbmljIG9yZyB0ZXN0IHdlYiAnLFxuICAgICAgJ3RuJzogJyBhZ3JpbmV0IGNvbSBkZWZlbnNlIGVkdW5ldCBlbnMgZmluIGdvdiBpbmQgaW5mbyBpbnRsIG1pbmNvbSBuYXQgbmV0IG9yZyBwZXJzbyBybnJ0IHJucyBybnUgdG91cmlzbSAnLFxuICAgICAgJ3R6JzogJyBhYyBjbyBnbyBuZSBvciAnLFxuICAgICAgJ3VhJzogJyBiaXogY2hlcmthc3N5IGNoZXJuaWdvdiBjaGVybm92dHN5IGNrIGNuIGNvIGNvbSBjcmltZWEgY3YgZG4gZG5lcHJvcGV0cm92c2sgZG9uZXRzayBkcCBlZHUgZ292IGlmIGluIGl2YW5vLWZyYW5raXZzayBraCBraGFya292IGtoZXJzb24ga2htZWxuaXRza2l5IGtpZXYga2lyb3ZvZ3JhZCBrbSBrciBrcyBrdiBsZyBsdWdhbnNrIGx1dHNrIGx2aXYgbWUgbWsgbmV0IG5pa29sYWV2IG9kIG9kZXNzYSBvcmcgcGwgcG9sdGF2YSBwcCByb3ZubyBydiBzZWJhc3RvcG9sIHN1bXkgdGUgdGVybm9waWwgdXpoZ29yb2QgdmlubmljYSB2biB6YXBvcml6aHpoZSB6aGl0b21pciB6cCB6dCAnLFxuICAgICAgJ3VnJzogJyBhYyBjbyBnbyBuZSBvciBvcmcgc2MgJyxcbiAgICAgICd1ayc6ICcgYWMgYmwgYnJpdGlzaC1saWJyYXJ5IGNvIGN5bSBnb3YgZ292dCBpY25ldCBqZXQgbGVhIGx0ZCBtZSBtaWwgbW9kIG5hdGlvbmFsLWxpYnJhcnktc2NvdGxhbmQgbmVsIG5ldCBuaHMgbmljIG5scyBvcmcgb3JnbiBwYXJsaWFtZW50IHBsYyBwb2xpY2Ugc2NoIHNjb3Qgc29jICcsXG4gICAgICAndXMnOiAnIGRuaSBmZWQgaXNhIGtpZHMgbnNuICcsXG4gICAgICAndXknOiAnIGNvbSBlZHUgZ3ViIG1pbCBuZXQgb3JnICcsXG4gICAgICAndmUnOiAnIGNvIGNvbSBlZHUgZ29iIGluZm8gbWlsIG5ldCBvcmcgd2ViICcsXG4gICAgICAndmknOiAnIGNvIGNvbSBrMTIgbmV0IG9yZyAnLFxuICAgICAgJ3ZuJzogJyBhYyBiaXogY29tIGVkdSBnb3YgaGVhbHRoIGluZm8gaW50IG5hbWUgbmV0IG9yZyBwcm8gJyxcbiAgICAgICd5ZSc6ICcgY28gY29tIGdvdiBsdGQgbWUgbmV0IG9yZyBwbGMgJyxcbiAgICAgICd5dSc6ICcgYWMgY28gZWR1IGdvdiBvcmcgJyxcbiAgICAgICd6YSc6ICcgYWMgYWdyaWMgYWx0IGJvdXJzZSBjaXR5IGNvIGN5YmVybmV0IGRiIGVkdSBnb3YgZ3JvbmRhciBpYWNjZXNzIGltdCBpbmNhIGxhbmRlc2lnbiBsYXcgbWlsIG5ldCBuZ28gbmlzIG5vbSBvbGl2ZXR0aSBvcmcgcGl4IHNjaG9vbCB0bSB3ZWIgJyxcbiAgICAgICd6bSc6ICcgYWMgY28gY29tIGVkdSBnb3YgbmV0IG9yZyBzY2ggJ1xuICAgIH0sXG4gICAgLy8gZ29yaGlsbCAyMDEzLTEwLTI1OiBVc2luZyBpbmRleE9mKCkgaW5zdGVhZCBSZWdleHAoKS4gU2lnbmlmaWNhbnQgYm9vc3RcbiAgICAvLyBpbiBib3RoIHBlcmZvcm1hbmNlIGFuZCBtZW1vcnkgZm9vdHByaW50LiBObyBpbml0aWFsaXphdGlvbiByZXF1aXJlZC5cbiAgICAvLyBodHRwOi8vanNwZXJmLmNvbS91cmktanMtc2xkLXJlZ2V4LXZzLWJpbmFyeS1zZWFyY2gvNFxuICAgIC8vIEZvbGxvd2luZyBtZXRob2RzIHVzZSBsYXN0SW5kZXhPZigpIHJhdGhlciB0aGFuIGFycmF5LnNwbGl0KCkgaW4gb3JkZXJcbiAgICAvLyB0byBhdm9pZCBhbnkgbWVtb3J5IGFsbG9jYXRpb25zLlxuICAgIGhhczogZnVuY3Rpb24gaGFzKGRvbWFpbikge1xuICAgICAgdmFyIHRsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicpO1xuICAgICAgaWYgKHRsZE9mZnNldCA8PSAwIHx8IHRsZE9mZnNldCA+PSBkb21haW4ubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgc2xkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJywgdGxkT2Zmc2V0IC0gMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0IDw9IDAgfHwgc2xkT2Zmc2V0ID49IHRsZE9mZnNldCAtIDEpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZExpc3QgPSBTTEQubGlzdFtkb21haW4uc2xpY2UodGxkT2Zmc2V0ICsgMSldO1xuICAgICAgaWYgKCFzbGRMaXN0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbGRMaXN0LmluZGV4T2YoJyAnICsgZG9tYWluLnNsaWNlKHNsZE9mZnNldCArIDEsIHRsZE9mZnNldCkgKyAnICcpID49IDA7XG4gICAgfSxcbiAgICBpczogZnVuY3Rpb24gaXMoZG9tYWluKSB7XG4gICAgICB2YXIgdGxkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICBpZiAodGxkT2Zmc2V0IDw9IDAgfHwgdGxkT2Zmc2V0ID49IGRvbWFpbi5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQgLSAxKTtcbiAgICAgIGlmIChzbGRPZmZzZXQgPj0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgc2xkTGlzdCA9IFNMRC5saXN0W2RvbWFpbi5zbGljZSh0bGRPZmZzZXQgKyAxKV07XG4gICAgICBpZiAoIXNsZExpc3QpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNsZExpc3QuaW5kZXhPZignICcgKyBkb21haW4uc2xpY2UoMCwgdGxkT2Zmc2V0KSArICcgJykgPj0gMDtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KGRvbWFpbikge1xuICAgICAgdmFyIHRsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicpO1xuICAgICAgaWYgKHRsZE9mZnNldCA8PSAwIHx8IHRsZE9mZnNldCA+PSBkb21haW4ubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQgLSAxKTtcbiAgICAgIGlmIChzbGRPZmZzZXQgPD0gMCB8fCBzbGRPZmZzZXQgPj0gdGxkT2Zmc2V0IC0gMSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRMaXN0ID0gU0xELmxpc3RbZG9tYWluLnNsaWNlKHRsZE9mZnNldCArIDEpXTtcbiAgICAgIGlmICghc2xkTGlzdCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChzbGRMaXN0LmluZGV4T2YoJyAnICsgZG9tYWluLnNsaWNlKHNsZE9mZnNldCArIDEsIHRsZE9mZnNldCkgKyAnICcpIDwgMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0ICsgMSk7XG4gICAgfSxcbiAgICBub0NvbmZsaWN0OiBmdW5jdGlvbiBub0NvbmZsaWN0KCkge1xuICAgICAgaWYgKHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zID09PSB0aGlzKSB7XG4gICAgICAgIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zID0gX1NlY29uZExldmVsRG9tYWlucztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU0xEO1xufSk7IiwiLyohXG4gKiBVUkkuanMgLSBNdXRhdGluZyBVUkxzXG4gKlxuICogVmVyc2lvbjogMS4xNS4yXG4gKlxuICogQXV0aG9yOiBSb2RuZXkgUmVobVxuICogV2ViOiBodHRwOi8vbWVkaWFsaXplLmdpdGh1Yi5pby9VUkkuanMvXG4gKlxuICogTGljZW5zZWQgdW5kZXJcbiAqICAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZVxuICogICBHUEwgdjMgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0dQTC0zLjBcbiAqXG4gKi9cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAndXNlIHN0cmljdCc7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZVxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCcuL3B1bnljb2RlJyksIHJlcXVpcmUoJy4vSVB2NicpLCByZXF1aXJlKCcuL1NlY29uZExldmVsRG9tYWlucycpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFsnLi9wdW55Y29kZScsICcuL0lQdjYnLCAnLi9TZWNvbmRMZXZlbERvbWFpbnMnXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LlVSSSA9IGZhY3Rvcnkocm9vdC5wdW55Y29kZSwgcm9vdC5JUHY2LCByb290LlNlY29uZExldmVsRG9tYWlucywgcm9vdCk7XG4gIH1cbn0pKHRoaXMsIGZ1bmN0aW9uIChwdW55Y29kZSwgSVB2NiwgU0xELCByb290KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLypnbG9iYWwgbG9jYXRpb24sIGVzY2FwZSwgdW5lc2NhcGUgKi9cbiAgLy8gRklYTUU6IHYyLjAuMCByZW5hbWNlIG5vbi1jYW1lbENhc2UgcHJvcGVydGllcyB0byB1cHBlcmNhc2VcbiAgLypqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZSAqL1xuXG4gIC8vIHNhdmUgY3VycmVudCBVUkkgdmFyaWFibGUsIGlmIGFueVxuICB2YXIgX1VSSSA9IHJvb3QgJiYgcm9vdC5VUkk7XG5cbiAgZnVuY3Rpb24gVVJJKHVybCwgYmFzZSkge1xuICAgIHZhciBfdXJsU3VwcGxpZWQgPSBhcmd1bWVudHMubGVuZ3RoID49IDE7XG4gICAgdmFyIF9iYXNlU3VwcGxpZWQgPSBhcmd1bWVudHMubGVuZ3RoID49IDI7XG5cbiAgICAvLyBBbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgdGhlICduZXcnIGtleXdvcmRcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVVJJKSkge1xuICAgICAgaWYgKF91cmxTdXBwbGllZCkge1xuICAgICAgICBpZiAoX2Jhc2VTdXBwbGllZCkge1xuICAgICAgICAgIHJldHVybiBuZXcgVVJJKHVybCwgYmFzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFVSSSh1cmwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFVSSSgpO1xuICAgIH1cblxuICAgIGlmICh1cmwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKF91cmxTdXBwbGllZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bmRlZmluZWQgaXMgbm90IGEgdmFsaWQgYXJndW1lbnQgZm9yIFVSSScpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGxvY2F0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB1cmwgPSBsb2NhdGlvbi5ocmVmICsgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmwgPSAnJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmhyZWYodXJsKTtcblxuICAgIC8vIHJlc29sdmUgdG8gYmFzZSBhY2NvcmRpbmcgdG8gaHR0cDovL2R2Y3MudzMub3JnL2hnL3VybC9yYXctZmlsZS90aXAvT3ZlcnZpZXcuaHRtbCNjb25zdHJ1Y3RvclxuICAgIGlmIChiYXNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmFic29sdXRlVG8oYmFzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBVUkkudmVyc2lvbiA9ICcxLjE1LjInO1xuXG4gIHZhciBwID0gVVJJLnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbiAgZnVuY3Rpb24gZXNjYXBlUmVnRXgoc3RyaW5nKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvY29tbWl0Lzg1YWMyMTc4M2MxMWY4Y2NhYjA2MTA2ZGJhOTczNWEzMWE4NjkyNGQjY29tbWl0Y29tbWVudC04MjE5NjNcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbLiorP149IToke30oKXxbXFxdXFwvXFxcXF0pL2csICdcXFxcJDEnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFR5cGUodmFsdWUpIHtcbiAgICAvLyBJRTggZG9lc24ndCByZXR1cm4gW09iamVjdCBVbmRlZmluZWRdIGJ1dCBbT2JqZWN0IE9iamVjdF0gZm9yIHVuZGVmaW5lZCB2YWx1ZVxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ1VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpKS5zbGljZSg4LCAtMSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xuICAgIHJldHVybiBnZXRUeXBlKG9iaikgPT09ICdBcnJheSc7XG4gIH1cblxuICBmdW5jdGlvbiBmaWx0ZXJBcnJheVZhbHVlcyhkYXRhLCB2YWx1ZSkge1xuICAgIHZhciBsb29rdXAgPSB7fTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuXG4gICAgaWYgKGdldFR5cGUodmFsdWUpID09PSAnUmVnRXhwJykge1xuICAgICAgbG9va3VwID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBsb29rdXBbdmFsdWVbaV1dID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbG9va3VwW3ZhbHVlXSA9IHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMCwgbGVuZ3RoID0gZGF0YS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgLypqc2hpbnQgbGF4YnJlYWs6IHRydWUgKi9cbiAgICAgIHZhciBfbWF0Y2ggPSBsb29rdXAgJiYgbG9va3VwW2RhdGFbaV1dICE9PSB1bmRlZmluZWQgfHwgIWxvb2t1cCAmJiB2YWx1ZS50ZXN0KGRhdGFbaV0pO1xuICAgICAgLypqc2hpbnQgbGF4YnJlYWs6IGZhbHNlICovXG4gICAgICBpZiAoX21hdGNoKSB7XG4gICAgICAgIGRhdGEuc3BsaWNlKGksIDEpO1xuICAgICAgICBsZW5ndGgtLTtcbiAgICAgICAgaS0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlDb250YWlucyhsaXN0LCB2YWx1ZSkge1xuICAgIHZhciBpLCBsZW5ndGg7XG5cbiAgICAvLyB2YWx1ZSBtYXkgYmUgc3RyaW5nLCBudW1iZXIsIGFycmF5LCByZWdleHBcbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIC8vIE5vdGU6IHRoaXMgY2FuIGJlIG9wdGltaXplZCB0byBPKG4pIChpbnN0ZWFkIG9mIGN1cnJlbnQgTyhtICogbikpXG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIWFycmF5Q29udGFpbnMobGlzdCwgdmFsdWVbaV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBfdHlwZSA9IGdldFR5cGUodmFsdWUpO1xuICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChfdHlwZSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0W2ldID09PSAnc3RyaW5nJyAmJiBsaXN0W2ldLm1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGxpc3RbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5c0VxdWFsKG9uZSwgdHdvKSB7XG4gICAgaWYgKCFpc0FycmF5KG9uZSkgfHwgIWlzQXJyYXkodHdvKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGFycmF5cyBjYW4ndCBiZSBlcXVhbCBpZiB0aGV5IGhhdmUgZGlmZmVyZW50IGFtb3VudCBvZiBjb250ZW50XG4gICAgaWYgKG9uZS5sZW5ndGggIT09IHR3by5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvbmUuc29ydCgpO1xuICAgIHR3by5zb3J0KCk7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9uZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChvbmVbaV0gIT09IHR3b1tpXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBVUkkuX3BhcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm90b2NvbDogbnVsbCxcbiAgICAgIHVzZXJuYW1lOiBudWxsLFxuICAgICAgcGFzc3dvcmQ6IG51bGwsXG4gICAgICBob3N0bmFtZTogbnVsbCxcbiAgICAgIHVybjogbnVsbCxcbiAgICAgIHBvcnQ6IG51bGwsXG4gICAgICBwYXRoOiBudWxsLFxuICAgICAgcXVlcnk6IG51bGwsXG4gICAgICBmcmFnbWVudDogbnVsbCxcbiAgICAgIC8vIHN0YXRlXG4gICAgICBkdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnM6IFVSSS5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsXG4gICAgICBlc2NhcGVRdWVyeVNwYWNlOiBVUkkuZXNjYXBlUXVlcnlTcGFjZVxuICAgIH07XG4gIH07XG4gIC8vIHN0YXRlOiBhbGxvdyBkdXBsaWNhdGUgcXVlcnkgcGFyYW1ldGVycyAoYT0xJmE9MSlcbiAgVVJJLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyA9IGZhbHNlO1xuICAvLyBzdGF0ZTogcmVwbGFjZXMgKyB3aXRoICUyMCAoc3BhY2UgaW4gcXVlcnkgc3RyaW5ncylcbiAgVVJJLmVzY2FwZVF1ZXJ5U3BhY2UgPSB0cnVlO1xuICAvLyBzdGF0aWMgcHJvcGVydGllc1xuICBVUkkucHJvdG9jb2xfZXhwcmVzc2lvbiA9IC9eW2Etel1bYS16MC05ListXSokL2k7XG4gIFVSSS5pZG5fZXhwcmVzc2lvbiA9IC9bXmEtejAtOVxcLi1dL2k7XG4gIFVSSS5wdW55Y29kZV9leHByZXNzaW9uID0gLyh4bi0tKS9pO1xuICAvLyB3ZWxsLCAzMzMuNDQ0LjU1NS42NjYgbWF0Y2hlcywgYnV0IGl0IHN1cmUgYWluJ3Qgbm8gSVB2NCAtIGRvIHdlIGNhcmU/XG4gIFVSSS5pcDRfZXhwcmVzc2lvbiA9IC9eXFxkezEsM31cXC5cXGR7MSwzfVxcLlxcZHsxLDN9XFwuXFxkezEsM30kLztcbiAgLy8gY3JlZGl0cyB0byBSaWNoIEJyb3duXG4gIC8vIHNvdXJjZTogaHR0cDovL2ZvcnVtcy5pbnRlcm1hcHBlci5jb20vdmlld3RvcGljLnBocD9wPTEwOTYjMTA5NlxuICAvLyBzcGVjaWZpY2F0aW9uOiBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmM0MjkxLnR4dFxuICBVUkkuaXA2X2V4cHJlc3Npb24gPSAvXlxccyooKChbMC05QS1GYS1mXXsxLDR9Oil7N30oWzAtOUEtRmEtZl17MSw0fXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7Nn0oOlswLTlBLUZhLWZdezEsNH18KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXs1fSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDJ9KXw6KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXs0fSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDN9KXwoKDpbMC05QS1GYS1mXXsxLDR9KT86KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7M30oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw0fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCwyfTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXsyfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDV9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDN9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezF9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNn0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsNH06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KDooKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw3fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCw1fTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKSkoJS4rKT9cXHMqJC87XG4gIC8vIGV4cHJlc3Npb24gdXNlZCBpcyBcImdydWJlciByZXZpc2VkXCIgKEBncnViZXIgdjIpIGRldGVybWluZWQgdG8gYmUgdGhlXG4gIC8vIGJlc3Qgc29sdXRpb24gaW4gYSByZWdleC1nb2xmIHdlIGRpZCBhIGNvdXBsZSBvZiBhZ2VzIGFnbyBhdFxuICAvLyAqIGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL2RlbW8vdXJsLXJlZ2V4XG4gIC8vICogaHR0cDovL3JvZG5leXJlaG0uZGUvdC91cmwtcmVnZXguaHRtbFxuICBVUkkuZmluZF91cmlfZXhwcmVzc2lvbiA9IC9cXGIoKD86W2Etel1bXFx3LV0rOig/OlxcL3sxLDN9fFthLXowLTklXSl8d3d3XFxkezAsM31bLl18W2EtejAtOS5cXC1dK1suXVthLXpdezIsNH1cXC8pKD86W15cXHMoKTw+XSt8XFwoKFteXFxzKCk8Pl0rfChcXChbXlxccygpPD5dK1xcKSkpKlxcKSkrKD86XFwoKFteXFxzKCk8Pl0rfChcXChbXlxccygpPD5dK1xcKSkpKlxcKXxbXlxcc2AhKClcXFtcXF17fTs6J1wiLiw8Pj/Cq8K74oCc4oCd4oCY4oCZXSkpL2lnO1xuICBVUkkuZmluZFVyaSA9IHtcbiAgICAvLyB2YWxpZCBcInNjaGVtZTovL1wiIG9yIFwid3d3LlwiXG4gICAgc3RhcnQ6IC9cXGIoPzooW2Etel1bYS16MC05ListXSo6XFwvXFwvKXx3d3dcXC4pL2dpLFxuICAgIC8vIGV2ZXJ5dGhpbmcgdXAgdG8gdGhlIG5leHQgd2hpdGVzcGFjZVxuICAgIGVuZDogL1tcXHNcXHJcXG5dfCQvLFxuICAgIC8vIHRyaW0gdHJhaWxpbmcgcHVuY3R1YXRpb24gY2FwdHVyZWQgYnkgZW5kIFJlZ0V4cFxuICAgIHRyaW06IC9bYCEoKVxcW1xcXXt9OzonXCIuLDw+P8KrwrvigJzigJ3igJ7igJjigJldKyQvXG4gIH07XG4gIC8vIGh0dHA6Ly93d3cuaWFuYS5vcmcvYXNzaWdubWVudHMvdXJpLXNjaGVtZXMuaHRtbFxuICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfVENQX2FuZF9VRFBfcG9ydF9udW1iZXJzI1dlbGwta25vd25fcG9ydHNcbiAgVVJJLmRlZmF1bHRQb3J0cyA9IHtcbiAgICBodHRwOiAnODAnLFxuICAgIGh0dHBzOiAnNDQzJyxcbiAgICBmdHA6ICcyMScsXG4gICAgZ29waGVyOiAnNzAnLFxuICAgIHdzOiAnODAnLFxuICAgIHdzczogJzQ0MydcbiAgfTtcbiAgLy8gYWxsb3dlZCBob3N0bmFtZSBjaGFyYWN0ZXJzIGFjY29yZGluZyB0byBSRkMgMzk4NlxuICAvLyBBTFBIQSBESUdJVCBcIi1cIiBcIi5cIiBcIl9cIiBcIn5cIiBcIiFcIiBcIiRcIiBcIiZcIiBcIidcIiBcIihcIiBcIilcIiBcIipcIiBcIitcIiBcIixcIiBcIjtcIiBcIj1cIiAlZW5jb2RlZFxuICAvLyBJJ3ZlIG5ldmVyIHNlZW4gYSAobm9uLUlETikgaG9zdG5hbWUgb3RoZXIgdGhhbjogQUxQSEEgRElHSVQgLiAtXG4gIFVSSS5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMgPSAvW15hLXpBLVowLTlcXC4tXS87XG4gIC8vIG1hcCBET00gRWxlbWVudHMgdG8gdGhlaXIgVVJJIGF0dHJpYnV0ZVxuICBVUkkuZG9tQXR0cmlidXRlcyA9IHtcbiAgICAnYSc6ICdocmVmJyxcbiAgICAnYmxvY2txdW90ZSc6ICdjaXRlJyxcbiAgICAnbGluayc6ICdocmVmJyxcbiAgICAnYmFzZSc6ICdocmVmJyxcbiAgICAnc2NyaXB0JzogJ3NyYycsXG4gICAgJ2Zvcm0nOiAnYWN0aW9uJyxcbiAgICAnaW1nJzogJ3NyYycsXG4gICAgJ2FyZWEnOiAnaHJlZicsXG4gICAgJ2lmcmFtZSc6ICdzcmMnLFxuICAgICdlbWJlZCc6ICdzcmMnLFxuICAgICdzb3VyY2UnOiAnc3JjJyxcbiAgICAndHJhY2snOiAnc3JjJyxcbiAgICAnaW5wdXQnOiAnc3JjJywgLy8gYnV0IG9ubHkgaWYgdHlwZT1cImltYWdlXCJcbiAgICAnYXVkaW8nOiAnc3JjJyxcbiAgICAndmlkZW8nOiAnc3JjJ1xuICB9O1xuICBVUkkuZ2V0RG9tQXR0cmlidXRlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUgfHwgIW5vZGUubm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIG5vZGVOYW1lID0gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIC8vIDxpbnB1dD4gc2hvdWxkIG9ubHkgZXhwb3NlIHNyYyBmb3IgdHlwZT1cImltYWdlXCJcbiAgICBpZiAobm9kZU5hbWUgPT09ICdpbnB1dCcgJiYgbm9kZS50eXBlICE9PSAnaW1hZ2UnKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBVUkkuZG9tQXR0cmlidXRlc1tub2RlTmFtZV07XG4gIH07XG5cbiAgZnVuY3Rpb24gZXNjYXBlRm9yRHVtYkZpcmVmb3gzNih2YWx1ZSkge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy85MVxuICAgIHJldHVybiBlc2NhcGUodmFsdWUpO1xuICB9XG5cbiAgLy8gZW5jb2RpbmcgLyBkZWNvZGluZyBhY2NvcmRpbmcgdG8gUkZDMzk4NlxuICBmdW5jdGlvbiBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQoc3RyaW5nKSB7XG4gICAgLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmcpLnJlcGxhY2UoL1shJygpKl0vZywgZXNjYXBlRm9yRHVtYkZpcmVmb3gzNikucmVwbGFjZSgvXFwqL2csICclMkEnKTtcbiAgfVxuICBVUkkuZW5jb2RlID0gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50O1xuICBVUkkuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuICBVUkkuaXNvODg1OSA9IGZ1bmN0aW9uICgpIHtcbiAgICBVUkkuZW5jb2RlID0gZXNjYXBlO1xuICAgIFVSSS5kZWNvZGUgPSB1bmVzY2FwZTtcbiAgfTtcbiAgVVJJLnVuaWNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgVVJJLmVuY29kZSA9IHN0cmljdEVuY29kZVVSSUNvbXBvbmVudDtcbiAgICBVUkkuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuICB9O1xuICBVUkkuY2hhcmFjdGVycyA9IHtcbiAgICBwYXRobmFtZToge1xuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIC8vIFJGQzM5ODYgMi4xOiBGb3IgY29uc2lzdGVuY3ksIFVSSSBwcm9kdWNlcnMgYW5kIG5vcm1hbGl6ZXJzIHNob3VsZFxuICAgICAgICAvLyB1c2UgdXBwZXJjYXNlIGhleGFkZWNpbWFsIGRpZ2l0cyBmb3IgYWxsIHBlcmNlbnQtZW5jb2RpbmdzLlxuICAgICAgICBleHByZXNzaW9uOiAvJSgyNHwyNnwyQnwyQ3wzQnwzRHwzQXw0MCkvaWcsXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgIC8vIC0uX34hJygpKlxuICAgICAgICAgICclMjQnOiAnJCcsXG4gICAgICAgICAgJyUyNic6ICcmJyxcbiAgICAgICAgICAnJTJCJzogJysnLFxuICAgICAgICAgICclMkMnOiAnLCcsXG4gICAgICAgICAgJyUzQic6ICc7JyxcbiAgICAgICAgICAnJTNEJzogJz0nLFxuICAgICAgICAgICclM0EnOiAnOicsXG4gICAgICAgICAgJyU0MCc6ICdAJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZGVjb2RlOiB7XG4gICAgICAgIGV4cHJlc3Npb246IC9bXFwvXFw/I10vZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgJy8nOiAnJTJGJyxcbiAgICAgICAgICAnPyc6ICclM0YnLFxuICAgICAgICAgICcjJzogJyUyMydcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzZXJ2ZWQ6IHtcbiAgICAgIGVuY29kZToge1xuICAgICAgICAvLyBSRkMzOTg2IDIuMTogRm9yIGNvbnNpc3RlbmN5LCBVUkkgcHJvZHVjZXJzIGFuZCBub3JtYWxpemVycyBzaG91bGRcbiAgICAgICAgLy8gdXNlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCBkaWdpdHMgZm9yIGFsbCBwZXJjZW50LWVuY29kaW5ncy5cbiAgICAgICAgZXhwcmVzc2lvbjogLyUoMjF8MjN8MjR8MjZ8Mjd8Mjh8Mjl8MkF8MkJ8MkN8MkZ8M0F8M0J8M0R8M0Z8NDB8NUJ8NUQpL2lnLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAvLyBnZW4tZGVsaW1zXG4gICAgICAgICAgJyUzQSc6ICc6JyxcbiAgICAgICAgICAnJTJGJzogJy8nLFxuICAgICAgICAgICclM0YnOiAnPycsXG4gICAgICAgICAgJyUyMyc6ICcjJyxcbiAgICAgICAgICAnJTVCJzogJ1snLFxuICAgICAgICAgICclNUQnOiAnXScsXG4gICAgICAgICAgJyU0MCc6ICdAJyxcbiAgICAgICAgICAvLyBzdWItZGVsaW1zXG4gICAgICAgICAgJyUyMSc6ICchJyxcbiAgICAgICAgICAnJTI0JzogJyQnLFxuICAgICAgICAgICclMjYnOiAnJicsXG4gICAgICAgICAgJyUyNyc6ICdcXCcnLFxuICAgICAgICAgICclMjgnOiAnKCcsXG4gICAgICAgICAgJyUyOSc6ICcpJyxcbiAgICAgICAgICAnJTJBJzogJyonLFxuICAgICAgICAgICclMkInOiAnKycsXG4gICAgICAgICAgJyUyQyc6ICcsJyxcbiAgICAgICAgICAnJTNCJzogJzsnLFxuICAgICAgICAgICclM0QnOiAnPSdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdXJucGF0aDoge1xuICAgICAgLy8gVGhlIGNoYXJhY3RlcnMgdW5kZXIgYGVuY29kZWAgYXJlIHRoZSBjaGFyYWN0ZXJzIGNhbGxlZCBvdXQgYnkgUkZDIDIxNDEgYXMgYmVpbmcgYWNjZXB0YWJsZVxuICAgICAgLy8gZm9yIHVzYWdlIGluIGEgVVJOLiBSRkMyMTQxIGFsc28gY2FsbHMgb3V0IFwiLVwiLCBcIi5cIiwgYW5kIFwiX1wiIGFzIGFjY2VwdGFibGUgY2hhcmFjdGVycywgYnV0XG4gICAgICAvLyB0aGVzZSBhcmVuJ3QgZW5jb2RlZCBieSBlbmNvZGVVUklDb21wb25lbnQsIHNvIHdlIGRvbid0IGhhdmUgdG8gY2FsbCB0aGVtIG91dCBoZXJlLiBBbHNvXG4gICAgICAvLyBub3RlIHRoYXQgdGhlIGNvbG9uIGNoYXJhY3RlciBpcyBub3QgZmVhdHVyZWQgaW4gdGhlIGVuY29kaW5nIG1hcDsgdGhpcyBpcyBiZWNhdXNlIFVSSS5qc1xuICAgICAgLy8gZ2l2ZXMgdGhlIGNvbG9ucyBpbiBVUk5zIHNlbWFudGljIG1lYW5pbmcgYXMgdGhlIGRlbGltaXRlcnMgb2YgcGF0aCBzZWdlbWVudHMsIGFuZCBzbyBpdFxuICAgICAgLy8gc2hvdWxkIG5vdCBhcHBlYXIgdW5lbmNvZGVkIGluIGEgc2VnbWVudCBpdHNlbGYuXG4gICAgICAvLyBTZWUgYWxzbyB0aGUgbm90ZSBhYm92ZSBhYm91dCBSRkMzOTg2IGFuZCBjYXBpdGFsYWxpemVkIGhleCBkaWdpdHMuXG4gICAgICBlbmNvZGU6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogLyUoMjF8MjR8Mjd8Mjh8Mjl8MkF8MkJ8MkN8M0J8M0R8NDApL2lnLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAnJTIxJzogJyEnLFxuICAgICAgICAgICclMjQnOiAnJCcsXG4gICAgICAgICAgJyUyNyc6ICdcXCcnLFxuICAgICAgICAgICclMjgnOiAnKCcsXG4gICAgICAgICAgJyUyOSc6ICcpJyxcbiAgICAgICAgICAnJTJBJzogJyonLFxuICAgICAgICAgICclMkInOiAnKycsXG4gICAgICAgICAgJyUyQyc6ICcsJyxcbiAgICAgICAgICAnJTNCJzogJzsnLFxuICAgICAgICAgICclM0QnOiAnPScsXG4gICAgICAgICAgJyU0MCc6ICdAJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gVGhlc2UgY2hhcmFjdGVycyBhcmUgdGhlIGNoYXJhY3RlcnMgY2FsbGVkIG91dCBieSBSRkMyMTQxIGFzIFwicmVzZXJ2ZWRcIiBjaGFyYWN0ZXJzIHRoYXRcbiAgICAgIC8vIHNob3VsZCBuZXZlciBhcHBlYXIgaW4gYSBVUk4sIHBsdXMgdGhlIGNvbG9uIGNoYXJhY3RlciAoc2VlIG5vdGUgYWJvdmUpLlxuICAgICAgZGVjb2RlOiB7XG4gICAgICAgIGV4cHJlc3Npb246IC9bXFwvXFw/IzpdL2csXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICcvJzogJyUyRicsXG4gICAgICAgICAgJz8nOiAnJTNGJyxcbiAgICAgICAgICAnIyc6ICclMjMnLFxuICAgICAgICAgICc6JzogJyUzQSdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgVVJJLmVuY29kZVF1ZXJ5ID0gZnVuY3Rpb24gKHN0cmluZywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIHZhciBlc2NhcGVkID0gVVJJLmVuY29kZShzdHJpbmcgKyAnJyk7XG4gICAgaWYgKGVzY2FwZVF1ZXJ5U3BhY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXNjYXBlUXVlcnlTcGFjZSA9IFVSSS5lc2NhcGVRdWVyeVNwYWNlO1xuICAgIH1cblxuICAgIHJldHVybiBlc2NhcGVRdWVyeVNwYWNlID8gZXNjYXBlZC5yZXBsYWNlKC8lMjAvZywgJysnKSA6IGVzY2FwZWQ7XG4gIH07XG4gIFVSSS5kZWNvZGVRdWVyeSA9IGZ1bmN0aW9uIChzdHJpbmcsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICBzdHJpbmcgKz0gJyc7XG4gICAgaWYgKGVzY2FwZVF1ZXJ5U3BhY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXNjYXBlUXVlcnlTcGFjZSA9IFVSSS5lc2NhcGVRdWVyeVNwYWNlO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gVVJJLmRlY29kZShlc2NhcGVRdWVyeVNwYWNlID8gc3RyaW5nLnJlcGxhY2UoL1xcKy9nLCAnJTIwJykgOiBzdHJpbmcpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHdlJ3JlIG5vdCBnb2luZyB0byBtZXNzIHdpdGggd2VpcmQgZW5jb2RpbmdzLFxuICAgICAgLy8gZ2l2ZSB1cCBhbmQgcmV0dXJuIHRoZSB1bmRlY29kZWQgb3JpZ2luYWwgc3RyaW5nXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzg3XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzkyXG4gICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cbiAgfTtcbiAgLy8gZ2VuZXJhdGUgZW5jb2RlL2RlY29kZSBwYXRoIGZ1bmN0aW9uc1xuICB2YXIgX3BhcnRzID0geyAnZW5jb2RlJzogJ2VuY29kZScsICdkZWNvZGUnOiAnZGVjb2RlJyB9O1xuICB2YXIgX3BhcnQ7XG4gIHZhciBnZW5lcmF0ZUFjY2Vzc29yID0gZnVuY3Rpb24gZ2VuZXJhdGVBY2Nlc3NvcihfZ3JvdXAsIF9wYXJ0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBVUklbX3BhcnRdKHN0cmluZyArICcnKS5yZXBsYWNlKFVSSS5jaGFyYWN0ZXJzW19ncm91cF1bX3BhcnRdLmV4cHJlc3Npb24sIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgcmV0dXJuIFVSSS5jaGFyYWN0ZXJzW19ncm91cF1bX3BhcnRdLm1hcFtjXTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHdlJ3JlIG5vdCBnb2luZyB0byBtZXNzIHdpdGggd2VpcmQgZW5jb2RpbmdzLFxuICAgICAgICAvLyBnaXZlIHVwIGFuZCByZXR1cm4gdGhlIHVuZGVjb2RlZCBvcmlnaW5hbCBzdHJpbmdcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy84N1xuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzkyXG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBmb3IgKF9wYXJ0IGluIF9wYXJ0cykge1xuICAgIFVSSVtfcGFydCArICdQYXRoU2VnbWVudCddID0gZ2VuZXJhdGVBY2Nlc3NvcigncGF0aG5hbWUnLCBfcGFydHNbX3BhcnRdKTtcbiAgICBVUklbX3BhcnQgKyAnVXJuUGF0aFNlZ21lbnQnXSA9IGdlbmVyYXRlQWNjZXNzb3IoJ3VybnBhdGgnLCBfcGFydHNbX3BhcnRdKTtcbiAgfVxuXG4gIHZhciBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbiA9IGZ1bmN0aW9uIGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKF9zZXAsIF9jb2RpbmdGdW5jTmFtZSwgX2lubmVyQ29kaW5nRnVuY05hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgLy8gV2h5IHBhc3MgaW4gbmFtZXMgb2YgZnVuY3Rpb25zLCByYXRoZXIgdGhhbiB0aGUgZnVuY3Rpb24gb2JqZWN0cyB0aGVtc2VsdmVzPyBUaGVcbiAgICAgIC8vIGRlZmluaXRpb25zIG9mIHNvbWUgZnVuY3Rpb25zIChidXQgaW4gcGFydGljdWxhciwgVVJJLmRlY29kZSkgd2lsbCBvY2Nhc2lvbmFsbHkgY2hhbmdlIGR1ZVxuICAgICAgLy8gdG8gVVJJLmpzIGhhdmluZyBJU084ODU5IGFuZCBVbmljb2RlIG1vZGVzLiBQYXNzaW5nIGluIHRoZSBuYW1lIGFuZCBnZXR0aW5nIGl0IHdpbGwgZW5zdXJlXG4gICAgICAvLyB0aGF0IHRoZSBmdW5jdGlvbnMgd2UgdXNlIGhlcmUgYXJlIFwiZnJlc2hcIi5cbiAgICAgIHZhciBhY3R1YWxDb2RpbmdGdW5jO1xuICAgICAgaWYgKCFfaW5uZXJDb2RpbmdGdW5jTmFtZSkge1xuICAgICAgICBhY3R1YWxDb2RpbmdGdW5jID0gVVJJW19jb2RpbmdGdW5jTmFtZV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3R1YWxDb2RpbmdGdW5jID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICAgIHJldHVybiBVUklbX2NvZGluZ0Z1bmNOYW1lXShVUklbX2lubmVyQ29kaW5nRnVuY05hbWVdKHN0cmluZykpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VnbWVudHMgPSAoc3RyaW5nICsgJycpLnNwbGl0KF9zZXApO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2VnbWVudHNbaV0gPSBhY3R1YWxDb2RpbmdGdW5jKHNlZ21lbnRzW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzLmpvaW4oX3NlcCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBUaGlzIHRha2VzIHBsYWNlIG91dHNpZGUgdGhlIGFib3ZlIGxvb3AgYmVjYXVzZSB3ZSBkb24ndCB3YW50LCBlLmcuLCBlbmNvZGVVcm5QYXRoIGZ1bmN0aW9ucy5cbiAgVVJJLmRlY29kZVBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignLycsICdkZWNvZGVQYXRoU2VnbWVudCcpO1xuICBVUkkuZGVjb2RlVXJuUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCc6JywgJ2RlY29kZVVyblBhdGhTZWdtZW50Jyk7XG4gIFVSSS5yZWNvZGVQYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJy8nLCAnZW5jb2RlUGF0aFNlZ21lbnQnLCAnZGVjb2RlJyk7XG4gIFVSSS5yZWNvZGVVcm5QYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJzonLCAnZW5jb2RlVXJuUGF0aFNlZ21lbnQnLCAnZGVjb2RlJyk7XG5cbiAgVVJJLmVuY29kZVJlc2VydmVkID0gZ2VuZXJhdGVBY2Nlc3NvcigncmVzZXJ2ZWQnLCAnZW5jb2RlJyk7XG5cbiAgVVJJLnBhcnNlID0gZnVuY3Rpb24gKHN0cmluZywgcGFydHMpIHtcbiAgICB2YXIgcG9zO1xuICAgIGlmICghcGFydHMpIHtcbiAgICAgIHBhcnRzID0ge307XG4gICAgfVxuICAgIC8vIFtwcm90b2NvbFwiOi8vXCJbdXNlcm5hbWVbXCI6XCJwYXNzd29yZF1cIkBcIl1ob3N0bmFtZVtcIjpcInBvcnRdXCIvXCI/XVtwYXRoXVtcIj9cInF1ZXJ5c3RyaW5nXVtcIiNcImZyYWdtZW50XVxuXG4gICAgLy8gZXh0cmFjdCBmcmFnbWVudFxuICAgIHBvcyA9IHN0cmluZy5pbmRleE9mKCcjJyk7XG4gICAgaWYgKHBvcyA+IC0xKSB7XG4gICAgICAvLyBlc2NhcGluZz9cbiAgICAgIHBhcnRzLmZyYWdtZW50ID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKSB8fCBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpO1xuICAgIH1cblxuICAgIC8vIGV4dHJhY3QgcXVlcnlcbiAgICBwb3MgPSBzdHJpbmcuaW5kZXhPZignPycpO1xuICAgIGlmIChwb3MgPiAtMSkge1xuICAgICAgLy8gZXNjYXBpbmc/XG4gICAgICBwYXJ0cy5xdWVyeSA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSkgfHwgbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IHByb3RvY29sXG4gICAgaWYgKHN0cmluZy5zdWJzdHJpbmcoMCwgMikgPT09ICcvLycpIHtcbiAgICAgIC8vIHJlbGF0aXZlLXNjaGVtZVxuICAgICAgcGFydHMucHJvdG9jb2wgPSBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZygyKTtcbiAgICAgIC8vIGV4dHJhY3QgXCJ1c2VyOnBhc3NAaG9zdDpwb3J0XCJcbiAgICAgIHN0cmluZyA9IFVSSS5wYXJzZUF1dGhvcml0eShzdHJpbmcsIHBhcnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zID0gc3RyaW5nLmluZGV4T2YoJzonKTtcbiAgICAgIGlmIChwb3MgPiAtMSkge1xuICAgICAgICBwYXJ0cy5wcm90b2NvbCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKSB8fCBudWxsO1xuICAgICAgICBpZiAocGFydHMucHJvdG9jb2wgJiYgIXBhcnRzLnByb3RvY29sLm1hdGNoKFVSSS5wcm90b2NvbF9leHByZXNzaW9uKSkge1xuICAgICAgICAgIC8vIDogbWF5IGJlIHdpdGhpbiB0aGUgcGF0aFxuICAgICAgICAgIHBhcnRzLnByb3RvY29sID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSwgcG9zICsgMykgPT09ICcvLycpIHtcbiAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDMpO1xuXG4gICAgICAgICAgLy8gZXh0cmFjdCBcInVzZXI6cGFzc0Bob3N0OnBvcnRcIlxuICAgICAgICAgIHN0cmluZyA9IFVSSS5wYXJzZUF1dGhvcml0eShzdHJpbmcsIHBhcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgIHBhcnRzLnVybiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3aGF0J3MgbGVmdCBtdXN0IGJlIHRoZSBwYXRoXG4gICAgcGFydHMucGF0aCA9IHN0cmluZztcblxuICAgIC8vIGFuZCB3ZSdyZSBkb25lXG4gICAgcmV0dXJuIHBhcnRzO1xuICB9O1xuICBVUkkucGFyc2VIb3N0ID0gZnVuY3Rpb24gKHN0cmluZywgcGFydHMpIHtcbiAgICAvLyBleHRyYWN0IGhvc3Q6cG9ydFxuICAgIHZhciBwb3MgPSBzdHJpbmcuaW5kZXhPZignLycpO1xuICAgIHZhciBicmFja2V0UG9zO1xuICAgIHZhciB0O1xuXG4gICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgIHBvcyA9IHN0cmluZy5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5jaGFyQXQoMCkgPT09ICdbJykge1xuICAgICAgLy8gSVB2NiBob3N0IC0gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaWV0Zi02bWFuLXRleHQtYWRkci1yZXByZXNlbnRhdGlvbi0wNCNzZWN0aW9uLTZcbiAgICAgIC8vIEkgY2xhaW0gbW9zdCBjbGllbnQgc29mdHdhcmUgYnJlYWtzIG9uIElQdjYgYW55d2F5cy4gVG8gc2ltcGxpZnkgdGhpbmdzLCBVUkkgb25seSBhY2NlcHRzXG4gICAgICAvLyBJUHY2K3BvcnQgaW4gdGhlIGZvcm1hdCBbMjAwMTpkYjg6OjFdOjgwIChmb3IgdGhlIHRpbWUgYmVpbmcpXG4gICAgICBicmFja2V0UG9zID0gc3RyaW5nLmluZGV4T2YoJ10nKTtcbiAgICAgIHBhcnRzLmhvc3RuYW1lID0gc3RyaW5nLnN1YnN0cmluZygxLCBicmFja2V0UG9zKSB8fCBudWxsO1xuICAgICAgcGFydHMucG9ydCA9IHN0cmluZy5zdWJzdHJpbmcoYnJhY2tldFBvcyArIDIsIHBvcykgfHwgbnVsbDtcbiAgICAgIGlmIChwYXJ0cy5wb3J0ID09PSAnLycpIHtcbiAgICAgICAgcGFydHMucG9ydCA9IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmaXJzdENvbG9uID0gc3RyaW5nLmluZGV4T2YoJzonKTtcbiAgICAgIHZhciBmaXJzdFNsYXNoID0gc3RyaW5nLmluZGV4T2YoJy8nKTtcbiAgICAgIHZhciBuZXh0Q29sb24gPSBzdHJpbmcuaW5kZXhPZignOicsIGZpcnN0Q29sb24gKyAxKTtcbiAgICAgIGlmIChuZXh0Q29sb24gIT09IC0xICYmIChmaXJzdFNsYXNoID09PSAtMSB8fCBuZXh0Q29sb24gPCBmaXJzdFNsYXNoKSkge1xuICAgICAgICAvLyBJUHY2IGhvc3QgY29udGFpbnMgbXVsdGlwbGUgY29sb25zIC0gYnV0IG5vIHBvcnRcbiAgICAgICAgLy8gdGhpcyBub3RhdGlvbiBpcyBhY3R1YWxseSBub3QgYWxsb3dlZCBieSBSRkMgMzk4NiwgYnV0IHdlJ3JlIGEgbGliZXJhbCBwYXJzZXJcbiAgICAgICAgcGFydHMuaG9zdG5hbWUgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykgfHwgbnVsbDtcbiAgICAgICAgcGFydHMucG9ydCA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpLnNwbGl0KCc6Jyk7XG4gICAgICAgIHBhcnRzLmhvc3RuYW1lID0gdFswXSB8fCBudWxsO1xuICAgICAgICBwYXJ0cy5wb3J0ID0gdFsxXSB8fCBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJ0cy5ob3N0bmFtZSAmJiBzdHJpbmcuc3Vic3RyaW5nKHBvcykuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHBvcysrO1xuICAgICAgc3RyaW5nID0gJy8nICsgc3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcuc3Vic3RyaW5nKHBvcykgfHwgJy8nO1xuICB9O1xuICBVUkkucGFyc2VBdXRob3JpdHkgPSBmdW5jdGlvbiAoc3RyaW5nLCBwYXJ0cykge1xuICAgIHN0cmluZyA9IFVSSS5wYXJzZVVzZXJpbmZvKHN0cmluZywgcGFydHMpO1xuICAgIHJldHVybiBVUkkucGFyc2VIb3N0KHN0cmluZywgcGFydHMpO1xuICB9O1xuICBVUkkucGFyc2VVc2VyaW5mbyA9IGZ1bmN0aW9uIChzdHJpbmcsIHBhcnRzKSB7XG4gICAgLy8gZXh0cmFjdCB1c2VybmFtZTpwYXNzd29yZFxuICAgIHZhciBmaXJzdFNsYXNoID0gc3RyaW5nLmluZGV4T2YoJy8nKTtcbiAgICB2YXIgcG9zID0gc3RyaW5nLmxhc3RJbmRleE9mKCdAJywgZmlyc3RTbGFzaCA+IC0xID8gZmlyc3RTbGFzaCA6IHN0cmluZy5sZW5ndGggLSAxKTtcbiAgICB2YXIgdDtcblxuICAgIC8vIGF1dGhvcml0eUAgbXVzdCBjb21lIGJlZm9yZSAvcGF0aFxuICAgIGlmIChwb3MgPiAtMSAmJiAoZmlyc3RTbGFzaCA9PT0gLTEgfHwgcG9zIDwgZmlyc3RTbGFzaCkpIHtcbiAgICAgIHQgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykuc3BsaXQoJzonKTtcbiAgICAgIHBhcnRzLnVzZXJuYW1lID0gdFswXSA/IFVSSS5kZWNvZGUodFswXSkgOiBudWxsO1xuICAgICAgdC5zaGlmdCgpO1xuICAgICAgcGFydHMucGFzc3dvcmQgPSB0WzBdID8gVVJJLmRlY29kZSh0LmpvaW4oJzonKSkgOiBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMudXNlcm5hbWUgPSBudWxsO1xuICAgICAgcGFydHMucGFzc3dvcmQgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH07XG4gIFVSSS5wYXJzZVF1ZXJ5ID0gZnVuY3Rpb24gKHN0cmluZywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLy8gdGhyb3cgb3V0IHRoZSBmdW5reSBidXNpbmVzcyAtIFwiP1wiW25hbWVcIj1cInZhbHVlXCImXCJdK1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC8mKy9nLCAnJicpLnJlcGxhY2UoL15cXD8qJip8JiskL2csICcnKTtcblxuICAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgdmFyIGl0ZW1zID0ge307XG4gICAgdmFyIHNwbGl0cyA9IHN0cmluZy5zcGxpdCgnJicpO1xuICAgIHZhciBsZW5ndGggPSBzcGxpdHMubGVuZ3RoO1xuICAgIHZhciB2LCBuYW1lLCB2YWx1ZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHYgPSBzcGxpdHNbaV0uc3BsaXQoJz0nKTtcbiAgICAgIG5hbWUgPSBVUkkuZGVjb2RlUXVlcnkodi5zaGlmdCgpLCBlc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIC8vIG5vIFwiPVwiIGlzIG51bGwgYWNjb3JkaW5nIHRvIGh0dHA6Ly9kdmNzLnczLm9yZy9oZy91cmwvcmF3LWZpbGUvdGlwL092ZXJ2aWV3Lmh0bWwjY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgICAgdmFsdWUgPSB2Lmxlbmd0aCA/IFVSSS5kZWNvZGVRdWVyeSh2LmpvaW4oJz0nKSwgZXNjYXBlUXVlcnlTcGFjZSkgOiBudWxsO1xuXG4gICAgICBpZiAoaGFzT3duLmNhbGwoaXRlbXMsIG5hbWUpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbXNbbmFtZV0gPT09ICdzdHJpbmcnIHx8IGl0ZW1zW25hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgaXRlbXNbbmFtZV0gPSBbaXRlbXNbbmFtZV1dO1xuICAgICAgICB9XG5cbiAgICAgICAgaXRlbXNbbmFtZV0ucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbiAgfTtcblxuICBVUkkuYnVpbGQgPSBmdW5jdGlvbiAocGFydHMpIHtcbiAgICB2YXIgdCA9ICcnO1xuXG4gICAgaWYgKHBhcnRzLnByb3RvY29sKSB7XG4gICAgICB0ICs9IHBhcnRzLnByb3RvY29sICsgJzonO1xuICAgIH1cblxuICAgIGlmICghcGFydHMudXJuICYmICh0IHx8IHBhcnRzLmhvc3RuYW1lKSkge1xuICAgICAgdCArPSAnLy8nO1xuICAgIH1cblxuICAgIHQgKz0gVVJJLmJ1aWxkQXV0aG9yaXR5KHBhcnRzKSB8fCAnJztcblxuICAgIGlmICh0eXBlb2YgcGFydHMucGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChwYXJ0cy5wYXRoLmNoYXJBdCgwKSAhPT0gJy8nICYmIHR5cGVvZiBwYXJ0cy5ob3N0bmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdCArPSAnLyc7XG4gICAgICB9XG5cbiAgICAgIHQgKz0gcGFydHMucGF0aDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzLnF1ZXJ5ID09PSAnc3RyaW5nJyAmJiBwYXJ0cy5xdWVyeSkge1xuICAgICAgdCArPSAnPycgKyBwYXJ0cy5xdWVyeTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzLmZyYWdtZW50ID09PSAnc3RyaW5nJyAmJiBwYXJ0cy5mcmFnbWVudCkge1xuICAgICAgdCArPSAnIycgKyBwYXJ0cy5mcmFnbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG4gIH07XG4gIFVSSS5idWlsZEhvc3QgPSBmdW5jdGlvbiAocGFydHMpIHtcbiAgICB2YXIgdCA9ICcnO1xuXG4gICAgaWYgKCFwYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH0gZWxzZSBpZiAoVVJJLmlwNl9leHByZXNzaW9uLnRlc3QocGFydHMuaG9zdG5hbWUpKSB7XG4gICAgICB0ICs9ICdbJyArIHBhcnRzLmhvc3RuYW1lICsgJ10nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ICs9IHBhcnRzLmhvc3RuYW1lO1xuICAgIH1cblxuICAgIGlmIChwYXJ0cy5wb3J0KSB7XG4gICAgICB0ICs9ICc6JyArIHBhcnRzLnBvcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHQ7XG4gIH07XG4gIFVSSS5idWlsZEF1dGhvcml0eSA9IGZ1bmN0aW9uIChwYXJ0cykge1xuICAgIHJldHVybiBVUkkuYnVpbGRVc2VyaW5mbyhwYXJ0cykgKyBVUkkuYnVpbGRIb3N0KHBhcnRzKTtcbiAgfTtcbiAgVVJJLmJ1aWxkVXNlcmluZm8gPSBmdW5jdGlvbiAocGFydHMpIHtcbiAgICB2YXIgdCA9ICcnO1xuXG4gICAgaWYgKHBhcnRzLnVzZXJuYW1lKSB7XG4gICAgICB0ICs9IFVSSS5lbmNvZGUocGFydHMudXNlcm5hbWUpO1xuXG4gICAgICBpZiAocGFydHMucGFzc3dvcmQpIHtcbiAgICAgICAgdCArPSAnOicgKyBVUkkuZW5jb2RlKHBhcnRzLnBhc3N3b3JkKTtcbiAgICAgIH1cblxuICAgICAgdCArPSAnQCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHQ7XG4gIH07XG4gIFVSSS5idWlsZFF1ZXJ5ID0gZnVuY3Rpb24gKGRhdGEsIGR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIC8vIGFjY29yZGluZyB0byBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2IG9yIGh0dHA6Ly9sYWJzLmFwYWNoZS5vcmcvd2ViYXJjaC91cmkvcmZjL3JmYzM5ODYuaHRtbFxuICAgIC8vIGJlaW5nIMK7LS5ffiEkJicoKSorLDs9OkAvP8KrICVIRVggYW5kIGFsbnVtIGFyZSBhbGxvd2VkXG4gICAgLy8gdGhlIFJGQyBleHBsaWNpdGx5IHN0YXRlcyA/L2ZvbyBiZWluZyBhIHZhbGlkIHVzZSBjYXNlLCBubyBtZW50aW9uIG9mIHBhcmFtZXRlciBzeW50YXghXG4gICAgLy8gVVJJLmpzIHRyZWF0cyB0aGUgcXVlcnkgc3RyaW5nIGFzIGJlaW5nIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9SRUMtaHRtbDQwL2ludGVyYWN0L2Zvcm1zLmh0bWwjZm9ybS1jb250ZW50LXR5cGVcblxuICAgIHZhciB0ID0gJyc7XG4gICAgdmFyIHVuaXF1ZSwga2V5LCBpLCBsZW5ndGg7XG4gICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKGhhc093bi5jYWxsKGRhdGEsIGtleSkgJiYga2V5KSB7XG4gICAgICAgIGlmIChpc0FycmF5KGRhdGFba2V5XSkpIHtcbiAgICAgICAgICB1bmlxdWUgPSB7fTtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBkYXRhW2tleV0ubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkYXRhW2tleV1baV0gIT09IHVuZGVmaW5lZCAmJiB1bmlxdWVbZGF0YVtrZXldW2ldICsgJyddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgdCArPSAnJicgKyBVUkkuYnVpbGRRdWVyeVBhcmFtZXRlcihrZXksIGRhdGFba2V5XVtpXSwgZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICAgICAgICAgIGlmIChkdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB1bmlxdWVbZGF0YVtrZXldW2ldICsgJyddID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkYXRhW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHQgKz0gJyYnICsgVVJJLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoa2V5LCBkYXRhW2tleV0sIGVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHQuc3Vic3RyaW5nKDEpO1xuICB9O1xuICBVUkkuYnVpbGRRdWVyeVBhcmFtZXRlciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1JFQy1odG1sNDAvaW50ZXJhY3QvZm9ybXMuaHRtbCNmb3JtLWNvbnRlbnQtdHlwZSAtLSBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICAvLyBkb24ndCBhcHBlbmQgXCI9XCIgZm9yIG51bGwgdmFsdWVzLCBhY2NvcmRpbmcgdG8gaHR0cDovL2R2Y3MudzMub3JnL2hnL3VybC9yYXctZmlsZS90aXAvT3ZlcnZpZXcuaHRtbCN1cmwtcGFyYW1ldGVyLXNlcmlhbGl6YXRpb25cbiAgICByZXR1cm4gVVJJLmVuY29kZVF1ZXJ5KG5hbWUsIGVzY2FwZVF1ZXJ5U3BhY2UpICsgKHZhbHVlICE9PSBudWxsID8gJz0nICsgVVJJLmVuY29kZVF1ZXJ5KHZhbHVlLCBlc2NhcGVRdWVyeVNwYWNlKSA6ICcnKTtcbiAgfTtcblxuICBVUkkuYWRkUXVlcnkgPSBmdW5jdGlvbiAoZGF0YSwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIFVSSS5hZGRRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKGRhdGFbbmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhW25hbWVdID0gdmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGFbbmFtZV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGRhdGFbbmFtZV0gPSBbZGF0YVtuYW1lXV07XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBbdmFsdWVdO1xuICAgICAgfVxuXG4gICAgICBkYXRhW25hbWVdID0gKGRhdGFbbmFtZV0gfHwgW10pLmNvbmNhdCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5hZGRRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuICB9O1xuICBVUkkucmVtb3ZlUXVlcnkgPSBmdW5jdGlvbiAoZGF0YSwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgaSwgbGVuZ3RoLCBrZXk7XG5cbiAgICBpZiAoaXNBcnJheShuYW1lKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gbmFtZS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBkYXRhW25hbWVbaV1dID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ2V0VHlwZShuYW1lKSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgICAgaWYgKG5hbWUudGVzdChrZXkpKSB7XG4gICAgICAgICAgZGF0YVtrZXldID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAoa2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKG5hbWUsIGtleSkpIHtcbiAgICAgICAgICBVUkkucmVtb3ZlUXVlcnkoZGF0YSwga2V5LCBuYW1lW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChnZXRUeXBlKHZhbHVlKSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkgJiYgdmFsdWUudGVzdChkYXRhW25hbWVdKSkge1xuICAgICAgICAgICAgZGF0YVtuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YVtuYW1lXSA9IGZpbHRlckFycmF5VmFsdWVzKGRhdGFbbmFtZV0sIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YVtuYW1lXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICBkYXRhW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICBkYXRhW25hbWVdID0gZmlsdGVyQXJyYXlWYWx1ZXMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkYXRhW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkucmVtb3ZlUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nLCBSZWdFeHAgYXMgdGhlIGZpcnN0IHBhcmFtZXRlcicpO1xuICAgIH1cbiAgfTtcbiAgVVJJLmhhc1F1ZXJ5ID0gZnVuY3Rpb24gKGRhdGEsIG5hbWUsIHZhbHVlLCB3aXRoaW5BcnJheSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgaWYgKCFVUkkuaGFzUXVlcnkoZGF0YSwga2V5LCBuYW1lW2tleV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuaGFzUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlcicpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZ2V0VHlwZSh2YWx1ZSkpIHtcbiAgICAgIGNhc2UgJ1VuZGVmaW5lZCc6XG4gICAgICAgIC8vIHRydWUgaWYgZXhpc3RzIChidXQgbWF5IGJlIGVtcHR5KVxuICAgICAgICByZXR1cm4gbmFtZSBpbiBkYXRhOyAvLyBkYXRhW25hbWVdICE9PSB1bmRlZmluZWQ7XG5cbiAgICAgIGNhc2UgJ0Jvb2xlYW4nOlxuICAgICAgICAvLyB0cnVlIGlmIGV4aXN0cyBhbmQgbm9uLWVtcHR5XG4gICAgICAgIHZhciBfYm9vbHkgPSBCb29sZWFuKGlzQXJyYXkoZGF0YVtuYW1lXSkgPyBkYXRhW25hbWVdLmxlbmd0aCA6IGRhdGFbbmFtZV0pO1xuICAgICAgICByZXR1cm4gdmFsdWUgPT09IF9ib29seTtcblxuICAgICAgY2FzZSAnRnVuY3Rpb24nOlxuICAgICAgICAvLyBhbGxvdyBjb21wbGV4IGNvbXBhcmlzb25cbiAgICAgICAgcmV0dXJuICEhdmFsdWUoZGF0YVtuYW1lXSwgbmFtZSwgZGF0YSk7XG5cbiAgICAgIGNhc2UgJ0FycmF5JzpcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9wID0gd2l0aGluQXJyYXkgPyBhcnJheUNvbnRhaW5zIDogYXJyYXlzRXF1YWw7XG4gICAgICAgIHJldHVybiBvcChkYXRhW25hbWVdLCB2YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ1JlZ0V4cCc6XG4gICAgICAgIGlmICghaXNBcnJheShkYXRhW25hbWVdKSkge1xuICAgICAgICAgIHJldHVybiBCb29sZWFuKGRhdGFbbmFtZV0gJiYgZGF0YVtuYW1lXS5tYXRjaCh2YWx1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF3aXRoaW5BcnJheSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheUNvbnRhaW5zKGRhdGFbbmFtZV0sIHZhbHVlKTtcblxuICAgICAgY2FzZSAnTnVtYmVyJzpcbiAgICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgY2FzZSAnU3RyaW5nJzpcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGFbbmFtZV0gPT09IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF3aXRoaW5BcnJheSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheUNvbnRhaW5zKGRhdGFbbmFtZV0sIHZhbHVlKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVVJJLmhhc1F1ZXJ5KCkgYWNjZXB0cyB1bmRlZmluZWQsIGJvb2xlYW4sIHN0cmluZywgbnVtYmVyLCBSZWdFeHAsIEZ1bmN0aW9uIGFzIHRoZSB2YWx1ZSBwYXJhbWV0ZXInKTtcbiAgICB9XG4gIH07XG5cbiAgVVJJLmNvbW1vblBhdGggPSBmdW5jdGlvbiAob25lLCB0d28pIHtcbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5taW4ob25lLmxlbmd0aCwgdHdvLmxlbmd0aCk7XG4gICAgdmFyIHBvcztcblxuICAgIC8vIGZpbmQgZmlyc3Qgbm9uLW1hdGNoaW5nIGNoYXJhY3RlclxuICAgIGZvciAocG9zID0gMDsgcG9zIDwgbGVuZ3RoOyBwb3MrKykge1xuICAgICAgaWYgKG9uZS5jaGFyQXQocG9zKSAhPT0gdHdvLmNoYXJBdChwb3MpKSB7XG4gICAgICAgIHBvcy0tO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zIDwgMSkge1xuICAgICAgcmV0dXJuIG9uZS5jaGFyQXQoMCkgPT09IHR3by5jaGFyQXQoMCkgJiYgb25lLmNoYXJBdCgwKSA9PT0gJy8nID8gJy8nIDogJyc7XG4gICAgfVxuXG4gICAgLy8gcmV2ZXJ0IHRvIGxhc3QgL1xuICAgIGlmIChvbmUuY2hhckF0KHBvcykgIT09ICcvJyB8fCB0d28uY2hhckF0KHBvcykgIT09ICcvJykge1xuICAgICAgcG9zID0gb25lLnN1YnN0cmluZygwLCBwb3MpLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9uZS5zdWJzdHJpbmcoMCwgcG9zICsgMSk7XG4gIH07XG5cbiAgVVJJLndpdGhpblN0cmluZyA9IGZ1bmN0aW9uIChzdHJpbmcsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICB2YXIgX3N0YXJ0ID0gb3B0aW9ucy5zdGFydCB8fCBVUkkuZmluZFVyaS5zdGFydDtcbiAgICB2YXIgX2VuZCA9IG9wdGlvbnMuZW5kIHx8IFVSSS5maW5kVXJpLmVuZDtcbiAgICB2YXIgX3RyaW0gPSBvcHRpb25zLnRyaW0gfHwgVVJJLmZpbmRVcmkudHJpbTtcbiAgICB2YXIgX2F0dHJpYnV0ZU9wZW4gPSAvW2EtejAtOS1dPVtcIiddPyQvaTtcblxuICAgIF9zdGFydC5sYXN0SW5kZXggPSAwO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgbWF0Y2ggPSBfc3RhcnQuZXhlYyhzdHJpbmcpO1xuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXJ0ID0gbWF0Y2guaW5kZXg7XG4gICAgICBpZiAob3B0aW9ucy5pZ25vcmVIdG1sKSB7XG4gICAgICAgIC8vIGF0dHJpYnV0KGU9W1wiJ10/JClcbiAgICAgICAgdmFyIGF0dHJpYnV0ZU9wZW4gPSBzdHJpbmcuc2xpY2UoTWF0aC5tYXgoc3RhcnQgLSAzLCAwKSwgc3RhcnQpO1xuICAgICAgICBpZiAoYXR0cmlidXRlT3BlbiAmJiBfYXR0cmlidXRlT3Blbi50ZXN0KGF0dHJpYnV0ZU9wZW4pKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgc3RyaW5nLnNsaWNlKHN0YXJ0KS5zZWFyY2goX2VuZCk7XG4gICAgICB2YXIgc2xpY2UgPSBzdHJpbmcuc2xpY2Uoc3RhcnQsIGVuZCkucmVwbGFjZShfdHJpbSwgJycpO1xuICAgICAgaWYgKG9wdGlvbnMuaWdub3JlICYmIG9wdGlvbnMuaWdub3JlLnRlc3Qoc2xpY2UpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBlbmQgPSBzdGFydCArIHNsaWNlLmxlbmd0aDtcbiAgICAgIHZhciByZXN1bHQgPSBjYWxsYmFjayhzbGljZSwgc3RhcnQsIGVuZCwgc3RyaW5nKTtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zbGljZSgwLCBzdGFydCkgKyByZXN1bHQgKyBzdHJpbmcuc2xpY2UoZW5kKTtcbiAgICAgIF9zdGFydC5sYXN0SW5kZXggPSBzdGFydCArIHJlc3VsdC5sZW5ndGg7XG4gICAgfVxuXG4gICAgX3N0YXJ0Lmxhc3RJbmRleCA9IDA7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcblxuICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgLy8gVGhlb3JldGljYWxseSBVUklzIGFsbG93IHBlcmNlbnQtZW5jb2RpbmcgaW4gSG9zdG5hbWVzIChhY2NvcmRpbmcgdG8gUkZDIDM5ODYpXG4gICAgLy8gdGhleSBhcmUgbm90IHBhcnQgb2YgRE5TIGFuZCB0aGVyZWZvcmUgaWdub3JlZCBieSBVUkkuanNcblxuICAgIGlmICh2Lm1hdGNoKFVSSS5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMpKSB7XG4gICAgICAvLyB0ZXN0IHB1bnljb2RlXG4gICAgICBpZiAoIXB1bnljb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0hvc3RuYW1lIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuLV0gYW5kIFB1bnljb2RlLmpzIGlzIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHB1bnljb2RlLnRvQVNDSUkodikubWF0Y2goVVJJLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXScpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBub0NvbmZsaWN0XG4gIFVSSS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKHJlbW92ZUFsbCkge1xuICAgIGlmIChyZW1vdmVBbGwpIHtcbiAgICAgIHZhciB1bmNvbmZsaWN0ZWQgPSB7XG4gICAgICAgIFVSSTogdGhpcy5ub0NvbmZsaWN0KClcbiAgICAgIH07XG5cbiAgICAgIGlmIChyb290LlVSSVRlbXBsYXRlICYmIHR5cGVvZiByb290LlVSSVRlbXBsYXRlLm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLlVSSVRlbXBsYXRlID0gcm9vdC5VUklUZW1wbGF0ZS5ub0NvbmZsaWN0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyb290LklQdjYgJiYgdHlwZW9mIHJvb3QuSVB2Ni5ub0NvbmZsaWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVuY29uZmxpY3RlZC5JUHY2ID0gcm9vdC5JUHY2Lm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zICYmIHR5cGVvZiByb290LlNlY29uZExldmVsRG9tYWlucy5ub0NvbmZsaWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVuY29uZmxpY3RlZC5TZWNvbmRMZXZlbERvbWFpbnMgPSByb290LlNlY29uZExldmVsRG9tYWlucy5ub0NvbmZsaWN0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bmNvbmZsaWN0ZWQ7XG4gICAgfSBlbHNlIGlmIChyb290LlVSSSA9PT0gdGhpcykge1xuICAgICAgcm9vdC5VUkkgPSBfVVJJO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAuYnVpbGQgPSBmdW5jdGlvbiAoZGVmZXJCdWlsZCkge1xuICAgIGlmIChkZWZlckJ1aWxkID09PSB0cnVlKSB7XG4gICAgICB0aGlzLl9kZWZlcnJlZF9idWlsZCA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChkZWZlckJ1aWxkID09PSB1bmRlZmluZWQgfHwgdGhpcy5fZGVmZXJyZWRfYnVpbGQpIHtcbiAgICAgIHRoaXMuX3N0cmluZyA9IFVSSS5idWlsZCh0aGlzLl9wYXJ0cyk7XG4gICAgICB0aGlzLl9kZWZlcnJlZF9idWlsZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBVUkkodGhpcyk7XG4gIH07XG5cbiAgcC52YWx1ZU9mID0gcC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5idWlsZChmYWxzZSkuX3N0cmluZztcbiAgfTtcblxuICBmdW5jdGlvbiBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKF9wYXJ0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHNbX3BhcnRdIHx8ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGFydHNbX3BhcnRdID0gdiB8fCBudWxsO1xuICAgICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZVByZWZpeEFjY2Vzc29yKF9wYXJ0LCBfa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHNbX3BhcnRdIHx8ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHYgIT09IG51bGwpIHtcbiAgICAgICAgICB2ID0gdiArICcnO1xuICAgICAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gX2tleSkge1xuICAgICAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BhcnRzW19wYXJ0XSA9IHY7XG4gICAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHAucHJvdG9jb2wgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCdwcm90b2NvbCcpO1xuICBwLnVzZXJuYW1lID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcigndXNlcm5hbWUnKTtcbiAgcC5wYXNzd29yZCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3Bhc3N3b3JkJyk7XG4gIHAuaG9zdG5hbWUgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCdob3N0bmFtZScpO1xuICBwLnBvcnQgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCdwb3J0Jyk7XG4gIHAucXVlcnkgPSBnZW5lcmF0ZVByZWZpeEFjY2Vzc29yKCdxdWVyeScsICc/Jyk7XG4gIHAuZnJhZ21lbnQgPSBnZW5lcmF0ZVByZWZpeEFjY2Vzc29yKCdmcmFnbWVudCcsICcjJyk7XG5cbiAgcC5zZWFyY2ggPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICB2YXIgdCA9IHRoaXMucXVlcnkodiwgYnVpbGQpO1xuICAgIHJldHVybiB0eXBlb2YgdCA9PT0gJ3N0cmluZycgJiYgdC5sZW5ndGggPyAnPycgKyB0IDogdDtcbiAgfTtcbiAgcC5oYXNoID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgdmFyIHQgPSB0aGlzLmZyYWdtZW50KHYsIGJ1aWxkKTtcbiAgICByZXR1cm4gdHlwZW9mIHQgPT09ICdzdHJpbmcnICYmIHQubGVuZ3RoID8gJyMnICsgdCA6IHQ7XG4gIH07XG5cbiAgcC5wYXRobmFtZSA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3BhcnRzLnBhdGggfHwgKHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gJy8nIDogJycpO1xuICAgICAgcmV0dXJuIHYgPyAodGhpcy5fcGFydHMudXJuID8gVVJJLmRlY29kZVVyblBhdGggOiBVUkkuZGVjb2RlUGF0aCkocmVzKSA6IHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdiA/IFVSSS5yZWNvZGVVcm5QYXRoKHYpIDogJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdiA/IFVSSS5yZWNvZGVQYXRoKHYpIDogJy8nO1xuICAgICAgfVxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnBhdGggPSBwLnBhdGhuYW1lO1xuICBwLmhyZWYgPSBmdW5jdGlvbiAoaHJlZiwgYnVpbGQpIHtcbiAgICB2YXIga2V5O1xuXG4gICAgaWYgKGhyZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdHJpbmcgPSAnJztcbiAgICB0aGlzLl9wYXJ0cyA9IFVSSS5fcGFydHMoKTtcblxuICAgIHZhciBfVVJJID0gaHJlZiBpbnN0YW5jZW9mIFVSSTtcbiAgICB2YXIgX29iamVjdCA9IHR5cGVvZiBocmVmID09PSAnb2JqZWN0JyAmJiAoaHJlZi5ob3N0bmFtZSB8fCBocmVmLnBhdGggfHwgaHJlZi5wYXRobmFtZSk7XG4gICAgaWYgKGhyZWYubm9kZU5hbWUpIHtcbiAgICAgIHZhciBhdHRyaWJ1dGUgPSBVUkkuZ2V0RG9tQXR0cmlidXRlKGhyZWYpO1xuICAgICAgaHJlZiA9IGhyZWZbYXR0cmlidXRlXSB8fCAnJztcbiAgICAgIF9vYmplY3QgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyB3aW5kb3cubG9jYXRpb24gaXMgcmVwb3J0ZWQgdG8gYmUgYW4gb2JqZWN0LCBidXQgaXQncyBub3QgdGhlIHNvcnRcbiAgICAvLyBvZiBvYmplY3Qgd2UncmUgbG9va2luZyBmb3I6XG4gICAgLy8gKiBsb2NhdGlvbi5wcm90b2NvbCBlbmRzIHdpdGggYSBjb2xvblxuICAgIC8vICogbG9jYXRpb24ucXVlcnkgIT0gb2JqZWN0LnNlYXJjaFxuICAgIC8vICogbG9jYXRpb24uaGFzaCAhPSBvYmplY3QuZnJhZ21lbnRcbiAgICAvLyBzaW1wbHkgc2VyaWFsaXppbmcgdGhlIHVua25vd24gb2JqZWN0IHNob3VsZCBkbyB0aGUgdHJpY2tcbiAgICAvLyAoZm9yIGxvY2F0aW9uLCBub3QgZm9yIGV2ZXJ5dGhpbmcuLi4pXG4gICAgaWYgKCFfVVJJICYmIF9vYmplY3QgJiYgaHJlZi5wYXRobmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBocmVmID0gaHJlZi50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgaHJlZiA9PT0gJ3N0cmluZycgfHwgaHJlZiBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgdGhpcy5fcGFydHMgPSBVUkkucGFyc2UoU3RyaW5nKGhyZWYpLCB0aGlzLl9wYXJ0cyk7XG4gICAgfSBlbHNlIGlmIChfVVJJIHx8IF9vYmplY3QpIHtcbiAgICAgIHZhciBzcmMgPSBfVVJJID8gaHJlZi5fcGFydHMgOiBocmVmO1xuICAgICAgZm9yIChrZXkgaW4gc3JjKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbCh0aGlzLl9wYXJ0cywga2V5KSkge1xuICAgICAgICAgIHRoaXMuX3BhcnRzW2tleV0gPSBzcmNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbnZhbGlkIGlucHV0Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIGlkZW50aWZpY2F0aW9uIGFjY2Vzc29yc1xuICBwLmlzID0gZnVuY3Rpb24gKHdoYXQpIHtcbiAgICB2YXIgaXAgPSBmYWxzZTtcbiAgICB2YXIgaXA0ID0gZmFsc2U7XG4gICAgdmFyIGlwNiA9IGZhbHNlO1xuICAgIHZhciBuYW1lID0gZmFsc2U7XG4gICAgdmFyIHNsZCA9IGZhbHNlO1xuICAgIHZhciBpZG4gPSBmYWxzZTtcbiAgICB2YXIgcHVueWNvZGUgPSBmYWxzZTtcbiAgICB2YXIgcmVsYXRpdmUgPSAhdGhpcy5fcGFydHMudXJuO1xuXG4gICAgaWYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICByZWxhdGl2ZSA9IGZhbHNlO1xuICAgICAgaXA0ID0gVVJJLmlwNF9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgaXA2ID0gVVJJLmlwNl9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgaXAgPSBpcDQgfHwgaXA2O1xuICAgICAgbmFtZSA9ICFpcDtcbiAgICAgIHNsZCA9IG5hbWUgJiYgU0xEICYmIFNMRC5oYXModGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgaWRuID0gbmFtZSAmJiBVUkkuaWRuX2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBwdW55Y29kZSA9IG5hbWUgJiYgVVJJLnB1bnljb2RlX2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh3aGF0LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ3JlbGF0aXZlJzpcbiAgICAgICAgcmV0dXJuIHJlbGF0aXZlO1xuXG4gICAgICBjYXNlICdhYnNvbHV0ZSc6XG4gICAgICAgIHJldHVybiAhcmVsYXRpdmU7XG5cbiAgICAgIC8vIGhvc3RuYW1lIGlkZW50aWZpY2F0aW9uXG4gICAgICBjYXNlICdkb21haW4nOlxuICAgICAgY2FzZSAnbmFtZSc6XG4gICAgICAgIHJldHVybiBuYW1lO1xuXG4gICAgICBjYXNlICdzbGQnOlxuICAgICAgICByZXR1cm4gc2xkO1xuXG4gICAgICBjYXNlICdpcCc6XG4gICAgICAgIHJldHVybiBpcDtcblxuICAgICAgY2FzZSAnaXA0JzpcbiAgICAgIGNhc2UgJ2lwdjQnOlxuICAgICAgY2FzZSAnaW5ldDQnOlxuICAgICAgICByZXR1cm4gaXA0O1xuXG4gICAgICBjYXNlICdpcDYnOlxuICAgICAgY2FzZSAnaXB2Nic6XG4gICAgICBjYXNlICdpbmV0Nic6XG4gICAgICAgIHJldHVybiBpcDY7XG5cbiAgICAgIGNhc2UgJ2lkbic6XG4gICAgICAgIHJldHVybiBpZG47XG5cbiAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgIHJldHVybiAhdGhpcy5fcGFydHMudXJuO1xuXG4gICAgICBjYXNlICd1cm4nOlxuICAgICAgICByZXR1cm4gISF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICAgIGNhc2UgJ3B1bnljb2RlJzpcbiAgICAgICAgcmV0dXJuIHB1bnljb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8vIGNvbXBvbmVudCBzcGVjaWZpYyBpbnB1dCB2YWxpZGF0aW9uXG4gIHZhciBfcHJvdG9jb2wgPSBwLnByb3RvY29sO1xuICB2YXIgX3BvcnQgPSBwLnBvcnQ7XG4gIHZhciBfaG9zdG5hbWUgPSBwLmhvc3RuYW1lO1xuXG4gIHAucHJvdG9jb2wgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodikge1xuICAgICAgICAvLyBhY2NlcHQgdHJhaWxpbmcgOi8vXG4gICAgICAgIHYgPSB2LnJlcGxhY2UoLzooXFwvXFwvKT8kLywgJycpO1xuXG4gICAgICAgIGlmICghdi5tYXRjaChVUkkucHJvdG9jb2xfZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm90b2NvbCBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05ListXSBvciBkb2VzblxcJ3Qgc3RhcnQgd2l0aCBbQS1aXScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcHJvdG9jb2wuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG4gIHAuc2NoZW1lID0gcC5wcm90b2NvbDtcbiAgcC5wb3J0ID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodiA9PT0gMCkge1xuICAgICAgICB2ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHYpIHtcbiAgICAgICAgdiArPSAnJztcbiAgICAgICAgaWYgKHYuY2hhckF0KDApID09PSAnOicpIHtcbiAgICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodi5tYXRjaCgvW14wLTldLykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQb3J0IFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFswLTldJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9wb3J0LmNhbGwodGhpcywgdiwgYnVpbGQpO1xuICB9O1xuICBwLmhvc3RuYW1lID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgeCA9IHt9O1xuICAgICAgVVJJLnBhcnNlSG9zdCh2LCB4KTtcbiAgICAgIHYgPSB4Lmhvc3RuYW1lO1xuICAgIH1cbiAgICByZXR1cm4gX2hvc3RuYW1lLmNhbGwodGhpcywgdiwgYnVpbGQpO1xuICB9O1xuXG4gIC8vIGNvbXBvdW5kIGFjY2Vzc29yc1xuICBwLmhvc3QgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/IFVSSS5idWlsZEhvc3QodGhpcy5fcGFydHMpIDogJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIFVSSS5wYXJzZUhvc3QodiwgdGhpcy5fcGFydHMpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmF1dGhvcml0eSA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gVVJJLmJ1aWxkQXV0aG9yaXR5KHRoaXMuX3BhcnRzKSA6ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBVUkkucGFyc2VBdXRob3JpdHkodiwgdGhpcy5fcGFydHMpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnVzZXJpbmZvID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnVzZXJuYW1lKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgdmFyIHQgPSBVUkkuYnVpbGRVc2VyaW5mbyh0aGlzLl9wYXJ0cyk7XG4gICAgICByZXR1cm4gdC5zdWJzdHJpbmcoMCwgdC5sZW5ndGggLSAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZbdi5sZW5ndGggLSAxXSAhPT0gJ0AnKSB7XG4gICAgICAgIHYgKz0gJ0AnO1xuICAgICAgfVxuXG4gICAgICBVUkkucGFyc2VVc2VyaW5mbyh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAucmVzb3VyY2UgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICB2YXIgcGFydHM7XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoKCkgKyB0aGlzLnNlYXJjaCgpICsgdGhpcy5oYXNoKCk7XG4gICAgfVxuXG4gICAgcGFydHMgPSBVUkkucGFyc2Uodik7XG4gICAgdGhpcy5fcGFydHMucGF0aCA9IHBhcnRzLnBhdGg7XG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBwYXJ0cy5xdWVyeTtcbiAgICB0aGlzLl9wYXJ0cy5mcmFnbWVudCA9IHBhcnRzLmZyYWdtZW50O1xuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBmcmFjdGlvbiBhY2Nlc3NvcnNcbiAgcC5zdWJkb21haW4gPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIC8vIGNvbnZlbmllbmNlLCByZXR1cm4gXCJ3d3dcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBncmFiIGRvbWFpbiBhbmQgYWRkIGFub3RoZXIgc2VnbWVudFxuICAgICAgdmFyIGVuZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMuZG9tYWluKCkubGVuZ3RoIC0gMTtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoMCwgZW5kKSB8fCAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sZW5ndGggLSB0aGlzLmRvbWFpbigpLmxlbmd0aDtcbiAgICAgIHZhciBzdWIgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoMCwgZSk7XG4gICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoJ14nICsgZXNjYXBlUmVnRXgoc3ViKSk7XG5cbiAgICAgIGlmICh2ICYmIHYuY2hhckF0KHYubGVuZ3RoIC0gMSkgIT09ICcuJykge1xuICAgICAgICB2ICs9ICcuJztcbiAgICAgIH1cblxuICAgICAgaWYgKHYpIHtcbiAgICAgICAgVVJJLmVuc3VyZVZhbGlkSG9zdG5hbWUodik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5kb21haW4gPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBidWlsZCA9IHY7XG4gICAgICB2ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIGNvbnZlbmllbmNlLCByZXR1cm4gXCJleGFtcGxlLm9yZ1wiIGZyb20gXCJ3d3cuZXhhbXBsZS5vcmdcIlxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGhvc3RuYW1lIGNvbnNpc3RzIG9mIDEgb3IgMiBzZWdtZW50cywgaXQgbXVzdCBiZSB0aGUgZG9tYWluXG4gICAgICB2YXIgdCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLm1hdGNoKC9cXC4vZyk7XG4gICAgICBpZiAodCAmJiB0Lmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lO1xuICAgICAgfVxuXG4gICAgICAvLyBncmFiIHRsZCBhbmQgYWRkIGFub3RoZXIgc2VnbWVudFxuICAgICAgdmFyIGVuZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMudGxkKGJ1aWxkKS5sZW5ndGggLSAxO1xuICAgICAgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGFzdEluZGV4T2YoJy4nLCBlbmQgLSAxKSArIDE7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKGVuZCkgfHwgJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYW5ub3Qgc2V0IGRvbWFpbiBlbXB0eScpO1xuICAgICAgfVxuXG4gICAgICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSh2KTtcblxuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCh0aGlzLmRvbWFpbigpKSArICckJyk7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnRsZCA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIFwib3JnXCIgZnJvbSBcInd3dy5leGFtcGxlLm9yZ1wiXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgdmFyIHBvcyA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICB2YXIgdGxkID0gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKHBvcyArIDEpO1xuXG4gICAgICBpZiAoYnVpbGQgIT09IHRydWUgJiYgU0xEICYmIFNMRC5saXN0W3RsZC50b0xvd2VyQ2FzZSgpXSkge1xuICAgICAgICByZXR1cm4gU0xELmdldCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkgfHwgdGxkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGxkO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVwbGFjZTtcblxuICAgICAgaWYgKCF2KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Nhbm5vdCBzZXQgVExEIGVtcHR5Jyk7XG4gICAgICB9IGVsc2UgaWYgKHYubWF0Y2goL1teYS16QS1aMC05LV0vKSkge1xuICAgICAgICBpZiAoU0xEICYmIFNMRC5pcyh2KSkge1xuICAgICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHRoaXMudGxkKCkpICsgJyQnKTtcbiAgICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVExEIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTldJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdjYW5ub3Qgc2V0IFRMRCBvbiBub24tZG9tYWluIGhvc3QnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHRoaXMudGxkKCkpICsgJyQnKTtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuZGlyZWN0b3J5ID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCAmJiAhdGhpcy5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcGFydHMucGF0aCA9PT0gJy8nKSB7XG4gICAgICAgIHJldHVybiAnLyc7XG4gICAgICB9XG5cbiAgICAgIHZhciBlbmQgPSB0aGlzLl9wYXJ0cy5wYXRoLmxlbmd0aCAtIHRoaXMuZmlsZW5hbWUoKS5sZW5ndGggLSAxO1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKDAsIGVuZCkgfHwgKHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gJy8nIDogJycpO1xuXG4gICAgICByZXR1cm4gdiA/IFVSSS5kZWNvZGVQYXRoKHJlcykgOiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlID0gdGhpcy5fcGFydHMucGF0aC5sZW5ndGggLSB0aGlzLmZpbGVuYW1lKCkubGVuZ3RoO1xuICAgICAgdmFyIGRpcmVjdG9yeSA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKDAsIGUpO1xuICAgICAgdmFyIHJlcGxhY2UgPSBuZXcgUmVnRXhwKCdeJyArIGVzY2FwZVJlZ0V4KGRpcmVjdG9yeSkpO1xuXG4gICAgICAvLyBmdWxseSBxdWFsaWZpZXIgZGlyZWN0b3JpZXMgYmVnaW4gd2l0aCBhIHNsYXNoXG4gICAgICBpZiAoIXRoaXMuaXMoJ3JlbGF0aXZlJykpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgdiA9ICcvJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2LmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICAgICAgdiA9ICcvJyArIHY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZGlyZWN0b3JpZXMgYWx3YXlzIGVuZCB3aXRoIGEgc2xhc2hcbiAgICAgIGlmICh2ICYmIHYuY2hhckF0KHYubGVuZ3RoIC0gMSkgIT09ICcvJykge1xuICAgICAgICB2ICs9ICcvJztcbiAgICAgIH1cblxuICAgICAgdiA9IFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgdGhpcy5fcGFydHMucGF0aCA9IHRoaXMuX3BhcnRzLnBhdGgucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5maWxlbmFtZSA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSB0cnVlKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnBhdGggfHwgdGhpcy5fcGFydHMucGF0aCA9PT0gJy8nKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgdmFyIHBvcyA9IHRoaXMuX3BhcnRzLnBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgIHZhciByZXMgPSB0aGlzLl9wYXJ0cy5wYXRoLnN1YnN0cmluZyhwb3MgKyAxKTtcblxuICAgICAgcmV0dXJuIHYgPyBVUkkuZGVjb2RlUGF0aFNlZ21lbnQocmVzKSA6IHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG11dGF0ZWREaXJlY3RvcnkgPSBmYWxzZTtcblxuICAgICAgaWYgKHYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAodi5tYXRjaCgvXFwuP1xcLy8pKSB7XG4gICAgICAgIG11dGF0ZWREaXJlY3RvcnkgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy5maWxlbmFtZSgpKSArICckJyk7XG4gICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuXG4gICAgICBpZiAobXV0YXRlZERpcmVjdG9yeSkge1xuICAgICAgICB0aGlzLm5vcm1hbGl6ZVBhdGgoYnVpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuc3VmZml4ID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCB0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgZmlsZW5hbWUgPSB0aGlzLmZpbGVuYW1lKCk7XG4gICAgICB2YXIgcG9zID0gZmlsZW5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIHZhciBzLCByZXM7XG5cbiAgICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgLy8gc3VmZml4IG1heSBvbmx5IGNvbnRhaW4gYWxudW0gY2hhcmFjdGVycyAoeXVwLCBJIG1hZGUgdGhpcyB1cC4pXG4gICAgICBzID0gZmlsZW5hbWUuc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgcmVzID0gL15bYS16MC05JV0rJC9pLnRlc3QocykgPyBzIDogJyc7XG4gICAgICByZXR1cm4gdiA/IFVSSS5kZWNvZGVQYXRoU2VnbWVudChyZXMpIDogcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodi5jaGFyQXQoMCkgPT09ICcuJykge1xuICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdWZmaXggPSB0aGlzLnN1ZmZpeCgpO1xuICAgICAgdmFyIHJlcGxhY2U7XG5cbiAgICAgIGlmICghc3VmZml4KSB7XG4gICAgICAgIGlmICghdikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFydHMucGF0aCArPSAnLicgKyBVUkkucmVjb2RlUGF0aCh2KTtcbiAgICAgIH0gZWxzZSBpZiAoIXYpIHtcbiAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgoJy4nICsgc3VmZml4KSArICckJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeChzdWZmaXgpICsgJyQnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcGxhY2UpIHtcbiAgICAgICAgdiA9IFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuc2VnbWVudCA9IGZ1bmN0aW9uIChzZWdtZW50LCB2LCBidWlsZCkge1xuICAgIHZhciBzZXBhcmF0b3IgPSB0aGlzLl9wYXJ0cy51cm4gPyAnOicgOiAnLyc7XG4gICAgdmFyIHBhdGggPSB0aGlzLnBhdGgoKTtcbiAgICB2YXIgYWJzb2x1dGUgPSBwYXRoLnN1YnN0cmluZygwLCAxKSA9PT0gJy8nO1xuICAgIHZhciBzZWdtZW50cyA9IHBhdGguc3BsaXQoc2VwYXJhdG9yKTtcblxuICAgIGlmIChzZWdtZW50ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHNlZ21lbnQgIT09ICdudW1iZXInKSB7XG4gICAgICBidWlsZCA9IHY7XG4gICAgICB2ID0gc2VnbWVudDtcbiAgICAgIHNlZ21lbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHNlZ21lbnQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQmFkIHNlZ21lbnQgXCInICsgc2VnbWVudCArICdcIiwgbXVzdCBiZSAwLWJhc2VkIGludGVnZXInKTtcbiAgICB9XG5cbiAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgIHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgaWYgKHNlZ21lbnQgPCAwKSB7XG4gICAgICAvLyBhbGxvdyBuZWdhdGl2ZSBpbmRleGVzIHRvIGFkZHJlc3MgZnJvbSB0aGUgZW5kXG4gICAgICBzZWdtZW50ID0gTWF0aC5tYXgoc2VnbWVudHMubGVuZ3RoICsgc2VnbWVudCwgMCk7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLypqc2hpbnQgbGF4YnJlYWs6IHRydWUgKi9cbiAgICAgIHJldHVybiBzZWdtZW50ID09PSB1bmRlZmluZWQgPyBzZWdtZW50cyA6IHNlZ21lbnRzW3NlZ21lbnRdO1xuICAgICAgLypqc2hpbnQgbGF4YnJlYWs6IGZhbHNlICovXG4gICAgfSBlbHNlIGlmIChzZWdtZW50ID09PSBudWxsIHx8IHNlZ21lbnRzW3NlZ21lbnRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChpc0FycmF5KHYpKSB7XG4gICAgICAgIHNlZ21lbnRzID0gW107XG4gICAgICAgIC8vIGNvbGxhcHNlIGVtcHR5IGVsZW1lbnRzIHdpdGhpbiBhcnJheVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHYubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCF2W2ldLmxlbmd0aCAmJiAoIXNlZ21lbnRzLmxlbmd0aCB8fCAhc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCAmJiAhc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWdtZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWdtZW50cy5wdXNoKHZbaV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHYgfHwgdHlwZW9mIHYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXSA9PT0gJycpIHtcbiAgICAgICAgICAvLyBlbXB0eSB0cmFpbGluZyBlbGVtZW50cyBoYXZlIHRvIGJlIG92ZXJ3cml0dGVuXG4gICAgICAgICAgLy8gdG8gcHJldmVudCByZXN1bHRzIHN1Y2ggYXMgL2Zvby8vYmFyXG4gICAgICAgICAgc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0gPSB2O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZ21lbnRzLnB1c2godik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHYpIHtcbiAgICAgICAgc2VnbWVudHNbc2VnbWVudF0gPSB2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudHMuc3BsaWNlKHNlZ21lbnQsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgc2VnbWVudHMudW5zaGlmdCgnJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGF0aChzZWdtZW50cy5qb2luKHNlcGFyYXRvciksIGJ1aWxkKTtcbiAgfTtcbiAgcC5zZWdtZW50Q29kZWQgPSBmdW5jdGlvbiAoc2VnbWVudCwgdiwgYnVpbGQpIHtcbiAgICB2YXIgc2VnbWVudHMsIGksIGw7XG5cbiAgICBpZiAodHlwZW9mIHNlZ21lbnQgIT09ICdudW1iZXInKSB7XG4gICAgICBidWlsZCA9IHY7XG4gICAgICB2ID0gc2VnbWVudDtcbiAgICAgIHNlZ21lbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnQoc2VnbWVudCwgdiwgYnVpbGQpO1xuICAgICAgaWYgKCFpc0FycmF5KHNlZ21lbnRzKSkge1xuICAgICAgICBzZWdtZW50cyA9IHNlZ21lbnRzICE9PSB1bmRlZmluZWQgPyBVUkkuZGVjb2RlKHNlZ21lbnRzKSA6IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSBzZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBzZWdtZW50c1tpXSA9IFVSSS5kZWNvZGUoc2VnbWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICB9XG5cbiAgICBpZiAoIWlzQXJyYXkodikpIHtcbiAgICAgIHYgPSB0eXBlb2YgdiA9PT0gJ3N0cmluZycgfHwgdiBpbnN0YW5jZW9mIFN0cmluZyA/IFVSSS5lbmNvZGUodikgOiB2O1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gdi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdltpXSA9IFVSSS5lbmNvZGUodltpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2VnbWVudChzZWdtZW50LCB2LCBidWlsZCk7XG4gIH07XG5cbiAgLy8gbXV0YXRpbmcgcXVlcnkgc3RyaW5nXG4gIHZhciBxID0gcC5xdWVyeTtcbiAgcC5xdWVyeSA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh2ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgdmFyIHJlc3VsdCA9IHYuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkocmVzdWx0IHx8IGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKHYgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdiAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkodiwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcS5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgICB9XG4gIH07XG4gIHAuc2V0UXVlcnkgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIGJ1aWxkKSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG5cbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnIHx8IG5hbWUgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgIGRhdGFbbmFtZV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIGRhdGFba2V5XSA9IG5hbWVba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuYWRkUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlcicpO1xuICAgIH1cblxuICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkoZGF0YSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBidWlsZCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5hZGRRdWVyeSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgYnVpbGQpIHtcbiAgICB2YXIgZGF0YSA9IFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBVUkkuYWRkUXVlcnkoZGF0YSwgbmFtZSwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiB2YWx1ZSk7XG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLnJlbW92ZVF1ZXJ5ID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBidWlsZCkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIFVSSS5yZW1vdmVRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSk7XG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLmhhc1F1ZXJ5ID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCB3aXRoaW5BcnJheSkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIHJldHVybiBVUkkuaGFzUXVlcnkoZGF0YSwgbmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KTtcbiAgfTtcbiAgcC5zZXRTZWFyY2ggPSBwLnNldFF1ZXJ5O1xuICBwLmFkZFNlYXJjaCA9IHAuYWRkUXVlcnk7XG4gIHAucmVtb3ZlU2VhcmNoID0gcC5yZW1vdmVRdWVyeTtcbiAgcC5oYXNTZWFyY2ggPSBwLmhhc1F1ZXJ5O1xuXG4gIC8vIHNhbml0aXppbmcgVVJMc1xuICBwLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVQcm90b2NvbChmYWxzZSkubm9ybWFsaXplUGF0aChmYWxzZSkubm9ybWFsaXplUXVlcnkoZmFsc2UpLm5vcm1hbGl6ZUZyYWdtZW50KGZhbHNlKS5idWlsZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVByb3RvY29sKGZhbHNlKS5ub3JtYWxpemVIb3N0bmFtZShmYWxzZSkubm9ybWFsaXplUG9ydChmYWxzZSkubm9ybWFsaXplUGF0aChmYWxzZSkubm9ybWFsaXplUXVlcnkoZmFsc2UpLm5vcm1hbGl6ZUZyYWdtZW50KGZhbHNlKS5idWlsZCgpO1xuICB9O1xuICBwLm5vcm1hbGl6ZVByb3RvY29sID0gZnVuY3Rpb24gKGJ1aWxkKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl9wYXJ0cy5wcm90b2NvbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX3BhcnRzLnByb3RvY29sID0gdGhpcy5fcGFydHMucHJvdG9jb2wudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVIb3N0bmFtZSA9IGZ1bmN0aW9uIChidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgaWYgKHRoaXMuaXMoJ0lETicpICYmIHB1bnljb2RlKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXMoJ0lQdjYnKSAmJiBJUHY2KSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gSVB2Ni5iZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZVBvcnQgPSBmdW5jdGlvbiAoYnVpbGQpIHtcbiAgICAvLyByZW1vdmUgcG9ydCBvZiBpdCdzIHRoZSBwcm90b2NvbCdzIGRlZmF1bHRcbiAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzLnByb3RvY29sID09PSAnc3RyaW5nJyAmJiB0aGlzLl9wYXJ0cy5wb3J0ID09PSBVUkkuZGVmYXVsdFBvcnRzW3RoaXMuX3BhcnRzLnByb3RvY29sXSkge1xuICAgICAgdGhpcy5fcGFydHMucG9ydCA9IG51bGw7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplUGF0aCA9IGZ1bmN0aW9uIChidWlsZCkge1xuICAgIHZhciBfcGF0aCA9IHRoaXMuX3BhcnRzLnBhdGg7XG4gICAgaWYgKCFfcGF0aCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgdGhpcy5fcGFydHMucGF0aCA9IFVSSS5yZWNvZGVVcm5QYXRoKHRoaXMuX3BhcnRzLnBhdGgpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BhcnRzLnBhdGggPT09ICcvJykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIF93YXNfcmVsYXRpdmU7XG4gICAgdmFyIF9sZWFkaW5nUGFyZW50cyA9ICcnO1xuICAgIHZhciBfcGFyZW50LCBfcG9zO1xuXG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzXG4gICAgaWYgKF9wYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICBfd2FzX3JlbGF0aXZlID0gdHJ1ZTtcbiAgICAgIF9wYXRoID0gJy8nICsgX3BhdGg7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIGZpbGVzIChhcyBvcHBvc2VkIHRvIGRpcmVjdG9yaWVzKVxuICAgIGlmIChfcGF0aC5zbGljZSgtMykgPT09ICcvLi4nIHx8IF9wYXRoLnNsaWNlKC0yKSA9PT0gJy8uJykge1xuICAgICAgX3BhdGggKz0gJy8nO1xuICAgIH1cblxuICAgIC8vIHJlc29sdmUgc2ltcGxlc1xuICAgIF9wYXRoID0gX3BhdGgucmVwbGFjZSgvKFxcLyhcXC5cXC8pKyl8KFxcL1xcLiQpL2csICcvJykucmVwbGFjZSgvXFwvezIsfS9nLCAnLycpO1xuXG4gICAgLy8gcmVtZW1iZXIgbGVhZGluZyBwYXJlbnRzXG4gICAgaWYgKF93YXNfcmVsYXRpdmUpIHtcbiAgICAgIF9sZWFkaW5nUGFyZW50cyA9IF9wYXRoLnN1YnN0cmluZygxKS5tYXRjaCgvXihcXC5cXC5cXC8pKy8pIHx8ICcnO1xuICAgICAgaWYgKF9sZWFkaW5nUGFyZW50cykge1xuICAgICAgICBfbGVhZGluZ1BhcmVudHMgPSBfbGVhZGluZ1BhcmVudHNbMF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVzb2x2ZSBwYXJlbnRzXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIF9wYXJlbnQgPSBfcGF0aC5pbmRleE9mKCcvLi4nKTtcbiAgICAgIGlmIChfcGFyZW50ID09PSAtMSkge1xuICAgICAgICAvLyBubyBtb3JlIC4uLyB0byByZXNvbHZlXG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmIChfcGFyZW50ID09PSAwKSB7XG4gICAgICAgIC8vIHRvcCBsZXZlbCBjYW5ub3QgYmUgcmVsYXRpdmUsIHNraXAgaXRcbiAgICAgICAgX3BhdGggPSBfcGF0aC5zdWJzdHJpbmcoMyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBfcG9zID0gX3BhdGguc3Vic3RyaW5nKDAsIF9wYXJlbnQpLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICBpZiAoX3BvcyA9PT0gLTEpIHtcbiAgICAgICAgX3BvcyA9IF9wYXJlbnQ7XG4gICAgICB9XG4gICAgICBfcGF0aCA9IF9wYXRoLnN1YnN0cmluZygwLCBfcG9zKSArIF9wYXRoLnN1YnN0cmluZyhfcGFyZW50ICsgMyk7XG4gICAgfVxuXG4gICAgLy8gcmV2ZXJ0IHRvIHJlbGF0aXZlXG4gICAgaWYgKF93YXNfcmVsYXRpdmUgJiYgdGhpcy5pcygncmVsYXRpdmUnKSkge1xuICAgICAgX3BhdGggPSBfbGVhZGluZ1BhcmVudHMgKyBfcGF0aC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgX3BhdGggPSBVUkkucmVjb2RlUGF0aChfcGF0aCk7XG4gICAgdGhpcy5fcGFydHMucGF0aCA9IF9wYXRoO1xuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVQYXRobmFtZSA9IHAubm9ybWFsaXplUGF0aDtcbiAgcC5ub3JtYWxpemVRdWVyeSA9IGZ1bmN0aW9uIChidWlsZCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucXVlcnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnF1ZXJ5Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnF1ZXJ5KFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVGcmFnbWVudCA9IGZ1bmN0aW9uIChidWlsZCkge1xuICAgIGlmICghdGhpcy5fcGFydHMuZnJhZ21lbnQpIHtcbiAgICAgIHRoaXMuX3BhcnRzLmZyYWdtZW50ID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVTZWFyY2ggPSBwLm5vcm1hbGl6ZVF1ZXJ5O1xuICBwLm5vcm1hbGl6ZUhhc2ggPSBwLm5vcm1hbGl6ZUZyYWdtZW50O1xuXG4gIHAuaXNvODg1OSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBleHBlY3QgdW5pY29kZSBpbnB1dCwgaXNvODg1OSBvdXRwdXRcbiAgICB2YXIgZSA9IFVSSS5lbmNvZGU7XG4gICAgdmFyIGQgPSBVUkkuZGVjb2RlO1xuXG4gICAgVVJJLmVuY29kZSA9IGVzY2FwZTtcbiAgICBVUkkuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuICAgIHRyeSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBVUkkuZW5jb2RlID0gZTtcbiAgICAgIFVSSS5kZWNvZGUgPSBkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBwLnVuaWNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXhwZWN0IGlzbzg4NTkgaW5wdXQsIHVuaWNvZGUgb3V0cHV0XG4gICAgdmFyIGUgPSBVUkkuZW5jb2RlO1xuICAgIHZhciBkID0gVVJJLmRlY29kZTtcblxuICAgIFVSSS5lbmNvZGUgPSBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQ7XG4gICAgVVJJLmRlY29kZSA9IHVuZXNjYXBlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBVUkkuZW5jb2RlID0gZTtcbiAgICAgIFVSSS5kZWNvZGUgPSBkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBwLnJlYWRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1cmkgPSB0aGlzLmNsb25lKCk7XG4gICAgLy8gcmVtb3ZpbmcgdXNlcm5hbWUsIHBhc3N3b3JkLCBiZWNhdXNlIHRoZXkgc2hvdWxkbid0IGJlIGRpc3BsYXllZCBhY2NvcmRpbmcgdG8gUkZDIDM5ODZcbiAgICB1cmkudXNlcm5hbWUoJycpLnBhc3N3b3JkKCcnKS5ub3JtYWxpemUoKTtcbiAgICB2YXIgdCA9ICcnO1xuICAgIGlmICh1cmkuX3BhcnRzLnByb3RvY29sKSB7XG4gICAgICB0ICs9IHVyaS5fcGFydHMucHJvdG9jb2wgKyAnOi8vJztcbiAgICB9XG5cbiAgICBpZiAodXJpLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgaWYgKHVyaS5pcygncHVueWNvZGUnKSAmJiBwdW55Y29kZSkge1xuICAgICAgICB0ICs9IHB1bnljb2RlLnRvVW5pY29kZSh1cmkuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgICAgaWYgKHVyaS5fcGFydHMucG9ydCkge1xuICAgICAgICAgIHQgKz0gJzonICsgdXJpLl9wYXJ0cy5wb3J0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ICs9IHVyaS5ob3N0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHVyaS5fcGFydHMuaG9zdG5hbWUgJiYgdXJpLl9wYXJ0cy5wYXRoICYmIHVyaS5fcGFydHMucGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdCArPSAnLyc7XG4gICAgfVxuXG4gICAgdCArPSB1cmkucGF0aCh0cnVlKTtcbiAgICBpZiAodXJpLl9wYXJ0cy5xdWVyeSkge1xuICAgICAgdmFyIHEgPSAnJztcbiAgICAgIGZvciAodmFyIGkgPSAwLCBxcCA9IHVyaS5fcGFydHMucXVlcnkuc3BsaXQoJyYnKSwgbCA9IHFwLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga3YgPSAocXBbaV0gfHwgJycpLnNwbGl0KCc9Jyk7XG4gICAgICAgIHEgKz0gJyYnICsgVVJJLmRlY29kZVF1ZXJ5KGt2WzBdLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKS5yZXBsYWNlKC8mL2csICclMjYnKTtcblxuICAgICAgICBpZiAoa3ZbMV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHEgKz0gJz0nICsgVVJJLmRlY29kZVF1ZXJ5KGt2WzFdLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKS5yZXBsYWNlKC8mL2csICclMjYnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdCArPSAnPycgKyBxLnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICB0ICs9IFVSSS5kZWNvZGVRdWVyeSh1cmkuaGFzaCgpLCB0cnVlKTtcbiAgICByZXR1cm4gdDtcbiAgfTtcblxuICAvLyByZXNvbHZpbmcgcmVsYXRpdmUgYW5kIGFic29sdXRlIFVSTHNcbiAgcC5hYnNvbHV0ZVRvID0gZnVuY3Rpb24gKGJhc2UpIHtcbiAgICB2YXIgcmVzb2x2ZWQgPSB0aGlzLmNsb25lKCk7XG4gICAgdmFyIHByb3BlcnRpZXMgPSBbJ3Byb3RvY29sJywgJ3VzZXJuYW1lJywgJ3Bhc3N3b3JkJywgJ2hvc3RuYW1lJywgJ3BvcnQnXTtcbiAgICB2YXIgYmFzZWRpciwgaSwgcDtcblxuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVVJOcyBkbyBub3QgaGF2ZSBhbnkgZ2VuZXJhbGx5IGRlZmluZWQgaGllcmFyY2hpY2FsIGNvbXBvbmVudHMnKTtcbiAgICB9XG5cbiAgICBpZiAoIShiYXNlIGluc3RhbmNlb2YgVVJJKSkge1xuICAgICAgYmFzZSA9IG5ldyBVUkkoYmFzZSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvbHZlZC5fcGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wcm90b2NvbCA9IGJhc2UuX3BhcnRzLnByb3RvY29sO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IHAgPSBwcm9wZXJ0aWVzW2ldOyBpKyspIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0c1twXSA9IGJhc2UuX3BhcnRzW3BdO1xuICAgIH1cblxuICAgIGlmICghcmVzb2x2ZWQuX3BhcnRzLnBhdGgpIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wYXRoID0gYmFzZS5fcGFydHMucGF0aDtcbiAgICAgIGlmICghcmVzb2x2ZWQuX3BhcnRzLnF1ZXJ5KSB7XG4gICAgICAgIHJlc29sdmVkLl9wYXJ0cy5xdWVyeSA9IGJhc2UuX3BhcnRzLnF1ZXJ5O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmVzb2x2ZWQuX3BhcnRzLnBhdGguc3Vic3RyaW5nKC0yKSA9PT0gJy4uJykge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnBhdGggKz0gJy8nO1xuICAgIH1cblxuICAgIGlmIChyZXNvbHZlZC5wYXRoKCkuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIGJhc2VkaXIgPSBiYXNlLmRpcmVjdG9yeSgpO1xuICAgICAgYmFzZWRpciA9IGJhc2VkaXIgPyBiYXNlZGlyIDogYmFzZS5wYXRoKCkuaW5kZXhPZignLycpID09PSAwID8gJy8nIDogJyc7XG4gICAgICByZXNvbHZlZC5fcGFydHMucGF0aCA9IChiYXNlZGlyID8gYmFzZWRpciArICcvJyA6ICcnKSArIHJlc29sdmVkLl9wYXJ0cy5wYXRoO1xuICAgICAgcmVzb2x2ZWQubm9ybWFsaXplUGF0aCgpO1xuICAgIH1cblxuICAgIHJlc29sdmVkLmJ1aWxkKCk7XG4gICAgcmV0dXJuIHJlc29sdmVkO1xuICB9O1xuICBwLnJlbGF0aXZlVG8gPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgIHZhciByZWxhdGl2ZSA9IHRoaXMuY2xvbmUoKS5ub3JtYWxpemUoKTtcbiAgICB2YXIgcmVsYXRpdmVQYXJ0cywgYmFzZVBhcnRzLCBjb21tb24sIHJlbGF0aXZlUGF0aCwgYmFzZVBhdGg7XG5cbiAgICBpZiAocmVsYXRpdmUuX3BhcnRzLnVybikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVUk5zIGRvIG5vdCBoYXZlIGFueSBnZW5lcmFsbHkgZGVmaW5lZCBoaWVyYXJjaGljYWwgY29tcG9uZW50cycpO1xuICAgIH1cblxuICAgIGJhc2UgPSBuZXcgVVJJKGJhc2UpLm5vcm1hbGl6ZSgpO1xuICAgIHJlbGF0aXZlUGFydHMgPSByZWxhdGl2ZS5fcGFydHM7XG4gICAgYmFzZVBhcnRzID0gYmFzZS5fcGFydHM7XG4gICAgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmUucGF0aCgpO1xuICAgIGJhc2VQYXRoID0gYmFzZS5wYXRoKCk7XG5cbiAgICBpZiAocmVsYXRpdmVQYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VSSSBpcyBhbHJlYWR5IHJlbGF0aXZlJyk7XG4gICAgfVxuXG4gICAgaWYgKGJhc2VQYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjYWxjdWxhdGUgYSBVUkkgcmVsYXRpdmUgdG8gYW5vdGhlciByZWxhdGl2ZSBVUkknKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy5wcm90b2NvbCA9PT0gYmFzZVBhcnRzLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZVBhcnRzLnByb3RvY29sID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy51c2VybmFtZSAhPT0gYmFzZVBhcnRzLnVzZXJuYW1lIHx8IHJlbGF0aXZlUGFydHMucGFzc3dvcmQgIT09IGJhc2VQYXJ0cy5wYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMucHJvdG9jb2wgIT09IG51bGwgfHwgcmVsYXRpdmVQYXJ0cy51c2VybmFtZSAhPT0gbnVsbCB8fCByZWxhdGl2ZVBhcnRzLnBhc3N3b3JkICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy5ob3N0bmFtZSA9PT0gYmFzZVBhcnRzLmhvc3RuYW1lICYmIHJlbGF0aXZlUGFydHMucG9ydCA9PT0gYmFzZVBhcnRzLnBvcnQpIHtcbiAgICAgIHJlbGF0aXZlUGFydHMuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmVQYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGF0aCA9PT0gYmFzZVBhdGgpIHtcbiAgICAgIHJlbGF0aXZlUGFydHMucGF0aCA9ICcnO1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgLy8gZGV0ZXJtaW5lIGNvbW1vbiBzdWIgcGF0aFxuICAgIGNvbW1vbiA9IFVSSS5jb21tb25QYXRoKHJlbGF0aXZlUGF0aCwgYmFzZVBhdGgpO1xuXG4gICAgLy8gSWYgdGhlIHBhdGhzIGhhdmUgbm90aGluZyBpbiBjb21tb24sIHJldHVybiBhIHJlbGF0aXZlIFVSTCB3aXRoIHRoZSBhYnNvbHV0ZSBwYXRoLlxuICAgIGlmICghY29tbW9uKSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICB2YXIgcGFyZW50cyA9IGJhc2VQYXJ0cy5wYXRoLnN1YnN0cmluZyhjb21tb24ubGVuZ3RoKS5yZXBsYWNlKC9bXlxcL10qJC8sICcnKS5yZXBsYWNlKC8uKj9cXC8vZywgJy4uLycpO1xuXG4gICAgcmVsYXRpdmVQYXJ0cy5wYXRoID0gcGFyZW50cyArIHJlbGF0aXZlUGFydHMucGF0aC5zdWJzdHJpbmcoY29tbW9uLmxlbmd0aCkgfHwgJy4vJztcblxuICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICB9O1xuXG4gIC8vIGNvbXBhcmluZyBVUklzXG4gIHAuZXF1YWxzID0gZnVuY3Rpb24gKHVyaSkge1xuICAgIHZhciBvbmUgPSB0aGlzLmNsb25lKCk7XG4gICAgdmFyIHR3byA9IG5ldyBVUkkodXJpKTtcbiAgICB2YXIgb25lX21hcCA9IHt9O1xuICAgIHZhciB0d29fbWFwID0ge307XG4gICAgdmFyIGNoZWNrZWQgPSB7fTtcbiAgICB2YXIgb25lX3F1ZXJ5LCB0d29fcXVlcnksIGtleTtcblxuICAgIG9uZS5ub3JtYWxpemUoKTtcbiAgICB0d28ubm9ybWFsaXplKCk7XG5cbiAgICAvLyBleGFjdCBtYXRjaFxuICAgIGlmIChvbmUudG9TdHJpbmcoKSA9PT0gdHdvLnRvU3RyaW5nKCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGV4dHJhY3QgcXVlcnkgc3RyaW5nXG4gICAgb25lX3F1ZXJ5ID0gb25lLnF1ZXJ5KCk7XG4gICAgdHdvX3F1ZXJ5ID0gdHdvLnF1ZXJ5KCk7XG4gICAgb25lLnF1ZXJ5KCcnKTtcbiAgICB0d28ucXVlcnkoJycpO1xuXG4gICAgLy8gZGVmaW5pdGVseSBub3QgZXF1YWwgaWYgbm90IGV2ZW4gbm9uLXF1ZXJ5IHBhcnRzIG1hdGNoXG4gICAgaWYgKG9uZS50b1N0cmluZygpICE9PSB0d28udG9TdHJpbmcoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHF1ZXJ5IHBhcmFtZXRlcnMgaGF2ZSB0aGUgc2FtZSBsZW5ndGgsIGV2ZW4gaWYgdGhleSdyZSBwZXJtdXRlZFxuICAgIGlmIChvbmVfcXVlcnkubGVuZ3RoICE9PSB0d29fcXVlcnkubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgb25lX21hcCA9IFVSSS5wYXJzZVF1ZXJ5KG9uZV9xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgdHdvX21hcCA9IFVSSS5wYXJzZVF1ZXJ5KHR3b19xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG5cbiAgICBmb3IgKGtleSBpbiBvbmVfbWFwKSB7XG4gICAgICBpZiAoaGFzT3duLmNhbGwob25lX21hcCwga2V5KSkge1xuICAgICAgICBpZiAoIWlzQXJyYXkob25lX21hcFtrZXldKSkge1xuICAgICAgICAgIGlmIChvbmVfbWFwW2tleV0gIT09IHR3b19tYXBba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghYXJyYXlzRXF1YWwob25lX21hcFtrZXldLCB0d29fbWFwW2tleV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hlY2tlZFtrZXldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGtleSBpbiB0d29fbWFwKSB7XG4gICAgICBpZiAoaGFzT3duLmNhbGwodHdvX21hcCwga2V5KSkge1xuICAgICAgICBpZiAoIWNoZWNrZWRba2V5XSkge1xuICAgICAgICAgIC8vIHR3byBjb250YWlucyBhIHBhcmFtZXRlciBub3QgcHJlc2VudCBpbiBvbmVcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBzdGF0ZVxuICBwLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gISF2O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAuZXNjYXBlUXVlcnlTcGFjZSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSA9ICEhdjtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gVVJJO1xufSk7IiwiLyohIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjIuMyBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbiAocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG4gICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuICAqIEBuYW1lIHB1bnljb2RlXG4gICogQHR5cGUgT2JqZWN0XG4gICovXG5cdHZhciBwdW55Y29kZSxcblx0ICAgXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LFxuXHQgICAgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHQgICAgdE1pbiA9IDEsXG5cdCAgICB0TWF4ID0gMjYsXG5cdCAgICBza2V3ID0gMzgsXG5cdCAgICBkYW1wID0gNzAwLFxuXHQgICAgaW5pdGlhbEJpYXMgPSA3Mixcblx0ICAgIGluaXRpYWxOID0gMTI4LFxuXHQgICAgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsXG5cdCAgICAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdCAgICByZWdleE5vbkFTQ0lJID0gL1teIC1+XS8sXG5cdCAgICAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvXFx4MkV8XFx1MzAwMnxcXHVGRjBFfFxcdUZGNjEvZyxcblx0ICAgIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXHQgICBcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0ICAgIGZsb29yID0gTWF0aC5mbG9vcixcblx0ICAgIHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cdCAgIFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuICAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuICAqIEBwcml2YXRlXG4gICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG4gICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuICAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG4gICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuICAqIGl0ZW0uXG4gICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdGFycmF5W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFycmF5O1xuXHR9XG5cblx0LyoqXG4gICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzLlxuICAqIEBwcml2YXRlXG4gICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUuXG4gICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG4gICogY2hhcmFjdGVyLlxuICAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG4gICogZnVuY3Rpb24uXG4gICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0cmV0dXJuIG1hcChzdHJpbmcuc3BsaXQocmVnZXhTZXBhcmF0b3JzKSwgZm4pLmpvaW4oJy4nKTtcblx0fVxuXG5cdC8qKlxuICAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcbiAgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG4gICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcbiAgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcbiAgKiBtYXRjaGluZyBVVEYtMTYuXG4gICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG4gICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuICAqIEBuYW1lIGRlY29kZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG4gICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuICAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHtcblx0XHRcdFx0XHQvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuICAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cbiAgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcbiAgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuICAqIEBuYW1lIGVuY29kZVxuICAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG4gICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuICAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuICAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cbiAgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cbiAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cbiAgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG4gICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG4gICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuICAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cbiAgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG4gICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3JcbiAgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuICAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuICAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG4gICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cbiAgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG4gICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cbiAgKiBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG4gICogQHByaXZhdGVcbiAgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuICAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG4gICogc3ltYm9scy5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG4gICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuICAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgbGVuZ3RoLFxuXHRcdCAgIFxuXHRcdC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7KSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTs7IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiBrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcbiAgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgdG8gYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seVxuICAqIHN5bWJvbHMuXG4gICogQG1lbWJlck9mIHB1bnljb2RlXG4gICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cbiAgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgXG5cdFx0LyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHRpbnB1dExlbmd0aCxcblx0XHQgICBcblx0XHQvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7OyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcztcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSkpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG4gICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgdG8gVW5pY29kZS4gT25seSB0aGVcbiAgKiBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLCBpLmUuIGl0IGRvZXNuJ3RcbiAgKiBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNvbnZlcnRlZCB0b1xuICAqIFVuaWNvZGUuXG4gICogQG1lbWJlck9mIHB1bnljb2RlXG4gICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgUHVueWNvZGUgZG9tYWluIG5hbWUgdG8gY29udmVydCB0byBVbmljb2RlLlxuICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuICAqIHN0cmluZy5cbiAgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGRvbWFpbikge1xuXHRcdHJldHVybiBtYXBEb21haW4oZG9tYWluLCBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZykgPyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpIDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG4gICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSB0byBQdW55Y29kZS4gT25seSB0aGVcbiAgKiBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLCBpLmUuIGl0IGRvZXNuJ3RcbiAgKiBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpbiBBU0NJSS5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSB0byBjb252ZXJ0LCBhcyBhIFVuaWNvZGUgc3RyaW5nLlxuICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUuXG4gICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoZG9tYWluKSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihkb21haW4sIGZ1bmN0aW9uIChzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKSA/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpIDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcbiAgICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuICAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgICogQHR5cGUgU3RyaW5nXG4gICAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuMi4zJyxcblx0XHQvKipcbiAgICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcbiAgICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cbiAgICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cbiAgICogQG1lbWJlck9mIHB1bnljb2RlXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cbn0pKHRoaXMpO1xuLyogbm8gaW5pdGlhbGl6YXRpb24gKi8gLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLyAvKiBubyBjb25kaXRpb24gKi8gLyogbm8gY29uZGl0aW9uICovIiwiT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX2hlbHBlcnNBcnJheUhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMvYXJyYXktaGVscGVycycpO1xuXG4vKlxuKiBFdmVudFRhcmdldCBpcyBhbiBpbnRlcmZhY2UgaW1wbGVtZW50ZWQgYnkgb2JqZWN0cyB0aGF0IGNhblxuKiByZWNlaXZlIGV2ZW50cyBhbmQgbWF5IGhhdmUgbGlzdGVuZXJzIGZvciB0aGVtLlxuKlxuKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXRcbiovXG5cbnZhciBFdmVudFRhcmdldCA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEV2ZW50VGFyZ2V0KCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFdmVudFRhcmdldCk7XG5cbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEV2ZW50VGFyZ2V0LCBbe1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuXG4gICAgLypcbiAgICAqIFRpZXMgYSBsaXN0ZW5lciBmdW5jdGlvbiB0byBhIGV2ZW50IHR5cGUgd2hpY2ggY2FuIGxhdGVyIGJlIGludm9rZWQgdmlhIHRoZVxuICAgICogZGlzcGF0Y2hFdmVudCBtZXRob2QuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBldmVudCAoaWU6ICdvcGVuJywgJ21lc3NhZ2UnLCBldGMuKVxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgLSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW5ldmVyIGEgZXZlbnQgaXMgZGlzcGF0Y2hlZCBtYXRjaGluZyB0aGUgZ2l2ZW4gdHlwZVxuICAgICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlIC0gTi9BIFRPRE86IGltcGxlbWVudCB1c2VDYXB0dXJlIGZ1bmN0aW9uYWxsaXR5XG4gICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciAvKiwgdXNlQ2FwdHVyZSAqLykge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpc3RlbmVyc1t0eXBlXSkpIHtcbiAgICAgICAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG5cbiAgICAvKlxuICAgICogUmVtb3ZlcyB0aGUgbGlzdGVuZXIgc28gaXQgd2lsbCBubyBsb25nZXIgYmUgaW52b2tlZCB2aWEgdGhlIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZXZlbnQgKGllOiAnb3BlbicsICdtZXNzYWdlJywgZXRjLilcbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuZXZlciBhIGV2ZW50IGlzIGRpc3BhdGNoZWQgbWF0Y2hpbmcgdGhlIGdpdmVuIHR5cGVcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZSAtIE4vQSBUT0RPOiBpbXBsZW1lbnQgdXNlQ2FwdHVyZSBmdW5jdGlvbmFsbGl0eVxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgcmVtb3ZpbmdMaXN0ZW5lciAvKiwgdXNlQ2FwdHVyZSAqLykge1xuICAgICAgdmFyIGFycmF5T2ZMaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1t0eXBlXTtcbiAgICAgIHRoaXMubGlzdGVuZXJzW3R5cGVdID0gKDAsIF9oZWxwZXJzQXJyYXlIZWxwZXJzLnJlamVjdCkoYXJyYXlPZkxpc3RlbmVycywgZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lciA9PT0gcmVtb3ZpbmdMaXN0ZW5lcjtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2Rpc3BhdGNoRXZlbnQnLFxuXG4gICAgLypcbiAgICAqIEludm9rZXMgYWxsIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IGFyZSBsaXN0ZW5pbmcgdG8gdGhlIGdpdmVuIGV2ZW50LnR5cGUgcHJvcGVydHkuIEVhY2hcbiAgICAqIGxpc3RlbmVyIHdpbGwgYmUgcGFzc2VkIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgKlxuICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gZXZlbnQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIGFsbCBsaXN0ZW5lcnMgb2YgdGhlIGV2ZW50LnR5cGUgcHJvcGVydHlcbiAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50LCBjdXN0b21Bcmd1bWVudCkge1xuICAgICAgdmFyIGV2ZW50TmFtZSA9IGV2ZW50LnR5cGU7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnROYW1lXTtcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGN1c3RvbUFyZ3VtZW50KSB7XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbChudWxsLCBjdXN0b21Bcmd1bWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbChudWxsLCBldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFdmVudFRhcmdldDtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEV2ZW50VGFyZ2V0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vKlxuKlxuKi9cbmZ1bmN0aW9uIGV4dGVuZEV2ZW50KGV2ZW50LCB0YXJnZXQpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZXZlbnQsIHtcbiAgICB0YXJnZXQ6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBzcmNFbGVtZW50OiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgY3VycmVudFRhcmdldDoge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICBldmVudC50YXJnZXQgPSB0YXJnZXQ7XG4gICAgZXZlbnQuc3JjRWxlbWVudCA9IHRhcmdldDtcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIGV2ZW50O1xufVxuXG4vKlxuKlxuKiBAcGFyYW0gZXZlbnRUeXBlIGNhbiBiZSBFdmVudCBvciBNZXNzYWdlRXZlbnRcbiovXG5mdW5jdGlvbiBjcmVhdGVFdmVudChjb25maWcpIHtcbiAgdmFyIHR5cGUgPSBjb25maWcudHlwZTtcbiAgdmFyIHRhcmdldCA9IGNvbmZpZy50YXJnZXQ7XG5cbiAgaWYgKCF0eXBlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBzcGVjaWZ5IGFuIGV2ZW50IHR5cGUnKTtcbiAgfVxuXG4gIHZhciBldmVudCA9IG5ldyB3aW5kb3cuRXZlbnQodHlwZSk7XG5cbiAgaWYgKCFldmVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXZlbnQgaXMgbm90IGRlZmluZWQgaW4gdGhpcyBlbnZpb3JubWVudCcpO1xuICB9XG5cbiAgcmV0dXJuIGV4dGVuZEV2ZW50KGV2ZW50LCB0YXJnZXQpO1xufVxuXG4vKlxuKlxuKi9cbmZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VFdmVudChjb25maWcpIHtcbiAgdmFyIHR5cGUgPSBjb25maWcudHlwZTtcbiAgdmFyIG9yaWdpbiA9IGNvbmZpZy5vcmlnaW47XG4gIHZhciBkYXRhID0gY29uZmlnLmRhdGE7XG4gIHZhciB0YXJnZXQgPSBjb25maWcudGFyZ2V0O1xuXG4gIHZhciBtZXNzYWdlRXZlbnQgPSBuZXcgd2luZG93Lk1lc3NhZ2VFdmVudCh0eXBlKTtcblxuICBpZiAoIW1lc3NhZ2VFdmVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZUV2ZW50IGlzIG5vdCBkZWZpbmVkIGluIHRoaXMgZW52aW9ybm1lbnQnKTtcbiAgfVxuXG4gIGlmICghdHlwZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignWW91IG11c3Qgc3BlY2lmeSBhbiBldmVudCB0eXBlJyk7XG4gIH1cblxuICBleHRlbmRFdmVudChtZXNzYWdlRXZlbnQsIHRhcmdldCk7XG4gIG1lc3NhZ2VFdmVudC5pbml0TWVzc2FnZUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgZGF0YSwgb3JpZ2luLCBudWxsKTtcbiAgcmV0dXJuIG1lc3NhZ2VFdmVudDtcbn1cblxuZXhwb3J0cy5jcmVhdGVFdmVudCA9IGNyZWF0ZUV2ZW50O1xuZXhwb3J0cy5jcmVhdGVNZXNzYWdlRXZlbnQgPSBjcmVhdGVNZXNzYWdlRXZlbnQ7IiwiT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmVqZWN0ID0gcmVqZWN0O1xuXG5mdW5jdGlvbiByZWplY3QoYXJyYXksIGNhbGxiYWNrKSB7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW1JbkFycmF5KSB7XG4gICAgaWYgKCFjYWxsYmFjayhpdGVtSW5BcnJheSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChpdGVtSW5BcnJheSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVzdWx0cztcbn0iLCJPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuLypcbiogVGhpcyBkZWxheSBhbGxvd3MgdGhlIHRocmVhZCB0byBmaW5pc2ggYXNzaWduaW5nIGl0cyBvbiogbWV0aG9kc1xuKiBiZWZvcmUgaW52b2tpbmcgdGhlIGRlbGF5IGNhbGxiYWNrLiBUaGlzIGlzIHB1cmVseSBhIHRpbWluZyBoYWNrLlxuKiBodHRwOi8vZ2Vla2FieXRlLmJsb2dzcG90LmNvbS8yMDE0LzAxL2phdmFzY3JpcHQtZWZmZWN0LW9mLXNldHRpbmctc2V0dGltZW91dC5odG1sXG4qXG4qIEBwYXJhbSB7Y2FsbGJhY2s6IGZ1bmN0aW9ufSB0aGUgY2FsbGJhY2sgd2hpY2ggd2lsbCBiZSBpbnZva2VkIGFmdGVyIHRoZSB0aW1lb3V0XG4qIEBwYXJtYSB7Y29udGV4dDogb2JqZWN0fSB0aGUgY29udGV4dCBpbiB3aGljaCB0byBpbnZva2UgdGhlIGZ1bmN0aW9uXG4qL1xuZnVuY3Rpb24gZGVsYXkoY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgc2V0VGltZW91dChmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGNhbGxiYWNrLmNhbGwoY29udGV4dCk7XG4gIH0sIDQsIGNvbnRleHQpO1xufVxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGRlbGF5O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCJPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3NlcnZlciA9IHJlcXVpcmUoJy4vc2VydmVyJyk7XG5cbnZhciBfc2VydmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NlcnZlcik7XG5cbnZhciBfd2Vic29ja2V0ID0gcmVxdWlyZSgnLi93ZWJzb2NrZXQnKTtcblxudmFyIF93ZWJzb2NrZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2Vic29ja2V0KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0ge1xuICBXZWJTb2NrZXQ6IF93ZWJzb2NrZXQyWydkZWZhdWx0J10sXG4gIFNlcnZlcjogX3NlcnZlcjJbJ2RlZmF1bHQnXVxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9oZWxwZXJzQXJyYXlIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2FycmF5LWhlbHBlcnMnKTtcblxuLypcbipcbiovXG5cbnZhciBOZXR3b3JrQnJpZGdlID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTmV0d29ya0JyaWRnZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTmV0d29ya0JyaWRnZSk7XG5cbiAgICB0aGlzLnVybE1hcCA9IHt9O1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE5ldHdvcmtCcmlkZ2UsIFt7XG4gICAga2V5OiAnYXR0YWNoV2ViU29ja2V0JyxcblxuICAgIC8qXG4gICAgKiBBdHRhY2hlcyBhIHdlYnNvY2tldCBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgdGhlIHNlcnZlclxuICAgICogaXQgaXMgY29ubmVjdGVkIHRvIGFuZCB0aGUgc2VydmVyIGluIHR1cm4gY2FuIGZpbmQgaXQuXG4gICAgKlxuICAgICogQHBhcmFtIHtvYmplY3R9IHdlYnNvY2tldCAtIHdlYnNvY2tldCBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGF0dGFjaFdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCAmJiBjb25uZWN0aW9uTG9va3VwLnNlcnZlcikge1xuXG4gICAgICAgIGlmIChjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMuaW5kZXhPZih3ZWJzb2NrZXQpID09PSAtMSkge1xuICAgICAgICAgIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cy5wdXNoKHdlYnNvY2tldCk7XG4gICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb25Mb29rdXAuc2VydmVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnYXR0YWNoU2VydmVyJyxcblxuICAgIC8qXG4gICAgKiBBdHRhY2hlcyBhIHNlcnZlciBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgYSB3ZWJzb2NrZXRzXG4gICAgKiB3aGljaCBhcmUgY29ubmVjdGVkIHRvIGl0IGFuZCBzbyB0aGF0IHdlYnNvY2tldHMgY2FuIGluIHR1cm4gY2FuIGZpbmQgaXQuXG4gICAgKlxuICAgICogQHBhcmFtIHtvYmplY3R9IHNlcnZlciAtIHNlcnZlciBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGF0dGFjaFNlcnZlcihzZXJ2ZXIsIHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoIWNvbm5lY3Rpb25Mb29rdXApIHtcblxuICAgICAgICB0aGlzLnVybE1hcFt1cmxdID0ge1xuICAgICAgICAgIHNlcnZlcjogc2VydmVyLFxuICAgICAgICAgIHdlYnNvY2tldHM6IFtdXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHNlcnZlcjtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXJ2ZXJMb29rdXAnLFxuXG4gICAgLypcbiAgICAqIEZpbmRzIHRoZSBzZXJ2ZXIgd2hpY2ggaXMgJ3J1bm5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgdG8gdXNlIHRvIGZpbmQgd2hpY2ggc2VydmVyIGlzIHJ1bm5pbmcgb24gaXRcbiAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXJ2ZXJMb29rdXAodXJsKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICAgIGlmIChjb25uZWN0aW9uTG9va3VwKSB7XG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uTG9va3VwLnNlcnZlcjtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICd3ZWJzb2NrZXRzTG9va3VwJyxcblxuICAgIC8qXG4gICAgKiBGaW5kcyBhbGwgd2Vic29ja2V0cyB3aGljaCBpcyAnbGlzdGVuaW5nJyBvbiB0aGUgZ2l2ZW4gdXJsLlxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSB0aGUgdXJsIHRvIHVzZSB0byBmaW5kIGFsbCB3ZWJzb2NrZXRzIHdoaWNoIGFyZSBhc3NvY2lhdGVkIHdpdGggaXRcbiAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiB3ZWJzb2NrZXRzTG9va3VwKHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlU2VydmVyJyxcblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIHRoZSBlbnRyeSBhc3NvY2lhdGVkIHdpdGggdGhlIHVybC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlU2VydmVyKHVybCkge1xuICAgICAgZGVsZXRlIHRoaXMudXJsTWFwW3VybF07XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlV2ViU29ja2V0JyxcblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIHRoZSBpbmRpdmlkdWFsIHdlYnNvY2tldCBmcm9tIHRoZSBtYXAgb2YgYXNzb2NpYXRlZCB3ZWJzb2NrZXRzLlxuICAgICpcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSB3ZWJzb2NrZXQgLSB3ZWJzb2NrZXQgb2JqZWN0IHRvIHJlbW92ZSBmcm9tIHRoZSB1cmwgbWFwXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlV2ViU29ja2V0KHdlYnNvY2tldCwgdXJsKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICAgIGlmIChjb25uZWN0aW9uTG9va3VwKSB7XG4gICAgICAgIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cyA9ICgwLCBfaGVscGVyc0FycmF5SGVscGVycy5yZWplY3QpKGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cywgZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICAgIHJldHVybiBzb2NrZXQgPT09IHdlYnNvY2tldDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE5ldHdvcmtCcmlkZ2U7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBuZXcgTmV0d29ya0JyaWRnZSgpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBkZXNjID0gcGFyZW50ID0gZ2V0dGVyID0gdW5kZWZpbmVkOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX1VSSUpzID0gcmVxdWlyZSgnLi4vVVJJLmpzJyk7XG5cbnZhciBfVVJJSnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVVJJSnMpO1xuXG52YXIgX3dlYnNvY2tldCA9IHJlcXVpcmUoJy4vd2Vic29ja2V0Jyk7XG5cbnZhciBfd2Vic29ja2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dlYnNvY2tldCk7XG5cbnZhciBfZXZlbnRUYXJnZXQgPSByZXF1aXJlKCcuL2V2ZW50LXRhcmdldCcpO1xuXG52YXIgX2V2ZW50VGFyZ2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2V2ZW50VGFyZ2V0KTtcblxudmFyIF9uZXR3b3JrQnJpZGdlID0gcmVxdWlyZSgnLi9uZXR3b3JrLWJyaWRnZScpO1xuXG52YXIgX25ldHdvcmtCcmlkZ2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbmV0d29ya0JyaWRnZSk7XG5cbnZhciBfZmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yeScpO1xuXG4vKlxuKlxuKi9cblxudmFyIFNlcnZlciA9IChmdW5jdGlvbiAoX0V2ZW50VGFyZ2V0KSB7XG4gIF9pbmhlcml0cyhTZXJ2ZXIsIF9FdmVudFRhcmdldCk7XG5cbiAgLypcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG5cbiAgZnVuY3Rpb24gU2VydmVyKHVybCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTZXJ2ZXIpO1xuXG4gICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoU2VydmVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG4gICAgdGhpcy51cmwgPSAoMCwgX1VSSUpzMlsnZGVmYXVsdCddKSh1cmwpLnRvU3RyaW5nKCk7XG4gICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFNlcnZlcih0aGlzLCB0aGlzLnVybCk7XG5cbiAgICBpZiAoIXNlcnZlcikge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnZXJyb3InIH0pKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoU2VydmVyLCBbe1xuICAgIGtleTogJ29uJyxcblxuICAgIC8qXG4gICAgKiBUaGlzIGlzIHRoZSBtYWluIGZ1bmN0aW9uIGZvciB0aGUgbW9jayBzZXJ2ZXIgdG8gc3Vic2NyaWJlIHRvIHRoZSBvbiBldmVudHMuXG4gICAgKlxuICAgICogaWU6IG1vY2tTZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ2EgbW9jayBjbGllbnQgY29ubmVjdGVkJyk7IH0pO1xuICAgICpcbiAgICAqIEBwYXJhbSB7dHlwZTogc3RyaW5nfTogVGhlIGV2ZW50IGtleSB0byBzdWJzY3JpYmUgdG8uIFZhbGlkIGtleXMgYXJlOiBjb25uZWN0aW9uLCBtZXNzYWdlLCBhbmQgY2xvc2UuXG4gICAgKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn06IFRoZSBjYWxsYmFjayB3aGljaCBzaG91bGQgYmUgY2FsbGVkIHdoZW4gYSBjZXJ0YWluIGV2ZW50IGlzIGZpcmVkLlxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ3NlbmQnLFxuXG4gICAgLypcbiAgICAqIFRoaXMgc2VuZCBmdW5jdGlvbiB3aWxsIG5vdGlmeSBhbGwgbW9jayBjbGllbnRzIHZpYSB0aGVpciBvbm1lc3NhZ2UgY2FsbGJhY2tzIHRoYXQgdGhlIHNlcnZlclxuICAgICogaGFzIGEgbWVzc2FnZSBmb3IgdGhlbS5cbiAgICAqXG4gICAgKiBAcGFyYW0ge2RhdGE6ICp9OiBBbnkgamF2YXNjcmlwdCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBjcmFmdGVkIGludG8gYSBNZXNzYWdlT2JqZWN0LlxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIHdlYnNvY2tldHMgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS53ZWJzb2NrZXRzTG9va3VwKHRoaXMudXJsKTtcblxuICAgICAgd2Vic29ja2V0cy5mb3JFYWNoKGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2VFdmVudCA9ICgwLCBfZmFjdG9yeS5jcmVhdGVNZXNzYWdlRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICBvcmlnaW46IF90aGlzLnVybCxcbiAgICAgICAgICB0YXJnZXQ6IHNvY2tldFxuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQuZGlzcGF0Y2hFdmVudChtZXNzYWdlRXZlbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY2xvc2UnLFxuXG4gICAgLypcbiAgICAqIE5vdGlmaWVzIGFsbCBtb2NrIGNsaWVudHMgdGhhdCB0aGUgc2VydmVyIGlzIGNsb3NpbmcgYW5kIHRoZWlyIG9uY2xvc2UgY2FsbGJhY2tzIHNob3VsZCBmaXJlLlxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwpO1xuXG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHNvY2tldC5yZWFkeVN0YXRlID0gX3dlYnNvY2tldDJbJ2RlZmF1bHQnXS5DTE9TRTtcbiAgICAgICAgc29ja2V0LmRpc3BhdGNoRXZlbnQoKDAsIF9mYWN0b3J5LmNyZWF0ZUV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICB0YXJnZXQ6IHNvY2tldFxuICAgICAgICB9KSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnY2xvc2UnIH0pLCB0aGlzKTtcbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZVNlcnZlcih0aGlzLnVybCk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNlcnZlcjtcbn0pKF9ldmVudFRhcmdldDJbJ2RlZmF1bHQnXSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNlcnZlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgZGVzYyA9IHBhcmVudCA9IGdldHRlciA9IHVuZGVmaW5lZDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9VUklKcyA9IHJlcXVpcmUoJy4uL1VSSS5qcycpO1xuXG52YXIgX1VSSUpzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VSSUpzKTtcblxudmFyIF9oZWxwZXJzRGVsYXkgPSByZXF1aXJlKCcuL2hlbHBlcnMvZGVsYXknKTtcblxudmFyIF9oZWxwZXJzRGVsYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0RlbGF5KTtcblxudmFyIF9ldmVudFRhcmdldCA9IHJlcXVpcmUoJy4vZXZlbnQtdGFyZ2V0Jyk7XG5cbnZhciBfZXZlbnRUYXJnZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXZlbnRUYXJnZXQpO1xuXG52YXIgX25ldHdvcmtCcmlkZ2UgPSByZXF1aXJlKCcuL25ldHdvcmstYnJpZGdlJyk7XG5cbnZhciBfbmV0d29ya0JyaWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9uZXR3b3JrQnJpZGdlKTtcblxudmFyIF9mYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3J5Jyk7XG5cbnZhciBXZWJTb2NrZXQgPSAoZnVuY3Rpb24gKF9FdmVudFRhcmdldCkge1xuICBfaW5oZXJpdHMoV2ViU29ja2V0LCBfRXZlbnRUYXJnZXQpO1xuXG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuXG4gIGZ1bmN0aW9uIFdlYlNvY2tldCh1cmwpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgV2ViU29ja2V0KTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFdlYlNvY2tldC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuXG4gICAgLypcbiAgICAqXG4gICAgKi9cbiAgICB0aGlzLmJpbmFyeVR5cGUgPSAnYmxvYic7XG4gICAgdGhpcy51cmwgPSAoMCwgX1VSSUpzMlsnZGVmYXVsdCddKSh1cmwpLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNPTk5FQ1RJTkc7XG5cbiAgICAvKlxuICAgICpcbiAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG9ub3Blbjoge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5vcGVuO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9ubWVzc2FnZToge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5tZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uY2xvc2U6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuY2xvc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uZXJyb3I6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuZXJyb3I7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLypcbiAgICAqXG4gICAgKi9cbiAgICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0Lk9QRU47XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2ZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ29wZW4nLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudCgoMCwgX2ZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Nvbm5lY3Rpb24nIH0pLCBzZXJ2ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NFRDtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnZXJyb3InLCB0YXJnZXQ6IHRoaXMgfSkpO1xuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1dlYlNvY2tldCBjb25uZWN0aW9uIHRvIFxcJycgKyB0aGlzLnVybCArICdcXCcgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoV2ViU29ja2V0LCBbe1xuICAgIGtleTogJ3NlbmQnLFxuXG4gICAgLypcbiAgICAqIFRoaXMgaXMgYSBtb2NrIGZvciB0aGUgbmF0aXZlIHNlbmQgZnVuY3Rpb24gZm91bmQgb24gdGhlIFdlYlNvY2tldCBvYmplY3QuIEl0IG5vdGlmaWVzIHRoZVxuICAgICogc2VydmljZSB0aGF0IGl0IGhhcyBzZW50IGEgbWVzc2FnZS5cbiAgICAqXG4gICAgKiBAcGFyYW0ge2RhdGE6ICp9OiBBbnkgamF2YXNjcmlwdCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBjcmFmdGVkIGludG8gYSBNZXNzYWdlT2JqZWN0LlxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICAgdmFyIG1lc3NhZ2VFdmVudCA9ICgwLCBfZmFjdG9yeS5jcmVhdGVNZXNzYWdlRXZlbnQpKHtcbiAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9KTtcblxuICAgICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQobWVzc2FnZUV2ZW50LCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjbG9zZScsXG5cbiAgICAvKlxuICAgICogVGhpcyBpcyBhIG1vY2sgZm9yIHRoZSBuYXRpdmUgY2xvc2UgZnVuY3Rpb24gZm91bmQgb24gdGhlIFdlYlNvY2tldCBvYmplY3QuIEl0IG5vdGlmaWVzIHRoZVxuICAgICogc2VydmljZSB0aGF0IGl0IGlzIGNsb3NpbmcgdGhlIGNvbm5lY3Rpb24uXG4gICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICB2YXIgc2VydmVyID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uc2VydmVyTG9va3VwKHRoaXMudXJsKTtcbiAgICAgIHZhciBjbG9zZUV2ZW50ID0gKDAsIF9mYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdjbG9zZScsIHRhcmdldDogdGhpcyB9KTtcblxuICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NFRDtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjbG9zZUV2ZW50KTtcblxuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChjbG9zZUV2ZW50LCBzZXJ2ZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiByZW1vdmUgc2VydmVyIGZyb20gbmV0d29yay1icmlkZ2VcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gV2ViU29ja2V0O1xufSkoX2V2ZW50VGFyZ2V0MlsnZGVmYXVsdCddKTtcblxuV2ViU29ja2V0LkNPTk5FQ1RJTkcgPSAwO1xuV2ViU29ja2V0Lk9QRU4gPSAxO1xuV2ViU29ja2V0LkNMT1NJTkcgPSAyO1xuV2ViU29ja2V0LkNMT1NFRCA9IDM7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFdlYlNvY2tldDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyJdfQ==
