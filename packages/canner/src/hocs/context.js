// @flow
import * as React from 'react';

export const defaultContext = {
  query: {},
  dataChanged: {},
  fetch: () => {throw new Error('there is no fetch method');},
  subscribe: () => {throw new Error('there is no subscribe method');},
  request: () => {throw new Error('there is no request method');},
  deploy: () => {throw new Error('there is no deploy method');},
  reset: () => {throw new Error('there is not reset method');},
  onDeploy: () => {throw new Error('there is not onDeploy method');},
  removeOnDeploy: () => {throw new Error('there is not removeOnDeploy method');},
  updateQuery: () => {},
}

// $FlowFixMe: waiting for flow updata the libdef
export const HOCContext = React.createContext(defaultContext);
