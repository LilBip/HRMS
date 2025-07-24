export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // yyyy-mm-dd
  checkIn?: string; // ISO time string
  checkOut?: string; // ISO time string
  status: 'present' | 'absent' | 'leave';
  note?: string;
}
