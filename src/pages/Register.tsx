import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { registerEmployee } from "../api/registerApi";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await registerEmployee(values);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch {
      message.error("Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Đăng ký nhân viên mới</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: "Nhập họ tên" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Nhập tên đăng nhập" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Nhập mật khẩu" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Nhập email hợp lệ" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="department" label="Phòng ban" rules={[{ required: true, message: "Chọn phòng ban" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="position" label="Vị trí" rules={[{ required: true, message: "Nhập vị trí" }]}>
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