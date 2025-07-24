import { Card, Descriptions, Spin, Typography, message, Avatar } from "antd";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  TagOutlined,
  KeyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    setProfile(user);

    setLoading(true);
    fetch("http://localhost:3001/accounts?id=" + user.id)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data[0]);
      })
      .catch(() => {
        message.error("Không thể tải thông tin cá nhân");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || !profile || loading) return <Spin style={{ display: "block", margin: "100px auto" }} size="large" />;

  return (
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
        <Text type="secondary">
          {profile.role === "admin" ? "Quản trị viên" : "Người dùng"}
        </Text>
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
        <Descriptions.Item label={<><TagOutlined /> Vai trò</>}>
          {profile.role}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default Profile;
