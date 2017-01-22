import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

const initialState = {
  page: 1,
  entries: 25,
  cachedData: {}
}

const gcd = (a, b) => !b ? a : gcd(b, a % b)

const calcStep = ([first = 5, second, ...entriesRange]) => !entriesRange.length
  ? gcd(first, second)
  : calcStep([gcd(first, second), ...entriesRange])

const SET_PAGINATION = 'lets-paginate/SET_PAGINATION'
const SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA'
const RESET_CACHED_DATA = 'lets-paginate/RESET_CACHED_DATA'

export function setPagination (pagination) {
  return {
    type: SET_PAGINATION,
    payload: {
      pagination
    }
  }
}

function setCachedData (name, cachedData) {
  return {
    type: SET_CACHED_DATA,
    payload: {
      name,
      cachedData
    }
  }
}

export function resetCachedData (name, reload) {
  return {
    type: RESET_CACHED_DATA,
    payload: {
      name,
      reload
    }
  }
}

export function reducer (state = initialState, action) {
  switch (action.type) {
    case SET_PAGINATION:
      return {
        ...state,
        ...action.payload.pagination
      }
    case SET_CACHED_DATA:
      return {
        ...state,
        cachedData: {
          ...state.cachedData,
          [action.payload.name]: {
            ...state.cachedData[action.payload.name],
            ...action.payload.cachedData
          }
        }
      }
    case RESET_CACHED_DATA:
      return {
        ...state,
        cachedData: {
          ...state.cachedData,
          ...(
            state.cachedData[action.payload.name]
              ? { [action.payload.name]: {} }
              : {}
          )
        }
      }
    default:
      return state
  }
}

const anyNextPageExistsThatIsNull = (cachedData, end) => {
  return _.some(Object.keys(cachedData), key => (JSON.parse(key)[0] >= end && cachedData[key] === null))
}

const paginate = (
  name,
  fetch,
  page,
  entries,
  entriesRange,
  dispatch,
  cachedData,
  responseAccess,
  encode,
  decode
) => {
  dispatch(setPagination({ page, entries }))
  const step = calcStep(entriesRange)
  const start = (page - 1) * entries
  const end = page * entries
  const desiredLength = (entries / step)

  const data = _.range(0, (end - start) / step).reduce((acc, curr) => {
    const dataOptional = cachedData[`[${start + (curr * step)}, ${start + (curr * step) + step}]`]
    return [
      ...acc,
      dataOptional
    ]
  }, []).filter(item => item !== undefined)

  return data.length < desiredLength || _.every(data, item => item === null) || _.some(data, item => item === null) && anyNextPageExistsThatIsNull(cachedData, end)
    ?
      fetch({ page, entries })
        .then(response => {
          const { data } = responseAccess ? responseAccess(response) : response
          const chunksOptional = _.chunk(data, step)
          const difference = desiredLength - chunksOptional.length
          const chunks = difference > 0 ? chunksOptional.concat(_.times(difference, () => null)) : chunksOptional
          const cachedData = {
            ...cachedData,
            ...chunks.reduce((acc, curr, index) => ({
              ...acc,
              [`[${start + (index * step)}, ${start + (index * step) + step}]`]: encode && curr ? encode(curr) : curr
            }), [])
          }
          dispatch(setCachedData(name, cachedData))
          return {
            data: encode ? encode(data) : data,
            response,
          }
        })
        .catch(error => {
          throw new Error(error)
        })
    :
      Promise.resolve({ data: decode
        ? decode(data.filter(item => !!item))
        : _.flatten(data.filter(item => !!item))
      })
}

const mapStateToPropsCreator = ({ name }, mapStateToProps) => (state, props) => {
  return {
    cachedData: state.pagination.cachedData[name] || {},
    page: state.pagination.page,
    entries: state.pagination.entries,
    ...(mapStateToProps ? mapStateToProps(state, props) : {})
  }
}

const mapDispatchToPropsCreator = ({
  name,
  entriesRange,
  action,
  responseAccess,
  encode,
  decode
}, mapDispatchTopProps) => (dispatch, props) => {
  const promise = ({ page, entries, entriesRange, cachedData }) => (fetch = Promise.resolve({ data: [] })) =>
    paginate(name, fetch, page, entries, entriesRange, dispatch, cachedData, responseAccess, encode, decode)

  return {
    dispatch,
    onPageChange: (cachedData, statePage, stateEntries,) => ({ page, entries, params }) =>
      dispatch(action(promise({ page: page || statePage, entries: entries || stateEntries, entriesRange, cachedData }), {
        entries: entries || stateEntries,
        page: page || statePage,
        ...params,
      })),
    ...(mapDispatchTopProps ? mapDispatchTopProps(dispatch, props) : {})
  }
}

const mergeProps = (
  { cachedData, page, entries, ...restStateProps },
  { onPageChange, ...restDispatchProps},
  ownProps
) => ({
  ...ownProps,
  page,
  entries,
  ...restStateProps,
  onPageChange: onPageChange(cachedData, page, entries),
  ...restDispatchProps
})

export const reduxPagination = ({
  name,
  entriesRange,
  responseAccess,
  encode,
  decode,
  action
},
  mapStateToProps,
  mapDispatchTopProps,
) => (Comp) =>
  connect(
    mapStateToPropsCreator({ name }, mapStateToProps),
    mapDispatchToPropsCreator({ name, entriesRange, action, responseAccess, encode, decode }, mapDispatchTopProps),
    mergeProps
  )(Comp)
