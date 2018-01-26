import ActiveModelSerializer from './active-model-serializer';
import { camelize, singularize, pluralize } from '@bigtest/mirage';

export default class RestSerializer extends ActiveModelSerializer {

  keyForModel(type) {
    return camelize(type);
  }

  keyForAttribute(attr) {
    return camelize(attr);
  }

  keyForRelationship(type) {
    return camelize(pluralize(type));
  }

  keyForEmbeddedRelationship(attributeName) {
    return camelize(attributeName);
  }

  keyForRelationshipIds(type) {
    return camelize(pluralize(type));
  }

  keyForForeignKey(relationshipName) {
    return camelize(singularize(relationshipName));
  }
}
