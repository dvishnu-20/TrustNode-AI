import React, { useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import CheckoutPage from './pages/CheckoutPage';
import Dashboard from './pages/Dashboard';
import Intelligence from './pages/Intelligence';
import Analytics from './pages/Analytics';
import { motion, useScroll, useTransform } from 'framer-motion';
import Landing3DScene from './components/Landing3DScene';

function BentoCard({ title, desc, colorClass, linkText, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
      className={`p-10 ${colorClass} text-[#03090B] flex flex-col justify-between overflow-hidden group`}
    >
      <div>
        <h3 className="text-3xl font-bold font-space mb-4">{title}</h3>
        <p className="text-lg font-inter opacity-80 leading-relaxed mb-8">{desc}</p>
      </div>
      <div className="flex items-center gap-2 font-space font-bold uppercase tracking-wider text-sm cursor-pointer hover:bg-black/10 self-start px-4 py-2 rounded-full transition-colors">
        {linkText} <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </motion.div>
  );
}

function InfiniteZoomTransition({ onDemoClick }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Scale the giant shape from 1 to 100 as we scroll through this tall section
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 150]);
  const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  return (
    <div ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#03090B]">
        {/* The text before zoom */}
        <div className="absolute z-20 text-center pointer-events-none px-6">
          <h2 className="text-5xl md:text-8xl font-bold font-space text-white leading-tight">
            Your trusted partner for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-revert-cyan via-purple-500 to-yellow-400">
              secure checkout
            </span>
          </h2>
        </div>

        {/* The expanding circle that reveals the light theme */}
        <motion.div 
          style={{ scale }}
          className="absolute z-10 w-32 h-32 md:w-64 md:h-64 rounded-full bg-[#3b0764] flex items-center justify-center"
        >
          {/* We can put a tiny 'e' or circle inside that acts as the mask hole */}
          <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-[#f8fafc]"></div>
        </motion.div>

        {/* Light theme content revealed underneath when the circle fully expands */}
        <motion.div 
          style={{ opacity: scrollYProgress.get() > 0.8 ? 1 : opacity }}
          className="absolute inset-0 z-0 bg-[#f8fafc] flex flex-col items-center justify-center pt-32 px-6"
        >
            <div className="text-center mt-32 max-w-4xl">
              <h3 className="text-4xl md:text-6xl font-bold font-space text-[#0f172a] mb-8">
                TrustNode transforms an impossible model into something <span className="text-[#3b0764]">executable.</span>
              </h3>
              <button onClick={onDemoClick} className="bg-[#3b0764] text-white px-10 py-5 rounded-full font-space font-bold text-lg hover:bg-black transition-colors shadow-xl">
                Launch Live Demo →
              </button>
            </div>
            
            {/* Metrics Footer */}
            <div className="w-full mt-32 border-t border-slate-200 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-[#0f172a]">
              <div>
                <div className="text-5xl font-space font-bold text-[#3b0764] mb-2">3.2M+</div>
                <div className="font-inter text-slate-500">Live Sessions Protected</div>
              </div>
              <div>
                <div className="text-5xl font-space font-bold text-[#3b0764] mb-2">99.9%</div>
                <div className="font-inter text-slate-500">Uptime Reliability</div>
              </div>
              <div>
                <div className="text-5xl font-space font-bold text-[#3b0764] mb-2">12+</div>
                <div className="font-inter text-slate-500">Integrations</div>
              </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  
  const startDemo = () => {
    const mockSessionId = "S-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/checkout/${mockSessionId}`);
  };

  return (
    <div className="bg-[#03090B] text-white min-h-screen font-inter relative selection:bg-revert-cyan/30">
      
      <div className="fixed inset-0 z-0">
        <Landing3DScene />
      </div>

      <nav className="fixed top-0 left-0 right-0 flex items-center justify-between p-6 md:px-12 z-50 mix-blend-difference text-white">
        <div className="text-xl font-bold font-space tracking-tight flex items-center gap-2">
          TrustN<span className="inline-block transform rotate-180 text-revert-cyan">o</span>de
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" target="_blank" className="font-space text-sm hidden md:block hover:opacity-70 transition-opacity">
            Command Center
          </Link>
          <Link to="/intelligence" target="_blank" className="font-space text-sm hidden md:block hover:opacity-70 transition-opacity">
            Intelligence
          </Link>
          <Link to="/analytics" target="_blank" className="font-space text-sm hidden md:block hover:opacity-70 transition-opacity">
            Analytics
          </Link>
          <button onClick={startDemo} className="border border-white/30 px-4 py-2 text-sm font-space hover:bg-white hover:text-black transition-colors rounded-full">
            Live Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-space leading-[0.9] max-w-6xl tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ef4444] to-[#f97316]">Protect</span>ing<br />
            seamless<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-revert-cyan to-blue-500">checkout</span>
          </h1>
          <div className="mt-12">
            <button onClick={startDemo} className="bg-white text-black px-8 py-3 rounded-full font-space font-bold hover:bg-revert-cyan transition-colors">
              Talk to our experts
            </button>
          </div>
        </motion.div>
      </section>

      {/* Logo Grid */}
      <section className="relative z-10 border-t border-white/10 bg-[#03090B]">
        <div className="max-w-7xl mx-auto py-12 px-6">
          <div className="text-center text-xs tracking-[0.2em] font-space text-slate-500 mb-8">TRUSTED BY INDUSTRY LEADERS</div>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Fake logos */}
            <div className="font-space font-bold text-xl flex items-center gap-2">⌘ Acme Corp</div>
            <div className="font-space font-bold text-xl flex items-center gap-2">⎈ Globex</div>
            <div className="font-space font-bold text-xl flex items-center gap-2">⏣ Soylent</div>
            <div className="font-space font-bold text-xl flex items-center gap-2">⎉ Initech</div>
          </div>
        </div>
      </section>

      {/* Colorful Bento Box Section */}
      <section className="relative z-10 bg-[#03090B] py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs tracking-[0.2em] font-space text-slate-500 mb-4 border border-slate-700 inline-block px-3 py-1 rounded">SOLUTIONS</div>
            <h2 className="text-3xl md:text-5xl font-space max-w-3xl mx-auto leading-tight">
              We deliver trusted security solutions and guarantee seamless checkout through:
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BentoCard 
              title="Invisible Telemetry" 
              desc="Our secure, scalable systems track mouse movements, typing speed, and cadence in the background without affecting UX."
              colorClass="bg-[#00C2A8]" 
              linkText="Explore Tracking"
            />
            <BentoCard 
              title="Dynamic Friction" 
              desc="Manage risk in real-time. Block suspicious users or enforce 2FA only when probability thresholds are breached."
              colorClass="bg-[#84cc16]" 
              linkText="View Friction Engine"
              delay={0.1}
            />
            <BentoCard 
              title="RTO Prediction" 
              desc="Machine learning models predict the probability of Return-To-Origin before the order is even placed."
              colorClass="bg-[#eab308]" 
              linkText="RTO Models"
              delay={0.2}
            />
            <BentoCard 
              title="3rd Party Signals" 
              desc="Seamlessly connect and secure your ecosystem with integrated APIs like ThirdWatch and device fingerprinting."
              colorClass="bg-[#a855f7]" 
              linkText="Integrations"
              delay={0.3}
            />
            <div className="md:col-span-2">
              <BentoCard 
                title="Command Center Dashboard" 
                desc="Live monitoring, historical analytics, and full control over your friction strategies in one place."
                colorClass="bg-[#3b82f6]" 
                linkText="Launch Dashboard"
                delay={0.4}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Zoom Transition to Light Theme */}
      <InfiniteZoomTransition onDemoClick={startDemo} />

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/checkout/:sessionId" element={<CheckoutPageWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useParams } from 'react-router-dom';
function CheckoutPageWrapper() {
  const { sessionId } = useParams();
  return <CheckoutPage sessionId={sessionId} />;
}

export default App;
