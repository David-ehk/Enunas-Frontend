import { footerLinks } from "../../constants"

const Footer = () => {
  return (
    <footer className=" text-white py-3">
      <div className="max-container">
        {/* Hauptinhalt - 3 Spalten + Newsletter */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 pb-8 ">
          
          {/* Footer Links Spalten */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-white text-2xl font-light mb-4">
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                 <li key={link.name} className="group">
              <a 
                 href={link.link}
                 className="text-white/80 text-sm font-light hover:text-white transition-colors relative inline-block pb-1"
                 >
    {link.name}
    {/* Animated Underline */}
    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white 
                     group-hover:w-full transition-all duration-500 ease-out">
    </span>
  </a>
</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter/Zahlungsarten Spalte */}
          <div>
            <p className="text-white text-xl font-light mb-4">
              Zahlungsarten
            </p>
            <div className="space-y-2">
              <p className="text-white text-sm">Visa</p>
              <p className="text-white text-sm">Mastercard</p>
              <p className="text-white text-sm">PayPal</p>
            </div>
          </div>
        </div>

       
              {/* Social Media Icons */}
          <div className="flex justify-center items-center py-10 border-b-2 border-b-white ">
            <a href="#" className="text-white mr-2 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="#" className="text-white mr-2 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="#" className="text-white mr-2 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"/>
              </svg>
            </a>
            <a href="#" className="text-white mr-2 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
          </div>
       

        {/* Bottom Bar - Copyright & Social Icons */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-white text-sm">
            © Enunas 2026
          </p>

      

          {/* Language Selector */}
          <div className="text-white text-sm">
            Deutschland € / DE
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer