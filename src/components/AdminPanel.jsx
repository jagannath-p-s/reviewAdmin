import React, { useEffect, useState } from "react"; // Correct import of useState
import { supabase } from "../supabase";
import { FaSearch, FaSortUp, FaSortDown } from "react-icons/fa";

const AdminPanel = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // Corrected use of useState
  const [searchTerm, setSearchTerm] = useState(""); // Corrected use of useState



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
    fetchSalesmen(); // Fetch data when component mounts
  }, [sortOrder]); // Refetch data when sortOrder changes

  // Real-time update handler for salesmen changes
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
      supabase.removeChannel(subscription); // Clean up on component unmount
    };
  }, []);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredSalesmen = salesmen.filter((salesman) =>
    salesman.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <input
            type="text"
            className="border rounded-md p-2 pr-10 w-full"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-0 pr-2 top-2 text-gray-500">
            <FaSearch />
          </span>
        </div>

        <button
          onClick={toggleSortOrder}
          className="bg-blue-500 text-white flex items-center px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-150"
        >
          {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
          <span className="ml-2">Sort by Points</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-left">
                Salesman Name
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-left">
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
                <td className="border px-4 py-2 font-medium text-gray-900">
                  {salesman.name}
                </td>
                <td className="border px-4 py-2 text-gray-700">
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
