// @flow

import forEach from 'lodash/forEach';
import {types} from './types';
import {createField, capitalizeFirstLetter} from './utils';
import NullField from './nullField';
import * as pluralize from 'pluralize';

import type {Field} from './types';

export default class RelationField implements Field {
  schema: any;
  key: string;
  relationSchema: any;
  rootSchema: any;

  constructor({rootSchema, schema, key}: {rootSchema: any, schema: any, key: string}) {
    this.key = key;
    this.schema = schema;
    this.rootSchema = rootSchema;
    this.relationSchema = rootSchema[this.schema.relation.to];
  }

  exists() {
    return true;
  }

  getKey() {
    return this.key;
  }

  getType() {
    return types.RELATION;
  }

  isToOne() {
    return (this.schema.relation && this.schema.relation.type === 'toOne');
  }

  isToMany() {
    return (this.schema.relation && this.schema.relation.type === 'toMany');
  }

  relationTo() {
    return this.schema.relation.to;
  }

  getTypename() {
    return capitalizeFirstLetter(pluralize.singular(this.relationTo()));
  }

  getChild(fieldName: string) {
    if (!this.relationSchema ||
      !this.relationSchema.items ||
      !this.relationSchema.items.items ||
      !this.relationSchema.items.items[fieldName]
    ) {
      return new NullField({key: fieldName});
    }

    const field = createField(fieldName, this.rootSchema, this.relationSchema.items.items[fieldName]);
    return field;
  }

  forEach(visitor: Function) {
    if (!this.relationSchema ||
      !this.relationSchema.items ||
      !this.relationSchema.items.items
    ) {
      return;
    }

    forEach(this.relationSchema.items.items, (item, key) => {
      const field = createField(key, this.rootSchema, this.relationSchema.items.items[key]);
      visitor(field);
    });
  }
}
