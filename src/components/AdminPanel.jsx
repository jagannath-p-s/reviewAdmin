import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { FaSearch, FaSortUp, FaSortDown } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const fetchSalesmen = async () => {
    try {
      const { data, error } = await supabase
        .from("salesmen")
        .select("*")
        .order("points", { ascending: sortOrder === "asc" });

      if (error) {
        console.error("Error fetching salesmen:", error);
      } else {
        setSalesmen(data);
      }
    } catch (error) {
      console.error("Error fetching salesmen:", error);
    }
  };

  useEffect(() => {
    fetchSalesmen();
  }, [sortOrder]);

  useEffect(() => {
    const subscription = supabase
      .channel("realtime-salesmen")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "salesmen" },
        (payload) => {
          const { eventType, new: newData, old: oldData } = payload;

          if (eventType === "INSERT" || eventType === "UPDATE") {
            setSalesmen((prevSalesmen) => {
              const updatedSalesmen = prevSalesmen.filter(
                (salesman) => salesman.id !== newData.id
              );
              return [...updatedSalesmen, newData];
            });
          } else if (eventType === "DELETE") {
            setSalesmen((prevSalesmen) =>
              prevSalesmen.filter((salesman) => salesman.id !== oldData.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin-login');
  };

  const filteredSalesmen = salesmen.filter((salesman) =>
    salesman.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <img src="logo.png" alt="Company Logo" className="h-16" /> {/* Adjust logo path */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-150"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Review Count Table</h1>
        <p className="text-center">Powered by White Tap</p>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="relative w-full sm:w-1/4 mb-4 sm:mb-0">
          <input
            type="text"
            className="border rounded-lg p-3 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-3 top-3 text-gray-500">
            <FaSearch />
          </span>
        </div>

        <div className="relative w-full sm:w-1/4 mb-4 sm:mb-0">
          <input
            type="date"
            className="border rounded-lg p-3 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Filter by start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-1/4 mb-4 sm:mb-0">
          <input
            type="date"
            className="border rounded-lg p-3 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Filter by end date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={toggleSortOrder}
          className="bg-blue-500 text-white flex items-center px-5 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-150"
        >
          {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
          <span className="ml-2">Sort by Points</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="whitespace-nowrap px-6 py-4 font-medium text-left">
                Salesman Name
              </th>
              <th className="whitespace-nowrap px-6 py-4 font-medium text-left">
                Points
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredSalesmen.map((salesman) => (
              <tr
                key={salesman.id}
                className="bg-white hover:bg-gray-100 transition-colors duration-150"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {salesman.name}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {salesman.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
