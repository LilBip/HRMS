import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Tag,
  DatePicker,
  Select,
  Typography,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getAllEmployees } from '../api/employeeApi';
import {
  getAttendanceHistory,
  addAttendanceRecord,
} from '../api/attendanceApi';
import { AttendanceRecord } from '../types/attendance';
import { useAuth } from '../contexts/AuthContexts';
import { Employee } from '../types/employee';
import { createActivityLog } from '../api/activityLogApi';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id || '');

  const isAdmin = user?.role === 'admin';

  // ✅ Chỉ cho phép chấm công ngày hôm nay
  const isToday = (date: Dayjs) => date.isSame(dayjs(), 'day');

  useEffect(() => {
    if (isAdmin) {
      getAllEmployees()
        .then((data) => {
          setEmployees(data);
          if (!selectedUserId && data.length > 0) {
            setSelectedUserId(data[0].id);
          }
        })
        .catch(() => message.error('Không thể tải danh sách nhân viên'));
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line
  }, [selectedDate, selectedUserId]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const all = await getAttendanceHistory();
      const filtered = all.filter(
        (record) =>
          record.date === selectedDate.format('YYYY-MM-DD') &&
          (isAdmin ? record.userId === selectedUserId : record.userId === user?.id)
      );
      setAttendanceData(filtered);
    } catch {
      message.error('Không thể tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!isToday(selectedDate)) {
      return message.warning('Chỉ có thể check-in trong ngày hôm nay');
    }

    try {
      const recordId = `${user?.id}-${selectedDate.format('YYYY-MM-DD')}`;
      const alreadyCheckedIn = attendanceData.some((r) => r.checkIn);
      if (alreadyCheckedIn) {
        return message.warning('Bạn đã check-in rồi');
      }

      await addAttendanceRecord({
        id: recordId,
        userId: user?.id || '',
        date: selectedDate.format('YYYY-MM-DD'),
        checkIn: dayjs().toISOString(),
        status: 'present',
      });

      await createActivityLog({
        name: user?.fullName || user?.username || 'Unknown',
        activityType: 'Add',
        details: `Check-in lúc ${dayjs().format('HH:mm:ss')} ngày ${selectedDate.format('DD/MM/YYYY')}`,
      });

      message.success('Check-in thành công');
      fetchAttendance();
    } catch {
      message.error('Check-in thất bại');
    }
  };

  const handleCheckOut = async () => {
    if (!isToday(selectedDate)) {
      return message.warning('Chỉ có thể check-out trong ngày hôm nay');
    }

    try {
      const todayRecord = attendanceData.find(
        (r) => r.userId === user?.id && r.date === selectedDate.format('YYYY-MM-DD')
      );

      if (!todayRecord || !todayRecord.checkIn) {
        return message.error('Bạn cần check-in trước!');
      }

      if (todayRecord.checkOut) {
        return message.warning('Bạn đã check-out rồi');
      }

      await addAttendanceRecord({
        ...todayRecord,
        checkOut: dayjs().toISOString(),
      });

      await createActivityLog({
        name: user?.fullName || user?.username || 'Unknown',
        activityType: 'Update',
        details: `Check-out lúc ${dayjs().format('HH:mm:ss')} ngày ${selectedDate.format('DD/MM/YYYY')}`,
      });

      message.success('Check-out thành công');
      fetchAttendance();
    } catch {
      message.error('Check-out thất bại');
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'userId',
      key: 'userId',
      render: (id: string) => {
        const emp = employees.find((e) => e.id === id);
        return emp ? emp.name : id;
      },
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Check-in',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (t: string) => (t ? dayjs(t).format('HH:mm:ss') : '-'),
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (t: string) => (t ? dayjs(t).format('HH:mm:ss') : '-'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const color =
          s === 'present' ? 'green' : s === 'leave' ? 'blue' : 'red';
        return <Tag color={color}>{s.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (text: string) => text || '-',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Chấm công</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <DatePicker
          value={selectedDate}
          onChange={(d) => d && setSelectedDate(d)}
          allowClear={false}
          // ✅ Vô hiệu hóa chọn ngày quá khứ và tương lai
        />
        {isAdmin ? (
          <Select
            showSearch
            style={{ width: 220 }}
            placeholder="Chọn nhân viên"
            value={selectedUserId}
            onChange={setSelectedUserId}
            optionFilterProp="children"
          >
            {employees.map((emp) => (
              <Select.Option key={emp.id} value={emp.id}>
                {emp.name}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <>
            <Button type="primary" onClick={handleCheckIn}>
              Check-in
            </Button>
            <Button onClick={handleCheckOut}>Check-out</Button>
          </>
        )}
      </Space>

      <Table
        columns={columns}
        dataSource={attendanceData}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default Attendance;
