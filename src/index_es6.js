import { connect } from 'react-redux'

const SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA'
const SET_PAGINATION = 'lets-paginate/SET_PAGINATION'

const setCachedData = (name, cachedData, isAllData, type) => ({
  type: SET_CACHED_DATA,
  payload: {
    name,
    cachedData,
    isAllData,
    type
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

export const reducer = (state = {}, action) => {
  switch (action.type) {
    case SET_CACHED_DATA:
      return {
        ...state,
        [action.payload.name]: {
          ...state[action.payload.name],
          cachedData: action.payload.cachedData,
          isAllData: action.payload.isAllData,
          type: action.payload.type
        }
      }
    case SET_PAGINATION:
      return {
        ...state,
        [action.payload.name]: {
          ...state[action.payload.name],
          page: action.payload.page,
          entries: action.payload.entries
        }
      }
    default:
      return state
  }
}

export const rangePosition = ([b1, b2], [g1, g2]) => (
  (b1 >= g1 && b2 <= g2 && 'in') ||
  (b1 >= g1 && b1 <= g2 + 1 && b2 >= g2 && 'right') ||
  (b1 <= g1 && b2 >= g1 - 1 && b2 <= g2 && 'left') ||
  (b1 <= g1 && b2 >= g2 && 'over') ||
  ((b1 >= g2 || b2 <= g1) && 'out')
)

export const mergeKeys = (obj1, obj2) => {
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

export const merge = (cachedData, newObj) => {
  const result = Object.keys(cachedData)
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

  return {
    ...result.rest,
    ...result.merged
  }
}

export const getAllCachedData = (cachedData) => {
  if (cachedData.hasOwnProperty('u-u')) { // eslint-disable-line
    return cachedData['u-u']
  }

  const dataFound = Object.keys(cachedData)
    .sort()
    .reduce((acc, key) => [...acc, ...cachedData[key]], [])

  return dataFound.length
    ? dataFound
    : undefined
}

export const getDataFromCache = (cachedData, { page, entries, isAllData, type }) => {
  const getAll = (type !== 'array' && !!type) || !page || !entries
  const [reqFrom, reqTo] = getAll ? [] : [(page - 1) * entries, (page * entries) - 1]
  const dataFound = getAll
    ? getAllCachedData(cachedData)
    : Object.keys(cachedData)
      .reduce((data, key) => {
        const [from, to] = key.split('-').map(str => parseInt(str, 10))
        return (
          data ||
          (
            isAllData || rangePosition([reqFrom, reqTo], [from, to]) === 'in'
              ? cachedData[key].slice(reqFrom - from, (reqTo - from) + 1)
              : undefined
          )
        )
      }, undefined)

  return { dataFound, reqFrom, reqTo }
}

export const onRemoveItemCore = (name, dispatch, data, { page, entries }, onPageChange) => relativeIndex => {

}

export const onAddItemCore = (name, dispatch, data) => (index, item) => {

}

const onPageChangeCore = (
  name,
  dispatch,
  cachedData,
  fetch,
  isAllData,
  type,
  statePage,
  stateEntries,
  allDataExpected
) => ({ page: newPage, entries: newEntries }, ...options) => {
  const { page, entries } = !newPage && !newEntries
    ?
      {
        page: undefined,
        entries: undefined
      }
    :
      {
        page: newPage || statePage,
        entries: newEntries || stateEntries,
      }

  if (statePage !== page || stateEntries !== entries) {
    dispatch(setPagination({ page, entries }, name))
  }

  const { dataFound, reqFrom, reqTo } = getDataFromCache(cachedData, { page, entries, isAllData, type })

  if (!dataFound && !isAllData) {
    dispatch(fetch({ page, entries }, ...options))
      .then((data) => {
        if (Array.isArray(data)) {
          const probableReqTo = ((reqFrom || 0) + (data.length - 1))
          dispatch(setCachedData(
            name,
            merge(
              cachedData,
              {
                [`${reqFrom || 0}-${allDataExpected ? probableReqTo : reqTo}`]:
                  !!data && Array.isArray(data) ? data : []
              }
            ),
            allDataExpected,
            'array'
          ))
        } else {
          dispatch(setCachedData(name, { 'u-u': data }, true, typeof data))
        }
      })
  }
}

export const reduxPagination = ({ name, fetch, allDataExpected = false }) => Component => connect(
  (state) => {
    const nameState = (state.pagination[name] || {})
    return {
      data: nameState.cachedData || {},
      page: nameState.page,
      entries: nameState.entries,
      isAllData: nameState.isAllData,
      type: nameState.type
    }
  },
  dispatch => ({
    getData: (...params) => getDataFromCache(...params).dataFound,
    onPageChange: (data, isAllData, type, statePage, stateEntries) =>
      onPageChangeCore(name, dispatch, data, fetch, isAllData, type, statePage, stateEntries, allDataExpected),
    onAddItem: data => onAddItemCore(name, dispatch, data),
    onRemoveItem: (data, pagination, onPageChange) => onRemoveItemCore(name, dispatch, data, pagination, onPageChange)
  }),
  ({ data, page, entries, isAllData, type }, { getData, onPageChange, onAddItem, onRemoveItem }) => ({
    data: getData(data, { page, entries, isAllData, type }),
    page,
    entries,
    onPageChange: onPageChange(data, isAllData, type, page, entries),
    onAddItem: onAddItem(data),
    onRemoveItem: onRemoveItem(data, { page, entries }, () => onPageChange(data, isAllData, type, page, entries))
  })
)(Component)
