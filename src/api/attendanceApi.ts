import axios from 'axios';
import { AttendanceRecord } from '../types/attendance';

const API_URL = 'http://localhost:3001/attendance';

export const getAttendanceHistory = async (): Promise<AttendanceRecord[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addAttendanceRecord = async (record: AttendanceRecord): Promise<void> => {
  // Kiểm tra đã có bản ghi chấm công cho userId và date chưa
  const exists = await axios.get(`${API_URL}?userId=${record.userId}&date=${record.date}`);
  if (exists.data.length > 0) {
    // Nếu đã có, cập nhật (PATCH)
    await axios.patch(`${API_URL}/${exists.data[0].id}`, record);
  } else {
    // Nếu chưa có, tạo mới
    await axios.post(API_URL, record);
  }
};