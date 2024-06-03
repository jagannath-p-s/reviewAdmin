import React, { Component, useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch, FaSortUp, FaSortDown } from "react-icons/fa";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const Analytics = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reviewCounts, setReviewCounts] = useState([]);
  const [clients, setClients] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchSalesmen = async () => {
    const { data: salesmenData, error: salesmenError } = await supabase.from('salesmen').select('*');
    if (salesmenError) console.error("Error fetching salesmen:", salesmenError);
    else setSalesmen(salesmenData);
  };

  const fetchActivities = async () => {
    const { data: activitiesData, error: activitiesError } = await supabase.from('client_salesman_activity').select('*');
    if (activitiesError) console.error("Error fetching activities:", activitiesError);
    else setActivities(activitiesData);
  };

  const fetchReviewCounts = async () => {
    const { data: reviewCountsData, error: reviewCountsError } = await supabase.from('review_counts').select('*');
    if (reviewCountsError) console.error("Error fetching review counts:", reviewCountsError);
    else setReviewCounts(reviewCountsData);
  };

  const fetchClients = async () => {
    const { data: clientsData, error: clientsError } = await supabase.from('clients').select('*');
    if (clientsError) console.error("Error fetching clients:", clientsError);
    else setClients(clientsData);
  };

  useEffect(() => {
    fetchSalesmen();
    fetchActivities();
    fetchReviewCounts();
    fetchClients();
  }, []);

  const filterActivitiesByDate = (activities) => {
    if (!startDate && !endDate) return activities;
    return activities.filter(activity => {
      const activityDate = new Date(activity.activity_timestamp);
      return (!startDate || activityDate >= startDate) && (!endDate || activityDate <= endDate);
    });
  };

  const totalReviewPointsPerSalesman = salesmen.map(salesman => ({
    name: salesman.name,
    points: salesman.points
  }));

  const recentActivityPerSalesman = filterActivitiesByDate(activities).map(activity => ({
    name: salesmen.find(s => s.id === activity.salesman_id)?.name,
    timestamp: new Date(activity.activity_timestamp).toLocaleDateString()
  }));

  const performancePerClient = clients.map(client => ({
    client: client.useremail,
    salesmen: salesmen.filter(salesman => salesman.client_id === client.id).map(salesman => ({
      name: salesman.name,
      points: salesman.points
    }))
  }));

  const topSalesmen = salesmen.sort((a, b) => b.points - a.points).slice(0, 5);
  const worstSalesmen = salesmen.sort((a, b) => a.points - b.points).slice(0, 5);

  const productivityOverTime = filterActivitiesByDate(activities).reduce((acc, activity) => {
    const date = new Date(activity.activity_timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const monthlyPerformanceTrends = filterActivitiesByDate(activities).reduce((acc, activity) => {
    const date = new Date(activity.activity_timestamp);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[month] = (acc[month] || 0) + activity.points;
    return acc;
  }, {});

  const monthlyPerformanceData = Object.entries(monthlyPerformanceTrends).map(([month, points]) => ({ month, points }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black bg-opacity-80 text-white p-2 rounded">
          <p className="font-semibold">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Analytics</h1>
      <div className="flex items-center mb-4">
        <label htmlFor="startDate" className="mr-2">Start Date:</label>
        <DatePicker
          id="startDate"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy-MM-dd"
          className="border border-gray-300 rounded px-2 py-1"
        />
        <label htmlFor="endDate" className="ml-4 mr-2">End Date:</label>
        <DatePicker
          id="endDate"
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="yyyy-MM-dd"
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h2 className="text-2xl font-semibold mb-6 text-green-800">Total Review Points per Salesman</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={totalReviewPointsPerSalesman}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="points" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h2 className="text-2xl font-semibold mb-6 text-red-800">Top and Low Performers</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-4">Top Performers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSalesmen}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="points" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Low Performers</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={worstSalesmen}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="points" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h2 className="text-2xl font-semibold mb-6 text-purple-800">Salesman Productivity Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={Object.entries(productivityOverTime).map(([date, count]) => ({ date, count }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h2 className="text-2xl font-semibold mb-6 text-teal-800">Monthly Performance Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="points" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
,
supabse table :
CREATE TABLE public.salesmen (
  id serial PRIMARY KEY,
  name text NOT NULL,
  points integer DEFAULT 0,
  client_id integer REFERENCES clients(id),
  created_at TIMESTAMP DEFAULT NOW()
) TABLESPACE pg_default;



CREATE TABLE public.client_salesman_activity (
  id serial PRIMARY KEY,
  client_id integer REFERENCES clients(id),
  salesman_id integer REFERENCES salesmen(id),
  activity_timestamp TIMESTAMP DEFAULT NOW()
) TABLESPACE pg_default;




CREATE TABLE public.review_counts (
  id serial PRIMARY KEY,
  count integer,
  client_id integer REFERENCES clients(id)
) TABLESPACE pg_default;

CREATE TABLE public.clients (
  id serial PRIMARY KEY,
  useremail VARCHAR(255) UNIQUE NOT NULL,
  reviewurl TEXT,
  extractionurl TEXT,
  logourl TEXT,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
) TABLESPACE pg_default;

,
clients table : contains list of shop name 
review_counts : contains the totals number of review of the current shop based on the client id.
client_salesman_activity : contains review points of each salesman
salesmen :  contains total review points of each salesman 
(the salesmen table gets updated based on the client_salesman_activity)
, 
this is a Analytics Component which is done using react , talwiind CSS , supabase . but the mothly performance setion is nott working . can you make it workable as it is used to analyse each months results , so the people who use it can easily view it what each moths reasults are.