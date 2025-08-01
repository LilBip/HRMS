export interface RequestForm {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  content: string;
  time: string;
  startDate: string | null;
  endDate: string | null;
  status: "pending" | "approved" | "rejected";
  submissionDate: string;
  approvedBy?: string;
  approvalDate?: string;
  approvalNote?: string;
}
