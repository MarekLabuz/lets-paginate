import _ from 'lodash'

const serverData = _.range(0, 1000).map(id => ({ id }))
const storeData = {}

const fetch = ({ page, entries }) => Promise.resolve(serverData.slice((page - 1) * entries, page * entries))

const rangePosition = ([b1, b2], [g1, g2]) => (
  (b1 >= g1 && b2 <= g2 && 'in') ||
  (b1 >= g1 && b1 <= g2 && b2 >= g2 && 'right') ||
  (b1 <= g1 && b2 >= g1 && b2 <= g2 && 'left') ||
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

getOrFetch({ page: 7, entries: 5 })
  .then(response => response)
