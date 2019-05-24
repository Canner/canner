import Parser from '../src/parser';

const parser = new Parser();

describe('parser', () => {
  it('parse plugin', () => {
    const schema = {
      type: 'string',
      ui: 'input',
      description: 'xxx',
    };
    const tree = {
      name: 'name',
      type: 'string',
      ui: 'input',
      nodeType: 'component.string.input',
      description: 'xxx',
      pattern: 'object.string',
      path: 'info/name',
    };
    expect(parser.parsePlugin('name', schema, { pattern: 'object', path: 'info' })).toMatchObject(tree);
  });

  it('object parse', () => {
    const schema = {
      type: 'object',
      items: {
        name: {
          type: 'string',
          ui: 'input',
        },
      },
    };
    const tree = {
      name: 'info',
      type: 'object',
      pattern: 'object',
      path: 'info',
      nodeType: 'component.object.fieldset',
      items: {
        name: {
          type: 'string',
          ui: 'input',
        },
      },
      children: [
        {
          name: 'name',
          nodeType: 'component.string.input',
          type: 'string',
          ui: 'input',
          pattern: 'object.string',
          path: 'info/name',
        },
      ],
    };
    expect(parser.parseObject('info', schema, {
      pattern: 'object',
      path: 'info',
    })).toMatchObject(tree);
  });

  it('array parse', () => {
    const schema = {
      type: 'array',
      ui: 'tab',
      items: {
        type: 'object',
        items: {
          name: {
            type: 'string',
            ui: 'input',
          },
        },
      },
    };
    const tree = {
      name: 'post',
      type: 'array',
      ui: 'tab',
      pattern: 'array',
      path: 'posts',
      nodeType: 'component.array.tab',
      items: {
        type: 'object',
        items: {
          name: {
            type: 'string',
            ui: 'input',
          },
        },
      },
      children: [
        {
          name: 'name',
          nodeType: 'component.string.input',
          type: 'string',
          ui: 'input',
          pattern: 'array.string',
          path: 'posts/name',
        },
      ],
    };
    expect(parser.parseArray('post', schema, {
      pattern: 'array',
      path: 'posts',
    })).toMatchObject(tree);
  });

  it('parse', () => {
    const schema = {
      info: {
        type: 'object',
        items: {
          name: {
            type: 'string',
            ui: 'input',
          },
        },
      },
    };
    const tree = {
      info: {
        pattern: 'object',
        path: 'info',
        name: 'info',
        nodeType: 'component.object.fieldset',
        type: 'object',
        items: {
          name: {
            type: 'string',
            ui: 'input',
          },
        },
        children: [{
          name: 'name',
          type: 'string',
          ui: 'input',
          nodeType: 'component.string.input',
          pattern: 'object.string',
          path: 'info/name',
        }],
      },
    };
    expect(parser.parse(schema, {
      pattern: 'array.string',
      path: 'posts/name',
    })).toMatchObject(tree);
  });

  it('parse page schema', () => {
    const pageSchmea = {
      overview: {
        type: 'page',
        keyName: 'overview',
        items: {
          highestPrice: {
            keyName: 'highestPrice',
            type: 'component',
            ui: 'amount',
          },
          lineChart: {
            keyName: 'lineChart',
            type: 'component',
            ui: 'line',
          },
        },
      },
    };
    const tree = {
      overview: {
        type: 'page',
        keyName: 'overview',
        nodeType: 'page.page.default',
        items: {
          highestPrice: {
            keyName: 'highestPrice',
            type: 'component',
            ui: 'amount',
          },
          lineChart: {
            keyName: 'lineChart',
            type: 'component',
            ui: 'line',
          },
        },
        children: [{
          keyName: 'highestPrice',
          type: 'component',
          ui: 'amount',
          nodeType: 'page.component.amount',
          pattern: 'page.component',
          path: 'overview/highestPrice',
        }, {
          keyName: 'lineChart',
          type: 'component',
          ui: 'line',
          nodeType: 'page.component.line',
          pattern: 'page.component',
          path: 'overview/lineChart',
        }],
      },
    };
    expect(new Parser().parse(pageSchmea)).toMatchObject(tree);
  });
});
