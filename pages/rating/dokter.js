import { useEffect, useState } from 'react';
import { Container, Card, CardContent, Typography } from '@mui/material';

export default function RatingPublik() {
  const [publicRatings, setPublicRatings] = useState([]);
  const doctorId = 'doctor-uuid-789'; // ganti sesuai routing/profile dokter

  useEffect(() => {
    fetch(`http://localhost:8080/api/ratings/doctor/${doctorId}`)
      .then(res => res.json())
      .then(setPublicRatings)
      .catch(console.error);
  }, []);


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Rating untuk Dokter</Typography>
      {publicRatings.map((r) => (
        <Card key={r.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography><strong>User ID:</strong> {r.userId}</Typography>
            <Typography><strong>Rating:</strong> {r.score}</Typography>
            <Typography><strong>Komentar:</strong> {r.comment}</Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
