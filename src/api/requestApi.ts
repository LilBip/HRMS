import axios from "axios";
import { RequestForm } from "../types/request";

const BASE_URL = "http://localhost:3001";

export const getRequests = async (): Promise<RequestForm[]> => {
  const response = await axios.get(`${BASE_URL}/requestForms`);
  return response.data;
};

export const createRequest = async (
  request: Omit<RequestForm, "id" | "status">
): Promise<RequestForm> => {
  const newRequest = {
    ...request,
    status: "pending",
    submissionDate: new Date().toISOString(),
  };
  const response = await axios.post(`${BASE_URL}/requestForms`, newRequest);
  return response.data;
};

export const approveRequest = async (
  requestId: string,
  approverName: string,
  approved: boolean,
  note?: string
): Promise<RequestForm> => {
  const request = await axios.get(`${BASE_URL}/requestForms/${requestId}`);
  const updatedRequest = {
    ...request.data,
    status: approved ? "approved" : "rejected",
    approvedBy: approverName,
    approvalDate: new Date().toISOString(),
    approvalNote: note,
  };

  const response = await axios.put(
    `${BASE_URL}/requestForms/${requestId}`,
    updatedRequest
  );
  return response.data;
};

export const updateRequest = async (
  requestId: string,
  updatedData: Partial<RequestForm>
): Promise<RequestForm> => {
  const response = await axios.put(
    `${BASE_URL}/requestForms/${requestId}`,
    updatedData
  );
  return response.data;
};

export const deleteRequest = async (requestId: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/requestForms/${requestId}`);
};
