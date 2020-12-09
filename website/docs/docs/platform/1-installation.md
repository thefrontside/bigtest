---
id: installation
title: Installation
slug: /platform
---

BigTest is a free, Open Source testing platform built from scratch for the modern age — with no traces of Selenium, Playwright, or earlier tools.

After following along with these guides, you will be up and running with some new user interface tests.

The BigTest platform and its documentation are in the alpha phase. We welcome any feedback or questions! Please feel free to reach out to us in [the Discord chat](https://discord.gg/r6AvtnU).

## Prerequisites
- [`npm`](https://www.npmjs.com/get-npm) or [`yarn`](https://classic.yarnpkg.com/en/docs/install)
- [Node](https://nodejs.org/en/download/releases/)
- A web app*

*If you would like to see BigTest in action right away or in an environment separate from your project, you can install our sample app that was originally created to demonstrate interactors in various testing frameworks. The sample app will have the BigTest platform and its configurations all ready to go. You can install the sample app by running the command `npx bigtest-sample` in your terminal and skip the installation step below.

## Installation

The `bigtest` package includes everything you need to get started. Go ahead and install BigTest to your project:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">

  ```
  $ npm install bigtest --save-dev
  ```

  </TabItem>
  <TabItem value="yarn">
  
  ```
  $ yarn add bigtest --dev
  ```
  
  </TabItem>
</Tabs>

Once that's finished installing, you can run the following command to generate the essential files:

<Tabs
  defaultValue="npm"
  values={[
    {label: 'NPM', value: 'npm'},
    {label: 'Yarn', value: 'yarn'}
  ]}>
  <TabItem value="npm">

  ```
  $ npx bigtest init
  ```

  </TabItem>
  <TabItem value="yarn">
  
  ```
  $ yarn bigtest init
  ```
  
  </TabItem>
</Tabs>

You will know that your installation is successful if this command generates the `bigtest.json` file.

Continue on to the next article to learn how to use this file and write your first test!
