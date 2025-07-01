/*
  optimized stringify of objects to json string
  - discards circular references
  - stringifies bigint values
*/
export function safeStringify(
  obj: unknown,
  jsonSpace?: string | number
): string {
  const cache: unknown[] = []
  const str = JSON.stringify(
    obj,
    function (key, value) {
      // check for circular references
      if (typeof value === 'object' && value != null) {
        if (cache.includes(value)) {
          // Circular reference found, discard key
          return
        }
        // Store value in our collection
        cache.push(value)
      }
      // handle bigInt values
      if (typeof value === 'bigint') return value.toString()
      // handle Map & Set values
      if (value instanceof Map || value instanceof Set) {
        return [...value]
      }
      return value
    },
    jsonSpace
  )
  return str
}

// Take an object and ensure that all properties (including nested ones) are safe to stringify, returning a similar but safe object again
export function jsonSafeObject(object: unknown) {
  return JSON.parse(safeStringify(object))
}
