import { useEffect } from "react";
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



export default function App() {
  useEffect(() => {
    initAttribution();
  }, []);

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
