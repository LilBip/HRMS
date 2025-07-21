import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import EmployeeStats from '../components/EmployeeStats';
import DepartmentChart from '../components/DepartmentChart';
import RecentActivities from '../components/RecentActivities';

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '0 16px' }}>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>
        Bảng điều khiển
      </Typography.Title>

      {/* Thống kê nhân viên */}
      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <EmployeeStats />
      </div>

      {/* Biểu đồ và hoạt động gần đây */}
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Thống kê theo phòng ban"
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              marginBottom: 24,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <DepartmentChart />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Hoạt động gần đây"
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
            bodyStyle={{ padding: 16 }}
          >
            <RecentActivities />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
