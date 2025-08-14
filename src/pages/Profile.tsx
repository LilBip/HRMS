import {
  Card,
  Descriptions,
  Spin,
  Typography,
  message,
  Avatar,
  Modal,
  Form,
  Input,
  Button,
} from "antd";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  TagOutlined,
  KeyOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const fetchData = async () => {
      try {
        const [accountRes, deptRes, roleRes] = await Promise.all([
          fetch(`http://localhost:3001/accounts?id=${user.id}`),
          fetch(`http://localhost:3001/departments`),
          fetch(`http://localhost:3001/position`),
        ]);

        const [accountData, deptData, roleData] = await Promise.all([
          accountRes.json(),
          deptRes.json(),
          roleRes.json(),
        ]);

        setProfile(accountData[0]);
        setDepartments(deptData);
        setRoles(roleData);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const values = await form.validateFields();
      const { email, password } = values;

      const updatedProfile = {
        ...profile,
        email,
        ...(password ? { password } : {}),
      };

      const res = await fetch(`http://localhost:3001/accounts/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      setProfile(updatedProfile);
      message.success("Cập nhật thông tin thành công");
      setIsModalOpen(false);
    } catch (err) {
      message.error("Cập nhật thất bại");
    }
  };

  if (!user || !profile || loading)
    return (
      <Spin style={{ display: "block", margin: "100px auto" }} size="large" />
    );

  const departmentName =
    departments.find((d) => d.id === profile.departmentId)?.name || "Không rõ";

  const roleName =
    roles.find((r) => r.id === profile.positionId)?.name ||
    (profile.role === "admin" ? "Quản trị viên" : "Nhân viên");

  return (
    <>
      <Card
        style={{
          maxWidth: 600,
          margin: "40px auto",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          background: "linear-gradient(to right, #ffffff, #f9f9f9)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Avatar
            size={96}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff", marginBottom: 16 }}
          />
          <Title level={3} style={{ marginBottom: 0 }}>
            {profile.fullName}
          </Title>
          <Text type="secondary">{roleName}</Text>
        </div>

        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: 600, backgroundColor: "#fafafa" }}
          contentStyle={{ backgroundColor: "#ffffff" }}
        >
          <Descriptions.Item label={<><IdcardOutlined /> ID</>}>
            {profile.id}
          </Descriptions.Item>
          <Descriptions.Item label={<><KeyOutlined /> Tên đăng nhập</>}>
            {profile.username}
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {profile.email}
          </Descriptions.Item>
          <Descriptions.Item label={<><AppstoreOutlined /> Phòng ban</>}>
            {departmentName}
          </Descriptions.Item>
          <Descriptions.Item label={<><TagOutlined /> Vai trò</>}>
            {roleName}
          </Descriptions.Item>
          
        </Descriptions>

        {/* Nút chỉnh sửa được đặt ở đây */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button
            type="primary"
            onClick={() => {
              form.setFieldsValue({ email: profile.email });
              setIsModalOpen(true);
            }}
          >
            Chỉnh sửa thông tin
          </Button>
        </div>
      </Card>

      <Modal
        title="Chỉnh sửa thông tin"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleUpdateProfile}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu mới">
            <Input.Password placeholder="Để trống nếu không đổi" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !getFieldValue("password") ||
                    getFieldValue("password") === value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Profile;
