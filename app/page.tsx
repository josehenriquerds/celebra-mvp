import Camp from "@/components/Camp";
import ContactSection from "@/components/Contact";
import Features from "@/components/Features";
import GetApp from "@/components/GetApp";
import Guide from "@/components/Guide";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <>
      <Hero />
      <Camp />
      <Guide />
      <Features />
      <Pricing />
      <ContactSection />
      <GetApp />
    </>
  )
}
