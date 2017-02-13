'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reduxPagination = exports.insertItemIntoData = exports.getMaxIndex = exports.removeItemFromData = exports.selector = exports.getDataFromCache = exports.getAllCachedData = exports.merge = exports.mergeKeys = exports.rangePosition = exports.reducer = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactRedux = require('react-redux');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA';
var SET_PAGINATION = 'lets-paginate/SET_PAGINATION';

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

var setPagination = function setPagination(_ref, name) {
  var page = _ref.page,
      entries = _ref.entries;
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
    default:
      return state;
  }
};

var rangePosition = exports.rangePosition = function rangePosition(_ref2, _ref3) {
  var _ref5 = _slicedToArray(_ref2, 2),
      b1 = _ref5[0],
      b2 = _ref5[1];

  var _ref4 = _slicedToArray(_ref3, 2),
      g1 = _ref4[0],
      g2 = _ref4[1];

  return b1 >= g1 && b2 <= g2 && 'in' || b1 >= g1 && b1 <= g2 + 1 && b2 >= g2 && 'right' || b1 <= g1 && b2 >= g1 - 1 && b2 <= g2 && 'left' || b1 <= g1 && b2 >= g2 && 'over' || (b1 >= g2 || b2 <= g1) && 'out';
};

var mergeKeys = exports.mergeKeys = function mergeKeys(obj1, obj2) {
  var _ref6 = [Object.keys(obj1)[0], Object.keys(obj2)[0]],
      key1 = _ref6[0],
      key2 = _ref6[1];
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

var getDataFromCache = exports.getDataFromCache = function getDataFromCache(cachedData) {
  var _ref8 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      page = _ref8.page,
      entries = _ref8.entries,
      isAllData = _ref8.isAllData,
      type = _ref8.type;

  var getAll = type !== 'array' && !!type || !page || !entries;

  var _ref9 = getAll ? [] : [(page - 1) * entries, page * entries - 1],
      _ref10 = _slicedToArray(_ref9, 2),
      reqFrom = _ref10[0],
      reqTo = _ref10[1];

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
    var _ref11 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        page = _ref11.page,
        entries = _ref11.entries;

    return getDataFromCache(state.pagination[name].cachedData, { page: page, entries: entries }).dataFound;
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

var onRemoveItemCore = function onRemoveItemCore(name, dispatch, data, _ref12, onPageChange) {
  var page = _ref12.page,
      entries = _ref12.entries;
  return function (relativeIndex) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }

    var index = !page && !entries ? relativeIndex : (page - 1) * entries + relativeIndex;

    var _removeItemFromData = removeItemFromData(data, index),
        newData = _removeItemFromData.data,
        found = _removeItemFromData.found;

    if (found) {
      dispatch(setCachedData(name, newData));
      onPageChange(newData).apply(undefined, [{ page: page, entries: entries }].concat(params));
    }
  };
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

var onAddItemCore = function onAddItemCore(name, dispatch, data) {
  return function (item) {
    var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var i = index === -1 ? getMaxIndex(data) + 1 : index;
    dispatch(setCachedData(name, insertItemIntoData(data, item, i)));
  };
};

var onPageChangeCore = function onPageChangeCore(name, dispatch, cachedData, fetch, isAllData, type, statePage, stateEntries, allDataExpected) {
  return function () {
    for (var _len2 = arguments.length, options = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      options[_key2 - 1] = arguments[_key2];
    }

    var _ref14 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        newPage = _ref14.page,
        newEntries = _ref14.entries;

    var _ref15 = !newPage && !newEntries ? {
      page: undefined,
      entries: undefined
    } : {
      page: newPage || statePage,
      entries: newEntries || stateEntries
    },
        page = _ref15.page,
        entries = _ref15.entries;

    if (statePage !== page || stateEntries !== entries) {
      dispatch(setPagination({ page: page, entries: entries }, name));
    }

    var _getDataFromCache = getDataFromCache(cachedData, { page: page, entries: entries, isAllData: isAllData, type: type }),
        dataFound = _getDataFromCache.dataFound,
        reqFrom = _getDataFromCache.reqFrom,
        reqTo = _getDataFromCache.reqTo;

    if (!dataFound && !isAllData) {
      dispatch(fetch.apply(undefined, [{ page: page, entries: entries }].concat(options))).then(function (data) {
        if (Array.isArray(data)) {
          var probableReqTo = (reqFrom || 0) + (data.length - 1);
          dispatch(setCachedData(name, merge(cachedData, _defineProperty({}, (reqFrom || 0) + '-' + (allDataExpected ? probableReqTo : reqTo), !!data && Array.isArray(data) ? data : [])), allDataExpected, 'array'));
        } else {
          dispatch(setCachedData(name, { 'u-u': data }, true, typeof data === 'undefined' ? 'undefined' : _typeof(data)));
        }
      });
    }
  };
};

var capitalize = function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

console.log(capitalize('rfere'));

// const generateStatePropsByName = (name, { }) => ({
//   `data`
// })

var reduxPagination = exports.reduxPagination = function reduxPagination(_ref16) {
  var name = _ref16.name,
      fetch = _ref16.fetch,
      _ref16$allDataExpecte = _ref16.allDataExpected,
      allDataExpected = _ref16$allDataExpecte === undefined ? false : _ref16$allDataExpecte;
  return function (Component) {
    return (0, _reactRedux.connect)(function (state) {
      var nameState = state.pagination[name] || {};
      return {
        data: nameState.cachedData || {},
        page: nameState.page,
        entries: nameState.entries,
        isAllData: nameState.isAllData,
        type: nameState.type
      };
    }, function (dispatch) {
      return {
        getData: function getData() {
          return getDataFromCache.apply(undefined, arguments).dataFound;
        },
        onPageChange: function onPageChange(data, isAllData, type, statePage, stateEntries) {
          return onPageChangeCore(name, dispatch, data, fetch, isAllData, type, statePage, stateEntries, allDataExpected);
        },
        onAddItem: function onAddItem(data) {
          return onAddItemCore(name, dispatch, data);
        },
        onRemoveItem: function onRemoveItem(data, pagination, onPageChange) {
          return onRemoveItemCore(name, dispatch, data, pagination, onPageChange);
        },
        reset: function reset(n) {
          return dispatch(setCachedData(n, {}));
        }
      };
    }, function (_ref17, _ref18) {
      var data = _ref17.data,
          page = _ref17.page,
          entries = _ref17.entries,
          isAllData = _ref17.isAllData,
          type = _ref17.type;
      var getData = _ref18.getData,
          onPageChange = _ref18.onPageChange,
          onAddItem = _ref18.onAddItem,
          onRemoveItem = _ref18.onRemoveItem,
          _reset = _ref18.reset;
      return {
        data: getData(data, { page: page, entries: entries, isAllData: isAllData, type: type }),
        page: page,
        entries: entries,
        onPageChange: onPageChange(data, isAllData, type, page, entries),
        onAddItem: onAddItem(data),
        onRemoveItem: onRemoveItem(data, { page: page, entries: entries }, function (newData) {
          return onPageChange(newData, isAllData, type, page, entries);
        }),
        reset: function reset() {
          return _reset(name);
        }
      };
    })(Component);
  };
};
