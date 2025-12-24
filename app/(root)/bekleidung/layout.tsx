import Footer from "@/app/Homepage/components/footer";
import Navbar from "@/app/Homepage/components/navbar";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
       <Navbar/>
              {children}
        <Footer/>
      
    </main>
  );
}
