import React, { useEffect, useState } from "react";
import { List, Avatar, Typography } from "antd";
import { getAllEmployees } from "../api/dashboardApi";
import { Employee } from "../types/employee";

const RecentActivities: React.FC = () => {
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);

  useEffect(() => {
    getAllEmployees().then((employees: any[]) => {
      const sorted = [...employees].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      setRecentEmployees(sorted.slice(0, 5));
    });
  }, []);

  return (
    <List
      header={
        <Typography.Title level={5}>Nhân viên mới gia nhập</Typography.Title>
      }
      itemLayout="horizontal"
      dataSource={recentEmployees}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar>{item.fullName.charAt(0)}</Avatar>}
            title={item.fullName}
            description={`Gia nhập ${item.department} - ${new Date(
              item.startDate
            ).toLocaleDateString()}`}
          />
        </List.Item>
      )}
    />
  );
};

export default RecentActivities;
