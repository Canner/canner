// @flow

import * as React from 'react';
import RefId from 'canner-ref-id';
import Ajv from 'ajv';
import {isEmpty, isObject, isArray, isPlainObject, isFunction, toString, get} from 'lodash';
import type {HOCProps} from './types';

type State = {
  error: boolean,
  errorInfo: Array<any>
}


const checkValidation = (validation) => {
  return (isObject(validation) && !isEmpty(validation))
}

const checkSchema = (schema) => {
  return (isObject(schema) && !isEmpty(schema) )
}
const checkValidator = (validator) => {
  return (isFunction(validator))
}

const promiseRequired = async (value) => {
  const valid = Boolean(value)
  return {
    error: !valid,
    errorInfo: !valid ? [{message: 'should be required'}] :[]
  }
}

const promiseSchemaValidation = (schema, errorMessage) => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  return async (value) => {
    try {
      const error = !validate(value);
      const errorInfo = error ? [].concat( errorMessage ? {message: errorMessage} : validate.errors ) : [];
      return {
        error,
        errorInfo
      }
    }
    catch(err){
      return {
        error: true,
        errorInfo: [{message: toString(err)}]
      }
    }

  }
}
const promiseCustomizedValidator = (validator) => async (value) => {
  try {
    const errorMessage = await validator(value);
    const error = Boolean(errorMessage);
    const errorInfo = error ? [{message: errorMessage}] : []
    return {
      error,
      errorInfo
    }
  }
  catch(err) {
    return {
      error: true,
      errorInfo: [{message: toString(err)}]
    }
  }
}

export default function withValidation(Com: React.ComponentType<*>) {
  return class ComponentWithValidation extends React.Component<HOCProps, State> {
    key: string;
    id: ?string;
    callbackId: ?string;
    state = {
      error: false,
      errorInfo: []
    }

    componentDidMount() {
      const {refId, validation = {}, onDeploy, required = false} = this.props;
      if (isEmpty(validation) && !required) {
        // no validation
        return;
      }
      const key = refId.getPathArr()[0];
      this.callbackId = onDeploy(key, this.validate);
    }

    componentWillUnmount() {
      this.removeOnDeploy();
    }

    handleValidationResult = (results: any) => {

      let error = false;
      let errorInfo = [];

      for(let index = 0; index < results.length; index++) {
        error = error || results[index].error
        errorInfo = errorInfo.concat(results[index].errorInfo);
      }

      this.setState({
        error,
        errorInfo
      });

      return {
        error,
        errorInfo
      }
    }

    validate = async (result: any) => {
      const {refId, required = false, validation} = this.props;
      const paths = refId.getPathArr().slice(1);
      const {value} = getValueAndPaths(result.data, paths);
      const promiseQueue = [];
      try{
        // check whether value is required in first step
        if(required) {
          promiseQueue.push(promiseRequired(value));
        }
  
        // skip validation if object validation is undefined or empty
        if(checkValidation(validation)) {
          const {schema, errorMessage, validator} = validation;
          if(value && checkSchema(schema)) {
            promiseQueue.push(promiseSchemaValidation(schema, errorMessage)(value));
          }
          if(validator) {
            if(checkValidator(validator)) {
              promiseQueue.push(promiseCustomizedValidator(validator)(value));
            } else {
              throw 'Validator should be a function'
            }
           }
        }
  
        const ValidationResult = await Promise.all(promiseQueue);
  
        return {
          ...result,
          ...this.handleValidationResult(ValidationResult)
        }
      }
      catch(err){
        this.setState({
          error: true,
          errorInfo: [].concat({message: toString(err)})
        });
        return {
          ...result,
          error: true,
          errorInfo: [].concat({message: toString(err)})
        }
      }
    }

    removeOnDeploy = () => {
      const {refId, removeOnDeploy} = this.props;
      if (this.callbackId) {
        removeOnDeploy(refId.getPathArr()[0], this.callbackId || '');
      }
    }
    

    render() {
      const {error, errorInfo} = this.state;
      return <React.Fragment>
        <Com {...this.props} error={error} errorInfo={errorInfo || []}/>
      </React.Fragment>
  }
  };
}

export function splitRefId({
  refId,
  rootValue,
  pattern
}: {
  refId: RefId,
  rootValue: any,
  pattern: string
}) {
  const [key, index] = refId.getPathArr();
  let id;
  if (pattern.startsWith('array')) {
    id = get(rootValue, [key, index, 'id']);
  }
  return {
    key,
    id
  }
}

export function getValueAndPaths(value: Object, idPathArr: Array<string>) {
  return idPathArr.reduce((result: any, key: string) => {
    let v = result.value;
    let paths = result.paths;
    if (isPlainObject(v)) {
      if ('edges' in v && 'pageInfo' in v) {
        v = get(v, ['edges', key, 'node']);
        paths = paths.concat(['edges', key, 'node']);
      } else {
        v = v[key];
        paths = paths.concat(key);
      }
    } else if (isArray(v)) {
      v = v[key];
      paths = paths.concat(key);
    }
    return {
      value: v,
      paths
    }
  }, {
    value,
    paths: []
  });
}