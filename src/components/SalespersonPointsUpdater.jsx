import  { useEffect, useState } from "react"; // Correct import of useState
import { supabase } from "../supabase";
import { useLocation } from 'react-router-dom';

const SalespersonPointsUpdater = () => {
    const location = useLocation();
  
    useEffect(() => {
      const handleRedirect = async () => {
        try {
          const url = new URL(window.location.href);
          const salespersonId = url.pathname.split('/')[2];
          if (salespersonId) {
            const { data, error } = await supabase
              .from('salesmen')
              .select('points')
              .eq('id', salespersonId)
              .single();
            if (error) {
              console.log('Error fetching points');
            } else {
              const updatedPoints = (data.points || 0) + 1;
              const { error: updateError } = await supabase
                .from('salesmen')
                .update({ points: updatedPoints })
                .eq('id', salespersonId);
              if (updateError) {
                console.log('Error updating points');
              } else {
                console.log('Points updated successfully');
                window.location.href = 'https://search.google.com/local/writereview?placeid=ChIJEUxg2ZLvpzsRZAYNK_VEU5Y';
              }
            }
          }
        } catch (error) {
          console.log('An error occurred');
        }
      };
  
      if (location.pathname.endsWith('/app/id')) {
        handleRedirect();
      }
    }, [location.pathname]);
  
    if (!location.pathname.endsWith('/app/id')) {
      return null;
    }
  
    return <div>Updating salesperson points...</div>;
  };
  
  export default SalespersonPointsUpdater;