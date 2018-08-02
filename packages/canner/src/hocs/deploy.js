// @flow
import * as React from 'react';
import {Button} from 'antd';
import type RefId from 'canner-ref-id';
import {isRoutesEndAtMe} from './cache';
import {List} from 'immutable';
import type {HOCProps} from './types';

type State = {
};

export default function deploy(Com: React.ComponentType<*>) {
  return class ComponentWithDeploy extends React.Component<HOCProps, State> {
    deploy = (refId: RefId, callback: Function) => {
      const {deploy} = this.props;
      return deploy(refId.getPathArr()[0]).then(callback).catch(() => {});
    }

    reset = (refId: RefId, callback: Function) => {
      const {reset, rootValue} = this.props;
      const key = refId.getPathArr()[0];
      const recordId = getRecordId(rootValue, refId);
      reset(key, recordId);
      callback();
    }

    render() {
      const {params, routes, refId, path, pattern, controlDeployAndResetButtons, hideButtons} = this.props;
      const buttonContainer = {
        textAlign: 'right',
        marginTop: 60
      }
      const renderConfirmButton = genDeployButton(this.deploy, refId);
      const renderCancelButton = genCancelButton(this.reset, refId);
      const isCreateOp = params.op === 'create';
      const shouldRenderButtons = (routes.length === 1 || isRoutesEndAtMe({routes, path, pattern}) &&
      isCreateOp) && !controlDeployAndResetButtons && !hideButtons && refId.getPathArr().length <= routes.length;
      return <div>
        {/* $FlowFixMe */}
        <Com {...this.props}
          renderConfirmButton={renderConfirmButton}
          renderCancelButton={renderCancelButton}
        />
        {
          shouldRenderButtons &&
            // $FlowFixMe
            <div style={buttonContainer}>
              {renderConfirmButton({
                callback: () => {
                  // location.href = params.backUrl || location.href.split('?')[0];
                },
                style: {marginRight: 16}
              })}
              {renderCancelButton({
                hidden: isCreateOp
              })}
            </div>
        }
      </div>;
    }
  };
}

type buttonProps = {
  disabled?: boolean,
  style?: Object,
  refId?: RefId,
  onClick?: (refId?: RefId, callback?: Function) => Promise<*>,
  callback?: Function,
  text?: React.Node | string,
  hidden?: boolean,
  component?: React.ComponentType<*>
}

export function genDeployButton(deploy: Function, currentRefId: RefId) {
  return function DeployButton({
    disabled = false,
    style = {marginRight: 16},
    refId = currentRefId,
    onClick = deploy,
    callback = () => {},
    // $FlowFixMe
    text = 'Confirm',
    // $FlowFixMe
    component = Button
  }: buttonProps = {}) {
    return React.createElement(component, {
      disabled,
      style,
      type: "primary",
      onClick: () => onClick(refId, callback)
    }, text);
  };
}

export function genCancelButton(reset: Function, currentRefId: RefId) {
  return function CancelButton({
    disabled = false,
    style = {},
    refId = currentRefId,
    onClick = reset,
    callback = () => {},
    // $FlowFixMe
    text = 'Reset',
    // $FlowFixMe
    component = Button
  }: buttonProps = {}) {
    return React.createElement(component, {
      disabled,
      style,
      onClick: () => onClick(refId, callback)
    }, text);
  };
}


function getRecordId(rootValue: any, refId: RefId) {
  const [key, index] = refId.getPathArr();
  let recordId = '';
  const value = rootValue.get(key);
  if (List.isList(value)) {
    recordId = value.getIn([index, 'id']);
  }
  return recordId;
}
