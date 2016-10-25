import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'

const FETCH_DATA = 'lets-paginate/FETCH_DATA'
const SET_PAGINATION = 'lets-paginate/SET_PAGINATION'
const SET_CACHED_DATA = 'lets-paginate/SET_CACHED_DATA'

function setPagination (pagination) {
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

// --------------------REDUCER----------------------

const initialState = {
  page: 1,
  entries: 25,
  cachedData: {}
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
    default:
      return state
  }
}

// ---------------------OTHER-----------------------

const gcd = (a, b) => !b ? a : gcd(b, a % b)

const calcStep = ([first = 5, second, ...entriesRange]) => !entriesRange.length
  ? gcd(first, second)
  : calcStep([gcd(first, second), ...entriesRange])

export const paginate = (name, fetch, page, entries, entriesRange, dispatch, cachedData, responseAccess, encode, decode) => {
  dispatch(setPagination({ page, entries }))
  const step = calcStep(entriesRange)
  const start = (page - 1) * entries
  const end = page * entries

  const data = _.range(0, (end - start) / step).reduce((acc, curr) => {
    const dataOptional = cachedData[`[${start + (curr * step)}, ${start + (curr * step) + step}]`]
    return [
      ...acc,
      dataOptional
    ]
  }, []).filter(item => !!item)

  return data.length < (entries / step)
    ?
      fetch()
        .then(response => {
          const { data } = responseAccess ? responseAccess(response) : response
          const cachedData = {
            ...cachedData,
            ..._.chunk(data, step).reduce((acc, curr, index) => ({
              ...acc,
              [`[${start + (index * step)}, ${start + (index * step) + step}]`]: encode ? encode(curr) : curr
            }), [])
          }
          dispatch(setCachedData(name, cachedData))
          return {
            data: encode ? encode(data) : data,
            response,
          }
        }, error => {
          throw new Error(error)
        })
    :
      Promise.resolve({ data: decode ? decode(data) : _.flatten(data) })
}

const mapStateToPropsCreator = ({ name }, mapStateToProps) => (state, props) => {
  return {
    cachedData: state.pagination.cachedData[name] || {},
    page: state.pagination.page,
    entries: state.pagination.entries,
    ...mapStateToProps(state, props)
  }
}

const mapDispatchToPropsCreator = ({ name, entriesRange, action, responseAccess, encode, decode }) => (dispatch, { defaultEntries, defaultPage }) => {
  const promise = ({ page, entries, entriesRange, cachedData }) => (fetch = Promise.resolve({ data: [] })) =>
    paginate(name, fetch, page, entries, entriesRange, dispatch, cachedData, responseAccess, encode, decode)

  return {
    reset: () => console.log(`reset ${defaultEntries} ${defaultPage}`),
    onPageChange: (cachedData, statePage, stateEntries,) => ({ page, entries }) =>
      dispatch(action(promise({ page: page || statePage, entries: entries || stateEntries, entriesRange, cachedData })))
  }
}

const mergeProps = ({cachedData, page, entries, ...restStateProps }, { onPageChange, ...restDispatchProps }, ownProps) => ({
  ...ownProps,
  page,
  entries,
  ...restStateProps,
  onPageChange: onPageChange(cachedData, page, entries),
  ...restDispatchProps
})

export const reduxPagination = ({ name, entriesRange, responseAccess, encode, decode, action }, mapStateToProps) => (Comp) =>
  connect(
    mapStateToPropsCreator({ name }, mapStateToProps),
    mapDispatchToPropsCreator({ name, entriesRange, action, responseAccess, encode, decode }),
    mergeProps
  )(Comp)
