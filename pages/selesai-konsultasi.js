import { useRouter } from 'next/router';
import { Button, Container, Typography } from '@mui/material';

export default function SelesaiKonsultasi() {
  const router = useRouter();

  const handleBeriRating = () => {
    const userId = '456'; // nanti dari context/auth
    const dokterId = '789';
    const consultationId = '123-consultation'; // penting untuk validasi
    router.push(`/rating/form?userId=${userId}&dokterId=${dokterId}&consultationId=${consultationId}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Konsultasi Selesai</Typography>
      <Button variant="contained" onClick={handleBeriRating}>
        Beri Rating untuk Dokter
      </Button>
    </Container>
  );
}
