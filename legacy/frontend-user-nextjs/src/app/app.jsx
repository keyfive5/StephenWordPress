"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RTL from "@/app/(DashboardLayout)/layout/shared/customizer/RTL";
import { ThemeSettings } from "@/utils/theme/Theme";
import { CustomizerContext } from "@/app/context/customizerContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import "@/utils/i18n";
import "../app/global.css";
import "react-quill/dist/quill.snow.css";

const MyApp = ({ children }) => {
  const theme = ThemeSettings();
  const { activeDir } = useContext(CustomizerContext);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isLoginPage = pathname.startsWith("/auth/auth1/login");
    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
    const userData = storedUser ? JSON.parse(storedUser) : null;

    setUser(userData);

    if (!userData && !isLoginPage) {
      setLoading(true);
      setTimeout(() => {
        router.replace("/auth/auth1/login");
      }, 500);
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("🔍 Session user:", user);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <RTL direction={activeDir}>
          <CssBaseline />
          {children}
        </RTL>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default MyApp;
