export interface RequestForm {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  content: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
  approvalNote?: string;
}