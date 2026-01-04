import CartSidebar from '@/app/(root)/cart/components/CartSidebar'
import { CartProvider } from '@/app/context/CartContext'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <CartProvider>
        {children}
        <CartSidebar />
      </CartProvider>
    </main>
  );
}


