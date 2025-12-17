import { deepMerge } from '@se-oss/deep-merge';
import deepmerge from 'deepmerge';
import { deepmerge as deepmergeTs } from 'deepmerge-ts';
import _ from 'lodash';
import mergeDeep from 'merge-deep';
import { bench, describe } from 'vitest';

const obj1 = {
  a: 1,
  b: 'hello',
  c: true,
  d: null,
  e: undefined,
  f: [1, 2, { g: 3, h: [new Date('2023-01-01'), /test/i] }],
  i: { j: 4, k: { l: 'world' } },
  m: new Date('2024-01-01T00:00:00.000Z'),
  n: /pattern/g,
};

const obj3 = {
  a: 1,
  b: 'hello',
  c: true,
  d: null,
  e: undefined,
  f: [1, 2, { g: 3, h: [new Date('2023-01-01'), /test/i] }],
  i: { j: 4, k: { l: 'different' } }, // This will make it unequal
  m: new Date('2024-01-01T00:00:00.000Z'),
  n: /pattern/g,
};

const objWithArrays1 = { a: [1, 2], b: { c: [3, 4] } };
const objWithArrays2 = { a: [5, 6], b: { c: [7, 8] } };

const objWithSpecialTypes1 = {
  date: new Date('2023-01-01'),
  regex: /abc/i,
  nested: { date: new Date('2023-01-01'), regex: /xyz/g },
};
const objWithSpecialTypes2 = {
  date: new Date('2024-01-01'),
  regex: /123/m,
  nested: { date: new Date('2024-01-01'), regex: /456/i },
};

const circular1: any = {};
circular1.a = circular1;
const circular2: any = { b: 2 };
circular2.a = circular1;

describe('Deep Merge Benchmarks', () => {
  bench('@se-oss/deep-merge', () => {
    deepMerge(obj1, obj3);
    deepMerge(objWithArrays1, objWithArrays2);
    deepMerge(objWithSpecialTypes1, objWithSpecialTypes2);
    deepMerge(circular1, circular2);
  });

  bench('deepmerge', () => {
    deepmerge(obj1, obj3);
    deepmerge(objWithArrays1, objWithArrays2);
    deepmerge(objWithSpecialTypes1, objWithSpecialTypes2);
  });

  bench('lodash.merge', () => {
    _.merge({}, obj1, obj3);
    _.merge({}, objWithArrays1, objWithArrays2);
    _.merge({}, objWithSpecialTypes1, objWithSpecialTypes2);
  });

  bench('deepmerge-ts', () => {
    deepmergeTs(obj1, obj3);
    deepmergeTs(objWithArrays1, objWithArrays2);
    deepmergeTs(objWithSpecialTypes1, objWithSpecialTypes2);
  });

  bench('merge-deep', () => {
    mergeDeep(obj1, obj3);
    mergeDeep(objWithArrays1, objWithArrays2);
    mergeDeep(objWithSpecialTypes1, objWithSpecialTypes2);
  });
});
