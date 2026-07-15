import Link from 'next/link';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageContainer from '@/app/components/container/PageContainer';
import Logo from '@/app/(DashboardLayout)/layout/shared/logo/Logo';
import AuthLogin from '../../authForms/AuthLogin';
import Image from 'next/image';

export default function Login() {
  return (
         <Grid
          maxWidth={400}
         marginX='auto'
         marginTop='80px'
          >
          <Box p={4}>
            <AuthLogin
              title="SIGN IN"
              subtext={
                <Typography variant="subtitle1" color="textSecondary" mb={1}>
                  Your Admin Dashboard
                </Typography>
              }
            />
          </Box>
        </Grid>
  );
};

