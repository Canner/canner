// @flow

import * as React from 'react';
import {List} from 'react-content-loader';
import Toolbar from '../components/toolbar/index';
import {Icon, Spin} from 'antd';
import {mapValues, isNil} from 'lodash';
import {getValue, defaultValue} from './utils';
import {withApollo} from 'react-apollo';
import type {HOCProps} from './types';
type State = {
  value: any,
  rootValue: any,
  originRootValue: any,
  isFetching: boolean,
}

@withApollo
export default function withQuery(Com: React.ComponentType<*>) {
  // this hoc will fetch data;
  return class ComponentWithQuery extends React.PureComponent<HOCProps, State> {
    key: string;
    subscription: any;

    constructor(props: HOCProps) {
      super(props);
      this.state = {
        value: null,
        rootValue: null,
        originRootValue: null,
        isFetching: true
      };
      this.key = props.refId.getPathArr()[0];
    }

    componentDidMount() {
      this.queryData().then(() => {
        this.subscribe();
      });
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    componentDidUpdate(prevProps: HOCProps) {
      const {refId} = prevProps;
      if (refId.toString() !== this.props.refId.toString()) {
        // refetch when route change
        this.unsubscribe();
        this.queryData(this.props).then(() => {
          this.subscribe();
        });
      }
    }

    unsubscribe = () => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

    subscribe = () => {
      const {subscribe} = this.props;
      const subscription = subscribe(this.key, result => {
        const {data, rootValue} = result;
        this.updateData(data, rootValue);
      });
      this.subscription = subscription;
    }

    queryData = (props?: HOCProps): Promise<*> => {
      const {fetch} = props || this.props;
      this.setState({
        isFetching: true
      });
      return fetch(this.key).then(result => {
        const {data, rootValue} = result;
        this.updateData(data, rootValue);
      });
    }

    updateData = (data: any, rootValue: any) => {
      const {refId} = this.props;
      const newValue = getValue(data, refId.getPathArr());
      this.setState({
        originRootValue: data,
        rootValue,
        value: newValue,
        isFetching: false
      });
    }

    updateQuery = (paths: Array<string>, args: Object) => {
      const {updateQuery} = this.props;
      updateQuery(paths, args)
        .then(rewatch => {
          if (rewatch) {
            this.unsubscribe();
            this.queryData();
            this.subscribe();
          } else {
            this.queryData();
          }
        });
    }

    render() {
      const {value, isFetching, rootValue, originRootValue} = this.state;
      const {toolbar, query, refId, items, type, path, relation, pattern, keyName, request, deploy, nullable} = this.props;
      if (!originRootValue) {
        return <List style={{maxWidth: '600px'}}/>;
      }
      if (pattern === 'array') {
        const queries = query.getQueries(path.split('/')).args || {pagination: {first: 10}};
        const variables = query.getVairables();
        const args = mapValues(queries, v => variables[v.substr(1)]);

        return (
          <Toolbar items={items}
            toolbar={toolbar}
            args={args}
            query={query}
            refId={refId}
            keyName={keyName}
            originRootValue={originRootValue}
            rootValue={rootValue}
            getValue={getValue}
            updateQuery={this.updateQuery}
            request={request}
            deploy={deploy}
          >
            <SpinWrapper isFetching={isFetching}>
              <Com {...this.props} />
            </SpinWrapper>
          </Toolbar>
        );
      } else if (type === 'relation' && relation.type === 'toOne') {
        return (
            <Com {...this.props} showPagination={true} rootValue={rootValue} value={(value && value.id) ? value : defaultValue(type, relation)} />
        );
      } else if (type === 'relation' && relation.type === 'toMany') {
        return (
            <Com {...this.props} showPagination={true} rootValue={rootValue} value={isNil(value) ? defaultValue('array', undefined, nullable) : value}/>
        );
      }

      return (
        <Com {...this.props} showPagination={true} rootValue={rootValue} value={isNil(value) ? defaultValue(type, relation, nullable) : value} />
      );
    }
  };
}

const antIcon = <Icon type="loading" style={{fontSize: 24}} spin />;

function SpinWrapper({
  isFetching,
  children,
  ...props
}: {
  isFetching: boolean,
  children: React.Element<*>
}): React.Element<*> {
  return (
    <Spin indicator={antIcon} spinning={isFetching}>
      {React.cloneElement(children, props)}
    </Spin>
  )
}

export function shouldUpdate(value: any, newValue: any) {
  return value != newValue;
}
