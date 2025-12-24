// app/catalogue/layout.tsx

import Footer from "@/app/Homepage/components/footer";
import MinTimeWrapper from "@/app/Homepage/components/MinTimeWrapper";
import Navbar from "@/app/Homepage/components/navbar";

//footer wird nicht angezeigt

export default function CatalogueLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MinTimeWrapper>
      <Navbar />
        {children}

       
      <Footer/>
      

    </MinTimeWrapper>
  )
}
 