---
id: installation
title: Installation
slug: /platform
---
## Prerequisites
- [`npm`](https://www.npmjs.com/get-npm) or [`yarn`](https://classic.yarnpkg.com/en/docs/install)
- [Node 12](https://nodejs.org/en/download/releases/)

## Installation
The `bigtest` package includes everything you need to get started so go ahead and install BigTest to your project:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">
    <pre><code>$ npm install -D bigtest</code></pre>
  </TabItem>
  <TabItem value="yarn">
    <pre><code>$ yarn add -D bigtest</code></pre>
  </TabItem>
</Tabs>

Once that's finished installing, you can run the following command:
```
$ yarn bigtest init
```
This command will help help generate the `bigtest.json` file for you. 