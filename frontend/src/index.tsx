import './styles/index.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';

import App from './App';
import { AuthenticationProvider } from './context/AuthenticationContext';
import reportWebVitals from './reportWebVitals';

const queryClient = new QueryClient();

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthenticationProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthenticationProvider>
  </React.StrictMode>,
);

reportWebVitals();
