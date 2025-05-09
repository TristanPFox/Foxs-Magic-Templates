import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthProvider';
import { NavbarProvider } from './NavbarContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <NavbarProvider>
      <App />
    </NavbarProvider>
  </AuthProvider>
);