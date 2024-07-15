import { isString } from 'lodash'

/**
 * An extension of the JavaScript Set class with additional utility methods.
 */
export default class SetExtension extends Set {
  /**
   * Constructor for the ExtendedSet class.
   * Initializes the set and optionally accepts an item of elements to add to the set.
   * @param {Iterable} [item] - An iterable of elements to add to the set upon instantiation.
   */
  constructor(item) {
    super(item)
  }

  /**
   * Adds a value to the set and stores the last added value.
   * @param {*} value - The value to add.
   * @returns {SetExtension} This set instance for method chaining.
   */
  add = value => {
    super.add(value)
    this.lastValue = value // Store the last added value
    return this
  }

  /**
   * Removes a value from the set.
   * @param {*} value - The value to remove.
   * @returns {SetExtension} This set instance for method chaining.
   */
  remove = value => {
    super.delete(value)
    return this
  }

  /**
   * Toggles the presence of a value in the set.
   * @param {*} value - The value to toggle.
   * @returns {SetExtension} This set instance for method chaining.
   */
  toggle = value => {
    if (this.has(value)) {
      this.remove(value)
    } else {
      this.add(value)
    }
    return this
  }

  /**
   * Determines if the current set is a subset of another set.
   * @param {SetExtension} otherSet - The set to compare against.
   * @returns {boolean} True if the current set is a subset of the other set.
   */
  subset = otherSet => {
    return [...this].every(element => otherSet.has(element))
  }

  /**
   * Checks if the current set is a superset of another set.
   * @param {SetExtension} otherSet - The set to compare against.
   * @returns {boolean} True if the current set is a superset of the other set.
   */
  superset = otherSet => {
    return this.subset(otherSet) && otherSet.size <= this.size
  }

  /**
   * Calculates the difference between two sets.
   * @param {SetExtension} otherSet - The set to calculate the difference with.
   * @returns {SetExtension} A new set representing the difference.
   */
  difference = otherSet => {
    return new SetExtension([...this].filter(element => !otherSet.has(element)))
  }

  /**
   * Returns a new set that contains elements present in either of the sets but not in both.
   * @param {SetExtension} otherSet - The set to calculate the symmetric difference with.
   * @returns {SetExtension} A new set representing the symmetric difference.
   */
  symmetricDifference = otherSet => {
    return new SetExtension(
      [...this, ...otherSet].filter(
        element => !(this.has(element) && otherSet.has(element)),
      ),
    )
  }

  /**
   * Returns a new set that represents the intersection of the current set with another set based on a comparison function.
   * @param {SetExtension} otherSet - The set to intersect with.
   * @param {Function} [comparator=(a, b) => a === b] - A function to compare elements for equality.
   * @returns {SetExtension} A new set representing the intersection.
   */
  intersectionWith = (otherSet, comparator = (a, b) => a === b) => {
    return new SetExtension(
      [...this].filter(element =>
        otherSet.some(otherElement => comparator(element, otherElement)),
      ),
    )
  }

  /**
   * Creates a shallow copy of the set.
   * @returns {SetExtension} A new set instance representing a copy of the original.
   */
  clone = () => {
    return new SetExtension([...this])
  }
}

const safeString = testStr => (typeof testStr === 'string' ? testStr : '')
export const SET = (items, split = '') =>
  new SetExtension(
    typeof items === 'string' ? items.split(safeString(split)) : items || [],
  )
