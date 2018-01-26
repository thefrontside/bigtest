import { toCollectionName, toModelName } from 'mirage-server';
import { inflections } from 'inflected';

import {module, test} from 'qunit';

const EN = inflections("en");

module('Unit | Normalize name');

test('can convert Model name to DbCollection name', function(assert) {
  assert.equal(toCollectionName('test'), 'tests');
  assert.equal(toCollectionName('hard-test'), 'hardTests');
});

test('can convert DbCollection name to Model name', function(assert) {
  assert.equal(toModelName('tests'), 'test');
  assert.equal(toModelName('hardTests'), 'hard-test');
});

test('can convert Model name to DbCollection using custom inflector rules', function(assert) {

  EN.irregular('head-of-state', 'heads-of-state');
  assert.equal(toCollectionName('head-of-state'), 'headsOfState');
});

test('can convert DbCollection name to Model name using custom inflector rules', function(assert) {
  EN.irregular('head-of-state', 'heads-of-state');
  assert.equal(toModelName('headsOfState'), 'head-of-state');
});
