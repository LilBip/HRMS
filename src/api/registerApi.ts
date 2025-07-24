import axios from "axios";
import { Employee } from "../types/employee";

const EMPLOYEE_API = "http://localhost:3001/employees";
const ACCOUNT_API = "http://localhost:3001/accounts";

export const registerEmployee = async (employee: Omit<Employee, "id"> & { username: string; password: string; email: string; fullName: string; }) => {
  // Tạo id mới
  const id = Date.now().toString();

  // Thêm vào employees
  await axios.post(EMPLOYEE_API, {
    ...employee,
    id,
    name: employee.fullName, // đồng bộ tên
    status: "Đang thử việc",
    startDate: new Date().toISOString().slice(0, 10),
  });

  // Thêm vào accounts
  await axios.post(ACCOUNT_API, {
    id,
    username: employee.username,
    password: employee.password,
    fullName: employee.fullName,
    role: "user",
    email: employee.email,
    status: "active"
  });
};