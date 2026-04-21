import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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
import AuthPage from "./pages/Auth";
import { useAnalytics } from "./hooks/useAnalytics";

// Analytics wrapper that tracks page views on every route change
function AnalyticsWrapper() {
  const { trackPageView } = useAnalytics();
  // Page view tracking is handled inside useAnalytics via location changes
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
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

      {/* Club admin */}
      <Route path="/auth/login" component={AuthPage} />
      <Route path="/auth/signup" component={AuthPage} />
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
