import { isObject, isPlainObject } from '@se-oss/object';

import type { DeepMergeOptions } from './typings';

/**
 * Recursively merges properties from `source` object into `target` object.
 * This function is immutable, meaning it returns a new object and does not mutate the original `target` or `source` objects.
 * It performs a deep merge for plain objects. Other object types (like Dates, RegExps, class instances)
 * are replaced by their source counterpart if they exist in `source`, otherwise, the target's version is kept.
 * Arrays are replaced by the source array by default, or concatenated if `mergeArrays` option is `true`.
 *
 * @template T The type of the target object.
 * @template U The type of the source object.
 * @param target The target object.
 * @param source The source object to merge from.
 * @param options
 * @returns A new object with properties from `source` deep merged into `target`.
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2 }, d: [1, 2] };
 * const obj2 = { b: { e: 3 }, d: [3, 4], f: 5 };
 *
 * deepMerge(obj1, obj2);
 * // => { a: 1, b: { c: 2, e: 3 }, d: [3, 4], f: 5 } (arrays are replaced)
 *
 * deepMerge(obj1, obj2, { mergeArrays: true });
 * // => { a: 1, b: { c: 2, e: 3 }, d: [1, 2, 3, 4], f: 5 } (arrays are concatenated)
 *
 * const obj3 = { date: new Date('2023-01-01') };
 * const obj4 = { date: new Date('2024-01-01'), other: 'value' };
 * deepMerge(obj3, obj4);
 * // => { date: [Date object from obj4], other: 'value' } (Date object is replaced)
 */
export function deepMerge<T extends object | null | undefined, U extends object | null | undefined>(
  target: T,
  source: U,
  options: DeepMergeOptions = {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
): (T extends object ? T : {}) & (U extends object ? U : {}) {
  const { mergeArrays = false } = options;

  const cloneMap = new WeakMap<object, object>();
  const pairMap = new WeakMap<object, WeakMap<object, object>>();

  const hasOwn = Object.prototype.hasOwnProperty;

  const getPair = (a: object, b: object) => pairMap.get(a)?.get(b);
  const setPair = (a: object, b: object, value: object) => {
    let inner = pairMap.get(a);
    if (!inner) {
      inner = new WeakMap<object, object>();
      pairMap.set(a, inner);
    }
    inner.set(b, value);
  };

  function internalDeepMerge(obj1: any, obj2: any): any {
    // identity fast-path
    if (obj1 === obj2) return obj1;

    if (!isObject(obj2)) return obj2;

    if (!isObject(obj1)) {
      if (cloneMap.has(obj2)) return cloneMap.get(obj2);

      if (Array.isArray(obj2)) {
        const newArr: any[] = [];
        cloneMap.set(obj2, newArr);
        for (let i = 0, l = obj2.length; i < l; i++)
          newArr.push(internalDeepMerge(undefined, obj2[i]));
        return newArr;
      }

      if (isPlainObject(obj2)) {
        const result: Record<string, any> = {};
        cloneMap.set(obj2, result);
        const keys = Object.keys(obj2);
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          result[k] = internalDeepMerge(undefined, obj2[k]);
        }
        return result;
      }

      return obj2;
    }

    // both objects
    const existing = getPair(obj1, obj2);
    if (existing) return existing;

    if (Array.isArray(obj2)) {
      if (!Array.isArray(obj1)) {
        const newArr: any[] = [];
        setPair(obj1, obj2, newArr);
        for (let i = 0, l = obj2.length; i < l; i++)
          newArr.push(internalDeepMerge(undefined, obj2[i]));
        return newArr;
      }

      const newArr: any[] = [];
      setPair(obj1, obj2, newArr);
      if (mergeArrays) {
        for (let i = 0, l = obj1.length; i < l; i++)
          newArr.push(internalDeepMerge(undefined, obj1[i]));
        for (let i = 0, l = obj2.length; i < l; i++)
          newArr.push(internalDeepMerge(undefined, obj2[i]));
      } else {
        for (let i = 0, l = obj2.length; i < l; i++)
          newArr.push(internalDeepMerge(undefined, obj2[i]));
      }
      return newArr;
    }

    if (Array.isArray(obj1) && isPlainObject(obj2)) {
      const result: Record<string, any> = {};
      setPair(obj1, obj2, result);
      const keys = Object.keys(obj2);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        result[k] = internalDeepMerge(undefined, obj2[k]);
      }
      return result;
    }

    if (!isPlainObject(obj1) || !isPlainObject(obj2)) {
      return obj2;
    }

    // plain-object merge: copy obj1 keys manually (cheaper than spread for hot paths)
    const output: Record<string, any> = {};
    const keys1 = Object.keys(obj1);
    for (let i = 0; i < keys1.length; i++) {
      const k = keys1[i];
      output[k] = obj1[k];
    }

    setPair(obj1, obj2, output);

    // fix self-references: if a value in output pointed to obj1, point to output
    for (let i = 0; i < keys1.length; i++) {
      const k = keys1[i];
      if (output[k] === obj1) output[k] = output;
    }

    const keys2 = Object.keys(obj2);
    for (let i = 0; i < keys2.length; i++) {
      const key = keys2[i];
      if (hasOwn.call(obj1, key) && isObject(obj1[key]) && isObject(obj2[key])) {
        output[key] = internalDeepMerge(obj1[key], obj2[key]);
      } else {
        output[key] = internalDeepMerge(undefined, obj2[key]);
      }
    }

    return output;
  }

  if (!isObject(target) && !isObject(source)) return {} as any;
  if (!isObject(target)) return internalDeepMerge(undefined, source) as any;
  if (!isObject(source)) return internalDeepMerge(undefined, target) as any;

  return internalDeepMerge(target, source);
}

export { deepMerge as default };
export type * from './typings';
