"use client";

import { usePathname } from "next/navigation";
import CustomerNav from "./Navigation/CustomerNav";
import AdminNav from "./Navigation/AdminNav";
import { useAuth } from "@/context/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { userRole, loading } = useAuth();

  // 1. Digital Display boards have no navigation
  if (pathname.startsWith("/display") || loading) {
    return null;
  }

  // 2. Conditional Nav based on Role
  if (userRole === "business_owner") {
    return <AdminNav />;
  }

  // 3. Guests and Customers get CustomerNav (includes Landing/Home)
  return <CustomerNav />;
}
