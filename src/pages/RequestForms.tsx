import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContexts";
import {
  createRequest,
  getRequests,
  approveRequest,
  deleteRequest,
  updateRequest,
} from "../api/requestApi";
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
import moment from "moment";

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

      const filtered =
        user?.role === "admin"
          ? data
          : data.filter((r: RequestForm) => r.employeeId === user?.id);

      setRequests(filtered);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  const handleCreateRequest = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange || [];
      const content = values.content;
      const time =
        startDate && endDate
          ? `Từ ${startDate.format("DD/MM/YYYY")} đến ${endDate.format(
              "DD/MM/YYYY"
            )}`
          : "";

      const requestData = {
        employeeId: user?.id || "",
        employeeName: user?.fullName || "",
        type: values.type === "Khác" ? values.customType : values.type,
        content,
        time,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        status: "pending", // Add status for update case
        submissionDate:
          selectedRequest?.submissionDate || new Date().toISOString(), // Keep original submission date when updating
      };

      if (selectedRequest) {
        // Update existing request
        await updateRequest(selectedRequest.id, {
          // Spread requestData first, then override with selected request properties
          ...requestData,
          id: selectedRequest.id,
          status: selectedRequest.status,
          approvedBy: selectedRequest.approvedBy,
          approvalDate: selectedRequest.approvalDate,
          approvalNote: selectedRequest.approvalNote,
        });

        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Update",
          details: `Sửa đơn ${requestData.type}`,
        });

        message.success("Sửa đơn thành công");
      } else {
        // Create new request
        await createRequest(requestData);

        await createActivityLog({
          name: user?.fullName || "",
          activityType: "Add",
          details: `Tạo đơn ${requestData.type} mới`,
        });

        message.success("Tạo đơn thành công");
      }

      setCreateModalVisible(false);
      setSelectedRequest(null);
      form.resetFields();
      loadRequests();
    } catch (error) {
      console.error("Error saving request:", error);
      message.error("Lỗi khi lưu đơn");
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

  const onEditRequest = (record: RequestForm) => {
    form.setFieldsValue({
      type: ["Nghỉ phép", "Công tác", "Tăng ca"].includes(record.type)
        ? record.type
        : "Khác",
      customType: !["Nghỉ phép", "Công tác", "Tăng ca"].includes(record.type)
        ? record.type
        : undefined,
      content: record.content,
      dateRange:
        record.startDate && record.endDate
          ? [record.startDate, record.endDate]
          : [null, null],
    });
    setSelectedRequest(record);
    setCreateModalVisible(true);
  };

  const onDeleteRequest = async (id: string) => {
    try {
      await deleteRequest(id);

      await createActivityLog({
        name: user?.fullName || "",
        activityType: "Delete",
        details: `Xóa đơn`,
      });
      message.success("Xóa đơn thành công");
      loadRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      message.error("Lỗi khi xóa đơn");
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
    // Cột dành cho admin (duyệt)
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
    // Cột dành cho user (sửa/xóa)
    ...(user?.role === "user"
      ? [
          {
            title: "Hành động",
            key: "user-action",
            render: (_: any, record: RequestForm) =>
              record.employeeId === user.id &&
              record.status === "pending" && (
                <Space>
                  <Button size="small" onClick={() => onEditRequest(record)}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => onDeleteRequest(record.id)}
                  >
                    Xóa
                  </Button>
                </Space>
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
