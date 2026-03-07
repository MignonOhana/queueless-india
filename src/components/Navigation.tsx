"use client";

import { usePathname } from "next/navigation";
import CustomerNav from "./Navigation/CustomerNav";
import AdminNav from "./Navigation/AdminNav";

export default function Navigation() {
  const pathname = usePathname();

  // Route determining logic
  
  // 1. Digital Display boards have no navigation, maximizing screen space for tokens
  if (pathname.startsWith("/display")) {
    return null;
  }

  // Hide on new mobile-first /home marketplace
  if (pathname.startsWith("/home")) {
    return null;
  }

  // 2. Admin/Business Dashboard
  if (pathname.startsWith("/dashboard")) {
    return <AdminNav />;
  }

  // 3. The general app flow (Landing Page, Customer Queue, Map) gets the Customer Nav
  return <CustomerNav />;
}
