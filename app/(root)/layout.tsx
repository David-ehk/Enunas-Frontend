import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'
import CartSidebar from './cart/components/CartSidebar';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <AuthProvider>
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </AuthProvider>
    </main>
  );
}


