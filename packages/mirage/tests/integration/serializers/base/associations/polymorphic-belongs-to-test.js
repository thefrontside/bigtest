import { Serializer, SerializerRegistry, Model, belongsTo, Db } from '@bigtest/mirage';
import { Schema } from '@bigtest/mirage';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Polymorphic Belongs To', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      post: Model.extend(),
      comment: Model.extend({
        commentable: belongsTo({ polymorphic: true })
      })
    });

    let post = this.schema.posts.create({ title: 'Lorem ipsum' });
    this.schema.comments.create({ commentable: post, text: 'Foo' });

    this.BaseSerializer = Serializer.extend({
      embed: false
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can serialize a polymorphic belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    comment: this.BaseSerializer.extend({
      include: ['commentable']
    })
  });

  let comment = this.schema.comments.find(1);
  let result = registry.serialize(comment);

  assert.deepEqual(result, {
    comment: {
      id: '1',
      text: 'Foo',
      commentableType: 'post',
      commentableId: '1'
    },
    posts: [
      { id: '1', title: 'Lorem ipsum' }
    ]
  });
});
