import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowLeft } from "lucide-react";
import Home from "@/pages/home";
import Trending from "@/pages/trending";
import NewSongs from "@/pages/new-songs";
import Top25 from "@/pages/top-25";
import NewCreators from "@/pages/new-creators";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import Upload from "@/pages/upload";
import CreatorProfile from "@/pages/creator-profile";
import CreatorDashboard from "@/pages/creator-dashboard";
import Downloads from "@/pages/downloads";
import TrackPage from "@/pages/track";
import Mockup from "@/pages/mockup";
import Playlist from "@/pages/playlist";
import NotFound from "@/pages/not-found";
import { AudioPlayerProvider } from "@/lib/audioPlayer";
import { PlaylistProvider } from "@/lib/playlistContext";

function FloatingHomeButton() {
  const [location] = useLocation();
  if (location === "/") return null;
  return (
    <a
      href="/"
      data-testid="floating-back-home"
      className="floating-home-btn"
    >
      <ArrowLeft size={16} />
      Home
    </a>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/trending" component={Trending} />
      <Route path="/new-songs" component={NewSongs} />
      <Route path="/top-25" component={Top25} />
      <Route path="/new-creators" component={NewCreators} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/upload" component={Upload} />
      <Route path="/track/:id" component={TrackPage} />
      <Route path="/creator/:id/dashboard" component={CreatorDashboard} />
      <Route path="/creator/:id" component={CreatorProfile} />
      <Route path="/playlist" component={Playlist} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/mockup" component={Mockup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioPlayerProvider>
          <PlaylistProvider>
            <Toaster />
            <FloatingHomeButton />
            <Router />
          </PlaylistProvider>
        </AudioPlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
