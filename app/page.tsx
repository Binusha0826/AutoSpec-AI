

"use client";

import { useEffect, useMemo, useState } from "react";

type Car = {
  id: number | string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  horsepower: number | string;
  price: number | string;
  description: string;
  image: string;
  colors: string[];
  imagesByColor: Record<string, string>;
};

type ValuationResult = {
  success?: boolean;
  message?: string;
  error?: string;
  estimatedPrice?: number | string | null;
  estimated_price?: number | string | null;
  priceRange?: string;
  price_range?: string;
  currency?: string;
  confidence?: string;
  summary?: string;
  analysis?: string;
  listings?: Array<{
    title?: string;
    url?: string;
    link?: string;
    price?: string | number;
    snippet?: string;
    description?: string;
  }>;
  results?: Array<{
    title?: string;
    url?: string;
    link?: string;
    price?: string | number;
    snippet?: string;
    description?: string;
  }>;
  [key: string]: unknown;
};

const colorStyles: Record<string, string> = {
  Red: "bg-red-500",
  Blue: "bg-blue-500",
  Black: "bg-neutral-950",
  White: "bg-white border border-zinc-500",
  Grey: "bg-gray-400",
  Silver: "bg-slate-300",
  Green: "bg-green-600",
  Yellow: "bg-yellow-400",
};

const brands = [
  "All",
  "Toyota",
  "Honda",
  "Suzuki",
  "Nissan",
  "Mitsubishi",
  "Mazda",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Kia",
  "Hyundai",
  "Volkswagen",
  "Tesla",
  "Porsche",
  "Land Rover",
];

