import axios from "axios";
import dayjs from "dayjs";

export interface ActivityLog {
  id: string;
  name: string;
  activityType: string;
  time: string;
  details?: string;
}

const BASE_URL = "http://localhost:3001";

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const response = await axios.get(`${BASE_URL}/activityLogs`);
  return response.data;
};

export const createActivityLog = async (
  log: Omit<ActivityLog, "id" | "time">
) => {
  const newLog = {
    ...log,
    id: Date.now().toString(),
    time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };

  const response = await axios.post(`${BASE_URL}/activityLogs`, newLog);
  return response.data;
};
