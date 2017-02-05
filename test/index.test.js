import {
  rangePosition,
  mergeKeys,
  merge,
  getAllCachedData,
  getDataFromCache,
  getMaxIndex,
  insertItemIntoData
} from '../src/index_es6'

describe('rangePosition', () => {
  const testRangePosition = (range1, range2, expectedString) => {
    const result = rangePosition(range1, range2)
    expect(result).toBe(expectedString)
  }

  test('returns "in"', () => {
    testRangePosition([35, 50], [20, 55], 'in')
    testRangePosition([35, 50], [20, 50], 'in')
    testRangePosition([20, 50], [20, 50], 'in')
    testRangePosition([20, 50], [20, 55], 'in')
  })

  test('returns "left"', () => {
    testRangePosition([25, 50], [30, 55], 'left')
    testRangePosition([25, 50], [26, 55], 'left')
    testRangePosition([25, 50], [50, 55], 'left')
    testRangePosition([25, 50], [51, 55], 'left')
  })

  test('returns "right"', () => {
    testRangePosition([25, 50], [15, 40], 'right')
    testRangePosition([25, 55], [25, 50], 'right')
    testRangePosition([25, 50], [15, 24], 'right')
    testRangePosition([25, 50], [15, 25], 'right')
  })

  test('returns "over"', () => {
    testRangePosition([25, 50], [30, 40], 'over')
  })

  test('returns "out"', () => {
    testRangePosition([25, 50], [55, 60], 'out')
    testRangePosition([25, 50], [15, 20], 'out')
  })
})

describe('mergeKeys', () => {
  const testMergeKeys = (obj1, obj2, expectedObj) => {
    const result = mergeKeys(obj1, obj2)
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedObj))
  }

  test('merges objects in "in" mode', () => {
    testMergeKeys(
      { '4-5': [44, 55] },
      { '2-7': [2, 3, 4, 5, 6, 7] },
      { data: { '2-7': [2, 3, 44, 55, 6, 7] }, merged: true }
    )
  })

  test('merges objects in "left" mode', () => {
    testMergeKeys(
      { '2-4': [22, 33, 44] },
      { '4-7': [4, 5, 6, 7] },
      { data: { '2-7': [22, 33, 44, 5, 6, 7] }, merged: true }
    )

    testMergeKeys(
      { '2-3': [22, 33] },
      { '4-7': [4, 5, 6, 7] },
      { data: { '2-7': [22, 33, 4, 5, 6, 7] }, merged: true }
    )
  })

  test('merges objects in "right" mode', () => {
    testMergeKeys(
      { '4-9': [44, 55, 66, 77, 88, 99] },
      { '2-6': [2, 3, 4, 5, 6] },
      { data: { '2-9': [2, 3, 44, 55, 66, 77, 88, 99] }, merged: true }
    )

    testMergeKeys(
      { '5-9': [55, 66, 77, 88, 99] },
      { '2-4': [2, 3, 4] },
      { data: { '2-9': [2, 3, 4, 55, 66, 77, 88, 99] }, merged: true }
    )
  })

  test('merges objects in "over" mode', () => {
    testMergeKeys(
      { '2-9': [22, 33, 44, 55, 66, 77, 88, 99] },
      { '4-7': [4, 5, 6, 7] },
      { data: { '2-9': [22, 33, 44, 55, 66, 77, 88, 99] }, merged: true }
    )
  })

  test('merges objects in "out" mode', () => {
    testMergeKeys(
      { '2-4': [22, 33, 44] },
      { '6-9': [6, 7, 8, 9] },
      { data: { '2-4': [22, 33, 44] }, merged: false }
    )
  })
})

