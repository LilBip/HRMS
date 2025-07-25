import React from "react";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Popconfirm,
  message,
  Spin,
} from "antd";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined ,
  UserOutlined
} from "@ant-design/icons";

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất");
    navigate("/login");
  };
  const getMenuItems = () => {
    const baseMenuItems = [
      {
        key: "/",
        icon: <DashboardOutlined />,
        label: <Link to="/">Dashboard</Link>,
      },
      {
        key: "/requests",
        icon: <FileTextOutlined />,
        label: <Link to="/requests">Đơn từ</Link>,
      },
      {
        key: "/activity-log",
        icon: <ClockCircleOutlined />,
        label: <Link to="/activity-log">Nhật ký hoạt động</Link>,
      },
    ];

    if (user?.role === "user") {
      return [
        ...baseMenuItems,
        {
          key: "/attendance",
          icon: <ClockCircleOutlined />,
          label: <Link to="/attendance">Chấm công</Link>,
        },
      ];
    }

    if (user?.role === "admin") {
      return [
        ...baseMenuItems,
        {
          key: "employee-management",
          icon: <TeamOutlined />,
          label: "Quản lý nhân viên",
          children: [
            {
              key: "/employees",
              icon: <UserOutlined />, 
              label: <Link to="/employees">Danh sách nhân viên</Link>,
            },
            {
              key: "/attendance",
              icon: <CalendarOutlined />,
              label: <Link to="/attendance">Chấm công</Link>,
            },
          ],
        },
        {
          key: "/departments",
          icon: <ApartmentOutlined />,
          label: <Link to="/departments">Phòng ban</Link>,
        },
      ];
    }

    return baseMenuItems;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#001529",
          }}
        >
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            HR Manager
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Link
            to="/profile"
            style={{
              fontWeight: "bold",
              color: "inherit",
              textDecoration: "underline",
            }}
          >
            {user?.fullName} ({user?.role === "admin" ? "Admin" : "User"})
          </Link>
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

        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)",
            minHeight: 360,
          }}
        >
          <Spin spinning={loading} tip="Đang tải...">
            <Outlet />
          </Spin>
        </Content>

        <Footer style={{ textAlign: "center", background: "#f0f2f5" }}>
          © {new Date().getFullYear()} Hệ thống quản lý nhân sự
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
