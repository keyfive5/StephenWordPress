'use client';
import Box from '@mui/material/Box';
import { Container, Grid } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import { Card, CardContent, Typography } from '@mui/material';
export default function Dashboard() {

  return (
  <Container
  style={{marginTop:'30px'}}
        maxWidth="md"
        

        sx={{
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src="https://takeout.appcostcalculator.ca/wp-content/uploads/2025/02/all-take-out-logo.jpg"
          alt="Northern Institute Logo"
          sx={{
            width: 160,
            mb: 4,
          }}
        />

        {/* Main Heading */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          Restaurant Takeout Labels & Stickers

        </Typography>

        {/* Subheading */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 400,
            mb: 4,
          }}
        >
          The perfect label made easy. With our customization tool design labels and stickers for takeout food delivery bags
        </Typography>

        
      </Container>

  );
}
