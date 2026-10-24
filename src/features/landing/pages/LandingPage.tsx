import { LandingNav } from '../components/LandingNav'
import { HeroSection } from '../components/HeroSection'
import { WorkflowSection } from '../components/WorkflowSection'
import { CapabilitiesSection } from '../components/CapabilitiesSection'
import { RiskGraphSection } from '../components/RiskGraphSection'
import { TrustSection } from '../components/TrustSection'
import { ProductPreviewSection } from '../components/ProductPreviewSection'
import { ConversionSection } from '../components/ConversionSection'
import { LandingFooter } from '../components/LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-accent/20 selection:text-accent">
      {/* Top Floating Glass Navigation */}
      <LandingNav />

      {/* Main Page Content */}
      <main id="main">
        {/* Section 1: Hero with 3D Financial Intelligence Card */}
        <HeroSection />

        {/* Section 2: 5-Stage Intelligence Journey */}
        <WorkflowSection />

        {/* Section 3: Financial Intelligence in Motion */}
        <CapabilitiesSection />

        {/* Section 4: Signature Risk Investigation Graph */}
        <RiskGraphSection />

        {/* Section 5: Trust, Transparency & Responsible AI */}
        <TrustSection />

        {/* Section 6: Interactive Product Preview */}
        <ProductPreviewSection />

        {/* Section 7: Clear Conversion Section */}
        <ConversionSection />
      </main>

      {/* Institutional Footer */}
      <LandingFooter />
    </div>
  )
}
