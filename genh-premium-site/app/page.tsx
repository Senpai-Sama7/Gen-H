import { Nav } from "@/app/components/Nav";
import { Footer } from "@/app/components/Footer";
import { Hero } from "@/app/sections/Hero";
import { Funnel } from "@/app/sections/Funnel";
import { Features } from "@/app/sections/Features";
import { BriefForm } from "@/app/sections/BriefForm";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Funnel />
        <Features />
        <BriefForm />
      </main>
      <Footer />
    </>
  );
}
