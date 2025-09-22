import FlashMessage from "@/components/flash-message";
import Navbar from "@/components/home_components/navbar";
import React from "react";
// import AppSidebarLayout from "./app/app-sidebar-layout";

interface LayoutProps {
  children: React.ReactNode;
  role?: string; // "student" | "admin" etc.
}

export default function CustomLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* {role === "student" && <Navbar />} */}
      <Navbar />
      {/* {role !== "student" && <AppSidebarLayout />} */}
      <FlashMessage />
      <main>{children}</main>
      {/* <Toaster position="bottom-right" /> */}
    </div>
  );
}
