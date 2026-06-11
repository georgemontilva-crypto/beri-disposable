import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState, useCallback } from "react";
import { Route, Switch, useLocation } from "wouter";

// Public pages
import Home from "@/pages/Home";
import ProductPage from "@/pages/ProductPage";
import Authenticate from "@/pages/Authenticate";
import Wholesale from "@/pages/Wholesale";
import WholesaleLogin from "@/pages/WholesaleLogin";
import WholesaleComplete from "@/pages/WholesaleComplete";
import WholesalePortal from "@/pages/WholesalePortal";
import NotFound from "@/pages/NotFound";

// Admin pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCodes from "@/pages/admin/AdminCodes";
import AdminLogs from "@/pages/admin/AdminLogs";
import AdminInquiries from "@/pages/admin/AdminInquiries";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminImages from "@/pages/admin/AdminImages";

/* ─── Scroll-to-top on route change ──────────────────────────────────────── */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

/* ─── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [loading, setLoading] = useState(true);
  const handleDone = useCallback(() => setLoading(false), []);

  return (
    <>
      {loading && <LoadingScreen onDone={handleDone} />}
      <ScrollToTop />
      <Switch>
        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/products/:key" component={ProductPage} />
        <Route path="/authenticate" component={Authenticate} />
        <Route path="/wholesale" component={Wholesale} />
        <Route path="/wholesale/login" component={WholesaleLogin} />
        <Route path="/wholesale/complete" component={WholesaleComplete} />
        <Route path="/wholesale/portal" component={WholesalePortal} />

        {/* Admin */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/codes" component={AdminCodes} />
        <Route path="/admin/logs" component={AdminLogs} />
        <Route path="/admin/inquiries" component={AdminInquiries} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/images" component={AdminImages} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}
