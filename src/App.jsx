import Hero from "./components/Hero";
import Constructor from "./components/Constructor";
import Header from "./components/Header";
import Services from "./components/Services";
import useSmoothScroll from "./hooks/useSmoothScroll";
import useReveal from "./hooks/useReveal";
import Contacts from "./components/Contacts";
import Projects from "./components/Projects";
import About from "./components/About";
import ConsentBanner from "./components/ConsentBanner";



export default function App() {
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
      <Constructor />
      <Contacts />
    </>
  );
}