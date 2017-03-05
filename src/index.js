'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reduxPagination = exports.middleware = exports.insertItemIntoData = exports.getMaxIndex = exports.removeItemFromData = exports.selector = exports.getDataFromCache = exports.getAllCachedData = exports.merge = exports.mergeKeys = exports.rangePosition = exports.reducer = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactRedux = require('react-redux');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA';
var SET_PAGINATION = 'lets-paginate/SET_PAGINATION';
var RESET_CACHED_DATA = 'lets-paginate/RESET_CACHED_DATA';
var PAGE_CHANGE = 'lets-paginate/PAGE_CHANGE';
var ADD_ITEM = 'lets-paginate/ADD_ITEM';
var REMOVE_ITEM = 'lets-paginate/REMOVE_ITEM';

var addItem = function addItem(name, item, index) {
  return {
    type: ADD_ITEM,
    payload: {
      name: name,
      item: item,
      index: index
    }
  };
};

var removeItem = function removeItem(name, relativeIndex, options, _ref) {
  var fetch = _ref.fetch,
      allDataExpected = _ref.allDataExpected;
  return {
    type: REMOVE_ITEM,
    payload: {
      name: name,
      relativeIndex: relativeIndex,
      options: options,
      fetch: fetch || function () {
        return Promise.resolve([]);
      },
      allDataExpected: allDataExpected || false
    }
  };
};

var pageChange = function pageChange(name, _ref2, options) {
  var page = _ref2.page,
      entries = _ref2.entries,
      fetch = _ref2.fetch,
      allDataExpected = _ref2.allDataExpected;
  return {
    type: PAGE_CHANGE,
    payload: {
      name: name,
      page: page,
      entries: entries,
      fetch: fetch || function () {
        return Promise.resolve([]);
      },
      allDataExpected: allDataExpected || false,
      options: options
    }
  };
};

var resetCachedData = function resetCachedData(name) {
  return {
    type: RESET_CACHED_DATA,
    payload: {
      name: name
    }
  };
};

var setCachedData = function setCachedData(name, cachedData, isAllData, type) {
  return {
    type: SET_CACHED_DATA,
    payload: {
      name: name,
      cachedData: cachedData,
      isAllData: isAllData,
      type: type
    }
  };
};

var setPagination = function setPagination(name, _ref3) {
  var page = _ref3.page,
      entries = _ref3.entries;
  return {
    type: SET_PAGINATION,
    payload: {
      name: name,
      page: page,
      entries: entries
    }
  };
};

var reducer = exports.reducer = function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case SET_CACHED_DATA:
      return _extends({}, state, _defineProperty({}, action.payload.name, _extends({}, state[action.payload.name], {
        cachedData: action.payload.cachedData
      }, action.payload.isAllData !== undefined ? { isAllData: action.payload.isAllData } : {}, action.payload.type !== undefined ? { type: action.payload.type } : {})));
    case SET_PAGINATION:
      return _extends({}, state, _defineProperty({}, action.payload.name, _extends({}, state[action.payload.name], {
        page: action.payload.page,
        entries: action.payload.entries
      })));
    case RESET_CACHED_DATA:
      return _extends({}, state, _defineProperty({}, action.payload.name, _extends({}, state[action.payload.name], {
        cachedData: {}
      })));
    default:
      return state;
  }
};

var rangePosition = exports.rangePosition = function rangePosition(_ref4, _ref5) {
  var _ref7 = _slicedToArray(_ref4, 2),
      b1 = _ref7[0],
      b2 = _ref7[1];

  var _ref6 = _slicedToArray(_ref5, 2),
      g1 = _ref6[0],
      g2 = _ref6[1];

  return b1 >= g1 && b2 <= g2 && 'in' || b1 >= g1 && b1 <= g2 + 1 && b2 >= g2 && 'right' || b1 <= g1 && b2 >= g1 - 1 && b2 <= g2 && 'left' || b1 <= g1 && b2 >= g2 && 'over' || (b1 >= g2 || b2 <= g1) && 'out';
};

