// pages/rating/form.js
import { useRouter } from 'next/router';
import { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';

export default function FormRating() {
  const router = useRouter();
  const { userId, dokterId, consultationId } = router.query;
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    const payload = {
      userId,
      doctorId: dokterId,
      consultationId,
      score,
      comment
    };

    const res = await fetch('http://localhost:8080/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      router.push('/profil/rating');
    } else {
      alert('Gagal mengirim rating');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Beri Rating untuk Dokter #{dokterId}</Typography>
      <TextField
        label="Rating (1-5)"
        type="number"
        value={score}
        onChange={(e) => setScore(parseInt(e.target.value))}
        inputProps={{ min: 1, max: 5 }}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Ulasan"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />
      <Button variant="contained" onClick={handleSubmit} disabled={score < 1 || score > 5 || !comment}>
        Kirim Rating
      </Button>
    </Container>
  );
}
