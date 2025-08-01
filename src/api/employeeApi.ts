import axios from "axios";
import { Account } from "../types/account"; // Nếu có type, nếu không thì dùng any

export const getAllEmployees = async (): Promise<Account[]> => {
  const res = await axios.get("http://localhost:3001/accounts");
  return res.data;
};
