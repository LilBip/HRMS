import axios from 'axios';
import {Position} from '../types/position';

const API_URL = 'http://localhost:3001/position'; // Thay đổi endpoint từ departments sang positions

export const getPositions = async (): Promise<Position[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

export const addPosition = async (position: Omit<Position, 'id'>) => {
  try {
    // Tạo ID mới nếu backend không tự tạo
    const newPosition = { ...position, id: crypto.randomUUID() };
    const response = await axios.post(API_URL, newPosition);
    return response.data;
  } catch (error) {
    console.error('Error adding position:', error);
    throw error;
  }
};

export const updatePosition = async (id: string, position: Position) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, position);
    return response.data;
  } catch (error) {
    console.error('Error updating position:', error);
    throw error;
  }
};

export const deletePosition = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting position:', error);
    throw error;
  }
};