import _ from 'lodash'
import React from 'react'

const entriesRage = [10, 25, 50]
const data = ['lala', 'haha']

const promise = () => Promise.resolve({ data })

const gcd = (a, b) => !b ? a : gcd(b, a % b)

const calcStep = ([first = 5, second, ...entriesRange]) => !entriesRange.length
  ? gcd(first, second)
  : calcStep([gcd(first, second), ...entriesRange])

// console.log(calcStep(entriesRage))

export const paginate = (promise, cachedData, entries, page) => {
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
    promise({ pageItems: entries, page })
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

// List = applyPagination(List, {
//   page: 1,
//   entries: 25
// })

function applyPagination (Component, { name, page, entries }) {
  return React.cloneElement(<Component />, {
    page,
    entries,
    reset: () => console.log(`reset ${name}`),
    onPageChange: ({ page, entries }) => console.log(`onPageChange ${name}`)
  })
}

paginate(promise, [], 1, 1)
  .then(response => {
    console.log(response)
  })

