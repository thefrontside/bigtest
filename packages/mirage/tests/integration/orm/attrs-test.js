import { Schema, Model, Db } from '@bigtest/mirage';
import {module, test} from 'qunit';

var db, schema, User;
module('Integration | ORM | attrs', {
  beforeEach() {
    db = new Db({ users: [
      { id: 1, name: 'Link', evil: false }
    ] });

    User = Model.extend();
    schema = new Schema(db, {
      user: User
    });
  }
});

test('attrs returns the models attributes', function(assert) {
  let user = schema.users.find(1);

  assert.deepEqual(user.attrs, { id: '1', name: 'Link', evil: false });
});

test('attributes can be read via plain property access', function(assert) {
  let user = schema.users.find(1);

  assert.equal(user.name, 'Link');
});
