import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Authenticate from "./pages/Authenticate";
import Wholesale from "./pages/Wholesale";
import WholesaleLogin from "./pages/WholesaleLogin";
import WholesaleComplete from "./pages/WholesaleComplete";
import WholesalePortal from "./pages/WholesalePortal";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCodes from "./pages/admin/AdminCodes";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminImages from "./pages/admin/AdminImages";

function Router() {
  return (
    <Switch>
      {/* Public site */}
      <Route path="/" component={Home} />
      <Route path="/products/:key" component={ProductPage} />
      <Route path="/authenticate" component={Authenticate} />
      <Route path="/wholesale" component={Wholesale} />
      <Route path="/wholesale/login" component={WholesaleLogin} />
      <Route path="/wholesale/complete" component={WholesaleComplete} />
      <Route path="/wholesale/portal" component={WholesalePortal} />

      {/* Admin panel */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/codes" component={AdminCodes} />
      <Route path="/admin/logs" component={AdminLogs} />
      <Route path="/admin/inquiries" component={AdminInquiries} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/images" component={AdminImages} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
