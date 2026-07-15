'use client'
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useContext, useEffect, useState } from 'react';
import { CustomizerContext } from "@/app/context/customizerContext";
import { IconPower } from '@tabler/icons-react';
import Link from 'next/link';
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/app/store/authSlice";
import { persistor } from "@/app/store/store"; // 👈 import persistor

export const Profile = () => {
   const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';


  const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
    const user = storedUser ? JSON.parse(storedUser) : null;
    

  const handleLogout = () => {
    dispatch(logout());          // clear Redux slice
    persistor.purge();           // clear redux-persist storage
    window.location.href = '/auth/auth1/login'; // redirect
  };


  console.log('on logout page', user)



  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: `${'secondary.light'}` }}
    >
      {!hideMenu ? (
        <>
          {/* <Avatar alt="Remy Sharp" src={myImage} sx={{ height: 40, width: 40 }} /> */}

          <Box>
            <Typography variant="h6">{user?.name || "ADMIN"} </Typography>
            {/* <Typography variant="caption">{user?.role}</Typography> */}
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                component={Link}
                href="/auth/auth1/login"
                onClick={handleLogout}
                aria-label="logout"
                size="small"
              >
                <IconPower size="24" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : (
        ''
      )}
    </Box>
  );
};
