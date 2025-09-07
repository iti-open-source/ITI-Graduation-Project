import Navbar from "@/components/home_components/navbar";
import React from "react";

export default function CustomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
