import axios from "axios";
import { Employee } from "../types/employee"; // Nếu có type, nếu không thì dùng any

export const getAllEmployees = async (): Promise<Employee[]> => {
  const res = await axios.get("http://localhost:3001/accounts");
  return res.data;
};
