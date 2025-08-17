# Open Components 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

AI-powered React component generator that creates production-ready components from natural language descriptions.

## ✨ Features

- **🤖 AI Generation**: Uses OpenAI to understand requirements and generate components
- **📱 Live Preview**: Real-time component preview with react-live
- **🔄 Streaming Updates**: Server-Sent Events for real-time progress
- **⚡ TypeScript**: Full TypeScript support with proper interfaces
- **🎨 Modern UI**: Built with Next.js 15 and Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/murongg/open-components.git
   cd open-components
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your OpenAI API key
   ```

3. **Start Development**
   ```bash
   pnpm dev
   # Open http://localhost:3000
   ```

## 🎯 Usage

Describe your component needs in natural language:

```
Generate a modern button component with hover effects and loading states
```

The AI will generate:
- Component code
- Documentation
- Live preview

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, OpenAI API, Server-Sent Events
- **Tools**: Babel AST parsing, TypeScript, react-live

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

---