// Suggested models are grouped by their correct manufacturer.
const modelsByBrand: Record<string, string[]> = {
  Toyota: ["Aqua", "Prius", "Corolla", "Vitz", "Yaris", "Raize", "CHR", "Camry", "Land Cruiser", "Hilux", "Supra", "Axio", "Allion", "Premio", "Roomy"],
  Honda: ["Civic", "Vezel", "Fit", "Grace", "CR-V", "Insight", "City", "HR-V", "Accord"],
  Suzuki: ["Alto", "Wagon R", "Swift", "Spacia", "Jimny", "Every", "Baleno", "Celerio", "Vitara"],
  Nissan: ["March", "Note", "Leaf", "X-Trail", "Sylphy", "Sunny", "Juke", "Dayz", "Serena"],
  Mitsubishi: ["Lancer", "Outlander", "Pajero", "Montero", "ASX", "Eclipse Cross", "Mirage"],
  Mazda: ["Demio", "Axela", "Mazda 3", "Mazda 6", "CX-3", "CX-5", "CX-8"],
  BMW: ["1 Series", "2 Series", "3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "M3", "M4"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "GLA", "GLC", "GLE", "GLS", "AMG GT"],
  Audi: ["A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "e-tron"],
  Kia: ["Picanto", "Rio", "Cerato", "Sportage", "Sorento", "Seltos", "EV6"],
  Hyundai: ["Accent", "Elantra", "Sonata", "Tucson", "Santa Fe", "Kona", "Ioniq 5"],
  Volkswagen: ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "Touareg"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  Porsche: ["911 Carrera", "Cayman", "Boxster", "Macan", "Cayenne", "Panamera", "Taycan"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque"],
};

const fallbackImage =
  "https://placehold.co/1200x700/111318/e5e7eb?text=AutoSpec+AI";

const featuredImage = "/cars/toyota-supra-2024-blue.png";
const featuredVideo = "/videos/supra.mp4";

const initialValuationForm = {
  brand: "Toyota",
  model: "",
  year: "2022",
  mileage: "",
  condition: "Good",
  location: "Colombo",
  fuel: "Petrol",
  transmission: "Automatic",
};

function formatLKR(value: number | string) {
  const numericValue =
    typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function getListings(result: ValuationResult) {
  const primary = Array.isArray(result.listings)
    ? result.listings
    : [];

  const secondary = Array.isArray(result.results)
    ? result.results
    : [];

  return primary.length > 0 ? primary : secondary;
}

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedColorFilter, setSelectedColorFilter] =
    useState("All");

  const [activeCar, setActiveCar] = useState<Car | null>(null);
  const [selectedColor, setSelectedColor] = useState("Blue");

  const [valuationForm, setValuationForm] = useState(
    initialValuationForm
  );
  const [valuationLoading, setValuationLoading] = useState(false);
  const [valuationError, setValuationError] = useState("");
  const [valuationResult, setValuationResult] =
    useState<ValuationResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCars() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/cars");

        if (!response.ok) {
          throw new Error("Could not load the car catalogue.");
        }

        const data = await response.json();

        if (!cancelled) {
          setCars(Array.isArray(data.cars) ? data.cars : []);
        }
      } catch {
        if (!cancelled) {
          setError("Cars could not be loaded. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCars();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayedCars = useMemo(() => {
    return cars.filter((car) => {
      const searchable = [
        car.brand,
        car.model,
        car.year,
        car.engine,
        car.bodyType,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchable.includes(
        search.trim().toLowerCase()
      );

      const matchesBrand =
        selectedBrand === "All" ||
        car.brand.toLowerCase() === selectedBrand.toLowerCase();

      const matchesColor =
        selectedColorFilter === "All" ||
        car.colors.some(
          (color) =>
            color.toLowerCase() ===
            selectedColorFilter.toLowerCase()
        );

      return matchesSearch && matchesBrand && matchesColor;
    });
  }, [cars, search, selectedBrand, selectedColorFilter]);

  const activePreviewImage = activeCar
    ? activeCar.imagesByColor[selectedColor] ?? activeCar.image
    : "";

  const resultListings = valuationResult
    ? getListings(valuationResult)
    : [];

  function openCar(car: Car) {
    setActiveCar(car);
    setSelectedColor(car.colors[0] ?? "Blue");
  }

  function closeModal() {
    setActiveCar(null);
  }

  function handleImageError(
    event: React.SyntheticEvent<HTMLImageElement>
  ) {
    const image = event.currentTarget;

    if (image.dataset.fallback === "true") return;

    image.dataset.fallback = "true";
    image.src = fallbackImage;
  }

  function updateValuationField(
    field: keyof typeof initialValuationForm,
    value: string
  ) {
    setValuationForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleValuationSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setValuationLoading(true);
    setValuationError("");
    setValuationResult(null);

    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: valuationForm.brand.trim(),
          model: valuationForm.model.trim(),
          year: Number(valuationForm.year),
          mileage: Number(valuationForm.mileage),
          condition: valuationForm.condition,
          location: valuationForm.location.trim(),
          fuel: valuationForm.fuel,
          transmission: valuationForm.transmission,
          currency: "LKR",
        }),
      });

      const data = (await response.json()) as ValuationResult;

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "The valuation service could not process this request."
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            "The valuation could not be completed."
        );
      }

      setValuationResult(data);
    } catch (err) {
      setValuationError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the valuation service."
      );
    } finally {
      setValuationLoading(false);
    }
  }

  const estimatedPrice =
    valuationResult?.estimatedPrice ??
    valuationResult?.estimated_price ??
    null;

  const priceRange =
    valuationResult?.priceRange ??
    valuationResult?.price_range ??
    null;

  const valuationSummary =
    valuationResult?.summary ??
    valuationResult?.analysis ??
    null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07090d] text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07090d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-lg font-black text-cyan-300">
              A
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">
                AutoSpec <span className="text-cyan-400">AI</span>
              </p>
              <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                Intelligent automotive
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-zinc-400 lg:flex">
            <a href="#catalogue" className="transition hover:text-cyan-300">
              Explore Cars
            </a>
            <a href="#valuation" className="transition hover:text-cyan-300">
              AI Valuation
            </a>
            <a href="#how-it-works" className="transition hover:text-cyan-300">
              How It Works
            </a>
          </nav>

          <a
            href="#valuation"
            className="rounded-full bg-cyan-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300 sm:px-5"
          >
            Value My Car ↗
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/[0.09] blur-[130px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/[0.08] blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24 lg:gap-16 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3.5 py-2 text-xs font-semibold text-cyan-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              THE NEXT GENERATION OF CAR DISCOVERY
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Discover your
              <br />
              next <span className="text-cyan-400">drive.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-zinc-400 sm:text-lg">
              Explore exceptional vehicles and discover a smarter
              way to understand your car&apos;s value in the Sri Lankan
              market.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalogue"
                className="rounded-full bg-cyan-400 px-6 py-3.5 font-bold text-black transition hover:bg-cyan-300"
              >
                Explore Collection ↗
              </a>
              <a
                href="#valuation"
                className="rounded-full border border-white/15 px-6 py-3.5 font-semibold transition hover:border-cyan-400/50 hover:bg-white/[0.04]"
              >
                AI Car Valuation
              </a>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 border-t border-white/10 pt-6">
              <div>
                <p className="text-2xl font-black sm:text-3xl">
                  {cars.length.toString().padStart(2, "0")}
                  <span className="text-cyan-400">+</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                  Demo vehicles
                </p>
              </div>
              <div className="border-x border-white/10 px-4">
                <p className="text-2xl font-black sm:text-3xl">
                  AI<span className="text-cyan-400">.</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                  Valuation tools
                </p>
              </div>
              <div className="pl-4">
                <p className="text-2xl font-black sm:text-3xl">
                  LK<span className="text-cyan-400">.</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                  Sri Lanka focus
                </p>
              </div>
            </div>
          </div>

          {/* Featured sports car */}
          <div className="relative">
            <div className="absolute inset-6 rounded-full bg-cyan-400/10 blur-[90px]" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#11141a] shadow-[0_25px_100px_rgba(0,0,0,0.5)]">
              <div className="absolute left-5 top-5 z-10 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300 backdrop-blur">
                Featured Sports Car
              </div>

              <video
  src={featuredVideo}
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  className="aspect-[4/3] w-full object-cover"
  aria-label="Featured Toyota GR Supra cinematic video"
/>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-5 pt-20 sm:p-7 sm:pt-24">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                  01 / ICONS OF THE ROAD
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black sm:text-3xl">
                      Power Meets Prestige
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      A World of Automotive Excellence
                    </p>
                  </div>
                  <a
                    href="#catalogue"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xl font-bold text-black transition hover:scale-105"
                    aria-label="Explore featured car"
                  >
                    ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
              <span>Design · Performance · Technology</span>
              <span>01 / COLLECTION</span>
            </div>
          </div>
        </div>
      </section>

      {/* Car catalogue */}
      <section
        id="catalogue"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              Curated collection
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Find your kind of drive.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Discover vehicle specifications, compare models and
              explore the details that matter.
            </p>
          </div>
          <p className="text-sm text-zinc-500">
            {displayedCars.length} vehicles shown
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
          <label
            htmlFor="car-search"
            className="mb-2 block text-sm font-semibold text-zinc-300"
          >
            Search the collection
          </label>

          <input
            id="car-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try Toyota, Supra, turbo, sedan..."
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-cyan-400/70"
          />

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Filter by brand
            </p>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    selectedBrand === brand
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-white/10 bg-white/[0.025] text-zinc-400 hover:border-cyan-400/50 hover:text-white"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Available colours
            </p>
            <div className="flex flex-wrap gap-2">
              {["All", "Blue", "Red", "Black", "White", "Grey", "Silver"].map(
                (color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColorFilter(color)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      selectedColorFilter === color
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {color}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center text-zinc-400">
            Loading the collection...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-bold text-black"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && displayedCars.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-12 text-center">
            <h3 className="text-xl font-bold">No vehicles found</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Try a different search or clear the filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedBrand("All");
                setSelectedColorFilter("All");
              }}
              className="mt-5 rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-black"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCars.map((car) => (
            <article
              key={car.id}
              className="group overflow-hidden rounded-3xl border border-white/[0.09] bg-[#101218] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
            >
              <div className="relative overflow-hidden bg-[#171a21]">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  onError={handleImageError}
                  className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-[10px] font-bold tracking-wider backdrop-blur">
                  {car.year}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] text-zinc-300 backdrop-blur">
                  {car.bodyType}
                </span>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                  {car.brand}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  {car.model}
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4 border-y border-white/[0.08] py-4 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500">Engine</p>
                    <p className="mt-1 font-medium text-zinc-200">
                      {car.engine}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Power</p>
                    <p className="mt-1 font-medium text-zinc-200">
                      {car.horsepower} hp
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Fuel</p>
                    <p className="mt-1 font-medium text-zinc-200">
                      {car.fuel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Transmission</p>
                    <p className="mt-1 font-medium text-zinc-200">
                      {car.transmission}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openCar(car)}
                  className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                >
                  Explore specifications
                  <span className="text-cyan-400">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Agentic AI valuation */}
      <section
        id="valuation"
        className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.08] bg-[#0b0e14]"
      >
        <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-cyan-500/[0.08] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.06] px-3 py-2 text-xs font-semibold text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                INTELLIGENT VALUATION
              </div>

              <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Know what
                <br />
                your car could
                <br />
                <span className="text-cyan-400">be worth.</span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
                Submit your vehicle details to start the valuation
                workflow. The service can search for comparable
                Sri Lankan listings and return information to help
                estimate a market range.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    step: "01",
                    title: "Vehicle profile",
                    description:
                      "Capture the model, year, mileage and condition.",
                  },
                  {
                    step: "02",
                    title: "Listing research",
                    description:
                      "Look for comparable vehicles in the local market.",
                  },
                  {
                    step: "03",
                    title: "Valuation report",
                    description:
                      "Review returned results and any available price estimate.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-xs font-bold text-cyan-300">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-200">
                  Important
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Asking prices from online listings are not confirmed
                  sale prices. An estimate depends on the quality and
                  availability of comparable data.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#11141b] p-5 shadow-2xl sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                    Vehicle valuation agent
                  </p>
                  <h3 className="mt-2 text-2xl font-black">
                    Value my vehicle
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    Enter your vehicle details below.
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07] text-xl">
                  ✳
                </div>
              </div>

              <form onSubmit={handleValuationSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="valuation-brand"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Brand
                    </label>
                    <select
                      id="valuation-brand"
                      required
                      value={valuationForm.brand}
                      onChange={(event) => {
                        const nextBrand = event.target.value;
                        setValuationForm((current) => ({
                          ...current,
                          brand: nextBrand,
                          model: "",
                        }));
                        setTimeout(() => {
                          document.getElementById("valuation-model")?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }, 50);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    >
                      {brands
                        .filter((brand) => brand !== "All")
                        .map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="valuation-model"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Model
                    </label>
                    <select
                      id="valuation-model"
                      required
                      value={valuationForm.model}
                      onChange={(event) =>
                        updateValuationField("model", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    >
                      <option value="">Select a {valuationForm.brand} model</option>
                      {(modelsByBrand[valuationForm.brand] ?? []).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="valuation-year"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Manufacturing year
                    </label>
                    <input
                      id="valuation-year"
                      required
                      type="number"
                      min="1980"
                     max={2027}
                      value={valuationForm.year}
                      onChange={(event) =>
                        updateValuationField("year", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="valuation-mileage"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Mileage (km)
                    </label>
                    <input
                      id="valuation-mileage"
                      required
                      type="number"
                      min="0"
                      value={valuationForm.mileage}
                      onChange={(event) =>
                        updateValuationField("mileage", event.target.value)
                      }
                      placeholder="e.g. 45000"
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="valuation-condition"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Vehicle condition
                    </label>
                    <select
                      id="valuation-condition"
                      value={valuationForm.condition}
                      onChange={(event) =>
                        updateValuationField("condition", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    >
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>Needs repair</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="valuation-location"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Location
                    </label>
                    <input
                      id="valuation-location"
                      required
                      value={valuationForm.location}
                      onChange={(event) =>
                        updateValuationField("location", event.target.value)
                      }
                      placeholder="e.g. Colombo"
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="valuation-fuel"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Fuel type
                    </label>
                    <select
                      id="valuation-fuel"
                      value={valuationForm.fuel}
                      onChange={(event) =>
                        updateValuationField("fuel", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    >
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>Hybrid</option>
                      <option>Plug-in Hybrid</option>
                      <option>Electric</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="valuation-transmission"
                      className="mb-2 block text-xs font-semibold text-zinc-400"
                    >
                      Transmission
                    </label>
                    <select
                      id="valuation-transmission"
                      value={valuationForm.transmission}
                      onChange={(event) =>
                        updateValuationField(
                          "transmission",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#090b10] px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    >
                      <option>Automatic</option>
                      <option>Manual</option>
                      <option>CVT</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {valuationError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-sm leading-6 text-red-200"
                  >
                    <p className="font-bold">Valuation could not complete</p>
                    <p className="mt-1">{valuationError}</p>
                    <p className="mt-2 text-xs text-red-200/70">
                      Check that the /api/valuation route is running and
                      its required API key is configured.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={valuationLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-400 px-5 py-4 font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {valuationLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Researching vehicle...
                    </>
                  ) : (
                    <>
                      Start AI Valuation
                      <span className="text-lg">↗</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-zinc-600">
                  Results depend on available listings and the connected
                  valuation service.
                </p>
              </form>

              {/* Valuation result */}
              {valuationResult && (
                <div
                  aria-live="polite"
                  className="mt-7 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.035] p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Valuation response
                  </p>

                  <h4 className="mt-2 text-xl font-bold">
                    {valuationForm.brand} {valuationForm.model}
                  </h4>

                  {estimatedPrice !== null && (
                    <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-zinc-500">
                        Estimated price returned by the service
                      </p>
                      <p className="mt-2 text-2xl font-black text-cyan-300">
                        {typeof estimatedPrice === "number"
                          ? formatLKR(estimatedPrice)
                          : estimatedPrice}
                      </p>
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-sm font-semibold text-zinc-200">
                          How this estimate was determined
                        </p>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          This estimate is based on online advertisements for similar vehicles. Listings are compared using the make, model, manufacturing year, mileage, fuel type, transmission and stated condition where this information is available. Mileage and condition may influence the indicative estimate.
                        </p>
                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                          Advertised prices may differ from final selling prices. Always open and verify the source listings before making a decision.
                        </p>
                      </div>
                    </div>
                  )}

                  {priceRange && (
                    <div className="mt-4">
                      <p className="text-xs text-zinc-500">
                        Price range
                      </p>
                      <p className="mt-1 font-bold">{priceRange}</p>
                    </div>
                  )}

                  {valuationResult.confidence && (
                    <div className="mt-4">
                      <p className="text-xs text-zinc-500">
                        Confidence reported by service
                      </p>
                      <p className="mt-1 font-semibold">
                        {valuationResult.confidence}
                      </p>
                    </div>
                  )}

                  {valuationSummary && (
                    <div className="mt-4">
                      <p className="text-xs text-zinc-500">
                        Analysis
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        {String(valuationSummary)}
                      </p>
                    </div>
                  )}

                  {resultListings.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-bold">
                        Comparable listing results
                      </h5>
                      <div className="mt-3 space-y-3">
                        {resultListings.map((listing, index) => (
                          <div
                            key={`${listing.url ?? listing.link ?? "listing"}-${index}`}
                            className="rounded-xl border border-white/10 bg-black/20 p-4"
                          >
                            <p className="text-sm font-semibold">
                              {listing.title || "Vehicle listing"}
                            </p>
                            {listing.price !== undefined && (
                              <p className="mt-2 text-sm text-cyan-300">
                                {String(listing.price)}
                              </p>
                            )}
                            {(listing.snippet || listing.description) && (
                              <p className="mt-2 text-xs leading-6 text-zinc-400">
                                {listing.snippet || listing.description}
                              </p>
                            )}
                            {(listing.url || listing.link) && (
                              <a
                                href={listing.url || listing.link}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex text-xs font-bold text-cyan-300 hover:text-cyan-200"
                              >
                                View source ↗
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!estimatedPrice &&
                    !priceRange &&
                    !valuationSummary &&
                    resultListings.length === 0 && (
                      <p className="mt-4 text-sm leading-6 text-zinc-400">
                        The API responded, but it did not return a
                        recognised price estimate or listing format.
                        The API response structure may need to be connected
                        to this result panel.
                      </p>
                    )}

                  <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-zinc-500">
                    Online asking prices are indicative only and may not
                    represent actual completed sales.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setValuationResult(null);
                      setValuationError("");
                    }}
                    className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold transition hover:border-cyan-400/50"
                  >
                    Start another valuation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 md:py-20"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
            Built for smarter decisions
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            More than a car catalogue.
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            AutoSpec AI combines vehicle discovery with a planned
            research-based valuation workflow.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Discover",
              text: "Browse vehicles and review their specifications in one place.",
              icon: "⌕",
            },
            {
              number: "02",
              title: "Research",
              text: "Submit a vehicle profile to search for comparable market listings.",
              icon: "◎",
            },
            {
              number: "03",
              title: "Understand",
              text: "Review available evidence and understand the limitations of an estimate.",
              icon: "↗",
            },
          ].map((feature) => (
            <div
              key={feature.number}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-cyan-400/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-cyan-400">
                  {feature.number}
                </span>
                <span className="text-2xl text-cyan-300">
                  {feature.icon}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <a href="#home" className="text-base font-black text-white">
            AutoSpec <span className="text-cyan-400">AI</span>
          </a>
          <p>
            Vehicle information and valuation estimates require verification.
          </p>
          <a href="#home" className="transition hover:text-cyan-300">
            Back to top ↑
          </a>
        </div>
      </footer>

      {/* Car details modal */}
      {activeCar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${activeCar.brand} ${activeCar.model} details`}
            className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101219] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#101219]/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  {activeCar.brand}
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {activeCar.model}
                </h2>
              </div>

              <button
                onClick={closeModal}
                aria-label="Close car details"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl transition hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="p-4 md:p-6">
                <img
                  key={activePreviewImage}
                  src={activePreviewImage}
                  alt={`${activeCar.brand} ${activeCar.model} in ${selectedColor}`}
                  onError={handleImageError}
                  className="aspect-[4/3] w-full rounded-2xl border border-white/10 bg-zinc-900 object-cover"
                />

                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Choose your colour
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {activeCar.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color}`}
                      aria-pressed={selectedColor === color}
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
                        selectedColor === color
                          ? "border-cyan-400 bg-cyan-400/10 text-white"
                          : "border-white/10 text-zinc-400 hover:border-white/30"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 rounded-full ${
                          colorStyles[color] ?? "bg-zinc-500"
                        }`}
                      />
                      {color}
                      {selectedColor === color && (
                        <span className="text-cyan-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Different colours will show different images only when
                  separate image files are configured in the API data.
                </p>
              </div>

              <div className="p-5 pt-2 md:p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Vehicle specifications
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  {activeCar.year} {activeCar.model}
                </h3>

                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  {activeCar.description}
                </p>

                <div className="mt-6">
                  {[
                    ["Brand", activeCar.brand],
                    ["Model year", String(activeCar.year)],
                    ["Engine", activeCar.engine],
                    ["Horsepower", `${activeCar.horsepower} hp`],
                    ["Fuel type", activeCar.fuel],
                    ["Transmission", activeCar.transmission],
                    ["Body type", activeCar.bodyType],
                    [
                      "Listed demo price",
                      typeof activeCar.price === "number"
                        ? formatLKR(activeCar.price)
                        : activeCar.price,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-white/[0.08] py-3 text-sm"
                    >
                      <span className="text-zinc-500">{label}</span>
                      <span className="max-w-[60%] text-right font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-5 text-zinc-600">
                  Demo catalogue data. Confirm specifications and prices
                  before making a vehicle purchase decision.
                </p>

                <button
                  onClick={closeModal}
                  className="mt-5 w-full rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:bg-cyan-300"
                >
                  Close details
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
