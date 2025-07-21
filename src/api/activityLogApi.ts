import axios from 'axios';

export interface ActivityLog {
  id: string;
  name: string;
  activityType: 'Add' | 'Update' | 'Delete' | 'Approve' | 'Reject';
  time: string;
  details?: string;
}

const BASE_URL = 'http://localhost:3001';

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const response = await axios.get(`${BASE_URL}/activityLogs`);
  return response.data;
};

export const createActivityLog = async (log: Omit<ActivityLog, 'id' | 'time'>) => {
  const newLog = {
    ...log,
    id: Date.now().toString(),
    time: new Date().toISOString()
  };
  
  const response = await axios.post(`${BASE_URL}/activityLogs`, newLog);
  return response.data;
}; 