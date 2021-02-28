import { beforeEach, afterEach } from 'mocha';
import { run, Context, Controls } from 'effection';

export let World: Context & Controls;

beforeEach(() => {
  World = run(undefined) as Context & Controls;
});

afterEach(() => {
  if(World['state'] === "errored") {
    console.error(World.result);
  }
  World.halt();
})
