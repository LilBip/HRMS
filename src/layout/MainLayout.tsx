import React from 'react';
import { Layout, Menu, Button, Typography, Popconfirm, message, } from 'antd';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    message.success('Đã đăng xuất');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar trái */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#001529',
          }}
        >
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            HR Manager
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/',
              icon: <DashboardOutlined />,
              label: <Link to="/">Dashboard</Link>,
            },
            {
              key: '/employees',
              icon: <TeamOutlined />,
              label: <Link to="/employees">Nhân viên</Link>,
            },
            {
              key: '/departments',
              icon: <ApartmentOutlined />,
              label: <Link to="/departments">Phòng ban</Link>,
            },
            {
              key: '/requests',
              icon: <FileTextOutlined />,
              label: <Link to="/requests">Đơn từ</Link>,
            },
            {
              key: '/activity-log',
              icon: <ClockCircleOutlined />,
              label: <Link to="/activity-log">Nhật ký hoạt động</Link>,
            },
          ]}
        />
      </Sider>

      {/* Phần nội dung bên phải */}
      <Layout>
        {/* Header ngang với nút logout */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Popconfirm
            title="Bạn có chắc chắn muốn đăng xuất?"
            onConfirm={handleLogout}
            okText="Đăng xuất"
            cancelText="Hủy"
          >
            <Button type="primary" icon={<LogoutOutlined />} danger>
              Đăng xuất
            </Button>
          </Popconfirm>
        </Header>

        {/* Nội dung */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
          © {new Date().getFullYear()} Hệ thống quản lý nhân sự
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
