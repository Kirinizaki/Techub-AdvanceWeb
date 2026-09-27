import {Menu, Search, ShoppingCart, UserCircle} from "lucide-react";
import logo from "../assets/TechubLogo.png";

function Navbar() {
    return (
        <header className="bg-[#0A1128] border-b-4 border-[#4b4f91]">
            <div className="h-17 px-4 md:px-6 lg:px-10 flex items-center">

                {/* Mobile Menu */}
                <Menu 
                    size={27}
                    className="text-white md:hidden mr-4"
                />

                {/*Logo and Name*/}
                <div className="flex items-center gap-2">
                    <img 
                        src={logo}
                        alt="Techub"
                        className="h-9 w-9 lg:h-10 lg:w-10"
                    />
                    <span className="text-xl lg:text-2xl font-bold text-white">TEC 
                        <span className="text-[#ABC4FF]">HUB</span>
                    </span>
                </div>

                {/* Navigation */}
                <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm lg:text-xl">
                    <a href="#" className="text-white hover:text-[#ABC4FF] transition-colors">Home</a>
                    <a href="#" className="text-white hover:text-[#ABC4FF] transition-colors">Products</a>
                    <a href="#" className="text-white hover:text-[#ABC4FF] transition-colors">Desktop</a>
                    <a href="#" className="text-white hover:text-[#ABC4FF] transition-colors">Laptop</a>
                    <a href="#" className="text-white hover:text-[#ABC4FF] transition-colors">PC Builder</a>
                </div>

                {/* Search, Cart and User */}
                <div className="ml-auto flex items-center justify-end gap-4">

                    {/* Search Bar */}
                    <div className="relative w-23 sm:w-40 md:w-48 lg:w-56">
                        <input
                            type="text"
                            placeholder="Search for Products or Brands"
                            className="w-full h-9 rounded-xl bg-white px-4 pr-10 text-xs outline-none"
                        />

                        <Search
                            size={19}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-black"
                        />
                    </div>

                    <ShoppingCart Size={27} className="text-white cursor-pointer hover:text-[#8ea7ff]" />
                    <UserCircle Size={27} className="text-white cursor-pointer hover:text-[#8ea7ff]" />
                </div>
            </div>
        </header>
    )
}

export default Navbar;