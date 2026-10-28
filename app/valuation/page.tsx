
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ValuationPage() {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    condition: "Good",
    location: "Colombo",
    fuel: "Petrol",
    transmission: "Automatic",
  });

  const [message, setMessage] = useState("");

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Live market valuation API will be connected in the next step.
    setMessage(
      "Your vehicle details are ready. The live Sri Lankan market valuation agent still needs to be connected."
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#111318] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400";

  const labelClass = "text-sm font-medium text-gray-300";

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <Link href="/" className="text-xl font-black tracking-tight">
          AUTO<span className="text-cyan-400">SPEC</span>
          <span className="ml-2 text-xs font-normal text-gray-500">AI</span>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-gray-300 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          ← Back to Home
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Intelligent Vehicle Insights
          </span>

          <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Know What Your Car
            <span className="block text-cyan-400">Could Be Worth.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Enter your vehicle details to prepare a market valuation request
            tailored to Sri Lanka. Our next step is connecting real listing
            data to generate evidence-based estimates.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141a22] to-[#0c0d11] p-7 md:p-9">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
              AutoSpec Intelligence
            </p>

            <h2 className="mt-5 text-3xl font-bold leading-snug">
              More insight.
              <br />
              Smarter decisions.
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              A reliable estimate should consider comparable vehicles,
              manufacturing year, mileage, condition and current market
              conditions—not just the brand name.
            </p>

            <div className="mt-9 space-y-5">
              {[
                ["01", "Vehicle specifications"],
                ["02", "Comparable Sri Lankan listings"],
                ["03", "Estimated market price range"],
              ].map(([number, title]) => (
                <div key={number} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-bold text-cyan-300">
                    {number}
                  </div>
                  <p className="text-sm text-gray-300">{title}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4">
              <p className="text-xs leading-6 text-gray-400">
                <span className="font-semibold text-amber-200">
                  Transparency first.
                </span>{" "}
                No market price is generated until the live valuation service
                is connected.
              </p>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 md:p-9">
            <div className="mb-7">
              <h2 className="text-2xl font-bold">Vehicle details</h2>
              <p className="mt-2 text-sm text-gray-500">
                Provide accurate details for a more useful estimate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Brand
                  <input
                    className={inputClass}
                    name="brand"
                    value={form.brand}
                    onChange={updateField}
                    placeholder="e.g. Toyota"
                    required
                  />
                </label>

                <label className={labelClass}>
                  Model
                  <input
                    className={inputClass}
                    name="model"
                    value={form.model}
                    onChange={updateField}
                    placeholder="e.g. Aqua"
                    required
                  />
                </label>

                <label className={labelClass}>
                  Manufacture year
                  <input
                    className={inputClass}
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={updateField}
                    placeholder="e.g. 2020"
                    min="1950"
                    max={2027}
                    required
                  />
                </label>

                <label className={labelClass}>
                  Mileage (km)
                  <input
                    className={inputClass}
                    type="number"
                    name="mileage"
                    value={form.mileage}
                    onChange={updateField}
                    placeholder="e.g. 65000"
                    min="0"
                    required
                  />
                </label>

                <label className={labelClass}>
                  Fuel type
                  <select
                    className={inputClass}
                    name="fuel"
                    value={form.fuel}
                    onChange={updateField}
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                    <option>Plug-in Hybrid</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Transmission
                  <select
                    className={inputClass}
                    name="transmission"
                    value={form.transmission}
                    onChange={updateField}
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Vehicle condition
                  <select
                    className={inputClass}
                    name="condition"
                    value={form.condition}
                    onChange={updateField}
                  >
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Needs repairs</option>
                  </select>
                </label>

                <label className={labelClass}>
                  Location in Sri Lanka
                  <select
                    className={inputClass}
                    name="location"
                    value={form.location}
                    onChange={updateField}
                  >
                    <option>Colombo</option>
                    <option>Gampaha</option>
                    <option>Negombo</option>
                    <option>Kandy</option>
                    <option>Galle</option>
                    <option>Kurunegala</option>
                    <option>Jaffna</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-400 px-6 py-4 font-bold text-black transition hover:bg-cyan-300"
              >
                Prepare Valuation Request
                <span className="transition group-hover:translate-x-1">→</span>
              </button>

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm leading-6 text-cyan-100"
                >
                  {message}
                </div>
              )}
            </form>
          </section>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-gray-600">
       © 2026 AutoSpec AI. Built for smarter vehicle
        decisions in Sri Lanka.
      </footer>
    </main>
  );
}
