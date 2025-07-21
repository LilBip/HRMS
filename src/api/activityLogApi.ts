import axios from 'axios';
import { ActivityLog } from '../types/activityLog';

const API_URL = 'http://localhost:3001/activityLogs';

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addActivityLog = async (log: ActivityLog) => {
  return axios.post(API_URL, log);
}; 