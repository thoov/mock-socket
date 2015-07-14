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

'use strict';

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
})(undefined, function (root) {
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

'use strict';

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
})(undefined, function (root) {
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
'use strict';

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
})(undefined, function (punycode, IPv6, SLD, root) {
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
},{"./IPv6":1,"./SecondLevelDomains":2,"./punycode":5}],4:[function(require,module,exports){
(function (global){
/*! URI.js v1.15.2 http://medialize.github.io/URI.js/ */
/* build contains: IPv6.js, punycode.js, SecondLevelDomains.js, URI.js, URITemplate.js */
"use strict";

(function (e, n) {
  "object" === typeof exports ? module.exports = n() : "function" === typeof define && define.amd ? define(n) : e.IPv6 = n(e);
})(undefined, function (e) {
  var n = e && e.IPv6;return { best: function best(g) {
      g = g.toLowerCase().split(":");var l = g.length,
          b = 8;"" === g[0] && "" === g[1] && "" === g[2] ? (g.shift(), g.shift()) : "" === g[0] && "" === g[1] ? g.shift() : "" === g[l - 1] && "" === g[l - 2] && g.pop();l = g.length;-1 !== g[l - 1].indexOf(".") && (b = 7);var h;for (h = 0; h < l && "" !== g[h]; h++);if (h < b) for (g.splice(h, 1, "0000"); g.length < b;) g.splice(h, 0, "0000");for (h = 0; h < b; h++) {
        for (var l = g[h].split(""), e = 0; 3 > e; e++) if ("0" === l[0] && 1 < l.length) l.splice(0, 1);else break;g[h] = l.join("");
      }var l = -1,
          n = e = 0,
          k = -1,
          u = !1;for (h = 0; h < b; h++) u ? "0" === g[h] ? n += 1 : (u = !1, n > e && (l = k, e = n)) : "0" === g[h] && (u = !0, k = h, n = 1);n > e && (l = k, e = n);1 < e && g.splice(l, e, "");l = g.length;b = "";"" === g[0] && (b = ":");for (h = 0; h < l; h++) {
        b += g[h];if (h === l - 1) break;b += ":";
      }"" === g[l - 1] && (b += ":");return b;
    }, noConflict: function noConflict() {
      e.IPv6 === this && (e.IPv6 = n);return this;
    } };
});
(function (e) {
  function n(b) {
    throw RangeError(v[b]);
  }function g(b, f) {
    for (var k = b.length; k--;) b[k] = f(b[k]);return b;
  }function l(b, k) {
    return g(b.split(f), k).join(".");
  }function b(b) {
    for (var f = [], k = 0, g = b.length, a, c; k < g;) a = b.charCodeAt(k++), 55296 <= a && 56319 >= a && k < g ? (c = b.charCodeAt(k++), 56320 == (c & 64512) ? f.push(((a & 1023) << 10) + (c & 1023) + 65536) : (f.push(a), k--)) : f.push(a);return f;
  }function h(b) {
    return g(b, function (b) {
      var f = "";65535 < b && (b -= 65536, f += x(b >>> 10 & 1023 | 55296), b = 56320 | b & 1023);return f += x(b);
    }).join("");
  }function A(b, f) {
    return b + 22 + 75 * (26 > b) - ((0 != f) << 5);
  }function w(b, f, k) {
    var g = 0;b = k ? q(b / 700) : b >> 1;for (b += q(b / f); 455 < b; g += 36) b = q(b / 35);return q(g + 36 * b / (b + 38));
  }function k(b) {
    var f = [],
        k = b.length,
        g,
        a = 0,
        c = 128,
        d = 72,
        m,
        z,
        y,
        e,
        l;m = b.lastIndexOf("-");0 > m && (m = 0);for (z = 0; z < m; ++z) 128 <= b.charCodeAt(z) && n("not-basic"), f.push(b.charCodeAt(z));for (m = 0 < m ? m + 1 : 0; m < k;) {
      z = a;g = 1;for (y = 36;; y += 36) {
        m >= k && n("invalid-input");e = b.charCodeAt(m++);e = 10 > e - 48 ? e - 22 : 26 > e - 65 ? e - 65 : 26 > e - 97 ? e - 97 : 36;(36 <= e || e > q((2147483647 - a) / g)) && n("overflow");a += e * g;l = y <= d ? 1 : y >= d + 26 ? 26 : y - d;if (e < l) break;e = 36 - l;g > q(2147483647 / e) && n("overflow");g *= e;
      }g = f.length + 1;d = w(a - z, g, 0 == z);q(a / g) > 2147483647 - c && n("overflow");c += q(a / g);a %= g;f.splice(a++, 0, c);
    }return h(f);
  }function u(f) {
    var g,
        k,
        e,
        a,
        c,
        d,
        m,
        z,
        y,
        l = [],
        u,
        h,
        p;f = b(f);u = f.length;g = 128;k = 0;c = 72;for (d = 0; d < u; ++d) y = f[d], 128 > y && l.push(x(y));for ((e = a = l.length) && l.push("-"); e < u;) {
      m = 2147483647;for (d = 0; d < u; ++d) y = f[d], y >= g && y < m && (m = y);h = e + 1;m - g > q((2147483647 - k) / h) && n("overflow");k += (m - g) * h;g = m;for (d = 0; d < u; ++d) if ((y = f[d], y < g && 2147483647 < ++k && n("overflow"), y == g)) {
        z = k;for (m = 36;; m += 36) {
          y = m <= c ? 1 : m >= c + 26 ? 26 : m - c;if (z < y) break;p = z - y;z = 36 - y;l.push(x(A(y + p % z, 0)));z = q(p / z);
        }l.push(x(A(z, 0)));c = w(k, h, e == a);k = 0;++e;
      }++k;++g;
    }return l.join("");
  }var D = "object" == typeof exports && exports,
      E = "object" == typeof module && module && module.exports == D && module,
      B = "object" == typeof global && global;if (B.global === B || B.window === B) e = B;var t,
      r = /^xn--/,
      p = /[^ -~]/,
      f = /\x2E|\u3002|\uFF0E|\uFF61/g,
      v = { overflow: "Overflow: input needs wider integers to process", "not-basic": "Illegal input >= 0x80 (not a basic code point)",
    "invalid-input": "Invalid input" },
      q = Math.floor,
      x = String.fromCharCode,
      C;t = { version: "1.2.3", ucs2: { decode: b, encode: h }, decode: k, encode: u, toASCII: function toASCII(b) {
      return l(b, function (b) {
        return p.test(b) ? "xn--" + u(b) : b;
      });
    }, toUnicode: function toUnicode(b) {
      return l(b, function (b) {
        return r.test(b) ? k(b.slice(4).toLowerCase()) : b;
      });
    } };if ("function" == typeof define && "object" == typeof define.amd && define.amd) define(function () {
    return t;
  });else if (D && !D.nodeType) if (E) E.exports = t;else for (C in t) t.hasOwnProperty(C) && (D[C] = t[C]);else e.punycode = t;
})(undefined);
(function (e, n) {
  "object" === typeof exports ? module.exports = n() : "function" === typeof define && define.amd ? define(n) : e.SecondLevelDomains = n(e);
})(undefined, function (e) {
  var n = e && e.SecondLevelDomains,
      g = { list: { ac: " com gov mil net org ", ae: " ac co gov mil name net org pro sch ", af: " com edu gov net org ", al: " com edu gov mil net org ", ao: " co ed gv it og pb ", ar: " com edu gob gov int mil net org tur ", at: " ac co gv or ", au: " asn com csiro edu gov id net org ", ba: " co com edu gov mil net org rs unbi unmo unsa untz unze ", bb: " biz co com edu gov info net org store tv ",
      bh: " biz cc com edu gov info net org ", bn: " com edu gov net org ", bo: " com edu gob gov int mil net org tv ", br: " adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ", bs: " com edu gov net org ", bz: " du et om ov rg ", ca: " ab bc mb nb nf nl ns nt nu on pe qc sk yk ", ck: " biz co edu gen gov info net org ",
      cn: " ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ", co: " com edu gov mil net nom org ", cr: " ac c co ed fi go or sa ", cy: " ac biz com ekloges gov ltd name net org parliament press pro tm ", "do": " art com edu gob gov mil net org sld web ", dz: " art asso com edu gov net org pol ", ec: " com edu fin gov info med mil net org pro ", eg: " com edu eun gov mil name net org sci ", er: " com edu gov ind mil net org rochest w ", es: " com edu gob nom org ",
      et: " biz com edu gov info name net org ", fj: " ac biz com info mil name net org pro ", fk: " ac co gov net nom org ", fr: " asso com f gouv nom prd presse tm ", gg: " co net org ", gh: " com edu gov mil org ", gn: " ac com gov net org ", gr: " com edu gov mil net org ", gt: " com edu gob ind mil net org ", gu: " com edu gov net org ", hk: " com edu gov idv net org ", hu: " 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ",
      id: " ac co go mil net or sch web ", il: " ac co gov idf k12 muni net org ", "in": " ac co edu ernet firm gen gov i ind mil net nic org res ", iq: " com edu gov i mil net org ", ir: " ac co dnssec gov i id net org sch ", it: " edu gov ", je: " co net org ", jo: " com edu gov mil name net org sch ", jp: " ac ad co ed go gr lg ne or ", ke: " ac co go info me mobi ne or sc ", kh: " com edu gov mil net org per ", ki: " biz com de edu gov info mob net org tel ", km: " asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ",
      kn: " edu gov net org ", kr: " ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ", kw: " com edu gov net org ", ky: " com edu gov net org ", kz: " com edu gov mil net org ", lb: " com edu gov net org ", lk: " assn com edu gov grp hotel int ltd net ngo org sch soc web ", lr: " com edu gov net org ", lv: " asn com conf edu gov id mil net org ", ly: " com edu gov id med net org plc sch ", ma: " ac co gov m net org press ",
      mc: " asso tm ", me: " ac co edu gov its net org priv ", mg: " com edu gov mil nom org prd tm ", mk: " com edu gov inf name net org pro ", ml: " com edu gov net org presse ", mn: " edu gov org ", mo: " com edu gov net org ", mt: " com edu gov net org ", mv: " aero biz com coop edu gov info int mil museum name net org pro ", mw: " ac co com coop edu gov int museum net org ", mx: " com edu gob net org ", my: " com edu gov mil name net org sch ", nf: " arts com firm info net other per rec store web ", ng: " biz com edu gov mil mobi name net org sch ",
      ni: " ac co com edu gob mil net nom org ", np: " com edu gov mil net org ", nr: " biz com edu gov info net org ", om: " ac biz co com edu gov med mil museum net org pro sch ", pe: " com edu gob mil net nom org sld ", ph: " com edu gov i mil net ngo org ", pk: " biz com edu fam gob gok gon gop gos gov net org web ", pl: " art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ", pr: " ac biz com edu est gov info isla name net org pro prof ",
      ps: " com edu gov net org plo sec ", pw: " belau co ed go ne or ", ro: " arts com firm info nom nt org rec store tm www ", rs: " ac co edu gov in org ", sb: " com edu gov net org ", sc: " com edu gov net org ", sh: " co com edu gov net nom org ", sl: " com edu gov net org ", st: " co com consulado edu embaixada gov mil net org principe saotome store ", sv: " com edu gob org red ", sz: " ac co org ", tr: " av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ", tt: " aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ",
      tw: " club com ebiz edu game gov idv mil net org ", mu: " ac co com gov net or org ", mz: " ac co edu gov org ", na: " co com ", nz: " ac co cri geek gen govt health iwi maori mil net org parliament school ", pa: " abo ac com edu gob ing med net nom org sld ", pt: " com edu gov int net nome org publ ", py: " com edu gov mil net org ", qa: " com edu gov mil net org ", re: " asso com nom ", ru: " ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ",
      rw: " ac co com edu gouv gov int mil net ", sa: " com edu gov med net org pub sch ", sd: " com edu gov info med net org tv ", se: " a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ", sg: " com edu gov idn net org per ", sn: " art com edu gouv org perso univ ", sy: " com edu gov mil net news org ", th: " ac co go in mi net or ", tj: " ac biz co com edu go gov info int mil name net nic org test web ", tn: " agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ",
      tz: " ac co go ne or ", ua: " biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ", ug: " ac co go ne or org sc ", uk: " ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ",
      us: " dni fed isa kids nsn ", uy: " com edu gub mil net org ", ve: " co com edu gob info mil net org web ", vi: " co com k12 net org ", vn: " ac biz com edu gov health info int name net org pro ", ye: " co com gov ltd me net org plc ", yu: " ac co edu gov org ", za: " ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ", zm: " ac co com edu gov net org sch " }, has: function has(e) {
      var b = e.lastIndexOf(".");if (0 >= b || b >= e.length - 1) return !1;
      var h = e.lastIndexOf(".", b - 1);if (0 >= h || h >= b - 1) return !1;var n = g.list[e.slice(b + 1)];return n ? 0 <= n.indexOf(" " + e.slice(h + 1, b) + " ") : !1;
    }, is: function is(e) {
      var b = e.lastIndexOf(".");if (0 >= b || b >= e.length - 1 || 0 <= e.lastIndexOf(".", b - 1)) return !1;var h = g.list[e.slice(b + 1)];return h ? 0 <= h.indexOf(" " + e.slice(0, b) + " ") : !1;
    }, get: function get(e) {
      var b = e.lastIndexOf(".");if (0 >= b || b >= e.length - 1) return null;var h = e.lastIndexOf(".", b - 1);if (0 >= h || h >= b - 1) return null;var n = g.list[e.slice(b + 1)];return !n || 0 > n.indexOf(" " + e.slice(h + 1, b) + " ") ? null : e.slice(h + 1);
    }, noConflict: function noConflict() {
      e.SecondLevelDomains === this && (e.SecondLevelDomains = n);return this;
    } };return g;
});
(function (e, n) {
  "object" === typeof exports ? module.exports = n(require("./punycode"), require("./IPv6"), require("./SecondLevelDomains")) : "function" === typeof define && define.amd ? define(["./punycode", "./IPv6", "./SecondLevelDomains"], n) : e.URI = n(e.punycode, e.IPv6, e.SecondLevelDomains, e);
})(undefined, function (e, n, g, l) {
  function b(a, c) {
    var d = 1 <= arguments.length,
        m = 2 <= arguments.length;if (!(this instanceof b)) return d ? m ? new b(a, c) : new b(a) : new b();if (void 0 === a) {
      if (d) throw new TypeError("undefined is not a valid argument for URI");
      a = "undefined" !== typeof location ? location.href + "" : "";
    }this.href(a);return void 0 !== c ? this.absoluteTo(c) : this;
  }function h(a) {
    return a.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
  }function A(a) {
    return void 0 === a ? "Undefined" : String(Object.prototype.toString.call(a)).slice(8, -1);
  }function w(a) {
    return "Array" === A(a);
  }function k(a, c) {
    var d = {},
        b,
        f;if ("RegExp" === A(c)) d = null;else if (w(c)) for (b = 0, f = c.length; b < f; b++) d[c[b]] = !0;else d[c] = !0;b = 0;for (f = a.length; b < f; b++) if (d && void 0 !== d[a[b]] || !d && c.test(a[b])) a.splice(b, 1), f--, b--;return a;
  }function u(a, c) {
    var d, b;if (w(c)) {
      d = 0;for (b = c.length; d < b; d++) if (!u(a, c[d])) return !1;return !0;
    }var f = A(c);d = 0;for (b = a.length; d < b; d++) if ("RegExp" === f) {
      if ("string" === typeof a[d] && a[d].match(c)) return !0;
    } else if (a[d] === c) return !0;return !1;
  }function D(a, c) {
    if (!w(a) || !w(c) || a.length !== c.length) return !1;a.sort();c.sort();for (var d = 0, b = a.length; d < b; d++) if (a[d] !== c[d]) return !1;return !0;
  }function E(a) {
    return escape(a);
  }function B(a) {
    return encodeURIComponent(a).replace(/[!'()*]/g, E).replace(/\*/g, "%2A");
  }function t(a) {
    return function (c, d) {
      if (void 0 === c) return this._parts[a] || "";this._parts[a] = c || null;this.build(!d);return this;
    };
  }function r(a, c) {
    return function (d, b) {
      if (void 0 === d) return this._parts[a] || "";null !== d && (d += "", d.charAt(0) === c && (d = d.substring(1)));this._parts[a] = d;this.build(!b);return this;
    };
  }var p = l && l.URI;b.version = "1.15.2";var f = b.prototype,
      v = Object.prototype.hasOwnProperty;b._parts = function () {
    return { protocol: null, username: null, password: null, hostname: null, urn: null, port: null, path: null,
      query: null, fragment: null, duplicateQueryParameters: b.duplicateQueryParameters, escapeQuerySpace: b.escapeQuerySpace };
  };b.duplicateQueryParameters = !1;b.escapeQuerySpace = !0;b.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;b.idn_expression = /[^a-z0-9\.-]/i;b.punycode_expression = /(xn--)/i;b.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;b.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  b.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019]))/ig;b.findUri = { start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi, end: /[\s\r\n]|$/, trim: /[`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u201e\u2018\u2019]+$/ };b.defaultPorts = { http: "80", https: "443", ftp: "21", gopher: "70", ws: "80", wss: "443" };b.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;b.domAttributes = { a: "href", blockquote: "cite", link: "href", base: "href", script: "src", form: "action", img: "src", area: "href", iframe: "src", embed: "src", source: "src", track: "src", input: "src", audio: "src", video: "src" };b.getDomAttribute = function (a) {
    if (a && a.nodeName) {
      var c = a.nodeName.toLowerCase();return "input" === c && "image" !== a.type ? void 0 : b.domAttributes[c];
    }
  };b.encode = B;b.decode = decodeURIComponent;b.iso8859 = function () {
    b.encode = escape;b.decode = unescape;
  };b.unicode = function () {
    b.encode = B;b.decode = decodeURIComponent;
  };b.characters = { pathname: { encode: { expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig, map: { "%24": "$", "%26": "&", "%2B": "+", "%2C": ",", "%3B": ";", "%3D": "=", "%3A": ":", "%40": "@" } }, decode: { expression: /[\/\?#]/g, map: { "/": "%2F", "?": "%3F", "#": "%23" } } }, reserved: { encode: { expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig, map: { "%3A": ":", "%2F": "/", "%3F": "?", "%23": "#", "%5B": "[", "%5D": "]", "%40": "@", "%21": "!", "%24": "$", "%26": "&", "%27": "'", "%28": "(", "%29": ")", "%2A": "*", "%2B": "+", "%2C": ",",
          "%3B": ";", "%3D": "=" } } }, urnpath: { encode: { expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig, map: { "%21": "!", "%24": "$", "%27": "'", "%28": "(", "%29": ")", "%2A": "*", "%2B": "+", "%2C": ",", "%3B": ";", "%3D": "=", "%40": "@" } }, decode: { expression: /[\/\?#:]/g, map: { "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" } } } };b.encodeQuery = function (a, c) {
    var d = b.encode(a + "");void 0 === c && (c = b.escapeQuerySpace);return c ? d.replace(/%20/g, "+") : d;
  };b.decodeQuery = function (a, c) {
    a += "";void 0 === c && (c = b.escapeQuerySpace);try {
      return b.decode(c ? a.replace(/\+/g, "%20") : a);
    } catch (d) {
      return a;
    }
  };var q = { encode: "encode", decode: "decode" },
      x,
      C = function C(a, c) {
    return function (d) {
      try {
        return b[c](d + "").replace(b.characters[a][c].expression, function (d) {
          return b.characters[a][c].map[d];
        });
      } catch (m) {
        return d;
      }
    };
  };for (x in q) b[x + "PathSegment"] = C("pathname", q[x]), b[x + "UrnPathSegment"] = C("urnpath", q[x]);q = function (a, c, d) {
    return function (m) {
      var f;f = d ? function (a) {
        return b[c](b[d](a));
      } : b[c];m = (m + "").split(a);for (var e = 0, k = m.length; e < k; e++) m[e] = f(m[e]);return m.join(a);
    };
  };b.decodePath = q("/", "decodePathSegment");b.decodeUrnPath = q(":", "decodeUrnPathSegment");b.recodePath = q("/", "encodePathSegment", "decode");b.recodeUrnPath = q(":", "encodeUrnPathSegment", "decode");b.encodeReserved = C("reserved", "encode");b.parse = function (a, c) {
    var d;c || (c = {});d = a.indexOf("#");-1 < d && (c.fragment = a.substring(d + 1) || null, a = a.substring(0, d));d = a.indexOf("?");-1 < d && (c.query = a.substring(d + 1) || null, a = a.substring(0, d));"//" === a.substring(0, 2) ? (c.protocol = null, a = a.substring(2), a = b.parseAuthority(a, c)) : (d = a.indexOf(":"), -1 < d && (c.protocol = a.substring(0, d) || null, c.protocol && !c.protocol.match(b.protocol_expression) ? c.protocol = void 0 : "//" === a.substring(d + 1, d + 3) ? (a = a.substring(d + 3), a = b.parseAuthority(a, c)) : (a = a.substring(d + 1), c.urn = !0)));c.path = a;return c;
  };b.parseHost = function (a, c) {
    var d = a.indexOf("/"),
        b;-1 === d && (d = a.length);if ("[" === a.charAt(0)) b = a.indexOf("]"), c.hostname = a.substring(1, b) || null, c.port = a.substring(b + 2, d) || null, "/" === c.port && (c.port = null);else {
      var f = a.indexOf(":");b = a.indexOf("/");f = a.indexOf(":", f + 1);
      -1 !== f && (-1 === b || f < b) ? (c.hostname = a.substring(0, d) || null, c.port = null) : (b = a.substring(0, d).split(":"), c.hostname = b[0] || null, c.port = b[1] || null);
    }c.hostname && "/" !== a.substring(d).charAt(0) && (d++, a = "/" + a);return a.substring(d) || "/";
  };b.parseAuthority = function (a, c) {
    a = b.parseUserinfo(a, c);return b.parseHost(a, c);
  };b.parseUserinfo = function (a, c) {
    var d = a.indexOf("/"),
        m = a.lastIndexOf("@", -1 < d ? d : a.length - 1);-1 < m && (-1 === d || m < d) ? (d = a.substring(0, m).split(":"), c.username = d[0] ? b.decode(d[0]) : null, d.shift(), c.password = d[0] ? b.decode(d.join(":")) : null, a = a.substring(m + 1)) : (c.username = null, c.password = null);return a;
  };b.parseQuery = function (a, c) {
    if (!a) return {};a = a.replace(/&+/g, "&").replace(/^\?*&*|&+$/g, "");if (!a) return {};for (var d = {}, m = a.split("&"), f = m.length, e, k, g = 0; g < f; g++) if ((e = m[g].split("="), k = b.decodeQuery(e.shift(), c), e = e.length ? b.decodeQuery(e.join("="), c) : null, v.call(d, k))) {
      if ("string" === typeof d[k] || null === d[k]) d[k] = [d[k]];d[k].push(e);
    } else d[k] = e;return d;
  };b.build = function (a) {
    var c = "";a.protocol && (c += a.protocol + ":");a.urn || !c && !a.hostname || (c += "//");c += b.buildAuthority(a) || "";"string" === typeof a.path && ("/" !== a.path.charAt(0) && "string" === typeof a.hostname && (c += "/"), c += a.path);"string" === typeof a.query && a.query && (c += "?" + a.query);"string" === typeof a.fragment && a.fragment && (c += "#" + a.fragment);return c;
  };b.buildHost = function (a) {
    var c = "";if (a.hostname) c = b.ip6_expression.test(a.hostname) ? c + ("[" + a.hostname + "]") : c + a.hostname;else return "";a.port && (c += ":" + a.port);return c;
  };b.buildAuthority = function (a) {
    return b.buildUserinfo(a) + b.buildHost(a);
  };b.buildUserinfo = function (a) {
    var c = "";a.username && (c += b.encode(a.username), a.password && (c += ":" + b.encode(a.password)), c += "@");return c;
  };b.buildQuery = function (a, c, d) {
    var m = "",
        f,
        e,
        k,
        g;for (e in a) if (v.call(a, e) && e) if (w(a[e])) for (f = {}, k = 0, g = a[e].length; k < g; k++) void 0 !== a[e][k] && void 0 === f[a[e][k] + ""] && (m += "&" + b.buildQueryParameter(e, a[e][k], d), !0 !== c && (f[a[e][k] + ""] = !0));else void 0 !== a[e] && (m += "&" + b.buildQueryParameter(e, a[e], d));return m.substring(1);
  };b.buildQueryParameter = function (a, c, d) {
    return b.encodeQuery(a, d) + (null !== c ? "=" + b.encodeQuery(c, d) : "");
  };b.addQuery = function (a, c, d) {
    if ("object" === typeof c) for (var m in c) v.call(c, m) && b.addQuery(a, m, c[m]);else if ("string" === typeof c) void 0 === a[c] ? a[c] = d : ("string" === typeof a[c] && (a[c] = [a[c]]), w(d) || (d = [d]), a[c] = (a[c] || []).concat(d));else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
  };b.removeQuery = function (a, c, d) {
    var m;if (w(c)) for (d = 0, m = c.length; d < m; d++) a[c[d]] = void 0;else if ("RegExp" === A(c)) for (m in a) c.test(m) && (a[m] = void 0);else if ("object" === typeof c) for (m in c) v.call(c, m) && b.removeQuery(a, m, c[m]);else if ("string" === typeof c) void 0 !== d ? "RegExp" === A(d) ? !w(a[c]) && d.test(a[c]) ? a[c] = void 0 : a[c] = k(a[c], d) : a[c] === d ? a[c] = void 0 : w(a[c]) && (a[c] = k(a[c], d)) : a[c] = void 0;else throw new TypeError("URI.removeQuery() accepts an object, string, RegExp as the first parameter");
  };b.hasQuery = function (a, c, d, m) {
    if ("object" === typeof c) {
      for (var f in c) if (v.call(c, f) && !b.hasQuery(a, f, c[f])) return !1;return !0;
    }if ("string" !== typeof c) throw new TypeError("URI.hasQuery() accepts an object, string as the name parameter");
    switch (A(d)) {case "Undefined":
        return c in a;case "Boolean":
        return (a = Boolean(w(a[c]) ? a[c].length : a[c]), d === a);case "Function":
        return !!d(a[c], c, a);case "Array":
        return w(a[c]) ? (m ? u : D)(a[c], d) : !1;case "RegExp":
        return w(a[c]) ? m ? u(a[c], d) : !1 : Boolean(a[c] && a[c].match(d));case "Number":
        d = String(d);case "String":
        return w(a[c]) ? m ? u(a[c], d) : !1 : a[c] === d;default:
        throw new TypeError("URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter");}
  };b.commonPath = function (a, c) {
    var d = Math.min(a.length, c.length),
        b;for (b = 0; b < d; b++) if (a.charAt(b) !== c.charAt(b)) {
      b--;break;
    }if (1 > b) return a.charAt(0) === c.charAt(0) && "/" === a.charAt(0) ? "/" : "";if ("/" !== a.charAt(b) || "/" !== c.charAt(b)) b = a.substring(0, b).lastIndexOf("/");return a.substring(0, b + 1);
  };b.withinString = function (a, c, d) {
    d || (d = {});var m = d.start || b.findUri.start,
        f = d.end || b.findUri.end,
        e = d.trim || b.findUri.trim,
        k = /[a-z0-9-]=["']?$/i;for (m.lastIndex = 0;;) {
      var g = m.exec(a);if (!g) break;g = g.index;if (d.ignoreHtml) {
        var u = a.slice(Math.max(g - 3, 0), g);if (u && k.test(u)) continue;
      }var u = g + a.slice(g).search(f),
          h = a.slice(g, u).replace(e, "");d.ignore && d.ignore.test(h) || (u = g + h.length, h = c(h, g, u, a), a = a.slice(0, g) + h + a.slice(u), m.lastIndex = g + h.length);
    }m.lastIndex = 0;return a;
  };b.ensureValidHostname = function (a) {
    if (a.match(b.invalid_hostname_characters)) {
      if (!e) throw new TypeError("Hostname \"" + a + "\" contains characters other than [A-Z0-9.-] and Punycode.js is not available");if (e.toASCII(a).match(b.invalid_hostname_characters)) throw new TypeError("Hostname \"" + a + "\" contains characters other than [A-Z0-9.-]");
    }
  };b.noConflict = function (a) {
    if (a) return (a = { URI: this.noConflict() }, l.URITemplate && "function" === typeof l.URITemplate.noConflict && (a.URITemplate = l.URITemplate.noConflict()), l.IPv6 && "function" === typeof l.IPv6.noConflict && (a.IPv6 = l.IPv6.noConflict()), l.SecondLevelDomains && "function" === typeof l.SecondLevelDomains.noConflict && (a.SecondLevelDomains = l.SecondLevelDomains.noConflict()), a);l.URI === this && (l.URI = p);return this;
  };f.build = function (a) {
    if (!0 === a) this._deferred_build = !0;else if (void 0 === a || this._deferred_build) this._string = b.build(this._parts), this._deferred_build = !1;return this;
  };f.clone = function () {
    return new b(this);
  };f.valueOf = f.toString = function () {
    return this.build(!1)._string;
  };f.protocol = t("protocol");f.username = t("username");f.password = t("password");f.hostname = t("hostname");f.port = t("port");f.query = r("query", "?");f.fragment = r("fragment", "#");f.search = function (a, c) {
    var b = this.query(a, c);return "string" === typeof b && b.length ? "?" + b : b;
  };f.hash = function (a, c) {
    var b = this.fragment(a, c);return "string" === typeof b && b.length ? "#" + b : b;
  };f.pathname = function (a, c) {
    if (void 0 === a || !0 === a) {
      var d = this._parts.path || (this._parts.hostname ? "/" : "");return a ? (this._parts.urn ? b.decodeUrnPath : b.decodePath)(d) : d;
    }this._parts.path = this._parts.urn ? a ? b.recodeUrnPath(a) : "" : a ? b.recodePath(a) : "/";this.build(!c);return this;
  };f.path = f.pathname;f.href = function (a, c) {
    var d;if (void 0 === a) return this.toString();this._string = "";this._parts = b._parts();var f = a instanceof b,
        e = "object" === typeof a && (a.hostname || a.path || a.pathname);a.nodeName && (e = b.getDomAttribute(a), a = a[e] || "", e = !1);!f && e && void 0 !== a.pathname && (a = a.toString());if ("string" === typeof a || a instanceof String) this._parts = b.parse(String(a), this._parts);else if (f || e) for (d in (f = f ? a._parts : a, f)) v.call(this._parts, d) && (this._parts[d] = f[d]);else throw new TypeError("invalid input");this.build(!c);return this;
  };f.is = function (a) {
    var c = !1,
        d = !1,
        f = !1,
        e = !1,
        k = !1,
        u = !1,
        h = !1,
        l = !this._parts.urn;this._parts.hostname && (l = !1, d = b.ip4_expression.test(this._parts.hostname), f = b.ip6_expression.test(this._parts.hostname), c = d || f, k = (e = !c) && g && g.has(this._parts.hostname), u = e && b.idn_expression.test(this._parts.hostname), h = e && b.punycode_expression.test(this._parts.hostname));switch (a.toLowerCase()) {case "relative":
        return l;case "absolute":
        return !l;case "domain":case "name":
        return e;case "sld":
        return k;case "ip":
        return c;case "ip4":case "ipv4":case "inet4":
        return d;case "ip6":case "ipv6":case "inet6":
        return f;case "idn":
        return u;case "url":
        return !this._parts.urn;case "urn":
        return !!this._parts.urn;
      case "punycode":
        return h;}return null;
  };var F = f.protocol,
      G = f.port,
      H = f.hostname;f.protocol = function (a, c) {
    if (void 0 !== a && a && (a = a.replace(/:(\/\/)?$/, ""), !a.match(b.protocol_expression))) throw new TypeError("Protocol \"" + a + "\" contains characters other than [A-Z0-9.+-] or doesn't start with [A-Z]");return F.call(this, a, c);
  };f.scheme = f.protocol;f.port = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 !== a && (0 === a && (a = null), a && (a += "", ":" === a.charAt(0) && (a = a.substring(1)), a.match(/[^0-9]/)))) throw new TypeError("Port \"" + a + "\" contains characters other than [0-9]");return G.call(this, a, c);
  };f.hostname = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 !== a) {
      var d = {};b.parseHost(a, d);a = d.hostname;
    }return H.call(this, a, c);
  };f.host = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) return this._parts.hostname ? b.buildHost(this._parts) : "";b.parseHost(a, this._parts);this.build(!c);return this;
  };f.authority = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) return this._parts.hostname ? b.buildAuthority(this._parts) : "";b.parseAuthority(a, this._parts);this.build(!c);return this;
  };f.userinfo = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) {
      if (!this._parts.username) return "";var d = b.buildUserinfo(this._parts);return d.substring(0, d.length - 1);
    }"@" !== a[a.length - 1] && (a += "@");b.parseUserinfo(a, this._parts);this.build(!c);return this;
  };f.resource = function (a, c) {
    var d;if (void 0 === a) return this.path() + this.search() + this.hash();d = b.parse(a);this._parts.path = d.path;this._parts.query = d.query;this._parts.fragment = d.fragment;this.build(!c);return this;
  };f.subdomain = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) {
      if (!this._parts.hostname || this.is("IP")) return "";var d = this._parts.hostname.length - this.domain().length - 1;return this._parts.hostname.substring(0, d) || "";
    }d = this._parts.hostname.length - this.domain().length;d = this._parts.hostname.substring(0, d);d = new RegExp("^" + h(d));a && "." !== a.charAt(a.length - 1) && (a += ".");a && b.ensureValidHostname(a);this._parts.hostname = this._parts.hostname.replace(d, a);this.build(!c);return this;
  };f.domain = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;"boolean" === typeof a && (c = a, a = void 0);if (void 0 === a) {
      if (!this._parts.hostname || this.is("IP")) return "";var d = this._parts.hostname.match(/\./g);if (d && 2 > d.length) return this._parts.hostname;d = this._parts.hostname.length - this.tld(c).length - 1;d = this._parts.hostname.lastIndexOf(".", d - 1) + 1;return this._parts.hostname.substring(d) || "";
    }if (!a) throw new TypeError("cannot set domain empty");
    b.ensureValidHostname(a);!this._parts.hostname || this.is("IP") ? this._parts.hostname = a : (d = new RegExp(h(this.domain()) + "$"), this._parts.hostname = this._parts.hostname.replace(d, a));this.build(!c);return this;
  };f.tld = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;"boolean" === typeof a && (c = a, a = void 0);if (void 0 === a) {
      if (!this._parts.hostname || this.is("IP")) return "";var b = this._parts.hostname.lastIndexOf("."),
          b = this._parts.hostname.substring(b + 1);return !0 !== c && g && g.list[b.toLowerCase()] ? g.get(this._parts.hostname) || b : b;
    }if (a) if (a.match(/[^a-zA-Z0-9-]/)) if (g && g.is(a)) b = new RegExp(h(this.tld()) + "$"), this._parts.hostname = this._parts.hostname.replace(b, a);else throw new TypeError("TLD \"" + a + "\" contains characters other than [A-Z0-9]");else {
      if (!this._parts.hostname || this.is("IP")) throw new ReferenceError("cannot set TLD on non-domain host");b = new RegExp(h(this.tld()) + "$");this._parts.hostname = this._parts.hostname.replace(b, a);
    } else throw new TypeError("cannot set TLD empty");this.build(!c);return this;
  };f.directory = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a || !0 === a) {
      if (!this._parts.path && !this._parts.hostname) return "";if ("/" === this._parts.path) return "/";var d = this._parts.path.length - this.filename().length - 1,
          d = this._parts.path.substring(0, d) || (this._parts.hostname ? "/" : "");return a ? b.decodePath(d) : d;
    }d = this._parts.path.length - this.filename().length;d = this._parts.path.substring(0, d);d = new RegExp("^" + h(d));this.is("relative") || (a || (a = "/"), "/" !== a.charAt(0) && (a = "/" + a));a && "/" !== a.charAt(a.length - 1) && (a += "/");a = b.recodePath(a);this._parts.path = this._parts.path.replace(d, a);this.build(!c);return this;
  };f.filename = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a || !0 === a) {
      if (!this._parts.path || "/" === this._parts.path) return "";var d = this._parts.path.lastIndexOf("/"),
          d = this._parts.path.substring(d + 1);return a ? b.decodePathSegment(d) : d;
    }d = !1;"/" === a.charAt(0) && (a = a.substring(1));a.match(/\.?\//) && (d = !0);var f = new RegExp(h(this.filename()) + "$");a = b.recodePath(a);this._parts.path = this._parts.path.replace(f, a);d ? this.normalizePath(c) : this.build(!c);return this;
  };f.suffix = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a || !0 === a) {
      if (!this._parts.path || "/" === this._parts.path) return "";var d = this.filename(),
          f = d.lastIndexOf(".");if (-1 === f) return "";d = d.substring(f + 1);d = /^[a-z0-9%]+$/i.test(d) ? d : "";return a ? b.decodePathSegment(d) : d;
    }"." === a.charAt(0) && (a = a.substring(1));if (d = this.suffix()) f = a ? new RegExp(h(d) + "$") : new RegExp(h("." + d) + "$");else {
      if (!a) return this;
      this._parts.path += "." + b.recodePath(a);
    }f && (a = b.recodePath(a), this._parts.path = this._parts.path.replace(f, a));this.build(!c);return this;
  };f.segment = function (a, c, b) {
    var f = this._parts.urn ? ":" : "/",
        e = this.path(),
        k = "/" === e.substring(0, 1),
        e = e.split(f);void 0 !== a && "number" !== typeof a && (b = c, c = a, a = void 0);if (void 0 !== a && "number" !== typeof a) throw Error("Bad segment \"" + a + "\", must be 0-based integer");k && e.shift();0 > a && (a = Math.max(e.length + a, 0));if (void 0 === c) return void 0 === a ? e : e[a];if (null === a || void 0 === e[a]) if (w(c)) {
      e = [];a = 0;for (var g = c.length; a < g; a++) if (c[a].length || e.length && e[e.length - 1].length) e.length && !e[e.length - 1].length && e.pop(), e.push(c[a]);
    } else {
      if (c || "string" === typeof c) "" === e[e.length - 1] ? e[e.length - 1] = c : e.push(c);
    } else c ? e[a] = c : e.splice(a, 1);k && e.unshift("");return this.path(e.join(f), b);
  };f.segmentCoded = function (a, c, d) {
    var f, e;"number" !== typeof a && (d = c, c = a, a = void 0);if (void 0 === c) {
      a = this.segment(a, c, d);if (w(a)) for (f = 0, e = a.length; f < e; f++) a[f] = b.decode(a[f]);else a = void 0 !== a ? b.decode(a) : void 0;return a;
    }if (w(c)) for (f = 0, e = c.length; f < e; f++) c[f] = b.encode(c[f]);else c = "string" === typeof c || c instanceof String ? b.encode(c) : c;return this.segment(a, c, d);
  };var I = f.query;f.query = function (a, c) {
    if (!0 === a) return b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);if ("function" === typeof a) {
      var d = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace),
          f = a.call(this, d);this._parts.query = b.buildQuery(f || d, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);this.build(!c);return this;
    }return void 0 !== a && "string" !== typeof a ? (this._parts.query = b.buildQuery(a, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), this.build(!c), this) : I.call(this, a, c);
  };f.setQuery = function (a, c, d) {
    var f = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);if ("string" === typeof a || a instanceof String) f[a] = void 0 !== c ? c : null;else if ("object" === typeof a) for (var e in a) v.call(a, e) && (f[e] = a[e]);else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");this._parts.query = b.buildQuery(f, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);"string" !== typeof a && (d = c);this.build(!d);return this;
  };f.addQuery = function (a, c, d) {
    var f = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);b.addQuery(f, a, void 0 === c ? null : c);this._parts.query = b.buildQuery(f, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);"string" !== typeof a && (d = c);this.build(!d);return this;
  };f.removeQuery = function (a, c, d) {
    var f = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    b.removeQuery(f, a, c);this._parts.query = b.buildQuery(f, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);"string" !== typeof a && (d = c);this.build(!d);return this;
  };f.hasQuery = function (a, c, d) {
    var f = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);return b.hasQuery(f, a, c, d);
  };f.setSearch = f.setQuery;f.addSearch = f.addQuery;f.removeSearch = f.removeQuery;f.hasSearch = f.hasQuery;f.normalize = function () {
    return this._parts.urn ? this.normalizeProtocol(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build() : this.normalizeProtocol(!1).normalizeHostname(!1).normalizePort(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build();
  };f.normalizeProtocol = function (a) {
    "string" === typeof this._parts.protocol && (this._parts.protocol = this._parts.protocol.toLowerCase(), this.build(!a));return this;
  };f.normalizeHostname = function (a) {
    this._parts.hostname && (this.is("IDN") && e ? this._parts.hostname = e.toASCII(this._parts.hostname) : this.is("IPv6") && n && (this._parts.hostname = n.best(this._parts.hostname)), this._parts.hostname = this._parts.hostname.toLowerCase(), this.build(!a));return this;
  };f.normalizePort = function (a) {
    "string" === typeof this._parts.protocol && this._parts.port === b.defaultPorts[this._parts.protocol] && (this._parts.port = null, this.build(!a));return this;
  };f.normalizePath = function (a) {
    var c = this._parts.path;if (!c) return this;if (this._parts.urn) return (this._parts.path = b.recodeUrnPath(this._parts.path), this.build(!a), this);if ("/" === this._parts.path) return this;var d,
        f = "",
        e,
        k;"/" !== c.charAt(0) && (d = !0, c = "/" + c);if ("/.." === c.slice(-3) || "/." === c.slice(-2)) c += "/";c = c.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/");d && (f = c.substring(1).match(/^(\.\.\/)+/) || "") && (f = f[0]);for (;;) {
      e = c.indexOf("/..");if (-1 === e) break;else if (0 === e) {
        c = c.substring(3);continue;
      }k = c.substring(0, e).lastIndexOf("/");-1 === k && (k = e);c = c.substring(0, k) + c.substring(e + 3);
    }d && this.is("relative") && (c = f + c.substring(1));c = b.recodePath(c);this._parts.path = c;this.build(!a);return this;
  };f.normalizePathname = f.normalizePath;f.normalizeQuery = function (a) {
    "string" === typeof this._parts.query && (this._parts.query.length ? this.query(b.parseQuery(this._parts.query, this._parts.escapeQuerySpace)) : this._parts.query = null, this.build(!a));return this;
  };f.normalizeFragment = function (a) {
    this._parts.fragment || (this._parts.fragment = null, this.build(!a));return this;
  };f.normalizeSearch = f.normalizeQuery;f.normalizeHash = f.normalizeFragment;f.iso8859 = function () {
    var a = b.encode,
        c = b.decode;b.encode = escape;b.decode = decodeURIComponent;try {
      this.normalize();
    } finally {
      b.encode = a, b.decode = c;
    }return this;
  };
  f.unicode = function () {
    var a = b.encode,
        c = b.decode;b.encode = B;b.decode = unescape;try {
      this.normalize();
    } finally {
      b.encode = a, b.decode = c;
    }return this;
  };f.readable = function () {
    var a = this.clone();a.username("").password("").normalize();var c = "";a._parts.protocol && (c += a._parts.protocol + "://");a._parts.hostname && (a.is("punycode") && e ? (c += e.toUnicode(a._parts.hostname), a._parts.port && (c += ":" + a._parts.port)) : c += a.host());a._parts.hostname && a._parts.path && "/" !== a._parts.path.charAt(0) && (c += "/");c += a.path(!0);if (a._parts.query) {
      for (var d = "", f = 0, k = a._parts.query.split("&"), g = k.length; f < g; f++) {
        var u = (k[f] || "").split("="),
            d = d + ("&" + b.decodeQuery(u[0], this._parts.escapeQuerySpace).replace(/&/g, "%26"));void 0 !== u[1] && (d += "=" + b.decodeQuery(u[1], this._parts.escapeQuerySpace).replace(/&/g, "%26"));
      }c += "?" + d.substring(1);
    }return c += b.decodeQuery(a.hash(), !0);
  };f.absoluteTo = function (a) {
    var c = this.clone(),
        d = ["protocol", "username", "password", "hostname", "port"],
        f,
        e;if (this._parts.urn) throw Error("URNs do not have any generally defined hierarchical components");
    a instanceof b || (a = new b(a));c._parts.protocol || (c._parts.protocol = a._parts.protocol);if (this._parts.hostname) return c;for (f = 0; e = d[f]; f++) c._parts[e] = a._parts[e];c._parts.path ? ".." === c._parts.path.substring(-2) && (c._parts.path += "/") : (c._parts.path = a._parts.path, c._parts.query || (c._parts.query = a._parts.query));"/" !== c.path().charAt(0) && (d = (d = a.directory()) ? d : 0 === a.path().indexOf("/") ? "/" : "", c._parts.path = (d ? d + "/" : "") + c._parts.path, c.normalizePath());c.build();return c;
  };f.relativeTo = function (a) {
    var c = this.clone().normalize(),
        d,
        f,
        e;if (c._parts.urn) throw Error("URNs do not have any generally defined hierarchical components");a = new b(a).normalize();d = c._parts;f = a._parts;e = c.path();a = a.path();if ("/" !== e.charAt(0)) throw Error("URI is already relative");if ("/" !== a.charAt(0)) throw Error("Cannot calculate a URI relative to another relative URI");d.protocol === f.protocol && (d.protocol = null);if (d.username === f.username && d.password === f.password && null === d.protocol && null === d.username && null === d.password && d.hostname === f.hostname && d.port === f.port) d.hostname = null, d.port = null;else return c.build();if (e === a) return (d.path = "", c.build());e = b.commonPath(e, a);if (!e) return c.build();f = f.path.substring(e.length).replace(/[^\/]*$/, "").replace(/.*?\//g, "../");d.path = f + d.path.substring(e.length) || "./";return c.build();
  };f.equals = function (a) {
    var c = this.clone();a = new b(a);var d = {},
        f = {},
        e = {},
        k;c.normalize();a.normalize();if (c.toString() === a.toString()) return !0;d = c.query();f = a.query();c.query("");a.query("");if (c.toString() !== a.toString() || d.length !== f.length) return !1;d = b.parseQuery(d, this._parts.escapeQuerySpace);f = b.parseQuery(f, this._parts.escapeQuerySpace);for (k in d) if (v.call(d, k)) {
      if (!w(d[k])) {
        if (d[k] !== f[k]) return !1;
      } else if (!D(d[k], f[k])) return !1;e[k] = !0;
    }for (k in f) if (v.call(f, k) && !e[k]) return !1;return !0;
  };f.duplicateQueryParameters = function (a) {
    this._parts.duplicateQueryParameters = !!a;return this;
  };f.escapeQuerySpace = function (a) {
    this._parts.escapeQuerySpace = !!a;return this;
  };return b;
});
(function (e, n) {
  "object" === typeof exports ? module.exports = n(require("./URI")) : "function" === typeof define && define.amd ? define(["./URI"], n) : e.URITemplate = n(e.URI, e);
})(undefined, function (e, n) {
  function g(b) {
    if (g._cache[b]) return g._cache[b];if (!(this instanceof g)) return new g(b);this.expression = b;g._cache[b] = this;return this;
  }function l(b) {
    this.data = b;this.cache = {};
  }var b = n && n.URITemplate,
      h = Object.prototype.hasOwnProperty,
      A = g.prototype,
      w = { "": { prefix: "", separator: ",", named: !1, empty_name_separator: !1, encode: "encode" },
    "+": { prefix: "", separator: ",", named: !1, empty_name_separator: !1, encode: "encodeReserved" }, "#": { prefix: "#", separator: ",", named: !1, empty_name_separator: !1, encode: "encodeReserved" }, ".": { prefix: ".", separator: ".", named: !1, empty_name_separator: !1, encode: "encode" }, "/": { prefix: "/", separator: "/", named: !1, empty_name_separator: !1, encode: "encode" }, ";": { prefix: ";", separator: ";", named: !0, empty_name_separator: !1, encode: "encode" }, "?": { prefix: "?", separator: "&", named: !0, empty_name_separator: !0, encode: "encode" }, "&": { prefix: "&",
      separator: "&", named: !0, empty_name_separator: !0, encode: "encode" } };g._cache = {};g.EXPRESSION_PATTERN = /\{([^a-zA-Z0-9%_]?)([^\}]+)(\}|$)/g;g.VARIABLE_PATTERN = /^([^*:]+)((\*)|:(\d+))?$/;g.VARIABLE_NAME_PATTERN = /[^a-zA-Z0-9%_]/;g.expand = function (b, e) {
    var h = w[b.operator],
        l = h.named ? "Named" : "Unnamed",
        n = b.variables,
        t = [],
        r,
        p,
        f;for (f = 0; p = n[f]; f++) r = e.get(p.name), r.val.length ? t.push(g["expand" + l](r, h, p.explode, p.explode && h.separator || ",", p.maxlength, p.name)) : r.type && t.push("");return t.length ? h.prefix + t.join(h.separator) : "";
  };g.expandNamed = function (b, g, h, l, n, t) {
    var r = "",
        p = g.encode;g = g.empty_name_separator;var f = !b[p].length,
        v = 2 === b.type ? "" : e[p](t),
        q,
        x,
        w;x = 0;for (w = b.val.length; x < w; x++) n ? (q = e[p](b.val[x][1].substring(0, n)), 2 === b.type && (v = e[p](b.val[x][0].substring(0, n)))) : f ? (q = e[p](b.val[x][1]), 2 === b.type ? (v = e[p](b.val[x][0]), b[p].push([v, q])) : b[p].push([void 0, q])) : (q = b[p][x][1], 2 === b.type && (v = b[p][x][0])), r && (r += l), h ? r += v + (g || q ? "=" : "") + q : (x || (r += e[p](t) + (g || q ? "=" : "")), 2 === b.type && (r += v + ","), r += q);return r;
  };g.expandUnnamed = function (b, g, h, l, n) {
    var t = "",
        r = g.encode;g = g.empty_name_separator;var p = !b[r].length,
        f,
        v,
        q,
        w;q = 0;for (w = b.val.length; q < w; q++) n ? v = e[r](b.val[q][1].substring(0, n)) : p ? (v = e[r](b.val[q][1]), b[r].push([2 === b.type ? e[r](b.val[q][0]) : void 0, v])) : v = b[r][q][1], t && (t += l), 2 === b.type && (f = n ? e[r](b.val[q][0].substring(0, n)) : b[r][q][0], t += f, t = h ? t + (g || v ? "=" : "") : t + ","), t += v;return t;
  };g.noConflict = function () {
    n.URITemplate === g && (n.URITemplate = b);return g;
  };A.expand = function (b) {
    var e = "";this.parts && this.parts.length || this.parse();
    b instanceof l || (b = new l(b));for (var h = 0, n = this.parts.length; h < n; h++) e += "string" === typeof this.parts[h] ? this.parts[h] : g.expand(this.parts[h], b);return e;
  };A.parse = function () {
    var b = this.expression,
        e = g.EXPRESSION_PATTERN,
        h = g.VARIABLE_PATTERN,
        n = g.VARIABLE_NAME_PATTERN,
        l = [],
        t = 0,
        r,
        p,
        f;for (e.lastIndex = 0;;) {
      p = e.exec(b);if (null === p) {
        l.push(b.substring(t));break;
      } else l.push(b.substring(t, p.index)), t = p.index + p[0].length;if (!w[p[1]]) throw Error("Unknown Operator \"" + p[1] + "\" in \"" + p[0] + "\"");if (!p[3]) throw Error("Unclosed Expression \"" + p[0] + "\"");r = p[2].split(",");for (var v = 0, q = r.length; v < q; v++) {
        f = r[v].match(h);if (null === f) throw Error("Invalid Variable \"" + r[v] + "\" in \"" + p[0] + "\"");if (f[1].match(n)) throw Error("Invalid Variable Name \"" + f[1] + "\" in \"" + p[0] + "\"");r[v] = { name: f[1], explode: !!f[3], maxlength: f[4] && parseInt(f[4], 10) };
      }if (!r.length) throw Error("Expression Missing Variable(s) \"" + p[0] + "\"");l.push({ expression: p[0], operator: p[1], variables: r });
    }l.length || l.push(b);this.parts = l;return this;
  };l.prototype.get = function (b) {
    var e = this.data,
        g = { type: 0, val: [], encode: [], encodeReserved: [] },
        l;if (void 0 !== this.cache[b]) return this.cache[b];this.cache[b] = g;e = "[object Function]" === String(Object.prototype.toString.call(e)) ? e(b) : "[object Function]" === String(Object.prototype.toString.call(e[b])) ? e[b](b) : e[b];if (void 0 !== e && null !== e) if ("[object Array]" === String(Object.prototype.toString.call(e))) {
      l = 0;for (b = e.length; l < b; l++) void 0 !== e[l] && null !== e[l] && g.val.push([void 0, String(e[l])]);g.val.length && (g.type = 3);
    } else if ("[object Object]" === String(Object.prototype.toString.call(e))) {
      for (l in e) h.call(e, l) && void 0 !== e[l] && null !== e[l] && g.val.push([l, String(e[l])]);g.val.length && (g.type = 2);
    } else g.type = 1, g.val.push([void 0, String(e)]);return g;
  };e.expand = function (b, h) {
    var l = new g(b).expand(h);return new e(l);
  };return g;
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./IPv6":1,"./SecondLevelDomains":2,"./URI":3,"./punycode":5}],5:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.3 by @mathias */
'use strict';

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
})(undefined);
/* no initialization */ /* no final expression */ /* no condition */ /* no condition */
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalContext = require('./global-context');

var _globalContext2 = _interopRequireDefault(_globalContext);

/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
function delay(callback, context) {
  _globalContext2['default'].setTimeout(function (context) {
    callback.call(context);
  }, 4, context);
}

exports['default'] = delay;
module.exports = exports['default'];
},{"./global-context":7}],7:[function(require,module,exports){
(function (global){
/*
* Determines the global context. This should be either window (in the)
* case where we are in a browser) or global (in the case where we are in
* node)
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var globalContext;

if (typeof window === 'undefined') {
    globalContext = global;
} else {
    globalContext = window;
}

if (!globalContext) {
    throw new Error('Unable to set the global context to either window or global.');
}

exports['default'] = globalContext;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
/*
* This is a mock websocket event message that is passed into the onopen,
* opmessage, etc functions.
*
* @param {name: string} The name of the event
* @param {data: *} The data to send.
* @param {origin: string} The url of the place where the event is originating.
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
function socketEventMessage(name, data, origin) {
	var ports = null;
	var source = null;
	var bubbles = false;
	var cancelable = false;
	var lastEventId = '';
	var targetPlacehold = null;
	var messageEvent;

	try {
		messageEvent = new MessageEvent(name);
		messageEvent.initMessageEvent(name, bubbles, cancelable, data, origin, lastEventId);

		Object.defineProperties(messageEvent, {
			target: {
				get: function get() {
					return targetPlacehold;
				},
				set: function set(value) {
					targetPlacehold = value;
				}
			},
			srcElement: {
				get: function get() {
					return this.target;
				}
			},
			currentTarget: {
				get: function get() {
					return this.target;
				}
			}
		});
	} catch (e) {
		// We are unable to create a MessageEvent Object. This should only be happening in PhantomJS.
		messageEvent = {
			type: name,
			bubbles: bubbles,
			cancelable: cancelable,
			data: data,
			origin: origin,
			lastEventId: lastEventId,
			source: source,
			ports: ports,
			defaultPrevented: false,
			returnValue: true,
			clipboardData: undefined
		};

		Object.defineProperties(messageEvent, {
			target: {
				get: function get() {
					return targetPlacehold;
				},
				set: function set(value) {
					targetPlacehold = value;
				}
			},
			srcElement: {
				get: function get() {
					return this.target;
				}
			},
			currentTarget: {
				get: function get() {
					return this.target;
				}
			}
		});
	}

	return messageEvent;
}

exports['default'] = socketEventMessage;
module.exports = exports['default'];
},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _URIMinJs = require('../../URI.min.js');

var _URIMinJs2 = _interopRequireDefault(_URIMinJs);

/*
* The native websocket object will transform urls without a pathname to have just a /.
* As an example: ws://localhost:8080 would actually be ws://localhost:8080/ but ws://example.com/foo would not
* change. This function does this transformation to stay inline with the native websocket implementation.
*
* @param {url: string} The url to transform.
*/
function urlTransform(url) {
  var normalizedURL = (0, _URIMinJs2['default'])(url).toString();
  return normalizedURL;
}

exports['default'] = urlTransform;
module.exports = exports['default'];
},{"../../URI.min.js":4}],10:[function(require,module,exports){
/*
* This defines four methods: onopen, onmessage, onerror, and onclose. This is done this way instead of
* just placing the methods on the prototype because we need to capture the callback when it is defined like so:
*
* mockSocket.onopen = function() { // this is what we need to store };
*
* The only way is to capture the callback via the custom setter below and then place them into the correct
* namespace so they get invoked at the right time.
*
* @param {websocket: object} The websocket object which we want to define these properties onto
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function webSocketProperties(websocket) {
  var eventMessageSource = function eventMessageSource(callback) {
    return function (event) {
      event.target = websocket;
      callback.apply(websocket, arguments);
    };
  };

  Object.defineProperties(websocket, {
    onopen: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onopen;
      },
      set: function set(callback) {
        this._onopen = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnOpen', this._onopen, websocket);
      }
    },
    onmessage: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onmessage;
      },
      set: function set(callback) {
        this._onmessage = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnMessage', this._onmessage, websocket);
      }
    },
    onclose: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onclose;
      },
      set: function set(callback) {
        this._onclose = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnclose', this._onclose, websocket);
      }
    },
    onerror: {
      configurable: true,
      enumerable: true,
      get: function get() {
        return this._onerror;
      },
      set: function set(callback) {
        this._onerror = eventMessageSource(callback);
        this.service.setCallbackObserver('clientOnError', this._onerror, websocket);
      }
    }
  });
}

exports['default'] = webSocketProperties;
module.exports = exports['default'];
},{}],11:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _mockServer = require('./mock-server');

var _mockServer2 = _interopRequireDefault(_mockServer);

var _mockSocket = require('./mock-socket');

var _mockSocket2 = _interopRequireDefault(_mockSocket);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

_helpersGlobalContext2['default'].SocketService = _service2['default'];
_helpersGlobalContext2['default'].MockSocket = _mockSocket2['default'];
_helpersGlobalContext2['default'].MockServer = _mockServer2['default'];
},{"./helpers/global-context":7,"./mock-server":12,"./mock-socket":13,"./service":14}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _helpersUrlTransform = require('./helpers/url-transform');

var _helpersUrlTransform2 = _interopRequireDefault(_helpersUrlTransform);

var _helpersMessageEvent = require('./helpers/message-event');

var _helpersMessageEvent2 = _interopRequireDefault(_helpersMessageEvent);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

function MockServer(url) {
  var service = new _service2['default']();
  this.url = (0, _helpersUrlTransform2['default'])(url);

  _helpersGlobalContext2['default'].MockSocket.services[this.url] = service;

  this.service = service;
  // ignore possible query parameters
  if (url.indexOf(MockServer.unresolvableURL) === -1) {
    service.server = this;
  }
}

/*
* This URL can be used to emulate server that does not establish connection
*/
MockServer.unresolvableURL = 'ws://unresolvable_url';

MockServer.prototype = {
  service: null,

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {type: string}: The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {callback: function}: The callback which should be called when a certain event is fired.
  */
  on: function on(type, callback) {
    var observerKey;

    if (typeof callback !== 'function' || typeof type !== 'string') {
      return false;
    }

    switch (type) {
      case 'connection':
        observerKey = 'clientHasJoined';
        break;
      case 'message':
        observerKey = 'clientHasSentMessage';
        break;
      case 'close':
        observerKey = 'clientHasLeft';
        break;
    }

    // Make sure that the observerKey is valid before observing on it.
    if (typeof observerKey === 'string') {
      this.service.clearAll(observerKey);
      this.service.setCallbackObserver(observerKey, callback, this);
    }
  },

  /*
  * This send function will notify all mock clients via their onmessage callbacks that the server
  * has a message for them.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function send(data) {
    (0, _helpersDelay2['default'])(function () {
      this.service.sendMessageToClients((0, _helpersMessageEvent2['default'])('message', data, this.url));
    }, this);
  },

  /*
  * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
  */
  close: function close() {
    (0, _helpersDelay2['default'])(function () {
      this.service.closeConnectionFromServer((0, _helpersMessageEvent2['default'])('close', null, this.url));
    }, this);
  }
};

exports['default'] = MockServer;
module.exports = exports['default'];
},{"./helpers/delay":6,"./helpers/global-context":7,"./helpers/message-event":8,"./helpers/url-transform":9,"./service":14}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _helpersUrlTransform = require('./helpers/url-transform');

var _helpersUrlTransform2 = _interopRequireDefault(_helpersUrlTransform);

var _helpersMessageEvent = require('./helpers/message-event');

var _helpersMessageEvent2 = _interopRequireDefault(_helpersMessageEvent);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

var _helpersWebsocketProperties = require('./helpers/websocket-properties');

var _helpersWebsocketProperties2 = _interopRequireDefault(_helpersWebsocketProperties);

function MockSocket(url) {
  this.binaryType = 'blob';
  this.url = (0, _helpersUrlTransform2['default'])(url);
  this.readyState = _helpersGlobalContext2['default'].MockSocket.CONNECTING;
  this.service = _helpersGlobalContext2['default'].MockSocket.services[this.url];

  this._eventHandlers = {};

  (0, _helpersWebsocketProperties2['default'])(this);

  (0, _helpersDelay2['default'])(function () {
    // Let the service know that we are both ready to change our ready state and that
    // this client is connecting to the mock server.
    this.service.clientIsConnecting(this, this._updateReadyState);
  }, this);
}

MockSocket.CONNECTING = 0;
MockSocket.OPEN = 1;
MockSocket.CLOSING = 2;
MockSocket.CLOSED = 3;
MockSocket.services = {};

MockSocket.prototype = {

  /*
  * Holds the on*** callback functions. These are really just for the custom
  * getters that are defined in the helpers/websocket-properties. Accessing these properties is not advised.
  */
  _onopen: null,
  _onmessage: null,
  _onerror: null,
  _onclose: null,

  /*
  * This holds reference to the service object. The service object is how we can
  * communicate with the backend via the pub/sub model.
  *
  * The service has properties which we can use to observe or notifiy with.
  * this.service.notify('foo') & this.service.observe('foo', callback, context)
  */
  service: null,

  /*
  * Internal storage for event handlers. Basically, there could be more than one
  * handler per event so we store them all in array.
  */
  _eventHandlers: {},

  /*
  * This is a mock for EventTarget's addEventListener method. A bit naive and
  * doesn't implement third useCapture parameter but should be enough for most
  * (if not all) cases.
  *
  * @param {event: string}: Event name.
  * @param {handler: function}: Any callback function for event handling.
  */
  addEventListener: function addEventListener(event, handler) {
    if (!this._eventHandlers[event]) {
      this._eventHandlers[event] = [];
      var self = this;
      this['on' + event] = function (eventObject) {
        self.dispatchEvent(eventObject);
      };
    }
    this._eventHandlers[event].push(handler);
  },

  /*
  * This is a mock for EventTarget's removeEventListener method. A bit naive and
  * doesn't implement third useCapture parameter but should be enough for most
  * (if not all) cases.
  *
  * @param {event: string}: Event name.
  * @param {handler: function}: Any callback function for event handling. Should
  * be one of the functions used in the previous calls of addEventListener method.
  */
  removeEventListener: function removeEventListener(event, handler) {
    if (!this._eventHandlers[event]) {
      return;
    }
    var handlers = this._eventHandlers[event];
    handlers.splice(handlers.indexOf(handler), 1);
    if (!handlers.length) {
      delete this._eventHandlers[event];
      delete this['on' + event];
    }
  },

  /*
  * This is a mock for EventTarget's dispatchEvent method.
  *
  * @param {event: MessageEvent}: Some event, either native MessageEvent or an object
  * returned by require('./helpers/message-event')
  */
  dispatchEvent: function dispatchEvent(event) {
    var handlers = this._eventHandlers[event.type];
    if (!handlers) {
      return;
    }
    for (var i = 0; i < handlers.length; i++) {
      handlers[i].call(this, event);
    }
  },

  /*
  * This is a mock for the native send function found on the WebSocket object. It notifies the
  * service that it has sent a message.
  *
  * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
  */
  send: function send(data) {
    (0, _helpersDelay2['default'])(function () {
      this.service.sendMessageToServer((0, _helpersMessageEvent2['default'])('message', data, this.url));
    }, this);
  },

  /*
  * This is a mock for the native close function found on the WebSocket object. It notifies the
  * service that it is closing the connection.
  */
  close: function close() {
    (0, _helpersDelay2['default'])(function () {
      this.service.closeConnectionFromClient((0, _helpersMessageEvent2['default'])('close', null, this.url), this);
    }, this);
  },

  /*
  * This is a private method that can be used to change the readyState. This is used
  * like this: this.protocol.subject.observe('updateReadyState', this._updateReadyState, this);
  * so that the service and the server can change the readyState simply be notifing a namespace.
  *
  * @param {newReadyState: number}: The new ready state. Must be 0-4
  */
  _updateReadyState: function _updateReadyState(newReadyState) {
    if (newReadyState >= 0 && newReadyState <= 4) {
      this.readyState = newReadyState;
    }
  }
};

exports['default'] = MockSocket;
module.exports = exports['default'];
},{"./helpers/delay":6,"./helpers/global-context":7,"./helpers/message-event":8,"./helpers/url-transform":9,"./helpers/websocket-properties":10}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersMessageEvent = require('./helpers/message-event');

var _helpersMessageEvent2 = _interopRequireDefault(_helpersMessageEvent);

var _helpersGlobalContext = require('./helpers/global-context');

var _helpersGlobalContext2 = _interopRequireDefault(_helpersGlobalContext);

function SocketService() {
  this.list = {};
}

SocketService.prototype = {
  server: null,

  /*
  * This notifies the mock server that a client is connecting and also sets up
  * the ready state observer.
  *
  * @param {client: object} the context of the client
  * @param {readyStateFunction: function} the function that will be invoked on a ready state change
  */
  clientIsConnecting: function clientIsConnecting(client, readyStateFunction) {
    this.observe('updateReadyState', readyStateFunction, client);

    // if the server has not been set then we notify the onclose method of this client
    if (!this.server) {
      this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSED);
      this.notifyOnlyFor(client, 'clientOnError', (0, _helpersMessageEvent2['default'])('error', null, client.url));
      return false;
    }

    this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.OPEN);
    this.notify('clientHasJoined', this.server);
    this.notifyOnlyFor(client, 'clientOnOpen', (0, _helpersMessageEvent2['default'])('open', null, this.server.url));
  },

  /*
  * Closes a connection from the server's perspective. This should
  * close all clients.
  *
  * @param {messageEvent: object} the mock message event.
  */
  closeConnectionFromServer: function closeConnectionFromServer(messageEvent) {
    this.notify('updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSING);
    this.notify('clientOnclose', messageEvent);
    this.notify('updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSED);
    this.notify('clientHasLeft');
  },

  /*
  * Closes a connection from the clients perspective. This
  * should only close the client who initiated the close and not
  * all of the other clients.
  *
  * @param {messageEvent: object} the mock message event.
  * @param {client: object} the context of the client
  */
  closeConnectionFromClient: function closeConnectionFromClient(messageEvent, client) {
    if (client.readyState === _helpersGlobalContext2['default'].MockSocket.OPEN) {
      this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSING);
      this.notifyOnlyFor(client, 'clientOnclose', messageEvent);
      this.notifyOnlyFor(client, 'updateReadyState', _helpersGlobalContext2['default'].MockSocket.CLOSED);
      this.notify('clientHasLeft');
    }
  },

  /*
  * Notifies the mock server that a client has sent a message.
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToServer: function sendMessageToServer(messageEvent) {
    this.notify('clientHasSentMessage', messageEvent.data, messageEvent);
  },

  /*
  * Notifies all clients that the server has sent a message
  *
  * @param {messageEvent: object} the mock message event.
  */
  sendMessageToClients: function sendMessageToClients(messageEvent) {
    this.notify('clientOnMessage', messageEvent);
  },

  /*
  * Setup the callback function observers for both the server and client.
  *
  * @param {observerKey: string} either: connection, message or close
  * @param {callback: function} the callback to be invoked
  * @param {server: object} the context of the server
  */
  setCallbackObserver: function setCallbackObserver(observerKey, callback, server) {
    this.observe(observerKey, callback, server);
  },

  /*
  * Binds a callback to a namespace. If notify is called on a namespace all "observers" will be
  * fired with the context that is passed in.
  *
  * @param {namespace: string}
  * @param {callback: function}
  * @param {context: object}
  */
  observe: function observe(namespace, callback, context) {

    // Make sure the arguments are of the correct type
    if (typeof namespace !== 'string' || typeof callback !== 'function' || context && typeof context !== 'object') {
      return false;
    }

    // If a namespace has not been created before then we need to "initialize" the namespace
    if (!this.list[namespace]) {
      this.list[namespace] = [];
    }

    this.list[namespace].push({ callback: callback, context: context });
  },

  /*
  * Remove all observers from a given namespace.
  *
  * @param {namespace: string} The namespace to clear.
  */
  clearAll: function clearAll(namespace) {

    if (!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    this.list[namespace] = [];
  },

  /*
  * Notify all callbacks that have been bound to the given namespace.
  *
  * @param {namespace: string} The namespace to notify observers on.
  * @param {namespace: url} The url to notify observers on.
  */
  notify: function notify(namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 1);

    if (!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for (var i = 0, len = this.list[namespace].length; i < len; i++) {
      this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
    }
  },

  /*
  * Notify only the callback of the given context and namespace.
  *
  * @param {context: object} the context to match against.
  * @param {namespace: string} The namespace to notify observers on.
  */
  notifyOnlyFor: function notifyOnlyFor(context, namespace) {

    // This strips the namespace from the list of args as we dont want to pass that into the callback.
    var argumentsForCallback = Array.prototype.slice.call(arguments, 2);

    if (!this.verifyNamespaceArg(namespace)) {
      return false;
    }

    // Loop over all of the observers and fire the callback function with the context.
    for (var i = 0, len = this.list[namespace].length; i < len; i++) {
      if (this.list[namespace][i].context === context) {
        this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
      }
    }
  },

  /*
  * Verifies that the namespace is valid.
  *
  * @param {namespace: string} The namespace to verify.
  */
  verifyNamespaceArg: function verifyNamespaceArg(namespace) {
    if (typeof namespace !== 'string' || !this.list[namespace]) {
      return false;
    }

    return true;
  }
};

exports['default'] = SocketService;
module.exports = exports['default'];
},{"./helpers/global-context":7,"./helpers/message-event":8}]},{},[11])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm9jY29saS1mYXN0LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIklQdjYuanMiLCJTZWNvbmRMZXZlbERvbWFpbnMuanMiLCJVUkkuanMiLCJVUkkubWluLmpzIiwicHVueWNvZGUuanMiLCJzcmMvaGVscGVycy9kZWxheS5qcyIsInNyYy9oZWxwZXJzL2dsb2JhbC1jb250ZXh0LmpzIiwic3JjL2hlbHBlcnMvbWVzc2FnZS1ldmVudC5qcyIsInNyYy9oZWxwZXJzL3VybC10cmFuc2Zvcm0uanMiLCJzcmMvaGVscGVycy93ZWJzb2NrZXQtcHJvcGVydGllcy5qcyIsInNyYy9tYWluLmpzIiwic3JjL21vY2stc2VydmVyLmpzIiwic3JjL21vY2stc29ja2V0LmpzIiwic3JjL3NlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDemlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIFVSSS5qcyAtIE11dGF0aW5nIFVSTHNcbiAqIElQdjYgU3VwcG9ydFxuICpcbiAqIFZlcnNpb246IDEuMTUuMlxuICpcbiAqIEF1dGhvcjogUm9kbmV5IFJlaG1cbiAqIFdlYjogaHR0cDovL21lZGlhbGl6ZS5naXRodWIuaW8vVVJJLmpzL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyXG4gKiAgIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2VcbiAqICAgR1BMIHYzIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9HUEwtMy4wXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QuSVB2NiA9IGZhY3Rvcnkocm9vdCk7XG4gIH1cbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKHJvb3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gIHZhciBfaW4gPSBcImZlODA6MDAwMDowMDAwOjAwMDA6MDIwNDo2MWZmOmZlOWQ6ZjE1NlwiO1xuICB2YXIgX291dCA9IElQdjYuYmVzdChfaW4pO1xuICB2YXIgX2V4cGVjdGVkID0gXCJmZTgwOjoyMDQ6NjFmZjpmZTlkOmYxNTZcIjtcbiAgIGNvbnNvbGUubG9nKF9pbiwgX291dCwgX2V4cGVjdGVkLCBfb3V0ID09PSBfZXhwZWN0ZWQpO1xuICAqL1xuXG4gIC8vIHNhdmUgY3VycmVudCBJUHY2IHZhcmlhYmxlLCBpZiBhbnlcbiAgdmFyIF9JUHY2ID0gcm9vdCAmJiByb290LklQdjY7XG5cbiAgZnVuY3Rpb24gYmVzdFByZXNlbnRhdGlvbihhZGRyZXNzKSB7XG4gICAgLy8gYmFzZWQgb246XG4gICAgLy8gSmF2YXNjcmlwdCB0byB0ZXN0IGFuIElQdjYgYWRkcmVzcyBmb3IgcHJvcGVyIGZvcm1hdCwgYW5kIHRvXG4gICAgLy8gcHJlc2VudCB0aGUgXCJiZXN0IHRleHQgcmVwcmVzZW50YXRpb25cIiBhY2NvcmRpbmcgdG8gSUVURiBEcmFmdCBSRkMgYXRcbiAgICAvLyBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1pZXRmLTZtYW4tdGV4dC1hZGRyLXJlcHJlc2VudGF0aW9uLTA0XG4gICAgLy8gOCBGZWIgMjAxMCBSaWNoIEJyb3duLCBEYXJ0d2FyZSwgTExDXG4gICAgLy8gUGxlYXNlIGZlZWwgZnJlZSB0byB1c2UgdGhpcyBjb2RlIGFzIGxvbmcgYXMgeW91IHByb3ZpZGUgYSBsaW5rIHRvXG4gICAgLy8gaHR0cDovL3d3dy5pbnRlcm1hcHBlci5jb21cbiAgICAvLyBodHRwOi8vaW50ZXJtYXBwZXIuY29tL3N1cHBvcnQvdG9vbHMvSVBWNi1WYWxpZGF0b3IuYXNweFxuICAgIC8vIGh0dHA6Ly9kb3dubG9hZC5kYXJ0d2FyZS5jb20vdGhpcmRwYXJ0eS9pcHY2dmFsaWRhdG9yLmpzXG5cbiAgICB2YXIgX2FkZHJlc3MgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIHNlZ21lbnRzID0gX2FkZHJlc3Muc3BsaXQoJzonKTtcbiAgICB2YXIgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuICAgIHZhciB0b3RhbCA9IDg7XG5cbiAgICAvLyB0cmltIGNvbG9ucyAoOjogb3IgOjphOmI6Y+KApiBvciDigKZhOmI6Yzo6KVxuICAgIGlmIChzZWdtZW50c1swXSA9PT0gJycgJiYgc2VnbWVudHNbMV0gPT09ICcnICYmIHNlZ21lbnRzWzJdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4gOjpcbiAgICAgIC8vIHJlbW92ZSBmaXJzdCB0d28gaXRlbXNcbiAgICAgIHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudHNbMF0gPT09ICcnICYmIHNlZ21lbnRzWzFdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4gOjp4eHh4XG4gICAgICAvLyByZW1vdmUgdGhlIGZpcnN0IGl0ZW1cbiAgICAgIHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgfSBlbHNlIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXSA9PT0gJycgJiYgc2VnbWVudHNbbGVuZ3RoIC0gMl0gPT09ICcnKSB7XG4gICAgICAvLyBtdXN0IGhhdmUgYmVlbiB4eHh4OjpcbiAgICAgIHNlZ21lbnRzLnBvcCgpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIC8vIGFkanVzdCB0b3RhbCBzZWdtZW50cyBmb3IgSVB2NCB0cmFpbGVyXG4gICAgaWYgKHNlZ21lbnRzW2xlbmd0aCAtIDFdLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgIC8vIGZvdW5kIGEgXCIuXCIgd2hpY2ggbWVhbnMgSVB2NFxuICAgICAgdG90YWwgPSA3O1xuICAgIH1cblxuICAgIC8vIGZpbGwgZW1wdHkgc2VnbWVudHMgdGhlbSB3aXRoIFwiMDAwMFwiXG4gICAgdmFyIHBvcztcbiAgICBmb3IgKHBvcyA9IDA7IHBvcyA8IGxlbmd0aDsgcG9zKyspIHtcbiAgICAgIGlmIChzZWdtZW50c1twb3NdID09PSAnJykge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zIDwgdG90YWwpIHtcbiAgICAgIHNlZ21lbnRzLnNwbGljZShwb3MsIDEsICcwMDAwJyk7XG4gICAgICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoIDwgdG90YWwpIHtcbiAgICAgICAgc2VnbWVudHMuc3BsaWNlKHBvcywgMCwgJzAwMDAnKTtcbiAgICAgIH1cblxuICAgICAgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIHN0cmlwIGxlYWRpbmcgemVyb3NcbiAgICB2YXIgX3NlZ21lbnRzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgX3NlZ21lbnRzID0gc2VnbWVudHNbaV0uc3BsaXQoJycpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgaWYgKF9zZWdtZW50c1swXSA9PT0gJzAnICYmIF9zZWdtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgX3NlZ21lbnRzLnNwbGljZSgwLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZWdtZW50c1tpXSA9IF9zZWdtZW50cy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvLyBmaW5kIGxvbmdlc3Qgc2VxdWVuY2Ugb2YgemVyb2VzIGFuZCBjb2FsZXNjZSB0aGVtIGludG8gb25lIHNlZ21lbnRcbiAgICB2YXIgYmVzdCA9IC0xO1xuICAgIHZhciBfYmVzdCA9IDA7XG4gICAgdmFyIF9jdXJyZW50ID0gMDtcbiAgICB2YXIgY3VycmVudCA9IC0xO1xuICAgIHZhciBpbnplcm9lcyA9IGZhbHNlO1xuICAgIC8vIGk7IGFscmVhZHkgZGVjbGFyZWRcblxuICAgIGZvciAoaSA9IDA7IGkgPCB0b3RhbDsgaSsrKSB7XG4gICAgICBpZiAoaW56ZXJvZXMpIHtcbiAgICAgICAgaWYgKHNlZ21lbnRzW2ldID09PSAnMCcpIHtcbiAgICAgICAgICBfY3VycmVudCArPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluemVyb2VzID0gZmFsc2U7XG4gICAgICAgICAgaWYgKF9jdXJyZW50ID4gX2Jlc3QpIHtcbiAgICAgICAgICAgIGJlc3QgPSBjdXJyZW50O1xuICAgICAgICAgICAgX2Jlc3QgPSBfY3VycmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzZWdtZW50c1tpXSA9PT0gJzAnKSB7XG4gICAgICAgICAgaW56ZXJvZXMgPSB0cnVlO1xuICAgICAgICAgIGN1cnJlbnQgPSBpO1xuICAgICAgICAgIF9jdXJyZW50ID0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfY3VycmVudCA+IF9iZXN0KSB7XG4gICAgICBiZXN0ID0gY3VycmVudDtcbiAgICAgIF9iZXN0ID0gX2N1cnJlbnQ7XG4gICAgfVxuXG4gICAgaWYgKF9iZXN0ID4gMSkge1xuICAgICAgc2VnbWVudHMuc3BsaWNlKGJlc3QsIF9iZXN0LCAnJyk7XG4gICAgfVxuXG4gICAgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuXG4gICAgLy8gYXNzZW1ibGUgcmVtYWluaW5nIHNlZ21lbnRzXG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGlmIChzZWdtZW50c1swXSA9PT0gJycpIHtcbiAgICAgIHJlc3VsdCA9ICc6JztcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSBzZWdtZW50c1tpXTtcbiAgICAgIGlmIChpID09PSBsZW5ndGggLSAxKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQgKz0gJzonO1xuICAgIH1cblxuICAgIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXSA9PT0gJycpIHtcbiAgICAgIHJlc3VsdCArPSAnOic7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlICovXG4gICAgaWYgKHJvb3QuSVB2NiA9PT0gdGhpcykge1xuICAgICAgcm9vdC5JUHY2ID0gX0lQdjY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJlc3Q6IGJlc3RQcmVzZW50YXRpb24sXG4gICAgbm9Db25mbGljdDogbm9Db25mbGljdFxuICB9O1xufSk7IiwiLyohXG4gKiBVUkkuanMgLSBNdXRhdGluZyBVUkxzXG4gKiBTZWNvbmQgTGV2ZWwgRG9tYWluIChTTEQpIFN1cHBvcnRcbiAqXG4gKiBWZXJzaW9uOiAxLjE1LjJcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAndXNlIHN0cmljdCc7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZVxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LlNlY29uZExldmVsRG9tYWlucyA9IGZhY3Rvcnkocm9vdCk7XG4gIH1cbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKHJvb3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIHNhdmUgY3VycmVudCBTZWNvbmRMZXZlbERvbWFpbnMgdmFyaWFibGUsIGlmIGFueVxuICB2YXIgX1NlY29uZExldmVsRG9tYWlucyA9IHJvb3QgJiYgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnM7XG5cbiAgdmFyIFNMRCA9IHtcbiAgICAvLyBsaXN0IG9mIGtub3duIFNlY29uZCBMZXZlbCBEb21haW5zXG4gICAgLy8gY29udmVydGVkIGxpc3Qgb2YgU0xEcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9nYXZpbmdtaWxsZXIvc2Vjb25kLWxldmVsLWRvbWFpbnNcbiAgICAvLyAtLS0tXG4gICAgLy8gcHVibGljc3VmZml4Lm9yZyBpcyBtb3JlIGN1cnJlbnQgYW5kIGFjdHVhbGx5IHVzZWQgYnkgYSBjb3VwbGUgb2YgYnJvd3NlcnMgaW50ZXJuYWxseS5cbiAgICAvLyBkb3duc2lkZSBpcyBpdCBhbHNvIGNvbnRhaW5zIGRvbWFpbnMgbGlrZSBcImR5bmRucy5vcmdcIiAtIHdoaWNoIGlzIGZpbmUgZm9yIHRoZSBzZWN1cml0eVxuICAgIC8vIGlzc3VlcyBicm93c2VyIGhhdmUgdG8gZGVhbCB3aXRoIChTT1AgZm9yIGNvb2tpZXMsIGV0YykgLSBidXQgaXMgd2F5IG92ZXJib2FyZCBmb3IgVVJJLmpzXG4gICAgLy8gLS0tLVxuICAgIGxpc3Q6IHtcbiAgICAgICdhYyc6ICcgY29tIGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2FlJzogJyBhYyBjbyBnb3YgbWlsIG5hbWUgbmV0IG9yZyBwcm8gc2NoICcsXG4gICAgICAnYWYnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdhbCc6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdhbyc6ICcgY28gZWQgZ3YgaXQgb2cgcGIgJyxcbiAgICAgICdhcic6ICcgY29tIGVkdSBnb2IgZ292IGludCBtaWwgbmV0IG9yZyB0dXIgJyxcbiAgICAgICdhdCc6ICcgYWMgY28gZ3Ygb3IgJyxcbiAgICAgICdhdSc6ICcgYXNuIGNvbSBjc2lybyBlZHUgZ292IGlkIG5ldCBvcmcgJyxcbiAgICAgICdiYSc6ICcgY28gY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgcnMgdW5iaSB1bm1vIHVuc2EgdW50eiB1bnplICcsXG4gICAgICAnYmInOiAnIGJpeiBjbyBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgc3RvcmUgdHYgJyxcbiAgICAgICdiaCc6ICcgYml6IGNjIGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ2JuJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnYm8nOiAnIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHYgJyxcbiAgICAgICdicic6ICcgYWRtIGFkdiBhZ3IgYW0gYXJxIGFydCBhdG8gYiBiaW8gYmxvZyBibWQgY2ltIGNuZyBjbnQgY29tIGNvb3AgZWNuIGVkdSBlbmcgZXNwIGV0YyBldGkgZmFyIGZsb2cgZm0gZm5kIGZvdCBmc3QgZzEyIGdnZiBnb3YgaW1iIGluZCBpbmYgam9yIGp1cyBsZWwgbWF0IG1lZCBtaWwgbXVzIG5ldCBub20gbm90IG50ciBvZG8gb3JnIHBwZyBwcm8gcHNjIHBzaSBxc2wgcmVjIHNsZyBzcnYgdG1wIHRyZCB0dXIgdHYgdmV0IHZsb2cgd2lraSB6bGcgJyxcbiAgICAgICdicyc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2J6JzogJyBkdSBldCBvbSBvdiByZyAnLFxuICAgICAgJ2NhJzogJyBhYiBiYyBtYiBuYiBuZiBubCBucyBudCBudSBvbiBwZSBxYyBzayB5ayAnLFxuICAgICAgJ2NrJzogJyBiaXogY28gZWR1IGdlbiBnb3YgaW5mbyBuZXQgb3JnICcsXG4gICAgICAnY24nOiAnIGFjIGFoIGJqIGNvbSBjcSBlZHUgZmogZ2QgZ292IGdzIGd4IGd6IGhhIGhiIGhlIGhpIGhsIGhuIGpsIGpzIGp4IGxuIG1pbCBuZXQgbm0gbnggb3JnIHFoIHNjIHNkIHNoIHNuIHN4IHRqIHR3IHhqIHh6IHluIHpqICcsXG4gICAgICAnY28nOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ2NyJzogJyBhYyBjIGNvIGVkIGZpIGdvIG9yIHNhICcsXG4gICAgICAnY3knOiAnIGFjIGJpeiBjb20gZWtsb2dlcyBnb3YgbHRkIG5hbWUgbmV0IG9yZyBwYXJsaWFtZW50IHByZXNzIHBybyB0bSAnLFxuICAgICAgJ2RvJzogJyBhcnQgY29tIGVkdSBnb2IgZ292IG1pbCBuZXQgb3JnIHNsZCB3ZWIgJyxcbiAgICAgICdkeic6ICcgYXJ0IGFzc28gY29tIGVkdSBnb3YgbmV0IG9yZyBwb2wgJyxcbiAgICAgICdlYyc6ICcgY29tIGVkdSBmaW4gZ292IGluZm8gbWVkIG1pbCBuZXQgb3JnIHBybyAnLFxuICAgICAgJ2VnJzogJyBjb20gZWR1IGV1biBnb3YgbWlsIG5hbWUgbmV0IG9yZyBzY2kgJyxcbiAgICAgICdlcic6ICcgY29tIGVkdSBnb3YgaW5kIG1pbCBuZXQgb3JnIHJvY2hlc3QgdyAnLFxuICAgICAgJ2VzJzogJyBjb20gZWR1IGdvYiBub20gb3JnICcsXG4gICAgICAnZXQnOiAnIGJpeiBjb20gZWR1IGdvdiBpbmZvIG5hbWUgbmV0IG9yZyAnLFxuICAgICAgJ2ZqJzogJyBhYyBiaXogY29tIGluZm8gbWlsIG5hbWUgbmV0IG9yZyBwcm8gJyxcbiAgICAgICdmayc6ICcgYWMgY28gZ292IG5ldCBub20gb3JnICcsXG4gICAgICAnZnInOiAnIGFzc28gY29tIGYgZ291diBub20gcHJkIHByZXNzZSB0bSAnLFxuICAgICAgJ2dnJzogJyBjbyBuZXQgb3JnICcsXG4gICAgICAnZ2gnOiAnIGNvbSBlZHUgZ292IG1pbCBvcmcgJyxcbiAgICAgICdnbic6ICcgYWMgY29tIGdvdiBuZXQgb3JnICcsXG4gICAgICAnZ3InOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnZ3QnOiAnIGNvbSBlZHUgZ29iIGluZCBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2d1JzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnaGsnOiAnIGNvbSBlZHUgZ292IGlkdiBuZXQgb3JnICcsXG4gICAgICAnaHUnOiAnIDIwMDAgYWdyYXIgYm9sdCBjYXNpbm8gY2l0eSBjbyBlcm90aWNhIGVyb3Rpa2EgZmlsbSBmb3J1bSBnYW1lcyBob3RlbCBpbmZvIGluZ2F0bGFuIGpvZ2FzeiBrb255dmVsbyBsYWthcyBtZWRpYSBuZXdzIG9yZyBwcml2IHJla2xhbSBzZXggc2hvcCBzcG9ydCBzdWxpIHN6ZXggdG0gdG96c2RlIHV0YXphcyB2aWRlbyAnLFxuICAgICAgJ2lkJzogJyBhYyBjbyBnbyBtaWwgbmV0IG9yIHNjaCB3ZWIgJyxcbiAgICAgICdpbCc6ICcgYWMgY28gZ292IGlkZiBrMTIgbXVuaSBuZXQgb3JnICcsXG4gICAgICAnaW4nOiAnIGFjIGNvIGVkdSBlcm5ldCBmaXJtIGdlbiBnb3YgaSBpbmQgbWlsIG5ldCBuaWMgb3JnIHJlcyAnLFxuICAgICAgJ2lxJzogJyBjb20gZWR1IGdvdiBpIG1pbCBuZXQgb3JnICcsXG4gICAgICAnaXInOiAnIGFjIGNvIGRuc3NlYyBnb3YgaSBpZCBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ2l0JzogJyBlZHUgZ292ICcsXG4gICAgICAnamUnOiAnIGNvIG5ldCBvcmcgJyxcbiAgICAgICdqbyc6ICcgY29tIGVkdSBnb3YgbWlsIG5hbWUgbmV0IG9yZyBzY2ggJyxcbiAgICAgICdqcCc6ICcgYWMgYWQgY28gZWQgZ28gZ3IgbGcgbmUgb3IgJyxcbiAgICAgICdrZSc6ICcgYWMgY28gZ28gaW5mbyBtZSBtb2JpIG5lIG9yIHNjICcsXG4gICAgICAna2gnOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIHBlciAnLFxuICAgICAgJ2tpJzogJyBiaXogY29tIGRlIGVkdSBnb3YgaW5mbyBtb2IgbmV0IG9yZyB0ZWwgJyxcbiAgICAgICdrbSc6ICcgYXNzbyBjb20gY29vcCBlZHUgZ291diBrIG1lZGVjaW4gbWlsIG5vbSBub3RhaXJlcyBwaGFybWFjaWVucyBwcmVzc2UgdG0gdmV0ZXJpbmFpcmUgJyxcbiAgICAgICdrbic6ICcgZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAna3InOiAnIGFjIGJ1c2FuIGNodW5nYnVrIGNodW5nbmFtIGNvIGRhZWd1IGRhZWplb24gZXMgZ2FuZ3dvbiBnbyBnd2FuZ2p1IGd5ZW9uZ2J1ayBneWVvbmdnaSBneWVvbmduYW0gaHMgaW5jaGVvbiBqZWp1IGplb25idWsgamVvbm5hbSBrIGtnIG1pbCBtcyBuZSBvciBwZSByZSBzYyBzZW91bCB1bHNhbiAnLFxuICAgICAgJ2t3JzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAna3knOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdreic6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdsYic6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2xrJzogJyBhc3NuIGNvbSBlZHUgZ292IGdycCBob3RlbCBpbnQgbHRkIG5ldCBuZ28gb3JnIHNjaCBzb2Mgd2ViICcsXG4gICAgICAnbHInOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdsdic6ICcgYXNuIGNvbSBjb25mIGVkdSBnb3YgaWQgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdseSc6ICcgY29tIGVkdSBnb3YgaWQgbWVkIG5ldCBvcmcgcGxjIHNjaCAnLFxuICAgICAgJ21hJzogJyBhYyBjbyBnb3YgbSBuZXQgb3JnIHByZXNzICcsXG4gICAgICAnbWMnOiAnIGFzc28gdG0gJyxcbiAgICAgICdtZSc6ICcgYWMgY28gZWR1IGdvdiBpdHMgbmV0IG9yZyBwcml2ICcsXG4gICAgICAnbWcnOiAnIGNvbSBlZHUgZ292IG1pbCBub20gb3JnIHByZCB0bSAnLFxuICAgICAgJ21rJzogJyBjb20gZWR1IGdvdiBpbmYgbmFtZSBuZXQgb3JnIHBybyAnLFxuICAgICAgJ21sJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnIHByZXNzZSAnLFxuICAgICAgJ21uJzogJyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ21vJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbXQnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdtdic6ICcgYWVybyBiaXogY29tIGNvb3AgZWR1IGdvdiBpbmZvIGludCBtaWwgbXVzZXVtIG5hbWUgbmV0IG9yZyBwcm8gJyxcbiAgICAgICdtdyc6ICcgYWMgY28gY29tIGNvb3AgZWR1IGdvdiBpbnQgbXVzZXVtIG5ldCBvcmcgJyxcbiAgICAgICdteCc6ICcgY29tIGVkdSBnb2IgbmV0IG9yZyAnLFxuICAgICAgJ215JzogJyBjb20gZWR1IGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ25mJzogJyBhcnRzIGNvbSBmaXJtIGluZm8gbmV0IG90aGVyIHBlciByZWMgc3RvcmUgd2ViICcsXG4gICAgICAnbmcnOiAnIGJpeiBjb20gZWR1IGdvdiBtaWwgbW9iaSBuYW1lIG5ldCBvcmcgc2NoICcsXG4gICAgICAnbmknOiAnIGFjIGNvIGNvbSBlZHUgZ29iIG1pbCBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ25wJzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ25yJzogJyBiaXogY29tIGVkdSBnb3YgaW5mbyBuZXQgb3JnICcsXG4gICAgICAnb20nOiAnIGFjIGJpeiBjbyBjb20gZWR1IGdvdiBtZWQgbWlsIG11c2V1bSBuZXQgb3JnIHBybyBzY2ggJyxcbiAgICAgICdwZSc6ICcgY29tIGVkdSBnb2IgbWlsIG5ldCBub20gb3JnIHNsZCAnLFxuICAgICAgJ3BoJzogJyBjb20gZWR1IGdvdiBpIG1pbCBuZXQgbmdvIG9yZyAnLFxuICAgICAgJ3BrJzogJyBiaXogY29tIGVkdSBmYW0gZ29iIGdvayBnb24gZ29wIGdvcyBnb3YgbmV0IG9yZyB3ZWIgJyxcbiAgICAgICdwbCc6ICcgYXJ0IGJpYWx5c3RvayBiaXogY29tIGVkdSBnZGEgZ2RhbnNrIGdvcnpvdyBnb3YgaW5mbyBrYXRvd2ljZSBrcmFrb3cgbG9keiBsdWJsaW4gbWlsIG5ldCBuZ28gb2xzenR5biBvcmcgcG96bmFuIHB3ciByYWRvbSBzbHVwc2sgc3pjemVjaW4gdG9ydW4gd2Fyc3phd2Egd2F3IHdyb2Mgd3JvY2xhdyB6Z29yYSAnLFxuICAgICAgJ3ByJzogJyBhYyBiaXogY29tIGVkdSBlc3QgZ292IGluZm8gaXNsYSBuYW1lIG5ldCBvcmcgcHJvIHByb2YgJyxcbiAgICAgICdwcyc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyBwbG8gc2VjICcsXG4gICAgICAncHcnOiAnIGJlbGF1IGNvIGVkIGdvIG5lIG9yICcsXG4gICAgICAncm8nOiAnIGFydHMgY29tIGZpcm0gaW5mbyBub20gbnQgb3JnIHJlYyBzdG9yZSB0bSB3d3cgJyxcbiAgICAgICdycyc6ICcgYWMgY28gZWR1IGdvdiBpbiBvcmcgJyxcbiAgICAgICdzYic6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3NjJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnc2gnOiAnIGNvIGNvbSBlZHUgZ292IG5ldCBub20gb3JnICcsXG4gICAgICAnc2wnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdzdCc6ICcgY28gY29tIGNvbnN1bGFkbyBlZHUgZW1iYWl4YWRhIGdvdiBtaWwgbmV0IG9yZyBwcmluY2lwZSBzYW90b21lIHN0b3JlICcsXG4gICAgICAnc3YnOiAnIGNvbSBlZHUgZ29iIG9yZyByZWQgJyxcbiAgICAgICdzeic6ICcgYWMgY28gb3JnICcsXG4gICAgICAndHInOiAnIGF2IGJicyBiZWwgYml6IGNvbSBkciBlZHUgZ2VuIGdvdiBpbmZvIGsxMiBuYW1lIG5ldCBvcmcgcG9sIHRlbCB0c2sgdHYgd2ViICcsXG4gICAgICAndHQnOiAnIGFlcm8gYml6IGNhdCBjbyBjb20gY29vcCBlZHUgZ292IGluZm8gaW50IGpvYnMgbWlsIG1vYmkgbXVzZXVtIG5hbWUgbmV0IG9yZyBwcm8gdGVsIHRyYXZlbCAnLFxuICAgICAgJ3R3JzogJyBjbHViIGNvbSBlYml6IGVkdSBnYW1lIGdvdiBpZHYgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdtdSc6ICcgYWMgY28gY29tIGdvdiBuZXQgb3Igb3JnICcsXG4gICAgICAnbXonOiAnIGFjIGNvIGVkdSBnb3Ygb3JnICcsXG4gICAgICAnbmEnOiAnIGNvIGNvbSAnLFxuICAgICAgJ256JzogJyBhYyBjbyBjcmkgZ2VlayBnZW4gZ292dCBoZWFsdGggaXdpIG1hb3JpIG1pbCBuZXQgb3JnIHBhcmxpYW1lbnQgc2Nob29sICcsXG4gICAgICAncGEnOiAnIGFibyBhYyBjb20gZWR1IGdvYiBpbmcgbWVkIG5ldCBub20gb3JnIHNsZCAnLFxuICAgICAgJ3B0JzogJyBjb20gZWR1IGdvdiBpbnQgbmV0IG5vbWUgb3JnIHB1YmwgJyxcbiAgICAgICdweSc6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdxYSc6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdyZSc6ICcgYXNzbyBjb20gbm9tICcsXG4gICAgICAncnUnOiAnIGFjIGFkeWdleWEgYWx0YWkgYW11ciBhcmtoYW5nZWxzayBhc3RyYWtoYW4gYmFzaGtpcmlhIGJlbGdvcm9kIGJpciBicnlhbnNrIGJ1cnlhdGlhIGNiZyBjaGVsIGNoZWx5YWJpbnNrIGNoaXRhIGNodWtvdGthIGNodXZhc2hpYSBjb20gZGFnZXN0YW4gZS1idXJnIGVkdSBnb3YgZ3Jvem55IGludCBpcmt1dHNrIGl2YW5vdm8gaXpoZXZzayBqYXIgam9zaGthci1vbGEga2FsbXlraWEga2FsdWdhIGthbWNoYXRrYSBrYXJlbGlhIGthemFuIGtjaHIga2VtZXJvdm8ga2hhYmFyb3ZzayBraGFrYXNzaWEga2h2IGtpcm92IGtvZW5pZyBrb21pIGtvc3Ryb21hIGtyYW5veWFyc2sga3ViYW4ga3VyZ2FuIGt1cnNrIGxpcGV0c2sgbWFnYWRhbiBtYXJpIG1hcmktZWwgbWFyaW5lIG1pbCBtb3Jkb3ZpYSBtb3NyZWcgbXNrIG11cm1hbnNrIG5hbGNoaWsgbmV0IG5ub3Ygbm92IG5vdm9zaWJpcnNrIG5zayBvbXNrIG9yZW5idXJnIG9yZyBvcnlvbCBwZW56YSBwZXJtIHBwIHBza292IHB0eiBybmQgcnlhemFuIHNha2hhbGluIHNhbWFyYSBzYXJhdG92IHNpbWJpcnNrIHNtb2xlbnNrIHNwYiBzdGF2cm9wb2wgc3R2IHN1cmd1dCB0YW1ib3YgdGF0YXJzdGFuIHRvbSB0b21zayB0c2FyaXRzeW4gdHNrIHR1bGEgdHV2YSB0dmVyIHR5dW1lbiB1ZG0gdWRtdXJ0aWEgdWxhbi11ZGUgdmxhZGlrYXZrYXogdmxhZGltaXIgdmxhZGl2b3N0b2sgdm9sZ29ncmFkIHZvbG9nZGEgdm9yb25lemggdnJuIHZ5YXRrYSB5YWt1dGlhIHlhbWFsIHlla2F0ZXJpbmJ1cmcgeXV6aG5vLXNha2hhbGluc2sgJyxcbiAgICAgICdydyc6ICcgYWMgY28gY29tIGVkdSBnb3V2IGdvdiBpbnQgbWlsIG5ldCAnLFxuICAgICAgJ3NhJzogJyBjb20gZWR1IGdvdiBtZWQgbmV0IG9yZyBwdWIgc2NoICcsXG4gICAgICAnc2QnOiAnIGNvbSBlZHUgZ292IGluZm8gbWVkIG5ldCBvcmcgdHYgJyxcbiAgICAgICdzZSc6ICcgYSBhYyBiIGJkIGMgZCBlIGYgZyBoIGkgayBsIG0gbiBvIG9yZyBwIHBhcnRpIHBwIHByZXNzIHIgcyB0IHRtIHUgdyB4IHkgeiAnLFxuICAgICAgJ3NnJzogJyBjb20gZWR1IGdvdiBpZG4gbmV0IG9yZyBwZXIgJyxcbiAgICAgICdzbic6ICcgYXJ0IGNvbSBlZHUgZ291diBvcmcgcGVyc28gdW5pdiAnLFxuICAgICAgJ3N5JzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG5ld3Mgb3JnICcsXG4gICAgICAndGgnOiAnIGFjIGNvIGdvIGluIG1pIG5ldCBvciAnLFxuICAgICAgJ3RqJzogJyBhYyBiaXogY28gY29tIGVkdSBnbyBnb3YgaW5mbyBpbnQgbWlsIG5hbWUgbmV0IG5pYyBvcmcgdGVzdCB3ZWIgJyxcbiAgICAgICd0bic6ICcgYWdyaW5ldCBjb20gZGVmZW5zZSBlZHVuZXQgZW5zIGZpbiBnb3YgaW5kIGluZm8gaW50bCBtaW5jb20gbmF0IG5ldCBvcmcgcGVyc28gcm5ydCBybnMgcm51IHRvdXJpc20gJyxcbiAgICAgICd0eic6ICcgYWMgY28gZ28gbmUgb3IgJyxcbiAgICAgICd1YSc6ICcgYml6IGNoZXJrYXNzeSBjaGVybmlnb3YgY2hlcm5vdnRzeSBjayBjbiBjbyBjb20gY3JpbWVhIGN2IGRuIGRuZXByb3BldHJvdnNrIGRvbmV0c2sgZHAgZWR1IGdvdiBpZiBpbiBpdmFuby1mcmFua2l2c2sga2gga2hhcmtvdiBraGVyc29uIGtobWVsbml0c2tpeSBraWV2IGtpcm92b2dyYWQga20ga3Iga3Mga3YgbGcgbHVnYW5zayBsdXRzayBsdml2IG1lIG1rIG5ldCBuaWtvbGFldiBvZCBvZGVzc2Egb3JnIHBsIHBvbHRhdmEgcHAgcm92bm8gcnYgc2ViYXN0b3BvbCBzdW15IHRlIHRlcm5vcGlsIHV6aGdvcm9kIHZpbm5pY2Egdm4gemFwb3Jpemh6aGUgemhpdG9taXIgenAgenQgJyxcbiAgICAgICd1Zyc6ICcgYWMgY28gZ28gbmUgb3Igb3JnIHNjICcsXG4gICAgICAndWsnOiAnIGFjIGJsIGJyaXRpc2gtbGlicmFyeSBjbyBjeW0gZ292IGdvdnQgaWNuZXQgamV0IGxlYSBsdGQgbWUgbWlsIG1vZCBuYXRpb25hbC1saWJyYXJ5LXNjb3RsYW5kIG5lbCBuZXQgbmhzIG5pYyBubHMgb3JnIG9yZ24gcGFybGlhbWVudCBwbGMgcG9saWNlIHNjaCBzY290IHNvYyAnLFxuICAgICAgJ3VzJzogJyBkbmkgZmVkIGlzYSBraWRzIG5zbiAnLFxuICAgICAgJ3V5JzogJyBjb20gZWR1IGd1YiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ3ZlJzogJyBjbyBjb20gZWR1IGdvYiBpbmZvIG1pbCBuZXQgb3JnIHdlYiAnLFxuICAgICAgJ3ZpJzogJyBjbyBjb20gazEyIG5ldCBvcmcgJyxcbiAgICAgICd2bic6ICcgYWMgYml6IGNvbSBlZHUgZ292IGhlYWx0aCBpbmZvIGludCBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAneWUnOiAnIGNvIGNvbSBnb3YgbHRkIG1lIG5ldCBvcmcgcGxjICcsXG4gICAgICAneXUnOiAnIGFjIGNvIGVkdSBnb3Ygb3JnICcsXG4gICAgICAnemEnOiAnIGFjIGFncmljIGFsdCBib3Vyc2UgY2l0eSBjbyBjeWJlcm5ldCBkYiBlZHUgZ292IGdyb25kYXIgaWFjY2VzcyBpbXQgaW5jYSBsYW5kZXNpZ24gbGF3IG1pbCBuZXQgbmdvIG5pcyBub20gb2xpdmV0dGkgb3JnIHBpeCBzY2hvb2wgdG0gd2ViICcsXG4gICAgICAnem0nOiAnIGFjIGNvIGNvbSBlZHUgZ292IG5ldCBvcmcgc2NoICdcbiAgICB9LFxuICAgIC8vIGdvcmhpbGwgMjAxMy0xMC0yNTogVXNpbmcgaW5kZXhPZigpIGluc3RlYWQgUmVnZXhwKCkuIFNpZ25pZmljYW50IGJvb3N0XG4gICAgLy8gaW4gYm90aCBwZXJmb3JtYW5jZSBhbmQgbWVtb3J5IGZvb3RwcmludC4gTm8gaW5pdGlhbGl6YXRpb24gcmVxdWlyZWQuXG4gICAgLy8gaHR0cDovL2pzcGVyZi5jb20vdXJpLWpzLXNsZC1yZWdleC12cy1iaW5hcnktc2VhcmNoLzRcbiAgICAvLyBGb2xsb3dpbmcgbWV0aG9kcyB1c2UgbGFzdEluZGV4T2YoKSByYXRoZXIgdGhhbiBhcnJheS5zcGxpdCgpIGluIG9yZGVyXG4gICAgLy8gdG8gYXZvaWQgYW55IG1lbW9yeSBhbGxvY2F0aW9ucy5cbiAgICBoYXM6IGZ1bmN0aW9uIGhhcyhkb21haW4pIHtcbiAgICAgIHZhciB0bGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIGlmICh0bGRPZmZzZXQgPD0gMCB8fCB0bGRPZmZzZXQgPj0gZG9tYWluLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicsIHRsZE9mZnNldCAtIDEpO1xuICAgICAgaWYgKHNsZE9mZnNldCA8PSAwIHx8IHNsZE9mZnNldCA+PSB0bGRPZmZzZXQgLSAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRMaXN0ID0gU0xELmxpc3RbZG9tYWluLnNsaWNlKHRsZE9mZnNldCArIDEpXTtcbiAgICAgIGlmICghc2xkTGlzdCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xkTGlzdC5pbmRleE9mKCcgJyArIGRvbWFpbi5zbGljZShzbGRPZmZzZXQgKyAxLCB0bGRPZmZzZXQpICsgJyAnKSA+PSAwO1xuICAgIH0sXG4gICAgaXM6IGZ1bmN0aW9uIGlzKGRvbWFpbikge1xuICAgICAgdmFyIHRsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicpO1xuICAgICAgaWYgKHRsZE9mZnNldCA8PSAwIHx8IHRsZE9mZnNldCA+PSBkb21haW4ubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgc2xkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJywgdGxkT2Zmc2V0IC0gMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0ID49IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZExpc3QgPSBTTEQubGlzdFtkb21haW4uc2xpY2UodGxkT2Zmc2V0ICsgMSldO1xuICAgICAgaWYgKCFzbGRMaXN0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbGRMaXN0LmluZGV4T2YoJyAnICsgZG9tYWluLnNsaWNlKDAsIHRsZE9mZnNldCkgKyAnICcpID49IDA7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldChkb21haW4pIHtcbiAgICAgIHZhciB0bGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIGlmICh0bGRPZmZzZXQgPD0gMCB8fCB0bGRPZmZzZXQgPj0gZG9tYWluLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgc2xkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJywgdGxkT2Zmc2V0IC0gMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0IDw9IDAgfHwgc2xkT2Zmc2V0ID49IHRsZE9mZnNldCAtIDEpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgc2xkTGlzdCA9IFNMRC5saXN0W2RvbWFpbi5zbGljZSh0bGRPZmZzZXQgKyAxKV07XG4gICAgICBpZiAoIXNsZExpc3QpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoc2xkTGlzdC5pbmRleE9mKCcgJyArIGRvbWFpbi5zbGljZShzbGRPZmZzZXQgKyAxLCB0bGRPZmZzZXQpICsgJyAnKSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gZG9tYWluLnNsaWNlKHNsZE9mZnNldCArIDEpO1xuICAgIH0sXG4gICAgbm9Db25mbGljdDogZnVuY3Rpb24gbm9Db25mbGljdCgpIHtcbiAgICAgIGlmIChyb290LlNlY29uZExldmVsRG9tYWlucyA9PT0gdGhpcykge1xuICAgICAgICByb290LlNlY29uZExldmVsRG9tYWlucyA9IF9TZWNvbmRMZXZlbERvbWFpbnM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFNMRDtcbn0pOyIsIi8qIVxuICogVVJJLmpzIC0gTXV0YXRpbmcgVVJMc1xuICpcbiAqIFZlcnNpb246IDEuMTUuMlxuICpcbiAqIEF1dGhvcjogUm9kbmV5IFJlaG1cbiAqIFdlYjogaHR0cDovL21lZGlhbGl6ZS5naXRodWIuaW8vVVJJLmpzL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyXG4gKiAgIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2VcbiAqICAgR1BMIHYzIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9HUEwtMy4wXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAndXNlIHN0cmljdCc7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZVxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCcuL3B1bnljb2RlJyksIHJlcXVpcmUoJy4vSVB2NicpLCByZXF1aXJlKCcuL1NlY29uZExldmVsRG9tYWlucycpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFsnLi9wdW55Y29kZScsICcuL0lQdjYnLCAnLi9TZWNvbmRMZXZlbERvbWFpbnMnXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LlVSSSA9IGZhY3Rvcnkocm9vdC5wdW55Y29kZSwgcm9vdC5JUHY2LCByb290LlNlY29uZExldmVsRG9tYWlucywgcm9vdCk7XG4gIH1cbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKHB1bnljb2RlLCBJUHY2LCBTTEQsIHJvb3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvKmdsb2JhbCBsb2NhdGlvbiwgZXNjYXBlLCB1bmVzY2FwZSAqL1xuICAvLyBGSVhNRTogdjIuMC4wIHJlbmFtY2Ugbm9uLWNhbWVsQ2FzZSBwcm9wZXJ0aWVzIHRvIHVwcGVyY2FzZVxuICAvKmpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG5cbiAgLy8gc2F2ZSBjdXJyZW50IFVSSSB2YXJpYWJsZSwgaWYgYW55XG4gIHZhciBfVVJJID0gcm9vdCAmJiByb290LlVSSTtcblxuICBmdW5jdGlvbiBVUkkodXJsLCBiYXNlKSB7XG4gICAgdmFyIF91cmxTdXBwbGllZCA9IGFyZ3VtZW50cy5sZW5ndGggPj0gMTtcbiAgICB2YXIgX2Jhc2VTdXBwbGllZCA9IGFyZ3VtZW50cy5sZW5ndGggPj0gMjtcblxuICAgIC8vIEFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCB0aGUgJ25ldycga2V5d29yZFxuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBVUkkpKSB7XG4gICAgICBpZiAoX3VybFN1cHBsaWVkKSB7XG4gICAgICAgIGlmIChfYmFzZVN1cHBsaWVkKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBVUkkodXJsLCBiYXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgVVJJKHVybCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgVVJJKCk7XG4gICAgfVxuXG4gICAgaWYgKHVybCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoX3VybFN1cHBsaWVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3VuZGVmaW5lZCBpcyBub3QgYSB2YWxpZCBhcmd1bWVudCBmb3IgVVJJJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHVybCA9IGxvY2F0aW9uLmhyZWYgKyAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVybCA9ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaHJlZih1cmwpO1xuXG4gICAgLy8gcmVzb2x2ZSB0byBiYXNlIGFjY29yZGluZyB0byBodHRwOi8vZHZjcy53My5vcmcvaGcvdXJsL3Jhdy1maWxlL3RpcC9PdmVydmlldy5odG1sI2NvbnN0cnVjdG9yXG4gICAgaWYgKGJhc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWJzb2x1dGVUbyhiYXNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIFVSSS52ZXJzaW9uID0gJzEuMTUuMic7XG5cbiAgdmFyIHAgPSBVUkkucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuICBmdW5jdGlvbiBlc2NhcGVSZWdFeChzdHJpbmcpIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9jb21taXQvODVhYzIxNzgzYzExZjhjY2FiMDYxMDZkYmE5NzM1YTMxYTg2OTI0ZCNjb21taXRjb21tZW50LTgyMTk2M1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKFsuKis/Xj0hOiR7fSgpfFtcXF1cXC9cXFxcXSkvZywgJ1xcXFwkMScpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VHlwZSh2YWx1ZSkge1xuICAgIC8vIElFOCBkb2Vzbid0IHJldHVybiBbT2JqZWN0IFVuZGVmaW5lZF0gYnV0IFtPYmplY3QgT2JqZWN0XSBmb3IgdW5kZWZpbmVkIHZhbHVlXG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnVW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICByZXR1cm4gU3RyaW5nKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkpLnNsaWNlKDgsIC0xKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XG4gICAgcmV0dXJuIGdldFR5cGUob2JqKSA9PT0gJ0FycmF5JztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbHRlckFycmF5VmFsdWVzKGRhdGEsIHZhbHVlKSB7XG4gICAgdmFyIGxvb2t1cCA9IHt9O1xuICAgIHZhciBpLCBsZW5ndGg7XG5cbiAgICBpZiAoZ2V0VHlwZSh2YWx1ZSkgPT09ICdSZWdFeHAnKSB7XG4gICAgICBsb29rdXAgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxvb2t1cFt2YWx1ZVtpXV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb29rdXBbdmFsdWVdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBkYXRhLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAvKmpzaGludCBsYXhicmVhazogdHJ1ZSAqL1xuICAgICAgdmFyIF9tYXRjaCA9IGxvb2t1cCAmJiBsb29rdXBbZGF0YVtpXV0gIT09IHVuZGVmaW5lZCB8fCAhbG9va3VwICYmIHZhbHVlLnRlc3QoZGF0YVtpXSk7XG4gICAgICAvKmpzaGludCBsYXhicmVhazogZmFsc2UgKi9cbiAgICAgIGlmIChfbWF0Y2gpIHtcbiAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGxlbmd0aC0tO1xuICAgICAgICBpLS07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBmdW5jdGlvbiBhcnJheUNvbnRhaW5zKGxpc3QsIHZhbHVlKSB7XG4gICAgdmFyIGksIGxlbmd0aDtcblxuICAgIC8vIHZhbHVlIG1heSBiZSBzdHJpbmcsIG51bWJlciwgYXJyYXksIHJlZ2V4cFxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgLy8gTm90ZTogdGhpcyBjYW4gYmUgb3B0aW1pemVkIHRvIE8obikgKGluc3RlYWQgb2YgY3VycmVudCBPKG0gKiBuKSlcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghYXJyYXlDb250YWlucyhsaXN0LCB2YWx1ZVtpXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIF90eXBlID0gZ2V0VHlwZSh2YWx1ZSk7XG4gICAgZm9yIChpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKF90eXBlID09PSAnUmVnRXhwJykge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RbaV0gPT09ICdzdHJpbmcnICYmIGxpc3RbaV0ubWF0Y2godmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobGlzdFtpXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlzRXF1YWwob25lLCB0d28pIHtcbiAgICBpZiAoIWlzQXJyYXkob25lKSB8fCAhaXNBcnJheSh0d28pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gYXJyYXlzIGNhbid0IGJlIGVxdWFsIGlmIHRoZXkgaGF2ZSBkaWZmZXJlbnQgYW1vdW50IG9mIGNvbnRlbnRcbiAgICBpZiAob25lLmxlbmd0aCAhPT0gdHdvLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG9uZS5zb3J0KCk7XG4gICAgdHdvLnNvcnQoKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb25lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKG9uZVtpXSAhPT0gdHdvW2ldKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIFVSSS5fcGFydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3RvY29sOiBudWxsLFxuICAgICAgdXNlcm5hbWU6IG51bGwsXG4gICAgICBwYXNzd29yZDogbnVsbCxcbiAgICAgIGhvc3RuYW1lOiBudWxsLFxuICAgICAgdXJuOiBudWxsLFxuICAgICAgcG9ydDogbnVsbCxcbiAgICAgIHBhdGg6IG51bGwsXG4gICAgICBxdWVyeTogbnVsbCxcbiAgICAgIGZyYWdtZW50OiBudWxsLFxuICAgICAgLy8gc3RhdGVcbiAgICAgIGR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVyczogVVJJLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyxcbiAgICAgIGVzY2FwZVF1ZXJ5U3BhY2U6IFVSSS5lc2NhcGVRdWVyeVNwYWNlXG4gICAgfTtcbiAgfTtcbiAgLy8gc3RhdGU6IGFsbG93IGR1cGxpY2F0ZSBxdWVyeSBwYXJhbWV0ZXJzIChhPTEmYT0xKVxuICBVUkkuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gZmFsc2U7XG4gIC8vIHN0YXRlOiByZXBsYWNlcyArIHdpdGggJTIwIChzcGFjZSBpbiBxdWVyeSBzdHJpbmdzKVxuICBVUkkuZXNjYXBlUXVlcnlTcGFjZSA9IHRydWU7XG4gIC8vIHN0YXRpYyBwcm9wZXJ0aWVzXG4gIFVSSS5wcm90b2NvbF9leHByZXNzaW9uID0gL15bYS16XVthLXowLTkuKy1dKiQvaTtcbiAgVVJJLmlkbl9leHByZXNzaW9uID0gL1teYS16MC05XFwuLV0vaTtcbiAgVVJJLnB1bnljb2RlX2V4cHJlc3Npb24gPSAvKHhuLS0pL2k7XG4gIC8vIHdlbGwsIDMzMy40NDQuNTU1LjY2NiBtYXRjaGVzLCBidXQgaXQgc3VyZSBhaW4ndCBubyBJUHY0IC0gZG8gd2UgY2FyZT9cbiAgVVJJLmlwNF9leHByZXNzaW9uID0gL15cXGR7MSwzfVxcLlxcZHsxLDN9XFwuXFxkezEsM31cXC5cXGR7MSwzfSQvO1xuICAvLyBjcmVkaXRzIHRvIFJpY2ggQnJvd25cbiAgLy8gc291cmNlOiBodHRwOi8vZm9ydW1zLmludGVybWFwcGVyLmNvbS92aWV3dG9waWMucGhwP3A9MTA5NiMxMDk2XG4gIC8vIHNwZWNpZmljYXRpb246IGh0dHA6Ly93d3cuaWV0Zi5vcmcvcmZjL3JmYzQyOTEudHh0XG4gIFVSSS5pcDZfZXhwcmVzc2lvbiA9IC9eXFxzKigoKFswLTlBLUZhLWZdezEsNH06KXs3fShbMC05QS1GYS1mXXsxLDR9fDopKXwoKFswLTlBLUZhLWZdezEsNH06KXs2fSg6WzAtOUEtRmEtZl17MSw0fXwoKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezV9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsMn0pfDooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezR9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsM30pfCgoOlswLTlBLUZhLWZdezEsNH0pPzooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXszfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDR9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDJ9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezJ9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNX0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsM306KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7MX0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw2fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCw0fTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoOigoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDd9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDV9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpKSglLispP1xccyokLztcbiAgLy8gZXhwcmVzc2lvbiB1c2VkIGlzIFwiZ3J1YmVyIHJldmlzZWRcIiAoQGdydWJlciB2MikgZGV0ZXJtaW5lZCB0byBiZSB0aGVcbiAgLy8gYmVzdCBzb2x1dGlvbiBpbiBhIHJlZ2V4LWdvbGYgd2UgZGlkIGEgY291cGxlIG9mIGFnZXMgYWdvIGF0XG4gIC8vICogaHR0cDovL21hdGhpYXNieW5lbnMuYmUvZGVtby91cmwtcmVnZXhcbiAgLy8gKiBodHRwOi8vcm9kbmV5cmVobS5kZS90L3VybC1yZWdleC5odG1sXG4gIFVSSS5maW5kX3VyaV9leHByZXNzaW9uID0gL1xcYigoPzpbYS16XVtcXHctXSs6KD86XFwvezEsM318W2EtejAtOSVdKXx3d3dcXGR7MCwzfVsuXXxbYS16MC05LlxcLV0rWy5dW2Etel17Miw0fVxcLykoPzpbXlxccygpPD5dK3xcXCgoW15cXHMoKTw+XSt8KFxcKFteXFxzKCk8Pl0rXFwpKSkqXFwpKSsoPzpcXCgoW15cXHMoKTw+XSt8KFxcKFteXFxzKCk8Pl0rXFwpKSkqXFwpfFteXFxzYCEoKVxcW1xcXXt9OzonXCIuLDw+P8KrwrvigJzigJ3igJjigJldKSkvaWc7XG4gIFVSSS5maW5kVXJpID0ge1xuICAgIC8vIHZhbGlkIFwic2NoZW1lOi8vXCIgb3IgXCJ3d3cuXCJcbiAgICBzdGFydDogL1xcYig/OihbYS16XVthLXowLTkuKy1dKjpcXC9cXC8pfHd3d1xcLikvZ2ksXG4gICAgLy8gZXZlcnl0aGluZyB1cCB0byB0aGUgbmV4dCB3aGl0ZXNwYWNlXG4gICAgZW5kOiAvW1xcc1xcclxcbl18JC8sXG4gICAgLy8gdHJpbSB0cmFpbGluZyBwdW5jdHVhdGlvbiBjYXB0dXJlZCBieSBlbmQgUmVnRXhwXG4gICAgdHJpbTogL1tgISgpXFxbXFxde307OidcIi4sPD4/wqvCu+KAnOKAneKAnuKAmOKAmV0rJC9cbiAgfTtcbiAgLy8gaHR0cDovL3d3dy5pYW5hLm9yZy9hc3NpZ25tZW50cy91cmktc2NoZW1lcy5odG1sXG4gIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl9UQ1BfYW5kX1VEUF9wb3J0X251bWJlcnMjV2VsbC1rbm93bl9wb3J0c1xuICBVUkkuZGVmYXVsdFBvcnRzID0ge1xuICAgIGh0dHA6ICc4MCcsXG4gICAgaHR0cHM6ICc0NDMnLFxuICAgIGZ0cDogJzIxJyxcbiAgICBnb3BoZXI6ICc3MCcsXG4gICAgd3M6ICc4MCcsXG4gICAgd3NzOiAnNDQzJ1xuICB9O1xuICAvLyBhbGxvd2VkIGhvc3RuYW1lIGNoYXJhY3RlcnMgYWNjb3JkaW5nIHRvIFJGQyAzOTg2XG4gIC8vIEFMUEhBIERJR0lUIFwiLVwiIFwiLlwiIFwiX1wiIFwiflwiIFwiIVwiIFwiJFwiIFwiJlwiIFwiJ1wiIFwiKFwiIFwiKVwiIFwiKlwiIFwiK1wiIFwiLFwiIFwiO1wiIFwiPVwiICVlbmNvZGVkXG4gIC8vIEkndmUgbmV2ZXIgc2VlbiBhIChub24tSUROKSBob3N0bmFtZSBvdGhlciB0aGFuOiBBTFBIQSBESUdJVCAuIC1cbiAgVVJJLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycyA9IC9bXmEtekEtWjAtOVxcLi1dLztcbiAgLy8gbWFwIERPTSBFbGVtZW50cyB0byB0aGVpciBVUkkgYXR0cmlidXRlXG4gIFVSSS5kb21BdHRyaWJ1dGVzID0ge1xuICAgICdhJzogJ2hyZWYnLFxuICAgICdibG9ja3F1b3RlJzogJ2NpdGUnLFxuICAgICdsaW5rJzogJ2hyZWYnLFxuICAgICdiYXNlJzogJ2hyZWYnLFxuICAgICdzY3JpcHQnOiAnc3JjJyxcbiAgICAnZm9ybSc6ICdhY3Rpb24nLFxuICAgICdpbWcnOiAnc3JjJyxcbiAgICAnYXJlYSc6ICdocmVmJyxcbiAgICAnaWZyYW1lJzogJ3NyYycsXG4gICAgJ2VtYmVkJzogJ3NyYycsXG4gICAgJ3NvdXJjZSc6ICdzcmMnLFxuICAgICd0cmFjayc6ICdzcmMnLFxuICAgICdpbnB1dCc6ICdzcmMnLCAvLyBidXQgb25seSBpZiB0eXBlPVwiaW1hZ2VcIlxuICAgICdhdWRpbyc6ICdzcmMnLFxuICAgICd2aWRlbyc6ICdzcmMnXG4gIH07XG4gIFVSSS5nZXREb21BdHRyaWJ1dGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIGlmICghbm9kZSB8fCAhbm9kZS5ub2RlTmFtZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgbm9kZU5hbWUgPSBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gPGlucHV0PiBzaG91bGQgb25seSBleHBvc2Ugc3JjIGZvciB0eXBlPVwiaW1hZ2VcIlxuICAgIGlmIChub2RlTmFtZSA9PT0gJ2lucHV0JyAmJiBub2RlLnR5cGUgIT09ICdpbWFnZScpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIFVSSS5kb21BdHRyaWJ1dGVzW25vZGVOYW1lXTtcbiAgfTtcblxuICBmdW5jdGlvbiBlc2NhcGVGb3JEdW1iRmlyZWZveDM2KHZhbHVlKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzkxXG4gICAgcmV0dXJuIGVzY2FwZSh2YWx1ZSk7XG4gIH1cblxuICAvLyBlbmNvZGluZyAvIGRlY29kaW5nIGFjY29yZGluZyB0byBSRkMzOTg2XG4gIGZ1bmN0aW9uIHN0cmljdEVuY29kZVVSSUNvbXBvbmVudChzdHJpbmcpIHtcbiAgICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZykucmVwbGFjZSgvWyEnKCkqXS9nLCBlc2NhcGVGb3JEdW1iRmlyZWZveDM2KS5yZXBsYWNlKC9cXCovZywgJyUyQScpO1xuICB9XG4gIFVSSS5lbmNvZGUgPSBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQ7XG4gIFVSSS5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG4gIFVSSS5pc284ODU5ID0gZnVuY3Rpb24gKCkge1xuICAgIFVSSS5lbmNvZGUgPSBlc2NhcGU7XG4gICAgVVJJLmRlY29kZSA9IHVuZXNjYXBlO1xuICB9O1xuICBVUkkudW5pY29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBVUkkuZW5jb2RlID0gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50O1xuICAgIFVSSS5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG4gIH07XG4gIFVSSS5jaGFyYWN0ZXJzID0ge1xuICAgIHBhdGhuYW1lOiB7XG4gICAgICBlbmNvZGU6IHtcbiAgICAgICAgLy8gUkZDMzk4NiAyLjE6IEZvciBjb25zaXN0ZW5jeSwgVVJJIHByb2R1Y2VycyBhbmQgbm9ybWFsaXplcnMgc2hvdWxkXG4gICAgICAgIC8vIHVzZSB1cHBlcmNhc2UgaGV4YWRlY2ltYWwgZGlnaXRzIGZvciBhbGwgcGVyY2VudC1lbmNvZGluZ3MuXG4gICAgICAgIGV4cHJlc3Npb246IC8lKDI0fDI2fDJCfDJDfDNCfDNEfDNBfDQwKS9pZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgLy8gLS5ffiEnKCkqXG4gICAgICAgICAgJyUyNCc6ICckJyxcbiAgICAgICAgICAnJTI2JzogJyYnLFxuICAgICAgICAgICclMkInOiAnKycsXG4gICAgICAgICAgJyUyQyc6ICcsJyxcbiAgICAgICAgICAnJTNCJzogJzsnLFxuICAgICAgICAgICclM0QnOiAnPScsXG4gICAgICAgICAgJyUzQSc6ICc6JyxcbiAgICAgICAgICAnJTQwJzogJ0AnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZWNvZGU6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogL1tcXC9cXD8jXS9nLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAnLyc6ICclMkYnLFxuICAgICAgICAgICc/JzogJyUzRicsXG4gICAgICAgICAgJyMnOiAnJTIzJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNlcnZlZDoge1xuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIC8vIFJGQzM5ODYgMi4xOiBGb3IgY29uc2lzdGVuY3ksIFVSSSBwcm9kdWNlcnMgYW5kIG5vcm1hbGl6ZXJzIHNob3VsZFxuICAgICAgICAvLyB1c2UgdXBwZXJjYXNlIGhleGFkZWNpbWFsIGRpZ2l0cyBmb3IgYWxsIHBlcmNlbnQtZW5jb2RpbmdzLlxuICAgICAgICBleHByZXNzaW9uOiAvJSgyMXwyM3wyNHwyNnwyN3wyOHwyOXwyQXwyQnwyQ3wyRnwzQXwzQnwzRHwzRnw0MHw1Qnw1RCkvaWcsXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgIC8vIGdlbi1kZWxpbXNcbiAgICAgICAgICAnJTNBJzogJzonLFxuICAgICAgICAgICclMkYnOiAnLycsXG4gICAgICAgICAgJyUzRic6ICc/JyxcbiAgICAgICAgICAnJTIzJzogJyMnLFxuICAgICAgICAgICclNUInOiAnWycsXG4gICAgICAgICAgJyU1RCc6ICddJyxcbiAgICAgICAgICAnJTQwJzogJ0AnLFxuICAgICAgICAgIC8vIHN1Yi1kZWxpbXNcbiAgICAgICAgICAnJTIxJzogJyEnLFxuICAgICAgICAgICclMjQnOiAnJCcsXG4gICAgICAgICAgJyUyNic6ICcmJyxcbiAgICAgICAgICAnJTI3JzogJ1xcJycsXG4gICAgICAgICAgJyUyOCc6ICcoJyxcbiAgICAgICAgICAnJTI5JzogJyknLFxuICAgICAgICAgICclMkEnOiAnKicsXG4gICAgICAgICAgJyUyQic6ICcrJyxcbiAgICAgICAgICAnJTJDJzogJywnLFxuICAgICAgICAgICclM0InOiAnOycsXG4gICAgICAgICAgJyUzRCc6ICc9J1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB1cm5wYXRoOiB7XG4gICAgICAvLyBUaGUgY2hhcmFjdGVycyB1bmRlciBgZW5jb2RlYCBhcmUgdGhlIGNoYXJhY3RlcnMgY2FsbGVkIG91dCBieSBSRkMgMjE0MSBhcyBiZWluZyBhY2NlcHRhYmxlXG4gICAgICAvLyBmb3IgdXNhZ2UgaW4gYSBVUk4uIFJGQzIxNDEgYWxzbyBjYWxscyBvdXQgXCItXCIsIFwiLlwiLCBhbmQgXCJfXCIgYXMgYWNjZXB0YWJsZSBjaGFyYWN0ZXJzLCBidXRcbiAgICAgIC8vIHRoZXNlIGFyZW4ndCBlbmNvZGVkIGJ5IGVuY29kZVVSSUNvbXBvbmVudCwgc28gd2UgZG9uJ3QgaGF2ZSB0byBjYWxsIHRoZW0gb3V0IGhlcmUuIEFsc29cbiAgICAgIC8vIG5vdGUgdGhhdCB0aGUgY29sb24gY2hhcmFjdGVyIGlzIG5vdCBmZWF0dXJlZCBpbiB0aGUgZW5jb2RpbmcgbWFwOyB0aGlzIGlzIGJlY2F1c2UgVVJJLmpzXG4gICAgICAvLyBnaXZlcyB0aGUgY29sb25zIGluIFVSTnMgc2VtYW50aWMgbWVhbmluZyBhcyB0aGUgZGVsaW1pdGVycyBvZiBwYXRoIHNlZ2VtZW50cywgYW5kIHNvIGl0XG4gICAgICAvLyBzaG91bGQgbm90IGFwcGVhciB1bmVuY29kZWQgaW4gYSBzZWdtZW50IGl0c2VsZi5cbiAgICAgIC8vIFNlZSBhbHNvIHRoZSBub3RlIGFib3ZlIGFib3V0IFJGQzM5ODYgYW5kIGNhcGl0YWxhbGl6ZWQgaGV4IGRpZ2l0cy5cbiAgICAgIGVuY29kZToge1xuICAgICAgICBleHByZXNzaW9uOiAvJSgyMXwyNHwyN3wyOHwyOXwyQXwyQnwyQ3wzQnwzRHw0MCkvaWcsXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICclMjEnOiAnIScsXG4gICAgICAgICAgJyUyNCc6ICckJyxcbiAgICAgICAgICAnJTI3JzogJ1xcJycsXG4gICAgICAgICAgJyUyOCc6ICcoJyxcbiAgICAgICAgICAnJTI5JzogJyknLFxuICAgICAgICAgICclMkEnOiAnKicsXG4gICAgICAgICAgJyUyQic6ICcrJyxcbiAgICAgICAgICAnJTJDJzogJywnLFxuICAgICAgICAgICclM0InOiAnOycsXG4gICAgICAgICAgJyUzRCc6ICc9JyxcbiAgICAgICAgICAnJTQwJzogJ0AnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBUaGVzZSBjaGFyYWN0ZXJzIGFyZSB0aGUgY2hhcmFjdGVycyBjYWxsZWQgb3V0IGJ5IFJGQzIxNDEgYXMgXCJyZXNlcnZlZFwiIGNoYXJhY3RlcnMgdGhhdFxuICAgICAgLy8gc2hvdWxkIG5ldmVyIGFwcGVhciBpbiBhIFVSTiwgcGx1cyB0aGUgY29sb24gY2hhcmFjdGVyIChzZWUgbm90ZSBhYm92ZSkuXG4gICAgICBkZWNvZGU6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogL1tcXC9cXD8jOl0vZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgJy8nOiAnJTJGJyxcbiAgICAgICAgICAnPyc6ICclM0YnLFxuICAgICAgICAgICcjJzogJyUyMycsXG4gICAgICAgICAgJzonOiAnJTNBJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBVUkkuZW5jb2RlUXVlcnkgPSBmdW5jdGlvbiAoc3RyaW5nLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgdmFyIGVzY2FwZWQgPSBVUkkuZW5jb2RlKHN0cmluZyArICcnKTtcbiAgICBpZiAoZXNjYXBlUXVlcnlTcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlc2NhcGVRdWVyeVNwYWNlID0gVVJJLmVzY2FwZVF1ZXJ5U3BhY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVzY2FwZVF1ZXJ5U3BhY2UgPyBlc2NhcGVkLnJlcGxhY2UoLyUyMC9nLCAnKycpIDogZXNjYXBlZDtcbiAgfTtcbiAgVVJJLmRlY29kZVF1ZXJ5ID0gZnVuY3Rpb24gKHN0cmluZywgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIHN0cmluZyArPSAnJztcbiAgICBpZiAoZXNjYXBlUXVlcnlTcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlc2NhcGVRdWVyeVNwYWNlID0gVVJJLmVzY2FwZVF1ZXJ5U3BhY2U7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBVUkkuZGVjb2RlKGVzY2FwZVF1ZXJ5U3BhY2UgPyBzdHJpbmcucmVwbGFjZSgvXFwrL2csICclMjAnKSA6IHN0cmluZyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gd2UncmUgbm90IGdvaW5nIHRvIG1lc3Mgd2l0aCB3ZWlyZCBlbmNvZGluZ3MsXG4gICAgICAvLyBnaXZlIHVwIGFuZCByZXR1cm4gdGhlIHVuZGVjb2RlZCBvcmlnaW5hbCBzdHJpbmdcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvODdcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvOTJcbiAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuICB9O1xuICAvLyBnZW5lcmF0ZSBlbmNvZGUvZGVjb2RlIHBhdGggZnVuY3Rpb25zXG4gIHZhciBfcGFydHMgPSB7ICdlbmNvZGUnOiAnZW5jb2RlJywgJ2RlY29kZSc6ICdkZWNvZGUnIH07XG4gIHZhciBfcGFydDtcbiAgdmFyIGdlbmVyYXRlQWNjZXNzb3IgPSBmdW5jdGlvbiBnZW5lcmF0ZUFjY2Vzc29yKF9ncm91cCwgX3BhcnQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIFVSSVtfcGFydF0oc3RyaW5nICsgJycpLnJlcGxhY2UoVVJJLmNoYXJhY3RlcnNbX2dyb3VwXVtfcGFydF0uZXhwcmVzc2lvbiwgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICByZXR1cm4gVVJJLmNoYXJhY3RlcnNbX2dyb3VwXVtfcGFydF0ubWFwW2NdO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gd2UncmUgbm90IGdvaW5nIHRvIG1lc3Mgd2l0aCB3ZWlyZCBlbmNvZGluZ3MsXG4gICAgICAgIC8vIGdpdmUgdXAgYW5kIHJldHVybiB0aGUgdW5kZWNvZGVkIG9yaWdpbmFsIHN0cmluZ1xuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzg3XG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvOTJcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIGZvciAoX3BhcnQgaW4gX3BhcnRzKSB7XG4gICAgVVJJW19wYXJ0ICsgJ1BhdGhTZWdtZW50J10gPSBnZW5lcmF0ZUFjY2Vzc29yKCdwYXRobmFtZScsIF9wYXJ0c1tfcGFydF0pO1xuICAgIFVSSVtfcGFydCArICdVcm5QYXRoU2VnbWVudCddID0gZ2VuZXJhdGVBY2Nlc3NvcigndXJucGF0aCcsIF9wYXJ0c1tfcGFydF0pO1xuICB9XG5cbiAgdmFyIGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uID0gZnVuY3Rpb24gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oX3NlcCwgX2NvZGluZ0Z1bmNOYW1lLCBfaW5uZXJDb2RpbmdGdW5jTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAvLyBXaHkgcGFzcyBpbiBuYW1lcyBvZiBmdW5jdGlvbnMsIHJhdGhlciB0aGFuIHRoZSBmdW5jdGlvbiBvYmplY3RzIHRoZW1zZWx2ZXM/IFRoZVxuICAgICAgLy8gZGVmaW5pdGlvbnMgb2Ygc29tZSBmdW5jdGlvbnMgKGJ1dCBpbiBwYXJ0aWN1bGFyLCBVUkkuZGVjb2RlKSB3aWxsIG9jY2FzaW9uYWxseSBjaGFuZ2UgZHVlXG4gICAgICAvLyB0byBVUkkuanMgaGF2aW5nIElTTzg4NTkgYW5kIFVuaWNvZGUgbW9kZXMuIFBhc3NpbmcgaW4gdGhlIG5hbWUgYW5kIGdldHRpbmcgaXQgd2lsbCBlbnN1cmVcbiAgICAgIC8vIHRoYXQgdGhlIGZ1bmN0aW9ucyB3ZSB1c2UgaGVyZSBhcmUgXCJmcmVzaFwiLlxuICAgICAgdmFyIGFjdHVhbENvZGluZ0Z1bmM7XG4gICAgICBpZiAoIV9pbm5lckNvZGluZ0Z1bmNOYW1lKSB7XG4gICAgICAgIGFjdHVhbENvZGluZ0Z1bmMgPSBVUklbX2NvZGluZ0Z1bmNOYW1lXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjdHVhbENvZGluZ0Z1bmMgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgICAgcmV0dXJuIFVSSVtfY29kaW5nRnVuY05hbWVdKFVSSVtfaW5uZXJDb2RpbmdGdW5jTmFtZV0oc3RyaW5nKSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWdtZW50cyA9IChzdHJpbmcgKyAnJykuc3BsaXQoX3NlcCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBzZWdtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzZWdtZW50c1tpXSA9IGFjdHVhbENvZGluZ0Z1bmMoc2VnbWVudHNbaV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VnbWVudHMuam9pbihfc2VwKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFRoaXMgdGFrZXMgcGxhY2Ugb3V0c2lkZSB0aGUgYWJvdmUgbG9vcCBiZWNhdXNlIHdlIGRvbid0IHdhbnQsIGUuZy4sIGVuY29kZVVyblBhdGggZnVuY3Rpb25zLlxuICBVUkkuZGVjb2RlUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCcvJywgJ2RlY29kZVBhdGhTZWdtZW50Jyk7XG4gIFVSSS5kZWNvZGVVcm5QYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJzonLCAnZGVjb2RlVXJuUGF0aFNlZ21lbnQnKTtcbiAgVVJJLnJlY29kZVBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignLycsICdlbmNvZGVQYXRoU2VnbWVudCcsICdkZWNvZGUnKTtcbiAgVVJJLnJlY29kZVVyblBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignOicsICdlbmNvZGVVcm5QYXRoU2VnbWVudCcsICdkZWNvZGUnKTtcblxuICBVUkkuZW5jb2RlUmVzZXJ2ZWQgPSBnZW5lcmF0ZUFjY2Vzc29yKCdyZXNlcnZlZCcsICdlbmNvZGUnKTtcblxuICBVUkkucGFyc2UgPSBmdW5jdGlvbiAoc3RyaW5nLCBwYXJ0cykge1xuICAgIHZhciBwb3M7XG4gICAgaWYgKCFwYXJ0cykge1xuICAgICAgcGFydHMgPSB7fTtcbiAgICB9XG4gICAgLy8gW3Byb3RvY29sXCI6Ly9cIlt1c2VybmFtZVtcIjpcInBhc3N3b3JkXVwiQFwiXWhvc3RuYW1lW1wiOlwicG9ydF1cIi9cIj9dW3BhdGhdW1wiP1wicXVlcnlzdHJpbmddW1wiI1wiZnJhZ21lbnRdXG5cbiAgICAvLyBleHRyYWN0IGZyYWdtZW50XG4gICAgcG9zID0gc3RyaW5nLmluZGV4T2YoJyMnKTtcbiAgICBpZiAocG9zID4gLTEpIHtcbiAgICAgIC8vIGVzY2FwaW5nP1xuICAgICAgcGFydHMuZnJhZ21lbnQgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpIHx8IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBxdWVyeVxuICAgIHBvcyA9IHN0cmluZy5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKHBvcyA+IC0xKSB7XG4gICAgICAvLyBlc2NhcGluZz9cbiAgICAgIHBhcnRzLnF1ZXJ5ID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKSB8fCBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpO1xuICAgIH1cblxuICAgIC8vIGV4dHJhY3QgcHJvdG9jb2xcbiAgICBpZiAoc3RyaW5nLnN1YnN0cmluZygwLCAyKSA9PT0gJy8vJykge1xuICAgICAgLy8gcmVsYXRpdmUtc2NoZW1lXG4gICAgICBwYXJ0cy5wcm90b2NvbCA9IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKDIpO1xuICAgICAgLy8gZXh0cmFjdCBcInVzZXI6cGFzc0Bob3N0OnBvcnRcIlxuICAgICAgc3RyaW5nID0gVVJJLnBhcnNlQXV0aG9yaXR5KHN0cmluZywgcGFydHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3MgPSBzdHJpbmcuaW5kZXhPZignOicpO1xuICAgICAgaWYgKHBvcyA+IC0xKSB7XG4gICAgICAgIHBhcnRzLnByb3RvY29sID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpIHx8IG51bGw7XG4gICAgICAgIGlmIChwYXJ0cy5wcm90b2NvbCAmJiAhcGFydHMucHJvdG9jb2wubWF0Y2goVVJJLnByb3RvY29sX2V4cHJlc3Npb24pKSB7XG4gICAgICAgICAgLy8gOiBtYXkgYmUgd2l0aGluIHRoZSBwYXRoXG4gICAgICAgICAgcGFydHMucHJvdG9jb2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxLCBwb3MgKyAzKSA9PT0gJy8vJykge1xuICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMyk7XG5cbiAgICAgICAgICAvLyBleHRyYWN0IFwidXNlcjpwYXNzQGhvc3Q6cG9ydFwiXG4gICAgICAgICAgc3RyaW5nID0gVVJJLnBhcnNlQXV0aG9yaXR5KHN0cmluZywgcGFydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICAgICAgcGFydHMudXJuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdoYXQncyBsZWZ0IG11c3QgYmUgdGhlIHBhdGhcbiAgICBwYXJ0cy5wYXRoID0gc3RyaW5nO1xuXG4gICAgLy8gYW5kIHdlJ3JlIGRvbmVcbiAgICByZXR1cm4gcGFydHM7XG4gIH07XG4gIFVSSS5wYXJzZUhvc3QgPSBmdW5jdGlvbiAoc3RyaW5nLCBwYXJ0cykge1xuICAgIC8vIGV4dHJhY3QgaG9zdDpwb3J0XG4gICAgdmFyIHBvcyA9IHN0cmluZy5pbmRleE9mKCcvJyk7XG4gICAgdmFyIGJyYWNrZXRQb3M7XG4gICAgdmFyIHQ7XG5cbiAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgcG9zID0gc3RyaW5nLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmNoYXJBdCgwKSA9PT0gJ1snKSB7XG4gICAgICAvLyBJUHY2IGhvc3QgLSBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1pZXRmLTZtYW4tdGV4dC1hZGRyLXJlcHJlc2VudGF0aW9uLTA0I3NlY3Rpb24tNlxuICAgICAgLy8gSSBjbGFpbSBtb3N0IGNsaWVudCBzb2Z0d2FyZSBicmVha3Mgb24gSVB2NiBhbnl3YXlzLiBUbyBzaW1wbGlmeSB0aGluZ3MsIFVSSSBvbmx5IGFjY2VwdHNcbiAgICAgIC8vIElQdjYrcG9ydCBpbiB0aGUgZm9ybWF0IFsyMDAxOmRiODo6MV06ODAgKGZvciB0aGUgdGltZSBiZWluZylcbiAgICAgIGJyYWNrZXRQb3MgPSBzdHJpbmcuaW5kZXhPZignXScpO1xuICAgICAgcGFydHMuaG9zdG5hbWUgPSBzdHJpbmcuc3Vic3RyaW5nKDEsIGJyYWNrZXRQb3MpIHx8IG51bGw7XG4gICAgICBwYXJ0cy5wb3J0ID0gc3RyaW5nLnN1YnN0cmluZyhicmFja2V0UG9zICsgMiwgcG9zKSB8fCBudWxsO1xuICAgICAgaWYgKHBhcnRzLnBvcnQgPT09ICcvJykge1xuICAgICAgICBwYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZpcnN0Q29sb24gPSBzdHJpbmcuaW5kZXhPZignOicpO1xuICAgICAgdmFyIGZpcnN0U2xhc2ggPSBzdHJpbmcuaW5kZXhPZignLycpO1xuICAgICAgdmFyIG5leHRDb2xvbiA9IHN0cmluZy5pbmRleE9mKCc6JywgZmlyc3RDb2xvbiArIDEpO1xuICAgICAgaWYgKG5leHRDb2xvbiAhPT0gLTEgJiYgKGZpcnN0U2xhc2ggPT09IC0xIHx8IG5leHRDb2xvbiA8IGZpcnN0U2xhc2gpKSB7XG4gICAgICAgIC8vIElQdjYgaG9zdCBjb250YWlucyBtdWx0aXBsZSBjb2xvbnMgLSBidXQgbm8gcG9ydFxuICAgICAgICAvLyB0aGlzIG5vdGF0aW9uIGlzIGFjdHVhbGx5IG5vdCBhbGxvd2VkIGJ5IFJGQyAzOTg2LCBidXQgd2UncmUgYSBsaWJlcmFsIHBhcnNlclxuICAgICAgICBwYXJ0cy5ob3N0bmFtZSA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKSB8fCBudWxsO1xuICAgICAgICBwYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHQgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykuc3BsaXQoJzonKTtcbiAgICAgICAgcGFydHMuaG9zdG5hbWUgPSB0WzBdIHx8IG51bGw7XG4gICAgICAgIHBhcnRzLnBvcnQgPSB0WzFdIHx8IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcnRzLmhvc3RuYW1lICYmIHN0cmluZy5zdWJzdHJpbmcocG9zKS5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgcG9zKys7XG4gICAgICBzdHJpbmcgPSAnLycgKyBzdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZy5zdWJzdHJpbmcocG9zKSB8fCAnLyc7XG4gIH07XG4gIFVSSS5wYXJzZUF1dGhvcml0eSA9IGZ1bmN0aW9uIChzdHJpbmcsIHBhcnRzKSB7XG4gICAgc3RyaW5nID0gVVJJLnBhcnNlVXNlcmluZm8oc3RyaW5nLCBwYXJ0cyk7XG4gICAgcmV0dXJuIFVSSS5wYXJzZUhvc3Qoc3RyaW5nLCBwYXJ0cyk7XG4gIH07XG4gIFVSSS5wYXJzZVVzZXJpbmZvID0gZnVuY3Rpb24gKHN0cmluZywgcGFydHMpIHtcbiAgICAvLyBleHRyYWN0IHVzZXJuYW1lOnBhc3N3b3JkXG4gICAgdmFyIGZpcnN0U2xhc2ggPSBzdHJpbmcuaW5kZXhPZignLycpO1xuICAgIHZhciBwb3MgPSBzdHJpbmcubGFzdEluZGV4T2YoJ0AnLCBmaXJzdFNsYXNoID4gLTEgPyBmaXJzdFNsYXNoIDogc3RyaW5nLmxlbmd0aCAtIDEpO1xuICAgIHZhciB0O1xuXG4gICAgLy8gYXV0aG9yaXR5QCBtdXN0IGNvbWUgYmVmb3JlIC9wYXRoXG4gICAgaWYgKHBvcyA+IC0xICYmIChmaXJzdFNsYXNoID09PSAtMSB8fCBwb3MgPCBmaXJzdFNsYXNoKSkge1xuICAgICAgdCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKS5zcGxpdCgnOicpO1xuICAgICAgcGFydHMudXNlcm5hbWUgPSB0WzBdID8gVVJJLmRlY29kZSh0WzBdKSA6IG51bGw7XG4gICAgICB0LnNoaWZ0KCk7XG4gICAgICBwYXJ0cy5wYXNzd29yZCA9IHRbMF0gPyBVUkkuZGVjb2RlKHQuam9pbignOicpKSA6IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cy51c2VybmFtZSA9IG51bGw7XG4gICAgICBwYXJ0cy5wYXNzd29yZCA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcbiAgVVJJLnBhcnNlUXVlcnkgPSBmdW5jdGlvbiAoc3RyaW5nLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvLyB0aHJvdyBvdXQgdGhlIGZ1bmt5IGJ1c2luZXNzIC0gXCI/XCJbbmFtZVwiPVwidmFsdWVcIiZcIl0rXG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyYrL2csICcmJykucmVwbGFjZSgvXlxcPyomKnwmKyQvZywgJycpO1xuXG4gICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICB2YXIgaXRlbXMgPSB7fTtcbiAgICB2YXIgc3BsaXRzID0gc3RyaW5nLnNwbGl0KCcmJyk7XG4gICAgdmFyIGxlbmd0aCA9IHNwbGl0cy5sZW5ndGg7XG4gICAgdmFyIHYsIG5hbWUsIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdiA9IHNwbGl0c1tpXS5zcGxpdCgnPScpO1xuICAgICAgbmFtZSA9IFVSSS5kZWNvZGVRdWVyeSh2LnNoaWZ0KCksIGVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgLy8gbm8gXCI9XCIgaXMgbnVsbCBhY2NvcmRpbmcgdG8gaHR0cDovL2R2Y3MudzMub3JnL2hnL3VybC9yYXctZmlsZS90aXAvT3ZlcnZpZXcuaHRtbCNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgICB2YWx1ZSA9IHYubGVuZ3RoID8gVVJJLmRlY29kZVF1ZXJ5KHYuam9pbignPScpLCBlc2NhcGVRdWVyeVNwYWNlKSA6IG51bGw7XG5cbiAgICAgIGlmIChoYXNPd24uY2FsbChpdGVtcywgbmFtZSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtc1tuYW1lXSA9PT0gJ3N0cmluZycgfHwgaXRlbXNbbmFtZV0gPT09IG51bGwpIHtcbiAgICAgICAgICBpdGVtc1tuYW1lXSA9IFtpdGVtc1tuYW1lXV07XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtc1tuYW1lXS5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGl0ZW1zW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9O1xuXG4gIFVSSS5idWlsZCA9IGZ1bmN0aW9uIChwYXJ0cykge1xuICAgIHZhciB0ID0gJyc7XG5cbiAgICBpZiAocGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHQgKz0gcGFydHMucHJvdG9jb2wgKyAnOic7XG4gICAgfVxuXG4gICAgaWYgKCFwYXJ0cy51cm4gJiYgKHQgfHwgcGFydHMuaG9zdG5hbWUpKSB7XG4gICAgICB0ICs9ICcvLyc7XG4gICAgfVxuXG4gICAgdCArPSBVUkkuYnVpbGRBdXRob3JpdHkocGFydHMpIHx8ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJ0cy5wYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHBhcnRzLnBhdGguY2hhckF0KDApICE9PSAnLycgJiYgdHlwZW9mIHBhcnRzLmhvc3RuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICB0ICs9ICcvJztcbiAgICAgIH1cblxuICAgICAgdCArPSBwYXJ0cy5wYXRoO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGFydHMucXVlcnkgPT09ICdzdHJpbmcnICYmIHBhcnRzLnF1ZXJ5KSB7XG4gICAgICB0ICs9ICc/JyArIHBhcnRzLnF1ZXJ5O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGFydHMuZnJhZ21lbnQgPT09ICdzdHJpbmcnICYmIHBhcnRzLmZyYWdtZW50KSB7XG4gICAgICB0ICs9ICcjJyArIHBhcnRzLmZyYWdtZW50O1xuICAgIH1cbiAgICByZXR1cm4gdDtcbiAgfTtcbiAgVVJJLmJ1aWxkSG9zdCA9IGZ1bmN0aW9uIChwYXJ0cykge1xuICAgIHZhciB0ID0gJyc7XG5cbiAgICBpZiAoIXBhcnRzLmhvc3RuYW1lKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmIChVUkkuaXA2X2V4cHJlc3Npb24udGVzdChwYXJ0cy5ob3N0bmFtZSkpIHtcbiAgICAgIHQgKz0gJ1snICsgcGFydHMuaG9zdG5hbWUgKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHQgKz0gcGFydHMuaG9zdG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKHBhcnRzLnBvcnQpIHtcbiAgICAgIHQgKz0gJzonICsgcGFydHMucG9ydDtcbiAgICB9XG5cbiAgICByZXR1cm4gdDtcbiAgfTtcbiAgVVJJLmJ1aWxkQXV0aG9yaXR5ID0gZnVuY3Rpb24gKHBhcnRzKSB7XG4gICAgcmV0dXJuIFVSSS5idWlsZFVzZXJpbmZvKHBhcnRzKSArIFVSSS5idWlsZEhvc3QocGFydHMpO1xuICB9O1xuICBVUkkuYnVpbGRVc2VyaW5mbyA9IGZ1bmN0aW9uIChwYXJ0cykge1xuICAgIHZhciB0ID0gJyc7XG5cbiAgICBpZiAocGFydHMudXNlcm5hbWUpIHtcbiAgICAgIHQgKz0gVVJJLmVuY29kZShwYXJ0cy51c2VybmFtZSk7XG5cbiAgICAgIGlmIChwYXJ0cy5wYXNzd29yZCkge1xuICAgICAgICB0ICs9ICc6JyArIFVSSS5lbmNvZGUocGFydHMucGFzc3dvcmQpO1xuICAgICAgfVxuXG4gICAgICB0ICs9ICdAJztcbiAgICB9XG5cbiAgICByZXR1cm4gdDtcbiAgfTtcbiAgVVJJLmJ1aWxkUXVlcnkgPSBmdW5jdGlvbiAoZGF0YSwgZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgLy8gYWNjb3JkaW5nIHRvIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYgb3IgaHR0cDovL2xhYnMuYXBhY2hlLm9yZy93ZWJhcmNoL3VyaS9yZmMvcmZjMzk4Ni5odG1sXG4gICAgLy8gYmVpbmcgwrstLl9+ISQmJygpKissOz06QC8/wqsgJUhFWCBhbmQgYWxudW0gYXJlIGFsbG93ZWRcbiAgICAvLyB0aGUgUkZDIGV4cGxpY2l0bHkgc3RhdGVzID8vZm9vIGJlaW5nIGEgdmFsaWQgdXNlIGNhc2UsIG5vIG1lbnRpb24gb2YgcGFyYW1ldGVyIHN5bnRheCFcbiAgICAvLyBVUkkuanMgdHJlYXRzIHRoZSBxdWVyeSBzdHJpbmcgYXMgYmVpbmcgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAgLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL1JFQy1odG1sNDAvaW50ZXJhY3QvZm9ybXMuaHRtbCNmb3JtLWNvbnRlbnQtdHlwZVxuXG4gICAgdmFyIHQgPSAnJztcbiAgICB2YXIgdW5pcXVlLCBrZXksIGksIGxlbmd0aDtcbiAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoaGFzT3duLmNhbGwoZGF0YSwga2V5KSAmJiBrZXkpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkoZGF0YVtrZXldKSkge1xuICAgICAgICAgIHVuaXF1ZSA9IHt9O1xuICAgICAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGRhdGFba2V5XS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGRhdGFba2V5XVtpXSAhPT0gdW5kZWZpbmVkICYmIHVuaXF1ZVtkYXRhW2tleV1baV0gKyAnJ10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICB0ICs9ICcmJyArIFVSSS5idWlsZFF1ZXJ5UGFyYW1ldGVyKGtleSwgZGF0YVtrZXldW2ldLCBlc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgICAgICAgICAgaWYgKGR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHVuaXF1ZVtkYXRhW2tleV1baV0gKyAnJ10gPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdCArPSAnJicgKyBVUkkuYnVpbGRRdWVyeVBhcmFtZXRlcihrZXksIGRhdGFba2V5XSwgZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdC5zdWJzdHJpbmcoMSk7XG4gIH07XG4gIFVSSS5idWlsZFF1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MC9pbnRlcmFjdC9mb3Jtcy5odG1sI2Zvcm0tY29udGVudC10eXBlIC0tIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAgIC8vIGRvbid0IGFwcGVuZCBcIj1cIiBmb3IgbnVsbCB2YWx1ZXMsIGFjY29yZGluZyB0byBodHRwOi8vZHZjcy53My5vcmcvaGcvdXJsL3Jhdy1maWxlL3RpcC9PdmVydmlldy5odG1sI3VybC1wYXJhbWV0ZXItc2VyaWFsaXphdGlvblxuICAgIHJldHVybiBVUkkuZW5jb2RlUXVlcnkobmFtZSwgZXNjYXBlUXVlcnlTcGFjZSkgKyAodmFsdWUgIT09IG51bGwgPyAnPScgKyBVUkkuZW5jb2RlUXVlcnkodmFsdWUsIGVzY2FwZVF1ZXJ5U3BhY2UpIDogJycpO1xuICB9O1xuXG4gIFVSSS5hZGRRdWVyeSA9IGZ1bmN0aW9uIChkYXRhLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgVVJJLmFkZFF1ZXJ5KGRhdGEsIGtleSwgbmFtZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoZGF0YVtuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGFbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YVtuYW1lXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZGF0YVtuYW1lXSA9IFtkYXRhW25hbWVdXTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IFt2YWx1ZV07XG4gICAgICB9XG5cbiAgICAgIGRhdGFbbmFtZV0gPSAoZGF0YVtuYW1lXSB8fCBbXSkuY29uY2F0KHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVVJJLmFkZFF1ZXJ5KCkgYWNjZXB0cyBhbiBvYmplY3QsIHN0cmluZyBhcyB0aGUgbmFtZSBwYXJhbWV0ZXInKTtcbiAgICB9XG4gIH07XG4gIFVSSS5yZW1vdmVRdWVyeSA9IGZ1bmN0aW9uIChkYXRhLCBuYW1lLCB2YWx1ZSkge1xuICAgIHZhciBpLCBsZW5ndGgsIGtleTtcblxuICAgIGlmIChpc0FycmF5KG5hbWUpKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBuYW1lLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRhdGFbbmFtZVtpXV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChnZXRUeXBlKG5hbWUpID09PSAnUmVnRXhwJykge1xuICAgICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgICBpZiAobmFtZS50ZXN0KGtleSkpIHtcbiAgICAgICAgICBkYXRhW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yIChrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIFVSSS5yZW1vdmVRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGdldFR5cGUodmFsdWUpID09PSAnUmVnRXhwJykge1xuICAgICAgICAgIGlmICghaXNBcnJheShkYXRhW25hbWVdKSAmJiB2YWx1ZS50ZXN0KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgICBkYXRhW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhW25hbWVdID0gZmlsdGVyQXJyYXlWYWx1ZXMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkYXRhW25hbWVdID09PSB2YWx1ZSkge1xuICAgICAgICAgIGRhdGFbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShkYXRhW25hbWVdKSkge1xuICAgICAgICAgIGRhdGFbbmFtZV0gPSBmaWx0ZXJBcnJheVZhbHVlcyhkYXRhW25hbWVdLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGFbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5yZW1vdmVRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcsIFJlZ0V4cCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyJyk7XG4gICAgfVxuICB9O1xuICBVUkkuaGFzUXVlcnkgPSBmdW5jdGlvbiAoZGF0YSwgbmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKG5hbWUsIGtleSkpIHtcbiAgICAgICAgICBpZiAoIVVSSS5oYXNRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5oYXNRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChnZXRUeXBlKHZhbHVlKSkge1xuICAgICAgY2FzZSAnVW5kZWZpbmVkJzpcbiAgICAgICAgLy8gdHJ1ZSBpZiBleGlzdHMgKGJ1dCBtYXkgYmUgZW1wdHkpXG4gICAgICAgIHJldHVybiBuYW1lIGluIGRhdGE7IC8vIGRhdGFbbmFtZV0gIT09IHVuZGVmaW5lZDtcblxuICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgIC8vIHRydWUgaWYgZXhpc3RzIGFuZCBub24tZW1wdHlcbiAgICAgICAgdmFyIF9ib29seSA9IEJvb2xlYW4oaXNBcnJheShkYXRhW25hbWVdKSA/IGRhdGFbbmFtZV0ubGVuZ3RoIDogZGF0YVtuYW1lXSk7XG4gICAgICAgIHJldHVybiB2YWx1ZSA9PT0gX2Jvb2x5O1xuXG4gICAgICBjYXNlICdGdW5jdGlvbic6XG4gICAgICAgIC8vIGFsbG93IGNvbXBsZXggY29tcGFyaXNvblxuICAgICAgICByZXR1cm4gISF2YWx1ZShkYXRhW25hbWVdLCBuYW1lLCBkYXRhKTtcblxuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3AgPSB3aXRoaW5BcnJheSA/IGFycmF5Q29udGFpbnMgOiBhcnJheXNFcXVhbDtcbiAgICAgICAgcmV0dXJuIG9wKGRhdGFbbmFtZV0sIHZhbHVlKTtcblxuICAgICAgY2FzZSAnUmVnRXhwJzpcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgcmV0dXJuIEJvb2xlYW4oZGF0YVtuYW1lXSAmJiBkYXRhW25hbWVdLm1hdGNoKHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdpdGhpbkFycmF5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5Q29udGFpbnMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuXG4gICAgICBjYXNlICdOdW1iZXInOlxuICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YVtuYW1lXSA9PT0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdpdGhpbkFycmF5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5Q29udGFpbnMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuaGFzUXVlcnkoKSBhY2NlcHRzIHVuZGVmaW5lZCwgYm9vbGVhbiwgc3RyaW5nLCBudW1iZXIsIFJlZ0V4cCwgRnVuY3Rpb24gYXMgdGhlIHZhbHVlIHBhcmFtZXRlcicpO1xuICAgIH1cbiAgfTtcblxuICBVUkkuY29tbW9uUGF0aCA9IGZ1bmN0aW9uIChvbmUsIHR3bykge1xuICAgIHZhciBsZW5ndGggPSBNYXRoLm1pbihvbmUubGVuZ3RoLCB0d28ubGVuZ3RoKTtcbiAgICB2YXIgcG9zO1xuXG4gICAgLy8gZmluZCBmaXJzdCBub24tbWF0Y2hpbmcgY2hhcmFjdGVyXG4gICAgZm9yIChwb3MgPSAwOyBwb3MgPCBsZW5ndGg7IHBvcysrKSB7XG4gICAgICBpZiAob25lLmNoYXJBdChwb3MpICE9PSB0d28uY2hhckF0KHBvcykpIHtcbiAgICAgICAgcG9zLS07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3MgPCAxKSB7XG4gICAgICByZXR1cm4gb25lLmNoYXJBdCgwKSA9PT0gdHdvLmNoYXJBdCgwKSAmJiBvbmUuY2hhckF0KDApID09PSAnLycgPyAnLycgOiAnJztcbiAgICB9XG5cbiAgICAvLyByZXZlcnQgdG8gbGFzdCAvXG4gICAgaWYgKG9uZS5jaGFyQXQocG9zKSAhPT0gJy8nIHx8IHR3by5jaGFyQXQocG9zKSAhPT0gJy8nKSB7XG4gICAgICBwb3MgPSBvbmUuc3Vic3RyaW5nKDAsIHBvcykubGFzdEluZGV4T2YoJy8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb25lLnN1YnN0cmluZygwLCBwb3MgKyAxKTtcbiAgfTtcblxuICBVUkkud2l0aGluU3RyaW5nID0gZnVuY3Rpb24gKHN0cmluZywgY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHZhciBfc3RhcnQgPSBvcHRpb25zLnN0YXJ0IHx8IFVSSS5maW5kVXJpLnN0YXJ0O1xuICAgIHZhciBfZW5kID0gb3B0aW9ucy5lbmQgfHwgVVJJLmZpbmRVcmkuZW5kO1xuICAgIHZhciBfdHJpbSA9IG9wdGlvbnMudHJpbSB8fCBVUkkuZmluZFVyaS50cmltO1xuICAgIHZhciBfYXR0cmlidXRlT3BlbiA9IC9bYS16MC05LV09W1wiJ10/JC9pO1xuXG4gICAgX3N0YXJ0Lmxhc3RJbmRleCA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBtYXRjaCA9IF9zdGFydC5leGVjKHN0cmluZyk7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhcnQgPSBtYXRjaC5pbmRleDtcbiAgICAgIGlmIChvcHRpb25zLmlnbm9yZUh0bWwpIHtcbiAgICAgICAgLy8gYXR0cmlidXQoZT1bXCInXT8kKVxuICAgICAgICB2YXIgYXR0cmlidXRlT3BlbiA9IHN0cmluZy5zbGljZShNYXRoLm1heChzdGFydCAtIDMsIDApLCBzdGFydCk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVPcGVuICYmIF9hdHRyaWJ1dGVPcGVuLnRlc3QoYXR0cmlidXRlT3BlbikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgZW5kID0gc3RhcnQgKyBzdHJpbmcuc2xpY2Uoc3RhcnQpLnNlYXJjaChfZW5kKTtcbiAgICAgIHZhciBzbGljZSA9IHN0cmluZy5zbGljZShzdGFydCwgZW5kKS5yZXBsYWNlKF90cmltLCAnJyk7XG4gICAgICBpZiAob3B0aW9ucy5pZ25vcmUgJiYgb3B0aW9ucy5pZ25vcmUudGVzdChzbGljZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGVuZCA9IHN0YXJ0ICsgc2xpY2UubGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrKHNsaWNlLCBzdGFydCwgZW5kLCBzdHJpbmcpO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDAsIHN0YXJ0KSArIHJlc3VsdCArIHN0cmluZy5zbGljZShlbmQpO1xuICAgICAgX3N0YXJ0Lmxhc3RJbmRleCA9IHN0YXJ0ICsgcmVzdWx0Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBfc3RhcnQubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xuXG4gIFVSSS5lbnN1cmVWYWxpZEhvc3RuYW1lID0gZnVuY3Rpb24gKHYpIHtcbiAgICAvLyBUaGVvcmV0aWNhbGx5IFVSSXMgYWxsb3cgcGVyY2VudC1lbmNvZGluZyBpbiBIb3N0bmFtZXMgKGFjY29yZGluZyB0byBSRkMgMzk4NilcbiAgICAvLyB0aGV5IGFyZSBub3QgcGFydCBvZiBETlMgYW5kIHRoZXJlZm9yZSBpZ25vcmVkIGJ5IFVSSS5qc1xuXG4gICAgaWYgKHYubWF0Y2goVVJJLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycykpIHtcbiAgICAgIC8vIHRlc3QgcHVueWNvZGVcbiAgICAgIGlmICghcHVueWNvZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXSBhbmQgUHVueWNvZGUuanMgaXMgbm90IGF2YWlsYWJsZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAocHVueWNvZGUudG9BU0NJSSh2KS5tYXRjaChVUkkuaW52YWxpZF9ob3N0bmFtZV9jaGFyYWN0ZXJzKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdIb3N0bmFtZSBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05Li1dJyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIG5vQ29uZmxpY3RcbiAgVVJJLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAocmVtb3ZlQWxsKSB7XG4gICAgaWYgKHJlbW92ZUFsbCkge1xuICAgICAgdmFyIHVuY29uZmxpY3RlZCA9IHtcbiAgICAgICAgVVJJOiB0aGlzLm5vQ29uZmxpY3QoKVxuICAgICAgfTtcblxuICAgICAgaWYgKHJvb3QuVVJJVGVtcGxhdGUgJiYgdHlwZW9mIHJvb3QuVVJJVGVtcGxhdGUubm9Db25mbGljdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB1bmNvbmZsaWN0ZWQuVVJJVGVtcGxhdGUgPSByb290LlVSSVRlbXBsYXRlLm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3QuSVB2NiAmJiB0eXBlb2Ygcm9vdC5JUHY2Lm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLklQdjYgPSByb290LklQdjYubm9Db25mbGljdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAocm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgJiYgdHlwZW9mIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLlNlY29uZExldmVsRG9tYWlucyA9IHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuY29uZmxpY3RlZDtcbiAgICB9IGVsc2UgaWYgKHJvb3QuVVJJID09PSB0aGlzKSB7XG4gICAgICByb290LlVSSSA9IF9VUkk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5idWlsZCA9IGZ1bmN0aW9uIChkZWZlckJ1aWxkKSB7XG4gICAgaWYgKGRlZmVyQnVpbGQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuX2RlZmVycmVkX2J1aWxkID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGRlZmVyQnVpbGQgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9kZWZlcnJlZF9idWlsZCkge1xuICAgICAgdGhpcy5fc3RyaW5nID0gVVJJLmJ1aWxkKHRoaXMuX3BhcnRzKTtcbiAgICAgIHRoaXMuX2RlZmVycmVkX2J1aWxkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFVSSSh0aGlzKTtcbiAgfTtcblxuICBwLnZhbHVlT2YgPSBwLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmJ1aWxkKGZhbHNlKS5fc3RyaW5nO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoX3BhcnQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0c1tfcGFydF0gfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wYXJ0c1tfcGFydF0gPSB2IHx8IG51bGw7XG4gICAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoX3BhcnQsIF9rZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0c1tfcGFydF0gfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodiAhPT0gbnVsbCkge1xuICAgICAgICAgIHYgPSB2ICsgJyc7XG4gICAgICAgICAgaWYgKHYuY2hhckF0KDApID09PSBfa2V5KSB7XG4gICAgICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFydHNbX3BhcnRdID0gdjtcbiAgICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcC5wcm90b2NvbCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3Byb3RvY29sJyk7XG4gIHAudXNlcm5hbWUgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCd1c2VybmFtZScpO1xuICBwLnBhc3N3b3JkID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcigncGFzc3dvcmQnKTtcbiAgcC5ob3N0bmFtZSA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ2hvc3RuYW1lJyk7XG4gIHAucG9ydCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3BvcnQnKTtcbiAgcC5xdWVyeSA9IGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoJ3F1ZXJ5JywgJz8nKTtcbiAgcC5mcmFnbWVudCA9IGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoJ2ZyYWdtZW50JywgJyMnKTtcblxuICBwLnNlYXJjaCA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIHZhciB0ID0gdGhpcy5xdWVyeSh2LCBidWlsZCk7XG4gICAgcmV0dXJuIHR5cGVvZiB0ID09PSAnc3RyaW5nJyAmJiB0Lmxlbmd0aCA/ICc/JyArIHQgOiB0O1xuICB9O1xuICBwLmhhc2ggPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICB2YXIgdCA9IHRoaXMuZnJhZ21lbnQodiwgYnVpbGQpO1xuICAgIHJldHVybiB0eXBlb2YgdCA9PT0gJ3N0cmluZycgJiYgdC5sZW5ndGggPyAnIycgKyB0IDogdDtcbiAgfTtcblxuICBwLnBhdGhuYW1lID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSB0cnVlKSB7XG4gICAgICB2YXIgcmVzID0gdGhpcy5fcGFydHMucGF0aCB8fCAodGhpcy5fcGFydHMuaG9zdG5hbWUgPyAnLycgOiAnJyk7XG4gICAgICByZXR1cm4gdiA/ICh0aGlzLl9wYXJ0cy51cm4gPyBVUkkuZGVjb2RlVXJuUGF0aCA6IFVSSS5kZWNvZGVQYXRoKShyZXMpIDogcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB2ID8gVVJJLnJlY29kZVVyblBhdGgodikgOiAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB2ID8gVVJJLnJlY29kZVBhdGgodikgOiAnLyc7XG4gICAgICB9XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAucGF0aCA9IHAucGF0aG5hbWU7XG4gIHAuaHJlZiA9IGZ1bmN0aW9uIChocmVmLCBidWlsZCkge1xuICAgIHZhciBrZXk7XG5cbiAgICBpZiAoaHJlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHRoaXMuX3N0cmluZyA9ICcnO1xuICAgIHRoaXMuX3BhcnRzID0gVVJJLl9wYXJ0cygpO1xuXG4gICAgdmFyIF9VUkkgPSBocmVmIGluc3RhbmNlb2YgVVJJO1xuICAgIHZhciBfb2JqZWN0ID0gdHlwZW9mIGhyZWYgPT09ICdvYmplY3QnICYmIChocmVmLmhvc3RuYW1lIHx8IGhyZWYucGF0aCB8fCBocmVmLnBhdGhuYW1lKTtcbiAgICBpZiAoaHJlZi5ub2RlTmFtZSkge1xuICAgICAgdmFyIGF0dHJpYnV0ZSA9IFVSSS5nZXREb21BdHRyaWJ1dGUoaHJlZik7XG4gICAgICBocmVmID0gaHJlZlthdHRyaWJ1dGVdIHx8ICcnO1xuICAgICAgX29iamVjdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHdpbmRvdy5sb2NhdGlvbiBpcyByZXBvcnRlZCB0byBiZSBhbiBvYmplY3QsIGJ1dCBpdCdzIG5vdCB0aGUgc29ydFxuICAgIC8vIG9mIG9iamVjdCB3ZSdyZSBsb29raW5nIGZvcjpcbiAgICAvLyAqIGxvY2F0aW9uLnByb3RvY29sIGVuZHMgd2l0aCBhIGNvbG9uXG4gICAgLy8gKiBsb2NhdGlvbi5xdWVyeSAhPSBvYmplY3Quc2VhcmNoXG4gICAgLy8gKiBsb2NhdGlvbi5oYXNoICE9IG9iamVjdC5mcmFnbWVudFxuICAgIC8vIHNpbXBseSBzZXJpYWxpemluZyB0aGUgdW5rbm93biBvYmplY3Qgc2hvdWxkIGRvIHRoZSB0cmlja1xuICAgIC8vIChmb3IgbG9jYXRpb24sIG5vdCBmb3IgZXZlcnl0aGluZy4uLilcbiAgICBpZiAoIV9VUkkgJiYgX29iamVjdCAmJiBocmVmLnBhdGhuYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGhyZWYgPSBocmVmLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBocmVmID09PSAnc3RyaW5nJyB8fCBocmVmIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICB0aGlzLl9wYXJ0cyA9IFVSSS5wYXJzZShTdHJpbmcoaHJlZiksIHRoaXMuX3BhcnRzKTtcbiAgICB9IGVsc2UgaWYgKF9VUkkgfHwgX29iamVjdCkge1xuICAgICAgdmFyIHNyYyA9IF9VUkkgPyBocmVmLl9wYXJ0cyA6IGhyZWY7XG4gICAgICBmb3IgKGtleSBpbiBzcmMpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKHRoaXMuX3BhcnRzLCBrZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcGFydHNba2V5XSA9IHNyY1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ludmFsaWQgaW5wdXQnKTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gaWRlbnRpZmljYXRpb24gYWNjZXNzb3JzXG4gIHAuaXMgPSBmdW5jdGlvbiAod2hhdCkge1xuICAgIHZhciBpcCA9IGZhbHNlO1xuICAgIHZhciBpcDQgPSBmYWxzZTtcbiAgICB2YXIgaXA2ID0gZmFsc2U7XG4gICAgdmFyIG5hbWUgPSBmYWxzZTtcbiAgICB2YXIgc2xkID0gZmFsc2U7XG4gICAgdmFyIGlkbiA9IGZhbHNlO1xuICAgIHZhciBwdW55Y29kZSA9IGZhbHNlO1xuICAgIHZhciByZWxhdGl2ZSA9ICF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICBpZiAodGhpcy5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIHJlbGF0aXZlID0gZmFsc2U7XG4gICAgICBpcDQgPSBVUkkuaXA0X2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpcDYgPSBVUkkuaXA2X2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpcCA9IGlwNCB8fCBpcDY7XG4gICAgICBuYW1lID0gIWlwO1xuICAgICAgc2xkID0gbmFtZSAmJiBTTEQgJiYgU0xELmhhcyh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpZG4gPSBuYW1lICYmIFVSSS5pZG5fZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIHB1bnljb2RlID0gbmFtZSAmJiBVUkkucHVueWNvZGVfZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHdoYXQudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAncmVsYXRpdmUnOlxuICAgICAgICByZXR1cm4gcmVsYXRpdmU7XG5cbiAgICAgIGNhc2UgJ2Fic29sdXRlJzpcbiAgICAgICAgcmV0dXJuICFyZWxhdGl2ZTtcblxuICAgICAgLy8gaG9zdG5hbWUgaWRlbnRpZmljYXRpb25cbiAgICAgIGNhc2UgJ2RvbWFpbic6XG4gICAgICBjYXNlICduYW1lJzpcbiAgICAgICAgcmV0dXJuIG5hbWU7XG5cbiAgICAgIGNhc2UgJ3NsZCc6XG4gICAgICAgIHJldHVybiBzbGQ7XG5cbiAgICAgIGNhc2UgJ2lwJzpcbiAgICAgICAgcmV0dXJuIGlwO1xuXG4gICAgICBjYXNlICdpcDQnOlxuICAgICAgY2FzZSAnaXB2NCc6XG4gICAgICBjYXNlICdpbmV0NCc6XG4gICAgICAgIHJldHVybiBpcDQ7XG5cbiAgICAgIGNhc2UgJ2lwNic6XG4gICAgICBjYXNlICdpcHY2JzpcbiAgICAgIGNhc2UgJ2luZXQ2JzpcbiAgICAgICAgcmV0dXJuIGlwNjtcblxuICAgICAgY2FzZSAnaWRuJzpcbiAgICAgICAgcmV0dXJuIGlkbjtcblxuICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgcmV0dXJuICF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICAgIGNhc2UgJ3Vybic6XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3BhcnRzLnVybjtcblxuICAgICAgY2FzZSAncHVueWNvZGUnOlxuICAgICAgICByZXR1cm4gcHVueWNvZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLy8gY29tcG9uZW50IHNwZWNpZmljIGlucHV0IHZhbGlkYXRpb25cbiAgdmFyIF9wcm90b2NvbCA9IHAucHJvdG9jb2w7XG4gIHZhciBfcG9ydCA9IHAucG9ydDtcbiAgdmFyIF9ob3N0bmFtZSA9IHAuaG9zdG5hbWU7XG5cbiAgcC5wcm90b2NvbCA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh2KSB7XG4gICAgICAgIC8vIGFjY2VwdCB0cmFpbGluZyA6Ly9cbiAgICAgICAgdiA9IHYucmVwbGFjZSgvOihcXC9cXC8pPyQvLCAnJyk7XG5cbiAgICAgICAgaWYgKCF2Lm1hdGNoKFVSSS5wcm90b2NvbF9leHByZXNzaW9uKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb3RvY29sIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuKy1dIG9yIGRvZXNuXFwndCBzdGFydCB3aXRoIFtBLVpdJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9wcm90b2NvbC5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgfTtcbiAgcC5zY2hlbWUgPSBwLnByb3RvY29sO1xuICBwLnBvcnQgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh2ID09PSAwKSB7XG4gICAgICAgIHYgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodikge1xuICAgICAgICB2ICs9ICcnO1xuICAgICAgICBpZiAodi5jaGFyQXQoMCkgPT09ICc6Jykge1xuICAgICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2Lm1hdGNoKC9bXjAtOV0vKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BvcnQgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gWzAtOV0nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3BvcnQuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG4gIHAuaG9zdG5hbWUgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB4ID0ge307XG4gICAgICBVUkkucGFyc2VIb3N0KHYsIHgpO1xuICAgICAgdiA9IHguaG9zdG5hbWU7XG4gICAgfVxuICAgIHJldHVybiBfaG9zdG5hbWUuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG5cbiAgLy8gY29tcG91bmQgYWNjZXNzb3JzXG4gIHAuaG9zdCA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gVVJJLmJ1aWxkSG9zdCh0aGlzLl9wYXJ0cykgOiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgVVJJLnBhcnNlSG9zdCh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuYXV0aG9yaXR5ID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUgPyBVUkkuYnVpbGRBdXRob3JpdHkodGhpcy5fcGFydHMpIDogJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIFVSSS5wYXJzZUF1dGhvcml0eSh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAudXNlcmluZm8gPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMudXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgdCA9IFVSSS5idWlsZFVzZXJpbmZvKHRoaXMuX3BhcnRzKTtcbiAgICAgIHJldHVybiB0LnN1YnN0cmluZygwLCB0Lmxlbmd0aCAtIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodlt2Lmxlbmd0aCAtIDFdICE9PSAnQCcpIHtcbiAgICAgICAgdiArPSAnQCc7XG4gICAgICB9XG5cbiAgICAgIFVSSS5wYXJzZVVzZXJpbmZvKHYsIHRoaXMuX3BhcnRzKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5yZXNvdXJjZSA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIHZhciBwYXJ0cztcblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhdGgoKSArIHRoaXMuc2VhcmNoKCkgKyB0aGlzLmhhc2goKTtcbiAgICB9XG5cbiAgICBwYXJ0cyA9IFVSSS5wYXJzZSh2KTtcbiAgICB0aGlzLl9wYXJ0cy5wYXRoID0gcGFydHMucGF0aDtcbiAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IHBhcnRzLnF1ZXJ5O1xuICAgIHRoaXMuX3BhcnRzLmZyYWdtZW50ID0gcGFydHMuZnJhZ21lbnQ7XG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIGZyYWN0aW9uIGFjY2Vzc29yc1xuICBwLnN1YmRvbWFpbiA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgLy8gY29udmVuaWVuY2UsIHJldHVybiBcInd3d1wiIGZyb20gXCJ3d3cuZXhhbXBsZS5vcmdcIlxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIGdyYWIgZG9tYWluIGFuZCBhZGQgYW5vdGhlciBzZWdtZW50XG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy5kb21haW4oKS5sZW5ndGggLSAxO1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlbmQpIHx8ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMuZG9tYWluKCkubGVuZ3RoO1xuICAgICAgdmFyIHN1YiA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlKTtcbiAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cCgnXicgKyBlc2NhcGVSZWdFeChzdWIpKTtcblxuICAgICAgaWYgKHYgJiYgdi5jaGFyQXQodi5sZW5ndGggLSAxKSAhPT0gJy4nKSB7XG4gICAgICAgIHYgKz0gJy4nO1xuICAgICAgfVxuXG4gICAgICBpZiAodikge1xuICAgICAgICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSh2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmRvbWFpbiA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gY29udmVuaWVuY2UsIHJldHVybiBcImV4YW1wbGUub3JnXCIgZnJvbSBcInd3dy5leGFtcGxlLm9yZ1wiXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgLy8gaWYgaG9zdG5hbWUgY29uc2lzdHMgb2YgMSBvciAyIHNlZ21lbnRzLCBpdCBtdXN0IGJlIHRoZSBkb21haW5cbiAgICAgIHZhciB0ID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubWF0Y2goL1xcLi9nKTtcbiAgICAgIGlmICh0ICYmIHQubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGdyYWIgdGxkIGFuZCBhZGQgYW5vdGhlciBzZWdtZW50XG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy50bGQoYnVpbGQpLmxlbmd0aCAtIDE7XG4gICAgICBlbmQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sYXN0SW5kZXhPZignLicsIGVuZCAtIDEpICsgMTtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoZW5kKSB8fCAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF2KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Nhbm5vdCBzZXQgZG9tYWluIGVtcHR5Jyk7XG4gICAgICB9XG5cbiAgICAgIFVSSS5lbnN1cmVWYWxpZEhvc3RuYW1lKHYpO1xuXG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHRoaXMuZG9tYWluKCkpICsgJyQnKTtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAudGxkID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gXCJvcmdcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIHZhciB0bGQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcocG9zICsgMSk7XG5cbiAgICAgIGlmIChidWlsZCAhPT0gdHJ1ZSAmJiBTTEQgJiYgU0xELmxpc3RbdGxkLnRvTG93ZXJDYXNlKCldKSB7XG4gICAgICAgIHJldHVybiBTTEQuZ2V0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB8fCB0bGQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0bGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXBsYWNlO1xuXG4gICAgICBpZiAoIXYpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2Fubm90IHNldCBUTEQgZW1wdHknKTtcbiAgICAgIH0gZWxzZSBpZiAodi5tYXRjaCgvW15hLXpBLVowLTktXS8pKSB7XG4gICAgICAgIGlmIChTTEQgJiYgU0xELmlzKHYpKSB7XG4gICAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUTEQgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOV0nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ2Nhbm5vdCBzZXQgVExEIG9uIG5vbi1kb21haW4gaG9zdCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5kaXJlY3RvcnkgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5wYXRoICYmICF0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcvJztcbiAgICAgIH1cblxuICAgICAgdmFyIGVuZCA9IHRoaXMuX3BhcnRzLnBhdGgubGVuZ3RoIC0gdGhpcy5maWxlbmFtZSgpLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgcmVzID0gdGhpcy5fcGFydHMucGF0aC5zdWJzdHJpbmcoMCwgZW5kKSB8fCAodGhpcy5fcGFydHMuaG9zdG5hbWUgPyAnLycgOiAnJyk7XG5cbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGgocmVzKSA6IHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGUgPSB0aGlzLl9wYXJ0cy5wYXRoLmxlbmd0aCAtIHRoaXMuZmlsZW5hbWUoKS5sZW5ndGg7XG4gICAgICB2YXIgZGlyZWN0b3J5ID0gdGhpcy5fcGFydHMucGF0aC5zdWJzdHJpbmcoMCwgZSk7XG4gICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoJ14nICsgZXNjYXBlUmVnRXgoZGlyZWN0b3J5KSk7XG5cbiAgICAgIC8vIGZ1bGx5IHF1YWxpZmllciBkaXJlY3RvcmllcyBiZWdpbiB3aXRoIGEgc2xhc2hcbiAgICAgIGlmICghdGhpcy5pcygncmVsYXRpdmUnKSkge1xuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICB2ID0gJy8nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHYuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgICAgICB2ID0gJy8nICsgdjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBkaXJlY3RvcmllcyBhbHdheXMgZW5kIHdpdGggYSBzbGFzaFxuICAgICAgaWYgKHYgJiYgdi5jaGFyQXQodi5sZW5ndGggLSAxKSAhPT0gJy8nKSB7XG4gICAgICAgIHYgKz0gJy8nO1xuICAgICAgfVxuXG4gICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmZpbGVuYW1lID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCB0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMucGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKHBvcyArIDEpO1xuXG4gICAgICByZXR1cm4gdiA/IFVSSS5kZWNvZGVQYXRoU2VnbWVudChyZXMpIDogcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbXV0YXRlZERpcmVjdG9yeSA9IGZhbHNlO1xuXG4gICAgICBpZiAodi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh2Lm1hdGNoKC9cXC4/XFwvLykpIHtcbiAgICAgICAgbXV0YXRlZERpcmVjdG9yeSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCh0aGlzLmZpbGVuYW1lKCkpICsgJyQnKTtcbiAgICAgIHYgPSBVUkkucmVjb2RlUGF0aCh2KTtcbiAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UocmVwbGFjZSwgdik7XG5cbiAgICAgIGlmIChtdXRhdGVkRGlyZWN0b3J5KSB7XG4gICAgICAgIHRoaXMubm9ybWFsaXplUGF0aChidWlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5zdWZmaXggPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5wYXRoIHx8IHRoaXMuX3BhcnRzLnBhdGggPT09ICcvJykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaWxlbmFtZSA9IHRoaXMuZmlsZW5hbWUoKTtcbiAgICAgIHZhciBwb3MgPSBmaWxlbmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgdmFyIHMsIHJlcztcblxuICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBzdWZmaXggbWF5IG9ubHkgY29udGFpbiBhbG51bSBjaGFyYWN0ZXJzICh5dXAsIEkgbWFkZSB0aGlzIHVwLilcbiAgICAgIHMgPSBmaWxlbmFtZS5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICByZXMgPSAvXlthLXowLTklXSskL2kudGVzdChzKSA/IHMgOiAnJztcbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGhTZWdtZW50KHJlcykgOiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gJy4nKSB7XG4gICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN1ZmZpeCA9IHRoaXMuc3VmZml4KCk7XG4gICAgICB2YXIgcmVwbGFjZTtcblxuICAgICAgaWYgKCFzdWZmaXgpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoICs9ICcuJyArIFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgfSBlbHNlIGlmICghdikge1xuICAgICAgICByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCgnLicgKyBzdWZmaXgpICsgJyQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHN1ZmZpeCkgKyAnJCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5zZWdtZW50ID0gZnVuY3Rpb24gKHNlZ21lbnQsIHYsIGJ1aWxkKSB7XG4gICAgdmFyIHNlcGFyYXRvciA9IHRoaXMuX3BhcnRzLnVybiA/ICc6JyA6ICcvJztcbiAgICB2YXIgcGF0aCA9IHRoaXMucGF0aCgpO1xuICAgIHZhciBhYnNvbHV0ZSA9IHBhdGguc3Vic3RyaW5nKDAsIDEpID09PSAnLyc7XG4gICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdChzZXBhcmF0b3IpO1xuXG4gICAgaWYgKHNlZ21lbnQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSBzZWdtZW50O1xuICAgICAgc2VnbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZWdtZW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgc2VnbWVudCBcIicgKyBzZWdtZW50ICsgJ1wiLCBtdXN0IGJlIDAtYmFzZWQgaW50ZWdlcicpO1xuICAgIH1cblxuICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgc2VnbWVudHMuc2hpZnQoKTtcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudCA8IDApIHtcbiAgICAgIC8vIGFsbG93IG5lZ2F0aXZlIGluZGV4ZXMgdG8gYWRkcmVzcyBmcm9tIHRoZSBlbmRcbiAgICAgIHNlZ21lbnQgPSBNYXRoLm1heChzZWdtZW50cy5sZW5ndGggKyBzZWdtZW50LCAwKTtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvKmpzaGludCBsYXhicmVhazogdHJ1ZSAqL1xuICAgICAgcmV0dXJuIHNlZ21lbnQgPT09IHVuZGVmaW5lZCA/IHNlZ21lbnRzIDogc2VnbWVudHNbc2VnbWVudF07XG4gICAgICAvKmpzaGludCBsYXhicmVhazogZmFsc2UgKi9cbiAgICB9IGVsc2UgaWYgKHNlZ21lbnQgPT09IG51bGwgfHwgc2VnbWVudHNbc2VnbWVudF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGlzQXJyYXkodikpIHtcbiAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgLy8gY29sbGFwc2UgZW1wdHkgZWxlbWVudHMgd2l0aGluIGFycmF5XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoIXZbaV0ubGVuZ3RoICYmICghc2VnbWVudHMubGVuZ3RoIHx8ICFzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoICYmICFzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlZ21lbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlZ21lbnRzLnB1c2godltpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodiB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdID09PSAnJykge1xuICAgICAgICAgIC8vIGVtcHR5IHRyYWlsaW5nIGVsZW1lbnRzIGhhdmUgdG8gYmUgb3ZlcndyaXR0ZW5cbiAgICAgICAgICAvLyB0byBwcmV2ZW50IHJlc3VsdHMgc3VjaCBhcyAvZm9vLy9iYXJcbiAgICAgICAgICBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXSA9IHY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudHMucHVzaCh2KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodikge1xuICAgICAgICBzZWdtZW50c1tzZWdtZW50XSA9IHY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWdtZW50cy5zcGxpY2Uoc2VnbWVudCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFic29sdXRlKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KCcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wYXRoKHNlZ21lbnRzLmpvaW4oc2VwYXJhdG9yKSwgYnVpbGQpO1xuICB9O1xuICBwLnNlZ21lbnRDb2RlZCA9IGZ1bmN0aW9uIChzZWdtZW50LCB2LCBidWlsZCkge1xuICAgIHZhciBzZWdtZW50cywgaSwgbDtcblxuICAgIGlmICh0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSBzZWdtZW50O1xuICAgICAgc2VnbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzZWdtZW50cyA9IHRoaXMuc2VnbWVudChzZWdtZW50LCB2LCBidWlsZCk7XG4gICAgICBpZiAoIWlzQXJyYXkoc2VnbWVudHMpKSB7XG4gICAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMgIT09IHVuZGVmaW5lZCA/IFVSSS5kZWNvZGUoc2VnbWVudHMpIDogdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHNlZ21lbnRzW2ldID0gVVJJLmRlY29kZShzZWdtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIGlmICghaXNBcnJheSh2KSkge1xuICAgICAgdiA9IHR5cGVvZiB2ID09PSAnc3RyaW5nJyB8fCB2IGluc3RhbmNlb2YgU3RyaW5nID8gVVJJLmVuY29kZSh2KSA6IHY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB2Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2W2ldID0gVVJJLmVuY29kZSh2W2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zZWdtZW50KHNlZ21lbnQsIHYsIGJ1aWxkKTtcbiAgfTtcblxuICAvLyBtdXRhdGluZyBxdWVyeSBzdHJpbmdcbiAgdmFyIHEgPSBwLnF1ZXJ5O1xuICBwLnF1ZXJ5ID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHYgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICB2YXIgcmVzdWx0ID0gdi5jYWxsKHRoaXMsIGRhdGEpO1xuICAgICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShyZXN1bHQgfHwgZGF0YSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSBpZiAodiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeSh2LCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBxLmNhbGwodGhpcywgdiwgYnVpbGQpO1xuICAgIH1cbiAgfTtcbiAgcC5zZXRRdWVyeSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgYnVpbGQpIHtcbiAgICB2YXIgZGF0YSA9IFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcblxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgfHwgbmFtZSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IG51bGw7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgZGF0YVtrZXldID0gbmFtZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5hZGRRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLmFkZFF1ZXJ5ID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBidWlsZCkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIFVSSS5hZGRRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHZhbHVlKTtcbiAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IFVSSS5idWlsZFF1ZXJ5KGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgYnVpbGQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAucmVtb3ZlUXVlcnkgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIGJ1aWxkKSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgVVJJLnJlbW92ZVF1ZXJ5KGRhdGEsIG5hbWUsIHZhbHVlKTtcbiAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IFVSSS5idWlsZFF1ZXJ5KGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgYnVpbGQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAuaGFzUXVlcnkgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgcmV0dXJuIFVSSS5oYXNRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSwgd2l0aGluQXJyYXkpO1xuICB9O1xuICBwLnNldFNlYXJjaCA9IHAuc2V0UXVlcnk7XG4gIHAuYWRkU2VhcmNoID0gcC5hZGRRdWVyeTtcbiAgcC5yZW1vdmVTZWFyY2ggPSBwLnJlbW92ZVF1ZXJ5O1xuICBwLmhhc1NlYXJjaCA9IHAuaGFzUXVlcnk7XG5cbiAgLy8gc2FuaXRpemluZyBVUkxzXG4gIHAubm9ybWFsaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVByb3RvY29sKGZhbHNlKS5ub3JtYWxpemVQYXRoKGZhbHNlKS5ub3JtYWxpemVRdWVyeShmYWxzZSkubm9ybWFsaXplRnJhZ21lbnQoZmFsc2UpLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUHJvdG9jb2woZmFsc2UpLm5vcm1hbGl6ZUhvc3RuYW1lKGZhbHNlKS5ub3JtYWxpemVQb3J0KGZhbHNlKS5ub3JtYWxpemVQYXRoKGZhbHNlKS5ub3JtYWxpemVRdWVyeShmYWxzZSkubm9ybWFsaXplRnJhZ21lbnQoZmFsc2UpLmJ1aWxkKCk7XG4gIH07XG4gIHAubm9ybWFsaXplUHJvdG9jb2wgPSBmdW5jdGlvbiAoYnVpbGQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzLnByb3RvY29sID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcGFydHMucHJvdG9jb2wgPSB0aGlzLl9wYXJ0cy5wcm90b2NvbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZUhvc3RuYW1lID0gZnVuY3Rpb24gKGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICBpZiAodGhpcy5pcygnSUROJykgJiYgcHVueWNvZGUpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSBwdW55Y29kZS50b0FTQ0lJKHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pcygnSVB2NicpICYmIElQdjYpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSBJUHY2LmJlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplUG9ydCA9IGZ1bmN0aW9uIChidWlsZCkge1xuICAgIC8vIHJlbW92ZSBwb3J0IG9mIGl0J3MgdGhlIHByb3RvY29sJ3MgZGVmYXVsdFxuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucHJvdG9jb2wgPT09ICdzdHJpbmcnICYmIHRoaXMuX3BhcnRzLnBvcnQgPT09IFVSSS5kZWZhdWx0UG9ydHNbdGhpcy5fcGFydHMucHJvdG9jb2xdKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVQYXRoID0gZnVuY3Rpb24gKGJ1aWxkKSB7XG4gICAgdmFyIF9wYXRoID0gdGhpcy5fcGFydHMucGF0aDtcbiAgICBpZiAoIV9wYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gVVJJLnJlY29kZVVyblBhdGgodGhpcy5fcGFydHMucGF0aCk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMucGF0aCA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgX3dhc19yZWxhdGl2ZTtcbiAgICB2YXIgX2xlYWRpbmdQYXJlbnRzID0gJyc7XG4gICAgdmFyIF9wYXJlbnQsIF9wb3M7XG5cbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHNcbiAgICBpZiAoX3BhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIF93YXNfcmVsYXRpdmUgPSB0cnVlO1xuICAgICAgX3BhdGggPSAnLycgKyBfcGF0aDtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgZmlsZXMgKGFzIG9wcG9zZWQgdG8gZGlyZWN0b3JpZXMpXG4gICAgaWYgKF9wYXRoLnNsaWNlKC0zKSA9PT0gJy8uLicgfHwgX3BhdGguc2xpY2UoLTIpID09PSAnLy4nKSB7XG4gICAgICBfcGF0aCArPSAnLyc7XG4gICAgfVxuXG4gICAgLy8gcmVzb2x2ZSBzaW1wbGVzXG4gICAgX3BhdGggPSBfcGF0aC5yZXBsYWNlKC8oXFwvKFxcLlxcLykrKXwoXFwvXFwuJCkvZywgJy8nKS5yZXBsYWNlKC9cXC97Mix9L2csICcvJyk7XG5cbiAgICAvLyByZW1lbWJlciBsZWFkaW5nIHBhcmVudHNcbiAgICBpZiAoX3dhc19yZWxhdGl2ZSkge1xuICAgICAgX2xlYWRpbmdQYXJlbnRzID0gX3BhdGguc3Vic3RyaW5nKDEpLm1hdGNoKC9eKFxcLlxcLlxcLykrLykgfHwgJyc7XG4gICAgICBpZiAoX2xlYWRpbmdQYXJlbnRzKSB7XG4gICAgICAgIF9sZWFkaW5nUGFyZW50cyA9IF9sZWFkaW5nUGFyZW50c1swXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXNvbHZlIHBhcmVudHNcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgX3BhcmVudCA9IF9wYXRoLmluZGV4T2YoJy8uLicpO1xuICAgICAgaWYgKF9wYXJlbnQgPT09IC0xKSB7XG4gICAgICAgIC8vIG5vIG1vcmUgLi4vIHRvIHJlc29sdmVcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKF9wYXJlbnQgPT09IDApIHtcbiAgICAgICAgLy8gdG9wIGxldmVsIGNhbm5vdCBiZSByZWxhdGl2ZSwgc2tpcCBpdFxuICAgICAgICBfcGF0aCA9IF9wYXRoLnN1YnN0cmluZygzKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIF9wb3MgPSBfcGF0aC5zdWJzdHJpbmcoMCwgX3BhcmVudCkubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgIGlmIChfcG9zID09PSAtMSkge1xuICAgICAgICBfcG9zID0gX3BhcmVudDtcbiAgICAgIH1cbiAgICAgIF9wYXRoID0gX3BhdGguc3Vic3RyaW5nKDAsIF9wb3MpICsgX3BhdGguc3Vic3RyaW5nKF9wYXJlbnQgKyAzKTtcbiAgICB9XG5cbiAgICAvLyByZXZlcnQgdG8gcmVsYXRpdmVcbiAgICBpZiAoX3dhc19yZWxhdGl2ZSAmJiB0aGlzLmlzKCdyZWxhdGl2ZScpKSB7XG4gICAgICBfcGF0aCA9IF9sZWFkaW5nUGFyZW50cyArIF9wYXRoLnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICBfcGF0aCA9IFVSSS5yZWNvZGVQYXRoKF9wYXRoKTtcbiAgICB0aGlzLl9wYXJ0cy5wYXRoID0gX3BhdGg7XG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZVBhdGhuYW1lID0gcC5ub3JtYWxpemVQYXRoO1xuICBwLm5vcm1hbGl6ZVF1ZXJ5ID0gZnVuY3Rpb24gKGJ1aWxkKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl9wYXJ0cy5xdWVyeSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucXVlcnkubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucXVlcnkoVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZUZyYWdtZW50ID0gZnVuY3Rpb24gKGJ1aWxkKSB7XG4gICAgaWYgKCF0aGlzLl9wYXJ0cy5mcmFnbWVudCkge1xuICAgICAgdGhpcy5fcGFydHMuZnJhZ21lbnQgPSBudWxsO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZVNlYXJjaCA9IHAubm9ybWFsaXplUXVlcnk7XG4gIHAubm9ybWFsaXplSGFzaCA9IHAubm9ybWFsaXplRnJhZ21lbnQ7XG5cbiAgcC5pc284ODU5ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGV4cGVjdCB1bmljb2RlIGlucHV0LCBpc284ODU5IG91dHB1dFxuICAgIHZhciBlID0gVVJJLmVuY29kZTtcbiAgICB2YXIgZCA9IFVSSS5kZWNvZGU7XG5cbiAgICBVUkkuZW5jb2RlID0gZXNjYXBlO1xuICAgIFVSSS5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIFVSSS5lbmNvZGUgPSBlO1xuICAgICAgVVJJLmRlY29kZSA9IGQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAudW5pY29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBleHBlY3QgaXNvODg1OSBpbnB1dCwgdW5pY29kZSBvdXRwdXRcbiAgICB2YXIgZSA9IFVSSS5lbmNvZGU7XG4gICAgdmFyIGQgPSBVUkkuZGVjb2RlO1xuXG4gICAgVVJJLmVuY29kZSA9IHN0cmljdEVuY29kZVVSSUNvbXBvbmVudDtcbiAgICBVUkkuZGVjb2RlID0gdW5lc2NhcGU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIFVSSS5lbmNvZGUgPSBlO1xuICAgICAgVVJJLmRlY29kZSA9IGQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAucmVhZGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVyaSA9IHRoaXMuY2xvbmUoKTtcbiAgICAvLyByZW1vdmluZyB1c2VybmFtZSwgcGFzc3dvcmQsIGJlY2F1c2UgdGhleSBzaG91bGRuJ3QgYmUgZGlzcGxheWVkIGFjY29yZGluZyB0byBSRkMgMzk4NlxuICAgIHVyaS51c2VybmFtZSgnJykucGFzc3dvcmQoJycpLm5vcm1hbGl6ZSgpO1xuICAgIHZhciB0ID0gJyc7XG4gICAgaWYgKHVyaS5fcGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHQgKz0gdXJpLl9wYXJ0cy5wcm90b2NvbCArICc6Ly8nO1xuICAgIH1cblxuICAgIGlmICh1cmkuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICBpZiAodXJpLmlzKCdwdW55Y29kZScpICYmIHB1bnljb2RlKSB7XG4gICAgICAgIHQgKz0gcHVueWNvZGUudG9Vbmljb2RlKHVyaS5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgICBpZiAodXJpLl9wYXJ0cy5wb3J0KSB7XG4gICAgICAgICAgdCArPSAnOicgKyB1cmkuX3BhcnRzLnBvcnQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHQgKz0gdXJpLmhvc3QoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXJpLl9wYXJ0cy5ob3N0bmFtZSAmJiB1cmkuX3BhcnRzLnBhdGggJiYgdXJpLl9wYXJ0cy5wYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0ICs9ICcvJztcbiAgICB9XG5cbiAgICB0ICs9IHVyaS5wYXRoKHRydWUpO1xuICAgIGlmICh1cmkuX3BhcnRzLnF1ZXJ5KSB7XG4gICAgICB2YXIgcSA9ICcnO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHFwID0gdXJpLl9wYXJ0cy5xdWVyeS5zcGxpdCgnJicpLCBsID0gcXAubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrdiA9IChxcFtpXSB8fCAnJykuc3BsaXQoJz0nKTtcbiAgICAgICAgcSArPSAnJicgKyBVUkkuZGVjb2RlUXVlcnkoa3ZbMF0sIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpLnJlcGxhY2UoLyYvZywgJyUyNicpO1xuXG4gICAgICAgIGlmIChrdlsxXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcSArPSAnPScgKyBVUkkuZGVjb2RlUXVlcnkoa3ZbMV0sIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpLnJlcGxhY2UoLyYvZywgJyUyNicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0ICs9ICc/JyArIHEuc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIHQgKz0gVVJJLmRlY29kZVF1ZXJ5KHVyaS5oYXNoKCksIHRydWUpO1xuICAgIHJldHVybiB0O1xuICB9O1xuXG4gIC8vIHJlc29sdmluZyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgVVJMc1xuICBwLmFic29sdXRlVG8gPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgIHZhciByZXNvbHZlZCA9IHRoaXMuY2xvbmUoKTtcbiAgICB2YXIgcHJvcGVydGllcyA9IFsncHJvdG9jb2wnLCAndXNlcm5hbWUnLCAncGFzc3dvcmQnLCAnaG9zdG5hbWUnLCAncG9ydCddO1xuICAgIHZhciBiYXNlZGlyLCBpLCBwO1xuXG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVUk5zIGRvIG5vdCBoYXZlIGFueSBnZW5lcmFsbHkgZGVmaW5lZCBoaWVyYXJjaGljYWwgY29tcG9uZW50cycpO1xuICAgIH1cblxuICAgIGlmICghKGJhc2UgaW5zdGFuY2VvZiBVUkkpKSB7XG4gICAgICBiYXNlID0gbmV3IFVSSShiYXNlKTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc29sdmVkLl9wYXJ0cy5wcm90b2NvbCkge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnByb3RvY29sID0gYmFzZS5fcGFydHMucHJvdG9jb2w7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgcCA9IHByb3BlcnRpZXNbaV07IGkrKykge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzW3BdID0gYmFzZS5fcGFydHNbcF07XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvbHZlZC5fcGFydHMucGF0aCkge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnBhdGggPSBiYXNlLl9wYXJ0cy5wYXRoO1xuICAgICAgaWYgKCFyZXNvbHZlZC5fcGFydHMucXVlcnkpIHtcbiAgICAgICAgcmVzb2x2ZWQuX3BhcnRzLnF1ZXJ5ID0gYmFzZS5fcGFydHMucXVlcnk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChyZXNvbHZlZC5fcGFydHMucGF0aC5zdWJzdHJpbmcoLTIpID09PSAnLi4nKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHMucGF0aCArPSAnLyc7XG4gICAgfVxuXG4gICAgaWYgKHJlc29sdmVkLnBhdGgoKS5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgYmFzZWRpciA9IGJhc2UuZGlyZWN0b3J5KCk7XG4gICAgICBiYXNlZGlyID0gYmFzZWRpciA/IGJhc2VkaXIgOiBiYXNlLnBhdGgoKS5pbmRleE9mKCcvJykgPT09IDAgPyAnLycgOiAnJztcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wYXRoID0gKGJhc2VkaXIgPyBiYXNlZGlyICsgJy8nIDogJycpICsgcmVzb2x2ZWQuX3BhcnRzLnBhdGg7XG4gICAgICByZXNvbHZlZC5ub3JtYWxpemVQYXRoKCk7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWQuYnVpbGQoKTtcbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gIH07XG4gIHAucmVsYXRpdmVUbyA9IGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgdmFyIHJlbGF0aXZlID0gdGhpcy5jbG9uZSgpLm5vcm1hbGl6ZSgpO1xuICAgIHZhciByZWxhdGl2ZVBhcnRzLCBiYXNlUGFydHMsIGNvbW1vbiwgcmVsYXRpdmVQYXRoLCBiYXNlUGF0aDtcblxuICAgIGlmIChyZWxhdGl2ZS5fcGFydHMudXJuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VSTnMgZG8gbm90IGhhdmUgYW55IGdlbmVyYWxseSBkZWZpbmVkIGhpZXJhcmNoaWNhbCBjb21wb25lbnRzJyk7XG4gICAgfVxuXG4gICAgYmFzZSA9IG5ldyBVUkkoYmFzZSkubm9ybWFsaXplKCk7XG4gICAgcmVsYXRpdmVQYXJ0cyA9IHJlbGF0aXZlLl9wYXJ0cztcbiAgICBiYXNlUGFydHMgPSBiYXNlLl9wYXJ0cztcbiAgICByZWxhdGl2ZVBhdGggPSByZWxhdGl2ZS5wYXRoKCk7XG4gICAgYmFzZVBhdGggPSBiYXNlLnBhdGgoKTtcblxuICAgIGlmIChyZWxhdGl2ZVBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVVJJIGlzIGFscmVhZHkgcmVsYXRpdmUnKTtcbiAgICB9XG5cbiAgICBpZiAoYmFzZVBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGN1bGF0ZSBhIFVSSSByZWxhdGl2ZSB0byBhbm90aGVyIHJlbGF0aXZlIFVSSScpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLnByb3RvY29sID09PSBiYXNlUGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHJlbGF0aXZlUGFydHMucHJvdG9jb2wgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLnVzZXJuYW1lICE9PSBiYXNlUGFydHMudXNlcm5hbWUgfHwgcmVsYXRpdmVQYXJ0cy5wYXNzd29yZCAhPT0gYmFzZVBhcnRzLnBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy5wcm90b2NvbCAhPT0gbnVsbCB8fCByZWxhdGl2ZVBhcnRzLnVzZXJuYW1lICE9PSBudWxsIHx8IHJlbGF0aXZlUGFydHMucGFzc3dvcmQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLmhvc3RuYW1lID09PSBiYXNlUGFydHMuaG9zdG5hbWUgJiYgcmVsYXRpdmVQYXJ0cy5wb3J0ID09PSBiYXNlUGFydHMucG9ydCkge1xuICAgICAgcmVsYXRpdmVQYXJ0cy5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZVBhcnRzLnBvcnQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXRoID09PSBiYXNlUGF0aCkge1xuICAgICAgcmVsYXRpdmVQYXJ0cy5wYXRoID0gJyc7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICAvLyBkZXRlcm1pbmUgY29tbW9uIHN1YiBwYXRoXG4gICAgY29tbW9uID0gVVJJLmNvbW1vblBhdGgocmVsYXRpdmVQYXRoLCBiYXNlUGF0aCk7XG5cbiAgICAvLyBJZiB0aGUgcGF0aHMgaGF2ZSBub3RoaW5nIGluIGNvbW1vbiwgcmV0dXJuIGEgcmVsYXRpdmUgVVJMIHdpdGggdGhlIGFic29sdXRlIHBhdGguXG4gICAgaWYgKCFjb21tb24pIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIHZhciBwYXJlbnRzID0gYmFzZVBhcnRzLnBhdGguc3Vic3RyaW5nKGNvbW1vbi5sZW5ndGgpLnJlcGxhY2UoL1teXFwvXSokLywgJycpLnJlcGxhY2UoLy4qP1xcLy9nLCAnLi4vJyk7XG5cbiAgICByZWxhdGl2ZVBhcnRzLnBhdGggPSBwYXJlbnRzICsgcmVsYXRpdmVQYXJ0cy5wYXRoLnN1YnN0cmluZyhjb21tb24ubGVuZ3RoKSB8fCAnLi8nO1xuXG4gICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gIH07XG5cbiAgLy8gY29tcGFyaW5nIFVSSXNcbiAgcC5lcXVhbHMgPSBmdW5jdGlvbiAodXJpKSB7XG4gICAgdmFyIG9uZSA9IHRoaXMuY2xvbmUoKTtcbiAgICB2YXIgdHdvID0gbmV3IFVSSSh1cmkpO1xuICAgIHZhciBvbmVfbWFwID0ge307XG4gICAgdmFyIHR3b19tYXAgPSB7fTtcbiAgICB2YXIgY2hlY2tlZCA9IHt9O1xuICAgIHZhciBvbmVfcXVlcnksIHR3b19xdWVyeSwga2V5O1xuXG4gICAgb25lLm5vcm1hbGl6ZSgpO1xuICAgIHR3by5ub3JtYWxpemUoKTtcblxuICAgIC8vIGV4YWN0IG1hdGNoXG4gICAgaWYgKG9uZS50b1N0cmluZygpID09PSB0d28udG9TdHJpbmcoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBxdWVyeSBzdHJpbmdcbiAgICBvbmVfcXVlcnkgPSBvbmUucXVlcnkoKTtcbiAgICB0d29fcXVlcnkgPSB0d28ucXVlcnkoKTtcbiAgICBvbmUucXVlcnkoJycpO1xuICAgIHR3by5xdWVyeSgnJyk7XG5cbiAgICAvLyBkZWZpbml0ZWx5IG5vdCBlcXVhbCBpZiBub3QgZXZlbiBub24tcXVlcnkgcGFydHMgbWF0Y2hcbiAgICBpZiAob25lLnRvU3RyaW5nKCkgIT09IHR3by50b1N0cmluZygpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcXVlcnkgcGFyYW1ldGVycyBoYXZlIHRoZSBzYW1lIGxlbmd0aCwgZXZlbiBpZiB0aGV5J3JlIHBlcm11dGVkXG4gICAgaWYgKG9uZV9xdWVyeS5sZW5ndGggIT09IHR3b19xdWVyeS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvbmVfbWFwID0gVVJJLnBhcnNlUXVlcnkob25lX3F1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICB0d29fbWFwID0gVVJJLnBhcnNlUXVlcnkodHdvX3F1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcblxuICAgIGZvciAoa2V5IGluIG9uZV9tYXApIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbChvbmVfbWFwLCBrZXkpKSB7XG4gICAgICAgIGlmICghaXNBcnJheShvbmVfbWFwW2tleV0pKSB7XG4gICAgICAgICAgaWYgKG9uZV9tYXBba2V5XSAhPT0gdHdvX21hcFtrZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFhcnJheXNFcXVhbChvbmVfbWFwW2tleV0sIHR3b19tYXBba2V5XSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjaGVja2VkW2tleV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoa2V5IGluIHR3b19tYXApIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbCh0d29fbWFwLCBrZXkpKSB7XG4gICAgICAgIGlmICghY2hlY2tlZFtrZXldKSB7XG4gICAgICAgICAgLy8gdHdvIGNvbnRhaW5zIGEgcGFyYW1ldGVyIG5vdCBwcmVzZW50IGluIG9uZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIHN0YXRlXG4gIHAuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKHYpIHtcbiAgICB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSAhIXY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5lc2NhcGVRdWVyeVNwYWNlID0gZnVuY3Rpb24gKHYpIHtcbiAgICB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlID0gISF2O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBVUkk7XG59KTsiLCIvKiEgVVJJLmpzIHYxLjE1LjIgaHR0cDovL21lZGlhbGl6ZS5naXRodWIuaW8vVVJJLmpzLyAqL1xuLyogYnVpbGQgY29udGFpbnM6IElQdjYuanMsIHB1bnljb2RlLmpzLCBTZWNvbmRMZXZlbERvbWFpbnMuanMsIFVSSS5qcywgVVJJVGVtcGxhdGUuanMgKi9cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKGUsIG4pIHtcbiAgXCJvYmplY3RcIiA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IG4oKSA6IFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKG4pIDogZS5JUHY2ID0gbihlKTtcbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKGUpIHtcbiAgdmFyIG4gPSBlICYmIGUuSVB2NjtyZXR1cm4geyBiZXN0OiBmdW5jdGlvbiBiZXN0KGcpIHtcbiAgICAgIGcgPSBnLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCI6XCIpO3ZhciBsID0gZy5sZW5ndGgsXG4gICAgICAgICAgYiA9IDg7XCJcIiA9PT0gZ1swXSAmJiBcIlwiID09PSBnWzFdICYmIFwiXCIgPT09IGdbMl0gPyAoZy5zaGlmdCgpLCBnLnNoaWZ0KCkpIDogXCJcIiA9PT0gZ1swXSAmJiBcIlwiID09PSBnWzFdID8gZy5zaGlmdCgpIDogXCJcIiA9PT0gZ1tsIC0gMV0gJiYgXCJcIiA9PT0gZ1tsIC0gMl0gJiYgZy5wb3AoKTtsID0gZy5sZW5ndGg7LTEgIT09IGdbbCAtIDFdLmluZGV4T2YoXCIuXCIpICYmIChiID0gNyk7dmFyIGg7Zm9yIChoID0gMDsgaCA8IGwgJiYgXCJcIiAhPT0gZ1toXTsgaCsrKTtpZiAoaCA8IGIpIGZvciAoZy5zcGxpY2UoaCwgMSwgXCIwMDAwXCIpOyBnLmxlbmd0aCA8IGI7KSBnLnNwbGljZShoLCAwLCBcIjAwMDBcIik7Zm9yIChoID0gMDsgaCA8IGI7IGgrKykge1xuICAgICAgICBmb3IgKHZhciBsID0gZ1toXS5zcGxpdChcIlwiKSwgZSA9IDA7IDMgPiBlOyBlKyspIGlmIChcIjBcIiA9PT0gbFswXSAmJiAxIDwgbC5sZW5ndGgpIGwuc3BsaWNlKDAsIDEpO2Vsc2UgYnJlYWs7Z1toXSA9IGwuam9pbihcIlwiKTtcbiAgICAgIH12YXIgbCA9IC0xLFxuICAgICAgICAgIG4gPSBlID0gMCxcbiAgICAgICAgICBrID0gLTEsXG4gICAgICAgICAgdSA9ICExO2ZvciAoaCA9IDA7IGggPCBiOyBoKyspIHUgPyBcIjBcIiA9PT0gZ1toXSA/IG4gKz0gMSA6ICh1ID0gITEsIG4gPiBlICYmIChsID0gaywgZSA9IG4pKSA6IFwiMFwiID09PSBnW2hdICYmICh1ID0gITAsIGsgPSBoLCBuID0gMSk7biA+IGUgJiYgKGwgPSBrLCBlID0gbik7MSA8IGUgJiYgZy5zcGxpY2UobCwgZSwgXCJcIik7bCA9IGcubGVuZ3RoO2IgPSBcIlwiO1wiXCIgPT09IGdbMF0gJiYgKGIgPSBcIjpcIik7Zm9yIChoID0gMDsgaCA8IGw7IGgrKykge1xuICAgICAgICBiICs9IGdbaF07aWYgKGggPT09IGwgLSAxKSBicmVhaztiICs9IFwiOlwiO1xuICAgICAgfVwiXCIgPT09IGdbbCAtIDFdICYmIChiICs9IFwiOlwiKTtyZXR1cm4gYjtcbiAgICB9LCBub0NvbmZsaWN0OiBmdW5jdGlvbiBub0NvbmZsaWN0KCkge1xuICAgICAgZS5JUHY2ID09PSB0aGlzICYmIChlLklQdjYgPSBuKTtyZXR1cm4gdGhpcztcbiAgICB9IH07XG59KTtcbihmdW5jdGlvbiAoZSkge1xuICBmdW5jdGlvbiBuKGIpIHtcbiAgICB0aHJvdyBSYW5nZUVycm9yKHZbYl0pO1xuICB9ZnVuY3Rpb24gZyhiLCBmKSB7XG4gICAgZm9yICh2YXIgayA9IGIubGVuZ3RoOyBrLS07KSBiW2tdID0gZihiW2tdKTtyZXR1cm4gYjtcbiAgfWZ1bmN0aW9uIGwoYiwgaykge1xuICAgIHJldHVybiBnKGIuc3BsaXQoZiksIGspLmpvaW4oXCIuXCIpO1xuICB9ZnVuY3Rpb24gYihiKSB7XG4gICAgZm9yICh2YXIgZiA9IFtdLCBrID0gMCwgZyA9IGIubGVuZ3RoLCBhLCBjOyBrIDwgZzspIGEgPSBiLmNoYXJDb2RlQXQoaysrKSwgNTUyOTYgPD0gYSAmJiA1NjMxOSA+PSBhICYmIGsgPCBnID8gKGMgPSBiLmNoYXJDb2RlQXQoaysrKSwgNTYzMjAgPT0gKGMgJiA2NDUxMikgPyBmLnB1c2goKChhICYgMTAyMykgPDwgMTApICsgKGMgJiAxMDIzKSArIDY1NTM2KSA6IChmLnB1c2goYSksIGstLSkpIDogZi5wdXNoKGEpO3JldHVybiBmO1xuICB9ZnVuY3Rpb24gaChiKSB7XG4gICAgcmV0dXJuIGcoYiwgZnVuY3Rpb24gKGIpIHtcbiAgICAgIHZhciBmID0gXCJcIjs2NTUzNSA8IGIgJiYgKGIgLT0gNjU1MzYsIGYgKz0geChiID4+PiAxMCAmIDEwMjMgfCA1NTI5NiksIGIgPSA1NjMyMCB8IGIgJiAxMDIzKTtyZXR1cm4gZiArPSB4KGIpO1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH1mdW5jdGlvbiBBKGIsIGYpIHtcbiAgICByZXR1cm4gYiArIDIyICsgNzUgKiAoMjYgPiBiKSAtICgoMCAhPSBmKSA8PCA1KTtcbiAgfWZ1bmN0aW9uIHcoYiwgZiwgaykge1xuICAgIHZhciBnID0gMDtiID0gayA/IHEoYiAvIDcwMCkgOiBiID4+IDE7Zm9yIChiICs9IHEoYiAvIGYpOyA0NTUgPCBiOyBnICs9IDM2KSBiID0gcShiIC8gMzUpO3JldHVybiBxKGcgKyAzNiAqIGIgLyAoYiArIDM4KSk7XG4gIH1mdW5jdGlvbiBrKGIpIHtcbiAgICB2YXIgZiA9IFtdLFxuICAgICAgICBrID0gYi5sZW5ndGgsXG4gICAgICAgIGcsXG4gICAgICAgIGEgPSAwLFxuICAgICAgICBjID0gMTI4LFxuICAgICAgICBkID0gNzIsXG4gICAgICAgIG0sXG4gICAgICAgIHosXG4gICAgICAgIHksXG4gICAgICAgIGUsXG4gICAgICAgIGw7bSA9IGIubGFzdEluZGV4T2YoXCItXCIpOzAgPiBtICYmIChtID0gMCk7Zm9yICh6ID0gMDsgeiA8IG07ICsreikgMTI4IDw9IGIuY2hhckNvZGVBdCh6KSAmJiBuKFwibm90LWJhc2ljXCIpLCBmLnB1c2goYi5jaGFyQ29kZUF0KHopKTtmb3IgKG0gPSAwIDwgbSA/IG0gKyAxIDogMDsgbSA8IGs7KSB7XG4gICAgICB6ID0gYTtnID0gMTtmb3IgKHkgPSAzNjs7IHkgKz0gMzYpIHtcbiAgICAgICAgbSA+PSBrICYmIG4oXCJpbnZhbGlkLWlucHV0XCIpO2UgPSBiLmNoYXJDb2RlQXQobSsrKTtlID0gMTAgPiBlIC0gNDggPyBlIC0gMjIgOiAyNiA+IGUgLSA2NSA/IGUgLSA2NSA6IDI2ID4gZSAtIDk3ID8gZSAtIDk3IDogMzY7KDM2IDw9IGUgfHwgZSA+IHEoKDIxNDc0ODM2NDcgLSBhKSAvIGcpKSAmJiBuKFwib3ZlcmZsb3dcIik7YSArPSBlICogZztsID0geSA8PSBkID8gMSA6IHkgPj0gZCArIDI2ID8gMjYgOiB5IC0gZDtpZiAoZSA8IGwpIGJyZWFrO2UgPSAzNiAtIGw7ZyA+IHEoMjE0NzQ4MzY0NyAvIGUpICYmIG4oXCJvdmVyZmxvd1wiKTtnICo9IGU7XG4gICAgICB9ZyA9IGYubGVuZ3RoICsgMTtkID0gdyhhIC0geiwgZywgMCA9PSB6KTtxKGEgLyBnKSA+IDIxNDc0ODM2NDcgLSBjICYmIG4oXCJvdmVyZmxvd1wiKTtjICs9IHEoYSAvIGcpO2EgJT0gZztmLnNwbGljZShhKyssIDAsIGMpO1xuICAgIH1yZXR1cm4gaChmKTtcbiAgfWZ1bmN0aW9uIHUoZikge1xuICAgIHZhciBnLFxuICAgICAgICBrLFxuICAgICAgICBlLFxuICAgICAgICBhLFxuICAgICAgICBjLFxuICAgICAgICBkLFxuICAgICAgICBtLFxuICAgICAgICB6LFxuICAgICAgICB5LFxuICAgICAgICBsID0gW10sXG4gICAgICAgIHUsXG4gICAgICAgIGgsXG4gICAgICAgIHA7ZiA9IGIoZik7dSA9IGYubGVuZ3RoO2cgPSAxMjg7ayA9IDA7YyA9IDcyO2ZvciAoZCA9IDA7IGQgPCB1OyArK2QpIHkgPSBmW2RdLCAxMjggPiB5ICYmIGwucHVzaCh4KHkpKTtmb3IgKChlID0gYSA9IGwubGVuZ3RoKSAmJiBsLnB1c2goXCItXCIpOyBlIDwgdTspIHtcbiAgICAgIG0gPSAyMTQ3NDgzNjQ3O2ZvciAoZCA9IDA7IGQgPCB1OyArK2QpIHkgPSBmW2RdLCB5ID49IGcgJiYgeSA8IG0gJiYgKG0gPSB5KTtoID0gZSArIDE7bSAtIGcgPiBxKCgyMTQ3NDgzNjQ3IC0gaykgLyBoKSAmJiBuKFwib3ZlcmZsb3dcIik7ayArPSAobSAtIGcpICogaDtnID0gbTtmb3IgKGQgPSAwOyBkIDwgdTsgKytkKSBpZiAoKHkgPSBmW2RdLCB5IDwgZyAmJiAyMTQ3NDgzNjQ3IDwgKytrICYmIG4oXCJvdmVyZmxvd1wiKSwgeSA9PSBnKSkge1xuICAgICAgICB6ID0gaztmb3IgKG0gPSAzNjs7IG0gKz0gMzYpIHtcbiAgICAgICAgICB5ID0gbSA8PSBjID8gMSA6IG0gPj0gYyArIDI2ID8gMjYgOiBtIC0gYztpZiAoeiA8IHkpIGJyZWFrO3AgPSB6IC0geTt6ID0gMzYgLSB5O2wucHVzaCh4KEEoeSArIHAgJSB6LCAwKSkpO3ogPSBxKHAgLyB6KTtcbiAgICAgICAgfWwucHVzaCh4KEEoeiwgMCkpKTtjID0gdyhrLCBoLCBlID09IGEpO2sgPSAwOysrZTtcbiAgICAgIH0rK2s7KytnO1xuICAgIH1yZXR1cm4gbC5qb2luKFwiXCIpO1xuICB9dmFyIEQgPSBcIm9iamVjdFwiID09IHR5cGVvZiBleHBvcnRzICYmIGV4cG9ydHMsXG4gICAgICBFID0gXCJvYmplY3RcIiA9PSB0eXBlb2YgbW9kdWxlICYmIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cyA9PSBEICYmIG1vZHVsZSxcbiAgICAgIEIgPSBcIm9iamVjdFwiID09IHR5cGVvZiBnbG9iYWwgJiYgZ2xvYmFsO2lmIChCLmdsb2JhbCA9PT0gQiB8fCBCLndpbmRvdyA9PT0gQikgZSA9IEI7dmFyIHQsXG4gICAgICByID0gL154bi0tLyxcbiAgICAgIHAgPSAvW14gLX5dLyxcbiAgICAgIGYgPSAvXFx4MkV8XFx1MzAwMnxcXHVGRjBFfFxcdUZGNjEvZyxcbiAgICAgIHYgPSB7IG92ZXJmbG93OiBcIk92ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzXCIsIFwibm90LWJhc2ljXCI6IFwiSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KVwiLFxuICAgIFwiaW52YWxpZC1pbnB1dFwiOiBcIkludmFsaWQgaW5wdXRcIiB9LFxuICAgICAgcSA9IE1hdGguZmxvb3IsXG4gICAgICB4ID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcbiAgICAgIEM7dCA9IHsgdmVyc2lvbjogXCIxLjIuM1wiLCB1Y3MyOiB7IGRlY29kZTogYiwgZW5jb2RlOiBoIH0sIGRlY29kZTogaywgZW5jb2RlOiB1LCB0b0FTQ0lJOiBmdW5jdGlvbiB0b0FTQ0lJKGIpIHtcbiAgICAgIHJldHVybiBsKGIsIGZ1bmN0aW9uIChiKSB7XG4gICAgICAgIHJldHVybiBwLnRlc3QoYikgPyBcInhuLS1cIiArIHUoYikgOiBiO1xuICAgICAgfSk7XG4gICAgfSwgdG9Vbmljb2RlOiBmdW5jdGlvbiB0b1VuaWNvZGUoYikge1xuICAgICAgcmV0dXJuIGwoYiwgZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgcmV0dXJuIHIudGVzdChiKSA/IGsoYi5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKSA6IGI7XG4gICAgICB9KTtcbiAgICB9IH07aWYgKFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIFwib2JqZWN0XCIgPT0gdHlwZW9mIGRlZmluZS5hbWQgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdDtcbiAgfSk7ZWxzZSBpZiAoRCAmJiAhRC5ub2RlVHlwZSkgaWYgKEUpIEUuZXhwb3J0cyA9IHQ7ZWxzZSBmb3IgKEMgaW4gdCkgdC5oYXNPd25Qcm9wZXJ0eShDKSAmJiAoRFtDXSA9IHRbQ10pO2Vsc2UgZS5wdW55Y29kZSA9IHQ7XG59KSh1bmRlZmluZWQpO1xuKGZ1bmN0aW9uIChlLCBuKSB7XG4gIFwib2JqZWN0XCIgPT09IHR5cGVvZiBleHBvcnRzID8gbW9kdWxlLmV4cG9ydHMgPSBuKCkgOiBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiBkZWZpbmUgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShuKSA6IGUuU2Vjb25kTGV2ZWxEb21haW5zID0gbihlKTtcbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKGUpIHtcbiAgdmFyIG4gPSBlICYmIGUuU2Vjb25kTGV2ZWxEb21haW5zLFxuICAgICAgZyA9IHsgbGlzdDogeyBhYzogXCIgY29tIGdvdiBtaWwgbmV0IG9yZyBcIiwgYWU6IFwiIGFjIGNvIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHBybyBzY2ggXCIsIGFmOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBhbDogXCIgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgXCIsIGFvOiBcIiBjbyBlZCBndiBpdCBvZyBwYiBcIiwgYXI6IFwiIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHVyIFwiLCBhdDogXCIgYWMgY28gZ3Ygb3IgXCIsIGF1OiBcIiBhc24gY29tIGNzaXJvIGVkdSBnb3YgaWQgbmV0IG9yZyBcIiwgYmE6IFwiIGNvIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIHJzIHVuYmkgdW5tbyB1bnNhIHVudHogdW56ZSBcIiwgYmI6IFwiIGJpeiBjbyBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgc3RvcmUgdHYgXCIsXG4gICAgICBiaDogXCIgYml6IGNjIGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyBcIiwgYm46IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIGJvOiBcIiBjb20gZWR1IGdvYiBnb3YgaW50IG1pbCBuZXQgb3JnIHR2IFwiLCBicjogXCIgYWRtIGFkdiBhZ3IgYW0gYXJxIGFydCBhdG8gYiBiaW8gYmxvZyBibWQgY2ltIGNuZyBjbnQgY29tIGNvb3AgZWNuIGVkdSBlbmcgZXNwIGV0YyBldGkgZmFyIGZsb2cgZm0gZm5kIGZvdCBmc3QgZzEyIGdnZiBnb3YgaW1iIGluZCBpbmYgam9yIGp1cyBsZWwgbWF0IG1lZCBtaWwgbXVzIG5ldCBub20gbm90IG50ciBvZG8gb3JnIHBwZyBwcm8gcHNjIHBzaSBxc2wgcmVjIHNsZyBzcnYgdG1wIHRyZCB0dXIgdHYgdmV0IHZsb2cgd2lraSB6bGcgXCIsIGJzOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBiejogXCIgZHUgZXQgb20gb3YgcmcgXCIsIGNhOiBcIiBhYiBiYyBtYiBuYiBuZiBubCBucyBudCBudSBvbiBwZSBxYyBzayB5ayBcIiwgY2s6IFwiIGJpeiBjbyBlZHUgZ2VuIGdvdiBpbmZvIG5ldCBvcmcgXCIsXG4gICAgICBjbjogXCIgYWMgYWggYmogY29tIGNxIGVkdSBmaiBnZCBnb3YgZ3MgZ3ggZ3ogaGEgaGIgaGUgaGkgaGwgaG4gamwganMganggbG4gbWlsIG5ldCBubSBueCBvcmcgcWggc2Mgc2Qgc2ggc24gc3ggdGogdHcgeGogeHogeW4gemogXCIsIGNvOiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG5vbSBvcmcgXCIsIGNyOiBcIiBhYyBjIGNvIGVkIGZpIGdvIG9yIHNhIFwiLCBjeTogXCIgYWMgYml6IGNvbSBla2xvZ2VzIGdvdiBsdGQgbmFtZSBuZXQgb3JnIHBhcmxpYW1lbnQgcHJlc3MgcHJvIHRtIFwiLCBcImRvXCI6IFwiIGFydCBjb20gZWR1IGdvYiBnb3YgbWlsIG5ldCBvcmcgc2xkIHdlYiBcIiwgZHo6IFwiIGFydCBhc3NvIGNvbSBlZHUgZ292IG5ldCBvcmcgcG9sIFwiLCBlYzogXCIgY29tIGVkdSBmaW4gZ292IGluZm8gbWVkIG1pbCBuZXQgb3JnIHBybyBcIiwgZWc6IFwiIGNvbSBlZHUgZXVuIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaSBcIiwgZXI6IFwiIGNvbSBlZHUgZ292IGluZCBtaWwgbmV0IG9yZyByb2NoZXN0IHcgXCIsIGVzOiBcIiBjb20gZWR1IGdvYiBub20gb3JnIFwiLFxuICAgICAgZXQ6IFwiIGJpeiBjb20gZWR1IGdvdiBpbmZvIG5hbWUgbmV0IG9yZyBcIiwgZmo6IFwiIGFjIGJpeiBjb20gaW5mbyBtaWwgbmFtZSBuZXQgb3JnIHBybyBcIiwgZms6IFwiIGFjIGNvIGdvdiBuZXQgbm9tIG9yZyBcIiwgZnI6IFwiIGFzc28gY29tIGYgZ291diBub20gcHJkIHByZXNzZSB0bSBcIiwgZ2c6IFwiIGNvIG5ldCBvcmcgXCIsIGdoOiBcIiBjb20gZWR1IGdvdiBtaWwgb3JnIFwiLCBnbjogXCIgYWMgY29tIGdvdiBuZXQgb3JnIFwiLCBncjogXCIgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgXCIsIGd0OiBcIiBjb20gZWR1IGdvYiBpbmQgbWlsIG5ldCBvcmcgXCIsIGd1OiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBoazogXCIgY29tIGVkdSBnb3YgaWR2IG5ldCBvcmcgXCIsIGh1OiBcIiAyMDAwIGFncmFyIGJvbHQgY2FzaW5vIGNpdHkgY28gZXJvdGljYSBlcm90aWthIGZpbG0gZm9ydW0gZ2FtZXMgaG90ZWwgaW5mbyBpbmdhdGxhbiBqb2dhc3oga29ueXZlbG8gbGFrYXMgbWVkaWEgbmV3cyBvcmcgcHJpdiByZWtsYW0gc2V4IHNob3Agc3BvcnQgc3VsaSBzemV4IHRtIHRvenNkZSB1dGF6YXMgdmlkZW8gXCIsXG4gICAgICBpZDogXCIgYWMgY28gZ28gbWlsIG5ldCBvciBzY2ggd2ViIFwiLCBpbDogXCIgYWMgY28gZ292IGlkZiBrMTIgbXVuaSBuZXQgb3JnIFwiLCBcImluXCI6IFwiIGFjIGNvIGVkdSBlcm5ldCBmaXJtIGdlbiBnb3YgaSBpbmQgbWlsIG5ldCBuaWMgb3JnIHJlcyBcIiwgaXE6IFwiIGNvbSBlZHUgZ292IGkgbWlsIG5ldCBvcmcgXCIsIGlyOiBcIiBhYyBjbyBkbnNzZWMgZ292IGkgaWQgbmV0IG9yZyBzY2ggXCIsIGl0OiBcIiBlZHUgZ292IFwiLCBqZTogXCIgY28gbmV0IG9yZyBcIiwgam86IFwiIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoIFwiLCBqcDogXCIgYWMgYWQgY28gZWQgZ28gZ3IgbGcgbmUgb3IgXCIsIGtlOiBcIiBhYyBjbyBnbyBpbmZvIG1lIG1vYmkgbmUgb3Igc2MgXCIsIGtoOiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBwZXIgXCIsIGtpOiBcIiBiaXogY29tIGRlIGVkdSBnb3YgaW5mbyBtb2IgbmV0IG9yZyB0ZWwgXCIsIGttOiBcIiBhc3NvIGNvbSBjb29wIGVkdSBnb3V2IGsgbWVkZWNpbiBtaWwgbm9tIG5vdGFpcmVzIHBoYXJtYWNpZW5zIHByZXNzZSB0bSB2ZXRlcmluYWlyZSBcIixcbiAgICAgIGtuOiBcIiBlZHUgZ292IG5ldCBvcmcgXCIsIGtyOiBcIiBhYyBidXNhbiBjaHVuZ2J1ayBjaHVuZ25hbSBjbyBkYWVndSBkYWVqZW9uIGVzIGdhbmd3b24gZ28gZ3dhbmdqdSBneWVvbmdidWsgZ3llb25nZ2kgZ3llb25nbmFtIGhzIGluY2hlb24gamVqdSBqZW9uYnVrIGplb25uYW0gayBrZyBtaWwgbXMgbmUgb3IgcGUgcmUgc2Mgc2VvdWwgdWxzYW4gXCIsIGt3OiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBreTogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwga3o6IFwiIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIFwiLCBsYjogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwgbGs6IFwiIGFzc24gY29tIGVkdSBnb3YgZ3JwIGhvdGVsIGludCBsdGQgbmV0IG5nbyBvcmcgc2NoIHNvYyB3ZWIgXCIsIGxyOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBsdjogXCIgYXNuIGNvbSBjb25mIGVkdSBnb3YgaWQgbWlsIG5ldCBvcmcgXCIsIGx5OiBcIiBjb20gZWR1IGdvdiBpZCBtZWQgbmV0IG9yZyBwbGMgc2NoIFwiLCBtYTogXCIgYWMgY28gZ292IG0gbmV0IG9yZyBwcmVzcyBcIixcbiAgICAgIG1jOiBcIiBhc3NvIHRtIFwiLCBtZTogXCIgYWMgY28gZWR1IGdvdiBpdHMgbmV0IG9yZyBwcml2IFwiLCBtZzogXCIgY29tIGVkdSBnb3YgbWlsIG5vbSBvcmcgcHJkIHRtIFwiLCBtazogXCIgY29tIGVkdSBnb3YgaW5mIG5hbWUgbmV0IG9yZyBwcm8gXCIsIG1sOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIHByZXNzZSBcIiwgbW46IFwiIGVkdSBnb3Ygb3JnIFwiLCBtbzogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwgbXQ6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIG12OiBcIiBhZXJvIGJpeiBjb20gY29vcCBlZHUgZ292IGluZm8gaW50IG1pbCBtdXNldW0gbmFtZSBuZXQgb3JnIHBybyBcIiwgbXc6IFwiIGFjIGNvIGNvbSBjb29wIGVkdSBnb3YgaW50IG11c2V1bSBuZXQgb3JnIFwiLCBteDogXCIgY29tIGVkdSBnb2IgbmV0IG9yZyBcIiwgbXk6IFwiIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoIFwiLCBuZjogXCIgYXJ0cyBjb20gZmlybSBpbmZvIG5ldCBvdGhlciBwZXIgcmVjIHN0b3JlIHdlYiBcIiwgbmc6IFwiIGJpeiBjb20gZWR1IGdvdiBtaWwgbW9iaSBuYW1lIG5ldCBvcmcgc2NoIFwiLFxuICAgICAgbmk6IFwiIGFjIGNvIGNvbSBlZHUgZ29iIG1pbCBuZXQgbm9tIG9yZyBcIiwgbnA6IFwiIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIFwiLCBucjogXCIgYml6IGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyBcIiwgb206IFwiIGFjIGJpeiBjbyBjb20gZWR1IGdvdiBtZWQgbWlsIG11c2V1bSBuZXQgb3JnIHBybyBzY2ggXCIsIHBlOiBcIiBjb20gZWR1IGdvYiBtaWwgbmV0IG5vbSBvcmcgc2xkIFwiLCBwaDogXCIgY29tIGVkdSBnb3YgaSBtaWwgbmV0IG5nbyBvcmcgXCIsIHBrOiBcIiBiaXogY29tIGVkdSBmYW0gZ29iIGdvayBnb24gZ29wIGdvcyBnb3YgbmV0IG9yZyB3ZWIgXCIsIHBsOiBcIiBhcnQgYmlhbHlzdG9rIGJpeiBjb20gZWR1IGdkYSBnZGFuc2sgZ29yem93IGdvdiBpbmZvIGthdG93aWNlIGtyYWtvdyBsb2R6IGx1YmxpbiBtaWwgbmV0IG5nbyBvbHN6dHluIG9yZyBwb3puYW4gcHdyIHJhZG9tIHNsdXBzayBzemN6ZWNpbiB0b3J1biB3YXJzemF3YSB3YXcgd3JvYyB3cm9jbGF3IHpnb3JhIFwiLCBwcjogXCIgYWMgYml6IGNvbSBlZHUgZXN0IGdvdiBpbmZvIGlzbGEgbmFtZSBuZXQgb3JnIHBybyBwcm9mIFwiLFxuICAgICAgcHM6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgcGxvIHNlYyBcIiwgcHc6IFwiIGJlbGF1IGNvIGVkIGdvIG5lIG9yIFwiLCBybzogXCIgYXJ0cyBjb20gZmlybSBpbmZvIG5vbSBudCBvcmcgcmVjIHN0b3JlIHRtIHd3dyBcIiwgcnM6IFwiIGFjIGNvIGVkdSBnb3YgaW4gb3JnIFwiLCBzYjogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwgc2M6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIHNoOiBcIiBjbyBjb20gZWR1IGdvdiBuZXQgbm9tIG9yZyBcIiwgc2w6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIHN0OiBcIiBjbyBjb20gY29uc3VsYWRvIGVkdSBlbWJhaXhhZGEgZ292IG1pbCBuZXQgb3JnIHByaW5jaXBlIHNhb3RvbWUgc3RvcmUgXCIsIHN2OiBcIiBjb20gZWR1IGdvYiBvcmcgcmVkIFwiLCBzejogXCIgYWMgY28gb3JnIFwiLCB0cjogXCIgYXYgYmJzIGJlbCBiaXogY29tIGRyIGVkdSBnZW4gZ292IGluZm8gazEyIG5hbWUgbmV0IG9yZyBwb2wgdGVsIHRzayB0diB3ZWIgXCIsIHR0OiBcIiBhZXJvIGJpeiBjYXQgY28gY29tIGNvb3AgZWR1IGdvdiBpbmZvIGludCBqb2JzIG1pbCBtb2JpIG11c2V1bSBuYW1lIG5ldCBvcmcgcHJvIHRlbCB0cmF2ZWwgXCIsXG4gICAgICB0dzogXCIgY2x1YiBjb20gZWJpeiBlZHUgZ2FtZSBnb3YgaWR2IG1pbCBuZXQgb3JnIFwiLCBtdTogXCIgYWMgY28gY29tIGdvdiBuZXQgb3Igb3JnIFwiLCBtejogXCIgYWMgY28gZWR1IGdvdiBvcmcgXCIsIG5hOiBcIiBjbyBjb20gXCIsIG56OiBcIiBhYyBjbyBjcmkgZ2VlayBnZW4gZ292dCBoZWFsdGggaXdpIG1hb3JpIG1pbCBuZXQgb3JnIHBhcmxpYW1lbnQgc2Nob29sIFwiLCBwYTogXCIgYWJvIGFjIGNvbSBlZHUgZ29iIGluZyBtZWQgbmV0IG5vbSBvcmcgc2xkIFwiLCBwdDogXCIgY29tIGVkdSBnb3YgaW50IG5ldCBub21lIG9yZyBwdWJsIFwiLCBweTogXCIgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgXCIsIHFhOiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBcIiwgcmU6IFwiIGFzc28gY29tIG5vbSBcIiwgcnU6IFwiIGFjIGFkeWdleWEgYWx0YWkgYW11ciBhcmtoYW5nZWxzayBhc3RyYWtoYW4gYmFzaGtpcmlhIGJlbGdvcm9kIGJpciBicnlhbnNrIGJ1cnlhdGlhIGNiZyBjaGVsIGNoZWx5YWJpbnNrIGNoaXRhIGNodWtvdGthIGNodXZhc2hpYSBjb20gZGFnZXN0YW4gZS1idXJnIGVkdSBnb3YgZ3Jvem55IGludCBpcmt1dHNrIGl2YW5vdm8gaXpoZXZzayBqYXIgam9zaGthci1vbGEga2FsbXlraWEga2FsdWdhIGthbWNoYXRrYSBrYXJlbGlhIGthemFuIGtjaHIga2VtZXJvdm8ga2hhYmFyb3ZzayBraGFrYXNzaWEga2h2IGtpcm92IGtvZW5pZyBrb21pIGtvc3Ryb21hIGtyYW5veWFyc2sga3ViYW4ga3VyZ2FuIGt1cnNrIGxpcGV0c2sgbWFnYWRhbiBtYXJpIG1hcmktZWwgbWFyaW5lIG1pbCBtb3Jkb3ZpYSBtb3NyZWcgbXNrIG11cm1hbnNrIG5hbGNoaWsgbmV0IG5ub3Ygbm92IG5vdm9zaWJpcnNrIG5zayBvbXNrIG9yZW5idXJnIG9yZyBvcnlvbCBwZW56YSBwZXJtIHBwIHBza292IHB0eiBybmQgcnlhemFuIHNha2hhbGluIHNhbWFyYSBzYXJhdG92IHNpbWJpcnNrIHNtb2xlbnNrIHNwYiBzdGF2cm9wb2wgc3R2IHN1cmd1dCB0YW1ib3YgdGF0YXJzdGFuIHRvbSB0b21zayB0c2FyaXRzeW4gdHNrIHR1bGEgdHV2YSB0dmVyIHR5dW1lbiB1ZG0gdWRtdXJ0aWEgdWxhbi11ZGUgdmxhZGlrYXZrYXogdmxhZGltaXIgdmxhZGl2b3N0b2sgdm9sZ29ncmFkIHZvbG9nZGEgdm9yb25lemggdnJuIHZ5YXRrYSB5YWt1dGlhIHlhbWFsIHlla2F0ZXJpbmJ1cmcgeXV6aG5vLXNha2hhbGluc2sgXCIsXG4gICAgICBydzogXCIgYWMgY28gY29tIGVkdSBnb3V2IGdvdiBpbnQgbWlsIG5ldCBcIiwgc2E6IFwiIGNvbSBlZHUgZ292IG1lZCBuZXQgb3JnIHB1YiBzY2ggXCIsIHNkOiBcIiBjb20gZWR1IGdvdiBpbmZvIG1lZCBuZXQgb3JnIHR2IFwiLCBzZTogXCIgYSBhYyBiIGJkIGMgZCBlIGYgZyBoIGkgayBsIG0gbiBvIG9yZyBwIHBhcnRpIHBwIHByZXNzIHIgcyB0IHRtIHUgdyB4IHkgeiBcIiwgc2c6IFwiIGNvbSBlZHUgZ292IGlkbiBuZXQgb3JnIHBlciBcIiwgc246IFwiIGFydCBjb20gZWR1IGdvdXYgb3JnIHBlcnNvIHVuaXYgXCIsIHN5OiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG5ld3Mgb3JnIFwiLCB0aDogXCIgYWMgY28gZ28gaW4gbWkgbmV0IG9yIFwiLCB0ajogXCIgYWMgYml6IGNvIGNvbSBlZHUgZ28gZ292IGluZm8gaW50IG1pbCBuYW1lIG5ldCBuaWMgb3JnIHRlc3Qgd2ViIFwiLCB0bjogXCIgYWdyaW5ldCBjb20gZGVmZW5zZSBlZHVuZXQgZW5zIGZpbiBnb3YgaW5kIGluZm8gaW50bCBtaW5jb20gbmF0IG5ldCBvcmcgcGVyc28gcm5ydCBybnMgcm51IHRvdXJpc20gXCIsXG4gICAgICB0ejogXCIgYWMgY28gZ28gbmUgb3IgXCIsIHVhOiBcIiBiaXogY2hlcmthc3N5IGNoZXJuaWdvdiBjaGVybm92dHN5IGNrIGNuIGNvIGNvbSBjcmltZWEgY3YgZG4gZG5lcHJvcGV0cm92c2sgZG9uZXRzayBkcCBlZHUgZ292IGlmIGluIGl2YW5vLWZyYW5raXZzayBraCBraGFya292IGtoZXJzb24ga2htZWxuaXRza2l5IGtpZXYga2lyb3ZvZ3JhZCBrbSBrciBrcyBrdiBsZyBsdWdhbnNrIGx1dHNrIGx2aXYgbWUgbWsgbmV0IG5pa29sYWV2IG9kIG9kZXNzYSBvcmcgcGwgcG9sdGF2YSBwcCByb3ZubyBydiBzZWJhc3RvcG9sIHN1bXkgdGUgdGVybm9waWwgdXpoZ29yb2QgdmlubmljYSB2biB6YXBvcml6aHpoZSB6aGl0b21pciB6cCB6dCBcIiwgdWc6IFwiIGFjIGNvIGdvIG5lIG9yIG9yZyBzYyBcIiwgdWs6IFwiIGFjIGJsIGJyaXRpc2gtbGlicmFyeSBjbyBjeW0gZ292IGdvdnQgaWNuZXQgamV0IGxlYSBsdGQgbWUgbWlsIG1vZCBuYXRpb25hbC1saWJyYXJ5LXNjb3RsYW5kIG5lbCBuZXQgbmhzIG5pYyBubHMgb3JnIG9yZ24gcGFybGlhbWVudCBwbGMgcG9saWNlIHNjaCBzY290IHNvYyBcIixcbiAgICAgIHVzOiBcIiBkbmkgZmVkIGlzYSBraWRzIG5zbiBcIiwgdXk6IFwiIGNvbSBlZHUgZ3ViIG1pbCBuZXQgb3JnIFwiLCB2ZTogXCIgY28gY29tIGVkdSBnb2IgaW5mbyBtaWwgbmV0IG9yZyB3ZWIgXCIsIHZpOiBcIiBjbyBjb20gazEyIG5ldCBvcmcgXCIsIHZuOiBcIiBhYyBiaXogY29tIGVkdSBnb3YgaGVhbHRoIGluZm8gaW50IG5hbWUgbmV0IG9yZyBwcm8gXCIsIHllOiBcIiBjbyBjb20gZ292IGx0ZCBtZSBuZXQgb3JnIHBsYyBcIiwgeXU6IFwiIGFjIGNvIGVkdSBnb3Ygb3JnIFwiLCB6YTogXCIgYWMgYWdyaWMgYWx0IGJvdXJzZSBjaXR5IGNvIGN5YmVybmV0IGRiIGVkdSBnb3YgZ3JvbmRhciBpYWNjZXNzIGltdCBpbmNhIGxhbmRlc2lnbiBsYXcgbWlsIG5ldCBuZ28gbmlzIG5vbSBvbGl2ZXR0aSBvcmcgcGl4IHNjaG9vbCB0bSB3ZWIgXCIsIHptOiBcIiBhYyBjbyBjb20gZWR1IGdvdiBuZXQgb3JnIHNjaCBcIiB9LCBoYXM6IGZ1bmN0aW9uIGhhcyhlKSB7XG4gICAgICB2YXIgYiA9IGUubGFzdEluZGV4T2YoXCIuXCIpO2lmICgwID49IGIgfHwgYiA+PSBlLmxlbmd0aCAtIDEpIHJldHVybiAhMTtcbiAgICAgIHZhciBoID0gZS5sYXN0SW5kZXhPZihcIi5cIiwgYiAtIDEpO2lmICgwID49IGggfHwgaCA+PSBiIC0gMSkgcmV0dXJuICExO3ZhciBuID0gZy5saXN0W2Uuc2xpY2UoYiArIDEpXTtyZXR1cm4gbiA/IDAgPD0gbi5pbmRleE9mKFwiIFwiICsgZS5zbGljZShoICsgMSwgYikgKyBcIiBcIikgOiAhMTtcbiAgICB9LCBpczogZnVuY3Rpb24gaXMoZSkge1xuICAgICAgdmFyIGIgPSBlLmxhc3RJbmRleE9mKFwiLlwiKTtpZiAoMCA+PSBiIHx8IGIgPj0gZS5sZW5ndGggLSAxIHx8IDAgPD0gZS5sYXN0SW5kZXhPZihcIi5cIiwgYiAtIDEpKSByZXR1cm4gITE7dmFyIGggPSBnLmxpc3RbZS5zbGljZShiICsgMSldO3JldHVybiBoID8gMCA8PSBoLmluZGV4T2YoXCIgXCIgKyBlLnNsaWNlKDAsIGIpICsgXCIgXCIpIDogITE7XG4gICAgfSwgZ2V0OiBmdW5jdGlvbiBnZXQoZSkge1xuICAgICAgdmFyIGIgPSBlLmxhc3RJbmRleE9mKFwiLlwiKTtpZiAoMCA+PSBiIHx8IGIgPj0gZS5sZW5ndGggLSAxKSByZXR1cm4gbnVsbDt2YXIgaCA9IGUubGFzdEluZGV4T2YoXCIuXCIsIGIgLSAxKTtpZiAoMCA+PSBoIHx8IGggPj0gYiAtIDEpIHJldHVybiBudWxsO3ZhciBuID0gZy5saXN0W2Uuc2xpY2UoYiArIDEpXTtyZXR1cm4gIW4gfHwgMCA+IG4uaW5kZXhPZihcIiBcIiArIGUuc2xpY2UoaCArIDEsIGIpICsgXCIgXCIpID8gbnVsbCA6IGUuc2xpY2UoaCArIDEpO1xuICAgIH0sIG5vQ29uZmxpY3Q6IGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgICBlLlNlY29uZExldmVsRG9tYWlucyA9PT0gdGhpcyAmJiAoZS5TZWNvbmRMZXZlbERvbWFpbnMgPSBuKTtyZXR1cm4gdGhpcztcbiAgICB9IH07cmV0dXJuIGc7XG59KTtcbihmdW5jdGlvbiAoZSwgbikge1xuICBcIm9iamVjdFwiID09PSB0eXBlb2YgZXhwb3J0cyA/IG1vZHVsZS5leHBvcnRzID0gbihyZXF1aXJlKFwiLi9wdW55Y29kZVwiKSwgcmVxdWlyZShcIi4vSVB2NlwiKSwgcmVxdWlyZShcIi4vU2Vjb25kTGV2ZWxEb21haW5zXCIpKSA6IFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFtcIi4vcHVueWNvZGVcIiwgXCIuL0lQdjZcIiwgXCIuL1NlY29uZExldmVsRG9tYWluc1wiXSwgbikgOiBlLlVSSSA9IG4oZS5wdW55Y29kZSwgZS5JUHY2LCBlLlNlY29uZExldmVsRG9tYWlucywgZSk7XG59KSh1bmRlZmluZWQsIGZ1bmN0aW9uIChlLCBuLCBnLCBsKSB7XG4gIGZ1bmN0aW9uIGIoYSwgYykge1xuICAgIHZhciBkID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICBtID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoO2lmICghKHRoaXMgaW5zdGFuY2VvZiBiKSkgcmV0dXJuIGQgPyBtID8gbmV3IGIoYSwgYykgOiBuZXcgYihhKSA6IG5ldyBiKCk7aWYgKHZvaWQgMCA9PT0gYSkge1xuICAgICAgaWYgKGQpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ1bmRlZmluZWQgaXMgbm90IGEgdmFsaWQgYXJndW1lbnQgZm9yIFVSSVwiKTtcbiAgICAgIGEgPSBcInVuZGVmaW5lZFwiICE9PSB0eXBlb2YgbG9jYXRpb24gPyBsb2NhdGlvbi5ocmVmICsgXCJcIiA6IFwiXCI7XG4gICAgfXRoaXMuaHJlZihhKTtyZXR1cm4gdm9pZCAwICE9PSBjID8gdGhpcy5hYnNvbHV0ZVRvKGMpIDogdGhpcztcbiAgfWZ1bmN0aW9uIGgoYSkge1xuICAgIHJldHVybiBhLnJlcGxhY2UoLyhbLiorP149IToke30oKXxbXFxdXFwvXFxcXF0pL2csIFwiXFxcXCQxXCIpO1xuICB9ZnVuY3Rpb24gQShhKSB7XG4gICAgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiVW5kZWZpbmVkXCIgOiBTdHJpbmcoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpKS5zbGljZSg4LCAtMSk7XG4gIH1mdW5jdGlvbiB3KGEpIHtcbiAgICByZXR1cm4gXCJBcnJheVwiID09PSBBKGEpO1xuICB9ZnVuY3Rpb24gayhhLCBjKSB7XG4gICAgdmFyIGQgPSB7fSxcbiAgICAgICAgYixcbiAgICAgICAgZjtpZiAoXCJSZWdFeHBcIiA9PT0gQShjKSkgZCA9IG51bGw7ZWxzZSBpZiAodyhjKSkgZm9yIChiID0gMCwgZiA9IGMubGVuZ3RoOyBiIDwgZjsgYisrKSBkW2NbYl1dID0gITA7ZWxzZSBkW2NdID0gITA7YiA9IDA7Zm9yIChmID0gYS5sZW5ndGg7IGIgPCBmOyBiKyspIGlmIChkICYmIHZvaWQgMCAhPT0gZFthW2JdXSB8fCAhZCAmJiBjLnRlc3QoYVtiXSkpIGEuc3BsaWNlKGIsIDEpLCBmLS0sIGItLTtyZXR1cm4gYTtcbiAgfWZ1bmN0aW9uIHUoYSwgYykge1xuICAgIHZhciBkLCBiO2lmICh3KGMpKSB7XG4gICAgICBkID0gMDtmb3IgKGIgPSBjLmxlbmd0aDsgZCA8IGI7IGQrKykgaWYgKCF1KGEsIGNbZF0pKSByZXR1cm4gITE7cmV0dXJuICEwO1xuICAgIH12YXIgZiA9IEEoYyk7ZCA9IDA7Zm9yIChiID0gYS5sZW5ndGg7IGQgPCBiOyBkKyspIGlmIChcIlJlZ0V4cFwiID09PSBmKSB7XG4gICAgICBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGFbZF0gJiYgYVtkXS5tYXRjaChjKSkgcmV0dXJuICEwO1xuICAgIH0gZWxzZSBpZiAoYVtkXSA9PT0gYykgcmV0dXJuICEwO3JldHVybiAhMTtcbiAgfWZ1bmN0aW9uIEQoYSwgYykge1xuICAgIGlmICghdyhhKSB8fCAhdyhjKSB8fCBhLmxlbmd0aCAhPT0gYy5sZW5ndGgpIHJldHVybiAhMTthLnNvcnQoKTtjLnNvcnQoKTtmb3IgKHZhciBkID0gMCwgYiA9IGEubGVuZ3RoOyBkIDwgYjsgZCsrKSBpZiAoYVtkXSAhPT0gY1tkXSkgcmV0dXJuICExO3JldHVybiAhMDtcbiAgfWZ1bmN0aW9uIEUoYSkge1xuICAgIHJldHVybiBlc2NhcGUoYSk7XG4gIH1mdW5jdGlvbiBCKGEpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGEpLnJlcGxhY2UoL1shJygpKl0vZywgRSkucmVwbGFjZSgvXFwqL2csIFwiJTJBXCIpO1xuICB9ZnVuY3Rpb24gdChhKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChjLCBkKSB7XG4gICAgICBpZiAodm9pZCAwID09PSBjKSByZXR1cm4gdGhpcy5fcGFydHNbYV0gfHwgXCJcIjt0aGlzLl9wYXJ0c1thXSA9IGMgfHwgbnVsbDt0aGlzLmJ1aWxkKCFkKTtyZXR1cm4gdGhpcztcbiAgICB9O1xuICB9ZnVuY3Rpb24gcihhLCBjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICBpZiAodm9pZCAwID09PSBkKSByZXR1cm4gdGhpcy5fcGFydHNbYV0gfHwgXCJcIjtudWxsICE9PSBkICYmIChkICs9IFwiXCIsIGQuY2hhckF0KDApID09PSBjICYmIChkID0gZC5zdWJzdHJpbmcoMSkpKTt0aGlzLl9wYXJ0c1thXSA9IGQ7dGhpcy5idWlsZCghYik7cmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfXZhciBwID0gbCAmJiBsLlVSSTtiLnZlcnNpb24gPSBcIjEuMTUuMlwiO3ZhciBmID0gYi5wcm90b3R5cGUsXG4gICAgICB2ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtiLl9wYXJ0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geyBwcm90b2NvbDogbnVsbCwgdXNlcm5hbWU6IG51bGwsIHBhc3N3b3JkOiBudWxsLCBob3N0bmFtZTogbnVsbCwgdXJuOiBudWxsLCBwb3J0OiBudWxsLCBwYXRoOiBudWxsLFxuICAgICAgcXVlcnk6IG51bGwsIGZyYWdtZW50OiBudWxsLCBkdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnM6IGIuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCBlc2NhcGVRdWVyeVNwYWNlOiBiLmVzY2FwZVF1ZXJ5U3BhY2UgfTtcbiAgfTtiLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyA9ICExO2IuZXNjYXBlUXVlcnlTcGFjZSA9ICEwO2IucHJvdG9jb2xfZXhwcmVzc2lvbiA9IC9eW2Etel1bYS16MC05ListXSokL2k7Yi5pZG5fZXhwcmVzc2lvbiA9IC9bXmEtejAtOVxcLi1dL2k7Yi5wdW55Y29kZV9leHByZXNzaW9uID0gLyh4bi0tKS9pO2IuaXA0X2V4cHJlc3Npb24gPSAvXlxcZHsxLDN9XFwuXFxkezEsM31cXC5cXGR7MSwzfVxcLlxcZHsxLDN9JC87Yi5pcDZfZXhwcmVzc2lvbiA9IC9eXFxzKigoKFswLTlBLUZhLWZdezEsNH06KXs3fShbMC05QS1GYS1mXXsxLDR9fDopKXwoKFswLTlBLUZhLWZdezEsNH06KXs2fSg6WzAtOUEtRmEtZl17MSw0fXwoKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezV9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsMn0pfDooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezR9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsM30pfCgoOlswLTlBLUZhLWZdezEsNH0pPzooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXszfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDR9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDJ9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezJ9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNX0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsM306KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7MX0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw2fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCw0fTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoOigoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDd9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDV9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpKSglLispP1xccyokLztcbiAgYi5maW5kX3VyaV9leHByZXNzaW9uID0gL1xcYigoPzpbYS16XVtcXHctXSs6KD86XFwvezEsM318W2EtejAtOSVdKXx3d3dcXGR7MCwzfVsuXXxbYS16MC05LlxcLV0rWy5dW2Etel17Miw0fVxcLykoPzpbXlxccygpPD5dK3xcXCgoW15cXHMoKTw+XSt8KFxcKFteXFxzKCk8Pl0rXFwpKSkqXFwpKSsoPzpcXCgoW15cXHMoKTw+XSt8KFxcKFteXFxzKCk8Pl0rXFwpKSkqXFwpfFteXFxzYCEoKVxcW1xcXXt9OzonXCIuLDw+P1xcdTAwYWJcXHUwMGJiXFx1MjAxY1xcdTIwMWRcXHUyMDE4XFx1MjAxOV0pKS9pZztiLmZpbmRVcmkgPSB7IHN0YXJ0OiAvXFxiKD86KFthLXpdW2EtejAtOS4rLV0qOlxcL1xcLyl8d3d3XFwuKS9naSwgZW5kOiAvW1xcc1xcclxcbl18JC8sIHRyaW06IC9bYCEoKVxcW1xcXXt9OzonXCIuLDw+P1xcdTAwYWJcXHUwMGJiXFx1MjAxY1xcdTIwMWRcXHUyMDFlXFx1MjAxOFxcdTIwMTldKyQvIH07Yi5kZWZhdWx0UG9ydHMgPSB7IGh0dHA6IFwiODBcIiwgaHR0cHM6IFwiNDQzXCIsIGZ0cDogXCIyMVwiLCBnb3BoZXI6IFwiNzBcIiwgd3M6IFwiODBcIiwgd3NzOiBcIjQ0M1wiIH07Yi5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMgPSAvW15hLXpBLVowLTlcXC4tXS87Yi5kb21BdHRyaWJ1dGVzID0geyBhOiBcImhyZWZcIiwgYmxvY2txdW90ZTogXCJjaXRlXCIsIGxpbms6IFwiaHJlZlwiLCBiYXNlOiBcImhyZWZcIiwgc2NyaXB0OiBcInNyY1wiLCBmb3JtOiBcImFjdGlvblwiLCBpbWc6IFwic3JjXCIsIGFyZWE6IFwiaHJlZlwiLCBpZnJhbWU6IFwic3JjXCIsIGVtYmVkOiBcInNyY1wiLCBzb3VyY2U6IFwic3JjXCIsIHRyYWNrOiBcInNyY1wiLCBpbnB1dDogXCJzcmNcIiwgYXVkaW86IFwic3JjXCIsIHZpZGVvOiBcInNyY1wiIH07Yi5nZXREb21BdHRyaWJ1dGUgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmIChhICYmIGEubm9kZU5hbWUpIHtcbiAgICAgIHZhciBjID0gYS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO3JldHVybiBcImlucHV0XCIgPT09IGMgJiYgXCJpbWFnZVwiICE9PSBhLnR5cGUgPyB2b2lkIDAgOiBiLmRvbUF0dHJpYnV0ZXNbY107XG4gICAgfVxuICB9O2IuZW5jb2RlID0gQjtiLmRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtiLmlzbzg4NTkgPSBmdW5jdGlvbiAoKSB7XG4gICAgYi5lbmNvZGUgPSBlc2NhcGU7Yi5kZWNvZGUgPSB1bmVzY2FwZTtcbiAgfTtiLnVuaWNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgYi5lbmNvZGUgPSBCO2IuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuICB9O2IuY2hhcmFjdGVycyA9IHsgcGF0aG5hbWU6IHsgZW5jb2RlOiB7IGV4cHJlc3Npb246IC8lKDI0fDI2fDJCfDJDfDNCfDNEfDNBfDQwKS9pZywgbWFwOiB7IFwiJTI0XCI6IFwiJFwiLCBcIiUyNlwiOiBcIiZcIiwgXCIlMkJcIjogXCIrXCIsIFwiJTJDXCI6IFwiLFwiLCBcIiUzQlwiOiBcIjtcIiwgXCIlM0RcIjogXCI9XCIsIFwiJTNBXCI6IFwiOlwiLCBcIiU0MFwiOiBcIkBcIiB9IH0sIGRlY29kZTogeyBleHByZXNzaW9uOiAvW1xcL1xcPyNdL2csIG1hcDogeyBcIi9cIjogXCIlMkZcIiwgXCI/XCI6IFwiJTNGXCIsIFwiI1wiOiBcIiUyM1wiIH0gfSB9LCByZXNlcnZlZDogeyBlbmNvZGU6IHsgZXhwcmVzc2lvbjogLyUoMjF8MjN8MjR8MjZ8Mjd8Mjh8Mjl8MkF8MkJ8MkN8MkZ8M0F8M0J8M0R8M0Z8NDB8NUJ8NUQpL2lnLCBtYXA6IHsgXCIlM0FcIjogXCI6XCIsIFwiJTJGXCI6IFwiL1wiLCBcIiUzRlwiOiBcIj9cIiwgXCIlMjNcIjogXCIjXCIsIFwiJTVCXCI6IFwiW1wiLCBcIiU1RFwiOiBcIl1cIiwgXCIlNDBcIjogXCJAXCIsIFwiJTIxXCI6IFwiIVwiLCBcIiUyNFwiOiBcIiRcIiwgXCIlMjZcIjogXCImXCIsIFwiJTI3XCI6IFwiJ1wiLCBcIiUyOFwiOiBcIihcIiwgXCIlMjlcIjogXCIpXCIsIFwiJTJBXCI6IFwiKlwiLCBcIiUyQlwiOiBcIitcIiwgXCIlMkNcIjogXCIsXCIsXG4gICAgICAgICAgXCIlM0JcIjogXCI7XCIsIFwiJTNEXCI6IFwiPVwiIH0gfSB9LCB1cm5wYXRoOiB7IGVuY29kZTogeyBleHByZXNzaW9uOiAvJSgyMXwyNHwyN3wyOHwyOXwyQXwyQnwyQ3wzQnwzRHw0MCkvaWcsIG1hcDogeyBcIiUyMVwiOiBcIiFcIiwgXCIlMjRcIjogXCIkXCIsIFwiJTI3XCI6IFwiJ1wiLCBcIiUyOFwiOiBcIihcIiwgXCIlMjlcIjogXCIpXCIsIFwiJTJBXCI6IFwiKlwiLCBcIiUyQlwiOiBcIitcIiwgXCIlMkNcIjogXCIsXCIsIFwiJTNCXCI6IFwiO1wiLCBcIiUzRFwiOiBcIj1cIiwgXCIlNDBcIjogXCJAXCIgfSB9LCBkZWNvZGU6IHsgZXhwcmVzc2lvbjogL1tcXC9cXD8jOl0vZywgbWFwOiB7IFwiL1wiOiBcIiUyRlwiLCBcIj9cIjogXCIlM0ZcIiwgXCIjXCI6IFwiJTIzXCIsIFwiOlwiOiBcIiUzQVwiIH0gfSB9IH07Yi5lbmNvZGVRdWVyeSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgdmFyIGQgPSBiLmVuY29kZShhICsgXCJcIik7dm9pZCAwID09PSBjICYmIChjID0gYi5lc2NhcGVRdWVyeVNwYWNlKTtyZXR1cm4gYyA/IGQucmVwbGFjZSgvJTIwL2csIFwiK1wiKSA6IGQ7XG4gIH07Yi5kZWNvZGVRdWVyeSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgYSArPSBcIlwiO3ZvaWQgMCA9PT0gYyAmJiAoYyA9IGIuZXNjYXBlUXVlcnlTcGFjZSk7dHJ5IHtcbiAgICAgIHJldHVybiBiLmRlY29kZShjID8gYS5yZXBsYWNlKC9cXCsvZywgXCIlMjBcIikgOiBhKTtcbiAgICB9IGNhdGNoIChkKSB7XG4gICAgICByZXR1cm4gYTtcbiAgICB9XG4gIH07dmFyIHEgPSB7IGVuY29kZTogXCJlbmNvZGVcIiwgZGVjb2RlOiBcImRlY29kZVwiIH0sXG4gICAgICB4LFxuICAgICAgQyA9IGZ1bmN0aW9uIEMoYSwgYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGJbY10oZCArIFwiXCIpLnJlcGxhY2UoYi5jaGFyYWN0ZXJzW2FdW2NdLmV4cHJlc3Npb24sIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgcmV0dXJuIGIuY2hhcmFjdGVyc1thXVtjXS5tYXBbZF07XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAobSkge1xuICAgICAgICByZXR1cm4gZDtcbiAgICAgIH1cbiAgICB9O1xuICB9O2ZvciAoeCBpbiBxKSBiW3ggKyBcIlBhdGhTZWdtZW50XCJdID0gQyhcInBhdGhuYW1lXCIsIHFbeF0pLCBiW3ggKyBcIlVyblBhdGhTZWdtZW50XCJdID0gQyhcInVybnBhdGhcIiwgcVt4XSk7cSA9IGZ1bmN0aW9uIChhLCBjLCBkKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtKSB7XG4gICAgICB2YXIgZjtmID0gZCA/IGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIHJldHVybiBiW2NdKGJbZF0oYSkpO1xuICAgICAgfSA6IGJbY107bSA9IChtICsgXCJcIikuc3BsaXQoYSk7Zm9yICh2YXIgZSA9IDAsIGsgPSBtLmxlbmd0aDsgZSA8IGs7IGUrKykgbVtlXSA9IGYobVtlXSk7cmV0dXJuIG0uam9pbihhKTtcbiAgICB9O1xuICB9O2IuZGVjb2RlUGF0aCA9IHEoXCIvXCIsIFwiZGVjb2RlUGF0aFNlZ21lbnRcIik7Yi5kZWNvZGVVcm5QYXRoID0gcShcIjpcIiwgXCJkZWNvZGVVcm5QYXRoU2VnbWVudFwiKTtiLnJlY29kZVBhdGggPSBxKFwiL1wiLCBcImVuY29kZVBhdGhTZWdtZW50XCIsIFwiZGVjb2RlXCIpO2IucmVjb2RlVXJuUGF0aCA9IHEoXCI6XCIsIFwiZW5jb2RlVXJuUGF0aFNlZ21lbnRcIiwgXCJkZWNvZGVcIik7Yi5lbmNvZGVSZXNlcnZlZCA9IEMoXCJyZXNlcnZlZFwiLCBcImVuY29kZVwiKTtiLnBhcnNlID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICB2YXIgZDtjIHx8IChjID0ge30pO2QgPSBhLmluZGV4T2YoXCIjXCIpOy0xIDwgZCAmJiAoYy5mcmFnbWVudCA9IGEuc3Vic3RyaW5nKGQgKyAxKSB8fCBudWxsLCBhID0gYS5zdWJzdHJpbmcoMCwgZCkpO2QgPSBhLmluZGV4T2YoXCI/XCIpOy0xIDwgZCAmJiAoYy5xdWVyeSA9IGEuc3Vic3RyaW5nKGQgKyAxKSB8fCBudWxsLCBhID0gYS5zdWJzdHJpbmcoMCwgZCkpO1wiLy9cIiA9PT0gYS5zdWJzdHJpbmcoMCwgMikgPyAoYy5wcm90b2NvbCA9IG51bGwsIGEgPSBhLnN1YnN0cmluZygyKSwgYSA9IGIucGFyc2VBdXRob3JpdHkoYSwgYykpIDogKGQgPSBhLmluZGV4T2YoXCI6XCIpLCAtMSA8IGQgJiYgKGMucHJvdG9jb2wgPSBhLnN1YnN0cmluZygwLCBkKSB8fCBudWxsLCBjLnByb3RvY29sICYmICFjLnByb3RvY29sLm1hdGNoKGIucHJvdG9jb2xfZXhwcmVzc2lvbikgPyBjLnByb3RvY29sID0gdm9pZCAwIDogXCIvL1wiID09PSBhLnN1YnN0cmluZyhkICsgMSwgZCArIDMpID8gKGEgPSBhLnN1YnN0cmluZyhkICsgMyksIGEgPSBiLnBhcnNlQXV0aG9yaXR5KGEsIGMpKSA6IChhID0gYS5zdWJzdHJpbmcoZCArIDEpLCBjLnVybiA9ICEwKSkpO2MucGF0aCA9IGE7cmV0dXJuIGM7XG4gIH07Yi5wYXJzZUhvc3QgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIHZhciBkID0gYS5pbmRleE9mKFwiL1wiKSxcbiAgICAgICAgYjstMSA9PT0gZCAmJiAoZCA9IGEubGVuZ3RoKTtpZiAoXCJbXCIgPT09IGEuY2hhckF0KDApKSBiID0gYS5pbmRleE9mKFwiXVwiKSwgYy5ob3N0bmFtZSA9IGEuc3Vic3RyaW5nKDEsIGIpIHx8IG51bGwsIGMucG9ydCA9IGEuc3Vic3RyaW5nKGIgKyAyLCBkKSB8fCBudWxsLCBcIi9cIiA9PT0gYy5wb3J0ICYmIChjLnBvcnQgPSBudWxsKTtlbHNlIHtcbiAgICAgIHZhciBmID0gYS5pbmRleE9mKFwiOlwiKTtiID0gYS5pbmRleE9mKFwiL1wiKTtmID0gYS5pbmRleE9mKFwiOlwiLCBmICsgMSk7XG4gICAgICAtMSAhPT0gZiAmJiAoLTEgPT09IGIgfHwgZiA8IGIpID8gKGMuaG9zdG5hbWUgPSBhLnN1YnN0cmluZygwLCBkKSB8fCBudWxsLCBjLnBvcnQgPSBudWxsKSA6IChiID0gYS5zdWJzdHJpbmcoMCwgZCkuc3BsaXQoXCI6XCIpLCBjLmhvc3RuYW1lID0gYlswXSB8fCBudWxsLCBjLnBvcnQgPSBiWzFdIHx8IG51bGwpO1xuICAgIH1jLmhvc3RuYW1lICYmIFwiL1wiICE9PSBhLnN1YnN0cmluZyhkKS5jaGFyQXQoMCkgJiYgKGQrKywgYSA9IFwiL1wiICsgYSk7cmV0dXJuIGEuc3Vic3RyaW5nKGQpIHx8IFwiL1wiO1xuICB9O2IucGFyc2VBdXRob3JpdHkgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGEgPSBiLnBhcnNlVXNlcmluZm8oYSwgYyk7cmV0dXJuIGIucGFyc2VIb3N0KGEsIGMpO1xuICB9O2IucGFyc2VVc2VyaW5mbyA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgdmFyIGQgPSBhLmluZGV4T2YoXCIvXCIpLFxuICAgICAgICBtID0gYS5sYXN0SW5kZXhPZihcIkBcIiwgLTEgPCBkID8gZCA6IGEubGVuZ3RoIC0gMSk7LTEgPCBtICYmICgtMSA9PT0gZCB8fCBtIDwgZCkgPyAoZCA9IGEuc3Vic3RyaW5nKDAsIG0pLnNwbGl0KFwiOlwiKSwgYy51c2VybmFtZSA9IGRbMF0gPyBiLmRlY29kZShkWzBdKSA6IG51bGwsIGQuc2hpZnQoKSwgYy5wYXNzd29yZCA9IGRbMF0gPyBiLmRlY29kZShkLmpvaW4oXCI6XCIpKSA6IG51bGwsIGEgPSBhLnN1YnN0cmluZyhtICsgMSkpIDogKGMudXNlcm5hbWUgPSBudWxsLCBjLnBhc3N3b3JkID0gbnVsbCk7cmV0dXJuIGE7XG4gIH07Yi5wYXJzZVF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAoIWEpIHJldHVybiB7fTthID0gYS5yZXBsYWNlKC8mKy9nLCBcIiZcIikucmVwbGFjZSgvXlxcPyomKnwmKyQvZywgXCJcIik7aWYgKCFhKSByZXR1cm4ge307Zm9yICh2YXIgZCA9IHt9LCBtID0gYS5zcGxpdChcIiZcIiksIGYgPSBtLmxlbmd0aCwgZSwgaywgZyA9IDA7IGcgPCBmOyBnKyspIGlmICgoZSA9IG1bZ10uc3BsaXQoXCI9XCIpLCBrID0gYi5kZWNvZGVRdWVyeShlLnNoaWZ0KCksIGMpLCBlID0gZS5sZW5ndGggPyBiLmRlY29kZVF1ZXJ5KGUuam9pbihcIj1cIiksIGMpIDogbnVsbCwgdi5jYWxsKGQsIGspKSkge1xuICAgICAgaWYgKFwic3RyaW5nXCIgPT09IHR5cGVvZiBkW2tdIHx8IG51bGwgPT09IGRba10pIGRba10gPSBbZFtrXV07ZFtrXS5wdXNoKGUpO1xuICAgIH0gZWxzZSBkW2tdID0gZTtyZXR1cm4gZDtcbiAgfTtiLmJ1aWxkID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYyA9IFwiXCI7YS5wcm90b2NvbCAmJiAoYyArPSBhLnByb3RvY29sICsgXCI6XCIpO2EudXJuIHx8ICFjICYmICFhLmhvc3RuYW1lIHx8IChjICs9IFwiLy9cIik7YyArPSBiLmJ1aWxkQXV0aG9yaXR5KGEpIHx8IFwiXCI7XCJzdHJpbmdcIiA9PT0gdHlwZW9mIGEucGF0aCAmJiAoXCIvXCIgIT09IGEucGF0aC5jaGFyQXQoMCkgJiYgXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGEuaG9zdG5hbWUgJiYgKGMgKz0gXCIvXCIpLCBjICs9IGEucGF0aCk7XCJzdHJpbmdcIiA9PT0gdHlwZW9mIGEucXVlcnkgJiYgYS5xdWVyeSAmJiAoYyArPSBcIj9cIiArIGEucXVlcnkpO1wic3RyaW5nXCIgPT09IHR5cGVvZiBhLmZyYWdtZW50ICYmIGEuZnJhZ21lbnQgJiYgKGMgKz0gXCIjXCIgKyBhLmZyYWdtZW50KTtyZXR1cm4gYztcbiAgfTtiLmJ1aWxkSG9zdCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGMgPSBcIlwiO2lmIChhLmhvc3RuYW1lKSBjID0gYi5pcDZfZXhwcmVzc2lvbi50ZXN0KGEuaG9zdG5hbWUpID8gYyArIChcIltcIiArIGEuaG9zdG5hbWUgKyBcIl1cIikgOiBjICsgYS5ob3N0bmFtZTtlbHNlIHJldHVybiBcIlwiO2EucG9ydCAmJiAoYyArPSBcIjpcIiArIGEucG9ydCk7cmV0dXJuIGM7XG4gIH07Yi5idWlsZEF1dGhvcml0eSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGIuYnVpbGRVc2VyaW5mbyhhKSArIGIuYnVpbGRIb3N0KGEpO1xuICB9O2IuYnVpbGRVc2VyaW5mbyA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGMgPSBcIlwiO2EudXNlcm5hbWUgJiYgKGMgKz0gYi5lbmNvZGUoYS51c2VybmFtZSksIGEucGFzc3dvcmQgJiYgKGMgKz0gXCI6XCIgKyBiLmVuY29kZShhLnBhc3N3b3JkKSksIGMgKz0gXCJAXCIpO3JldHVybiBjO1xuICB9O2IuYnVpbGRRdWVyeSA9IGZ1bmN0aW9uIChhLCBjLCBkKSB7XG4gICAgdmFyIG0gPSBcIlwiLFxuICAgICAgICBmLFxuICAgICAgICBlLFxuICAgICAgICBrLFxuICAgICAgICBnO2ZvciAoZSBpbiBhKSBpZiAodi5jYWxsKGEsIGUpICYmIGUpIGlmICh3KGFbZV0pKSBmb3IgKGYgPSB7fSwgayA9IDAsIGcgPSBhW2VdLmxlbmd0aDsgayA8IGc7IGsrKykgdm9pZCAwICE9PSBhW2VdW2tdICYmIHZvaWQgMCA9PT0gZlthW2VdW2tdICsgXCJcIl0gJiYgKG0gKz0gXCImXCIgKyBiLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoZSwgYVtlXVtrXSwgZCksICEwICE9PSBjICYmIChmW2FbZV1ba10gKyBcIlwiXSA9ICEwKSk7ZWxzZSB2b2lkIDAgIT09IGFbZV0gJiYgKG0gKz0gXCImXCIgKyBiLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoZSwgYVtlXSwgZCkpO3JldHVybiBtLnN1YnN0cmluZygxKTtcbiAgfTtiLmJ1aWxkUXVlcnlQYXJhbWV0ZXIgPSBmdW5jdGlvbiAoYSwgYywgZCkge1xuICAgIHJldHVybiBiLmVuY29kZVF1ZXJ5KGEsIGQpICsgKG51bGwgIT09IGMgPyBcIj1cIiArIGIuZW5jb2RlUXVlcnkoYywgZCkgOiBcIlwiKTtcbiAgfTtiLmFkZFF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICBpZiAoXCJvYmplY3RcIiA9PT0gdHlwZW9mIGMpIGZvciAodmFyIG0gaW4gYykgdi5jYWxsKGMsIG0pICYmIGIuYWRkUXVlcnkoYSwgbSwgY1ttXSk7ZWxzZSBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGMpIHZvaWQgMCA9PT0gYVtjXSA/IGFbY10gPSBkIDogKFwic3RyaW5nXCIgPT09IHR5cGVvZiBhW2NdICYmIChhW2NdID0gW2FbY11dKSwgdyhkKSB8fCAoZCA9IFtkXSksIGFbY10gPSAoYVtjXSB8fCBbXSkuY29uY2F0KGQpKTtlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVUkkuYWRkUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlclwiKTtcbiAgfTtiLnJlbW92ZVF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICB2YXIgbTtpZiAodyhjKSkgZm9yIChkID0gMCwgbSA9IGMubGVuZ3RoOyBkIDwgbTsgZCsrKSBhW2NbZF1dID0gdm9pZCAwO2Vsc2UgaWYgKFwiUmVnRXhwXCIgPT09IEEoYykpIGZvciAobSBpbiBhKSBjLnRlc3QobSkgJiYgKGFbbV0gPSB2b2lkIDApO2Vsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiBjKSBmb3IgKG0gaW4gYykgdi5jYWxsKGMsIG0pICYmIGIucmVtb3ZlUXVlcnkoYSwgbSwgY1ttXSk7ZWxzZSBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGMpIHZvaWQgMCAhPT0gZCA/IFwiUmVnRXhwXCIgPT09IEEoZCkgPyAhdyhhW2NdKSAmJiBkLnRlc3QoYVtjXSkgPyBhW2NdID0gdm9pZCAwIDogYVtjXSA9IGsoYVtjXSwgZCkgOiBhW2NdID09PSBkID8gYVtjXSA9IHZvaWQgMCA6IHcoYVtjXSkgJiYgKGFbY10gPSBrKGFbY10sIGQpKSA6IGFbY10gPSB2b2lkIDA7ZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVVJJLnJlbW92ZVF1ZXJ5KCkgYWNjZXB0cyBhbiBvYmplY3QsIHN0cmluZywgUmVnRXhwIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXJcIik7XG4gIH07Yi5oYXNRdWVyeSA9IGZ1bmN0aW9uIChhLCBjLCBkLCBtKSB7XG4gICAgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiBjKSB7XG4gICAgICBmb3IgKHZhciBmIGluIGMpIGlmICh2LmNhbGwoYywgZikgJiYgIWIuaGFzUXVlcnkoYSwgZiwgY1tmXSkpIHJldHVybiAhMTtyZXR1cm4gITA7XG4gICAgfWlmIChcInN0cmluZ1wiICE9PSB0eXBlb2YgYykgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVSSS5oYXNRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyXCIpO1xuICAgIHN3aXRjaCAoQShkKSkge2Nhc2UgXCJVbmRlZmluZWRcIjpcbiAgICAgICAgcmV0dXJuIGMgaW4gYTtjYXNlIFwiQm9vbGVhblwiOlxuICAgICAgICByZXR1cm4gKGEgPSBCb29sZWFuKHcoYVtjXSkgPyBhW2NdLmxlbmd0aCA6IGFbY10pLCBkID09PSBhKTtjYXNlIFwiRnVuY3Rpb25cIjpcbiAgICAgICAgcmV0dXJuICEhZChhW2NdLCBjLCBhKTtjYXNlIFwiQXJyYXlcIjpcbiAgICAgICAgcmV0dXJuIHcoYVtjXSkgPyAobSA/IHUgOiBEKShhW2NdLCBkKSA6ICExO2Nhc2UgXCJSZWdFeHBcIjpcbiAgICAgICAgcmV0dXJuIHcoYVtjXSkgPyBtID8gdShhW2NdLCBkKSA6ICExIDogQm9vbGVhbihhW2NdICYmIGFbY10ubWF0Y2goZCkpO2Nhc2UgXCJOdW1iZXJcIjpcbiAgICAgICAgZCA9IFN0cmluZyhkKTtjYXNlIFwiU3RyaW5nXCI6XG4gICAgICAgIHJldHVybiB3KGFbY10pID8gbSA/IHUoYVtjXSwgZCkgOiAhMSA6IGFbY10gPT09IGQ7ZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVSSS5oYXNRdWVyeSgpIGFjY2VwdHMgdW5kZWZpbmVkLCBib29sZWFuLCBzdHJpbmcsIG51bWJlciwgUmVnRXhwLCBGdW5jdGlvbiBhcyB0aGUgdmFsdWUgcGFyYW1ldGVyXCIpO31cbiAgfTtiLmNvbW1vblBhdGggPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIHZhciBkID0gTWF0aC5taW4oYS5sZW5ndGgsIGMubGVuZ3RoKSxcbiAgICAgICAgYjtmb3IgKGIgPSAwOyBiIDwgZDsgYisrKSBpZiAoYS5jaGFyQXQoYikgIT09IGMuY2hhckF0KGIpKSB7XG4gICAgICBiLS07YnJlYWs7XG4gICAgfWlmICgxID4gYikgcmV0dXJuIGEuY2hhckF0KDApID09PSBjLmNoYXJBdCgwKSAmJiBcIi9cIiA9PT0gYS5jaGFyQXQoMCkgPyBcIi9cIiA6IFwiXCI7aWYgKFwiL1wiICE9PSBhLmNoYXJBdChiKSB8fCBcIi9cIiAhPT0gYy5jaGFyQXQoYikpIGIgPSBhLnN1YnN0cmluZygwLCBiKS5sYXN0SW5kZXhPZihcIi9cIik7cmV0dXJuIGEuc3Vic3RyaW5nKDAsIGIgKyAxKTtcbiAgfTtiLndpdGhpblN0cmluZyA9IGZ1bmN0aW9uIChhLCBjLCBkKSB7XG4gICAgZCB8fCAoZCA9IHt9KTt2YXIgbSA9IGQuc3RhcnQgfHwgYi5maW5kVXJpLnN0YXJ0LFxuICAgICAgICBmID0gZC5lbmQgfHwgYi5maW5kVXJpLmVuZCxcbiAgICAgICAgZSA9IGQudHJpbSB8fCBiLmZpbmRVcmkudHJpbSxcbiAgICAgICAgayA9IC9bYS16MC05LV09W1wiJ10/JC9pO2ZvciAobS5sYXN0SW5kZXggPSAwOzspIHtcbiAgICAgIHZhciBnID0gbS5leGVjKGEpO2lmICghZykgYnJlYWs7ZyA9IGcuaW5kZXg7aWYgKGQuaWdub3JlSHRtbCkge1xuICAgICAgICB2YXIgdSA9IGEuc2xpY2UoTWF0aC5tYXgoZyAtIDMsIDApLCBnKTtpZiAodSAmJiBrLnRlc3QodSkpIGNvbnRpbnVlO1xuICAgICAgfXZhciB1ID0gZyArIGEuc2xpY2UoZykuc2VhcmNoKGYpLFxuICAgICAgICAgIGggPSBhLnNsaWNlKGcsIHUpLnJlcGxhY2UoZSwgXCJcIik7ZC5pZ25vcmUgJiYgZC5pZ25vcmUudGVzdChoKSB8fCAodSA9IGcgKyBoLmxlbmd0aCwgaCA9IGMoaCwgZywgdSwgYSksIGEgPSBhLnNsaWNlKDAsIGcpICsgaCArIGEuc2xpY2UodSksIG0ubGFzdEluZGV4ID0gZyArIGgubGVuZ3RoKTtcbiAgICB9bS5sYXN0SW5kZXggPSAwO3JldHVybiBhO1xuICB9O2IuZW5zdXJlVmFsaWRIb3N0bmFtZSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgaWYgKGEubWF0Y2goYi5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMpKSB7XG4gICAgICBpZiAoIWUpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJIb3N0bmFtZSBcXFwiXCIgKyBhICsgXCJcXFwiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05Li1dIGFuZCBQdW55Y29kZS5qcyBpcyBub3QgYXZhaWxhYmxlXCIpO2lmIChlLnRvQVNDSUkoYSkubWF0Y2goYi5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSG9zdG5hbWUgXFxcIlwiICsgYSArIFwiXFxcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXVwiKTtcbiAgICB9XG4gIH07Yi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAoYSkgcmV0dXJuIChhID0geyBVUkk6IHRoaXMubm9Db25mbGljdCgpIH0sIGwuVVJJVGVtcGxhdGUgJiYgXCJmdW5jdGlvblwiID09PSB0eXBlb2YgbC5VUklUZW1wbGF0ZS5ub0NvbmZsaWN0ICYmIChhLlVSSVRlbXBsYXRlID0gbC5VUklUZW1wbGF0ZS5ub0NvbmZsaWN0KCkpLCBsLklQdjYgJiYgXCJmdW5jdGlvblwiID09PSB0eXBlb2YgbC5JUHY2Lm5vQ29uZmxpY3QgJiYgKGEuSVB2NiA9IGwuSVB2Ni5ub0NvbmZsaWN0KCkpLCBsLlNlY29uZExldmVsRG9tYWlucyAmJiBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiBsLlNlY29uZExldmVsRG9tYWlucy5ub0NvbmZsaWN0ICYmIChhLlNlY29uZExldmVsRG9tYWlucyA9IGwuU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QoKSksIGEpO2wuVVJJID09PSB0aGlzICYmIChsLlVSSSA9IHApO3JldHVybiB0aGlzO1xuICB9O2YuYnVpbGQgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmICghMCA9PT0gYSkgdGhpcy5fZGVmZXJyZWRfYnVpbGQgPSAhMDtlbHNlIGlmICh2b2lkIDAgPT09IGEgfHwgdGhpcy5fZGVmZXJyZWRfYnVpbGQpIHRoaXMuX3N0cmluZyA9IGIuYnVpbGQodGhpcy5fcGFydHMpLCB0aGlzLl9kZWZlcnJlZF9idWlsZCA9ICExO3JldHVybiB0aGlzO1xuICB9O2YuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBiKHRoaXMpO1xuICB9O2YudmFsdWVPZiA9IGYudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGQoITEpLl9zdHJpbmc7XG4gIH07Zi5wcm90b2NvbCA9IHQoXCJwcm90b2NvbFwiKTtmLnVzZXJuYW1lID0gdChcInVzZXJuYW1lXCIpO2YucGFzc3dvcmQgPSB0KFwicGFzc3dvcmRcIik7Zi5ob3N0bmFtZSA9IHQoXCJob3N0bmFtZVwiKTtmLnBvcnQgPSB0KFwicG9ydFwiKTtmLnF1ZXJ5ID0gcihcInF1ZXJ5XCIsIFwiP1wiKTtmLmZyYWdtZW50ID0gcihcImZyYWdtZW50XCIsIFwiI1wiKTtmLnNlYXJjaCA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgdmFyIGIgPSB0aGlzLnF1ZXJ5KGEsIGMpO3JldHVybiBcInN0cmluZ1wiID09PSB0eXBlb2YgYiAmJiBiLmxlbmd0aCA/IFwiP1wiICsgYiA6IGI7XG4gIH07Zi5oYXNoID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICB2YXIgYiA9IHRoaXMuZnJhZ21lbnQoYSwgYyk7cmV0dXJuIFwic3RyaW5nXCIgPT09IHR5cGVvZiBiICYmIGIubGVuZ3RoID8gXCIjXCIgKyBiIDogYjtcbiAgfTtmLnBhdGhuYW1lID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAodm9pZCAwID09PSBhIHx8ICEwID09PSBhKSB7XG4gICAgICB2YXIgZCA9IHRoaXMuX3BhcnRzLnBhdGggfHwgKHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gXCIvXCIgOiBcIlwiKTtyZXR1cm4gYSA/ICh0aGlzLl9wYXJ0cy51cm4gPyBiLmRlY29kZVVyblBhdGggOiBiLmRlY29kZVBhdGgpKGQpIDogZDtcbiAgICB9dGhpcy5fcGFydHMucGF0aCA9IHRoaXMuX3BhcnRzLnVybiA/IGEgPyBiLnJlY29kZVVyblBhdGgoYSkgOiBcIlwiIDogYSA/IGIucmVjb2RlUGF0aChhKSA6IFwiL1wiO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2YucGF0aCA9IGYucGF0aG5hbWU7Zi5ocmVmID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICB2YXIgZDtpZiAodm9pZCAwID09PSBhKSByZXR1cm4gdGhpcy50b1N0cmluZygpO3RoaXMuX3N0cmluZyA9IFwiXCI7dGhpcy5fcGFydHMgPSBiLl9wYXJ0cygpO3ZhciBmID0gYSBpbnN0YW5jZW9mIGIsXG4gICAgICAgIGUgPSBcIm9iamVjdFwiID09PSB0eXBlb2YgYSAmJiAoYS5ob3N0bmFtZSB8fCBhLnBhdGggfHwgYS5wYXRobmFtZSk7YS5ub2RlTmFtZSAmJiAoZSA9IGIuZ2V0RG9tQXR0cmlidXRlKGEpLCBhID0gYVtlXSB8fCBcIlwiLCBlID0gITEpOyFmICYmIGUgJiYgdm9pZCAwICE9PSBhLnBhdGhuYW1lICYmIChhID0gYS50b1N0cmluZygpKTtpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGEgfHwgYSBpbnN0YW5jZW9mIFN0cmluZykgdGhpcy5fcGFydHMgPSBiLnBhcnNlKFN0cmluZyhhKSwgdGhpcy5fcGFydHMpO2Vsc2UgaWYgKGYgfHwgZSkgZm9yIChkIGluIChmID0gZiA/IGEuX3BhcnRzIDogYSwgZikpIHYuY2FsbCh0aGlzLl9wYXJ0cywgZCkgJiYgKHRoaXMuX3BhcnRzW2RdID0gZltkXSk7ZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiaW52YWxpZCBpbnB1dFwiKTt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtmLmlzID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYyA9ICExLFxuICAgICAgICBkID0gITEsXG4gICAgICAgIGYgPSAhMSxcbiAgICAgICAgZSA9ICExLFxuICAgICAgICBrID0gITEsXG4gICAgICAgIHUgPSAhMSxcbiAgICAgICAgaCA9ICExLFxuICAgICAgICBsID0gIXRoaXMuX3BhcnRzLnVybjt0aGlzLl9wYXJ0cy5ob3N0bmFtZSAmJiAobCA9ICExLCBkID0gYi5pcDRfZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSwgZiA9IGIuaXA2X2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSksIGMgPSBkIHx8IGYsIGsgPSAoZSA9ICFjKSAmJiBnICYmIGcuaGFzKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSwgdSA9IGUgJiYgYi5pZG5fZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSwgaCA9IGUgJiYgYi5wdW55Y29kZV9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpKTtzd2l0Y2ggKGEudG9Mb3dlckNhc2UoKSkge2Nhc2UgXCJyZWxhdGl2ZVwiOlxuICAgICAgICByZXR1cm4gbDtjYXNlIFwiYWJzb2x1dGVcIjpcbiAgICAgICAgcmV0dXJuICFsO2Nhc2UgXCJkb21haW5cIjpjYXNlIFwibmFtZVwiOlxuICAgICAgICByZXR1cm4gZTtjYXNlIFwic2xkXCI6XG4gICAgICAgIHJldHVybiBrO2Nhc2UgXCJpcFwiOlxuICAgICAgICByZXR1cm4gYztjYXNlIFwiaXA0XCI6Y2FzZSBcImlwdjRcIjpjYXNlIFwiaW5ldDRcIjpcbiAgICAgICAgcmV0dXJuIGQ7Y2FzZSBcImlwNlwiOmNhc2UgXCJpcHY2XCI6Y2FzZSBcImluZXQ2XCI6XG4gICAgICAgIHJldHVybiBmO2Nhc2UgXCJpZG5cIjpcbiAgICAgICAgcmV0dXJuIHU7Y2FzZSBcInVybFwiOlxuICAgICAgICByZXR1cm4gIXRoaXMuX3BhcnRzLnVybjtjYXNlIFwidXJuXCI6XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3BhcnRzLnVybjtcbiAgICAgIGNhc2UgXCJwdW55Y29kZVwiOlxuICAgICAgICByZXR1cm4gaDt9cmV0dXJuIG51bGw7XG4gIH07dmFyIEYgPSBmLnByb3RvY29sLFxuICAgICAgRyA9IGYucG9ydCxcbiAgICAgIEggPSBmLmhvc3RuYW1lO2YucHJvdG9jb2wgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh2b2lkIDAgIT09IGEgJiYgYSAmJiAoYSA9IGEucmVwbGFjZSgvOihcXC9cXC8pPyQvLCBcIlwiKSwgIWEubWF0Y2goYi5wcm90b2NvbF9leHByZXNzaW9uKSkpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm90b2NvbCBcXFwiXCIgKyBhICsgXCJcXFwiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05ListXSBvciBkb2Vzbid0IHN0YXJ0IHdpdGggW0EtWl1cIik7cmV0dXJuIEYuY2FsbCh0aGlzLCBhLCBjKTtcbiAgfTtmLnNjaGVtZSA9IGYucHJvdG9jb2w7Zi5wb3J0ID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSByZXR1cm4gdm9pZCAwID09PSBhID8gXCJcIiA6IHRoaXM7aWYgKHZvaWQgMCAhPT0gYSAmJiAoMCA9PT0gYSAmJiAoYSA9IG51bGwpLCBhICYmIChhICs9IFwiXCIsIFwiOlwiID09PSBhLmNoYXJBdCgwKSAmJiAoYSA9IGEuc3Vic3RyaW5nKDEpKSwgYS5tYXRjaCgvW14wLTldLykpKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBvcnQgXFxcIlwiICsgYSArIFwiXFxcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gWzAtOV1cIik7cmV0dXJuIEcuY2FsbCh0aGlzLCBhLCBjKTtcbiAgfTtmLmhvc3RuYW1lID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSByZXR1cm4gdm9pZCAwID09PSBhID8gXCJcIiA6IHRoaXM7aWYgKHZvaWQgMCAhPT0gYSkge1xuICAgICAgdmFyIGQgPSB7fTtiLnBhcnNlSG9zdChhLCBkKTthID0gZC5ob3N0bmFtZTtcbiAgICB9cmV0dXJuIEguY2FsbCh0aGlzLCBhLCBjKTtcbiAgfTtmLmhvc3QgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwID09PSBhKSByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUgPyBiLmJ1aWxkSG9zdCh0aGlzLl9wYXJ0cykgOiBcIlwiO2IucGFyc2VIb3N0KGEsIHRoaXMuX3BhcnRzKTt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtmLmF1dGhvcml0eSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO2lmICh2b2lkIDAgPT09IGEpIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/IGIuYnVpbGRBdXRob3JpdHkodGhpcy5fcGFydHMpIDogXCJcIjtiLnBhcnNlQXV0aG9yaXR5KGEsIHRoaXMuX3BhcnRzKTt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtmLnVzZXJpbmZvID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSByZXR1cm4gdm9pZCAwID09PSBhID8gXCJcIiA6IHRoaXM7aWYgKHZvaWQgMCA9PT0gYSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy51c2VybmFtZSkgcmV0dXJuIFwiXCI7dmFyIGQgPSBiLmJ1aWxkVXNlcmluZm8odGhpcy5fcGFydHMpO3JldHVybiBkLnN1YnN0cmluZygwLCBkLmxlbmd0aCAtIDEpO1xuICAgIH1cIkBcIiAhPT0gYVthLmxlbmd0aCAtIDFdICYmIChhICs9IFwiQFwiKTtiLnBhcnNlVXNlcmluZm8oYSwgdGhpcy5fcGFydHMpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2YucmVzb3VyY2UgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIHZhciBkO2lmICh2b2lkIDAgPT09IGEpIHJldHVybiB0aGlzLnBhdGgoKSArIHRoaXMuc2VhcmNoKCkgKyB0aGlzLmhhc2goKTtkID0gYi5wYXJzZShhKTt0aGlzLl9wYXJ0cy5wYXRoID0gZC5wYXRoO3RoaXMuX3BhcnRzLnF1ZXJ5ID0gZC5xdWVyeTt0aGlzLl9wYXJ0cy5mcmFnbWVudCA9IGQuZnJhZ21lbnQ7dGhpcy5idWlsZCghYyk7cmV0dXJuIHRoaXM7XG4gIH07Zi5zdWJkb21haW4gPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwID09PSBhKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoXCJJUFwiKSkgcmV0dXJuIFwiXCI7dmFyIGQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sZW5ndGggLSB0aGlzLmRvbWFpbigpLmxlbmd0aCAtIDE7cmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBkKSB8fCBcIlwiO1xuICAgIH1kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy5kb21haW4oKS5sZW5ndGg7ZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBkKTtkID0gbmV3IFJlZ0V4cChcIl5cIiArIGgoZCkpO2EgJiYgXCIuXCIgIT09IGEuY2hhckF0KGEubGVuZ3RoIC0gMSkgJiYgKGEgKz0gXCIuXCIpO2EgJiYgYi5lbnN1cmVWYWxpZEhvc3RuYW1lKGEpO3RoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShkLCBhKTt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtmLmRvbWFpbiA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO1wiYm9vbGVhblwiID09PSB0eXBlb2YgYSAmJiAoYyA9IGEsIGEgPSB2b2lkIDApO2lmICh2b2lkIDAgPT09IGEpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcyhcIklQXCIpKSByZXR1cm4gXCJcIjt2YXIgZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLm1hdGNoKC9cXC4vZyk7aWYgKGQgJiYgMiA+IGQubGVuZ3RoKSByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWU7ZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMudGxkKGMpLmxlbmd0aCAtIDE7ZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxhc3RJbmRleE9mKFwiLlwiLCBkIC0gMSkgKyAxO3JldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoZCkgfHwgXCJcIjtcbiAgICB9aWYgKCFhKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2Fubm90IHNldCBkb21haW4gZW1wdHlcIik7XG4gICAgYi5lbnN1cmVWYWxpZEhvc3RuYW1lKGEpOyF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKFwiSVBcIikgPyB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IGEgOiAoZCA9IG5ldyBSZWdFeHAoaCh0aGlzLmRvbWFpbigpKSArIFwiJFwiKSwgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKGQsIGEpKTt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtmLnRsZCA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO1wiYm9vbGVhblwiID09PSB0eXBlb2YgYSAmJiAoYyA9IGEsIGEgPSB2b2lkIDApO2lmICh2b2lkIDAgPT09IGEpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcyhcIklQXCIpKSByZXR1cm4gXCJcIjt2YXIgYiA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxhc3RJbmRleE9mKFwiLlwiKSxcbiAgICAgICAgICBiID0gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKGIgKyAxKTtyZXR1cm4gITAgIT09IGMgJiYgZyAmJiBnLmxpc3RbYi50b0xvd2VyQ2FzZSgpXSA/IGcuZ2V0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB8fCBiIDogYjtcbiAgICB9aWYgKGEpIGlmIChhLm1hdGNoKC9bXmEtekEtWjAtOS1dLykpIGlmIChnICYmIGcuaXMoYSkpIGIgPSBuZXcgUmVnRXhwKGgodGhpcy50bGQoKSkgKyBcIiRcIiksIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShiLCBhKTtlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJUTEQgXFxcIlwiICsgYSArIFwiXFxcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOV1cIik7ZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoXCJJUFwiKSkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiY2Fubm90IHNldCBUTEQgb24gbm9uLWRvbWFpbiBob3N0XCIpO2IgPSBuZXcgUmVnRXhwKGgodGhpcy50bGQoKSkgKyBcIiRcIik7dGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKGIsIGEpO1xuICAgIH0gZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2Fubm90IHNldCBUTEQgZW1wdHlcIik7dGhpcy5idWlsZCghYyk7cmV0dXJuIHRoaXM7XG4gIH07Zi5kaXJlY3RvcnkgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwID09PSBhIHx8ICEwID09PSBhKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnBhdGggJiYgIXRoaXMuX3BhcnRzLmhvc3RuYW1lKSByZXR1cm4gXCJcIjtpZiAoXCIvXCIgPT09IHRoaXMuX3BhcnRzLnBhdGgpIHJldHVybiBcIi9cIjt2YXIgZCA9IHRoaXMuX3BhcnRzLnBhdGgubGVuZ3RoIC0gdGhpcy5maWxlbmFtZSgpLmxlbmd0aCAtIDEsXG4gICAgICAgICAgZCA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKDAsIGQpIHx8ICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/IFwiL1wiIDogXCJcIik7cmV0dXJuIGEgPyBiLmRlY29kZVBhdGgoZCkgOiBkO1xuICAgIH1kID0gdGhpcy5fcGFydHMucGF0aC5sZW5ndGggLSB0aGlzLmZpbGVuYW1lKCkubGVuZ3RoO2QgPSB0aGlzLl9wYXJ0cy5wYXRoLnN1YnN0cmluZygwLCBkKTtkID0gbmV3IFJlZ0V4cChcIl5cIiArIGgoZCkpO3RoaXMuaXMoXCJyZWxhdGl2ZVwiKSB8fCAoYSB8fCAoYSA9IFwiL1wiKSwgXCIvXCIgIT09IGEuY2hhckF0KDApICYmIChhID0gXCIvXCIgKyBhKSk7YSAmJiBcIi9cIiAhPT0gYS5jaGFyQXQoYS5sZW5ndGggLSAxKSAmJiAoYSArPSBcIi9cIik7YSA9IGIucmVjb2RlUGF0aChhKTt0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKGQsIGEpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2YuZmlsZW5hbWUgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwID09PSBhIHx8ICEwID09PSBhKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnBhdGggfHwgXCIvXCIgPT09IHRoaXMuX3BhcnRzLnBhdGgpIHJldHVybiBcIlwiO3ZhciBkID0gdGhpcy5fcGFydHMucGF0aC5sYXN0SW5kZXhPZihcIi9cIiksXG4gICAgICAgICAgZCA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKGQgKyAxKTtyZXR1cm4gYSA/IGIuZGVjb2RlUGF0aFNlZ21lbnQoZCkgOiBkO1xuICAgIH1kID0gITE7XCIvXCIgPT09IGEuY2hhckF0KDApICYmIChhID0gYS5zdWJzdHJpbmcoMSkpO2EubWF0Y2goL1xcLj9cXC8vKSAmJiAoZCA9ICEwKTt2YXIgZiA9IG5ldyBSZWdFeHAoaCh0aGlzLmZpbGVuYW1lKCkpICsgXCIkXCIpO2EgPSBiLnJlY29kZVBhdGgoYSk7dGhpcy5fcGFydHMucGF0aCA9IHRoaXMuX3BhcnRzLnBhdGgucmVwbGFjZShmLCBhKTtkID8gdGhpcy5ub3JtYWxpemVQYXRoKGMpIDogdGhpcy5idWlsZCghYyk7cmV0dXJuIHRoaXM7XG4gIH07Zi5zdWZmaXggPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwID09PSBhIHx8ICEwID09PSBhKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnBhdGggfHwgXCIvXCIgPT09IHRoaXMuX3BhcnRzLnBhdGgpIHJldHVybiBcIlwiO3ZhciBkID0gdGhpcy5maWxlbmFtZSgpLFxuICAgICAgICAgIGYgPSBkLmxhc3RJbmRleE9mKFwiLlwiKTtpZiAoLTEgPT09IGYpIHJldHVybiBcIlwiO2QgPSBkLnN1YnN0cmluZyhmICsgMSk7ZCA9IC9eW2EtejAtOSVdKyQvaS50ZXN0KGQpID8gZCA6IFwiXCI7cmV0dXJuIGEgPyBiLmRlY29kZVBhdGhTZWdtZW50KGQpIDogZDtcbiAgICB9XCIuXCIgPT09IGEuY2hhckF0KDApICYmIChhID0gYS5zdWJzdHJpbmcoMSkpO2lmIChkID0gdGhpcy5zdWZmaXgoKSkgZiA9IGEgPyBuZXcgUmVnRXhwKGgoZCkgKyBcIiRcIikgOiBuZXcgUmVnRXhwKGgoXCIuXCIgKyBkKSArIFwiJFwiKTtlbHNlIHtcbiAgICAgIGlmICghYSkgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoICs9IFwiLlwiICsgYi5yZWNvZGVQYXRoKGEpO1xuICAgIH1mICYmIChhID0gYi5yZWNvZGVQYXRoKGEpLCB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKGYsIGEpKTt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtmLnNlZ21lbnQgPSBmdW5jdGlvbiAoYSwgYywgYikge1xuICAgIHZhciBmID0gdGhpcy5fcGFydHMudXJuID8gXCI6XCIgOiBcIi9cIixcbiAgICAgICAgZSA9IHRoaXMucGF0aCgpLFxuICAgICAgICBrID0gXCIvXCIgPT09IGUuc3Vic3RyaW5nKDAsIDEpLFxuICAgICAgICBlID0gZS5zcGxpdChmKTt2b2lkIDAgIT09IGEgJiYgXCJudW1iZXJcIiAhPT0gdHlwZW9mIGEgJiYgKGIgPSBjLCBjID0gYSwgYSA9IHZvaWQgMCk7aWYgKHZvaWQgMCAhPT0gYSAmJiBcIm51bWJlclwiICE9PSB0eXBlb2YgYSkgdGhyb3cgRXJyb3IoXCJCYWQgc2VnbWVudCBcXFwiXCIgKyBhICsgXCJcXFwiLCBtdXN0IGJlIDAtYmFzZWQgaW50ZWdlclwiKTtrICYmIGUuc2hpZnQoKTswID4gYSAmJiAoYSA9IE1hdGgubWF4KGUubGVuZ3RoICsgYSwgMCkpO2lmICh2b2lkIDAgPT09IGMpIHJldHVybiB2b2lkIDAgPT09IGEgPyBlIDogZVthXTtpZiAobnVsbCA9PT0gYSB8fCB2b2lkIDAgPT09IGVbYV0pIGlmICh3KGMpKSB7XG4gICAgICBlID0gW107YSA9IDA7Zm9yICh2YXIgZyA9IGMubGVuZ3RoOyBhIDwgZzsgYSsrKSBpZiAoY1thXS5sZW5ndGggfHwgZS5sZW5ndGggJiYgZVtlLmxlbmd0aCAtIDFdLmxlbmd0aCkgZS5sZW5ndGggJiYgIWVbZS5sZW5ndGggLSAxXS5sZW5ndGggJiYgZS5wb3AoKSwgZS5wdXNoKGNbYV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYyB8fCBcInN0cmluZ1wiID09PSB0eXBlb2YgYykgXCJcIiA9PT0gZVtlLmxlbmd0aCAtIDFdID8gZVtlLmxlbmd0aCAtIDFdID0gYyA6IGUucHVzaChjKTtcbiAgICB9IGVsc2UgYyA/IGVbYV0gPSBjIDogZS5zcGxpY2UoYSwgMSk7ayAmJiBlLnVuc2hpZnQoXCJcIik7cmV0dXJuIHRoaXMucGF0aChlLmpvaW4oZiksIGIpO1xuICB9O2Yuc2VnbWVudENvZGVkID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICB2YXIgZiwgZTtcIm51bWJlclwiICE9PSB0eXBlb2YgYSAmJiAoZCA9IGMsIGMgPSBhLCBhID0gdm9pZCAwKTtpZiAodm9pZCAwID09PSBjKSB7XG4gICAgICBhID0gdGhpcy5zZWdtZW50KGEsIGMsIGQpO2lmICh3KGEpKSBmb3IgKGYgPSAwLCBlID0gYS5sZW5ndGg7IGYgPCBlOyBmKyspIGFbZl0gPSBiLmRlY29kZShhW2ZdKTtlbHNlIGEgPSB2b2lkIDAgIT09IGEgPyBiLmRlY29kZShhKSA6IHZvaWQgMDtyZXR1cm4gYTtcbiAgICB9aWYgKHcoYykpIGZvciAoZiA9IDAsIGUgPSBjLmxlbmd0aDsgZiA8IGU7IGYrKykgY1tmXSA9IGIuZW5jb2RlKGNbZl0pO2Vsc2UgYyA9IFwic3RyaW5nXCIgPT09IHR5cGVvZiBjIHx8IGMgaW5zdGFuY2VvZiBTdHJpbmcgPyBiLmVuY29kZShjKSA6IGM7cmV0dXJuIHRoaXMuc2VnbWVudChhLCBjLCBkKTtcbiAgfTt2YXIgSSA9IGYucXVlcnk7Zi5xdWVyeSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKCEwID09PSBhKSByZXR1cm4gYi5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtpZiAoXCJmdW5jdGlvblwiID09PSB0eXBlb2YgYSkge1xuICAgICAgdmFyIGQgPSBiLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpLFxuICAgICAgICAgIGYgPSBhLmNhbGwodGhpcywgZCk7dGhpcy5fcGFydHMucXVlcnkgPSBiLmJ1aWxkUXVlcnkoZiB8fCBkLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICAgIH1yZXR1cm4gdm9pZCAwICE9PSBhICYmIFwic3RyaW5nXCIgIT09IHR5cGVvZiBhID8gKHRoaXMuX3BhcnRzLnF1ZXJ5ID0gYi5idWlsZFF1ZXJ5KGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSksIHRoaXMuYnVpbGQoIWMpLCB0aGlzKSA6IEkuY2FsbCh0aGlzLCBhLCBjKTtcbiAgfTtmLnNldFF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICB2YXIgZiA9IGIucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7aWYgKFwic3RyaW5nXCIgPT09IHR5cGVvZiBhIHx8IGEgaW5zdGFuY2VvZiBTdHJpbmcpIGZbYV0gPSB2b2lkIDAgIT09IGMgPyBjIDogbnVsbDtlbHNlIGlmIChcIm9iamVjdFwiID09PSB0eXBlb2YgYSkgZm9yICh2YXIgZSBpbiBhKSB2LmNhbGwoYSwgZSkgJiYgKGZbZV0gPSBhW2VdKTtlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVUkkuYWRkUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlclwiKTt0aGlzLl9wYXJ0cy5xdWVyeSA9IGIuYnVpbGRRdWVyeShmLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1wic3RyaW5nXCIgIT09IHR5cGVvZiBhICYmIChkID0gYyk7dGhpcy5idWlsZCghZCk7cmV0dXJuIHRoaXM7XG4gIH07Zi5hZGRRdWVyeSA9IGZ1bmN0aW9uIChhLCBjLCBkKSB7XG4gICAgdmFyIGYgPSBiLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO2IuYWRkUXVlcnkoZiwgYSwgdm9pZCAwID09PSBjID8gbnVsbCA6IGMpO3RoaXMuX3BhcnRzLnF1ZXJ5ID0gYi5idWlsZFF1ZXJ5KGYsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XCJzdHJpbmdcIiAhPT0gdHlwZW9mIGEgJiYgKGQgPSBjKTt0aGlzLmJ1aWxkKCFkKTtyZXR1cm4gdGhpcztcbiAgfTtmLnJlbW92ZVF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICB2YXIgZiA9IGIucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgYi5yZW1vdmVRdWVyeShmLCBhLCBjKTt0aGlzLl9wYXJ0cy5xdWVyeSA9IGIuYnVpbGRRdWVyeShmLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1wic3RyaW5nXCIgIT09IHR5cGVvZiBhICYmIChkID0gYyk7dGhpcy5idWlsZCghZCk7cmV0dXJuIHRoaXM7XG4gIH07Zi5oYXNRdWVyeSA9IGZ1bmN0aW9uIChhLCBjLCBkKSB7XG4gICAgdmFyIGYgPSBiLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO3JldHVybiBiLmhhc1F1ZXJ5KGYsIGEsIGMsIGQpO1xuICB9O2Yuc2V0U2VhcmNoID0gZi5zZXRRdWVyeTtmLmFkZFNlYXJjaCA9IGYuYWRkUXVlcnk7Zi5yZW1vdmVTZWFyY2ggPSBmLnJlbW92ZVF1ZXJ5O2YuaGFzU2VhcmNoID0gZi5oYXNRdWVyeTtmLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFydHMudXJuID8gdGhpcy5ub3JtYWxpemVQcm90b2NvbCghMSkubm9ybWFsaXplUGF0aCghMSkubm9ybWFsaXplUXVlcnkoITEpLm5vcm1hbGl6ZUZyYWdtZW50KCExKS5idWlsZCgpIDogdGhpcy5ub3JtYWxpemVQcm90b2NvbCghMSkubm9ybWFsaXplSG9zdG5hbWUoITEpLm5vcm1hbGl6ZVBvcnQoITEpLm5vcm1hbGl6ZVBhdGgoITEpLm5vcm1hbGl6ZVF1ZXJ5KCExKS5ub3JtYWxpemVGcmFnbWVudCghMSkuYnVpbGQoKTtcbiAgfTtmLm5vcm1hbGl6ZVByb3RvY29sID0gZnVuY3Rpb24gKGEpIHtcbiAgICBcInN0cmluZ1wiID09PSB0eXBlb2YgdGhpcy5fcGFydHMucHJvdG9jb2wgJiYgKHRoaXMuX3BhcnRzLnByb3RvY29sID0gdGhpcy5fcGFydHMucHJvdG9jb2wudG9Mb3dlckNhc2UoKSwgdGhpcy5idWlsZCghYSkpO3JldHVybiB0aGlzO1xuICB9O2Yubm9ybWFsaXplSG9zdG5hbWUgPSBmdW5jdGlvbiAoYSkge1xuICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lICYmICh0aGlzLmlzKFwiSUROXCIpICYmIGUgPyB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IGUudG9BU0NJSSh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkgOiB0aGlzLmlzKFwiSVB2NlwiKSAmJiBuICYmICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IG4uYmVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkpLCB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCksIHRoaXMuYnVpbGQoIWEpKTtyZXR1cm4gdGhpcztcbiAgfTtmLm5vcm1hbGl6ZVBvcnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIFwic3RyaW5nXCIgPT09IHR5cGVvZiB0aGlzLl9wYXJ0cy5wcm90b2NvbCAmJiB0aGlzLl9wYXJ0cy5wb3J0ID09PSBiLmRlZmF1bHRQb3J0c1t0aGlzLl9wYXJ0cy5wcm90b2NvbF0gJiYgKHRoaXMuX3BhcnRzLnBvcnQgPSBudWxsLCB0aGlzLmJ1aWxkKCFhKSk7cmV0dXJuIHRoaXM7XG4gIH07Zi5ub3JtYWxpemVQYXRoID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYyA9IHRoaXMuX3BhcnRzLnBhdGg7aWYgKCFjKSByZXR1cm4gdGhpcztpZiAodGhpcy5fcGFydHMudXJuKSByZXR1cm4gKHRoaXMuX3BhcnRzLnBhdGggPSBiLnJlY29kZVVyblBhdGgodGhpcy5fcGFydHMucGF0aCksIHRoaXMuYnVpbGQoIWEpLCB0aGlzKTtpZiAoXCIvXCIgPT09IHRoaXMuX3BhcnRzLnBhdGgpIHJldHVybiB0aGlzO3ZhciBkLFxuICAgICAgICBmID0gXCJcIixcbiAgICAgICAgZSxcbiAgICAgICAgaztcIi9cIiAhPT0gYy5jaGFyQXQoMCkgJiYgKGQgPSAhMCwgYyA9IFwiL1wiICsgYyk7aWYgKFwiLy4uXCIgPT09IGMuc2xpY2UoLTMpIHx8IFwiLy5cIiA9PT0gYy5zbGljZSgtMikpIGMgKz0gXCIvXCI7YyA9IGMucmVwbGFjZSgvKFxcLyhcXC5cXC8pKyl8KFxcL1xcLiQpL2csIFwiL1wiKS5yZXBsYWNlKC9cXC97Mix9L2csIFwiL1wiKTtkICYmIChmID0gYy5zdWJzdHJpbmcoMSkubWF0Y2goL14oXFwuXFwuXFwvKSsvKSB8fCBcIlwiKSAmJiAoZiA9IGZbMF0pO2ZvciAoOzspIHtcbiAgICAgIGUgPSBjLmluZGV4T2YoXCIvLi5cIik7aWYgKC0xID09PSBlKSBicmVhaztlbHNlIGlmICgwID09PSBlKSB7XG4gICAgICAgIGMgPSBjLnN1YnN0cmluZygzKTtjb250aW51ZTtcbiAgICAgIH1rID0gYy5zdWJzdHJpbmcoMCwgZSkubGFzdEluZGV4T2YoXCIvXCIpOy0xID09PSBrICYmIChrID0gZSk7YyA9IGMuc3Vic3RyaW5nKDAsIGspICsgYy5zdWJzdHJpbmcoZSArIDMpO1xuICAgIH1kICYmIHRoaXMuaXMoXCJyZWxhdGl2ZVwiKSAmJiAoYyA9IGYgKyBjLnN1YnN0cmluZygxKSk7YyA9IGIucmVjb2RlUGF0aChjKTt0aGlzLl9wYXJ0cy5wYXRoID0gYzt0aGlzLmJ1aWxkKCFhKTtyZXR1cm4gdGhpcztcbiAgfTtmLm5vcm1hbGl6ZVBhdGhuYW1lID0gZi5ub3JtYWxpemVQYXRoO2Yubm9ybWFsaXplUXVlcnkgPSBmdW5jdGlvbiAoYSkge1xuICAgIFwic3RyaW5nXCIgPT09IHR5cGVvZiB0aGlzLl9wYXJ0cy5xdWVyeSAmJiAodGhpcy5fcGFydHMucXVlcnkubGVuZ3RoID8gdGhpcy5xdWVyeShiLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpKSA6IHRoaXMuX3BhcnRzLnF1ZXJ5ID0gbnVsbCwgdGhpcy5idWlsZCghYSkpO3JldHVybiB0aGlzO1xuICB9O2Yubm9ybWFsaXplRnJhZ21lbnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHRoaXMuX3BhcnRzLmZyYWdtZW50IHx8ICh0aGlzLl9wYXJ0cy5mcmFnbWVudCA9IG51bGwsIHRoaXMuYnVpbGQoIWEpKTtyZXR1cm4gdGhpcztcbiAgfTtmLm5vcm1hbGl6ZVNlYXJjaCA9IGYubm9ybWFsaXplUXVlcnk7Zi5ub3JtYWxpemVIYXNoID0gZi5ub3JtYWxpemVGcmFnbWVudDtmLmlzbzg4NTkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGEgPSBiLmVuY29kZSxcbiAgICAgICAgYyA9IGIuZGVjb2RlO2IuZW5jb2RlID0gZXNjYXBlO2IuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O3RyeSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBiLmVuY29kZSA9IGEsIGIuZGVjb2RlID0gYztcbiAgICB9cmV0dXJuIHRoaXM7XG4gIH07XG4gIGYudW5pY29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYSA9IGIuZW5jb2RlLFxuICAgICAgICBjID0gYi5kZWNvZGU7Yi5lbmNvZGUgPSBCO2IuZGVjb2RlID0gdW5lc2NhcGU7dHJ5IHtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGIuZW5jb2RlID0gYSwgYi5kZWNvZGUgPSBjO1xuICAgIH1yZXR1cm4gdGhpcztcbiAgfTtmLnJlYWRhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhID0gdGhpcy5jbG9uZSgpO2EudXNlcm5hbWUoXCJcIikucGFzc3dvcmQoXCJcIikubm9ybWFsaXplKCk7dmFyIGMgPSBcIlwiO2EuX3BhcnRzLnByb3RvY29sICYmIChjICs9IGEuX3BhcnRzLnByb3RvY29sICsgXCI6Ly9cIik7YS5fcGFydHMuaG9zdG5hbWUgJiYgKGEuaXMoXCJwdW55Y29kZVwiKSAmJiBlID8gKGMgKz0gZS50b1VuaWNvZGUoYS5fcGFydHMuaG9zdG5hbWUpLCBhLl9wYXJ0cy5wb3J0ICYmIChjICs9IFwiOlwiICsgYS5fcGFydHMucG9ydCkpIDogYyArPSBhLmhvc3QoKSk7YS5fcGFydHMuaG9zdG5hbWUgJiYgYS5fcGFydHMucGF0aCAmJiBcIi9cIiAhPT0gYS5fcGFydHMucGF0aC5jaGFyQXQoMCkgJiYgKGMgKz0gXCIvXCIpO2MgKz0gYS5wYXRoKCEwKTtpZiAoYS5fcGFydHMucXVlcnkpIHtcbiAgICAgIGZvciAodmFyIGQgPSBcIlwiLCBmID0gMCwgayA9IGEuX3BhcnRzLnF1ZXJ5LnNwbGl0KFwiJlwiKSwgZyA9IGsubGVuZ3RoOyBmIDwgZzsgZisrKSB7XG4gICAgICAgIHZhciB1ID0gKGtbZl0gfHwgXCJcIikuc3BsaXQoXCI9XCIpLFxuICAgICAgICAgICAgZCA9IGQgKyAoXCImXCIgKyBiLmRlY29kZVF1ZXJ5KHVbMF0sIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpLnJlcGxhY2UoLyYvZywgXCIlMjZcIikpO3ZvaWQgMCAhPT0gdVsxXSAmJiAoZCArPSBcIj1cIiArIGIuZGVjb2RlUXVlcnkodVsxXSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSkucmVwbGFjZSgvJi9nLCBcIiUyNlwiKSk7XG4gICAgICB9YyArPSBcIj9cIiArIGQuc3Vic3RyaW5nKDEpO1xuICAgIH1yZXR1cm4gYyArPSBiLmRlY29kZVF1ZXJ5KGEuaGFzaCgpLCAhMCk7XG4gIH07Zi5hYnNvbHV0ZVRvID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYyA9IHRoaXMuY2xvbmUoKSxcbiAgICAgICAgZCA9IFtcInByb3RvY29sXCIsIFwidXNlcm5hbWVcIiwgXCJwYXNzd29yZFwiLCBcImhvc3RuYW1lXCIsIFwicG9ydFwiXSxcbiAgICAgICAgZixcbiAgICAgICAgZTtpZiAodGhpcy5fcGFydHMudXJuKSB0aHJvdyBFcnJvcihcIlVSTnMgZG8gbm90IGhhdmUgYW55IGdlbmVyYWxseSBkZWZpbmVkIGhpZXJhcmNoaWNhbCBjb21wb25lbnRzXCIpO1xuICAgIGEgaW5zdGFuY2VvZiBiIHx8IChhID0gbmV3IGIoYSkpO2MuX3BhcnRzLnByb3RvY29sIHx8IChjLl9wYXJ0cy5wcm90b2NvbCA9IGEuX3BhcnRzLnByb3RvY29sKTtpZiAodGhpcy5fcGFydHMuaG9zdG5hbWUpIHJldHVybiBjO2ZvciAoZiA9IDA7IGUgPSBkW2ZdOyBmKyspIGMuX3BhcnRzW2VdID0gYS5fcGFydHNbZV07Yy5fcGFydHMucGF0aCA/IFwiLi5cIiA9PT0gYy5fcGFydHMucGF0aC5zdWJzdHJpbmcoLTIpICYmIChjLl9wYXJ0cy5wYXRoICs9IFwiL1wiKSA6IChjLl9wYXJ0cy5wYXRoID0gYS5fcGFydHMucGF0aCwgYy5fcGFydHMucXVlcnkgfHwgKGMuX3BhcnRzLnF1ZXJ5ID0gYS5fcGFydHMucXVlcnkpKTtcIi9cIiAhPT0gYy5wYXRoKCkuY2hhckF0KDApICYmIChkID0gKGQgPSBhLmRpcmVjdG9yeSgpKSA/IGQgOiAwID09PSBhLnBhdGgoKS5pbmRleE9mKFwiL1wiKSA/IFwiL1wiIDogXCJcIiwgYy5fcGFydHMucGF0aCA9IChkID8gZCArIFwiL1wiIDogXCJcIikgKyBjLl9wYXJ0cy5wYXRoLCBjLm5vcm1hbGl6ZVBhdGgoKSk7Yy5idWlsZCgpO3JldHVybiBjO1xuICB9O2YucmVsYXRpdmVUbyA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGMgPSB0aGlzLmNsb25lKCkubm9ybWFsaXplKCksXG4gICAgICAgIGQsXG4gICAgICAgIGYsXG4gICAgICAgIGU7aWYgKGMuX3BhcnRzLnVybikgdGhyb3cgRXJyb3IoXCJVUk5zIGRvIG5vdCBoYXZlIGFueSBnZW5lcmFsbHkgZGVmaW5lZCBoaWVyYXJjaGljYWwgY29tcG9uZW50c1wiKTthID0gbmV3IGIoYSkubm9ybWFsaXplKCk7ZCA9IGMuX3BhcnRzO2YgPSBhLl9wYXJ0cztlID0gYy5wYXRoKCk7YSA9IGEucGF0aCgpO2lmIChcIi9cIiAhPT0gZS5jaGFyQXQoMCkpIHRocm93IEVycm9yKFwiVVJJIGlzIGFscmVhZHkgcmVsYXRpdmVcIik7aWYgKFwiL1wiICE9PSBhLmNoYXJBdCgwKSkgdGhyb3cgRXJyb3IoXCJDYW5ub3QgY2FsY3VsYXRlIGEgVVJJIHJlbGF0aXZlIHRvIGFub3RoZXIgcmVsYXRpdmUgVVJJXCIpO2QucHJvdG9jb2wgPT09IGYucHJvdG9jb2wgJiYgKGQucHJvdG9jb2wgPSBudWxsKTtpZiAoZC51c2VybmFtZSA9PT0gZi51c2VybmFtZSAmJiBkLnBhc3N3b3JkID09PSBmLnBhc3N3b3JkICYmIG51bGwgPT09IGQucHJvdG9jb2wgJiYgbnVsbCA9PT0gZC51c2VybmFtZSAmJiBudWxsID09PSBkLnBhc3N3b3JkICYmIGQuaG9zdG5hbWUgPT09IGYuaG9zdG5hbWUgJiYgZC5wb3J0ID09PSBmLnBvcnQpIGQuaG9zdG5hbWUgPSBudWxsLCBkLnBvcnQgPSBudWxsO2Vsc2UgcmV0dXJuIGMuYnVpbGQoKTtpZiAoZSA9PT0gYSkgcmV0dXJuIChkLnBhdGggPSBcIlwiLCBjLmJ1aWxkKCkpO2UgPSBiLmNvbW1vblBhdGgoZSwgYSk7aWYgKCFlKSByZXR1cm4gYy5idWlsZCgpO2YgPSBmLnBhdGguc3Vic3RyaW5nKGUubGVuZ3RoKS5yZXBsYWNlKC9bXlxcL10qJC8sIFwiXCIpLnJlcGxhY2UoLy4qP1xcLy9nLCBcIi4uL1wiKTtkLnBhdGggPSBmICsgZC5wYXRoLnN1YnN0cmluZyhlLmxlbmd0aCkgfHwgXCIuL1wiO3JldHVybiBjLmJ1aWxkKCk7XG4gIH07Zi5lcXVhbHMgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBjID0gdGhpcy5jbG9uZSgpO2EgPSBuZXcgYihhKTt2YXIgZCA9IHt9LFxuICAgICAgICBmID0ge30sXG4gICAgICAgIGUgPSB7fSxcbiAgICAgICAgaztjLm5vcm1hbGl6ZSgpO2Eubm9ybWFsaXplKCk7aWYgKGMudG9TdHJpbmcoKSA9PT0gYS50b1N0cmluZygpKSByZXR1cm4gITA7ZCA9IGMucXVlcnkoKTtmID0gYS5xdWVyeSgpO2MucXVlcnkoXCJcIik7YS5xdWVyeShcIlwiKTtpZiAoYy50b1N0cmluZygpICE9PSBhLnRvU3RyaW5nKCkgfHwgZC5sZW5ndGggIT09IGYubGVuZ3RoKSByZXR1cm4gITE7ZCA9IGIucGFyc2VRdWVyeShkLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtmID0gYi5wYXJzZVF1ZXJ5KGYsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO2ZvciAoayBpbiBkKSBpZiAodi5jYWxsKGQsIGspKSB7XG4gICAgICBpZiAoIXcoZFtrXSkpIHtcbiAgICAgICAgaWYgKGRba10gIT09IGZba10pIHJldHVybiAhMTtcbiAgICAgIH0gZWxzZSBpZiAoIUQoZFtrXSwgZltrXSkpIHJldHVybiAhMTtlW2tdID0gITA7XG4gICAgfWZvciAoayBpbiBmKSBpZiAodi5jYWxsKGYsIGspICYmICFlW2tdKSByZXR1cm4gITE7cmV0dXJuICEwO1xuICB9O2YuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKGEpIHtcbiAgICB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSAhIWE7cmV0dXJuIHRoaXM7XG4gIH07Zi5lc2NhcGVRdWVyeVNwYWNlID0gZnVuY3Rpb24gKGEpIHtcbiAgICB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlID0gISFhO3JldHVybiB0aGlzO1xuICB9O3JldHVybiBiO1xufSk7XG4oZnVuY3Rpb24gKGUsIG4pIHtcbiAgXCJvYmplY3RcIiA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IG4ocmVxdWlyZShcIi4vVVJJXCIpKSA6IFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFtcIi4vVVJJXCJdLCBuKSA6IGUuVVJJVGVtcGxhdGUgPSBuKGUuVVJJLCBlKTtcbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKGUsIG4pIHtcbiAgZnVuY3Rpb24gZyhiKSB7XG4gICAgaWYgKGcuX2NhY2hlW2JdKSByZXR1cm4gZy5fY2FjaGVbYl07aWYgKCEodGhpcyBpbnN0YW5jZW9mIGcpKSByZXR1cm4gbmV3IGcoYik7dGhpcy5leHByZXNzaW9uID0gYjtnLl9jYWNoZVtiXSA9IHRoaXM7cmV0dXJuIHRoaXM7XG4gIH1mdW5jdGlvbiBsKGIpIHtcbiAgICB0aGlzLmRhdGEgPSBiO3RoaXMuY2FjaGUgPSB7fTtcbiAgfXZhciBiID0gbiAmJiBuLlVSSVRlbXBsYXRlLFxuICAgICAgaCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgICBBID0gZy5wcm90b3R5cGUsXG4gICAgICB3ID0geyBcIlwiOiB7IHByZWZpeDogXCJcIiwgc2VwYXJhdG9yOiBcIixcIiwgbmFtZWQ6ICExLCBlbXB0eV9uYW1lX3NlcGFyYXRvcjogITEsIGVuY29kZTogXCJlbmNvZGVcIiB9LFxuICAgIFwiK1wiOiB7IHByZWZpeDogXCJcIiwgc2VwYXJhdG9yOiBcIixcIiwgbmFtZWQ6ICExLCBlbXB0eV9uYW1lX3NlcGFyYXRvcjogITEsIGVuY29kZTogXCJlbmNvZGVSZXNlcnZlZFwiIH0sIFwiI1wiOiB7IHByZWZpeDogXCIjXCIsIHNlcGFyYXRvcjogXCIsXCIsIG5hbWVkOiAhMSwgZW1wdHlfbmFtZV9zZXBhcmF0b3I6ICExLCBlbmNvZGU6IFwiZW5jb2RlUmVzZXJ2ZWRcIiB9LCBcIi5cIjogeyBwcmVmaXg6IFwiLlwiLCBzZXBhcmF0b3I6IFwiLlwiLCBuYW1lZDogITEsIGVtcHR5X25hbWVfc2VwYXJhdG9yOiAhMSwgZW5jb2RlOiBcImVuY29kZVwiIH0sIFwiL1wiOiB7IHByZWZpeDogXCIvXCIsIHNlcGFyYXRvcjogXCIvXCIsIG5hbWVkOiAhMSwgZW1wdHlfbmFtZV9zZXBhcmF0b3I6ICExLCBlbmNvZGU6IFwiZW5jb2RlXCIgfSwgXCI7XCI6IHsgcHJlZml4OiBcIjtcIiwgc2VwYXJhdG9yOiBcIjtcIiwgbmFtZWQ6ICEwLCBlbXB0eV9uYW1lX3NlcGFyYXRvcjogITEsIGVuY29kZTogXCJlbmNvZGVcIiB9LCBcIj9cIjogeyBwcmVmaXg6IFwiP1wiLCBzZXBhcmF0b3I6IFwiJlwiLCBuYW1lZDogITAsIGVtcHR5X25hbWVfc2VwYXJhdG9yOiAhMCwgZW5jb2RlOiBcImVuY29kZVwiIH0sIFwiJlwiOiB7IHByZWZpeDogXCImXCIsXG4gICAgICBzZXBhcmF0b3I6IFwiJlwiLCBuYW1lZDogITAsIGVtcHR5X25hbWVfc2VwYXJhdG9yOiAhMCwgZW5jb2RlOiBcImVuY29kZVwiIH0gfTtnLl9jYWNoZSA9IHt9O2cuRVhQUkVTU0lPTl9QQVRURVJOID0gL1xceyhbXmEtekEtWjAtOSVfXT8pKFteXFx9XSspKFxcfXwkKS9nO2cuVkFSSUFCTEVfUEFUVEVSTiA9IC9eKFteKjpdKykoKFxcKil8OihcXGQrKSk/JC87Zy5WQVJJQUJMRV9OQU1FX1BBVFRFUk4gPSAvW15hLXpBLVowLTklX10vO2cuZXhwYW5kID0gZnVuY3Rpb24gKGIsIGUpIHtcbiAgICB2YXIgaCA9IHdbYi5vcGVyYXRvcl0sXG4gICAgICAgIGwgPSBoLm5hbWVkID8gXCJOYW1lZFwiIDogXCJVbm5hbWVkXCIsXG4gICAgICAgIG4gPSBiLnZhcmlhYmxlcyxcbiAgICAgICAgdCA9IFtdLFxuICAgICAgICByLFxuICAgICAgICBwLFxuICAgICAgICBmO2ZvciAoZiA9IDA7IHAgPSBuW2ZdOyBmKyspIHIgPSBlLmdldChwLm5hbWUpLCByLnZhbC5sZW5ndGggPyB0LnB1c2goZ1tcImV4cGFuZFwiICsgbF0ociwgaCwgcC5leHBsb2RlLCBwLmV4cGxvZGUgJiYgaC5zZXBhcmF0b3IgfHwgXCIsXCIsIHAubWF4bGVuZ3RoLCBwLm5hbWUpKSA6IHIudHlwZSAmJiB0LnB1c2goXCJcIik7cmV0dXJuIHQubGVuZ3RoID8gaC5wcmVmaXggKyB0LmpvaW4oaC5zZXBhcmF0b3IpIDogXCJcIjtcbiAgfTtnLmV4cGFuZE5hbWVkID0gZnVuY3Rpb24gKGIsIGcsIGgsIGwsIG4sIHQpIHtcbiAgICB2YXIgciA9IFwiXCIsXG4gICAgICAgIHAgPSBnLmVuY29kZTtnID0gZy5lbXB0eV9uYW1lX3NlcGFyYXRvcjt2YXIgZiA9ICFiW3BdLmxlbmd0aCxcbiAgICAgICAgdiA9IDIgPT09IGIudHlwZSA/IFwiXCIgOiBlW3BdKHQpLFxuICAgICAgICBxLFxuICAgICAgICB4LFxuICAgICAgICB3O3ggPSAwO2ZvciAodyA9IGIudmFsLmxlbmd0aDsgeCA8IHc7IHgrKykgbiA/IChxID0gZVtwXShiLnZhbFt4XVsxXS5zdWJzdHJpbmcoMCwgbikpLCAyID09PSBiLnR5cGUgJiYgKHYgPSBlW3BdKGIudmFsW3hdWzBdLnN1YnN0cmluZygwLCBuKSkpKSA6IGYgPyAocSA9IGVbcF0oYi52YWxbeF1bMV0pLCAyID09PSBiLnR5cGUgPyAodiA9IGVbcF0oYi52YWxbeF1bMF0pLCBiW3BdLnB1c2goW3YsIHFdKSkgOiBiW3BdLnB1c2goW3ZvaWQgMCwgcV0pKSA6IChxID0gYltwXVt4XVsxXSwgMiA9PT0gYi50eXBlICYmICh2ID0gYltwXVt4XVswXSkpLCByICYmIChyICs9IGwpLCBoID8gciArPSB2ICsgKGcgfHwgcSA/IFwiPVwiIDogXCJcIikgKyBxIDogKHggfHwgKHIgKz0gZVtwXSh0KSArIChnIHx8IHEgPyBcIj1cIiA6IFwiXCIpKSwgMiA9PT0gYi50eXBlICYmIChyICs9IHYgKyBcIixcIiksIHIgKz0gcSk7cmV0dXJuIHI7XG4gIH07Zy5leHBhbmRVbm5hbWVkID0gZnVuY3Rpb24gKGIsIGcsIGgsIGwsIG4pIHtcbiAgICB2YXIgdCA9IFwiXCIsXG4gICAgICAgIHIgPSBnLmVuY29kZTtnID0gZy5lbXB0eV9uYW1lX3NlcGFyYXRvcjt2YXIgcCA9ICFiW3JdLmxlbmd0aCxcbiAgICAgICAgZixcbiAgICAgICAgdixcbiAgICAgICAgcSxcbiAgICAgICAgdztxID0gMDtmb3IgKHcgPSBiLnZhbC5sZW5ndGg7IHEgPCB3OyBxKyspIG4gPyB2ID0gZVtyXShiLnZhbFtxXVsxXS5zdWJzdHJpbmcoMCwgbikpIDogcCA/ICh2ID0gZVtyXShiLnZhbFtxXVsxXSksIGJbcl0ucHVzaChbMiA9PT0gYi50eXBlID8gZVtyXShiLnZhbFtxXVswXSkgOiB2b2lkIDAsIHZdKSkgOiB2ID0gYltyXVtxXVsxXSwgdCAmJiAodCArPSBsKSwgMiA9PT0gYi50eXBlICYmIChmID0gbiA/IGVbcl0oYi52YWxbcV1bMF0uc3Vic3RyaW5nKDAsIG4pKSA6IGJbcl1bcV1bMF0sIHQgKz0gZiwgdCA9IGggPyB0ICsgKGcgfHwgdiA/IFwiPVwiIDogXCJcIikgOiB0ICsgXCIsXCIpLCB0ICs9IHY7cmV0dXJuIHQ7XG4gIH07Zy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIG4uVVJJVGVtcGxhdGUgPT09IGcgJiYgKG4uVVJJVGVtcGxhdGUgPSBiKTtyZXR1cm4gZztcbiAgfTtBLmV4cGFuZCA9IGZ1bmN0aW9uIChiKSB7XG4gICAgdmFyIGUgPSBcIlwiO3RoaXMucGFydHMgJiYgdGhpcy5wYXJ0cy5sZW5ndGggfHwgdGhpcy5wYXJzZSgpO1xuICAgIGIgaW5zdGFuY2VvZiBsIHx8IChiID0gbmV3IGwoYikpO2ZvciAodmFyIGggPSAwLCBuID0gdGhpcy5wYXJ0cy5sZW5ndGg7IGggPCBuOyBoKyspIGUgKz0gXCJzdHJpbmdcIiA9PT0gdHlwZW9mIHRoaXMucGFydHNbaF0gPyB0aGlzLnBhcnRzW2hdIDogZy5leHBhbmQodGhpcy5wYXJ0c1toXSwgYik7cmV0dXJuIGU7XG4gIH07QS5wYXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYiA9IHRoaXMuZXhwcmVzc2lvbixcbiAgICAgICAgZSA9IGcuRVhQUkVTU0lPTl9QQVRURVJOLFxuICAgICAgICBoID0gZy5WQVJJQUJMRV9QQVRURVJOLFxuICAgICAgICBuID0gZy5WQVJJQUJMRV9OQU1FX1BBVFRFUk4sXG4gICAgICAgIGwgPSBbXSxcbiAgICAgICAgdCA9IDAsXG4gICAgICAgIHIsXG4gICAgICAgIHAsXG4gICAgICAgIGY7Zm9yIChlLmxhc3RJbmRleCA9IDA7Oykge1xuICAgICAgcCA9IGUuZXhlYyhiKTtpZiAobnVsbCA9PT0gcCkge1xuICAgICAgICBsLnB1c2goYi5zdWJzdHJpbmcodCkpO2JyZWFrO1xuICAgICAgfSBlbHNlIGwucHVzaChiLnN1YnN0cmluZyh0LCBwLmluZGV4KSksIHQgPSBwLmluZGV4ICsgcFswXS5sZW5ndGg7aWYgKCF3W3BbMV1dKSB0aHJvdyBFcnJvcihcIlVua25vd24gT3BlcmF0b3IgXFxcIlwiICsgcFsxXSArIFwiXFxcIiBpbiBcXFwiXCIgKyBwWzBdICsgXCJcXFwiXCIpO2lmICghcFszXSkgdGhyb3cgRXJyb3IoXCJVbmNsb3NlZCBFeHByZXNzaW9uIFxcXCJcIiArIHBbMF0gKyBcIlxcXCJcIik7ciA9IHBbMl0uc3BsaXQoXCIsXCIpO2ZvciAodmFyIHYgPSAwLCBxID0gci5sZW5ndGg7IHYgPCBxOyB2KyspIHtcbiAgICAgICAgZiA9IHJbdl0ubWF0Y2goaCk7aWYgKG51bGwgPT09IGYpIHRocm93IEVycm9yKFwiSW52YWxpZCBWYXJpYWJsZSBcXFwiXCIgKyByW3ZdICsgXCJcXFwiIGluIFxcXCJcIiArIHBbMF0gKyBcIlxcXCJcIik7aWYgKGZbMV0ubWF0Y2gobikpIHRocm93IEVycm9yKFwiSW52YWxpZCBWYXJpYWJsZSBOYW1lIFxcXCJcIiArIGZbMV0gKyBcIlxcXCIgaW4gXFxcIlwiICsgcFswXSArIFwiXFxcIlwiKTtyW3ZdID0geyBuYW1lOiBmWzFdLCBleHBsb2RlOiAhIWZbM10sIG1heGxlbmd0aDogZls0XSAmJiBwYXJzZUludChmWzRdLCAxMCkgfTtcbiAgICAgIH1pZiAoIXIubGVuZ3RoKSB0aHJvdyBFcnJvcihcIkV4cHJlc3Npb24gTWlzc2luZyBWYXJpYWJsZShzKSBcXFwiXCIgKyBwWzBdICsgXCJcXFwiXCIpO2wucHVzaCh7IGV4cHJlc3Npb246IHBbMF0sIG9wZXJhdG9yOiBwWzFdLCB2YXJpYWJsZXM6IHIgfSk7XG4gICAgfWwubGVuZ3RoIHx8IGwucHVzaChiKTt0aGlzLnBhcnRzID0gbDtyZXR1cm4gdGhpcztcbiAgfTtsLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoYikge1xuICAgIHZhciBlID0gdGhpcy5kYXRhLFxuICAgICAgICBnID0geyB0eXBlOiAwLCB2YWw6IFtdLCBlbmNvZGU6IFtdLCBlbmNvZGVSZXNlcnZlZDogW10gfSxcbiAgICAgICAgbDtpZiAodm9pZCAwICE9PSB0aGlzLmNhY2hlW2JdKSByZXR1cm4gdGhpcy5jYWNoZVtiXTt0aGlzLmNhY2hlW2JdID0gZztlID0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiID09PSBTdHJpbmcoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpKSA/IGUoYikgOiBcIltvYmplY3QgRnVuY3Rpb25dXCIgPT09IFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZVtiXSkpID8gZVtiXShiKSA6IGVbYl07aWYgKHZvaWQgMCAhPT0gZSAmJiBudWxsICE9PSBlKSBpZiAoXCJbb2JqZWN0IEFycmF5XVwiID09PSBTdHJpbmcoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGUpKSkge1xuICAgICAgbCA9IDA7Zm9yIChiID0gZS5sZW5ndGg7IGwgPCBiOyBsKyspIHZvaWQgMCAhPT0gZVtsXSAmJiBudWxsICE9PSBlW2xdICYmIGcudmFsLnB1c2goW3ZvaWQgMCwgU3RyaW5nKGVbbF0pXSk7Zy52YWwubGVuZ3RoICYmIChnLnR5cGUgPSAzKTtcbiAgICB9IGVsc2UgaWYgKFwiW29iamVjdCBPYmplY3RdXCIgPT09IFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZSkpKSB7XG4gICAgICBmb3IgKGwgaW4gZSkgaC5jYWxsKGUsIGwpICYmIHZvaWQgMCAhPT0gZVtsXSAmJiBudWxsICE9PSBlW2xdICYmIGcudmFsLnB1c2goW2wsIFN0cmluZyhlW2xdKV0pO2cudmFsLmxlbmd0aCAmJiAoZy50eXBlID0gMik7XG4gICAgfSBlbHNlIGcudHlwZSA9IDEsIGcudmFsLnB1c2goW3ZvaWQgMCwgU3RyaW5nKGUpXSk7cmV0dXJuIGc7XG4gIH07ZS5leHBhbmQgPSBmdW5jdGlvbiAoYiwgaCkge1xuICAgIHZhciBsID0gbmV3IGcoYikuZXhwYW5kKGgpO3JldHVybiBuZXcgZShsKTtcbiAgfTtyZXR1cm4gZztcbn0pOyIsIi8qISBodHRwOi8vbXRocy5iZS9wdW55Y29kZSB2MS4yLjMgYnkgQG1hdGhpYXMgKi9cbid1c2Ugc3RyaWN0JztcblxuOyhmdW5jdGlvbiAocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG4gICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuICAqIEBuYW1lIHB1bnljb2RlXG4gICogQHR5cGUgT2JqZWN0XG4gICovXG5cdHZhciBwdW55Y29kZSxcblx0ICAgXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LFxuXHQgICAgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHQgICAgdE1pbiA9IDEsXG5cdCAgICB0TWF4ID0gMjYsXG5cdCAgICBza2V3ID0gMzgsXG5cdCAgICBkYW1wID0gNzAwLFxuXHQgICAgaW5pdGlhbEJpYXMgPSA3Mixcblx0ICAgIGluaXRpYWxOID0gMTI4LFxuXHQgICAgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsXG5cdCAgICAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdCAgICByZWdleE5vbkFTQ0lJID0gL1teIC1+XS8sXG5cdCAgICAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvXFx4MkV8XFx1MzAwMnxcXHVGRjBFfFxcdUZGNjEvZyxcblx0ICAgIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXHQgICBcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0ICAgIGZsb29yID0gTWF0aC5mbG9vcixcblx0ICAgIHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cdCAgIFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuICAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuICAqIEBwcml2YXRlXG4gICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG4gICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuICAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG4gICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuICAqIGl0ZW0uXG4gICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdGFycmF5W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFycmF5O1xuXHR9XG5cblx0LyoqXG4gICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzLlxuICAqIEBwcml2YXRlXG4gICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUuXG4gICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG4gICogY2hhcmFjdGVyLlxuICAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG4gICogZnVuY3Rpb24uXG4gICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0cmV0dXJuIG1hcChzdHJpbmcuc3BsaXQocmVnZXhTZXBhcmF0b3JzKSwgZm4pLmpvaW4oJy4nKTtcblx0fVxuXG5cdC8qKlxuICAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcbiAgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG4gICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcbiAgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcbiAgKiBtYXRjaGluZyBVVEYtMTYuXG4gICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG4gICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuICAqIEBuYW1lIGRlY29kZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG4gICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuICAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHtcblx0XHRcdFx0XHQvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuICAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cbiAgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcbiAgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuICAqIEBuYW1lIGVuY29kZVxuICAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG4gICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuICAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuICAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cbiAgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cbiAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cbiAgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG4gICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG4gICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuICAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cbiAgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG4gICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3JcbiAgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuICAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuICAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG4gICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cbiAgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG4gICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cbiAgKiBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG4gICogQHByaXZhdGVcbiAgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuICAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG4gICogc3ltYm9scy5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG4gICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuICAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgbGVuZ3RoLFxuXHRcdCAgIFxuXHRcdC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7KSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTs7IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiBrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcbiAgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgdG8gYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seVxuICAqIHN5bWJvbHMuXG4gICogQG1lbWJlck9mIHB1bnljb2RlXG4gICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cbiAgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgXG5cdFx0LyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHRpbnB1dExlbmd0aCxcblx0XHQgICBcblx0XHQvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7OyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcztcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSkpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG4gICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgdG8gVW5pY29kZS4gT25seSB0aGVcbiAgKiBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLCBpLmUuIGl0IGRvZXNuJ3RcbiAgKiBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNvbnZlcnRlZCB0b1xuICAqIFVuaWNvZGUuXG4gICogQG1lbWJlck9mIHB1bnljb2RlXG4gICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgUHVueWNvZGUgZG9tYWluIG5hbWUgdG8gY29udmVydCB0byBVbmljb2RlLlxuICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuICAqIHN0cmluZy5cbiAgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGRvbWFpbikge1xuXHRcdHJldHVybiBtYXBEb21haW4oZG9tYWluLCBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZykgPyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpIDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG4gICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSB0byBQdW55Y29kZS4gT25seSB0aGVcbiAgKiBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLCBpLmUuIGl0IGRvZXNuJ3RcbiAgKiBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpbiBBU0NJSS5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSB0byBjb252ZXJ0LCBhcyBhIFVuaWNvZGUgc3RyaW5nLlxuICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUuXG4gICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoZG9tYWluKSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihkb21haW4sIGZ1bmN0aW9uIChzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKSA/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpIDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcbiAgICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuICAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgICogQHR5cGUgU3RyaW5nXG4gICAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuMi4zJyxcblx0XHQvKipcbiAgICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcbiAgICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cbiAgICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cbiAgICogQG1lbWJlck9mIHB1bnljb2RlXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cbn0pKHVuZGVmaW5lZCk7XG4vKiBubyBpbml0aWFsaXphdGlvbiAqLyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovIC8qIG5vIGNvbmRpdGlvbiAqLyAvKiBubyBjb25kaXRpb24gKi8iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfZ2xvYmFsQ29udGV4dCA9IHJlcXVpcmUoJy4vZ2xvYmFsLWNvbnRleHQnKTtcblxudmFyIF9nbG9iYWxDb250ZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2dsb2JhbENvbnRleHQpO1xuXG4vKlxuKiBUaGlzIGRlbGF5IGFsbG93cyB0aGUgdGhyZWFkIHRvIGZpbmlzaCBhc3NpZ25pbmcgaXRzIG9uKiBtZXRob2RzXG4qIGJlZm9yZSBpbnZva2luZyB0aGUgZGVsYXkgY2FsbGJhY2suIFRoaXMgaXMgcHVyZWx5IGEgdGltaW5nIGhhY2suXG4qIGh0dHA6Ly9nZWVrYWJ5dGUuYmxvZ3Nwb3QuY29tLzIwMTQvMDEvamF2YXNjcmlwdC1lZmZlY3Qtb2Ytc2V0dGluZy1zZXR0aW1lb3V0Lmh0bWxcbipcbiogQHBhcmFtIHtjYWxsYmFjazogZnVuY3Rpb259IHRoZSBjYWxsYmFjayB3aGljaCB3aWxsIGJlIGludm9rZWQgYWZ0ZXIgdGhlIHRpbWVvdXRcbiogQHBhcm1hIHtjb250ZXh0OiBvYmplY3R9IHRoZSBjb250ZXh0IGluIHdoaWNoIHRvIGludm9rZSB0aGUgZnVuY3Rpb25cbiovXG5mdW5jdGlvbiBkZWxheShjYWxsYmFjaywgY29udGV4dCkge1xuICBfZ2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5zZXRUaW1lb3V0KGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgY2FsbGJhY2suY2FsbChjb250ZXh0KTtcbiAgfSwgNCwgY29udGV4dCk7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGRlbGF5O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLypcbiogRGV0ZXJtaW5lcyB0aGUgZ2xvYmFsIGNvbnRleHQuIFRoaXMgc2hvdWxkIGJlIGVpdGhlciB3aW5kb3cgKGluIHRoZSlcbiogY2FzZSB3aGVyZSB3ZSBhcmUgaW4gYSBicm93c2VyKSBvciBnbG9iYWwgKGluIHRoZSBjYXNlIHdoZXJlIHdlIGFyZSBpblxuKiBub2RlKVxuKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBnbG9iYWxDb250ZXh0O1xuXG5pZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBnbG9iYWxDb250ZXh0ID0gZ2xvYmFsO1xufSBlbHNlIHtcbiAgICBnbG9iYWxDb250ZXh0ID0gd2luZG93O1xufVxuXG5pZiAoIWdsb2JhbENvbnRleHQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBzZXQgdGhlIGdsb2JhbCBjb250ZXh0IHRvIGVpdGhlciB3aW5kb3cgb3IgZ2xvYmFsLicpO1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSBnbG9iYWxDb250ZXh0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLypcbiogVGhpcyBpcyBhIG1vY2sgd2Vic29ja2V0IGV2ZW50IG1lc3NhZ2UgdGhhdCBpcyBwYXNzZWQgaW50byB0aGUgb25vcGVuLFxuKiBvcG1lc3NhZ2UsIGV0YyBmdW5jdGlvbnMuXG4qXG4qIEBwYXJhbSB7bmFtZTogc3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgZXZlbnRcbiogQHBhcmFtIHtkYXRhOiAqfSBUaGUgZGF0YSB0byBzZW5kLlxuKiBAcGFyYW0ge29yaWdpbjogc3RyaW5nfSBUaGUgdXJsIG9mIHRoZSBwbGFjZSB3aGVyZSB0aGUgZXZlbnQgaXMgb3JpZ2luYXRpbmcuXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIHNvY2tldEV2ZW50TWVzc2FnZShuYW1lLCBkYXRhLCBvcmlnaW4pIHtcblx0dmFyIHBvcnRzID0gbnVsbDtcblx0dmFyIHNvdXJjZSA9IG51bGw7XG5cdHZhciBidWJibGVzID0gZmFsc2U7XG5cdHZhciBjYW5jZWxhYmxlID0gZmFsc2U7XG5cdHZhciBsYXN0RXZlbnRJZCA9ICcnO1xuXHR2YXIgdGFyZ2V0UGxhY2Vob2xkID0gbnVsbDtcblx0dmFyIG1lc3NhZ2VFdmVudDtcblxuXHR0cnkge1xuXHRcdG1lc3NhZ2VFdmVudCA9IG5ldyBNZXNzYWdlRXZlbnQobmFtZSk7XG5cdFx0bWVzc2FnZUV2ZW50LmluaXRNZXNzYWdlRXZlbnQobmFtZSwgYnViYmxlcywgY2FuY2VsYWJsZSwgZGF0YSwgb3JpZ2luLCBsYXN0RXZlbnRJZCk7XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhtZXNzYWdlRXZlbnQsIHtcblx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGFyZ2V0UGxhY2Vob2xkO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuXHRcdFx0XHRcdHRhcmdldFBsYWNlaG9sZCA9IHZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0c3JjRWxlbWVudDoge1xuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50YXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRjdXJyZW50VGFyZ2V0OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gV2UgYXJlIHVuYWJsZSB0byBjcmVhdGUgYSBNZXNzYWdlRXZlbnQgT2JqZWN0LiBUaGlzIHNob3VsZCBvbmx5IGJlIGhhcHBlbmluZyBpbiBQaGFudG9tSlMuXG5cdFx0bWVzc2FnZUV2ZW50ID0ge1xuXHRcdFx0dHlwZTogbmFtZSxcblx0XHRcdGJ1YmJsZXM6IGJ1YmJsZXMsXG5cdFx0XHRjYW5jZWxhYmxlOiBjYW5jZWxhYmxlLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdG9yaWdpbjogb3JpZ2luLFxuXHRcdFx0bGFzdEV2ZW50SWQ6IGxhc3RFdmVudElkLFxuXHRcdFx0c291cmNlOiBzb3VyY2UsXG5cdFx0XHRwb3J0czogcG9ydHMsXG5cdFx0XHRkZWZhdWx0UHJldmVudGVkOiBmYWxzZSxcblx0XHRcdHJldHVyblZhbHVlOiB0cnVlLFxuXHRcdFx0Y2xpcGJvYXJkRGF0YTogdW5kZWZpbmVkXG5cdFx0fTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG1lc3NhZ2VFdmVudCwge1xuXHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0YXJnZXRQbGFjZWhvbGQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG5cdFx0XHRcdFx0dGFyZ2V0UGxhY2Vob2xkID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRzcmNFbGVtZW50OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRUYXJnZXQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4gbWVzc2FnZUV2ZW50O1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSBzb2NrZXRFdmVudE1lc3NhZ2U7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfVVJJTWluSnMgPSByZXF1aXJlKCcuLi8uLi9VUkkubWluLmpzJyk7XG5cbnZhciBfVVJJTWluSnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVVJJTWluSnMpO1xuXG4vKlxuKiBUaGUgbmF0aXZlIHdlYnNvY2tldCBvYmplY3Qgd2lsbCB0cmFuc2Zvcm0gdXJscyB3aXRob3V0IGEgcGF0aG5hbWUgdG8gaGF2ZSBqdXN0IGEgLy5cbiogQXMgYW4gZXhhbXBsZTogd3M6Ly9sb2NhbGhvc3Q6ODA4MCB3b3VsZCBhY3R1YWxseSBiZSB3czovL2xvY2FsaG9zdDo4MDgwLyBidXQgd3M6Ly9leGFtcGxlLmNvbS9mb28gd291bGQgbm90XG4qIGNoYW5nZS4gVGhpcyBmdW5jdGlvbiBkb2VzIHRoaXMgdHJhbnNmb3JtYXRpb24gdG8gc3RheSBpbmxpbmUgd2l0aCB0aGUgbmF0aXZlIHdlYnNvY2tldCBpbXBsZW1lbnRhdGlvbi5cbipcbiogQHBhcmFtIHt1cmw6IHN0cmluZ30gVGhlIHVybCB0byB0cmFuc2Zvcm0uXG4qL1xuZnVuY3Rpb24gdXJsVHJhbnNmb3JtKHVybCkge1xuICB2YXIgbm9ybWFsaXplZFVSTCA9ICgwLCBfVVJJTWluSnMyWydkZWZhdWx0J10pKHVybCkudG9TdHJpbmcoKTtcbiAgcmV0dXJuIG5vcm1hbGl6ZWRVUkw7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHVybFRyYW5zZm9ybTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIi8qXG4qIFRoaXMgZGVmaW5lcyBmb3VyIG1ldGhvZHM6IG9ub3Blbiwgb25tZXNzYWdlLCBvbmVycm9yLCBhbmQgb25jbG9zZS4gVGhpcyBpcyBkb25lIHRoaXMgd2F5IGluc3RlYWQgb2ZcbioganVzdCBwbGFjaW5nIHRoZSBtZXRob2RzIG9uIHRoZSBwcm90b3R5cGUgYmVjYXVzZSB3ZSBuZWVkIHRvIGNhcHR1cmUgdGhlIGNhbGxiYWNrIHdoZW4gaXQgaXMgZGVmaW5lZCBsaWtlIHNvOlxuKlxuKiBtb2NrU29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCkgeyAvLyB0aGlzIGlzIHdoYXQgd2UgbmVlZCB0byBzdG9yZSB9O1xuKlxuKiBUaGUgb25seSB3YXkgaXMgdG8gY2FwdHVyZSB0aGUgY2FsbGJhY2sgdmlhIHRoZSBjdXN0b20gc2V0dGVyIGJlbG93IGFuZCB0aGVuIHBsYWNlIHRoZW0gaW50byB0aGUgY29ycmVjdFxuKiBuYW1lc3BhY2Ugc28gdGhleSBnZXQgaW52b2tlZCBhdCB0aGUgcmlnaHQgdGltZS5cbipcbiogQHBhcmFtIHt3ZWJzb2NrZXQ6IG9iamVjdH0gVGhlIHdlYnNvY2tldCBvYmplY3Qgd2hpY2ggd2Ugd2FudCB0byBkZWZpbmUgdGhlc2UgcHJvcGVydGllcyBvbnRvXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIHdlYlNvY2tldFByb3BlcnRpZXMod2Vic29ja2V0KSB7XG4gIHZhciBldmVudE1lc3NhZ2VTb3VyY2UgPSBmdW5jdGlvbiBldmVudE1lc3NhZ2VTb3VyY2UoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBldmVudC50YXJnZXQgPSB3ZWJzb2NrZXQ7XG4gICAgICBjYWxsYmFjay5hcHBseSh3ZWJzb2NrZXQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh3ZWJzb2NrZXQsIHtcbiAgICBvbm9wZW46IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29ub3BlbjtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLl9vbm9wZW4gPSBldmVudE1lc3NhZ2VTb3VyY2UoY2FsbGJhY2spO1xuICAgICAgICB0aGlzLnNlcnZpY2Uuc2V0Q2FsbGJhY2tPYnNlcnZlcignY2xpZW50T25PcGVuJywgdGhpcy5fb25vcGVuLCB3ZWJzb2NrZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb25tZXNzYWdlOiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vbm1lc3NhZ2U7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fb25tZXNzYWdlID0gZXZlbnRNZXNzYWdlU291cmNlKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5zZXJ2aWNlLnNldENhbGxiYWNrT2JzZXJ2ZXIoJ2NsaWVudE9uTWVzc2FnZScsIHRoaXMuX29ubWVzc2FnZSwgd2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uY2xvc2U6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29uY2xvc2U7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fb25jbG9zZSA9IGV2ZW50TWVzc2FnZVNvdXJjZShjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKCdjbGllbnRPbmNsb3NlJywgdGhpcy5fb25jbG9zZSwgd2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9uZXJyb3I6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29uZXJyb3I7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5fb25lcnJvciA9IGV2ZW50TWVzc2FnZVNvdXJjZShjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKCdjbGllbnRPbkVycm9yJywgdGhpcy5fb25lcnJvciwgd2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSB3ZWJTb2NrZXRQcm9wZXJ0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfc2VydmljZSA9IHJlcXVpcmUoJy4vc2VydmljZScpO1xuXG52YXIgX3NlcnZpY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2VydmljZSk7XG5cbnZhciBfbW9ja1NlcnZlciA9IHJlcXVpcmUoJy4vbW9jay1zZXJ2ZXInKTtcblxudmFyIF9tb2NrU2VydmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21vY2tTZXJ2ZXIpO1xuXG52YXIgX21vY2tTb2NrZXQgPSByZXF1aXJlKCcuL21vY2stc29ja2V0Jyk7XG5cbnZhciBfbW9ja1NvY2tldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tb2NrU29ja2V0KTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dCA9IHJlcXVpcmUoJy4vaGVscGVycy9nbG9iYWwtY29udGV4dCcpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNHbG9iYWxDb250ZXh0KTtcblxuX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLlNvY2tldFNlcnZpY2UgPSBfc2VydmljZTJbJ2RlZmF1bHQnXTtcbl9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0ID0gX21vY2tTb2NrZXQyWydkZWZhdWx0J107XG5faGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NlcnZlciA9IF9tb2NrU2VydmVyMlsnZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9zZXJ2aWNlID0gcmVxdWlyZSgnLi9zZXJ2aWNlJyk7XG5cbnZhciBfc2VydmljZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zZXJ2aWNlKTtcblxudmFyIF9oZWxwZXJzRGVsYXkgPSByZXF1aXJlKCcuL2hlbHBlcnMvZGVsYXknKTtcblxudmFyIF9oZWxwZXJzRGVsYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0RlbGF5KTtcblxudmFyIF9oZWxwZXJzVXJsVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9oZWxwZXJzL3VybC10cmFuc2Zvcm0nKTtcblxudmFyIF9oZWxwZXJzVXJsVHJhbnNmb3JtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNVcmxUcmFuc2Zvcm0pO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQgPSByZXF1aXJlKCcuL2hlbHBlcnMvbWVzc2FnZS1ldmVudCcpO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc01lc3NhZ2VFdmVudCk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2xvYmFsLWNvbnRleHQnKTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzR2xvYmFsQ29udGV4dCk7XG5cbmZ1bmN0aW9uIE1vY2tTZXJ2ZXIodXJsKSB7XG4gIHZhciBzZXJ2aWNlID0gbmV3IF9zZXJ2aWNlMlsnZGVmYXVsdCddKCk7XG4gIHRoaXMudXJsID0gKDAsIF9oZWxwZXJzVXJsVHJhbnNmb3JtMlsnZGVmYXVsdCddKSh1cmwpO1xuXG4gIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LnNlcnZpY2VzW3RoaXMudXJsXSA9IHNlcnZpY2U7XG5cbiAgdGhpcy5zZXJ2aWNlID0gc2VydmljZTtcbiAgLy8gaWdub3JlIHBvc3NpYmxlIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgaWYgKHVybC5pbmRleE9mKE1vY2tTZXJ2ZXIudW5yZXNvbHZhYmxlVVJMKSA9PT0gLTEpIHtcbiAgICBzZXJ2aWNlLnNlcnZlciA9IHRoaXM7XG4gIH1cbn1cblxuLypcbiogVGhpcyBVUkwgY2FuIGJlIHVzZWQgdG8gZW11bGF0ZSBzZXJ2ZXIgdGhhdCBkb2VzIG5vdCBlc3RhYmxpc2ggY29ubmVjdGlvblxuKi9cbk1vY2tTZXJ2ZXIudW5yZXNvbHZhYmxlVVJMID0gJ3dzOi8vdW5yZXNvbHZhYmxlX3VybCc7XG5cbk1vY2tTZXJ2ZXIucHJvdG90eXBlID0ge1xuICBzZXJ2aWNlOiBudWxsLFxuXG4gIC8qXG4gICogVGhpcyBpcyB0aGUgbWFpbiBmdW5jdGlvbiBmb3IgdGhlIG1vY2sgc2VydmVyIHRvIHN1YnNjcmliZSB0byB0aGUgb24gZXZlbnRzLlxuICAqXG4gICogaWU6IG1vY2tTZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ2EgbW9jayBjbGllbnQgY29ubmVjdGVkJyk7IH0pO1xuICAqXG4gICogQHBhcmFtIHt0eXBlOiBzdHJpbmd9OiBUaGUgZXZlbnQga2V5IHRvIHN1YnNjcmliZSB0by4gVmFsaWQga2V5cyBhcmU6IGNvbm5lY3Rpb24sIG1lc3NhZ2UsIGFuZCBjbG9zZS5cbiAgKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn06IFRoZSBjYWxsYmFjayB3aGljaCBzaG91bGQgYmUgY2FsbGVkIHdoZW4gYSBjZXJ0YWluIGV2ZW50IGlzIGZpcmVkLlxuICAqL1xuICBvbjogZnVuY3Rpb24gb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgb2JzZXJ2ZXJLZXk7XG5cbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnY29ubmVjdGlvbic6XG4gICAgICAgIG9ic2VydmVyS2V5ID0gJ2NsaWVudEhhc0pvaW5lZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICAgIG9ic2VydmVyS2V5ID0gJ2NsaWVudEhhc1NlbnRNZXNzYWdlJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgIG9ic2VydmVyS2V5ID0gJ2NsaWVudEhhc0xlZnQnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgb2JzZXJ2ZXJLZXkgaXMgdmFsaWQgYmVmb3JlIG9ic2VydmluZyBvbiBpdC5cbiAgICBpZiAodHlwZW9mIG9ic2VydmVyS2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5zZXJ2aWNlLmNsZWFyQWxsKG9ic2VydmVyS2V5KTtcbiAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKG9ic2VydmVyS2V5LCBjYWxsYmFjaywgdGhpcyk7XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogVGhpcyBzZW5kIGZ1bmN0aW9uIHdpbGwgbm90aWZ5IGFsbCBtb2NrIGNsaWVudHMgdmlhIHRoZWlyIG9ubWVzc2FnZSBjYWxsYmFja3MgdGhhdCB0aGUgc2VydmVyXG4gICogaGFzIGEgbWVzc2FnZSBmb3IgdGhlbS5cbiAgKlxuICAqIEBwYXJhbSB7ZGF0YTogKn06IEFueSBqYXZhc2NyaXB0IG9iamVjdCB3aGljaCB3aWxsIGJlIGNyYWZ0ZWQgaW50byBhIE1lc3NhZ2VPYmplY3QuXG4gICovXG4gIHNlbmQ6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2Uuc2VuZE1lc3NhZ2VUb0NsaWVudHMoKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnbWVzc2FnZScsIGRhdGEsIHRoaXMudXJsKSk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZmllcyBhbGwgbW9jayBjbGllbnRzIHRoYXQgdGhlIHNlcnZlciBpcyBjbG9zaW5nIGFuZCB0aGVpciBvbmNsb3NlIGNhbGxiYWNrcyBzaG91bGQgZmlyZS5cbiAgKi9cbiAgY2xvc2U6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2UuY2xvc2VDb25uZWN0aW9uRnJvbVNlcnZlcigoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdjbG9zZScsIG51bGwsIHRoaXMudXJsKSk7XG4gICAgfSwgdGhpcyk7XG4gIH1cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1vY2tTZXJ2ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfaGVscGVyc0RlbGF5ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2RlbGF5Jyk7XG5cbnZhciBfaGVscGVyc0RlbGF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNEZWxheSk7XG5cbnZhciBfaGVscGVyc1VybFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vaGVscGVycy91cmwtdHJhbnNmb3JtJyk7XG5cbnZhciBfaGVscGVyc1VybFRyYW5zZm9ybTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzVXJsVHJhbnNmb3JtKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50ID0gcmVxdWlyZSgnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNNZXNzYWdlRXZlbnQpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2dsb2JhbC1jb250ZXh0Jyk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0dsb2JhbENvbnRleHQpO1xuXG52YXIgX2hlbHBlcnNXZWJzb2NrZXRQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL3dlYnNvY2tldC1wcm9wZXJ0aWVzJyk7XG5cbnZhciBfaGVscGVyc1dlYnNvY2tldFByb3BlcnRpZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc1dlYnNvY2tldFByb3BlcnRpZXMpO1xuXG5mdW5jdGlvbiBNb2NrU29ja2V0KHVybCkge1xuICB0aGlzLmJpbmFyeVR5cGUgPSAnYmxvYic7XG4gIHRoaXMudXJsID0gKDAsIF9oZWxwZXJzVXJsVHJhbnNmb3JtMlsnZGVmYXVsdCddKSh1cmwpO1xuICB0aGlzLnJlYWR5U3RhdGUgPSBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DT05ORUNUSU5HO1xuICB0aGlzLnNlcnZpY2UgPSBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5zZXJ2aWNlc1t0aGlzLnVybF07XG5cbiAgdGhpcy5fZXZlbnRIYW5kbGVycyA9IHt9O1xuXG4gICgwLCBfaGVscGVyc1dlYnNvY2tldFByb3BlcnRpZXMyWydkZWZhdWx0J10pKHRoaXMpO1xuXG4gICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgLy8gTGV0IHRoZSBzZXJ2aWNlIGtub3cgdGhhdCB3ZSBhcmUgYm90aCByZWFkeSB0byBjaGFuZ2Ugb3VyIHJlYWR5IHN0YXRlIGFuZCB0aGF0XG4gICAgLy8gdGhpcyBjbGllbnQgaXMgY29ubmVjdGluZyB0byB0aGUgbW9jayBzZXJ2ZXIuXG4gICAgdGhpcy5zZXJ2aWNlLmNsaWVudElzQ29ubmVjdGluZyh0aGlzLCB0aGlzLl91cGRhdGVSZWFkeVN0YXRlKTtcbiAgfSwgdGhpcyk7XG59XG5cbk1vY2tTb2NrZXQuQ09OTkVDVElORyA9IDA7XG5Nb2NrU29ja2V0Lk9QRU4gPSAxO1xuTW9ja1NvY2tldC5DTE9TSU5HID0gMjtcbk1vY2tTb2NrZXQuQ0xPU0VEID0gMztcbk1vY2tTb2NrZXQuc2VydmljZXMgPSB7fTtcblxuTW9ja1NvY2tldC5wcm90b3R5cGUgPSB7XG5cbiAgLypcbiAgKiBIb2xkcyB0aGUgb24qKiogY2FsbGJhY2sgZnVuY3Rpb25zLiBUaGVzZSBhcmUgcmVhbGx5IGp1c3QgZm9yIHRoZSBjdXN0b21cbiAgKiBnZXR0ZXJzIHRoYXQgYXJlIGRlZmluZWQgaW4gdGhlIGhlbHBlcnMvd2Vic29ja2V0LXByb3BlcnRpZXMuIEFjY2Vzc2luZyB0aGVzZSBwcm9wZXJ0aWVzIGlzIG5vdCBhZHZpc2VkLlxuICAqL1xuICBfb25vcGVuOiBudWxsLFxuICBfb25tZXNzYWdlOiBudWxsLFxuICBfb25lcnJvcjogbnVsbCxcbiAgX29uY2xvc2U6IG51bGwsXG5cbiAgLypcbiAgKiBUaGlzIGhvbGRzIHJlZmVyZW5jZSB0byB0aGUgc2VydmljZSBvYmplY3QuIFRoZSBzZXJ2aWNlIG9iamVjdCBpcyBob3cgd2UgY2FuXG4gICogY29tbXVuaWNhdGUgd2l0aCB0aGUgYmFja2VuZCB2aWEgdGhlIHB1Yi9zdWIgbW9kZWwuXG4gICpcbiAgKiBUaGUgc2VydmljZSBoYXMgcHJvcGVydGllcyB3aGljaCB3ZSBjYW4gdXNlIHRvIG9ic2VydmUgb3Igbm90aWZpeSB3aXRoLlxuICAqIHRoaXMuc2VydmljZS5ub3RpZnkoJ2ZvbycpICYgdGhpcy5zZXJ2aWNlLm9ic2VydmUoJ2ZvbycsIGNhbGxiYWNrLCBjb250ZXh0KVxuICAqL1xuICBzZXJ2aWNlOiBudWxsLFxuXG4gIC8qXG4gICogSW50ZXJuYWwgc3RvcmFnZSBmb3IgZXZlbnQgaGFuZGxlcnMuIEJhc2ljYWxseSwgdGhlcmUgY291bGQgYmUgbW9yZSB0aGFuIG9uZVxuICAqIGhhbmRsZXIgcGVyIGV2ZW50IHNvIHdlIHN0b3JlIHRoZW0gYWxsIGluIGFycmF5LlxuICAqL1xuICBfZXZlbnRIYW5kbGVyczoge30sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgbW9jayBmb3IgRXZlbnRUYXJnZXQncyBhZGRFdmVudExpc3RlbmVyIG1ldGhvZC4gQSBiaXQgbmFpdmUgYW5kXG4gICogZG9lc24ndCBpbXBsZW1lbnQgdGhpcmQgdXNlQ2FwdHVyZSBwYXJhbWV0ZXIgYnV0IHNob3VsZCBiZSBlbm91Z2ggZm9yIG1vc3RcbiAgKiAoaWYgbm90IGFsbCkgY2FzZXMuXG4gICpcbiAgKiBAcGFyYW0ge2V2ZW50OiBzdHJpbmd9OiBFdmVudCBuYW1lLlxuICAqIEBwYXJhbSB7aGFuZGxlcjogZnVuY3Rpb259OiBBbnkgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGV2ZW50IGhhbmRsaW5nLlxuICAqL1xuICBhZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkge1xuICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0gPSBbXTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXNbJ29uJyArIGV2ZW50XSA9IGZ1bmN0aW9uIChldmVudE9iamVjdCkge1xuICAgICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoZXZlbnRPYmplY3QpO1xuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0ucHVzaChoYW5kbGVyKTtcbiAgfSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBtb2NrIGZvciBFdmVudFRhcmdldCdzIHJlbW92ZUV2ZW50TGlzdGVuZXIgbWV0aG9kLiBBIGJpdCBuYWl2ZSBhbmRcbiAgKiBkb2Vzbid0IGltcGxlbWVudCB0aGlyZCB1c2VDYXB0dXJlIHBhcmFtZXRlciBidXQgc2hvdWxkIGJlIGVub3VnaCBmb3IgbW9zdFxuICAqIChpZiBub3QgYWxsKSBjYXNlcy5cbiAgKlxuICAqIEBwYXJhbSB7ZXZlbnQ6IHN0cmluZ306IEV2ZW50IG5hbWUuXG4gICogQHBhcmFtIHtoYW5kbGVyOiBmdW5jdGlvbn06IEFueSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZXZlbnQgaGFuZGxpbmcuIFNob3VsZFxuICAqIGJlIG9uZSBvZiB0aGUgZnVuY3Rpb25zIHVzZWQgaW4gdGhlIHByZXZpb3VzIGNhbGxzIG9mIGFkZEV2ZW50TGlzdGVuZXIgbWV0aG9kLlxuICAqL1xuICByZW1vdmVFdmVudExpc3RlbmVyOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XTtcbiAgICBoYW5kbGVycy5zcGxpY2UoaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKSwgMSk7XG4gICAgaWYgKCFoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XTtcbiAgICAgIGRlbGV0ZSB0aGlzWydvbicgKyBldmVudF07XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIG1vY2sgZm9yIEV2ZW50VGFyZ2V0J3MgZGlzcGF0Y2hFdmVudCBtZXRob2QuXG4gICpcbiAgKiBAcGFyYW0ge2V2ZW50OiBNZXNzYWdlRXZlbnR9OiBTb21lIGV2ZW50LCBlaXRoZXIgbmF0aXZlIE1lc3NhZ2VFdmVudCBvciBhbiBvYmplY3RcbiAgKiByZXR1cm5lZCBieSByZXF1aXJlKCcuL2hlbHBlcnMvbWVzc2FnZS1ldmVudCcpXG4gICovXG4gIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50LnR5cGVdO1xuICAgIGlmICghaGFuZGxlcnMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYW5kbGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaGFuZGxlcnNbaV0uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIG1vY2sgZm9yIHRoZSBuYXRpdmUgc2VuZCBmdW5jdGlvbiBmb3VuZCBvbiB0aGUgV2ViU29ja2V0IG9iamVjdC4gSXQgbm90aWZpZXMgdGhlXG4gICogc2VydmljZSB0aGF0IGl0IGhhcyBzZW50IGEgbWVzc2FnZS5cbiAgKlxuICAqIEBwYXJhbSB7ZGF0YTogKn06IEFueSBqYXZhc2NyaXB0IG9iamVjdCB3aGljaCB3aWxsIGJlIGNyYWZ0ZWQgaW50byBhIE1lc3NhZ2VPYmplY3QuXG4gICovXG4gIHNlbmQ6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2Uuc2VuZE1lc3NhZ2VUb1NlcnZlcigoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdtZXNzYWdlJywgZGF0YSwgdGhpcy51cmwpKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBtb2NrIGZvciB0aGUgbmF0aXZlIGNsb3NlIGZ1bmN0aW9uIGZvdW5kIG9uIHRoZSBXZWJTb2NrZXQgb2JqZWN0LiBJdCBub3RpZmllcyB0aGVcbiAgKiBzZXJ2aWNlIHRoYXQgaXQgaXMgY2xvc2luZyB0aGUgY29ubmVjdGlvbi5cbiAgKi9cbiAgY2xvc2U6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNlcnZpY2UuY2xvc2VDb25uZWN0aW9uRnJvbUNsaWVudCgoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdjbG9zZScsIG51bGwsIHRoaXMudXJsKSwgdGhpcyk7XG4gICAgfSwgdGhpcyk7XG4gIH0sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgcHJpdmF0ZSBtZXRob2QgdGhhdCBjYW4gYmUgdXNlZCB0byBjaGFuZ2UgdGhlIHJlYWR5U3RhdGUuIFRoaXMgaXMgdXNlZFxuICAqIGxpa2UgdGhpczogdGhpcy5wcm90b2NvbC5zdWJqZWN0Lm9ic2VydmUoJ3VwZGF0ZVJlYWR5U3RhdGUnLCB0aGlzLl91cGRhdGVSZWFkeVN0YXRlLCB0aGlzKTtcbiAgKiBzbyB0aGF0IHRoZSBzZXJ2aWNlIGFuZCB0aGUgc2VydmVyIGNhbiBjaGFuZ2UgdGhlIHJlYWR5U3RhdGUgc2ltcGx5IGJlIG5vdGlmaW5nIGEgbmFtZXNwYWNlLlxuICAqXG4gICogQHBhcmFtIHtuZXdSZWFkeVN0YXRlOiBudW1iZXJ9OiBUaGUgbmV3IHJlYWR5IHN0YXRlLiBNdXN0IGJlIDAtNFxuICAqL1xuICBfdXBkYXRlUmVhZHlTdGF0ZTogZnVuY3Rpb24gX3VwZGF0ZVJlYWR5U3RhdGUobmV3UmVhZHlTdGF0ZSkge1xuICAgIGlmIChuZXdSZWFkeVN0YXRlID49IDAgJiYgbmV3UmVhZHlTdGF0ZSA8PSA0KSB7XG4gICAgICB0aGlzLnJlYWR5U3RhdGUgPSBuZXdSZWFkeVN0YXRlO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTW9ja1NvY2tldDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50ID0gcmVxdWlyZSgnLi9oZWxwZXJzL21lc3NhZ2UtZXZlbnQnKTtcblxudmFyIF9oZWxwZXJzTWVzc2FnZUV2ZW50MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNNZXNzYWdlRXZlbnQpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2dsb2JhbC1jb250ZXh0Jyk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0dsb2JhbENvbnRleHQpO1xuXG5mdW5jdGlvbiBTb2NrZXRTZXJ2aWNlKCkge1xuICB0aGlzLmxpc3QgPSB7fTtcbn1cblxuU29ja2V0U2VydmljZS5wcm90b3R5cGUgPSB7XG4gIHNlcnZlcjogbnVsbCxcblxuICAvKlxuICAqIFRoaXMgbm90aWZpZXMgdGhlIG1vY2sgc2VydmVyIHRoYXQgYSBjbGllbnQgaXMgY29ubmVjdGluZyBhbmQgYWxzbyBzZXRzIHVwXG4gICogdGhlIHJlYWR5IHN0YXRlIG9ic2VydmVyLlxuICAqXG4gICogQHBhcmFtIHtjbGllbnQ6IG9iamVjdH0gdGhlIGNvbnRleHQgb2YgdGhlIGNsaWVudFxuICAqIEBwYXJhbSB7cmVhZHlTdGF0ZUZ1bmN0aW9uOiBmdW5jdGlvbn0gdGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIG9uIGEgcmVhZHkgc3RhdGUgY2hhbmdlXG4gICovXG4gIGNsaWVudElzQ29ubmVjdGluZzogZnVuY3Rpb24gY2xpZW50SXNDb25uZWN0aW5nKGNsaWVudCwgcmVhZHlTdGF0ZUZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vYnNlcnZlKCd1cGRhdGVSZWFkeVN0YXRlJywgcmVhZHlTdGF0ZUZ1bmN0aW9uLCBjbGllbnQpO1xuXG4gICAgLy8gaWYgdGhlIHNlcnZlciBoYXMgbm90IGJlZW4gc2V0IHRoZW4gd2Ugbm90aWZ5IHRoZSBvbmNsb3NlIG1ldGhvZCBvZiB0aGlzIGNsaWVudFxuICAgIGlmICghdGhpcy5zZXJ2ZXIpIHtcbiAgICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICd1cGRhdGVSZWFkeVN0YXRlJywgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuQ0xPU0VEKTtcbiAgICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICdjbGllbnRPbkVycm9yJywgKDAsIF9oZWxwZXJzTWVzc2FnZUV2ZW50MlsnZGVmYXVsdCddKSgnZXJyb3InLCBudWxsLCBjbGllbnQudXJsKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5PUEVOKTtcbiAgICB0aGlzLm5vdGlmeSgnY2xpZW50SGFzSm9pbmVkJywgdGhpcy5zZXJ2ZXIpO1xuICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICdjbGllbnRPbk9wZW4nLCAoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdvcGVuJywgbnVsbCwgdGhpcy5zZXJ2ZXIudXJsKSk7XG4gIH0sXG5cbiAgLypcbiAgKiBDbG9zZXMgYSBjb25uZWN0aW9uIGZyb20gdGhlIHNlcnZlcidzIHBlcnNwZWN0aXZlLiBUaGlzIHNob3VsZFxuICAqIGNsb3NlIGFsbCBjbGllbnRzLlxuICAqXG4gICogQHBhcmFtIHttZXNzYWdlRXZlbnQ6IG9iamVjdH0gdGhlIG1vY2sgbWVzc2FnZSBldmVudC5cbiAgKi9cbiAgY2xvc2VDb25uZWN0aW9uRnJvbVNlcnZlcjogZnVuY3Rpb24gY2xvc2VDb25uZWN0aW9uRnJvbVNlcnZlcihtZXNzYWdlRXZlbnQpIHtcbiAgICB0aGlzLm5vdGlmeSgndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NJTkcpO1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRPbmNsb3NlJywgbWVzc2FnZUV2ZW50KTtcbiAgICB0aGlzLm5vdGlmeSgndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NFRCk7XG4gICAgdGhpcy5ub3RpZnkoJ2NsaWVudEhhc0xlZnQnKTtcbiAgfSxcblxuICAvKlxuICAqIENsb3NlcyBhIGNvbm5lY3Rpb24gZnJvbSB0aGUgY2xpZW50cyBwZXJzcGVjdGl2ZS4gVGhpc1xuICAqIHNob3VsZCBvbmx5IGNsb3NlIHRoZSBjbGllbnQgd2hvIGluaXRpYXRlZCB0aGUgY2xvc2UgYW5kIG5vdFxuICAqIGFsbCBvZiB0aGUgb3RoZXIgY2xpZW50cy5cbiAgKlxuICAqIEBwYXJhbSB7bWVzc2FnZUV2ZW50OiBvYmplY3R9IHRoZSBtb2NrIG1lc3NhZ2UgZXZlbnQuXG4gICogQHBhcmFtIHtjbGllbnQ6IG9iamVjdH0gdGhlIGNvbnRleHQgb2YgdGhlIGNsaWVudFxuICAqL1xuICBjbG9zZUNvbm5lY3Rpb25Gcm9tQ2xpZW50OiBmdW5jdGlvbiBjbG9zZUNvbm5lY3Rpb25Gcm9tQ2xpZW50KG1lc3NhZ2VFdmVudCwgY2xpZW50KSB7XG4gICAgaWYgKGNsaWVudC5yZWFkeVN0YXRlID09PSBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5PUEVOKSB7XG4gICAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NJTkcpO1xuICAgICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ2NsaWVudE9uY2xvc2UnLCBtZXNzYWdlRXZlbnQpO1xuICAgICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DTE9TRUQpO1xuICAgICAgdGhpcy5ub3RpZnkoJ2NsaWVudEhhc0xlZnQnKTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZmllcyB0aGUgbW9jayBzZXJ2ZXIgdGhhdCBhIGNsaWVudCBoYXMgc2VudCBhIG1lc3NhZ2UuXG4gICpcbiAgKiBAcGFyYW0ge21lc3NhZ2VFdmVudDogb2JqZWN0fSB0aGUgbW9jayBtZXNzYWdlIGV2ZW50LlxuICAqL1xuICBzZW5kTWVzc2FnZVRvU2VydmVyOiBmdW5jdGlvbiBzZW5kTWVzc2FnZVRvU2VydmVyKG1lc3NhZ2VFdmVudCkge1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRIYXNTZW50TWVzc2FnZScsIG1lc3NhZ2VFdmVudC5kYXRhLCBtZXNzYWdlRXZlbnQpO1xuICB9LFxuXG4gIC8qXG4gICogTm90aWZpZXMgYWxsIGNsaWVudHMgdGhhdCB0aGUgc2VydmVyIGhhcyBzZW50IGEgbWVzc2FnZVxuICAqXG4gICogQHBhcmFtIHttZXNzYWdlRXZlbnQ6IG9iamVjdH0gdGhlIG1vY2sgbWVzc2FnZSBldmVudC5cbiAgKi9cbiAgc2VuZE1lc3NhZ2VUb0NsaWVudHM6IGZ1bmN0aW9uIHNlbmRNZXNzYWdlVG9DbGllbnRzKG1lc3NhZ2VFdmVudCkge1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRPbk1lc3NhZ2UnLCBtZXNzYWdlRXZlbnQpO1xuICB9LFxuXG4gIC8qXG4gICogU2V0dXAgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIG9ic2VydmVycyBmb3IgYm90aCB0aGUgc2VydmVyIGFuZCBjbGllbnQuXG4gICpcbiAgKiBAcGFyYW0ge29ic2VydmVyS2V5OiBzdHJpbmd9IGVpdGhlcjogY29ubmVjdGlvbiwgbWVzc2FnZSBvciBjbG9zZVxuICAqIEBwYXJhbSB7Y2FsbGJhY2s6IGZ1bmN0aW9ufSB0aGUgY2FsbGJhY2sgdG8gYmUgaW52b2tlZFxuICAqIEBwYXJhbSB7c2VydmVyOiBvYmplY3R9IHRoZSBjb250ZXh0IG9mIHRoZSBzZXJ2ZXJcbiAgKi9cbiAgc2V0Q2FsbGJhY2tPYnNlcnZlcjogZnVuY3Rpb24gc2V0Q2FsbGJhY2tPYnNlcnZlcihvYnNlcnZlcktleSwgY2FsbGJhY2ssIHNlcnZlcikge1xuICAgIHRoaXMub2JzZXJ2ZShvYnNlcnZlcktleSwgY2FsbGJhY2ssIHNlcnZlcik7XG4gIH0sXG5cbiAgLypcbiAgKiBCaW5kcyBhIGNhbGxiYWNrIHRvIGEgbmFtZXNwYWNlLiBJZiBub3RpZnkgaXMgY2FsbGVkIG9uIGEgbmFtZXNwYWNlIGFsbCBcIm9ic2VydmVyc1wiIHdpbGwgYmVcbiAgKiBmaXJlZCB3aXRoIHRoZSBjb250ZXh0IHRoYXQgaXMgcGFzc2VkIGluLlxuICAqXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHN0cmluZ31cbiAgKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn1cbiAgKiBAcGFyYW0ge2NvbnRleHQ6IG9iamVjdH1cbiAgKi9cbiAgb2JzZXJ2ZTogZnVuY3Rpb24gb2JzZXJ2ZShuYW1lc3BhY2UsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50cyBhcmUgb2YgdGhlIGNvcnJlY3QgdHlwZVxuICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlICE9PSAnc3RyaW5nJyB8fCB0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicgfHwgY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiBhIG5hbWVzcGFjZSBoYXMgbm90IGJlZW4gY3JlYXRlZCBiZWZvcmUgdGhlbiB3ZSBuZWVkIHRvIFwiaW5pdGlhbGl6ZVwiIHRoZSBuYW1lc3BhY2VcbiAgICBpZiAoIXRoaXMubGlzdFtuYW1lc3BhY2VdKSB7XG4gICAgICB0aGlzLmxpc3RbbmFtZXNwYWNlXSA9IFtdO1xuICAgIH1cblxuICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdLnB1c2goeyBjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gIH0sXG5cbiAgLypcbiAgKiBSZW1vdmUgYWxsIG9ic2VydmVycyBmcm9tIGEgZ2l2ZW4gbmFtZXNwYWNlLlxuICAqXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHN0cmluZ30gVGhlIG5hbWVzcGFjZSB0byBjbGVhci5cbiAgKi9cbiAgY2xlYXJBbGw6IGZ1bmN0aW9uIGNsZWFyQWxsKG5hbWVzcGFjZSkge1xuXG4gICAgaWYgKCF0aGlzLnZlcmlmeU5hbWVzcGFjZUFyZyhuYW1lc3BhY2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0W25hbWVzcGFjZV0gPSBbXTtcbiAgfSxcblxuICAvKlxuICAqIE5vdGlmeSBhbGwgY2FsbGJhY2tzIHRoYXQgaGF2ZSBiZWVuIGJvdW5kIHRvIHRoZSBnaXZlbiBuYW1lc3BhY2UuXG4gICpcbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogc3RyaW5nfSBUaGUgbmFtZXNwYWNlIHRvIG5vdGlmeSBvYnNlcnZlcnMgb24uXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHVybH0gVGhlIHVybCB0byBub3RpZnkgb2JzZXJ2ZXJzIG9uLlxuICAqL1xuICBub3RpZnk6IGZ1bmN0aW9uIG5vdGlmeShuYW1lc3BhY2UpIHtcblxuICAgIC8vIFRoaXMgc3RyaXBzIHRoZSBuYW1lc3BhY2UgZnJvbSB0aGUgbGlzdCBvZiBhcmdzIGFzIHdlIGRvbnQgd2FudCB0byBwYXNzIHRoYXQgaW50byB0aGUgY2FsbGJhY2suXG4gICAgdmFyIGFyZ3VtZW50c0ZvckNhbGxiYWNrID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIGlmICghdGhpcy52ZXJpZnlOYW1lc3BhY2VBcmcobmFtZXNwYWNlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIExvb3Agb3ZlciBhbGwgb2YgdGhlIG9ic2VydmVycyBhbmQgZmlyZSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gd2l0aCB0aGUgY29udGV4dC5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5saXN0W25hbWVzcGFjZV0ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNhbGxiYWNrLmFwcGx5KHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNvbnRleHQsIGFyZ3VtZW50c0ZvckNhbGxiYWNrKTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZnkgb25seSB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIGNvbnRleHQgYW5kIG5hbWVzcGFjZS5cbiAgKlxuICAqIEBwYXJhbSB7Y29udGV4dDogb2JqZWN0fSB0aGUgY29udGV4dCB0byBtYXRjaCBhZ2FpbnN0LlxuICAqIEBwYXJhbSB7bmFtZXNwYWNlOiBzdHJpbmd9IFRoZSBuYW1lc3BhY2UgdG8gbm90aWZ5IG9ic2VydmVycyBvbi5cbiAgKi9cbiAgbm90aWZ5T25seUZvcjogZnVuY3Rpb24gbm90aWZ5T25seUZvcihjb250ZXh0LCBuYW1lc3BhY2UpIHtcblxuICAgIC8vIFRoaXMgc3RyaXBzIHRoZSBuYW1lc3BhY2UgZnJvbSB0aGUgbGlzdCBvZiBhcmdzIGFzIHdlIGRvbnQgd2FudCB0byBwYXNzIHRoYXQgaW50byB0aGUgY2FsbGJhY2suXG4gICAgdmFyIGFyZ3VtZW50c0ZvckNhbGxiYWNrID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcblxuICAgIGlmICghdGhpcy52ZXJpZnlOYW1lc3BhY2VBcmcobmFtZXNwYWNlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIExvb3Agb3ZlciBhbGwgb2YgdGhlIG9ic2VydmVycyBhbmQgZmlyZSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gd2l0aCB0aGUgY29udGV4dC5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5saXN0W25hbWVzcGFjZV0ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmxpc3RbbmFtZXNwYWNlXVtpXS5jb250ZXh0ID09PSBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNhbGxiYWNrLmFwcGx5KHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNvbnRleHQsIGFyZ3VtZW50c0ZvckNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBWZXJpZmllcyB0aGF0IHRoZSBuYW1lc3BhY2UgaXMgdmFsaWQuXG4gICpcbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogc3RyaW5nfSBUaGUgbmFtZXNwYWNlIHRvIHZlcmlmeS5cbiAgKi9cbiAgdmVyaWZ5TmFtZXNwYWNlQXJnOiBmdW5jdGlvbiB2ZXJpZnlOYW1lc3BhY2VBcmcobmFtZXNwYWNlKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lc3BhY2UgIT09ICdzdHJpbmcnIHx8ICF0aGlzLmxpc3RbbmFtZXNwYWNlXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTb2NrZXRTZXJ2aWNlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107Il19
