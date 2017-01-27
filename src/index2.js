import _ from 'lodash'
import { connect } from 'react-redux'

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

const setPagination = ({ page, entries }) => ({
  type: SET_PAGINATION,
  payload: {
    page,
    entries
  }
})

const setFetchLock = () => ({
  type: FETCH_LOCK
})

const initialState = {
  cachedData: {},
  fetchLock: true
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CACHED_DATA:
      return {
        ...state,
        cachedData: {
          ...state.cachedData,
          [action.payload.name]: action.payload.cachedData
        }
      }
    case SET_PAGINATION:
      return {
        ...state,
        page: action.payload.page || state.page,
        entries: action.payload.entries || state.entries,
        fetchLock: false
      }
    case FETCH_LOCK:
      return {
        ...state,
        fetchLock: true
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

const getDataFromCache = (dispatch, fetch, name) => (cachedData, { page, entries, fetchLock }) => {
  if (!page || !entries) {
    return undefined
  }
  const [reqFrom, reqTo] = [(page - 1) * entries, (page * entries) - 1]
  const dataFound = _
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
    dispatch(setFetchLock())
    dispatch(fetch({ page, entries }))
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
  state => ({
    data: state.pagination.cachedData[name] || {},
    page: state.pagination.page,
    entries: state.pagination.entries,
    fetchLock: state.pagination.fetchLock
  }),
  dispatch => ({
    getData: (...params) => getDataFromCache(dispatch, fetch, name)(...params),
    onPageChange: ({ page, entries }) => dispatch(setPagination({ page, entries }))
  }),
  ({ data, page, entries, fetchLock }, { getData, onPageChange }) => ({
    data: getData(data, { page, entries, fetchLock }),
    page,
    entries,
    onPageChange
  })
)(Component)
