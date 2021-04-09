Array.prototype.forEachAsync = Array.prototype.mapAsync = async function (fn) {
  return Promise.all(this.map(fn));
};

Array.prototype.filterAsync = async function (fn) {
  let a = await this.mapAsync(fn);
  return this.filter((x, i) => a[i]);
};

global.ErrorMessage = class ErrorMessage {
  constructor(message, nextUrls, details) {
    this.message = message;
    this.nextUrls = nextUrls || {};
    this.details = details;
  }
};

let Promise = require('bluebird');
let util = require('util');
let moment = require('moment');
let path = require('path')
let url = require('url');
let fs  = require('fs-extra');
let querystring = require('querystring');

module.exports = {
  resolvePath(s) {
    let a = Array.from(arguments);
    a.unshift(__dirname);
    return path.resolve.apply(null, a);
  },
  formatDate(ts, format) {
    if (ts == null) {
      return "Unknown";
    }
    let m = moment(ts);
    m.locale('eu');
    return m.format(format || 'L H:mm:ss');
  },
  formatTime(x) {
    let sgn = x < 0 ? '-' : '';
    x = Math.abs(x);
    function toStringWithPad(x) {
      x = parseInt(x);
      if (x < 10) return '0' + x.toString();
      else return x.toString();
    }
    return sgn + util.format('%s:%s:%s', toStringWithPad(x / 3600), toStringWithPad(x / 60 % 60), toStringWithPad(x % 60));
  },
  formatSize(x, precision) {
      if (typeof x !== 'number') return '0 B';
      let unit = 'B', units = ['K', 'M', 'G', 'T'];
      for (let i in units) if (x > 1024) x /= 1024, unit = units[i];
      var fixed = x === Math.round(x) ? x.toString() : x.toFixed(precision);
      return fixed + ' ' + unit;
  },
  parseDate(s) {
    return parseInt(+new Date(s) / 1000);
  },
  getCurrentDate(removeTime) {
    let d = new Date;
    if (removeTime) {
      d.setHours(0);
      d.setMinutes(0);
      d.setSeconds(0);
      d.setMilliseconds(0);
    }
    return parseInt(+d / 1000);
  },
  makeUrl(req_params, form) {
    let res = '';
    if (!req_params) res = '/';
    else if (req_params.originalUrl) {
      let u = url.parse(req_params.originalUrl);
      res = u.pathname;
    } else {
      if (!Array.isArray(req_params)) req_params = [req_params];
      for (let param of req_params) res += '/' + param;
    }
    let encoded = querystring.encode(form);
    if (encoded) res += '?' + encoded;
    return res;
  },
  isadmin(user){
    return user && (user.isadmin)
  },
  async isFile(path) {
    try {
      let a = await fs.stat(path)
      return (await fs.stat(path)).isFile();
    } catch (e) {
      return false;
    }
  }
};
