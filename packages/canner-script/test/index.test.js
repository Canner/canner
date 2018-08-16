/** @jsx builder */

// eslint-disable-next-line
import builder, {configure} from '../src'
import path from 'path';
import Sort from './toolbar/sort';
import Pagination from './toolbar/pagination';
import Filter from './toolbar/filter';

configure({
  visitorManager: {
    defaultVisitors: []
  }
});

describe('builder', () => {
  it('throw error', () => {
    expect(() => <myType />).toThrow(/unsupported type/);
  });

  describe('string', () => {
    it('should work', () => {
      expect(<string />).toMatchObject({
        type: 'string',
        ui: 'input',
        packageName: '@canner/antd-string-input'
      });
    });
  });

  describe('boolean', () => {
    it('should work', () => {
      expect(<boolean />).toMatchObject({
        type: 'boolean',
        ui: 'switch'
      });
    });
  });

  describe('number', () => {
    it('should work', () => {
      expect(<number />).toMatchObject({
        type: 'number',
        ui: 'input'
      });
    });
  });

  describe('relation', () => {
    it('should work', () => {
      expect(<relation relation={{
        type: 'toOne',
        to: 'users'
      }} />).toMatchObject({
        type: 'relation',
        ui: 'singleSelect',
        relation: {
          type: 'toOne',
          to: 'users'
        }
      });
    });

    it('should have toolbar attrs', () => {
      expect(<relation relation={{
        type: 'toOne',
        to: 'users'
      }}>
        <toolbar>
          <pagination />
        </toolbar>
      </relation>).toMatchObject({
        type: 'relation',
        ui: 'singleSelect',
        relation: {
          type: 'toOne',
          to: 'users'
        },
        toolbar: {
          pagination: {
            type: 'pagination'
          }
        }
      });
    });
  });

  describe('array', () => {
    it('array of string without keyName', () => {
      const array = (<array>
        <string />
      </array>);
      expect(array).toMatchObject({
        type: 'array',
        ui: 'table',
        items: {
          type: 'string'
        }
      });
    });

    it('array of string with keyName', () => {
      const array = (<array>
        <string keyName="test"/>
      </array>);
      expect(array).toMatchObject({
        type: 'array',
        ui: 'table',
        items: {
          type: 'object',
          items: {
            test: {
              type: 'string',
              keyName: 'test'
            }
          }
        }
      });
    });

    it('auto object in array', () => {
      const array = (<array>
        <string keyName="test" />
        <string keyName="test2" />
      </array>);
      expect(array).toMatchObject({
        type: 'array',
        ui: 'table',
        items: {
          type: 'object',
          items: {
            test: {
              type: 'string',
              keyName: 'test'
            },
            test2: {
              type: 'string',
              keyName: 'test2'
            }
          }
        }
      });
    });

    it('manual object without keyName in array', () => {
      const array = (<array>
        <object>
          <string keyName="test" />
        </object>
      </array>);
      expect(array).toMatchObject({
        type: 'array',
        ui: 'table',
        items: {
          type: 'object',
          items: {
            test: {
              type: 'string',
              keyName: 'test'
            }
          }
        }
      });
    });

    it('manual object with keyName in array', () => {
      const array = (<array>
        <object keyName="obj">
          <string keyName="test" />
        </object>
      </array>);
      expect(array).toMatchObject({
        type: 'array',
        ui: 'table',
        items: {
          type: 'object',
          items: {
            obj: {
              keyName: 'obj',
              type: 'object',
              items: {
                test: {
                  type: 'string',
                  keyName: 'test'
                }
              }
            }
          }
        }
      });
    });
  });

  describe('object', () => {
    it('should work', () => {
      const object = <object>
        <string keyName="title"/>
      </object>
      expect(object).toMatchObject({
        type: 'object',
        ui: 'fieldset',
        items: {
          title: {
            type: 'string',
            keyName: 'title'
          }
        }
      });
    });
  });

  describe('toolbar', () => {
    it('should work', () => {
      expect(<array>
        <toolbar>
          <sort component={Sort} />
          <pagination component={Pagination} />
          <filter component={Filter} />
        </toolbar>
      </array>).toMatchObject({
        type: 'array',
        toolbar: {
          sort: {
            component: Sort,
            type: 'sort'
          },
          pagination: {
            component: Pagination,
            type: 'pagination'
          },
          filter: {
            component: Filter,
            type: 'filter'
          }
        }
      });
    });
  });

  describe('geoPoint', () => {
    it('should work', () => {
      expect(<geoPoint keyName="map"/>).toMatchObject({
        type: 'geoPoint',
        ui: 'default',
        keyName: 'map'
      });
    });
  });

  describe('dateTime', () => {
    it('should work', () => {
      expect(<dateTime keyName="date"/>).toMatchObject({
        type: 'dateTime',
        ui: 'dateTime',
        keyName: 'date'
      });
    });
  });

  describe('file', () => {
    it('should work', () => {
      expect(<file keyName="file"/>).toMatchObject({
        type: 'file',
        ui: 'file',
        keyName: 'file'
      });
    });
  });

  describe('image', () => {
    it('should work', () => {
      expect(<image keyName="image"/>).toMatchObject({
        type: 'image',
        ui: 'image',
        keyName: 'image'
      });
    });
  });

  describe('root', () => {
    it('should work', () => {
      const root = <root dict={{en: {title: 'title'}}}>
        <object keyName="info">
          <string keyName="name"/>
        </object>
      </root>
      expect(root.schema).toMatchObject({
        info: {
          type: 'object',
          ui: 'fieldset',
          items: {
            name: {
              keyName: 'name',
              ui: 'input',
              type: 'string'
            }
          }
        }
      });
      expect(root.dict).toMatchObject({en: {title: 'title'}});
    });
  });

  describe('children with map', () => {
    it('should work', () => {
      const schema = <root>
        {['info', 'info2'].map(name => <object key={name} keyName={name}>
          <string keyName={`${name}-string`}></string>
        </object>)}
      </root>;

      expect(schema.schema).toMatchObject({
        info: {
          type: 'object',
          items: {
            'info-string': {
              type: 'string',
              keyName: 'info-string'
            }
          }
        },
        info2: {
          type: 'object',
          items: {
            'info2-string': {
              type: 'string',
              keyName: 'info2-string'
            }
          }
        }
      });
    });
  });

  it('blog schema', () => {
    const blog = require('./blog');
    expect(blog).toMatchSnapshot();
  });

  it('function', () => {
    // eslint-disable-next-line
    const Variants = ({attributes, children}) => (
      <object {...attributes}>
        <string keyName="title" /> 
        {children}
      </object>
    )
    expect(<Variants keyName="variants">
      <string keyName="desc" />
    </Variants>).toMatchSnapshot();
  });

  describe('canner.def.js', () => {
    it('function builder', () => {
      const packageName = path.resolve(__dirname, 'fake-object-variants');
      // eslint-disable-next-line
      expect(<object keyName="variants" packageName={packageName} builder={require(`${packageName}/canner.def.js`)}>
        <string keyName="desc" />
      </object>).toMatchSnapshot();
    });

    it('require builder', () => {
      const packageName = path.resolve(__dirname, 'fake-object-variants');
      // eslint-disable-next-line
      expect(<object keyName="variants" packageName={packageName} builder={require(`${packageName}/canner.def.js`)}>
        <string keyName="desc" />
      </object>).toMatchSnapshot();
    });
  })

  it('map chilren', () => {
    const list = ['a', 'b', 'c'];
    expect(<object keyName="variants">
      <string keyName="desc" />
      {list.map(name => <string key={name} keyName={name}/>)}
    </object>).toMatchSnapshot();
  });

  it('null', () => {
    expect(<object keyName="info">
      {null}
    </object>).toMatchSnapshot();
  });

  it('should throw error, if cannerDataType is invalid', () => {
    expect(() => <object keyName="info" type="error-type" />).toThrow('there is no type error-type');
  });
});