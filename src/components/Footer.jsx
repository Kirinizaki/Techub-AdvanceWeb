import logo from '../assets/TechubLogo.png'
import { ArrowRight } from 'lucide-react'

function Footer() {
    return (
        <footer className="bg-[#0A1128] border-t-4 border-[#4b4f91] text-white">
            <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
                {/* Main Footer */}
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <img 
                                src={logo}
                                alt="Techub"
                                className="h-9 w-9 lg:h-10 lg:w-10"
                            />
                        
                            <h2 className="text-xl lg:text-2xl font-bold text-white">TEC 
                                <span className="text-[#ABC4FF]">HUB</span>
                            </h2>
                        </div>

                        <p className="max-w-45 text-xs leading-4 text-[#adb5bd]">
                            Your hub for better technology, 
                            bringing you quality products and
                            reliable solutions closer to you.
                        </p>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold">
                            Customer Care
                        </h3>

                        <ul className="space-y-2 text-xs text-[#7D8597]">
                            <li>
                                <a href="#" className="hover:text-white ">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white ">
                                    Warranty Information
                                </a>
                            </li>
                            <li>
                            <   a href="#" className="hover:text-white ">
                                    Technical Support
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white ">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold">
                            Legal
                        </h3>

                        <ul className="space-y-2 text-xs text-[#7D8597]">
                            <li>
                                <a href="#" className="hover:text-white ">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white ">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* NewsLetter */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold">
                            Newsletter
                        </h3>

                        <p className="flex max-w-57.5 text-xs text-[#adb5bd]">
                            Get exclusive deals and new arrivals
                            straight to your inbox.
                        </p>

                        <div className="flex max-w-57.5">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="min-w-0 flex-1 rounded-1-md bg-white px-3 py-2 text-xs text-gray-800 outline-none placeholder:text-[#7D8597]"
                            />

                            <button
                                type="button"
                                className="group flex h-8 w-9 items-center justify-center rounded-r-md bg-[#a8b5e5] text-[#080f29] transition-all duration-200 hover:bg-white"
                            >
                                <ArrowRight 
                                    size ={14}
                                    strokeWidth={2.5}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5" 
                                />
                            </button>
                        </div>
                    </div>
                </div>
            

                {/* Copyright */}
                <div className="mt-8 border-t border-white/5 pt-5 text-center">
                    <p className="text-xs text-[#e5e5e5]">
                        © 2026 All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;