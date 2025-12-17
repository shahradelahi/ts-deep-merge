# @se-oss/deep-merge

[![CI](https://github.com/shahradelahi/ts-deep-merge/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/shahradelahi/ts-deep-merge/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/@se-oss/deep-merge.svg)](https://www.npmjs.com/package/@se-oss/deep-merge)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](/LICENSE)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@se-oss/deep-merge)
[![Install Size](https://packagephobia.com/badge?p=@se-oss/deep-merge)](https://packagephobia.com/result?p=@se-oss/deep-merge)

_@se-oss/deep-merge_ is a utility for deep merging objects.

---

- [Installation](#-installation)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#license)

## 📦 Installation

```bash
npm install @se-oss/deep-merge
```

<details>
<summary>Install using your favorite package manager</summary>

**pnpm**

```bash
pnpm install @se-oss/deep-merge
```

**yarn**

```bash
yarn add @se-oss/deep-merge
```

</details>

## 📖 Usage

```typescript
import { deepMerge } from '@se-oss/deep-merge';

const obj1 = { a: 1, b: { c: 2 }, d: [1, 2] };
const obj2 = { b: { e: 3 }, d: [3, 4], f: 5 };

deepMerge(obj1, obj2);
// => { a: 1, b: { c: 2, e: 3 }, d: [3, 4], f: 5 } (arrays are replaced by default)

deepMerge(obj1, obj2, { mergeArrays: true });
// => { a: 1, b: { c: 2, e: 3 }, d: [1, 2, 3, 4], f: 5 } (arrays are concatenated)

const obj3 = { date: new Date('2023-01-01') };
const obj4 = { date: new Date('2024-01-01'), other: 'value' };
deepMerge(obj3, obj4);
// => { date: [Date object from obj4], other: 'value' } (Date object is replaced)
```

## 📚 Documentation

For all configuration options, please see [the API docs](https://www.jsdocs.io/package/@se-oss/deep-merge).

## 🤝 Contributing

Want to contribute? Awesome! To show your support is to star the project, or to raise issues on [GitHub](https://github.com/shahradelahi/ts-deep-merge).

Thanks again for your support, it is much appreciated! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/ts-deep-merge/graphs/contributors).
