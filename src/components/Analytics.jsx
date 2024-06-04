import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaTimesCircle } from "react-icons/fa";


const getMonthName = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[date.getMonth()];
};

const Analytics = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reviewCounts, setReviewCounts] = useState([]);
  const [clients, setClients] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchSalesmen = async () => {
    const { data: salesmenData, error: salesmenError } = await supabase
      .from('salesmen')
      .select('*');
    if (salesmenError) console.error("Error fetching salesmen:", salesmenError);
    else setSalesmen(salesmenData);
  };

  const fetchActivities = async () => {
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('client_salesman_activity')
      .select('*');
    if (activitiesError)
      console.error("Error fetching activities:", activitiesError);
    else setActivities(activitiesData);
  };



  const fetchClients = async () => {
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    if (clientsError) console.error("Error fetching clients:", clientsError);
    else setClients(clientsData);
  };

  useEffect(() => {
    fetchSalesmen();
    fetchActivities();
    // fetchReviewCounts();
    fetchClients();
  }, []);

  const filterActivitiesByDate = (activities) => {
    if (!startDate && !endDate) return activities;
    return activities.filter(activity => {
      const activityDate = new Date(activity.activity_timestamp);
      return (!startDate || activityDate >= startDate) && (!endDate || activityDate <= endDate);
    });
  };

  const getTotalReviewPointsPerSalesman = (filteredActivities) => {
    const pointsPerSalesman = {};

    filteredActivities.forEach(activity => {
      const salesmanId = activity.salesman_id;
      if (!pointsPerSalesman[salesmanId]) {
        pointsPerSalesman[salesmanId] = { id: salesmanId, points: 0 };
      }
      pointsPerSalesman[salesmanId].points += 1;
    });

    return salesmen.map(salesman => ({
      name: salesman.name,
      points: pointsPerSalesman[salesman.id]?.points || 0
    })).sort((a, b) => b.points - a.points);
  };

  const totalReviewPointsPerSalesman = getTotalReviewPointsPerSalesman(filterActivitiesByDate(activities));

  const getTopAndLowPerformers = (filteredActivities) => {
    const pointsPerSalesman = {};

    filteredActivities.forEach(activity => {
      const salesmanId = activity.salesman_id;
      if (!pointsPerSalesman[salesmanId]) {
        pointsPerSalesman[salesmanId] = { id: salesmanId, points: 0 };
      }
      pointsPerSalesman[salesmanId].points += 1;
    });

    const sortedSalesmen = salesmen.map(salesman => ({
      name: salesman.name,
      points: pointsPerSalesman[salesman.id]?.points || 0
    })).sort((a, b) => b.points - a.points);

    return {
      topPerformers: sortedSalesmen.slice(0, 5),
      lowPerformers: sortedSalesmen.slice(-5).reverse()
    };
  };

  const { topPerformers, lowPerformers } = getTopAndLowPerformers(filterActivitiesByDate(activities));

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const currentMonth = getMonthName(new Date());

  const productivityOverTime = filterActivitiesByDate(activities)
    .filter(activity => getMonthName(new Date(activity.activity_timestamp)) === currentMonth)
    .reduce((acc, activity) => {
      const date = new Date(activity.activity_timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

  const generateMonthlyPerformanceData = () => {
    const monthlyData = {};
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize all months with 0 points
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    // Add the actual points data for existing months
    activities.forEach(activity => {
      const date = new Date(activity.activity_timestamp);
      const month = months[date.getMonth()];
      const salesman = salesmen.find(s => s.id === activity.salesman_id);
      if (salesman) {
        monthlyData[month] += salesman.points;
      }
    });

    return Object.entries(monthlyData).map(([month, points]) => ({ month, points }));
  };
  const monthlyPerformanceData = generateMonthlyPerformanceData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 rounded shadow-lg">
          <p className="font-semibold">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // Set up Supabase subscriptions
    const salesmenSubscription = supabase
      .channel('salesmen')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'salesmen',
        },
        () => {
          fetchSalesmen();
        }
      )
      .subscribe();
  
    const activitiesSubscription = supabase
      .channel('client_salesman_activity')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_salesman_activity',
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();
  
    const reviewCountsSubscription = supabase
      .channel('review_counts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_counts',
        },
        () => {
          fetchReviewCounts();
        }
      )
      .subscribe();
  
    const clientsSubscription = supabase
      .channel('clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        () => {
          fetchClients();
        }
      )
      .subscribe();
  
    // Clean up subscriptions on unmount
    return () => {
      salesmenSubscription.unsubscribe();
      activitiesSubscription.unsubscribe();
      reviewCountsSubscription.unsubscribe();
      clientsSubscription.unsubscribe();
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center relative top-14 text-gray-800">Salesman Analytics Dashboard</h1>

      <div className="flex flex-col md:flex-row items-center mt-24 mb-8 justify-center space-x-4 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-gray-500" />
          <label htmlFor="startDate" className="text-gray-600">Start Date:</label>
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
        </div>
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-gray-500" />
          <label htmlFor="endDate" className="text-gray-600">End Date:</label>
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
        <button
          onClick={clearDates}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          <FaTimesCircle className="mr-2" /> Clear
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Total Review Points per Salesman</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={totalReviewPointsPerSalesman}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="points" fill="#4c51bf" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
  <h2 className="text-2xl font-semibold mb-6 text-gray-800">Top and Low Performers</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 text-green-500">Top Performers</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topPerformers}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar dataKey="points" fill="#44bf44" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 text-red-500">Low Performers</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={lowPerformers}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar dataKey="points" fill="#ff5252" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Salesman Performance in {currentMonth}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={Object.entries(productivityOverTime).map(([date, count]) => ({ date, count }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#4c51bf" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Monthly Performance Trends</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line type="monotone" dataKey="points" stroke="#48bb78" strokeWidth={3} dot={{ stroke: '#48bb78', strokeWidth: 2 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;