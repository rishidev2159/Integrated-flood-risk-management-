"use client";

import { motion } from "framer-motion";
import FileUploader from "@/components/upload/FileUploader";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Shield, Zap, BarChart3, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="landing-main">
      {/* Animated Background Elements */}
      <div className="bg-gradient-glow" />
      
      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content"
          >
            <div className="badge-premium">Civil Engineering Research Initiative</div>
            <h1 className="hero-title">
              Integrated Flood Risk <span className="text-accent">Management</span>
            </h1>
            <p className="hero-subtitle">A SQL and GIS Based Approach</p>
            <div className="author-credits">
              <p><b>Authors:</b> R. Rohith Babu, Krishnam Raju, Sagar, Rishi Dev, Santhosh</p>
              <p className="text-muted">Vignan&apos;s Institute of Information Technology (A), AP, India</p>
            </div>

            {/* Prominent Data Ingestion Flow */}
            <div className="mt-12 w-full max-w-4xl mx-auto">
              <div className="badge-premium mb-4">Phase 1: Multi-Temporal Data Ingestion</div>
              <FileUploader />
            </div>

            <p className="hero-description mt-12 mb-12">
              Advancing flood risk assessment through the combination of structured SQL databases 
              and Geographic Information Systems (GIS) for precise hazard mapping in Vijayawada.
            </p>
          </motion.div>
        </section>

        {/* Feature Highlights - Research Oriented */}
        <section className="research-highlights py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="highlight-item">
              <h3 className="font-bold text-lg mb-2">GIS Framework</h3>
              <p className="text-sm text-dim">Spatial analysis using Digital Elevation Models (DEM) for landscape vulnerability.</p>
            </div>
            <div className="highlight-item">
              <h3 className="font-bold text-lg mb-2">SQL Integration</h3>
              <p className="text-sm text-dim">Structured retrieval and managing of multi-temporal hydrological datasets.</p>
            </div>
            <div className="highlight-item">
              <h3 className="font-bold text-lg mb-2">Decision Support</h3>
              <p className="text-sm text-dim">Evidence-based tool for emergency response and urban development planning.</p>
            </div>
          </div>
        </section>
      </div>
      
      <footer className="landing-footer py-8 border-t border-border w-full text-center">
        <p className="text-xs text-muted">© 2026 Vignan&apos;s Institute of Information Technology (A) · Dept. of Civil Engineering</p>
      </footer>
    </main>
  );
}
