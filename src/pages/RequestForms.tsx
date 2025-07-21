import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { RequestForm } from '../types/request';
import {
  getRequestForms,
  createRequestForm,
  updateRequestForm,
  deleteRequestForm,
} from '../api/requestApi';
import { PlusOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const RequestForms: React.FC = () => {
  const [forms, setForms] = useState<RequestForm[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingForm, setEditingForm] = useState<RequestForm | null>(null);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const data = await getRequestForms();
      setForms(data);
    } catch {
      message.error('Lỗi khi tải dữ liệu đơn từ');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleFinish = async (values: any) => {
    const [startDate, endDate] = values.dateRange;
    const formData: RequestForm = {
        id: editingForm ? editingForm.id : Date.now().toString(),
        employeeName: values.employeeName,
        type: values.type,
        reason: values.reason,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        status: values.status,
        date: function (date: any): unknown {
            throw new Error('Function not implemented.');
        }
    };

    try {
      if (editingForm) {
        await updateRequestForm(editingForm.id, formData);
        message.success('Cập nhật đơn thành công');
      } else {
        await createRequestForm(formData);
        message.success('Tạo đơn mới thành công');
      }
      fetchForms();
      setOpen(false);
      form.resetFields();
      setEditingForm(null);
    } catch {
      message.error('Lỗi khi lưu đơn từ');
    }
  };

  const handleEdit = (record: RequestForm) => {
    setEditingForm(record);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequestForm(id);
      message.success('Xóa đơn thành công');
      fetchForms();
    } catch {
      message.error('Lỗi khi xóa đơn');
    }
  };

  const handleApprove = async (
    record: RequestForm,
    newStatus: 'Đã duyệt' | 'Từ chối'
  ) => {
    try {
      await updateRequestForm(record.id, { status: newStatus });
      message.success(`Đơn đã được ${newStatus.toLowerCase()}`);
      fetchForms();
    } catch {
      message.error('Có lỗi khi cập nhật trạng thái đơn');
    }
  };

  const columns = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Loại đơn',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Từ ngày',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'Đến ngày',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = status === 'Đã duyệt' ? 'green' : status === 'Từ chối' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: RequestForm) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa đơn này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
          {record.status === 'Chờ duyệt' && (
            <>
              <Popconfirm
                title="Xác nhận duyệt đơn này?"
                onConfirm={() => handleApprove(record, 'Đã duyệt')}
              >
                <Button type="link" style={{ color: 'green' }}>Duyệt</Button>
              </Popconfirm>
              <Popconfirm
                title="Xác nhận từ chối đơn này?"
                onConfirm={() => handleApprove(record, 'Từ chối')}
              >
                <Button type="link" danger>Từ chối</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Quản lý Đơn từ</h2>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setOpen(true)}>
          Tạo đơn mới
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={forms} loading={loading} />

      <Drawer
        title={editingForm ? 'Chỉnh sửa đơn từ' : 'Tạo đơn từ'}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingForm(null);
          form.resetFields();
        }}
        width={480}
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            name="employeeName"
            label="Tên nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại đơn"
            rules={[{ required: true, message: 'Vui lòng chọn loại đơn' }]}
          >
            <Select>
              <Option value="Nghỉ phép">Nghỉ phép</Option>
              <Option value="Công tác">Công tác</Option>
              <Option value="Tăng ca">Tăng ca</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label="Lý do"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="Chờ duyệt">Chờ duyệt</Option>
              <Option value="Đã duyệt">Đã duyệt</Option>
              <Option value="Từ chối">Từ chối</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default RequestForms;
