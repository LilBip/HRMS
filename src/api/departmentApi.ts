import axios from 'axios';
import { Department } from '../types/department';

const API_URL = 'http://localhost:3001/departments';

export const getDepartments = async (): Promise<Department[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addDepartment = async (department: Department) => {
  return axios.post(API_URL, department);
};

export const updateDepartment = async (id: string, department: Department) => {
  return axios.put(`${API_URL}/${id}`, department);
};

export const deleteDepartment = async (id: string) => {
  return axios.delete(`${API_URL}/${id}`);
};
