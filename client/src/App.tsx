import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Trending from "@/pages/trending";
import NewSongs from "@/pages/new-songs";
import Top25 from "@/pages/top-25";
import NewCreators from "@/pages/new-creators";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import NotFound from "@/pages/not-found";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
