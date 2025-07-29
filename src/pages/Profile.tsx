import {
  Card,
  Descriptions,
  Spin,
  Typography,
  message,
  Avatar,
} from "antd";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  TagOutlined,
  KeyOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [department, setDepartment] = useState<any>(null);
  const [roleName, setRoleName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1. Lấy account
        const accRes = await fetch(`http://localhost:3001/accounts?id=${user.id}`);
        const accData = await accRes.json();
        const accountInfo = accData[0];
        setAccount(accountInfo);

        // 2. Lấy employee theo account.employeeId
        const empRes = await fetch(`http://localhost:3001/employees?id=${accountInfo.employeeId}`);
        const empData = await empRes.json();
        const employeeInfo = empData[0];
        setEmployee(employeeInfo);

        // 3. Lấy phòng ban
        const deptRes = await fetch(`http://localhost:3001/departments?id=${employeeInfo.departmentId}`);
        const deptData = await deptRes.json();
        setDepartment(deptData[0]);

        // 4. Lấy role name
        const roleRes = await fetch(`http://localhost:3001/roles?id=${accountInfo.roleId}`);
        const roleData = await roleRes.json();
        setRoleName(roleData[0]?.name || "Không rõ");

      } catch (err) {
        message.error("Lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
      console.log("user.id:", user?.id);
      console.log("account:", account);
      console.log("employee:", employee);
      console.log("department:", department);
      
    };

    fetchData();
  }, [user]);

  if (!user || !account || !employee || loading)
    return (
      <Spin
        style={{ display: "block", margin: "100px auto" }}
        size="large"
      />
    );

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
          {employee.fullName}
        </Title>
        <Text type="secondary">{roleName}</Text>
      </div>

      <Descriptions
        bordered
        column={1}
        labelStyle={{ fontWeight: 600, backgroundColor: "#fafafa" }}
        contentStyle={{ backgroundColor: "#ffffff" }}
      >
        <Descriptions.Item label={<><IdcardOutlined /> ID</>}>
          {account.id}
        </Descriptions.Item>
        <Descriptions.Item label={<><KeyOutlined /> Tên đăng nhập</>}>
          {account.username}
        </Descriptions.Item>
        <Descriptions.Item label={<><MailOutlined /> Email</>}>
          {employee.email}
        </Descriptions.Item>
        <Descriptions.Item label={<><TagOutlined /> Chức vụ</>}>
          {employee.position}
        </Descriptions.Item>
        <Descriptions.Item label={<><AppstoreOutlined /> Phòng ban</>}>
          {department?.name || "Không rõ"}
        </Descriptions.Item>
        <Descriptions.Item label={<><TagOutlined /> Vai trò</>}>
          {roleName}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default Profile;
