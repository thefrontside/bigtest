import { Schema, Db, SerializerRegistry } from 'mirage-server';
import { Model, JSONAPISerializer } from 'mirage-server';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Base', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      wordSmith: Model
    });
    this.registry = new SerializerRegistry(this.schema, {
      application: JSONAPISerializer
    });
  }
});

test(`it includes all attributes for a model`, function(assert) {
  let link = this.schema.wordSmiths.create({ firstName: 'Link', age: 123 });
  let result = this.registry.serialize(link);

  assert.deepEqual(result, {
    data: {
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link',
        age: 123
      }
    }
  });
});

test(`it includes all attributes for each model in a collection`, function(assert) {
  this.schema.wordSmiths.create({ firstName: 'Link', age: 123 });
  this.schema.wordSmiths.create({ id: 1, firstName: 'Link', age: 123 });
  this.schema.wordSmiths.create({ id: 2, firstName: 'Zelda', age: 456 });

  let collection = this.schema.wordSmiths.all();
  let result = this.registry.serialize(collection);

  assert.deepEqual(result, {
    data: [{
      type: 'word-smiths',
      id: '1',
      attributes: {
        'first-name': 'Link',
        age: 123
      }
    }, {
      type: 'word-smiths',
      id: '2',
      attributes: {
        'first-name': 'Zelda',
        age: 456
      }
    }]
  });
});

test(`it can serialize an empty collection`, function(assert) {
  let wordSmiths = this.schema.wordSmiths.all();
  let result = this.registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    data: []
  });
});
