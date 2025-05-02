import { useState } from 'react';
import axios from 'axios';
import { Button, TextField } from '@mui/material'; // Komponen UI dari Material UI

const RatingForm = () => {
  const [rating, setRating] = useState(0); // State untuk rating
  const [comment, setComment] = useState(''); // State untuk komentar

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman saat submit
    try {
      // Mengirim data rating dan komentar ke backend
      const response = await axios.post('http://localhost:8080/api/rating', { rating, comment });
      if (response.status === 200) {
        alert('Rating submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Rating (1-5)"
        type="number"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        inputProps={{ min: 1, max: 5 }}
        required
      />
      <TextField
        label="Your Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        multiline
        rows={4}
        required
      />
      <Button type="submit" variant="contained">Submit Rating</Button>
    </form>
  );
};

export default RatingForm;
