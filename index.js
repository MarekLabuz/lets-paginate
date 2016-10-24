import _ from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'

// --------------------ACTIONS----------------------

const FETCH_DATA = 'lets-paginate/FETCH_DATA'
const SET_PAGINATION = 'lets-paginate/SET_PAGINATION'
const INITIALIZE = 'lets-paginate/INITIALIZE'

function setPagination (pagination) {
  return {
    type: SET_PAGINATION,
    payload: {
      pagination
    }
  }
}



// --------------------REDUCER----------------------




const entriesRage = [10, 25, 50]
const data = ['lala', 'haha']

const promise = () => Promise.resolve({ data })

const gcd = (a, b) => !b ? a : gcd(b, a % b)

const calcStep = ([first = 5, second, ...entriesRange]) => !entriesRange.length
  ? gcd(first, second)
  : calcStep([gcd(first, second), ...entriesRange])

// console.log(calcStep(entriesRage))

export const paginate = (fetch, dispatch, state) => {
  const { name, entries, page } = state.pagination
  const cachedData = state.pagination.cachedData[name]
  const step = calcStep(entriesRage)
  const start = (page - 1) * entries
  const end = page * entries

  const data = _.range(0, (end - start) / step).reduce((acc, curr) => {
    const dataOptional = cachedData[`[${start + (curr * step)}, ${start + (curr * step) + step}]`]
    return [
      ...acc,
      ...(dataOptional || [])
    ]
  }, [])

  return data.length < entries
    ?
    fetch()
      .then(response => ({
        data: response.data,
        cachedData: {
          ...cachedData,
          ..._.chunk(response.data, step).reduce((acc, curr, index) => ({
            ...acc,
            [`[${start + (index * step)}, ${start + (index * step) + step}]`]: curr
          }), [])
        },
        cachedDataChanged: true
      }))
    :
    Promise.resolve({
      data,
      cachedData,
      cachedDataChanged: false
    })
}

const trigger = store => next => (action) => {
  if (action.type === FETCH_DATA) {
    next(setPagination(action.payload.pagination))
    next(action.payload.fetch())
  }
}

// List = applyPagination(List, {
//   page: 1,
//   entries: 25
// })

function mapStateToProps (state) {
  return {

  }
}

function mapDispatchToProps (dispatch) {
  return {

  }
}

const connector = params => connect({
  ...params
})()

class List extends Component {
  componentWillMount () {

  }

  render () {
    return React.cloneElement(this.props.children, this.props)
  }
}

function reduxPagination (Comp, { name, page, entries, fetch }) {
  return React.cloneElement(<List><Comp /></List>, {
    page,
    entries,
    reset: () => console.log(`reset ${name}`),
    onPageChange: ({ page, entries }) => console.log(`onPageChange ${name}`)
  })
}

// paginate(promise, [], 1, 1)
//   .then(response => {
//     console.log(response)
//   })

