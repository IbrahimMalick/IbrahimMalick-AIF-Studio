import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { setupIframeMessaging } from './lib/iframe-messaging';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PublicHome from './pages/PublicHome';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import DeveloperImplementationGuide from './pages/DeveloperImplementationGuide';
import ARIAConsole from './pages/ARIAConsole';
import AgentMonitor from './pages/AgentMonitor';
import EnterpriseAdmin from './pages/EnterpriseAdmin';
import SLATracking from './pages/SLATracking';
import AssetPublishing from './pages/AssetPublishing';
import ProjectDashboard from './pages/ProjectDashboard';
import LandingPageExport from './pages/LandingPageExport';
import AutoPostScheduler from './pages/AutoPostScheduler';
import AffiliateDashboard from './pages/AffiliateDashboard';
import PoeChat from './pages/PoeChat';
import ContentIdeas from './pages/ContentIdeas';
import CoachDashboard from './pages/CoachDashboard';
import ContentApprovalQueue from './pages/ContentApprovalQueue';
import VideoStudioPage from './pages/VideoStudioPage';
import YouTubeStudio from './pages/YouTubeStudio';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

setupIframeMessaging();

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <LayoutWrapper currentPageName={mainPageKey}>
      <Routes>
        <Route path="/Dashboard" element={<MainPage />} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={<Page />} />
        ))}
        <Route path="/ARIAConsole" element={<ARIAConsole />} />
        <Route path="/AgentMonitor" element={<LayoutWrapper currentPageName="AgentMonitor"><AgentMonitor /></LayoutWrapper>} />
        <Route path="/EnterpriseAdmin" element={<LayoutWrapper currentPageName="EnterpriseAdmin"><EnterpriseAdmin /></LayoutWrapper>} />
        <Route path="/SLATracking" element={<LayoutWrapper currentPageName="SLATracking"><SLATracking /></LayoutWrapper>} />
        <Route path="/AssetPublishing" element={<LayoutWrapper currentPageName="AssetPublishing"><AssetPublishing /></LayoutWrapper>} />
        <Route path="/ProjectDashboard" element={<LayoutWrapper currentPageName="ProjectDashboard"><ProjectDashboard /></LayoutWrapper>} />
        <Route path="/AutoPostScheduler" element={<LayoutWrapper currentPageName="AutoPostScheduler"><AutoPostScheduler /></LayoutWrapper>} />
        <Route path="/AffiliateDashboard" element={<LayoutWrapper currentPageName="AffiliateDashboard"><AffiliateDashboard /></LayoutWrapper>} />
        <Route path="/PoeChat" element={<LayoutWrapper currentPageName="PoeChat"><PoeChat /></LayoutWrapper>} />
        <Route path="/ContentIdeas" element={<LayoutWrapper currentPageName="ContentIdeas"><ContentIdeas /></LayoutWrapper>} />
        <Route path="/CoachDashboard" element={<LayoutWrapper currentPageName="CoachDashboard"><CoachDashboard /></LayoutWrapper>} />
        <Route path="/ContentApprovalQueue" element={<LayoutWrapper currentPageName="ContentApprovalQueue"><ContentApprovalQueue /></LayoutWrapper>} />
        <Route path="/VideoStudioPage" element={<LayoutWrapper currentPageName="VideoStudioPage"><VideoStudioPage /></LayoutWrapper>} />
        <Route path="/YouTubeStudio" element={<LayoutWrapper currentPageName="YouTubeStudio"><YouTubeStudio /></LayoutWrapper>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </LayoutWrapper>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <Routes>
            {/* Public routes — no login required */}
            <Route path="/" element={<PublicHome />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/dev-guide" element={<DeveloperImplementationGuide />} />
            <Route path="/landing-export" element={<LandingPageExport />} />
            {/* All authenticated app routes */}
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App