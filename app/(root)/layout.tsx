import { CartProvider } from '@/app/context/CartContext'
import CartSidebar from './cart/components/CartSidebar';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <CartProvider>
        {children}
        < CartSidebar/>
      </CartProvider>
    </main>
  );
}


