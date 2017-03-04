import { connect } from 'react-redux'

const SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA'
const SET_PAGINATION = 'lets-paginate/SET_PAGINATION'
const RESET_CACHED_DATA = 'lets-paginate/RESET_CACHED_DATA'
const PAGE_CHANGE = 'lets-paginate/PAGE_CHANGE'
const ADD_ITEM = 'lets-paginate/ADD_ITEM'
const REMOVE_ITEM = 'lets-paginate/REMOVE_ITEM'

const addItem = (name, item, index) => ({
  type: ADD_ITEM,
  payload: {
    name,
    item,
    index
  }
})

const removeItem = (name, relativeIndex, options, { fetch, allDataExpected }) => ({
  type: REMOVE_ITEM,
  payload: {
    name,
    relativeIndex,
    options,
    fetch: fetch || (() => Promise.resolve([])),
    allDataExpected: allDataExpected || false,
  }
})

const pageChange = (name, { page, entries, fetch, allDataExpected }, options) => ({
  type: PAGE_CHANGE,
  payload: {
    name,
    page,
    entries,
    fetch: fetch || (() => Promise.resolve([])),
    allDataExpected: allDataExpected || false,
    options
  }
})

const resetCachedData = name => ({
  type: RESET_CACHED_DATA,
  payload: {
    name
  }
})

const setCachedData = (name, cachedData, isAllData, type) => ({
  type: SET_CACHED_DATA,
  payload: {
    name,
    cachedData,
    isAllData,
    type
  }
})

