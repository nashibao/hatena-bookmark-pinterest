// Generated by CoffeeScript 1.3.1
var utils,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (this.utils == null) {
  this.utils = {};
}

utils = this.utils;

/*
knockout, django依存型のutil

TODO: modelにdicsとmap関数を暗黙的に実装する必要がある
 dicsにかんしては継承で、mapにかんしてはinterface定義に置き換えたい
 （must be overridedな関数にして継承にするかprototypeを使うか．)
TODO: エラーハンドリング
*/


utils.debug = true;

utils.log = function(obj) {
  if (utils.debug) {
    return console.log(obj);
  }
};

utils["break"] = function() {
  if (utils.debug) {
    throw Error('break');
  }
};

utils.type = (function() {
  var classToType, name, _i, _len, _ref;
  classToType = {};
  _ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    name = _ref[_i];
    classToType["[object " + name + "]"] = name.toLowerCase();
  }
  return function(obj) {
    var strType;
    strType = Object.prototype.toString.call(obj);
    return classToType[strType] || "object";
  };
})();

/* -------------------------------------------- 
     Begin utils.tool.coffee 
--------------------------------------------
*/


if (this.utils == null) {
  this.utils = {};
}

utils = this.utils;

utils.tool = (function() {

  function tool() {}

  tool._browser = false;

  tool.browser = function() {
    var ua;
    if (this._browser) {
      return this._browser;
    }
    ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari") !== -1) {
      this._browser = 'safari';
    } else if (ua.indexOf("firefox") !== -1) {
      this._browser = 'firefox';
    } else if (ua.indexOf("opera") !== -1) {
      this._browser = 'opera';
    } else if (ua.indexOf("netscape") !== -1) {
      this._browser = 'netscape';
    } else if (ua.indexOf("msie") !== -1) {
      this._browser = 'ie';
    } else if (ua.indexOf("mozilla/4") !== -1) {
      this._browser = 'netscape';
    }
    return this._browser;
  };

  return tool;

})();

/* -------------------------------------------- 
     Begin utils.api.coffee 
--------------------------------------------
*/


if (this.utils == null) {
  this.utils = {};
}

utils = this.utils;

utils.api = (function() {
  /*
  	network関係のutil
  	get, post
  */

  function api() {}

  api.parseParams = function(dic) {
    var key, str, val;
    str = '?';
    for (key in dic) {
      val = dic[key];
      if (ko.isObservable(val)) {
        str += key + '=' + val() + '&';
      } else if (utils.type(val) === 'array') {
        str += key + '=[' + val + ']&';
      } else {
        str += key + '=' + val + '&';
      }
    }
    return str;
  };

  api.getJSON = function(url, data, callback) {
    utils.log(url);
    $.ajaxSetup({
      cache: false
    });
    return $.getJSON(url, data, function(data) {
      $.ajaxSetup({
        cache: true
      });
      utils.log(data);
      return callback(data);
    });
  };

  api.postJSON = function(url, data, callback) {
    utils.log(url);
    $.ajaxSetup({
      cache: false
    });
    return $.ajax({
      url: url,
      type: "POST",
      data: data,
      dataType: "json",
      complete: function(data, dataType) {
        utils.log(data);
        $.ajaxSetup({
          cache: true
        });
        return callback(data);
      }
    });
  };

  api.get = function(url, params, callback) {
    return this.getJSON(url, function(data) {
      var da, filter, identifier, jsn, key, kls, modelname, obj, objs, objss, options, target, tempnames, val, _i, _j, _k, _len, _len1, _len2;
      tempnames = [];
      objss = {};
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        val = params[_i];
        key = val.key, kls = val["class"], target = val.target, filter = val.filter, identifier = val.identifier, options = val.options;
        objs = [];
        objss[key] = objs;
        tempnames.push(key);
        if (identifier == null) {
          identifier = [];
        }
        da = data[key];
        if (options && 'reverse' in options) {
          da = da.reverse();
        }
        for (_j = 0, _len1 = da.length; _j < _len1; _j++) {
          jsn = da[_j];
          obj = jsn;
          if (kls) {
            obj = utils.model.map(jsn, kls, identifier);
            if (!filter || filter(obj)) {
              if (target) {
                target.push(obj);
              }
            }
          } else {
            if (!filter || filter(obj)) {
              if (target) {
                target.push(obj);
              }
            }
          }
          objs.push(obj);
        }
        kls._dispatchall();
      }
      for (modelname in utils.model.models) {
        if (__indexOf.call(tempnames, modelname) < 0) {
          kls = utils.model.models[modelname];
          da = data[modelname];
          if (da) {
            for (_k = 0, _len2 = da.length; _k < _len2; _k++) {
              jsn = da[_k];
              utils.log(jsn);
              obj = utils.model.map(jsn, kls, []);
              objs.push(obj);
            }
            kls._dispatchall();
          }
        }
      }
      callback(data, objss);
      return utils.log(data);
    });
  };

  api.post = function(url, query, params, callback, progress) {
    return this.postJSON(url, query, function(d) {
      var data, identifier, jsn, key, kls, obj, objs, objss, options, val, _i, _len;
      data = $.evalJSON(d.responseText);
      utils.log(data);
      objss = {};
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        val = params[_i];
        objs = [];
        key = val.key, kls = val["class"], identifier = val.identifier, options = val.options;
        objss[key] = objs;
        if (identifier == null) {
          identifier = [];
        }
        jsn = data[key];
        if (kls) {
          obj = utils.model.map(jsn, kls, identifier);
          objs.push(obj);
        }
        kls._dispatchall();
      }
      callback(data, objss);
      return utils.log(data);
    });
  };

  return api;

})();

