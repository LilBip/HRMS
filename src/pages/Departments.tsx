import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from 'antd';
import { Department } from '../types/department';
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '../api/departmentApi';
import { addActivityLog } from '../api/activityLogApi';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      message.error('Không thể tải danh sách phòng ban');
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: Department) => {
    setEditingDepartment(record);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const department = departments.find(dep => dep.id === id);
      await deleteDepartment(id);
      message.success('Xóa phòng ban thành công');
      if (department) {
        await addActivityLog({
          id: crypto.randomUUID(),
          name: department.name,
          activityType: 'Delete',
          time: new Date().toISOString(),
        });
      }
      fetchDepartments();
    } catch {
      message.error('Xóa phòng ban thất bại');
    }
  };

  const onFinish = async (values: Omit<Department, 'id'>) => {
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, { ...values, id: editingDepartment.id });
        message.success('Cập nhật phòng ban thành công');
        await addActivityLog({
          id: crypto.randomUUID(),
          name: values.name,
          activityType: 'Edit',
          time: new Date().toISOString(),
        });
      } else {
        const newId = crypto.randomUUID();
        await addDepartment({ ...values, id: newId });
        message.success('Thêm phòng ban thành công');
        await addActivityLog({
          id: newId,
          name: values.name,
          activityType: 'Add',
          time: new Date().toISOString(),
        });
      }
      setDrawerVisible(false);
      fetchDepartments();
    } catch {
      message.error('Lưu dữ liệu thất bại');
    }
  };

  const columns = [
    { title: 'Tên phòng ban', dataIndex: 'name' },
    { title: 'Mô tả', dataIndex: 'description' },
    {
      title: 'Hành động',
      render: (_: any, record: Department) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button danger type="link">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>Thêm phòng ban</Button>
      </Space>
      <Table columns={columns} dataSource={departments} rowKey="id" />

      <Drawer
        title={editingDepartment ? 'Cập nhật phòng ban' : 'Thêm phòng ban'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item name="name" label="Tên phòng ban" rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingDepartment ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Departments;
