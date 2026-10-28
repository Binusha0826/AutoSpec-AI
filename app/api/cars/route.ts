


import { NextRequest, NextResponse } from "next/server";

export type Car = {
  id: number;
  brand: string;
  model: string;
  year: number;
  engine: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  horsepower: number;
  price: number;
  description: string;
  image: string;
  colors: string[];
  imagesByColor: Record<string, string>;
};

const cars: Car[] = [
  {
    id: 1,
    brand: "Toyota",
    model: "GR Supra",
    year: 2024,
    engine: "3.0L Turbo Inline-6",
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "Sports Coupe",
    horsepower: 382,
    price: 28500000,
    description:
      "A performance-focused sports coupe with bold styling, powerful acceleration and a driver-focused interior.",
    image: "/cars/toyota-supra-2024-blue.png",
    colors: ["Blue", "Black", "White", "Red"],
    imagesByColor: {
      Blue: "/cars/toyota-supra-2024-blue.png",
      Black: "/cars/toyota-supra-2024-blue.png",
      White: "/cars/toyota-supra-2024-blue.png",
      Red: "/cars/toyota-supra-2024-blue.png",
    },
  },
  {
    id: 2,
    brand: "Toyota",
    model: "Corolla",
    year: 2023,
    engine: "1.8L Inline-4",
    fuel: "Petrol",
    transmission: "CVT",
    bodyType: "Sedan",
    horsepower: 138,
    price: 12500000,
    description:
      "A practical and refined sedan designed for comfort, efficiency and everyday driving.",
    image: "/cars/toyota-corolla-2023.png",
    colors: ["White", "Black", "Silver", "Blue"],
    imagesByColor: {
      White: "/cars/toyota-corolla-2023.png",
      Black: "/cars/toyota-corolla-2023.png",
      Silver: "/cars/toyota-corolla-2023.png",
      Blue: "/cars/toyota-corolla-2023.png",
    },
  },
  {
    id: 3,
    brand: "Porsche",
    model: "911 Carrera",
    year: 2024,
    engine: "3.0L Twin-Turbo Flat-6",
    fuel: "Petrol",
    transmission: "PDK Automatic",
    bodyType: "Sports Coupe",
    horsepower: 379,
    price: 65000000,
    description:
      "An iconic sports car combining precision handling, timeless design and premium craftsmanship.",
    image: "/cars/porsche-911-2024.png",
    colors: ["Black", "White", "Red", "Silver"],
    imagesByColor: {
      Black: "/cars/porsche-911-2024.png",
      White: "/cars/porsche-911-2024.png",
      Red: "/cars/porsche-911-2024.png",
      Silver: "/cars/porsche-911-2024.png",
    },
  },
  {
    id: 4,
    brand: "BMW",
    model: "M4 Competition",
    year: 2024,
    engine: "3.0L Twin-Turbo Inline-6",
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "Sports Coupe",
    horsepower: 503,
    price: 42000000,
    description:
      "A high-performance luxury coupe with aggressive styling and a premium cabin.",
    image: "/cars/bmw-m4-2024.png",
    colors: ["White", "Black", "Blue", "Grey"],
    imagesByColor: {
      White: "/cars/bmw-m4-2024.png",
      Black: "/cars/bmw-m4-2024.png",
      Blue: "/cars/bmw-m4-2024.png",
      Grey: "/cars/bmw-m4-2024.png",
    },
  },
  {
    id: 5,
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2024,
    engine: "2.0L Turbo Inline-4",
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "Luxury Sedan",
    horsepower: 255,
    price: 35000000,
    description:
      "A sophisticated luxury sedan featuring elegant styling and modern technology.",
    image: "/cars/mercedes-c-class-2024.png",
    colors: ["Black", "White", "Silver", "Grey"],
    imagesByColor: {
      Black: "/cars/mercedes-c-class-2024.png",
      White: "/cars/mercedes-c-class-2024.png",
      Silver: "/cars/mercedes-c-class-2024.png",
      Grey: "/cars/mercedes-c-class-2024.png",
    },
  },
  {
    id: 6,
    brand: "Honda",
    model: "Civic Type R",
    year: 2024,
    engine: "2.0L Turbo Inline-4",
    fuel: "Petrol",
    transmission: "Manual",
    bodyType: "Performance Hatchback",
    horsepower: 315,
    price: 24000000,
    description:
      "A sporty performance hatchback built for responsive handling and everyday usability.",
    image: "/cars/honda-civic-type-r-2024.png",
    colors: ["Red", "White", "Black", "Blue"],
    imagesByColor: {
      Red: "/cars/honda-civic-type-r-2024.png",
      White: "/cars/honda-civic-type-r-2024.png",
      Black: "/cars/honda-civic-type-r-2024.png",
      Blue: "/cars/honda-civic-type-r-2024.png",
    },
  },
  {
    id: 7,
    brand: "Audi",
    model: "R8",
    year: 2023,
    engine: "5.2L V10",
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "Supercar",
    horsepower: 562,
    price: 58000000,
    description:
      "A dramatic V10 supercar with exotic proportions and distinctive performance styling.",
    image: "/cars/audi-r8-2024.png",
    colors: ["Grey", "Black", "White", "Blue"],
    imagesByColor: {
      Grey: "/cars/audi-r8-2024.png",
      Black: "/cars/audi-r8-2024.png",
      White: "/cars/audi-r8-2024.png",
      Blue: "/cars/audi-r8-2024.png",
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const brand = (searchParams.get("brand") ?? "").trim().toLowerCase();
    const color = (searchParams.get("color") ?? "").trim().toLowerCase();
    const yearParam = searchParams.get("year");
    const year = yearParam ? Number(yearParam) : null;

    if (year !== null && (!Number.isInteger(year) || year < 1886)) {
      return NextResponse.json(
        { success: false, message: "Invalid year." },
        { status: 400 }
      );
    }

    const filteredCars = cars.filter((car) => {
      const matchesSearch =
        !q ||
        `${car.brand} ${car.model} ${car.year} ${car.bodyType}`
          .toLowerCase()
          .includes(q);

      const matchesBrand =
        !brand || brand === "all" || car.brand.toLowerCase() === brand;

      const matchesColor =
        !color ||
        color === "all" ||
        car.colors.some((c) => c.toLowerCase() === color);

      const matchesYear = year === null || car.year === year;

      return matchesSearch && matchesBrand && matchesColor && matchesYear;
    });

    return NextResponse.json({
      success: true,
      count: filteredCars.length,
      cars: filteredCars,
    });
  } catch (error) {
    console.error("Cars API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load cars." },
      { status: 500 }
    );
  }
}
