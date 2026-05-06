"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import WhyChoose from "@/components/sections/WhyChoose";
import Stats from "@/components/sections/Stats";
import Portofolios from "@/components/sections/Portofolios";
import BestSeller from "@/components/sections/BestSeller";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

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