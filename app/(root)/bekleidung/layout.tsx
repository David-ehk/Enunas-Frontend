import Footer from "@/app/Homepage/components/footer";

export default function BekleidungLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
