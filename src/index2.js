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

const d1 = { '10-15': [1, 2, 3, 4, 5] }
const d2 = { '25-35': [6, 7, 8, 9, 10] }

const mergeKeys = (key1, value1, key2, value2) => {
  const [from1, to1] = key1.split('-').map(v => parseInt(v, 10))
  const [from2, to2] = key2.split('-').map(v => parseInt(v, 10))

  switch (rangePosition([from1, to1], [from2, to2])) {
    case 'in':
    case 'right':
    case 'left':
    case 'over':
      return {
        [`${Math.min(from1, from2)}-${Math.max(to1, to2)}`]: [
          ...value2.slice(0, Math.max(from1 - from2, 0)),
          ...value1,
          ...value2.slice((to1 - from2) + 1)
        ]
      }
    case 'out':
    default:
      return { [key1]: value1, [key2]: value2 }
  }
}

// console.log(mergeKeys(
//   '35-40',
//   [35, 36, 37, 38, 39, 40],
//   '41-45',
//   [41, 42, 43, 44, 45]
// ))

const merge = () => {
  const d1Keys = Object.keys(d1)
  const d2Keys = Object.keys(d2)

  return _
    .chain(d1)
    .keys()
    .reduce((acc, curr) => {
      const [from, to] = curr.split('-')
      return _
        .chain(d2)
        .keys()
        .reduce((acc2, curr2) => {
          const [from2, to2] = curr2.split('-')

        }, {})
        .value()
    }, d2)
    .value()
}

getOrFetch({ page: 7, entries: 5 })
// console.log(merge())
