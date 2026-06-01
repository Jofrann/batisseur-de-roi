import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import TopNav from "./TopNav";

export default function AppLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNav user={user} />
      <main>{children}</main>
    </div>
  );
}