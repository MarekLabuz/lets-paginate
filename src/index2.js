import _ from 'lodash'
import { connect } from 'react-redux'

const SET_BUFFER_CONTENT = 'SET_BUFFER_CONTENT'
const CLEAR_BUFFER = 'CLEAR_BUFFER'

const setBufferContent = (name, content) => ({
  type: SET_BUFFER_CONTENT,
  payload: {
    name,
    content
  }
})

const clearBuffer = name => ({
  type: CLEAR_BUFFER,
  payload: {
    name
  }
})

let buffer = {}

const reducerBuffer = (state = {}, action) => {
  switch (action.type) {
    case SET_BUFFER_CONTENT:
      return {
        ...state,
        [action.payload.name]: action.payload.content
      }
    case CLEAR_BUFFER:
      return _.omit(state, [action.payload.name])
    default:
      return state
  }
}

const dispatchBuffer = (action) => {
  buffer = reducerBuffer(buffer, action)
  return buffer
}

const SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA'
const SET_PAGINATION = 'lets-paginate/SET_PAGINATION'
const FETCH_LOCK = 'lets-paginate/FETCH_LOCK'

const setCachedData = (name, cachedData) => ({
  type: SET_CACHED_DATA,
  payload: {
    name,
    cachedData
  }
})

const setPagination = ({ page, entries }, name) => ({
  type: SET_PAGINATION,
  payload: {
    name,
    page,
    entries
  }
})

const setFetchLock = name => ({
  type: FETCH_LOCK,
  payload: {
    name
  }
})

const initialState = {
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CACHED_DATA:
      return {
        ...state,
        [action.payload.name]: {
          ...state[action.payload.name],
          cachedData: action.payload.cachedData
        }
      }
    case SET_PAGINATION:
      return {
        ...state,
        [action.payload.name]: {
          ...state[action.payload.name],
          ...(
            !action.payload.page && !action.payload.entires
              ?
                {
                  page: undefined,
                  entries: undefined
                }
              :
                {
                  page: action.payload.page || (state[action.payload.name] || {}).page,
                  entries: action.payload.entries || (state[action.payload.name] || {}).entries,
                }
          ),
          fetchLock: false
        }
      }
    case FETCH_LOCK:
      return {
        ...state,
        [action.payload.name]: {
          ...state[action.payload.name],
          fetchLock: true
        }
      }
    default:
      return state
  }
}

const rangePosition = ([b1, b2], [g1, g2]) => (
  (b1 >= g1 && b2 <= g2 && 'in') ||
  (b1 >= g1 && b1 <= g2 + 1 && b2 >= g2 && 'right') ||
  (b1 <= g1 && b2 >= g1 - 1 && b2 <= g2 && 'left') ||
  (b1 <= g1 && b2 >= g2 && 'over') ||
  ((b1 >= g2 || b2 <= g1) && 'out')
)

const mergeKeys = (obj1, obj2) => {
  const [key1, key2] = [Object.keys(obj1)[0], Object.keys(obj2)[0]]
  const [value1, value2] = [obj1[key1] || [], obj2[key2] || []]
  const [from1, to1] = key1.split('-').map(v => parseInt(v, 10))
  const [from2, to2] = key2.split('-').map(v => parseInt(v, 10))

  switch (rangePosition([from1, to1], [from2, to2])) {
    case 'in':
    case 'right':
    case 'left':
    case 'over':
      return {
        data: {
          [`${Math.min(from1, from2)}-${Math.max(to1, to2)}`]: [
            ...value2.slice(0, Math.max(from1 - from2, 0)),
            ...value1,
            ...value2.slice((to1 - from2) + 1)
          ]
        },
        merged: true
      }
    case 'out':
    default:
      return { data: obj1, merged: false }
  }
}

const merge = (cachedData, newObj) => {
  const result = _
    .chain(cachedData)
    .keys()
    .reduce((acc, key) => {
      const { data, merged } = mergeKeys(acc.merged, { [key]: cachedData[key] })
      return {
        rest: {
          ...acc.rest,
          ...(!merged ? { [key]: cachedData[key] } : {})
        },
        merged: data
      }
    }, { rest: {}, merged: newObj })
    .value()

  return {
    ...result.rest,
    ...result.merged
  }
}

const getAllCachedData = (cachedData) => {
  return cachedData
}

const getDataFromCache = (dispatch, fetch, name) => (cachedData, { page, entries, fetchLock }) => {
  const getAll = (!!page || !!entries)
  const [reqFrom, reqTo] = getAll ? [] : [(page - 1) * entries, (page * entries) - 1]
  const dataFound = getAll
    ? getAllCachedData(cachedData)
    : _
      .chain(cachedData)
      .keys()
      .reduce((data, key) => {
        const [from, to] = key.split('-').map(str => parseInt(str, 10))
        return (
          data ||
          (
            rangePosition([reqFrom, reqTo], [from, to]) === 'in'
              ? cachedData[key].slice(reqFrom - from, (reqTo - from) + 1)
              : undefined
          )
        )
      }, undefined)
      .value()

  if (!dataFound && !fetchLock) {
    dispatch(setFetchLock(name))
    dispatch(fetch({ page, entries }, (() => {
      const bufferName = buffer[name]
      dispatchBuffer(clearBuffer(name))
      return bufferName
    })()))
      .then((data) => {
        dispatch(setCachedData(
          name,
          merge(cachedData, { [`${reqFrom}-${reqTo}`]: !!data && Array.isArray(data) ? data : [] })
        ))
      })
  }

  return dataFound
}

export const reduxPagination = ({ name, fetch }) => Component => connect(
  (state) => {
    const nameState = (state.pagination[name] || {})
    return {
      data: nameState.cachedData,
      page: nameState.page,
      entries: nameState.entries,
      fetchLock: nameState.fetchLock
    }
  },
  dispatch => ({
    getData: (...params) => getDataFromCache(dispatch, fetch, name)(...params),
    onPageChange: (pagination, options) => {
      dispatchBuffer(setBufferContent(name, options))
      dispatch(setPagination({ ...pagination }, name))
    }
  }),
  ({ data, page, entries, fetchLock }, { getData, onPageChange }) => ({
    data: getData(data, { page, entries, fetchLock }),
    page,
    entries,
    onPageChange
  })
)(Component)
