
import * as React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { shallow } from 'enzyme';
import { Layout, Menu } from 'antd';

import Sidebar, { LogoContainer } from '../../src/components/Sidebar';

Enzyme.configure({ adapter: new Adapter() });


const sidebarConfig = {
  menuConfig: [{
    title: 'My Info',
    pathname: '/info',
  }, {
    title: 'Posts',
    pathname: '/posts',
  }, {
    title: 'Authors',
    items: [{
      title: 'Authors2',
      pathname: '/authors',
    }],
  }],
};


const renderComponent = props => shallow(
  <Sidebar
    goTo={({
      pathname, operator, payload, where, sort, pagination,
    }) => ({
      pathname, operator, payload, where, sort, pagination,
    })}
    reset={jest.fn()}
    routes={['1', '2']}
    dataChanged={{}}
    schema={{ key: {} }}
    {...sidebarConfig}
    {...props}
  />,
);


describe('<Sidebar>', () => {
  it('should render a Layout.Sider', () => {
    const wrapper = renderComponent();
    expect(wrapper.find(Layout.Sider).length).toBe(1);
  });

  it('should render a Menu', () => {
    const wrapper = renderComponent();
    expect(wrapper.find(Menu).length).toBe(1);
  });

  it('should render three Menu.Item', () => {
    const wrapper = renderComponent();
    expect(wrapper.find(Menu.Item).length).toBe(3);
  });

  it('should render one Menu.SubMenu', () => {
    const wrapper = renderComponent();
    expect(wrapper.find(Menu.SubMenu).length).toBe(1);
  });

  it('should render null', () => {
    const wrapper = renderComponent({ menuConfig: false });
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('should call goTo', () => {
    const goTo = jest.fn();
    const wrapper = renderComponent({ goTo });
    const menuItem = { key: 'key', params: { payload: {}, where: { a: '>1' } } };
    wrapper.find(Menu).simulate('click', menuItem);
    expect(goTo).toBeCalledWith({ pathname: menuItem.key, ...menuItem.params });
  });
});


describe('render logo', () => {
  test('logo can be string', () => {
    const wrapper = renderComponent({ logo: 'http://www.img.jpg' });
    expect(wrapper.find(LogoContainer).length).toBe(1);
  });

  test('logo can be object', () => {
    const wrapper = renderComponent({ logo: { src: 'http://www.img.jpg' } });
    expect(wrapper.find(LogoContainer).length).toBe(1);
  });

  test('logo can be react element', () => {
    const Logo = <div className="logo">123</div>;
    const wrapper = renderComponent({ logo: Logo });

    expect(wrapper.find('.logo').length).toBe(1);
  });
});
