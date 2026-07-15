import MainLayout from "@/components/layout/MainLayout";
import { Separator } from "@/components/ui/separator";
import Hero from "@/components/marketing/Hero";
import ProblemSection from "@/components/marketing/ProblemSection";
import SolutionSection from "@/components/marketing/SolutionSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import ClusterSection from "@/components/marketing/ClusterSection";
import TechStrip from "@/components/marketing/TechStrip";
import FinalCTA from "@/components/marketing/FinalCTA";

export default function LandingPage() {
  return (
    <MainLayout>
      <Hero />
      <Separator className="mx-auto max-w-6xl" />
      <ProblemSection />
      <Separator className="mx-auto max-w-6xl" />
      <SolutionSection />
      <Separator className="mx-auto max-w-6xl" />
      <FeaturesGrid />
      <Separator className="mx-auto max-w-6xl" />
      <ClusterSection />
      <Separator className="mx-auto max-w-6xl" />
      <TechStrip />
      <FinalCTA />
    </MainLayout>
  );
}
