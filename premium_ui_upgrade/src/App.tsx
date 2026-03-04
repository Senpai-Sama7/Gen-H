import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from './hooks/useLenis';
import { siteConfig } from './config';

// Sections
import Hero from './sections/Hero';
import NarrativeText from './sections/NarrativeText';
import CardStack from './sections/CardStack';
import BreathSection from './sections/BreathSection';
import ZigZagGrid from './sections/ZigZagGrid';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const snapTriggerRef = useRef<ScrollTrigger | null>(null);
  
  // Initialize Lenis smooth scrolling
  useLenis();

  useEffect(() => {
    // Set document language if configured
    if (siteConfig.language) {
      document.documentElement.lang = siteConfig.language;
    }

    // Wait for all sections to mount and create their ScrollTriggers
    const setupSnap = () => {
      // Small delay to ensure all ScrollTriggers are created
      setTimeout(() => {
        const pinned = ScrollTrigger.getAll()
          .filter(st => st.vars.pin)
          .sort((a, b) => a.start - b.start);
        
        const maxScroll = ScrollTrigger.maxScroll(window);
        
        if (!maxScroll || pinned.length === 0) return;

        // Build ranges and snap targets from pinned sections
        const pinnedRanges = pinned.map(st => ({
          start: st.start / maxScroll,
          end: (st.end ?? st.start) / maxScroll,
          center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
        }));

        // Create global snap ScrollTrigger
        snapTriggerRef.current = ScrollTrigger.create({
          snap: {
            snapTo: (value: number) => {
              // Check if within any pinned range (with small buffer)
              const inPinned = pinnedRanges.some(
                r => value >= r.start - 0.02 && value <= r.end + 0.02
              );
              
              // If not in a pinned section, allow free scroll
              if (!inPinned) return value;

              // Find nearest pinned center
              const target = pinnedRanges.reduce((closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value) 
                  ? r.center 
                  : closest,
                pinnedRanges[0]?.center ?? 0
              );

              return target;
            },
            duration: { min: 0.18, max: 0.55 },
            delay: 0,
            ease: "power2.out",
          }
        });
      }, 100);
    };

    // Setup snap after content loads
    const handleLoad = () => {
      ScrollTrigger.refresh();
      setupSnap();
    };

    window.addEventListener('load', handleLoad);
    
    // Also setup after a short delay
    const setupTimeout = setTimeout(setupSnap, 500);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(setupTimeout);
      if (snapTriggerRef.current) {
        snapTriggerRef.current.kill();
      }
    };
  }, []);

  return (
    <div ref={mainRef} className="relative bg-genh-black">
      {/* Noise overlay for premium texture */}
      <div className="noise-overlay" aria-hidden="true" />
      
      {/* Hero Section */}
      <Hero />

      {/* Narrative Text Section */}
      <NarrativeText />

      {/* Card Stack Parallax Gallery - PINNED */}
      <CardStack />

      {/* BREATH Video Mask Section */}
      <BreathSection />

      {/* Zig-Zag Grid Section */}
      <ZigZagGrid />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
