import React, { useEffect, useState } from 'react';
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
} from 'antd';
import { Department } from '../types/department';
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from '../api/departmentApi';
import { createActivityLog } from '../api/activityLogApi';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
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
    setModalVisible(true);
  };

  const handleEdit = (record: Department) => {
    setEditingDepartment(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const department = departments.find(dep => dep.id === id);
      await deleteDepartment(id);
      message.success('Xóa phòng ban thành công');
      if (department) {
        await createActivityLog({
          name: department.name,
          activityType: 'Delete',
          details: `Xóa phòng ban ${department.name}`
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
        await createActivityLog({
          name: values.name,
          activityType: 'Update',
          details: `Cập nhật phòng ban ${values.name}`
        });
      } else {
        const newId = crypto.randomUUID();
        await addDepartment({ ...values, id: newId });
        message.success('Thêm phòng ban thành công');
        await createActivityLog({
          name: values.name,
          activityType: 'Add',
          details: `Thêm phòng ban mới ${values.name}`
        });
      }
      setModalVisible(false);
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>Danh sách phòng ban</Typography.Title>
        <Button
          type="primary"
          onClick={handleAdd}>
            + Thêm phòng ban
          </Button>
      </div>
      
      <Table columns={columns} dataSource={departments} rowKey="id" />

      <Modal
        title={editingDepartment ? 'Cập nhật phòng ban' : 'Thêm phòng ban'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={600}
        footer={null}
        centered
        style={{ top: 40 }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item name="name" label="Tên phòng ban" rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit">
              {editingDepartment ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments;
