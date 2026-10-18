import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import ChatSupport from "../../components/customer/ChatSupport";
import heroImage from "../../assets/HeroImage.jpg";
import desktopImage from "../../assets/Desktop.jpg";
import laptopImage from "../../assets/Laptop.jpg";
import cpuImage from "../../assets/CPU.jpg";
import gpuImage from "../../assets/GPU.jpg";
import { BadgeCheck, Truck, ShieldCheck, Cpu, Headset,} from "lucide-react";

const products = [
  {
    id: 1,
    name: "AMD Ryzen 5 5600G",
    image: cpuImage,
    price: "₱5,999",
  },
  {
    id: 2,
    name: "AMD Ryzen 7 5700X",
    image: cpuImage,
    price: "₱9,499",
  },
  {
    id: 3,
    name: "Intel Core i5 Processor",
    image: cpuImage,
    price: "₱8,299",
  },
  {
    id: 4,
    name: "AMD Ryzen 5 7600",
    image: cpuImage,
    price: "₱11,999",
  },
  {
    id: 5,
    name: "Intel Core i7 Processor",
    image: cpuImage,
    price: "₱14,999",
  },
  {
    id: 6,
    name: "AMD Ryzen 7 7800X3D",
    image: cpuImage,
    price: "₱19,999",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/*  HERO  */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Gaming PC setup"
          className="h-105 w-full object-cover sm:h-125 lg:h-150"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Hero content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-350 px-6 sm:px-10 lg:px-16">
            <div className="max-w-140 text-white">
              <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Power Your
                <br />
                Passion.
                <br />
                Build Without
                <br />
                <span className="text-blue-500">Limits.</span>
              </h1>

              <p className="mt-4 max-w-120 text-sm leading-relaxed text-gray-200 sm:text-base">
                Your trusted destination for gaming PCs, premium components,
                and powerful hardware designed to bring your dream setup to
                life.
              </p>

              <button className="mt-6 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </section>

      {/*  TRUST STRIP  */}
      <section className="border-b border-gray-200 bg-[#edf8ff]">
        <div className="mx-auto grid max-w-350 grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-3 lg:grid-cols-5 lg:px-10">
          <TrustItem
            icon= {Truck}
            title="Fast Delivery"
            text="Nationwide shipping"
          />

          <TrustItem
            icon= {ShieldCheck}
            title="Secure Shopping"
            text="Safe & trusted checkout"
          />

          <TrustItem
            icon= {BadgeCheck}
            title="Quality Products"
            text="Genuine components"
          />

          <TrustItem
            icon= {Cpu}
            title="Powerful Hardware"
            text="Built for performance"
          />

          <TrustItem
            icon= {Headset}
            title="Customer Support"
            text="We're here to help"
          />
        </div>
      </section>

      {/*  CATEGORY  */}
      <section className="bg-white px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-350">
          <h2 className="text-xl font-bold text-gray-900">
            SHOP BY CATEGORY
          </h2>

          <div className="mt-4 grid gap-3 lg:grid-cols-2 lg:h-90">
            {/* DESKTOP */}
            <CategoryCard
                image={desktopImage}
                title="Desktops"
                subtitle="Ultimate PCs for Professionals"
                className="h-full"
            />

            {/* RIGHT SIDE */}
            <div className="grid grid-cols-2 grid-rows-2 gap-3">
                {/* LAPTOP */}
                <CategoryCard
                image={laptopImage}
                title="Laptops"
                className="col-span-2"
                />

                {/* CPU */}
                <CategoryCard
                image={cpuImage}
                title="CPUs"
                />

                {/* GPU */}
                <CategoryCard
                image={gpuImage}
                title="GPUs"
                />
            </div>
            </div>
        </div>
      </section>

      {/*  FEATURED PRODUCTS  */}
      <section className="bg-[#fff7f5] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-350">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              FEATURED PRODUCTS
            </h2>

            <button className="text-sm font-medium text-blue-600 hover:underline">
              View All →
            </button>
          </div>

          {/* Category filters */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <FilterButton active>All</FilterButton>
            <FilterButton>Processors</FilterButton>
            <FilterButton>Graphics Cards</FilterButton>
            <FilterButton>Motherboards</FilterButton>
            <FilterButton>Memory</FilterButton>
          </div>

          {/* Products */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <ChatSupport />
      <Footer />
    </div>
  );
}


/*  TRUST ITEM  */

function TrustItem({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
        <Icon size={20} strokeWidth={1.8} />
      </div>

      <div>
        <p className="text-xs font-bold text-gray-800">{title}</p>
        <p className="text-[10px] text-gray-500">{text}</p>
      </div>
    </div>
  );
}


/*  CATEGORY CARD  */

function CategoryCard({
  image,
  title,
  subtitle,
  large = false,
  className = "",
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg ${className}`}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-5 left-5 text-white">
        <h3 className="text-xl font-bold sm:text-2xl">{title}</h3>

        {subtitle && (
          <p className="mt-1 text-xs text-gray-200">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}


/*  FILTER BUTTON  */

function FilterButton({ children, active = false }) {
  return (
    <button
      className={`whitespace-nowrap rounded-md border px-4 py-1.5 text-xs font-medium transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}


/*  PRODUCT CARD  */

function ProductCard({ product }) {
  return (
    <div className="group rounded-md border border-gray-300 bg-white p-2 transition hover:-translate-y-1 hover:shadow-md">
      {/* Product image */}
      <div className="flex h-37.5 items-center justify-center overflow-hidden rounded bg-white">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product information */}
      <div className="mt-2">
        <div className="mb-1 flex gap-1">
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[8px] font-bold text-red-600">
            NEW
          </span>

          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[8px] text-gray-600">
            SALE
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-8 text-[11px] font-semibold text-gray-800">
          {product.name}
        </h3>

        <p className="mt-2 text-xs font-bold text-blue-600">
          {product.price}
        </p>

        <button className="mt-2 w-full rounded border border-blue-500 py-1.5 text-[10px] font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default LandingPage;