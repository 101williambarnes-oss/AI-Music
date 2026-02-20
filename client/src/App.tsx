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
import Downloads from "@/pages/downloads";
import Mockup from "@/pages/mockup";
import NotFound from "@/pages/not-found";
import { AudioPlayerProvider } from "@/lib/audioPlayer";

function FloatingHomeButton() {
  const [location] = useLocation();
  if (location === "/") return null;
  return (
    <a
      href="/"
      data-testid="floating-back-home"
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(7,10,20,.85)",
        border: "1px solid rgba(108,240,255,.3)",
        borderRadius: 40,
        padding: "10px 18px 10px 14px",
        color: "#6cf0ff",
        textDecoration: "none",
        fontSize: "0.85rem",
        fontWeight: 600,
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,.5), 0 0 12px rgba(108,240,255,.15)",
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,.6), 0 0 20px rgba(108,240,255,.25)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,.5), 0 0 12px rgba(108,240,255,.15)";
      }}
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
      <Route path="/creator/:id" component={CreatorProfile} />
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
          <Toaster />
          <FloatingHomeButton />
          <Router />
        </AudioPlayerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
