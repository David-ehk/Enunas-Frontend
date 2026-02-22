import Footer from "@/app/Homepage/components/footer";
import MinTimeWrapper from "@/app/Homepage/components/MinTimeWrapper";
import Navbar from "@/app/Homepage/components/navbar";


export default function NeuLayout({
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
 