import { describe, expect, it } from 'vitest';

import { deepMerge } from '.';

class MyClass {
  constructor(public value: number) {}
}

describe('deepMerge', () => {
  it('deep merges two plain objects immutably', () => {
    const obj1 = { a: 1, b: { c: 2 }, d: [1, 2] };
    const obj2 = { b: { e: 3 }, d: [3, 4], f: 4 };
    const expected = { a: 1, b: { c: 2, e: 3 }, d: [3, 4], f: 4 };

    const result = deepMerge(obj1, obj2);

    expect(result).toEqual(expected);
    expect(result).not.toBe(obj1);
    expect(result.b).not.toBe(obj1.b);
    expect(obj1).toEqual({ a: 1, b: { c: 2 }, d: [1, 2] }); // original untouched
  });

  it('arrays are replaced by default', () => {
    const obj1 = { arr: [1, 2] };
    const obj2 = { arr: [3, 4] };
    const result = deepMerge(obj1, obj2);
    expect(result.arr).toEqual([3, 4]);
    expect(result.arr).not.toBe(obj1.arr);
    expect(result.arr).toBe(result.arr); // sanity
  });

  it('arrays concatenate when mergeArrays=true', () => {
    const obj1 = { arr: [1, 2] };
    const obj2 = { arr: [3, 4] };
    const result = deepMerge(obj1, obj2, { mergeArrays: true });
    expect(result.arr).toEqual([1, 2, 3, 4]);
    expect(result.arr).not.toBe(obj1.arr);
    expect(result.arr).not.toBe(obj2.arr);
  });

  it('non-plain objects (class instances) are replaced by source instance', () => {
    const instance1 = new MyClass(1);
    const instance2 = new MyClass(2);
    const obj1 = { a: instance1, b: { c: 2, d: 3 } };
    const obj2 = { a: instance2, b: { c: 2 } };
    const result = deepMerge(obj1, obj2);
    expect(result.a).toBe(instance2);
    expect(result.b).toEqual({ c: 2, d: 3 });
    expect(result.b).not.toBe(obj1.b);
  });

  it('replaces Date and RegExp with source instances', () => {
    const d1 = new Date('2020-01-01');
    const d2 = new Date('2021-01-01');
    const r1 = /a/gi;
    const r2 = /b/m;
    const obj1 = { d: d1, r: r1 };
    const obj2 = { d: d2, r: r2 };
    const result = deepMerge(obj1, obj2);
    expect(result.d).toBe(d2);
    expect(result.r).toBe(r2);
  });

  it('handles circular references gracefully', () => {
    const obj1: any = { a: null as any };
    obj1.a = obj1;
    const obj2 = { b: 2 };
    const res = deepMerge(obj1, obj2);
    expect(res.b).toBe(2);
    expect(res.a).toBe(res);
  });

  it('handles null/undefined roots', () => {
    expect(deepMerge(null, undefined)).toEqual({});
    expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, undefined)).toEqual({ a: 1 });
  });

  it('deep merges three objects (source precedence)', () => {
    const obj1 = { a: 1, b: { c: 2, d: 3 } };
    const obj2 = { b: { c: 10 }, e: 4 };
    const obj3 = { b: { d: 30 }, f: 5 };
    const result = deepMerge(deepMerge(obj1, obj2), obj3);
    // obj3 overrides where it provides values, but merging happens as expected
    expect(result).toEqual({ a: 1, b: { c: 10, d: 30 }, e: 4, f: 5 });
  });

  it('array in source replaces object in target and vice versa', () => {
    const obj1 = { mixed: { id: 1 } };
    const obj2 = { mixed: [{ id: 2 }] };
    const r1 = deepMerge(obj1, obj2);
    expect(Array.isArray(r1.mixed)).toBe(true);
    expect(r1.mixed).toEqual([{ id: 2 }]);

    const obj3 = { mixed: [{ id: 3 }] };
    const obj4 = { mixed: { id: 4 } };
    const r2 = deepMerge(obj3, obj4);
    expect(typeof r2.mixed).toBe('object');
    expect(r2.mixed).toEqual({ id: 4 });
  });

  it('functions and other non-plain objects are replaced by source', () => {
    const f1 = () => 1;
    const f2 = () => 2;
    const obj1 = { fn: f1 };
    const obj2 = { fn: f2 };
    const res = deepMerge(obj1, obj2);
    expect(res.fn).toBe(f2);
  });

  it('does not mutate source or target input objects', () => {
    const a = { x: { y: 1 }, arr: [1] };
    const b = { x: { z: 2 }, arr: [2] };
    const copyA = JSON.parse(JSON.stringify(a));
    const copyB = JSON.parse(JSON.stringify(b));

    deepMerge(a, b);
    expect(a).toEqual(copyA);
    expect(b).toEqual(copyB);
  });
});
