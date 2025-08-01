import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Alert, Card } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { AuthContext } from "../contexts/AuthContexts";
import { login, LoginCredentials } from "../api/authApi";

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFinish = async (values: LoginCredentials) => {
    setError("");
    setLoading(true);
    try {
      const account = await login(values);
      if (account) {
        setUser({
          token: account.id,
          id: account.id,
          username: account.username,
          fullName: account.fullName,
          role: account.role,
          email: account.email,
        });
        navigate("/");
      }
    } catch (err) {
      setError("Tên đăng nhập sai hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 400, borderRadius: 12 }} bordered>
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          Đăng nhập
        </Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ username: "", password: "" }}
        >
          <Form.Item
            label="Tên đăng nhập:"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập" },
              {
                pattern: /^[a-zA-Z0-9_]{4,20}$/,
                message:
                  "Tên đăng nhập chỉ chứa chữ, số, gạch dưới (4–20 ký tự)",
              },
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập..." />
          </Form.Item>

          <Form.Item
            label="Mật khẩu:"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu..."
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                fontWeight: "bold",
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="link"
              block
              onClick={() => navigate("/register")}
              style={{ padding: 0 }}
            >
              Đăng ký tài khoản mới
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
