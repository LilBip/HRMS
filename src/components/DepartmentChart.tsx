import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getAllEmployees } from "../api/dashboardApi";
import { getDepartments } from "../api/departmentApi";
import { Department } from "../types/department";
import { Account } from "../types/account";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

const DepartmentChart: React.FC = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    Promise.all([getAllEmployees(), getDepartments()]).then(
      ([employees, departments]: [Account[], Department[]]) => {
        // Tạo object đếm nhân viên theo tên phòng ban (name)
        const departmentCount: Record<string, number> = {};

        employees.forEach((emp) => {
          if (emp.departmentId) {
            departmentCount[emp.departmentId] =
              (departmentCount[emp.departmentId] || 0) + 1;
          }
        });

        // Duyệt danh sách phòng ban chuẩn và ghép theo tên (name)
        const formattedData = departments.map((dept) => ({
          name: dept.name,
          value: departmentCount[dept.id] || 0, // nếu chưa có nhân viên thì 0
        }));
        console.log(formattedData);
        setData(formattedData);
      }
    );
  }, []);

  return (
    <PieChart width={400} height={300}>
      <Pie
        dataKey="value"
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default DepartmentChart;