var mergeKeys = exports.mergeKeys = function mergeKeys(obj1, obj2) {
  var _ref8 = [Object.keys(obj1)[0], Object.keys(obj2)[0]],
      key1 = _ref8[0],
      key2 = _ref8[1];
  var value1 = obj1[key1] || [],
      value2 = obj2[key2] || [];

  var _key1$split$map = key1.split('-').map(function (v) {
    return parseInt(v, 10);
  }),
      _key1$split$map2 = _slicedToArray(_key1$split$map, 2),
      from1 = _key1$split$map2[0],
      to1 = _key1$split$map2[1];

  var _key2$split$map = key2.split('-').map(function (v) {
    return parseInt(v, 10);
  }),
      _key2$split$map2 = _slicedToArray(_key2$split$map, 2),
      from2 = _key2$split$map2[0],
      to2 = _key2$split$map2[1];

  switch (rangePosition([from1, to1], [from2, to2])) {
    case 'in':
    case 'right':
    case 'left':
    case 'over':
      return {
        data: _defineProperty({}, Math.min(from1, from2) + '-' + Math.max(to1, to2), [].concat(_toConsumableArray(value2.slice(0, Math.max(from1 - from2, 0))), _toConsumableArray(value1), _toConsumableArray(value2.slice(to1 - from2 + 1)))),
        merged: true
      };
    case 'out':
    default:
      return { data: obj1, merged: false };
  }
};

var merge = exports.merge = function merge(cachedData, newObj) {
  var result = Object.keys(cachedData).reduce(function (acc, key) {
    var _mergeKeys = mergeKeys(acc.merged, _defineProperty({}, key, cachedData[key])),
        data = _mergeKeys.data,
        merged = _mergeKeys.merged;

    return {
      rest: _extends({}, acc.rest, !merged ? _defineProperty({}, key, cachedData[key]) : {}),
      merged: data
    };
  }, { rest: {}, merged: newObj });

  return _extends({}, result.rest, result.merged);
};

var getAllCachedData = exports.getAllCachedData = function getAllCachedData(cachedData) {
  if (cachedData.hasOwnProperty('u-u')) {
    // eslint-disable-line
    return cachedData['u-u'];
  }

  var dataFound = Object.keys(cachedData).sort(function (a, b) {
    return parseInt(a, 10) - parseInt(b, 10);
  }).reduce(function (acc, key) {
    return [].concat(_toConsumableArray(acc), _toConsumableArray(cachedData[key]));
  }, []);

  return dataFound.length ? dataFound : undefined;
};

var getDataFromCache = exports.getDataFromCache = function getDataFromCache(_ref10) {
  var _ref10$cachedData = _ref10.cachedData,
      cachedData = _ref10$cachedData === undefined ? {} : _ref10$cachedData,
      page = _ref10.page,
      entries = _ref10.entries,
      type = _ref10.type,
      isAllData = _ref10.isAllData;

  var getAll = type !== 'array' && !!type || !page || !entries;

  var _ref11 = getAll ? [] : [(page - 1) * entries, page * entries - 1],
      _ref12 = _slicedToArray(_ref11, 2),
      reqFrom = _ref12[0],
      reqTo = _ref12[1];

  var dataFound = getAll ? getAllCachedData(cachedData) : Object.keys(cachedData).reduce(function (data, key) {
    var _key$split$map = key.split('-').map(function (str) {
      return parseInt(str, 10);
    }),
        _key$split$map2 = _slicedToArray(_key$split$map, 2),
        from = _key$split$map2[0],
        to = _key$split$map2[1];

    return data || (isAllData || rangePosition([reqFrom, reqTo], [from, to]) === 'in' ? cachedData[key].slice(reqFrom - from, reqTo - from + 1) : undefined);
  }, undefined);

  return { dataFound: dataFound, reqFrom: reqFrom, reqTo: reqTo };
};

var selector = exports.selector = function selector(name) {
  return function (state) {
    var _ref13 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        page = _ref13.page,
        entries = _ref13.entries;

    return getDataFromCache({ cachedData: state.pagination[name].cachedData, page: page, entries: entries }).dataFound;
  };
};

var removeItemFromData = exports.removeItemFromData = function removeItemFromData(cachedData, index) {
  return Object.keys(cachedData).sort(function (a, b) {
    return parseInt(a, 10) - parseInt(b, 10);
  }).reduce(function (acc, key) {
    var _key$split$map3 = key.split('-').map(function (str) {
      return parseInt(str, 10);
    }),
        _key$split$map4 = _slicedToArray(_key$split$map3, 2),
        from = _key$split$map4[0],
        to = _key$split$map4[1];

    return acc.found && { data: _extends({}, acc.data, _defineProperty({}, from - 1 + '-' + (to - 1), cachedData[key])), found: true } || rangePosition([index, index], [from, to]) === 'in' && {
      data: _extends({}, acc.data, _defineProperty({}, from + '-' + (to - 1), [].concat(_toConsumableArray(cachedData[key].slice(0, index - from)), _toConsumableArray(cachedData[key].slice(index - from + 1))))),
      found: true
    } || { data: _extends({}, acc.data, _defineProperty({}, key, cachedData[key])), found: false };
  }, { data: {}, found: false });
};

