import Layout from './Layout.vue';
import Header from './Header.vue';
import Sider from './Sider.vue';
import Content from './Content.vue';
import Footer from './Footer.vue';

// Add a property to Layout for convenient access to sub-components
(Layout as any).Header = Header;
(Layout as any).Sider = Sider;
(Layout as any).Content = Content;
(Layout as any).Footer = Footer;

export {
  Layout,
  Header as LayoutHeader,
  Sider as LayoutSider,
  Content as LayoutContent,
  Footer as LayoutFooter,
};

export default Layout;
