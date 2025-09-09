import React, { useState, useEffect } from "react";
import "./AnalyticsTab.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

// Mock data - replace with real API calls
const fetchAnalyticsData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        applicants: {
          active: 1250,
          inactive: 320,
        },
        employers: {
          verified: 180,
          pending: 45,
        },
        jobs: {
          active: 230,
          closed: 145,
        },
        aiMatching: 78, // percentage
        skillsDemand: [
          { name: "Jan", "IT/Software": 120, "Healthcare": 80, "Engineering": 95 },
          { name: "Feb", "IT/Software": 150, "Healthcare": 85, "Engineering": 100 },
          { name: "Mar", "IT/Software": 180, "Healthcare": 90, "Engineering": 110 },
          { name: "Apr", "IT/Software": 210, "Healthcare": 95, "Engineering": 120 },
          { name: "May", "IT/Software": 240, "Healthcare": 100, "Engineering": 130 },
        ]
      });
    }, 500);
  });
};

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"];

const AnalyticsTab: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData().then((res: any) => setData(res));
  }, []);

  if (!data) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">System Analytics</h2>
      
      <div className="metrics-grid">
        {/* Applicants */}
        <div className="metric-card">
          <h3>Applicants</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: data.applicants.active },
                    { name: 'Inactive', value: data.applicants.inactive }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  <Cell fill="#4CAF50" />
                  <Cell fill="#E0E0E0" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="metric-legend">
              <div><span className="dot green"></span> Active: {data.applicants.active}</div>
              <div><span className="dot gray"></span> Inactive: {data.applicants.inactive}</div>
            </div>
          </div>
        </div>

        {/* Employers */}
        <div className="metric-card">
          <h3>Employers</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Verified', value: data.employers.verified },
                    { name: 'Pending', value: data.employers.pending }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  <Cell fill="#2196F3" />
                  <Cell fill="#FFC107" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="metric-legend">
              <div><span className="dot blue"></span> Verified: {data.employers.verified}</div>
              <div><span className="dot yellow"></span> Pending: {data.employers.pending}</div>
            </div>
          </div>
        </div>

        {/* Job Postings */}
        <div className="metric-card">
          <h3>Job Postings</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Active', value: data.jobs.active },
                { name: 'Closed', value: data.jobs.closed }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#9C27B0" />
              </BarChart>
            </ResponsiveContainer>
            <div className="metric-legend">
              <div>Active: {data.jobs.active}</div>
              <div>Closed: {data.jobs.closed}</div>
            </div>
          </div>
        </div>

        {/* AI Matching Success Rate */}
        <div className="metric-card">
          <h3>AI Matching Success Rate</h3>
          <div className="gauge-container">
            <div 
              className="gauge" 
              style={{ 
                background: `conic-gradient(
                  #4CAF50 0% ${data.aiMatching}%, 
                  #E0E0E0 ${data.aiMatching}% 100%
                )` 
              }}
            >
              <div className="gauge-center">
                {data.aiMatching}%
              </div>
            </div>
            <div className="gauge-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="metric-note">Based on successful job matches</div>
        </div>
      </div>

      {/* Skills Demand Trends */}
      <div className="full-width-card">
        <h3>Skills Demand Trends</h3>
        <div className="chart-container" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.skillsDemand}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="IT/Software" stroke="#4CAF50" strokeWidth={2} />
              <Line type="monotone" dataKey="Healthcare" stroke="#2196F3" strokeWidth={2} />
              <Line type="monotone" dataKey="Engineering" stroke="#9C27B0" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;