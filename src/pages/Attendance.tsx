import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Tag,
  DatePicker,
  Select,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getAllEmployees } from '../api/employeeApi';
import { getAttendanceHistory, addAttendanceRecord } from '../api/attendanceApi';
import { AttendanceRecord } from '../types/attendance';
import { useAuth } from '../contexts/AuthContexts';
import { Employee } from '../types/employee';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id || '');

  const isAdmin = user?.role === 'admin';

  // Lấy danh sách nhân viên cho admin
  useEffect(() => {
    if (isAdmin) {
      getAllEmployees()
        .then((data: Employee[]) => {
          setEmployees(data);
          if (!selectedUserId && data.length > 0) {
            setSelectedUserId(data[0].id);
          }
        })
        .catch(() => message.error('Không thể tải danh sách nhân viên'));
    }
    // eslint-disable-next-line
  }, [isAdmin]);

  // Lấy dữ liệu chấm công
  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line
  }, [selectedDate, selectedUserId, user]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const allData = await getAttendanceHistory();
      let filtered: AttendanceRecord[] = [];
      if (isAdmin) {
        filtered = allData.filter(
          (item) =>
            (!selectedUserId || item.userId === selectedUserId) &&
            item.date === selectedDate.format('YYYY-MM-DD')
        );
      } else {
        filtered = allData.filter(
          (item) =>
            item.userId === user?.id &&
            item.date === selectedDate.format('YYYY-MM-DD')
        );
      }
      setAttendanceData(filtered);
    } catch {
      message.error('Không thể tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  };

  // Check-in
  const handleCheckIn = async () => {
    try {
      await addAttendanceRecord({
        id: `${user?.id}-${selectedDate.format('YYYY-MM-DD')}`,
        userId: user?.id || '',
        date: selectedDate.format('YYYY-MM-DD'),
        checkIn: dayjs().toISOString(),
        status: 'present',
      });
      message.success('Check-in thành công');
      fetchAttendance();
    } catch {
      message.error('Check-in thất bại');
    }
  };

  // Check-out
  const handleCheckOut = async () => {
    try {
      const todayRecord = attendanceData.find(
        (item) =>
          item.userId === user?.id &&
          item.date === selectedDate.format('YYYY-MM-DD')
      );
      if (todayRecord) {
        await addAttendanceRecord({
          ...todayRecord,
          checkOut: dayjs().toISOString(),
        });
        message.success('Check-out thành công');
        fetchAttendance();
      } else {
        message.error('Bạn chưa check-in!');
      }
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
        const emp = employees.find((emp) => emp.id === id);
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
      render: (time: string) => (time ? dayjs(time).format('HH:mm:ss') : '-'),
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (time: string) => (time ? dayjs(time).format('HH:mm:ss') : '-'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'present') color = 'green';
        else if (status === 'absent') color = 'red';
        else if (status === 'leave') color = 'blue';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
  ];

  return (
    <div>
      <h2>Chấm công</h2>
      <Space style={{ marginBottom: 16 }}>
        <DatePicker
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          allowClear={false}
        />
        {isAdmin && (
          <Select
            showSearch
            style={{ width: 220 }}
            placeholder="Chọn nhân viên"
            value={selectedUserId}
            onChange={setSelectedUserId}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {employees.map((emp) => (
              <Select.Option key={emp.id} value={emp.id}>
                {emp.name}
              </Select.Option>
            ))}
          </Select>
        )}
        {!isAdmin && (
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