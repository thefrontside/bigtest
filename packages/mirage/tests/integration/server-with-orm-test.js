import {module, test} from 'qunit';
import { Model, Factory, Server } from '@bigtest/mirage';

module('Integration | Server with ORM', {
  beforeEach() {
    this.server = new Server({
      environment: 'test',
      models: {
        blogPost: Model
      },
      factories: {
        blogPost: Factory
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('a single blogPost db collection is made', function(assert) {
  assert.equal(this.server.db._collections.length, 1);
  assert.equal(this.server.db._collections[0].name, 'blogPosts');
});

test('create looks up the appropriate db collection', function(assert) {
  this.server.create('blog-post');

  assert.equal(this.server.db.blogPosts.length, 1);
});
