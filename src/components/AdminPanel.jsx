import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { FaSearch, FaSortUp, FaSortDown } from "react-icons/fa";
import 'tailwindcss/tailwind.css';

const AdminPanel = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSalesmen = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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

  const filteredSalesmen = salesmen.filter((salesman) =>
    salesman.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 pt-20 bg-white">
      <div className="text-center mb-8">
        <img src="logo.png" alt="Company Logo" className="mx-auto w-24 h-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Review Count Table</h1>
        <p className="text-gray-600">Powered by White Tap</p>
      </div>

      <div className="lg:flex lg:items-center lg:justify-between lg:mb-8 sticky top-16 z-10 p-4 bg-white rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 lg:mb-0 lg:space-x-4 w-full">
          <div className="relative mb-4 md:mb-0 flex-grow">
            <input
              type="text"
              className="border rounded-lg py-2 px-4 w-full focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
              <FaSearch />
            </span>
          </div>

      

          <button
            onClick={toggleSortOrder}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
            <span className="ml-2">Sort by Points</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      ) : filteredSalesmen.length === 0 ? (
        <div className="text-center text-gray-500">No salesmen found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSalesmen.map((salesman) => (
            <div
              key={salesman.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-800">{salesman.name}</h2>
              <p className="text-gray-600">Points: {salesman.points}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
