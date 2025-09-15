import FlashMessage from "@/components/flash-message";
import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout";
import { type BreadcrumbItem } from "@/types";
import { type ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
  <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
    <FlashMessage />
    {children}
    <Toaster position="bottom-right" />
  </AppLayoutTemplate>
);
