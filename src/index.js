'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reduxPagination = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setPagination = setPagination;
exports.resetCachedData = resetCachedData;
exports.reducer = reducer;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var initialState = {
  page: 1,
  entries: 25,
  cachedData: {}
};

var gcd = function gcd(a, b) {
  return !b ? a : gcd(b, a % b);
};

var calcStep = function calcStep(_ref) {
  var _ref2 = _toArray(_ref);

  var _ref2$ = _ref2[0];
  var first = _ref2$ === undefined ? 5 : _ref2$;
  var second = _ref2[1];

  var entriesRange = _ref2.slice(2);

  return !entriesRange.length ? gcd(first, second) : calcStep([gcd(first, second)].concat(_toConsumableArray(entriesRange)));
};

var SET_PAGINATION = 'lets-paginate/SET_PAGINATION';
var SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA';
var RESET_CACHED_DATA = 'lets-paginate/RESET_CACHED_DATA';

function setPagination(pagination) {
  return {
    type: SET_PAGINATION,
    payload: {
      pagination: pagination
    }
  };
}

function setCachedData(name, cachedData) {
  return {
    type: SET_CACHED_DATA,
    payload: {
      name: name,
      cachedData: cachedData
    }
  };
}

function resetCachedData(name) {
  return {
    type: RESET_CACHED_DATA,
    payload: {
      name: name
    }
  };
}

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case SET_PAGINATION:
      return _extends({}, state, action.payload.pagination);
    case SET_CACHED_DATA:
      return _extends({}, state, {
        cachedData: _extends({}, state.cachedData, _defineProperty({}, action.payload.name, _extends({}, state.cachedData[action.payload.name], action.payload.cachedData)))
      });
    case RESET_CACHED_DATA:
      return _extends({}, state, {
        cachedData: _extends({}, state.cachedData, state.cachedData[action.payload.name] ? _defineProperty({}, action.payload.name, {}) : {})
      });
    default:
      return state;
  }
}

var anyNextPageExistsThatIsNull = function anyNextPageExistsThatIsNull(cachedData, end) {
  return _lodash2.default.some(Object.keys(cachedData), function (key) {
    return JSON.parse(key)[0] >= end && cachedData[key] === null;
  });
};

var paginate = function paginate(name, fetch, page, entries, entriesRange, dispatch, cachedData, responseAccess, encode, decode) {
  dispatch(setPagination({ page: page, entries: entries }));
  var step = calcStep(entriesRange);
  var start = (page - 1) * entries;
  var end = page * entries;
  var desiredLength = entries / step;

  var data = _lodash2.default.range(0, (end - start) / step).reduce(function (acc, curr) {
    var dataOptional = cachedData['[' + (start + curr * step) + ', ' + (start + curr * step + step) + ']'];
    return [].concat(_toConsumableArray(acc), [dataOptional]);
  }, []).filter(function (item) {
    return item !== undefined;
  });

  return data.length < desiredLength || _lodash2.default.every(data, function (item) {
    return item === null;
  }) || _lodash2.default.some(data, function (item) {
    return item === null;
  }) && anyNextPageExistsThatIsNull(cachedData, end) ? fetch({ page: page, entries: entries }).then(function (response) {
    var _ref4 = responseAccess ? responseAccess(response) : response;

    var data = _ref4.data;

    var chunksOptional = _lodash2.default.chunk(data, step);
    var difference = desiredLength - chunksOptional.length;
    var chunks = difference > 0 ? chunksOptional.concat(_lodash2.default.times(difference, function () {
      return null;
    })) : chunksOptional;
    var cachedData = _extends({}, cachedData, chunks.reduce(function (acc, curr, index) {
      return _extends({}, acc, _defineProperty({}, '[' + (start + index * step) + ', ' + (start + index * step + step) + ']', encode && curr ? encode(curr) : curr));
    }, []));
    dispatch(setCachedData(name, cachedData));
    return {
      data: encode ? encode(data) : data,
      response: response
    };
  }).catch(function (error) {
    throw new Error(error);
  }) : Promise.resolve({ data: decode ? decode(data.filter(function (item) {
      return !!item;
    })) : _lodash2.default.flatten(data.filter(function (item) {
      return !!item;
    }))
  });
};

var mapStateToPropsCreator = function mapStateToPropsCreator(_ref5, mapStateToProps) {
  var name = _ref5.name;
  return function (state, props) {
    return _extends({
      cachedData: state.pagination.cachedData[name] || {},
      page: state.pagination.page,
      entries: state.pagination.entries
    }, mapStateToProps ? mapStateToProps(state, props) : {});
  };
};

var mapDispatchToPropsCreator = function mapDispatchToPropsCreator(_ref6, mapDispatchTopProps) {
  var name = _ref6.name;
  var entriesRange = _ref6.entriesRange;
  var action = _ref6.action;
  var responseAccess = _ref6.responseAccess;
  var encode = _ref6.encode;
  var decode = _ref6.decode;
  return function (dispatch, props) {
    var promise = function promise(_ref7) {
      var page = _ref7.page;
      var entries = _ref7.entries;
      var entriesRange = _ref7.entriesRange;
      var cachedData = _ref7.cachedData;
      return function () {
        var fetch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Promise.resolve({ data: [] });
        return paginate(name, fetch, page, entries, entriesRange, dispatch, cachedData, responseAccess, encode, decode);
      };
    };

    return _extends({
      dispatch: dispatch,
      onPageChange: function onPageChange(cachedData, statePage, stateEntries) {
        return function (_ref8) {
          var page = _ref8.page;
          var entries = _ref8.entries;
          var params = _ref8.params;
          return dispatch(action(promise({ page: page || statePage, entries: entries || stateEntries, entriesRange: entriesRange, cachedData: cachedData }), _extends({
            entries: entries || stateEntries,
            page: page || statePage
          }, params)));
        };
      }
    }, mapDispatchTopProps ? mapDispatchTopProps(dispatch, props) : {});
  };
};

var mergeProps = function mergeProps(_ref9, _ref10, ownProps) {
  var cachedData = _ref9.cachedData;
  var page = _ref9.page;
  var entries = _ref9.entries;

  var restStateProps = _objectWithoutProperties(_ref9, ['cachedData', 'page', 'entries']);

  var onPageChange = _ref10.onPageChange;

  var restDispatchProps = _objectWithoutProperties(_ref10, ['onPageChange']);

  return _extends({}, ownProps, {
    page: page,
    entries: entries
  }, restStateProps, {
    onPageChange: onPageChange(cachedData, page, entries)
  }, restDispatchProps);
};

var reduxPagination = exports.reduxPagination = function reduxPagination(_ref11, mapStateToProps, mapDispatchTopProps) {
  var name = _ref11.name;
  var entriesRange = _ref11.entriesRange;
  var responseAccess = _ref11.responseAccess;
  var encode = _ref11.encode;
  var decode = _ref11.decode;
  var action = _ref11.action;
  return function (Comp) {
    return (0, _reactRedux.connect)(mapStateToPropsCreator({ name: name }, mapStateToProps), mapDispatchToPropsCreator({ name: name, entriesRange: entriesRange, action: action, responseAccess: responseAccess, encode: encode, decode: decode }, mapDispatchTopProps), mergeProps)(Comp);
  };
};