var getMaxIndex = exports.getMaxIndex = function getMaxIndex(data) {
  return parseInt(Object.keys(data).length === 0 ? 0 : Object.keys(data).sort(function (a, b) {
    return parseInt(b, 10) - parseInt(a, 10);
  })[0].split('-')[1], 10);
};

var insertItemIntoData = exports.insertItemIntoData = function insertItemIntoData(cachedData, item, index) {
  var _Object$keys$sort$red = Object.keys(cachedData).sort(function (a, b) {
    return parseInt(a, 10) - parseInt(b, 10);
  }).reduce(function (acc, key) {
    var _key$split$map5 = key.split('-').map(function (str) {
      return parseInt(str, 10);
    }),
        _key$split$map6 = _slicedToArray(_key$split$map5, 2),
        from = _key$split$map6[0],
        to = _key$split$map6[1];

    return acc.found && { data: _extends({}, acc.data, _defineProperty({}, from + 1 + '-' + (to + 1), cachedData[key])), found: true } || rangePosition([index, index], [from, to]) !== 'out' && {
      data: _extends({}, acc.data, _defineProperty({}, from + '-' + (to + 1), [].concat(_toConsumableArray(cachedData[key].slice(0, index - from)), [item], _toConsumableArray(cachedData[key].slice(index - from))))),
      found: true
    } || { data: _extends({}, acc.data, _defineProperty({}, key, cachedData[key])), found: false };
  }, { data: {}, found: false }),
      data = _Object$keys$sort$red.data,
      found = _Object$keys$sort$red.found;

  return _extends({}, data, found ? {} : _defineProperty({}, index + '-' + index, [item]));
};

var onPageChange = function onPageChange(_ref15, _ref16) {
  var name = _ref15.name,
      store = _ref15.store,
      next = _ref15.next,
      fetch = _ref15.fetch,
      allDataExpected = _ref15.allDataExpected;
  var newPage = _ref16.page,
      newEntries = _ref16.entries,
      options = _ref16.options;

  var state1 = store.getState().pagination[name] || {};

  var _ref17 = !newPage && !newEntries ? { page: undefined, entries: undefined } : { page: newPage || state1.page, entries: newEntries || state1.entries },
      page = _ref17.page,
      entries = _ref17.entries;

  if (state1.page !== page || state1.entries !== entries) {
    next(setPagination(name, { page: page, entries: entries }));
  }

  var state2 = store.getState().pagination[name];

  var _getDataFromCache = getDataFromCache(state2),
      dataFound = _getDataFromCache.dataFound,
      reqFrom = _getDataFromCache.reqFrom,
      reqTo = _getDataFromCache.reqTo;

  if (!dataFound && !state2.isAllData) {
    next(fetch.apply(undefined, [{ page: page, entries: entries }].concat(_toConsumableArray(options)))).then(function (data) {
      var state3 = store.getState().pagination[name];
      if (Array.isArray(data)) {
        var probableReqTo = (reqFrom || 0) + (data.length - 1);
        next(setCachedData(name, merge(state3.cachedData || {}, _defineProperty({}, (reqFrom || 0) + '-' + (allDataExpected ? probableReqTo : reqTo), !!data && Array.isArray(data) ? data : [])), allDataExpected, 'array'));
      } else {
        next(setCachedData(name, { 'u-u': data }, true, typeof data === 'undefined' ? 'undefined' : _typeof(data)));
      }
    });
  }
};

