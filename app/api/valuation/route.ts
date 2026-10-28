
import { NextRequest, NextResponse } from "next/server";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type TavilyResponse = {
  results?: TavilyResult[];
  message?: string;
};

type Listing = {
  title: string;
  url: string;
  snippet: string;
  relevance: number | null;
  price: number | null;
};

// Convert a price written in Sri Lankan format to LKR.
function parsePrice(text: string): number | null {
  const value = text.replace(/,/g, "").replace(/\s+/g, " ");

  // Examples: Rs. 8,500,000 | LKR 8500000 | Rs 85 lakhs
  const currencyPattern =
    /(?:LKR|Rs\.?|රු\.?)\s*([0-9]+(?:\.[0-9]+)?)\s*(lakhs?|lacs?|million|mn|crore|cr)?\b/gi;

  // Examples: 85 lakhs | 8.5 million | 8.5 Mn
  const unitPattern =
    /\b([0-9]+(?:\.[0-9]+)?)\s*(lakhs?|lacs?|million|mn|crore|cr)\b/gi;

  const candidates: number[] = [];

  function convert(amount: number, unit = ""): number {
    const normalized = unit.toLowerCase();

    if (normalized.startsWith("lakh") || normalized.startsWith("lac")) {
      return amount * 100_000;
    }

    if (normalized === "million" || normalized === "mn") {
      return amount * 1_000_000;
    }

    if (normalized === "crore" || normalized === "cr") {
      return amount * 10_000_000;
    }

    return amount;
  }

  for (const match of value.matchAll(currencyPattern)) {
    const amount = Number(match[1]);
    const unit = match[2] ?? "";

    if (Number.isFinite(amount)) {
      candidates.push(convert(amount, unit));
    }
  }

  for (const match of value.matchAll(unitPattern)) {
    const amount = Number(match[1]);
    const unit = match[2] ?? "";

    if (Number.isFinite(amount)) {
      candidates.push(convert(amount, unit));
    }
  }

  // Keep only plausible vehicle asking prices in Sri Lankan rupees.
  return (
    candidates.find(
      (price) =>
        Number.isFinite(price) &&
        price >= 100_000 &&
        price <= 500_000_000
    ) ?? null
  );
}

function median(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return sorted[middle];
}

