import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Modal,
  Descriptions,
} from 'antd';
import { getAllEmployees } from '../api/dashboardApi';
import { Employee } from '../types/employee';
import { getDepartments } from '../api/departmentApi';
import { Department } from '../types/department';
import { addActivityLog } from '../api/activityLogApi';

const { Option } = Select;

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (error) {
      message.error('Không thể tải danh sách nhân viên');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      message.error('Không thể tải danh sách phòng ban');
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: Employee) => {
    setEditingEmployee(record);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const employee = employees.find(emp => emp.id === id);
      await fetch(`http://localhost:3001/employees/${id}`, {
        method: 'DELETE',
      });
      message.success('Xóa nhân viên thành công');
      if (employee) {
        await addActivityLog({
          id: crypto.randomUUID(),
          name: employee.name,
          activityType: 'Delete',
          time: new Date().toISOString(),
        });
      }
      fetchEmployees();
    } catch {
      message.error('Xóa nhân viên thất bại');
    }
  };

  const handleViewDetail = (record: Employee) => {
    setSelectedEmployee(record);
    setDetailVisible(true);
  };

  const onFinish = async (values: Employee) => {
    try {
      if (editingEmployee) {
        await fetch(`http://localhost:3001/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('Cập nhật nhân viên thành công');
        await addActivityLog({
          id: crypto.randomUUID(),
          name: values.name,
          activityType: 'Edit',
          time: new Date().toISOString(),
        });
      } else {
        const newId = crypto.randomUUID();
        await fetch('http://localhost:3001/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, id: newId }),
        });
        message.success('Thêm nhân viên thành công');
        await addActivityLog({
          id: newId,
          name: values.name,
          activityType: 'Add',
          time: new Date().toISOString(),
        });
      }
      setDrawerVisible(false);
      fetchEmployees();
    } catch {
      message.error('Lưu dữ liệu thất bại');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchText.toLowerCase());

    const matchesDepartment = !departmentFilter || emp.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const columns = [
    { title: 'Họ tên', dataIndex: 'name' },
    { title: 'Phòng ban', dataIndex: 'department' },
    { title: 'Vị trí', dataIndex: 'position' },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Ngày bắt đầu', dataIndex: 'startDate' },
    {
      title: 'Hành động',
      render: (_: any, record: Employee) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record)}>Xem</Button>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button danger type="link">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={handleAdd}>Thêm nhân viên</Button>
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
          {departments.map(dep => (
            <Option key={dep.name} value={dep.name}>{dep.name}</Option>
          ))}
        </Select>
      </Space>

      <Table columns={columns} dataSource={filteredEmployees} rowKey="id" />

      <Drawer
        title={editingEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Phòng ban" rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}>
            <Select placeholder="Chọn phòng ban">
              {departments.map(dep => (
                <Option key={dep.name} value={dep.name}>{dep.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="position" label="Vị trí" rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select>
              <Option value="Đang thử việc">Đang thử việc</Option>
              <Option value="Đang làm việc">Đang làm việc</Option>
              <Option value="Đang nghỉ phép">Đang nghỉ phép</Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng nhập ngày bắt đầu' }]}>
            <Input placeholder="yyyy-mm-dd" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

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
