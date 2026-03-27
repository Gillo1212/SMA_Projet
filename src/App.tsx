import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ClientAuthProvider } from './contexts/ClientAuthContext';

function App() {
  return (
    <AuthProvider>
      <ClientAuthProvider>
        <CartProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </ClientAuthProvider>
    </AuthProvider>
  );
}

export default App;
