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
import { Department } from "../types/department";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "../api/departmentApi";
import { createActivityLog } from "../api/activityLogApi";
import { Account } from "../types/account";
import { getAllEmployees } from "../api/employeeApi";
import { AuthContext } from "../contexts/AuthContexts";
import { useNavigate } from "react-router-dom";

const Departments: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Account[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/requests");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const filteredDepartments = departments.filter((department) => {
    const searchLower = searchText.toLowerCase();
    return (
      department.name.toLowerCase().includes(searchLower) ||
      (department.description &&
        department.description.toLowerCase().includes(searchLower))
    );
  });

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch {
      message.error("Không thể tải danh sách nhân viên");
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      message.error("Không thể tải danh sách phòng ban");
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Department) => {
    setEditingDepartment(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const checkDuplicateName = (name: string, currentId?: string) => {
    return departments.some(
      (dept) =>
        dept.name.toLowerCase() === name.toLowerCase().trim() &&
        dept.id !== currentId
    );
  };

  const handleDelete = async (id: string) => {
    try {
      const isConflict = employees.some((emp) => emp.departmentId === id);

      if (isConflict) {
        message.error("Có nhân viên đang làm việc trong phòng ban này");
        return;
      }
      console.log(isConflict);
      const department = departments.find((dep) => dep.id === id);
      await deleteDepartment(id);
      message.success("Xóa phòng ban thành công");
      if (department) {
        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Delete",
          details: `Xóa phòng ban ${department.name}`,
        });
      }
      await fetchDepartments();
    } catch {
      message.error("Xóa phòng ban thất bại");
    }
  };

  const onFinish = async (values: Omit<Department, "id">) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, {
          ...values,
          id: editingDepartment.id,
        });
        message.success("Cập nhật phòng ban thành công");
        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Update",
          details: `Cập nhật phòng ban ${values.name}`,
        });
      } else {
        const newId = crypto.randomUUID();
        await addDepartment({ ...values, id: newId });
        message.success("Thêm phòng ban thành công");
        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Add",
          details: `Thêm phòng ban mới ${values.name}`,
        });
      }
      setModalVisible(false);
      fetchDepartments();
    } catch {
      message.error("Lưu dữ liệu thất bại");
    }
  };

  const columns = [
    { title: "Tên phòng ban", dataIndex: "name" },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Hành động",
      render: (_: any, record: Department) => (
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
          Danh sách phòng ban
        </Typography.Title>
        <Space>
          <Input.Search
            placeholder="Tìm kiếm phòng ban..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleAdd}>
            + Thêm phòng ban
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={filteredDepartments} rowKey="id" />

      <Modal
        title={editingDepartment ? "Cập nhật phòng ban" : "Thêm phòng ban"}
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
            label="Tên phòng ban"
            rules={[
              { required: true, message: "Vui lòng nhập tên phòng ban" },
              {
                max: 255,
                message: "Tên phòng ban không được vượt quá 255 ký tự",
              },
              {
                validator: (_, value) => {
                  if (checkDuplicateName(value, editingDepartment?.id)) {
                    return Promise.reject(
                      new Error("Tên phòng ban đã tồn tại")
                    );
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
              {editingDepartment ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments;
