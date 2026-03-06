import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/portfolio/Navigation";
import HeroSection from "@/components/portfolio/HeroSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import SkillsSection from "@/components/portfolio/SkillsSection";
import CertificationsSection from "@/components/portfolio/CertificationsSection";
import AboutSection from "@/components/portfolio/AboutSection";
import ContactSection from "@/components/portfolio/ContactSection";
import Footer from "@/components/portfolio/Footer";
import OpenSourceSection from "@/components/portfolio/OpenSourceSection.jsx";
import { toast } from "@/components/ui/use-toast";

export default function Portfolio() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else if (location.hash === "#certifications") {
          toast({
            title: "Certifications",
            description: "No certifications are available at the moment. Please check back soon.",
          });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navigation />
      <HeroSection />
      <SkillsSection />
      <CertificationsSection />
      <ProjectsSection />
      <OpenSourceSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
