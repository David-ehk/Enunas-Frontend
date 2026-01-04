import { CartProvider } from "@/app/context/CartContext";
import Footer from "@/app/Homepage/components/footer";
import Navbar from "@/app/Homepage/components/navbar";
import CartSidebar from "../cart/components/CartSidebar";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      
       <Navbar/>
              {children}
             
        <Footer/>
      
    </main>
  );
}
