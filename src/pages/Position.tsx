import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
} from "antd";
import {
  getPositions,
  addPosition,
  updatePosition,
  deletePosition,
} from "../api/positionApi";
import { createActivityLog } from "../api/activityLogApi";
import {
  UserOutlined,
  CrownOutlined,
  SolutionOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Account } from "../types/account";
import { getAllEmployees } from "../api/employeeApi";
import { AuthContext } from "../contexts/AuthContexts";
import { useNavigate } from "react-router-dom";

interface Position {
  id: string;
  name: string;
  description: string;
}

const Positions: React.FC = () => {
  const { user } = useContext(AuthContext);

  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Account[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/requests");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchPositions();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch {
      message.error("Không thể tải danh sách nhân viên");
    }
  };

  const fetchPositions = async () => {
    try {
      const data = await getPositions();
      setPositions(data);
    } catch {
      message.error("Không thể tải danh sách chức vụ");
    }
  };

  const handleAdd = () => {
    setEditingPosition(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Position) => {
    setEditingPosition(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const isConflict = employees.some((emp) => emp.positionId === id);
      console.log(isConflict);
      if (isConflict) {
        message.error("Có nhân viên đang giữ chức vụ này");
        return;
      }

      const position = positions.find((pos) => pos.id === id);
      await deletePosition(id);
      message.success("Xóa chức vụ thành công");
      if (position) {
        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Delete",
          details: `Xóa chức vụ ${position.name}`,
        });
      }
      await fetchPositions();
    } catch {
      message.error("Xóa chức vụ thất bại");
    }
  };

  const onFinish = async (values: Position) => {
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, {
          ...values,
          id: editingPosition.id,
        });
        message.success("Cập nhật chức vụ thành công");
        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Update",
          details: `Cập nhật chức vụ ${values.name}`,
        });
      } else {
        await addPosition(values);
        message.success("Thêm chức vụ thành công");
        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Add",
          details: `Thêm chức vụ mới ${values.name}`,
        });
      }
      setModalVisible(false);
      fetchPositions();
    } catch {
      message.error("Lưu dữ liệu thất bại");
    }
  };

  const checkDuplicateName = (name: string, currentId?: string) => {
    return positions.some(
      (pos) =>
        pos.name.toLowerCase() === name.toLowerCase().trim() &&
        pos.id !== currentId
    );
  };

  const getPositionIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "director":
        return <CrownOutlined style={{ color: "#ffc53d" }} />;
      case "intern":
        return <SolutionOutlined style={{ color: "#69b1ff" }} />;
      case "developer":
        return <UserOutlined style={{ color: "#95de64" }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const columns = [
    {
      title: "Tên chức vụ",
      dataIndex: "name",
      render: (name: string) => (
        <span>
          {getPositionIcon(name)} {name}
        </span>
      ),
    },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Hành động",
      render: (_: any, record: Position) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="link">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Danh sách chức vụ
        </Typography.Title>
        <Button
          type="primary"
          onClick={handleAdd}
          style={{
            boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)",
            height: 40,
            padding: "0 16px",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          + Thêm chức vụ
        </Button>
      </div>
      <Table columns={columns} dataSource={positions} rowKey="id" />

      <Modal
        title={editingPosition ? "Cập nhật chức vụ" : "Thêm chức vụ"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={600}
        footer={null}
        centered
        style={{ top: 40 }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Tên chức vụ"
            rules={[
              { required: true, message: "Vui lòng nhập tên chức vụ" },
              {
                max: 255,
                message: "Tên chức vụ không được vượt quá 255 ký tự",
              },
              {
                validator: (_, value) => {
                  if (checkDuplicateName(value, editingPosition?.id)) {
                    return Promise.reject(new Error("Tên chức vụ đã tồn tại"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input maxLength={255} showCount />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 255, message: "Mô tả không được vượt quá 255 ký tự" },
            ]}
          >
            <Input.TextArea rows={4} maxLength={255} showCount />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button type="primary" htmlType="submit">
              {editingPosition ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Positions;
