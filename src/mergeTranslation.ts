/*
 * doc - The current state of the Sanity document
 * translated - The translated JSON document
 * base - the language property of the base language
 * target - the language property of the translated content
 *
 * This function will merge properties from `translated` onto `document`,
 * storing the translated properties in to `target` property names, while
 * preserving the values of the `base` property names from the `document`
 */
export const createPatches = (
  translated: Record<string, any>,
  base: string,
  target: string
) => {
  const patches: Record<string, string> = {}

  const fun = (object: Record<string, any>, path: string | null = null) => {
    for (const key in object) {
      if (key[0] === '_') continue
      if (!Object.prototype.hasOwnProperty.call(object, key)) continue

      const localPath = path ? path + '.' + key : key
      const value = object[key]
      if (Array.isArray(value)) {
        const allHaveKeys = value.filter(v => !!v._key).length === value.length
        if (allHaveKeys) {
          // Handle arrays of objects that have _key properties
          value
            .filter(v => typeof v === 'object')
            .filter(v => !!v._key)
            .forEach(v => fun(v, localPath + `[_key == "${v._key}"]`))
        } else {
          // Use indexes
          value.forEach((v, i) => {
            fun(v, localPath + `[${i}]`)
          })
        }
      } else {
        if (key === base) {
          const translatedPath = path ? path + '.' + target : target
          patches[translatedPath] = value
        } else if (typeof value === 'object') {
          fun(value, localPath)
        }
      }
    }
  }

  fun(translated)
  return patches
}
