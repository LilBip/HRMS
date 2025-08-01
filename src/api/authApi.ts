import axios from "axios";
import { Account } from "../types/account";

export interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async (
  credentials: LoginCredentials
): Promise<Account | null> => {
  try {
    const response = await axios.get("http://localhost:3001/accounts");
    const accounts: Account[] = response.data;

    const account = accounts.find(
      (acc) =>
        acc.username === credentials.username &&
        acc.password === credentials.password &&
        acc.accountStatus === "active"
    );

    if (!account) {
      throw new Error("Invalid credentials or account is inactive");
    }

    return account;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
