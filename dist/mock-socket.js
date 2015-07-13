(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * IPv6 Support
 *
 * Version: 1.15.0
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
 * Version: 1.15.0
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
 * Version: 1.15.0
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
    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      return new URI(url, base);
    }

    if (url === undefined) {
      if (arguments.length) {
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

  URI.version = '1.15.0';

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

    if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      if (lookup[data[i]] !== undefined) {
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
        if (typeof items[name] === 'string') {
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
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (data[name] === value) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string as the first parameter');
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
        v[i] = URI.decode(v[i]);
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
    common = URI.commonPath(relative.path(), base.path());

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path.substring(common.length).replace(/[^\/]*$/, '').replace(/.*?\//g, '../');

    relativeParts.path = parents + relativeParts.path.substring(common.length);

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
/*! URI.js v1.15.0 http://medialize.github.io/URI.js/ */
/* build contains: IPv6.js, punycode.js, SecondLevelDomains.js, URI.js, URITemplate.js */
"use strict";

(function (f, l) {
  "object" === typeof exports ? module.exports = l() : "function" === typeof define && define.amd ? define(l) : f.IPv6 = l(f);
})(undefined, function (f) {
  var l = f && f.IPv6;return { best: function best(g) {
      g = g.toLowerCase().split(":");var m = g.length,
          b = 8;"" === g[0] && "" === g[1] && "" === g[2] ? (g.shift(), g.shift()) : "" === g[0] && "" === g[1] ? g.shift() : "" === g[m - 1] && "" === g[m - 2] && g.pop();m = g.length;-1 !== g[m - 1].indexOf(".") && (b = 7);var k;for (k = 0; k < m && "" !== g[k]; k++);if (k < b) for (g.splice(k, 1, "0000"); g.length < b;) g.splice(k, 0, "0000");for (k = 0; k < b; k++) {
        for (var m = g[k].split(""), f = 0; 3 > f; f++) if ("0" === m[0] && 1 < m.length) m.splice(0, 1);else break;g[k] = m.join("");
      }var m = -1,
          l = f = 0,
          h = -1,
          r = !1;for (k = 0; k < b; k++) r ? "0" === g[k] ? l += 1 : (r = !1, l > f && (m = h, f = l)) : "0" === g[k] && (r = !0, h = k, l = 1);l > f && (m = h, f = l);1 < f && g.splice(m, f, "");m = g.length;b = "";"" === g[0] && (b = ":");for (k = 0; k < m; k++) {
        b += g[k];if (k === m - 1) break;b += ":";
      }"" === g[m - 1] && (b += ":");return b;
    }, noConflict: function noConflict() {
      f.IPv6 === this && (f.IPv6 = l);return this;
    } };
});
(function (f) {
  function l(b) {
    throw RangeError(u[b]);
  }function g(b, e) {
    for (var h = b.length; h--;) b[h] = e(b[h]);return b;
  }function m(b, e) {
    return g(b.split(v), e).join(".");
  }function b(b) {
    for (var e = [], h = 0, a = b.length, c, d; h < a;) c = b.charCodeAt(h++), 55296 <= c && 56319 >= c && h < a ? (d = b.charCodeAt(h++), 56320 == (d & 64512) ? e.push(((c & 1023) << 10) + (d & 1023) + 65536) : (e.push(c), h--)) : e.push(c);return e;
  }function k(b) {
    return g(b, function (b) {
      var e = "";65535 < b && (b -= 65536, e += y(b >>> 10 & 1023 | 55296), b = 56320 | b & 1023);return e += y(b);
    }).join("");
  }function B(b, e) {
    return b + 22 + 75 * (26 > b) - ((0 != e) << 5);
  }function w(b, e, h) {
    var a = 0;b = h ? q(b / 700) : b >> 1;for (b += q(b / e); 455 < b; a += 36) b = q(b / 35);return q(a + 36 * b / (b + 38));
  }function h(b) {
    var e = [],
        h = b.length,
        a,
        c = 0,
        d = 128,
        p = 72,
        x,
        z,
        g,
        f,
        m;x = b.lastIndexOf("-");0 > x && (x = 0);for (z = 0; z < x; ++z) 128 <= b.charCodeAt(z) && l("not-basic"), e.push(b.charCodeAt(z));for (x = 0 < x ? x + 1 : 0; x < h;) {
      z = c;a = 1;for (g = 36;; g += 36) {
        x >= h && l("invalid-input");f = b.charCodeAt(x++);f = 10 > f - 48 ? f - 22 : 26 > f - 65 ? f - 65 : 26 > f - 97 ? f - 97 : 36;(36 <= f || f > q((2147483647 - c) / a)) && l("overflow");c += f * a;m = g <= p ? 1 : g >= p + 26 ? 26 : g - p;if (f < m) break;f = 36 - m;a > q(2147483647 / f) && l("overflow");a *= f;
      }a = e.length + 1;p = w(c - z, a, 0 == z);q(c / a) > 2147483647 - d && l("overflow");d += q(c / a);c %= a;e.splice(c++, 0, d);
    }return k(e);
  }function r(e) {
    var h,
        g,
        a,
        c,
        d,
        p,
        x,
        z,
        f,
        m = [],
        r,
        k,
        n;e = b(e);r = e.length;h = 128;g = 0;d = 72;for (p = 0; p < r; ++p) f = e[p], 128 > f && m.push(y(f));for ((a = c = m.length) && m.push("-"); a < r;) {
      x = 2147483647;for (p = 0; p < r; ++p) f = e[p], f >= h && f < x && (x = f);k = a + 1;x - h > q((2147483647 - g) / k) && l("overflow");g += (x - h) * k;h = x;for (p = 0; p < r; ++p) if ((f = e[p], f < h && 2147483647 < ++g && l("overflow"), f == h)) {
        z = g;for (x = 36;; x += 36) {
          f = x <= d ? 1 : x >= d + 26 ? 26 : x - d;if (z < f) break;n = z - f;z = 36 - f;m.push(y(B(f + n % z, 0)));z = q(n / z);
        }m.push(y(B(z, 0)));d = w(g, k, a == c);g = 0;++a;
      }++g;++h;
    }return m.join("");
  }var C = "object" == typeof exports && exports,
      D = "object" == typeof module && module && module.exports == C && module,
      A = "object" == typeof global && global;if (A.global === A || A.window === A) f = A;var t,
      n = /^xn--/,
      e = /[^ -~]/,
      v = /\x2E|\u3002|\uFF0E|\uFF61/g,
      u = { overflow: "Overflow: input needs wider integers to process", "not-basic": "Illegal input >= 0x80 (not a basic code point)",
    "invalid-input": "Invalid input" },
      q = Math.floor,
      y = String.fromCharCode,
      E;t = { version: "1.2.3", ucs2: { decode: b, encode: k }, decode: h, encode: r, toASCII: function toASCII(b) {
      return m(b, function (b) {
        return e.test(b) ? "xn--" + r(b) : b;
      });
    }, toUnicode: function toUnicode(b) {
      return m(b, function (b) {
        return n.test(b) ? h(b.slice(4).toLowerCase()) : b;
      });
    } };if ("function" == typeof define && "object" == typeof define.amd && define.amd) define(function () {
    return t;
  });else if (C && !C.nodeType) if (D) D.exports = t;else for (E in t) t.hasOwnProperty(E) && (C[E] = t[E]);else f.punycode = t;
})(undefined);
(function (f, l) {
  "object" === typeof exports ? module.exports = l() : "function" === typeof define && define.amd ? define(l) : f.SecondLevelDomains = l(f);
})(undefined, function (f) {
  var l = f && f.SecondLevelDomains,
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
      us: " dni fed isa kids nsn ", uy: " com edu gub mil net org ", ve: " co com edu gob info mil net org web ", vi: " co com k12 net org ", vn: " ac biz com edu gov health info int name net org pro ", ye: " co com gov ltd me net org plc ", yu: " ac co edu gov org ", za: " ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ", zm: " ac co com edu gov net org sch " }, has: function has(f) {
      var b = f.lastIndexOf(".");if (0 >= b || b >= f.length - 1) return !1;
      var k = f.lastIndexOf(".", b - 1);if (0 >= k || k >= b - 1) return !1;var l = g.list[f.slice(b + 1)];return l ? 0 <= l.indexOf(" " + f.slice(k + 1, b) + " ") : !1;
    }, is: function is(f) {
      var b = f.lastIndexOf(".");if (0 >= b || b >= f.length - 1 || 0 <= f.lastIndexOf(".", b - 1)) return !1;var k = g.list[f.slice(b + 1)];return k ? 0 <= k.indexOf(" " + f.slice(0, b) + " ") : !1;
    }, get: function get(f) {
      var b = f.lastIndexOf(".");if (0 >= b || b >= f.length - 1) return null;var k = f.lastIndexOf(".", b - 1);if (0 >= k || k >= b - 1) return null;var l = g.list[f.slice(b + 1)];return !l || 0 > l.indexOf(" " + f.slice(k + 1, b) + " ") ? null : f.slice(k + 1);
    }, noConflict: function noConflict() {
      f.SecondLevelDomains === this && (f.SecondLevelDomains = l);return this;
    } };return g;
});
(function (f, l) {
  "object" === typeof exports ? module.exports = l(require("./punycode"), require("./IPv6"), require("./SecondLevelDomains")) : "function" === typeof define && define.amd ? define(["./punycode", "./IPv6", "./SecondLevelDomains"], l) : f.URI = l(f.punycode, f.IPv6, f.SecondLevelDomains, f);
})(undefined, function (f, l, g, m) {
  function b(a, c) {
    if (!(this instanceof b)) return new b(a, c);if (void 0 === a) {
      if (arguments.length) throw new TypeError("undefined is not a valid argument for URI");a = "undefined" !== typeof location ? location.href + "" : "";
    }this.href(a);return void 0 !== c ? this.absoluteTo(c) : this;
  }function k(a) {
    return a.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
  }function B(a) {
    return void 0 === a ? "Undefined" : String(Object.prototype.toString.call(a)).slice(8, -1);
  }function w(a) {
    return "Array" === B(a);
  }function h(a, c) {
    var d, b;if (w(c)) {
      d = 0;for (b = c.length; d < b; d++) if (!h(a, c[d])) return !1;return !0;
    }var e = B(c);d = 0;for (b = a.length; d < b; d++) if ("RegExp" === e) {
      if ("string" === typeof a[d] && a[d].match(c)) return !0;
    } else if (a[d] === c) return !0;return !1;
  }function r(a, c) {
    if (!w(a) || !w(c) || a.length !== c.length) return !1;a.sort();c.sort();for (var d = 0, b = a.length; d < b; d++) if (a[d] !== c[d]) return !1;return !0;
  }function C(a) {
    return escape(a);
  }function D(a) {
    return encodeURIComponent(a).replace(/[!'()*]/g, C).replace(/\*/g, "%2A");
  }function A(a) {
    return function (c, d) {
      if (void 0 === c) return this._parts[a] || "";this._parts[a] = c || null;this.build(!d);return this;
    };
  }function t(a, c) {
    return function (d, b) {
      if (void 0 === d) return this._parts[a] || "";null !== d && (d += "", d.charAt(0) === c && (d = d.substring(1)));
      this._parts[a] = d;this.build(!b);return this;
    };
  }var n = m && m.URI;b.version = "1.15.0";var e = b.prototype,
      v = Object.prototype.hasOwnProperty;b._parts = function () {
    return { protocol: null, username: null, password: null, hostname: null, urn: null, port: null, path: null, query: null, fragment: null, duplicateQueryParameters: b.duplicateQueryParameters, escapeQuerySpace: b.escapeQuerySpace };
  };b.duplicateQueryParameters = !1;b.escapeQuerySpace = !0;b.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;b.idn_expression = /[^a-z0-9\.-]/i;b.punycode_expression = /(xn--)/i;b.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;b.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  b.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019]))/ig;b.findUri = { start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi, end: /[\s\r\n]|$/, trim: /[`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u201e\u2018\u2019]+$/ };b.defaultPorts = { http: "80", https: "443", ftp: "21", gopher: "70", ws: "80", wss: "443" };b.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;b.domAttributes = { a: "href", blockquote: "cite", link: "href", base: "href", script: "src", form: "action", img: "src", area: "href", iframe: "src", embed: "src", source: "src", track: "src", input: "src", audio: "src", video: "src" };b.getDomAttribute = function (a) {
    if (a && a.nodeName) {
      var c = a.nodeName.toLowerCase();return "input" === c && "image" !== a.type ? void 0 : b.domAttributes[c];
    }
  };b.encode = D;b.decode = decodeURIComponent;b.iso8859 = function () {
    b.encode = escape;b.decode = unescape;
  };b.unicode = function () {
    b.encode = D;b.decode = decodeURIComponent;
  };b.characters = { pathname: { encode: { expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig, map: { "%24": "$", "%26": "&", "%2B": "+", "%2C": ",", "%3B": ";", "%3D": "=", "%3A": ":", "%40": "@" } }, decode: { expression: /[\/\?#]/g, map: { "/": "%2F", "?": "%3F", "#": "%23" } } }, reserved: { encode: { expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig, map: { "%3A": ":", "%2F": "/", "%3F": "?", "%23": "#", "%5B": "[", "%5D": "]", "%40": "@", "%21": "!", "%24": "$", "%26": "&", "%27": "'", "%28": "(", "%29": ")", "%2A": "*", "%2B": "+", "%2C": ",",
          "%3B": ";", "%3D": "=" } } }, urnpath: { encode: { expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig, map: { "%21": "!", "%24": "$", "%27": "'", "%28": "(", "%29": ")", "%2A": "*", "%2B": "+", "%2C": ",", "%3B": ";", "%3D": "=", "%40": "@" } }, decode: { expression: /[\/\?#:]/g, map: { "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" } } } };b.encodeQuery = function (a, c) {
    var d = b.encode(a + "");void 0 === c && (c = b.escapeQuerySpace);return c ? d.replace(/%20/g, "+") : d;
  };b.decodeQuery = function (a, c) {
    a += "";void 0 === c && (c = b.escapeQuerySpace);try {
      return b.decode(c ? a.replace(/\+/g, "%20") : a);
    } catch (d) {
      return a;
    }
  };var u = { encode: "encode", decode: "decode" },
      q,
      y = function y(a, c) {
    return function (d) {
      try {
        return b[c](d + "").replace(b.characters[a][c].expression, function (d) {
          return b.characters[a][c].map[d];
        });
      } catch (p) {
        return d;
      }
    };
  };for (q in u) b[q + "PathSegment"] = y("pathname", u[q]), b[q + "UrnPathSegment"] = y("urnpath", u[q]);u = function (a, c, d) {
    return function (p) {
      var e;e = d ? function (a) {
        return b[c](b[d](a));
      } : b[c];p = (p + "").split(a);for (var f = 0, h = p.length; f < h; f++) p[f] = e(p[f]);return p.join(a);
    };
  };b.decodePath = u("/", "decodePathSegment");b.decodeUrnPath = u(":", "decodeUrnPathSegment");b.recodePath = u("/", "encodePathSegment", "decode");b.recodeUrnPath = u(":", "encodeUrnPathSegment", "decode");b.encodeReserved = y("reserved", "encode");b.parse = function (a, c) {
    var d;c || (c = {});d = a.indexOf("#");-1 < d && (c.fragment = a.substring(d + 1) || null, a = a.substring(0, d));d = a.indexOf("?");-1 < d && (c.query = a.substring(d + 1) || null, a = a.substring(0, d));"//" === a.substring(0, 2) ? (c.protocol = null, a = a.substring(2), a = b.parseAuthority(a, c)) : (d = a.indexOf(":"), -1 < d && (c.protocol = a.substring(0, d) || null, c.protocol && !c.protocol.match(b.protocol_expression) ? c.protocol = void 0 : "//" === a.substring(d + 1, d + 3) ? (a = a.substring(d + 3), a = b.parseAuthority(a, c)) : (a = a.substring(d + 1), c.urn = !0)));c.path = a;return c;
  };b.parseHost = function (a, c) {
    var d = a.indexOf("/"),
        b;-1 === d && (d = a.length);if ("[" === a.charAt(0)) b = a.indexOf("]"), c.hostname = a.substring(1, b) || null, c.port = a.substring(b + 2, d) || null, "/" === c.port && (c.port = null);else {
      var e = a.indexOf(":");b = a.indexOf("/");e = a.indexOf(":", e + 1);
      -1 !== e && (-1 === b || e < b) ? (c.hostname = a.substring(0, d) || null, c.port = null) : (b = a.substring(0, d).split(":"), c.hostname = b[0] || null, c.port = b[1] || null);
    }c.hostname && "/" !== a.substring(d).charAt(0) && (d++, a = "/" + a);return a.substring(d) || "/";
  };b.parseAuthority = function (a, c) {
    a = b.parseUserinfo(a, c);return b.parseHost(a, c);
  };b.parseUserinfo = function (a, c) {
    var d = a.indexOf("/"),
        p = a.lastIndexOf("@", -1 < d ? d : a.length - 1);-1 < p && (-1 === d || p < d) ? (d = a.substring(0, p).split(":"), c.username = d[0] ? b.decode(d[0]) : null, d.shift(), c.password = d[0] ? b.decode(d.join(":")) : null, a = a.substring(p + 1)) : (c.username = null, c.password = null);return a;
  };b.parseQuery = function (a, c) {
    if (!a) return {};a = a.replace(/&+/g, "&").replace(/^\?*&*|&+$/g, "");if (!a) return {};for (var d = {}, p = a.split("&"), e = p.length, f, h, g = 0; g < e; g++) f = p[g].split("="), h = b.decodeQuery(f.shift(), c), f = f.length ? b.decodeQuery(f.join("="), c) : null, v.call(d, h) ? ("string" === typeof d[h] && (d[h] = [d[h]]), d[h].push(f)) : d[h] = f;return d;
  };b.build = function (a) {
    var c = "";a.protocol && (c += a.protocol + ":");a.urn || !c && !a.hostname || (c += "//");c += b.buildAuthority(a) || "";"string" === typeof a.path && ("/" !== a.path.charAt(0) && "string" === typeof a.hostname && (c += "/"), c += a.path);"string" === typeof a.query && a.query && (c += "?" + a.query);"string" === typeof a.fragment && a.fragment && (c += "#" + a.fragment);return c;
  };b.buildHost = function (a) {
    var c = "";if (a.hostname) c = b.ip6_expression.test(a.hostname) ? c + ("[" + a.hostname + "]") : c + a.hostname;else return "";a.port && (c += ":" + a.port);return c;
  };b.buildAuthority = function (a) {
    return b.buildUserinfo(a) + b.buildHost(a);
  };
  b.buildUserinfo = function (a) {
    var c = "";a.username && (c += b.encode(a.username), a.password && (c += ":" + b.encode(a.password)), c += "@");return c;
  };b.buildQuery = function (a, c, d) {
    var p = "",
        e,
        f,
        h,
        g;for (f in a) if (v.call(a, f) && f) if (w(a[f])) for (e = {}, h = 0, g = a[f].length; h < g; h++) void 0 !== a[f][h] && void 0 === e[a[f][h] + ""] && (p += "&" + b.buildQueryParameter(f, a[f][h], d), !0 !== c && (e[a[f][h] + ""] = !0));else void 0 !== a[f] && (p += "&" + b.buildQueryParameter(f, a[f], d));return p.substring(1);
  };b.buildQueryParameter = function (a, c, d) {
    return b.encodeQuery(a, d) + (null !== c ? "=" + b.encodeQuery(c, d) : "");
  };b.addQuery = function (a, c, d) {
    if ("object" === typeof c) for (var e in c) v.call(c, e) && b.addQuery(a, e, c[e]);else if ("string" === typeof c) void 0 === a[c] ? a[c] = d : ("string" === typeof a[c] && (a[c] = [a[c]]), w(d) || (d = [d]), a[c] = (a[c] || []).concat(d));else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
  };b.removeQuery = function (a, c, d) {
    var e;if (w(c)) for (d = 0, e = c.length; d < e; d++) a[c[d]] = void 0;else if ("object" === typeof c) for (e in c) v.call(c, e) && b.removeQuery(a, e, c[e]);else if ("string" === typeof c) if (void 0 !== d) if (a[c] === d) a[c] = void 0;else {
      if (w(a[c])) {
        e = a[c];var f = {},
            h,
            g;if (w(d)) for (h = 0, g = d.length; h < g; h++) f[d[h]] = !0;else f[d] = !0;h = 0;for (g = e.length; h < g; h++) void 0 !== f[e[h]] && (e.splice(h, 1), g--, h--);a[c] = e;
      }
    } else a[c] = void 0;else throw new TypeError("URI.removeQuery() accepts an object, string as the first parameter");
  };b.hasQuery = function (a, c, d, e) {
    if ("object" === typeof c) {
      for (var f in c) if (v.call(c, f) && !b.hasQuery(a, f, c[f])) return !1;return !0;
    }if ("string" !== typeof c) throw new TypeError("URI.hasQuery() accepts an object, string as the name parameter");
    switch (B(d)) {case "Undefined":
        return c in a;case "Boolean":
        return (a = Boolean(w(a[c]) ? a[c].length : a[c]), d === a);case "Function":
        return !!d(a[c], c, a);case "Array":
        return w(a[c]) ? (e ? h : r)(a[c], d) : !1;case "RegExp":
        return w(a[c]) ? e ? h(a[c], d) : !1 : Boolean(a[c] && a[c].match(d));case "Number":
        d = String(d);case "String":
        return w(a[c]) ? e ? h(a[c], d) : !1 : a[c] === d;default:
        throw new TypeError("URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter");}
  };b.commonPath = function (a, c) {
    var d = Math.min(a.length, c.length),
        b;for (b = 0; b < d; b++) if (a.charAt(b) !== c.charAt(b)) {
      b--;break;
    }if (1 > b) return a.charAt(0) === c.charAt(0) && "/" === a.charAt(0) ? "/" : "";if ("/" !== a.charAt(b) || "/" !== c.charAt(b)) b = a.substring(0, b).lastIndexOf("/");return a.substring(0, b + 1);
  };b.withinString = function (a, c, d) {
    d || (d = {});var e = d.start || b.findUri.start,
        f = d.end || b.findUri.end,
        h = d.trim || b.findUri.trim,
        g = /[a-z0-9-]=["']?$/i;for (e.lastIndex = 0;;) {
      var r = e.exec(a);if (!r) break;r = r.index;if (d.ignoreHtml) {
        var k = a.slice(Math.max(r - 3, 0), r);if (k && g.test(k)) continue;
      }var k = r + a.slice(r).search(f),
          m = a.slice(r, k).replace(h, "");d.ignore && d.ignore.test(m) || (k = r + m.length, m = c(m, r, k, a), a = a.slice(0, r) + m + a.slice(k), e.lastIndex = r + m.length);
    }e.lastIndex = 0;return a;
  };b.ensureValidHostname = function (a) {
    if (a.match(b.invalid_hostname_characters)) {
      if (!f) throw new TypeError("Hostname \"" + a + "\" contains characters other than [A-Z0-9.-] and Punycode.js is not available");if (f.toASCII(a).match(b.invalid_hostname_characters)) throw new TypeError("Hostname \"" + a + "\" contains characters other than [A-Z0-9.-]");
    }
  };b.noConflict = function (a) {
    if (a) return (a = { URI: this.noConflict() }, m.URITemplate && "function" === typeof m.URITemplate.noConflict && (a.URITemplate = m.URITemplate.noConflict()), m.IPv6 && "function" === typeof m.IPv6.noConflict && (a.IPv6 = m.IPv6.noConflict()), m.SecondLevelDomains && "function" === typeof m.SecondLevelDomains.noConflict && (a.SecondLevelDomains = m.SecondLevelDomains.noConflict()), a);m.URI === this && (m.URI = n);return this;
  };e.build = function (a) {
    if (!0 === a) this._deferred_build = !0;else if (void 0 === a || this._deferred_build) this._string = b.build(this._parts), this._deferred_build = !1;return this;
  };e.clone = function () {
    return new b(this);
  };e.valueOf = e.toString = function () {
    return this.build(!1)._string;
  };e.protocol = A("protocol");e.username = A("username");e.password = A("password");e.hostname = A("hostname");e.port = A("port");e.query = t("query", "?");e.fragment = t("fragment", "#");e.search = function (a, c) {
    var b = this.query(a, c);return "string" === typeof b && b.length ? "?" + b : b;
  };e.hash = function (a, c) {
    var b = this.fragment(a, c);return "string" === typeof b && b.length ? "#" + b : b;
  };e.pathname = function (a, c) {
    if (void 0 === a || !0 === a) {
      var d = this._parts.path || (this._parts.hostname ? "/" : "");return a ? (this._parts.urn ? b.decodeUrnPath : b.decodePath)(d) : d;
    }this._parts.path = this._parts.urn ? a ? b.recodeUrnPath(a) : "" : a ? b.recodePath(a) : "/";this.build(!c);return this;
  };e.path = e.pathname;e.href = function (a, c) {
    var d;if (void 0 === a) return this.toString();this._string = "";this._parts = b._parts();var e = a instanceof b,
        f = "object" === typeof a && (a.hostname || a.path || a.pathname);a.nodeName && (f = b.getDomAttribute(a), a = a[f] || "", f = !1);!e && f && void 0 !== a.pathname && (a = a.toString());if ("string" === typeof a || a instanceof String) this._parts = b.parse(String(a), this._parts);else if (e || f) for (d in (e = e ? a._parts : a, e)) v.call(this._parts, d) && (this._parts[d] = e[d]);else throw new TypeError("invalid input");this.build(!c);return this;
  };e.is = function (a) {
    var c = !1,
        d = !1,
        e = !1,
        f = !1,
        h = !1,
        r = !1,
        k = !1,
        m = !this._parts.urn;this._parts.hostname && (m = !1, d = b.ip4_expression.test(this._parts.hostname), e = b.ip6_expression.test(this._parts.hostname), c = d || e, h = (f = !c) && g && g.has(this._parts.hostname), r = f && b.idn_expression.test(this._parts.hostname), k = f && b.punycode_expression.test(this._parts.hostname));switch (a.toLowerCase()) {case "relative":
        return m;case "absolute":
        return !m;case "domain":case "name":
        return f;case "sld":
        return h;case "ip":
        return c;case "ip4":case "ipv4":case "inet4":
        return d;case "ip6":case "ipv6":case "inet6":
        return e;case "idn":
        return r;case "url":
        return !this._parts.urn;case "urn":
        return !!this._parts.urn;
      case "punycode":
        return k;}return null;
  };var E = e.protocol,
      F = e.port,
      G = e.hostname;e.protocol = function (a, c) {
    if (void 0 !== a && a && (a = a.replace(/:(\/\/)?$/, ""), !a.match(b.protocol_expression))) throw new TypeError("Protocol \"" + a + "\" contains characters other than [A-Z0-9.+-] or doesn't start with [A-Z]");return E.call(this, a, c);
  };e.scheme = e.protocol;e.port = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 !== a && (0 === a && (a = null), a && (a += "", ":" === a.charAt(0) && (a = a.substring(1)), a.match(/[^0-9]/)))) throw new TypeError("Port \"" + a + "\" contains characters other than [0-9]");return F.call(this, a, c);
  };e.hostname = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 !== a) {
      var d = {};b.parseHost(a, d);a = d.hostname;
    }return G.call(this, a, c);
  };e.host = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) return this._parts.hostname ? b.buildHost(this._parts) : "";b.parseHost(a, this._parts);this.build(!c);return this;
  };e.authority = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) return this._parts.hostname ? b.buildAuthority(this._parts) : "";b.parseAuthority(a, this._parts);this.build(!c);return this;
  };e.userinfo = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) {
      if (!this._parts.username) return "";var d = b.buildUserinfo(this._parts);return d.substring(0, d.length - 1);
    }"@" !== a[a.length - 1] && (a += "@");b.parseUserinfo(a, this._parts);this.build(!c);return this;
  };e.resource = function (a, c) {
    var d;if (void 0 === a) return this.path() + this.search() + this.hash();d = b.parse(a);this._parts.path = d.path;this._parts.query = d.query;this._parts.fragment = d.fragment;this.build(!c);return this;
  };e.subdomain = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a) {
      if (!this._parts.hostname || this.is("IP")) return "";var d = this._parts.hostname.length - this.domain().length - 1;return this._parts.hostname.substring(0, d) || "";
    }d = this._parts.hostname.length - this.domain().length;d = this._parts.hostname.substring(0, d);d = new RegExp("^" + k(d));a && "." !== a.charAt(a.length - 1) && (a += ".");a && b.ensureValidHostname(a);this._parts.hostname = this._parts.hostname.replace(d, a);this.build(!c);return this;
  };e.domain = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;"boolean" === typeof a && (c = a, a = void 0);if (void 0 === a) {
      if (!this._parts.hostname || this.is("IP")) return "";var d = this._parts.hostname.match(/\./g);if (d && 2 > d.length) return this._parts.hostname;d = this._parts.hostname.length - this.tld(c).length - 1;d = this._parts.hostname.lastIndexOf(".", d - 1) + 1;return this._parts.hostname.substring(d) || "";
    }if (!a) throw new TypeError("cannot set domain empty");
    b.ensureValidHostname(a);!this._parts.hostname || this.is("IP") ? this._parts.hostname = a : (d = new RegExp(k(this.domain()) + "$"), this._parts.hostname = this._parts.hostname.replace(d, a));this.build(!c);return this;
  };e.tld = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;"boolean" === typeof a && (c = a, a = void 0);if (void 0 === a) {
      if (!this._parts.hostname || this.is("IP")) return "";var b = this._parts.hostname.lastIndexOf("."),
          b = this._parts.hostname.substring(b + 1);return !0 !== c && g && g.list[b.toLowerCase()] ? g.get(this._parts.hostname) || b : b;
    }if (a) if (a.match(/[^a-zA-Z0-9-]/)) if (g && g.is(a)) b = new RegExp(k(this.tld()) + "$"), this._parts.hostname = this._parts.hostname.replace(b, a);else throw new TypeError("TLD \"" + a + "\" contains characters other than [A-Z0-9]");else {
      if (!this._parts.hostname || this.is("IP")) throw new ReferenceError("cannot set TLD on non-domain host");b = new RegExp(k(this.tld()) + "$");this._parts.hostname = this._parts.hostname.replace(b, a);
    } else throw new TypeError("cannot set TLD empty");this.build(!c);return this;
  };e.directory = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a || !0 === a) {
      if (!this._parts.path && !this._parts.hostname) return "";if ("/" === this._parts.path) return "/";var d = this._parts.path.length - this.filename().length - 1,
          d = this._parts.path.substring(0, d) || (this._parts.hostname ? "/" : "");return a ? b.decodePath(d) : d;
    }d = this._parts.path.length - this.filename().length;d = this._parts.path.substring(0, d);d = new RegExp("^" + k(d));this.is("relative") || (a || (a = "/"), "/" !== a.charAt(0) && (a = "/" + a));a && "/" !== a.charAt(a.length - 1) && (a += "/");a = b.recodePath(a);this._parts.path = this._parts.path.replace(d, a);this.build(!c);return this;
  };e.filename = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a || !0 === a) {
      if (!this._parts.path || "/" === this._parts.path) return "";var d = this._parts.path.lastIndexOf("/"),
          d = this._parts.path.substring(d + 1);return a ? b.decodePathSegment(d) : d;
    }d = !1;"/" === a.charAt(0) && (a = a.substring(1));a.match(/\.?\//) && (d = !0);var e = new RegExp(k(this.filename()) + "$");a = b.recodePath(a);this._parts.path = this._parts.path.replace(e, a);d ? this.normalizePath(c) : this.build(!c);return this;
  };e.suffix = function (a, c) {
    if (this._parts.urn) return void 0 === a ? "" : this;if (void 0 === a || !0 === a) {
      if (!this._parts.path || "/" === this._parts.path) return "";var d = this.filename(),
          e = d.lastIndexOf(".");if (-1 === e) return "";d = d.substring(e + 1);d = /^[a-z0-9%]+$/i.test(d) ? d : "";return a ? b.decodePathSegment(d) : d;
    }"." === a.charAt(0) && (a = a.substring(1));if (d = this.suffix()) e = a ? new RegExp(k(d) + "$") : new RegExp(k("." + d) + "$");else {
      if (!a) return this;
      this._parts.path += "." + b.recodePath(a);
    }e && (a = b.recodePath(a), this._parts.path = this._parts.path.replace(e, a));this.build(!c);return this;
  };e.segment = function (a, c, b) {
    var e = this._parts.urn ? ":" : "/",
        f = this.path(),
        h = "/" === f.substring(0, 1),
        f = f.split(e);void 0 !== a && "number" !== typeof a && (b = c, c = a, a = void 0);if (void 0 !== a && "number" !== typeof a) throw Error("Bad segment \"" + a + "\", must be 0-based integer");h && f.shift();0 > a && (a = Math.max(f.length + a, 0));if (void 0 === c) return void 0 === a ? f : f[a];if (null === a || void 0 === f[a]) if (w(c)) {
      f = [];a = 0;for (var g = c.length; a < g; a++) if (c[a].length || f.length && f[f.length - 1].length) f.length && !f[f.length - 1].length && f.pop(), f.push(c[a]);
    } else {
      if (c || "string" === typeof c) "" === f[f.length - 1] ? f[f.length - 1] = c : f.push(c);
    } else c ? f[a] = c : f.splice(a, 1);h && f.unshift("");return this.path(f.join(e), b);
  };e.segmentCoded = function (a, c, d) {
    var e, f;"number" !== typeof a && (d = c, c = a, a = void 0);if (void 0 === c) {
      a = this.segment(a, c, d);if (w(a)) for (e = 0, f = a.length; e < f; e++) a[e] = b.decode(a[e]);else a = void 0 !== a ? b.decode(a) : void 0;return a;
    }if (w(c)) for (e = 0, f = c.length; e < f; e++) c[e] = b.decode(c[e]);else c = "string" === typeof c || c instanceof String ? b.encode(c) : c;return this.segment(a, c, d);
  };var H = e.query;e.query = function (a, c) {
    if (!0 === a) return b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);if ("function" === typeof a) {
      var d = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace),
          e = a.call(this, d);this._parts.query = b.buildQuery(e || d, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);this.build(!c);return this;
    }return void 0 !== a && "string" !== typeof a ? (this._parts.query = b.buildQuery(a, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), this.build(!c), this) : H.call(this, a, c);
  };e.setQuery = function (a, c, d) {
    var e = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);if ("string" === typeof a || a instanceof String) e[a] = void 0 !== c ? c : null;else if ("object" === typeof a) for (var f in a) v.call(a, f) && (e[f] = a[f]);else throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");this._parts.query = b.buildQuery(e, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);"string" !== typeof a && (d = c);this.build(!d);return this;
  };e.addQuery = function (a, c, d) {
    var e = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);b.addQuery(e, a, void 0 === c ? null : c);this._parts.query = b.buildQuery(e, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);"string" !== typeof a && (d = c);this.build(!d);return this;
  };e.removeQuery = function (a, c, d) {
    var e = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    b.removeQuery(e, a, c);this._parts.query = b.buildQuery(e, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);"string" !== typeof a && (d = c);this.build(!d);return this;
  };e.hasQuery = function (a, c, d) {
    var e = b.parseQuery(this._parts.query, this._parts.escapeQuerySpace);return b.hasQuery(e, a, c, d);
  };e.setSearch = e.setQuery;e.addSearch = e.addQuery;e.removeSearch = e.removeQuery;e.hasSearch = e.hasQuery;e.normalize = function () {
    return this._parts.urn ? this.normalizeProtocol(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build() : this.normalizeProtocol(!1).normalizeHostname(!1).normalizePort(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build();
  };e.normalizeProtocol = function (a) {
    "string" === typeof this._parts.protocol && (this._parts.protocol = this._parts.protocol.toLowerCase(), this.build(!a));return this;
  };e.normalizeHostname = function (a) {
    this._parts.hostname && (this.is("IDN") && f ? this._parts.hostname = f.toASCII(this._parts.hostname) : this.is("IPv6") && l && (this._parts.hostname = l.best(this._parts.hostname)), this._parts.hostname = this._parts.hostname.toLowerCase(), this.build(!a));return this;
  };e.normalizePort = function (a) {
    "string" === typeof this._parts.protocol && this._parts.port === b.defaultPorts[this._parts.protocol] && (this._parts.port = null, this.build(!a));return this;
  };e.normalizePath = function (a) {
    var c = this._parts.path;if (!c) return this;if (this._parts.urn) return (this._parts.path = b.recodeUrnPath(this._parts.path), this.build(!a), this);if ("/" === this._parts.path) return this;var d,
        e = "",
        f,
        h;"/" !== c.charAt(0) && (d = !0, c = "/" + c);c = c.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/");d && (e = c.substring(1).match(/^(\.\.\/)+/) || "") && (e = e[0]);for (;;) {
      f = c.indexOf("/..");if (-1 === f) break;else if (0 === f) {
        c = c.substring(3);continue;
      }h = c.substring(0, f).lastIndexOf("/");-1 === h && (h = f);c = c.substring(0, h) + c.substring(f + 3);
    }d && this.is("relative") && (c = e + c.substring(1));c = b.recodePath(c);this._parts.path = c;this.build(!a);return this;
  };e.normalizePathname = e.normalizePath;e.normalizeQuery = function (a) {
    "string" === typeof this._parts.query && (this._parts.query.length ? this.query(b.parseQuery(this._parts.query, this._parts.escapeQuerySpace)) : this._parts.query = null, this.build(!a));return this;
  };e.normalizeFragment = function (a) {
    this._parts.fragment || (this._parts.fragment = null, this.build(!a));return this;
  };e.normalizeSearch = e.normalizeQuery;e.normalizeHash = e.normalizeFragment;e.iso8859 = function () {
    var a = b.encode,
        c = b.decode;b.encode = escape;b.decode = decodeURIComponent;try {
      this.normalize();
    } finally {
      b.encode = a, b.decode = c;
    }return this;
  };e.unicode = function () {
    var a = b.encode,
        c = b.decode;b.encode = D;b.decode = unescape;try {
      this.normalize();
    } finally {
      b.encode = a, b.decode = c;
    }return this;
  };e.readable = function () {
    var a = this.clone();a.username("").password("").normalize();var c = "";a._parts.protocol && (c += a._parts.protocol + "://");a._parts.hostname && (a.is("punycode") && f ? (c += f.toUnicode(a._parts.hostname), a._parts.port && (c += ":" + a._parts.port)) : c += a.host());a._parts.hostname && a._parts.path && "/" !== a._parts.path.charAt(0) && (c += "/");c += a.path(!0);if (a._parts.query) {
      for (var d = "", e = 0, h = a._parts.query.split("&"), g = h.length; e < g; e++) {
        var r = (h[e] || "").split("="),
            d = d + ("&" + b.decodeQuery(r[0], this._parts.escapeQuerySpace).replace(/&/g, "%26"));void 0 !== r[1] && (d += "=" + b.decodeQuery(r[1], this._parts.escapeQuerySpace).replace(/&/g, "%26"));
      }c += "?" + d.substring(1);
    }return c += b.decodeQuery(a.hash(), !0);
  };e.absoluteTo = function (a) {
    var c = this.clone(),
        d = ["protocol", "username", "password", "hostname", "port"],
        e,
        f;if (this._parts.urn) throw Error("URNs do not have any generally defined hierarchical components");a instanceof b || (a = new b(a));c._parts.protocol || (c._parts.protocol = a._parts.protocol);if (this._parts.hostname) return c;
    for (e = 0; f = d[e]; e++) c._parts[f] = a._parts[f];c._parts.path ? ".." === c._parts.path.substring(-2) && (c._parts.path += "/") : (c._parts.path = a._parts.path, c._parts.query || (c._parts.query = a._parts.query));"/" !== c.path().charAt(0) && (d = (d = a.directory()) ? d : 0 === a.path().indexOf("/") ? "/" : "", c._parts.path = (d ? d + "/" : "") + c._parts.path, c.normalizePath());c.build();return c;
  };e.relativeTo = function (a) {
    var c = this.clone().normalize(),
        d,
        e,
        f,
        h;if (c._parts.urn) throw Error("URNs do not have any generally defined hierarchical components");
    a = new b(a).normalize();d = c._parts;e = a._parts;f = c.path();h = a.path();if ("/" !== f.charAt(0)) throw Error("URI is already relative");if ("/" !== h.charAt(0)) throw Error("Cannot calculate a URI relative to another relative URI");d.protocol === e.protocol && (d.protocol = null);if (d.username === e.username && d.password === e.password && null === d.protocol && null === d.username && null === d.password && d.hostname === e.hostname && d.port === e.port) d.hostname = null, d.port = null;else return c.build();if (f === h) return (d.path = "", c.build());
    a = b.commonPath(c.path(), a.path());if (!a) return c.build();e = e.path.substring(a.length).replace(/[^\/]*$/, "").replace(/.*?\//g, "../");d.path = e + d.path.substring(a.length);return c.build();
  };e.equals = function (a) {
    var c = this.clone();a = new b(a);var d = {},
        e = {},
        f = {},
        h;c.normalize();a.normalize();if (c.toString() === a.toString()) return !0;d = c.query();e = a.query();c.query("");a.query("");if (c.toString() !== a.toString() || d.length !== e.length) return !1;d = b.parseQuery(d, this._parts.escapeQuerySpace);e = b.parseQuery(e, this._parts.escapeQuerySpace);
    for (h in d) if (v.call(d, h)) {
      if (!w(d[h])) {
        if (d[h] !== e[h]) return !1;
      } else if (!r(d[h], e[h])) return !1;f[h] = !0;
    }for (h in e) if (v.call(e, h) && !f[h]) return !1;return !0;
  };e.duplicateQueryParameters = function (a) {
    this._parts.duplicateQueryParameters = !!a;return this;
  };e.escapeQuerySpace = function (a) {
    this._parts.escapeQuerySpace = !!a;return this;
  };return b;
});
(function (f, l) {
  "object" === typeof exports ? module.exports = l(require("./URI")) : "function" === typeof define && define.amd ? define(["./URI"], l) : f.URITemplate = l(f.URI, f);
})(undefined, function (f, l) {
  function g(b) {
    if (g._cache[b]) return g._cache[b];if (!(this instanceof g)) return new g(b);this.expression = b;g._cache[b] = this;return this;
  }function m(b) {
    this.data = b;this.cache = {};
  }var b = l && l.URITemplate,
      k = Object.prototype.hasOwnProperty,
      B = g.prototype,
      w = { "": { prefix: "", separator: ",", named: !1, empty_name_separator: !1, encode: "encode" },
    "+": { prefix: "", separator: ",", named: !1, empty_name_separator: !1, encode: "encodeReserved" }, "#": { prefix: "#", separator: ",", named: !1, empty_name_separator: !1, encode: "encodeReserved" }, ".": { prefix: ".", separator: ".", named: !1, empty_name_separator: !1, encode: "encode" }, "/": { prefix: "/", separator: "/", named: !1, empty_name_separator: !1, encode: "encode" }, ";": { prefix: ";", separator: ";", named: !0, empty_name_separator: !1, encode: "encode" }, "?": { prefix: "?", separator: "&", named: !0, empty_name_separator: !0, encode: "encode" }, "&": { prefix: "&",
      separator: "&", named: !0, empty_name_separator: !0, encode: "encode" } };g._cache = {};g.EXPRESSION_PATTERN = /\{([^a-zA-Z0-9%_]?)([^\}]+)(\}|$)/g;g.VARIABLE_PATTERN = /^([^*:]+)((\*)|:(\d+))?$/;g.VARIABLE_NAME_PATTERN = /[^a-zA-Z0-9%_]/;g.expand = function (b, f) {
    var k = w[b.operator],
        m = k.named ? "Named" : "Unnamed",
        l = b.variables,
        t = [],
        n,
        e,
        v;for (v = 0; e = l[v]; v++) n = f.get(e.name), n.val.length ? t.push(g["expand" + m](n, k, e.explode, e.explode && k.separator || ",", e.maxlength, e.name)) : n.type && t.push("");return t.length ? k.prefix + t.join(k.separator) : "";
  };g.expandNamed = function (b, g, k, m, l, t) {
    var n = "",
        e = g.encode;g = g.empty_name_separator;var v = !b[e].length,
        u = 2 === b.type ? "" : f[e](t),
        q,
        y,
        w;y = 0;for (w = b.val.length; y < w; y++) l ? (q = f[e](b.val[y][1].substring(0, l)), 2 === b.type && (u = f[e](b.val[y][0].substring(0, l)))) : v ? (q = f[e](b.val[y][1]), 2 === b.type ? (u = f[e](b.val[y][0]), b[e].push([u, q])) : b[e].push([void 0, q])) : (q = b[e][y][1], 2 === b.type && (u = b[e][y][0])), n && (n += m), k ? n += u + (g || q ? "=" : "") + q : (y || (n += f[e](t) + (g || q ? "=" : "")), 2 === b.type && (n += u + ","), n += q);return n;
  };g.expandUnnamed = function (b, g, k, m, l) {
    var t = "",
        n = g.encode;g = g.empty_name_separator;var e = !b[n].length,
        v,
        u,
        q,
        w;q = 0;for (w = b.val.length; q < w; q++) l ? u = f[n](b.val[q][1].substring(0, l)) : e ? (u = f[n](b.val[q][1]), b[n].push([2 === b.type ? f[n](b.val[q][0]) : void 0, u])) : u = b[n][q][1], t && (t += m), 2 === b.type && (v = l ? f[n](b.val[q][0].substring(0, l)) : b[n][q][0], t += v, t = k ? t + (g || u ? "=" : "") : t + ","), t += u;return t;
  };g.noConflict = function () {
    l.URITemplate === g && (l.URITemplate = b);return g;
  };B.expand = function (b) {
    var f = "";this.parts && this.parts.length || this.parse();
    b instanceof m || (b = new m(b));for (var k = 0, l = this.parts.length; k < l; k++) f += "string" === typeof this.parts[k] ? this.parts[k] : g.expand(this.parts[k], b);return f;
  };B.parse = function () {
    var b = this.expression,
        f = g.EXPRESSION_PATTERN,
        k = g.VARIABLE_PATTERN,
        m = g.VARIABLE_NAME_PATTERN,
        l = [],
        t = 0,
        n,
        e,
        v;for (f.lastIndex = 0;;) {
      e = f.exec(b);if (null === e) {
        l.push(b.substring(t));break;
      } else l.push(b.substring(t, e.index)), t = e.index + e[0].length;if (!w[e[1]]) throw Error("Unknown Operator \"" + e[1] + "\" in \"" + e[0] + "\"");if (!e[3]) throw Error("Unclosed Expression \"" + e[0] + "\"");n = e[2].split(",");for (var u = 0, q = n.length; u < q; u++) {
        v = n[u].match(k);if (null === v) throw Error("Invalid Variable \"" + n[u] + "\" in \"" + e[0] + "\"");if (v[1].match(m)) throw Error("Invalid Variable Name \"" + v[1] + "\" in \"" + e[0] + "\"");n[u] = { name: v[1], explode: !!v[3], maxlength: v[4] && parseInt(v[4], 10) };
      }if (!n.length) throw Error("Expression Missing Variable(s) \"" + e[0] + "\"");l.push({ expression: e[0], operator: e[1], variables: n });
    }l.length || l.push(b);this.parts = l;return this;
  };m.prototype.get = function (b) {
    var f = this.data,
        g = { type: 0, val: [], encode: [], encodeReserved: [] },
        l;if (void 0 !== this.cache[b]) return this.cache[b];this.cache[b] = g;f = "[object Function]" === String(Object.prototype.toString.call(f)) ? f(b) : "[object Function]" === String(Object.prototype.toString.call(f[b])) ? f[b](b) : f[b];if (void 0 !== f && null !== f) if ("[object Array]" === String(Object.prototype.toString.call(f))) {
      l = 0;for (b = f.length; l < b; l++) void 0 !== f[l] && null !== f[l] && g.val.push([void 0, String(f[l])]);g.val.length && (g.type = 3);
    } else if ("[object Object]" === String(Object.prototype.toString.call(f))) {
      for (l in f) k.call(f, l) && void 0 !== f[l] && null !== f[l] && g.val.push([l, String(f[l])]);g.val.length && (g.type = 2);
    } else g.type = 1, g.val.push([void 0, String(f)]);return g;
  };f.expand = function (b, k) {
    var l = new g(b).expand(k);return new f(l);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm9jY29saS1mYXN0LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIklQdjYuanMiLCJTZWNvbmRMZXZlbERvbWFpbnMuanMiLCJVUkkuanMiLCJVUkkubWluLmpzIiwicHVueWNvZGUuanMiLCJzcmMvaGVscGVycy9kZWxheS5qcyIsInNyYy9oZWxwZXJzL2dsb2JhbC1jb250ZXh0LmpzIiwic3JjL2hlbHBlcnMvbWVzc2FnZS1ldmVudC5qcyIsInNyYy9oZWxwZXJzL3VybC10cmFuc2Zvcm0uanMiLCJzcmMvaGVscGVycy93ZWJzb2NrZXQtcHJvcGVydGllcy5qcyIsInNyYy9tYWluLmpzIiwic3JjL21vY2stc2VydmVyLmpzIiwic3JjL21vY2stc29ja2V0LmpzIiwic3JjL3NlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeGdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2poQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBVUkkuanMgLSBNdXRhdGluZyBVUkxzXG4gKiBJUHY2IFN1cHBvcnRcbiAqXG4gKiBWZXJzaW9uOiAxLjE1LjBcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAndXNlIHN0cmljdCc7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZVxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LklQdjYgPSBmYWN0b3J5KHJvb3QpO1xuICB9XG59KSh1bmRlZmluZWQsIGZ1bmN0aW9uIChyb290KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKlxuICB2YXIgX2luID0gXCJmZTgwOjAwMDA6MDAwMDowMDAwOjAyMDQ6NjFmZjpmZTlkOmYxNTZcIjtcbiAgdmFyIF9vdXQgPSBJUHY2LmJlc3QoX2luKTtcbiAgdmFyIF9leHBlY3RlZCA9IFwiZmU4MDo6MjA0OjYxZmY6ZmU5ZDpmMTU2XCI7XG4gICBjb25zb2xlLmxvZyhfaW4sIF9vdXQsIF9leHBlY3RlZCwgX291dCA9PT0gX2V4cGVjdGVkKTtcbiAgKi9cblxuICAvLyBzYXZlIGN1cnJlbnQgSVB2NiB2YXJpYWJsZSwgaWYgYW55XG4gIHZhciBfSVB2NiA9IHJvb3QgJiYgcm9vdC5JUHY2O1xuXG4gIGZ1bmN0aW9uIGJlc3RQcmVzZW50YXRpb24oYWRkcmVzcykge1xuICAgIC8vIGJhc2VkIG9uOlxuICAgIC8vIEphdmFzY3JpcHQgdG8gdGVzdCBhbiBJUHY2IGFkZHJlc3MgZm9yIHByb3BlciBmb3JtYXQsIGFuZCB0b1xuICAgIC8vIHByZXNlbnQgdGhlIFwiYmVzdCB0ZXh0IHJlcHJlc2VudGF0aW9uXCIgYWNjb3JkaW5nIHRvIElFVEYgRHJhZnQgUkZDIGF0XG4gICAgLy8gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaWV0Zi02bWFuLXRleHQtYWRkci1yZXByZXNlbnRhdGlvbi0wNFxuICAgIC8vIDggRmViIDIwMTAgUmljaCBCcm93biwgRGFydHdhcmUsIExMQ1xuICAgIC8vIFBsZWFzZSBmZWVsIGZyZWUgdG8gdXNlIHRoaXMgY29kZSBhcyBsb25nIGFzIHlvdSBwcm92aWRlIGEgbGluayB0b1xuICAgIC8vIGh0dHA6Ly93d3cuaW50ZXJtYXBwZXIuY29tXG4gICAgLy8gaHR0cDovL2ludGVybWFwcGVyLmNvbS9zdXBwb3J0L3Rvb2xzL0lQVjYtVmFsaWRhdG9yLmFzcHhcbiAgICAvLyBodHRwOi8vZG93bmxvYWQuZGFydHdhcmUuY29tL3RoaXJkcGFydHkvaXB2NnZhbGlkYXRvci5qc1xuXG4gICAgdmFyIF9hZGRyZXNzID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBzZWdtZW50cyA9IF9hZGRyZXNzLnNwbGl0KCc6Jyk7XG4gICAgdmFyIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcbiAgICB2YXIgdG90YWwgPSA4O1xuXG4gICAgLy8gdHJpbSBjb2xvbnMgKDo6IG9yIDo6YTpiOmPigKYgb3Ig4oCmYTpiOmM6OilcbiAgICBpZiAoc2VnbWVudHNbMF0gPT09ICcnICYmIHNlZ21lbnRzWzFdID09PSAnJyAmJiBzZWdtZW50c1syXSA9PT0gJycpIHtcbiAgICAgIC8vIG11c3QgaGF2ZSBiZWVuIDo6XG4gICAgICAvLyByZW1vdmUgZmlyc3QgdHdvIGl0ZW1zXG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgICAgc2VnbWVudHMuc2hpZnQoKTtcbiAgICB9IGVsc2UgaWYgKHNlZ21lbnRzWzBdID09PSAnJyAmJiBzZWdtZW50c1sxXSA9PT0gJycpIHtcbiAgICAgIC8vIG11c3QgaGF2ZSBiZWVuIDo6eHh4eFxuICAgICAgLy8gcmVtb3ZlIHRoZSBmaXJzdCBpdGVtXG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudHNbbGVuZ3RoIC0gMV0gPT09ICcnICYmIHNlZ21lbnRzW2xlbmd0aCAtIDJdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4geHh4eDo6XG4gICAgICBzZWdtZW50cy5wb3AoKTtcbiAgICB9XG5cbiAgICBsZW5ndGggPSBzZWdtZW50cy5sZW5ndGg7XG5cbiAgICAvLyBhZGp1c3QgdG90YWwgc2VnbWVudHMgZm9yIElQdjQgdHJhaWxlclxuICAgIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXS5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAvLyBmb3VuZCBhIFwiLlwiIHdoaWNoIG1lYW5zIElQdjRcbiAgICAgIHRvdGFsID0gNztcbiAgICB9XG5cbiAgICAvLyBmaWxsIGVtcHR5IHNlZ21lbnRzIHRoZW0gd2l0aCBcIjAwMDBcIlxuICAgIHZhciBwb3M7XG4gICAgZm9yIChwb3MgPSAwOyBwb3MgPCBsZW5ndGg7IHBvcysrKSB7XG4gICAgICBpZiAoc2VnbWVudHNbcG9zXSA9PT0gJycpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvcyA8IHRvdGFsKSB7XG4gICAgICBzZWdtZW50cy5zcGxpY2UocG9zLCAxLCAnMDAwMCcpO1xuICAgICAgd2hpbGUgKHNlZ21lbnRzLmxlbmd0aCA8IHRvdGFsKSB7XG4gICAgICAgIHNlZ21lbnRzLnNwbGljZShwb3MsIDAsICcwMDAwJyk7XG4gICAgICB9XG5cbiAgICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBzdHJpcCBsZWFkaW5nIHplcm9zXG4gICAgdmFyIF9zZWdtZW50cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsOyBpKyspIHtcbiAgICAgIF9zZWdtZW50cyA9IHNlZ21lbnRzW2ldLnNwbGl0KCcnKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMzsgaisrKSB7XG4gICAgICAgIGlmIChfc2VnbWVudHNbMF0gPT09ICcwJyAmJiBfc2VnbWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIF9zZWdtZW50cy5zcGxpY2UoMCwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VnbWVudHNbaV0gPSBfc2VnbWVudHMuam9pbignJyk7XG4gICAgfVxuXG4gICAgLy8gZmluZCBsb25nZXN0IHNlcXVlbmNlIG9mIHplcm9lcyBhbmQgY29hbGVzY2UgdGhlbSBpbnRvIG9uZSBzZWdtZW50XG4gICAgdmFyIGJlc3QgPSAtMTtcbiAgICB2YXIgX2Jlc3QgPSAwO1xuICAgIHZhciBfY3VycmVudCA9IDA7XG4gICAgdmFyIGN1cnJlbnQgPSAtMTtcbiAgICB2YXIgaW56ZXJvZXMgPSBmYWxzZTtcbiAgICAvLyBpOyBhbHJlYWR5IGRlY2xhcmVkXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgaWYgKGluemVyb2VzKSB7XG4gICAgICAgIGlmIChzZWdtZW50c1tpXSA9PT0gJzAnKSB7XG4gICAgICAgICAgX2N1cnJlbnQgKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnplcm9lcyA9IGZhbHNlO1xuICAgICAgICAgIGlmIChfY3VycmVudCA+IF9iZXN0KSB7XG4gICAgICAgICAgICBiZXN0ID0gY3VycmVudDtcbiAgICAgICAgICAgIF9iZXN0ID0gX2N1cnJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2VnbWVudHNbaV0gPT09ICcwJykge1xuICAgICAgICAgIGluemVyb2VzID0gdHJ1ZTtcbiAgICAgICAgICBjdXJyZW50ID0gaTtcbiAgICAgICAgICBfY3VycmVudCA9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX2N1cnJlbnQgPiBfYmVzdCkge1xuICAgICAgYmVzdCA9IGN1cnJlbnQ7XG4gICAgICBfYmVzdCA9IF9jdXJyZW50O1xuICAgIH1cblxuICAgIGlmIChfYmVzdCA+IDEpIHtcbiAgICAgIHNlZ21lbnRzLnNwbGljZShiZXN0LCBfYmVzdCwgJycpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIC8vIGFzc2VtYmxlIHJlbWFpbmluZyBzZWdtZW50c1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICBpZiAoc2VnbWVudHNbMF0gPT09ICcnKSB7XG4gICAgICByZXN1bHQgPSAnOic7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gc2VnbWVudHNbaV07XG4gICAgICBpZiAoaSA9PT0gbGVuZ3RoIC0gMSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmVzdWx0ICs9ICc6JztcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudHNbbGVuZ3RoIC0gMV0gPT09ICcnKSB7XG4gICAgICByZXN1bHQgKz0gJzonO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBub0NvbmZsaWN0KCkge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSAqL1xuICAgIGlmIChyb290LklQdjYgPT09IHRoaXMpIHtcbiAgICAgIHJvb3QuSVB2NiA9IF9JUHY2O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiZXN0OiBiZXN0UHJlc2VudGF0aW9uLFxuICAgIG5vQ29uZmxpY3Q6IG5vQ29uZmxpY3RcbiAgfTtcbn0pOyIsIi8qIVxuICogVVJJLmpzIC0gTXV0YXRpbmcgVVJMc1xuICogU2Vjb25kIExldmVsIERvbWFpbiAoU0xEKSBTdXBwb3J0XG4gKlxuICogVmVyc2lvbjogMS4xNS4wXG4gKlxuICogQXV0aG9yOiBSb2RuZXkgUmVobVxuICogV2ViOiBodHRwOi8vbWVkaWFsaXplLmdpdGh1Yi5pby9VUkkuanMvXG4gKlxuICogTGljZW5zZWQgdW5kZXJcbiAqICAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZVxuICogICBHUEwgdjMgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0dQTC0zLjBcbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPSBmYWN0b3J5KHJvb3QpO1xuICB9XG59KSh1bmRlZmluZWQsIGZ1bmN0aW9uIChyb290KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBzYXZlIGN1cnJlbnQgU2Vjb25kTGV2ZWxEb21haW5zIHZhcmlhYmxlLCBpZiBhbnlcbiAgdmFyIF9TZWNvbmRMZXZlbERvbWFpbnMgPSByb290ICYmIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zO1xuXG4gIHZhciBTTEQgPSB7XG4gICAgLy8gbGlzdCBvZiBrbm93biBTZWNvbmQgTGV2ZWwgRG9tYWluc1xuICAgIC8vIGNvbnZlcnRlZCBsaXN0IG9mIFNMRHMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZ2F2aW5nbWlsbGVyL3NlY29uZC1sZXZlbC1kb21haW5zXG4gICAgLy8gLS0tLVxuICAgIC8vIHB1YmxpY3N1ZmZpeC5vcmcgaXMgbW9yZSBjdXJyZW50IGFuZCBhY3R1YWxseSB1c2VkIGJ5IGEgY291cGxlIG9mIGJyb3dzZXJzIGludGVybmFsbHkuXG4gICAgLy8gZG93bnNpZGUgaXMgaXQgYWxzbyBjb250YWlucyBkb21haW5zIGxpa2UgXCJkeW5kbnMub3JnXCIgLSB3aGljaCBpcyBmaW5lIGZvciB0aGUgc2VjdXJpdHlcbiAgICAvLyBpc3N1ZXMgYnJvd3NlciBoYXZlIHRvIGRlYWwgd2l0aCAoU09QIGZvciBjb29raWVzLCBldGMpIC0gYnV0IGlzIHdheSBvdmVyYm9hcmQgZm9yIFVSSS5qc1xuICAgIC8vIC0tLS1cbiAgICBsaXN0OiB7XG4gICAgICAnYWMnOiAnIGNvbSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdhZSc6ICcgYWMgY28gZ292IG1pbCBuYW1lIG5ldCBvcmcgcHJvIHNjaCAnLFxuICAgICAgJ2FmJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnYWwnOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnYW8nOiAnIGNvIGVkIGd2IGl0IG9nIHBiICcsXG4gICAgICAnYXInOiAnIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHVyICcsXG4gICAgICAnYXQnOiAnIGFjIGNvIGd2IG9yICcsXG4gICAgICAnYXUnOiAnIGFzbiBjb20gY3Npcm8gZWR1IGdvdiBpZCBuZXQgb3JnICcsXG4gICAgICAnYmEnOiAnIGNvIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIHJzIHVuYmkgdW5tbyB1bnNhIHVudHogdW56ZSAnLFxuICAgICAgJ2JiJzogJyBiaXogY28gY29tIGVkdSBnb3YgaW5mbyBuZXQgb3JnIHN0b3JlIHR2ICcsXG4gICAgICAnYmgnOiAnIGJpeiBjYyBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgJyxcbiAgICAgICdibic6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2JvJzogJyBjb20gZWR1IGdvYiBnb3YgaW50IG1pbCBuZXQgb3JnIHR2ICcsXG4gICAgICAnYnInOiAnIGFkbSBhZHYgYWdyIGFtIGFycSBhcnQgYXRvIGIgYmlvIGJsb2cgYm1kIGNpbSBjbmcgY250IGNvbSBjb29wIGVjbiBlZHUgZW5nIGVzcCBldGMgZXRpIGZhciBmbG9nIGZtIGZuZCBmb3QgZnN0IGcxMiBnZ2YgZ292IGltYiBpbmQgaW5mIGpvciBqdXMgbGVsIG1hdCBtZWQgbWlsIG11cyBuZXQgbm9tIG5vdCBudHIgb2RvIG9yZyBwcGcgcHJvIHBzYyBwc2kgcXNsIHJlYyBzbGcgc3J2IHRtcCB0cmQgdHVyIHR2IHZldCB2bG9nIHdpa2kgemxnICcsXG4gICAgICAnYnMnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdieic6ICcgZHUgZXQgb20gb3YgcmcgJyxcbiAgICAgICdjYSc6ICcgYWIgYmMgbWIgbmIgbmYgbmwgbnMgbnQgbnUgb24gcGUgcWMgc2sgeWsgJyxcbiAgICAgICdjayc6ICcgYml6IGNvIGVkdSBnZW4gZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ2NuJzogJyBhYyBhaCBiaiBjb20gY3EgZWR1IGZqIGdkIGdvdiBncyBneCBneiBoYSBoYiBoZSBoaSBobCBobiBqbCBqcyBqeCBsbiBtaWwgbmV0IG5tIG54IG9yZyBxaCBzYyBzZCBzaCBzbiBzeCB0aiB0dyB4aiB4eiB5biB6aiAnLFxuICAgICAgJ2NvJzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG5vbSBvcmcgJyxcbiAgICAgICdjcic6ICcgYWMgYyBjbyBlZCBmaSBnbyBvciBzYSAnLFxuICAgICAgJ2N5JzogJyBhYyBiaXogY29tIGVrbG9nZXMgZ292IGx0ZCBuYW1lIG5ldCBvcmcgcGFybGlhbWVudCBwcmVzcyBwcm8gdG0gJyxcbiAgICAgICdkbyc6ICcgYXJ0IGNvbSBlZHUgZ29iIGdvdiBtaWwgbmV0IG9yZyBzbGQgd2ViICcsXG4gICAgICAnZHonOiAnIGFydCBhc3NvIGNvbSBlZHUgZ292IG5ldCBvcmcgcG9sICcsXG4gICAgICAnZWMnOiAnIGNvbSBlZHUgZmluIGdvdiBpbmZvIG1lZCBtaWwgbmV0IG9yZyBwcm8gJyxcbiAgICAgICdlZyc6ICcgY29tIGVkdSBldW4gZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NpICcsXG4gICAgICAnZXInOiAnIGNvbSBlZHUgZ292IGluZCBtaWwgbmV0IG9yZyByb2NoZXN0IHcgJyxcbiAgICAgICdlcyc6ICcgY29tIGVkdSBnb2Igbm9tIG9yZyAnLFxuICAgICAgJ2V0JzogJyBiaXogY29tIGVkdSBnb3YgaW5mbyBuYW1lIG5ldCBvcmcgJyxcbiAgICAgICdmaic6ICcgYWMgYml6IGNvbSBpbmZvIG1pbCBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnZmsnOiAnIGFjIGNvIGdvdiBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ2ZyJzogJyBhc3NvIGNvbSBmIGdvdXYgbm9tIHByZCBwcmVzc2UgdG0gJyxcbiAgICAgICdnZyc6ICcgY28gbmV0IG9yZyAnLFxuICAgICAgJ2doJzogJyBjb20gZWR1IGdvdiBtaWwgb3JnICcsXG4gICAgICAnZ24nOiAnIGFjIGNvbSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2dyJzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2d0JzogJyBjb20gZWR1IGdvYiBpbmQgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdndSc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2hrJzogJyBjb20gZWR1IGdvdiBpZHYgbmV0IG9yZyAnLFxuICAgICAgJ2h1JzogJyAyMDAwIGFncmFyIGJvbHQgY2FzaW5vIGNpdHkgY28gZXJvdGljYSBlcm90aWthIGZpbG0gZm9ydW0gZ2FtZXMgaG90ZWwgaW5mbyBpbmdhdGxhbiBqb2dhc3oga29ueXZlbG8gbGFrYXMgbWVkaWEgbmV3cyBvcmcgcHJpdiByZWtsYW0gc2V4IHNob3Agc3BvcnQgc3VsaSBzemV4IHRtIHRvenNkZSB1dGF6YXMgdmlkZW8gJyxcbiAgICAgICdpZCc6ICcgYWMgY28gZ28gbWlsIG5ldCBvciBzY2ggd2ViICcsXG4gICAgICAnaWwnOiAnIGFjIGNvIGdvdiBpZGYgazEyIG11bmkgbmV0IG9yZyAnLFxuICAgICAgJ2luJzogJyBhYyBjbyBlZHUgZXJuZXQgZmlybSBnZW4gZ292IGkgaW5kIG1pbCBuZXQgbmljIG9yZyByZXMgJyxcbiAgICAgICdpcSc6ICcgY29tIGVkdSBnb3YgaSBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2lyJzogJyBhYyBjbyBkbnNzZWMgZ292IGkgaWQgbmV0IG9yZyBzY2ggJyxcbiAgICAgICdpdCc6ICcgZWR1IGdvdiAnLFxuICAgICAgJ2plJzogJyBjbyBuZXQgb3JnICcsXG4gICAgICAnam8nOiAnIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoICcsXG4gICAgICAnanAnOiAnIGFjIGFkIGNvIGVkIGdvIGdyIGxnIG5lIG9yICcsXG4gICAgICAna2UnOiAnIGFjIGNvIGdvIGluZm8gbWUgbW9iaSBuZSBvciBzYyAnLFxuICAgICAgJ2toJzogJyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBwZXIgJyxcbiAgICAgICdraSc6ICcgYml6IGNvbSBkZSBlZHUgZ292IGluZm8gbW9iIG5ldCBvcmcgdGVsICcsXG4gICAgICAna20nOiAnIGFzc28gY29tIGNvb3AgZWR1IGdvdXYgayBtZWRlY2luIG1pbCBub20gbm90YWlyZXMgcGhhcm1hY2llbnMgcHJlc3NlIHRtIHZldGVyaW5haXJlICcsXG4gICAgICAna24nOiAnIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2tyJzogJyBhYyBidXNhbiBjaHVuZ2J1ayBjaHVuZ25hbSBjbyBkYWVndSBkYWVqZW9uIGVzIGdhbmd3b24gZ28gZ3dhbmdqdSBneWVvbmdidWsgZ3llb25nZ2kgZ3llb25nbmFtIGhzIGluY2hlb24gamVqdSBqZW9uYnVrIGplb25uYW0gayBrZyBtaWwgbXMgbmUgb3IgcGUgcmUgc2Mgc2VvdWwgdWxzYW4gJyxcbiAgICAgICdrdyc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2t5JzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAna3onOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnbGInOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdsayc6ICcgYXNzbiBjb20gZWR1IGdvdiBncnAgaG90ZWwgaW50IGx0ZCBuZXQgbmdvIG9yZyBzY2ggc29jIHdlYiAnLFxuICAgICAgJ2xyJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbHYnOiAnIGFzbiBjb20gY29uZiBlZHUgZ292IGlkIG1pbCBuZXQgb3JnICcsXG4gICAgICAnbHknOiAnIGNvbSBlZHUgZ292IGlkIG1lZCBuZXQgb3JnIHBsYyBzY2ggJyxcbiAgICAgICdtYSc6ICcgYWMgY28gZ292IG0gbmV0IG9yZyBwcmVzcyAnLFxuICAgICAgJ21jJzogJyBhc3NvIHRtICcsXG4gICAgICAnbWUnOiAnIGFjIGNvIGVkdSBnb3YgaXRzIG5ldCBvcmcgcHJpdiAnLFxuICAgICAgJ21nJzogJyBjb20gZWR1IGdvdiBtaWwgbm9tIG9yZyBwcmQgdG0gJyxcbiAgICAgICdtayc6ICcgY29tIGVkdSBnb3YgaW5mIG5hbWUgbmV0IG9yZyBwcm8gJyxcbiAgICAgICdtbCc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyBwcmVzc2UgJyxcbiAgICAgICdtbic6ICcgZWR1IGdvdiBvcmcgJyxcbiAgICAgICdtbyc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ210JzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbXYnOiAnIGFlcm8gYml6IGNvbSBjb29wIGVkdSBnb3YgaW5mbyBpbnQgbWlsIG11c2V1bSBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnbXcnOiAnIGFjIGNvIGNvbSBjb29wIGVkdSBnb3YgaW50IG11c2V1bSBuZXQgb3JnICcsXG4gICAgICAnbXgnOiAnIGNvbSBlZHUgZ29iIG5ldCBvcmcgJyxcbiAgICAgICdteSc6ICcgY29tIGVkdSBnb3YgbWlsIG5hbWUgbmV0IG9yZyBzY2ggJyxcbiAgICAgICduZic6ICcgYXJ0cyBjb20gZmlybSBpbmZvIG5ldCBvdGhlciBwZXIgcmVjIHN0b3JlIHdlYiAnLFxuICAgICAgJ25nJzogJyBiaXogY29tIGVkdSBnb3YgbWlsIG1vYmkgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ25pJzogJyBhYyBjbyBjb20gZWR1IGdvYiBtaWwgbmV0IG5vbSBvcmcgJyxcbiAgICAgICducCc6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICducic6ICcgYml6IGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ29tJzogJyBhYyBiaXogY28gY29tIGVkdSBnb3YgbWVkIG1pbCBtdXNldW0gbmV0IG9yZyBwcm8gc2NoICcsXG4gICAgICAncGUnOiAnIGNvbSBlZHUgZ29iIG1pbCBuZXQgbm9tIG9yZyBzbGQgJyxcbiAgICAgICdwaCc6ICcgY29tIGVkdSBnb3YgaSBtaWwgbmV0IG5nbyBvcmcgJyxcbiAgICAgICdwayc6ICcgYml6IGNvbSBlZHUgZmFtIGdvYiBnb2sgZ29uIGdvcCBnb3MgZ292IG5ldCBvcmcgd2ViICcsXG4gICAgICAncGwnOiAnIGFydCBiaWFseXN0b2sgYml6IGNvbSBlZHUgZ2RhIGdkYW5zayBnb3J6b3cgZ292IGluZm8ga2F0b3dpY2Uga3Jha293IGxvZHogbHVibGluIG1pbCBuZXQgbmdvIG9sc3p0eW4gb3JnIHBvem5hbiBwd3IgcmFkb20gc2x1cHNrIHN6Y3plY2luIHRvcnVuIHdhcnN6YXdhIHdhdyB3cm9jIHdyb2NsYXcgemdvcmEgJyxcbiAgICAgICdwcic6ICcgYWMgYml6IGNvbSBlZHUgZXN0IGdvdiBpbmZvIGlzbGEgbmFtZSBuZXQgb3JnIHBybyBwcm9mICcsXG4gICAgICAncHMnOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgcGxvIHNlYyAnLFxuICAgICAgJ3B3JzogJyBiZWxhdSBjbyBlZCBnbyBuZSBvciAnLFxuICAgICAgJ3JvJzogJyBhcnRzIGNvbSBmaXJtIGluZm8gbm9tIG50IG9yZyByZWMgc3RvcmUgdG0gd3d3ICcsXG4gICAgICAncnMnOiAnIGFjIGNvIGVkdSBnb3YgaW4gb3JnICcsXG4gICAgICAnc2InOiAnIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdzYyc6ICcgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3NoJzogJyBjbyBjb20gZWR1IGdvdiBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ3NsJzogJyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnc3QnOiAnIGNvIGNvbSBjb25zdWxhZG8gZWR1IGVtYmFpeGFkYSBnb3YgbWlsIG5ldCBvcmcgcHJpbmNpcGUgc2FvdG9tZSBzdG9yZSAnLFxuICAgICAgJ3N2JzogJyBjb20gZWR1IGdvYiBvcmcgcmVkICcsXG4gICAgICAnc3onOiAnIGFjIGNvIG9yZyAnLFxuICAgICAgJ3RyJzogJyBhdiBiYnMgYmVsIGJpeiBjb20gZHIgZWR1IGdlbiBnb3YgaW5mbyBrMTIgbmFtZSBuZXQgb3JnIHBvbCB0ZWwgdHNrIHR2IHdlYiAnLFxuICAgICAgJ3R0JzogJyBhZXJvIGJpeiBjYXQgY28gY29tIGNvb3AgZWR1IGdvdiBpbmZvIGludCBqb2JzIG1pbCBtb2JpIG11c2V1bSBuYW1lIG5ldCBvcmcgcHJvIHRlbCB0cmF2ZWwgJyxcbiAgICAgICd0dyc6ICcgY2x1YiBjb20gZWJpeiBlZHUgZ2FtZSBnb3YgaWR2IG1pbCBuZXQgb3JnICcsXG4gICAgICAnbXUnOiAnIGFjIGNvIGNvbSBnb3YgbmV0IG9yIG9yZyAnLFxuICAgICAgJ216JzogJyBhYyBjbyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ25hJzogJyBjbyBjb20gJyxcbiAgICAgICdueic6ICcgYWMgY28gY3JpIGdlZWsgZ2VuIGdvdnQgaGVhbHRoIGl3aSBtYW9yaSBtaWwgbmV0IG9yZyBwYXJsaWFtZW50IHNjaG9vbCAnLFxuICAgICAgJ3BhJzogJyBhYm8gYWMgY29tIGVkdSBnb2IgaW5nIG1lZCBuZXQgbm9tIG9yZyBzbGQgJyxcbiAgICAgICdwdCc6ICcgY29tIGVkdSBnb3YgaW50IG5ldCBub21lIG9yZyBwdWJsICcsXG4gICAgICAncHknOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAncWEnOiAnIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAncmUnOiAnIGFzc28gY29tIG5vbSAnLFxuICAgICAgJ3J1JzogJyBhYyBhZHlnZXlhIGFsdGFpIGFtdXIgYXJraGFuZ2Vsc2sgYXN0cmFraGFuIGJhc2hraXJpYSBiZWxnb3JvZCBiaXIgYnJ5YW5zayBidXJ5YXRpYSBjYmcgY2hlbCBjaGVseWFiaW5zayBjaGl0YSBjaHVrb3RrYSBjaHV2YXNoaWEgY29tIGRhZ2VzdGFuIGUtYnVyZyBlZHUgZ292IGdyb3pueSBpbnQgaXJrdXRzayBpdmFub3ZvIGl6aGV2c2sgamFyIGpvc2hrYXItb2xhIGthbG15a2lhIGthbHVnYSBrYW1jaGF0a2Ega2FyZWxpYSBrYXphbiBrY2hyIGtlbWVyb3ZvIGtoYWJhcm92c2sga2hha2Fzc2lhIGtodiBraXJvdiBrb2VuaWcga29taSBrb3N0cm9tYSBrcmFub3lhcnNrIGt1YmFuIGt1cmdhbiBrdXJzayBsaXBldHNrIG1hZ2FkYW4gbWFyaSBtYXJpLWVsIG1hcmluZSBtaWwgbW9yZG92aWEgbW9zcmVnIG1zayBtdXJtYW5zayBuYWxjaGlrIG5ldCBubm92IG5vdiBub3Zvc2liaXJzayBuc2sgb21zayBvcmVuYnVyZyBvcmcgb3J5b2wgcGVuemEgcGVybSBwcCBwc2tvdiBwdHogcm5kIHJ5YXphbiBzYWtoYWxpbiBzYW1hcmEgc2FyYXRvdiBzaW1iaXJzayBzbW9sZW5zayBzcGIgc3RhdnJvcG9sIHN0diBzdXJndXQgdGFtYm92IHRhdGFyc3RhbiB0b20gdG9tc2sgdHNhcml0c3luIHRzayB0dWxhIHR1dmEgdHZlciB0eXVtZW4gdWRtIHVkbXVydGlhIHVsYW4tdWRlIHZsYWRpa2F2a2F6IHZsYWRpbWlyIHZsYWRpdm9zdG9rIHZvbGdvZ3JhZCB2b2xvZ2RhIHZvcm9uZXpoIHZybiB2eWF0a2EgeWFrdXRpYSB5YW1hbCB5ZWthdGVyaW5idXJnIHl1emhuby1zYWtoYWxpbnNrICcsXG4gICAgICAncncnOiAnIGFjIGNvIGNvbSBlZHUgZ291diBnb3YgaW50IG1pbCBuZXQgJyxcbiAgICAgICdzYSc6ICcgY29tIGVkdSBnb3YgbWVkIG5ldCBvcmcgcHViIHNjaCAnLFxuICAgICAgJ3NkJzogJyBjb20gZWR1IGdvdiBpbmZvIG1lZCBuZXQgb3JnIHR2ICcsXG4gICAgICAnc2UnOiAnIGEgYWMgYiBiZCBjIGQgZSBmIGcgaCBpIGsgbCBtIG4gbyBvcmcgcCBwYXJ0aSBwcCBwcmVzcyByIHMgdCB0bSB1IHcgeCB5IHogJyxcbiAgICAgICdzZyc6ICcgY29tIGVkdSBnb3YgaWRuIG5ldCBvcmcgcGVyICcsXG4gICAgICAnc24nOiAnIGFydCBjb20gZWR1IGdvdXYgb3JnIHBlcnNvIHVuaXYgJyxcbiAgICAgICdzeSc6ICcgY29tIGVkdSBnb3YgbWlsIG5ldCBuZXdzIG9yZyAnLFxuICAgICAgJ3RoJzogJyBhYyBjbyBnbyBpbiBtaSBuZXQgb3IgJyxcbiAgICAgICd0aic6ICcgYWMgYml6IGNvIGNvbSBlZHUgZ28gZ292IGluZm8gaW50IG1pbCBuYW1lIG5ldCBuaWMgb3JnIHRlc3Qgd2ViICcsXG4gICAgICAndG4nOiAnIGFncmluZXQgY29tIGRlZmVuc2UgZWR1bmV0IGVucyBmaW4gZ292IGluZCBpbmZvIGludGwgbWluY29tIG5hdCBuZXQgb3JnIHBlcnNvIHJucnQgcm5zIHJudSB0b3VyaXNtICcsXG4gICAgICAndHonOiAnIGFjIGNvIGdvIG5lIG9yICcsXG4gICAgICAndWEnOiAnIGJpeiBjaGVya2Fzc3kgY2hlcm5pZ292IGNoZXJub3Z0c3kgY2sgY24gY28gY29tIGNyaW1lYSBjdiBkbiBkbmVwcm9wZXRyb3ZzayBkb25ldHNrIGRwIGVkdSBnb3YgaWYgaW4gaXZhbm8tZnJhbmtpdnNrIGtoIGtoYXJrb3Yga2hlcnNvbiBraG1lbG5pdHNraXkga2lldiBraXJvdm9ncmFkIGttIGtyIGtzIGt2IGxnIGx1Z2Fuc2sgbHV0c2sgbHZpdiBtZSBtayBuZXQgbmlrb2xhZXYgb2Qgb2Rlc3NhIG9yZyBwbCBwb2x0YXZhIHBwIHJvdm5vIHJ2IHNlYmFzdG9wb2wgc3VteSB0ZSB0ZXJub3BpbCB1emhnb3JvZCB2aW5uaWNhIHZuIHphcG9yaXpoemhlIHpoaXRvbWlyIHpwIHp0ICcsXG4gICAgICAndWcnOiAnIGFjIGNvIGdvIG5lIG9yIG9yZyBzYyAnLFxuICAgICAgJ3VrJzogJyBhYyBibCBicml0aXNoLWxpYnJhcnkgY28gY3ltIGdvdiBnb3Z0IGljbmV0IGpldCBsZWEgbHRkIG1lIG1pbCBtb2QgbmF0aW9uYWwtbGlicmFyeS1zY290bGFuZCBuZWwgbmV0IG5ocyBuaWMgbmxzIG9yZyBvcmduIHBhcmxpYW1lbnQgcGxjIHBvbGljZSBzY2ggc2NvdCBzb2MgJyxcbiAgICAgICd1cyc6ICcgZG5pIGZlZCBpc2Ega2lkcyBuc24gJyxcbiAgICAgICd1eSc6ICcgY29tIGVkdSBndWIgbWlsIG5ldCBvcmcgJyxcbiAgICAgICd2ZSc6ICcgY28gY29tIGVkdSBnb2IgaW5mbyBtaWwgbmV0IG9yZyB3ZWIgJyxcbiAgICAgICd2aSc6ICcgY28gY29tIGsxMiBuZXQgb3JnICcsXG4gICAgICAndm4nOiAnIGFjIGJpeiBjb20gZWR1IGdvdiBoZWFsdGggaW5mbyBpbnQgbmFtZSBuZXQgb3JnIHBybyAnLFxuICAgICAgJ3llJzogJyBjbyBjb20gZ292IGx0ZCBtZSBuZXQgb3JnIHBsYyAnLFxuICAgICAgJ3l1JzogJyBhYyBjbyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ3phJzogJyBhYyBhZ3JpYyBhbHQgYm91cnNlIGNpdHkgY28gY3liZXJuZXQgZGIgZWR1IGdvdiBncm9uZGFyIGlhY2Nlc3MgaW10IGluY2EgbGFuZGVzaWduIGxhdyBtaWwgbmV0IG5nbyBuaXMgbm9tIG9saXZldHRpIG9yZyBwaXggc2Nob29sIHRtIHdlYiAnLFxuICAgICAgJ3ptJzogJyBhYyBjbyBjb20gZWR1IGdvdiBuZXQgb3JnIHNjaCAnXG4gICAgfSxcbiAgICAvLyBnb3JoaWxsIDIwMTMtMTAtMjU6IFVzaW5nIGluZGV4T2YoKSBpbnN0ZWFkIFJlZ2V4cCgpLiBTaWduaWZpY2FudCBib29zdFxuICAgIC8vIGluIGJvdGggcGVyZm9ybWFuY2UgYW5kIG1lbW9yeSBmb290cHJpbnQuIE5vIGluaXRpYWxpemF0aW9uIHJlcXVpcmVkLlxuICAgIC8vIGh0dHA6Ly9qc3BlcmYuY29tL3VyaS1qcy1zbGQtcmVnZXgtdnMtYmluYXJ5LXNlYXJjaC80XG4gICAgLy8gRm9sbG93aW5nIG1ldGhvZHMgdXNlIGxhc3RJbmRleE9mKCkgcmF0aGVyIHRoYW4gYXJyYXkuc3BsaXQoKSBpbiBvcmRlclxuICAgIC8vIHRvIGF2b2lkIGFueSBtZW1vcnkgYWxsb2NhdGlvbnMuXG4gICAgaGFzOiBmdW5jdGlvbiBoYXMoZG9tYWluKSB7XG4gICAgICB2YXIgdGxkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICBpZiAodGxkT2Zmc2V0IDw9IDAgfHwgdGxkT2Zmc2V0ID49IGRvbWFpbi5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQgLSAxKTtcbiAgICAgIGlmIChzbGRPZmZzZXQgPD0gMCB8fCBzbGRPZmZzZXQgPj0gdGxkT2Zmc2V0IC0gMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgc2xkTGlzdCA9IFNMRC5saXN0W2RvbWFpbi5zbGljZSh0bGRPZmZzZXQgKyAxKV07XG4gICAgICBpZiAoIXNsZExpc3QpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNsZExpc3QuaW5kZXhPZignICcgKyBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0ICsgMSwgdGxkT2Zmc2V0KSArICcgJykgPj0gMDtcbiAgICB9LFxuICAgIGlzOiBmdW5jdGlvbiBpcyhkb21haW4pIHtcbiAgICAgIHZhciB0bGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIGlmICh0bGRPZmZzZXQgPD0gMCB8fCB0bGRPZmZzZXQgPj0gZG9tYWluLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicsIHRsZE9mZnNldCAtIDEpO1xuICAgICAgaWYgKHNsZE9mZnNldCA+PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRMaXN0ID0gU0xELmxpc3RbZG9tYWluLnNsaWNlKHRsZE9mZnNldCArIDEpXTtcbiAgICAgIGlmICghc2xkTGlzdCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xkTGlzdC5pbmRleE9mKCcgJyArIGRvbWFpbi5zbGljZSgwLCB0bGRPZmZzZXQpICsgJyAnKSA+PSAwO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoZG9tYWluKSB7XG4gICAgICB2YXIgdGxkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICBpZiAodGxkT2Zmc2V0IDw9IDAgfHwgdGxkT2Zmc2V0ID49IGRvbWFpbi5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIHNsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicsIHRsZE9mZnNldCAtIDEpO1xuICAgICAgaWYgKHNsZE9mZnNldCA8PSAwIHx8IHNsZE9mZnNldCA+PSB0bGRPZmZzZXQgLSAxKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdmFyIHNsZExpc3QgPSBTTEQubGlzdFtkb21haW4uc2xpY2UodGxkT2Zmc2V0ICsgMSldO1xuICAgICAgaWYgKCFzbGRMaXN0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHNsZExpc3QuaW5kZXhPZignICcgKyBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0ICsgMSwgdGxkT2Zmc2V0KSArICcgJykgPCAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRvbWFpbi5zbGljZShzbGRPZmZzZXQgKyAxKTtcbiAgICB9LFxuICAgIG5vQ29uZmxpY3Q6IGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgICBpZiAocm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPT09IHRoaXMpIHtcbiAgICAgICAgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPSBfU2Vjb25kTGV2ZWxEb21haW5zO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTTEQ7XG59KTsiLCIvKiFcbiAqIFVSSS5qcyAtIE11dGF0aW5nIFVSTHNcbiAqXG4gKiBWZXJzaW9uOiAxLjE1LjBcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnLi9wdW55Y29kZScpLCByZXF1aXJlKCcuL0lQdjYnKSwgcmVxdWlyZSgnLi9TZWNvbmRMZXZlbERvbWFpbnMnKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbJy4vcHVueWNvZGUnLCAnLi9JUHY2JywgJy4vU2Vjb25kTGV2ZWxEb21haW5zJ10sIGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5VUkkgPSBmYWN0b3J5KHJvb3QucHVueWNvZGUsIHJvb3QuSVB2Niwgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMsIHJvb3QpO1xuICB9XG59KSh1bmRlZmluZWQsIGZ1bmN0aW9uIChwdW55Y29kZSwgSVB2NiwgU0xELCByb290KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLypnbG9iYWwgbG9jYXRpb24sIGVzY2FwZSwgdW5lc2NhcGUgKi9cbiAgLy8gRklYTUU6IHYyLjAuMCByZW5hbWNlIG5vbi1jYW1lbENhc2UgcHJvcGVydGllcyB0byB1cHBlcmNhc2VcbiAgLypqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZSAqL1xuXG4gIC8vIHNhdmUgY3VycmVudCBVUkkgdmFyaWFibGUsIGlmIGFueVxuICB2YXIgX1VSSSA9IHJvb3QgJiYgcm9vdC5VUkk7XG5cbiAgZnVuY3Rpb24gVVJJKHVybCwgYmFzZSkge1xuICAgIC8vIEFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCB0aGUgJ25ldycga2V5d29yZFxuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBVUkkpKSB7XG4gICAgICByZXR1cm4gbmV3IFVSSSh1cmwsIGJhc2UpO1xuICAgIH1cblxuICAgIGlmICh1cmwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndW5kZWZpbmVkIGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50IGZvciBVUkknKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsb2NhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdXJsID0gbG9jYXRpb24uaHJlZiArICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXJsID0gJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ocmVmKHVybCk7XG5cbiAgICAvLyByZXNvbHZlIHRvIGJhc2UgYWNjb3JkaW5nIHRvIGh0dHA6Ly9kdmNzLnczLm9yZy9oZy91cmwvcmF3LWZpbGUvdGlwL092ZXJ2aWV3Lmh0bWwjY29uc3RydWN0b3JcbiAgICBpZiAoYmFzZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5hYnNvbHV0ZVRvKGJhc2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgVVJJLnZlcnNpb24gPSAnMS4xNS4wJztcblxuICB2YXIgcCA9IFVSSS5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4KHN0cmluZykge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2NvbW1pdC84NWFjMjE3ODNjMTFmOGNjYWIwNjEwNmRiYTk3MzVhMzFhODY5MjRkI2NvbW1pdGNvbW1lbnQtODIxOTYzXG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oWy4qKz9ePSE6JHt9KCl8W1xcXVxcL1xcXFxdKS9nLCAnXFxcXCQxJyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUeXBlKHZhbHVlKSB7XG4gICAgLy8gSUU4IGRvZXNuJ3QgcmV0dXJuIFtPYmplY3QgVW5kZWZpbmVkXSBidXQgW09iamVjdCBPYmplY3RdIGZvciB1bmRlZmluZWQgdmFsdWVcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICdVbmRlZmluZWQnO1xuICAgIH1cblxuICAgIHJldHVybiBTdHJpbmcoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSkuc2xpY2UoOCwgLTEpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gZ2V0VHlwZShvYmopID09PSAnQXJyYXknO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsdGVyQXJyYXlWYWx1ZXMoZGF0YSwgdmFsdWUpIHtcbiAgICB2YXIgbG9va3VwID0ge307XG4gICAgdmFyIGksIGxlbmd0aDtcblxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbG9va3VwW3ZhbHVlW2ldXSA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvb2t1cFt2YWx1ZV0gPSB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsb29rdXBbZGF0YVtpXV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhLnNwbGljZShpLCAxKTtcbiAgICAgICAgbGVuZ3RoLS07XG4gICAgICAgIGktLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5Q29udGFpbnMobGlzdCwgdmFsdWUpIHtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuXG4gICAgLy8gdmFsdWUgbWF5IGJlIHN0cmluZywgbnVtYmVyLCBhcnJheSwgcmVnZXhwXG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAvLyBOb3RlOiB0aGlzIGNhbiBiZSBvcHRpbWl6ZWQgdG8gTyhuKSAoaW5zdGVhZCBvZiBjdXJyZW50IE8obSAqIG4pKVxuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFhcnJheUNvbnRhaW5zKGxpc3QsIHZhbHVlW2ldKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgX3R5cGUgPSBnZXRUeXBlKHZhbHVlKTtcbiAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoX3R5cGUgPT09ICdSZWdFeHAnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdFtpXSA9PT0gJ3N0cmluZycgJiYgbGlzdFtpXS5tYXRjaCh2YWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChsaXN0W2ldID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhcnJheXNFcXVhbChvbmUsIHR3bykge1xuICAgIGlmICghaXNBcnJheShvbmUpIHx8ICFpc0FycmF5KHR3bykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBhcnJheXMgY2FuJ3QgYmUgZXF1YWwgaWYgdGhleSBoYXZlIGRpZmZlcmVudCBhbW91bnQgb2YgY29udGVudFxuICAgIGlmIChvbmUubGVuZ3RoICE9PSB0d28ubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgb25lLnNvcnQoKTtcbiAgICB0d28uc29ydCgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvbmUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAob25lW2ldICE9PSB0d29baV0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgVVJJLl9wYXJ0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvdG9jb2w6IG51bGwsXG4gICAgICB1c2VybmFtZTogbnVsbCxcbiAgICAgIHBhc3N3b3JkOiBudWxsLFxuICAgICAgaG9zdG5hbWU6IG51bGwsXG4gICAgICB1cm46IG51bGwsXG4gICAgICBwb3J0OiBudWxsLFxuICAgICAgcGF0aDogbnVsbCxcbiAgICAgIHF1ZXJ5OiBudWxsLFxuICAgICAgZnJhZ21lbnQ6IG51bGwsXG4gICAgICAvLyBzdGF0ZVxuICAgICAgZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzOiBVUkkuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLFxuICAgICAgZXNjYXBlUXVlcnlTcGFjZTogVVJJLmVzY2FwZVF1ZXJ5U3BhY2VcbiAgICB9O1xuICB9O1xuICAvLyBzdGF0ZTogYWxsb3cgZHVwbGljYXRlIHF1ZXJ5IHBhcmFtZXRlcnMgKGE9MSZhPTEpXG4gIFVSSS5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSBmYWxzZTtcbiAgLy8gc3RhdGU6IHJlcGxhY2VzICsgd2l0aCAlMjAgKHNwYWNlIGluIHF1ZXJ5IHN0cmluZ3MpXG4gIFVSSS5lc2NhcGVRdWVyeVNwYWNlID0gdHJ1ZTtcbiAgLy8gc3RhdGljIHByb3BlcnRpZXNcbiAgVVJJLnByb3RvY29sX2V4cHJlc3Npb24gPSAvXlthLXpdW2EtejAtOS4rLV0qJC9pO1xuICBVUkkuaWRuX2V4cHJlc3Npb24gPSAvW15hLXowLTlcXC4tXS9pO1xuICBVUkkucHVueWNvZGVfZXhwcmVzc2lvbiA9IC8oeG4tLSkvaTtcbiAgLy8gd2VsbCwgMzMzLjQ0NC41NTUuNjY2IG1hdGNoZXMsIGJ1dCBpdCBzdXJlIGFpbid0IG5vIElQdjQgLSBkbyB3ZSBjYXJlP1xuICBVUkkuaXA0X2V4cHJlc3Npb24gPSAvXlxcZHsxLDN9XFwuXFxkezEsM31cXC5cXGR7MSwzfVxcLlxcZHsxLDN9JC87XG4gIC8vIGNyZWRpdHMgdG8gUmljaCBCcm93blxuICAvLyBzb3VyY2U6IGh0dHA6Ly9mb3J1bXMuaW50ZXJtYXBwZXIuY29tL3ZpZXd0b3BpYy5waHA/cD0xMDk2IzEwOTZcbiAgLy8gc3BlY2lmaWNhdGlvbjogaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjNDI5MS50eHRcbiAgVVJJLmlwNl9leHByZXNzaW9uID0gL15cXHMqKCgoWzAtOUEtRmEtZl17MSw0fTopezd9KFswLTlBLUZhLWZdezEsNH18OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezZ9KDpbMC05QS1GYS1mXXsxLDR9fCgoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7NX0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSwyfSl8OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7NH0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSwzfSl8KCg6WzAtOUEtRmEtZl17MSw0fSk/OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezN9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNH0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsMn06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7Mn0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw1fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCwzfTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXsxfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDZ9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDR9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCg6KCgoOlswLTlBLUZhLWZdezEsNH0pezEsN30pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsNX06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSkpKCUuKyk/XFxzKiQvO1xuICAvLyBleHByZXNzaW9uIHVzZWQgaXMgXCJncnViZXIgcmV2aXNlZFwiIChAZ3J1YmVyIHYyKSBkZXRlcm1pbmVkIHRvIGJlIHRoZVxuICAvLyBiZXN0IHNvbHV0aW9uIGluIGEgcmVnZXgtZ29sZiB3ZSBkaWQgYSBjb3VwbGUgb2YgYWdlcyBhZ28gYXRcbiAgLy8gKiBodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9kZW1vL3VybC1yZWdleFxuICAvLyAqIGh0dHA6Ly9yb2RuZXlyZWhtLmRlL3QvdXJsLXJlZ2V4Lmh0bWxcbiAgVVJJLmZpbmRfdXJpX2V4cHJlc3Npb24gPSAvXFxiKCg/OlthLXpdW1xcdy1dKzooPzpcXC97MSwzfXxbYS16MC05JV0pfHd3d1xcZHswLDN9Wy5dfFthLXowLTkuXFwtXStbLl1bYS16XXsyLDR9XFwvKSg/OlteXFxzKCk8Pl0rfFxcKChbXlxccygpPD5dK3woXFwoW15cXHMoKTw+XStcXCkpKSpcXCkpKyg/OlxcKChbXlxccygpPD5dK3woXFwoW15cXHMoKTw+XStcXCkpKSpcXCl8W15cXHNgISgpXFxbXFxde307OidcIi4sPD4/wqvCu+KAnOKAneKAmOKAmV0pKS9pZztcbiAgVVJJLmZpbmRVcmkgPSB7XG4gICAgLy8gdmFsaWQgXCJzY2hlbWU6Ly9cIiBvciBcInd3dy5cIlxuICAgIHN0YXJ0OiAvXFxiKD86KFthLXpdW2EtejAtOS4rLV0qOlxcL1xcLyl8d3d3XFwuKS9naSxcbiAgICAvLyBldmVyeXRoaW5nIHVwIHRvIHRoZSBuZXh0IHdoaXRlc3BhY2VcbiAgICBlbmQ6IC9bXFxzXFxyXFxuXXwkLyxcbiAgICAvLyB0cmltIHRyYWlsaW5nIHB1bmN0dWF0aW9uIGNhcHR1cmVkIGJ5IGVuZCBSZWdFeHBcbiAgICB0cmltOiAvW2AhKClcXFtcXF17fTs6J1wiLiw8Pj/Cq8K74oCc4oCd4oCe4oCY4oCZXSskL1xuICB9O1xuICAvLyBodHRwOi8vd3d3LmlhbmEub3JnL2Fzc2lnbm1lbnRzL3VyaS1zY2hlbWVzLmh0bWxcbiAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX1RDUF9hbmRfVURQX3BvcnRfbnVtYmVycyNXZWxsLWtub3duX3BvcnRzXG4gIFVSSS5kZWZhdWx0UG9ydHMgPSB7XG4gICAgaHR0cDogJzgwJyxcbiAgICBodHRwczogJzQ0MycsXG4gICAgZnRwOiAnMjEnLFxuICAgIGdvcGhlcjogJzcwJyxcbiAgICB3czogJzgwJyxcbiAgICB3c3M6ICc0NDMnXG4gIH07XG4gIC8vIGFsbG93ZWQgaG9zdG5hbWUgY2hhcmFjdGVycyBhY2NvcmRpbmcgdG8gUkZDIDM5ODZcbiAgLy8gQUxQSEEgRElHSVQgXCItXCIgXCIuXCIgXCJfXCIgXCJ+XCIgXCIhXCIgXCIkXCIgXCImXCIgXCInXCIgXCIoXCIgXCIpXCIgXCIqXCIgXCIrXCIgXCIsXCIgXCI7XCIgXCI9XCIgJWVuY29kZWRcbiAgLy8gSSd2ZSBuZXZlciBzZWVuIGEgKG5vbi1JRE4pIGhvc3RuYW1lIG90aGVyIHRoYW46IEFMUEhBIERJR0lUIC4gLVxuICBVUkkuaW52YWxpZF9ob3N0bmFtZV9jaGFyYWN0ZXJzID0gL1teYS16QS1aMC05XFwuLV0vO1xuICAvLyBtYXAgRE9NIEVsZW1lbnRzIHRvIHRoZWlyIFVSSSBhdHRyaWJ1dGVcbiAgVVJJLmRvbUF0dHJpYnV0ZXMgPSB7XG4gICAgJ2EnOiAnaHJlZicsXG4gICAgJ2Jsb2NrcXVvdGUnOiAnY2l0ZScsXG4gICAgJ2xpbmsnOiAnaHJlZicsXG4gICAgJ2Jhc2UnOiAnaHJlZicsXG4gICAgJ3NjcmlwdCc6ICdzcmMnLFxuICAgICdmb3JtJzogJ2FjdGlvbicsXG4gICAgJ2ltZyc6ICdzcmMnLFxuICAgICdhcmVhJzogJ2hyZWYnLFxuICAgICdpZnJhbWUnOiAnc3JjJyxcbiAgICAnZW1iZWQnOiAnc3JjJyxcbiAgICAnc291cmNlJzogJ3NyYycsXG4gICAgJ3RyYWNrJzogJ3NyYycsXG4gICAgJ2lucHV0JzogJ3NyYycsIC8vIGJ1dCBvbmx5IGlmIHR5cGU9XCJpbWFnZVwiXG4gICAgJ2F1ZGlvJzogJ3NyYycsXG4gICAgJ3ZpZGVvJzogJ3NyYydcbiAgfTtcbiAgVVJJLmdldERvbUF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgaWYgKCFub2RlIHx8ICFub2RlLm5vZGVOYW1lKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBub2RlTmFtZSA9IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAvLyA8aW5wdXQ+IHNob3VsZCBvbmx5IGV4cG9zZSBzcmMgZm9yIHR5cGU9XCJpbWFnZVwiXG4gICAgaWYgKG5vZGVOYW1lID09PSAnaW5wdXQnICYmIG5vZGUudHlwZSAhPT0gJ2ltYWdlJykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gVVJJLmRvbUF0dHJpYnV0ZXNbbm9kZU5hbWVdO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVzY2FwZUZvckR1bWJGaXJlZm94MzYodmFsdWUpIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvOTFcbiAgICByZXR1cm4gZXNjYXBlKHZhbHVlKTtcbiAgfVxuXG4gIC8vIGVuY29kaW5nIC8gZGVjb2RpbmcgYWNjb3JkaW5nIHRvIFJGQzM5ODZcbiAgZnVuY3Rpb24gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZykge1xuICAgIC8vIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFxuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5nKS5yZXBsYWNlKC9bIScoKSpdL2csIGVzY2FwZUZvckR1bWJGaXJlZm94MzYpLnJlcGxhY2UoL1xcKi9nLCAnJTJBJyk7XG4gIH1cbiAgVVJJLmVuY29kZSA9IHN0cmljdEVuY29kZVVSSUNvbXBvbmVudDtcbiAgVVJJLmRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbiAgVVJJLmlzbzg4NTkgPSBmdW5jdGlvbiAoKSB7XG4gICAgVVJJLmVuY29kZSA9IGVzY2FwZTtcbiAgICBVUkkuZGVjb2RlID0gdW5lc2NhcGU7XG4gIH07XG4gIFVSSS51bmljb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIFVSSS5lbmNvZGUgPSBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQ7XG4gICAgVVJJLmRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbiAgfTtcbiAgVVJJLmNoYXJhY3RlcnMgPSB7XG4gICAgcGF0aG5hbWU6IHtcbiAgICAgIGVuY29kZToge1xuICAgICAgICAvLyBSRkMzOTg2IDIuMTogRm9yIGNvbnNpc3RlbmN5LCBVUkkgcHJvZHVjZXJzIGFuZCBub3JtYWxpemVycyBzaG91bGRcbiAgICAgICAgLy8gdXNlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCBkaWdpdHMgZm9yIGFsbCBwZXJjZW50LWVuY29kaW5ncy5cbiAgICAgICAgZXhwcmVzc2lvbjogLyUoMjR8MjZ8MkJ8MkN8M0J8M0R8M0F8NDApL2lnLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAvLyAtLl9+IScoKSpcbiAgICAgICAgICAnJTI0JzogJyQnLFxuICAgICAgICAgICclMjYnOiAnJicsXG4gICAgICAgICAgJyUyQic6ICcrJyxcbiAgICAgICAgICAnJTJDJzogJywnLFxuICAgICAgICAgICclM0InOiAnOycsXG4gICAgICAgICAgJyUzRCc6ICc9JyxcbiAgICAgICAgICAnJTNBJzogJzonLFxuICAgICAgICAgICclNDAnOiAnQCdcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRlY29kZToge1xuICAgICAgICBleHByZXNzaW9uOiAvW1xcL1xcPyNdL2csXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICcvJzogJyUyRicsXG4gICAgICAgICAgJz8nOiAnJTNGJyxcbiAgICAgICAgICAnIyc6ICclMjMnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc2VydmVkOiB7XG4gICAgICBlbmNvZGU6IHtcbiAgICAgICAgLy8gUkZDMzk4NiAyLjE6IEZvciBjb25zaXN0ZW5jeSwgVVJJIHByb2R1Y2VycyBhbmQgbm9ybWFsaXplcnMgc2hvdWxkXG4gICAgICAgIC8vIHVzZSB1cHBlcmNhc2UgaGV4YWRlY2ltYWwgZGlnaXRzIGZvciBhbGwgcGVyY2VudC1lbmNvZGluZ3MuXG4gICAgICAgIGV4cHJlc3Npb246IC8lKDIxfDIzfDI0fDI2fDI3fDI4fDI5fDJBfDJCfDJDfDJGfDNBfDNCfDNEfDNGfDQwfDVCfDVEKS9pZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgLy8gZ2VuLWRlbGltc1xuICAgICAgICAgICclM0EnOiAnOicsXG4gICAgICAgICAgJyUyRic6ICcvJyxcbiAgICAgICAgICAnJTNGJzogJz8nLFxuICAgICAgICAgICclMjMnOiAnIycsXG4gICAgICAgICAgJyU1Qic6ICdbJyxcbiAgICAgICAgICAnJTVEJzogJ10nLFxuICAgICAgICAgICclNDAnOiAnQCcsXG4gICAgICAgICAgLy8gc3ViLWRlbGltc1xuICAgICAgICAgICclMjEnOiAnIScsXG4gICAgICAgICAgJyUyNCc6ICckJyxcbiAgICAgICAgICAnJTI2JzogJyYnLFxuICAgICAgICAgICclMjcnOiAnXFwnJyxcbiAgICAgICAgICAnJTI4JzogJygnLFxuICAgICAgICAgICclMjknOiAnKScsXG4gICAgICAgICAgJyUyQSc6ICcqJyxcbiAgICAgICAgICAnJTJCJzogJysnLFxuICAgICAgICAgICclMkMnOiAnLCcsXG4gICAgICAgICAgJyUzQic6ICc7JyxcbiAgICAgICAgICAnJTNEJzogJz0nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHVybnBhdGg6IHtcbiAgICAgIC8vIFRoZSBjaGFyYWN0ZXJzIHVuZGVyIGBlbmNvZGVgIGFyZSB0aGUgY2hhcmFjdGVycyBjYWxsZWQgb3V0IGJ5IFJGQyAyMTQxIGFzIGJlaW5nIGFjY2VwdGFibGVcbiAgICAgIC8vIGZvciB1c2FnZSBpbiBhIFVSTi4gUkZDMjE0MSBhbHNvIGNhbGxzIG91dCBcIi1cIiwgXCIuXCIsIGFuZCBcIl9cIiBhcyBhY2NlcHRhYmxlIGNoYXJhY3RlcnMsIGJ1dFxuICAgICAgLy8gdGhlc2UgYXJlbid0IGVuY29kZWQgYnkgZW5jb2RlVVJJQ29tcG9uZW50LCBzbyB3ZSBkb24ndCBoYXZlIHRvIGNhbGwgdGhlbSBvdXQgaGVyZS4gQWxzb1xuICAgICAgLy8gbm90ZSB0aGF0IHRoZSBjb2xvbiBjaGFyYWN0ZXIgaXMgbm90IGZlYXR1cmVkIGluIHRoZSBlbmNvZGluZyBtYXA7IHRoaXMgaXMgYmVjYXVzZSBVUkkuanNcbiAgICAgIC8vIGdpdmVzIHRoZSBjb2xvbnMgaW4gVVJOcyBzZW1hbnRpYyBtZWFuaW5nIGFzIHRoZSBkZWxpbWl0ZXJzIG9mIHBhdGggc2VnZW1lbnRzLCBhbmQgc28gaXRcbiAgICAgIC8vIHNob3VsZCBub3QgYXBwZWFyIHVuZW5jb2RlZCBpbiBhIHNlZ21lbnQgaXRzZWxmLlxuICAgICAgLy8gU2VlIGFsc28gdGhlIG5vdGUgYWJvdmUgYWJvdXQgUkZDMzk4NiBhbmQgY2FwaXRhbGFsaXplZCBoZXggZGlnaXRzLlxuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIGV4cHJlc3Npb246IC8lKDIxfDI0fDI3fDI4fDI5fDJBfDJCfDJDfDNCfDNEfDQwKS9pZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgJyUyMSc6ICchJyxcbiAgICAgICAgICAnJTI0JzogJyQnLFxuICAgICAgICAgICclMjcnOiAnXFwnJyxcbiAgICAgICAgICAnJTI4JzogJygnLFxuICAgICAgICAgICclMjknOiAnKScsXG4gICAgICAgICAgJyUyQSc6ICcqJyxcbiAgICAgICAgICAnJTJCJzogJysnLFxuICAgICAgICAgICclMkMnOiAnLCcsXG4gICAgICAgICAgJyUzQic6ICc7JyxcbiAgICAgICAgICAnJTNEJzogJz0nLFxuICAgICAgICAgICclNDAnOiAnQCdcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIFRoZXNlIGNoYXJhY3RlcnMgYXJlIHRoZSBjaGFyYWN0ZXJzIGNhbGxlZCBvdXQgYnkgUkZDMjE0MSBhcyBcInJlc2VydmVkXCIgY2hhcmFjdGVycyB0aGF0XG4gICAgICAvLyBzaG91bGQgbmV2ZXIgYXBwZWFyIGluIGEgVVJOLCBwbHVzIHRoZSBjb2xvbiBjaGFyYWN0ZXIgKHNlZSBub3RlIGFib3ZlKS5cbiAgICAgIGRlY29kZToge1xuICAgICAgICBleHByZXNzaW9uOiAvW1xcL1xcPyM6XS9nLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAnLyc6ICclMkYnLFxuICAgICAgICAgICc/JzogJyUzRicsXG4gICAgICAgICAgJyMnOiAnJTIzJyxcbiAgICAgICAgICAnOic6ICclM0EnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIFVSSS5lbmNvZGVRdWVyeSA9IGZ1bmN0aW9uIChzdHJpbmcsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICB2YXIgZXNjYXBlZCA9IFVSSS5lbmNvZGUoc3RyaW5nICsgJycpO1xuICAgIGlmIChlc2NhcGVRdWVyeVNwYWNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVzY2FwZVF1ZXJ5U3BhY2UgPSBVUkkuZXNjYXBlUXVlcnlTcGFjZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXNjYXBlUXVlcnlTcGFjZSA/IGVzY2FwZWQucmVwbGFjZSgvJTIwL2csICcrJykgOiBlc2NhcGVkO1xuICB9O1xuICBVUkkuZGVjb2RlUXVlcnkgPSBmdW5jdGlvbiAoc3RyaW5nLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgc3RyaW5nICs9ICcnO1xuICAgIGlmIChlc2NhcGVRdWVyeVNwYWNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVzY2FwZVF1ZXJ5U3BhY2UgPSBVUkkuZXNjYXBlUXVlcnlTcGFjZTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIFVSSS5kZWNvZGUoZXNjYXBlUXVlcnlTcGFjZSA/IHN0cmluZy5yZXBsYWNlKC9cXCsvZywgJyUyMCcpIDogc3RyaW5nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyB3ZSdyZSBub3QgZ29pbmcgdG8gbWVzcyB3aXRoIHdlaXJkIGVuY29kaW5ncyxcbiAgICAgIC8vIGdpdmUgdXAgYW5kIHJldHVybiB0aGUgdW5kZWNvZGVkIG9yaWdpbmFsIHN0cmluZ1xuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy84N1xuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy85MlxuICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG4gIH07XG4gIC8vIGdlbmVyYXRlIGVuY29kZS9kZWNvZGUgcGF0aCBmdW5jdGlvbnNcbiAgdmFyIF9wYXJ0cyA9IHsgJ2VuY29kZSc6ICdlbmNvZGUnLCAnZGVjb2RlJzogJ2RlY29kZScgfTtcbiAgdmFyIF9wYXJ0O1xuICB2YXIgZ2VuZXJhdGVBY2Nlc3NvciA9IGZ1bmN0aW9uIGdlbmVyYXRlQWNjZXNzb3IoX2dyb3VwLCBfcGFydCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gVVJJW19wYXJ0XShzdHJpbmcgKyAnJykucmVwbGFjZShVUkkuY2hhcmFjdGVyc1tfZ3JvdXBdW19wYXJ0XS5leHByZXNzaW9uLCBmdW5jdGlvbiAoYykge1xuICAgICAgICAgIHJldHVybiBVUkkuY2hhcmFjdGVyc1tfZ3JvdXBdW19wYXJ0XS5tYXBbY107XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyB3ZSdyZSBub3QgZ29pbmcgdG8gbWVzcyB3aXRoIHdlaXJkIGVuY29kaW5ncyxcbiAgICAgICAgLy8gZ2l2ZSB1cCBhbmQgcmV0dXJuIHRoZSB1bmRlY29kZWQgb3JpZ2luYWwgc3RyaW5nXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvODdcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy85MlxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgZm9yIChfcGFydCBpbiBfcGFydHMpIHtcbiAgICBVUklbX3BhcnQgKyAnUGF0aFNlZ21lbnQnXSA9IGdlbmVyYXRlQWNjZXNzb3IoJ3BhdGhuYW1lJywgX3BhcnRzW19wYXJ0XSk7XG4gICAgVVJJW19wYXJ0ICsgJ1VyblBhdGhTZWdtZW50J10gPSBnZW5lcmF0ZUFjY2Vzc29yKCd1cm5wYXRoJywgX3BhcnRzW19wYXJ0XSk7XG4gIH1cblxuICB2YXIgZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24gPSBmdW5jdGlvbiBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbihfc2VwLCBfY29kaW5nRnVuY05hbWUsIF9pbm5lckNvZGluZ0Z1bmNOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgIC8vIFdoeSBwYXNzIGluIG5hbWVzIG9mIGZ1bmN0aW9ucywgcmF0aGVyIHRoYW4gdGhlIGZ1bmN0aW9uIG9iamVjdHMgdGhlbXNlbHZlcz8gVGhlXG4gICAgICAvLyBkZWZpbml0aW9ucyBvZiBzb21lIGZ1bmN0aW9ucyAoYnV0IGluIHBhcnRpY3VsYXIsIFVSSS5kZWNvZGUpIHdpbGwgb2NjYXNpb25hbGx5IGNoYW5nZSBkdWVcbiAgICAgIC8vIHRvIFVSSS5qcyBoYXZpbmcgSVNPODg1OSBhbmQgVW5pY29kZSBtb2Rlcy4gUGFzc2luZyBpbiB0aGUgbmFtZSBhbmQgZ2V0dGluZyBpdCB3aWxsIGVuc3VyZVxuICAgICAgLy8gdGhhdCB0aGUgZnVuY3Rpb25zIHdlIHVzZSBoZXJlIGFyZSBcImZyZXNoXCIuXG4gICAgICB2YXIgYWN0dWFsQ29kaW5nRnVuYztcbiAgICAgIGlmICghX2lubmVyQ29kaW5nRnVuY05hbWUpIHtcbiAgICAgICAgYWN0dWFsQ29kaW5nRnVuYyA9IFVSSVtfY29kaW5nRnVuY05hbWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWN0dWFsQ29kaW5nRnVuYyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgICByZXR1cm4gVVJJW19jb2RpbmdGdW5jTmFtZV0oVVJJW19pbm5lckNvZGluZ0Z1bmNOYW1lXShzdHJpbmcpKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlZ21lbnRzID0gKHN0cmluZyArICcnKS5zcGxpdChfc2VwKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNlZ21lbnRzW2ldID0gYWN0dWFsQ29kaW5nRnVuYyhzZWdtZW50c1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cy5qb2luKF9zZXApO1xuICAgIH07XG4gIH07XG5cbiAgLy8gVGhpcyB0YWtlcyBwbGFjZSBvdXRzaWRlIHRoZSBhYm92ZSBsb29wIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCwgZS5nLiwgZW5jb2RlVXJuUGF0aCBmdW5jdGlvbnMuXG4gIFVSSS5kZWNvZGVQYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJy8nLCAnZGVjb2RlUGF0aFNlZ21lbnQnKTtcbiAgVVJJLmRlY29kZVVyblBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignOicsICdkZWNvZGVVcm5QYXRoU2VnbWVudCcpO1xuICBVUkkucmVjb2RlUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCcvJywgJ2VuY29kZVBhdGhTZWdtZW50JywgJ2RlY29kZScpO1xuICBVUkkucmVjb2RlVXJuUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCc6JywgJ2VuY29kZVVyblBhdGhTZWdtZW50JywgJ2RlY29kZScpO1xuXG4gIFVSSS5lbmNvZGVSZXNlcnZlZCA9IGdlbmVyYXRlQWNjZXNzb3IoJ3Jlc2VydmVkJywgJ2VuY29kZScpO1xuXG4gIFVSSS5wYXJzZSA9IGZ1bmN0aW9uIChzdHJpbmcsIHBhcnRzKSB7XG4gICAgdmFyIHBvcztcbiAgICBpZiAoIXBhcnRzKSB7XG4gICAgICBwYXJ0cyA9IHt9O1xuICAgIH1cbiAgICAvLyBbcHJvdG9jb2xcIjovL1wiW3VzZXJuYW1lW1wiOlwicGFzc3dvcmRdXCJAXCJdaG9zdG5hbWVbXCI6XCJwb3J0XVwiL1wiP11bcGF0aF1bXCI/XCJxdWVyeXN0cmluZ11bXCIjXCJmcmFnbWVudF1cblxuICAgIC8vIGV4dHJhY3QgZnJhZ21lbnRcbiAgICBwb3MgPSBzdHJpbmcuaW5kZXhPZignIycpO1xuICAgIGlmIChwb3MgPiAtMSkge1xuICAgICAgLy8gZXNjYXBpbmc/XG4gICAgICBwYXJ0cy5mcmFnbWVudCA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSkgfHwgbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IHF1ZXJ5XG4gICAgcG9zID0gc3RyaW5nLmluZGV4T2YoJz8nKTtcbiAgICBpZiAocG9zID4gLTEpIHtcbiAgICAgIC8vIGVzY2FwaW5nP1xuICAgICAgcGFydHMucXVlcnkgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpIHx8IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBwcm90b2NvbFxuICAgIGlmIChzdHJpbmcuc3Vic3RyaW5nKDAsIDIpID09PSAnLy8nKSB7XG4gICAgICAvLyByZWxhdGl2ZS1zY2hlbWVcbiAgICAgIHBhcnRzLnByb3RvY29sID0gbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoMik7XG4gICAgICAvLyBleHRyYWN0IFwidXNlcjpwYXNzQGhvc3Q6cG9ydFwiXG4gICAgICBzdHJpbmcgPSBVUkkucGFyc2VBdXRob3JpdHkoc3RyaW5nLCBwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcyA9IHN0cmluZy5pbmRleE9mKCc6Jyk7XG4gICAgICBpZiAocG9zID4gLTEpIHtcbiAgICAgICAgcGFydHMucHJvdG9jb2wgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykgfHwgbnVsbDtcbiAgICAgICAgaWYgKHBhcnRzLnByb3RvY29sICYmICFwYXJ0cy5wcm90b2NvbC5tYXRjaChVUkkucHJvdG9jb2xfZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAvLyA6IG1heSBiZSB3aXRoaW4gdGhlIHBhdGhcbiAgICAgICAgICBwYXJ0cy5wcm90b2NvbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEsIHBvcyArIDMpID09PSAnLy8nKSB7XG4gICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAzKTtcblxuICAgICAgICAgIC8vIGV4dHJhY3QgXCJ1c2VyOnBhc3NAaG9zdDpwb3J0XCJcbiAgICAgICAgICBzdHJpbmcgPSBVUkkucGFyc2VBdXRob3JpdHkoc3RyaW5nLCBwYXJ0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKTtcbiAgICAgICAgICBwYXJ0cy51cm4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2hhdCdzIGxlZnQgbXVzdCBiZSB0aGUgcGF0aFxuICAgIHBhcnRzLnBhdGggPSBzdHJpbmc7XG5cbiAgICAvLyBhbmQgd2UncmUgZG9uZVxuICAgIHJldHVybiBwYXJ0cztcbiAgfTtcbiAgVVJJLnBhcnNlSG9zdCA9IGZ1bmN0aW9uIChzdHJpbmcsIHBhcnRzKSB7XG4gICAgLy8gZXh0cmFjdCBob3N0OnBvcnRcbiAgICB2YXIgcG9zID0gc3RyaW5nLmluZGV4T2YoJy8nKTtcbiAgICB2YXIgYnJhY2tldFBvcztcbiAgICB2YXIgdDtcblxuICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICBwb3MgPSBzdHJpbmcubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuY2hhckF0KDApID09PSAnWycpIHtcbiAgICAgIC8vIElQdjYgaG9zdCAtIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL2RyYWZ0LWlldGYtNm1hbi10ZXh0LWFkZHItcmVwcmVzZW50YXRpb24tMDQjc2VjdGlvbi02XG4gICAgICAvLyBJIGNsYWltIG1vc3QgY2xpZW50IHNvZnR3YXJlIGJyZWFrcyBvbiBJUHY2IGFueXdheXMuIFRvIHNpbXBsaWZ5IHRoaW5ncywgVVJJIG9ubHkgYWNjZXB0c1xuICAgICAgLy8gSVB2Nitwb3J0IGluIHRoZSBmb3JtYXQgWzIwMDE6ZGI4OjoxXTo4MCAoZm9yIHRoZSB0aW1lIGJlaW5nKVxuICAgICAgYnJhY2tldFBvcyA9IHN0cmluZy5pbmRleE9mKCddJyk7XG4gICAgICBwYXJ0cy5ob3N0bmFtZSA9IHN0cmluZy5zdWJzdHJpbmcoMSwgYnJhY2tldFBvcykgfHwgbnVsbDtcbiAgICAgIHBhcnRzLnBvcnQgPSBzdHJpbmcuc3Vic3RyaW5nKGJyYWNrZXRQb3MgKyAyLCBwb3MpIHx8IG51bGw7XG4gICAgICBpZiAocGFydHMucG9ydCA9PT0gJy8nKSB7XG4gICAgICAgIHBhcnRzLnBvcnQgPSBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZmlyc3RDb2xvbiA9IHN0cmluZy5pbmRleE9mKCc6Jyk7XG4gICAgICB2YXIgZmlyc3RTbGFzaCA9IHN0cmluZy5pbmRleE9mKCcvJyk7XG4gICAgICB2YXIgbmV4dENvbG9uID0gc3RyaW5nLmluZGV4T2YoJzonLCBmaXJzdENvbG9uICsgMSk7XG4gICAgICBpZiAobmV4dENvbG9uICE9PSAtMSAmJiAoZmlyc3RTbGFzaCA9PT0gLTEgfHwgbmV4dENvbG9uIDwgZmlyc3RTbGFzaCkpIHtcbiAgICAgICAgLy8gSVB2NiBob3N0IGNvbnRhaW5zIG11bHRpcGxlIGNvbG9ucyAtIGJ1dCBubyBwb3J0XG4gICAgICAgIC8vIHRoaXMgbm90YXRpb24gaXMgYWN0dWFsbHkgbm90IGFsbG93ZWQgYnkgUkZDIDM5ODYsIGJ1dCB3ZSdyZSBhIGxpYmVyYWwgcGFyc2VyXG4gICAgICAgIHBhcnRzLmhvc3RuYW1lID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpIHx8IG51bGw7XG4gICAgICAgIHBhcnRzLnBvcnQgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKS5zcGxpdCgnOicpO1xuICAgICAgICBwYXJ0cy5ob3N0bmFtZSA9IHRbMF0gfHwgbnVsbDtcbiAgICAgICAgcGFydHMucG9ydCA9IHRbMV0gfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFydHMuaG9zdG5hbWUgJiYgc3RyaW5nLnN1YnN0cmluZyhwb3MpLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICBwb3MrKztcbiAgICAgIHN0cmluZyA9ICcvJyArIHN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nLnN1YnN0cmluZyhwb3MpIHx8ICcvJztcbiAgfTtcbiAgVVJJLnBhcnNlQXV0aG9yaXR5ID0gZnVuY3Rpb24gKHN0cmluZywgcGFydHMpIHtcbiAgICBzdHJpbmcgPSBVUkkucGFyc2VVc2VyaW5mbyhzdHJpbmcsIHBhcnRzKTtcbiAgICByZXR1cm4gVVJJLnBhcnNlSG9zdChzdHJpbmcsIHBhcnRzKTtcbiAgfTtcbiAgVVJJLnBhcnNlVXNlcmluZm8gPSBmdW5jdGlvbiAoc3RyaW5nLCBwYXJ0cykge1xuICAgIC8vIGV4dHJhY3QgdXNlcm5hbWU6cGFzc3dvcmRcbiAgICB2YXIgZmlyc3RTbGFzaCA9IHN0cmluZy5pbmRleE9mKCcvJyk7XG4gICAgdmFyIHBvcyA9IHN0cmluZy5sYXN0SW5kZXhPZignQCcsIGZpcnN0U2xhc2ggPiAtMSA/IGZpcnN0U2xhc2ggOiBzdHJpbmcubGVuZ3RoIC0gMSk7XG4gICAgdmFyIHQ7XG5cbiAgICAvLyBhdXRob3JpdHlAIG11c3QgY29tZSBiZWZvcmUgL3BhdGhcbiAgICBpZiAocG9zID4gLTEgJiYgKGZpcnN0U2xhc2ggPT09IC0xIHx8IHBvcyA8IGZpcnN0U2xhc2gpKSB7XG4gICAgICB0ID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpLnNwbGl0KCc6Jyk7XG4gICAgICBwYXJ0cy51c2VybmFtZSA9IHRbMF0gPyBVUkkuZGVjb2RlKHRbMF0pIDogbnVsbDtcbiAgICAgIHQuc2hpZnQoKTtcbiAgICAgIHBhcnRzLnBhc3N3b3JkID0gdFswXSA/IFVSSS5kZWNvZGUodC5qb2luKCc6JykpIDogbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnVzZXJuYW1lID0gbnVsbDtcbiAgICAgIHBhcnRzLnBhc3N3b3JkID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xuICBVUkkucGFyc2VRdWVyeSA9IGZ1bmN0aW9uIChzdHJpbmcsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIC8vIHRocm93IG91dCB0aGUgZnVua3kgYnVzaW5lc3MgLSBcIj9cIltuYW1lXCI9XCJ2YWx1ZVwiJlwiXStcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvJisvZywgJyYnKS5yZXBsYWNlKC9eXFw/KiYqfCYrJC9nLCAnJyk7XG5cbiAgICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIHZhciBpdGVtcyA9IHt9O1xuICAgIHZhciBzcGxpdHMgPSBzdHJpbmcuc3BsaXQoJyYnKTtcbiAgICB2YXIgbGVuZ3RoID0gc3BsaXRzLmxlbmd0aDtcbiAgICB2YXIgdiwgbmFtZSwgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2ID0gc3BsaXRzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICBuYW1lID0gVVJJLmRlY29kZVF1ZXJ5KHYuc2hpZnQoKSwgZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICAvLyBubyBcIj1cIiBpcyBudWxsIGFjY29yZGluZyB0byBodHRwOi8vZHZjcy53My5vcmcvaGcvdXJsL3Jhdy1maWxlL3RpcC9PdmVydmlldy5odG1sI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICAgIHZhbHVlID0gdi5sZW5ndGggPyBVUkkuZGVjb2RlUXVlcnkodi5qb2luKCc9JyksIGVzY2FwZVF1ZXJ5U3BhY2UpIDogbnVsbDtcblxuICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZW1zLCBuYW1lKSkge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1zW25hbWVdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGl0ZW1zW25hbWVdID0gW2l0ZW1zW25hbWVdXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGl0ZW1zW25hbWVdLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXRlbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbXM7XG4gIH07XG5cbiAgVVJJLmJ1aWxkID0gZnVuY3Rpb24gKHBhcnRzKSB7XG4gICAgdmFyIHQgPSAnJztcblxuICAgIGlmIChwYXJ0cy5wcm90b2NvbCkge1xuICAgICAgdCArPSBwYXJ0cy5wcm90b2NvbCArICc6JztcbiAgICB9XG5cbiAgICBpZiAoIXBhcnRzLnVybiAmJiAodCB8fCBwYXJ0cy5ob3N0bmFtZSkpIHtcbiAgICAgIHQgKz0gJy8vJztcbiAgICB9XG5cbiAgICB0ICs9IFVSSS5idWlsZEF1dGhvcml0eShwYXJ0cykgfHwgJyc7XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzLnBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAocGFydHMucGF0aC5jaGFyQXQoMCkgIT09ICcvJyAmJiB0eXBlb2YgcGFydHMuaG9zdG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHQgKz0gJy8nO1xuICAgICAgfVxuXG4gICAgICB0ICs9IHBhcnRzLnBhdGg7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwYXJ0cy5xdWVyeSA9PT0gJ3N0cmluZycgJiYgcGFydHMucXVlcnkpIHtcbiAgICAgIHQgKz0gJz8nICsgcGFydHMucXVlcnk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwYXJ0cy5mcmFnbWVudCA9PT0gJ3N0cmluZycgJiYgcGFydHMuZnJhZ21lbnQpIHtcbiAgICAgIHQgKz0gJyMnICsgcGFydHMuZnJhZ21lbnQ7XG4gICAgfVxuICAgIHJldHVybiB0O1xuICB9O1xuICBVUkkuYnVpbGRIb3N0ID0gZnVuY3Rpb24gKHBhcnRzKSB7XG4gICAgdmFyIHQgPSAnJztcblxuICAgIGlmICghcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKFVSSS5pcDZfZXhwcmVzc2lvbi50ZXN0KHBhcnRzLmhvc3RuYW1lKSkge1xuICAgICAgdCArPSAnWycgKyBwYXJ0cy5ob3N0bmFtZSArICddJztcbiAgICB9IGVsc2Uge1xuICAgICAgdCArPSBwYXJ0cy5ob3N0bmFtZTtcbiAgICB9XG5cbiAgICBpZiAocGFydHMucG9ydCkge1xuICAgICAgdCArPSAnOicgKyBwYXJ0cy5wb3J0O1xuICAgIH1cblxuICAgIHJldHVybiB0O1xuICB9O1xuICBVUkkuYnVpbGRBdXRob3JpdHkgPSBmdW5jdGlvbiAocGFydHMpIHtcbiAgICByZXR1cm4gVVJJLmJ1aWxkVXNlcmluZm8ocGFydHMpICsgVVJJLmJ1aWxkSG9zdChwYXJ0cyk7XG4gIH07XG4gIFVSSS5idWlsZFVzZXJpbmZvID0gZnVuY3Rpb24gKHBhcnRzKSB7XG4gICAgdmFyIHQgPSAnJztcblxuICAgIGlmIChwYXJ0cy51c2VybmFtZSkge1xuICAgICAgdCArPSBVUkkuZW5jb2RlKHBhcnRzLnVzZXJuYW1lKTtcblxuICAgICAgaWYgKHBhcnRzLnBhc3N3b3JkKSB7XG4gICAgICAgIHQgKz0gJzonICsgVVJJLmVuY29kZShwYXJ0cy5wYXNzd29yZCk7XG4gICAgICB9XG5cbiAgICAgIHQgKz0gJ0AnO1xuICAgIH1cblxuICAgIHJldHVybiB0O1xuICB9O1xuICBVUkkuYnVpbGRRdWVyeSA9IGZ1bmN0aW9uIChkYXRhLCBkdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICAvLyBhY2NvcmRpbmcgdG8gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiBvciBodHRwOi8vbGFicy5hcGFjaGUub3JnL3dlYmFyY2gvdXJpL3JmYy9yZmMzOTg2Lmh0bWxcbiAgICAvLyBiZWluZyDCuy0uX34hJCYnKCkqKyw7PTpALz/CqyAlSEVYIGFuZCBhbG51bSBhcmUgYWxsb3dlZFxuICAgIC8vIHRoZSBSRkMgZXhwbGljaXRseSBzdGF0ZXMgPy9mb28gYmVpbmcgYSB2YWxpZCB1c2UgY2FzZSwgbm8gbWVudGlvbiBvZiBwYXJhbWV0ZXIgc3ludGF4IVxuICAgIC8vIFVSSS5qcyB0cmVhdHMgdGhlIHF1ZXJ5IHN0cmluZyBhcyBiZWluZyBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICAvLyBzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MC9pbnRlcmFjdC9mb3Jtcy5odG1sI2Zvcm0tY29udGVudC10eXBlXG5cbiAgICB2YXIgdCA9ICcnO1xuICAgIHZhciB1bmlxdWUsIGtleSwgaSwgbGVuZ3RoO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbChkYXRhLCBrZXkpICYmIGtleSkge1xuICAgICAgICBpZiAoaXNBcnJheShkYXRhW2tleV0pKSB7XG4gICAgICAgICAgdW5pcXVlID0ge307XG4gICAgICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gZGF0YVtrZXldLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVtrZXldW2ldICE9PSB1bmRlZmluZWQgJiYgdW5pcXVlW2RhdGFba2V5XVtpXSArICcnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHQgKz0gJyYnICsgVVJJLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoa2V5LCBkYXRhW2tleV1baV0sIGVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgICAgICAgICBpZiAoZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdW5pcXVlW2RhdGFba2V5XVtpXSArICcnXSA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YVtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0ICs9ICcmJyArIFVSSS5idWlsZFF1ZXJ5UGFyYW1ldGVyKGtleSwgZGF0YVtrZXldLCBlc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0LnN1YnN0cmluZygxKTtcbiAgfTtcbiAgVVJJLmJ1aWxkUXVlcnlQYXJhbWV0ZXIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9SRUMtaHRtbDQwL2ludGVyYWN0L2Zvcm1zLmh0bWwjZm9ybS1jb250ZW50LXR5cGUgLS0gYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAgLy8gZG9uJ3QgYXBwZW5kIFwiPVwiIGZvciBudWxsIHZhbHVlcywgYWNjb3JkaW5nIHRvIGh0dHA6Ly9kdmNzLnczLm9yZy9oZy91cmwvcmF3LWZpbGUvdGlwL092ZXJ2aWV3Lmh0bWwjdXJsLXBhcmFtZXRlci1zZXJpYWxpemF0aW9uXG4gICAgcmV0dXJuIFVSSS5lbmNvZGVRdWVyeShuYW1lLCBlc2NhcGVRdWVyeVNwYWNlKSArICh2YWx1ZSAhPT0gbnVsbCA/ICc9JyArIFVSSS5lbmNvZGVRdWVyeSh2YWx1ZSwgZXNjYXBlUXVlcnlTcGFjZSkgOiAnJyk7XG4gIH07XG5cbiAgVVJJLmFkZFF1ZXJ5ID0gZnVuY3Rpb24gKGRhdGEsIG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKG5hbWUsIGtleSkpIHtcbiAgICAgICAgICBVUkkuYWRkUXVlcnkoZGF0YSwga2V5LCBuYW1lW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChkYXRhW25hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhW25hbWVdID09PSAnc3RyaW5nJykge1xuICAgICAgICBkYXRhW25hbWVdID0gW2RhdGFbbmFtZV1dO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gW3ZhbHVlXTtcbiAgICAgIH1cblxuICAgICAgZGF0YVtuYW1lXSA9IChkYXRhW25hbWVdIHx8IFtdKS5jb25jYXQodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuYWRkUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlcicpO1xuICAgIH1cbiAgfTtcbiAgVVJJLnJlbW92ZVF1ZXJ5ID0gZnVuY3Rpb24gKGRhdGEsIG5hbWUsIHZhbHVlKSB7XG4gICAgdmFyIGksIGxlbmd0aCwga2V5O1xuXG4gICAgaWYgKGlzQXJyYXkobmFtZSkpIHtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IG5hbWUubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGF0YVtuYW1lW2ldXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yIChrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIFVSSS5yZW1vdmVRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGRhdGFbbmFtZV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgZGF0YVtuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgZGF0YVtuYW1lXSA9IGZpbHRlckFycmF5VmFsdWVzKGRhdGFbbmFtZV0sIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YVtuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVVJJLnJlbW92ZVF1ZXJ5KCkgYWNjZXB0cyBhbiBvYmplY3QsIHN0cmluZyBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyJyk7XG4gICAgfVxuICB9O1xuICBVUkkuaGFzUXVlcnkgPSBmdW5jdGlvbiAoZGF0YSwgbmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKG5hbWUsIGtleSkpIHtcbiAgICAgICAgICBpZiAoIVVSSS5oYXNRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5oYXNRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChnZXRUeXBlKHZhbHVlKSkge1xuICAgICAgY2FzZSAnVW5kZWZpbmVkJzpcbiAgICAgICAgLy8gdHJ1ZSBpZiBleGlzdHMgKGJ1dCBtYXkgYmUgZW1wdHkpXG4gICAgICAgIHJldHVybiBuYW1lIGluIGRhdGE7IC8vIGRhdGFbbmFtZV0gIT09IHVuZGVmaW5lZDtcblxuICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgIC8vIHRydWUgaWYgZXhpc3RzIGFuZCBub24tZW1wdHlcbiAgICAgICAgdmFyIF9ib29seSA9IEJvb2xlYW4oaXNBcnJheShkYXRhW25hbWVdKSA/IGRhdGFbbmFtZV0ubGVuZ3RoIDogZGF0YVtuYW1lXSk7XG4gICAgICAgIHJldHVybiB2YWx1ZSA9PT0gX2Jvb2x5O1xuXG4gICAgICBjYXNlICdGdW5jdGlvbic6XG4gICAgICAgIC8vIGFsbG93IGNvbXBsZXggY29tcGFyaXNvblxuICAgICAgICByZXR1cm4gISF2YWx1ZShkYXRhW25hbWVdLCBuYW1lLCBkYXRhKTtcblxuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3AgPSB3aXRoaW5BcnJheSA/IGFycmF5Q29udGFpbnMgOiBhcnJheXNFcXVhbDtcbiAgICAgICAgcmV0dXJuIG9wKGRhdGFbbmFtZV0sIHZhbHVlKTtcblxuICAgICAgY2FzZSAnUmVnRXhwJzpcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgcmV0dXJuIEJvb2xlYW4oZGF0YVtuYW1lXSAmJiBkYXRhW25hbWVdLm1hdGNoKHZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdpdGhpbkFycmF5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5Q29udGFpbnMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuXG4gICAgICBjYXNlICdOdW1iZXInOlxuICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YVtuYW1lXSA9PT0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdpdGhpbkFycmF5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5Q29udGFpbnMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuaGFzUXVlcnkoKSBhY2NlcHRzIHVuZGVmaW5lZCwgYm9vbGVhbiwgc3RyaW5nLCBudW1iZXIsIFJlZ0V4cCwgRnVuY3Rpb24gYXMgdGhlIHZhbHVlIHBhcmFtZXRlcicpO1xuICAgIH1cbiAgfTtcblxuICBVUkkuY29tbW9uUGF0aCA9IGZ1bmN0aW9uIChvbmUsIHR3bykge1xuICAgIHZhciBsZW5ndGggPSBNYXRoLm1pbihvbmUubGVuZ3RoLCB0d28ubGVuZ3RoKTtcbiAgICB2YXIgcG9zO1xuXG4gICAgLy8gZmluZCBmaXJzdCBub24tbWF0Y2hpbmcgY2hhcmFjdGVyXG4gICAgZm9yIChwb3MgPSAwOyBwb3MgPCBsZW5ndGg7IHBvcysrKSB7XG4gICAgICBpZiAob25lLmNoYXJBdChwb3MpICE9PSB0d28uY2hhckF0KHBvcykpIHtcbiAgICAgICAgcG9zLS07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3MgPCAxKSB7XG4gICAgICByZXR1cm4gb25lLmNoYXJBdCgwKSA9PT0gdHdvLmNoYXJBdCgwKSAmJiBvbmUuY2hhckF0KDApID09PSAnLycgPyAnLycgOiAnJztcbiAgICB9XG5cbiAgICAvLyByZXZlcnQgdG8gbGFzdCAvXG4gICAgaWYgKG9uZS5jaGFyQXQocG9zKSAhPT0gJy8nIHx8IHR3by5jaGFyQXQocG9zKSAhPT0gJy8nKSB7XG4gICAgICBwb3MgPSBvbmUuc3Vic3RyaW5nKDAsIHBvcykubGFzdEluZGV4T2YoJy8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb25lLnN1YnN0cmluZygwLCBwb3MgKyAxKTtcbiAgfTtcblxuICBVUkkud2l0aGluU3RyaW5nID0gZnVuY3Rpb24gKHN0cmluZywgY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHZhciBfc3RhcnQgPSBvcHRpb25zLnN0YXJ0IHx8IFVSSS5maW5kVXJpLnN0YXJ0O1xuICAgIHZhciBfZW5kID0gb3B0aW9ucy5lbmQgfHwgVVJJLmZpbmRVcmkuZW5kO1xuICAgIHZhciBfdHJpbSA9IG9wdGlvbnMudHJpbSB8fCBVUkkuZmluZFVyaS50cmltO1xuICAgIHZhciBfYXR0cmlidXRlT3BlbiA9IC9bYS16MC05LV09W1wiJ10/JC9pO1xuXG4gICAgX3N0YXJ0Lmxhc3RJbmRleCA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBtYXRjaCA9IF9zdGFydC5leGVjKHN0cmluZyk7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhcnQgPSBtYXRjaC5pbmRleDtcbiAgICAgIGlmIChvcHRpb25zLmlnbm9yZUh0bWwpIHtcbiAgICAgICAgLy8gYXR0cmlidXQoZT1bXCInXT8kKVxuICAgICAgICB2YXIgYXR0cmlidXRlT3BlbiA9IHN0cmluZy5zbGljZShNYXRoLm1heChzdGFydCAtIDMsIDApLCBzdGFydCk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVPcGVuICYmIF9hdHRyaWJ1dGVPcGVuLnRlc3QoYXR0cmlidXRlT3BlbikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgZW5kID0gc3RhcnQgKyBzdHJpbmcuc2xpY2Uoc3RhcnQpLnNlYXJjaChfZW5kKTtcbiAgICAgIHZhciBzbGljZSA9IHN0cmluZy5zbGljZShzdGFydCwgZW5kKS5yZXBsYWNlKF90cmltLCAnJyk7XG4gICAgICBpZiAob3B0aW9ucy5pZ25vcmUgJiYgb3B0aW9ucy5pZ25vcmUudGVzdChzbGljZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGVuZCA9IHN0YXJ0ICsgc2xpY2UubGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrKHNsaWNlLCBzdGFydCwgZW5kLCBzdHJpbmcpO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDAsIHN0YXJ0KSArIHJlc3VsdCArIHN0cmluZy5zbGljZShlbmQpO1xuICAgICAgX3N0YXJ0Lmxhc3RJbmRleCA9IHN0YXJ0ICsgcmVzdWx0Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBfc3RhcnQubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xuXG4gIFVSSS5lbnN1cmVWYWxpZEhvc3RuYW1lID0gZnVuY3Rpb24gKHYpIHtcbiAgICAvLyBUaGVvcmV0aWNhbGx5IFVSSXMgYWxsb3cgcGVyY2VudC1lbmNvZGluZyBpbiBIb3N0bmFtZXMgKGFjY29yZGluZyB0byBSRkMgMzk4NilcbiAgICAvLyB0aGV5IGFyZSBub3QgcGFydCBvZiBETlMgYW5kIHRoZXJlZm9yZSBpZ25vcmVkIGJ5IFVSSS5qc1xuXG4gICAgaWYgKHYubWF0Y2goVVJJLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycykpIHtcbiAgICAgIC8vIHRlc3QgcHVueWNvZGVcbiAgICAgIGlmICghcHVueWNvZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXSBhbmQgUHVueWNvZGUuanMgaXMgbm90IGF2YWlsYWJsZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAocHVueWNvZGUudG9BU0NJSSh2KS5tYXRjaChVUkkuaW52YWxpZF9ob3N0bmFtZV9jaGFyYWN0ZXJzKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdIb3N0bmFtZSBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05Li1dJyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIG5vQ29uZmxpY3RcbiAgVVJJLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAocmVtb3ZlQWxsKSB7XG4gICAgaWYgKHJlbW92ZUFsbCkge1xuICAgICAgdmFyIHVuY29uZmxpY3RlZCA9IHtcbiAgICAgICAgVVJJOiB0aGlzLm5vQ29uZmxpY3QoKVxuICAgICAgfTtcblxuICAgICAgaWYgKHJvb3QuVVJJVGVtcGxhdGUgJiYgdHlwZW9mIHJvb3QuVVJJVGVtcGxhdGUubm9Db25mbGljdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB1bmNvbmZsaWN0ZWQuVVJJVGVtcGxhdGUgPSByb290LlVSSVRlbXBsYXRlLm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3QuSVB2NiAmJiB0eXBlb2Ygcm9vdC5JUHY2Lm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLklQdjYgPSByb290LklQdjYubm9Db25mbGljdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAocm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgJiYgdHlwZW9mIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLlNlY29uZExldmVsRG9tYWlucyA9IHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuY29uZmxpY3RlZDtcbiAgICB9IGVsc2UgaWYgKHJvb3QuVVJJID09PSB0aGlzKSB7XG4gICAgICByb290LlVSSSA9IF9VUkk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5idWlsZCA9IGZ1bmN0aW9uIChkZWZlckJ1aWxkKSB7XG4gICAgaWYgKGRlZmVyQnVpbGQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuX2RlZmVycmVkX2J1aWxkID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGRlZmVyQnVpbGQgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9kZWZlcnJlZF9idWlsZCkge1xuICAgICAgdGhpcy5fc3RyaW5nID0gVVJJLmJ1aWxkKHRoaXMuX3BhcnRzKTtcbiAgICAgIHRoaXMuX2RlZmVycmVkX2J1aWxkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IFVSSSh0aGlzKTtcbiAgfTtcblxuICBwLnZhbHVlT2YgPSBwLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmJ1aWxkKGZhbHNlKS5fc3RyaW5nO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoX3BhcnQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0c1tfcGFydF0gfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wYXJ0c1tfcGFydF0gPSB2IHx8IG51bGw7XG4gICAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoX3BhcnQsIF9rZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0c1tfcGFydF0gfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodiAhPT0gbnVsbCkge1xuICAgICAgICAgIHYgPSB2ICsgJyc7XG4gICAgICAgICAgaWYgKHYuY2hhckF0KDApID09PSBfa2V5KSB7XG4gICAgICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFydHNbX3BhcnRdID0gdjtcbiAgICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcC5wcm90b2NvbCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3Byb3RvY29sJyk7XG4gIHAudXNlcm5hbWUgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCd1c2VybmFtZScpO1xuICBwLnBhc3N3b3JkID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcigncGFzc3dvcmQnKTtcbiAgcC5ob3N0bmFtZSA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ2hvc3RuYW1lJyk7XG4gIHAucG9ydCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3BvcnQnKTtcbiAgcC5xdWVyeSA9IGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoJ3F1ZXJ5JywgJz8nKTtcbiAgcC5mcmFnbWVudCA9IGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoJ2ZyYWdtZW50JywgJyMnKTtcblxuICBwLnNlYXJjaCA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIHZhciB0ID0gdGhpcy5xdWVyeSh2LCBidWlsZCk7XG4gICAgcmV0dXJuIHR5cGVvZiB0ID09PSAnc3RyaW5nJyAmJiB0Lmxlbmd0aCA/ICc/JyArIHQgOiB0O1xuICB9O1xuICBwLmhhc2ggPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICB2YXIgdCA9IHRoaXMuZnJhZ21lbnQodiwgYnVpbGQpO1xuICAgIHJldHVybiB0eXBlb2YgdCA9PT0gJ3N0cmluZycgJiYgdC5sZW5ndGggPyAnIycgKyB0IDogdDtcbiAgfTtcblxuICBwLnBhdGhuYW1lID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSB0cnVlKSB7XG4gICAgICB2YXIgcmVzID0gdGhpcy5fcGFydHMucGF0aCB8fCAodGhpcy5fcGFydHMuaG9zdG5hbWUgPyAnLycgOiAnJyk7XG4gICAgICByZXR1cm4gdiA/ICh0aGlzLl9wYXJ0cy51cm4gPyBVUkkuZGVjb2RlVXJuUGF0aCA6IFVSSS5kZWNvZGVQYXRoKShyZXMpIDogcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB2ID8gVVJJLnJlY29kZVVyblBhdGgodikgOiAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB2ID8gVVJJLnJlY29kZVBhdGgodikgOiAnLyc7XG4gICAgICB9XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAucGF0aCA9IHAucGF0aG5hbWU7XG4gIHAuaHJlZiA9IGZ1bmN0aW9uIChocmVmLCBidWlsZCkge1xuICAgIHZhciBrZXk7XG5cbiAgICBpZiAoaHJlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHRoaXMuX3N0cmluZyA9ICcnO1xuICAgIHRoaXMuX3BhcnRzID0gVVJJLl9wYXJ0cygpO1xuXG4gICAgdmFyIF9VUkkgPSBocmVmIGluc3RhbmNlb2YgVVJJO1xuICAgIHZhciBfb2JqZWN0ID0gdHlwZW9mIGhyZWYgPT09ICdvYmplY3QnICYmIChocmVmLmhvc3RuYW1lIHx8IGhyZWYucGF0aCB8fCBocmVmLnBhdGhuYW1lKTtcbiAgICBpZiAoaHJlZi5ub2RlTmFtZSkge1xuICAgICAgdmFyIGF0dHJpYnV0ZSA9IFVSSS5nZXREb21BdHRyaWJ1dGUoaHJlZik7XG4gICAgICBocmVmID0gaHJlZlthdHRyaWJ1dGVdIHx8ICcnO1xuICAgICAgX29iamVjdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHdpbmRvdy5sb2NhdGlvbiBpcyByZXBvcnRlZCB0byBiZSBhbiBvYmplY3QsIGJ1dCBpdCdzIG5vdCB0aGUgc29ydFxuICAgIC8vIG9mIG9iamVjdCB3ZSdyZSBsb29raW5nIGZvcjpcbiAgICAvLyAqIGxvY2F0aW9uLnByb3RvY29sIGVuZHMgd2l0aCBhIGNvbG9uXG4gICAgLy8gKiBsb2NhdGlvbi5xdWVyeSAhPSBvYmplY3Quc2VhcmNoXG4gICAgLy8gKiBsb2NhdGlvbi5oYXNoICE9IG9iamVjdC5mcmFnbWVudFxuICAgIC8vIHNpbXBseSBzZXJpYWxpemluZyB0aGUgdW5rbm93biBvYmplY3Qgc2hvdWxkIGRvIHRoZSB0cmlja1xuICAgIC8vIChmb3IgbG9jYXRpb24sIG5vdCBmb3IgZXZlcnl0aGluZy4uLilcbiAgICBpZiAoIV9VUkkgJiYgX29iamVjdCAmJiBocmVmLnBhdGhuYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGhyZWYgPSBocmVmLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBocmVmID09PSAnc3RyaW5nJyB8fCBocmVmIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICB0aGlzLl9wYXJ0cyA9IFVSSS5wYXJzZShTdHJpbmcoaHJlZiksIHRoaXMuX3BhcnRzKTtcbiAgICB9IGVsc2UgaWYgKF9VUkkgfHwgX29iamVjdCkge1xuICAgICAgdmFyIHNyYyA9IF9VUkkgPyBocmVmLl9wYXJ0cyA6IGhyZWY7XG4gICAgICBmb3IgKGtleSBpbiBzcmMpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKHRoaXMuX3BhcnRzLCBrZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcGFydHNba2V5XSA9IHNyY1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ludmFsaWQgaW5wdXQnKTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gaWRlbnRpZmljYXRpb24gYWNjZXNzb3JzXG4gIHAuaXMgPSBmdW5jdGlvbiAod2hhdCkge1xuICAgIHZhciBpcCA9IGZhbHNlO1xuICAgIHZhciBpcDQgPSBmYWxzZTtcbiAgICB2YXIgaXA2ID0gZmFsc2U7XG4gICAgdmFyIG5hbWUgPSBmYWxzZTtcbiAgICB2YXIgc2xkID0gZmFsc2U7XG4gICAgdmFyIGlkbiA9IGZhbHNlO1xuICAgIHZhciBwdW55Y29kZSA9IGZhbHNlO1xuICAgIHZhciByZWxhdGl2ZSA9ICF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICBpZiAodGhpcy5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIHJlbGF0aXZlID0gZmFsc2U7XG4gICAgICBpcDQgPSBVUkkuaXA0X2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpcDYgPSBVUkkuaXA2X2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpcCA9IGlwNCB8fCBpcDY7XG4gICAgICBuYW1lID0gIWlwO1xuICAgICAgc2xkID0gbmFtZSAmJiBTTEQgJiYgU0xELmhhcyh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBpZG4gPSBuYW1lICYmIFVSSS5pZG5fZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIHB1bnljb2RlID0gbmFtZSAmJiBVUkkucHVueWNvZGVfZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHdoYXQudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAncmVsYXRpdmUnOlxuICAgICAgICByZXR1cm4gcmVsYXRpdmU7XG5cbiAgICAgIGNhc2UgJ2Fic29sdXRlJzpcbiAgICAgICAgcmV0dXJuICFyZWxhdGl2ZTtcblxuICAgICAgLy8gaG9zdG5hbWUgaWRlbnRpZmljYXRpb25cbiAgICAgIGNhc2UgJ2RvbWFpbic6XG4gICAgICBjYXNlICduYW1lJzpcbiAgICAgICAgcmV0dXJuIG5hbWU7XG5cbiAgICAgIGNhc2UgJ3NsZCc6XG4gICAgICAgIHJldHVybiBzbGQ7XG5cbiAgICAgIGNhc2UgJ2lwJzpcbiAgICAgICAgcmV0dXJuIGlwO1xuXG4gICAgICBjYXNlICdpcDQnOlxuICAgICAgY2FzZSAnaXB2NCc6XG4gICAgICBjYXNlICdpbmV0NCc6XG4gICAgICAgIHJldHVybiBpcDQ7XG5cbiAgICAgIGNhc2UgJ2lwNic6XG4gICAgICBjYXNlICdpcHY2JzpcbiAgICAgIGNhc2UgJ2luZXQ2JzpcbiAgICAgICAgcmV0dXJuIGlwNjtcblxuICAgICAgY2FzZSAnaWRuJzpcbiAgICAgICAgcmV0dXJuIGlkbjtcblxuICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgcmV0dXJuICF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICAgIGNhc2UgJ3Vybic6XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3BhcnRzLnVybjtcblxuICAgICAgY2FzZSAncHVueWNvZGUnOlxuICAgICAgICByZXR1cm4gcHVueWNvZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLy8gY29tcG9uZW50IHNwZWNpZmljIGlucHV0IHZhbGlkYXRpb25cbiAgdmFyIF9wcm90b2NvbCA9IHAucHJvdG9jb2w7XG4gIHZhciBfcG9ydCA9IHAucG9ydDtcbiAgdmFyIF9ob3N0bmFtZSA9IHAuaG9zdG5hbWU7XG5cbiAgcC5wcm90b2NvbCA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh2KSB7XG4gICAgICAgIC8vIGFjY2VwdCB0cmFpbGluZyA6Ly9cbiAgICAgICAgdiA9IHYucmVwbGFjZSgvOihcXC9cXC8pPyQvLCAnJyk7XG5cbiAgICAgICAgaWYgKCF2Lm1hdGNoKFVSSS5wcm90b2NvbF9leHByZXNzaW9uKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb3RvY29sIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuKy1dIG9yIGRvZXNuXFwndCBzdGFydCB3aXRoIFtBLVpdJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9wcm90b2NvbC5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgfTtcbiAgcC5zY2hlbWUgPSBwLnByb3RvY29sO1xuICBwLnBvcnQgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh2ID09PSAwKSB7XG4gICAgICAgIHYgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodikge1xuICAgICAgICB2ICs9ICcnO1xuICAgICAgICBpZiAodi5jaGFyQXQoMCkgPT09ICc6Jykge1xuICAgICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2Lm1hdGNoKC9bXjAtOV0vKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BvcnQgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gWzAtOV0nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3BvcnQuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG4gIHAuaG9zdG5hbWUgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB4ID0ge307XG4gICAgICBVUkkucGFyc2VIb3N0KHYsIHgpO1xuICAgICAgdiA9IHguaG9zdG5hbWU7XG4gICAgfVxuICAgIHJldHVybiBfaG9zdG5hbWUuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG5cbiAgLy8gY29tcG91bmQgYWNjZXNzb3JzXG4gIHAuaG9zdCA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gVVJJLmJ1aWxkSG9zdCh0aGlzLl9wYXJ0cykgOiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgVVJJLnBhcnNlSG9zdCh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuYXV0aG9yaXR5ID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUgPyBVUkkuYnVpbGRBdXRob3JpdHkodGhpcy5fcGFydHMpIDogJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIFVSSS5wYXJzZUF1dGhvcml0eSh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAudXNlcmluZm8gPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMudXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgdCA9IFVSSS5idWlsZFVzZXJpbmZvKHRoaXMuX3BhcnRzKTtcbiAgICAgIHJldHVybiB0LnN1YnN0cmluZygwLCB0Lmxlbmd0aCAtIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodlt2Lmxlbmd0aCAtIDFdICE9PSAnQCcpIHtcbiAgICAgICAgdiArPSAnQCc7XG4gICAgICB9XG5cbiAgICAgIFVSSS5wYXJzZVVzZXJpbmZvKHYsIHRoaXMuX3BhcnRzKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5yZXNvdXJjZSA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIHZhciBwYXJ0cztcblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhdGgoKSArIHRoaXMuc2VhcmNoKCkgKyB0aGlzLmhhc2goKTtcbiAgICB9XG5cbiAgICBwYXJ0cyA9IFVSSS5wYXJzZSh2KTtcbiAgICB0aGlzLl9wYXJ0cy5wYXRoID0gcGFydHMucGF0aDtcbiAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IHBhcnRzLnF1ZXJ5O1xuICAgIHRoaXMuX3BhcnRzLmZyYWdtZW50ID0gcGFydHMuZnJhZ21lbnQ7XG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIGZyYWN0aW9uIGFjY2Vzc29yc1xuICBwLnN1YmRvbWFpbiA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgLy8gY29udmVuaWVuY2UsIHJldHVybiBcInd3d1wiIGZyb20gXCJ3d3cuZXhhbXBsZS5vcmdcIlxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIGdyYWIgZG9tYWluIGFuZCBhZGQgYW5vdGhlciBzZWdtZW50XG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy5kb21haW4oKS5sZW5ndGggLSAxO1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlbmQpIHx8ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMuZG9tYWluKCkubGVuZ3RoO1xuICAgICAgdmFyIHN1YiA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlKTtcbiAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cCgnXicgKyBlc2NhcGVSZWdFeChzdWIpKTtcblxuICAgICAgaWYgKHYgJiYgdi5jaGFyQXQodi5sZW5ndGggLSAxKSAhPT0gJy4nKSB7XG4gICAgICAgIHYgKz0gJy4nO1xuICAgICAgfVxuXG4gICAgICBpZiAodikge1xuICAgICAgICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSh2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmRvbWFpbiA9IGZ1bmN0aW9uICh2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gY29udmVuaWVuY2UsIHJldHVybiBcImV4YW1wbGUub3JnXCIgZnJvbSBcInd3dy5leGFtcGxlLm9yZ1wiXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgLy8gaWYgaG9zdG5hbWUgY29uc2lzdHMgb2YgMSBvciAyIHNlZ21lbnRzLCBpdCBtdXN0IGJlIHRoZSBkb21haW5cbiAgICAgIHZhciB0ID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubWF0Y2goL1xcLi9nKTtcbiAgICAgIGlmICh0ICYmIHQubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGdyYWIgdGxkIGFuZCBhZGQgYW5vdGhlciBzZWdtZW50XG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy50bGQoYnVpbGQpLmxlbmd0aCAtIDE7XG4gICAgICBlbmQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sYXN0SW5kZXhPZignLicsIGVuZCAtIDEpICsgMTtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoZW5kKSB8fCAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF2KSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Nhbm5vdCBzZXQgZG9tYWluIGVtcHR5Jyk7XG4gICAgICB9XG5cbiAgICAgIFVSSS5lbnN1cmVWYWxpZEhvc3RuYW1lKHYpO1xuXG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHRoaXMuZG9tYWluKCkpICsgJyQnKTtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAudGxkID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gXCJvcmdcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIHZhciB0bGQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcocG9zICsgMSk7XG5cbiAgICAgIGlmIChidWlsZCAhPT0gdHJ1ZSAmJiBTTEQgJiYgU0xELmxpc3RbdGxkLnRvTG93ZXJDYXNlKCldKSB7XG4gICAgICAgIHJldHVybiBTTEQuZ2V0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB8fCB0bGQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0bGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXBsYWNlO1xuXG4gICAgICBpZiAoIXYpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2Fubm90IHNldCBUTEQgZW1wdHknKTtcbiAgICAgIH0gZWxzZSBpZiAodi5tYXRjaCgvW15hLXpBLVowLTktXS8pKSB7XG4gICAgICAgIGlmIChTTEQgJiYgU0xELmlzKHYpKSB7XG4gICAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUTEQgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOV0nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ2Nhbm5vdCBzZXQgVExEIG9uIG5vbi1kb21haW4gaG9zdCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5kaXJlY3RvcnkgPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5wYXRoICYmICF0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcvJztcbiAgICAgIH1cblxuICAgICAgdmFyIGVuZCA9IHRoaXMuX3BhcnRzLnBhdGgubGVuZ3RoIC0gdGhpcy5maWxlbmFtZSgpLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgcmVzID0gdGhpcy5fcGFydHMucGF0aC5zdWJzdHJpbmcoMCwgZW5kKSB8fCAodGhpcy5fcGFydHMuaG9zdG5hbWUgPyAnLycgOiAnJyk7XG5cbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGgocmVzKSA6IHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGUgPSB0aGlzLl9wYXJ0cy5wYXRoLmxlbmd0aCAtIHRoaXMuZmlsZW5hbWUoKS5sZW5ndGg7XG4gICAgICB2YXIgZGlyZWN0b3J5ID0gdGhpcy5fcGFydHMucGF0aC5zdWJzdHJpbmcoMCwgZSk7XG4gICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoJ14nICsgZXNjYXBlUmVnRXgoZGlyZWN0b3J5KSk7XG5cbiAgICAgIC8vIGZ1bGx5IHF1YWxpZmllciBkaXJlY3RvcmllcyBiZWdpbiB3aXRoIGEgc2xhc2hcbiAgICAgIGlmICghdGhpcy5pcygncmVsYXRpdmUnKSkge1xuICAgICAgICBpZiAoIXYpIHtcbiAgICAgICAgICB2ID0gJy8nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHYuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgICAgICB2ID0gJy8nICsgdjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBkaXJlY3RvcmllcyBhbHdheXMgZW5kIHdpdGggYSBzbGFzaFxuICAgICAgaWYgKHYgJiYgdi5jaGFyQXQodi5sZW5ndGggLSAxKSAhPT0gJy8nKSB7XG4gICAgICAgIHYgKz0gJy8nO1xuICAgICAgfVxuXG4gICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmZpbGVuYW1lID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCB0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMucGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKHBvcyArIDEpO1xuXG4gICAgICByZXR1cm4gdiA/IFVSSS5kZWNvZGVQYXRoU2VnbWVudChyZXMpIDogcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbXV0YXRlZERpcmVjdG9yeSA9IGZhbHNlO1xuXG4gICAgICBpZiAodi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh2Lm1hdGNoKC9cXC4/XFwvLykpIHtcbiAgICAgICAgbXV0YXRlZERpcmVjdG9yeSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCh0aGlzLmZpbGVuYW1lKCkpICsgJyQnKTtcbiAgICAgIHYgPSBVUkkucmVjb2RlUGF0aCh2KTtcbiAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UocmVwbGFjZSwgdik7XG5cbiAgICAgIGlmIChtdXRhdGVkRGlyZWN0b3J5KSB7XG4gICAgICAgIHRoaXMubm9ybWFsaXplUGF0aChidWlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5zdWZmaXggPSBmdW5jdGlvbiAodiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5wYXRoIHx8IHRoaXMuX3BhcnRzLnBhdGggPT09ICcvJykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaWxlbmFtZSA9IHRoaXMuZmlsZW5hbWUoKTtcbiAgICAgIHZhciBwb3MgPSBmaWxlbmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgdmFyIHMsIHJlcztcblxuICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBzdWZmaXggbWF5IG9ubHkgY29udGFpbiBhbG51bSBjaGFyYWN0ZXJzICh5dXAsIEkgbWFkZSB0aGlzIHVwLilcbiAgICAgIHMgPSBmaWxlbmFtZS5zdWJzdHJpbmcocG9zICsgMSk7XG4gICAgICByZXMgPSAvXlthLXowLTklXSskL2kudGVzdChzKSA/IHMgOiAnJztcbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGhTZWdtZW50KHJlcykgOiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gJy4nKSB7XG4gICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN1ZmZpeCA9IHRoaXMuc3VmZml4KCk7XG4gICAgICB2YXIgcmVwbGFjZTtcblxuICAgICAgaWYgKCFzdWZmaXgpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoICs9ICcuJyArIFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgfSBlbHNlIGlmICghdikge1xuICAgICAgICByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCgnLicgKyBzdWZmaXgpICsgJyQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHN1ZmZpeCkgKyAnJCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5zZWdtZW50ID0gZnVuY3Rpb24gKHNlZ21lbnQsIHYsIGJ1aWxkKSB7XG4gICAgdmFyIHNlcGFyYXRvciA9IHRoaXMuX3BhcnRzLnVybiA/ICc6JyA6ICcvJztcbiAgICB2YXIgcGF0aCA9IHRoaXMucGF0aCgpO1xuICAgIHZhciBhYnNvbHV0ZSA9IHBhdGguc3Vic3RyaW5nKDAsIDEpID09PSAnLyc7XG4gICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdChzZXBhcmF0b3IpO1xuXG4gICAgaWYgKHNlZ21lbnQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSBzZWdtZW50O1xuICAgICAgc2VnbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZWdtZW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgc2VnbWVudCBcIicgKyBzZWdtZW50ICsgJ1wiLCBtdXN0IGJlIDAtYmFzZWQgaW50ZWdlcicpO1xuICAgIH1cblxuICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgc2VnbWVudHMuc2hpZnQoKTtcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudCA8IDApIHtcbiAgICAgIC8vIGFsbG93IG5lZ2F0aXZlIGluZGV4ZXMgdG8gYWRkcmVzcyBmcm9tIHRoZSBlbmRcbiAgICAgIHNlZ21lbnQgPSBNYXRoLm1heChzZWdtZW50cy5sZW5ndGggKyBzZWdtZW50LCAwKTtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvKmpzaGludCBsYXhicmVhazogdHJ1ZSAqL1xuICAgICAgcmV0dXJuIHNlZ21lbnQgPT09IHVuZGVmaW5lZCA/IHNlZ21lbnRzIDogc2VnbWVudHNbc2VnbWVudF07XG4gICAgICAvKmpzaGludCBsYXhicmVhazogZmFsc2UgKi9cbiAgICB9IGVsc2UgaWYgKHNlZ21lbnQgPT09IG51bGwgfHwgc2VnbWVudHNbc2VnbWVudF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGlzQXJyYXkodikpIHtcbiAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgLy8gY29sbGFwc2UgZW1wdHkgZWxlbWVudHMgd2l0aGluIGFycmF5XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoIXZbaV0ubGVuZ3RoICYmICghc2VnbWVudHMubGVuZ3RoIHx8ICFzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoICYmICFzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNlZ21lbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlZ21lbnRzLnB1c2godltpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodiB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKHNlZ21lbnRzW3NlZ21lbnRzLmxlbmd0aCAtIDFdID09PSAnJykge1xuICAgICAgICAgIC8vIGVtcHR5IHRyYWlsaW5nIGVsZW1lbnRzIGhhdmUgdG8gYmUgb3ZlcndyaXR0ZW5cbiAgICAgICAgICAvLyB0byBwcmV2ZW50IHJlc3VsdHMgc3VjaCBhcyAvZm9vLy9iYXJcbiAgICAgICAgICBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXSA9IHY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudHMucHVzaCh2KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodikge1xuICAgICAgICBzZWdtZW50c1tzZWdtZW50XSA9IHY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWdtZW50cy5zcGxpY2Uoc2VnbWVudCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFic29sdXRlKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KCcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wYXRoKHNlZ21lbnRzLmpvaW4oc2VwYXJhdG9yKSwgYnVpbGQpO1xuICB9O1xuICBwLnNlZ21lbnRDb2RlZCA9IGZ1bmN0aW9uIChzZWdtZW50LCB2LCBidWlsZCkge1xuICAgIHZhciBzZWdtZW50cywgaSwgbDtcblxuICAgIGlmICh0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSBzZWdtZW50O1xuICAgICAgc2VnbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzZWdtZW50cyA9IHRoaXMuc2VnbWVudChzZWdtZW50LCB2LCBidWlsZCk7XG4gICAgICBpZiAoIWlzQXJyYXkoc2VnbWVudHMpKSB7XG4gICAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMgIT09IHVuZGVmaW5lZCA/IFVSSS5kZWNvZGUoc2VnbWVudHMpIDogdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHNlZ21lbnRzW2ldID0gVVJJLmRlY29kZShzZWdtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIGlmICghaXNBcnJheSh2KSkge1xuICAgICAgdiA9IHR5cGVvZiB2ID09PSAnc3RyaW5nJyB8fCB2IGluc3RhbmNlb2YgU3RyaW5nID8gVVJJLmVuY29kZSh2KSA6IHY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSB2Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2W2ldID0gVVJJLmRlY29kZSh2W2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zZWdtZW50KHNlZ21lbnQsIHYsIGJ1aWxkKTtcbiAgfTtcblxuICAvLyBtdXRhdGluZyBxdWVyeSBzdHJpbmdcbiAgdmFyIHEgPSBwLnF1ZXJ5O1xuICBwLnF1ZXJ5ID0gZnVuY3Rpb24gKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHYgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICB2YXIgcmVzdWx0ID0gdi5jYWxsKHRoaXMsIGRhdGEpO1xuICAgICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShyZXN1bHQgfHwgZGF0YSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSBpZiAodiAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeSh2LCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBxLmNhbGwodGhpcywgdiwgYnVpbGQpO1xuICAgIH1cbiAgfTtcbiAgcC5zZXRRdWVyeSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSwgYnVpbGQpIHtcbiAgICB2YXIgZGF0YSA9IFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcblxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgfHwgbmFtZSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IG51bGw7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgZGF0YVtrZXldID0gbmFtZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5hZGRRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLmFkZFF1ZXJ5ID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBidWlsZCkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIFVSSS5hZGRRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHZhbHVlKTtcbiAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IFVSSS5idWlsZFF1ZXJ5KGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgYnVpbGQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAucmVtb3ZlUXVlcnkgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIGJ1aWxkKSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgVVJJLnJlbW92ZVF1ZXJ5KGRhdGEsIG5hbWUsIHZhbHVlKTtcbiAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IFVSSS5idWlsZFF1ZXJ5KGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgYnVpbGQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAuaGFzUXVlcnkgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgcmV0dXJuIFVSSS5oYXNRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSwgd2l0aGluQXJyYXkpO1xuICB9O1xuICBwLnNldFNlYXJjaCA9IHAuc2V0UXVlcnk7XG4gIHAuYWRkU2VhcmNoID0gcC5hZGRRdWVyeTtcbiAgcC5yZW1vdmVTZWFyY2ggPSBwLnJlbW92ZVF1ZXJ5O1xuICBwLmhhc1NlYXJjaCA9IHAuaGFzUXVlcnk7XG5cbiAgLy8gc2FuaXRpemluZyBVUkxzXG4gIHAubm9ybWFsaXplID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVByb3RvY29sKGZhbHNlKS5ub3JtYWxpemVQYXRoKGZhbHNlKS5ub3JtYWxpemVRdWVyeShmYWxzZSkubm9ybWFsaXplRnJhZ21lbnQoZmFsc2UpLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUHJvdG9jb2woZmFsc2UpLm5vcm1hbGl6ZUhvc3RuYW1lKGZhbHNlKS5ub3JtYWxpemVQb3J0KGZhbHNlKS5ub3JtYWxpemVQYXRoKGZhbHNlKS5ub3JtYWxpemVRdWVyeShmYWxzZSkubm9ybWFsaXplRnJhZ21lbnQoZmFsc2UpLmJ1aWxkKCk7XG4gIH07XG4gIHAubm9ybWFsaXplUHJvdG9jb2wgPSBmdW5jdGlvbiAoYnVpbGQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzLnByb3RvY29sID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcGFydHMucHJvdG9jb2wgPSB0aGlzLl9wYXJ0cy5wcm90b2NvbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZUhvc3RuYW1lID0gZnVuY3Rpb24gKGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICBpZiAodGhpcy5pcygnSUROJykgJiYgcHVueWNvZGUpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSBwdW55Y29kZS50b0FTQ0lJKHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pcygnSVB2NicpICYmIElQdjYpIHtcbiAgICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSBJUHY2LmJlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplUG9ydCA9IGZ1bmN0aW9uIChidWlsZCkge1xuICAgIC8vIHJlbW92ZSBwb3J0IG9mIGl0J3MgdGhlIHByb3RvY29sJ3MgZGVmYXVsdFxuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucHJvdG9jb2wgPT09ICdzdHJpbmcnICYmIHRoaXMuX3BhcnRzLnBvcnQgPT09IFVSSS5kZWZhdWx0UG9ydHNbdGhpcy5fcGFydHMucHJvdG9jb2xdKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVQYXRoID0gZnVuY3Rpb24gKGJ1aWxkKSB7XG4gICAgdmFyIF9wYXRoID0gdGhpcy5fcGFydHMucGF0aDtcbiAgICBpZiAoIV9wYXRoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gVVJJLnJlY29kZVVyblBhdGgodGhpcy5fcGFydHMucGF0aCk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMucGF0aCA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgX3dhc19yZWxhdGl2ZTtcbiAgICB2YXIgX2xlYWRpbmdQYXJlbnRzID0gJyc7XG4gICAgdmFyIF9wYXJlbnQsIF9wb3M7XG5cbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHNcbiAgICBpZiAoX3BhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIF93YXNfcmVsYXRpdmUgPSB0cnVlO1xuICAgICAgX3BhdGggPSAnLycgKyBfcGF0aDtcbiAgICB9XG5cbiAgICAvLyByZXNvbHZlIHNpbXBsZXNcbiAgICBfcGF0aCA9IF9wYXRoLnJlcGxhY2UoLyhcXC8oXFwuXFwvKSspfChcXC9cXC4kKS9nLCAnLycpLnJlcGxhY2UoL1xcL3syLH0vZywgJy8nKTtcblxuICAgIC8vIHJlbWVtYmVyIGxlYWRpbmcgcGFyZW50c1xuICAgIGlmIChfd2FzX3JlbGF0aXZlKSB7XG4gICAgICBfbGVhZGluZ1BhcmVudHMgPSBfcGF0aC5zdWJzdHJpbmcoMSkubWF0Y2goL14oXFwuXFwuXFwvKSsvKSB8fCAnJztcbiAgICAgIGlmIChfbGVhZGluZ1BhcmVudHMpIHtcbiAgICAgICAgX2xlYWRpbmdQYXJlbnRzID0gX2xlYWRpbmdQYXJlbnRzWzBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlc29sdmUgcGFyZW50c1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBfcGFyZW50ID0gX3BhdGguaW5kZXhPZignLy4uJyk7XG4gICAgICBpZiAoX3BhcmVudCA9PT0gLTEpIHtcbiAgICAgICAgLy8gbm8gbW9yZSAuLi8gdG8gcmVzb2x2ZVxuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAoX3BhcmVudCA9PT0gMCkge1xuICAgICAgICAvLyB0b3AgbGV2ZWwgY2Fubm90IGJlIHJlbGF0aXZlLCBza2lwIGl0XG4gICAgICAgIF9wYXRoID0gX3BhdGguc3Vic3RyaW5nKDMpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgX3BvcyA9IF9wYXRoLnN1YnN0cmluZygwLCBfcGFyZW50KS5sYXN0SW5kZXhPZignLycpO1xuICAgICAgaWYgKF9wb3MgPT09IC0xKSB7XG4gICAgICAgIF9wb3MgPSBfcGFyZW50O1xuICAgICAgfVxuICAgICAgX3BhdGggPSBfcGF0aC5zdWJzdHJpbmcoMCwgX3BvcykgKyBfcGF0aC5zdWJzdHJpbmcoX3BhcmVudCArIDMpO1xuICAgIH1cblxuICAgIC8vIHJldmVydCB0byByZWxhdGl2ZVxuICAgIGlmIChfd2FzX3JlbGF0aXZlICYmIHRoaXMuaXMoJ3JlbGF0aXZlJykpIHtcbiAgICAgIF9wYXRoID0gX2xlYWRpbmdQYXJlbnRzICsgX3BhdGguc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIF9wYXRoID0gVVJJLnJlY29kZVBhdGgoX3BhdGgpO1xuICAgIHRoaXMuX3BhcnRzLnBhdGggPSBfcGF0aDtcbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplUGF0aG5hbWUgPSBwLm5vcm1hbGl6ZVBhdGg7XG4gIHAubm9ybWFsaXplUXVlcnkgPSBmdW5jdGlvbiAoYnVpbGQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzLnF1ZXJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5xdWVyeS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fcGFydHMucXVlcnkgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5xdWVyeShVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplRnJhZ21lbnQgPSBmdW5jdGlvbiAoYnVpbGQpIHtcbiAgICBpZiAoIXRoaXMuX3BhcnRzLmZyYWdtZW50KSB7XG4gICAgICB0aGlzLl9wYXJ0cy5mcmFnbWVudCA9IG51bGw7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplU2VhcmNoID0gcC5ub3JtYWxpemVRdWVyeTtcbiAgcC5ub3JtYWxpemVIYXNoID0gcC5ub3JtYWxpemVGcmFnbWVudDtcblxuICBwLmlzbzg4NTkgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXhwZWN0IHVuaWNvZGUgaW5wdXQsIGlzbzg4NTkgb3V0cHV0XG4gICAgdmFyIGUgPSBVUkkuZW5jb2RlO1xuICAgIHZhciBkID0gVVJJLmRlY29kZTtcblxuICAgIFVSSS5lbmNvZGUgPSBlc2NhcGU7XG4gICAgVVJJLmRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbiAgICB0cnkge1xuICAgICAgdGhpcy5ub3JtYWxpemUoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgVVJJLmVuY29kZSA9IGU7XG4gICAgICBVUkkuZGVjb2RlID0gZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC51bmljb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIGV4cGVjdCBpc284ODU5IGlucHV0LCB1bmljb2RlIG91dHB1dFxuICAgIHZhciBlID0gVVJJLmVuY29kZTtcbiAgICB2YXIgZCA9IFVSSS5kZWNvZGU7XG5cbiAgICBVUkkuZW5jb2RlID0gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50O1xuICAgIFVSSS5kZWNvZGUgPSB1bmVzY2FwZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5ub3JtYWxpemUoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgVVJJLmVuY29kZSA9IGU7XG4gICAgICBVUkkuZGVjb2RlID0gZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5yZWFkYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdXJpID0gdGhpcy5jbG9uZSgpO1xuICAgIC8vIHJlbW92aW5nIHVzZXJuYW1lLCBwYXNzd29yZCwgYmVjYXVzZSB0aGV5IHNob3VsZG4ndCBiZSBkaXNwbGF5ZWQgYWNjb3JkaW5nIHRvIFJGQyAzOTg2XG4gICAgdXJpLnVzZXJuYW1lKCcnKS5wYXNzd29yZCgnJykubm9ybWFsaXplKCk7XG4gICAgdmFyIHQgPSAnJztcbiAgICBpZiAodXJpLl9wYXJ0cy5wcm90b2NvbCkge1xuICAgICAgdCArPSB1cmkuX3BhcnRzLnByb3RvY29sICsgJzovLyc7XG4gICAgfVxuXG4gICAgaWYgKHVyaS5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIGlmICh1cmkuaXMoJ3B1bnljb2RlJykgJiYgcHVueWNvZGUpIHtcbiAgICAgICAgdCArPSBwdW55Y29kZS50b1VuaWNvZGUodXJpLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICAgIGlmICh1cmkuX3BhcnRzLnBvcnQpIHtcbiAgICAgICAgICB0ICs9ICc6JyArIHVyaS5fcGFydHMucG9ydDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdCArPSB1cmkuaG9zdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1cmkuX3BhcnRzLmhvc3RuYW1lICYmIHVyaS5fcGFydHMucGF0aCAmJiB1cmkuX3BhcnRzLnBhdGguY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIHQgKz0gJy8nO1xuICAgIH1cblxuICAgIHQgKz0gdXJpLnBhdGgodHJ1ZSk7XG4gICAgaWYgKHVyaS5fcGFydHMucXVlcnkpIHtcbiAgICAgIHZhciBxID0gJyc7XG4gICAgICBmb3IgKHZhciBpID0gMCwgcXAgPSB1cmkuX3BhcnRzLnF1ZXJ5LnNwbGl0KCcmJyksIGwgPSBxcC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGt2ID0gKHFwW2ldIHx8ICcnKS5zcGxpdCgnPScpO1xuICAgICAgICBxICs9ICcmJyArIFVSSS5kZWNvZGVRdWVyeShrdlswXSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSkucmVwbGFjZSgvJi9nLCAnJTI2Jyk7XG5cbiAgICAgICAgaWYgKGt2WzFdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBxICs9ICc9JyArIFVSSS5kZWNvZGVRdWVyeShrdlsxXSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSkucmVwbGFjZSgvJi9nLCAnJTI2Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHQgKz0gJz8nICsgcS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgdCArPSBVUkkuZGVjb2RlUXVlcnkodXJpLmhhc2goKSwgdHJ1ZSk7XG4gICAgcmV0dXJuIHQ7XG4gIH07XG5cbiAgLy8gcmVzb2x2aW5nIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBVUkxzXG4gIHAuYWJzb2x1dGVUbyA9IGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgdmFyIHJlc29sdmVkID0gdGhpcy5jbG9uZSgpO1xuICAgIHZhciBwcm9wZXJ0aWVzID0gWydwcm90b2NvbCcsICd1c2VybmFtZScsICdwYXNzd29yZCcsICdob3N0bmFtZScsICdwb3J0J107XG4gICAgdmFyIGJhc2VkaXIsIGksIHA7XG5cbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VSTnMgZG8gbm90IGhhdmUgYW55IGdlbmVyYWxseSBkZWZpbmVkIGhpZXJhcmNoaWNhbCBjb21wb25lbnRzJyk7XG4gICAgfVxuXG4gICAgaWYgKCEoYmFzZSBpbnN0YW5jZW9mIFVSSSkpIHtcbiAgICAgIGJhc2UgPSBuZXcgVVJJKGJhc2UpO1xuICAgIH1cblxuICAgIGlmICghcmVzb2x2ZWQuX3BhcnRzLnByb3RvY29sKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHMucHJvdG9jb2wgPSBiYXNlLl9wYXJ0cy5wcm90b2NvbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBwID0gcHJvcGVydGllc1tpXTsgaSsrKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHNbcF0gPSBiYXNlLl9wYXJ0c1twXTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc29sdmVkLl9wYXJ0cy5wYXRoKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHMucGF0aCA9IGJhc2UuX3BhcnRzLnBhdGg7XG4gICAgICBpZiAoIXJlc29sdmVkLl9wYXJ0cy5xdWVyeSkge1xuICAgICAgICByZXNvbHZlZC5fcGFydHMucXVlcnkgPSBiYXNlLl9wYXJ0cy5xdWVyeTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHJlc29sdmVkLl9wYXJ0cy5wYXRoLnN1YnN0cmluZygtMikgPT09ICcuLicpIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wYXRoICs9ICcvJztcbiAgICB9XG5cbiAgICBpZiAocmVzb2x2ZWQucGF0aCgpLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICBiYXNlZGlyID0gYmFzZS5kaXJlY3RvcnkoKTtcbiAgICAgIGJhc2VkaXIgPSBiYXNlZGlyID8gYmFzZWRpciA6IGJhc2UucGF0aCgpLmluZGV4T2YoJy8nKSA9PT0gMCA/ICcvJyA6ICcnO1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnBhdGggPSAoYmFzZWRpciA/IGJhc2VkaXIgKyAnLycgOiAnJykgKyByZXNvbHZlZC5fcGFydHMucGF0aDtcbiAgICAgIHJlc29sdmVkLm5vcm1hbGl6ZVBhdGgoKTtcbiAgICB9XG5cbiAgICByZXNvbHZlZC5idWlsZCgpO1xuICAgIHJldHVybiByZXNvbHZlZDtcbiAgfTtcbiAgcC5yZWxhdGl2ZVRvID0gZnVuY3Rpb24gKGJhc2UpIHtcbiAgICB2YXIgcmVsYXRpdmUgPSB0aGlzLmNsb25lKCkubm9ybWFsaXplKCk7XG4gICAgdmFyIHJlbGF0aXZlUGFydHMsIGJhc2VQYXJ0cywgY29tbW9uLCByZWxhdGl2ZVBhdGgsIGJhc2VQYXRoO1xuXG4gICAgaWYgKHJlbGF0aXZlLl9wYXJ0cy51cm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVVJOcyBkbyBub3QgaGF2ZSBhbnkgZ2VuZXJhbGx5IGRlZmluZWQgaGllcmFyY2hpY2FsIGNvbXBvbmVudHMnKTtcbiAgICB9XG5cbiAgICBiYXNlID0gbmV3IFVSSShiYXNlKS5ub3JtYWxpemUoKTtcbiAgICByZWxhdGl2ZVBhcnRzID0gcmVsYXRpdmUuX3BhcnRzO1xuICAgIGJhc2VQYXJ0cyA9IGJhc2UuX3BhcnRzO1xuICAgIHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlLnBhdGgoKTtcbiAgICBiYXNlUGF0aCA9IGJhc2UucGF0aCgpO1xuXG4gICAgaWYgKHJlbGF0aXZlUGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVUkkgaXMgYWxyZWFkeSByZWxhdGl2ZScpO1xuICAgIH1cblxuICAgIGlmIChiYXNlUGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsY3VsYXRlIGEgVVJJIHJlbGF0aXZlIHRvIGFub3RoZXIgcmVsYXRpdmUgVVJJJyk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMucHJvdG9jb2wgPT09IGJhc2VQYXJ0cy5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmVQYXJ0cy5wcm90b2NvbCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMudXNlcm5hbWUgIT09IGJhc2VQYXJ0cy51c2VybmFtZSB8fCByZWxhdGl2ZVBhcnRzLnBhc3N3b3JkICE9PSBiYXNlUGFydHMucGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLnByb3RvY29sICE9PSBudWxsIHx8IHJlbGF0aXZlUGFydHMudXNlcm5hbWUgIT09IG51bGwgfHwgcmVsYXRpdmVQYXJ0cy5wYXNzd29yZCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMuaG9zdG5hbWUgPT09IGJhc2VQYXJ0cy5ob3N0bmFtZSAmJiByZWxhdGl2ZVBhcnRzLnBvcnQgPT09IGJhc2VQYXJ0cy5wb3J0KSB7XG4gICAgICByZWxhdGl2ZVBhcnRzLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlUGFydHMucG9ydCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhdGggPT09IGJhc2VQYXRoKSB7XG4gICAgICByZWxhdGl2ZVBhcnRzLnBhdGggPSAnJztcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIC8vIGRldGVybWluZSBjb21tb24gc3ViIHBhdGhcbiAgICBjb21tb24gPSBVUkkuY29tbW9uUGF0aChyZWxhdGl2ZS5wYXRoKCksIGJhc2UucGF0aCgpKTtcblxuICAgIC8vIElmIHRoZSBwYXRocyBoYXZlIG5vdGhpbmcgaW4gY29tbW9uLCByZXR1cm4gYSByZWxhdGl2ZSBVUkwgd2l0aCB0aGUgYWJzb2x1dGUgcGF0aC5cbiAgICBpZiAoIWNvbW1vbikge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgdmFyIHBhcmVudHMgPSBiYXNlUGFydHMucGF0aC5zdWJzdHJpbmcoY29tbW9uLmxlbmd0aCkucmVwbGFjZSgvW15cXC9dKiQvLCAnJykucmVwbGFjZSgvLio/XFwvL2csICcuLi8nKTtcblxuICAgIHJlbGF0aXZlUGFydHMucGF0aCA9IHBhcmVudHMgKyByZWxhdGl2ZVBhcnRzLnBhdGguc3Vic3RyaW5nKGNvbW1vbi5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gIH07XG5cbiAgLy8gY29tcGFyaW5nIFVSSXNcbiAgcC5lcXVhbHMgPSBmdW5jdGlvbiAodXJpKSB7XG4gICAgdmFyIG9uZSA9IHRoaXMuY2xvbmUoKTtcbiAgICB2YXIgdHdvID0gbmV3IFVSSSh1cmkpO1xuICAgIHZhciBvbmVfbWFwID0ge307XG4gICAgdmFyIHR3b19tYXAgPSB7fTtcbiAgICB2YXIgY2hlY2tlZCA9IHt9O1xuICAgIHZhciBvbmVfcXVlcnksIHR3b19xdWVyeSwga2V5O1xuXG4gICAgb25lLm5vcm1hbGl6ZSgpO1xuICAgIHR3by5ub3JtYWxpemUoKTtcblxuICAgIC8vIGV4YWN0IG1hdGNoXG4gICAgaWYgKG9uZS50b1N0cmluZygpID09PSB0d28udG9TdHJpbmcoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBxdWVyeSBzdHJpbmdcbiAgICBvbmVfcXVlcnkgPSBvbmUucXVlcnkoKTtcbiAgICB0d29fcXVlcnkgPSB0d28ucXVlcnkoKTtcbiAgICBvbmUucXVlcnkoJycpO1xuICAgIHR3by5xdWVyeSgnJyk7XG5cbiAgICAvLyBkZWZpbml0ZWx5IG5vdCBlcXVhbCBpZiBub3QgZXZlbiBub24tcXVlcnkgcGFydHMgbWF0Y2hcbiAgICBpZiAob25lLnRvU3RyaW5nKCkgIT09IHR3by50b1N0cmluZygpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcXVlcnkgcGFyYW1ldGVycyBoYXZlIHRoZSBzYW1lIGxlbmd0aCwgZXZlbiBpZiB0aGV5J3JlIHBlcm11dGVkXG4gICAgaWYgKG9uZV9xdWVyeS5sZW5ndGggIT09IHR3b19xdWVyeS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvbmVfbWFwID0gVVJJLnBhcnNlUXVlcnkob25lX3F1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICB0d29fbWFwID0gVVJJLnBhcnNlUXVlcnkodHdvX3F1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcblxuICAgIGZvciAoa2V5IGluIG9uZV9tYXApIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbChvbmVfbWFwLCBrZXkpKSB7XG4gICAgICAgIGlmICghaXNBcnJheShvbmVfbWFwW2tleV0pKSB7XG4gICAgICAgICAgaWYgKG9uZV9tYXBba2V5XSAhPT0gdHdvX21hcFtrZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFhcnJheXNFcXVhbChvbmVfbWFwW2tleV0sIHR3b19tYXBba2V5XSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjaGVja2VkW2tleV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoa2V5IGluIHR3b19tYXApIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbCh0d29fbWFwLCBrZXkpKSB7XG4gICAgICAgIGlmICghY2hlY2tlZFtrZXldKSB7XG4gICAgICAgICAgLy8gdHdvIGNvbnRhaW5zIGEgcGFyYW1ldGVyIG5vdCBwcmVzZW50IGluIG9uZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIHN0YXRlXG4gIHAuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKHYpIHtcbiAgICB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSAhIXY7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5lc2NhcGVRdWVyeVNwYWNlID0gZnVuY3Rpb24gKHYpIHtcbiAgICB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlID0gISF2O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBVUkk7XG59KTsiLCIvKiEgVVJJLmpzIHYxLjE1LjAgaHR0cDovL21lZGlhbGl6ZS5naXRodWIuaW8vVVJJLmpzLyAqL1xuLyogYnVpbGQgY29udGFpbnM6IElQdjYuanMsIHB1bnljb2RlLmpzLCBTZWNvbmRMZXZlbERvbWFpbnMuanMsIFVSSS5qcywgVVJJVGVtcGxhdGUuanMgKi9cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKGYsIGwpIHtcbiAgXCJvYmplY3RcIiA9PT0gdHlwZW9mIGV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IGwoKSA6IFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGwpIDogZi5JUHY2ID0gbChmKTtcbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKGYpIHtcbiAgdmFyIGwgPSBmICYmIGYuSVB2NjtyZXR1cm4geyBiZXN0OiBmdW5jdGlvbiBiZXN0KGcpIHtcbiAgICAgIGcgPSBnLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCI6XCIpO3ZhciBtID0gZy5sZW5ndGgsXG4gICAgICAgICAgYiA9IDg7XCJcIiA9PT0gZ1swXSAmJiBcIlwiID09PSBnWzFdICYmIFwiXCIgPT09IGdbMl0gPyAoZy5zaGlmdCgpLCBnLnNoaWZ0KCkpIDogXCJcIiA9PT0gZ1swXSAmJiBcIlwiID09PSBnWzFdID8gZy5zaGlmdCgpIDogXCJcIiA9PT0gZ1ttIC0gMV0gJiYgXCJcIiA9PT0gZ1ttIC0gMl0gJiYgZy5wb3AoKTttID0gZy5sZW5ndGg7LTEgIT09IGdbbSAtIDFdLmluZGV4T2YoXCIuXCIpICYmIChiID0gNyk7dmFyIGs7Zm9yIChrID0gMDsgayA8IG0gJiYgXCJcIiAhPT0gZ1trXTsgaysrKTtpZiAoayA8IGIpIGZvciAoZy5zcGxpY2UoaywgMSwgXCIwMDAwXCIpOyBnLmxlbmd0aCA8IGI7KSBnLnNwbGljZShrLCAwLCBcIjAwMDBcIik7Zm9yIChrID0gMDsgayA8IGI7IGsrKykge1xuICAgICAgICBmb3IgKHZhciBtID0gZ1trXS5zcGxpdChcIlwiKSwgZiA9IDA7IDMgPiBmOyBmKyspIGlmIChcIjBcIiA9PT0gbVswXSAmJiAxIDwgbS5sZW5ndGgpIG0uc3BsaWNlKDAsIDEpO2Vsc2UgYnJlYWs7Z1trXSA9IG0uam9pbihcIlwiKTtcbiAgICAgIH12YXIgbSA9IC0xLFxuICAgICAgICAgIGwgPSBmID0gMCxcbiAgICAgICAgICBoID0gLTEsXG4gICAgICAgICAgciA9ICExO2ZvciAoayA9IDA7IGsgPCBiOyBrKyspIHIgPyBcIjBcIiA9PT0gZ1trXSA/IGwgKz0gMSA6IChyID0gITEsIGwgPiBmICYmIChtID0gaCwgZiA9IGwpKSA6IFwiMFwiID09PSBnW2tdICYmIChyID0gITAsIGggPSBrLCBsID0gMSk7bCA+IGYgJiYgKG0gPSBoLCBmID0gbCk7MSA8IGYgJiYgZy5zcGxpY2UobSwgZiwgXCJcIik7bSA9IGcubGVuZ3RoO2IgPSBcIlwiO1wiXCIgPT09IGdbMF0gJiYgKGIgPSBcIjpcIik7Zm9yIChrID0gMDsgayA8IG07IGsrKykge1xuICAgICAgICBiICs9IGdba107aWYgKGsgPT09IG0gLSAxKSBicmVhaztiICs9IFwiOlwiO1xuICAgICAgfVwiXCIgPT09IGdbbSAtIDFdICYmIChiICs9IFwiOlwiKTtyZXR1cm4gYjtcbiAgICB9LCBub0NvbmZsaWN0OiBmdW5jdGlvbiBub0NvbmZsaWN0KCkge1xuICAgICAgZi5JUHY2ID09PSB0aGlzICYmIChmLklQdjYgPSBsKTtyZXR1cm4gdGhpcztcbiAgICB9IH07XG59KTtcbihmdW5jdGlvbiAoZikge1xuICBmdW5jdGlvbiBsKGIpIHtcbiAgICB0aHJvdyBSYW5nZUVycm9yKHVbYl0pO1xuICB9ZnVuY3Rpb24gZyhiLCBlKSB7XG4gICAgZm9yICh2YXIgaCA9IGIubGVuZ3RoOyBoLS07KSBiW2hdID0gZShiW2hdKTtyZXR1cm4gYjtcbiAgfWZ1bmN0aW9uIG0oYiwgZSkge1xuICAgIHJldHVybiBnKGIuc3BsaXQodiksIGUpLmpvaW4oXCIuXCIpO1xuICB9ZnVuY3Rpb24gYihiKSB7XG4gICAgZm9yICh2YXIgZSA9IFtdLCBoID0gMCwgYSA9IGIubGVuZ3RoLCBjLCBkOyBoIDwgYTspIGMgPSBiLmNoYXJDb2RlQXQoaCsrKSwgNTUyOTYgPD0gYyAmJiA1NjMxOSA+PSBjICYmIGggPCBhID8gKGQgPSBiLmNoYXJDb2RlQXQoaCsrKSwgNTYzMjAgPT0gKGQgJiA2NDUxMikgPyBlLnB1c2goKChjICYgMTAyMykgPDwgMTApICsgKGQgJiAxMDIzKSArIDY1NTM2KSA6IChlLnB1c2goYyksIGgtLSkpIDogZS5wdXNoKGMpO3JldHVybiBlO1xuICB9ZnVuY3Rpb24gayhiKSB7XG4gICAgcmV0dXJuIGcoYiwgZnVuY3Rpb24gKGIpIHtcbiAgICAgIHZhciBlID0gXCJcIjs2NTUzNSA8IGIgJiYgKGIgLT0gNjU1MzYsIGUgKz0geShiID4+PiAxMCAmIDEwMjMgfCA1NTI5NiksIGIgPSA1NjMyMCB8IGIgJiAxMDIzKTtyZXR1cm4gZSArPSB5KGIpO1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH1mdW5jdGlvbiBCKGIsIGUpIHtcbiAgICByZXR1cm4gYiArIDIyICsgNzUgKiAoMjYgPiBiKSAtICgoMCAhPSBlKSA8PCA1KTtcbiAgfWZ1bmN0aW9uIHcoYiwgZSwgaCkge1xuICAgIHZhciBhID0gMDtiID0gaCA/IHEoYiAvIDcwMCkgOiBiID4+IDE7Zm9yIChiICs9IHEoYiAvIGUpOyA0NTUgPCBiOyBhICs9IDM2KSBiID0gcShiIC8gMzUpO3JldHVybiBxKGEgKyAzNiAqIGIgLyAoYiArIDM4KSk7XG4gIH1mdW5jdGlvbiBoKGIpIHtcbiAgICB2YXIgZSA9IFtdLFxuICAgICAgICBoID0gYi5sZW5ndGgsXG4gICAgICAgIGEsXG4gICAgICAgIGMgPSAwLFxuICAgICAgICBkID0gMTI4LFxuICAgICAgICBwID0gNzIsXG4gICAgICAgIHgsXG4gICAgICAgIHosXG4gICAgICAgIGcsXG4gICAgICAgIGYsXG4gICAgICAgIG07eCA9IGIubGFzdEluZGV4T2YoXCItXCIpOzAgPiB4ICYmICh4ID0gMCk7Zm9yICh6ID0gMDsgeiA8IHg7ICsreikgMTI4IDw9IGIuY2hhckNvZGVBdCh6KSAmJiBsKFwibm90LWJhc2ljXCIpLCBlLnB1c2goYi5jaGFyQ29kZUF0KHopKTtmb3IgKHggPSAwIDwgeCA/IHggKyAxIDogMDsgeCA8IGg7KSB7XG4gICAgICB6ID0gYzthID0gMTtmb3IgKGcgPSAzNjs7IGcgKz0gMzYpIHtcbiAgICAgICAgeCA+PSBoICYmIGwoXCJpbnZhbGlkLWlucHV0XCIpO2YgPSBiLmNoYXJDb2RlQXQoeCsrKTtmID0gMTAgPiBmIC0gNDggPyBmIC0gMjIgOiAyNiA+IGYgLSA2NSA/IGYgLSA2NSA6IDI2ID4gZiAtIDk3ID8gZiAtIDk3IDogMzY7KDM2IDw9IGYgfHwgZiA+IHEoKDIxNDc0ODM2NDcgLSBjKSAvIGEpKSAmJiBsKFwib3ZlcmZsb3dcIik7YyArPSBmICogYTttID0gZyA8PSBwID8gMSA6IGcgPj0gcCArIDI2ID8gMjYgOiBnIC0gcDtpZiAoZiA8IG0pIGJyZWFrO2YgPSAzNiAtIG07YSA+IHEoMjE0NzQ4MzY0NyAvIGYpICYmIGwoXCJvdmVyZmxvd1wiKTthICo9IGY7XG4gICAgICB9YSA9IGUubGVuZ3RoICsgMTtwID0gdyhjIC0geiwgYSwgMCA9PSB6KTtxKGMgLyBhKSA+IDIxNDc0ODM2NDcgLSBkICYmIGwoXCJvdmVyZmxvd1wiKTtkICs9IHEoYyAvIGEpO2MgJT0gYTtlLnNwbGljZShjKyssIDAsIGQpO1xuICAgIH1yZXR1cm4gayhlKTtcbiAgfWZ1bmN0aW9uIHIoZSkge1xuICAgIHZhciBoLFxuICAgICAgICBnLFxuICAgICAgICBhLFxuICAgICAgICBjLFxuICAgICAgICBkLFxuICAgICAgICBwLFxuICAgICAgICB4LFxuICAgICAgICB6LFxuICAgICAgICBmLFxuICAgICAgICBtID0gW10sXG4gICAgICAgIHIsXG4gICAgICAgIGssXG4gICAgICAgIG47ZSA9IGIoZSk7ciA9IGUubGVuZ3RoO2ggPSAxMjg7ZyA9IDA7ZCA9IDcyO2ZvciAocCA9IDA7IHAgPCByOyArK3ApIGYgPSBlW3BdLCAxMjggPiBmICYmIG0ucHVzaCh5KGYpKTtmb3IgKChhID0gYyA9IG0ubGVuZ3RoKSAmJiBtLnB1c2goXCItXCIpOyBhIDwgcjspIHtcbiAgICAgIHggPSAyMTQ3NDgzNjQ3O2ZvciAocCA9IDA7IHAgPCByOyArK3ApIGYgPSBlW3BdLCBmID49IGggJiYgZiA8IHggJiYgKHggPSBmKTtrID0gYSArIDE7eCAtIGggPiBxKCgyMTQ3NDgzNjQ3IC0gZykgLyBrKSAmJiBsKFwib3ZlcmZsb3dcIik7ZyArPSAoeCAtIGgpICogaztoID0geDtmb3IgKHAgPSAwOyBwIDwgcjsgKytwKSBpZiAoKGYgPSBlW3BdLCBmIDwgaCAmJiAyMTQ3NDgzNjQ3IDwgKytnICYmIGwoXCJvdmVyZmxvd1wiKSwgZiA9PSBoKSkge1xuICAgICAgICB6ID0gZztmb3IgKHggPSAzNjs7IHggKz0gMzYpIHtcbiAgICAgICAgICBmID0geCA8PSBkID8gMSA6IHggPj0gZCArIDI2ID8gMjYgOiB4IC0gZDtpZiAoeiA8IGYpIGJyZWFrO24gPSB6IC0gZjt6ID0gMzYgLSBmO20ucHVzaCh5KEIoZiArIG4gJSB6LCAwKSkpO3ogPSBxKG4gLyB6KTtcbiAgICAgICAgfW0ucHVzaCh5KEIoeiwgMCkpKTtkID0gdyhnLCBrLCBhID09IGMpO2cgPSAwOysrYTtcbiAgICAgIH0rK2c7KytoO1xuICAgIH1yZXR1cm4gbS5qb2luKFwiXCIpO1xuICB9dmFyIEMgPSBcIm9iamVjdFwiID09IHR5cGVvZiBleHBvcnRzICYmIGV4cG9ydHMsXG4gICAgICBEID0gXCJvYmplY3RcIiA9PSB0eXBlb2YgbW9kdWxlICYmIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cyA9PSBDICYmIG1vZHVsZSxcbiAgICAgIEEgPSBcIm9iamVjdFwiID09IHR5cGVvZiBnbG9iYWwgJiYgZ2xvYmFsO2lmIChBLmdsb2JhbCA9PT0gQSB8fCBBLndpbmRvdyA9PT0gQSkgZiA9IEE7dmFyIHQsXG4gICAgICBuID0gL154bi0tLyxcbiAgICAgIGUgPSAvW14gLX5dLyxcbiAgICAgIHYgPSAvXFx4MkV8XFx1MzAwMnxcXHVGRjBFfFxcdUZGNjEvZyxcbiAgICAgIHUgPSB7IG92ZXJmbG93OiBcIk92ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzXCIsIFwibm90LWJhc2ljXCI6IFwiSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KVwiLFxuICAgIFwiaW52YWxpZC1pbnB1dFwiOiBcIkludmFsaWQgaW5wdXRcIiB9LFxuICAgICAgcSA9IE1hdGguZmxvb3IsXG4gICAgICB5ID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcbiAgICAgIEU7dCA9IHsgdmVyc2lvbjogXCIxLjIuM1wiLCB1Y3MyOiB7IGRlY29kZTogYiwgZW5jb2RlOiBrIH0sIGRlY29kZTogaCwgZW5jb2RlOiByLCB0b0FTQ0lJOiBmdW5jdGlvbiB0b0FTQ0lJKGIpIHtcbiAgICAgIHJldHVybiBtKGIsIGZ1bmN0aW9uIChiKSB7XG4gICAgICAgIHJldHVybiBlLnRlc3QoYikgPyBcInhuLS1cIiArIHIoYikgOiBiO1xuICAgICAgfSk7XG4gICAgfSwgdG9Vbmljb2RlOiBmdW5jdGlvbiB0b1VuaWNvZGUoYikge1xuICAgICAgcmV0dXJuIG0oYiwgZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgcmV0dXJuIG4udGVzdChiKSA/IGgoYi5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKSA6IGI7XG4gICAgICB9KTtcbiAgICB9IH07aWYgKFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIFwib2JqZWN0XCIgPT0gdHlwZW9mIGRlZmluZS5hbWQgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdDtcbiAgfSk7ZWxzZSBpZiAoQyAmJiAhQy5ub2RlVHlwZSkgaWYgKEQpIEQuZXhwb3J0cyA9IHQ7ZWxzZSBmb3IgKEUgaW4gdCkgdC5oYXNPd25Qcm9wZXJ0eShFKSAmJiAoQ1tFXSA9IHRbRV0pO2Vsc2UgZi5wdW55Y29kZSA9IHQ7XG59KSh1bmRlZmluZWQpO1xuKGZ1bmN0aW9uIChmLCBsKSB7XG4gIFwib2JqZWN0XCIgPT09IHR5cGVvZiBleHBvcnRzID8gbW9kdWxlLmV4cG9ydHMgPSBsKCkgOiBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiBkZWZpbmUgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShsKSA6IGYuU2Vjb25kTGV2ZWxEb21haW5zID0gbChmKTtcbn0pKHVuZGVmaW5lZCwgZnVuY3Rpb24gKGYpIHtcbiAgdmFyIGwgPSBmICYmIGYuU2Vjb25kTGV2ZWxEb21haW5zLFxuICAgICAgZyA9IHsgbGlzdDogeyBhYzogXCIgY29tIGdvdiBtaWwgbmV0IG9yZyBcIiwgYWU6IFwiIGFjIGNvIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHBybyBzY2ggXCIsIGFmOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBhbDogXCIgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgXCIsIGFvOiBcIiBjbyBlZCBndiBpdCBvZyBwYiBcIiwgYXI6IFwiIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHVyIFwiLCBhdDogXCIgYWMgY28gZ3Ygb3IgXCIsIGF1OiBcIiBhc24gY29tIGNzaXJvIGVkdSBnb3YgaWQgbmV0IG9yZyBcIiwgYmE6IFwiIGNvIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIHJzIHVuYmkgdW5tbyB1bnNhIHVudHogdW56ZSBcIiwgYmI6IFwiIGJpeiBjbyBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgc3RvcmUgdHYgXCIsXG4gICAgICBiaDogXCIgYml6IGNjIGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyBcIiwgYm46IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIGJvOiBcIiBjb20gZWR1IGdvYiBnb3YgaW50IG1pbCBuZXQgb3JnIHR2IFwiLCBicjogXCIgYWRtIGFkdiBhZ3IgYW0gYXJxIGFydCBhdG8gYiBiaW8gYmxvZyBibWQgY2ltIGNuZyBjbnQgY29tIGNvb3AgZWNuIGVkdSBlbmcgZXNwIGV0YyBldGkgZmFyIGZsb2cgZm0gZm5kIGZvdCBmc3QgZzEyIGdnZiBnb3YgaW1iIGluZCBpbmYgam9yIGp1cyBsZWwgbWF0IG1lZCBtaWwgbXVzIG5ldCBub20gbm90IG50ciBvZG8gb3JnIHBwZyBwcm8gcHNjIHBzaSBxc2wgcmVjIHNsZyBzcnYgdG1wIHRyZCB0dXIgdHYgdmV0IHZsb2cgd2lraSB6bGcgXCIsIGJzOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBiejogXCIgZHUgZXQgb20gb3YgcmcgXCIsIGNhOiBcIiBhYiBiYyBtYiBuYiBuZiBubCBucyBudCBudSBvbiBwZSBxYyBzayB5ayBcIiwgY2s6IFwiIGJpeiBjbyBlZHUgZ2VuIGdvdiBpbmZvIG5ldCBvcmcgXCIsXG4gICAgICBjbjogXCIgYWMgYWggYmogY29tIGNxIGVkdSBmaiBnZCBnb3YgZ3MgZ3ggZ3ogaGEgaGIgaGUgaGkgaGwgaG4gamwganMganggbG4gbWlsIG5ldCBubSBueCBvcmcgcWggc2Mgc2Qgc2ggc24gc3ggdGogdHcgeGogeHogeW4gemogXCIsIGNvOiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG5vbSBvcmcgXCIsIGNyOiBcIiBhYyBjIGNvIGVkIGZpIGdvIG9yIHNhIFwiLCBjeTogXCIgYWMgYml6IGNvbSBla2xvZ2VzIGdvdiBsdGQgbmFtZSBuZXQgb3JnIHBhcmxpYW1lbnQgcHJlc3MgcHJvIHRtIFwiLCBcImRvXCI6IFwiIGFydCBjb20gZWR1IGdvYiBnb3YgbWlsIG5ldCBvcmcgc2xkIHdlYiBcIiwgZHo6IFwiIGFydCBhc3NvIGNvbSBlZHUgZ292IG5ldCBvcmcgcG9sIFwiLCBlYzogXCIgY29tIGVkdSBmaW4gZ292IGluZm8gbWVkIG1pbCBuZXQgb3JnIHBybyBcIiwgZWc6IFwiIGNvbSBlZHUgZXVuIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaSBcIiwgZXI6IFwiIGNvbSBlZHUgZ292IGluZCBtaWwgbmV0IG9yZyByb2NoZXN0IHcgXCIsIGVzOiBcIiBjb20gZWR1IGdvYiBub20gb3JnIFwiLFxuICAgICAgZXQ6IFwiIGJpeiBjb20gZWR1IGdvdiBpbmZvIG5hbWUgbmV0IG9yZyBcIiwgZmo6IFwiIGFjIGJpeiBjb20gaW5mbyBtaWwgbmFtZSBuZXQgb3JnIHBybyBcIiwgZms6IFwiIGFjIGNvIGdvdiBuZXQgbm9tIG9yZyBcIiwgZnI6IFwiIGFzc28gY29tIGYgZ291diBub20gcHJkIHByZXNzZSB0bSBcIiwgZ2c6IFwiIGNvIG5ldCBvcmcgXCIsIGdoOiBcIiBjb20gZWR1IGdvdiBtaWwgb3JnIFwiLCBnbjogXCIgYWMgY29tIGdvdiBuZXQgb3JnIFwiLCBncjogXCIgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgXCIsIGd0OiBcIiBjb20gZWR1IGdvYiBpbmQgbWlsIG5ldCBvcmcgXCIsIGd1OiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBoazogXCIgY29tIGVkdSBnb3YgaWR2IG5ldCBvcmcgXCIsIGh1OiBcIiAyMDAwIGFncmFyIGJvbHQgY2FzaW5vIGNpdHkgY28gZXJvdGljYSBlcm90aWthIGZpbG0gZm9ydW0gZ2FtZXMgaG90ZWwgaW5mbyBpbmdhdGxhbiBqb2dhc3oga29ueXZlbG8gbGFrYXMgbWVkaWEgbmV3cyBvcmcgcHJpdiByZWtsYW0gc2V4IHNob3Agc3BvcnQgc3VsaSBzemV4IHRtIHRvenNkZSB1dGF6YXMgdmlkZW8gXCIsXG4gICAgICBpZDogXCIgYWMgY28gZ28gbWlsIG5ldCBvciBzY2ggd2ViIFwiLCBpbDogXCIgYWMgY28gZ292IGlkZiBrMTIgbXVuaSBuZXQgb3JnIFwiLCBcImluXCI6IFwiIGFjIGNvIGVkdSBlcm5ldCBmaXJtIGdlbiBnb3YgaSBpbmQgbWlsIG5ldCBuaWMgb3JnIHJlcyBcIiwgaXE6IFwiIGNvbSBlZHUgZ292IGkgbWlsIG5ldCBvcmcgXCIsIGlyOiBcIiBhYyBjbyBkbnNzZWMgZ292IGkgaWQgbmV0IG9yZyBzY2ggXCIsIGl0OiBcIiBlZHUgZ292IFwiLCBqZTogXCIgY28gbmV0IG9yZyBcIiwgam86IFwiIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoIFwiLCBqcDogXCIgYWMgYWQgY28gZWQgZ28gZ3IgbGcgbmUgb3IgXCIsIGtlOiBcIiBhYyBjbyBnbyBpbmZvIG1lIG1vYmkgbmUgb3Igc2MgXCIsIGtoOiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBwZXIgXCIsIGtpOiBcIiBiaXogY29tIGRlIGVkdSBnb3YgaW5mbyBtb2IgbmV0IG9yZyB0ZWwgXCIsIGttOiBcIiBhc3NvIGNvbSBjb29wIGVkdSBnb3V2IGsgbWVkZWNpbiBtaWwgbm9tIG5vdGFpcmVzIHBoYXJtYWNpZW5zIHByZXNzZSB0bSB2ZXRlcmluYWlyZSBcIixcbiAgICAgIGtuOiBcIiBlZHUgZ292IG5ldCBvcmcgXCIsIGtyOiBcIiBhYyBidXNhbiBjaHVuZ2J1ayBjaHVuZ25hbSBjbyBkYWVndSBkYWVqZW9uIGVzIGdhbmd3b24gZ28gZ3dhbmdqdSBneWVvbmdidWsgZ3llb25nZ2kgZ3llb25nbmFtIGhzIGluY2hlb24gamVqdSBqZW9uYnVrIGplb25uYW0gayBrZyBtaWwgbXMgbmUgb3IgcGUgcmUgc2Mgc2VvdWwgdWxzYW4gXCIsIGt3OiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBreTogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwga3o6IFwiIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIFwiLCBsYjogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwgbGs6IFwiIGFzc24gY29tIGVkdSBnb3YgZ3JwIGhvdGVsIGludCBsdGQgbmV0IG5nbyBvcmcgc2NoIHNvYyB3ZWIgXCIsIGxyOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIFwiLCBsdjogXCIgYXNuIGNvbSBjb25mIGVkdSBnb3YgaWQgbWlsIG5ldCBvcmcgXCIsIGx5OiBcIiBjb20gZWR1IGdvdiBpZCBtZWQgbmV0IG9yZyBwbGMgc2NoIFwiLCBtYTogXCIgYWMgY28gZ292IG0gbmV0IG9yZyBwcmVzcyBcIixcbiAgICAgIG1jOiBcIiBhc3NvIHRtIFwiLCBtZTogXCIgYWMgY28gZWR1IGdvdiBpdHMgbmV0IG9yZyBwcml2IFwiLCBtZzogXCIgY29tIGVkdSBnb3YgbWlsIG5vbSBvcmcgcHJkIHRtIFwiLCBtazogXCIgY29tIGVkdSBnb3YgaW5mIG5hbWUgbmV0IG9yZyBwcm8gXCIsIG1sOiBcIiBjb20gZWR1IGdvdiBuZXQgb3JnIHByZXNzZSBcIiwgbW46IFwiIGVkdSBnb3Ygb3JnIFwiLCBtbzogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwgbXQ6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIG12OiBcIiBhZXJvIGJpeiBjb20gY29vcCBlZHUgZ292IGluZm8gaW50IG1pbCBtdXNldW0gbmFtZSBuZXQgb3JnIHBybyBcIiwgbXc6IFwiIGFjIGNvIGNvbSBjb29wIGVkdSBnb3YgaW50IG11c2V1bSBuZXQgb3JnIFwiLCBteDogXCIgY29tIGVkdSBnb2IgbmV0IG9yZyBcIiwgbXk6IFwiIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoIFwiLCBuZjogXCIgYXJ0cyBjb20gZmlybSBpbmZvIG5ldCBvdGhlciBwZXIgcmVjIHN0b3JlIHdlYiBcIiwgbmc6IFwiIGJpeiBjb20gZWR1IGdvdiBtaWwgbW9iaSBuYW1lIG5ldCBvcmcgc2NoIFwiLFxuICAgICAgbmk6IFwiIGFjIGNvIGNvbSBlZHUgZ29iIG1pbCBuZXQgbm9tIG9yZyBcIiwgbnA6IFwiIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIFwiLCBucjogXCIgYml6IGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyBcIiwgb206IFwiIGFjIGJpeiBjbyBjb20gZWR1IGdvdiBtZWQgbWlsIG11c2V1bSBuZXQgb3JnIHBybyBzY2ggXCIsIHBlOiBcIiBjb20gZWR1IGdvYiBtaWwgbmV0IG5vbSBvcmcgc2xkIFwiLCBwaDogXCIgY29tIGVkdSBnb3YgaSBtaWwgbmV0IG5nbyBvcmcgXCIsIHBrOiBcIiBiaXogY29tIGVkdSBmYW0gZ29iIGdvayBnb24gZ29wIGdvcyBnb3YgbmV0IG9yZyB3ZWIgXCIsIHBsOiBcIiBhcnQgYmlhbHlzdG9rIGJpeiBjb20gZWR1IGdkYSBnZGFuc2sgZ29yem93IGdvdiBpbmZvIGthdG93aWNlIGtyYWtvdyBsb2R6IGx1YmxpbiBtaWwgbmV0IG5nbyBvbHN6dHluIG9yZyBwb3puYW4gcHdyIHJhZG9tIHNsdXBzayBzemN6ZWNpbiB0b3J1biB3YXJzemF3YSB3YXcgd3JvYyB3cm9jbGF3IHpnb3JhIFwiLCBwcjogXCIgYWMgYml6IGNvbSBlZHUgZXN0IGdvdiBpbmZvIGlzbGEgbmFtZSBuZXQgb3JnIHBybyBwcm9mIFwiLFxuICAgICAgcHM6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgcGxvIHNlYyBcIiwgcHc6IFwiIGJlbGF1IGNvIGVkIGdvIG5lIG9yIFwiLCBybzogXCIgYXJ0cyBjb20gZmlybSBpbmZvIG5vbSBudCBvcmcgcmVjIHN0b3JlIHRtIHd3dyBcIiwgcnM6IFwiIGFjIGNvIGVkdSBnb3YgaW4gb3JnIFwiLCBzYjogXCIgY29tIGVkdSBnb3YgbmV0IG9yZyBcIiwgc2M6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIHNoOiBcIiBjbyBjb20gZWR1IGdvdiBuZXQgbm9tIG9yZyBcIiwgc2w6IFwiIGNvbSBlZHUgZ292IG5ldCBvcmcgXCIsIHN0OiBcIiBjbyBjb20gY29uc3VsYWRvIGVkdSBlbWJhaXhhZGEgZ292IG1pbCBuZXQgb3JnIHByaW5jaXBlIHNhb3RvbWUgc3RvcmUgXCIsIHN2OiBcIiBjb20gZWR1IGdvYiBvcmcgcmVkIFwiLCBzejogXCIgYWMgY28gb3JnIFwiLCB0cjogXCIgYXYgYmJzIGJlbCBiaXogY29tIGRyIGVkdSBnZW4gZ292IGluZm8gazEyIG5hbWUgbmV0IG9yZyBwb2wgdGVsIHRzayB0diB3ZWIgXCIsIHR0OiBcIiBhZXJvIGJpeiBjYXQgY28gY29tIGNvb3AgZWR1IGdvdiBpbmZvIGludCBqb2JzIG1pbCBtb2JpIG11c2V1bSBuYW1lIG5ldCBvcmcgcHJvIHRlbCB0cmF2ZWwgXCIsXG4gICAgICB0dzogXCIgY2x1YiBjb20gZWJpeiBlZHUgZ2FtZSBnb3YgaWR2IG1pbCBuZXQgb3JnIFwiLCBtdTogXCIgYWMgY28gY29tIGdvdiBuZXQgb3Igb3JnIFwiLCBtejogXCIgYWMgY28gZWR1IGdvdiBvcmcgXCIsIG5hOiBcIiBjbyBjb20gXCIsIG56OiBcIiBhYyBjbyBjcmkgZ2VlayBnZW4gZ292dCBoZWFsdGggaXdpIG1hb3JpIG1pbCBuZXQgb3JnIHBhcmxpYW1lbnQgc2Nob29sIFwiLCBwYTogXCIgYWJvIGFjIGNvbSBlZHUgZ29iIGluZyBtZWQgbmV0IG5vbSBvcmcgc2xkIFwiLCBwdDogXCIgY29tIGVkdSBnb3YgaW50IG5ldCBub21lIG9yZyBwdWJsIFwiLCBweTogXCIgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgXCIsIHFhOiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBcIiwgcmU6IFwiIGFzc28gY29tIG5vbSBcIiwgcnU6IFwiIGFjIGFkeWdleWEgYWx0YWkgYW11ciBhcmtoYW5nZWxzayBhc3RyYWtoYW4gYmFzaGtpcmlhIGJlbGdvcm9kIGJpciBicnlhbnNrIGJ1cnlhdGlhIGNiZyBjaGVsIGNoZWx5YWJpbnNrIGNoaXRhIGNodWtvdGthIGNodXZhc2hpYSBjb20gZGFnZXN0YW4gZS1idXJnIGVkdSBnb3YgZ3Jvem55IGludCBpcmt1dHNrIGl2YW5vdm8gaXpoZXZzayBqYXIgam9zaGthci1vbGEga2FsbXlraWEga2FsdWdhIGthbWNoYXRrYSBrYXJlbGlhIGthemFuIGtjaHIga2VtZXJvdm8ga2hhYmFyb3ZzayBraGFrYXNzaWEga2h2IGtpcm92IGtvZW5pZyBrb21pIGtvc3Ryb21hIGtyYW5veWFyc2sga3ViYW4ga3VyZ2FuIGt1cnNrIGxpcGV0c2sgbWFnYWRhbiBtYXJpIG1hcmktZWwgbWFyaW5lIG1pbCBtb3Jkb3ZpYSBtb3NyZWcgbXNrIG11cm1hbnNrIG5hbGNoaWsgbmV0IG5ub3Ygbm92IG5vdm9zaWJpcnNrIG5zayBvbXNrIG9yZW5idXJnIG9yZyBvcnlvbCBwZW56YSBwZXJtIHBwIHBza292IHB0eiBybmQgcnlhemFuIHNha2hhbGluIHNhbWFyYSBzYXJhdG92IHNpbWJpcnNrIHNtb2xlbnNrIHNwYiBzdGF2cm9wb2wgc3R2IHN1cmd1dCB0YW1ib3YgdGF0YXJzdGFuIHRvbSB0b21zayB0c2FyaXRzeW4gdHNrIHR1bGEgdHV2YSB0dmVyIHR5dW1lbiB1ZG0gdWRtdXJ0aWEgdWxhbi11ZGUgdmxhZGlrYXZrYXogdmxhZGltaXIgdmxhZGl2b3N0b2sgdm9sZ29ncmFkIHZvbG9nZGEgdm9yb25lemggdnJuIHZ5YXRrYSB5YWt1dGlhIHlhbWFsIHlla2F0ZXJpbmJ1cmcgeXV6aG5vLXNha2hhbGluc2sgXCIsXG4gICAgICBydzogXCIgYWMgY28gY29tIGVkdSBnb3V2IGdvdiBpbnQgbWlsIG5ldCBcIiwgc2E6IFwiIGNvbSBlZHUgZ292IG1lZCBuZXQgb3JnIHB1YiBzY2ggXCIsIHNkOiBcIiBjb20gZWR1IGdvdiBpbmZvIG1lZCBuZXQgb3JnIHR2IFwiLCBzZTogXCIgYSBhYyBiIGJkIGMgZCBlIGYgZyBoIGkgayBsIG0gbiBvIG9yZyBwIHBhcnRpIHBwIHByZXNzIHIgcyB0IHRtIHUgdyB4IHkgeiBcIiwgc2c6IFwiIGNvbSBlZHUgZ292IGlkbiBuZXQgb3JnIHBlciBcIiwgc246IFwiIGFydCBjb20gZWR1IGdvdXYgb3JnIHBlcnNvIHVuaXYgXCIsIHN5OiBcIiBjb20gZWR1IGdvdiBtaWwgbmV0IG5ld3Mgb3JnIFwiLCB0aDogXCIgYWMgY28gZ28gaW4gbWkgbmV0IG9yIFwiLCB0ajogXCIgYWMgYml6IGNvIGNvbSBlZHUgZ28gZ292IGluZm8gaW50IG1pbCBuYW1lIG5ldCBuaWMgb3JnIHRlc3Qgd2ViIFwiLCB0bjogXCIgYWdyaW5ldCBjb20gZGVmZW5zZSBlZHVuZXQgZW5zIGZpbiBnb3YgaW5kIGluZm8gaW50bCBtaW5jb20gbmF0IG5ldCBvcmcgcGVyc28gcm5ydCBybnMgcm51IHRvdXJpc20gXCIsXG4gICAgICB0ejogXCIgYWMgY28gZ28gbmUgb3IgXCIsIHVhOiBcIiBiaXogY2hlcmthc3N5IGNoZXJuaWdvdiBjaGVybm92dHN5IGNrIGNuIGNvIGNvbSBjcmltZWEgY3YgZG4gZG5lcHJvcGV0cm92c2sgZG9uZXRzayBkcCBlZHUgZ292IGlmIGluIGl2YW5vLWZyYW5raXZzayBraCBraGFya292IGtoZXJzb24ga2htZWxuaXRza2l5IGtpZXYga2lyb3ZvZ3JhZCBrbSBrciBrcyBrdiBsZyBsdWdhbnNrIGx1dHNrIGx2aXYgbWUgbWsgbmV0IG5pa29sYWV2IG9kIG9kZXNzYSBvcmcgcGwgcG9sdGF2YSBwcCByb3ZubyBydiBzZWJhc3RvcG9sIHN1bXkgdGUgdGVybm9waWwgdXpoZ29yb2QgdmlubmljYSB2biB6YXBvcml6aHpoZSB6aGl0b21pciB6cCB6dCBcIiwgdWc6IFwiIGFjIGNvIGdvIG5lIG9yIG9yZyBzYyBcIiwgdWs6IFwiIGFjIGJsIGJyaXRpc2gtbGlicmFyeSBjbyBjeW0gZ292IGdvdnQgaWNuZXQgamV0IGxlYSBsdGQgbWUgbWlsIG1vZCBuYXRpb25hbC1saWJyYXJ5LXNjb3RsYW5kIG5lbCBuZXQgbmhzIG5pYyBubHMgb3JnIG9yZ24gcGFybGlhbWVudCBwbGMgcG9saWNlIHNjaCBzY290IHNvYyBcIixcbiAgICAgIHVzOiBcIiBkbmkgZmVkIGlzYSBraWRzIG5zbiBcIiwgdXk6IFwiIGNvbSBlZHUgZ3ViIG1pbCBuZXQgb3JnIFwiLCB2ZTogXCIgY28gY29tIGVkdSBnb2IgaW5mbyBtaWwgbmV0IG9yZyB3ZWIgXCIsIHZpOiBcIiBjbyBjb20gazEyIG5ldCBvcmcgXCIsIHZuOiBcIiBhYyBiaXogY29tIGVkdSBnb3YgaGVhbHRoIGluZm8gaW50IG5hbWUgbmV0IG9yZyBwcm8gXCIsIHllOiBcIiBjbyBjb20gZ292IGx0ZCBtZSBuZXQgb3JnIHBsYyBcIiwgeXU6IFwiIGFjIGNvIGVkdSBnb3Ygb3JnIFwiLCB6YTogXCIgYWMgYWdyaWMgYWx0IGJvdXJzZSBjaXR5IGNvIGN5YmVybmV0IGRiIGVkdSBnb3YgZ3JvbmRhciBpYWNjZXNzIGltdCBpbmNhIGxhbmRlc2lnbiBsYXcgbWlsIG5ldCBuZ28gbmlzIG5vbSBvbGl2ZXR0aSBvcmcgcGl4IHNjaG9vbCB0bSB3ZWIgXCIsIHptOiBcIiBhYyBjbyBjb20gZWR1IGdvdiBuZXQgb3JnIHNjaCBcIiB9LCBoYXM6IGZ1bmN0aW9uIGhhcyhmKSB7XG4gICAgICB2YXIgYiA9IGYubGFzdEluZGV4T2YoXCIuXCIpO2lmICgwID49IGIgfHwgYiA+PSBmLmxlbmd0aCAtIDEpIHJldHVybiAhMTtcbiAgICAgIHZhciBrID0gZi5sYXN0SW5kZXhPZihcIi5cIiwgYiAtIDEpO2lmICgwID49IGsgfHwgayA+PSBiIC0gMSkgcmV0dXJuICExO3ZhciBsID0gZy5saXN0W2Yuc2xpY2UoYiArIDEpXTtyZXR1cm4gbCA/IDAgPD0gbC5pbmRleE9mKFwiIFwiICsgZi5zbGljZShrICsgMSwgYikgKyBcIiBcIikgOiAhMTtcbiAgICB9LCBpczogZnVuY3Rpb24gaXMoZikge1xuICAgICAgdmFyIGIgPSBmLmxhc3RJbmRleE9mKFwiLlwiKTtpZiAoMCA+PSBiIHx8IGIgPj0gZi5sZW5ndGggLSAxIHx8IDAgPD0gZi5sYXN0SW5kZXhPZihcIi5cIiwgYiAtIDEpKSByZXR1cm4gITE7dmFyIGsgPSBnLmxpc3RbZi5zbGljZShiICsgMSldO3JldHVybiBrID8gMCA8PSBrLmluZGV4T2YoXCIgXCIgKyBmLnNsaWNlKDAsIGIpICsgXCIgXCIpIDogITE7XG4gICAgfSwgZ2V0OiBmdW5jdGlvbiBnZXQoZikge1xuICAgICAgdmFyIGIgPSBmLmxhc3RJbmRleE9mKFwiLlwiKTtpZiAoMCA+PSBiIHx8IGIgPj0gZi5sZW5ndGggLSAxKSByZXR1cm4gbnVsbDt2YXIgayA9IGYubGFzdEluZGV4T2YoXCIuXCIsIGIgLSAxKTtpZiAoMCA+PSBrIHx8IGsgPj0gYiAtIDEpIHJldHVybiBudWxsO3ZhciBsID0gZy5saXN0W2Yuc2xpY2UoYiArIDEpXTtyZXR1cm4gIWwgfHwgMCA+IGwuaW5kZXhPZihcIiBcIiArIGYuc2xpY2UoayArIDEsIGIpICsgXCIgXCIpID8gbnVsbCA6IGYuc2xpY2UoayArIDEpO1xuICAgIH0sIG5vQ29uZmxpY3Q6IGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgICBmLlNlY29uZExldmVsRG9tYWlucyA9PT0gdGhpcyAmJiAoZi5TZWNvbmRMZXZlbERvbWFpbnMgPSBsKTtyZXR1cm4gdGhpcztcbiAgICB9IH07cmV0dXJuIGc7XG59KTtcbihmdW5jdGlvbiAoZiwgbCkge1xuICBcIm9iamVjdFwiID09PSB0eXBlb2YgZXhwb3J0cyA/IG1vZHVsZS5leHBvcnRzID0gbChyZXF1aXJlKFwiLi9wdW55Y29kZVwiKSwgcmVxdWlyZShcIi4vSVB2NlwiKSwgcmVxdWlyZShcIi4vU2Vjb25kTGV2ZWxEb21haW5zXCIpKSA6IFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFtcIi4vcHVueWNvZGVcIiwgXCIuL0lQdjZcIiwgXCIuL1NlY29uZExldmVsRG9tYWluc1wiXSwgbCkgOiBmLlVSSSA9IGwoZi5wdW55Y29kZSwgZi5JUHY2LCBmLlNlY29uZExldmVsRG9tYWlucywgZik7XG59KSh1bmRlZmluZWQsIGZ1bmN0aW9uIChmLCBsLCBnLCBtKSB7XG4gIGZ1bmN0aW9uIGIoYSwgYykge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBiKSkgcmV0dXJuIG5ldyBiKGEsIGMpO2lmICh2b2lkIDAgPT09IGEpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwidW5kZWZpbmVkIGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50IGZvciBVUklcIik7YSA9IFwidW5kZWZpbmVkXCIgIT09IHR5cGVvZiBsb2NhdGlvbiA/IGxvY2F0aW9uLmhyZWYgKyBcIlwiIDogXCJcIjtcbiAgICB9dGhpcy5ocmVmKGEpO3JldHVybiB2b2lkIDAgIT09IGMgPyB0aGlzLmFic29sdXRlVG8oYykgOiB0aGlzO1xuICB9ZnVuY3Rpb24gayhhKSB7XG4gICAgcmV0dXJuIGEucmVwbGFjZSgvKFsuKis/Xj0hOiR7fSgpfFtcXF1cXC9cXFxcXSkvZywgXCJcXFxcJDFcIik7XG4gIH1mdW5jdGlvbiBCKGEpIHtcbiAgICByZXR1cm4gdm9pZCAwID09PSBhID8gXCJVbmRlZmluZWRcIiA6IFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkpLnNsaWNlKDgsIC0xKTtcbiAgfWZ1bmN0aW9uIHcoYSkge1xuICAgIHJldHVybiBcIkFycmF5XCIgPT09IEIoYSk7XG4gIH1mdW5jdGlvbiBoKGEsIGMpIHtcbiAgICB2YXIgZCwgYjtpZiAodyhjKSkge1xuICAgICAgZCA9IDA7Zm9yIChiID0gYy5sZW5ndGg7IGQgPCBiOyBkKyspIGlmICghaChhLCBjW2RdKSkgcmV0dXJuICExO3JldHVybiAhMDtcbiAgICB9dmFyIGUgPSBCKGMpO2QgPSAwO2ZvciAoYiA9IGEubGVuZ3RoOyBkIDwgYjsgZCsrKSBpZiAoXCJSZWdFeHBcIiA9PT0gZSkge1xuICAgICAgaWYgKFwic3RyaW5nXCIgPT09IHR5cGVvZiBhW2RdICYmIGFbZF0ubWF0Y2goYykpIHJldHVybiAhMDtcbiAgICB9IGVsc2UgaWYgKGFbZF0gPT09IGMpIHJldHVybiAhMDtyZXR1cm4gITE7XG4gIH1mdW5jdGlvbiByKGEsIGMpIHtcbiAgICBpZiAoIXcoYSkgfHwgIXcoYykgfHwgYS5sZW5ndGggIT09IGMubGVuZ3RoKSByZXR1cm4gITE7YS5zb3J0KCk7Yy5zb3J0KCk7Zm9yICh2YXIgZCA9IDAsIGIgPSBhLmxlbmd0aDsgZCA8IGI7IGQrKykgaWYgKGFbZF0gIT09IGNbZF0pIHJldHVybiAhMTtyZXR1cm4gITA7XG4gIH1mdW5jdGlvbiBDKGEpIHtcbiAgICByZXR1cm4gZXNjYXBlKGEpO1xuICB9ZnVuY3Rpb24gRChhKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChhKS5yZXBsYWNlKC9bIScoKSpdL2csIEMpLnJlcGxhY2UoL1xcKi9nLCBcIiUyQVwiKTtcbiAgfWZ1bmN0aW9uIEEoYSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYywgZCkge1xuICAgICAgaWYgKHZvaWQgMCA9PT0gYykgcmV0dXJuIHRoaXMuX3BhcnRzW2FdIHx8IFwiXCI7dGhpcy5fcGFydHNbYV0gPSBjIHx8IG51bGw7dGhpcy5idWlsZCghZCk7cmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIHQoYSwgYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgaWYgKHZvaWQgMCA9PT0gZCkgcmV0dXJuIHRoaXMuX3BhcnRzW2FdIHx8IFwiXCI7bnVsbCAhPT0gZCAmJiAoZCArPSBcIlwiLCBkLmNoYXJBdCgwKSA9PT0gYyAmJiAoZCA9IGQuc3Vic3RyaW5nKDEpKSk7XG4gICAgICB0aGlzLl9wYXJ0c1thXSA9IGQ7dGhpcy5idWlsZCghYik7cmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgfXZhciBuID0gbSAmJiBtLlVSSTtiLnZlcnNpb24gPSBcIjEuMTUuMFwiO3ZhciBlID0gYi5wcm90b3R5cGUsXG4gICAgICB2ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtiLl9wYXJ0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geyBwcm90b2NvbDogbnVsbCwgdXNlcm5hbWU6IG51bGwsIHBhc3N3b3JkOiBudWxsLCBob3N0bmFtZTogbnVsbCwgdXJuOiBudWxsLCBwb3J0OiBudWxsLCBwYXRoOiBudWxsLCBxdWVyeTogbnVsbCwgZnJhZ21lbnQ6IG51bGwsIGR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVyczogYi5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIGVzY2FwZVF1ZXJ5U3BhY2U6IGIuZXNjYXBlUXVlcnlTcGFjZSB9O1xuICB9O2IuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gITE7Yi5lc2NhcGVRdWVyeVNwYWNlID0gITA7Yi5wcm90b2NvbF9leHByZXNzaW9uID0gL15bYS16XVthLXowLTkuKy1dKiQvaTtiLmlkbl9leHByZXNzaW9uID0gL1teYS16MC05XFwuLV0vaTtiLnB1bnljb2RlX2V4cHJlc3Npb24gPSAvKHhuLS0pL2k7Yi5pcDRfZXhwcmVzc2lvbiA9IC9eXFxkezEsM31cXC5cXGR7MSwzfVxcLlxcZHsxLDN9XFwuXFxkezEsM30kLztiLmlwNl9leHByZXNzaW9uID0gL15cXHMqKCgoWzAtOUEtRmEtZl17MSw0fTopezd9KFswLTlBLUZhLWZdezEsNH18OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezZ9KDpbMC05QS1GYS1mXXsxLDR9fCgoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7NX0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSwyfSl8OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7NH0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSwzfSl8KCg6WzAtOUEtRmEtZl17MSw0fSk/OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezN9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNH0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsMn06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7Mn0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw1fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCwzfTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXsxfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDZ9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDR9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCg6KCgoOlswLTlBLUZhLWZdezEsNH0pezEsN30pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsNX06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSkpKCUuKyk/XFxzKiQvO1xuICBiLmZpbmRfdXJpX2V4cHJlc3Npb24gPSAvXFxiKCg/OlthLXpdW1xcdy1dKzooPzpcXC97MSwzfXxbYS16MC05JV0pfHd3d1xcZHswLDN9Wy5dfFthLXowLTkuXFwtXStbLl1bYS16XXsyLDR9XFwvKSg/OlteXFxzKCk8Pl0rfFxcKChbXlxccygpPD5dK3woXFwoW15cXHMoKTw+XStcXCkpKSpcXCkpKyg/OlxcKChbXlxccygpPD5dK3woXFwoW15cXHMoKTw+XStcXCkpKSpcXCl8W15cXHNgISgpXFxbXFxde307OidcIi4sPD4/XFx1MDBhYlxcdTAwYmJcXHUyMDFjXFx1MjAxZFxcdTIwMThcXHUyMDE5XSkpL2lnO2IuZmluZFVyaSA9IHsgc3RhcnQ6IC9cXGIoPzooW2Etel1bYS16MC05ListXSo6XFwvXFwvKXx3d3dcXC4pL2dpLCBlbmQ6IC9bXFxzXFxyXFxuXXwkLywgdHJpbTogL1tgISgpXFxbXFxde307OidcIi4sPD4/XFx1MDBhYlxcdTAwYmJcXHUyMDFjXFx1MjAxZFxcdTIwMWVcXHUyMDE4XFx1MjAxOV0rJC8gfTtiLmRlZmF1bHRQb3J0cyA9IHsgaHR0cDogXCI4MFwiLCBodHRwczogXCI0NDNcIiwgZnRwOiBcIjIxXCIsIGdvcGhlcjogXCI3MFwiLCB3czogXCI4MFwiLCB3c3M6IFwiNDQzXCIgfTtiLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycyA9IC9bXmEtekEtWjAtOVxcLi1dLztiLmRvbUF0dHJpYnV0ZXMgPSB7IGE6IFwiaHJlZlwiLCBibG9ja3F1b3RlOiBcImNpdGVcIiwgbGluazogXCJocmVmXCIsIGJhc2U6IFwiaHJlZlwiLCBzY3JpcHQ6IFwic3JjXCIsIGZvcm06IFwiYWN0aW9uXCIsIGltZzogXCJzcmNcIiwgYXJlYTogXCJocmVmXCIsIGlmcmFtZTogXCJzcmNcIiwgZW1iZWQ6IFwic3JjXCIsIHNvdXJjZTogXCJzcmNcIiwgdHJhY2s6IFwic3JjXCIsIGlucHV0OiBcInNyY1wiLCBhdWRpbzogXCJzcmNcIiwgdmlkZW86IFwic3JjXCIgfTtiLmdldERvbUF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgaWYgKGEgJiYgYS5ub2RlTmFtZSkge1xuICAgICAgdmFyIGMgPSBhLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7cmV0dXJuIFwiaW5wdXRcIiA9PT0gYyAmJiBcImltYWdlXCIgIT09IGEudHlwZSA/IHZvaWQgMCA6IGIuZG9tQXR0cmlidXRlc1tjXTtcbiAgICB9XG4gIH07Yi5lbmNvZGUgPSBEO2IuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O2IuaXNvODg1OSA9IGZ1bmN0aW9uICgpIHtcbiAgICBiLmVuY29kZSA9IGVzY2FwZTtiLmRlY29kZSA9IHVuZXNjYXBlO1xuICB9O2IudW5pY29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBiLmVuY29kZSA9IEQ7Yi5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG4gIH07Yi5jaGFyYWN0ZXJzID0geyBwYXRobmFtZTogeyBlbmNvZGU6IHsgZXhwcmVzc2lvbjogLyUoMjR8MjZ8MkJ8MkN8M0J8M0R8M0F8NDApL2lnLCBtYXA6IHsgXCIlMjRcIjogXCIkXCIsIFwiJTI2XCI6IFwiJlwiLCBcIiUyQlwiOiBcIitcIiwgXCIlMkNcIjogXCIsXCIsIFwiJTNCXCI6IFwiO1wiLCBcIiUzRFwiOiBcIj1cIiwgXCIlM0FcIjogXCI6XCIsIFwiJTQwXCI6IFwiQFwiIH0gfSwgZGVjb2RlOiB7IGV4cHJlc3Npb246IC9bXFwvXFw/I10vZywgbWFwOiB7IFwiL1wiOiBcIiUyRlwiLCBcIj9cIjogXCIlM0ZcIiwgXCIjXCI6IFwiJTIzXCIgfSB9IH0sIHJlc2VydmVkOiB7IGVuY29kZTogeyBleHByZXNzaW9uOiAvJSgyMXwyM3wyNHwyNnwyN3wyOHwyOXwyQXwyQnwyQ3wyRnwzQXwzQnwzRHwzRnw0MHw1Qnw1RCkvaWcsIG1hcDogeyBcIiUzQVwiOiBcIjpcIiwgXCIlMkZcIjogXCIvXCIsIFwiJTNGXCI6IFwiP1wiLCBcIiUyM1wiOiBcIiNcIiwgXCIlNUJcIjogXCJbXCIsIFwiJTVEXCI6IFwiXVwiLCBcIiU0MFwiOiBcIkBcIiwgXCIlMjFcIjogXCIhXCIsIFwiJTI0XCI6IFwiJFwiLCBcIiUyNlwiOiBcIiZcIiwgXCIlMjdcIjogXCInXCIsIFwiJTI4XCI6IFwiKFwiLCBcIiUyOVwiOiBcIilcIiwgXCIlMkFcIjogXCIqXCIsIFwiJTJCXCI6IFwiK1wiLCBcIiUyQ1wiOiBcIixcIixcbiAgICAgICAgICBcIiUzQlwiOiBcIjtcIiwgXCIlM0RcIjogXCI9XCIgfSB9IH0sIHVybnBhdGg6IHsgZW5jb2RlOiB7IGV4cHJlc3Npb246IC8lKDIxfDI0fDI3fDI4fDI5fDJBfDJCfDJDfDNCfDNEfDQwKS9pZywgbWFwOiB7IFwiJTIxXCI6IFwiIVwiLCBcIiUyNFwiOiBcIiRcIiwgXCIlMjdcIjogXCInXCIsIFwiJTI4XCI6IFwiKFwiLCBcIiUyOVwiOiBcIilcIiwgXCIlMkFcIjogXCIqXCIsIFwiJTJCXCI6IFwiK1wiLCBcIiUyQ1wiOiBcIixcIiwgXCIlM0JcIjogXCI7XCIsIFwiJTNEXCI6IFwiPVwiLCBcIiU0MFwiOiBcIkBcIiB9IH0sIGRlY29kZTogeyBleHByZXNzaW9uOiAvW1xcL1xcPyM6XS9nLCBtYXA6IHsgXCIvXCI6IFwiJTJGXCIsIFwiP1wiOiBcIiUzRlwiLCBcIiNcIjogXCIlMjNcIiwgXCI6XCI6IFwiJTNBXCIgfSB9IH0gfTtiLmVuY29kZVF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICB2YXIgZCA9IGIuZW5jb2RlKGEgKyBcIlwiKTt2b2lkIDAgPT09IGMgJiYgKGMgPSBiLmVzY2FwZVF1ZXJ5U3BhY2UpO3JldHVybiBjID8gZC5yZXBsYWNlKC8lMjAvZywgXCIrXCIpIDogZDtcbiAgfTtiLmRlY29kZVF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBhICs9IFwiXCI7dm9pZCAwID09PSBjICYmIChjID0gYi5lc2NhcGVRdWVyeVNwYWNlKTt0cnkge1xuICAgICAgcmV0dXJuIGIuZGVjb2RlKGMgPyBhLnJlcGxhY2UoL1xcKy9nLCBcIiUyMFwiKSA6IGEpO1xuICAgIH0gY2F0Y2ggKGQpIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgfTt2YXIgdSA9IHsgZW5jb2RlOiBcImVuY29kZVwiLCBkZWNvZGU6IFwiZGVjb2RlXCIgfSxcbiAgICAgIHEsXG4gICAgICB5ID0gZnVuY3Rpb24geShhLCBjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYltjXShkICsgXCJcIikucmVwbGFjZShiLmNoYXJhY3RlcnNbYV1bY10uZXhwcmVzc2lvbiwgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICByZXR1cm4gYi5jaGFyYWN0ZXJzW2FdW2NdLm1hcFtkXTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChwKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgICAgfVxuICAgIH07XG4gIH07Zm9yIChxIGluIHUpIGJbcSArIFwiUGF0aFNlZ21lbnRcIl0gPSB5KFwicGF0aG5hbWVcIiwgdVtxXSksIGJbcSArIFwiVXJuUGF0aFNlZ21lbnRcIl0gPSB5KFwidXJucGF0aFwiLCB1W3FdKTt1ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHApIHtcbiAgICAgIHZhciBlO2UgPSBkID8gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgcmV0dXJuIGJbY10oYltkXShhKSk7XG4gICAgICB9IDogYltjXTtwID0gKHAgKyBcIlwiKS5zcGxpdChhKTtmb3IgKHZhciBmID0gMCwgaCA9IHAubGVuZ3RoOyBmIDwgaDsgZisrKSBwW2ZdID0gZShwW2ZdKTtyZXR1cm4gcC5qb2luKGEpO1xuICAgIH07XG4gIH07Yi5kZWNvZGVQYXRoID0gdShcIi9cIiwgXCJkZWNvZGVQYXRoU2VnbWVudFwiKTtiLmRlY29kZVVyblBhdGggPSB1KFwiOlwiLCBcImRlY29kZVVyblBhdGhTZWdtZW50XCIpO2IucmVjb2RlUGF0aCA9IHUoXCIvXCIsIFwiZW5jb2RlUGF0aFNlZ21lbnRcIiwgXCJkZWNvZGVcIik7Yi5yZWNvZGVVcm5QYXRoID0gdShcIjpcIiwgXCJlbmNvZGVVcm5QYXRoU2VnbWVudFwiLCBcImRlY29kZVwiKTtiLmVuY29kZVJlc2VydmVkID0geShcInJlc2VydmVkXCIsIFwiZW5jb2RlXCIpO2IucGFyc2UgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIHZhciBkO2MgfHwgKGMgPSB7fSk7ZCA9IGEuaW5kZXhPZihcIiNcIik7LTEgPCBkICYmIChjLmZyYWdtZW50ID0gYS5zdWJzdHJpbmcoZCArIDEpIHx8IG51bGwsIGEgPSBhLnN1YnN0cmluZygwLCBkKSk7ZCA9IGEuaW5kZXhPZihcIj9cIik7LTEgPCBkICYmIChjLnF1ZXJ5ID0gYS5zdWJzdHJpbmcoZCArIDEpIHx8IG51bGwsIGEgPSBhLnN1YnN0cmluZygwLCBkKSk7XCIvL1wiID09PSBhLnN1YnN0cmluZygwLCAyKSA/IChjLnByb3RvY29sID0gbnVsbCwgYSA9IGEuc3Vic3RyaW5nKDIpLCBhID0gYi5wYXJzZUF1dGhvcml0eShhLCBjKSkgOiAoZCA9IGEuaW5kZXhPZihcIjpcIiksIC0xIDwgZCAmJiAoYy5wcm90b2NvbCA9IGEuc3Vic3RyaW5nKDAsIGQpIHx8IG51bGwsIGMucHJvdG9jb2wgJiYgIWMucHJvdG9jb2wubWF0Y2goYi5wcm90b2NvbF9leHByZXNzaW9uKSA/IGMucHJvdG9jb2wgPSB2b2lkIDAgOiBcIi8vXCIgPT09IGEuc3Vic3RyaW5nKGQgKyAxLCBkICsgMykgPyAoYSA9IGEuc3Vic3RyaW5nKGQgKyAzKSwgYSA9IGIucGFyc2VBdXRob3JpdHkoYSwgYykpIDogKGEgPSBhLnN1YnN0cmluZyhkICsgMSksIGMudXJuID0gITApKSk7Yy5wYXRoID0gYTtyZXR1cm4gYztcbiAgfTtiLnBhcnNlSG9zdCA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgdmFyIGQgPSBhLmluZGV4T2YoXCIvXCIpLFxuICAgICAgICBiOy0xID09PSBkICYmIChkID0gYS5sZW5ndGgpO2lmIChcIltcIiA9PT0gYS5jaGFyQXQoMCkpIGIgPSBhLmluZGV4T2YoXCJdXCIpLCBjLmhvc3RuYW1lID0gYS5zdWJzdHJpbmcoMSwgYikgfHwgbnVsbCwgYy5wb3J0ID0gYS5zdWJzdHJpbmcoYiArIDIsIGQpIHx8IG51bGwsIFwiL1wiID09PSBjLnBvcnQgJiYgKGMucG9ydCA9IG51bGwpO2Vsc2Uge1xuICAgICAgdmFyIGUgPSBhLmluZGV4T2YoXCI6XCIpO2IgPSBhLmluZGV4T2YoXCIvXCIpO2UgPSBhLmluZGV4T2YoXCI6XCIsIGUgKyAxKTtcbiAgICAgIC0xICE9PSBlICYmICgtMSA9PT0gYiB8fCBlIDwgYikgPyAoYy5ob3N0bmFtZSA9IGEuc3Vic3RyaW5nKDAsIGQpIHx8IG51bGwsIGMucG9ydCA9IG51bGwpIDogKGIgPSBhLnN1YnN0cmluZygwLCBkKS5zcGxpdChcIjpcIiksIGMuaG9zdG5hbWUgPSBiWzBdIHx8IG51bGwsIGMucG9ydCA9IGJbMV0gfHwgbnVsbCk7XG4gICAgfWMuaG9zdG5hbWUgJiYgXCIvXCIgIT09IGEuc3Vic3RyaW5nKGQpLmNoYXJBdCgwKSAmJiAoZCsrLCBhID0gXCIvXCIgKyBhKTtyZXR1cm4gYS5zdWJzdHJpbmcoZCkgfHwgXCIvXCI7XG4gIH07Yi5wYXJzZUF1dGhvcml0eSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgYSA9IGIucGFyc2VVc2VyaW5mbyhhLCBjKTtyZXR1cm4gYi5wYXJzZUhvc3QoYSwgYyk7XG4gIH07Yi5wYXJzZVVzZXJpbmZvID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICB2YXIgZCA9IGEuaW5kZXhPZihcIi9cIiksXG4gICAgICAgIHAgPSBhLmxhc3RJbmRleE9mKFwiQFwiLCAtMSA8IGQgPyBkIDogYS5sZW5ndGggLSAxKTstMSA8IHAgJiYgKC0xID09PSBkIHx8IHAgPCBkKSA/IChkID0gYS5zdWJzdHJpbmcoMCwgcCkuc3BsaXQoXCI6XCIpLCBjLnVzZXJuYW1lID0gZFswXSA/IGIuZGVjb2RlKGRbMF0pIDogbnVsbCwgZC5zaGlmdCgpLCBjLnBhc3N3b3JkID0gZFswXSA/IGIuZGVjb2RlKGQuam9pbihcIjpcIikpIDogbnVsbCwgYSA9IGEuc3Vic3RyaW5nKHAgKyAxKSkgOiAoYy51c2VybmFtZSA9IG51bGwsIGMucGFzc3dvcmQgPSBudWxsKTtyZXR1cm4gYTtcbiAgfTtiLnBhcnNlUXVlcnkgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICghYSkgcmV0dXJuIHt9O2EgPSBhLnJlcGxhY2UoLyYrL2csIFwiJlwiKS5yZXBsYWNlKC9eXFw/KiYqfCYrJC9nLCBcIlwiKTtpZiAoIWEpIHJldHVybiB7fTtmb3IgKHZhciBkID0ge30sIHAgPSBhLnNwbGl0KFwiJlwiKSwgZSA9IHAubGVuZ3RoLCBmLCBoLCBnID0gMDsgZyA8IGU7IGcrKykgZiA9IHBbZ10uc3BsaXQoXCI9XCIpLCBoID0gYi5kZWNvZGVRdWVyeShmLnNoaWZ0KCksIGMpLCBmID0gZi5sZW5ndGggPyBiLmRlY29kZVF1ZXJ5KGYuam9pbihcIj1cIiksIGMpIDogbnVsbCwgdi5jYWxsKGQsIGgpID8gKFwic3RyaW5nXCIgPT09IHR5cGVvZiBkW2hdICYmIChkW2hdID0gW2RbaF1dKSwgZFtoXS5wdXNoKGYpKSA6IGRbaF0gPSBmO3JldHVybiBkO1xuICB9O2IuYnVpbGQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBjID0gXCJcIjthLnByb3RvY29sICYmIChjICs9IGEucHJvdG9jb2wgKyBcIjpcIik7YS51cm4gfHwgIWMgJiYgIWEuaG9zdG5hbWUgfHwgKGMgKz0gXCIvL1wiKTtjICs9IGIuYnVpbGRBdXRob3JpdHkoYSkgfHwgXCJcIjtcInN0cmluZ1wiID09PSB0eXBlb2YgYS5wYXRoICYmIChcIi9cIiAhPT0gYS5wYXRoLmNoYXJBdCgwKSAmJiBcInN0cmluZ1wiID09PSB0eXBlb2YgYS5ob3N0bmFtZSAmJiAoYyArPSBcIi9cIiksIGMgKz0gYS5wYXRoKTtcInN0cmluZ1wiID09PSB0eXBlb2YgYS5xdWVyeSAmJiBhLnF1ZXJ5ICYmIChjICs9IFwiP1wiICsgYS5xdWVyeSk7XCJzdHJpbmdcIiA9PT0gdHlwZW9mIGEuZnJhZ21lbnQgJiYgYS5mcmFnbWVudCAmJiAoYyArPSBcIiNcIiArIGEuZnJhZ21lbnQpO3JldHVybiBjO1xuICB9O2IuYnVpbGRIb3N0ID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgYyA9IFwiXCI7aWYgKGEuaG9zdG5hbWUpIGMgPSBiLmlwNl9leHByZXNzaW9uLnRlc3QoYS5ob3N0bmFtZSkgPyBjICsgKFwiW1wiICsgYS5ob3N0bmFtZSArIFwiXVwiKSA6IGMgKyBhLmhvc3RuYW1lO2Vsc2UgcmV0dXJuIFwiXCI7YS5wb3J0ICYmIChjICs9IFwiOlwiICsgYS5wb3J0KTtyZXR1cm4gYztcbiAgfTtiLmJ1aWxkQXV0aG9yaXR5ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYi5idWlsZFVzZXJpbmZvKGEpICsgYi5idWlsZEhvc3QoYSk7XG4gIH07XG4gIGIuYnVpbGRVc2VyaW5mbyA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGMgPSBcIlwiO2EudXNlcm5hbWUgJiYgKGMgKz0gYi5lbmNvZGUoYS51c2VybmFtZSksIGEucGFzc3dvcmQgJiYgKGMgKz0gXCI6XCIgKyBiLmVuY29kZShhLnBhc3N3b3JkKSksIGMgKz0gXCJAXCIpO3JldHVybiBjO1xuICB9O2IuYnVpbGRRdWVyeSA9IGZ1bmN0aW9uIChhLCBjLCBkKSB7XG4gICAgdmFyIHAgPSBcIlwiLFxuICAgICAgICBlLFxuICAgICAgICBmLFxuICAgICAgICBoLFxuICAgICAgICBnO2ZvciAoZiBpbiBhKSBpZiAodi5jYWxsKGEsIGYpICYmIGYpIGlmICh3KGFbZl0pKSBmb3IgKGUgPSB7fSwgaCA9IDAsIGcgPSBhW2ZdLmxlbmd0aDsgaCA8IGc7IGgrKykgdm9pZCAwICE9PSBhW2ZdW2hdICYmIHZvaWQgMCA9PT0gZVthW2ZdW2hdICsgXCJcIl0gJiYgKHAgKz0gXCImXCIgKyBiLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoZiwgYVtmXVtoXSwgZCksICEwICE9PSBjICYmIChlW2FbZl1baF0gKyBcIlwiXSA9ICEwKSk7ZWxzZSB2b2lkIDAgIT09IGFbZl0gJiYgKHAgKz0gXCImXCIgKyBiLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoZiwgYVtmXSwgZCkpO3JldHVybiBwLnN1YnN0cmluZygxKTtcbiAgfTtiLmJ1aWxkUXVlcnlQYXJhbWV0ZXIgPSBmdW5jdGlvbiAoYSwgYywgZCkge1xuICAgIHJldHVybiBiLmVuY29kZVF1ZXJ5KGEsIGQpICsgKG51bGwgIT09IGMgPyBcIj1cIiArIGIuZW5jb2RlUXVlcnkoYywgZCkgOiBcIlwiKTtcbiAgfTtiLmFkZFF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICBpZiAoXCJvYmplY3RcIiA9PT0gdHlwZW9mIGMpIGZvciAodmFyIGUgaW4gYykgdi5jYWxsKGMsIGUpICYmIGIuYWRkUXVlcnkoYSwgZSwgY1tlXSk7ZWxzZSBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGMpIHZvaWQgMCA9PT0gYVtjXSA/IGFbY10gPSBkIDogKFwic3RyaW5nXCIgPT09IHR5cGVvZiBhW2NdICYmIChhW2NdID0gW2FbY11dKSwgdyhkKSB8fCAoZCA9IFtkXSksIGFbY10gPSAoYVtjXSB8fCBbXSkuY29uY2F0KGQpKTtlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVUkkuYWRkUXVlcnkoKSBhY2NlcHRzIGFuIG9iamVjdCwgc3RyaW5nIGFzIHRoZSBuYW1lIHBhcmFtZXRlclwiKTtcbiAgfTtiLnJlbW92ZVF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICB2YXIgZTtpZiAodyhjKSkgZm9yIChkID0gMCwgZSA9IGMubGVuZ3RoOyBkIDwgZTsgZCsrKSBhW2NbZF1dID0gdm9pZCAwO2Vsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiBjKSBmb3IgKGUgaW4gYykgdi5jYWxsKGMsIGUpICYmIGIucmVtb3ZlUXVlcnkoYSwgZSwgY1tlXSk7ZWxzZSBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGMpIGlmICh2b2lkIDAgIT09IGQpIGlmIChhW2NdID09PSBkKSBhW2NdID0gdm9pZCAwO2Vsc2Uge1xuICAgICAgaWYgKHcoYVtjXSkpIHtcbiAgICAgICAgZSA9IGFbY107dmFyIGYgPSB7fSxcbiAgICAgICAgICAgIGgsXG4gICAgICAgICAgICBnO2lmICh3KGQpKSBmb3IgKGggPSAwLCBnID0gZC5sZW5ndGg7IGggPCBnOyBoKyspIGZbZFtoXV0gPSAhMDtlbHNlIGZbZF0gPSAhMDtoID0gMDtmb3IgKGcgPSBlLmxlbmd0aDsgaCA8IGc7IGgrKykgdm9pZCAwICE9PSBmW2VbaF1dICYmIChlLnNwbGljZShoLCAxKSwgZy0tLCBoLS0pO2FbY10gPSBlO1xuICAgICAgfVxuICAgIH0gZWxzZSBhW2NdID0gdm9pZCAwO2Vsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVSSS5yZW1vdmVRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIGZpcnN0IHBhcmFtZXRlclwiKTtcbiAgfTtiLmhhc1F1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQsIGUpIHtcbiAgICBpZiAoXCJvYmplY3RcIiA9PT0gdHlwZW9mIGMpIHtcbiAgICAgIGZvciAodmFyIGYgaW4gYykgaWYgKHYuY2FsbChjLCBmKSAmJiAhYi5oYXNRdWVyeShhLCBmLCBjW2ZdKSkgcmV0dXJuICExO3JldHVybiAhMDtcbiAgICB9aWYgKFwic3RyaW5nXCIgIT09IHR5cGVvZiBjKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVVJJLmhhc1F1ZXJ5KCkgYWNjZXB0cyBhbiBvYmplY3QsIHN0cmluZyBhcyB0aGUgbmFtZSBwYXJhbWV0ZXJcIik7XG4gICAgc3dpdGNoIChCKGQpKSB7Y2FzZSBcIlVuZGVmaW5lZFwiOlxuICAgICAgICByZXR1cm4gYyBpbiBhO2Nhc2UgXCJCb29sZWFuXCI6XG4gICAgICAgIHJldHVybiAoYSA9IEJvb2xlYW4odyhhW2NdKSA/IGFbY10ubGVuZ3RoIDogYVtjXSksIGQgPT09IGEpO2Nhc2UgXCJGdW5jdGlvblwiOlxuICAgICAgICByZXR1cm4gISFkKGFbY10sIGMsIGEpO2Nhc2UgXCJBcnJheVwiOlxuICAgICAgICByZXR1cm4gdyhhW2NdKSA/IChlID8gaCA6IHIpKGFbY10sIGQpIDogITE7Y2FzZSBcIlJlZ0V4cFwiOlxuICAgICAgICByZXR1cm4gdyhhW2NdKSA/IGUgPyBoKGFbY10sIGQpIDogITEgOiBCb29sZWFuKGFbY10gJiYgYVtjXS5tYXRjaChkKSk7Y2FzZSBcIk51bWJlclwiOlxuICAgICAgICBkID0gU3RyaW5nKGQpO2Nhc2UgXCJTdHJpbmdcIjpcbiAgICAgICAgcmV0dXJuIHcoYVtjXSkgPyBlID8gaChhW2NdLCBkKSA6ICExIDogYVtjXSA9PT0gZDtkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVVJJLmhhc1F1ZXJ5KCkgYWNjZXB0cyB1bmRlZmluZWQsIGJvb2xlYW4sIHN0cmluZywgbnVtYmVyLCBSZWdFeHAsIEZ1bmN0aW9uIGFzIHRoZSB2YWx1ZSBwYXJhbWV0ZXJcIik7fVxuICB9O2IuY29tbW9uUGF0aCA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgdmFyIGQgPSBNYXRoLm1pbihhLmxlbmd0aCwgYy5sZW5ndGgpLFxuICAgICAgICBiO2ZvciAoYiA9IDA7IGIgPCBkOyBiKyspIGlmIChhLmNoYXJBdChiKSAhPT0gYy5jaGFyQXQoYikpIHtcbiAgICAgIGItLTticmVhaztcbiAgICB9aWYgKDEgPiBiKSByZXR1cm4gYS5jaGFyQXQoMCkgPT09IGMuY2hhckF0KDApICYmIFwiL1wiID09PSBhLmNoYXJBdCgwKSA/IFwiL1wiIDogXCJcIjtpZiAoXCIvXCIgIT09IGEuY2hhckF0KGIpIHx8IFwiL1wiICE9PSBjLmNoYXJBdChiKSkgYiA9IGEuc3Vic3RyaW5nKDAsIGIpLmxhc3RJbmRleE9mKFwiL1wiKTtyZXR1cm4gYS5zdWJzdHJpbmcoMCwgYiArIDEpO1xuICB9O2Iud2l0aGluU3RyaW5nID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICBkIHx8IChkID0ge30pO3ZhciBlID0gZC5zdGFydCB8fCBiLmZpbmRVcmkuc3RhcnQsXG4gICAgICAgIGYgPSBkLmVuZCB8fCBiLmZpbmRVcmkuZW5kLFxuICAgICAgICBoID0gZC50cmltIHx8IGIuZmluZFVyaS50cmltLFxuICAgICAgICBnID0gL1thLXowLTktXT1bXCInXT8kL2k7Zm9yIChlLmxhc3RJbmRleCA9IDA7Oykge1xuICAgICAgdmFyIHIgPSBlLmV4ZWMoYSk7aWYgKCFyKSBicmVhaztyID0gci5pbmRleDtpZiAoZC5pZ25vcmVIdG1sKSB7XG4gICAgICAgIHZhciBrID0gYS5zbGljZShNYXRoLm1heChyIC0gMywgMCksIHIpO2lmIChrICYmIGcudGVzdChrKSkgY29udGludWU7XG4gICAgICB9dmFyIGsgPSByICsgYS5zbGljZShyKS5zZWFyY2goZiksXG4gICAgICAgICAgbSA9IGEuc2xpY2UociwgaykucmVwbGFjZShoLCBcIlwiKTtkLmlnbm9yZSAmJiBkLmlnbm9yZS50ZXN0KG0pIHx8IChrID0gciArIG0ubGVuZ3RoLCBtID0gYyhtLCByLCBrLCBhKSwgYSA9IGEuc2xpY2UoMCwgcikgKyBtICsgYS5zbGljZShrKSwgZS5sYXN0SW5kZXggPSByICsgbS5sZW5ndGgpO1xuICAgIH1lLmxhc3RJbmRleCA9IDA7cmV0dXJuIGE7XG4gIH07Yi5lbnN1cmVWYWxpZEhvc3RuYW1lID0gZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAoYS5tYXRjaChiLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycykpIHtcbiAgICAgIGlmICghZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkhvc3RuYW1lIFxcXCJcIiArIGEgKyBcIlxcXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuLV0gYW5kIFB1bnljb2RlLmpzIGlzIG5vdCBhdmFpbGFibGVcIik7aWYgKGYudG9BU0NJSShhKS5tYXRjaChiLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycykpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJIb3N0bmFtZSBcXFwiXCIgKyBhICsgXCJcXFwiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05Li1dXCIpO1xuICAgIH1cbiAgfTtiLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmIChhKSByZXR1cm4gKGEgPSB7IFVSSTogdGhpcy5ub0NvbmZsaWN0KCkgfSwgbS5VUklUZW1wbGF0ZSAmJiBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiBtLlVSSVRlbXBsYXRlLm5vQ29uZmxpY3QgJiYgKGEuVVJJVGVtcGxhdGUgPSBtLlVSSVRlbXBsYXRlLm5vQ29uZmxpY3QoKSksIG0uSVB2NiAmJiBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiBtLklQdjYubm9Db25mbGljdCAmJiAoYS5JUHY2ID0gbS5JUHY2Lm5vQ29uZmxpY3QoKSksIG0uU2Vjb25kTGV2ZWxEb21haW5zICYmIFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIG0uU2Vjb25kTGV2ZWxEb21haW5zLm5vQ29uZmxpY3QgJiYgKGEuU2Vjb25kTGV2ZWxEb21haW5zID0gbS5TZWNvbmRMZXZlbERvbWFpbnMubm9Db25mbGljdCgpKSwgYSk7bS5VUkkgPT09IHRoaXMgJiYgKG0uVVJJID0gbik7cmV0dXJuIHRoaXM7XG4gIH07ZS5idWlsZCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgaWYgKCEwID09PSBhKSB0aGlzLl9kZWZlcnJlZF9idWlsZCA9ICEwO2Vsc2UgaWYgKHZvaWQgMCA9PT0gYSB8fCB0aGlzLl9kZWZlcnJlZF9idWlsZCkgdGhpcy5fc3RyaW5nID0gYi5idWlsZCh0aGlzLl9wYXJ0cyksIHRoaXMuX2RlZmVycmVkX2J1aWxkID0gITE7cmV0dXJuIHRoaXM7XG4gIH07ZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IGIodGhpcyk7XG4gIH07ZS52YWx1ZU9mID0gZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5idWlsZCghMSkuX3N0cmluZztcbiAgfTtlLnByb3RvY29sID0gQShcInByb3RvY29sXCIpO2UudXNlcm5hbWUgPSBBKFwidXNlcm5hbWVcIik7ZS5wYXNzd29yZCA9IEEoXCJwYXNzd29yZFwiKTtlLmhvc3RuYW1lID0gQShcImhvc3RuYW1lXCIpO2UucG9ydCA9IEEoXCJwb3J0XCIpO2UucXVlcnkgPSB0KFwicXVlcnlcIiwgXCI/XCIpO2UuZnJhZ21lbnQgPSB0KFwiZnJhZ21lbnRcIiwgXCIjXCIpO2Uuc2VhcmNoID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICB2YXIgYiA9IHRoaXMucXVlcnkoYSwgYyk7cmV0dXJuIFwic3RyaW5nXCIgPT09IHR5cGVvZiBiICYmIGIubGVuZ3RoID8gXCI/XCIgKyBiIDogYjtcbiAgfTtlLmhhc2ggPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIHZhciBiID0gdGhpcy5mcmFnbWVudChhLCBjKTtyZXR1cm4gXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGIgJiYgYi5sZW5ndGggPyBcIiNcIiArIGIgOiBiO1xuICB9O2UucGF0aG5hbWUgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh2b2lkIDAgPT09IGEgfHwgITAgPT09IGEpIHtcbiAgICAgIHZhciBkID0gdGhpcy5fcGFydHMucGF0aCB8fCAodGhpcy5fcGFydHMuaG9zdG5hbWUgPyBcIi9cIiA6IFwiXCIpO3JldHVybiBhID8gKHRoaXMuX3BhcnRzLnVybiA/IGIuZGVjb2RlVXJuUGF0aCA6IGIuZGVjb2RlUGF0aCkoZCkgOiBkO1xuICAgIH10aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMudXJuID8gYSA/IGIucmVjb2RlVXJuUGF0aChhKSA6IFwiXCIgOiBhID8gYi5yZWNvZGVQYXRoKGEpIDogXCIvXCI7dGhpcy5idWlsZCghYyk7cmV0dXJuIHRoaXM7XG4gIH07ZS5wYXRoID0gZS5wYXRobmFtZTtlLmhyZWYgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIHZhciBkO2lmICh2b2lkIDAgPT09IGEpIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7dGhpcy5fc3RyaW5nID0gXCJcIjt0aGlzLl9wYXJ0cyA9IGIuX3BhcnRzKCk7dmFyIGUgPSBhIGluc3RhbmNlb2YgYixcbiAgICAgICAgZiA9IFwib2JqZWN0XCIgPT09IHR5cGVvZiBhICYmIChhLmhvc3RuYW1lIHx8IGEucGF0aCB8fCBhLnBhdGhuYW1lKTthLm5vZGVOYW1lICYmIChmID0gYi5nZXREb21BdHRyaWJ1dGUoYSksIGEgPSBhW2ZdIHx8IFwiXCIsIGYgPSAhMSk7IWUgJiYgZiAmJiB2b2lkIDAgIT09IGEucGF0aG5hbWUgJiYgKGEgPSBhLnRvU3RyaW5nKCkpO2lmIChcInN0cmluZ1wiID09PSB0eXBlb2YgYSB8fCBhIGluc3RhbmNlb2YgU3RyaW5nKSB0aGlzLl9wYXJ0cyA9IGIucGFyc2UoU3RyaW5nKGEpLCB0aGlzLl9wYXJ0cyk7ZWxzZSBpZiAoZSB8fCBmKSBmb3IgKGQgaW4gKGUgPSBlID8gYS5fcGFydHMgOiBhLCBlKSkgdi5jYWxsKHRoaXMuX3BhcnRzLCBkKSAmJiAodGhpcy5fcGFydHNbZF0gPSBlW2RdKTtlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJpbnZhbGlkIGlucHV0XCIpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2UuaXMgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBjID0gITEsXG4gICAgICAgIGQgPSAhMSxcbiAgICAgICAgZSA9ICExLFxuICAgICAgICBmID0gITEsXG4gICAgICAgIGggPSAhMSxcbiAgICAgICAgciA9ICExLFxuICAgICAgICBrID0gITEsXG4gICAgICAgIG0gPSAhdGhpcy5fcGFydHMudXJuO3RoaXMuX3BhcnRzLmhvc3RuYW1lICYmIChtID0gITEsIGQgPSBiLmlwNF9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpLCBlID0gYi5pcDZfZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSwgYyA9IGQgfHwgZSwgaCA9IChmID0gIWMpICYmIGcgJiYgZy5oYXModGhpcy5fcGFydHMuaG9zdG5hbWUpLCByID0gZiAmJiBiLmlkbl9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpLCBrID0gZiAmJiBiLnB1bnljb2RlX2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkpO3N3aXRjaCAoYS50b0xvd2VyQ2FzZSgpKSB7Y2FzZSBcInJlbGF0aXZlXCI6XG4gICAgICAgIHJldHVybiBtO2Nhc2UgXCJhYnNvbHV0ZVwiOlxuICAgICAgICByZXR1cm4gIW07Y2FzZSBcImRvbWFpblwiOmNhc2UgXCJuYW1lXCI6XG4gICAgICAgIHJldHVybiBmO2Nhc2UgXCJzbGRcIjpcbiAgICAgICAgcmV0dXJuIGg7Y2FzZSBcImlwXCI6XG4gICAgICAgIHJldHVybiBjO2Nhc2UgXCJpcDRcIjpjYXNlIFwiaXB2NFwiOmNhc2UgXCJpbmV0NFwiOlxuICAgICAgICByZXR1cm4gZDtjYXNlIFwiaXA2XCI6Y2FzZSBcImlwdjZcIjpjYXNlIFwiaW5ldDZcIjpcbiAgICAgICAgcmV0dXJuIGU7Y2FzZSBcImlkblwiOlxuICAgICAgICByZXR1cm4gcjtjYXNlIFwidXJsXCI6XG4gICAgICAgIHJldHVybiAhdGhpcy5fcGFydHMudXJuO2Nhc2UgXCJ1cm5cIjpcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fcGFydHMudXJuO1xuICAgICAgY2FzZSBcInB1bnljb2RlXCI6XG4gICAgICAgIHJldHVybiBrO31yZXR1cm4gbnVsbDtcbiAgfTt2YXIgRSA9IGUucHJvdG9jb2wsXG4gICAgICBGID0gZS5wb3J0LFxuICAgICAgRyA9IGUuaG9zdG5hbWU7ZS5wcm90b2NvbCA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHZvaWQgMCAhPT0gYSAmJiBhICYmIChhID0gYS5yZXBsYWNlKC86KFxcL1xcLyk/JC8sIFwiXCIpLCAhYS5tYXRjaChiLnByb3RvY29sX2V4cHJlc3Npb24pKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByb3RvY29sIFxcXCJcIiArIGEgKyBcIlxcXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuKy1dIG9yIGRvZXNuJ3Qgc3RhcnQgd2l0aCBbQS1aXVwiKTtyZXR1cm4gRS5jYWxsKHRoaXMsIGEsIGMpO1xuICB9O2Uuc2NoZW1lID0gZS5wcm90b2NvbDtlLnBvcnQgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwICE9PSBhICYmICgwID09PSBhICYmIChhID0gbnVsbCksIGEgJiYgKGEgKz0gXCJcIiwgXCI6XCIgPT09IGEuY2hhckF0KDApICYmIChhID0gYS5zdWJzdHJpbmcoMSkpLCBhLm1hdGNoKC9bXjAtOV0vKSkpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUG9ydCBcXFwiXCIgKyBhICsgXCJcXFwiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbMC05XVwiKTtyZXR1cm4gRi5jYWxsKHRoaXMsIGEsIGMpO1xuICB9O2UuaG9zdG5hbWUgPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwICE9PSBhKSB7XG4gICAgICB2YXIgZCA9IHt9O2IucGFyc2VIb3N0KGEsIGQpO2EgPSBkLmhvc3RuYW1lO1xuICAgIH1yZXR1cm4gRy5jYWxsKHRoaXMsIGEsIGMpO1xuICB9O2UuaG9zdCA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO2lmICh2b2lkIDAgPT09IGEpIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/IGIuYnVpbGRIb3N0KHRoaXMuX3BhcnRzKSA6IFwiXCI7Yi5wYXJzZUhvc3QoYSwgdGhpcy5fcGFydHMpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2UuYXV0aG9yaXR5ID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSByZXR1cm4gdm9pZCAwID09PSBhID8gXCJcIiA6IHRoaXM7aWYgKHZvaWQgMCA9PT0gYSkgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gYi5idWlsZEF1dGhvcml0eSh0aGlzLl9wYXJ0cykgOiBcIlwiO2IucGFyc2VBdXRob3JpdHkoYSwgdGhpcy5fcGFydHMpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2UudXNlcmluZm8gPSBmdW5jdGlvbiAoYSwgYykge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiB2b2lkIDAgPT09IGEgPyBcIlwiIDogdGhpcztpZiAodm9pZCAwID09PSBhKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnVzZXJuYW1lKSByZXR1cm4gXCJcIjt2YXIgZCA9IGIuYnVpbGRVc2VyaW5mbyh0aGlzLl9wYXJ0cyk7cmV0dXJuIGQuc3Vic3RyaW5nKDAsIGQubGVuZ3RoIC0gMSk7XG4gICAgfVwiQFwiICE9PSBhW2EubGVuZ3RoIC0gMV0gJiYgKGEgKz0gXCJAXCIpO2IucGFyc2VVc2VyaW5mbyhhLCB0aGlzLl9wYXJ0cyk7dGhpcy5idWlsZCghYyk7cmV0dXJuIHRoaXM7XG4gIH07ZS5yZXNvdXJjZSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgdmFyIGQ7aWYgKHZvaWQgMCA9PT0gYSkgcmV0dXJuIHRoaXMucGF0aCgpICsgdGhpcy5zZWFyY2goKSArIHRoaXMuaGFzaCgpO2QgPSBiLnBhcnNlKGEpO3RoaXMuX3BhcnRzLnBhdGggPSBkLnBhdGg7dGhpcy5fcGFydHMucXVlcnkgPSBkLnF1ZXJ5O3RoaXMuX3BhcnRzLmZyYWdtZW50ID0gZC5mcmFnbWVudDt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtlLnN1YmRvbWFpbiA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO2lmICh2b2lkIDAgPT09IGEpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcyhcIklQXCIpKSByZXR1cm4gXCJcIjt2YXIgZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMuZG9tYWluKCkubGVuZ3RoIC0gMTtyZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKDAsIGQpIHx8IFwiXCI7XG4gICAgfWQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sZW5ndGggLSB0aGlzLmRvbWFpbigpLmxlbmd0aDtkID0gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKDAsIGQpO2QgPSBuZXcgUmVnRXhwKFwiXlwiICsgayhkKSk7YSAmJiBcIi5cIiAhPT0gYS5jaGFyQXQoYS5sZW5ndGggLSAxKSAmJiAoYSArPSBcIi5cIik7YSAmJiBiLmVuc3VyZVZhbGlkSG9zdG5hbWUoYSk7dGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKGQsIGEpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2UuZG9tYWluID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSByZXR1cm4gdm9pZCAwID09PSBhID8gXCJcIiA6IHRoaXM7XCJib29sZWFuXCIgPT09IHR5cGVvZiBhICYmIChjID0gYSwgYSA9IHZvaWQgMCk7aWYgKHZvaWQgMCA9PT0gYSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKFwiSVBcIikpIHJldHVybiBcIlwiO3ZhciBkID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubWF0Y2goL1xcLi9nKTtpZiAoZCAmJiAyID4gZC5sZW5ndGgpIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZTtkID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy50bGQoYykubGVuZ3RoIC0gMTtkID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGFzdEluZGV4T2YoXCIuXCIsIGQgLSAxKSArIDE7cmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZyhkKSB8fCBcIlwiO1xuICAgIH1pZiAoIWEpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYW5ub3Qgc2V0IGRvbWFpbiBlbXB0eVwiKTtcbiAgICBiLmVuc3VyZVZhbGlkSG9zdG5hbWUoYSk7IXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoXCJJUFwiKSA/IHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gYSA6IChkID0gbmV3IFJlZ0V4cChrKHRoaXMuZG9tYWluKCkpICsgXCIkXCIpLCB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UoZCwgYSkpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2UudGxkID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSByZXR1cm4gdm9pZCAwID09PSBhID8gXCJcIiA6IHRoaXM7XCJib29sZWFuXCIgPT09IHR5cGVvZiBhICYmIChjID0gYSwgYSA9IHZvaWQgMCk7aWYgKHZvaWQgMCA9PT0gYSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKFwiSVBcIikpIHJldHVybiBcIlwiO3ZhciBiID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGFzdEluZGV4T2YoXCIuXCIpLFxuICAgICAgICAgIGIgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcoYiArIDEpO3JldHVybiAhMCAhPT0gYyAmJiBnICYmIGcubGlzdFtiLnRvTG93ZXJDYXNlKCldID8gZy5nZXQodGhpcy5fcGFydHMuaG9zdG5hbWUpIHx8IGIgOiBiO1xuICAgIH1pZiAoYSkgaWYgKGEubWF0Y2goL1teYS16QS1aMC05LV0vKSkgaWYgKGcgJiYgZy5pcyhhKSkgYiA9IG5ldyBSZWdFeHAoayh0aGlzLnRsZCgpKSArIFwiJFwiKSwgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKGIsIGEpO2Vsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRMRCBcXFwiXCIgKyBhICsgXCJcXFwiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05XVwiKTtlbHNlIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcyhcIklQXCIpKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJjYW5ub3Qgc2V0IFRMRCBvbiBub24tZG9tYWluIGhvc3RcIik7YiA9IG5ldyBSZWdFeHAoayh0aGlzLnRsZCgpKSArIFwiJFwiKTt0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UoYiwgYSk7XG4gICAgfSBlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjYW5ub3Qgc2V0IFRMRCBlbXB0eVwiKTt0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtlLmRpcmVjdG9yeSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO2lmICh2b2lkIDAgPT09IGEgfHwgITAgPT09IGEpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCAmJiAhdGhpcy5fcGFydHMuaG9zdG5hbWUpIHJldHVybiBcIlwiO2lmIChcIi9cIiA9PT0gdGhpcy5fcGFydHMucGF0aCkgcmV0dXJuIFwiL1wiO3ZhciBkID0gdGhpcy5fcGFydHMucGF0aC5sZW5ndGggLSB0aGlzLmZpbGVuYW1lKCkubGVuZ3RoIC0gMSxcbiAgICAgICAgICBkID0gdGhpcy5fcGFydHMucGF0aC5zdWJzdHJpbmcoMCwgZCkgfHwgKHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gXCIvXCIgOiBcIlwiKTtyZXR1cm4gYSA/IGIuZGVjb2RlUGF0aChkKSA6IGQ7XG4gICAgfWQgPSB0aGlzLl9wYXJ0cy5wYXRoLmxlbmd0aCAtIHRoaXMuZmlsZW5hbWUoKS5sZW5ndGg7ZCA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKDAsIGQpO2QgPSBuZXcgUmVnRXhwKFwiXlwiICsgayhkKSk7dGhpcy5pcyhcInJlbGF0aXZlXCIpIHx8IChhIHx8IChhID0gXCIvXCIpLCBcIi9cIiAhPT0gYS5jaGFyQXQoMCkgJiYgKGEgPSBcIi9cIiArIGEpKTthICYmIFwiL1wiICE9PSBhLmNoYXJBdChhLmxlbmd0aCAtIDEpICYmIChhICs9IFwiL1wiKTthID0gYi5yZWNvZGVQYXRoKGEpO3RoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UoZCwgYSk7dGhpcy5idWlsZCghYyk7cmV0dXJuIHRoaXM7XG4gIH07ZS5maWxlbmFtZSA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO2lmICh2b2lkIDAgPT09IGEgfHwgITAgPT09IGEpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCBcIi9cIiA9PT0gdGhpcy5fcGFydHMucGF0aCkgcmV0dXJuIFwiXCI7dmFyIGQgPSB0aGlzLl9wYXJ0cy5wYXRoLmxhc3RJbmRleE9mKFwiL1wiKSxcbiAgICAgICAgICBkID0gdGhpcy5fcGFydHMucGF0aC5zdWJzdHJpbmcoZCArIDEpO3JldHVybiBhID8gYi5kZWNvZGVQYXRoU2VnbWVudChkKSA6IGQ7XG4gICAgfWQgPSAhMTtcIi9cIiA9PT0gYS5jaGFyQXQoMCkgJiYgKGEgPSBhLnN1YnN0cmluZygxKSk7YS5tYXRjaCgvXFwuP1xcLy8pICYmIChkID0gITApO3ZhciBlID0gbmV3IFJlZ0V4cChrKHRoaXMuZmlsZW5hbWUoKSkgKyBcIiRcIik7YSA9IGIucmVjb2RlUGF0aChhKTt0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKGUsIGEpO2QgPyB0aGlzLm5vcm1hbGl6ZVBhdGgoYykgOiB0aGlzLmJ1aWxkKCFjKTtyZXR1cm4gdGhpcztcbiAgfTtlLnN1ZmZpeCA9IGZ1bmN0aW9uIChhLCBjKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IFwiXCIgOiB0aGlzO2lmICh2b2lkIDAgPT09IGEgfHwgITAgPT09IGEpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCBcIi9cIiA9PT0gdGhpcy5fcGFydHMucGF0aCkgcmV0dXJuIFwiXCI7dmFyIGQgPSB0aGlzLmZpbGVuYW1lKCksXG4gICAgICAgICAgZSA9IGQubGFzdEluZGV4T2YoXCIuXCIpO2lmICgtMSA9PT0gZSkgcmV0dXJuIFwiXCI7ZCA9IGQuc3Vic3RyaW5nKGUgKyAxKTtkID0gL15bYS16MC05JV0rJC9pLnRlc3QoZCkgPyBkIDogXCJcIjtyZXR1cm4gYSA/IGIuZGVjb2RlUGF0aFNlZ21lbnQoZCkgOiBkO1xuICAgIH1cIi5cIiA9PT0gYS5jaGFyQXQoMCkgJiYgKGEgPSBhLnN1YnN0cmluZygxKSk7aWYgKGQgPSB0aGlzLnN1ZmZpeCgpKSBlID0gYSA/IG5ldyBSZWdFeHAoayhkKSArIFwiJFwiKSA6IG5ldyBSZWdFeHAoayhcIi5cIiArIGQpICsgXCIkXCIpO2Vsc2Uge1xuICAgICAgaWYgKCFhKSByZXR1cm4gdGhpcztcbiAgICAgIHRoaXMuX3BhcnRzLnBhdGggKz0gXCIuXCIgKyBiLnJlY29kZVBhdGgoYSk7XG4gICAgfWUgJiYgKGEgPSBiLnJlY29kZVBhdGgoYSksIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UoZSwgYSkpO3RoaXMuYnVpbGQoIWMpO3JldHVybiB0aGlzO1xuICB9O2Uuc2VnbWVudCA9IGZ1bmN0aW9uIChhLCBjLCBiKSB7XG4gICAgdmFyIGUgPSB0aGlzLl9wYXJ0cy51cm4gPyBcIjpcIiA6IFwiL1wiLFxuICAgICAgICBmID0gdGhpcy5wYXRoKCksXG4gICAgICAgIGggPSBcIi9cIiA9PT0gZi5zdWJzdHJpbmcoMCwgMSksXG4gICAgICAgIGYgPSBmLnNwbGl0KGUpO3ZvaWQgMCAhPT0gYSAmJiBcIm51bWJlclwiICE9PSB0eXBlb2YgYSAmJiAoYiA9IGMsIGMgPSBhLCBhID0gdm9pZCAwKTtpZiAodm9pZCAwICE9PSBhICYmIFwibnVtYmVyXCIgIT09IHR5cGVvZiBhKSB0aHJvdyBFcnJvcihcIkJhZCBzZWdtZW50IFxcXCJcIiArIGEgKyBcIlxcXCIsIG11c3QgYmUgMC1iYXNlZCBpbnRlZ2VyXCIpO2ggJiYgZi5zaGlmdCgpOzAgPiBhICYmIChhID0gTWF0aC5tYXgoZi5sZW5ndGggKyBhLCAwKSk7aWYgKHZvaWQgMCA9PT0gYykgcmV0dXJuIHZvaWQgMCA9PT0gYSA/IGYgOiBmW2FdO2lmIChudWxsID09PSBhIHx8IHZvaWQgMCA9PT0gZlthXSkgaWYgKHcoYykpIHtcbiAgICAgIGYgPSBbXTthID0gMDtmb3IgKHZhciBnID0gYy5sZW5ndGg7IGEgPCBnOyBhKyspIGlmIChjW2FdLmxlbmd0aCB8fCBmLmxlbmd0aCAmJiBmW2YubGVuZ3RoIC0gMV0ubGVuZ3RoKSBmLmxlbmd0aCAmJiAhZltmLmxlbmd0aCAtIDFdLmxlbmd0aCAmJiBmLnBvcCgpLCBmLnB1c2goY1thXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjIHx8IFwic3RyaW5nXCIgPT09IHR5cGVvZiBjKSBcIlwiID09PSBmW2YubGVuZ3RoIC0gMV0gPyBmW2YubGVuZ3RoIC0gMV0gPSBjIDogZi5wdXNoKGMpO1xuICAgIH0gZWxzZSBjID8gZlthXSA9IGMgOiBmLnNwbGljZShhLCAxKTtoICYmIGYudW5zaGlmdChcIlwiKTtyZXR1cm4gdGhpcy5wYXRoKGYuam9pbihlKSwgYik7XG4gIH07ZS5zZWdtZW50Q29kZWQgPSBmdW5jdGlvbiAoYSwgYywgZCkge1xuICAgIHZhciBlLCBmO1wibnVtYmVyXCIgIT09IHR5cGVvZiBhICYmIChkID0gYywgYyA9IGEsIGEgPSB2b2lkIDApO2lmICh2b2lkIDAgPT09IGMpIHtcbiAgICAgIGEgPSB0aGlzLnNlZ21lbnQoYSwgYywgZCk7aWYgKHcoYSkpIGZvciAoZSA9IDAsIGYgPSBhLmxlbmd0aDsgZSA8IGY7IGUrKykgYVtlXSA9IGIuZGVjb2RlKGFbZV0pO2Vsc2UgYSA9IHZvaWQgMCAhPT0gYSA/IGIuZGVjb2RlKGEpIDogdm9pZCAwO3JldHVybiBhO1xuICAgIH1pZiAodyhjKSkgZm9yIChlID0gMCwgZiA9IGMubGVuZ3RoOyBlIDwgZjsgZSsrKSBjW2VdID0gYi5kZWNvZGUoY1tlXSk7ZWxzZSBjID0gXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGMgfHwgYyBpbnN0YW5jZW9mIFN0cmluZyA/IGIuZW5jb2RlKGMpIDogYztyZXR1cm4gdGhpcy5zZWdtZW50KGEsIGMsIGQpO1xuICB9O3ZhciBIID0gZS5xdWVyeTtlLnF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMpIHtcbiAgICBpZiAoITAgPT09IGEpIHJldHVybiBiLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO2lmIChcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiBhKSB7XG4gICAgICB2YXIgZCA9IGIucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSksXG4gICAgICAgICAgZSA9IGEuY2FsbCh0aGlzLCBkKTt0aGlzLl9wYXJ0cy5xdWVyeSA9IGIuYnVpbGRRdWVyeShlIHx8IGQsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7dGhpcy5idWlsZCghYyk7cmV0dXJuIHRoaXM7XG4gICAgfXJldHVybiB2b2lkIDAgIT09IGEgJiYgXCJzdHJpbmdcIiAhPT0gdHlwZW9mIGEgPyAodGhpcy5fcGFydHMucXVlcnkgPSBiLmJ1aWxkUXVlcnkoYSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKSwgdGhpcy5idWlsZCghYyksIHRoaXMpIDogSC5jYWxsKHRoaXMsIGEsIGMpO1xuICB9O2Uuc2V0UXVlcnkgPSBmdW5jdGlvbiAoYSwgYywgZCkge1xuICAgIHZhciBlID0gYi5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGEgfHwgYSBpbnN0YW5jZW9mIFN0cmluZykgZVthXSA9IHZvaWQgMCAhPT0gYyA/IGMgOiBudWxsO2Vsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiBhKSBmb3IgKHZhciBmIGluIGEpIHYuY2FsbChhLCBmKSAmJiAoZVtmXSA9IGFbZl0pO2Vsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVSSS5hZGRRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyXCIpO3RoaXMuX3BhcnRzLnF1ZXJ5ID0gYi5idWlsZFF1ZXJ5KGUsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XCJzdHJpbmdcIiAhPT0gdHlwZW9mIGEgJiYgKGQgPSBjKTt0aGlzLmJ1aWxkKCFkKTtyZXR1cm4gdGhpcztcbiAgfTtlLmFkZFF1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICB2YXIgZSA9IGIucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7Yi5hZGRRdWVyeShlLCBhLCB2b2lkIDAgPT09IGMgPyBudWxsIDogYyk7dGhpcy5fcGFydHMucXVlcnkgPSBiLmJ1aWxkUXVlcnkoZSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcInN0cmluZ1wiICE9PSB0eXBlb2YgYSAmJiAoZCA9IGMpO3RoaXMuYnVpbGQoIWQpO3JldHVybiB0aGlzO1xuICB9O2UucmVtb3ZlUXVlcnkgPSBmdW5jdGlvbiAoYSwgYywgZCkge1xuICAgIHZhciBlID0gYi5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBiLnJlbW92ZVF1ZXJ5KGUsIGEsIGMpO3RoaXMuX3BhcnRzLnF1ZXJ5ID0gYi5idWlsZFF1ZXJ5KGUsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XCJzdHJpbmdcIiAhPT0gdHlwZW9mIGEgJiYgKGQgPSBjKTt0aGlzLmJ1aWxkKCFkKTtyZXR1cm4gdGhpcztcbiAgfTtlLmhhc1F1ZXJ5ID0gZnVuY3Rpb24gKGEsIGMsIGQpIHtcbiAgICB2YXIgZSA9IGIucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7cmV0dXJuIGIuaGFzUXVlcnkoZSwgYSwgYywgZCk7XG4gIH07ZS5zZXRTZWFyY2ggPSBlLnNldFF1ZXJ5O2UuYWRkU2VhcmNoID0gZS5hZGRRdWVyeTtlLnJlbW92ZVNlYXJjaCA9IGUucmVtb3ZlUXVlcnk7ZS5oYXNTZWFyY2ggPSBlLmhhc1F1ZXJ5O2Uubm9ybWFsaXplID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9wYXJ0cy51cm4gPyB0aGlzLm5vcm1hbGl6ZVByb3RvY29sKCExKS5ub3JtYWxpemVQYXRoKCExKS5ub3JtYWxpemVRdWVyeSghMSkubm9ybWFsaXplRnJhZ21lbnQoITEpLmJ1aWxkKCkgOiB0aGlzLm5vcm1hbGl6ZVByb3RvY29sKCExKS5ub3JtYWxpemVIb3N0bmFtZSghMSkubm9ybWFsaXplUG9ydCghMSkubm9ybWFsaXplUGF0aCghMSkubm9ybWFsaXplUXVlcnkoITEpLm5vcm1hbGl6ZUZyYWdtZW50KCExKS5idWlsZCgpO1xuICB9O2Uubm9ybWFsaXplUHJvdG9jb2wgPSBmdW5jdGlvbiAoYSkge1xuICAgIFwic3RyaW5nXCIgPT09IHR5cGVvZiB0aGlzLl9wYXJ0cy5wcm90b2NvbCAmJiAodGhpcy5fcGFydHMucHJvdG9jb2wgPSB0aGlzLl9wYXJ0cy5wcm90b2NvbC50b0xvd2VyQ2FzZSgpLCB0aGlzLmJ1aWxkKCFhKSk7cmV0dXJuIHRoaXM7XG4gIH07ZS5ub3JtYWxpemVIb3N0bmFtZSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgJiYgKHRoaXMuaXMoXCJJRE5cIikgJiYgZiA/IHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gZi50b0FTQ0lJKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSA6IHRoaXMuaXMoXCJJUHY2XCIpICYmIGwgJiYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gbC5iZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSksIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUudG9Mb3dlckNhc2UoKSwgdGhpcy5idWlsZCghYSkpO3JldHVybiB0aGlzO1xuICB9O2Uubm9ybWFsaXplUG9ydCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgXCJzdHJpbmdcIiA9PT0gdHlwZW9mIHRoaXMuX3BhcnRzLnByb3RvY29sICYmIHRoaXMuX3BhcnRzLnBvcnQgPT09IGIuZGVmYXVsdFBvcnRzW3RoaXMuX3BhcnRzLnByb3RvY29sXSAmJiAodGhpcy5fcGFydHMucG9ydCA9IG51bGwsIHRoaXMuYnVpbGQoIWEpKTtyZXR1cm4gdGhpcztcbiAgfTtlLm5vcm1hbGl6ZVBhdGggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBjID0gdGhpcy5fcGFydHMucGF0aDtpZiAoIWMpIHJldHVybiB0aGlzO2lmICh0aGlzLl9wYXJ0cy51cm4pIHJldHVybiAodGhpcy5fcGFydHMucGF0aCA9IGIucmVjb2RlVXJuUGF0aCh0aGlzLl9wYXJ0cy5wYXRoKSwgdGhpcy5idWlsZCghYSksIHRoaXMpO2lmIChcIi9cIiA9PT0gdGhpcy5fcGFydHMucGF0aCkgcmV0dXJuIHRoaXM7dmFyIGQsXG4gICAgICAgIGUgPSBcIlwiLFxuICAgICAgICBmLFxuICAgICAgICBoO1wiL1wiICE9PSBjLmNoYXJBdCgwKSAmJiAoZCA9ICEwLCBjID0gXCIvXCIgKyBjKTtjID0gYy5yZXBsYWNlKC8oXFwvKFxcLlxcLykrKXwoXFwvXFwuJCkvZywgXCIvXCIpLnJlcGxhY2UoL1xcL3syLH0vZywgXCIvXCIpO2QgJiYgKGUgPSBjLnN1YnN0cmluZygxKS5tYXRjaCgvXihcXC5cXC5cXC8pKy8pIHx8IFwiXCIpICYmIChlID0gZVswXSk7Zm9yICg7Oykge1xuICAgICAgZiA9IGMuaW5kZXhPZihcIi8uLlwiKTtpZiAoLTEgPT09IGYpIGJyZWFrO2Vsc2UgaWYgKDAgPT09IGYpIHtcbiAgICAgICAgYyA9IGMuc3Vic3RyaW5nKDMpO2NvbnRpbnVlO1xuICAgICAgfWggPSBjLnN1YnN0cmluZygwLCBmKS5sYXN0SW5kZXhPZihcIi9cIik7LTEgPT09IGggJiYgKGggPSBmKTtjID0gYy5zdWJzdHJpbmcoMCwgaCkgKyBjLnN1YnN0cmluZyhmICsgMyk7XG4gICAgfWQgJiYgdGhpcy5pcyhcInJlbGF0aXZlXCIpICYmIChjID0gZSArIGMuc3Vic3RyaW5nKDEpKTtjID0gYi5yZWNvZGVQYXRoKGMpO3RoaXMuX3BhcnRzLnBhdGggPSBjO3RoaXMuYnVpbGQoIWEpO3JldHVybiB0aGlzO1xuICB9O2Uubm9ybWFsaXplUGF0aG5hbWUgPSBlLm5vcm1hbGl6ZVBhdGg7ZS5ub3JtYWxpemVRdWVyeSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgXCJzdHJpbmdcIiA9PT0gdHlwZW9mIHRoaXMuX3BhcnRzLnF1ZXJ5ICYmICh0aGlzLl9wYXJ0cy5xdWVyeS5sZW5ndGggPyB0aGlzLnF1ZXJ5KGIucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSkpIDogdGhpcy5fcGFydHMucXVlcnkgPSBudWxsLCB0aGlzLmJ1aWxkKCFhKSk7cmV0dXJuIHRoaXM7XG4gIH07ZS5ub3JtYWxpemVGcmFnbWVudCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdGhpcy5fcGFydHMuZnJhZ21lbnQgfHwgKHRoaXMuX3BhcnRzLmZyYWdtZW50ID0gbnVsbCwgdGhpcy5idWlsZCghYSkpO3JldHVybiB0aGlzO1xuICB9O2Uubm9ybWFsaXplU2VhcmNoID0gZS5ub3JtYWxpemVRdWVyeTtlLm5vcm1hbGl6ZUhhc2ggPSBlLm5vcm1hbGl6ZUZyYWdtZW50O2UuaXNvODg1OSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYSA9IGIuZW5jb2RlLFxuICAgICAgICBjID0gYi5kZWNvZGU7Yi5lbmNvZGUgPSBlc2NhcGU7Yi5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7dHJ5IHtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGIuZW5jb2RlID0gYSwgYi5kZWNvZGUgPSBjO1xuICAgIH1yZXR1cm4gdGhpcztcbiAgfTtlLnVuaWNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGEgPSBiLmVuY29kZSxcbiAgICAgICAgYyA9IGIuZGVjb2RlO2IuZW5jb2RlID0gRDtiLmRlY29kZSA9IHVuZXNjYXBlO3RyeSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBiLmVuY29kZSA9IGEsIGIuZGVjb2RlID0gYztcbiAgICB9cmV0dXJuIHRoaXM7XG4gIH07ZS5yZWFkYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYSA9IHRoaXMuY2xvbmUoKTthLnVzZXJuYW1lKFwiXCIpLnBhc3N3b3JkKFwiXCIpLm5vcm1hbGl6ZSgpO3ZhciBjID0gXCJcIjthLl9wYXJ0cy5wcm90b2NvbCAmJiAoYyArPSBhLl9wYXJ0cy5wcm90b2NvbCArIFwiOi8vXCIpO2EuX3BhcnRzLmhvc3RuYW1lICYmIChhLmlzKFwicHVueWNvZGVcIikgJiYgZiA/IChjICs9IGYudG9Vbmljb2RlKGEuX3BhcnRzLmhvc3RuYW1lKSwgYS5fcGFydHMucG9ydCAmJiAoYyArPSBcIjpcIiArIGEuX3BhcnRzLnBvcnQpKSA6IGMgKz0gYS5ob3N0KCkpO2EuX3BhcnRzLmhvc3RuYW1lICYmIGEuX3BhcnRzLnBhdGggJiYgXCIvXCIgIT09IGEuX3BhcnRzLnBhdGguY2hhckF0KDApICYmIChjICs9IFwiL1wiKTtjICs9IGEucGF0aCghMCk7aWYgKGEuX3BhcnRzLnF1ZXJ5KSB7XG4gICAgICBmb3IgKHZhciBkID0gXCJcIiwgZSA9IDAsIGggPSBhLl9wYXJ0cy5xdWVyeS5zcGxpdChcIiZcIiksIGcgPSBoLmxlbmd0aDsgZSA8IGc7IGUrKykge1xuICAgICAgICB2YXIgciA9IChoW2VdIHx8IFwiXCIpLnNwbGl0KFwiPVwiKSxcbiAgICAgICAgICAgIGQgPSBkICsgKFwiJlwiICsgYi5kZWNvZGVRdWVyeShyWzBdLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKS5yZXBsYWNlKC8mL2csIFwiJTI2XCIpKTt2b2lkIDAgIT09IHJbMV0gJiYgKGQgKz0gXCI9XCIgKyBiLmRlY29kZVF1ZXJ5KHJbMV0sIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpLnJlcGxhY2UoLyYvZywgXCIlMjZcIikpO1xuICAgICAgfWMgKz0gXCI/XCIgKyBkLnN1YnN0cmluZygxKTtcbiAgICB9cmV0dXJuIGMgKz0gYi5kZWNvZGVRdWVyeShhLmhhc2goKSwgITApO1xuICB9O2UuYWJzb2x1dGVUbyA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGMgPSB0aGlzLmNsb25lKCksXG4gICAgICAgIGQgPSBbXCJwcm90b2NvbFwiLCBcInVzZXJuYW1lXCIsIFwicGFzc3dvcmRcIiwgXCJob3N0bmFtZVwiLCBcInBvcnRcIl0sXG4gICAgICAgIGUsXG4gICAgICAgIGY7aWYgKHRoaXMuX3BhcnRzLnVybikgdGhyb3cgRXJyb3IoXCJVUk5zIGRvIG5vdCBoYXZlIGFueSBnZW5lcmFsbHkgZGVmaW5lZCBoaWVyYXJjaGljYWwgY29tcG9uZW50c1wiKTthIGluc3RhbmNlb2YgYiB8fCAoYSA9IG5ldyBiKGEpKTtjLl9wYXJ0cy5wcm90b2NvbCB8fCAoYy5fcGFydHMucHJvdG9jb2wgPSBhLl9wYXJ0cy5wcm90b2NvbCk7aWYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSByZXR1cm4gYztcbiAgICBmb3IgKGUgPSAwOyBmID0gZFtlXTsgZSsrKSBjLl9wYXJ0c1tmXSA9IGEuX3BhcnRzW2ZdO2MuX3BhcnRzLnBhdGggPyBcIi4uXCIgPT09IGMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKC0yKSAmJiAoYy5fcGFydHMucGF0aCArPSBcIi9cIikgOiAoYy5fcGFydHMucGF0aCA9IGEuX3BhcnRzLnBhdGgsIGMuX3BhcnRzLnF1ZXJ5IHx8IChjLl9wYXJ0cy5xdWVyeSA9IGEuX3BhcnRzLnF1ZXJ5KSk7XCIvXCIgIT09IGMucGF0aCgpLmNoYXJBdCgwKSAmJiAoZCA9IChkID0gYS5kaXJlY3RvcnkoKSkgPyBkIDogMCA9PT0gYS5wYXRoKCkuaW5kZXhPZihcIi9cIikgPyBcIi9cIiA6IFwiXCIsIGMuX3BhcnRzLnBhdGggPSAoZCA/IGQgKyBcIi9cIiA6IFwiXCIpICsgYy5fcGFydHMucGF0aCwgYy5ub3JtYWxpemVQYXRoKCkpO2MuYnVpbGQoKTtyZXR1cm4gYztcbiAgfTtlLnJlbGF0aXZlVG8gPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBjID0gdGhpcy5jbG9uZSgpLm5vcm1hbGl6ZSgpLFxuICAgICAgICBkLFxuICAgICAgICBlLFxuICAgICAgICBmLFxuICAgICAgICBoO2lmIChjLl9wYXJ0cy51cm4pIHRocm93IEVycm9yKFwiVVJOcyBkbyBub3QgaGF2ZSBhbnkgZ2VuZXJhbGx5IGRlZmluZWQgaGllcmFyY2hpY2FsIGNvbXBvbmVudHNcIik7XG4gICAgYSA9IG5ldyBiKGEpLm5vcm1hbGl6ZSgpO2QgPSBjLl9wYXJ0cztlID0gYS5fcGFydHM7ZiA9IGMucGF0aCgpO2ggPSBhLnBhdGgoKTtpZiAoXCIvXCIgIT09IGYuY2hhckF0KDApKSB0aHJvdyBFcnJvcihcIlVSSSBpcyBhbHJlYWR5IHJlbGF0aXZlXCIpO2lmIChcIi9cIiAhPT0gaC5jaGFyQXQoMCkpIHRocm93IEVycm9yKFwiQ2Fubm90IGNhbGN1bGF0ZSBhIFVSSSByZWxhdGl2ZSB0byBhbm90aGVyIHJlbGF0aXZlIFVSSVwiKTtkLnByb3RvY29sID09PSBlLnByb3RvY29sICYmIChkLnByb3RvY29sID0gbnVsbCk7aWYgKGQudXNlcm5hbWUgPT09IGUudXNlcm5hbWUgJiYgZC5wYXNzd29yZCA9PT0gZS5wYXNzd29yZCAmJiBudWxsID09PSBkLnByb3RvY29sICYmIG51bGwgPT09IGQudXNlcm5hbWUgJiYgbnVsbCA9PT0gZC5wYXNzd29yZCAmJiBkLmhvc3RuYW1lID09PSBlLmhvc3RuYW1lICYmIGQucG9ydCA9PT0gZS5wb3J0KSBkLmhvc3RuYW1lID0gbnVsbCwgZC5wb3J0ID0gbnVsbDtlbHNlIHJldHVybiBjLmJ1aWxkKCk7aWYgKGYgPT09IGgpIHJldHVybiAoZC5wYXRoID0gXCJcIiwgYy5idWlsZCgpKTtcbiAgICBhID0gYi5jb21tb25QYXRoKGMucGF0aCgpLCBhLnBhdGgoKSk7aWYgKCFhKSByZXR1cm4gYy5idWlsZCgpO2UgPSBlLnBhdGguc3Vic3RyaW5nKGEubGVuZ3RoKS5yZXBsYWNlKC9bXlxcL10qJC8sIFwiXCIpLnJlcGxhY2UoLy4qP1xcLy9nLCBcIi4uL1wiKTtkLnBhdGggPSBlICsgZC5wYXRoLnN1YnN0cmluZyhhLmxlbmd0aCk7cmV0dXJuIGMuYnVpbGQoKTtcbiAgfTtlLmVxdWFscyA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIGMgPSB0aGlzLmNsb25lKCk7YSA9IG5ldyBiKGEpO3ZhciBkID0ge30sXG4gICAgICAgIGUgPSB7fSxcbiAgICAgICAgZiA9IHt9LFxuICAgICAgICBoO2Mubm9ybWFsaXplKCk7YS5ub3JtYWxpemUoKTtpZiAoYy50b1N0cmluZygpID09PSBhLnRvU3RyaW5nKCkpIHJldHVybiAhMDtkID0gYy5xdWVyeSgpO2UgPSBhLnF1ZXJ5KCk7Yy5xdWVyeShcIlwiKTthLnF1ZXJ5KFwiXCIpO2lmIChjLnRvU3RyaW5nKCkgIT09IGEudG9TdHJpbmcoKSB8fCBkLmxlbmd0aCAhPT0gZS5sZW5ndGgpIHJldHVybiAhMTtkID0gYi5wYXJzZVF1ZXJ5KGQsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO2UgPSBiLnBhcnNlUXVlcnkoZSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgZm9yIChoIGluIGQpIGlmICh2LmNhbGwoZCwgaCkpIHtcbiAgICAgIGlmICghdyhkW2hdKSkge1xuICAgICAgICBpZiAoZFtoXSAhPT0gZVtoXSkgcmV0dXJuICExO1xuICAgICAgfSBlbHNlIGlmICghcihkW2hdLCBlW2hdKSkgcmV0dXJuICExO2ZbaF0gPSAhMDtcbiAgICB9Zm9yIChoIGluIGUpIGlmICh2LmNhbGwoZSwgaCkgJiYgIWZbaF0pIHJldHVybiAhMTtyZXR1cm4gITA7XG4gIH07ZS5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoYSkge1xuICAgIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyA9ICEhYTtyZXR1cm4gdGhpcztcbiAgfTtlLmVzY2FwZVF1ZXJ5U3BhY2UgPSBmdW5jdGlvbiAoYSkge1xuICAgIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UgPSAhIWE7cmV0dXJuIHRoaXM7XG4gIH07cmV0dXJuIGI7XG59KTtcbihmdW5jdGlvbiAoZiwgbCkge1xuICBcIm9iamVjdFwiID09PSB0eXBlb2YgZXhwb3J0cyA/IG1vZHVsZS5leHBvcnRzID0gbChyZXF1aXJlKFwiLi9VUklcIikpIDogXCJmdW5jdGlvblwiID09PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoW1wiLi9VUklcIl0sIGwpIDogZi5VUklUZW1wbGF0ZSA9IGwoZi5VUkksIGYpO1xufSkodW5kZWZpbmVkLCBmdW5jdGlvbiAoZiwgbCkge1xuICBmdW5jdGlvbiBnKGIpIHtcbiAgICBpZiAoZy5fY2FjaGVbYl0pIHJldHVybiBnLl9jYWNoZVtiXTtpZiAoISh0aGlzIGluc3RhbmNlb2YgZykpIHJldHVybiBuZXcgZyhiKTt0aGlzLmV4cHJlc3Npb24gPSBiO2cuX2NhY2hlW2JdID0gdGhpcztyZXR1cm4gdGhpcztcbiAgfWZ1bmN0aW9uIG0oYikge1xuICAgIHRoaXMuZGF0YSA9IGI7dGhpcy5jYWNoZSA9IHt9O1xuICB9dmFyIGIgPSBsICYmIGwuVVJJVGVtcGxhdGUsXG4gICAgICBrID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgIEIgPSBnLnByb3RvdHlwZSxcbiAgICAgIHcgPSB7IFwiXCI6IHsgcHJlZml4OiBcIlwiLCBzZXBhcmF0b3I6IFwiLFwiLCBuYW1lZDogITEsIGVtcHR5X25hbWVfc2VwYXJhdG9yOiAhMSwgZW5jb2RlOiBcImVuY29kZVwiIH0sXG4gICAgXCIrXCI6IHsgcHJlZml4OiBcIlwiLCBzZXBhcmF0b3I6IFwiLFwiLCBuYW1lZDogITEsIGVtcHR5X25hbWVfc2VwYXJhdG9yOiAhMSwgZW5jb2RlOiBcImVuY29kZVJlc2VydmVkXCIgfSwgXCIjXCI6IHsgcHJlZml4OiBcIiNcIiwgc2VwYXJhdG9yOiBcIixcIiwgbmFtZWQ6ICExLCBlbXB0eV9uYW1lX3NlcGFyYXRvcjogITEsIGVuY29kZTogXCJlbmNvZGVSZXNlcnZlZFwiIH0sIFwiLlwiOiB7IHByZWZpeDogXCIuXCIsIHNlcGFyYXRvcjogXCIuXCIsIG5hbWVkOiAhMSwgZW1wdHlfbmFtZV9zZXBhcmF0b3I6ICExLCBlbmNvZGU6IFwiZW5jb2RlXCIgfSwgXCIvXCI6IHsgcHJlZml4OiBcIi9cIiwgc2VwYXJhdG9yOiBcIi9cIiwgbmFtZWQ6ICExLCBlbXB0eV9uYW1lX3NlcGFyYXRvcjogITEsIGVuY29kZTogXCJlbmNvZGVcIiB9LCBcIjtcIjogeyBwcmVmaXg6IFwiO1wiLCBzZXBhcmF0b3I6IFwiO1wiLCBuYW1lZDogITAsIGVtcHR5X25hbWVfc2VwYXJhdG9yOiAhMSwgZW5jb2RlOiBcImVuY29kZVwiIH0sIFwiP1wiOiB7IHByZWZpeDogXCI/XCIsIHNlcGFyYXRvcjogXCImXCIsIG5hbWVkOiAhMCwgZW1wdHlfbmFtZV9zZXBhcmF0b3I6ICEwLCBlbmNvZGU6IFwiZW5jb2RlXCIgfSwgXCImXCI6IHsgcHJlZml4OiBcIiZcIixcbiAgICAgIHNlcGFyYXRvcjogXCImXCIsIG5hbWVkOiAhMCwgZW1wdHlfbmFtZV9zZXBhcmF0b3I6ICEwLCBlbmNvZGU6IFwiZW5jb2RlXCIgfSB9O2cuX2NhY2hlID0ge307Zy5FWFBSRVNTSU9OX1BBVFRFUk4gPSAvXFx7KFteYS16QS1aMC05JV9dPykoW15cXH1dKykoXFx9fCQpL2c7Zy5WQVJJQUJMRV9QQVRURVJOID0gL14oW14qOl0rKSgoXFwqKXw6KFxcZCspKT8kLztnLlZBUklBQkxFX05BTUVfUEFUVEVSTiA9IC9bXmEtekEtWjAtOSVfXS87Zy5leHBhbmQgPSBmdW5jdGlvbiAoYiwgZikge1xuICAgIHZhciBrID0gd1tiLm9wZXJhdG9yXSxcbiAgICAgICAgbSA9IGsubmFtZWQgPyBcIk5hbWVkXCIgOiBcIlVubmFtZWRcIixcbiAgICAgICAgbCA9IGIudmFyaWFibGVzLFxuICAgICAgICB0ID0gW10sXG4gICAgICAgIG4sXG4gICAgICAgIGUsXG4gICAgICAgIHY7Zm9yICh2ID0gMDsgZSA9IGxbdl07IHYrKykgbiA9IGYuZ2V0KGUubmFtZSksIG4udmFsLmxlbmd0aCA/IHQucHVzaChnW1wiZXhwYW5kXCIgKyBtXShuLCBrLCBlLmV4cGxvZGUsIGUuZXhwbG9kZSAmJiBrLnNlcGFyYXRvciB8fCBcIixcIiwgZS5tYXhsZW5ndGgsIGUubmFtZSkpIDogbi50eXBlICYmIHQucHVzaChcIlwiKTtyZXR1cm4gdC5sZW5ndGggPyBrLnByZWZpeCArIHQuam9pbihrLnNlcGFyYXRvcikgOiBcIlwiO1xuICB9O2cuZXhwYW5kTmFtZWQgPSBmdW5jdGlvbiAoYiwgZywgaywgbSwgbCwgdCkge1xuICAgIHZhciBuID0gXCJcIixcbiAgICAgICAgZSA9IGcuZW5jb2RlO2cgPSBnLmVtcHR5X25hbWVfc2VwYXJhdG9yO3ZhciB2ID0gIWJbZV0ubGVuZ3RoLFxuICAgICAgICB1ID0gMiA9PT0gYi50eXBlID8gXCJcIiA6IGZbZV0odCksXG4gICAgICAgIHEsXG4gICAgICAgIHksXG4gICAgICAgIHc7eSA9IDA7Zm9yICh3ID0gYi52YWwubGVuZ3RoOyB5IDwgdzsgeSsrKSBsID8gKHEgPSBmW2VdKGIudmFsW3ldWzFdLnN1YnN0cmluZygwLCBsKSksIDIgPT09IGIudHlwZSAmJiAodSA9IGZbZV0oYi52YWxbeV1bMF0uc3Vic3RyaW5nKDAsIGwpKSkpIDogdiA/IChxID0gZltlXShiLnZhbFt5XVsxXSksIDIgPT09IGIudHlwZSA/ICh1ID0gZltlXShiLnZhbFt5XVswXSksIGJbZV0ucHVzaChbdSwgcV0pKSA6IGJbZV0ucHVzaChbdm9pZCAwLCBxXSkpIDogKHEgPSBiW2VdW3ldWzFdLCAyID09PSBiLnR5cGUgJiYgKHUgPSBiW2VdW3ldWzBdKSksIG4gJiYgKG4gKz0gbSksIGsgPyBuICs9IHUgKyAoZyB8fCBxID8gXCI9XCIgOiBcIlwiKSArIHEgOiAoeSB8fCAobiArPSBmW2VdKHQpICsgKGcgfHwgcSA/IFwiPVwiIDogXCJcIikpLCAyID09PSBiLnR5cGUgJiYgKG4gKz0gdSArIFwiLFwiKSwgbiArPSBxKTtyZXR1cm4gbjtcbiAgfTtnLmV4cGFuZFVubmFtZWQgPSBmdW5jdGlvbiAoYiwgZywgaywgbSwgbCkge1xuICAgIHZhciB0ID0gXCJcIixcbiAgICAgICAgbiA9IGcuZW5jb2RlO2cgPSBnLmVtcHR5X25hbWVfc2VwYXJhdG9yO3ZhciBlID0gIWJbbl0ubGVuZ3RoLFxuICAgICAgICB2LFxuICAgICAgICB1LFxuICAgICAgICBxLFxuICAgICAgICB3O3EgPSAwO2ZvciAodyA9IGIudmFsLmxlbmd0aDsgcSA8IHc7IHErKykgbCA/IHUgPSBmW25dKGIudmFsW3FdWzFdLnN1YnN0cmluZygwLCBsKSkgOiBlID8gKHUgPSBmW25dKGIudmFsW3FdWzFdKSwgYltuXS5wdXNoKFsyID09PSBiLnR5cGUgPyBmW25dKGIudmFsW3FdWzBdKSA6IHZvaWQgMCwgdV0pKSA6IHUgPSBiW25dW3FdWzFdLCB0ICYmICh0ICs9IG0pLCAyID09PSBiLnR5cGUgJiYgKHYgPSBsID8gZltuXShiLnZhbFtxXVswXS5zdWJzdHJpbmcoMCwgbCkpIDogYltuXVtxXVswXSwgdCArPSB2LCB0ID0gayA/IHQgKyAoZyB8fCB1ID8gXCI9XCIgOiBcIlwiKSA6IHQgKyBcIixcIiksIHQgKz0gdTtyZXR1cm4gdDtcbiAgfTtnLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgbC5VUklUZW1wbGF0ZSA9PT0gZyAmJiAobC5VUklUZW1wbGF0ZSA9IGIpO3JldHVybiBnO1xuICB9O0IuZXhwYW5kID0gZnVuY3Rpb24gKGIpIHtcbiAgICB2YXIgZiA9IFwiXCI7dGhpcy5wYXJ0cyAmJiB0aGlzLnBhcnRzLmxlbmd0aCB8fCB0aGlzLnBhcnNlKCk7XG4gICAgYiBpbnN0YW5jZW9mIG0gfHwgKGIgPSBuZXcgbShiKSk7Zm9yICh2YXIgayA9IDAsIGwgPSB0aGlzLnBhcnRzLmxlbmd0aDsgayA8IGw7IGsrKykgZiArPSBcInN0cmluZ1wiID09PSB0eXBlb2YgdGhpcy5wYXJ0c1trXSA/IHRoaXMucGFydHNba10gOiBnLmV4cGFuZCh0aGlzLnBhcnRzW2tdLCBiKTtyZXR1cm4gZjtcbiAgfTtCLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBiID0gdGhpcy5leHByZXNzaW9uLFxuICAgICAgICBmID0gZy5FWFBSRVNTSU9OX1BBVFRFUk4sXG4gICAgICAgIGsgPSBnLlZBUklBQkxFX1BBVFRFUk4sXG4gICAgICAgIG0gPSBnLlZBUklBQkxFX05BTUVfUEFUVEVSTixcbiAgICAgICAgbCA9IFtdLFxuICAgICAgICB0ID0gMCxcbiAgICAgICAgbixcbiAgICAgICAgZSxcbiAgICAgICAgdjtmb3IgKGYubGFzdEluZGV4ID0gMDs7KSB7XG4gICAgICBlID0gZi5leGVjKGIpO2lmIChudWxsID09PSBlKSB7XG4gICAgICAgIGwucHVzaChiLnN1YnN0cmluZyh0KSk7YnJlYWs7XG4gICAgICB9IGVsc2UgbC5wdXNoKGIuc3Vic3RyaW5nKHQsIGUuaW5kZXgpKSwgdCA9IGUuaW5kZXggKyBlWzBdLmxlbmd0aDtpZiAoIXdbZVsxXV0pIHRocm93IEVycm9yKFwiVW5rbm93biBPcGVyYXRvciBcXFwiXCIgKyBlWzFdICsgXCJcXFwiIGluIFxcXCJcIiArIGVbMF0gKyBcIlxcXCJcIik7aWYgKCFlWzNdKSB0aHJvdyBFcnJvcihcIlVuY2xvc2VkIEV4cHJlc3Npb24gXFxcIlwiICsgZVswXSArIFwiXFxcIlwiKTtuID0gZVsyXS5zcGxpdChcIixcIik7Zm9yICh2YXIgdSA9IDAsIHEgPSBuLmxlbmd0aDsgdSA8IHE7IHUrKykge1xuICAgICAgICB2ID0gblt1XS5tYXRjaChrKTtpZiAobnVsbCA9PT0gdikgdGhyb3cgRXJyb3IoXCJJbnZhbGlkIFZhcmlhYmxlIFxcXCJcIiArIG5bdV0gKyBcIlxcXCIgaW4gXFxcIlwiICsgZVswXSArIFwiXFxcIlwiKTtpZiAodlsxXS5tYXRjaChtKSkgdGhyb3cgRXJyb3IoXCJJbnZhbGlkIFZhcmlhYmxlIE5hbWUgXFxcIlwiICsgdlsxXSArIFwiXFxcIiBpbiBcXFwiXCIgKyBlWzBdICsgXCJcXFwiXCIpO25bdV0gPSB7IG5hbWU6IHZbMV0sIGV4cGxvZGU6ICEhdlszXSwgbWF4bGVuZ3RoOiB2WzRdICYmIHBhcnNlSW50KHZbNF0sIDEwKSB9O1xuICAgICAgfWlmICghbi5sZW5ndGgpIHRocm93IEVycm9yKFwiRXhwcmVzc2lvbiBNaXNzaW5nIFZhcmlhYmxlKHMpIFxcXCJcIiArIGVbMF0gKyBcIlxcXCJcIik7bC5wdXNoKHsgZXhwcmVzc2lvbjogZVswXSwgb3BlcmF0b3I6IGVbMV0sIHZhcmlhYmxlczogbiB9KTtcbiAgICB9bC5sZW5ndGggfHwgbC5wdXNoKGIpO3RoaXMucGFydHMgPSBsO3JldHVybiB0aGlzO1xuICB9O20ucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChiKSB7XG4gICAgdmFyIGYgPSB0aGlzLmRhdGEsXG4gICAgICAgIGcgPSB7IHR5cGU6IDAsIHZhbDogW10sIGVuY29kZTogW10sIGVuY29kZVJlc2VydmVkOiBbXSB9LFxuICAgICAgICBsO2lmICh2b2lkIDAgIT09IHRoaXMuY2FjaGVbYl0pIHJldHVybiB0aGlzLmNhY2hlW2JdO3RoaXMuY2FjaGVbYl0gPSBnO2YgPSBcIltvYmplY3QgRnVuY3Rpb25dXCIgPT09IFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZikpID8gZihiKSA6IFwiW29iamVjdCBGdW5jdGlvbl1cIiA9PT0gU3RyaW5nKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmW2JdKSkgPyBmW2JdKGIpIDogZltiXTtpZiAodm9pZCAwICE9PSBmICYmIG51bGwgIT09IGYpIGlmIChcIltvYmplY3QgQXJyYXldXCIgPT09IFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZikpKSB7XG4gICAgICBsID0gMDtmb3IgKGIgPSBmLmxlbmd0aDsgbCA8IGI7IGwrKykgdm9pZCAwICE9PSBmW2xdICYmIG51bGwgIT09IGZbbF0gJiYgZy52YWwucHVzaChbdm9pZCAwLCBTdHJpbmcoZltsXSldKTtnLnZhbC5sZW5ndGggJiYgKGcudHlwZSA9IDMpO1xuICAgIH0gZWxzZSBpZiAoXCJbb2JqZWN0IE9iamVjdF1cIiA9PT0gU3RyaW5nKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmKSkpIHtcbiAgICAgIGZvciAobCBpbiBmKSBrLmNhbGwoZiwgbCkgJiYgdm9pZCAwICE9PSBmW2xdICYmIG51bGwgIT09IGZbbF0gJiYgZy52YWwucHVzaChbbCwgU3RyaW5nKGZbbF0pXSk7Zy52YWwubGVuZ3RoICYmIChnLnR5cGUgPSAyKTtcbiAgICB9IGVsc2UgZy50eXBlID0gMSwgZy52YWwucHVzaChbdm9pZCAwLCBTdHJpbmcoZildKTtyZXR1cm4gZztcbiAgfTtmLmV4cGFuZCA9IGZ1bmN0aW9uIChiLCBrKSB7XG4gICAgdmFyIGwgPSBuZXcgZyhiKS5leHBhbmQoayk7cmV0dXJuIG5ldyBmKGwpO1xuICB9O3JldHVybiBnO1xufSk7IiwiLyohIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjIuMyBieSBAbWF0aGlhcyAqL1xuJ3VzZSBzdHJpY3QnO1xuXG47KGZ1bmN0aW9uIChyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcbiAgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG4gICogQG5hbWUgcHVueWNvZGVcbiAgKiBAdHlwZSBPYmplY3RcbiAgKi9cblx0dmFyIHB1bnljb2RlLFxuXHQgICBcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsXG5cdCAgICAvLyBha2EuIDB4N0ZGRkZGRkYgb3IgMl4zMS0xXG5cblx0LyoqIEJvb3RzdHJpbmcgcGFyYW1ldGVycyAqL1xuXHRiYXNlID0gMzYsXG5cdCAgICB0TWluID0gMSxcblx0ICAgIHRNYXggPSAyNixcblx0ICAgIHNrZXcgPSAzOCxcblx0ICAgIGRhbXAgPSA3MDAsXG5cdCAgICBpbml0aWFsQmlhcyA9IDcyLFxuXHQgICAgaW5pdGlhbE4gPSAxMjgsXG5cdCAgICAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJyxcblx0ICAgIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0ICAgIHJlZ2V4Tm9uQVNDSUkgPSAvW14gLX5dLyxcblx0ICAgIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9cXHgyRXxcXHUzMDAyfFxcdUZGMEV8XFx1RkY2MS9nLFxuXHQgICAgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cdCAgIFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHQgICAgZmxvb3IgPSBNYXRoLmZsb29yLFxuXHQgICAgc3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblx0ICAgXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG4gICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cbiAgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG4gICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcbiAgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cbiAgKiBAcHJpdmF0ZVxuICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG4gICogaXRlbS5cbiAgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHdoaWxlIChsZW5ndGgtLSkge1xuXHRcdFx0YXJyYXlbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gYXJyYXk7XG5cdH1cblxuXHQvKipcbiAgKiBBIHNpbXBsZSBgQXJyYXkjbWFwYC1saWtlIHdyYXBwZXIgdG8gd29yayB3aXRoIGRvbWFpbiBuYW1lIHN0cmluZ3MuXG4gICogQHByaXZhdGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZS5cbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnlcbiAgKiBjaGFyYWN0ZXIuXG4gICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcbiAgKiBmdW5jdGlvbi5cbiAgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHRyZXR1cm4gbWFwKHN0cmluZy5zcGxpdChyZWdleFNlcGFyYXRvcnMpLCBmbikuam9pbignLicpO1xuXHR9XG5cblx0LyoqXG4gICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuICAqIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLiBXaGlsZSBKYXZhU2NyaXB0IHVzZXMgVUNTLTIgaW50ZXJuYWxseSxcbiAgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuICAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuICAqIG1hdGNoaW5nIFVURi0xNi5cbiAgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcbiAgKiBAc2VlIDxodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuICAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG4gICogQG5hbWUgZGVjb2RlXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgVW5pY29kZSBpbnB1dCBzdHJpbmcgKFVDUy0yKS5cbiAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG4gICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkge1xuXHRcdFx0XHRcdC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyoqXG4gICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuICAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuICAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG4gICogQG5hbWUgZW5jb2RlXG4gICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cbiAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbmV3IFVuaWNvZGUgc3RyaW5nIChVQ1MtMikuXG4gICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG4gICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuICAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuICAqIEBwcml2YXRlXG4gICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuICAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuICAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaW4gdGhlIHJhbmdlIGAwYCB0byBgYmFzZSAtIDFgLCBvciBgYmFzZWAgaWZcbiAgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cbiAgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG4gICogQ29udmVydHMgYSBkaWdpdC9pbnRlZ2VyIGludG8gYSBiYXNpYyBjb2RlIHBvaW50LlxuICAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuICAqIEBwcml2YXRlXG4gICogQHBhcmFtIHtOdW1iZXJ9IGRpZ2l0IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludC5cbiAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuICAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG4gICogYDBgIHRvIGBiYXNlIC0gMWAuIElmIGBmbGFnYCBpcyBub24temVybywgdGhlIHVwcGVyY2FzZSBmb3JtIGlzXG4gICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcbiAgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuICAqL1xuXHRmdW5jdGlvbiBkaWdpdFRvQmFzaWMoZGlnaXQsIGZsYWcpIHtcblx0XHQvLyAgMC4uMjUgbWFwIHRvIEFTQ0lJIGEuLnogb3IgQS4uWlxuXHRcdC8vIDI2Li4zNSBtYXAgdG8gQVNDSUkgMC4uOVxuXHRcdHJldHVybiBkaWdpdCArIDIyICsgNzUgKiAoZGlnaXQgPCAyNikgLSAoKGZsYWcgIT0gMCkgPDwgNSk7XG5cdH1cblxuXHQvKipcbiAgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuICAqIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcbiAgKiBAcHJpdmF0ZVxuICAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICg7IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG4gICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcbiAgKiBzeW1ib2xzLlxuICAqIEBtZW1iZXJPZiBwdW55Y29kZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cbiAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG4gICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICBsZW5ndGgsXG5cdFx0ICAgXG5cdFx0LyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0YmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDspIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXM7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuICAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyB0byBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5XG4gICogc3ltYm9scy5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG4gICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuICAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICBcblx0XHQvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdGlucHV0TGVuZ3RoLFxuXHRcdCAgIFxuXHRcdC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTs7IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiBrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKSk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcbiAgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSB0byBVbmljb2RlLiBPbmx5IHRoZVxuICAqIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS4gaXQgZG9lc24ndFxuICAqIG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gY29udmVydGVkIHRvXG4gICogVW5pY29kZS5cbiAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBQdW55Y29kZSBkb21haW4gbmFtZSB0byBjb252ZXJ0IHRvIFVuaWNvZGUuXG4gICogQHJldHVybnMge1N0cmluZ30gVGhlIFVuaWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIFB1bnljb2RlXG4gICogc3RyaW5nLlxuICAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoZG9tYWluKSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihkb21haW4sIGZ1bmN0aW9uIChzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKSA/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSkgOiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcbiAgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIHRvIFB1bnljb2RlLiBPbmx5IHRoZVxuICAqIG5vbi1BU0NJSSBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS4gaXQgZG9lc24ndFxuICAqIG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluIEFTQ0lJLlxuICAqIEBtZW1iZXJPZiBwdW55Y29kZVxuICAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lIHRvIGNvbnZlcnQsIGFzIGEgVW5pY29kZSBzdHJpbmcuXG4gICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZS5cbiAgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShkb21haW4pIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGRvbWFpbiwgZnVuY3Rpb24gKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpID8gJ3huLS0nICsgZW5jb2RlKHN0cmluZykgOiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuICAgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgUHVueWNvZGUuanMgdmVyc2lvbiBudW1iZXIuXG4gICAqIEBtZW1iZXJPZiBwdW55Y29kZVxuICAgKiBAdHlwZSBTdHJpbmdcbiAgICovXG5cdFx0J3ZlcnNpb24nOiAnMS4yLjMnLFxuXHRcdC8qKlxuICAgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuICAgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuICAgKiBAc2VlIDxodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuICAgKiBAbWVtYmVyT2YgcHVueWNvZGVcbiAgICogQHR5cGUgT2JqZWN0XG4gICAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHtcblx0XHRcdC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxufSkodW5kZWZpbmVkKTtcbi8qIG5vIGluaXRpYWxpemF0aW9uICovIC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8gLyogbm8gY29uZGl0aW9uICovIC8qIG5vIGNvbmRpdGlvbiAqLyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9nbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9nbG9iYWwtY29udGV4dCcpO1xuXG52YXIgX2dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2xvYmFsQ29udGV4dCk7XG5cbi8qXG4qIFRoaXMgZGVsYXkgYWxsb3dzIHRoZSB0aHJlYWQgdG8gZmluaXNoIGFzc2lnbmluZyBpdHMgb24qIG1ldGhvZHNcbiogYmVmb3JlIGludm9raW5nIHRoZSBkZWxheSBjYWxsYmFjay4gVGhpcyBpcyBwdXJlbHkgYSB0aW1pbmcgaGFjay5cbiogaHR0cDovL2dlZWthYnl0ZS5ibG9nc3BvdC5jb20vMjAxNC8wMS9qYXZhc2NyaXB0LWVmZmVjdC1vZi1zZXR0aW5nLXNldHRpbWVvdXQuaHRtbFxuKlxuKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn0gdGhlIGNhbGxiYWNrIHdoaWNoIHdpbGwgYmUgaW52b2tlZCBhZnRlciB0aGUgdGltZW91dFxuKiBAcGFybWEge2NvbnRleHQ6IG9iamVjdH0gdGhlIGNvbnRleHQgaW4gd2hpY2ggdG8gaW52b2tlIHRoZSBmdW5jdGlvblxuKi9cbmZ1bmN0aW9uIGRlbGF5KGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIF9nbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLnNldFRpbWVvdXQoZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBjYWxsYmFjay5jYWxsKGNvbnRleHQpO1xuICB9LCA0LCBjb250ZXh0KTtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gZGVsYXk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKlxuKiBEZXRlcm1pbmVzIHRoZSBnbG9iYWwgY29udGV4dC4gVGhpcyBzaG91bGQgYmUgZWl0aGVyIHdpbmRvdyAoaW4gdGhlKVxuKiBjYXNlIHdoZXJlIHdlIGFyZSBpbiBhIGJyb3dzZXIpIG9yIGdsb2JhbCAoaW4gdGhlIGNhc2Ugd2hlcmUgd2UgYXJlIGluXG4qIG5vZGUpXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIGdsb2JhbENvbnRleHQ7XG5cbmlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIGdsb2JhbENvbnRleHQgPSBnbG9iYWw7XG59IGVsc2Uge1xuICAgIGdsb2JhbENvbnRleHQgPSB3aW5kb3c7XG59XG5cbmlmICghZ2xvYmFsQ29udGV4dCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHNldCB0aGUgZ2xvYmFsIGNvbnRleHQgdG8gZWl0aGVyIHdpbmRvdyBvciBnbG9iYWwuJyk7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGdsb2JhbENvbnRleHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKlxuKiBUaGlzIGlzIGEgbW9jayB3ZWJzb2NrZXQgZXZlbnQgbWVzc2FnZSB0aGF0IGlzIHBhc3NlZCBpbnRvIHRoZSBvbm9wZW4sXG4qIG9wbWVzc2FnZSwgZXRjIGZ1bmN0aW9ucy5cbipcbiogQHBhcmFtIHtuYW1lOiBzdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBldmVudFxuKiBAcGFyYW0ge2RhdGE6ICp9IFRoZSBkYXRhIHRvIHNlbmQuXG4qIEBwYXJhbSB7b3JpZ2luOiBzdHJpbmd9IFRoZSB1cmwgb2YgdGhlIHBsYWNlIHdoZXJlIHRoZSBldmVudCBpcyBvcmlnaW5hdGluZy5cbiovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcblx0dmFsdWU6IHRydWVcbn0pO1xuZnVuY3Rpb24gc29ja2V0RXZlbnRNZXNzYWdlKG5hbWUsIGRhdGEsIG9yaWdpbikge1xuXHR2YXIgcG9ydHMgPSBudWxsO1xuXHR2YXIgc291cmNlID0gbnVsbDtcblx0dmFyIGJ1YmJsZXMgPSBmYWxzZTtcblx0dmFyIGNhbmNlbGFibGUgPSBmYWxzZTtcblx0dmFyIGxhc3RFdmVudElkID0gJyc7XG5cdHZhciB0YXJnZXRQbGFjZWhvbGQgPSBudWxsO1xuXHR2YXIgbWVzc2FnZUV2ZW50O1xuXG5cdHRyeSB7XG5cdFx0bWVzc2FnZUV2ZW50ID0gbmV3IE1lc3NhZ2VFdmVudChuYW1lKTtcblx0XHRtZXNzYWdlRXZlbnQuaW5pdE1lc3NhZ2VFdmVudChuYW1lLCBidWJibGVzLCBjYW5jZWxhYmxlLCBkYXRhLCBvcmlnaW4sIGxhc3RFdmVudElkKTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG1lc3NhZ2VFdmVudCwge1xuXHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0YXJnZXRQbGFjZWhvbGQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG5cdFx0XHRcdFx0dGFyZ2V0UGxhY2Vob2xkID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRzcmNFbGVtZW50OiB7XG5cdFx0XHRcdGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGN1cnJlbnRUYXJnZXQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHQvLyBXZSBhcmUgdW5hYmxlIHRvIGNyZWF0ZSBhIE1lc3NhZ2VFdmVudCBPYmplY3QuIFRoaXMgc2hvdWxkIG9ubHkgYmUgaGFwcGVuaW5nIGluIFBoYW50b21KUy5cblx0XHRtZXNzYWdlRXZlbnQgPSB7XG5cdFx0XHR0eXBlOiBuYW1lLFxuXHRcdFx0YnViYmxlczogYnViYmxlcyxcblx0XHRcdGNhbmNlbGFibGU6IGNhbmNlbGFibGUsXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0b3JpZ2luOiBvcmlnaW4sXG5cdFx0XHRsYXN0RXZlbnRJZDogbGFzdEV2ZW50SWQsXG5cdFx0XHRzb3VyY2U6IHNvdXJjZSxcblx0XHRcdHBvcnRzOiBwb3J0cyxcblx0XHRcdGRlZmF1bHRQcmV2ZW50ZWQ6IGZhbHNlLFxuXHRcdFx0cmV0dXJuVmFsdWU6IHRydWUsXG5cdFx0XHRjbGlwYm9hcmREYXRhOiB1bmRlZmluZWRcblx0XHR9O1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMobWVzc2FnZUV2ZW50LCB7XG5cdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRhcmdldFBsYWNlaG9sZDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcblx0XHRcdFx0XHR0YXJnZXRQbGFjZWhvbGQgPSB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHNyY0VsZW1lbnQ6IHtcblx0XHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMudGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Y3VycmVudFRhcmdldDoge1xuXHRcdFx0XHRnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50YXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBtZXNzYWdlRXZlbnQ7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHNvY2tldEV2ZW50TWVzc2FnZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9VUklNaW5KcyA9IHJlcXVpcmUoJy4uLy4uL1VSSS5taW4uanMnKTtcblxudmFyIF9VUklNaW5KczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9VUklNaW5Kcyk7XG5cbi8qXG4qIFRoZSBuYXRpdmUgd2Vic29ja2V0IG9iamVjdCB3aWxsIHRyYW5zZm9ybSB1cmxzIHdpdGhvdXQgYSBwYXRobmFtZSB0byBoYXZlIGp1c3QgYSAvLlxuKiBBcyBhbiBleGFtcGxlOiB3czovL2xvY2FsaG9zdDo4MDgwIHdvdWxkIGFjdHVhbGx5IGJlIHdzOi8vbG9jYWxob3N0OjgwODAvIGJ1dCB3czovL2V4YW1wbGUuY29tL2ZvbyB3b3VsZCBub3RcbiogY2hhbmdlLiBUaGlzIGZ1bmN0aW9uIGRvZXMgdGhpcyB0cmFuc2Zvcm1hdGlvbiB0byBzdGF5IGlubGluZSB3aXRoIHRoZSBuYXRpdmUgd2Vic29ja2V0IGltcGxlbWVudGF0aW9uLlxuKlxuKiBAcGFyYW0ge3VybDogc3RyaW5nfSBUaGUgdXJsIHRvIHRyYW5zZm9ybS5cbiovXG5mdW5jdGlvbiB1cmxUcmFuc2Zvcm0odXJsKSB7XG4gIHZhciBub3JtYWxpemVkVVJMID0gKDAsIF9VUklNaW5KczJbJ2RlZmF1bHQnXSkodXJsKS50b1N0cmluZygpO1xuICByZXR1cm4gbm9ybWFsaXplZFVSTDtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gdXJsVHJhbnNmb3JtO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLypcbiogVGhpcyBkZWZpbmVzIGZvdXIgbWV0aG9kczogb25vcGVuLCBvbm1lc3NhZ2UsIG9uZXJyb3IsIGFuZCBvbmNsb3NlLiBUaGlzIGlzIGRvbmUgdGhpcyB3YXkgaW5zdGVhZCBvZlxuKiBqdXN0IHBsYWNpbmcgdGhlIG1ldGhvZHMgb24gdGhlIHByb3RvdHlwZSBiZWNhdXNlIHdlIG5lZWQgdG8gY2FwdHVyZSB0aGUgY2FsbGJhY2sgd2hlbiBpdCBpcyBkZWZpbmVkIGxpa2Ugc286XG4qXG4qIG1vY2tTb2NrZXQub25vcGVuID0gZnVuY3Rpb24oKSB7IC8vIHRoaXMgaXMgd2hhdCB3ZSBuZWVkIHRvIHN0b3JlIH07XG4qXG4qIFRoZSBvbmx5IHdheSBpcyB0byBjYXB0dXJlIHRoZSBjYWxsYmFjayB2aWEgdGhlIGN1c3RvbSBzZXR0ZXIgYmVsb3cgYW5kIHRoZW4gcGxhY2UgdGhlbSBpbnRvIHRoZSBjb3JyZWN0XG4qIG5hbWVzcGFjZSBzbyB0aGV5IGdldCBpbnZva2VkIGF0IHRoZSByaWdodCB0aW1lLlxuKlxuKiBAcGFyYW0ge3dlYnNvY2tldDogb2JqZWN0fSBUaGUgd2Vic29ja2V0IG9iamVjdCB3aGljaCB3ZSB3YW50IHRvIGRlZmluZSB0aGVzZSBwcm9wZXJ0aWVzIG9udG9cbiovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZnVuY3Rpb24gd2ViU29ja2V0UHJvcGVydGllcyh3ZWJzb2NrZXQpIHtcbiAgdmFyIGV2ZW50TWVzc2FnZVNvdXJjZSA9IGZ1bmN0aW9uIGV2ZW50TWVzc2FnZVNvdXJjZShjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnRhcmdldCA9IHdlYnNvY2tldDtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHdlYnNvY2tldCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHdlYnNvY2tldCwge1xuICAgIG9ub3Blbjoge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb25vcGVuO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX29ub3BlbiA9IGV2ZW50TWVzc2FnZVNvdXJjZShjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc2VydmljZS5zZXRDYWxsYmFja09ic2VydmVyKCdjbGllbnRPbk9wZW4nLCB0aGlzLl9vbm9wZW4sIHdlYnNvY2tldCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbm1lc3NhZ2U6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29ubWVzc2FnZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLl9vbm1lc3NhZ2UgPSBldmVudE1lc3NhZ2VTb3VyY2UoY2FsbGJhY2spO1xuICAgICAgICB0aGlzLnNlcnZpY2Uuc2V0Q2FsbGJhY2tPYnNlcnZlcignY2xpZW50T25NZXNzYWdlJywgdGhpcy5fb25tZXNzYWdlLCB3ZWJzb2NrZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb25jbG9zZToge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb25jbG9zZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLl9vbmNsb3NlID0gZXZlbnRNZXNzYWdlU291cmNlKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5zZXJ2aWNlLnNldENhbGxiYWNrT2JzZXJ2ZXIoJ2NsaWVudE9uY2xvc2UnLCB0aGlzLl9vbmNsb3NlLCB3ZWJzb2NrZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgb25lcnJvcjoge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb25lcnJvcjtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLl9vbmVycm9yID0gZXZlbnRNZXNzYWdlU291cmNlKGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5zZXJ2aWNlLnNldENhbGxiYWNrT2JzZXJ2ZXIoJ2NsaWVudE9uRXJyb3InLCB0aGlzLl9vbmVycm9yLCB3ZWJzb2NrZXQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHdlYlNvY2tldFByb3BlcnRpZXM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9zZXJ2aWNlID0gcmVxdWlyZSgnLi9zZXJ2aWNlJyk7XG5cbnZhciBfc2VydmljZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zZXJ2aWNlKTtcblxudmFyIF9tb2NrU2VydmVyID0gcmVxdWlyZSgnLi9tb2NrLXNlcnZlcicpO1xuXG52YXIgX21vY2tTZXJ2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbW9ja1NlcnZlcik7XG5cbnZhciBfbW9ja1NvY2tldCA9IHJlcXVpcmUoJy4vbW9jay1zb2NrZXQnKTtcblxudmFyIF9tb2NrU29ja2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21vY2tTb2NrZXQpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0ID0gcmVxdWlyZSgnLi9oZWxwZXJzL2dsb2JhbC1jb250ZXh0Jyk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0dsb2JhbENvbnRleHQpO1xuXG5faGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uU29ja2V0U2VydmljZSA9IF9zZXJ2aWNlMlsnZGVmYXVsdCddO1xuX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQgPSBfbW9ja1NvY2tldDJbJ2RlZmF1bHQnXTtcbl9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU2VydmVyID0gX21vY2tTZXJ2ZXIyWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3NlcnZpY2UgPSByZXF1aXJlKCcuL3NlcnZpY2UnKTtcblxudmFyIF9zZXJ2aWNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NlcnZpY2UpO1xuXG52YXIgX2hlbHBlcnNEZWxheSA9IHJlcXVpcmUoJy4vaGVscGVycy9kZWxheScpO1xuXG52YXIgX2hlbHBlcnNEZWxheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRGVsYXkpO1xuXG52YXIgX2hlbHBlcnNVcmxUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL2hlbHBlcnMvdXJsLXRyYW5zZm9ybScpO1xuXG52YXIgX2hlbHBlcnNVcmxUcmFuc2Zvcm0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc1VybFRyYW5zZm9ybSk7XG5cbnZhciBfaGVscGVyc01lc3NhZ2VFdmVudCA9IHJlcXVpcmUoJy4vaGVscGVycy9tZXNzYWdlLWV2ZW50Jyk7XG5cbnZhciBfaGVscGVyc01lc3NhZ2VFdmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzTWVzc2FnZUV2ZW50KTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dCA9IHJlcXVpcmUoJy4vaGVscGVycy9nbG9iYWwtY29udGV4dCcpO1xuXG52YXIgX2hlbHBlcnNHbG9iYWxDb250ZXh0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNHbG9iYWxDb250ZXh0KTtcblxuZnVuY3Rpb24gTW9ja1NlcnZlcih1cmwpIHtcbiAgdmFyIHNlcnZpY2UgPSBuZXcgX3NlcnZpY2UyWydkZWZhdWx0J10oKTtcbiAgdGhpcy51cmwgPSAoMCwgX2hlbHBlcnNVcmxUcmFuc2Zvcm0yWydkZWZhdWx0J10pKHVybCk7XG5cbiAgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuc2VydmljZXNbdGhpcy51cmxdID0gc2VydmljZTtcblxuICB0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlO1xuICAvLyBpZ25vcmUgcG9zc2libGUgcXVlcnkgcGFyYW1ldGVyc1xuICBpZiAodXJsLmluZGV4T2YoTW9ja1NlcnZlci51bnJlc29sdmFibGVVUkwpID09PSAtMSkge1xuICAgIHNlcnZpY2Uuc2VydmVyID0gdGhpcztcbiAgfVxufVxuXG4vKlxuKiBUaGlzIFVSTCBjYW4gYmUgdXNlZCB0byBlbXVsYXRlIHNlcnZlciB0aGF0IGRvZXMgbm90IGVzdGFibGlzaCBjb25uZWN0aW9uXG4qL1xuTW9ja1NlcnZlci51bnJlc29sdmFibGVVUkwgPSAnd3M6Ly91bnJlc29sdmFibGVfdXJsJztcblxuTW9ja1NlcnZlci5wcm90b3R5cGUgPSB7XG4gIHNlcnZpY2U6IG51bGwsXG5cbiAgLypcbiAgKiBUaGlzIGlzIHRoZSBtYWluIGZ1bmN0aW9uIGZvciB0aGUgbW9jayBzZXJ2ZXIgdG8gc3Vic2NyaWJlIHRvIHRoZSBvbiBldmVudHMuXG4gICpcbiAgKiBpZTogbW9ja1NlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnYSBtb2NrIGNsaWVudCBjb25uZWN0ZWQnKTsgfSk7XG4gICpcbiAgKiBAcGFyYW0ge3R5cGU6IHN0cmluZ306IFRoZSBldmVudCBrZXkgdG8gc3Vic2NyaWJlIHRvLiBWYWxpZCBrZXlzIGFyZTogY29ubmVjdGlvbiwgbWVzc2FnZSwgYW5kIGNsb3NlLlxuICAqIEBwYXJhbSB7Y2FsbGJhY2s6IGZ1bmN0aW9ufTogVGhlIGNhbGxiYWNrIHdoaWNoIHNob3VsZCBiZSBjYWxsZWQgd2hlbiBhIGNlcnRhaW4gZXZlbnQgaXMgZmlyZWQuXG4gICovXG4gIG9uOiBmdW5jdGlvbiBvbih0eXBlLCBjYWxsYmFjaykge1xuICAgIHZhciBvYnNlcnZlcktleTtcblxuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdjb25uZWN0aW9uJzpcbiAgICAgICAgb2JzZXJ2ZXJLZXkgPSAnY2xpZW50SGFzSm9pbmVkJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtZXNzYWdlJzpcbiAgICAgICAgb2JzZXJ2ZXJLZXkgPSAnY2xpZW50SGFzU2VudE1lc3NhZ2UnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgb2JzZXJ2ZXJLZXkgPSAnY2xpZW50SGFzTGVmdCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBvYnNlcnZlcktleSBpcyB2YWxpZCBiZWZvcmUgb2JzZXJ2aW5nIG9uIGl0LlxuICAgIGlmICh0eXBlb2Ygb2JzZXJ2ZXJLZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnNlcnZpY2UuY2xlYXJBbGwob2JzZXJ2ZXJLZXkpO1xuICAgICAgdGhpcy5zZXJ2aWNlLnNldENhbGxiYWNrT2JzZXJ2ZXIob2JzZXJ2ZXJLZXksIGNhbGxiYWNrLCB0aGlzKTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBUaGlzIHNlbmQgZnVuY3Rpb24gd2lsbCBub3RpZnkgYWxsIG1vY2sgY2xpZW50cyB2aWEgdGhlaXIgb25tZXNzYWdlIGNhbGxiYWNrcyB0aGF0IHRoZSBzZXJ2ZXJcbiAgKiBoYXMgYSBtZXNzYWdlIGZvciB0aGVtLlxuICAqXG4gICogQHBhcmFtIHtkYXRhOiAqfTogQW55IGphdmFzY3JpcHQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgY3JhZnRlZCBpbnRvIGEgTWVzc2FnZU9iamVjdC5cbiAgKi9cbiAgc2VuZDogZnVuY3Rpb24gc2VuZChkYXRhKSB7XG4gICAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2VydmljZS5zZW5kTWVzc2FnZVRvQ2xpZW50cygoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdtZXNzYWdlJywgZGF0YSwgdGhpcy51cmwpKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICAvKlxuICAqIE5vdGlmaWVzIGFsbCBtb2NrIGNsaWVudHMgdGhhdCB0aGUgc2VydmVyIGlzIGNsb3NpbmcgYW5kIHRoZWlyIG9uY2xvc2UgY2FsbGJhY2tzIHNob3VsZCBmaXJlLlxuICAqL1xuICBjbG9zZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2VydmljZS5jbG9zZUNvbm5lY3Rpb25Gcm9tU2VydmVyKCgwLCBfaGVscGVyc01lc3NhZ2VFdmVudDJbJ2RlZmF1bHQnXSkoJ2Nsb3NlJywgbnVsbCwgdGhpcy51cmwpKTtcbiAgICB9LCB0aGlzKTtcbiAgfVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTW9ja1NlcnZlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9oZWxwZXJzRGVsYXkgPSByZXF1aXJlKCcuL2hlbHBlcnMvZGVsYXknKTtcblxudmFyIF9oZWxwZXJzRGVsYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0RlbGF5KTtcblxudmFyIF9oZWxwZXJzVXJsVHJhbnNmb3JtID0gcmVxdWlyZSgnLi9oZWxwZXJzL3VybC10cmFuc2Zvcm0nKTtcblxudmFyIF9oZWxwZXJzVXJsVHJhbnNmb3JtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNVcmxUcmFuc2Zvcm0pO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQgPSByZXF1aXJlKCcuL2hlbHBlcnMvbWVzc2FnZS1ldmVudCcpO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc01lc3NhZ2VFdmVudCk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2xvYmFsLWNvbnRleHQnKTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzR2xvYmFsQ29udGV4dCk7XG5cbnZhciBfaGVscGVyc1dlYnNvY2tldFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2hlbHBlcnMvd2Vic29ja2V0LXByb3BlcnRpZXMnKTtcblxudmFyIF9oZWxwZXJzV2Vic29ja2V0UHJvcGVydGllczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzV2Vic29ja2V0UHJvcGVydGllcyk7XG5cbmZ1bmN0aW9uIE1vY2tTb2NrZXQodXJsKSB7XG4gIHRoaXMuYmluYXJ5VHlwZSA9ICdibG9iJztcbiAgdGhpcy51cmwgPSAoMCwgX2hlbHBlcnNVcmxUcmFuc2Zvcm0yWydkZWZhdWx0J10pKHVybCk7XG4gIHRoaXMucmVhZHlTdGF0ZSA9IF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNPTk5FQ1RJTkc7XG4gIHRoaXMuc2VydmljZSA9IF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LnNlcnZpY2VzW3RoaXMudXJsXTtcblxuICB0aGlzLl9ldmVudEhhbmRsZXJzID0ge307XG5cbiAgKDAsIF9oZWxwZXJzV2Vic29ja2V0UHJvcGVydGllczJbJ2RlZmF1bHQnXSkodGhpcyk7XG5cbiAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBMZXQgdGhlIHNlcnZpY2Uga25vdyB0aGF0IHdlIGFyZSBib3RoIHJlYWR5IHRvIGNoYW5nZSBvdXIgcmVhZHkgc3RhdGUgYW5kIHRoYXRcbiAgICAvLyB0aGlzIGNsaWVudCBpcyBjb25uZWN0aW5nIHRvIHRoZSBtb2NrIHNlcnZlci5cbiAgICB0aGlzLnNlcnZpY2UuY2xpZW50SXNDb25uZWN0aW5nKHRoaXMsIHRoaXMuX3VwZGF0ZVJlYWR5U3RhdGUpO1xuICB9LCB0aGlzKTtcbn1cblxuTW9ja1NvY2tldC5DT05ORUNUSU5HID0gMDtcbk1vY2tTb2NrZXQuT1BFTiA9IDE7XG5Nb2NrU29ja2V0LkNMT1NJTkcgPSAyO1xuTW9ja1NvY2tldC5DTE9TRUQgPSAzO1xuTW9ja1NvY2tldC5zZXJ2aWNlcyA9IHt9O1xuXG5Nb2NrU29ja2V0LnByb3RvdHlwZSA9IHtcblxuICAvKlxuICAqIEhvbGRzIHRoZSBvbioqKiBjYWxsYmFjayBmdW5jdGlvbnMuIFRoZXNlIGFyZSByZWFsbHkganVzdCBmb3IgdGhlIGN1c3RvbVxuICAqIGdldHRlcnMgdGhhdCBhcmUgZGVmaW5lZCBpbiB0aGUgaGVscGVycy93ZWJzb2NrZXQtcHJvcGVydGllcy4gQWNjZXNzaW5nIHRoZXNlIHByb3BlcnRpZXMgaXMgbm90IGFkdmlzZWQuXG4gICovXG4gIF9vbm9wZW46IG51bGwsXG4gIF9vbm1lc3NhZ2U6IG51bGwsXG4gIF9vbmVycm9yOiBudWxsLFxuICBfb25jbG9zZTogbnVsbCxcblxuICAvKlxuICAqIFRoaXMgaG9sZHMgcmVmZXJlbmNlIHRvIHRoZSBzZXJ2aWNlIG9iamVjdC4gVGhlIHNlcnZpY2Ugb2JqZWN0IGlzIGhvdyB3ZSBjYW5cbiAgKiBjb21tdW5pY2F0ZSB3aXRoIHRoZSBiYWNrZW5kIHZpYSB0aGUgcHViL3N1YiBtb2RlbC5cbiAgKlxuICAqIFRoZSBzZXJ2aWNlIGhhcyBwcm9wZXJ0aWVzIHdoaWNoIHdlIGNhbiB1c2UgdG8gb2JzZXJ2ZSBvciBub3RpZml5IHdpdGguXG4gICogdGhpcy5zZXJ2aWNlLm5vdGlmeSgnZm9vJykgJiB0aGlzLnNlcnZpY2Uub2JzZXJ2ZSgnZm9vJywgY2FsbGJhY2ssIGNvbnRleHQpXG4gICovXG4gIHNlcnZpY2U6IG51bGwsXG5cbiAgLypcbiAgKiBJbnRlcm5hbCBzdG9yYWdlIGZvciBldmVudCBoYW5kbGVycy4gQmFzaWNhbGx5LCB0aGVyZSBjb3VsZCBiZSBtb3JlIHRoYW4gb25lXG4gICogaGFuZGxlciBwZXIgZXZlbnQgc28gd2Ugc3RvcmUgdGhlbSBhbGwgaW4gYXJyYXkuXG4gICovXG4gIF9ldmVudEhhbmRsZXJzOiB7fSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBtb2NrIGZvciBFdmVudFRhcmdldCdzIGFkZEV2ZW50TGlzdGVuZXIgbWV0aG9kLiBBIGJpdCBuYWl2ZSBhbmRcbiAgKiBkb2Vzbid0IGltcGxlbWVudCB0aGlyZCB1c2VDYXB0dXJlIHBhcmFtZXRlciBidXQgc2hvdWxkIGJlIGVub3VnaCBmb3IgbW9zdFxuICAqIChpZiBub3QgYWxsKSBjYXNlcy5cbiAgKlxuICAqIEBwYXJhbSB7ZXZlbnQ6IHN0cmluZ306IEV2ZW50IG5hbWUuXG4gICogQHBhcmFtIHtoYW5kbGVyOiBmdW5jdGlvbn06IEFueSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZXZlbnQgaGFuZGxpbmcuXG4gICovXG4gIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSB7XG4gICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSA9IFtdO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpc1snb24nICsgZXZlbnRdID0gZnVuY3Rpb24gKGV2ZW50T2JqZWN0KSB7XG4gICAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudChldmVudE9iamVjdCk7XG4gICAgICB9O1xuICAgIH1cbiAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xuICB9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIG1vY2sgZm9yIEV2ZW50VGFyZ2V0J3MgcmVtb3ZlRXZlbnRMaXN0ZW5lciBtZXRob2QuIEEgYml0IG5haXZlIGFuZFxuICAqIGRvZXNuJ3QgaW1wbGVtZW50IHRoaXJkIHVzZUNhcHR1cmUgcGFyYW1ldGVyIGJ1dCBzaG91bGQgYmUgZW5vdWdoIGZvciBtb3N0XG4gICogKGlmIG5vdCBhbGwpIGNhc2VzLlxuICAqXG4gICogQHBhcmFtIHtldmVudDogc3RyaW5nfTogRXZlbnQgbmFtZS5cbiAgKiBAcGFyYW0ge2hhbmRsZXI6IGZ1bmN0aW9ufTogQW55IGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBldmVudCBoYW5kbGluZy4gU2hvdWxkXG4gICogYmUgb25lIG9mIHRoZSBmdW5jdGlvbnMgdXNlZCBpbiB0aGUgcHJldmlvdXMgY2FsbHMgb2YgYWRkRXZlbnRMaXN0ZW5lciBtZXRob2QuXG4gICovXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBoYW5kbGVycyA9IHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdO1xuICAgIGhhbmRsZXJzLnNwbGljZShoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpLCAxKTtcbiAgICBpZiAoIWhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdO1xuICAgICAgZGVsZXRlIHRoaXNbJ29uJyArIGV2ZW50XTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgbW9jayBmb3IgRXZlbnRUYXJnZXQncyBkaXNwYXRjaEV2ZW50IG1ldGhvZC5cbiAgKlxuICAqIEBwYXJhbSB7ZXZlbnQ6IE1lc3NhZ2VFdmVudH06IFNvbWUgZXZlbnQsIGVpdGhlciBuYXRpdmUgTWVzc2FnZUV2ZW50IG9yIGFuIG9iamVjdFxuICAqIHJldHVybmVkIGJ5IHJlcXVpcmUoJy4vaGVscGVycy9tZXNzYWdlLWV2ZW50JylcbiAgKi9cbiAgZGlzcGF0Y2hFdmVudDogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCkge1xuICAgIHZhciBoYW5kbGVycyA9IHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnQudHlwZV07XG4gICAgaWYgKCFoYW5kbGVycykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBoYW5kbGVyc1tpXS5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgKiBUaGlzIGlzIGEgbW9jayBmb3IgdGhlIG5hdGl2ZSBzZW5kIGZ1bmN0aW9uIGZvdW5kIG9uIHRoZSBXZWJTb2NrZXQgb2JqZWN0LiBJdCBub3RpZmllcyB0aGVcbiAgKiBzZXJ2aWNlIHRoYXQgaXQgaGFzIHNlbnQgYSBtZXNzYWdlLlxuICAqXG4gICogQHBhcmFtIHtkYXRhOiAqfTogQW55IGphdmFzY3JpcHQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgY3JhZnRlZCBpbnRvIGEgTWVzc2FnZU9iamVjdC5cbiAgKi9cbiAgc2VuZDogZnVuY3Rpb24gc2VuZChkYXRhKSB7XG4gICAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2VydmljZS5zZW5kTWVzc2FnZVRvU2VydmVyKCgwLCBfaGVscGVyc01lc3NhZ2VFdmVudDJbJ2RlZmF1bHQnXSkoJ21lc3NhZ2UnLCBkYXRhLCB0aGlzLnVybCkpO1xuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIC8qXG4gICogVGhpcyBpcyBhIG1vY2sgZm9yIHRoZSBuYXRpdmUgY2xvc2UgZnVuY3Rpb24gZm91bmQgb24gdGhlIFdlYlNvY2tldCBvYmplY3QuIEl0IG5vdGlmaWVzIHRoZVxuICAqIHNlcnZpY2UgdGhhdCBpdCBpcyBjbG9zaW5nIHRoZSBjb25uZWN0aW9uLlxuICAqL1xuICBjbG9zZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2VydmljZS5jbG9zZUNvbm5lY3Rpb25Gcm9tQ2xpZW50KCgwLCBfaGVscGVyc01lc3NhZ2VFdmVudDJbJ2RlZmF1bHQnXSkoJ2Nsb3NlJywgbnVsbCwgdGhpcy51cmwpLCB0aGlzKTtcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICAvKlxuICAqIFRoaXMgaXMgYSBwcml2YXRlIG1ldGhvZCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNoYW5nZSB0aGUgcmVhZHlTdGF0ZS4gVGhpcyBpcyB1c2VkXG4gICogbGlrZSB0aGlzOiB0aGlzLnByb3RvY29sLnN1YmplY3Qub2JzZXJ2ZSgndXBkYXRlUmVhZHlTdGF0ZScsIHRoaXMuX3VwZGF0ZVJlYWR5U3RhdGUsIHRoaXMpO1xuICAqIHNvIHRoYXQgdGhlIHNlcnZpY2UgYW5kIHRoZSBzZXJ2ZXIgY2FuIGNoYW5nZSB0aGUgcmVhZHlTdGF0ZSBzaW1wbHkgYmUgbm90aWZpbmcgYSBuYW1lc3BhY2UuXG4gICpcbiAgKiBAcGFyYW0ge25ld1JlYWR5U3RhdGU6IG51bWJlcn06IFRoZSBuZXcgcmVhZHkgc3RhdGUuIE11c3QgYmUgMC00XG4gICovXG4gIF91cGRhdGVSZWFkeVN0YXRlOiBmdW5jdGlvbiBfdXBkYXRlUmVhZHlTdGF0ZShuZXdSZWFkeVN0YXRlKSB7XG4gICAgaWYgKG5ld1JlYWR5U3RhdGUgPj0gMCAmJiBuZXdSZWFkeVN0YXRlIDw9IDQpIHtcbiAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IG5ld1JlYWR5U3RhdGU7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNb2NrU29ja2V0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQgPSByZXF1aXJlKCcuL2hlbHBlcnMvbWVzc2FnZS1ldmVudCcpO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc01lc3NhZ2VFdmVudCk7XG5cbnZhciBfaGVscGVyc0dsb2JhbENvbnRleHQgPSByZXF1aXJlKCcuL2hlbHBlcnMvZ2xvYmFsLWNvbnRleHQnKTtcblxudmFyIF9oZWxwZXJzR2xvYmFsQ29udGV4dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzR2xvYmFsQ29udGV4dCk7XG5cbmZ1bmN0aW9uIFNvY2tldFNlcnZpY2UoKSB7XG4gIHRoaXMubGlzdCA9IHt9O1xufVxuXG5Tb2NrZXRTZXJ2aWNlLnByb3RvdHlwZSA9IHtcbiAgc2VydmVyOiBudWxsLFxuXG4gIC8qXG4gICogVGhpcyBub3RpZmllcyB0aGUgbW9jayBzZXJ2ZXIgdGhhdCBhIGNsaWVudCBpcyBjb25uZWN0aW5nIGFuZCBhbHNvIHNldHMgdXBcbiAgKiB0aGUgcmVhZHkgc3RhdGUgb2JzZXJ2ZXIuXG4gICpcbiAgKiBAcGFyYW0ge2NsaWVudDogb2JqZWN0fSB0aGUgY29udGV4dCBvZiB0aGUgY2xpZW50XG4gICogQHBhcmFtIHtyZWFkeVN0YXRlRnVuY3Rpb246IGZ1bmN0aW9ufSB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGludm9rZWQgb24gYSByZWFkeSBzdGF0ZSBjaGFuZ2VcbiAgKi9cbiAgY2xpZW50SXNDb25uZWN0aW5nOiBmdW5jdGlvbiBjbGllbnRJc0Nvbm5lY3RpbmcoY2xpZW50LCByZWFkeVN0YXRlRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9ic2VydmUoJ3VwZGF0ZVJlYWR5U3RhdGUnLCByZWFkeVN0YXRlRnVuY3Rpb24sIGNsaWVudCk7XG5cbiAgICAvLyBpZiB0aGUgc2VydmVyIGhhcyBub3QgYmVlbiBzZXQgdGhlbiB3ZSBub3RpZnkgdGhlIG9uY2xvc2UgbWV0aG9kIG9mIHRoaXMgY2xpZW50XG4gICAgaWYgKCF0aGlzLnNlcnZlcikge1xuICAgICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ3VwZGF0ZVJlYWR5U3RhdGUnLCBfaGVscGVyc0dsb2JhbENvbnRleHQyWydkZWZhdWx0J10uTW9ja1NvY2tldC5DTE9TRUQpO1xuICAgICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ2NsaWVudE9uRXJyb3InLCAoMCwgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10pKCdlcnJvcicsIG51bGwsIGNsaWVudC51cmwpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0Lk9QRU4pO1xuICAgIHRoaXMubm90aWZ5KCdjbGllbnRIYXNKb2luZWQnLCB0aGlzLnNlcnZlcik7XG4gICAgdGhpcy5ub3RpZnlPbmx5Rm9yKGNsaWVudCwgJ2NsaWVudE9uT3BlbicsICgwLCBfaGVscGVyc01lc3NhZ2VFdmVudDJbJ2RlZmF1bHQnXSkoJ29wZW4nLCBudWxsLCB0aGlzLnNlcnZlci51cmwpKTtcbiAgfSxcblxuICAvKlxuICAqIENsb3NlcyBhIGNvbm5lY3Rpb24gZnJvbSB0aGUgc2VydmVyJ3MgcGVyc3BlY3RpdmUuIFRoaXMgc2hvdWxkXG4gICogY2xvc2UgYWxsIGNsaWVudHMuXG4gICpcbiAgKiBAcGFyYW0ge21lc3NhZ2VFdmVudDogb2JqZWN0fSB0aGUgbW9jayBtZXNzYWdlIGV2ZW50LlxuICAqL1xuICBjbG9zZUNvbm5lY3Rpb25Gcm9tU2VydmVyOiBmdW5jdGlvbiBjbG9zZUNvbm5lY3Rpb25Gcm9tU2VydmVyKG1lc3NhZ2VFdmVudCkge1xuICAgIHRoaXMubm90aWZ5KCd1cGRhdGVSZWFkeVN0YXRlJywgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuQ0xPU0lORyk7XG4gICAgdGhpcy5ub3RpZnkoJ2NsaWVudE9uY2xvc2UnLCBtZXNzYWdlRXZlbnQpO1xuICAgIHRoaXMubm90aWZ5KCd1cGRhdGVSZWFkeVN0YXRlJywgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuQ0xPU0VEKTtcbiAgICB0aGlzLm5vdGlmeSgnY2xpZW50SGFzTGVmdCcpO1xuICB9LFxuXG4gIC8qXG4gICogQ2xvc2VzIGEgY29ubmVjdGlvbiBmcm9tIHRoZSBjbGllbnRzIHBlcnNwZWN0aXZlLiBUaGlzXG4gICogc2hvdWxkIG9ubHkgY2xvc2UgdGhlIGNsaWVudCB3aG8gaW5pdGlhdGVkIHRoZSBjbG9zZSBhbmQgbm90XG4gICogYWxsIG9mIHRoZSBvdGhlciBjbGllbnRzLlxuICAqXG4gICogQHBhcmFtIHttZXNzYWdlRXZlbnQ6IG9iamVjdH0gdGhlIG1vY2sgbWVzc2FnZSBldmVudC5cbiAgKiBAcGFyYW0ge2NsaWVudDogb2JqZWN0fSB0aGUgY29udGV4dCBvZiB0aGUgY2xpZW50XG4gICovXG4gIGNsb3NlQ29ubmVjdGlvbkZyb21DbGllbnQ6IGZ1bmN0aW9uIGNsb3NlQ29ubmVjdGlvbkZyb21DbGllbnQobWVzc2FnZUV2ZW50LCBjbGllbnQpIHtcbiAgICBpZiAoY2xpZW50LnJlYWR5U3RhdGUgPT09IF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0Lk9QRU4pIHtcbiAgICAgIHRoaXMubm90aWZ5T25seUZvcihjbGllbnQsICd1cGRhdGVSZWFkeVN0YXRlJywgX2hlbHBlcnNHbG9iYWxDb250ZXh0MlsnZGVmYXVsdCddLk1vY2tTb2NrZXQuQ0xPU0lORyk7XG4gICAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAnY2xpZW50T25jbG9zZScsIG1lc3NhZ2VFdmVudCk7XG4gICAgICB0aGlzLm5vdGlmeU9ubHlGb3IoY2xpZW50LCAndXBkYXRlUmVhZHlTdGF0ZScsIF9oZWxwZXJzR2xvYmFsQ29udGV4dDJbJ2RlZmF1bHQnXS5Nb2NrU29ja2V0LkNMT1NFRCk7XG4gICAgICB0aGlzLm5vdGlmeSgnY2xpZW50SGFzTGVmdCcpO1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAqIE5vdGlmaWVzIHRoZSBtb2NrIHNlcnZlciB0aGF0IGEgY2xpZW50IGhhcyBzZW50IGEgbWVzc2FnZS5cbiAgKlxuICAqIEBwYXJhbSB7bWVzc2FnZUV2ZW50OiBvYmplY3R9IHRoZSBtb2NrIG1lc3NhZ2UgZXZlbnQuXG4gICovXG4gIHNlbmRNZXNzYWdlVG9TZXJ2ZXI6IGZ1bmN0aW9uIHNlbmRNZXNzYWdlVG9TZXJ2ZXIobWVzc2FnZUV2ZW50KSB7XG4gICAgdGhpcy5ub3RpZnkoJ2NsaWVudEhhc1NlbnRNZXNzYWdlJywgbWVzc2FnZUV2ZW50LmRhdGEsIG1lc3NhZ2VFdmVudCk7XG4gIH0sXG5cbiAgLypcbiAgKiBOb3RpZmllcyBhbGwgY2xpZW50cyB0aGF0IHRoZSBzZXJ2ZXIgaGFzIHNlbnQgYSBtZXNzYWdlXG4gICpcbiAgKiBAcGFyYW0ge21lc3NhZ2VFdmVudDogb2JqZWN0fSB0aGUgbW9jayBtZXNzYWdlIGV2ZW50LlxuICAqL1xuICBzZW5kTWVzc2FnZVRvQ2xpZW50czogZnVuY3Rpb24gc2VuZE1lc3NhZ2VUb0NsaWVudHMobWVzc2FnZUV2ZW50KSB7XG4gICAgdGhpcy5ub3RpZnkoJ2NsaWVudE9uTWVzc2FnZScsIG1lc3NhZ2VFdmVudCk7XG4gIH0sXG5cbiAgLypcbiAgKiBTZXR1cCB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gb2JzZXJ2ZXJzIGZvciBib3RoIHRoZSBzZXJ2ZXIgYW5kIGNsaWVudC5cbiAgKlxuICAqIEBwYXJhbSB7b2JzZXJ2ZXJLZXk6IHN0cmluZ30gZWl0aGVyOiBjb25uZWN0aW9uLCBtZXNzYWdlIG9yIGNsb3NlXG4gICogQHBhcmFtIHtjYWxsYmFjazogZnVuY3Rpb259IHRoZSBjYWxsYmFjayB0byBiZSBpbnZva2VkXG4gICogQHBhcmFtIHtzZXJ2ZXI6IG9iamVjdH0gdGhlIGNvbnRleHQgb2YgdGhlIHNlcnZlclxuICAqL1xuICBzZXRDYWxsYmFja09ic2VydmVyOiBmdW5jdGlvbiBzZXRDYWxsYmFja09ic2VydmVyKG9ic2VydmVyS2V5LCBjYWxsYmFjaywgc2VydmVyKSB7XG4gICAgdGhpcy5vYnNlcnZlKG9ic2VydmVyS2V5LCBjYWxsYmFjaywgc2VydmVyKTtcbiAgfSxcblxuICAvKlxuICAqIEJpbmRzIGEgY2FsbGJhY2sgdG8gYSBuYW1lc3BhY2UuIElmIG5vdGlmeSBpcyBjYWxsZWQgb24gYSBuYW1lc3BhY2UgYWxsIFwib2JzZXJ2ZXJzXCIgd2lsbCBiZVxuICAqIGZpcmVkIHdpdGggdGhlIGNvbnRleHQgdGhhdCBpcyBwYXNzZWQgaW4uXG4gICpcbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogc3RyaW5nfVxuICAqIEBwYXJhbSB7Y2FsbGJhY2s6IGZ1bmN0aW9ufVxuICAqIEBwYXJhbSB7Y29udGV4dDogb2JqZWN0fVxuICAqL1xuICBvYnNlcnZlOiBmdW5jdGlvbiBvYnNlcnZlKG5hbWVzcGFjZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgYXJndW1lbnRzIGFyZSBvZiB0aGUgY29ycmVjdCB0eXBlXG4gICAgaWYgKHR5cGVvZiBuYW1lc3BhY2UgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJyB8fCBjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIGEgbmFtZXNwYWNlIGhhcyBub3QgYmVlbiBjcmVhdGVkIGJlZm9yZSB0aGVuIHdlIG5lZWQgdG8gXCJpbml0aWFsaXplXCIgdGhlIG5hbWVzcGFjZVxuICAgIGlmICghdGhpcy5saXN0W25hbWVzcGFjZV0pIHtcbiAgICAgIHRoaXMubGlzdFtuYW1lc3BhY2VdID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5saXN0W25hbWVzcGFjZV0ucHVzaCh7IGNhbGxiYWNrOiBjYWxsYmFjaywgY29udGV4dDogY29udGV4dCB9KTtcbiAgfSxcblxuICAvKlxuICAqIFJlbW92ZSBhbGwgb2JzZXJ2ZXJzIGZyb20gYSBnaXZlbiBuYW1lc3BhY2UuXG4gICpcbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogc3RyaW5nfSBUaGUgbmFtZXNwYWNlIHRvIGNsZWFyLlxuICAqL1xuICBjbGVhckFsbDogZnVuY3Rpb24gY2xlYXJBbGwobmFtZXNwYWNlKSB7XG5cbiAgICBpZiAoIXRoaXMudmVyaWZ5TmFtZXNwYWNlQXJnKG5hbWVzcGFjZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RbbmFtZXNwYWNlXSA9IFtdO1xuICB9LFxuXG4gIC8qXG4gICogTm90aWZ5IGFsbCBjYWxsYmFja3MgdGhhdCBoYXZlIGJlZW4gYm91bmQgdG8gdGhlIGdpdmVuIG5hbWVzcGFjZS5cbiAgKlxuICAqIEBwYXJhbSB7bmFtZXNwYWNlOiBzdHJpbmd9IFRoZSBuYW1lc3BhY2UgdG8gbm90aWZ5IG9ic2VydmVycyBvbi5cbiAgKiBAcGFyYW0ge25hbWVzcGFjZTogdXJsfSBUaGUgdXJsIHRvIG5vdGlmeSBvYnNlcnZlcnMgb24uXG4gICovXG4gIG5vdGlmeTogZnVuY3Rpb24gbm90aWZ5KG5hbWVzcGFjZSkge1xuXG4gICAgLy8gVGhpcyBzdHJpcHMgdGhlIG5hbWVzcGFjZSBmcm9tIHRoZSBsaXN0IG9mIGFyZ3MgYXMgd2UgZG9udCB3YW50IHRvIHBhc3MgdGhhdCBpbnRvIHRoZSBjYWxsYmFjay5cbiAgICB2YXIgYXJndW1lbnRzRm9yQ2FsbGJhY2sgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgaWYgKCF0aGlzLnZlcmlmeU5hbWVzcGFjZUFyZyhuYW1lc3BhY2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gTG9vcCBvdmVyIGFsbCBvZiB0aGUgb2JzZXJ2ZXJzIGFuZCBmaXJlIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIHRoZSBjb250ZXh0LlxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxpc3RbbmFtZXNwYWNlXS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGhpcy5saXN0W25hbWVzcGFjZV1baV0uY2FsbGJhY2suYXBwbHkodGhpcy5saXN0W25hbWVzcGFjZV1baV0uY29udGV4dCwgYXJndW1lbnRzRm9yQ2FsbGJhY2spO1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAqIE5vdGlmeSBvbmx5IHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gY29udGV4dCBhbmQgbmFtZXNwYWNlLlxuICAqXG4gICogQHBhcmFtIHtjb250ZXh0OiBvYmplY3R9IHRoZSBjb250ZXh0IHRvIG1hdGNoIGFnYWluc3QuXG4gICogQHBhcmFtIHtuYW1lc3BhY2U6IHN0cmluZ30gVGhlIG5hbWVzcGFjZSB0byBub3RpZnkgb2JzZXJ2ZXJzIG9uLlxuICAqL1xuICBub3RpZnlPbmx5Rm9yOiBmdW5jdGlvbiBub3RpZnlPbmx5Rm9yKGNvbnRleHQsIG5hbWVzcGFjZSkge1xuXG4gICAgLy8gVGhpcyBzdHJpcHMgdGhlIG5hbWVzcGFjZSBmcm9tIHRoZSBsaXN0IG9mIGFyZ3MgYXMgd2UgZG9udCB3YW50IHRvIHBhc3MgdGhhdCBpbnRvIHRoZSBjYWxsYmFjay5cbiAgICB2YXIgYXJndW1lbnRzRm9yQ2FsbGJhY2sgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuXG4gICAgaWYgKCF0aGlzLnZlcmlmeU5hbWVzcGFjZUFyZyhuYW1lc3BhY2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gTG9vcCBvdmVyIGFsbCBvZiB0aGUgb2JzZXJ2ZXJzIGFuZCBmaXJlIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIHRoZSBjb250ZXh0LlxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxpc3RbbmFtZXNwYWNlXS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMubGlzdFtuYW1lc3BhY2VdW2ldLmNvbnRleHQgPT09IGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5saXN0W25hbWVzcGFjZV1baV0uY2FsbGJhY2suYXBwbHkodGhpcy5saXN0W25hbWVzcGFjZV1baV0uY29udGV4dCwgYXJndW1lbnRzRm9yQ2FsbGJhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKlxuICAqIFZlcmlmaWVzIHRoYXQgdGhlIG5hbWVzcGFjZSBpcyB2YWxpZC5cbiAgKlxuICAqIEBwYXJhbSB7bmFtZXNwYWNlOiBzdHJpbmd9IFRoZSBuYW1lc3BhY2UgdG8gdmVyaWZ5LlxuICAqL1xuICB2ZXJpZnlOYW1lc3BhY2VBcmc6IGZ1bmN0aW9uIHZlcmlmeU5hbWVzcGFjZUFyZyhuYW1lc3BhY2UpIHtcbiAgICBpZiAodHlwZW9mIG5hbWVzcGFjZSAhPT0gJ3N0cmluZycgfHwgIXRoaXMubGlzdFtuYW1lc3BhY2VdKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNvY2tldFNlcnZpY2U7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiXX0=
