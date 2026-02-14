import Footer from "@/app/Homepage/components/footer";
import Navbar from "@/app/Homepage/components/navbar";

export default function BekleidungLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
