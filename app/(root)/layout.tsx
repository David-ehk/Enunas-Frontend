import Navbar from "../Homepage/components/navbar";
import Footer from "../Homepage/components/footer"
export default function({children}:Readonly <{ children: React.ReactNode}> ){
    return(
        <main className="text-3xl">
            
            <Navbar/>

            {children}
           <section className=" bg-[#370E4D] w-full sm:px-16 px-8 sm:pt-24 pt-12 pb-8"> 
            <Footer/>
            </section>
        </main>

    )
}
