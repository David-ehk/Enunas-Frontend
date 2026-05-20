import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'
import CartSidebar from './cart/components/CartSidebar';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <AuthProvider>
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}


