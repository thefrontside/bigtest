---
id: installation
title: Installation
slug: /platform
---

Thank you for taking an interest in the BigTest testing platform! The platform is still in the alpha phase so our documentation is brief but these next few pages will still cover enough to get you started. If you have any feedback or questions, please feel free to reach out to us in [the Discord chat](https://discord.gg/r6AvtnU).

## Prerequisites
- [`npm`](https://www.npmjs.com/get-npm) or [`yarn`](https://classic.yarnpkg.com/en/docs/install)
- [Node](https://nodejs.org/en/download/releases/)
- A web app*

*If you would like to see BigTest in action right away or in an environment separate from your project, you can install our sample app that was originally created to demonstrate interactors in various testing frameworks. The sample app will have the BigTest platform and its configurations all ready to go. You can install the sample app by running the command `npx bigtest-sample` in your terminal and skip the installation step below.

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
    <pre><code>$ npm install bigtest --save-dev</code></pre>
  </TabItem>
  <TabItem value="yarn">
    <pre><code>$ yarn add bigtest --dev</code></pre>
  </TabItem>
</Tabs>

Once that's finished installing, you can run the following command:

```
$ yarn bigtest init
```

This command will help help generate the `bigtest.json` file for you. 

<!-- how do i use npm to run bigtest commands? -->
