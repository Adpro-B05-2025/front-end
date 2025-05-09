import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Typography, Container } from '@mui/material';

export default function RatingSaya() {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/ratings/user/${userId}`)
      .then(res => res.json())
      .then(data => setRatings(data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus rating ini?')) {
      const res = await fetch(`http://localhost:8080/api/ratings/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setRatings(ratings.filter((r) => r.id !== id));
      } else {
        alert('Gagal menghapus rating');
      }
    }
  };

  const handleEdit = (id) => {
    router.push(`/rating/${id}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Rating yang Kamu Berikan</Typography>
      {ratings.map((r) => (
        <Card key={r.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{r.dokterNama}</Typography>
            <Typography>Rating: {r.rating}</Typography>
            <Typography>Ulasan: {r.comment}</Typography>
            <Button variant="outlined" color="primary" onClick={() => handleEdit(r.id)} sx={{ mr: 1 }}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={() => handleDelete(r.id)}>
              Hapus
            </Button>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