const setPagination = (name, { page, entries }) => ({
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
          ...(action.payload.isAllData !== undefined ? { isAllData: action.payload.isAllData } : {}),
          ...(action.payload.type !== undefined ? { type: action.payload.type } : {})
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
    case RESET_CACHED_DATA:
      return {
        ...state,
        [action.payload.name]: {
          ...state[action.payload.name],
          cachedData: {},
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
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .reduce((acc, key) => [...acc, ...cachedData[key]], [])

  return dataFound.length
    ? dataFound
    : undefined
}

export const getDataFromCache = ({ cachedData = {}, page, entries, type, isAllData }) => {
  const getAll = (type !== 'array' && !!type) || !page || !entries
  const [reqFrom, reqTo] = getAll
    ? []
    : [(page - 1) * entries, (page * entries) - 1]
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

export const selector = name => (state, { page, entries } = {}) =>
  getDataFromCache({ cachedData: state.pagination[name].cachedData, page, entries }).dataFound

export const removeItemFromData = (cachedData, index) => Object.keys(cachedData)
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
  .reduce((acc, key) => {
    const [from, to] = key.split('-').map(str => parseInt(str, 10))
    return (
      (acc.found && { data: { ...acc.data, [`${from - 1}-${to - 1}`]: cachedData[key] }, found: true }) ||
      (
        rangePosition([index, index], [from, to]) === 'in' && {
          data: {
            ...acc.data,
            [`${from}-${to - 1}`]: [
              ...cachedData[key].slice(0, index - from),
              ...cachedData[key].slice((index - from) + 1)
            ]
          },
          found: true
        }
      ) ||
      ({ data: { ...acc.data, [key]: cachedData[key] }, found: false })
    )
  }, { data: {}, found: false })

export const getMaxIndex = data => parseInt(
  Object.keys(data).length === 0
    ? 0
    : Object.keys(data).sort((a, b) => parseInt(b, 10) - parseInt(a, 10))[0].split('-')[1], 10
)

export const insertItemIntoData = (cachedData, item, index) => {
  const { data, found } = Object.keys(cachedData)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .reduce((acc, key) => {
      const [from, to] = key.split('-').map(str => parseInt(str, 10))
      return (
        (acc.found && { data: { ...acc.data, [`${from + 1}-${to + 1}`]: cachedData[key] }, found: true }) ||
        (
          rangePosition([index, index], [from, to]) !== 'out' && {
            data: {
              ...acc.data,
              [`${from}-${to + 1}`]: [
                ...cachedData[key].slice(0, index - from),
                item,
                ...cachedData[key].slice(index - from)
              ]
            },
            found: true
          }
        ) ||
        ({ data: { ...acc.data, [key]: cachedData[key] }, found: false })
      )
    }, { data: {}, found: false })

  return {
    ...data,
    ...(found ? {} : { [`${index}-${index}`]: [item] })
  }
}

const onPageChange = ({ name, store, next, fetch, allDataExpected }, { page: newPage, entries: newEntries, options }) => {
  const state1 = store.getState().pagination[name] || {}
  const { page, entries } = !newPage && !newEntries
    ? { page: undefined, entries: undefined }
    : { page: newPage || state1.page, entries: newEntries || state1.entries }

  if (state1.page !== page || state1.entries !== entries) {
    next(setPagination(name, { page, entries }))
  }

  const state2 = store.getState().pagination[name]

  const { dataFound, reqFrom, reqTo } = getDataFromCache(state2)

  if (!dataFound && !state2.isAllData) {
    next(fetch({ page, entries }, ...options))
      .then((data) => {
        const state3 = store.getState().pagination[name]
        if (Array.isArray(data)) {
          const probableReqTo = ((reqFrom || 0) + (data.length - 1))
          next(setCachedData(
            name,
            merge(state3.cachedData || {}, {
              [`${reqFrom || 0}-${allDataExpected ? probableReqTo : reqTo}`]: !!data && Array.isArray(data)
                ? data
                : []
            }),
            allDataExpected,
            'array'
          ))
        } else {
          next(setCachedData(name, { 'u-u': data }, true, typeof data))
        }
      })
  }
}


export const middleware = store => next => (action) => {
  if (action.type === PAGE_CHANGE) {
    const { name, page, entries, fetch, allDataExpected, options } = action.payload
    onPageChange({ name, store, next, fetch, allDataExpected }, { page, entries, options })
  } else if (action.type === ADD_ITEM) {
    const { name, item, index } = action.payload
    const { cachedData } = store.getState().pagination[name] || {}
    const i = index === -1 ? getMaxIndex(cachedData || {}) + 1 : index
    next(setCachedData(name, insertItemIntoData(cachedData || {}, item, i)))
  } else if (action.type === REMOVE_ITEM) {
    const { name, relativeIndex, options, fetch, allDataExpected } = action.payload
    const { cachedData, page, entries } = store.getState().pagination[name] || {}
    const index = (!page && !entries)
      ? relativeIndex
      : ((page - 1) * entries) + relativeIndex
    const { data: newData, found } = removeItemFromData(cachedData || {}, index)
    if (found) {
      next(setCachedData(name, newData))
      onPageChange({ name, store, next, fetch, allDataExpected }, { page, entries, options })
    }
  }
  return next(action)
}

const cap = string => string.charAt(0).toUpperCase() + string.slice(1)

const mapStateToProps = (state, { names }) => names.reduce((acc, name) => {
  const nameState = state.pagination[name] || {}
  const capName = cap(name)

  return {
    ...acc,
    [`data${capName}`]: getDataFromCache(nameState).dataFound,
    [`page${capName}`]: nameState.page,
    [`entries${capName}`]: nameState.entries
  }
}, { state })

const mapDispatchToProps = (dispatch, { names, fetch, allDataExpected }) => names.reduce((acc, name, i) => ({
  ...acc,
  [`onPageChange${cap(name)}`]: ({ page, entries }, ...options) =>
    dispatch(pageChange(name, { page, entries, fetch: fetch[i], allDataExpected: allDataExpected[i] }, options)),
  [`onAddItem${cap(name)}`]: (item, index = 0) => dispatch(addItem(name, item, index)),
  [`onRemoveItem${cap(name)}`]: (relativeIndex, ...options) =>
    dispatch(removeItem(name, relativeIndex, options, { fetch: fetch[i], allDataExpected: allDataExpected[i] })),
  [`reset${cap(name)}`]: () => dispatch(resetCachedData(name))
}), { dispatch })

export const reduxPagination = ({ names = [], fetch = [], allDataExpected = [], mapStateAndDispatchToProps }) =>
  Component => connect(
    state => mapStateToProps(state, { names }),
    dispatch => mapDispatchToProps(dispatch, { names, fetch, allDataExpected }),
    ({ state, ...restStateProps }, { dispatch, ...restDispatchProps }, ownProps) => ({
      ...ownProps,
      ...restStateProps,
      ...restDispatchProps,
      ...mapStateAndDispatchToProps(state, dispatch, ownProps)
    })
  )(Component)
