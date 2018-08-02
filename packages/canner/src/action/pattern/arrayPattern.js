// @flow

import type {Pattern, Action, ArrayActionType} from '../types';

type ArrayAction = Action<ArrayActionType>;

export default class ArrayPattern implements Pattern<ArrayAction> {
  actions: Array<ArrayAction>;

  constructor() {
    this.actions = [];
  }

  removeAllActionIfDeleteAfterCreate = () => {
    if (this.actions.length >= 2 &&
      this.actions[0].type === 'CREATE_ARRAY' && 
      this.actions.slice(-1)[0].type === 'DELETE_ARRAY'
    ) {
      this.actions = [];
    }
  }

  removeAllUpdateBeforeDelete = () => {
    if (this.actions.length >= 2 &&
      this.actions[0].type !== 'CREATE_ARRAY' &&
      this.actions.slice(-1)[0].type === 'DELETE_ARRAY'
    ) {
      this.actions = this.actions.slice(-1);
    }
  }

  mergeAllUpdate = () => {
    if (this.actions.length >= 2 &&
      this.actions[0].type === 'UPDATE_ARRAY' && 
      this.actions.slice(-1)[0].type === 'UPDATE_ARRAY'
    ) {
      this.actions = [this.actions.reduce((result, action) => {
        result.payload.value = result.payload.value.merge(action.payload.value);
        return result;
      })];
    }
  }

  mergeUpdateAndCreate = () => {
    if (this.actions.length >= 2 &&
      this.actions[0].type === 'CREATE_ARRAY' &&
      this.actions.slice(-1)[0].type === 'UPDATE_ARRAY'
    ) {
      this.actions = [this.actions.reduce((result, action) => {
        result.payload.value = result.payload.value.merge(action.payload.value);
        return result;
      })];
    }
  }

  addAction = (action: ArrayAction) => {
    this.actions.push(action);
    this.mergeAction();
  }

  mergeAction = (): Array<ArrayAction> => {
    this.removeAllActionIfDeleteAfterCreate();
    this.removeAllUpdateBeforeDelete();
    this.mergeAllUpdate();
    this.mergeUpdateAndCreate();
    return this.actions;
  }

  getActions = (): Array<ArrayAction> => {
    return this.actions;
  }
}
