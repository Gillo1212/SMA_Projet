import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import CTASection from './components/CTASection';
import MachinesGrid from './components/MachinesGrid';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <MachinesGrid />
      <CTASection />
      <Testimonials />
      <Footer />
    </div>
  );
}