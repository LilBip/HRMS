import React from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = (values: { username: string; password: string }) => {
    const { username, password } = values;

    // Giả lập đăng nhập
    if (username === 'Admin' && password === '1') {
      login(); // Gọi hàm login từ context
      message.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      message.error('Tài khoản hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400, padding: 24, borderRadius: 8 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Đăng nhập
        </Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input/>
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;