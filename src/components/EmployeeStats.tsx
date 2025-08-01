import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic } from "antd";
import { getAllEmployees } from "../api/dashboardApi";
import { getDepartments } from "../api/departmentApi";
import { Account } from "../types/account";
import { Department } from "../types/department";
import { Position } from "../types/position";
import { getPositions } from "../api/positionApi";

const EmployeeStats: React.FC = () => {
  const [employees, setEmployees] = useState<Account[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    getAllEmployees().then(setEmployees);
    getPositions().then(setPositions);
    getDepartments().then((res) => {
      if (Array.isArray(res)) {
        setDepartments(res);
      } else {
        setDepartments([]);
      }
    });
  }, []);

  const total = employees.length;
  const probation = employees.filter(
    (emp) => emp.accountStatus === "Đang thử việc"
  ).length;
  const working = employees.filter(
    (emp) => emp.accountStatus === "Đang làm việc"
  ).length;
  const onLeave = employees.filter(
    (emp) => emp.accountStatus === "Đang nghỉ phép"
  ).length;
  const department = departments.length;
  const totalPosition = positions.length;

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
          <Statistic title="Tổng số chức vụ" value={totalPosition} />
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
