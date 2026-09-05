import { useLayoutEffect } from "react";
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
import AdminSubscribers from "@/pages/admin/AdminSubscribers";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminImages from "@/pages/admin/AdminImages";

/* ─── Scroll-to-top ──────────────────────────────────────────────────────────
   Resetting on route change alone isn't enough:

   1. Browsers default to scrollRestoration "auto" and restore the previous
      offset on reload — after React has mounted, so it overwrites anything the
      effect did. It has to be switched to "manual".
   2. On first paint the page is still short (the video, images and lazily
      revealed sections haven't laid out yet), so scrolling to 0 is a no-op and
      the browser lands mid-page once the content arrives. Re-asserting across
      the next couple of frames covers that.                                    */
function ScrollToTop({ ready }: { ready: boolean }) {
  const [location] = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    const toTop = () => window.scrollTo(0, 0);
    toTop();
    const a = requestAnimationFrame(() => {
      toTop();
      // Second frame: catches layout that settles after the first paint.
      requestAnimationFrame(toTop);
    });
    return () => cancelAnimationFrame(a);
  }, [location, ready]);

  return null;
}

/* ─── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <ScrollToTop ready />
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
        <Route path="/admin/subscribers" component={AdminSubscribers} />
        <Route path="/admin/images" component={AdminImages} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}