/* -------------------------------------------- 
     Begin utils.model.coffee 
--------------------------------------------
*/


if (this.utils == null) {
  this.utils = {};
}

utils = this.utils;

ko.observableArray.fn.kls = false;

ko.observableArray.fn.filter = false;

ko.observableArray.fn.sorter = false;

ko.observableArray.fn._dispatchall = function() {
  var key, val, _ref, _results;
  this.removeAll();
  _ref = this.kls.dics();
  _results = [];
  for (key in _ref) {
    val = _ref[key];
    if (this.filter) {
      if (this.filter(val)) {
        _results.push(this.push(val));
      } else {
        _results.push(void 0);
      }
    } else {
      _results.push(this.push(val));
    }
  }
  return _results;
};

ko.observableArray.fn.is_bind_stopped = false;

ko.observableArray.fn.bind_func = false;

ko.observableArray.fn.bind_stop = function() {
  return this.is_bind_stopped = true;
};

ko.observableArray.fn.bind_start = function() {
  this.is_bind_stopped = false;
  return this.bind_func();
};

ko.observableArray.fn.is_loading = false;

ko.observableArray.fn.is_errored = false;

utils.model = (function() {

  function model() {}

  /*
  	model関係のutil
  	https://gist.github.com/2769209
  */


  model.get = function(pk, kls) {
    if (pk in kls.dics()) {
      return kls.dics()[pk];
    } else {
      return false;
    }
  };

  model.get_or_create = function(pk, kls) {
    var obj;
    if (pk in kls.dics()) {
      return kls.dics()[pk];
    } else {
      obj = new kls();
      obj.pk(pk);
      kls.dics()[pk] = obj;
      return obj;
    }
  };

  model.get_and_delete = function(pk, kls) {
    var from, fromrelations, key, obj, to, torelations, _i, _len, _ref, _results;
    if (pk in kls.dics()) {
      obj = kls.dics()[pk];
      delete kls.dics()[pk];
      torelations = kls._torelations();
      if (pk in torelations) {
        for (key in torelations[pk]) {
          _ref = torelations[pk][key];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            from = _ref[_i];
            from[key]("");
            from[key + '__relation_id'] = -1;
          }
        }
      }
      fromrelations = kls._fromrelations();
      if (pk in fromrelations) {
        _results = [];
        for (key in fromrelations[pk]) {
          _results.push((function() {
            var _j, _len1, _ref1, _results1;
            _ref1 = fromrelations[pk][key];
            _results1 = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              to = _ref1[_j];
              _results1.push(to[key + '__reverse'](""));
            }
            return _results1;
          })());
        }
        return _results;
      }
    }
  };

  model.map = function(jsn, kls, param) {
    var is_active, obj, pk;
    pk = kls.unique_key(jsn);
    if (kls.has_field_wrapper) {
      jsn = jsn.fields;
    }
    if (!kls.is_active(jsn)) {
      is_active = false;
      utils.model.get_and_delete(pk, kls);
      return false;
    } else {
      obj = this.get_or_create(pk, kls);
      obj.map(jsn, param);
      kls._bind_relations(obj);
    }
    return obj;
  };

  model.register_function = function(kls, funcname) {
    kls[funcname] = function(query, target, callback) {
      return kls.custom(funcname, query, target, callback);
    };
    return kls['bind_' + funcname] = function(query, target, callback) {
      return kls.bind_custom(funcname, query, target, callback);
    };
  };

  model.models = {};

  return model;

})();

