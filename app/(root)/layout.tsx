import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'
import { WishlistProvider } from '@/app/context/WishlistContext'
import CartSidebar from './cart/components/CartSidebar';
import PageTransition from '@/components/PageTransition';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <PageTransition />
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            {children}
            <CartSidebar />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </div>
  );
}


