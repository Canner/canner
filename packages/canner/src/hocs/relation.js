// @flow

import * as React from 'react';
import {Spin, Icon} from 'antd';
import RefId from 'canner-ref-id';
import Toolbar, { parseWhere } from './components/toolbar';
import {mapValues} from 'lodash';
import type {HOCProps} from './types';
import {parseConnectionToNormal, getValue, defaultValue, filterByWhere, paginate} from './utils';
import {withApollo} from 'react-apollo';
import gql from 'graphql-tag';
import {Query} from '../query';
import {List} from 'react-content-loader';

type State = {
  originRootValue: any,
  isFetching: boolean,
  current: number
}

type Props = HOCProps & {
  client: any
}

@withApollo
export default function withQuery(Com: React.ComponentType<*>) {
  // this hoc will fetch data;
  return class ComponentWithQuery extends React.PureComponent<Props, State> {
    query: Query;

    constructor(props: Props) {
      super(props);
      this.state = {
        originRootValue: null,
        isFetching: true,
        current: 0
      };
      if (props.relation) {
        this.query = new Query({schema: props.schema});
      }
    }

    componentDidMount() {
      const {relation, toolbar} = this.props;
      if (!relation) {
        return;
      }
      let args = this.getArgs();
      if (toolbar && toolbar.async) {
        args = {...args, first: 10}
      }
      if (toolbar && toolbar.filter && toolbar.filter.permanentFilter) {
        args = {...args, where: toolbar.filter.permanentFilter};       
      }
      // this method will also query data
      this.updateQuery([relation.to], args);
    }

    UNSAFE_componentWillReceiveProps(props: Props) {
      const {refId, relation} = this.props;
      if (!relation) {
        return;
      }
      if (refId.toString() !== props.refId.toString()) {
        // refetch when route change
        this.queryData(props);
      }
    }

    queryData = (props?: Props): Promise<*> => {
      const {relation, client} = props || this.props;
      if (!relation) {
        return Promise.resolve();
      }
      this.setState({
        isFetching: true,
      });
      const gqlStr = this.query.toGQL(relation.to);
      const variables = this.query.getVairables();
      return client.query({
        query: gql`${gqlStr}`,
        variables
      }).then(({data}) => {
          this.setState({
            originRootValue: data,
            isFetching: false,
          });
        })
        .catch(() => {
          this.setState({
            isFetching: false
          })
        });
    }

    getArgs = () => {
      const {relation} = this.props;
      const queries = this.query.getQueries([relation.to]).args || {pagination: {first: 10}};
      const variables = this.query.getVairables();
      const args = mapValues(queries, v => variables[v.substr(1)]);
      return args;
    }

    updateQuery = (paths: Array<string>, args: Object) => {
      this.query.updateQueries(paths, 'args', args);
      this.queryData();
    }

    render() {
      let {originRootValue, isFetching, current} = this.state;
      const {toolbar, relation, schema, refId} = this.props;
      if (!relation) {
        return <Com {...this.props}/>;
      }
      if (!originRootValue) {
        return <List style={{maxWidth: 500}} />;
      }
      const args = this.getArgs();
      const removeSelfRootValue = {[relation.to]: removeSelf(originRootValue[relation.to], refId, relation.to)};
      let parsedRootValue = removeSelfRootValue;
      if (toolbar && !toolbar.async) {
        // TODO
        // parsedRootValue = filterByWhere(removeSelfRootValue, relation.to, parseWhere(args.where));
        // if (toolbar.pagination) {
        //   parsedRootValue = paginate(removeSelfRootValue, relation.to, current, 10);
        // }
      }
      const tb = ({children, ...restProps}) => <Toolbar
        {...restProps}
        items={schema[relation.to].items.items}
        toolbar={toolbar || {pagination: {type: 'pagination'}}}
        args={args}
        query={this.query}
        keyName={relation.to}
        refId={new RefId(relation.to)}
        originRootValue={parsedRootValue}
        updateQuery={this.updateQuery}
        parseConnectionToNormal={parseConnectionToNormal}
        getValue={getValue}
        defaultValue={defaultValue}
      >
        {/* $FlowFixMe */}
        <SpinWrapper isFetching={isFetching}>
          {children}
        </SpinWrapper>
      </Toolbar>;
      return <Com {...this.props} Toolbar={tb} relationValue={removeSelfRootValue[relation.to]}/>;
    }
  };
}

export function removeSelf(value: any, refId: RefId, relationTo: string) {
  const [key, index] = refId.getPathArr().slice(0, 2);
  if (key !== relationTo) {
    return value;
  }
  return {...value, edges: value.edges.filter((v, i) => i !== Number(index))};
}

const antIcon = <Icon type="loading" style={{fontSize: 24}} spin />;

function SpinWrapper({
  isFetching,
  children,
  value
}: {
  isFetching: boolean,
  children: Function,
  value: any
}): React.Element<*> {
  return (
    <Spin indicator={antIcon} spinning={isFetching}>
      {children(value)}
    </Spin>
  )
}