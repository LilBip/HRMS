import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Modal,
  Descriptions,
  DatePicker,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { getAllEmployees } from "../api/dashboardApi";
import { getDepartments } from "../api/departmentApi";
import { createActivityLog } from "../api/activityLogApi";
import { Employee } from "../types/employee";
import { Department } from "../types/department";
import { getPositions } from "../api/positionApi";
import { Position } from "../types/position";

const { Option } = Select;
const EMPLOYEE_API = "http://localhost:3001/employees";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [form] = Form.useForm();

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, []);

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

  const fetchPositions = async () => {
    try {
      const data = await getPositions();
      setPositions(data);
    } catch {
      message.error("Không thể tải danh sách chức vụ");
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: Employee) => {
    setEditingEmployee(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
    });
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const employee = employees.find((emp) => emp.id === id);
      await fetch(`${EMPLOYEE_API}/${id}`, { method: "DELETE" });

      if (employee) {
        await createActivityLog({
          name: employee.name,
          activityType: "Delete",
          details: `Xóa nhân viên ${employee.name}`,
        });
      }

      message.success("Xóa nhân viên thành công");
      fetchEmployees();
    } catch {
      message.error("Xóa nhân viên thất bại");
    }
  };

  const handleViewDetail = (record: Employee) => {
    setSelectedEmployee(record);
    setDetailVisible(true);
  };

  const handleSubmit = async (values: any) => {
    const formatted = {
      ...values,
      startDate: values.startDate.format("YYYY-MM-DD"),
    };

    try {
      if (editingEmployee) {
        await fetch(`${EMPLOYEE_API}/${editingEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formatted),
        });

        await createActivityLog({
          name: formatted.name,
          activityType: "Update",
          details: `Cập nhật thông tin nhân viên ${formatted.name}`,
        });

        message.success("Cập nhật nhân viên thành công");
      } else {
        const newEmployee = { ...formatted, id: crypto.randomUUID() };
        await fetch(EMPLOYEE_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEmployee),
        });

        await createActivityLog({
          name: formatted.name,
          activityType: "Add",
          details: `Thêm nhân viên mới ${formatted.name}`,
        });

        message.success("Thêm nhân viên thành công");
      }

      setDrawerVisible(false);
      fetchEmployees();
    } catch {
      message.error("Lưu dữ liệu thất bại");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchText =
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchText.toLowerCase());

    const matchDepartment = !departmentFilter || emp.department === departmentFilter;

    return matchText && matchDepartment;
  });

  const columns = [
    { title: "Họ tên", dataIndex: "name" },
    { title: "Phòng ban", dataIndex: "department" },
    { title: "Vị trí", dataIndex: "position" },
    { title: "Trạng thái", dataIndex: "status" },
    { title: "Ngày bắt đầu", dataIndex: "startDate" },
    {
      title: "Hành động",
      render: (_: any, record: Employee) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record)}>
            Xem
          </Button>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
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
      {/* Bộ lọc và tìm kiếm */}
      <Typography.Title level={3} style={{ marginBottom: 10 }}>
        Danh sách nhân viên
      </Typography.Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={handleAdd}>
          Thêm nhân viên
        </Button>
        <Input.Search
          placeholder="Tìm theo tên, phòng ban, vị trí..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Lọc theo phòng ban"
          allowClear
          onChange={(value) => setDepartmentFilter(value || null)}
          style={{ width: 200 }}
        >
          {departments.map((dep) => (
            <Option key={dep.name} value={dep.name}>
              {dep.name}
            </Option>
          ))}
        </Select>
      </Space>

      {/* Danh sách nhân viên */}
      <Table columns={columns} dataSource={filteredEmployees} rowKey="id" />

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}
        open={drawerVisible}
        onCancel={() => setDrawerVisible(false)}
        width={700}
        centered
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Phòng ban"
            rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
          >
            <Select placeholder="Chọn phòng ban">
              {departments.map((dep) => (
                <Option key={dep.name} value={dep.name}>
                  {dep.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="position"
            label="Vị trí"
            rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
          >
            <Select placeholder="Chọn vị trí">
              {positions.map((pos) => (
                <Option key={pos.name} value={pos.name}>
                  {pos.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="Đang thử việc">Đang thử việc</Option>
              <Option value="Đang làm việc">Đang làm việc</Option>
              <Option value="Đang nghỉ phép">Đang nghỉ phép</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button type="primary" htmlType="submit">
              {editingEmployee ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chi tiết */}
      <Modal
        title="Chi tiết nhân viên"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>Đóng</Button>}
      >
        {selectedEmployee && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Họ tên">{selectedEmployee.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedEmployee.email}</Descriptions.Item>
            <Descriptions.Item label="Phòng ban">{selectedEmployee.department}</Descriptions.Item>
            <Descriptions.Item label="Vị trí">{selectedEmployee.position}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{selectedEmployee.status}</Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">{selectedEmployee.startDate}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