var middleware = exports.middleware = function middleware(store) {
  return function (next) {
    return function (action) {
      if (action.type === PAGE_CHANGE) {
        var _action$payload = action.payload,
            name = _action$payload.name,
            page = _action$payload.page,
            entries = _action$payload.entries,
            fetch = _action$payload.fetch,
            allDataExpected = _action$payload.allDataExpected,
            options = _action$payload.options;

        onPageChange({ name: name, store: store, next: next, fetch: fetch, allDataExpected: allDataExpected }, { page: page, entries: entries, options: options });
      } else if (action.type === ADD_ITEM) {
        var _action$payload2 = action.payload,
            _name = _action$payload2.name,
            item = _action$payload2.item,
            index = _action$payload2.index;

        var _ref18 = store.getState().pagination[_name] || {},
            cachedData = _ref18.cachedData;

        var i = index === -1 ? getMaxIndex(cachedData || {}) + 1 : index;
        next(setCachedData(_name, insertItemIntoData(cachedData || {}, item, i)));
      } else if (action.type === REMOVE_ITEM) {
        var _action$payload3 = action.payload,
            _name2 = _action$payload3.name,
            relativeIndex = _action$payload3.relativeIndex,
            _options = _action$payload3.options,
            _fetch = _action$payload3.fetch,
            _allDataExpected = _action$payload3.allDataExpected;

        var _ref19 = store.getState().pagination[_name2] || {},
            _cachedData = _ref19.cachedData,
            _page = _ref19.page,
            _entries = _ref19.entries;

        var _index = !_page && !_entries ? relativeIndex : (_page - 1) * _entries + relativeIndex;

        var _removeItemFromData = removeItemFromData(_cachedData || {}, _index),
            newData = _removeItemFromData.data,
            found = _removeItemFromData.found;

        if (found) {
          next(setCachedData(_name2, newData));
          onPageChange({ name: _name2, store: store, next: next, fetch: _fetch, allDataExpected: _allDataExpected }, { page: _page, entries: _entries, options: _options });
        }
      }
      return next(action);
    };
  };
};

var cap = function cap(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

var mapStateToProps = function mapStateToProps(state, _ref20) {
  var names = _ref20.names;
  return names.reduce(function (acc, name) {
    var _extends11;

    var nameState = state.pagination[name] || {};
    var capName = cap(name);

    return _extends({}, acc, (_extends11 = {}, _defineProperty(_extends11, 'data' + capName, getDataFromCache(nameState).dataFound), _defineProperty(_extends11, 'page' + capName, nameState.page), _defineProperty(_extends11, 'entries' + capName, nameState.entries), _extends11));
  }, { state: state });
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, _ref21) {
  var names = _ref21.names,
      fetch = _ref21.fetch,
      allDataExpected = _ref21.allDataExpected;
  return names.reduce(function (acc, name, i) {
    var _extends12;

    return _extends({}, acc, (_extends12 = {}, _defineProperty(_extends12, 'onPageChange' + cap(name), function undefined(_ref22) {
      for (var _len = arguments.length, options = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        options[_key - 1] = arguments[_key];
      }

      var page = _ref22.page,
          entries = _ref22.entries;
      return dispatch(pageChange(name, { page: page, entries: entries, fetch: fetch[i], allDataExpected: allDataExpected[i] }, options));
    }), _defineProperty(_extends12, 'onAddItem' + cap(name), function undefined(item) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return dispatch(addItem(name, item, index));
    }), _defineProperty(_extends12, 'onRemoveItem' + cap(name), function undefined(relativeIndex) {
      for (var _len2 = arguments.length, options = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        options[_key2 - 1] = arguments[_key2];
      }

      return dispatch(removeItem(name, relativeIndex, options, { fetch: fetch[i], allDataExpected: allDataExpected[i] }));
    }), _defineProperty(_extends12, 'reset' + cap(name), function undefined() {
      return dispatch(resetCachedData(name));
    }), _extends12));
  }, { dispatch: dispatch });
};

var reduxPagination = function reduxPagination(_ref23) {
  var _ref23$names = _ref23.names,
      names = _ref23$names === undefined ? [] : _ref23$names,
      _ref23$fetch = _ref23.fetch,
      fetch = _ref23$fetch === undefined ? [] : _ref23$fetch,
      _ref23$allDataExpecte = _ref23.allDataExpected,
      allDataExpected = _ref23$allDataExpecte === undefined ? [] : _ref23$allDataExpecte;
  var mapStateAndDispatchToProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  return function (Component) {
    return (0, _reactRedux.connect)(function (state) {
      return mapStateToProps(state, { names: names });
    }, function (dispatch) {
      return mapDispatchToProps(dispatch, { names: names, fetch: fetch, allDataExpected: allDataExpected });
    }, function (_ref24, _ref25, ownProps) {
      var dispatch = _ref25.dispatch,
          restDispatchProps = _objectWithoutProperties(_ref25, ['dispatch']);

      var state = _ref24.state,
          restStateProps = _objectWithoutProperties(_ref24, ['state']);

      return _extends({}, ownProps, restStateProps, restDispatchProps, mapStateAndDispatchToProps(state, dispatch, ownProps));
    })(Component);
  };
};
exports.reduxPagination = reduxPagination;
