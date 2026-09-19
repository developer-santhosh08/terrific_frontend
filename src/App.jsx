import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './routes/AppRouter';
import { LoaderProvider } from './context/LoaderContext';
import { PermissionProvider } from './context/PermissionContext';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetching when window regains focus for performance
      retry: 1, // Only retry failed requests once
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes by default
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionProvider>
        <LoaderProvider>
          <Router>
            <AppRouter />
          </Router>
        </LoaderProvider>
      </PermissionProvider>
    </QueryClientProvider>
  );
}

export default App;
