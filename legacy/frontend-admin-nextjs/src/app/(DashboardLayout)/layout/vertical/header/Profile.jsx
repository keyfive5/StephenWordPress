'use client'
import React, { useState, useContext } from 'react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import * as dropdownData from './data';

import { IconMail } from '@tabler/icons-react';
import { Stack } from '@mui/system';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUserImage } from "@/app/store/authSlice"; 
import { persistor } from "@/app/store/store";
import BASE_URL from '@/utils/api';
import { CustomizerContext } from "@/app/context/customizerContext";
import { styled } from '@mui/material/styles';
import WbSunnyTwoToneIcon from '@mui/icons-material/WbSunnyTwoTone';
import DarkModeTwoToneIcon from '@mui/icons-material/DarkModeTwoTone';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
    const userData = storedUser ? JSON.parse(storedUser) : null;

  const dispatch = useDispatch();
  const user = userData;

  const token = userData?.token; // depends on your authSlice

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => setAnchorEl2(null);

  const handleUploadClick = () => setDialogOpen(true);
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedImage || !token) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      setUploading(true);
      const res = await axios.post(
        `${BASE_URL}/admin/auth/editImage`,
        formData,
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // ✅ update Redux store with new image
      dispatch(updateUserImage(res.data.data.image));

      handleDialogClose();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    persistor.purge();
    window.location.href = "/auth/auth1/login";
  };

   const {
    activeDir,
    setActiveDir,
    activeMode,
    setActiveMode,
    isCollapse,
    setIsCollapse,
    activeTheme,
    activeLayout,
    setActiveLayout,
    isLayout,
    isCardShadow,
    setIsCardShadow,
    setIsLayout,
    isBorderRadius,
    setIsBorderRadius,
    setActiveTheme
  } = useContext(CustomizerContext);

    const StyledBox = styled(Box)(({ theme }) => ({
      boxShadow: theme.shadows[8],
      padding: '20px',
      cursor: 'pointer',
      justifyContent: 'center',
      display: 'flex',
      transition: '0.1s ease-in',
      border: '1px solid rgba(145, 158, 171, 0.12)',
      '&:hover': {
        transform: 'scale(1.05)',
      },
    }));

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        onClick={handleClick2}
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
      >
        <Avatar
          src={user?.image || '/images/profile/user-1.jpg'}
          alt="ProfileImg"
          sx={{ width: 35, height: 35 }}
        />
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 4,
          },
        }}
      >
        <Typography variant="h5">User Profile</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar
            src={user?.image || '/images/profile/user-1.jpg'}
            alt="ProfileImg"
            sx={{ width: 95, height: 95 }}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.name || "ADMIN"}
            </Typography>
            {/* <Typography variant="subtitle2" color="textSecondary">
              {user?.role}
            </Typography> */}
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              {user?.email}
            </Typography>
          </Box>
        </Stack>
        {/* <Box mt={2}>
         <Typography variant="h6" gutterBottom>
              Theme Option
            </Typography>
            <Stack direction={'row'} gap={2} my={2} >
              <StyledBox  onClick={() => setActiveMode("light")} display="flex" gap={1}>
                <WbSunnyTwoToneIcon
                  color={activeMode === 'light' ? 'primary' : 'inherit'}
                />
              </StyledBox>
              <StyledBox onClick={() => setActiveMode("dark")} display="flex" gap={1}>
                <DarkModeTwoToneIcon
                  color={activeMode === 'dark' ? 'primary' : 'inherit'}
                />
              </StyledBox>
            </Stack>
        </Box> */}
        
        <Divider />
          <Box mt={2}>
            <Button
              fullWidth
              onClick={handleLogout}
              variant="contained"
              sx={{
                backgroundColor: '#012068',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '6px',
                py: 1.2,
                '&:hover': {
                  backgroundColor: '#2e4886ff',
                },
              }}
            >
              Logout
            </Button>
          </Box>
      </Menu>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Upload Profile Image</DialogTitle>
        <DialogContent>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !selectedImage}>
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
