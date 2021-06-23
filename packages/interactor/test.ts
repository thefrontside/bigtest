import { createInteractor } from './src/index';

let Foo = createInteractor('foo').filters({
  text: (element) => element.textContent || ""
});
