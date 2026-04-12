import NavBar        from './components/NavBar'
import Hero          from './components/Hero'
import Services      from './components/Services'
import HowItWorks    from './components/HowItWorks'
import ForManagers   from './components/ForManagers'
import Testimonials  from './components/Testimonials'
import FAQ           from './components/FAQ'
import Footer        from './components/Footer'
import ChatWidget    from './components/ChatWidget'

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <ForManagers />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
