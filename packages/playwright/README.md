# @bigtest/playwright

Use Playwright to start BigTest agents.

This allows you to launch playwright as a bigtest agent. The
playwright driver accepts two options:

- *browser* one of the playwright supported browsers: either chromium,
  webkit, or firefox
- *headless* whether or not this browser should be headless or not

For example add the following to the "drivers" field of `bigtest.json`
to add a 'chromium' browser that will run playwright chromium in a
full display (not headless)

``` json
{
  "drivers": {
    "chromium": {
      module: "@bigtest/playwright",
      options: {
        browser: "chromium",
        headless: false
      }
    }
  }
}
```

now you can launch it with:

``` sh
$ bigtest server --launch chromium
```

``` sh
$ yarn test
```