function formatLKR(amount: number): string {
  return `LKR ${Math.round(amount).toLocaleString("en-US")}`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "TAVILY_API_KEY is missing. Check your .env.local file.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const brand = String(body.brand ?? "").trim();
    const model = String(body.model ?? "").trim();
    const year = Number(body.year);
    const mileage = Number(body.mileage);
    const fuel = String(body.fuel ?? "").trim();
    const transmission = String(body.transmission ?? "").trim();
    const condition = String(body.condition ?? "").trim();
    const location = String(body.location ?? "").trim();

    if (
      !brand ||
      !model ||
      !Number.isInteger(year) ||
      year < 1950 ||
      year > new Date().getFullYear() + 1 ||
      !Number.isFinite(mileage) ||
      mileage < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide valid vehicle details.",
        },
        { status: 400 }
      );
    }

    const query =
      `"${brand} ${model}" ${year} used car price Sri Lanka ` +
      `LKR Rs lakhs ${fuel} ${transmission} ` +
      `site:ikman.lk OR site:riyasewana.com`;

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 10,
        include_answer: false,
      }),
      cache: "no-store",
    });

    const responseText = await response.text();

    let data: TavilyResponse;

    try {
      data = JSON.parse(responseText) as TavilyResponse;
    } catch {
      console.error("Tavily returned a non-JSON response.");

      return NextResponse.json(
        {
          success: false,
          error: "Market search returned an invalid response. Please try again.",
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error("Tavily request failed:", response.status, data.message);

      return NextResponse.json(
        {
          success: false,
          error:
            response.status === 401 || response.status === 403
              ? "Tavily API key is invalid or does not have access."
              : "Market search is temporarily unavailable.",
        },
        { status: 502 }
      );
    }

    const results = Array.isArray(data.results) ? data.results : [];

    const listings: Listing[] = results
      .filter(
        (item) =>
          typeof item.title === "string" &&
          typeof item.url === "string" &&
          /^https?:\/\//i.test(item.url)
      )
      .map((item) => {
        const title = item.title ?? "";
        const snippet = item.content ?? "";

        // Only extract prices explicitly marked as currency or price units.
        const price = parsePrice(`${title} ${snippet}`);

        return {
          title,
          url: item.url!,
          snippet,
          relevance: item.score ?? null,
          price,
        };
      });

    const pricedListings = listings.filter(
      (listing): listing is Listing & { price: number } =>
        listing.price !== null
    );

    // Remove extreme outliers before estimating the market value.
    const initialPrices = pricedListings.map((listing) => listing.price);
    const initialMedian =
      initialPrices.length > 0 ? median(initialPrices) : null;

    const comparableListings =
      initialMedian !== null
        ? pricedListings.filter(
            (listing) =>
              listing.price >= initialMedian * 0.5 &&
              listing.price <= initialMedian * 2
          )
        : [];

    let estimatedPrice: number | null = null;
    let priceRange: string | null = null;
    let confidence = "Low";
    let summary =
      "Not enough clearly identified listing prices were found to calculate a reliable estimate.";

    if (comparableListings.length >= 2) {
      const prices = comparableListings.map((listing) => listing.price);
      const basePrice = median(prices);

      // Small heuristic adjustment for mileage and stated condition.
      // This is not a professionally validated valuation model.
      const vehicleAge = Math.max(1, new Date().getFullYear() - year);
      const expectedMileage = vehicleAge * 15_000;

      const mileageRatio =
        expectedMileage > 0 ? mileage / expectedMileage : 1;

      const mileageAdjustment = Math.max(
        -0.15,
        Math.min(0.1, (1 - mileageRatio) * 0.1)
      );

      const normalizedCondition = condition.toLowerCase();

      let conditionAdjustment = 0;

      if (
        normalizedCondition.includes("excellent") ||
        normalizedCondition.includes("very good")
      ) {
        conditionAdjustment = 0.05;
      } else if (
        normalizedCondition.includes("fair") ||
        normalizedCondition.includes("average")
      ) {
        conditionAdjustment = -0.08;
      } else if (
        normalizedCondition.includes("poor") ||
        normalizedCondition.includes("repair")
      ) {
        conditionAdjustment = -0.2;
      }

      const adjustment = Math.max(
        0.7,
        Math.min(1.1, 1 + mileageAdjustment + conditionAdjustment)
      );

      estimatedPrice = Math.round((basePrice * adjustment) / 10_000) * 10_000;

      const low = Math.min(...prices);
      const high = Math.max(...prices);

      priceRange = `${formatLKR(low)} - ${formatLKR(high)}`;

      confidence =
        comparableListings.length >= 6
          ? "Moderate"
          : "Low";

      summary =
        `Estimated from the median of ${comparableListings.length} online ` +
        `asking prices, with a limited adjustment for mileage and condition. ` +
        `The result is an indicative estimate, not a verified sale price.`;
    }

    return NextResponse.json({
      success: true,
      vehicle: {
        brand,
        model,
        year,
        mileage,
        fuel,
        transmission,
        condition,
        location,
      },
      listings,
      listingCount: listings.length,
      pricedListingCount: comparableListings.length,
      estimatedPrice,
      priceRange,
      currency: "LKR",
      confidence,
      summary,
      message:
        estimatedPrice !== null
          ? "Estimated market value calculated from available online asking prices."
          : "Listings were searched, but there were not enough reliable prices to calculate an estimate. Try again or review the listings manually.",
      disclaimer:
        "This is a rough estimate based on online asking prices, not verified transaction prices or a professional appraisal. Search snippets may be incomplete or inaccurate.",
    });
  } catch (error) {
    console.error("Valuation API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof SyntaxError
            ? "Invalid request data. Please submit valid vehicle details."
            : "Unable to process the valuation request. Check the server logs.",
      },
      { status: 500 }
    );
  }
}

