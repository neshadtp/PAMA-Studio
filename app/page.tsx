import Navbar from "../src/components/layout/Navbar";
import Hero from "../src/components/sections/Hero";
import WhyChoose from "../src/components/sections/WhyChoose";
import Stats from "../src/components/sections/Stats";
import Portofolios from "../src/components/sections/Portofolios";
import BestSeller from "../src/components/sections/BestSeller";
import Testimonials from "../src/components/sections/Testimonials";
import Contact from "../src/components/sections/Contact";
import Footer from "../src/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="bg-[#FBF7F1] text-[#1a0505]">
      <Navbar />

      <Hero />
      <WhyChoose />
      <Stats />
      <Portofolios />
      <BestSeller />
      <Testimonials />
      <Contact />
      
      <Footer />
    </main>
  );
}