import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { registerEmployee } from "../api/registerApi";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (values.password !== values.confirmPassword) {
        message.error("Mật khẩu xác nhận không khớp!");
        return;
      }
      await registerEmployee(values);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      message.error("Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 500, margin: "40px auto" }}>
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Tạo tài khoản nhân viên
      </Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên" },
            {
              pattern: /^[\p{L}\s]+$/u,
              message: "Họ và tên chỉ được chứa chữ cái và khoảng trắng",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[
            { required: true, message: "Vui lòng nhập tên đăng nhập" },
            {
              pattern: /^[a-zA-Z0-9_]{4,20}$/,
              message: "Tên đăng nhập chỉ chứa chữ, số, gạch dưới (4–20 ký tự)",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            {
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^])[A-Za-z\d@$!%*#?&^]{6,}$/,
              message:
                "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

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

        <Button type="primary" htmlType="submit" loading={loading} block>
          Đăng ký
        </Button>
      </Form>
    </Card>
  );
};

export default Register;