describe('merge', () => {
  const testMerge = (cachedData, newObj, expectedObj) => {
    const result = merge(cachedData, newObj)
    expect(JSON.stringify(result)).toBe(JSON.stringify(expectedObj))
  }

  test('merges object to cachedData as a bridge', () => {
    testMerge(
      { '2-5': [2, 3, 4, 5], '8-12': [8, 9, 10, 11, 12] },
      { '5-9': [55, 66, 77, 88, 99] },
      { '2-12': [2, 3, 4, 55, 66, 77, 88, 99, 10, 11, 12] }
    )
  })

  test('merges object to cachedData as an extension', () => {
    testMerge(
      { '2-5': [2, 3, 4, 5], '8-12': [8, 9, 10, 11, 12] },
      { '11-15': [111, 122, 133, 144, 155] },
      { '2-5': [2, 3, 4, 5], '8-15': [8, 9, 10, 111, 122, 133, 144, 155] }
    )
  })

  test('merges object to cachedData as a separate piece', () => {
    testMerge(
      { '2-5': [2, 3, 4, 5], '8-12': [8, 9, 10, 11, 12] },
      { '14-16': [144, 155, 166] },
      { '2-5': [2, 3, 4, 5], '8-12': [8, 9, 10, 11, 12], '14-16': [144, 155, 166] }
    )

    testMerge(
      { '2-5': [2, 3, 4, 5] },
      { '7-7': [77] },
      { '2-5': [2, 3, 4, 5], '7-7': [77] }
    )
  })

  test('merges object to cachedData as a one-piece-bridge', () => {
    testMerge(
      { '2-6': [2, 3, 4, 5, 6], '8-10': [8, 9, 10] },
      { '7-7': [77] },
      { '2-10': [2, 3, 4, 5, 6, 77, 8, 9, 10] }
    )
  })
})

describe('getAllCachedData', () => {
  const testGetAllCachedData = (cachedData, expected) => {
    const result = getAllCachedData(cachedData)
    expect(JSON.stringify(result)).toBe(JSON.stringify(expected))
  }

  test('returns collected data', () => {
    testGetAllCachedData(
      { '2-4': [2, 3, 4], '6-9': [6, 7, 8, 9] },
      [2, 3, 4, 6, 7, 8, 9]
    )
  })

  test('returns correct data when key is "u-u"', () => {
    testGetAllCachedData(
      { 'u-u': { a: 1, b: 2, c: 3 } },
      { a: 1, b: 2, c: 3 }
    )
  })
})

describe('getDataFromCache', () => {
  const testGetDataFromCache = (cachedData, params, expected) => {
    const result = getDataFromCache(cachedData, params)
    expect(JSON.stringify(result)).toBe(JSON.stringify(expected))
  }

  test('returns correct data with correct page and entries provided', () => {
    testGetDataFromCache(
      { '1-7': [1, 2, 3, 4, 5, 6, 7] },
      { page: 2, entries: 2 },
      { dataFound: [2, 3], reqFrom: 2, reqTo: 3 }
    )
  })

  test('returns undefined with incorrect page and entries provided', () => {
    testGetDataFromCache(
      { '1-7': [1, 2, 3, 4, 5, 6, 7] },
      { page: 10, entries: 2 },
      { reqFrom: 18, reqTo: 19 }
    )
  })

  test('returns all data with isAllData flag provided', () => {
    testGetDataFromCache(
      { '1-7': [1, 2, 3, 4, 5, 6, 7] },
      { isAllData: true },
      { dataFound: [1, 2, 3, 4, 5, 6, 7] }
    )
  })

  test('returns all data with neither page nor entries provided', () => {
    testGetDataFromCache(
      { '1-7': [1, 2, 3, 4, 5, 6, 7] },
      {},
      { dataFound: [1, 2, 3, 4, 5, 6, 7] }
    )
  })

  test('returns all data with unknown type provided', () => {
    testGetDataFromCache(
      { 'u-u': { a: 1, b: 2, c: 3 } },
      { type: 'object' },
      { dataFound: { a: 1, b: 2, c: 3 } }
    )
  })
})

describe('getMaxIndex', () => {
  const testGetMaxIndex = (data, expected) => {
    const result = getMaxIndex(data)
    expect(result).toBe(expected)
  }

  test('returns highest index in cachedData', () => {
    testGetMaxIndex({ '2-6': [] }, 6)
    testGetMaxIndex({ '2-6': [], '7-9': [] }, 9)
    testGetMaxIndex({ '11-18': [], '2-6': [], '7-9': [] }, 18)
    testGetMaxIndex({}, 0)
  })
})

describe('insertItemIntoData', () => {
  const testInsertItemIntoData = (data, item, index, expectedObj) => {
    const result = insertItemIntoData(data, item, index)
    expect(JSON.stringify((result))).toBe(JSON.stringify(expectedObj))
  }

  test('returns correct object with last index provided explicitly', () => {
    testInsertItemIntoData(
      { '2-4': [2, 3, 4] }, 5, 5,
      { '2-5': [2, 3, 4, 5] }
    )
  })
})