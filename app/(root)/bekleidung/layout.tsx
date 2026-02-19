import Footer from "@/app/Homepage/components/footer";
import DisappearingNavbar from "./components/DisappearingNavbar";

export default function BekleidungLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <DisappearingNavbar />
      <div className="h-[73px]" />
      {children}
      <Footer />
    </>
  );
}
