import { Schema, Model, Db, hasMany, belongsTo } from '@bigtest/mirage';

export default {

  setup() {
    return new Schema(new Db(), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: belongsTo(),
        fineComments: hasMany()
      }),
      fineComment: Model.extend({
        blogPost: belongsTo()
      }),
      greatPhoto: Model,

      foo: Model.extend({
        bar: belongsTo()
      }),
      bar: Model.extend({
        baz: belongsTo()
      }),
      baz: Model.extend({
        quuxes: hasMany()
      }),
      quux: Model.extend({
        zomgs: hasMany()
      }),
      zomg: Model.extend({
        lol: belongsTo()
      }),
      lol: Model
    });
  }

};
