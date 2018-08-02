// @flow

import * as React from 'react';
import {Spin, Icon} from 'antd';
import RefId from 'canner-ref-id';
import {Map, List, fromJS} from 'immutable';
import Toolbar from './components/toolbar';
import {mapValues} from 'lodash';
import type {HOCProps} from './types';

const antIcon = <Icon type="loading" style={{fontSize: 24}} spin />;

type State = {
  value: any,
  isFetching: boolean,
}

export default function withQuery(Com: React.ComponentType<*>) {
  // this hoc will fetch data;
  return class ComponentWithQuery extends React.PureComponent<HOCProps, State> {
    key: string;
    subscription: any;

    constructor(props: HOCProps) {
      super(props);
      this.state = {
        value: null,
        isFetching: true
      };
    }

    componentDidMount() {
      // defaultSort
      const {relation, query, updateQuery} = this.props;
      if (!relation) {
        return;
      }

      const queries = query.getQueries([relation.to]).args || {pagination: {first: 10}};
      const variables = query.getVairables();
      const args = mapValues(queries, v => variables[v.substr(1)]);
      updateQuery([relation.to], {
        ...args,
        where: {}
      });
      this.queryData();
    }

    UNSAFE_componentWillReceiveProps(props: HOCProps) {
      const {refId, relation} = this.props;
      if (!relation) {
        return;
      }
      if (refId.toString() !== props.refId.toString()) {
        // refetch when route change
        this.queryData(props);
      }
    }

    queryData = (props?: HOCProps): Promise<*> => {
      const {relation, fetch} = props || this.props;
      if (!relation) {
        return Promise.resolve();
      }
      this.setState({
        isFetching: true,
      });
      return fetch(relation.to)
        .then(data => {
          this.setState({
            value: data.get(relation.to),
            isFetching: false,
          });
        })
        .catch(() => {
          this.setState({
            isFetching: false
          })
        });
    }

    updateQuery = (paths: Array<string>, args: Object) => {
      const {updateQuery} = this.props;
      updateQuery(paths, args);
      // quick fix
      this.queryData();
    }

    render() {
      const {value, isFetching} = this.state;
      const {toolbar, query, relation, schema} = this.props;
      if (!relation) {
        return <Com {...this.props}/>;
      }
      if (!value) {
        return <Spin indicator={antIcon} />;
      }
      const queries = query.getQueries([relation.to]).args || {pagination: {first: 10}};
      const variables = query.getVairables();
      const args = mapValues(queries, v => variables[v.substr(1)]);

      const tb = ({children, ...restProps}) => <Toolbar {...restProps}
        items={schema[relation.to].items.items}
        toolbar={toolbar || {pagination: {type: 'pagination'}}}
        args={args}
        query={query}
        refId={new RefId(relation.to)}
        value={value || (defaultValue('connection'): any)}
        updateQuery={this.updateQuery}
      >
        <Spin indicator={antIcon} spinning={isFetching}>
          {children}
        </Spin>
      </Toolbar>;
      return <Com {...this.props} Toolbar={tb} relationValue={value}/>;
    }
  };
}

function defaultValue(type: string, relation: any) {
  switch (type) {
    case 'connection': {
      return fromJS({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        }
      })
    }
    case 'array': {
      return new List();
    }
    case 'object': {
      return new Map();
    }
    case 'boolean': {
      return false;
    }
    case 'number': {
      return 0;
    }
    case 'string': {
      return '';
    }
    case 'relation': {
      if (relation.type === 'toMany') {
        return fromJS({
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false
          }
        });
      } else {
        return null;
      }
    }
    case 'image':
    case 'file': {
      return fromJS({
        url: '',
        contentType: '',
        name: '',
        size: 0,
        __typename: null
      })
    }
    case 'geoPoint': {
      return fromJS({
        placeId: '',
        address: '',
        lat: 122,
        lng: 23
      });
    }
    default: {
      return null;
    }
  }
}