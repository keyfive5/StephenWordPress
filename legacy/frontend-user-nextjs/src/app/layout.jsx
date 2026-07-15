import React from "react";
import NextTopLoader from "nextjs-toploader";
import "./global.css";
import { CustomizerContextProvider } from "./context/customizerContext";
import Providers from "./providers";

export const metadata = {
  title: "Dashbaord",
  description: "Dashboard Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader color="#5D87FF" />
        <CustomizerContextProvider>
          <Providers>{children}</Providers>
        </CustomizerContextProvider>
      </body>
    </html>
  );
}
