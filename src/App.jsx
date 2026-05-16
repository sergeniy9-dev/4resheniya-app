import Hero from "./components/Hero";
import Constructor from "./components/Constructor";
import Header from "./components/Header";
import Services from "./components/Services";
import useSmoothScroll from "./hooks/useSmoothScroll";
import useReveal from "./hooks/useReveal";
import Contacts from "./components/Contacts";

export default function App() {
  useReveal();
  useSmoothScroll();
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <Constructor />
      <Contacts />
    </>
  );
}