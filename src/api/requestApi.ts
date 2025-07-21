import axios from 'axios';
import { RequestForm } from '../types/request';

const API_URL = 'http://localhost:3001/requestForms';

export const getRequestForms = async (): Promise<RequestForm[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createRequestForm = async (form: RequestForm) => {
  await axios.post(API_URL, form);
};

export const updateRequestForm = async (id: string, form: Partial<RequestForm>) => {
  await axios.patch(`${API_URL}/${id}`, form);
};

export const deleteRequestForm = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};
