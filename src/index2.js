import _ from 'lodash'

const serverData = _.range(0, 1000).map(id => ({ id }))
const storeData = {}

const fetch = ({ page, entries }) => Promise.resolve(serverData.slice((page - 1) * entries, page * entries))

const rangePosition = ([b1, b2], [g1, g2]) => (
  (b1 >= g1 && b2 <= g2 && 'in') ||
  (b1 >= g1 && b1 <= g2 + 1 && b2 >= g2 && 'right') ||
  (b1 <= g1 && b2 >= g1 - 1 && b2 <= g2 && 'left') ||
  (b1 <= g1 && b2 >= g2 && 'over') ||
  ((b1 >= g2 || b2 <= g1) && 'out')
)

const getOrFetch = ({ page, entries }) => {
  const [reqFrom, reqTo] = [(page - 1) * entries, (page * entries) - 1]
  const dataFound = _
    .chain(storeData)
    .keys()
    .reduce((data, key) => {
      const [from, to] = key.split('-').map(str => parseInt(str, 10))
      return (
        data ||
        (
          rangePosition([reqFrom, reqTo], [from, to]) === 'in'
            ? storeData[key].slice(reqFrom - from, (reqTo - from) + 1)
            : undefined
        )
      )
    }, undefined)
    .value()

  return dataFound
    ? Promise.resolve(dataFound)
    : new Promise((resolve) => {
        resolve(fetch({ page, entries }))
      }, {})
}

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
      return { data: obj2, merged: false }
  }
}

// console.log(mergeKeys(
//   '35-40',
//   [35, 36, 37, 38, 39, 40],
//   '41-45',
//   [41, 42, 43, 44, 45]
// ))

const d = {
  '10-15': [10, 11, 12, 13, 14, 15],
  '25-35': [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
}

const obj = {
  '15-24': [50, 60, 70, 80, 90, 100, 110, 120]
}

const merge = (cachedData, newObj) => {
  const result = _
    .chain(cachedData)
    .keys()
    .reduce((acc, key) => {
      const { data, merged } = mergeKeys(newObj, { [key]: cachedData[key] })
      return {
        data: {
          ...acc.data,
          ...data
        },
        merged: acc.merged || merged
      }
    }, { data: {}, merged: false })
    .value()

  return {
    ...result.data,
    ...(!result.merged ? newObj : {})
  }
}

getOrFetch({ page: 7, entries: 5 })
console.log(merge(d, obj))
