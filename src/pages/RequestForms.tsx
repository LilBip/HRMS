import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContexts";
import { getRequests, approveRequest } from "../api/requestApi";
import { createActivityLog } from "../api/activityLogApi";
import { RequestForm } from "../types/request";
import {
  Table,
  Typography,
  Button,
  Modal,
  Input,
  Tag,
  Space,
  message,
  Form,
  Select,
  DatePicker,
} from "antd";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const RequestForms: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState<RequestForm[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestForm | null>(
    null
  );
  const [approvalNote, setApprovalNote] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const handleCreateRequest = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange || [];
      const content = values.content;
      const time = `${
        startDate && endDate
          ? `Từ ${startDate.format("DD/MM/YYYY")} đến ${endDate.format(
              "DD/MM/YYYY"
            )}`
          : ""
      }`;

      const newRequest = {
        id: Date.now().toString(),
        employeeId: user?.id || "",
        employeeName: user?.fullName || "",
        type: values.type === "Khác" ? values.customType : values.type,
        content,
        time,
        submissionDate: new Date().toISOString(),
        status: "pending",
      };

      await fetch("http://localhost:3001/requestForms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });

      await createActivityLog({
        name: user?.fullName || "",
        activityType: "Add",
        details: `Tạo đơn ${newRequest.type} mới`,
      });

      message.success("Tạo đơn thành công");
      setCreateModalVisible(false);
      form.resetFields();
      loadRequests();
    } catch (error) {
      console.error("Error creating request:", error);
      message.error("Lỗi khi tạo đơn");
    }
  };

  const handleApprovalClick = (request: RequestForm) => {
    setSelectedRequest(request);
    setApprovalNote("");
    setOpenDialog(true);
  };

  const handleApprove = async (approved: boolean) => {
    if (selectedRequest && user) {
      try {
        setLoading(true);

        // Duyệt đơn
        await approveRequest(
          selectedRequest.id,
          user.fullName,
          approved,
          approvalNote
        );

        // Tạo activity log
        await createActivityLog({
          name: user.fullName,
          activityType: approved ? "Approve" : "Reject",
          details: `${approved ? "Phê duyệt" : "Từ chối"} đơn ${
            selectedRequest.type
          } của ${selectedRequest.employeeName}${
            approvalNote ? ` - Ghi chú: ${approvalNote}` : ""
          }`,
        });

        message.success(approved ? "Đã phê duyệt đơn" : "Đã từ chối đơn");
        setOpenDialog(false);
        loadRequests();
      } catch (error) {
        console.error("Error approving request:", error);
        message.error("Lỗi duyệt đơn");
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "chờ duyệt":
        return <Tag color="orange">Chờ duyệt</Tag>;
      case "approved":
      case "đã duyệt":
        return <Tag color="green">Đã duyệt</Tag>;
      case "rejected":
      case "từ chối":
        return <Tag color="red">Từ chối</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Người gửi",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Loại đơn",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "Thời gian nghỉ",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Ngày gửi",
      dataIndex: "submissionDate",
      key: "submissionDate",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Người duyệt",
      key: "approvedBy",
      render: (_: any, record: RequestForm) =>
        record.approvedBy ? (
          <div>
            <div>{record.approvedBy}</div>
            <small style={{ color: "gray" }}>
              {record.approvalDate &&
                new Date(record.approvalDate).toLocaleDateString("vi-VN")}
            </small>
          </div>
        ) : (
          "-"
        ),
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "Hành động",
            key: "action",
            render: (_: any, record: RequestForm) =>
              record.status === "pending" && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleApprovalClick(record)}
                >
                  Duyệt đơn
                </Button>
              ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Danh sách đơn từ
        </Typography.Title>
        <Button type="primary" onClick={() => setCreateModalVisible(true)}>
          Tạo đơn mới
        </Button>
      </Space>

      <Table
        dataSource={requests}
        columns={columns}
        rowKey="id"
        bordered
        pagination={{ pageSize: 8 }}
      />

      {/* Modal duyệt đơn */}
      <Modal
        open={openDialog}
        title={`Duyệt đơn - ${selectedRequest?.type || ""}`}
        onCancel={() => setOpenDialog(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpenDialog(false)}>
            Hủy
          </Button>,
          <Button
            key="reject"
            type="primary"
            danger
            loading={loading}
            onClick={() => handleApprove(false)}
          >
            Từ chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={loading}
            onClick={() => handleApprove(true)}
          >
            Phê duyệt
          </Button>,
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Typography.Text strong>Nội dung:</Typography.Text>
          <Typography.Paragraph>
            {selectedRequest?.content}
          </Typography.Paragraph>

          <Typography.Text type="secondary">
            Ngày gửi:{" "}
            {selectedRequest?.submissionDate &&
              new Date(selectedRequest.submissionDate).toLocaleDateString(
                "vi-VN"
              )}
          </Typography.Text>

          <TextArea
            rows={4}
            placeholder="Ghi chú duyệt đơn"
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
          />
        </Space>
      </Modal>

      {/* Modal tạo đơn mới */}
      <Modal
        open={createModalVisible}
        title="Tạo đơn mới"
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setCreateModalVisible(false);
              form.resetFields();
            }}
          >
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Tạo đơn
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRequest}>
          <Form.Item
            name="type"
            label="Loại đơn"
            rules={[{ required: true, message: "Vui lòng chọn loại đơn" }]}
          >
            <Select>
              <Option value="Nghỉ phép">Nghỉ phép</Option>
              <Option value="Công tác">Công tác</Option>
              <Option value="Tăng ca">Tăng ca</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues?.type !== currentValues?.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "Khác" ? (
                <Form.Item
                  name="customType"
                  label="Tên loại đơn"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên loại đơn" },
                  ]}
                >
                  <Input placeholder="Nhập tên loại đơn..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian"
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
          >
            <RangePicker
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung chi tiết"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung đơn" },
              { max: 200, message: "Nội dung không được vượt quá 250 ký tự" },
            ]}
          >
            <TextArea
              rows={5}
              style={{ resize: "none" }}
              placeholder="Nhập nội dung chi tiết của đơn..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RequestForms;