utils.model.Model = (function() {

  Model.returnkey = 'items';

  Model._modelname = 'items';

  Model.modelname = function(modelname) {
    this._modelname = modelname;
    return utils.model.models[modelname] = this;
  };

  Model.relations = function(options) {
    var key, tokls, _results;
    this.__relations = options;
    _results = [];
    for (key in options) {
      tokls = options[key];
      _results.push(tokls._reverse_relations()[key] = this);
    }
    return _results;
  };

  Model.unique_key = function(obj) {
    return obj.id;
  };

  Model.has_field_wrapper = false;

  Model.observable_keys = [];

  Model.is_active = function(obj) {
    if ('is_active' in obj && !obj['is_active']) {
      return false;
    }
    return true;
  };

  Model.observe = function(initial, options, query) {
    var arr, filter, kls, sorter;
    if (initial == null) {
      initial = [];
    }
    if (options == null) {
      options = options;
    }
    if (query == null) {
      query = false;
    }
    arr = ko.observableArray(initial);
    arr.is_loading = ko.observable(false);
    kls = this;
    arr.kls = kls;
    if (options) {
      filter = options.filter, sorter = options.sorter;
      arr.filter = filter;
      arr.sorter = sorter;
    }
    kls._observe(arr);
    if (query) {
      this.list(query);
    }
    return arr;
  };

  Model.bind_custom = function(funcname, query, initial, callback) {
    var bind_func, key, kls, target, val;
    if (initial == null) {
      initial = [];
    }
    if (callback == null) {
      callback = false;
    }
    target = ko.observableArray(initial);
    target.is_loading = ko.observable(false);
    kls = this;
    this.custom(funcname, query, target, callback);
    bind_func = function() {
      if (!target.is_bind_stopped) {
        target.removeAll();
        return kls.custom(funcname, query, target, callback);
      }
    };
    target.bind_func = bind_func;
    for (key in query) {
      val = query[key];
      if (ko.isObservable(val)) {
        val.subscribe(function(newval) {
          return bind_func();
        });
      }
    }
    return target;
  };

  Model.bind_list = function(query, initial, callback) {
    var bind_func, key, kls, target, val;
    if (initial == null) {
      initial = [];
    }
    if (callback == null) {
      callback = false;
    }
    target = ko.observableArray(initial);
    target.is_loading = ko.observable(false);
    kls = this;
    this.list(query, target, callback);
    bind_func = function() {
      if (!target.is_bind_stopped) {
        target.removeAll();
        return kls.list(query, target, callback);
      }
    };
    target.bind_func = bind_func;
    for (key in query) {
      val = query[key];
      if (ko.isObservable(val)) {
        val.subscribe(function(newval) {
          return bind_func();
        });
      }
    }
    return target;
  };

  Model.bind_detail = function(pk_observable, initial, callback) {
    var kls, target;
    if (initial == null) {
      initial = '';
    }
    if (callback == null) {
      callback = false;
    }
    target = ko.observableArray(initial);
    target.is_loading = ko.observable(false);
    kls = this;
    this.detail(pk_observable(), target, callback);
    pk_observable.subscribe(function(newval) {
      return kls.detail(pk_observable(), target, callback);
    });
    return target;
  };

  Model.custom = function(funcname, query, target, callback) {
    var url;
    url = this.endpoint + '/custom/' + this._modelname + '/' + funcname;
    if (query) {
      url += utils.api.parseParams(query);
    }
    return this._apicall(url, target, callback);
  };

  Model.list = function(query, target, callback) {
    var url;
    if (query == null) {
      query = false;
    }
    url = this.endpoint + '/list/' + this._modelname;
    if (query) {
      url += utils.api.parseParams(query);
    }
    return this._apicall(url, target, callback);
  };

  Model.detail = function(pk, target, callback) {
    var url;
    url = this.endpoint + '/detail/' + this._modelname + '/' + pk;
    return this._apicall(url, target, callback);
  };

  Model.create = function(query, callback) {
    var url;
    url = this.endpoint + '/create/' + this._modelname;
    if (query) {
      url += utils.api.parseParams(query);
    }
    return this._apicall(url, false, callback);
  };

  Model.update = function(pk, query, callback) {
    var url;
    url = this.endpoint + '/update/' + this._modelname + '/' + pk;
    if (query) {
      url += utils.api.parseParams(query);
    }
    return this._apicall(url, callback);
  };

  Model["delete"] = function(pk, callback) {
    var url;
    url = this.endpoint + '/delete/' + this._modelname + '/' + pk;
    return this._apicall(url, false, callback);
  };

  Model.list_sync = function(options, filter) {
    var bl, dics, key, obj, pk, results, tempval, val, _i, _len;
    dics = this.dics();
    results = [];
    for (_i = 0, _len = dics.length; _i < _len; _i++) {
      pk = dics[_i];
      obj = dics[pk];
      bl = true;
      for (key in options) {
        val = obj[key];
        tempval = options[key];
        if (val !== tempval) {
          bl = false;
          break;
        }
      }
      if (bl) {
        if (filter) {
          if (filter(obj)) {
            results.push(obj);
          }
        } else {
          results.push(obj);
        }
      }
    }
    return results;
  };

  Model.detail_sync = function(options) {
    var bl, dics, key, obj, pk, result, tempval, val;
    dics = this.dics();
    result = false;
    for (pk in dics) {
      obj = dics[pk];
      bl = true;
      for (key in options) {
        val = obj[key];
        tempval = options[key];
        if (val !== tempval) {
          bl = false;
          break;
        }
      }
      if (bl) {
        result = obj;
        break;
      }
    }
    return result;
  };

  Model.dics = function() {
    var _ref;
    return (_ref = this._dics) != null ? _ref : this._dics = {};
  };

  Model.clean = function() {
    return this._dics = {};
  };

  Model._relations = function() {
    var _ref;
    return (_ref = this.__relations) != null ? _ref : this.__relations = {};
  };

  Model._reverse_relations = function() {
    var _ref;
    return (_ref = this.__reverse_relations) != null ? _ref : this.__reverse_relations = {};
  };

  Model._torelations = function() {
    var _ref;
    return (_ref = this.__fromrelationstorelations) != null ? _ref : this.__fromrelationstorelations = {};
  };

  Model._fromrelations = function() {
    var _ref;
    return (_ref = this.__fromrelations) != null ? _ref : this.__fromrelations = {};
  };

  Model._start_observe = function(from, key, id) {
    var torelations;
    torelations = this._torelations();
    if (!(id in torelations)) {
      torelations[id] = {};
    }
    if (!(key in torelations[id])) {
      torelations[id][key] = [];
    }
    if (__indexOf.call(torelations[id][key], from) < 0) {
      return torelations[id][key].push(from);
    }
  };

  Model._make_from_relation = function(kls, to, key, id) {
    var fromrelations;
    fromrelations = kls._fromrelations();
    if (!(id in fromrelations)) {
      fromrelations[id] = {};
    }
    if (!(key in fromrelations[id])) {
      fromrelations[id][key] = [];
    }
    if (__indexOf.call(fromrelations[id][key], to) < 0) {
      return fromrelations[id][key].push(to);
    }
  };

  Model._bind_relations = function(obj) {
    var fromkls, fromobj, key, pk, torelations, _results;
    pk = this.unique_key(obj);
    torelations = this._torelations();
    if (pk in torelations) {
      _results = [];
      for (key in torelations[pk]) {
        _results.push((function() {
          var _i, _len, _ref, _results1;
          _ref = torelations[pk][key];
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            fromobj = _ref[_i];
            fromobj[key](obj);
            if (obj[key + '__reverse']) {
              obj[key + '__reverse'](fromobj);
            } else {
              obj[key + '__reverse'] = ko.observable(fromobj);
            }
            fromkls = fromobj.constructor;
            _results1.push(this._make_from_relation(fromkls, obj, key, this.unique_key(fromobj)));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }
  };

  function Model() {
    this.map = __bind(this.map, this);

    var fromkls, key, kls, reverse_relations;
    this.pk = ko.observable(-1);
    kls = this.constructor;
    reverse_relations = kls._reverse_relations();
    for (key in reverse_relations) {
      fromkls = reverse_relations[key];
      this[key + '__reverse'] = ko.observable("");
    }
  }

  Model.prototype.relation = function() {};

  Model.prototype.map = function(jsn, param) {
    var fromrelations, key, kls, relations, temprelations, tokls, toobj, val, _i, _len;
    kls = this.constructor;
    temprelations = [];
    for (key in jsn) {
      val = jsn[key];
      relations = kls._relations();
      fromrelations = kls._fromrelations();
      if (key in relations) {
        temprelations.push(key);
      } else {
        if (__indexOf.call(kls.observable_keys, key) >= 0) {
          if (this[key]) {
            this[key](val);
          } else {
            this[key] = ko.observable(val);
          }
        } else {
          this[key] = val;
        }
      }
    }
    for (_i = 0, _len = temprelations.length; _i < _len; _i++) {
      key = temprelations[_i];
      val = jsn[key];
      relations = kls._relations();
      fromrelations = kls._fromrelations();
      if (key in relations) {
        tokls = relations[key];
        toobj = utils.model.get(val, tokls);
        this[key + '__relation_id'] = val;
        tokls._start_observe(this, key, val);
        if (!toobj) {
          toobj = "";
        } else {
          if (toobj[key + '__reverse']) {
            toobj[key + '__reverse'](this);
          } else {
            toobj[key + '__reverse'] = ko.observable(this);
          }
          kls._make_from_relation(kls, toobj, key, kls.unique_key(this));
        }
        if (this[key]) {
          this[key](toobj);
        } else {
          this[key] = ko.observable(toobj);
        }
      } else {

      }
    }
    return this;
  };

  Model._observers = function() {
    var _ref;
    return (_ref = this.__observers) != null ? _ref : this.__observers = [];
  };

  Model._observe = function(observer) {
    return this._observers().push(observer);
  };

  Model._dispatchall = function() {
    var observer, _i, _len, _ref, _results;
    _ref = this._observers();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      observer = _ref[_i];
      _results.push(observer._dispatchall());
    }
    return _results;
  };

  Model._apicall = function(url, target, callback) {
    if (target) {
      target.is_loading(true);
    }
    return utils.api.get(url, [
      {
        key: this._modelname,
        "class": this,
        target: target
      }
    ], function(obj, objss) {
      if (callback) {
        callback(obj, objss);
      }
      if (target) {
        return target.is_loading(false);
      }
    });
  };

  return Model;

})();

/* -------------------------------------------- 
     Begin utils.date.coffee 
--------------------------------------------
*/


if (this.utils == null) {
  this.utils = {};
}

utils = this.utils;

utils.date = (function() {

  function date() {}

  date.reverse_for_safari = function(datestr, hoursplitter, datesplitter) {
    var date_hour, day_month_year, daystr, hourstr;
    daystr = datestr;
    hourstr = false;
    if (hoursplitter) {
      date_hour = datestr.split(hoursplitter);
      if (date_hour.length !== 2) {
        return datestr;
      }
      daystr = date_hour[0];
      hourstr = date_hour[1];
    }
    day_month_year = daystr.split(datesplitter);
    if (day_month_year.length !== 3) {
      return datestr;
    }
    daystr = "" + day_month_year[1] + "/" + day_month_year[2] + "/" + day_month_year[0];
    if (hourstr) {
      return "" + daystr + " " + hourstr;
    }
    return daystr;
  };

  date.formatedDate = (function() {
    var zFill;
    zFill = function(number) {
      var numStr;
      numStr = String(number);
      if (numStr.length < 2) {
        numStr = '0' + numStr;
      }
      return numStr;
    };
    return function(date, format) {
      var dateStrList;
      if (utils.type(date) === 'string') {
        dateStrList = date.split(/:|-|\s/);
        date = new Date(dateStrList[0], parseInt(dateStrList[1]) - 1, dateStrList[2], dateStrList[3], dateStrList[4], dateStrList[5]);
      }
      return format.replace(/%Y/, date.getFullYear()).replace(/%m/, zFill(date.getMonth() + 1)).replace(/%d/, zFill(date.getDate())).replace(/%H/, zFill(date.getHours())).replace(/%M/, zFill(date.getMinutes())).replace(/%S/, zFill(date.getSeconds()));
    };
  })();

  date.convertToJapaneseLikeTwitter = function(date, nodate) {
    var hour, interval, minutes, today;
    if (nodate == null) {
      nodate = false;
    }
    today = new Date();
    interval = today - date;
    minutes = Math.round(interval / (1000 * 60));
    hour = Math.round(interval / (60 * 60 * 1000));
    if (minutes < 10 && !nodate) {
      return "いま";
    }
    if (minutes < 60 && !nodate) {
      return "" + minutes + "分前";
    }
    if (hour < 24) {
      if (nodate) {
        return "今日";
      } else {
        return "" + hour + "時間前";
      }
    }
    return "" + (date.getMonth() + 1) + "/" + (date.getDate());
  };

  return date;

})();

/* -------------------------------------------- 
     Begin utils.router.coffee 
--------------------------------------------
*/


if (this.utils == null) {
  this.utils = {};
}

utils = this.utils;

utils.router = (function() {

  function router() {}

  router.decompose = function(template) {
    var h, hash, hashs, i, obj, p, prop, props, _i, _ref;
    obj = {};
    hash = location.hash;
    utils.log("hashchanged " + hash + " to " + template);
    props = template.split('/');
    hashs = hash.split('/');
    for (i = _i = 0, _ref = props.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      prop = props[i];
      if (prop.indexOf(":") === 0) {
        p = prop.replace(":", "");
        if (hashs.length > i) {
          h = hashs[i];
          obj[p] = h;
        } else {
          obj[p] = void 0;
        }
      }
    }
    return obj;
  };

  return router;

})();

/* -------------------------------------------- 
     Begin utils.ui.coffee 
--------------------------------------------
*/


if (this.utils == null) {
  this.utils = {};
}

utils = this.utils;

utils.ui = (function() {

  function ui() {}

  ui.formtohash = function(evt, url, dom) {
    document.location = url + $('input', dom).val();
    return false;
  };

  return ui;

})();

ko.bindingHandlers.fadeVisible = {
  init: function(element, valueAccessor) {
    var value;
    value = valueAccessor();
    return $(element).toggle(ko.utils.unwrapObservable(value));
  },
  update: function(element, valueAccessor) {
    var value;
    value = valueAccessor();
    if (ko.utils.unwrapObservable(value)) {
      return $(element).fadeIn();
    } else {
      return $(element).fadeOut();
    }
  }
};

utils.ui.PageManager = (function() {

  function PageManager(index_size) {
    if (index_size == null) {
      index_size = 3;
    }
    this.set_index = __bind(this.set_index, this);

    this.set_max_index = __bind(this.set_max_index, this);

    this.index_size = index_size;
    this.start_index = ko.observable(0);
    this.end_index = ko.observable(this.index_size);
    this.pages = ko.observableArray([]);
    this.selected_page = ko.observable(0);
  }

  PageManager.prototype.set_max_index = function(max_index) {
    var i, pages, _i, _ref;
    pages = [];
    for (i = _i = 0, _ref = Math.floor((max_index - 1) / this.index_size); 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      pages.push(i);
    }
    return this.pages(pages);
  };

  PageManager.prototype.set_index = function(index) {
    this.start_index(index * this.index_size);
    this.end_index((index + 1) * this.index_size);
    return this.selected_page(index);
  };

  return PageManager;

})();