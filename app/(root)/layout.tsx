import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'
import { WishlistProvider } from '@/app/context/WishlistContext'
import CartSidebar from './cart/components/CartSidebar';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
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


