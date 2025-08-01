import React, { useEffect, useState } from "react";
import { Table, Typography, Card, Spin, message } from "antd";
import { getActivityLogs } from "../api/activityLogApi";
import { ActivityLog } from "../types/activityLog";

const { Title } = Typography;

const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getActivityLogs();
        setLogs(data);
      } catch (error) {
        message.error("Lỗi khi tải lịch sử hoạt động");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hoạt động",
      dataIndex: "activityType",
      key: "activityType",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
  ];

  return (
    <Card style={{ margin: 24 }}>
      <Title level={3}>Lịch sử hoạt động</Title>
      {loading ? (
        <Spin tip="Đang tải dữ liệu..." />
      ) : (
        <Table
          dataSource={[...logs].reverse()}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      )}
    </Card>
  );
};

export default ActivityLogPage;
