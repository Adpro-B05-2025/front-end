import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Container, Typography, Button, Card, CardContent } from '@mui/material';

export default function DetailRating() {
    const router = useRouter();
    const { id } = router.query;
    const [ratingDetail, setRatingDetail] = useState(null);

    useEffect(() => {
      if (id) {
        fetch(`http://localhost:8080/api/ratings/${id}`)
          .then(res => res.json())
          .then(setRating)
          .catch(console.error);
      }
    }, [id]);


    const handleUpdate = async () => {
      await fetch(`http://localhost:8080/api/ratings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating)
      });
      setEditMode(false);
    };

    const handleDelete = async () => {
      await fetch(`http://localhost:8080/api/ratings/${id}`, { method: 'DELETE' });
      router.push('/profil/rating');
    };

    if (!ratingDetail) return <div>Loading...</div>;

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Detail Rating
            </Typography>
            <Card>
                <CardContent>
                    <Typography variant="h6">ID: {ratingDetail.id}</Typography>
                    <Typography>Rating: {ratingDetail.rating}</Typography>
                    <Typography>Komentar: {ratingDetail.comment}</Typography>
                    <Button variant="outlined" color="primary" onClick={handleEdit} sx={{ mr: 1 }}>
                        Edit
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleDelete}>
                        Hapus
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
}
