import { Local } from './src/index';
import { main } from '@effection/node';


main(function*() {
  yield Local({ browserName: 'chrome', headless: true });
  console.log('done');
  yield;
});
