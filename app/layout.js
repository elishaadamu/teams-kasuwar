"use client";
import { useEffect } from "react";
import axios from "axios";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar"; // Import Navbar
import Footer from "@/components/Footer"; // Import Footer
import { usePathname } from "next/navigation";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isSpecialRoute =
    pathname.startsWith("/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/vendor-signup") ||
    pathname.startsWith("/vendor-signin") ||
    pathname.startsWith("/delivery-signup") ||
    pathname.startsWith("/delivery-signin") ||
    pathname.startsWith("/delivery-dashboard") ||
    pathname.startsWith("/agent-dashboard") ||
    pathname.startsWith("/bdm-dashboard") ||
    pathname.startsWith("/bd-dashboard") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/vendor-dashboard");

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = "/";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased text-gray-700`}>
        <ToastContainer />
        <AppContextProvider>
          {!isSpecialRoute && <Navbar />}
          {children}
          {!isSpecialRoute && <Footer />}
        </AppContextProvider>
      </body>
    </html>
  );
}
