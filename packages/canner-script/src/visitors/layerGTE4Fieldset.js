import {CANNER_KEY} from "../layout";

const block = {
  'plugins.object.fieldset': {
    exit: (path) => {
      // third layer fieldset
      if (!path.node.blocks && path.route.split('.').length >= 4) {
      const nodeInInnerBlockContainer = {
          nodeType: 'layout',
          component: "default",
          style: {background: '#fff', padding: 16},
          name: path.node.name,
          children: [path.node],
          childrenName: [path.node.name],
          [CANNER_KEY]: [path.node[CANNER_KEY]],
          title: path.node.title,
          description: path.node.description,
          hocs: [],
        };
        path.tree.setNode(path.route, nodeInInnerBlockContainer);
      }
    },
  },
};

export default [block];
