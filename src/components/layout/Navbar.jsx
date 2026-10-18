import {Menu, Search, ShoppingCart, UserCircle} from "lucide-react";
import logo from "../../assets/TechubLogo.png";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
    const { user, loading } = useAuth();

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
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `${isActive ? "text-[#ABC4FF] font-semibold" : "text-white"} hover:text-[#ABC4FF] transition-colors`
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/components"
                        className={({ isActive }) =>
                            `${isActive ? "text-[#ABC4FF] font-semibold" : "text-white"} hover:text-[#ABC4FF] transition-colors`
                        }
                    >
                        Components
                    </NavLink>

                    <NavLink
                        to="/desktop"
                        className={({ isActive }) =>
                            `${isActive ? "text-[#ABC4FF] font-semibold" : "text-white"} hover:text-[#ABC4FF] transition-colors`
                        }
                    >
                        Desktop
                    </NavLink>

                    <NavLink
                        to="/laptop"
                        className={({ isActive }) =>
                            `${isActive ? "text-[#ABC4FF] font-semibold" : "text-white"} hover:text-[#ABC4FF] transition-colors`
                        }
                    >
                        Laptop
                    </NavLink>

                    <NavLink
                        to="/pc-builder"
                        className={({ isActive }) =>
                            `${isActive ? "text-[#ABC4FF] font-semibold" : "text-white"} hover:text-[#ABC4FF] transition-colors`
                        }
                    >
                        PC Builder
                    </NavLink>
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

                    <Link
                        to="/cart"
                        aria-label="Open shopping cart"
                        className="text-white hover:text-[#8ea7ff]"
                    >
                        <ShoppingCart size={27} className="cursor-pointer" />
                    </Link>

                    <Link
                        to={loading ? "/auth" : user ? "/account/profile" : "/login"}
                        aria-label={
                            loading
                            ? "Loading account"
                            : user
                                ? "Open your profile"
                                : "Log in to your account"
                        }
                        className="text-white hover:text-[#8ea7ff]"
                    >
                        <UserCircle
                            size={27}
                            className="cursor-pointer text-white hover:text-[#8ea7ff]"
                        />
                    </Link>
                    
                </div>
            </div>
        </header>
    )
}

export default Navbar;