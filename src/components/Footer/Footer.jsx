import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#141414] text-gray-400 py-12 md:py-16 border-t border-[#2a2a2a] mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Company Section */}
          <div>
            <h3 className="text-white text-sm font-bold mb-5 uppercase tracking-widest">Company</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link to={'/'} className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to={'/detail'} className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">Careers</a>
              </li>
            </ul>
          </div>

          {/* Language Section */}
          <div>
            <h3 className="text-white text-sm font-bold mb-5 uppercase tracking-widest">View Website in</h3>
            <div className="flex items-center gap-2 text-sm font-medium">
              <i className="fa-solid fa-check text-[#46d369]"></i>
              <span className="text-gray-300">English</span>
            </div>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-white text-sm font-bold mb-5 uppercase tracking-widest">Need Help?</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a href="#help" className="hover:text-white transition-colors">Visit Help Center</a>
              </li>
              <li>
                <a href="#feedback" className="hover:text-white transition-colors">Share Feedback</a>
              </li>
            </ul>
          </div>

          {/* Social & Apps Section */}
          <div>
            <h3 className="text-white text-sm font-bold mb-5 uppercase tracking-widest">Connect with Us</h3>
            
            {/* Social Icons */}
            <div className="flex gap-4 mb-6">
              <a 
                href="https://www.instagram.com/jadav_girish_27_18/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-[#E50914] hover:scale-110 transition-all duration-300"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a 
                href="#twitter" 
                className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-[#E50914] hover:scale-110 transition-all duration-300"
                aria-label="X (Twitter)"
              >
                <i className="fa-brands fa-x-twitter text-xl"></i>
              </a>
            </div>

            {/* App Store Badges */}
            <div className="flex flex-wrap gap-3">
              <img 
                src="https://img10.hotstar.com/image/upload/f_auto,q_90,w_256/v1661346101/google-playstore" 
                alt="Get it on Google Play" 
                className="h-10 hover:opacity-80 transition-opacity cursor-pointer" 
              />
              <img 
                src="https://img10.hotstar.com/image/upload/f_auto,q_90,w_256/v1661346071/ios-appstore" 
                alt="Download on the App Store" 
                className="h-10 hover:opacity-80 transition-opacity cursor-pointer" 
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Copyright */}
        <div className="pt-8 border-t border-[#2a2a2a] flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium">
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6">
            <a href="#terms" className="hover:text-white transition-colors">Terms Of Use</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="text-center md:text-right text-gray-500 space-y-1">
            <p>&copy; {new Date().getFullYear()} GIRISH JADAV M. All Rights Reserved.</p>
            <p className="text-[#E50914]/80 font-semibold">Just a College Project. Not promoting piracy.</p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;