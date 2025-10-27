<p align="center">
  <img align="center" src="./assets/flexprice_logo.png" height="30%" width="30%"  alt="fleprice logo"/>
</p>
<h3 align="center">
<b>
⚡️ Usage based metering & billing for developers ⚡️
</b>
</h3 >
<p align="center">
Build usage-based, credit-based, or hybrid pricing models with full control. Flexprice handles metering, pricing, and invoicing so you can focus on building, not billing.
</p>

<h5 align="center">

[Documentation](https://docs.flexprice.io) • [Demo](https://www.loom.com/share/60d8308781254fe0bc5be341501f9fd5) • [Website](https://flexprice.io/) • [LinkedIn](https://www.linkedin.com/company/flexpriceio)

[![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)](https://pkg.go.dev/github.com/flexprice/go-sdk) [![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://pypi.org/project/flexprice) [![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://www.npmjs.com/package/@flexprice/sdk) 

</h5>

---

## Open architecture

The Flexprice core (metering, credits, pricing, billing) has an open and composable design.

<p align="center">
  <img align="center" src="./assets/open-arch.jpg" alt="open architechture"/>
</p>

Your application, whether it's running backend APIs, AI agents, or custom workflows, can send usage data to Flexprice. You can directly stream data from data warehouses or analytics pipelines as well.

At the core, Flexprice processes this data in real time. We handle everything that usually ends up as custom logic built by developers. Our platform calculates pricing based on the customer’s plan, applies any prepaid or promotional credits, enforces feature limits, and generates accurate invoices automatically. Whether you're using seat-based subscriptions, usage-based pricing, or prepaid credit bundles, you can set up and iterate on your pricing model without writing billing infrastructure from scratch.

After billing is computed, our platform connects to your existing tools for payments, CPQ, CRM, and accounting, ensuring billing information flows into the systems your business already uses. It can sync invoices to your payment processor, update customer data in your CRM, and push revenue numbers to your accounting tools.

With this architecture, you get full control over how billing works inside your product, while saving your team from the complexity of maintaining it all.

## 🚀 Quick Setup (One-Click Development)

### Prerequisites

- Node.js 16+ and npm/yarn
- Git
- VS Code (recommended)

### One-Click Setup Script

```bash
# Clone the flexprice front repo
git clone https://github.com/flexprice/flexprice-front
cd flexprice-front
./setup

```

The setup script will:

1. Set up environment variables
2. Install dependencies
3. Build Docker Image
4. Start the development server

## 🛠 Manual Development Setup

1. **Clone & Install**

```bash
git clone https://github.com/flexprice/flexprice-front
cd flexprice-front
npm install
```

2. **Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Configure these variables in .env.local:
VITE_SUPABASE_URL=your-supabase-utl

VITE_SUPABASE_ANON_KEY=your-supabse-anon-key

VITE_API_URL=http://localhost:8080/v1 or <your-backend-url>

VITE_ENVIRONMENT=development

```

3. **Start Development**

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app running!

## 🏗 Project Structure

```
src/
├── components/          # UI Components
│   ├── atoms/          # Basic UI elements
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Card/
│   ├── molecules/      # Composite components
│   │   ├── Forms/
│   │   ├── Charts/
│   │   └── Tables/
│   └── organisms/      # Complex UI sections
│       ├── Dashboard/
│       ├── Billing/
│       └── Analytics/
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── store/              # State management
├── utils/              # Helper functions
├── models/             # TypeScript types
└── core/              # Core business logic
```

## 🌐 Self-Hosting Guide

### Docker Deployment

1. **Build the Docker image**

```bash
docker build -t flexprice-frontend .
```

2. **Run the container**

```bash
docker run -p 80:80 \
  -e VITE_API_URL=your-api-url \
  -e VITE_AUTH_DOMAIN=your-auth-domain \
  flexprice-frontend
```

### Manual Deployment

1. **Build the application**

```bash
npm run build
```

2. **Serve the static files**

```bash
# Using nginx
cp nginx.conf /etc/nginx/conf.d/flexprice.conf
nginx -s reload

# Or using serve
npx serve -s dist
```

## 📚 Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors
npm run format      # Format with Prettier
```

## 🔧 Common Development Tasks

### Adding New Features

1. Create a feature branch:

```bash
git checkout -b feat/new-feature
```

2. Create component structure:

```bash
mkdir -p src/components/organisms/NewFeature
touch src/components/organisms/NewFeature/index.tsx
touch src/components/organisms/NewFeature/NewFeature.test.tsx
```

3. Add route (if needed):

```tsx
// src/core/routes/Routes.tsx
import NewFeature from '@/components/organisms/NewFeature'

// Add to routes array
{
  path: '/new-feature',
  element: <NewFeature />
}
```

### Styling Components

We use Tailwind CSS with custom configurations:

```tsx
// Example component with Tailwind
const Button = ({ children }) => <button className='px-4 py-2 bg-primary hover:bg-primary-dark rounded-md'>{children}</button>;
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**

```bash
# Clear dependencies and cache
rm -rf node_modules
rm -rf .vite
npm install
```

2. **Stale Development Server**

```bash
# Reset development server
rm -rf node_modules
rm -rf .vite
npm install
npm run dev
```

## 📚 Documentation

Our comprehensive documentation covers all aspects of the FlexPrice frontend:

### Getting Started

- [Getting Started Guide](docs/getting-started.md) - Quick setup and first steps
- [Project Structure](docs/project-structure.md) - Understanding the codebase organization
- [Conventions](docs/conventions.md) - Coding standards and best practices

### Development Guides

- [Component Guidelines](docs/component-guidelines.md) - Building and maintaining UI components
- [State Management](docs/state-management.md) - Managing application state with Zustand and Context
- [API Integration](docs/api-integration.md) - Working with the backend API
- [Onboarding Guide](docs/onboarding.md) - New developer onboarding process

### Additional Resources

<!-- - [FAQ](docs/FAQ.md) - Common questions and answers -->

- [Flexprice Docs](https://docs.flexprice.io) - Documenttation for Flexprice sdk and Apis
- [Contributing Guide](docs/getting-started.md) - How to contribute to the project

## 👨🏻‍💻 Let's Build Together! 👩🏻‍💻

Whether you're a newbie coder or a wizard 🧙‍♀️, your perspective is golden. Take a peek at our:

📜 [Contribution Guidelines](CONTRIBUTING.md)

🏗️ [Local Development Setup](docs/getting-started.md)

❤️ [Code of Conduct](code_of_conduct.md)

## Contributors

<a href="https://github.com/flexprice/flexprice-front/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=flexprice/flexprice-front" />
</a>

<!-- ## Repo Activity -->

<!-- ![Alt](https://repobeats.axiom.co/api/embed/4d6e208eab20ff0615787615c4fa022591adfa6b.svg 'Repobeats analytics image') -->

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please read our [Contributing Guide](docs/getting-started.md) for details.

## 🆘 Need Help?

<!-- - Join our [Discord Community](https://discord.gg/flexprice) -->

- Email: support@flexprice.io
<!-- - Check our [FAQ](docs/FAQ.md) -->

---

Made with ❤️ by the FlexPrice Team
