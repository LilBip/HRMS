export interface RequestForm {
  date(date: any): unknown;
  id: string;
  employeeName: string;
  type: 'Nghỉ phép' | 'Công tác' | 'Tăng ca';
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
}