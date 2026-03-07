import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeaturesAndIndustries from "@/components/UseCases";
import DemoAndBenefits from "@/components/DemoPreviews";
import Pricing from "@/components/Pricing";
import TestimonialsAndCTA from "@/components/TestimonialsAndCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-[100vh] bg-slate-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-100">
      <Navigation />
      <Hero />
      <HowItWorks />
      <FeaturesAndIndustries />
      <DemoAndBenefits />
      <Pricing />
      <TestimonialsAndCTA />
      <Footer />
    </main>
  );
}
