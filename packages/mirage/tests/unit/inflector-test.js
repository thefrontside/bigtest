import { singularize, pluralize, dasherize, camelize } from '@bigtest/mirage';

import {module, test} from 'qunit';

module('Unit | Inflector');

test('can singularize', function(assert) {
  assert.equal(singularize('tests'), 'test');
  assert.equal(singularize('watches'), 'watch');
  assert.equal(singularize('sheep'), 'sheep');
});

test('can pluralize', function(assert) {
  assert.equal(pluralize('test'), 'tests');
  assert.equal(pluralize('watch'), 'watches');
  assert.equal(pluralize('sheep'), 'sheep');
});

test('camelize does not capitalize the first letter', function(assert) {
  assert.equal(camelize('the_big_lebowski'), 'theBigLebowski');
});

test('can convert from kebab-case to camel case', function(assert) {
  assert.equal(camelize('the-big-lebowski'), 'theBigLebowski');
});

test('can convert from camel case to kebab case', function(assert) {
  assert.equal(dasherize('theBigLebowski'), 'the-big-lebowski');
});
