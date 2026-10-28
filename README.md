# 🏎️ AutoSpec AI
### Discover Your Dream Car. Explore Every Detail.

<p align="center">
  **An interactive automotive experience built with Next.js and AI-powered features.**
</p>

<p align="center">
  <a href="https://autospec-ai-web.vercel.app/"><strong>🚀 Live Demo</strong></a>
  &nbsp; • &nbsp;
  <a href="https://github.com/Binusha0826/AutoSpec-AI"><strong>📂 GitHub Repository</strong></a>
</p>

---

## 🌐 Overview

**AutoSpec AI** is a modern automotive web application designed to make exploring cars more engaging, informative, and interactive.

With a cinematic interface and a focus on automotive discovery, AutoSpec AI brings together car exploration, vehicle information, and AI-assisted features in one digital experience.

Whether you're exploring your next dream car or learning more about vehicle specifications, AutoSpec AI provides a sleek and user-friendly place to start.

## ✨ Features

- 🚘 **Interactive Car Discovery** — Explore an automotive collection through a modern interface.
- 🎨 **Car Customization Experience** — Explore available vehicle colors and visual options where supported.
- ⚙️ **Vehicle Specifications** — Discover important information about selected vehicles.
- 🤖 **AI-Powered Car Assistance** — Interact with the application's AI chat feature.
- 📊 **Vehicle Valuation** — Access the valuation feature to explore vehicle value estimates.
- 🎬 **Cinematic Visual Design** — Enjoy a premium automotive-inspired interface with engaging visuals.
- 📱 **Responsive Experience** — Designed to provide a convenient browsing experience across supported screen sizes.
- ☁️ **Live Deployment** — Hosted on Vercel for easy access online.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | Interactive user interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and responsive layouts |
| Vercel | Deployment and hosting |
| Tavily API | Web search integration for the valuation route |

*Additional libraries and API integrations depend on the project's implementation.*

## 🔗 Live Application

**Try AutoSpec AI:**  
https://autospec-ai-web.vercel.app/

## 🚀 Run Locally

Follow these steps to run AutoSpec AI on your computer.

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- npm package manager
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Binusha0826/AutoSpec-AI.git
```

### 2. Navigate to the project

```bash
cd AutoSpec-AI
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root.

Add the required API keys used by the application. For example:

```env
TAVILY_API_KEY=your_tavily_api_key
```

Replace the placeholder with your own API key. Check the project's API routes for any additional required variables.

**Security note:** Never commit `.env.local` or expose secret API keys in client-side code. Configure production secrets through your deployment platform's environment-variable settings.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create a production build

```bash
npm run build
```

## ☁️ Deployment

AutoSpec AI is deployed using **Vercel**.

To deploy your own version:

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables in the project settings.
3. Deploy the application.
4. Test the live application and its API-powered features.

Connected Git repositories can be configured to trigger deployments when new changes are pushed.

## 🔐 Environment Variables

Some features require external API access.

| Variable | Purpose |
|---|---|
| `TAVILY_API_KEY` | Required by the vehicle valuation route |

Other API keys may be required depending on the configuration of the AI chat and other services.

Keep all secret values private. Do not add real API keys to this README or commit them to GitHub.

## 🎯 Project Goals

AutoSpec AI aims to bring together modern web development, automotive discovery, and AI-assisted functionality in a single, visually engaging application.

The project demonstrates practical skills in frontend development, API integration, environment configuration, and cloud deployment.

## 👨‍💻 Developer

**Created by Binu**

Passionate about software development, modern web technologies, AI-powered applications, and building practical digital experiences.

- **GitHub:** [@Binusha0826](https://github.com/Binusha0826)
- **Project:** [AutoSpec AI](https://github.com/Binusha0826/AutoSpec-AI)
- **Live Demo:** [autospec-ai-web.vercel.app](https://autospec-ai-web.vercel.app/)

---

<p align="center">
  <strong>AutoSpec AI — Where Automotive Passion Meets Intelligent Technology. 🏁</strong>
</p>
