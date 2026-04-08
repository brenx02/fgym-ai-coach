import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Navbar from "@/components/layout/Navbar";

const Landing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm text-muted-foreground">
          ⚠️ Este app não substitui médico ou fisioterapeuta.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          © 2026 Fgym — Personal Trainer com IA
        </p>
      </div>
    </footer>
  </div>
);

export default Landing;
