import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { getAllEmployees } from '../api/dashboardApi';
import { getDepartments } from '../api/departmentApi';
import { Employee } from '../types/employee';
import { Department } from '../types/department';

const EmployeeStats: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
    getDepartments().then((res) => {
      if (Array.isArray(res)) {
        setDepartments(res);
      } else {
        setDepartments([]);
      }
    });
  }, []);

  const total = employees.length;
  const probation = employees.filter(emp => emp.status === 'Đang thử việc').length;
  const working = employees.filter(emp => emp.status === 'Đang làm việc').length;
  const onLeave = employees.filter(emp => emp.status === 'Đang nghỉ phép').length;
  const department = departments.length;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="Tổng nhân viên" value={total} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Tổng số phòng ban" value={department} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Đang thử việc" value={probation} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Đang làm việc" value={working} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Đang nghỉ phép" value={onLeave} />
        </Card>
      </Col>
    </Row>
  );
};

export default EmployeeStats;
