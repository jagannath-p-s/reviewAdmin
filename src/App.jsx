import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AdminPanel from "./components/AdminPanel";

const supabaseUrl = "https://smfonqblavmkgmcylqoc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZm9ucWJsYXZta2dtY3lscW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIxMjI0MjQsImV4cCI6MjAyNzY5ODQyNH0.Yk9jlcLu2Svi8cAsQLuMJHflvBqbtusICyNj2ZfrVZg";
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = new URL(window.location.href);
        const salespersonId = url.pathname.split("/")[2];

        if (salespersonId) {
          const { data, error } = await supabase
            .from("salesmen")
            .select("points")
            .eq("id", salespersonId)
            .single();

          if (error) {
            setError("Error fetching points");
          } else {
            const updatedPoints = (data.points || 0) + 1;
            const { error: updateError } = await supabase
              .from("salesmen")
              .update({ points: updatedPoints })
              .eq("id", salespersonId);

            if (updateError) {
              setError("Error updating points");
            } else {
              window.location.href =
                "https://search.google.com/local/writereview?placeid=ChIJEUxg2ZLvpzsRZAYNK_VEU5Y";
            }
          }
        }
      } catch (error) {
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <AdminPanel />
    </>
  );
};

export default App;
