(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./IPv6":1,"./SecondLevelDomains":2,"./punycode":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
},{"./helpers/environment-check":10,"./helpers/event-object":11}],6:[function(require,module,exports){
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
},{"./helpers/array-helpers":7}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _socketIo = require('./socket-io');

var _socketIo2 = _interopRequireDefault(_socketIo);

var _helpersEnvironmentCheck = require('./helpers/environment-check');

var _helpersEnvironmentCheck2 = _interopRequireDefault(_helpersEnvironmentCheck);

var globalContext = _helpersEnvironmentCheck2['default'].globalContext;

globalContext.MockServer = _server2['default'];
globalContext.MockWebSocket = _websocket2['default'];
globalContext.MockSocketIO = _socketIo2['default'];

var Server = _server2['default'];
exports.Server = Server;
var WebSocket = _websocket2['default'];
exports.WebSocket = WebSocket;
var SocketIO = _socketIo2['default'];
exports.SocketIO = SocketIO;
},{"./helpers/environment-check":10,"./server":14,"./socket-io":15,"./websocket":16}],13:[function(require,module,exports){
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
},{"./helpers/array-helpers":7}],14:[function(require,module,exports){
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
},{"./event-factory":5,"./event-target":6,"./helpers/close-codes":8,"./network-bridge":13,"./websocket":16,"urijs":3}],15:[function(require,module,exports){
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
},{"./event-factory":5,"./event-target":6,"./helpers/close-codes":8,"./helpers/delay":9,"./network-bridge":13,"urijs":3}],16:[function(require,module,exports){
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
},{"./event-factory":5,"./event-target":6,"./helpers/close-codes":8,"./helpers/delay":9,"./network-bridge":13,"urijs":3}]},{},[12])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdXJpanMvc3JjL0lQdjYuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdXJpanMvc3JjL1NlY29uZExldmVsRG9tYWlucy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy91cmlqcy9zcmMvVVJJLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3VyaWpzL3NyYy9wdW55Y29kZS5qcyIsImV2ZW50LWZhY3RvcnkuanMiLCJldmVudC10YXJnZXQuanMiLCJoZWxwZXJzL2FycmF5LWhlbHBlcnMuanMiLCJoZWxwZXJzL2Nsb3NlLWNvZGVzLmpzIiwiaGVscGVycy9kZWxheS5qcyIsImhlbHBlcnMvZW52aXJvbm1lbnQtY2hlY2suanMiLCJoZWxwZXJzL2V2ZW50LW9iamVjdC5qcyIsIm1haW4uanMiLCJuZXR3b3JrLWJyaWRnZS5qcyIsInNlcnZlci5qcyIsInNvY2tldC1pby5qcyIsIndlYnNvY2tldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDam5FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBVUkkuanMgLSBNdXRhdGluZyBVUkxzXG4gKiBJUHY2IFN1cHBvcnRcbiAqXG4gKiBWZXJzaW9uOiAxLjE3LjBcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5JUHY2ID0gZmFjdG9yeShyb290KTtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAocm9vdCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLypcbiAgdmFyIF9pbiA9IFwiZmU4MDowMDAwOjAwMDA6MDAwMDowMjA0OjYxZmY6ZmU5ZDpmMTU2XCI7XG4gIHZhciBfb3V0ID0gSVB2Ni5iZXN0KF9pbik7XG4gIHZhciBfZXhwZWN0ZWQgPSBcImZlODA6OjIwNDo2MWZmOmZlOWQ6ZjE1NlwiO1xuXG4gIGNvbnNvbGUubG9nKF9pbiwgX291dCwgX2V4cGVjdGVkLCBfb3V0ID09PSBfZXhwZWN0ZWQpO1xuICAqL1xuXG4gIC8vIHNhdmUgY3VycmVudCBJUHY2IHZhcmlhYmxlLCBpZiBhbnlcbiAgdmFyIF9JUHY2ID0gcm9vdCAmJiByb290LklQdjY7XG5cbiAgZnVuY3Rpb24gYmVzdFByZXNlbnRhdGlvbihhZGRyZXNzKSB7XG4gICAgLy8gYmFzZWQgb246XG4gICAgLy8gSmF2YXNjcmlwdCB0byB0ZXN0IGFuIElQdjYgYWRkcmVzcyBmb3IgcHJvcGVyIGZvcm1hdCwgYW5kIHRvXG4gICAgLy8gcHJlc2VudCB0aGUgXCJiZXN0IHRleHQgcmVwcmVzZW50YXRpb25cIiBhY2NvcmRpbmcgdG8gSUVURiBEcmFmdCBSRkMgYXRcbiAgICAvLyBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1pZXRmLTZtYW4tdGV4dC1hZGRyLXJlcHJlc2VudGF0aW9uLTA0XG4gICAgLy8gOCBGZWIgMjAxMCBSaWNoIEJyb3duLCBEYXJ0d2FyZSwgTExDXG4gICAgLy8gUGxlYXNlIGZlZWwgZnJlZSB0byB1c2UgdGhpcyBjb2RlIGFzIGxvbmcgYXMgeW91IHByb3ZpZGUgYSBsaW5rIHRvXG4gICAgLy8gaHR0cDovL3d3dy5pbnRlcm1hcHBlci5jb21cbiAgICAvLyBodHRwOi8vaW50ZXJtYXBwZXIuY29tL3N1cHBvcnQvdG9vbHMvSVBWNi1WYWxpZGF0b3IuYXNweFxuICAgIC8vIGh0dHA6Ly9kb3dubG9hZC5kYXJ0d2FyZS5jb20vdGhpcmRwYXJ0eS9pcHY2dmFsaWRhdG9yLmpzXG5cbiAgICB2YXIgX2FkZHJlc3MgPSBhZGRyZXNzLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIHNlZ21lbnRzID0gX2FkZHJlc3Muc3BsaXQoJzonKTtcbiAgICB2YXIgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuICAgIHZhciB0b3RhbCA9IDg7XG5cbiAgICAvLyB0cmltIGNvbG9ucyAoOjogb3IgOjphOmI6Y+KApiBvciDigKZhOmI6Yzo6KVxuICAgIGlmIChzZWdtZW50c1swXSA9PT0gJycgJiYgc2VnbWVudHNbMV0gPT09ICcnICYmIHNlZ21lbnRzWzJdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4gOjpcbiAgICAgIC8vIHJlbW92ZSBmaXJzdCB0d28gaXRlbXNcbiAgICAgIHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudHNbMF0gPT09ICcnICYmIHNlZ21lbnRzWzFdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4gOjp4eHh4XG4gICAgICAvLyByZW1vdmUgdGhlIGZpcnN0IGl0ZW1cbiAgICAgIHNlZ21lbnRzLnNoaWZ0KCk7XG4gICAgfSBlbHNlIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXSA9PT0gJycgJiYgc2VnbWVudHNbbGVuZ3RoIC0gMl0gPT09ICcnKSB7XG4gICAgICAvLyBtdXN0IGhhdmUgYmVlbiB4eHh4OjpcbiAgICAgIHNlZ21lbnRzLnBvcCgpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIC8vIGFkanVzdCB0b3RhbCBzZWdtZW50cyBmb3IgSVB2NCB0cmFpbGVyXG4gICAgaWYgKHNlZ21lbnRzW2xlbmd0aCAtIDFdLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgIC8vIGZvdW5kIGEgXCIuXCIgd2hpY2ggbWVhbnMgSVB2NFxuICAgICAgdG90YWwgPSA3O1xuICAgIH1cblxuICAgIC8vIGZpbGwgZW1wdHkgc2VnbWVudHMgdGhlbSB3aXRoIFwiMDAwMFwiXG4gICAgdmFyIHBvcztcbiAgICBmb3IgKHBvcyA9IDA7IHBvcyA8IGxlbmd0aDsgcG9zKyspIHtcbiAgICAgIGlmIChzZWdtZW50c1twb3NdID09PSAnJykge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zIDwgdG90YWwpIHtcbiAgICAgIHNlZ21lbnRzLnNwbGljZShwb3MsIDEsICcwMDAwJyk7XG4gICAgICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoIDwgdG90YWwpIHtcbiAgICAgICAgc2VnbWVudHMuc3BsaWNlKHBvcywgMCwgJzAwMDAnKTtcbiAgICAgIH1cblxuICAgICAgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIHN0cmlwIGxlYWRpbmcgemVyb3NcbiAgICB2YXIgX3NlZ21lbnRzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgX3NlZ21lbnRzID0gc2VnbWVudHNbaV0uc3BsaXQoJycpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAzIDsgaisrKSB7XG4gICAgICAgIGlmIChfc2VnbWVudHNbMF0gPT09ICcwJyAmJiBfc2VnbWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIF9zZWdtZW50cy5zcGxpY2UoMCwxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZWdtZW50c1tpXSA9IF9zZWdtZW50cy5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvLyBmaW5kIGxvbmdlc3Qgc2VxdWVuY2Ugb2YgemVyb2VzIGFuZCBjb2FsZXNjZSB0aGVtIGludG8gb25lIHNlZ21lbnRcbiAgICB2YXIgYmVzdCA9IC0xO1xuICAgIHZhciBfYmVzdCA9IDA7XG4gICAgdmFyIF9jdXJyZW50ID0gMDtcbiAgICB2YXIgY3VycmVudCA9IC0xO1xuICAgIHZhciBpbnplcm9lcyA9IGZhbHNlO1xuICAgIC8vIGk7IGFscmVhZHkgZGVjbGFyZWRcblxuICAgIGZvciAoaSA9IDA7IGkgPCB0b3RhbDsgaSsrKSB7XG4gICAgICBpZiAoaW56ZXJvZXMpIHtcbiAgICAgICAgaWYgKHNlZ21lbnRzW2ldID09PSAnMCcpIHtcbiAgICAgICAgICBfY3VycmVudCArPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluemVyb2VzID0gZmFsc2U7XG4gICAgICAgICAgaWYgKF9jdXJyZW50ID4gX2Jlc3QpIHtcbiAgICAgICAgICAgIGJlc3QgPSBjdXJyZW50O1xuICAgICAgICAgICAgX2Jlc3QgPSBfY3VycmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzZWdtZW50c1tpXSA9PT0gJzAnKSB7XG4gICAgICAgICAgaW56ZXJvZXMgPSB0cnVlO1xuICAgICAgICAgIGN1cnJlbnQgPSBpO1xuICAgICAgICAgIF9jdXJyZW50ID0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChfY3VycmVudCA+IF9iZXN0KSB7XG4gICAgICBiZXN0ID0gY3VycmVudDtcbiAgICAgIF9iZXN0ID0gX2N1cnJlbnQ7XG4gICAgfVxuXG4gICAgaWYgKF9iZXN0ID4gMSkge1xuICAgICAgc2VnbWVudHMuc3BsaWNlKGJlc3QsIF9iZXN0LCAnJyk7XG4gICAgfVxuXG4gICAgbGVuZ3RoID0gc2VnbWVudHMubGVuZ3RoO1xuXG4gICAgLy8gYXNzZW1ibGUgcmVtYWluaW5nIHNlZ21lbnRzXG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIGlmIChzZWdtZW50c1swXSA9PT0gJycpICB7XG4gICAgICByZXN1bHQgPSAnOic7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gc2VnbWVudHNbaV07XG4gICAgICBpZiAoaSA9PT0gbGVuZ3RoIC0gMSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmVzdWx0ICs9ICc6JztcbiAgICB9XG5cbiAgICBpZiAoc2VnbWVudHNbbGVuZ3RoIC0gMV0gPT09ICcnKSB7XG4gICAgICByZXN1bHQgKz0gJzonO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBub0NvbmZsaWN0KCkge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSAqL1xuICAgIGlmIChyb290LklQdjYgPT09IHRoaXMpIHtcbiAgICAgIHJvb3QuSVB2NiA9IF9JUHY2O1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJlc3Q6IGJlc3RQcmVzZW50YXRpb24sXG4gICAgbm9Db25mbGljdDogbm9Db25mbGljdFxuICB9O1xufSkpO1xuIiwiLyohXG4gKiBVUkkuanMgLSBNdXRhdGluZyBVUkxzXG4gKiBTZWNvbmQgTGV2ZWwgRG9tYWluIChTTEQpIFN1cHBvcnRcbiAqXG4gKiBWZXJzaW9uOiAxLjE3LjBcbiAqXG4gKiBBdXRob3I6IFJvZG5leSBSZWhtXG4gKiBXZWI6IGh0dHA6Ly9tZWRpYWxpemUuZ2l0aHViLmlvL1VSSS5qcy9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlclxuICogICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlXG4gKiAgIEdQTCB2MyBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvR1BMLTMuMFxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPSBmYWN0b3J5KHJvb3QpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uIChyb290KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBzYXZlIGN1cnJlbnQgU2Vjb25kTGV2ZWxEb21haW5zIHZhcmlhYmxlLCBpZiBhbnlcbiAgdmFyIF9TZWNvbmRMZXZlbERvbWFpbnMgPSByb290ICYmIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zO1xuXG4gIHZhciBTTEQgPSB7XG4gICAgLy8gbGlzdCBvZiBrbm93biBTZWNvbmQgTGV2ZWwgRG9tYWluc1xuICAgIC8vIGNvbnZlcnRlZCBsaXN0IG9mIFNMRHMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZ2F2aW5nbWlsbGVyL3NlY29uZC1sZXZlbC1kb21haW5zXG4gICAgLy8gLS0tLVxuICAgIC8vIHB1YmxpY3N1ZmZpeC5vcmcgaXMgbW9yZSBjdXJyZW50IGFuZCBhY3R1YWxseSB1c2VkIGJ5IGEgY291cGxlIG9mIGJyb3dzZXJzIGludGVybmFsbHkuXG4gICAgLy8gZG93bnNpZGUgaXMgaXQgYWxzbyBjb250YWlucyBkb21haW5zIGxpa2UgXCJkeW5kbnMub3JnXCIgLSB3aGljaCBpcyBmaW5lIGZvciB0aGUgc2VjdXJpdHlcbiAgICAvLyBpc3N1ZXMgYnJvd3NlciBoYXZlIHRvIGRlYWwgd2l0aCAoU09QIGZvciBjb29raWVzLCBldGMpIC0gYnV0IGlzIHdheSBvdmVyYm9hcmQgZm9yIFVSSS5qc1xuICAgIC8vIC0tLS1cbiAgICBsaXN0OiB7XG4gICAgICAnYWMnOicgY29tIGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2FlJzonIGFjIGNvIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHBybyBzY2ggJyxcbiAgICAgICdhZic6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnYWwnOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdhbyc6JyBjbyBlZCBndiBpdCBvZyBwYiAnLFxuICAgICAgJ2FyJzonIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHVyICcsXG4gICAgICAnYXQnOicgYWMgY28gZ3Ygb3IgJyxcbiAgICAgICdhdSc6JyBhc24gY29tIGNzaXJvIGVkdSBnb3YgaWQgbmV0IG9yZyAnLFxuICAgICAgJ2JhJzonIGNvIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIHJzIHVuYmkgdW5tbyB1bnNhIHVudHogdW56ZSAnLFxuICAgICAgJ2JiJzonIGJpeiBjbyBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgc3RvcmUgdHYgJyxcbiAgICAgICdiaCc6JyBiaXogY2MgY29tIGVkdSBnb3YgaW5mbyBuZXQgb3JnICcsXG4gICAgICAnYm4nOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2JvJzonIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHYgJyxcbiAgICAgICdicic6JyBhZG0gYWR2IGFnciBhbSBhcnEgYXJ0IGF0byBiIGJpbyBibG9nIGJtZCBjaW0gY25nIGNudCBjb20gY29vcCBlY24gZWR1IGVuZyBlc3AgZXRjIGV0aSBmYXIgZmxvZyBmbSBmbmQgZm90IGZzdCBnMTIgZ2dmIGdvdiBpbWIgaW5kIGluZiBqb3IganVzIGxlbCBtYXQgbWVkIG1pbCBtdXMgbmV0IG5vbSBub3QgbnRyIG9kbyBvcmcgcHBnIHBybyBwc2MgcHNpIHFzbCByZWMgc2xnIHNydiB0bXAgdHJkIHR1ciB0diB2ZXQgdmxvZyB3aWtpIHpsZyAnLFxuICAgICAgJ2JzJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdieic6JyBkdSBldCBvbSBvdiByZyAnLFxuICAgICAgJ2NhJzonIGFiIGJjIG1iIG5iIG5mIG5sIG5zIG50IG51IG9uIHBlIHFjIHNrIHlrICcsXG4gICAgICAnY2snOicgYml6IGNvIGVkdSBnZW4gZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ2NuJzonIGFjIGFoIGJqIGNvbSBjcSBlZHUgZmogZ2QgZ292IGdzIGd4IGd6IGhhIGhiIGhlIGhpIGhsIGhuIGpsIGpzIGp4IGxuIG1pbCBuZXQgbm0gbnggb3JnIHFoIHNjIHNkIHNoIHNuIHN4IHRqIHR3IHhqIHh6IHluIHpqICcsXG4gICAgICAnY28nOicgY29tIGVkdSBnb3YgbWlsIG5ldCBub20gb3JnICcsXG4gICAgICAnY3InOicgYWMgYyBjbyBlZCBmaSBnbyBvciBzYSAnLFxuICAgICAgJ2N5JzonIGFjIGJpeiBjb20gZWtsb2dlcyBnb3YgbHRkIG5hbWUgbmV0IG9yZyBwYXJsaWFtZW50IHByZXNzIHBybyB0bSAnLFxuICAgICAgJ2RvJzonIGFydCBjb20gZWR1IGdvYiBnb3YgbWlsIG5ldCBvcmcgc2xkIHdlYiAnLFxuICAgICAgJ2R6JzonIGFydCBhc3NvIGNvbSBlZHUgZ292IG5ldCBvcmcgcG9sICcsXG4gICAgICAnZWMnOicgY29tIGVkdSBmaW4gZ292IGluZm8gbWVkIG1pbCBuZXQgb3JnIHBybyAnLFxuICAgICAgJ2VnJzonIGNvbSBlZHUgZXVuIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaSAnLFxuICAgICAgJ2VyJzonIGNvbSBlZHUgZ292IGluZCBtaWwgbmV0IG9yZyByb2NoZXN0IHcgJyxcbiAgICAgICdlcyc6JyBjb20gZWR1IGdvYiBub20gb3JnICcsXG4gICAgICAnZXQnOicgYml6IGNvbSBlZHUgZ292IGluZm8gbmFtZSBuZXQgb3JnICcsXG4gICAgICAnZmonOicgYWMgYml6IGNvbSBpbmZvIG1pbCBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnZmsnOicgYWMgY28gZ292IG5ldCBub20gb3JnICcsXG4gICAgICAnZnInOicgYXNzbyBjb20gZiBnb3V2IG5vbSBwcmQgcHJlc3NlIHRtICcsXG4gICAgICAnZ2cnOicgY28gbmV0IG9yZyAnLFxuICAgICAgJ2doJzonIGNvbSBlZHUgZ292IG1pbCBvcmcgJyxcbiAgICAgICdnbic6JyBhYyBjb20gZ292IG5ldCBvcmcgJyxcbiAgICAgICdncic6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2d0JzonIGNvbSBlZHUgZ29iIGluZCBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2d1JzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdoayc6JyBjb20gZWR1IGdvdiBpZHYgbmV0IG9yZyAnLFxuICAgICAgJ2h1JzonIDIwMDAgYWdyYXIgYm9sdCBjYXNpbm8gY2l0eSBjbyBlcm90aWNhIGVyb3Rpa2EgZmlsbSBmb3J1bSBnYW1lcyBob3RlbCBpbmZvIGluZ2F0bGFuIGpvZ2FzeiBrb255dmVsbyBsYWthcyBtZWRpYSBuZXdzIG9yZyBwcml2IHJla2xhbSBzZXggc2hvcCBzcG9ydCBzdWxpIHN6ZXggdG0gdG96c2RlIHV0YXphcyB2aWRlbyAnLFxuICAgICAgJ2lkJzonIGFjIGNvIGdvIG1pbCBuZXQgb3Igc2NoIHdlYiAnLFxuICAgICAgJ2lsJzonIGFjIGNvIGdvdiBpZGYgazEyIG11bmkgbmV0IG9yZyAnLFxuICAgICAgJ2luJzonIGFjIGNvIGVkdSBlcm5ldCBmaXJtIGdlbiBnb3YgaSBpbmQgbWlsIG5ldCBuaWMgb3JnIHJlcyAnLFxuICAgICAgJ2lxJzonIGNvbSBlZHUgZ292IGkgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdpcic6JyBhYyBjbyBkbnNzZWMgZ292IGkgaWQgbmV0IG9yZyBzY2ggJyxcbiAgICAgICdpdCc6JyBlZHUgZ292ICcsXG4gICAgICAnamUnOicgY28gbmV0IG9yZyAnLFxuICAgICAgJ2pvJzonIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoICcsXG4gICAgICAnanAnOicgYWMgYWQgY28gZWQgZ28gZ3IgbGcgbmUgb3IgJyxcbiAgICAgICdrZSc6JyBhYyBjbyBnbyBpbmZvIG1lIG1vYmkgbmUgb3Igc2MgJyxcbiAgICAgICdraCc6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBwZXIgJyxcbiAgICAgICdraSc6JyBiaXogY29tIGRlIGVkdSBnb3YgaW5mbyBtb2IgbmV0IG9yZyB0ZWwgJyxcbiAgICAgICdrbSc6JyBhc3NvIGNvbSBjb29wIGVkdSBnb3V2IGsgbWVkZWNpbiBtaWwgbm9tIG5vdGFpcmVzIHBoYXJtYWNpZW5zIHByZXNzZSB0bSB2ZXRlcmluYWlyZSAnLFxuICAgICAgJ2tuJzonIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2tyJzonIGFjIGJ1c2FuIGNodW5nYnVrIGNodW5nbmFtIGNvIGRhZWd1IGRhZWplb24gZXMgZ2FuZ3dvbiBnbyBnd2FuZ2p1IGd5ZW9uZ2J1ayBneWVvbmdnaSBneWVvbmduYW0gaHMgaW5jaGVvbiBqZWp1IGplb25idWsgamVvbm5hbSBrIGtnIG1pbCBtcyBuZSBvciBwZSByZSBzYyBzZW91bCB1bHNhbiAnLFxuICAgICAgJ2t3JzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdreSc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAna3onOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdsYic6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbGsnOicgYXNzbiBjb20gZWR1IGdvdiBncnAgaG90ZWwgaW50IGx0ZCBuZXQgbmdvIG9yZyBzY2ggc29jIHdlYiAnLFxuICAgICAgJ2xyJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdsdic6JyBhc24gY29tIGNvbmYgZWR1IGdvdiBpZCBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2x5JzonIGNvbSBlZHUgZ292IGlkIG1lZCBuZXQgb3JnIHBsYyBzY2ggJyxcbiAgICAgICdtYSc6JyBhYyBjbyBnb3YgbSBuZXQgb3JnIHByZXNzICcsXG4gICAgICAnbWMnOicgYXNzbyB0bSAnLFxuICAgICAgJ21lJzonIGFjIGNvIGVkdSBnb3YgaXRzIG5ldCBvcmcgcHJpdiAnLFxuICAgICAgJ21nJzonIGNvbSBlZHUgZ292IG1pbCBub20gb3JnIHByZCB0bSAnLFxuICAgICAgJ21rJzonIGNvbSBlZHUgZ292IGluZiBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnbWwnOicgY29tIGVkdSBnb3YgbmV0IG9yZyBwcmVzc2UgJyxcbiAgICAgICdtbic6JyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ21vJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdtdCc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbXYnOicgYWVybyBiaXogY29tIGNvb3AgZWR1IGdvdiBpbmZvIGludCBtaWwgbXVzZXVtIG5hbWUgbmV0IG9yZyBwcm8gJyxcbiAgICAgICdtdyc6JyBhYyBjbyBjb20gY29vcCBlZHUgZ292IGludCBtdXNldW0gbmV0IG9yZyAnLFxuICAgICAgJ214JzonIGNvbSBlZHUgZ29iIG5ldCBvcmcgJyxcbiAgICAgICdteSc6JyBjb20gZWR1IGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ25mJzonIGFydHMgY29tIGZpcm0gaW5mbyBuZXQgb3RoZXIgcGVyIHJlYyBzdG9yZSB3ZWIgJyxcbiAgICAgICduZyc6JyBiaXogY29tIGVkdSBnb3YgbWlsIG1vYmkgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ25pJzonIGFjIGNvIGNvbSBlZHUgZ29iIG1pbCBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ25wJzonIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnbnInOicgYml6IGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ29tJzonIGFjIGJpeiBjbyBjb20gZWR1IGdvdiBtZWQgbWlsIG11c2V1bSBuZXQgb3JnIHBybyBzY2ggJyxcbiAgICAgICdwZSc6JyBjb20gZWR1IGdvYiBtaWwgbmV0IG5vbSBvcmcgc2xkICcsXG4gICAgICAncGgnOicgY29tIGVkdSBnb3YgaSBtaWwgbmV0IG5nbyBvcmcgJyxcbiAgICAgICdwayc6JyBiaXogY29tIGVkdSBmYW0gZ29iIGdvayBnb24gZ29wIGdvcyBnb3YgbmV0IG9yZyB3ZWIgJyxcbiAgICAgICdwbCc6JyBhcnQgYmlhbHlzdG9rIGJpeiBjb20gZWR1IGdkYSBnZGFuc2sgZ29yem93IGdvdiBpbmZvIGthdG93aWNlIGtyYWtvdyBsb2R6IGx1YmxpbiBtaWwgbmV0IG5nbyBvbHN6dHluIG9yZyBwb3puYW4gcHdyIHJhZG9tIHNsdXBzayBzemN6ZWNpbiB0b3J1biB3YXJzemF3YSB3YXcgd3JvYyB3cm9jbGF3IHpnb3JhICcsXG4gICAgICAncHInOicgYWMgYml6IGNvbSBlZHUgZXN0IGdvdiBpbmZvIGlzbGEgbmFtZSBuZXQgb3JnIHBybyBwcm9mICcsXG4gICAgICAncHMnOicgY29tIGVkdSBnb3YgbmV0IG9yZyBwbG8gc2VjICcsXG4gICAgICAncHcnOicgYmVsYXUgY28gZWQgZ28gbmUgb3IgJyxcbiAgICAgICdybyc6JyBhcnRzIGNvbSBmaXJtIGluZm8gbm9tIG50IG9yZyByZWMgc3RvcmUgdG0gd3d3ICcsXG4gICAgICAncnMnOicgYWMgY28gZWR1IGdvdiBpbiBvcmcgJyxcbiAgICAgICdzYic6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnc2MnOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3NoJzonIGNvIGNvbSBlZHUgZ292IG5ldCBub20gb3JnICcsXG4gICAgICAnc2wnOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3N0JzonIGNvIGNvbSBjb25zdWxhZG8gZWR1IGVtYmFpeGFkYSBnb3YgbWlsIG5ldCBvcmcgcHJpbmNpcGUgc2FvdG9tZSBzdG9yZSAnLFxuICAgICAgJ3N2JzonIGNvbSBlZHUgZ29iIG9yZyByZWQgJyxcbiAgICAgICdzeic6JyBhYyBjbyBvcmcgJyxcbiAgICAgICd0cic6JyBhdiBiYnMgYmVsIGJpeiBjb20gZHIgZWR1IGdlbiBnb3YgaW5mbyBrMTIgbmFtZSBuZXQgb3JnIHBvbCB0ZWwgdHNrIHR2IHdlYiAnLFxuICAgICAgJ3R0JzonIGFlcm8gYml6IGNhdCBjbyBjb20gY29vcCBlZHUgZ292IGluZm8gaW50IGpvYnMgbWlsIG1vYmkgbXVzZXVtIG5hbWUgbmV0IG9yZyBwcm8gdGVsIHRyYXZlbCAnLFxuICAgICAgJ3R3JzonIGNsdWIgY29tIGViaXogZWR1IGdhbWUgZ292IGlkdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ211JzonIGFjIGNvIGNvbSBnb3YgbmV0IG9yIG9yZyAnLFxuICAgICAgJ216JzonIGFjIGNvIGVkdSBnb3Ygb3JnICcsXG4gICAgICAnbmEnOicgY28gY29tICcsXG4gICAgICAnbnonOicgYWMgY28gY3JpIGdlZWsgZ2VuIGdvdnQgaGVhbHRoIGl3aSBtYW9yaSBtaWwgbmV0IG9yZyBwYXJsaWFtZW50IHNjaG9vbCAnLFxuICAgICAgJ3BhJzonIGFibyBhYyBjb20gZWR1IGdvYiBpbmcgbWVkIG5ldCBub20gb3JnIHNsZCAnLFxuICAgICAgJ3B0JzonIGNvbSBlZHUgZ292IGludCBuZXQgbm9tZSBvcmcgcHVibCAnLFxuICAgICAgJ3B5JzonIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAncWEnOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdyZSc6JyBhc3NvIGNvbSBub20gJyxcbiAgICAgICdydSc6JyBhYyBhZHlnZXlhIGFsdGFpIGFtdXIgYXJraGFuZ2Vsc2sgYXN0cmFraGFuIGJhc2hraXJpYSBiZWxnb3JvZCBiaXIgYnJ5YW5zayBidXJ5YXRpYSBjYmcgY2hlbCBjaGVseWFiaW5zayBjaGl0YSBjaHVrb3RrYSBjaHV2YXNoaWEgY29tIGRhZ2VzdGFuIGUtYnVyZyBlZHUgZ292IGdyb3pueSBpbnQgaXJrdXRzayBpdmFub3ZvIGl6aGV2c2sgamFyIGpvc2hrYXItb2xhIGthbG15a2lhIGthbHVnYSBrYW1jaGF0a2Ega2FyZWxpYSBrYXphbiBrY2hyIGtlbWVyb3ZvIGtoYWJhcm92c2sga2hha2Fzc2lhIGtodiBraXJvdiBrb2VuaWcga29taSBrb3N0cm9tYSBrcmFub3lhcnNrIGt1YmFuIGt1cmdhbiBrdXJzayBsaXBldHNrIG1hZ2FkYW4gbWFyaSBtYXJpLWVsIG1hcmluZSBtaWwgbW9yZG92aWEgbW9zcmVnIG1zayBtdXJtYW5zayBuYWxjaGlrIG5ldCBubm92IG5vdiBub3Zvc2liaXJzayBuc2sgb21zayBvcmVuYnVyZyBvcmcgb3J5b2wgcGVuemEgcGVybSBwcCBwc2tvdiBwdHogcm5kIHJ5YXphbiBzYWtoYWxpbiBzYW1hcmEgc2FyYXRvdiBzaW1iaXJzayBzbW9sZW5zayBzcGIgc3RhdnJvcG9sIHN0diBzdXJndXQgdGFtYm92IHRhdGFyc3RhbiB0b20gdG9tc2sgdHNhcml0c3luIHRzayB0dWxhIHR1dmEgdHZlciB0eXVtZW4gdWRtIHVkbXVydGlhIHVsYW4tdWRlIHZsYWRpa2F2a2F6IHZsYWRpbWlyIHZsYWRpdm9zdG9rIHZvbGdvZ3JhZCB2b2xvZ2RhIHZvcm9uZXpoIHZybiB2eWF0a2EgeWFrdXRpYSB5YW1hbCB5ZWthdGVyaW5idXJnIHl1emhuby1zYWtoYWxpbnNrICcsXG4gICAgICAncncnOicgYWMgY28gY29tIGVkdSBnb3V2IGdvdiBpbnQgbWlsIG5ldCAnLFxuICAgICAgJ3NhJzonIGNvbSBlZHUgZ292IG1lZCBuZXQgb3JnIHB1YiBzY2ggJyxcbiAgICAgICdzZCc6JyBjb20gZWR1IGdvdiBpbmZvIG1lZCBuZXQgb3JnIHR2ICcsXG4gICAgICAnc2UnOicgYSBhYyBiIGJkIGMgZCBlIGYgZyBoIGkgayBsIG0gbiBvIG9yZyBwIHBhcnRpIHBwIHByZXNzIHIgcyB0IHRtIHUgdyB4IHkgeiAnLFxuICAgICAgJ3NnJzonIGNvbSBlZHUgZ292IGlkbiBuZXQgb3JnIHBlciAnLFxuICAgICAgJ3NuJzonIGFydCBjb20gZWR1IGdvdXYgb3JnIHBlcnNvIHVuaXYgJyxcbiAgICAgICdzeSc6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG5ld3Mgb3JnICcsXG4gICAgICAndGgnOicgYWMgY28gZ28gaW4gbWkgbmV0IG9yICcsXG4gICAgICAndGonOicgYWMgYml6IGNvIGNvbSBlZHUgZ28gZ292IGluZm8gaW50IG1pbCBuYW1lIG5ldCBuaWMgb3JnIHRlc3Qgd2ViICcsXG4gICAgICAndG4nOicgYWdyaW5ldCBjb20gZGVmZW5zZSBlZHVuZXQgZW5zIGZpbiBnb3YgaW5kIGluZm8gaW50bCBtaW5jb20gbmF0IG5ldCBvcmcgcGVyc28gcm5ydCBybnMgcm51IHRvdXJpc20gJyxcbiAgICAgICd0eic6JyBhYyBjbyBnbyBuZSBvciAnLFxuICAgICAgJ3VhJzonIGJpeiBjaGVya2Fzc3kgY2hlcm5pZ292IGNoZXJub3Z0c3kgY2sgY24gY28gY29tIGNyaW1lYSBjdiBkbiBkbmVwcm9wZXRyb3ZzayBkb25ldHNrIGRwIGVkdSBnb3YgaWYgaW4gaXZhbm8tZnJhbmtpdnNrIGtoIGtoYXJrb3Yga2hlcnNvbiBraG1lbG5pdHNraXkga2lldiBraXJvdm9ncmFkIGttIGtyIGtzIGt2IGxnIGx1Z2Fuc2sgbHV0c2sgbHZpdiBtZSBtayBuZXQgbmlrb2xhZXYgb2Qgb2Rlc3NhIG9yZyBwbCBwb2x0YXZhIHBwIHJvdm5vIHJ2IHNlYmFzdG9wb2wgc3VteSB0ZSB0ZXJub3BpbCB1emhnb3JvZCB2aW5uaWNhIHZuIHphcG9yaXpoemhlIHpoaXRvbWlyIHpwIHp0ICcsXG4gICAgICAndWcnOicgYWMgY28gZ28gbmUgb3Igb3JnIHNjICcsXG4gICAgICAndWsnOicgYWMgYmwgYnJpdGlzaC1saWJyYXJ5IGNvIGN5bSBnb3YgZ292dCBpY25ldCBqZXQgbGVhIGx0ZCBtZSBtaWwgbW9kIG5hdGlvbmFsLWxpYnJhcnktc2NvdGxhbmQgbmVsIG5ldCBuaHMgbmljIG5scyBvcmcgb3JnbiBwYXJsaWFtZW50IHBsYyBwb2xpY2Ugc2NoIHNjb3Qgc29jICcsXG4gICAgICAndXMnOicgZG5pIGZlZCBpc2Ega2lkcyBuc24gJyxcbiAgICAgICd1eSc6JyBjb20gZWR1IGd1YiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ3ZlJzonIGNvIGNvbSBlZHUgZ29iIGluZm8gbWlsIG5ldCBvcmcgd2ViICcsXG4gICAgICAndmknOicgY28gY29tIGsxMiBuZXQgb3JnICcsXG4gICAgICAndm4nOicgYWMgYml6IGNvbSBlZHUgZ292IGhlYWx0aCBpbmZvIGludCBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAneWUnOicgY28gY29tIGdvdiBsdGQgbWUgbmV0IG9yZyBwbGMgJyxcbiAgICAgICd5dSc6JyBhYyBjbyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ3phJzonIGFjIGFncmljIGFsdCBib3Vyc2UgY2l0eSBjbyBjeWJlcm5ldCBkYiBlZHUgZ292IGdyb25kYXIgaWFjY2VzcyBpbXQgaW5jYSBsYW5kZXNpZ24gbGF3IG1pbCBuZXQgbmdvIG5pcyBub20gb2xpdmV0dGkgb3JnIHBpeCBzY2hvb2wgdG0gd2ViICcsXG4gICAgICAnem0nOicgYWMgY28gY29tIGVkdSBnb3YgbmV0IG9yZyBzY2ggJ1xuICAgIH0sXG4gICAgLy8gZ29yaGlsbCAyMDEzLTEwLTI1OiBVc2luZyBpbmRleE9mKCkgaW5zdGVhZCBSZWdleHAoKS4gU2lnbmlmaWNhbnQgYm9vc3RcbiAgICAvLyBpbiBib3RoIHBlcmZvcm1hbmNlIGFuZCBtZW1vcnkgZm9vdHByaW50LiBObyBpbml0aWFsaXphdGlvbiByZXF1aXJlZC5cbiAgICAvLyBodHRwOi8vanNwZXJmLmNvbS91cmktanMtc2xkLXJlZ2V4LXZzLWJpbmFyeS1zZWFyY2gvNFxuICAgIC8vIEZvbGxvd2luZyBtZXRob2RzIHVzZSBsYXN0SW5kZXhPZigpIHJhdGhlciB0aGFuIGFycmF5LnNwbGl0KCkgaW4gb3JkZXJcbiAgICAvLyB0byBhdm9pZCBhbnkgbWVtb3J5IGFsbG9jYXRpb25zLlxuICAgIGhhczogZnVuY3Rpb24oZG9tYWluKSB7XG4gICAgICB2YXIgdGxkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICBpZiAodGxkT2Zmc2V0IDw9IDAgfHwgdGxkT2Zmc2V0ID49IChkb21haW4ubGVuZ3RoLTEpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQtMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0IDw9IDAgfHwgc2xkT2Zmc2V0ID49ICh0bGRPZmZzZXQtMSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZExpc3QgPSBTTEQubGlzdFtkb21haW4uc2xpY2UodGxkT2Zmc2V0KzEpXTtcbiAgICAgIGlmICghc2xkTGlzdCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xkTGlzdC5pbmRleE9mKCcgJyArIGRvbWFpbi5zbGljZShzbGRPZmZzZXQrMSwgdGxkT2Zmc2V0KSArICcgJykgPj0gMDtcbiAgICB9LFxuICAgIGlzOiBmdW5jdGlvbihkb21haW4pIHtcbiAgICAgIHZhciB0bGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIGlmICh0bGRPZmZzZXQgPD0gMCB8fCB0bGRPZmZzZXQgPj0gKGRvbWFpbi5sZW5ndGgtMSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicsIHRsZE9mZnNldC0xKTtcbiAgICAgIGlmIChzbGRPZmZzZXQgPj0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgc2xkTGlzdCA9IFNMRC5saXN0W2RvbWFpbi5zbGljZSh0bGRPZmZzZXQrMSldO1xuICAgICAgaWYgKCFzbGRMaXN0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbGRMaXN0LmluZGV4T2YoJyAnICsgZG9tYWluLnNsaWNlKDAsIHRsZE9mZnNldCkgKyAnICcpID49IDA7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGRvbWFpbikge1xuICAgICAgdmFyIHRsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicpO1xuICAgICAgaWYgKHRsZE9mZnNldCA8PSAwIHx8IHRsZE9mZnNldCA+PSAoZG9tYWluLmxlbmd0aC0xKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQtMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0IDw9IDAgfHwgc2xkT2Zmc2V0ID49ICh0bGRPZmZzZXQtMSkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgc2xkTGlzdCA9IFNMRC5saXN0W2RvbWFpbi5zbGljZSh0bGRPZmZzZXQrMSldO1xuICAgICAgaWYgKCFzbGRMaXN0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHNsZExpc3QuaW5kZXhPZignICcgKyBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0KzEsIHRsZE9mZnNldCkgKyAnICcpIDwgMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0KzEpO1xuICAgIH0sXG4gICAgbm9Db25mbGljdDogZnVuY3Rpb24oKXtcbiAgICAgIGlmIChyb290LlNlY29uZExldmVsRG9tYWlucyA9PT0gdGhpcykge1xuICAgICAgICByb290LlNlY29uZExldmVsRG9tYWlucyA9IF9TZWNvbmRMZXZlbERvbWFpbnM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFNMRDtcbn0pKTtcbiIsIi8qIVxuICogVVJJLmpzIC0gTXV0YXRpbmcgVVJMc1xuICpcbiAqIFZlcnNpb246IDEuMTcuMFxuICpcbiAqIEF1dGhvcjogUm9kbmV5IFJlaG1cbiAqIFdlYjogaHR0cDovL21lZGlhbGl6ZS5naXRodWIuaW8vVVJJLmpzL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyXG4gKiAgIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2VcbiAqICAgR1BMIHYzIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9HUEwtMy4wXG4gKlxuICovXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnLi9wdW55Y29kZScpLCByZXF1aXJlKCcuL0lQdjYnKSwgcmVxdWlyZSgnLi9TZWNvbmRMZXZlbERvbWFpbnMnKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShbJy4vcHVueWNvZGUnLCAnLi9JUHY2JywgJy4vU2Vjb25kTGV2ZWxEb21haW5zJ10sIGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5VUkkgPSBmYWN0b3J5KHJvb3QucHVueWNvZGUsIHJvb3QuSVB2Niwgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMsIHJvb3QpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uIChwdW55Y29kZSwgSVB2NiwgU0xELCByb290KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLypnbG9iYWwgbG9jYXRpb24sIGVzY2FwZSwgdW5lc2NhcGUgKi9cbiAgLy8gRklYTUU6IHYyLjAuMCByZW5hbWNlIG5vbi1jYW1lbENhc2UgcHJvcGVydGllcyB0byB1cHBlcmNhc2VcbiAgLypqc2hpbnQgY2FtZWxjYXNlOiBmYWxzZSAqL1xuXG4gIC8vIHNhdmUgY3VycmVudCBVUkkgdmFyaWFibGUsIGlmIGFueVxuICB2YXIgX1VSSSA9IHJvb3QgJiYgcm9vdC5VUkk7XG5cbiAgZnVuY3Rpb24gVVJJKHVybCwgYmFzZSkge1xuICAgIHZhciBfdXJsU3VwcGxpZWQgPSBhcmd1bWVudHMubGVuZ3RoID49IDE7XG4gICAgdmFyIF9iYXNlU3VwcGxpZWQgPSBhcmd1bWVudHMubGVuZ3RoID49IDI7XG5cbiAgICAvLyBBbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgdGhlICduZXcnIGtleXdvcmRcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVVJJKSkge1xuICAgICAgaWYgKF91cmxTdXBwbGllZCkge1xuICAgICAgICBpZiAoX2Jhc2VTdXBwbGllZCkge1xuICAgICAgICAgIHJldHVybiBuZXcgVVJJKHVybCwgYmFzZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFVSSSh1cmwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFVSSSgpO1xuICAgIH1cblxuICAgIGlmICh1cmwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKF91cmxTdXBwbGllZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd1bmRlZmluZWQgaXMgbm90IGEgdmFsaWQgYXJndW1lbnQgZm9yIFVSSScpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGxvY2F0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB1cmwgPSBsb2NhdGlvbi5ocmVmICsgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmwgPSAnJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmhyZWYodXJsKTtcblxuICAgIC8vIHJlc29sdmUgdG8gYmFzZSBhY2NvcmRpbmcgdG8gaHR0cDovL2R2Y3MudzMub3JnL2hnL3VybC9yYXctZmlsZS90aXAvT3ZlcnZpZXcuaHRtbCNjb25zdHJ1Y3RvclxuICAgIGlmIChiYXNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmFic29sdXRlVG8oYmFzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBVUkkudmVyc2lvbiA9ICcxLjE3LjAnO1xuXG4gIHZhciBwID0gVVJJLnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbiAgZnVuY3Rpb24gZXNjYXBlUmVnRXgoc3RyaW5nKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvY29tbWl0Lzg1YWMyMTc4M2MxMWY4Y2NhYjA2MTA2ZGJhOTczNWEzMWE4NjkyNGQjY29tbWl0Y29tbWVudC04MjE5NjNcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbLiorP149IToke30oKXxbXFxdXFwvXFxcXF0pL2csICdcXFxcJDEnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFR5cGUodmFsdWUpIHtcbiAgICAvLyBJRTggZG9lc24ndCByZXR1cm4gW09iamVjdCBVbmRlZmluZWRdIGJ1dCBbT2JqZWN0IE9iamVjdF0gZm9yIHVuZGVmaW5lZCB2YWx1ZVxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ1VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0cmluZyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpKS5zbGljZSg4LCAtMSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xuICAgIHJldHVybiBnZXRUeXBlKG9iaikgPT09ICdBcnJheSc7XG4gIH1cblxuICBmdW5jdGlvbiBmaWx0ZXJBcnJheVZhbHVlcyhkYXRhLCB2YWx1ZSkge1xuICAgIHZhciBsb29rdXAgPSB7fTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuXG4gICAgaWYgKGdldFR5cGUodmFsdWUpID09PSAnUmVnRXhwJykge1xuICAgICAgbG9va3VwID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBsb29rdXBbdmFsdWVbaV1dID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbG9va3VwW3ZhbHVlXSA9IHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMCwgbGVuZ3RoID0gZGF0YS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgLypqc2hpbnQgbGF4YnJlYWs6IHRydWUgKi9cbiAgICAgIHZhciBfbWF0Y2ggPSBsb29rdXAgJiYgbG9va3VwW2RhdGFbaV1dICE9PSB1bmRlZmluZWRcbiAgICAgICAgfHwgIWxvb2t1cCAmJiB2YWx1ZS50ZXN0KGRhdGFbaV0pO1xuICAgICAgLypqc2hpbnQgbGF4YnJlYWs6IGZhbHNlICovXG4gICAgICBpZiAoX21hdGNoKSB7XG4gICAgICAgIGRhdGEuc3BsaWNlKGksIDEpO1xuICAgICAgICBsZW5ndGgtLTtcbiAgICAgICAgaS0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlDb250YWlucyhsaXN0LCB2YWx1ZSkge1xuICAgIHZhciBpLCBsZW5ndGg7XG5cbiAgICAvLyB2YWx1ZSBtYXkgYmUgc3RyaW5nLCBudW1iZXIsIGFycmF5LCByZWdleHBcbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIC8vIE5vdGU6IHRoaXMgY2FuIGJlIG9wdGltaXplZCB0byBPKG4pIChpbnN0ZWFkIG9mIGN1cnJlbnQgTyhtICogbikpXG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIWFycmF5Q29udGFpbnMobGlzdCwgdmFsdWVbaV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBfdHlwZSA9IGdldFR5cGUodmFsdWUpO1xuICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChfdHlwZSA9PT0gJ1JlZ0V4cCcpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0W2ldID09PSAnc3RyaW5nJyAmJiBsaXN0W2ldLm1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGxpc3RbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5c0VxdWFsKG9uZSwgdHdvKSB7XG4gICAgaWYgKCFpc0FycmF5KG9uZSkgfHwgIWlzQXJyYXkodHdvKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGFycmF5cyBjYW4ndCBiZSBlcXVhbCBpZiB0aGV5IGhhdmUgZGlmZmVyZW50IGFtb3VudCBvZiBjb250ZW50XG4gICAgaWYgKG9uZS5sZW5ndGggIT09IHR3by5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvbmUuc29ydCgpO1xuICAgIHR3by5zb3J0KCk7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9uZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChvbmVbaV0gIT09IHR3b1tpXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiB0cmltU2xhc2hlcyh0ZXh0KSB7XG4gICAgdmFyIHRyaW1fZXhwcmVzc2lvbiA9IC9eXFwvK3xcXC8rJC9nO1xuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UodHJpbV9leHByZXNzaW9uLCAnJyk7XG4gIH1cblxuICBVUkkuX3BhcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3RvY29sOiBudWxsLFxuICAgICAgdXNlcm5hbWU6IG51bGwsXG4gICAgICBwYXNzd29yZDogbnVsbCxcbiAgICAgIGhvc3RuYW1lOiBudWxsLFxuICAgICAgdXJuOiBudWxsLFxuICAgICAgcG9ydDogbnVsbCxcbiAgICAgIHBhdGg6IG51bGwsXG4gICAgICBxdWVyeTogbnVsbCxcbiAgICAgIGZyYWdtZW50OiBudWxsLFxuICAgICAgLy8gc3RhdGVcbiAgICAgIGR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVyczogVVJJLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyxcbiAgICAgIGVzY2FwZVF1ZXJ5U3BhY2U6IFVSSS5lc2NhcGVRdWVyeVNwYWNlXG4gICAgfTtcbiAgfTtcbiAgLy8gc3RhdGU6IGFsbG93IGR1cGxpY2F0ZSBxdWVyeSBwYXJhbWV0ZXJzIChhPTEmYT0xKVxuICBVUkkuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gZmFsc2U7XG4gIC8vIHN0YXRlOiByZXBsYWNlcyArIHdpdGggJTIwIChzcGFjZSBpbiBxdWVyeSBzdHJpbmdzKVxuICBVUkkuZXNjYXBlUXVlcnlTcGFjZSA9IHRydWU7XG4gIC8vIHN0YXRpYyBwcm9wZXJ0aWVzXG4gIFVSSS5wcm90b2NvbF9leHByZXNzaW9uID0gL15bYS16XVthLXowLTkuKy1dKiQvaTtcbiAgVVJJLmlkbl9leHByZXNzaW9uID0gL1teYS16MC05XFwuLV0vaTtcbiAgVVJJLnB1bnljb2RlX2V4cHJlc3Npb24gPSAvKHhuLS0pL2k7XG4gIC8vIHdlbGwsIDMzMy40NDQuNTU1LjY2NiBtYXRjaGVzLCBidXQgaXQgc3VyZSBhaW4ndCBubyBJUHY0IC0gZG8gd2UgY2FyZT9cbiAgVVJJLmlwNF9leHByZXNzaW9uID0gL15cXGR7MSwzfVxcLlxcZHsxLDN9XFwuXFxkezEsM31cXC5cXGR7MSwzfSQvO1xuICAvLyBjcmVkaXRzIHRvIFJpY2ggQnJvd25cbiAgLy8gc291cmNlOiBodHRwOi8vZm9ydW1zLmludGVybWFwcGVyLmNvbS92aWV3dG9waWMucGhwP3A9MTA5NiMxMDk2XG4gIC8vIHNwZWNpZmljYXRpb246IGh0dHA6Ly93d3cuaWV0Zi5vcmcvcmZjL3JmYzQyOTEudHh0XG4gIFVSSS5pcDZfZXhwcmVzc2lvbiA9IC9eXFxzKigoKFswLTlBLUZhLWZdezEsNH06KXs3fShbMC05QS1GYS1mXXsxLDR9fDopKXwoKFswLTlBLUZhLWZdezEsNH06KXs2fSg6WzAtOUEtRmEtZl17MSw0fXwoKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezV9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsMn0pfDooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezR9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsM30pfCgoOlswLTlBLUZhLWZdezEsNH0pPzooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXszfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDR9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDJ9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezJ9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNX0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsM306KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7MX0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw2fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCw0fTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoOigoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDd9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDV9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpKSglLispP1xccyokLztcbiAgLy8gZXhwcmVzc2lvbiB1c2VkIGlzIFwiZ3J1YmVyIHJldmlzZWRcIiAoQGdydWJlciB2MikgZGV0ZXJtaW5lZCB0byBiZSB0aGVcbiAgLy8gYmVzdCBzb2x1dGlvbiBpbiBhIHJlZ2V4LWdvbGYgd2UgZGlkIGEgY291cGxlIG9mIGFnZXMgYWdvIGF0XG4gIC8vICogaHR0cDovL21hdGhpYXNieW5lbnMuYmUvZGVtby91cmwtcmVnZXhcbiAgLy8gKiBodHRwOi8vcm9kbmV5cmVobS5kZS90L3VybC1yZWdleC5odG1sXG4gIFVSSS5maW5kX3VyaV9leHByZXNzaW9uID0gL1xcYigoPzpbYS16XVtcXHctXSs6KD86XFwvezEsM318W2EtejAtOSVdKXx3d3dcXGR7MCwzfVsuXXxbYS16MC05LlxcLV0rWy5dW2Etel17Miw0fVxcLykoPzpbXlxccygpPD5dK3xcXCgoW15cXHMoKTw+XSt8KFxcKFteXFxzKCk8Pl0rXFwpKSkqXFwpKSsoPzpcXCgoW15cXHMoKTw+XSt8KFxcKFteXFxzKCk8Pl0rXFwpKSkqXFwpfFteXFxzYCEoKVxcW1xcXXt9OzonXCIuLDw+P8KrwrvigJzigJ3igJjigJldKSkvaWc7XG4gIFVSSS5maW5kVXJpID0ge1xuICAgIC8vIHZhbGlkIFwic2NoZW1lOi8vXCIgb3IgXCJ3d3cuXCJcbiAgICBzdGFydDogL1xcYig/OihbYS16XVthLXowLTkuKy1dKjpcXC9cXC8pfHd3d1xcLikvZ2ksXG4gICAgLy8gZXZlcnl0aGluZyB1cCB0byB0aGUgbmV4dCB3aGl0ZXNwYWNlXG4gICAgZW5kOiAvW1xcc1xcclxcbl18JC8sXG4gICAgLy8gdHJpbSB0cmFpbGluZyBwdW5jdHVhdGlvbiBjYXB0dXJlZCBieSBlbmQgUmVnRXhwXG4gICAgdHJpbTogL1tgISgpXFxbXFxde307OidcIi4sPD4/wqvCu+KAnOKAneKAnuKAmOKAmV0rJC9cbiAgfTtcbiAgLy8gaHR0cDovL3d3dy5pYW5hLm9yZy9hc3NpZ25tZW50cy91cmktc2NoZW1lcy5odG1sXG4gIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl9UQ1BfYW5kX1VEUF9wb3J0X251bWJlcnMjV2VsbC1rbm93bl9wb3J0c1xuICBVUkkuZGVmYXVsdFBvcnRzID0ge1xuICAgIGh0dHA6ICc4MCcsXG4gICAgaHR0cHM6ICc0NDMnLFxuICAgIGZ0cDogJzIxJyxcbiAgICBnb3BoZXI6ICc3MCcsXG4gICAgd3M6ICc4MCcsXG4gICAgd3NzOiAnNDQzJ1xuICB9O1xuICAvLyBhbGxvd2VkIGhvc3RuYW1lIGNoYXJhY3RlcnMgYWNjb3JkaW5nIHRvIFJGQyAzOTg2XG4gIC8vIEFMUEhBIERJR0lUIFwiLVwiIFwiLlwiIFwiX1wiIFwiflwiIFwiIVwiIFwiJFwiIFwiJlwiIFwiJ1wiIFwiKFwiIFwiKVwiIFwiKlwiIFwiK1wiIFwiLFwiIFwiO1wiIFwiPVwiICVlbmNvZGVkXG4gIC8vIEkndmUgbmV2ZXIgc2VlbiBhIChub24tSUROKSBob3N0bmFtZSBvdGhlciB0aGFuOiBBTFBIQSBESUdJVCAuIC1cbiAgVVJJLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycyA9IC9bXmEtekEtWjAtOVxcLi1dLztcbiAgLy8gbWFwIERPTSBFbGVtZW50cyB0byB0aGVpciBVUkkgYXR0cmlidXRlXG4gIFVSSS5kb21BdHRyaWJ1dGVzID0ge1xuICAgICdhJzogJ2hyZWYnLFxuICAgICdibG9ja3F1b3RlJzogJ2NpdGUnLFxuICAgICdsaW5rJzogJ2hyZWYnLFxuICAgICdiYXNlJzogJ2hyZWYnLFxuICAgICdzY3JpcHQnOiAnc3JjJyxcbiAgICAnZm9ybSc6ICdhY3Rpb24nLFxuICAgICdpbWcnOiAnc3JjJyxcbiAgICAnYXJlYSc6ICdocmVmJyxcbiAgICAnaWZyYW1lJzogJ3NyYycsXG4gICAgJ2VtYmVkJzogJ3NyYycsXG4gICAgJ3NvdXJjZSc6ICdzcmMnLFxuICAgICd0cmFjayc6ICdzcmMnLFxuICAgICdpbnB1dCc6ICdzcmMnLCAvLyBidXQgb25seSBpZiB0eXBlPVwiaW1hZ2VcIlxuICAgICdhdWRpbyc6ICdzcmMnLFxuICAgICd2aWRlbyc6ICdzcmMnXG4gIH07XG4gIFVSSS5nZXREb21BdHRyaWJ1dGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgaWYgKCFub2RlIHx8ICFub2RlLm5vZGVOYW1lKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBub2RlTmFtZSA9IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAvLyA8aW5wdXQ+IHNob3VsZCBvbmx5IGV4cG9zZSBzcmMgZm9yIHR5cGU9XCJpbWFnZVwiXG4gICAgaWYgKG5vZGVOYW1lID09PSAnaW5wdXQnICYmIG5vZGUudHlwZSAhPT0gJ2ltYWdlJykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gVVJJLmRvbUF0dHJpYnV0ZXNbbm9kZU5hbWVdO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVzY2FwZUZvckR1bWJGaXJlZm94MzYodmFsdWUpIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvOTFcbiAgICByZXR1cm4gZXNjYXBlKHZhbHVlKTtcbiAgfVxuXG4gIC8vIGVuY29kaW5nIC8gZGVjb2RpbmcgYWNjb3JkaW5nIHRvIFJGQzM5ODZcbiAgZnVuY3Rpb24gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZykge1xuICAgIC8vIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2VuY29kZVVSSUNvbXBvbmVudFxuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5nKVxuICAgICAgLnJlcGxhY2UoL1shJygpKl0vZywgZXNjYXBlRm9yRHVtYkZpcmVmb3gzNilcbiAgICAgIC5yZXBsYWNlKC9cXCovZywgJyUyQScpO1xuICB9XG4gIFVSSS5lbmNvZGUgPSBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQ7XG4gIFVSSS5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG4gIFVSSS5pc284ODU5ID0gZnVuY3Rpb24oKSB7XG4gICAgVVJJLmVuY29kZSA9IGVzY2FwZTtcbiAgICBVUkkuZGVjb2RlID0gdW5lc2NhcGU7XG4gIH07XG4gIFVSSS51bmljb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgVVJJLmVuY29kZSA9IHN0cmljdEVuY29kZVVSSUNvbXBvbmVudDtcbiAgICBVUkkuZGVjb2RlID0gZGVjb2RlVVJJQ29tcG9uZW50O1xuICB9O1xuICBVUkkuY2hhcmFjdGVycyA9IHtcbiAgICBwYXRobmFtZToge1xuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIC8vIFJGQzM5ODYgMi4xOiBGb3IgY29uc2lzdGVuY3ksIFVSSSBwcm9kdWNlcnMgYW5kIG5vcm1hbGl6ZXJzIHNob3VsZFxuICAgICAgICAvLyB1c2UgdXBwZXJjYXNlIGhleGFkZWNpbWFsIGRpZ2l0cyBmb3IgYWxsIHBlcmNlbnQtZW5jb2RpbmdzLlxuICAgICAgICBleHByZXNzaW9uOiAvJSgyNHwyNnwyQnwyQ3wzQnwzRHwzQXw0MCkvaWcsXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgIC8vIC0uX34hJygpKlxuICAgICAgICAgICclMjQnOiAnJCcsXG4gICAgICAgICAgJyUyNic6ICcmJyxcbiAgICAgICAgICAnJTJCJzogJysnLFxuICAgICAgICAgICclMkMnOiAnLCcsXG4gICAgICAgICAgJyUzQic6ICc7JyxcbiAgICAgICAgICAnJTNEJzogJz0nLFxuICAgICAgICAgICclM0EnOiAnOicsXG4gICAgICAgICAgJyU0MCc6ICdAJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZGVjb2RlOiB7XG4gICAgICAgIGV4cHJlc3Npb246IC9bXFwvXFw/I10vZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgJy8nOiAnJTJGJyxcbiAgICAgICAgICAnPyc6ICclM0YnLFxuICAgICAgICAgICcjJzogJyUyMydcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzZXJ2ZWQ6IHtcbiAgICAgIGVuY29kZToge1xuICAgICAgICAvLyBSRkMzOTg2IDIuMTogRm9yIGNvbnNpc3RlbmN5LCBVUkkgcHJvZHVjZXJzIGFuZCBub3JtYWxpemVycyBzaG91bGRcbiAgICAgICAgLy8gdXNlIHVwcGVyY2FzZSBoZXhhZGVjaW1hbCBkaWdpdHMgZm9yIGFsbCBwZXJjZW50LWVuY29kaW5ncy5cbiAgICAgICAgZXhwcmVzc2lvbjogLyUoMjF8MjN8MjR8MjZ8Mjd8Mjh8Mjl8MkF8MkJ8MkN8MkZ8M0F8M0J8M0R8M0Z8NDB8NUJ8NUQpL2lnLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAvLyBnZW4tZGVsaW1zXG4gICAgICAgICAgJyUzQSc6ICc6JyxcbiAgICAgICAgICAnJTJGJzogJy8nLFxuICAgICAgICAgICclM0YnOiAnPycsXG4gICAgICAgICAgJyUyMyc6ICcjJyxcbiAgICAgICAgICAnJTVCJzogJ1snLFxuICAgICAgICAgICclNUQnOiAnXScsXG4gICAgICAgICAgJyU0MCc6ICdAJyxcbiAgICAgICAgICAvLyBzdWItZGVsaW1zXG4gICAgICAgICAgJyUyMSc6ICchJyxcbiAgICAgICAgICAnJTI0JzogJyQnLFxuICAgICAgICAgICclMjYnOiAnJicsXG4gICAgICAgICAgJyUyNyc6ICdcXCcnLFxuICAgICAgICAgICclMjgnOiAnKCcsXG4gICAgICAgICAgJyUyOSc6ICcpJyxcbiAgICAgICAgICAnJTJBJzogJyonLFxuICAgICAgICAgICclMkInOiAnKycsXG4gICAgICAgICAgJyUyQyc6ICcsJyxcbiAgICAgICAgICAnJTNCJzogJzsnLFxuICAgICAgICAgICclM0QnOiAnPSdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgdXJucGF0aDoge1xuICAgICAgLy8gVGhlIGNoYXJhY3RlcnMgdW5kZXIgYGVuY29kZWAgYXJlIHRoZSBjaGFyYWN0ZXJzIGNhbGxlZCBvdXQgYnkgUkZDIDIxNDEgYXMgYmVpbmcgYWNjZXB0YWJsZVxuICAgICAgLy8gZm9yIHVzYWdlIGluIGEgVVJOLiBSRkMyMTQxIGFsc28gY2FsbHMgb3V0IFwiLVwiLCBcIi5cIiwgYW5kIFwiX1wiIGFzIGFjY2VwdGFibGUgY2hhcmFjdGVycywgYnV0XG4gICAgICAvLyB0aGVzZSBhcmVuJ3QgZW5jb2RlZCBieSBlbmNvZGVVUklDb21wb25lbnQsIHNvIHdlIGRvbid0IGhhdmUgdG8gY2FsbCB0aGVtIG91dCBoZXJlLiBBbHNvXG4gICAgICAvLyBub3RlIHRoYXQgdGhlIGNvbG9uIGNoYXJhY3RlciBpcyBub3QgZmVhdHVyZWQgaW4gdGhlIGVuY29kaW5nIG1hcDsgdGhpcyBpcyBiZWNhdXNlIFVSSS5qc1xuICAgICAgLy8gZ2l2ZXMgdGhlIGNvbG9ucyBpbiBVUk5zIHNlbWFudGljIG1lYW5pbmcgYXMgdGhlIGRlbGltaXRlcnMgb2YgcGF0aCBzZWdlbWVudHMsIGFuZCBzbyBpdFxuICAgICAgLy8gc2hvdWxkIG5vdCBhcHBlYXIgdW5lbmNvZGVkIGluIGEgc2VnbWVudCBpdHNlbGYuXG4gICAgICAvLyBTZWUgYWxzbyB0aGUgbm90ZSBhYm92ZSBhYm91dCBSRkMzOTg2IGFuZCBjYXBpdGFsYWxpemVkIGhleCBkaWdpdHMuXG4gICAgICBlbmNvZGU6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogLyUoMjF8MjR8Mjd8Mjh8Mjl8MkF8MkJ8MkN8M0J8M0R8NDApL2lnLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAnJTIxJzogJyEnLFxuICAgICAgICAgICclMjQnOiAnJCcsXG4gICAgICAgICAgJyUyNyc6ICdcXCcnLFxuICAgICAgICAgICclMjgnOiAnKCcsXG4gICAgICAgICAgJyUyOSc6ICcpJyxcbiAgICAgICAgICAnJTJBJzogJyonLFxuICAgICAgICAgICclMkInOiAnKycsXG4gICAgICAgICAgJyUyQyc6ICcsJyxcbiAgICAgICAgICAnJTNCJzogJzsnLFxuICAgICAgICAgICclM0QnOiAnPScsXG4gICAgICAgICAgJyU0MCc6ICdAJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gVGhlc2UgY2hhcmFjdGVycyBhcmUgdGhlIGNoYXJhY3RlcnMgY2FsbGVkIG91dCBieSBSRkMyMTQxIGFzIFwicmVzZXJ2ZWRcIiBjaGFyYWN0ZXJzIHRoYXRcbiAgICAgIC8vIHNob3VsZCBuZXZlciBhcHBlYXIgaW4gYSBVUk4sIHBsdXMgdGhlIGNvbG9uIGNoYXJhY3RlciAoc2VlIG5vdGUgYWJvdmUpLlxuICAgICAgZGVjb2RlOiB7XG4gICAgICAgIGV4cHJlc3Npb246IC9bXFwvXFw/IzpdL2csXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICcvJzogJyUyRicsXG4gICAgICAgICAgJz8nOiAnJTNGJyxcbiAgICAgICAgICAnIyc6ICclMjMnLFxuICAgICAgICAgICc6JzogJyUzQSdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgVVJJLmVuY29kZVF1ZXJ5ID0gZnVuY3Rpb24oc3RyaW5nLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgdmFyIGVzY2FwZWQgPSBVUkkuZW5jb2RlKHN0cmluZyArICcnKTtcbiAgICBpZiAoZXNjYXBlUXVlcnlTcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlc2NhcGVRdWVyeVNwYWNlID0gVVJJLmVzY2FwZVF1ZXJ5U3BhY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVzY2FwZVF1ZXJ5U3BhY2UgPyBlc2NhcGVkLnJlcGxhY2UoLyUyMC9nLCAnKycpIDogZXNjYXBlZDtcbiAgfTtcbiAgVVJJLmRlY29kZVF1ZXJ5ID0gZnVuY3Rpb24oc3RyaW5nLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgc3RyaW5nICs9ICcnO1xuICAgIGlmIChlc2NhcGVRdWVyeVNwYWNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVzY2FwZVF1ZXJ5U3BhY2UgPSBVUkkuZXNjYXBlUXVlcnlTcGFjZTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIFVSSS5kZWNvZGUoZXNjYXBlUXVlcnlTcGFjZSA/IHN0cmluZy5yZXBsYWNlKC9cXCsvZywgJyUyMCcpIDogc3RyaW5nKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIC8vIHdlJ3JlIG5vdCBnb2luZyB0byBtZXNzIHdpdGggd2VpcmQgZW5jb2RpbmdzLFxuICAgICAgLy8gZ2l2ZSB1cCBhbmQgcmV0dXJuIHRoZSB1bmRlY29kZWQgb3JpZ2luYWwgc3RyaW5nXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzg3XG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzkyXG4gICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cbiAgfTtcbiAgLy8gZ2VuZXJhdGUgZW5jb2RlL2RlY29kZSBwYXRoIGZ1bmN0aW9uc1xuICB2YXIgX3BhcnRzID0geydlbmNvZGUnOidlbmNvZGUnLCAnZGVjb2RlJzonZGVjb2RlJ307XG4gIHZhciBfcGFydDtcbiAgdmFyIGdlbmVyYXRlQWNjZXNzb3IgPSBmdW5jdGlvbihfZ3JvdXAsIF9wYXJ0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIFVSSVtfcGFydF0oc3RyaW5nICsgJycpLnJlcGxhY2UoVVJJLmNoYXJhY3RlcnNbX2dyb3VwXVtfcGFydF0uZXhwcmVzc2lvbiwgZnVuY3Rpb24oYykge1xuICAgICAgICAgIHJldHVybiBVUkkuY2hhcmFjdGVyc1tfZ3JvdXBdW19wYXJ0XS5tYXBbY107XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyB3ZSdyZSBub3QgZ29pbmcgdG8gbWVzcyB3aXRoIHdlaXJkIGVuY29kaW5ncyxcbiAgICAgICAgLy8gZ2l2ZSB1cCBhbmQgcmV0dXJuIHRoZSB1bmRlY29kZWQgb3JpZ2luYWwgc3RyaW5nXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvODdcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy85MlxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgZm9yIChfcGFydCBpbiBfcGFydHMpIHtcbiAgICBVUklbX3BhcnQgKyAnUGF0aFNlZ21lbnQnXSA9IGdlbmVyYXRlQWNjZXNzb3IoJ3BhdGhuYW1lJywgX3BhcnRzW19wYXJ0XSk7XG4gICAgVVJJW19wYXJ0ICsgJ1VyblBhdGhTZWdtZW50J10gPSBnZW5lcmF0ZUFjY2Vzc29yKCd1cm5wYXRoJywgX3BhcnRzW19wYXJ0XSk7XG4gIH1cblxuICB2YXIgZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24gPSBmdW5jdGlvbihfc2VwLCBfY29kaW5nRnVuY05hbWUsIF9pbm5lckNvZGluZ0Z1bmNOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgLy8gV2h5IHBhc3MgaW4gbmFtZXMgb2YgZnVuY3Rpb25zLCByYXRoZXIgdGhhbiB0aGUgZnVuY3Rpb24gb2JqZWN0cyB0aGVtc2VsdmVzPyBUaGVcbiAgICAgIC8vIGRlZmluaXRpb25zIG9mIHNvbWUgZnVuY3Rpb25zIChidXQgaW4gcGFydGljdWxhciwgVVJJLmRlY29kZSkgd2lsbCBvY2Nhc2lvbmFsbHkgY2hhbmdlIGR1ZVxuICAgICAgLy8gdG8gVVJJLmpzIGhhdmluZyBJU084ODU5IGFuZCBVbmljb2RlIG1vZGVzLiBQYXNzaW5nIGluIHRoZSBuYW1lIGFuZCBnZXR0aW5nIGl0IHdpbGwgZW5zdXJlXG4gICAgICAvLyB0aGF0IHRoZSBmdW5jdGlvbnMgd2UgdXNlIGhlcmUgYXJlIFwiZnJlc2hcIi5cbiAgICAgIHZhciBhY3R1YWxDb2RpbmdGdW5jO1xuICAgICAgaWYgKCFfaW5uZXJDb2RpbmdGdW5jTmFtZSkge1xuICAgICAgICBhY3R1YWxDb2RpbmdGdW5jID0gVVJJW19jb2RpbmdGdW5jTmFtZV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3R1YWxDb2RpbmdGdW5jID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgICAgcmV0dXJuIFVSSVtfY29kaW5nRnVuY05hbWVdKFVSSVtfaW5uZXJDb2RpbmdGdW5jTmFtZV0oc3RyaW5nKSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWdtZW50cyA9IChzdHJpbmcgKyAnJykuc3BsaXQoX3NlcCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBzZWdtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzZWdtZW50c1tpXSA9IGFjdHVhbENvZGluZ0Z1bmMoc2VnbWVudHNbaV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VnbWVudHMuam9pbihfc2VwKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFRoaXMgdGFrZXMgcGxhY2Ugb3V0c2lkZSB0aGUgYWJvdmUgbG9vcCBiZWNhdXNlIHdlIGRvbid0IHdhbnQsIGUuZy4sIGVuY29kZVVyblBhdGggZnVuY3Rpb25zLlxuICBVUkkuZGVjb2RlUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCcvJywgJ2RlY29kZVBhdGhTZWdtZW50Jyk7XG4gIFVSSS5kZWNvZGVVcm5QYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJzonLCAnZGVjb2RlVXJuUGF0aFNlZ21lbnQnKTtcbiAgVVJJLnJlY29kZVBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignLycsICdlbmNvZGVQYXRoU2VnbWVudCcsICdkZWNvZGUnKTtcbiAgVVJJLnJlY29kZVVyblBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignOicsICdlbmNvZGVVcm5QYXRoU2VnbWVudCcsICdkZWNvZGUnKTtcblxuICBVUkkuZW5jb2RlUmVzZXJ2ZWQgPSBnZW5lcmF0ZUFjY2Vzc29yKCdyZXNlcnZlZCcsICdlbmNvZGUnKTtcblxuICBVUkkucGFyc2UgPSBmdW5jdGlvbihzdHJpbmcsIHBhcnRzKSB7XG4gICAgdmFyIHBvcztcbiAgICBpZiAoIXBhcnRzKSB7XG4gICAgICBwYXJ0cyA9IHt9O1xuICAgIH1cbiAgICAvLyBbcHJvdG9jb2xcIjovL1wiW3VzZXJuYW1lW1wiOlwicGFzc3dvcmRdXCJAXCJdaG9zdG5hbWVbXCI6XCJwb3J0XVwiL1wiP11bcGF0aF1bXCI/XCJxdWVyeXN0cmluZ11bXCIjXCJmcmFnbWVudF1cblxuICAgIC8vIGV4dHJhY3QgZnJhZ21lbnRcbiAgICBwb3MgPSBzdHJpbmcuaW5kZXhPZignIycpO1xuICAgIGlmIChwb3MgPiAtMSkge1xuICAgICAgLy8gZXNjYXBpbmc/XG4gICAgICBwYXJ0cy5mcmFnbWVudCA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSkgfHwgbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IHF1ZXJ5XG4gICAgcG9zID0gc3RyaW5nLmluZGV4T2YoJz8nKTtcbiAgICBpZiAocG9zID4gLTEpIHtcbiAgICAgIC8vIGVzY2FwaW5nP1xuICAgICAgcGFydHMucXVlcnkgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpIHx8IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcyk7XG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBwcm90b2NvbFxuICAgIGlmIChzdHJpbmcuc3Vic3RyaW5nKDAsIDIpID09PSAnLy8nKSB7XG4gICAgICAvLyByZWxhdGl2ZS1zY2hlbWVcbiAgICAgIHBhcnRzLnByb3RvY29sID0gbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoMik7XG4gICAgICAvLyBleHRyYWN0IFwidXNlcjpwYXNzQGhvc3Q6cG9ydFwiXG4gICAgICBzdHJpbmcgPSBVUkkucGFyc2VBdXRob3JpdHkoc3RyaW5nLCBwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcyA9IHN0cmluZy5pbmRleE9mKCc6Jyk7XG4gICAgICBpZiAocG9zID4gLTEpIHtcbiAgICAgICAgcGFydHMucHJvdG9jb2wgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykgfHwgbnVsbDtcbiAgICAgICAgaWYgKHBhcnRzLnByb3RvY29sICYmICFwYXJ0cy5wcm90b2NvbC5tYXRjaChVUkkucHJvdG9jb2xfZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAvLyA6IG1heSBiZSB3aXRoaW4gdGhlIHBhdGhcbiAgICAgICAgICBwYXJ0cy5wcm90b2NvbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEsIHBvcyArIDMpID09PSAnLy8nKSB7XG4gICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAzKTtcblxuICAgICAgICAgIC8vIGV4dHJhY3QgXCJ1c2VyOnBhc3NAaG9zdDpwb3J0XCJcbiAgICAgICAgICBzdHJpbmcgPSBVUkkucGFyc2VBdXRob3JpdHkoc3RyaW5nLCBwYXJ0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKTtcbiAgICAgICAgICBwYXJ0cy51cm4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2hhdCdzIGxlZnQgbXVzdCBiZSB0aGUgcGF0aFxuICAgIHBhcnRzLnBhdGggPSBzdHJpbmc7XG5cbiAgICAvLyBhbmQgd2UncmUgZG9uZVxuICAgIHJldHVybiBwYXJ0cztcbiAgfTtcbiAgVVJJLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKHN0cmluZywgcGFydHMpIHtcbiAgICAvLyBDb3B5IGNocm9tZSwgSUUsIG9wZXJhIGJhY2tzbGFzaC1oYW5kbGluZyBiZWhhdmlvci5cbiAgICAvLyBCYWNrIHNsYXNoZXMgYmVmb3JlIHRoZSBxdWVyeSBzdHJpbmcgZ2V0IGNvbnZlcnRlZCB0byBmb3J3YXJkIHNsYXNoZXNcbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9ibG9iLzM4NmZkMjRmNDliMGU5ZDFhOGEwNzY1OTJhNDA0MTY4ZmFlZWNjMzQvbGliL3VybC5qcyNMMTE1LUwxMjRcbiAgICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL3B1bGwvMjMzXG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblxuICAgIC8vIGV4dHJhY3QgaG9zdDpwb3J0XG4gICAgdmFyIHBvcyA9IHN0cmluZy5pbmRleE9mKCcvJyk7XG4gICAgdmFyIGJyYWNrZXRQb3M7XG4gICAgdmFyIHQ7XG5cbiAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgcG9zID0gc3RyaW5nLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmNoYXJBdCgwKSA9PT0gJ1snKSB7XG4gICAgICAvLyBJUHY2IGhvc3QgLSBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1pZXRmLTZtYW4tdGV4dC1hZGRyLXJlcHJlc2VudGF0aW9uLTA0I3NlY3Rpb24tNlxuICAgICAgLy8gSSBjbGFpbSBtb3N0IGNsaWVudCBzb2Z0d2FyZSBicmVha3Mgb24gSVB2NiBhbnl3YXlzLiBUbyBzaW1wbGlmeSB0aGluZ3MsIFVSSSBvbmx5IGFjY2VwdHNcbiAgICAgIC8vIElQdjYrcG9ydCBpbiB0aGUgZm9ybWF0IFsyMDAxOmRiODo6MV06ODAgKGZvciB0aGUgdGltZSBiZWluZylcbiAgICAgIGJyYWNrZXRQb3MgPSBzdHJpbmcuaW5kZXhPZignXScpO1xuICAgICAgcGFydHMuaG9zdG5hbWUgPSBzdHJpbmcuc3Vic3RyaW5nKDEsIGJyYWNrZXRQb3MpIHx8IG51bGw7XG4gICAgICBwYXJ0cy5wb3J0ID0gc3RyaW5nLnN1YnN0cmluZyhicmFja2V0UG9zICsgMiwgcG9zKSB8fCBudWxsO1xuICAgICAgaWYgKHBhcnRzLnBvcnQgPT09ICcvJykge1xuICAgICAgICBwYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZpcnN0Q29sb24gPSBzdHJpbmcuaW5kZXhPZignOicpO1xuICAgICAgdmFyIGZpcnN0U2xhc2ggPSBzdHJpbmcuaW5kZXhPZignLycpO1xuICAgICAgdmFyIG5leHRDb2xvbiA9IHN0cmluZy5pbmRleE9mKCc6JywgZmlyc3RDb2xvbiArIDEpO1xuICAgICAgaWYgKG5leHRDb2xvbiAhPT0gLTEgJiYgKGZpcnN0U2xhc2ggPT09IC0xIHx8IG5leHRDb2xvbiA8IGZpcnN0U2xhc2gpKSB7XG4gICAgICAgIC8vIElQdjYgaG9zdCBjb250YWlucyBtdWx0aXBsZSBjb2xvbnMgLSBidXQgbm8gcG9ydFxuICAgICAgICAvLyB0aGlzIG5vdGF0aW9uIGlzIGFjdHVhbGx5IG5vdCBhbGxvd2VkIGJ5IFJGQyAzOTg2LCBidXQgd2UncmUgYSBsaWJlcmFsIHBhcnNlclxuICAgICAgICBwYXJ0cy5ob3N0bmFtZSA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKSB8fCBudWxsO1xuICAgICAgICBwYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHQgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykuc3BsaXQoJzonKTtcbiAgICAgICAgcGFydHMuaG9zdG5hbWUgPSB0WzBdIHx8IG51bGw7XG4gICAgICAgIHBhcnRzLnBvcnQgPSB0WzFdIHx8IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcnRzLmhvc3RuYW1lICYmIHN0cmluZy5zdWJzdHJpbmcocG9zKS5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgcG9zKys7XG4gICAgICBzdHJpbmcgPSAnLycgKyBzdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZy5zdWJzdHJpbmcocG9zKSB8fCAnLyc7XG4gIH07XG4gIFVSSS5wYXJzZUF1dGhvcml0eSA9IGZ1bmN0aW9uKHN0cmluZywgcGFydHMpIHtcbiAgICBzdHJpbmcgPSBVUkkucGFyc2VVc2VyaW5mbyhzdHJpbmcsIHBhcnRzKTtcbiAgICByZXR1cm4gVVJJLnBhcnNlSG9zdChzdHJpbmcsIHBhcnRzKTtcbiAgfTtcbiAgVVJJLnBhcnNlVXNlcmluZm8gPSBmdW5jdGlvbihzdHJpbmcsIHBhcnRzKSB7XG4gICAgLy8gZXh0cmFjdCB1c2VybmFtZTpwYXNzd29yZFxuICAgIHZhciBmaXJzdFNsYXNoID0gc3RyaW5nLmluZGV4T2YoJy8nKTtcbiAgICB2YXIgcG9zID0gc3RyaW5nLmxhc3RJbmRleE9mKCdAJywgZmlyc3RTbGFzaCA+IC0xID8gZmlyc3RTbGFzaCA6IHN0cmluZy5sZW5ndGggLSAxKTtcbiAgICB2YXIgdDtcblxuICAgIC8vIGF1dGhvcml0eUAgbXVzdCBjb21lIGJlZm9yZSAvcGF0aFxuICAgIGlmIChwb3MgPiAtMSAmJiAoZmlyc3RTbGFzaCA9PT0gLTEgfHwgcG9zIDwgZmlyc3RTbGFzaCkpIHtcbiAgICAgIHQgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIHBvcykuc3BsaXQoJzonKTtcbiAgICAgIHBhcnRzLnVzZXJuYW1lID0gdFswXSA/IFVSSS5kZWNvZGUodFswXSkgOiBudWxsO1xuICAgICAgdC5zaGlmdCgpO1xuICAgICAgcGFydHMucGFzc3dvcmQgPSB0WzBdID8gVVJJLmRlY29kZSh0LmpvaW4oJzonKSkgOiBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMudXNlcm5hbWUgPSBudWxsO1xuICAgICAgcGFydHMucGFzc3dvcmQgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH07XG4gIFVSSS5wYXJzZVF1ZXJ5ID0gZnVuY3Rpb24oc3RyaW5nLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvLyB0aHJvdyBvdXQgdGhlIGZ1bmt5IGJ1c2luZXNzIC0gXCI/XCJbbmFtZVwiPVwidmFsdWVcIiZcIl0rXG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyYrL2csICcmJykucmVwbGFjZSgvXlxcPyomKnwmKyQvZywgJycpO1xuXG4gICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICB2YXIgaXRlbXMgPSB7fTtcbiAgICB2YXIgc3BsaXRzID0gc3RyaW5nLnNwbGl0KCcmJyk7XG4gICAgdmFyIGxlbmd0aCA9IHNwbGl0cy5sZW5ndGg7XG4gICAgdmFyIHYsIG5hbWUsIHZhbHVlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdiA9IHNwbGl0c1tpXS5zcGxpdCgnPScpO1xuICAgICAgbmFtZSA9IFVSSS5kZWNvZGVRdWVyeSh2LnNoaWZ0KCksIGVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgLy8gbm8gXCI9XCIgaXMgbnVsbCBhY2NvcmRpbmcgdG8gaHR0cDovL2R2Y3MudzMub3JnL2hnL3VybC9yYXctZmlsZS90aXAvT3ZlcnZpZXcuaHRtbCNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgICB2YWx1ZSA9IHYubGVuZ3RoID8gVVJJLmRlY29kZVF1ZXJ5KHYuam9pbignPScpLCBlc2NhcGVRdWVyeVNwYWNlKSA6IG51bGw7XG5cbiAgICAgIGlmIChoYXNPd24uY2FsbChpdGVtcywgbmFtZSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtc1tuYW1lXSA9PT0gJ3N0cmluZycgfHwgaXRlbXNbbmFtZV0gPT09IG51bGwpIHtcbiAgICAgICAgICBpdGVtc1tuYW1lXSA9IFtpdGVtc1tuYW1lXV07XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtc1tuYW1lXS5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGl0ZW1zW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9O1xuXG4gIFVSSS5idWlsZCA9IGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgdmFyIHQgPSAnJztcblxuICAgIGlmIChwYXJ0cy5wcm90b2NvbCkge1xuICAgICAgdCArPSBwYXJ0cy5wcm90b2NvbCArICc6JztcbiAgICB9XG5cbiAgICBpZiAoIXBhcnRzLnVybiAmJiAodCB8fCBwYXJ0cy5ob3N0bmFtZSkpIHtcbiAgICAgIHQgKz0gJy8vJztcbiAgICB9XG5cbiAgICB0ICs9IChVUkkuYnVpbGRBdXRob3JpdHkocGFydHMpIHx8ICcnKTtcblxuICAgIGlmICh0eXBlb2YgcGFydHMucGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChwYXJ0cy5wYXRoLmNoYXJBdCgwKSAhPT0gJy8nICYmIHR5cGVvZiBwYXJ0cy5ob3N0bmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdCArPSAnLyc7XG4gICAgICB9XG5cbiAgICAgIHQgKz0gcGFydHMucGF0aDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzLnF1ZXJ5ID09PSAnc3RyaW5nJyAmJiBwYXJ0cy5xdWVyeSkge1xuICAgICAgdCArPSAnPycgKyBwYXJ0cy5xdWVyeTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcnRzLmZyYWdtZW50ID09PSAnc3RyaW5nJyAmJiBwYXJ0cy5mcmFnbWVudCkge1xuICAgICAgdCArPSAnIycgKyBwYXJ0cy5mcmFnbWVudDtcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG4gIH07XG4gIFVSSS5idWlsZEhvc3QgPSBmdW5jdGlvbihwYXJ0cykge1xuICAgIHZhciB0ID0gJyc7XG5cbiAgICBpZiAoIXBhcnRzLmhvc3RuYW1lKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmIChVUkkuaXA2X2V4cHJlc3Npb24udGVzdChwYXJ0cy5ob3N0bmFtZSkpIHtcbiAgICAgIHQgKz0gJ1snICsgcGFydHMuaG9zdG5hbWUgKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHQgKz0gcGFydHMuaG9zdG5hbWU7XG4gICAgfVxuXG4gICAgaWYgKHBhcnRzLnBvcnQpIHtcbiAgICAgIHQgKz0gJzonICsgcGFydHMucG9ydDtcbiAgICB9XG5cbiAgICByZXR1cm4gdDtcbiAgfTtcbiAgVVJJLmJ1aWxkQXV0aG9yaXR5ID0gZnVuY3Rpb24ocGFydHMpIHtcbiAgICByZXR1cm4gVVJJLmJ1aWxkVXNlcmluZm8ocGFydHMpICsgVVJJLmJ1aWxkSG9zdChwYXJ0cyk7XG4gIH07XG4gIFVSSS5idWlsZFVzZXJpbmZvID0gZnVuY3Rpb24ocGFydHMpIHtcbiAgICB2YXIgdCA9ICcnO1xuXG4gICAgaWYgKHBhcnRzLnVzZXJuYW1lKSB7XG4gICAgICB0ICs9IFVSSS5lbmNvZGUocGFydHMudXNlcm5hbWUpO1xuXG4gICAgICBpZiAocGFydHMucGFzc3dvcmQpIHtcbiAgICAgICAgdCArPSAnOicgKyBVUkkuZW5jb2RlKHBhcnRzLnBhc3N3b3JkKTtcbiAgICAgIH1cblxuICAgICAgdCArPSAnQCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHQ7XG4gIH07XG4gIFVSSS5idWlsZFF1ZXJ5ID0gZnVuY3Rpb24oZGF0YSwgZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCBlc2NhcGVRdWVyeVNwYWNlKSB7XG4gICAgLy8gYWNjb3JkaW5nIHRvIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYgb3IgaHR0cDovL2xhYnMuYXBhY2hlLm9yZy93ZWJhcmNoL3VyaS9yZmMvcmZjMzk4Ni5odG1sXG4gICAgLy8gYmVpbmcgwrstLl9+ISQmJygpKissOz06QC8/wqsgJUhFWCBhbmQgYWxudW0gYXJlIGFsbG93ZWRcbiAgICAvLyB0aGUgUkZDIGV4cGxpY2l0bHkgc3RhdGVzID8vZm9vIGJlaW5nIGEgdmFsaWQgdXNlIGNhc2UsIG5vIG1lbnRpb24gb2YgcGFyYW1ldGVyIHN5bnRheCFcbiAgICAvLyBVUkkuanMgdHJlYXRzIHRoZSBxdWVyeSBzdHJpbmcgYXMgYmVpbmcgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAgLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL1JFQy1odG1sNDAvaW50ZXJhY3QvZm9ybXMuaHRtbCNmb3JtLWNvbnRlbnQtdHlwZVxuXG4gICAgdmFyIHQgPSAnJztcbiAgICB2YXIgdW5pcXVlLCBrZXksIGksIGxlbmd0aDtcbiAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoaGFzT3duLmNhbGwoZGF0YSwga2V5KSAmJiBrZXkpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkoZGF0YVtrZXldKSkge1xuICAgICAgICAgIHVuaXF1ZSA9IHt9O1xuICAgICAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGRhdGFba2V5XS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGRhdGFba2V5XVtpXSAhPT0gdW5kZWZpbmVkICYmIHVuaXF1ZVtkYXRhW2tleV1baV0gKyAnJ10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICB0ICs9ICcmJyArIFVSSS5idWlsZFF1ZXJ5UGFyYW1ldGVyKGtleSwgZGF0YVtrZXldW2ldLCBlc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgICAgICAgICAgaWYgKGR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHVuaXF1ZVtkYXRhW2tleV1baV0gKyAnJ10gPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdCArPSAnJicgKyBVUkkuYnVpbGRRdWVyeVBhcmFtZXRlcihrZXksIGRhdGFba2V5XSwgZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdC5zdWJzdHJpbmcoMSk7XG4gIH07XG4gIFVSSS5idWlsZFF1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9SRUMtaHRtbDQwL2ludGVyYWN0L2Zvcm1zLmh0bWwjZm9ybS1jb250ZW50LXR5cGUgLS0gYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAgLy8gZG9uJ3QgYXBwZW5kIFwiPVwiIGZvciBudWxsIHZhbHVlcywgYWNjb3JkaW5nIHRvIGh0dHA6Ly9kdmNzLnczLm9yZy9oZy91cmwvcmF3LWZpbGUvdGlwL092ZXJ2aWV3Lmh0bWwjdXJsLXBhcmFtZXRlci1zZXJpYWxpemF0aW9uXG4gICAgcmV0dXJuIFVSSS5lbmNvZGVRdWVyeShuYW1lLCBlc2NhcGVRdWVyeVNwYWNlKSArICh2YWx1ZSAhPT0gbnVsbCA/ICc9JyArIFVSSS5lbmNvZGVRdWVyeSh2YWx1ZSwgZXNjYXBlUXVlcnlTcGFjZSkgOiAnJyk7XG4gIH07XG5cbiAgVVJJLmFkZFF1ZXJ5ID0gZnVuY3Rpb24oZGF0YSwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIFVSSS5hZGRRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKGRhdGFbbmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhW25hbWVdID0gdmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGFbbmFtZV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGRhdGFbbmFtZV0gPSBbZGF0YVtuYW1lXV07XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBbdmFsdWVdO1xuICAgICAgfVxuXG4gICAgICBkYXRhW25hbWVdID0gKGRhdGFbbmFtZV0gfHwgW10pLmNvbmNhdCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5hZGRRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuICB9O1xuICBVUkkucmVtb3ZlUXVlcnkgPSBmdW5jdGlvbihkYXRhLCBuYW1lLCB2YWx1ZSkge1xuICAgIHZhciBpLCBsZW5ndGgsIGtleTtcblxuICAgIGlmIChpc0FycmF5KG5hbWUpKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBuYW1lLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRhdGFbbmFtZVtpXV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChnZXRUeXBlKG5hbWUpID09PSAnUmVnRXhwJykge1xuICAgICAgZm9yIChrZXkgaW4gZGF0YSkge1xuICAgICAgICBpZiAobmFtZS50ZXN0KGtleSkpIHtcbiAgICAgICAgICBkYXRhW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yIChrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIFVSSS5yZW1vdmVRdWVyeShkYXRhLCBrZXksIG5hbWVba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGdldFR5cGUodmFsdWUpID09PSAnUmVnRXhwJykge1xuICAgICAgICAgIGlmICghaXNBcnJheShkYXRhW25hbWVdKSAmJiB2YWx1ZS50ZXN0KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgICBkYXRhW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhW25hbWVdID0gZmlsdGVyQXJyYXlWYWx1ZXMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkYXRhW25hbWVdID09PSBTdHJpbmcodmFsdWUpICYmICghaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUubGVuZ3RoID09PSAxKSkge1xuICAgICAgICAgIGRhdGFbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShkYXRhW25hbWVdKSkge1xuICAgICAgICAgIGRhdGFbbmFtZV0gPSBmaWx0ZXJBcnJheVZhbHVlcyhkYXRhW25hbWVdLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGFbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5yZW1vdmVRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcsIFJlZ0V4cCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyJyk7XG4gICAgfVxuICB9O1xuICBVUkkuaGFzUXVlcnkgPSBmdW5jdGlvbihkYXRhLCBuYW1lLCB2YWx1ZSwgd2l0aGluQXJyYXkpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwobmFtZSwga2V5KSkge1xuICAgICAgICAgIGlmICghVVJJLmhhc1F1ZXJ5KGRhdGEsIGtleSwgbmFtZVtrZXldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVVJJLmhhc1F1ZXJ5KCkgYWNjZXB0cyBhbiBvYmplY3QsIHN0cmluZyBhcyB0aGUgbmFtZSBwYXJhbWV0ZXInKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGdldFR5cGUodmFsdWUpKSB7XG4gICAgICBjYXNlICdVbmRlZmluZWQnOlxuICAgICAgICAvLyB0cnVlIGlmIGV4aXN0cyAoYnV0IG1heSBiZSBlbXB0eSlcbiAgICAgICAgcmV0dXJuIG5hbWUgaW4gZGF0YTsgLy8gZGF0YVtuYW1lXSAhPT0gdW5kZWZpbmVkO1xuXG4gICAgICBjYXNlICdCb29sZWFuJzpcbiAgICAgICAgLy8gdHJ1ZSBpZiBleGlzdHMgYW5kIG5vbi1lbXB0eVxuICAgICAgICB2YXIgX2Jvb2x5ID0gQm9vbGVhbihpc0FycmF5KGRhdGFbbmFtZV0pID8gZGF0YVtuYW1lXS5sZW5ndGggOiBkYXRhW25hbWVdKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSBfYm9vbHk7XG5cbiAgICAgIGNhc2UgJ0Z1bmN0aW9uJzpcbiAgICAgICAgLy8gYWxsb3cgY29tcGxleCBjb21wYXJpc29uXG4gICAgICAgIHJldHVybiAhIXZhbHVlKGRhdGFbbmFtZV0sIG5hbWUsIGRhdGEpO1xuXG4gICAgICBjYXNlICdBcnJheSc6XG4gICAgICAgIGlmICghaXNBcnJheShkYXRhW25hbWVdKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvcCA9IHdpdGhpbkFycmF5ID8gYXJyYXlDb250YWlucyA6IGFycmF5c0VxdWFsO1xuICAgICAgICByZXR1cm4gb3AoZGF0YVtuYW1lXSwgdmFsdWUpO1xuXG4gICAgICBjYXNlICdSZWdFeHAnOlxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICByZXR1cm4gQm9vbGVhbihkYXRhW25hbWVdICYmIGRhdGFbbmFtZV0ubWF0Y2godmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghd2l0aGluQXJyYXkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJyYXlDb250YWlucyhkYXRhW25hbWVdLCB2YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ051bWJlcic6XG4gICAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgY2FzZSAnU3RyaW5nJzpcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGFbbmFtZV0gPT09IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF3aXRoaW5BcnJheSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheUNvbnRhaW5zKGRhdGFbbmFtZV0sIHZhbHVlKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVVJJLmhhc1F1ZXJ5KCkgYWNjZXB0cyB1bmRlZmluZWQsIGJvb2xlYW4sIHN0cmluZywgbnVtYmVyLCBSZWdFeHAsIEZ1bmN0aW9uIGFzIHRoZSB2YWx1ZSBwYXJhbWV0ZXInKTtcbiAgICB9XG4gIH07XG5cblxuICBVUkkuY29tbW9uUGF0aCA9IGZ1bmN0aW9uKG9uZSwgdHdvKSB7XG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWluKG9uZS5sZW5ndGgsIHR3by5sZW5ndGgpO1xuICAgIHZhciBwb3M7XG5cbiAgICAvLyBmaW5kIGZpcnN0IG5vbi1tYXRjaGluZyBjaGFyYWN0ZXJcbiAgICBmb3IgKHBvcyA9IDA7IHBvcyA8IGxlbmd0aDsgcG9zKyspIHtcbiAgICAgIGlmIChvbmUuY2hhckF0KHBvcykgIT09IHR3by5jaGFyQXQocG9zKSkge1xuICAgICAgICBwb3MtLTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvcyA8IDEpIHtcbiAgICAgIHJldHVybiBvbmUuY2hhckF0KDApID09PSB0d28uY2hhckF0KDApICYmIG9uZS5jaGFyQXQoMCkgPT09ICcvJyA/ICcvJyA6ICcnO1xuICAgIH1cblxuICAgIC8vIHJldmVydCB0byBsYXN0IC9cbiAgICBpZiAob25lLmNoYXJBdChwb3MpICE9PSAnLycgfHwgdHdvLmNoYXJBdChwb3MpICE9PSAnLycpIHtcbiAgICAgIHBvcyA9IG9uZS5zdWJzdHJpbmcoMCwgcG9zKS5sYXN0SW5kZXhPZignLycpO1xuICAgIH1cblxuICAgIHJldHVybiBvbmUuc3Vic3RyaW5nKDAsIHBvcyArIDEpO1xuICB9O1xuXG4gIFVSSS53aXRoaW5TdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICB2YXIgX3N0YXJ0ID0gb3B0aW9ucy5zdGFydCB8fCBVUkkuZmluZFVyaS5zdGFydDtcbiAgICB2YXIgX2VuZCA9IG9wdGlvbnMuZW5kIHx8IFVSSS5maW5kVXJpLmVuZDtcbiAgICB2YXIgX3RyaW0gPSBvcHRpb25zLnRyaW0gfHwgVVJJLmZpbmRVcmkudHJpbTtcbiAgICB2YXIgX2F0dHJpYnV0ZU9wZW4gPSAvW2EtejAtOS1dPVtcIiddPyQvaTtcblxuICAgIF9zdGFydC5sYXN0SW5kZXggPSAwO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgbWF0Y2ggPSBfc3RhcnQuZXhlYyhzdHJpbmcpO1xuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXJ0ID0gbWF0Y2guaW5kZXg7XG4gICAgICBpZiAob3B0aW9ucy5pZ25vcmVIdG1sKSB7XG4gICAgICAgIC8vIGF0dHJpYnV0KGU9W1wiJ10/JClcbiAgICAgICAgdmFyIGF0dHJpYnV0ZU9wZW4gPSBzdHJpbmcuc2xpY2UoTWF0aC5tYXgoc3RhcnQgLSAzLCAwKSwgc3RhcnQpO1xuICAgICAgICBpZiAoYXR0cmlidXRlT3BlbiAmJiBfYXR0cmlidXRlT3Blbi50ZXN0KGF0dHJpYnV0ZU9wZW4pKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgc3RyaW5nLnNsaWNlKHN0YXJ0KS5zZWFyY2goX2VuZCk7XG4gICAgICB2YXIgc2xpY2UgPSBzdHJpbmcuc2xpY2Uoc3RhcnQsIGVuZCkucmVwbGFjZShfdHJpbSwgJycpO1xuICAgICAgaWYgKG9wdGlvbnMuaWdub3JlICYmIG9wdGlvbnMuaWdub3JlLnRlc3Qoc2xpY2UpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBlbmQgPSBzdGFydCArIHNsaWNlLmxlbmd0aDtcbiAgICAgIHZhciByZXN1bHQgPSBjYWxsYmFjayhzbGljZSwgc3RhcnQsIGVuZCwgc3RyaW5nKTtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zbGljZSgwLCBzdGFydCkgKyByZXN1bHQgKyBzdHJpbmcuc2xpY2UoZW5kKTtcbiAgICAgIF9zdGFydC5sYXN0SW5kZXggPSBzdGFydCArIHJlc3VsdC5sZW5ndGg7XG4gICAgfVxuXG4gICAgX3N0YXJ0Lmxhc3RJbmRleCA9IDA7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcblxuICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAvLyBUaGVvcmV0aWNhbGx5IFVSSXMgYWxsb3cgcGVyY2VudC1lbmNvZGluZyBpbiBIb3N0bmFtZXMgKGFjY29yZGluZyB0byBSRkMgMzk4NilcbiAgICAvLyB0aGV5IGFyZSBub3QgcGFydCBvZiBETlMgYW5kIHRoZXJlZm9yZSBpZ25vcmVkIGJ5IFVSSS5qc1xuXG4gICAgaWYgKHYubWF0Y2goVVJJLmludmFsaWRfaG9zdG5hbWVfY2hhcmFjdGVycykpIHtcbiAgICAgIC8vIHRlc3QgcHVueWNvZGVcbiAgICAgIGlmICghcHVueWNvZGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXSBhbmQgUHVueWNvZGUuanMgaXMgbm90IGF2YWlsYWJsZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAocHVueWNvZGUudG9BU0NJSSh2KS5tYXRjaChVUkkuaW52YWxpZF9ob3N0bmFtZV9jaGFyYWN0ZXJzKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdIb3N0bmFtZSBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05Li1dJyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIG5vQ29uZmxpY3RcbiAgVVJJLm5vQ29uZmxpY3QgPSBmdW5jdGlvbihyZW1vdmVBbGwpIHtcbiAgICBpZiAocmVtb3ZlQWxsKSB7XG4gICAgICB2YXIgdW5jb25mbGljdGVkID0ge1xuICAgICAgICBVUkk6IHRoaXMubm9Db25mbGljdCgpXG4gICAgICB9O1xuXG4gICAgICBpZiAocm9vdC5VUklUZW1wbGF0ZSAmJiB0eXBlb2Ygcm9vdC5VUklUZW1wbGF0ZS5ub0NvbmZsaWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVuY29uZmxpY3RlZC5VUklUZW1wbGF0ZSA9IHJvb3QuVVJJVGVtcGxhdGUubm9Db25mbGljdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAocm9vdC5JUHY2ICYmIHR5cGVvZiByb290LklQdjYubm9Db25mbGljdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB1bmNvbmZsaWN0ZWQuSVB2NiA9IHJvb3QuSVB2Ni5ub0NvbmZsaWN0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyb290LlNlY29uZExldmVsRG9tYWlucyAmJiB0eXBlb2Ygcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMubm9Db25mbGljdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB1bmNvbmZsaWN0ZWQuU2Vjb25kTGV2ZWxEb21haW5zID0gcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMubm9Db25mbGljdCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5jb25mbGljdGVkO1xuICAgIH0gZWxzZSBpZiAocm9vdC5VUkkgPT09IHRoaXMpIHtcbiAgICAgIHJvb3QuVVJJID0gX1VSSTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBwLmJ1aWxkID0gZnVuY3Rpb24oZGVmZXJCdWlsZCkge1xuICAgIGlmIChkZWZlckJ1aWxkID09PSB0cnVlKSB7XG4gICAgICB0aGlzLl9kZWZlcnJlZF9idWlsZCA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChkZWZlckJ1aWxkID09PSB1bmRlZmluZWQgfHwgdGhpcy5fZGVmZXJyZWRfYnVpbGQpIHtcbiAgICAgIHRoaXMuX3N0cmluZyA9IFVSSS5idWlsZCh0aGlzLl9wYXJ0cyk7XG4gICAgICB0aGlzLl9kZWZlcnJlZF9idWlsZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFVSSSh0aGlzKTtcbiAgfTtcblxuICBwLnZhbHVlT2YgPSBwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGQoZmFsc2UpLl9zdHJpbmc7XG4gIH07XG5cblxuICBmdW5jdGlvbiBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKF9wYXJ0KXtcbiAgICByZXR1cm4gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzW19wYXJ0XSB8fCAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BhcnRzW19wYXJ0XSA9IHYgfHwgbnVsbDtcbiAgICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVQcmVmaXhBY2Nlc3NvcihfcGFydCwgX2tleSl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0c1tfcGFydF0gfHwgJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodiAhPT0gbnVsbCkge1xuICAgICAgICAgIHYgPSB2ICsgJyc7XG4gICAgICAgICAgaWYgKHYuY2hhckF0KDApID09PSBfa2V5KSB7XG4gICAgICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFydHNbX3BhcnRdID0gdjtcbiAgICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcC5wcm90b2NvbCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3Byb3RvY29sJyk7XG4gIHAudXNlcm5hbWUgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCd1c2VybmFtZScpO1xuICBwLnBhc3N3b3JkID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcigncGFzc3dvcmQnKTtcbiAgcC5ob3N0bmFtZSA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ2hvc3RuYW1lJyk7XG4gIHAucG9ydCA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3BvcnQnKTtcbiAgcC5xdWVyeSA9IGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoJ3F1ZXJ5JywgJz8nKTtcbiAgcC5mcmFnbWVudCA9IGdlbmVyYXRlUHJlZml4QWNjZXNzb3IoJ2ZyYWdtZW50JywgJyMnKTtcblxuICBwLnNlYXJjaCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgdmFyIHQgPSB0aGlzLnF1ZXJ5KHYsIGJ1aWxkKTtcbiAgICByZXR1cm4gdHlwZW9mIHQgPT09ICdzdHJpbmcnICYmIHQubGVuZ3RoID8gKCc/JyArIHQpIDogdDtcbiAgfTtcbiAgcC5oYXNoID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICB2YXIgdCA9IHRoaXMuZnJhZ21lbnQodiwgYnVpbGQpO1xuICAgIHJldHVybiB0eXBlb2YgdCA9PT0gJ3N0cmluZycgJiYgdC5sZW5ndGggPyAoJyMnICsgdCkgOiB0O1xuICB9O1xuXG4gIHAucGF0aG5hbWUgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3BhcnRzLnBhdGggfHwgKHRoaXMuX3BhcnRzLmhvc3RuYW1lID8gJy8nIDogJycpO1xuICAgICAgcmV0dXJuIHYgPyAodGhpcy5fcGFydHMudXJuID8gVVJJLmRlY29kZVVyblBhdGggOiBVUkkuZGVjb2RlUGF0aCkocmVzKSA6IHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdiA/IFVSSS5yZWNvZGVVcm5QYXRoKHYpIDogJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdiA/IFVSSS5yZWNvZGVQYXRoKHYpIDogJy8nO1xuICAgICAgfVxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnBhdGggPSBwLnBhdGhuYW1lO1xuICBwLmhyZWYgPSBmdW5jdGlvbihocmVmLCBidWlsZCkge1xuICAgIHZhciBrZXk7XG5cbiAgICBpZiAoaHJlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHRoaXMuX3N0cmluZyA9ICcnO1xuICAgIHRoaXMuX3BhcnRzID0gVVJJLl9wYXJ0cygpO1xuXG4gICAgdmFyIF9VUkkgPSBocmVmIGluc3RhbmNlb2YgVVJJO1xuICAgIHZhciBfb2JqZWN0ID0gdHlwZW9mIGhyZWYgPT09ICdvYmplY3QnICYmIChocmVmLmhvc3RuYW1lIHx8IGhyZWYucGF0aCB8fCBocmVmLnBhdGhuYW1lKTtcbiAgICBpZiAoaHJlZi5ub2RlTmFtZSkge1xuICAgICAgdmFyIGF0dHJpYnV0ZSA9IFVSSS5nZXREb21BdHRyaWJ1dGUoaHJlZik7XG4gICAgICBocmVmID0gaHJlZlthdHRyaWJ1dGVdIHx8ICcnO1xuICAgICAgX29iamVjdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHdpbmRvdy5sb2NhdGlvbiBpcyByZXBvcnRlZCB0byBiZSBhbiBvYmplY3QsIGJ1dCBpdCdzIG5vdCB0aGUgc29ydFxuICAgIC8vIG9mIG9iamVjdCB3ZSdyZSBsb29raW5nIGZvcjpcbiAgICAvLyAqIGxvY2F0aW9uLnByb3RvY29sIGVuZHMgd2l0aCBhIGNvbG9uXG4gICAgLy8gKiBsb2NhdGlvbi5xdWVyeSAhPSBvYmplY3Quc2VhcmNoXG4gICAgLy8gKiBsb2NhdGlvbi5oYXNoICE9IG9iamVjdC5mcmFnbWVudFxuICAgIC8vIHNpbXBseSBzZXJpYWxpemluZyB0aGUgdW5rbm93biBvYmplY3Qgc2hvdWxkIGRvIHRoZSB0cmlja1xuICAgIC8vIChmb3IgbG9jYXRpb24sIG5vdCBmb3IgZXZlcnl0aGluZy4uLilcbiAgICBpZiAoIV9VUkkgJiYgX29iamVjdCAmJiBocmVmLnBhdGhuYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGhyZWYgPSBocmVmLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBocmVmID09PSAnc3RyaW5nJyB8fCBocmVmIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICB0aGlzLl9wYXJ0cyA9IFVSSS5wYXJzZShTdHJpbmcoaHJlZiksIHRoaXMuX3BhcnRzKTtcbiAgICB9IGVsc2UgaWYgKF9VUkkgfHwgX29iamVjdCkge1xuICAgICAgdmFyIHNyYyA9IF9VUkkgPyBocmVmLl9wYXJ0cyA6IGhyZWY7XG4gICAgICBmb3IgKGtleSBpbiBzcmMpIHtcbiAgICAgICAgaWYgKGhhc093bi5jYWxsKHRoaXMuX3BhcnRzLCBrZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcGFydHNba2V5XSA9IHNyY1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ludmFsaWQgaW5wdXQnKTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gaWRlbnRpZmljYXRpb24gYWNjZXNzb3JzXG4gIHAuaXMgPSBmdW5jdGlvbih3aGF0KSB7XG4gICAgdmFyIGlwID0gZmFsc2U7XG4gICAgdmFyIGlwNCA9IGZhbHNlO1xuICAgIHZhciBpcDYgPSBmYWxzZTtcbiAgICB2YXIgbmFtZSA9IGZhbHNlO1xuICAgIHZhciBzbGQgPSBmYWxzZTtcbiAgICB2YXIgaWRuID0gZmFsc2U7XG4gICAgdmFyIHB1bnljb2RlID0gZmFsc2U7XG4gICAgdmFyIHJlbGF0aXZlID0gIXRoaXMuX3BhcnRzLnVybjtcblxuICAgIGlmICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgcmVsYXRpdmUgPSBmYWxzZTtcbiAgICAgIGlwNCA9IFVSSS5pcDRfZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIGlwNiA9IFVSSS5pcDZfZXhwcmVzc2lvbi50ZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIGlwID0gaXA0IHx8IGlwNjtcbiAgICAgIG5hbWUgPSAhaXA7XG4gICAgICBzbGQgPSBuYW1lICYmIFNMRCAmJiBTTEQuaGFzKHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIGlkbiA9IG5hbWUgJiYgVVJJLmlkbl9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgcHVueWNvZGUgPSBuYW1lICYmIFVSSS5wdW55Y29kZV9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgIH1cblxuICAgIHN3aXRjaCAod2hhdC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlICdyZWxhdGl2ZSc6XG4gICAgICAgIHJldHVybiByZWxhdGl2ZTtcblxuICAgICAgY2FzZSAnYWJzb2x1dGUnOlxuICAgICAgICByZXR1cm4gIXJlbGF0aXZlO1xuXG4gICAgICAvLyBob3N0bmFtZSBpZGVudGlmaWNhdGlvblxuICAgICAgY2FzZSAnZG9tYWluJzpcbiAgICAgIGNhc2UgJ25hbWUnOlxuICAgICAgICByZXR1cm4gbmFtZTtcblxuICAgICAgY2FzZSAnc2xkJzpcbiAgICAgICAgcmV0dXJuIHNsZDtcblxuICAgICAgY2FzZSAnaXAnOlxuICAgICAgICByZXR1cm4gaXA7XG5cbiAgICAgIGNhc2UgJ2lwNCc6XG4gICAgICBjYXNlICdpcHY0JzpcbiAgICAgIGNhc2UgJ2luZXQ0JzpcbiAgICAgICAgcmV0dXJuIGlwNDtcblxuICAgICAgY2FzZSAnaXA2JzpcbiAgICAgIGNhc2UgJ2lwdjYnOlxuICAgICAgY2FzZSAnaW5ldDYnOlxuICAgICAgICByZXR1cm4gaXA2O1xuXG4gICAgICBjYXNlICdpZG4nOlxuICAgICAgICByZXR1cm4gaWRuO1xuXG4gICAgICBjYXNlICd1cmwnOlxuICAgICAgICByZXR1cm4gIXRoaXMuX3BhcnRzLnVybjtcblxuICAgICAgY2FzZSAndXJuJzpcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fcGFydHMudXJuO1xuXG4gICAgICBjYXNlICdwdW55Y29kZSc6XG4gICAgICAgIHJldHVybiBwdW55Y29kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvLyBjb21wb25lbnQgc3BlY2lmaWMgaW5wdXQgdmFsaWRhdGlvblxuICB2YXIgX3Byb3RvY29sID0gcC5wcm90b2NvbDtcbiAgdmFyIF9wb3J0ID0gcC5wb3J0O1xuICB2YXIgX2hvc3RuYW1lID0gcC5ob3N0bmFtZTtcblxuICBwLnByb3RvY29sID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodikge1xuICAgICAgICAvLyBhY2NlcHQgdHJhaWxpbmcgOi8vXG4gICAgICAgIHYgPSB2LnJlcGxhY2UoLzooXFwvXFwvKT8kLywgJycpO1xuXG4gICAgICAgIGlmICghdi5tYXRjaChVUkkucHJvdG9jb2xfZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm90b2NvbCBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05ListXSBvciBkb2VzblxcJ3Qgc3RhcnQgd2l0aCBbQS1aXScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcHJvdG9jb2wuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG4gIHAuc2NoZW1lID0gcC5wcm90b2NvbDtcbiAgcC5wb3J0ID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh2ID09PSAwKSB7XG4gICAgICAgIHYgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodikge1xuICAgICAgICB2ICs9ICcnO1xuICAgICAgICBpZiAodi5jaGFyQXQoMCkgPT09ICc6Jykge1xuICAgICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2Lm1hdGNoKC9bXjAtOV0vKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BvcnQgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gWzAtOV0nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX3BvcnQuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG4gIHAuaG9zdG5hbWUgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHggPSB7fTtcbiAgICAgIHZhciByZXMgPSBVUkkucGFyc2VIb3N0KHYsIHgpO1xuICAgICAgaWYgKHJlcyAhPT0gJy8nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0hvc3RuYW1lIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuLV0nKTtcbiAgICAgIH1cblxuICAgICAgdiA9IHguaG9zdG5hbWU7XG4gICAgfVxuICAgIHJldHVybiBfaG9zdG5hbWUuY2FsbCh0aGlzLCB2LCBidWlsZCk7XG4gIH07XG5cbiAgLy8gY29tcG91bmQgYWNjZXNzb3JzXG4gIHAub3JpZ2luID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICB2YXIgcGFydHM7XG5cbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwcm90b2NvbCA9IHRoaXMucHJvdG9jb2woKTtcbiAgICAgIHZhciBhdXRob3JpdHkgPSB0aGlzLmF1dGhvcml0eSgpO1xuICAgICAgaWYgKCFhdXRob3JpdHkpIHJldHVybiAnJztcbiAgICAgIHJldHVybiAocHJvdG9jb2wgPyBwcm90b2NvbCArICc6Ly8nIDogJycpICsgdGhpcy5hdXRob3JpdHkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9yaWdpbiA9IFVSSSh2KTtcbiAgICAgIHRoaXNcbiAgICAgICAgLnByb3RvY29sKG9yaWdpbi5wcm90b2NvbCgpKVxuICAgICAgICAuYXV0aG9yaXR5KG9yaWdpbi5hdXRob3JpdHkoKSlcbiAgICAgICAgLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuaG9zdCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUgPyBVUkkuYnVpbGRIb3N0KHRoaXMuX3BhcnRzKSA6ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzID0gVVJJLnBhcnNlSG9zdCh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICBpZiAocmVzICE9PSAnLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXScpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuYXV0aG9yaXR5ID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/IFVSSS5idWlsZEF1dGhvcml0eSh0aGlzLl9wYXJ0cykgOiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlcyA9IFVSSS5wYXJzZUF1dGhvcml0eSh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICBpZiAocmVzICE9PSAnLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXScpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAudXNlcmluZm8gPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy51c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciB0ID0gVVJJLmJ1aWxkVXNlcmluZm8odGhpcy5fcGFydHMpO1xuICAgICAgcmV0dXJuIHQuc3Vic3RyaW5nKDAsIHQubGVuZ3RoIC0xKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZbdi5sZW5ndGgtMV0gIT09ICdAJykge1xuICAgICAgICB2ICs9ICdAJztcbiAgICAgIH1cblxuICAgICAgVVJJLnBhcnNlVXNlcmluZm8odiwgdGhpcy5fcGFydHMpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnJlc291cmNlID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICB2YXIgcGFydHM7XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoKCkgKyB0aGlzLnNlYXJjaCgpICsgdGhpcy5oYXNoKCk7XG4gICAgfVxuXG4gICAgcGFydHMgPSBVUkkucGFyc2Uodik7XG4gICAgdGhpcy5fcGFydHMucGF0aCA9IHBhcnRzLnBhdGg7XG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBwYXJ0cy5xdWVyeTtcbiAgICB0aGlzLl9wYXJ0cy5mcmFnbWVudCA9IHBhcnRzLmZyYWdtZW50O1xuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBmcmFjdGlvbiBhY2Nlc3NvcnNcbiAgcC5zdWJkb21haW4gPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgLy8gY29udmVuaWVuY2UsIHJldHVybiBcInd3d1wiIGZyb20gXCJ3d3cuZXhhbXBsZS5vcmdcIlxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIGdyYWIgZG9tYWluIGFuZCBhZGQgYW5vdGhlciBzZWdtZW50XG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy5kb21haW4oKS5sZW5ndGggLSAxO1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlbmQpIHx8ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMuZG9tYWluKCkubGVuZ3RoO1xuICAgICAgdmFyIHN1YiA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlKTtcbiAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cCgnXicgKyBlc2NhcGVSZWdFeChzdWIpKTtcblxuICAgICAgaWYgKHYgJiYgdi5jaGFyQXQodi5sZW5ndGggLSAxKSAhPT0gJy4nKSB7XG4gICAgICAgIHYgKz0gJy4nO1xuICAgICAgfVxuXG4gICAgICBpZiAodikge1xuICAgICAgICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSh2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmRvbWFpbiA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBjb252ZW5pZW5jZSwgcmV0dXJuIFwiZXhhbXBsZS5vcmdcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiBob3N0bmFtZSBjb25zaXN0cyBvZiAxIG9yIDIgc2VnbWVudHMsIGl0IG11c3QgYmUgdGhlIGRvbWFpblxuICAgICAgdmFyIHQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5tYXRjaCgvXFwuL2cpO1xuICAgICAgaWYgKHQgJiYgdC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZTtcbiAgICAgIH1cblxuICAgICAgLy8gZ3JhYiB0bGQgYW5kIGFkZCBhbm90aGVyIHNlZ21lbnRcbiAgICAgIHZhciBlbmQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sZW5ndGggLSB0aGlzLnRsZChidWlsZCkubGVuZ3RoIC0gMTtcbiAgICAgIGVuZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxhc3RJbmRleE9mKCcuJywgZW5kIC0xKSArIDE7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKGVuZCkgfHwgJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYW5ub3Qgc2V0IGRvbWFpbiBlbXB0eScpO1xuICAgICAgfVxuXG4gICAgICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSh2KTtcblxuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCh0aGlzLmRvbWFpbigpKSArICckJyk7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnRsZCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gXCJvcmdcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIHZhciB0bGQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcocG9zICsgMSk7XG5cbiAgICAgIGlmIChidWlsZCAhPT0gdHJ1ZSAmJiBTTEQgJiYgU0xELmxpc3RbdGxkLnRvTG93ZXJDYXNlKCldKSB7XG4gICAgICAgIHJldHVybiBTTEQuZ2V0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB8fCB0bGQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0bGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXBsYWNlO1xuXG4gICAgICBpZiAoIXYpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2Fubm90IHNldCBUTEQgZW1wdHknKTtcbiAgICAgIH0gZWxzZSBpZiAodi5tYXRjaCgvW15hLXpBLVowLTktXS8pKSB7XG4gICAgICAgIGlmIChTTEQgJiYgU0xELmlzKHYpKSB7XG4gICAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUTEQgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOV0nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ2Nhbm5vdCBzZXQgVExEIG9uIG5vbi1kb21haW4gaG9zdCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5kaXJlY3RvcnkgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSB0cnVlKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnBhdGggJiYgIXRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BhcnRzLnBhdGggPT09ICcvJykge1xuICAgICAgICByZXR1cm4gJy8nO1xuICAgICAgfVxuXG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMucGF0aC5sZW5ndGggLSB0aGlzLmZpbGVuYW1lKCkubGVuZ3RoIC0gMTtcbiAgICAgIHZhciByZXMgPSB0aGlzLl9wYXJ0cy5wYXRoLnN1YnN0cmluZygwLCBlbmQpIHx8ICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/ICcvJyA6ICcnKTtcblxuICAgICAgcmV0dXJuIHYgPyBVUkkuZGVjb2RlUGF0aChyZXMpIDogcmVzO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlID0gdGhpcy5fcGFydHMucGF0aC5sZW5ndGggLSB0aGlzLmZpbGVuYW1lKCkubGVuZ3RoO1xuICAgICAgdmFyIGRpcmVjdG9yeSA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKDAsIGUpO1xuICAgICAgdmFyIHJlcGxhY2UgPSBuZXcgUmVnRXhwKCdeJyArIGVzY2FwZVJlZ0V4KGRpcmVjdG9yeSkpO1xuXG4gICAgICAvLyBmdWxseSBxdWFsaWZpZXIgZGlyZWN0b3JpZXMgYmVnaW4gd2l0aCBhIHNsYXNoXG4gICAgICBpZiAoIXRoaXMuaXMoJ3JlbGF0aXZlJykpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgdiA9ICcvJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2LmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICAgICAgdiA9ICcvJyArIHY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZGlyZWN0b3JpZXMgYWx3YXlzIGVuZCB3aXRoIGEgc2xhc2hcbiAgICAgIGlmICh2ICYmIHYuY2hhckF0KHYubGVuZ3RoIC0gMSkgIT09ICcvJykge1xuICAgICAgICB2ICs9ICcvJztcbiAgICAgIH1cblxuICAgICAgdiA9IFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgdGhpcy5fcGFydHMucGF0aCA9IHRoaXMuX3BhcnRzLnBhdGgucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5maWxlbmFtZSA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCB0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMucGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKHBvcysxKTtcblxuICAgICAgcmV0dXJuIHYgPyBVUkkuZGVjb2RlUGF0aFNlZ21lbnQocmVzKSA6IHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG11dGF0ZWREaXJlY3RvcnkgPSBmYWxzZTtcblxuICAgICAgaWYgKHYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAodi5tYXRjaCgvXFwuP1xcLy8pKSB7XG4gICAgICAgIG11dGF0ZWREaXJlY3RvcnkgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy5maWxlbmFtZSgpKSArICckJyk7XG4gICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuXG4gICAgICBpZiAobXV0YXRlZERpcmVjdG9yeSkge1xuICAgICAgICB0aGlzLm5vcm1hbGl6ZVBhdGgoYnVpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuc3VmZml4ID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5wYXRoIHx8IHRoaXMuX3BhcnRzLnBhdGggPT09ICcvJykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaWxlbmFtZSA9IHRoaXMuZmlsZW5hbWUoKTtcbiAgICAgIHZhciBwb3MgPSBmaWxlbmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgdmFyIHMsIHJlcztcblxuICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBzdWZmaXggbWF5IG9ubHkgY29udGFpbiBhbG51bSBjaGFyYWN0ZXJzICh5dXAsIEkgbWFkZSB0aGlzIHVwLilcbiAgICAgIHMgPSBmaWxlbmFtZS5zdWJzdHJpbmcocG9zKzEpO1xuICAgICAgcmVzID0gKC9eW2EtejAtOSVdKyQvaSkudGVzdChzKSA/IHMgOiAnJztcbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGhTZWdtZW50KHJlcykgOiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gJy4nKSB7XG4gICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN1ZmZpeCA9IHRoaXMuc3VmZml4KCk7XG4gICAgICB2YXIgcmVwbGFjZTtcblxuICAgICAgaWYgKCFzdWZmaXgpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoICs9ICcuJyArIFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgfSBlbHNlIGlmICghdikge1xuICAgICAgICByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCgnLicgKyBzdWZmaXgpICsgJyQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHN1ZmZpeCkgKyAnJCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5zZWdtZW50ID0gZnVuY3Rpb24oc2VnbWVudCwgdiwgYnVpbGQpIHtcbiAgICB2YXIgc2VwYXJhdG9yID0gdGhpcy5fcGFydHMudXJuID8gJzonIDogJy8nO1xuICAgIHZhciBwYXRoID0gdGhpcy5wYXRoKCk7XG4gICAgdmFyIGFic29sdXRlID0gcGF0aC5zdWJzdHJpbmcoMCwgMSkgPT09ICcvJztcbiAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KHNlcGFyYXRvcik7XG5cbiAgICBpZiAoc2VnbWVudCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZWdtZW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHNlZ21lbnQ7XG4gICAgICBzZWdtZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmIChzZWdtZW50ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHNlZ21lbnQgIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBzZWdtZW50IFwiJyArIHNlZ21lbnQgKyAnXCIsIG11c3QgYmUgMC1iYXNlZCBpbnRlZ2VyJyk7XG4gICAgfVxuXG4gICAgaWYgKGFic29sdXRlKSB7XG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH1cblxuICAgIGlmIChzZWdtZW50IDwgMCkge1xuICAgICAgLy8gYWxsb3cgbmVnYXRpdmUgaW5kZXhlcyB0byBhZGRyZXNzIGZyb20gdGhlIGVuZFxuICAgICAgc2VnbWVudCA9IE1hdGgubWF4KHNlZ21lbnRzLmxlbmd0aCArIHNlZ21lbnQsIDApO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8qanNoaW50IGxheGJyZWFrOiB0cnVlICovXG4gICAgICByZXR1cm4gc2VnbWVudCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gc2VnbWVudHNcbiAgICAgICAgOiBzZWdtZW50c1tzZWdtZW50XTtcbiAgICAgIC8qanNoaW50IGxheGJyZWFrOiBmYWxzZSAqL1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudCA9PT0gbnVsbCB8fCBzZWdtZW50c1tzZWdtZW50XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoaXNBcnJheSh2KSkge1xuICAgICAgICBzZWdtZW50cyA9IFtdO1xuICAgICAgICAvLyBjb2xsYXBzZSBlbXB0eSBlbGVtZW50cyB3aXRoaW4gYXJyYXlcbiAgICAgICAgZm9yICh2YXIgaT0wLCBsPXYubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCF2W2ldLmxlbmd0aCAmJiAoIXNlZ21lbnRzLmxlbmd0aCB8fCAhc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0xXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoICYmICFzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLTFdLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VnbWVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VnbWVudHMucHVzaCh0cmltU2xhc2hlcyh2W2ldKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodiB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdiA9IHRyaW1TbGFzaGVzKHYpO1xuICAgICAgICBpZiAoc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0xXSA9PT0gJycpIHtcbiAgICAgICAgICAvLyBlbXB0eSB0cmFpbGluZyBlbGVtZW50cyBoYXZlIHRvIGJlIG92ZXJ3cml0dGVuXG4gICAgICAgICAgLy8gdG8gcHJldmVudCByZXN1bHRzIHN1Y2ggYXMgL2Zvby8vYmFyXG4gICAgICAgICAgc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0xXSA9IHY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudHMucHVzaCh2KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodikge1xuICAgICAgICBzZWdtZW50c1tzZWdtZW50XSA9IHRyaW1TbGFzaGVzKHYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudHMuc3BsaWNlKHNlZ21lbnQsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgc2VnbWVudHMudW5zaGlmdCgnJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGF0aChzZWdtZW50cy5qb2luKHNlcGFyYXRvciksIGJ1aWxkKTtcbiAgfTtcbiAgcC5zZWdtZW50Q29kZWQgPSBmdW5jdGlvbihzZWdtZW50LCB2LCBidWlsZCkge1xuICAgIHZhciBzZWdtZW50cywgaSwgbDtcblxuICAgIGlmICh0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSBzZWdtZW50O1xuICAgICAgc2VnbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzZWdtZW50cyA9IHRoaXMuc2VnbWVudChzZWdtZW50LCB2LCBidWlsZCk7XG4gICAgICBpZiAoIWlzQXJyYXkoc2VnbWVudHMpKSB7XG4gICAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMgIT09IHVuZGVmaW5lZCA/IFVSSS5kZWNvZGUoc2VnbWVudHMpIDogdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHNlZ21lbnRzW2ldID0gVVJJLmRlY29kZShzZWdtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIGlmICghaXNBcnJheSh2KSkge1xuICAgICAgdiA9ICh0eXBlb2YgdiA9PT0gJ3N0cmluZycgfHwgdiBpbnN0YW5jZW9mIFN0cmluZykgPyBVUkkuZW5jb2RlKHYpIDogdjtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gMCwgbCA9IHYubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZbaV0gPSBVUkkuZW5jb2RlKHZbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNlZ21lbnQoc2VnbWVudCwgdiwgYnVpbGQpO1xuICB9O1xuXG4gIC8vIG11dGF0aW5nIHF1ZXJ5IHN0cmluZ1xuICB2YXIgcSA9IHAucXVlcnk7XG4gIHAucXVlcnkgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh2ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgdmFyIHJlc3VsdCA9IHYuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkocmVzdWx0IHx8IGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKHYgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdiAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkodiwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcS5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgICB9XG4gIH07XG4gIHAuc2V0UXVlcnkgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgYnVpbGQpIHtcbiAgICB2YXIgZGF0YSA9IFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcblxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgfHwgbmFtZSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IG51bGw7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgZGF0YVtrZXldID0gbmFtZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5hZGRRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLmFkZFF1ZXJ5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIGJ1aWxkKSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgVVJJLmFkZFF1ZXJ5KGRhdGEsIG5hbWUsIHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogdmFsdWUpO1xuICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkoZGF0YSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBidWlsZCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5yZW1vdmVRdWVyeSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBidWlsZCkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIFVSSS5yZW1vdmVRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSk7XG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLmhhc1F1ZXJ5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgcmV0dXJuIFVSSS5oYXNRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSwgd2l0aGluQXJyYXkpO1xuICB9O1xuICBwLnNldFNlYXJjaCA9IHAuc2V0UXVlcnk7XG4gIHAuYWRkU2VhcmNoID0gcC5hZGRRdWVyeTtcbiAgcC5yZW1vdmVTZWFyY2ggPSBwLnJlbW92ZVF1ZXJ5O1xuICBwLmhhc1NlYXJjaCA9IHAuaGFzUXVlcnk7XG5cbiAgLy8gc2FuaXRpemluZyBVUkxzXG4gIHAubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgLm5vcm1hbGl6ZVByb3RvY29sKGZhbHNlKVxuICAgICAgICAubm9ybWFsaXplUGF0aChmYWxzZSlcbiAgICAgICAgLm5vcm1hbGl6ZVF1ZXJ5KGZhbHNlKVxuICAgICAgICAubm9ybWFsaXplRnJhZ21lbnQoZmFsc2UpXG4gICAgICAgIC5idWlsZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gICAgICAubm9ybWFsaXplUHJvdG9jb2woZmFsc2UpXG4gICAgICAubm9ybWFsaXplSG9zdG5hbWUoZmFsc2UpXG4gICAgICAubm9ybWFsaXplUG9ydChmYWxzZSlcbiAgICAgIC5ub3JtYWxpemVQYXRoKGZhbHNlKVxuICAgICAgLm5vcm1hbGl6ZVF1ZXJ5KGZhbHNlKVxuICAgICAgLm5vcm1hbGl6ZUZyYWdtZW50KGZhbHNlKVxuICAgICAgLmJ1aWxkKCk7XG4gIH07XG4gIHAubm9ybWFsaXplUHJvdG9jb2wgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wcm90b2NvbCA9IHRoaXMuX3BhcnRzLnByb3RvY29sLnRvTG93ZXJDYXNlKCk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplSG9zdG5hbWUgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgaWYgKHRoaXMuaXMoJ0lETicpICYmIHB1bnljb2RlKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXMoJ0lQdjYnKSAmJiBJUHY2KSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gSVB2Ni5iZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZVBvcnQgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIC8vIHJlbW92ZSBwb3J0IG9mIGl0J3MgdGhlIHByb3RvY29sJ3MgZGVmYXVsdFxuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucHJvdG9jb2wgPT09ICdzdHJpbmcnICYmIHRoaXMuX3BhcnRzLnBvcnQgPT09IFVSSS5kZWZhdWx0UG9ydHNbdGhpcy5fcGFydHMucHJvdG9jb2xdKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVQYXRoID0gZnVuY3Rpb24oYnVpbGQpIHtcbiAgICB2YXIgX3BhdGggPSB0aGlzLl9wYXJ0cy5wYXRoO1xuICAgIGlmICghX3BhdGgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSBVUkkucmVjb2RlVXJuUGF0aCh0aGlzLl9wYXJ0cy5wYXRoKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhciBfd2FzX3JlbGF0aXZlO1xuICAgIHZhciBfbGVhZGluZ1BhcmVudHMgPSAnJztcbiAgICB2YXIgX3BhcmVudCwgX3BvcztcblxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRoc1xuICAgIGlmIChfcGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgX3dhc19yZWxhdGl2ZSA9IHRydWU7XG4gICAgICBfcGF0aCA9ICcvJyArIF9wYXRoO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBmaWxlcyAoYXMgb3Bwb3NlZCB0byBkaXJlY3RvcmllcylcbiAgICBpZiAoX3BhdGguc2xpY2UoLTMpID09PSAnLy4uJyB8fCBfcGF0aC5zbGljZSgtMikgPT09ICcvLicpIHtcbiAgICAgIF9wYXRoICs9ICcvJztcbiAgICB9XG5cbiAgICAvLyByZXNvbHZlIHNpbXBsZXNcbiAgICBfcGF0aCA9IF9wYXRoXG4gICAgICAucmVwbGFjZSgvKFxcLyhcXC5cXC8pKyl8KFxcL1xcLiQpL2csICcvJylcbiAgICAgIC5yZXBsYWNlKC9cXC97Mix9L2csICcvJyk7XG5cbiAgICAvLyByZW1lbWJlciBsZWFkaW5nIHBhcmVudHNcbiAgICBpZiAoX3dhc19yZWxhdGl2ZSkge1xuICAgICAgX2xlYWRpbmdQYXJlbnRzID0gX3BhdGguc3Vic3RyaW5nKDEpLm1hdGNoKC9eKFxcLlxcLlxcLykrLykgfHwgJyc7XG4gICAgICBpZiAoX2xlYWRpbmdQYXJlbnRzKSB7XG4gICAgICAgIF9sZWFkaW5nUGFyZW50cyA9IF9sZWFkaW5nUGFyZW50c1swXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXNvbHZlIHBhcmVudHNcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgX3BhcmVudCA9IF9wYXRoLmluZGV4T2YoJy8uLicpO1xuICAgICAgaWYgKF9wYXJlbnQgPT09IC0xKSB7XG4gICAgICAgIC8vIG5vIG1vcmUgLi4vIHRvIHJlc29sdmVcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2UgaWYgKF9wYXJlbnQgPT09IDApIHtcbiAgICAgICAgLy8gdG9wIGxldmVsIGNhbm5vdCBiZSByZWxhdGl2ZSwgc2tpcCBpdFxuICAgICAgICBfcGF0aCA9IF9wYXRoLnN1YnN0cmluZygzKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIF9wb3MgPSBfcGF0aC5zdWJzdHJpbmcoMCwgX3BhcmVudCkubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgIGlmIChfcG9zID09PSAtMSkge1xuICAgICAgICBfcG9zID0gX3BhcmVudDtcbiAgICAgIH1cbiAgICAgIF9wYXRoID0gX3BhdGguc3Vic3RyaW5nKDAsIF9wb3MpICsgX3BhdGguc3Vic3RyaW5nKF9wYXJlbnQgKyAzKTtcbiAgICB9XG5cbiAgICAvLyByZXZlcnQgdG8gcmVsYXRpdmVcbiAgICBpZiAoX3dhc19yZWxhdGl2ZSAmJiB0aGlzLmlzKCdyZWxhdGl2ZScpKSB7XG4gICAgICBfcGF0aCA9IF9sZWFkaW5nUGFyZW50cyArIF9wYXRoLnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICBfcGF0aCA9IFVSSS5yZWNvZGVQYXRoKF9wYXRoKTtcbiAgICB0aGlzLl9wYXJ0cy5wYXRoID0gX3BhdGg7XG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZVBhdGhuYW1lID0gcC5ub3JtYWxpemVQYXRoO1xuICBwLm5vcm1hbGl6ZVF1ZXJ5ID0gZnVuY3Rpb24oYnVpbGQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX3BhcnRzLnF1ZXJ5ID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5xdWVyeS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fcGFydHMucXVlcnkgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5xdWVyeShVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSkpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplRnJhZ21lbnQgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIGlmICghdGhpcy5fcGFydHMuZnJhZ21lbnQpIHtcbiAgICAgIHRoaXMuX3BhcnRzLmZyYWdtZW50ID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVTZWFyY2ggPSBwLm5vcm1hbGl6ZVF1ZXJ5O1xuICBwLm5vcm1hbGl6ZUhhc2ggPSBwLm5vcm1hbGl6ZUZyYWdtZW50O1xuXG4gIHAuaXNvODg1OSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGV4cGVjdCB1bmljb2RlIGlucHV0LCBpc284ODU5IG91dHB1dFxuICAgIHZhciBlID0gVVJJLmVuY29kZTtcbiAgICB2YXIgZCA9IFVSSS5kZWNvZGU7XG5cbiAgICBVUkkuZW5jb2RlID0gZXNjYXBlO1xuICAgIFVSSS5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMubm9ybWFsaXplKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIFVSSS5lbmNvZGUgPSBlO1xuICAgICAgVVJJLmRlY29kZSA9IGQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAudW5pY29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGV4cGVjdCBpc284ODU5IGlucHV0LCB1bmljb2RlIG91dHB1dFxuICAgIHZhciBlID0gVVJJLmVuY29kZTtcbiAgICB2YXIgZCA9IFVSSS5kZWNvZGU7XG5cbiAgICBVUkkuZW5jb2RlID0gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50O1xuICAgIFVSSS5kZWNvZGUgPSB1bmVzY2FwZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5ub3JtYWxpemUoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgVVJJLmVuY29kZSA9IGU7XG4gICAgICBVUkkuZGVjb2RlID0gZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5yZWFkYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1cmkgPSB0aGlzLmNsb25lKCk7XG4gICAgLy8gcmVtb3ZpbmcgdXNlcm5hbWUsIHBhc3N3b3JkLCBiZWNhdXNlIHRoZXkgc2hvdWxkbid0IGJlIGRpc3BsYXllZCBhY2NvcmRpbmcgdG8gUkZDIDM5ODZcbiAgICB1cmkudXNlcm5hbWUoJycpLnBhc3N3b3JkKCcnKS5ub3JtYWxpemUoKTtcbiAgICB2YXIgdCA9ICcnO1xuICAgIGlmICh1cmkuX3BhcnRzLnByb3RvY29sKSB7XG4gICAgICB0ICs9IHVyaS5fcGFydHMucHJvdG9jb2wgKyAnOi8vJztcbiAgICB9XG5cbiAgICBpZiAodXJpLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgaWYgKHVyaS5pcygncHVueWNvZGUnKSAmJiBwdW55Y29kZSkge1xuICAgICAgICB0ICs9IHB1bnljb2RlLnRvVW5pY29kZSh1cmkuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgICAgaWYgKHVyaS5fcGFydHMucG9ydCkge1xuICAgICAgICAgIHQgKz0gJzonICsgdXJpLl9wYXJ0cy5wb3J0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ICs9IHVyaS5ob3N0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHVyaS5fcGFydHMuaG9zdG5hbWUgJiYgdXJpLl9wYXJ0cy5wYXRoICYmIHVyaS5fcGFydHMucGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdCArPSAnLyc7XG4gICAgfVxuXG4gICAgdCArPSB1cmkucGF0aCh0cnVlKTtcbiAgICBpZiAodXJpLl9wYXJ0cy5xdWVyeSkge1xuICAgICAgdmFyIHEgPSAnJztcbiAgICAgIGZvciAodmFyIGkgPSAwLCBxcCA9IHVyaS5fcGFydHMucXVlcnkuc3BsaXQoJyYnKSwgbCA9IHFwLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga3YgPSAocXBbaV0gfHwgJycpLnNwbGl0KCc9Jyk7XG4gICAgICAgIHEgKz0gJyYnICsgVVJJLmRlY29kZVF1ZXJ5KGt2WzBdLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKVxuICAgICAgICAgIC5yZXBsYWNlKC8mL2csICclMjYnKTtcblxuICAgICAgICBpZiAoa3ZbMV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHEgKz0gJz0nICsgVVJJLmRlY29kZVF1ZXJ5KGt2WzFdLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyUyNicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0ICs9ICc/JyArIHEuc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIHQgKz0gVVJJLmRlY29kZVF1ZXJ5KHVyaS5oYXNoKCksIHRydWUpO1xuICAgIHJldHVybiB0O1xuICB9O1xuXG4gIC8vIHJlc29sdmluZyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgVVJMc1xuICBwLmFic29sdXRlVG8gPSBmdW5jdGlvbihiYXNlKSB7XG4gICAgdmFyIHJlc29sdmVkID0gdGhpcy5jbG9uZSgpO1xuICAgIHZhciBwcm9wZXJ0aWVzID0gWydwcm90b2NvbCcsICd1c2VybmFtZScsICdwYXNzd29yZCcsICdob3N0bmFtZScsICdwb3J0J107XG4gICAgdmFyIGJhc2VkaXIsIGksIHA7XG5cbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VSTnMgZG8gbm90IGhhdmUgYW55IGdlbmVyYWxseSBkZWZpbmVkIGhpZXJhcmNoaWNhbCBjb21wb25lbnRzJyk7XG4gICAgfVxuXG4gICAgaWYgKCEoYmFzZSBpbnN0YW5jZW9mIFVSSSkpIHtcbiAgICAgIGJhc2UgPSBuZXcgVVJJKGJhc2UpO1xuICAgIH1cblxuICAgIGlmICghcmVzb2x2ZWQuX3BhcnRzLnByb3RvY29sKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHMucHJvdG9jb2wgPSBiYXNlLl9wYXJ0cy5wcm90b2NvbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyAocCA9IHByb3BlcnRpZXNbaV0pOyBpKyspIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0c1twXSA9IGJhc2UuX3BhcnRzW3BdO1xuICAgIH1cblxuICAgIGlmICghcmVzb2x2ZWQuX3BhcnRzLnBhdGgpIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wYXRoID0gYmFzZS5fcGFydHMucGF0aDtcbiAgICAgIGlmICghcmVzb2x2ZWQuX3BhcnRzLnF1ZXJ5KSB7XG4gICAgICAgIHJlc29sdmVkLl9wYXJ0cy5xdWVyeSA9IGJhc2UuX3BhcnRzLnF1ZXJ5O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmVzb2x2ZWQuX3BhcnRzLnBhdGguc3Vic3RyaW5nKC0yKSA9PT0gJy4uJykge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnBhdGggKz0gJy8nO1xuICAgIH1cblxuICAgIGlmIChyZXNvbHZlZC5wYXRoKCkuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgIGJhc2VkaXIgPSBiYXNlLmRpcmVjdG9yeSgpO1xuICAgICAgYmFzZWRpciA9IGJhc2VkaXIgPyBiYXNlZGlyIDogYmFzZS5wYXRoKCkuaW5kZXhPZignLycpID09PSAwID8gJy8nIDogJyc7XG4gICAgICByZXNvbHZlZC5fcGFydHMucGF0aCA9IChiYXNlZGlyID8gKGJhc2VkaXIgKyAnLycpIDogJycpICsgcmVzb2x2ZWQuX3BhcnRzLnBhdGg7XG4gICAgICByZXNvbHZlZC5ub3JtYWxpemVQYXRoKCk7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWQuYnVpbGQoKTtcbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gIH07XG4gIHAucmVsYXRpdmVUbyA9IGZ1bmN0aW9uKGJhc2UpIHtcbiAgICB2YXIgcmVsYXRpdmUgPSB0aGlzLmNsb25lKCkubm9ybWFsaXplKCk7XG4gICAgdmFyIHJlbGF0aXZlUGFydHMsIGJhc2VQYXJ0cywgY29tbW9uLCByZWxhdGl2ZVBhdGgsIGJhc2VQYXRoO1xuXG4gICAgaWYgKHJlbGF0aXZlLl9wYXJ0cy51cm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVVJOcyBkbyBub3QgaGF2ZSBhbnkgZ2VuZXJhbGx5IGRlZmluZWQgaGllcmFyY2hpY2FsIGNvbXBvbmVudHMnKTtcbiAgICB9XG5cbiAgICBiYXNlID0gbmV3IFVSSShiYXNlKS5ub3JtYWxpemUoKTtcbiAgICByZWxhdGl2ZVBhcnRzID0gcmVsYXRpdmUuX3BhcnRzO1xuICAgIGJhc2VQYXJ0cyA9IGJhc2UuX3BhcnRzO1xuICAgIHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlLnBhdGgoKTtcbiAgICBiYXNlUGF0aCA9IGJhc2UucGF0aCgpO1xuXG4gICAgaWYgKHJlbGF0aXZlUGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVUkkgaXMgYWxyZWFkeSByZWxhdGl2ZScpO1xuICAgIH1cblxuICAgIGlmIChiYXNlUGF0aC5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsY3VsYXRlIGEgVVJJIHJlbGF0aXZlIHRvIGFub3RoZXIgcmVsYXRpdmUgVVJJJyk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMucHJvdG9jb2wgPT09IGJhc2VQYXJ0cy5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmVQYXJ0cy5wcm90b2NvbCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMudXNlcm5hbWUgIT09IGJhc2VQYXJ0cy51c2VybmFtZSB8fCByZWxhdGl2ZVBhcnRzLnBhc3N3b3JkICE9PSBiYXNlUGFydHMucGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhcnRzLnByb3RvY29sICE9PSBudWxsIHx8IHJlbGF0aXZlUGFydHMudXNlcm5hbWUgIT09IG51bGwgfHwgcmVsYXRpdmVQYXJ0cy5wYXNzd29yZCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMuaG9zdG5hbWUgPT09IGJhc2VQYXJ0cy5ob3N0bmFtZSAmJiByZWxhdGl2ZVBhcnRzLnBvcnQgPT09IGJhc2VQYXJ0cy5wb3J0KSB7XG4gICAgICByZWxhdGl2ZVBhcnRzLmhvc3RuYW1lID0gbnVsbDtcbiAgICAgIHJlbGF0aXZlUGFydHMucG9ydCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIGlmIChyZWxhdGl2ZVBhdGggPT09IGJhc2VQYXRoKSB7XG4gICAgICByZWxhdGl2ZVBhcnRzLnBhdGggPSAnJztcbiAgICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICAgIH1cblxuICAgIC8vIGRldGVybWluZSBjb21tb24gc3ViIHBhdGhcbiAgICBjb21tb24gPSBVUkkuY29tbW9uUGF0aChyZWxhdGl2ZVBhdGgsIGJhc2VQYXRoKTtcblxuICAgIC8vIElmIHRoZSBwYXRocyBoYXZlIG5vdGhpbmcgaW4gY29tbW9uLCByZXR1cm4gYSByZWxhdGl2ZSBVUkwgd2l0aCB0aGUgYWJzb2x1dGUgcGF0aC5cbiAgICBpZiAoIWNvbW1vbikge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgdmFyIHBhcmVudHMgPSBiYXNlUGFydHMucGF0aFxuICAgICAgLnN1YnN0cmluZyhjb21tb24ubGVuZ3RoKVxuICAgICAgLnJlcGxhY2UoL1teXFwvXSokLywgJycpXG4gICAgICAucmVwbGFjZSgvLio/XFwvL2csICcuLi8nKTtcblxuICAgIHJlbGF0aXZlUGFydHMucGF0aCA9IChwYXJlbnRzICsgcmVsYXRpdmVQYXJ0cy5wYXRoLnN1YnN0cmluZyhjb21tb24ubGVuZ3RoKSkgfHwgJy4vJztcblxuICAgIHJldHVybiByZWxhdGl2ZS5idWlsZCgpO1xuICB9O1xuXG4gIC8vIGNvbXBhcmluZyBVUklzXG4gIHAuZXF1YWxzID0gZnVuY3Rpb24odXJpKSB7XG4gICAgdmFyIG9uZSA9IHRoaXMuY2xvbmUoKTtcbiAgICB2YXIgdHdvID0gbmV3IFVSSSh1cmkpO1xuICAgIHZhciBvbmVfbWFwID0ge307XG4gICAgdmFyIHR3b19tYXAgPSB7fTtcbiAgICB2YXIgY2hlY2tlZCA9IHt9O1xuICAgIHZhciBvbmVfcXVlcnksIHR3b19xdWVyeSwga2V5O1xuXG4gICAgb25lLm5vcm1hbGl6ZSgpO1xuICAgIHR3by5ub3JtYWxpemUoKTtcblxuICAgIC8vIGV4YWN0IG1hdGNoXG4gICAgaWYgKG9uZS50b1N0cmluZygpID09PSB0d28udG9TdHJpbmcoKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gZXh0cmFjdCBxdWVyeSBzdHJpbmdcbiAgICBvbmVfcXVlcnkgPSBvbmUucXVlcnkoKTtcbiAgICB0d29fcXVlcnkgPSB0d28ucXVlcnkoKTtcbiAgICBvbmUucXVlcnkoJycpO1xuICAgIHR3by5xdWVyeSgnJyk7XG5cbiAgICAvLyBkZWZpbml0ZWx5IG5vdCBlcXVhbCBpZiBub3QgZXZlbiBub24tcXVlcnkgcGFydHMgbWF0Y2hcbiAgICBpZiAob25lLnRvU3RyaW5nKCkgIT09IHR3by50b1N0cmluZygpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcXVlcnkgcGFyYW1ldGVycyBoYXZlIHRoZSBzYW1lIGxlbmd0aCwgZXZlbiBpZiB0aGV5J3JlIHBlcm11dGVkXG4gICAgaWYgKG9uZV9xdWVyeS5sZW5ndGggIT09IHR3b19xdWVyeS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvbmVfbWFwID0gVVJJLnBhcnNlUXVlcnkob25lX3F1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICB0d29fbWFwID0gVVJJLnBhcnNlUXVlcnkodHdvX3F1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcblxuICAgIGZvciAoa2V5IGluIG9uZV9tYXApIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbChvbmVfbWFwLCBrZXkpKSB7XG4gICAgICAgIGlmICghaXNBcnJheShvbmVfbWFwW2tleV0pKSB7XG4gICAgICAgICAgaWYgKG9uZV9tYXBba2V5XSAhPT0gdHdvX21hcFtrZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFhcnJheXNFcXVhbChvbmVfbWFwW2tleV0sIHR3b19tYXBba2V5XSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjaGVja2VkW2tleV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoa2V5IGluIHR3b19tYXApIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbCh0d29fbWFwLCBrZXkpKSB7XG4gICAgICAgIGlmICghY2hlY2tlZFtrZXldKSB7XG4gICAgICAgICAgLy8gdHdvIGNvbnRhaW5zIGEgcGFyYW1ldGVyIG5vdCBwcmVzZW50IGluIG9uZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIHN0YXRlXG4gIHAuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gZnVuY3Rpb24odikge1xuICAgIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycyA9ICEhdjtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBwLmVzY2FwZVF1ZXJ5U3BhY2UgPSBmdW5jdGlvbih2KSB7XG4gICAgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSA9ICEhdjtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gVVJJO1xufSkpO1xuIiwiLyohIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjIuMyBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teIC1+XS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9cXHgyRXxcXHUzMDAyfFxcdUZGMEV8XFx1RkY2MS9nLCAvLyBSRkMgMzQ5MCBzZXBhcmF0b3JzXG5cblx0LyoqIEVycm9yIG1lc3NhZ2VzICovXG5cdGVycm9ycyA9IHtcblx0XHQnb3ZlcmZsb3cnOiAnT3ZlcmZsb3c6IGlucHV0IG5lZWRzIHdpZGVyIGludGVnZXJzIHRvIHByb2Nlc3MnLFxuXHRcdCdub3QtYmFzaWMnOiAnSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KScsXG5cdFx0J2ludmFsaWQtaW5wdXQnOiAnSW52YWxpZCBpbnB1dCdcblx0fSxcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0Zmxvb3IgPSBNYXRoLmZsb29yLFxuXHRzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgZXJyb3IgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtFcnJvcn0gVGhyb3dzIGEgYFJhbmdlRXJyb3JgIHdpdGggdGhlIGFwcGxpY2FibGUgZXJyb3IgbWVzc2FnZS5cblx0ICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdGFycmF5W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFycmF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHRyZXR1cm4gbWFwKHN0cmluZy5zcGxpdChyZWdleFNlcGFyYXRvcnMpLCBmbikuam9pbignLicpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgbGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgdG8gYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgdG8gVW5pY29kZS4gT25seSB0aGVcblx0ICogUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLiBpdCBkb2Vzbid0XG5cdCAqIG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gY29udmVydGVkIHRvXG5cdCAqIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBQdW55Y29kZSBkb21haW4gbmFtZSB0byBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoZG9tYWluKSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihkb21haW4sIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIHRvIFB1bnljb2RlLiBPbmx5IHRoZVxuXHQgKiBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLCBpLmUuIGl0IGRvZXNuJ3Rcblx0ICogbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW4gQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSB0byBjb252ZXJ0LCBhcyBhIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShkb21haW4pIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGRvbWFpbiwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuMi4zJyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fVx0ZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2hlbHBlcnNFdmVudE9iamVjdCA9IHJlcXVpcmUoJy4vaGVscGVycy9ldmVudC1vYmplY3QnKTtcblxudmFyIF9oZWxwZXJzRXZlbnRPYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0V2ZW50T2JqZWN0KTtcblxudmFyIF9oZWxwZXJzRW52aXJvbm1lbnRDaGVjayA9IHJlcXVpcmUoJy4vaGVscGVycy9lbnZpcm9ubWVudC1jaGVjaycpO1xuXG52YXIgX2hlbHBlcnNFbnZpcm9ubWVudENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNFbnZpcm9ubWVudENoZWNrKTtcblxuLypcbiogTmF0aXZlbHkgeW91IGNhbm5vdCBzZXQgb3IgbW9kaWZ5IHRoZSBwcm9wZXJ0aWVzOiB0YXJnZXQsIHNyY0VsZW1lbnQsIGFuZCBjdXJyZW50VGFyZ2V0IG9uIEV2ZW50IG9yXG4qIE1lc3NhZ2VFdmVudCBvYmplY3RzLiBTbyBpbiBvcmRlciB0byBzZXQgdGhlbSB0byB0aGUgY29ycmVjdCB2YWx1ZXMgd2UgXCJvdmVyd3JpdGVcIiB0aGVtIHRvIHRoZSBzYW1lXG4qIHByb3BlcnR5IGJ1dCB3aXRob3V0IHRoZSByZXN0cmljdGlvbiBvZiBub3Qgd3JpdGFibGUuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBldmVudCAtIGFuIGV2ZW50IG9iamVjdCB0byBleHRlbmRcbiogQHBhcmFtIHtvYmplY3R9IHRhcmdldCAtIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBiZSBzZXQgZm9yIHRhcmdldCwgc3JjRWxlbWVudCwgYW5kIGN1cnJlbnRUYXJnZXRcbiovXG5mdW5jdGlvbiBleHRlbmRFdmVudChldmVudCwgdGFyZ2V0KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV2ZW50LCB7XG4gICAgdGFyZ2V0OiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgc3JjRWxlbWVudDoge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIGN1cnJlbnRUYXJnZXQ6IHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcblxuICBpZiAodGFyZ2V0KSB7XG4gICAgZXZlbnQudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGV2ZW50LnNyY0VsZW1lbnQgPSB0YXJnZXQ7XG4gICAgZXZlbnQuY3VycmVudFRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBldmVudDtcbn1cblxuLypcbiAqIFRoaXMgd2lsbCByZXR1cm4gZWl0aGVyIHRoZSBuYXRpdmUgRXZlbnQvTWVzc2FnZUV2ZW50L0Nsb3NlRXZlbnRcbiAqIGlmIHdlIGFyZSBpbiB0aGUgYnJvd3NlciBvciBpdCB3aWxsIHJldHVybiB0aGUgbW9ja2VkIGV2ZW50LlxuICovXG5mdW5jdGlvbiBldmVudEZhY3RvcnkoZXZlbnRDbGFzc05hbWUsIHR5cGUsIGNvbmZpZykge1xuICBpZiAoIV9oZWxwZXJzRW52aXJvbm1lbnRDaGVjazJbJ2RlZmF1bHQnXS5nbG9iYWxDb250ZXh0W2V2ZW50Q2xhc3NOYW1lXSkge1xuICAgIHJldHVybiBuZXcgX2hlbHBlcnNFdmVudE9iamVjdDJbJ2RlZmF1bHQnXSh7IHR5cGU6IHR5cGUgfSk7XG4gIH1cblxuICBpZiAoIWNvbmZpZykge1xuICAgIHJldHVybiBuZXcgX2hlbHBlcnNFbnZpcm9ubWVudENoZWNrMlsnZGVmYXVsdCddLmdsb2JhbENvbnRleHRbZXZlbnRDbGFzc05hbWVdKHR5cGUpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBfaGVscGVyc0Vudmlyb25tZW50Q2hlY2syWydkZWZhdWx0J10uZ2xvYmFsQ29udGV4dFtldmVudENsYXNzTmFtZV0odHlwZSwgY29uZmlnKTtcbn1cblxuLypcbiogQ3JlYXRlcyBhbiBFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnIHlvdSB3aWxsIG5lZWQgdG8gcGFzcyB0eXBlIGFuZCBvcHRpb25hbGx5IHRhcmdldFxuKi9cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGNvbmZpZykge1xuICB2YXIgdHlwZSA9IGNvbmZpZy50eXBlO1xuICB2YXIgdGFyZ2V0ID0gY29uZmlnLnRhcmdldDtcblxuICB2YXIgZXZlbnQgPSBldmVudEZhY3RvcnkoJ0V2ZW50JywgdHlwZSk7XG5cbiAgaWYgKCFldmVudC5wYXRoKSB7XG4gICAgZXZlbnQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGV2ZW50KSk7XG4gIH1cblxuICByZXR1cm4gZXh0ZW5kRXZlbnQoZXZlbnQsIHRhcmdldCk7XG59XG5cbi8qXG4qIENyZWF0ZXMgYSBNZXNzYWdlRXZlbnQgb2JqZWN0IGFuZCBleHRlbmRzIGl0IHRvIGFsbG93IGZ1bGwgbW9kaWZpY2F0aW9uIG9mXG4qIGl0cyBwcm9wZXJ0aWVzLlxuKlxuKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gd2l0aGluIGNvbmZpZyB5b3Ugd2lsbCBuZWVkIHRvIHBhc3MgdHlwZSwgb3JpZ2luLCBkYXRhIGFuZCBvcHRpb25hbGx5IHRhcmdldFxuKi9cbmZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VFdmVudChjb25maWcpIHtcbiAgdmFyIHR5cGUgPSBjb25maWcudHlwZTtcbiAgdmFyIG9yaWdpbiA9IGNvbmZpZy5vcmlnaW47XG4gIHZhciBkYXRhID0gY29uZmlnLmRhdGE7XG4gIHZhciB0YXJnZXQgPSBjb25maWcudGFyZ2V0O1xuXG4gIHZhciBtZXNzYWdlRXZlbnQgPSBldmVudEZhY3RvcnkoJ01lc3NhZ2VFdmVudCcsIHR5cGUpO1xuXG4gIGlmICghbWVzc2FnZUV2ZW50LnBhdGgpIHtcbiAgICBtZXNzYWdlRXZlbnQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2VFdmVudCkpO1xuICB9XG5cbiAgZXh0ZW5kRXZlbnQobWVzc2FnZUV2ZW50LCB0YXJnZXQpO1xuXG4gIGlmIChtZXNzYWdlRXZlbnQuaW5pdE1lc3NhZ2VFdmVudCkge1xuICAgIG1lc3NhZ2VFdmVudC5pbml0TWVzc2FnZUV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSwgZGF0YSwgb3JpZ2luLCAnJyk7XG4gIH0gZWxzZSB7XG4gICAgbWVzc2FnZUV2ZW50LmRhdGEgPSBkYXRhO1xuICAgIG1lc3NhZ2VFdmVudC5vcmlnaW4gPSBvcmlnaW47XG4gIH1cblxuICByZXR1cm4gbWVzc2FnZUV2ZW50O1xufVxuXG4vKlxuKiBDcmVhdGVzIGEgQ2xvc2VFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnIHlvdSB3aWxsIG5lZWQgdG8gcGFzcyB0eXBlIGFuZCBvcHRpb25hbGx5IHRhcmdldCwgY29kZSwgYW5kIHJlYXNvblxuKi9cbmZ1bmN0aW9uIGNyZWF0ZUNsb3NlRXZlbnQoY29uZmlnKSB7XG4gIHZhciBjb2RlID0gY29uZmlnLmNvZGU7XG4gIHZhciByZWFzb24gPSBjb25maWcucmVhc29uO1xuICB2YXIgdHlwZSA9IGNvbmZpZy50eXBlO1xuICB2YXIgdGFyZ2V0ID0gY29uZmlnLnRhcmdldDtcbiAgdmFyIHdhc0NsZWFuID0gY29uZmlnLndhc0NsZWFuO1xuXG4gIGlmICghd2FzQ2xlYW4pIHtcbiAgICB3YXNDbGVhbiA9IGNvZGUgPT09IDEwMDA7XG4gIH1cblxuICB2YXIgY2xvc2VFdmVudCA9IGV2ZW50RmFjdG9yeSgnQ2xvc2VFdmVudCcsIHR5cGUsIHtcbiAgICBjb2RlOiBjb2RlLFxuICAgIHJlYXNvbjogcmVhc29uLFxuICAgIHdhc0NsZWFuOiB3YXNDbGVhblxuICB9KTtcblxuICBpZiAoIWNsb3NlRXZlbnQucGF0aCB8fCAhY2xvc2VFdmVudC5jb2RlKSB7XG4gICAgY2xvc2VFdmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY2xvc2VFdmVudCkpO1xuICAgIGNsb3NlRXZlbnQuY29kZSA9IGNvZGUgfHwgMDtcbiAgICBjbG9zZUV2ZW50LnJlYXNvbiA9IHJlYXNvbiB8fCAnJztcbiAgICBjbG9zZUV2ZW50Lndhc0NsZWFuID0gd2FzQ2xlYW47XG4gIH1cblxuICByZXR1cm4gZXh0ZW5kRXZlbnQoY2xvc2VFdmVudCwgdGFyZ2V0KTtcbn1cblxuZXhwb3J0cy5jcmVhdGVFdmVudCA9IGNyZWF0ZUV2ZW50O1xuZXhwb3J0cy5jcmVhdGVNZXNzYWdlRXZlbnQgPSBjcmVhdGVNZXNzYWdlRXZlbnQ7XG5leHBvcnRzLmNyZWF0ZUNsb3NlRXZlbnQgPSBjcmVhdGVDbG9zZUV2ZW50OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX2hlbHBlcnNBcnJheUhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMvYXJyYXktaGVscGVycycpO1xuXG4vKlxuKiBFdmVudFRhcmdldCBpcyBhbiBpbnRlcmZhY2UgaW1wbGVtZW50ZWQgYnkgb2JqZWN0cyB0aGF0IGNhblxuKiByZWNlaXZlIGV2ZW50cyBhbmQgbWF5IGhhdmUgbGlzdGVuZXJzIGZvciB0aGVtLlxuKlxuKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXRcbiovXG5cbnZhciBFdmVudFRhcmdldCA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEV2ZW50VGFyZ2V0KCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFdmVudFRhcmdldCk7XG5cbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICB9XG5cbiAgLypcbiAgKiBUaWVzIGEgbGlzdGVuZXIgZnVuY3Rpb24gdG8gYSBldmVudCB0eXBlIHdoaWNoIGNhbiBsYXRlciBiZSBpbnZva2VkIHZpYSB0aGVcbiAgKiBkaXNwYXRjaEV2ZW50IG1ldGhvZC5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZXZlbnQgKGllOiAnb3BlbicsICdtZXNzYWdlJywgZXRjLilcbiAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lciAtIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugd2hlbmV2ZXIgYSBldmVudCBpcyBkaXNwYXRjaGVkIG1hdGNoaW5nIHRoZSBnaXZlbiB0eXBlXG4gICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlIC0gTi9BIFRPRE86IGltcGxlbWVudCB1c2VDYXB0dXJlIGZ1bmN0aW9uYWxpdHlcbiAgKi9cblxuICBfY3JlYXRlQ2xhc3MoRXZlbnRUYXJnZXQsIFt7XG4gICAga2V5OiAnYWRkRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIgLyogLCB1c2VDYXB0dXJlICovKSB7XG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLmxpc3RlbmVyc1t0eXBlXSkpIHtcbiAgICAgICAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT25seSBhZGQgdGhlIHNhbWUgZnVuY3Rpb24gb25jZVxuICAgICAgICBpZiAoKDAsIF9oZWxwZXJzQXJyYXlIZWxwZXJzLmZpbHRlcikodGhpcy5saXN0ZW5lcnNbdHlwZV0sIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0gPT09IGxpc3RlbmVyO1xuICAgICAgICB9KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIHRoZSBsaXN0ZW5lciBzbyBpdCB3aWxsIG5vIGxvbmdlciBiZSBpbnZva2VkIHZpYSB0aGUgZGlzcGF0Y2hFdmVudCBtZXRob2QuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBldmVudCAoaWU6ICdvcGVuJywgJ21lc3NhZ2UnLCBldGMuKVxuICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgLSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW5ldmVyIGEgZXZlbnQgaXMgZGlzcGF0Y2hlZCBtYXRjaGluZyB0aGUgZ2l2ZW4gdHlwZVxuICAgICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlIC0gTi9BIFRPRE86IGltcGxlbWVudCB1c2VDYXB0dXJlIGZ1bmN0aW9uYWxpdHlcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgcmVtb3ZpbmdMaXN0ZW5lciAvKiAsIHVzZUNhcHR1cmUgKi8pIHtcbiAgICAgIHZhciBhcnJheU9mTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbdHlwZV07XG4gICAgICB0aGlzLmxpc3RlbmVyc1t0eXBlXSA9ICgwLCBfaGVscGVyc0FycmF5SGVscGVycy5yZWplY3QpKGFycmF5T2ZMaXN0ZW5lcnMsIGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gbGlzdGVuZXIgPT09IHJlbW92aW5nTGlzdGVuZXI7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogSW52b2tlcyBhbGwgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgYXJlIGxpc3RlbmluZyB0byB0aGUgZ2l2ZW4gZXZlbnQudHlwZSBwcm9wZXJ0eS4gRWFjaFxuICAgICogbGlzdGVuZXIgd2lsbCBiZSBwYXNzZWQgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gYWxsIGxpc3RlbmVycyBvZiB0aGUgZXZlbnQudHlwZSBwcm9wZXJ0eVxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdkaXNwYXRjaEV2ZW50JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGN1c3RvbUFyZ3VtZW50cyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgY3VzdG9tQXJndW1lbnRzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgdmFyIGV2ZW50TmFtZSA9IGV2ZW50LnR5cGU7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnROYW1lXTtcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGN1c3RvbUFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdGVuZXIuYXBwbHkoX3RoaXMsIGN1c3RvbUFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbChfdGhpcywgZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gRXZlbnRUYXJnZXQ7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBFdmVudFRhcmdldDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5yZWplY3QgPSByZWplY3Q7XG5leHBvcnRzLmZpbHRlciA9IGZpbHRlcjtcblxuZnVuY3Rpb24gcmVqZWN0KGFycmF5LCBjYWxsYmFjaykge1xuICB2YXIgcmVzdWx0cyA9IFtdO1xuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtSW5BcnJheSkge1xuICAgIGlmICghY2FsbGJhY2soaXRlbUluQXJyYXkpKSB7XG4gICAgICByZXN1bHRzLnB1c2goaXRlbUluQXJyYXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbmZ1bmN0aW9uIGZpbHRlcihhcnJheSwgY2FsbGJhY2spIHtcbiAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbUluQXJyYXkpIHtcbiAgICBpZiAoY2FsbGJhY2soaXRlbUluQXJyYXkpKSB7XG4gICAgICByZXN1bHRzLnB1c2goaXRlbUluQXJyYXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59IiwiLypcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0Nsb3NlRXZlbnRcbiovXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBjb2RlcyA9IHtcbiAgQ0xPU0VfTk9STUFMOiAxMDAwLFxuICBDTE9TRV9HT0lOR19BV0FZOiAxMDAxLFxuICBDTE9TRV9QUk9UT0NPTF9FUlJPUjogMTAwMixcbiAgQ0xPU0VfVU5TVVBQT1JURUQ6IDEwMDMsXG4gIENMT1NFX05PX1NUQVRVUzogMTAwNSxcbiAgQ0xPU0VfQUJOT1JNQUw6IDEwMDYsXG4gIENMT1NFX1RPT19MQVJHRTogMTAwOVxufTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb2Rlcztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiLypcbiogVGhpcyBkZWxheSBhbGxvd3MgdGhlIHRocmVhZCB0byBmaW5pc2ggYXNzaWduaW5nIGl0cyBvbiogbWV0aG9kc1xuKiBiZWZvcmUgaW52b2tpbmcgdGhlIGRlbGF5IGNhbGxiYWNrLiBUaGlzIGlzIHB1cmVseSBhIHRpbWluZyBoYWNrLlxuKiBodHRwOi8vZ2Vla2FieXRlLmJsb2dzcG90LmNvbS8yMDE0LzAxL2phdmFzY3JpcHQtZWZmZWN0LW9mLXNldHRpbmctc2V0dGltZW91dC5odG1sXG4qXG4qIEBwYXJhbSB7Y2FsbGJhY2s6IGZ1bmN0aW9ufSB0aGUgY2FsbGJhY2sgd2hpY2ggd2lsbCBiZSBpbnZva2VkIGFmdGVyIHRoZSB0aW1lb3V0XG4qIEBwYXJtYSB7Y29udGV4dDogb2JqZWN0fSB0aGUgY29udGV4dCBpbiB3aGljaCB0byBpbnZva2UgdGhlIGZ1bmN0aW9uXG4qL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5mdW5jdGlvbiBkZWxheShjYWxsYmFjaywgY29udGV4dCkge1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uIHRpbWVvdXQodGltZW91dENvbnRleHQpIHtcbiAgICBjYWxsYmFjay5jYWxsKHRpbWVvdXRDb250ZXh0KTtcbiAgfSwgNCwgY29udGV4dCk7XG59XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZGVsYXk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5mdW5jdGlvbiBpc05vZGUoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSB7XG4gIGdsb2JhbENvbnRleHQ6IGlzTm9kZSgpID8gZ2xvYmFsIDogd2luZG93LFxuICBpc05vZGU6IGlzTm9kZVxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5mdW5jdGlvbiBOb2RlRXZlbnQoY29uZmlnKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdmFyIGV2ZW50ID0ge1xuICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgIGNhbmNlbEJ1YmxsZTogZmFsc2UsXG4gICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdFByZXZlbnRlZDogZmFsc2UsXG4gICAgZXZlbnRQaGFzZTogMCxcbiAgICBwYXRoOiBbXSxcbiAgICByZXR1cm5WYWx1ZTogdHJ1ZSxcbiAgICB0aW1lU3RhbXA6IERhdGUubm93KCksXG4gICAgdHlwZTogY29uZmlnLnR5cGUsXG4gICAgbGFzdEV2ZW50SWQ6ICcnXG4gIH07XG5cbiAgT2JqZWN0LmtleXMoZXZlbnQpLmZvckVhY2goZnVuY3Rpb24gKGtleU5hbWUpIHtcbiAgICBfdGhpc1trZXlOYW1lXSA9IGV2ZW50W2tleU5hbWVdO1xuICB9KTtcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0gTm9kZUV2ZW50O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3NlcnZlciA9IHJlcXVpcmUoJy4vc2VydmVyJyk7XG5cbnZhciBfc2VydmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NlcnZlcik7XG5cbnZhciBfd2Vic29ja2V0ID0gcmVxdWlyZSgnLi93ZWJzb2NrZXQnKTtcblxudmFyIF93ZWJzb2NrZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2Vic29ja2V0KTtcblxudmFyIF9zb2NrZXRJbyA9IHJlcXVpcmUoJy4vc29ja2V0LWlvJyk7XG5cbnZhciBfc29ja2V0SW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc29ja2V0SW8pO1xuXG52YXIgX2hlbHBlcnNFbnZpcm9ubWVudENoZWNrID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Vudmlyb25tZW50LWNoZWNrJyk7XG5cbnZhciBfaGVscGVyc0Vudmlyb25tZW50Q2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0Vudmlyb25tZW50Q2hlY2spO1xuXG52YXIgZ2xvYmFsQ29udGV4dCA9IF9oZWxwZXJzRW52aXJvbm1lbnRDaGVjazJbJ2RlZmF1bHQnXS5nbG9iYWxDb250ZXh0O1xuXG5nbG9iYWxDb250ZXh0Lk1vY2tTZXJ2ZXIgPSBfc2VydmVyMlsnZGVmYXVsdCddO1xuZ2xvYmFsQ29udGV4dC5Nb2NrV2ViU29ja2V0ID0gX3dlYnNvY2tldDJbJ2RlZmF1bHQnXTtcbmdsb2JhbENvbnRleHQuTW9ja1NvY2tldElPID0gX3NvY2tldElvMlsnZGVmYXVsdCddO1xuXG52YXIgU2VydmVyID0gX3NlcnZlcjJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuU2VydmVyID0gU2VydmVyO1xudmFyIFdlYlNvY2tldCA9IF93ZWJzb2NrZXQyWydkZWZhdWx0J107XG5leHBvcnRzLldlYlNvY2tldCA9IFdlYlNvY2tldDtcbnZhciBTb2NrZXRJTyA9IF9zb2NrZXRJbzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuU29ja2V0SU8gPSBTb2NrZXRJTzsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9oZWxwZXJzQXJyYXlIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2FycmF5LWhlbHBlcnMnKTtcblxuLypcbiogVGhlIG5ldHdvcmsgYnJpZGdlIGlzIGEgd2F5IGZvciB0aGUgbW9jayB3ZWJzb2NrZXQgb2JqZWN0IHRvICdjb21tdW5pY2F0ZScgd2l0aFxuKiBhbGwgYXZhbGlibGUgc2VydmVycy4gVGhpcyBpcyBhIHNpbmdsZXRvbiBvYmplY3Qgc28gaXQgaXMgaW1wb3J0YW50IHRoYXQgeW91XG4qIGNsZWFuIHVwIHVybE1hcCB3aGVuZXZlciB5b3UgYXJlIGZpbmlzaGVkLlxuKi9cblxudmFyIE5ldHdvcmtCcmlkZ2UgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBOZXR3b3JrQnJpZGdlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBOZXR3b3JrQnJpZGdlKTtcblxuICAgIHRoaXMudXJsTWFwID0ge307XG4gIH1cblxuICAvKlxuICAqIEF0dGFjaGVzIGEgd2Vic29ja2V0IG9iamVjdCB0byB0aGUgdXJsTWFwIGhhc2ggc28gdGhhdCBpdCBjYW4gZmluZCB0aGUgc2VydmVyXG4gICogaXQgaXMgY29ubmVjdGVkIHRvIGFuZCB0aGUgc2VydmVyIGluIHR1cm4gY2FuIGZpbmQgaXQuXG4gICpcbiAgKiBAcGFyYW0ge29iamVjdH0gd2Vic29ja2V0IC0gd2Vic29ja2V0IG9iamVjdCB0byBhZGQgdG8gdGhlIHVybE1hcCBoYXNoXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhOZXR3b3JrQnJpZGdlLCBbe1xuICAgIGtleTogJ2F0dGFjaFdlYlNvY2tldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGF0dGFjaFdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCAmJiBjb25uZWN0aW9uTG9va3VwLnNlcnZlciAmJiBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMuaW5kZXhPZih3ZWJzb2NrZXQpID09PSAtMSkge1xuICAgICAgICBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMucHVzaCh3ZWJzb2NrZXQpO1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEF0dGFjaGVzIGEgd2Vic29ja2V0IHRvIGEgcm9vbVxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdhZGRNZW1iZXJzaGlwVG9Sb29tJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkTWVtYmVyc2hpcFRvUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG5cbiAgICAgIGlmIChjb25uZWN0aW9uTG9va3VwICYmIGNvbm5lY3Rpb25Mb29rdXAuc2VydmVyICYmIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cy5pbmRleE9mKHdlYnNvY2tldCkgIT09IC0xKSB7XG4gICAgICAgIGlmICghY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV0pIHtcbiAgICAgICAgICBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV0ucHVzaCh3ZWJzb2NrZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBBdHRhY2hlcyBhIHNlcnZlciBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgYSB3ZWJzb2NrZXRzXG4gICAgKiB3aGljaCBhcmUgY29ubmVjdGVkIHRvIGl0IGFuZCBzbyB0aGF0IHdlYnNvY2tldHMgY2FuIGluIHR1cm4gY2FuIGZpbmQgaXQuXG4gICAgKlxuICAgICogQHBhcmFtIHtvYmplY3R9IHNlcnZlciAtIHNlcnZlciBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdhdHRhY2hTZXJ2ZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhdHRhY2hTZXJ2ZXIoc2VydmVyLCB1cmwpIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbdXJsXTtcblxuICAgICAgaWYgKCFjb25uZWN0aW9uTG9va3VwKSB7XG4gICAgICAgIHRoaXMudXJsTWFwW3VybF0gPSB7XG4gICAgICAgICAgc2VydmVyOiBzZXJ2ZXIsXG4gICAgICAgICAgd2Vic29ja2V0czogW10sXG4gICAgICAgICAgcm9vbU1lbWJlcnNoaXBzOiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzZXJ2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEZpbmRzIHRoZSBzZXJ2ZXIgd2hpY2ggaXMgJ3J1bm5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgdG8gdXNlIHRvIGZpbmQgd2hpY2ggc2VydmVyIGlzIHJ1bm5pbmcgb24gaXRcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnc2VydmVyTG9va3VwJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VydmVyTG9va3VwKHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEZpbmRzIGFsbCB3ZWJzb2NrZXRzIHdoaWNoIGlzICdsaXN0ZW5pbmcnIG9uIHRoZSBnaXZlbiB1cmwuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIHRoZSB1cmwgdG8gdXNlIHRvIGZpbmQgYWxsIHdlYnNvY2tldHMgd2hpY2ggYXJlIGFzc29jaWF0ZWQgd2l0aCBpdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHJvb20gLSBpZiBhIHJvb20gaXMgcHJvdmlkZWQsIHdpbGwgb25seSByZXR1cm4gc29ja2V0cyBpbiB0aGlzIHJvb21cbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnd2Vic29ja2V0c0xvb2t1cCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHdlYnNvY2tldHNMb29rdXAodXJsLCByb29tKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICAgIGlmICghY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIGlmIChyb29tKSB7XG4gICAgICAgIHZhciBtZW1iZXJzID0gY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV07XG4gICAgICAgIHJldHVybiBtZW1iZXJzID8gbWVtYmVycyA6IFtdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIHRoZSBlbnRyeSBhc3NvY2lhdGVkIHdpdGggdGhlIHVybC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZVNlcnZlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVNlcnZlcih1cmwpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnVybE1hcFt1cmxdO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIHRoZSBpbmRpdmlkdWFsIHdlYnNvY2tldCBmcm9tIHRoZSBtYXAgb2YgYXNzb2NpYXRlZCB3ZWJzb2NrZXRzLlxuICAgICpcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSB3ZWJzb2NrZXQgLSB3ZWJzb2NrZXQgb2JqZWN0IHRvIHJlbW92ZSBmcm9tIHRoZSB1cmwgbWFwXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZVdlYlNvY2tldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVdlYlNvY2tldCh3ZWJzb2NrZXQsIHVybCkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMgPSAoMCwgX2hlbHBlcnNBcnJheUhlbHBlcnMucmVqZWN0KShjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgICByZXR1cm4gc29ja2V0ID09PSB3ZWJzb2NrZXQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZW1vdmVzIGEgd2Vic29ja2V0IGZyb20gYSByb29tXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbSh3ZWJzb2NrZXQsIHJvb20pIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbd2Vic29ja2V0LnVybF07XG4gICAgICB2YXIgbWVtYmVyc2hpcHMgPSBjb25uZWN0aW9uTG9va3VwLnJvb21NZW1iZXJzaGlwc1tyb29tXTtcblxuICAgICAgaWYgKGNvbm5lY3Rpb25Mb29rdXAgJiYgbWVtYmVyc2hpcHMgIT09IG51bGwpIHtcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV0gPSAoMCwgX2hlbHBlcnNBcnJheUhlbHBlcnMucmVqZWN0KShtZW1iZXJzaGlwcywgZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICAgIHJldHVybiBzb2NrZXQgPT09IHdlYnNvY2tldDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE5ldHdvcmtCcmlkZ2U7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBuZXcgTmV0d29ya0JyaWRnZSgpO1xuLy8gTm90ZTogdGhpcyBpcyBhIHNpbmdsZXRvblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3g0LCBfeDUsIF94NikgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDQsIHByb3BlcnR5ID0gX3g1LCByZWNlaXZlciA9IF94NjsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDQgPSBwYXJlbnQ7IF94NSA9IHByb3BlcnR5OyBfeDYgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3VyaWpzID0gcmVxdWlyZSgndXJpanMnKTtcblxudmFyIF91cmlqczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF91cmlqcyk7XG5cbnZhciBfd2Vic29ja2V0ID0gcmVxdWlyZSgnLi93ZWJzb2NrZXQnKTtcblxudmFyIF93ZWJzb2NrZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2Vic29ja2V0KTtcblxudmFyIF9ldmVudFRhcmdldCA9IHJlcXVpcmUoJy4vZXZlbnQtdGFyZ2V0Jyk7XG5cbnZhciBfZXZlbnRUYXJnZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXZlbnRUYXJnZXQpO1xuXG52YXIgX25ldHdvcmtCcmlkZ2UgPSByZXF1aXJlKCcuL25ldHdvcmstYnJpZGdlJyk7XG5cbnZhciBfbmV0d29ya0JyaWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9uZXR3b3JrQnJpZGdlKTtcblxudmFyIF9oZWxwZXJzQ2xvc2VDb2RlcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jbG9zZS1jb2RlcycpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNDbG9zZUNvZGVzKTtcblxudmFyIF9ldmVudEZhY3RvcnkgPSByZXF1aXJlKCcuL2V2ZW50LWZhY3RvcnknKTtcblxuLypcbiogaHR0cHM6Ly9naXRodWIuY29tL3dlYnNvY2tldHMvd3Mjc2VydmVyLWV4YW1wbGVcbiovXG5cbnZhciBTZXJ2ZXIgPSAoZnVuY3Rpb24gKF9FdmVudFRhcmdldCkge1xuICBfaW5oZXJpdHMoU2VydmVyLCBfRXZlbnRUYXJnZXQpO1xuXG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuXG4gIGZ1bmN0aW9uIFNlcnZlcih1cmwpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2VydmVyKTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNlcnZlci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuICAgIHRoaXMudXJsID0gKDAsIF91cmlqczJbJ2RlZmF1bHQnXSkodXJsKS50b1N0cmluZygpO1xuICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hTZXJ2ZXIodGhpcywgdGhpcy51cmwpO1xuXG4gICAgaWYgKCFzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnZXJyb3InIH0pKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQSBtb2NrIHNlcnZlciBpcyBhbHJlYWR5IGxpc3RlbmluZyBvbiB0aGlzIHVybCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEFsdGVybmF0aXZlIGNvbnN0cnVjdG9yIHRvIHN1cHBvcnQgbmFtZXNwYWNlcyBpbiBzb2NrZXQuaW9cbiAgICpcbiAgICogaHR0cDovL3NvY2tldC5pby9kb2NzL3Jvb21zLWFuZC1uYW1lc3BhY2VzLyNjdXN0b20tbmFtZXNwYWNlc1xuICAgKi9cblxuICAvKlxuICAqIFRoaXMgaXMgdGhlIG1haW4gZnVuY3Rpb24gZm9yIHRoZSBtb2NrIHNlcnZlciB0byBzdWJzY3JpYmUgdG8gdGhlIG9uIGV2ZW50cy5cbiAgKlxuICAqIGllOiBtb2NrU2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdhIG1vY2sgY2xpZW50IGNvbm5lY3RlZCcpOyB9KTtcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIGV2ZW50IGtleSB0byBzdWJzY3JpYmUgdG8uIFZhbGlkIGtleXMgYXJlOiBjb25uZWN0aW9uLCBtZXNzYWdlLCBhbmQgY2xvc2UuXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgd2hpY2ggc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGEgY2VydGFpbiBldmVudCBpcyBmaXJlZC5cbiAgKi9cblxuICBfY3JlYXRlQ2xhc3MoU2VydmVyLCBbe1xuICAgIGtleTogJ29uJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFRoaXMgc2VuZCBmdW5jdGlvbiB3aWxsIG5vdGlmeSBhbGwgbW9jayBjbGllbnRzIHZpYSB0aGVpciBvbm1lc3NhZ2UgY2FsbGJhY2tzIHRoYXQgdGhlIHNlcnZlclxuICAgICogaGFzIGEgbWVzc2FnZSBmb3IgdGhlbS5cbiAgICAqXG4gICAgKiBAcGFyYW0geyp9IGRhdGEgLSBBbnkgamF2YXNjcmlwdCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBjcmFmdGVkIGludG8gYSBNZXNzYWdlT2JqZWN0LlxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdzZW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChkYXRhKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogU2VuZHMgYSBnZW5lcmljIG1lc3NhZ2UgZXZlbnQgdG8gYWxsIG1vY2sgY2xpZW50cy5cbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnZW1pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGRhdGEpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzJdO1xuICAgICAgdmFyIHdlYnNvY2tldHMgPSBvcHRpb25zLndlYnNvY2tldHM7XG5cbiAgICAgIGlmICghd2Vic29ja2V0cykge1xuICAgICAgICB3ZWJzb2NrZXRzID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG4gICAgICB9XG5cbiAgICAgIHdlYnNvY2tldHMuZm9yRWFjaChmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHNvY2tldC5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VFdmVudCkoe1xuICAgICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgb3JpZ2luOiBfdGhpczIudXJsLFxuICAgICAgICAgIHRhcmdldDogc29ja2V0XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBDbG9zZXMgdGhlIGNvbm5lY3Rpb24gYW5kIHRyaWdnZXJzIHRoZSBvbmNsb3NlIG1ldGhvZCBvZiBhbGwgbGlzdGVuaW5nXG4gICAgKiB3ZWJzb2NrZXRzLiBBZnRlciB0aGF0IGl0IHJlbW92ZXMgaXRzZWxmIGZyb20gdGhlIHVybE1hcCBzbyBhbm90aGVyIHNlcnZlclxuICAgICogY291bGQgYWRkIGl0c2VsZiB0byB0aGUgdXJsLlxuICAgICpcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICAgICAgdmFyIGNvZGUgPSBvcHRpb25zLmNvZGU7XG4gICAgICB2YXIgcmVhc29uID0gb3B0aW9ucy5yZWFzb247XG4gICAgICB2YXIgd2FzQ2xlYW4gPSBvcHRpb25zLndhc0NsZWFuO1xuXG4gICAgICB2YXIgbGlzdGVuZXJzID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCk7XG5cbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgc29ja2V0LnJlYWR5U3RhdGUgPSBfd2Vic29ja2V0MlsnZGVmYXVsdCddLkNMT1NFO1xuICAgICAgICBzb2NrZXQuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICB0YXJnZXQ6IHNvY2tldCxcbiAgICAgICAgICBjb2RlOiBjb2RlIHx8IF9oZWxwZXJzQ2xvc2VDb2RlczJbJ2RlZmF1bHQnXS5DTE9TRV9OT1JNQUwsXG4gICAgICAgICAgcmVhc29uOiByZWFzb24gfHwgJycsXG4gICAgICAgICAgd2FzQ2xlYW46IHdhc0NsZWFuXG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoeyB0eXBlOiAnY2xvc2UnIH0pLCB0aGlzKTtcbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZVNlcnZlcih0aGlzLnVybCk7XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFJldHVybnMgYW4gYXJyYXkgb2Ygd2Vic29ja2V0cyB3aGljaCBhcmUgbGlzdGVuaW5nIHRvIHRoaXMgc2VydmVyXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2NsaWVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGllbnRzKCkge1xuICAgICAgcmV0dXJuIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwpO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBQcmVwYXJlcyBhIG1ldGhvZCB0byBzdWJtaXQgYW4gZXZlbnQgdG8gbWVtYmVycyBvZiB0aGUgcm9vbVxuICAgICpcbiAgICAqIGUuZy4gc2VydmVyLnRvKCdteS1yb29tJykuZW1pdCgnaGkhJyk7XG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3RvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG8ocm9vbSkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIHZhciB3ZWJzb2NrZXRzID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ud2Vic29ja2V0c0xvb2t1cCh0aGlzLnVybCwgcm9vbSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbWl0OiBmdW5jdGlvbiBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgX3RoaXMuZW1pdChldmVudCwgZGF0YSwgeyB3ZWJzb2NrZXRzOiB3ZWJzb2NrZXRzIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTZXJ2ZXI7XG59KShfZXZlbnRUYXJnZXQyWydkZWZhdWx0J10pO1xuXG5TZXJ2ZXIub2YgPSBmdW5jdGlvbiBvZih1cmwpIHtcbiAgcmV0dXJuIG5ldyBTZXJ2ZXIodXJsKTtcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNlcnZlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MywgX3g0LCBfeDUpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gzLCBwcm9wZXJ0eSA9IF94NCwgcmVjZWl2ZXIgPSBfeDU7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gzID0gcGFyZW50OyBfeDQgPSBwcm9wZXJ0eTsgX3g1ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF91cmlqcyA9IHJlcXVpcmUoJ3VyaWpzJyk7XG5cbnZhciBfdXJpanMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXJpanMpO1xuXG52YXIgX2hlbHBlcnNEZWxheSA9IHJlcXVpcmUoJy4vaGVscGVycy9kZWxheScpO1xuXG52YXIgX2hlbHBlcnNEZWxheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRGVsYXkpO1xuXG52YXIgX2V2ZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi9ldmVudC10YXJnZXQnKTtcblxudmFyIF9ldmVudFRhcmdldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ldmVudFRhcmdldCk7XG5cbnZhciBfbmV0d29ya0JyaWRnZSA9IHJlcXVpcmUoJy4vbmV0d29yay1icmlkZ2UnKTtcblxudmFyIF9uZXR3b3JrQnJpZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX25ldHdvcmtCcmlkZ2UpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Nsb3NlLWNvZGVzJyk7XG5cbnZhciBfaGVscGVyc0Nsb3NlQ29kZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0Nsb3NlQ29kZXMpO1xuXG52YXIgX2V2ZW50RmFjdG9yeSA9IHJlcXVpcmUoJy4vZXZlbnQtZmFjdG9yeScpO1xuXG4vKlxuKiBUaGUgc29ja2V0LWlvIGNsYXNzIGlzIGRlc2lnbmVkIHRvIG1pbWljayB0aGUgcmVhbCBBUEkgYXMgY2xvc2VseSBhcyBwb3NzaWJsZS5cbipcbiogaHR0cDovL3NvY2tldC5pby9kb2NzL1xuKi9cblxudmFyIFNvY2tldElPID0gKGZ1bmN0aW9uIChfRXZlbnRUYXJnZXQpIHtcbiAgX2luaGVyaXRzKFNvY2tldElPLCBfRXZlbnRUYXJnZXQpO1xuXG4gIC8qXG4gICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAqL1xuXG4gIGZ1bmN0aW9uIFNvY2tldElPKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgdXJsID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gJ3NvY2tldC5pbycgOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIHByb3RvY29sID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJycgOiBhcmd1bWVudHNbMV07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU29ja2V0SU8pO1xuXG4gICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoU29ja2V0SU8ucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuYmluYXJ5VHlwZSA9ICdibG9iJztcbiAgICB0aGlzLnVybCA9ICgwLCBfdXJpanMyWydkZWZhdWx0J10pKHVybCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrZXRJTy5DT05ORUNUSU5HO1xuICAgIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sKSAmJiBwcm90b2NvbC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xbMF07XG4gICAgfVxuXG4gICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAvKlxuICAgICogRGVsYXkgdHJpZ2dlcmluZyB0aGUgY29ubmVjdGlvbiBldmVudHMgc28gdGhleSBjYW4gYmUgZGVmaW5lZCBpbiB0aW1lLlxuICAgICovXG4gICAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uIGRlbGF5Q2FsbGJhY2soKSB7XG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLk9QRU47XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdjb25uZWN0aW9uJyB9KSwgc2VydmVyLCB0aGlzKTtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Nvbm5lY3QnIH0pLCBzZXJ2ZXIsIHRoaXMpOyAvLyBhbGlhc1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Nvbm5lY3QnLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ0xPU0VEO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Vycm9yJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUNsb3NlRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICBjb2RlOiBfaGVscGVyc0Nsb3NlQ29kZXMyWydkZWZhdWx0J10uQ0xPU0VfTk9STUFMXG4gICAgICAgIH0pKTtcblxuICAgICAgICBjb25zb2xlLmVycm9yKCdTb2NrZXQuaW8gY29ubmVjdGlvbiB0byBcXCcnICsgdGhpcy51cmwgKyAnXFwnIGZhaWxlZCcpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICBBZGQgYW4gYWxpYXNlZCBldmVudCBsaXN0ZW5lciBmb3IgY2xvc2UgLyBkaXNjb25uZWN0XG4gICAgICovXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgX3RoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXQsXG4gICAgICAgIGNvZGU6IGV2ZW50LmNvZGVcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICogQ2xvc2VzIHRoZSBTb2NrZXRJTyBjb25uZWN0aW9uIG9yIGNvbm5lY3Rpb24gYXR0ZW1wdCwgaWYgYW55LlxuICAqIElmIHRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHkgQ0xPU0VELCB0aGlzIG1ldGhvZCBkb2VzIG5vdGhpbmcuXG4gICovXG5cbiAgX2NyZWF0ZUNsYXNzKFNvY2tldElPLCBbe1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBTb2NrZXRJTy5PUEVOKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgICAgX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ucmVtb3ZlV2ViU29ja2V0KHRoaXMsIHRoaXMudXJsKTtcblxuICAgICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ0xPU0VEO1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUNsb3NlRXZlbnQpKHtcbiAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICBjb2RlOiBfaGVscGVyc0Nsb3NlQ29kZXMyWydkZWZhdWx0J10uQ0xPU0VfTk9STUFMXG4gICAgICB9KSk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdkaXNjb25uZWN0JyxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgY29kZTogX2hlbHBlcnNDbG9zZUNvZGVzMlsnZGVmYXVsdCddLkNMT1NFX05PUk1BTFxuICAgICAgICB9KSwgc2VydmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogQWxpYXMgZm9yIFNvY2tldCNjbG9zZVxuICAgICpcbiAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NrZXRpby9zb2NrZXQuaW8tY2xpZW50L2Jsb2IvbWFzdGVyL2xpYi9zb2NrZXQuanMjTDM4M1xuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdkaXNjb25uZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzY29ubmVjdCgpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogU3VibWl0cyBhbiBldmVudCB0byB0aGUgc2VydmVyIHdpdGggYSBwYXlsb2FkXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2VtaXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBTb2NrZXRJTy5PUEVOKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU29ja2V0SU8gaXMgYWxyZWFkeSBpbiBDTE9TSU5HIG9yIENMT1NFRCBzdGF0ZScpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbWVzc2FnZUV2ZW50ID0gKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlTWVzc2FnZUV2ZW50KSh7XG4gICAgICAgIHR5cGU6IGV2ZW50LFxuICAgICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9KTtcblxuICAgICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQobWVzc2FnZUV2ZW50LCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogU3VibWl0cyBhICdtZXNzYWdlJyBldmVudCB0byB0aGUgc2VydmVyLlxuICAgICpcbiAgICAqIFNob3VsZCBiZWhhdmUgZXhhY3RseSBsaWtlIFdlYlNvY2tldCNzZW5kXG4gICAgKlxuICAgICogaHR0cHM6Ly9naXRodWIuY29tL3NvY2tldGlvL3NvY2tldC5pby1jbGllbnQvYmxvYi9tYXN0ZXIvbGliL3NvY2tldC5qcyNMMTEzXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3NlbmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kKGRhdGEpIHtcbiAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGRhdGEpO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBGb3IgcmVnaXN0ZXJpbmcgZXZlbnRzIHRvIGJlIHJlY2VpdmVkIGZyb20gdGhlIHNlcnZlclxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogSm9pbiBhIHJvb20gb24gYSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9yb29tcy1hbmQtbmFtZXNwYWNlcy8jam9pbmluZy1hbmQtbGVhdmluZ1xuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnam9pbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGpvaW4ocm9vbSkge1xuICAgICAgX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uYWRkTWVtYmVyc2hpcFRvUm9vbSh0aGlzLCByb29tKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEdldCB0aGUgd2Vic29ja2V0IHRvIGxlYXZlIHRoZSByb29tXG4gICAgICpcbiAgICAgKiBodHRwOi8vc29ja2V0LmlvL2RvY3Mvcm9vbXMtYW5kLW5hbWVzcGFjZXMvI2pvaW5pbmctYW5kLWxlYXZpbmdcbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2xlYXZlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbGVhdmUocm9vbSkge1xuICAgICAgX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10ucmVtb3ZlTWVtYmVyc2hpcEZyb21Sb29tKHRoaXMsIHJvb20pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogSW52b2tlcyBhbGwgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgYXJlIGxpc3RlbmluZyB0byB0aGUgZ2l2ZW4gZXZlbnQudHlwZSBwcm9wZXJ0eS4gRWFjaFxuICAgICAqIGxpc3RlbmVyIHdpbGwgYmUgcGFzc2VkIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBldmVudCBvYmplY3Qgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gYWxsIGxpc3RlbmVycyBvZiB0aGUgZXZlbnQudHlwZSBwcm9wZXJ0eVxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgY3VzdG9tQXJndW1lbnRzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBjdXN0b21Bcmd1bWVudHNbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgZXZlbnROYW1lID0gZXZlbnQudHlwZTtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tldmVudE5hbWVdO1xuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdGVuZXJzKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBpZiAoY3VzdG9tQXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsaXN0ZW5lci5hcHBseShfdGhpczIsIGN1c3RvbUFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmVndWxhciBXZWJTb2NrZXRzIGV4cGVjdCBhIE1lc3NhZ2VFdmVudCBidXQgU29ja2V0aW8uaW8ganVzdCB3YW50cyByYXcgZGF0YVxuICAgICAgICAgIC8vICBwYXlsb2FkIGluc3RhbmNlb2YgTWVzc2FnZUV2ZW50IHdvcmtzLCBidXQgeW91IGNhbid0IGlzbnRhbmNlIG9mIE5vZGVFdmVudFxuICAgICAgICAgIC8vICBmb3Igbm93IHdlIGRldGVjdCBpZiB0aGUgb3V0cHV0IGhhcyBkYXRhIGRlZmluZWQgb24gaXRcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKF90aGlzMiwgZXZlbnQuZGF0YSA/IGV2ZW50LmRhdGEgOiBldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTb2NrZXRJTztcbn0pKF9ldmVudFRhcmdldDJbJ2RlZmF1bHQnXSk7XG5cblNvY2tldElPLkNPTk5FQ1RJTkcgPSAwO1xuU29ja2V0SU8uT1BFTiA9IDE7XG5Tb2NrZXRJTy5DTE9TSU5HID0gMjtcblNvY2tldElPLkNMT1NFRCA9IDM7XG5cbi8qXG4qIFN0YXRpYyBjb25zdHJ1Y3RvciBtZXRob2RzIGZvciB0aGUgSU8gU29ja2V0XG4qL1xudmFyIElPID0gZnVuY3Rpb24gaW9Db25zdHJ1Y3Rvcih1cmwpIHtcbiAgcmV0dXJuIG5ldyBTb2NrZXRJTyh1cmwpO1xufTtcblxuLypcbiogQWxpYXMgdGhlIHJhdyBJTygpIGNvbnN0cnVjdG9yXG4qL1xuSU8uY29ubmVjdCA9IGZ1bmN0aW9uIGlvQ29ubmVjdCh1cmwpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbmV3LWNhcCAqL1xuICByZXR1cm4gSU8odXJsKTtcbiAgLyogZXNsaW50LWVuYWJsZSBuZXctY2FwICovXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBJTztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF91cmlqcyA9IHJlcXVpcmUoJ3VyaWpzJyk7XG5cbnZhciBfdXJpanMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXJpanMpO1xuXG52YXIgX2hlbHBlcnNEZWxheSA9IHJlcXVpcmUoJy4vaGVscGVycy9kZWxheScpO1xuXG52YXIgX2hlbHBlcnNEZWxheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRGVsYXkpO1xuXG52YXIgX2V2ZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi9ldmVudC10YXJnZXQnKTtcblxudmFyIF9ldmVudFRhcmdldDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ldmVudFRhcmdldCk7XG5cbnZhciBfbmV0d29ya0JyaWRnZSA9IHJlcXVpcmUoJy4vbmV0d29yay1icmlkZ2UnKTtcblxudmFyIF9uZXR3b3JrQnJpZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX25ldHdvcmtCcmlkZ2UpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Nsb3NlLWNvZGVzJyk7XG5cbnZhciBfaGVscGVyc0Nsb3NlQ29kZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0Nsb3NlQ29kZXMpO1xuXG52YXIgX2V2ZW50RmFjdG9yeSA9IHJlcXVpcmUoJy4vZXZlbnQtZmFjdG9yeScpO1xuXG4vKlxuKiBUaGUgbWFpbiB3ZWJzb2NrZXQgY2xhc3Mgd2hpY2ggaXMgZGVzaWduZWQgdG8gbWltaWNrIHRoZSBuYXRpdmUgV2ViU29ja2V0IGNsYXNzIGFzIGNsb3NlXG4qIGFzIHBvc3NpYmxlLlxuKlxuKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0XG4qL1xuXG52YXIgV2ViU29ja2V0ID0gKGZ1bmN0aW9uIChfRXZlbnRUYXJnZXQpIHtcbiAgX2luaGVyaXRzKFdlYlNvY2tldCwgX0V2ZW50VGFyZ2V0KTtcblxuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cblxuICBmdW5jdGlvbiBXZWJTb2NrZXQodXJsKSB7XG4gICAgdmFyIHByb3RvY29sID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJycgOiBhcmd1bWVudHNbMV07XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgV2ViU29ja2V0KTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFdlYlNvY2tldC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuXG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnV2ViU29ja2V0XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5iaW5hcnlUeXBlID0gJ2Jsb2InO1xuICAgIHRoaXMudXJsID0gKDAsIF91cmlqczJbJ2RlZmF1bHQnXSkodXJsKS50b1N0cmluZygpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DT05ORUNUSU5HO1xuICAgIHRoaXMucHJvdG9jb2wgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sKSAmJiBwcm90b2NvbC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2xbMF07XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEluIG9yZGVyIHRvIGNhcHR1cmUgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdlIG5lZWQgdG8gZGVmaW5lIGN1c3RvbSBzZXR0ZXJzLlxuICAgICogVG8gaWxsdXN0cmF0ZTpcbiAgICAqICAgbXlTb2NrZXQub25vcGVuID0gZnVuY3Rpb24oKSB7IGFsZXJ0KHRydWUpIH07XG4gICAgKlxuICAgICogVGhlIG9ubHkgd2F5IHRvIGNhcHR1cmUgdGhhdCBmdW5jdGlvbiBhbmQgaG9sZCBvbnRvIGl0IGZvciBsYXRlciBpcyB3aXRoIHRoZVxuICAgICogYmVsb3cgY29kZTpcbiAgICAqL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgIG9ub3Blbjoge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5vcGVuO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9ubWVzc2FnZToge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVycy5tZXNzYWdlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uY2xvc2U6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuY2xvc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uZXJyb3I6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMuZXJyb3I7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0KGxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmF0dGFjaFdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAvKlxuICAgICogVGhpcyBkZWxheSBpcyBuZWVkZWQgc28gdGhhdCB3ZSBkb250IHRyaWdnZXIgYW4gZXZlbnQgYmVmb3JlIHRoZSBjYWxsYmFja3MgaGF2ZSBiZWVuXG4gICAgKiBzZXR1cC4gRm9yIGV4YW1wbGU6XG4gICAgKlxuICAgICogdmFyIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoJ3dzOi8vbG9jYWxob3N0Jyk7XG4gICAgKlxuICAgICogLy8gSWYgd2UgZG9udCBoYXZlIHRoZSBkZWxheSB0aGVuIHRoZSBldmVudCB3b3VsZCBiZSB0cmlnZ2VyZWQgcmlnaHQgaGVyZSBhbmQgdGhpcyBpc1xuICAgICogLy8gYmVmb3JlIHRoZSBvbm9wZW4gaGFkIGEgY2hhbmNlIHRvIHJlZ2lzdGVyIGl0c2VsZi5cbiAgICAqXG4gICAgKiBzb2NrZXQub25vcGVuID0gKCkgPT4geyAvLyB0aGlzIHdvdWxkIG5ldmVyIGJlIGNhbGxlZCB9O1xuICAgICpcbiAgICAqIC8vIGFuZCB3aXRoIHRoZSBkZWxheSB0aGUgZXZlbnQgZ2V0cyB0cmlnZ2VyZWQgaGVyZSBhZnRlciBhbGwgb2YgdGhlIGNhbGxiYWNrcyBoYXZlIGJlZW5cbiAgICAqIC8vIHJlZ2lzdGVyZWQgOi0pXG4gICAgKi9cbiAgICAoMCwgX2hlbHBlcnNEZWxheTJbJ2RlZmF1bHQnXSkoZnVuY3Rpb24gZGVsYXlDYWxsYmFjaygpIHtcbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0Lk9QRU47XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdjb25uZWN0aW9uJyB9KSwgc2VydmVyLCB0aGlzKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdvcGVuJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnZXJyb3InLCB0YXJnZXQ6IHRoaXMgfSkpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoeyB0eXBlOiAnY2xvc2UnLCB0YXJnZXQ6IHRoaXMsIGNvZGU6IF9oZWxwZXJzQ2xvc2VDb2RlczJbJ2RlZmF1bHQnXS5DTE9TRV9OT1JNQUwgfSkpO1xuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1dlYlNvY2tldCBjb25uZWN0aW9uIHRvIFxcJycgKyB0aGlzLnVybCArICdcXCcgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICAvKlxuICAqIFRyYW5zbWl0cyBkYXRhIHRvIHRoZSBzZXJ2ZXIgb3ZlciB0aGUgV2ViU29ja2V0IGNvbm5lY3Rpb24uXG4gICpcbiAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0I3NlbmQoKVxuICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhXZWJTb2NrZXQsIFt7XG4gICAga2V5OiAnc2VuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NJTkcgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViU29ja2V0IGlzIGFscmVhZHkgaW4gQ0xPU0lORyBvciBDTE9TRUQgc3RhdGUnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG1lc3NhZ2VFdmVudCA9ICgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VFdmVudCkoe1xuICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgIG9yaWdpbjogdGhpcy51cmwsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2VydmVyID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uc2VydmVyTG9va3VwKHRoaXMudXJsKTtcblxuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudChtZXNzYWdlRXZlbnQsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBDbG9zZXMgdGhlIFdlYlNvY2tldCBjb25uZWN0aW9uIG9yIGNvbm5lY3Rpb24gYXR0ZW1wdCwgaWYgYW55LlxuICAgICogSWYgdGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBDTE9TRUQsIHRoaXMgbWV0aG9kIGRvZXMgbm90aGluZy5cbiAgICAqXG4gICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViU29ja2V0I2Nsb3NlKClcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnY2xvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuICAgICAgdmFyIGNsb3NlRXZlbnQgPSAoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgY29kZTogX2hlbHBlcnNDbG9zZUNvZGVzMlsnZGVmYXVsdCddLkNMT1NFX05PUk1BTFxuICAgICAgfSk7XG5cbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZVdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQoY2xvc2VFdmVudCwgc2VydmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gV2ViU29ja2V0O1xufSkoX2V2ZW50VGFyZ2V0MlsnZGVmYXVsdCddKTtcblxuV2ViU29ja2V0LkNPTk5FQ1RJTkcgPSAwO1xuV2ViU29ja2V0Lk9QRU4gPSAxO1xuV2ViU29ja2V0LkNMT1NJTkcgPSAyO1xuV2ViU29ja2V0LkNMT1NFRCA9IDM7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFdlYlNvY2tldDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyJdfQ==
