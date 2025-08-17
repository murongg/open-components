# Open Components 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

AI驱动的React组件生成器，能够从自然语言描述创建生产就绪的组件。

## ✨ 核心特性

- **🤖 AI生成**: 使用OpenAI理解需求并生成组件
- **📱 实时预览**: 使用react-live进行实时组件预览
- **🔄 流式更新**: 服务器发送事件实现实时进度
- **⚡ TypeScript**: 完整的TypeScript支持
- **🎨 现代UI**: 使用Next.js 15和Tailwind CSS构建

## 🚀 快速开始

### 环境要求
- Node.js 18+
- OpenAI API密钥

### 安装步骤

1. **克隆并安装**
   ```bash
   git clone https://github.com/murongg/open-components.git
   cd open-components
   pnpm install
   ```

2. **环境配置**
   ```bash
   cp .env.example .env.local
   # 添加你的OpenAI API密钥
   ```

3. **启动开发**
   ```bash
   pnpm dev
   # 打开 http://localhost:3000
   ```

## 🎯 使用方法

用自然语言描述你的组件需求：

```
生成一个具有悬停效果和加载状态的现代按钮组件
```

AI将生成：
- 组件代码
- 文档说明
- 实时预览

## 🏗️ 技术栈

- **前端**: Next.js 15, Tailwind CSS, Framer Motion
- **后端**: Next.js API路由, OpenAI API, 服务器发送事件
- **工具**: Babel AST解析, TypeScript, react-live

## 📝 许可证

MIT许可证 - 查看[LICENSE](LICENSE)文件。

---

