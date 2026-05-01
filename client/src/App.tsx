import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import CityPage from "./pages/CityPage";
import SportCityPage from "./pages/SportCityPage";
import ClubProfile from "./pages/ClubProfile";
import Events from "./pages/Events";
import SubmitClub from "./pages/SubmitClub";
import ClaimClub from "./pages/ClaimClub";
import MyClubs from "./pages/MyClubs";
import EditClub from "./pages/EditClub";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import SystemAdminLogin from "./pages/SystemAdminLogin";
import SystemConsole from "./pages/SystemConsole";
import { useAnalytics } from "./hooks/useAnalytics";

// Analytics wrapper that tracks page views on every route change
function AnalyticsWrapper() {
  const { trackPageView } = useAnalytics();
  // Page view tracking is handled inside useAnalytics via location changes
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const hidePublicChrome = location.startsWith("/system");
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hidePublicChrome && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hidePublicChrome && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public discovery */}
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/events" component={Events} />

      {/* SEO-friendly city/sport routes */}
      <Route path="/india/:city">
        {(params) => <CityPage params={params} />}
      </Route>
      <Route path="/india/:city/:sportSlug">
        {(params) => <SportCityPage params={params} />}
      </Route>

      {/* Club profile */}
      <Route path="/clubs/:slug">
        {(params) => <ClubProfile params={params} />}
      </Route>

      {/* Owner system console (separate login) */}
      <Route path="/system/login" component={SystemAdminLogin} />
      <Route path="/system" component={SystemConsole} />

      {/* Club admin */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/signup" component={SignUpPage} />
      <Route path="/submit" component={SubmitClub} />
      <Route path="/clubs/:slug/claim">
        {(params) => <ClaimClub params={params} />}
      </Route>
      <Route path="/my-clubs" component={MyClubs} />
      <Route path="/my-clubs/:id/edit">
        {(params) => <EditClub params={params} />}
      </Route>

      {/* Admin dashboard */}
      <Route path="/admin" component={AdminDashboard} />

      {/* Fallback */}
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
          <Toaster position="top-right" richColors />
          <AnalyticsWrapper />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
