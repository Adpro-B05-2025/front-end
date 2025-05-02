import { useEffect, useState } from 'react';
import axios from 'axios';

const RatingPage = () => {
  const [ratings, setRatings] = useState([]); 

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get('#'); 
        setRatings(response.data); 
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, []); 

  return (
    <div>
      <h1>Ratings</h1>
      <ul>
        {ratings.map((rating) => (
          <li key={rating.id}>
            <strong>Rating:</strong> {rating.rating} <br />
            <strong>Comment:</strong> {rating.comment}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RatingPage;
