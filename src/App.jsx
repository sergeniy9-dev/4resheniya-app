import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import Constructor from "./components/Constructor";
import Header from "./components/Header";
import Services from "./components/Services";
import useSmoothScroll from "./hooks/useSmoothScroll";
import useReveal from "./hooks/useReveal";
import Contacts from "./components/Contacts";
import Projects from "./components/Projects";
import About from "./components/About";
import QualityStandard from "./components/QualityStandard";
import ConsentBanner from "./components/ConsentBanner";
import { initAttribution } from "./services/attributionService";
import Design3D from "./pages/Design3D";

function MainPage() {
  useReveal();
  useSmoothScroll();
  
  return (
    <>
      <ConsentBanner />
      <Header />
      <Hero />
      <About />
      <Projects />
      <Services />
      <QualityStandard />
      <Constructor />
      <Contacts />
    </>
  );
}

export default function App() {
  useEffect(() => {
    initAttribution();
  }, []);
  
  const [isRouterReady, setIsRouterReady] = useState(false);
  
  useEffect(() => {
    setIsRouterReady(true);
  }, []);
  
  if (!isRouterReady) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/design3d" element={<Design3D />} />
      </Routes>
    </Router>
  );
}
