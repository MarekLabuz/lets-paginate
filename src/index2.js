import _ from 'lodash'
// import data from '../data.json'

const fetchData = ({ page, entries }) => Promise.resolve(data.slice((page - 1) * entries, page * entries))

const data = _.range(1, 1000)

let cachedData = {
  '15-20': _.range(15, 21),
  '25-32': _.range(25, 33)
  // '10-40': _.range(10, 41)
}

const applyExtensions  = () => {}

const processData = ({ page, entries }) => {
  const requestedRange = [(page - 1) * entries + 1, page * entries]
  const { extensions } = _
    .chain(cachedData)
    .keys()
    .reduce((acc, curr) => {
      const currSplit = curr.split('-')
      return {
        extensions: {
          ...acc.extensions,
          ...(
            currSplit[0] <= requestedRange[0]
              ? { left: curr }
              : {}
          ),
          ...(
            currSplit[1] >= requestedRange[1]
              ? { right: curr }
              : {}
          )
        }
      }
    }, { extensions: {} })
    .value()

  if (extensions.left === extensions.right) {
    const [from, to] = extensions.left.split('-')
    const requestedData = cachedData[extensions.left].slice(requestedRange[0] - from, requestedRange[1] - to)
    return Promise.resolve(requestedData)
  } else {
    // console.log(requestedRange, extensions)
    return fetchData({ page, entries })
      .then(response => {
        cachedData[`${extensions.left.split('-')[0]}-${extensions.right.split('-')[1]}`] =
          cachedData[extensions.left].slice(0, requestedRange[0] - extensions.left.split('-')[0])
            .concat(response)
            .concat(cachedData[extensions.right].slice(requestedRange[1] + 1 - extensions.right.split('-')[0]))
        cachedData = _.omit(cachedData, [extensions.left, extensions.right])
        console.log(cachedData)
        return response
      })
  }
}


processData({ page: 3, entries: 10 })
  .then(response => {
    console.log(response)
  })
