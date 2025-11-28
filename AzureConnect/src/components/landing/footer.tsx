import { Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    
    // Add click animation effect
    const link = e.currentTarget
    link.style.transform = 'scale(0.95)'
    setTimeout(() => {
      link.style.transform = ''
    }, 150)
    
    // Smooth scroll to target
    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <footer id="contact" className="py-12 scroll-mt-24 bg-[#0A4174] text-[#F0FFFF]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-[#FFFFFF] mb-4">NAVIGATION</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#home" 
                  onClick={(e) => handleNavClick(e, '#home')}
                  className="text-[#F0FFFF]/70 hover:text-[#FFFFFF] transition-all duration-200 inline-block hover:scale-105 active:scale-95"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleNavClick(e, '#about')}
                  className="text-[#F0FFFF]/70 hover:text-[#FFFFFF] transition-all duration-200 inline-block hover:scale-105 active:scale-95"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  onClick={(e) => handleNavClick(e, '#services')}
                  className="text-[#F0FFFF]/70 hover:text-[#FFFFFF] transition-all duration-200 inline-block hover:scale-105 active:scale-95"
                >
                  Services
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="text-[#F0FFFF]/70 hover:text-[#FFFFFF] transition-all duration-200 inline-block hover:scale-105 active:scale-95"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#FFFFFF] mb-4">CONNECT WITH US</h3>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61584387506639" className="text-[#F0FFFF]/70 hover:text-[#FFFFFF] transition-colors" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://x.com/AZconnect01" className="text-[#F0FFFF]/70 hover:text-[#FFFFFF] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#F0FFFF]/70 hover:text-[#FFFFFF] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F0FFFF]/20 pt-8 text-center text-sm text-[#F0FFFF]/70">
          <p>&copy; 2025 AzureConnect. All rights reserved.</p>
          <p className="mt-2">Trust us with your property needs</p>
        </div>
      </div>
    </footer>
  )
}
