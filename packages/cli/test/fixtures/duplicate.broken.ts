import { test } from '@bigtest/suite';

export default test('Passing Test')
  .child("duplicate child", test => test)
  .child("duplicate child", test => test);
