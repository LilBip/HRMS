import axios from "axios";

const API_URL = "http://localhost:3001"; // hoặc URL API bạn đang dùng

export const getAllEmployees = async () => {
  const res = await axios.get(`${API_URL}/accounts`);
  return res.data;
};

export const getAllDepartments = async () => {
  const res = await axios.get(`${API_URL}/departments`);
  return res.data;
};
