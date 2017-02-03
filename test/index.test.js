import { rangePosition, mergeKeys } from '../src/index2'

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

  test('merges object - "in"', () => {
    testMergeKeys(
      { '4-5': [44, 55] },
      { '2-7': [2, 3, 4, 5, 6, 7] },
      { data: { '2-7': [2, 3, 44, 55, 6, 7] }, merged: true }
    )
  })

  test('merges object - "left"', () => {
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

  test('merges object - "right"', () => {
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

  test('merges object - "over"', () => {
    testMergeKeys(
      { '2-9': [22, 33, 44, 55, 66, 77, 88, 99] },
      { '4-7': [4, 5, 6, 7] },
      { data: { '2-9': [22, 33, 44, 55, 66, 77, 88, 99] }, merged: true }
    )
  })

  test('merges object - "out"', () => {
    testMergeKeys(
      { '2-4': [22, 33, 44] },
      { '6-9': [6, 7, 8, 9] },
      { data: { '2-4': [22, 33, 44] }, merged: false }
    )
  })
})
