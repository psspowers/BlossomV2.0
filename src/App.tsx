
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { useEffect, useState } from "react";
import { seedDatabase } from "./lib/seed";

const queryClient = new QueryClient();

const App = () => {
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await seedDatabase();
      setSeeded(true);
    };

    initializeApp();
  }, []);

  if (!seeded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-teal-400 text-xl font-medium mb-2">Blossom</div>
          <div className="text-slate-400 text-sm animate-pulse">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
