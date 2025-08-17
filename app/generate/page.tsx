"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Code, Eye, Copy, Download, Sparkles } from "lucide-react"
import Link from "next/link"
import { Component } from "@/types/component"
import { LiveProvider, LivePreview, LiveError } from 'react-live'

// Component preview function - using react-live
const createPreview = (component: Component, selectedExampleIndex: number, onExampleChange: (index: number) => void) => {
  if (!component.previewCodes || component.previewCodes.length === 0) {
    console.warn('⚠️ previewCodes is empty or undefined')
    return (
      <div className="text-center p-8 text-yellow-600">
        <div className="text-lg mb-2">⚠️ Component code is empty</div>
        <div className="text-sm text-muted-foreground">
          This component has no preview codes
        </div>
        <div className="text-xs mt-4 bg-yellow-50 p-2 rounded text-left">
          <div><strong>Component Name:</strong> {component.name}</div>
          <div><strong>previewCodes:</strong> {component.previewCodes?.length || 0} examples</div>
        </div>
      </div>
    )
  }

  // Use the selected previewCode
  const currentPreviewCode = component.previewCodes[selectedExampleIndex]

  return (
    <LiveProvider
      code={currentPreviewCode}
      noInline={true}
    // scope={{ React }}
    >
      <div className="h-full flex flex-col">
        {/* Preview Selector */}
        {component.previewCodes.length > 1 && (
          <div className="border-b border-border p-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Examples:</span>
              {component.previewCodes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onExampleChange(index)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    index === selectedExampleIndex
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Example {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-full max-w-md">
            <LivePreview />
          </div>
        </div>

        {/* Error Display */}
        <div className="border-t border-border">
          <LiveError className="p-4 text-red-600 bg-red-50 text-sm" />
        </div>
      </div>
    </LiveProvider>
  )
}

// Custom CodeBlock component to replace react-syntax-highlighter
function CodeBlock({ code, language = "tsx" }: { code: string; language?: string }) {
  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm leading-relaxed">
        <code className="language-tsx">
          {code.split("\n").map((line, index) => (
            <div key={index} className="table-row">
              <span className="table-cell text-slate-500 pr-4 select-none text-right w-8">{index + 1}</span>
              <span className="table-cell">
                {line
                  .split(
                    /(\bimport\b|\bexport\b|\bfunction\b|\bconst\b|\blet\b|\bvar\b|\bif\b|\belse\b|\breturn\b|\binterface\b|\btype\b|\bclass\b)/,
                  )
                  .map((part, i) => {
                    if (
                      [
                        "import",
                        "export",
                        "function",
                        "const",
                        "let",
                        "var",
                        "if",
                        "else",
                        "return",
                        "interface",
                        "type",
                        "class",
                      ].includes(part)
                    ) {
                      return (
                        <span key={i} className="text-purple-400 font-semibold">
                          {part}
                        </span>
                      )
                    }
                    return part.split(/(".*?"|'.*?'|`.*?`)/).map((subpart, j) => {
                      if (subpart.match(/^["'`].*["'`]$/)) {
                        return (
                          <span key={j} className="text-green-400">
                            {subpart}
                          </span>
                        )
                      }
                      return subpart.split(/(\/\/.*$|\/\*[\s\S]*?\*\/)/).map((comment, k) => {
                        if (comment.match(/^\/\/|^\/\*/)) {
                          return (
                            <span key={k} className="text-slate-500 italic">
                              {comment}
                            </span>
                          )
                        }
                        return <span key={k}>{comment}</span>
                      })
                    })
                  })}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

// Custom MarkdownRenderer component to replace ReactMarkdown
function MarkdownRenderer({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Headers
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-foreground">
            {line.slice(2)}
          </h1>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-5 mb-3 text-foreground">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-foreground">
            {line.slice(4)}
          </h3>
        )
      }

      // Code blocks
      if (line.startsWith("```")) {
        return null // Handle in a separate pass
      }

      // Lists
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 mb-1 text-muted-foreground">
            {line.slice(2)}
          </li>
        )
      }

      // Inline code
      const codeRegex = /`([^`]+)`/g
      if (codeRegex.test(line)) {
        const parts = line.split(codeRegex)
        return (
          <p key={index} className="mb-2 text-muted-foreground">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                  {part}
                </code>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
        )
      }

      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="mb-2 text-muted-foreground">
            {line}
          </p>
        )
      }

      return <br key={index} />
    })
  }

  // Handle code blocks separately
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <div className="prose prose-sm max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const code = part.slice(3, -3).trim()
          const lines = code.split("\n")
          const language = lines[0]
          const codeContent = lines.slice(1).join("\n")
          return <CodeBlock key={index} code={codeContent} language={language} />
        }
        return <div key={index}>{renderMarkdown(part)}</div>
      })}
    </div>
  )
}

export default function GeneratePage() {
  const searchParams = useSearchParams()
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0)

  // New: Component order tracking and auto-switching
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0)

  // Reset example index when component changes
  useEffect(() => {
    setSelectedExampleIndex(0)
  }, [selectedComponent])

  // Get prompt parameter from URL and auto-generate components
  useEffect(() => {
    const prompt = searchParams.get('prompt')
    if (prompt && components.length === 0 && !isGenerating) {
      console.log('🔍 Got prompt from URL:', prompt)
      generateComponents(prompt)
    }
  }, [searchParams, components.length, isGenerating])

  // Check if field has received data
  const isFieldReady = (fieldName: string) => {
    if (!selectedComponent) {
      console.log('❌ isFieldReady: selectedComponent is null')
      return false
    }
    const value = selectedComponent[fieldName as keyof Component]
    
    // Handle different field types
    if (fieldName === 'previewCodes') {
      return value && Array.isArray(value) && value.length > 0
    }
    
    const isReady = value && (typeof value === 'string' ? value.trim().length > 0 : true)

    return isReady
  }

  // Generating state component
  const GeneratingState = ({ fieldName }: { fieldName: string }) => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm">Generating {fieldName}...</p>
        <p className="text-xs text-muted-foreground mt-2">Please wait while the content is being processed</p>
      </div>
    </div>
  )


  const categories = Array.from(new Set(components.map((c) => c.category)))

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Download all components as zip file
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadAllComponents = async () => {
    if (!components.length) {
      console.error('No components to download')
      return
    }

    setIsDownloading(true)

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components: components.map(component => ({
            name: component.name,
            code: component.code,
            documentation: component.documentation || '',
            category: component.category,
            description: component.description
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'all-components.zip'
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      // You could add a toast notification here
    } finally {
      setIsDownloading(false)
    }
  }

  // Function to generate components
  const generateComponents = async (promptText: string) => {
    if (!promptText.trim()) return

    setIsGenerating(true)
    setComponents([])
    setSelectedComponent(null)
    setAnalysisResult(null)
    setError(null)
    setActiveTab("preview")

    try {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText.trim() })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate components: ${response.status} ${response.statusText}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Unable to read response stream')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            continue
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'start') {
                console.log('🚀 Started processing:', data.message)
              } else if (data.type === 'chunk' && data.data) {
                // Update component data
                if (data.data.components && Array.isArray(data.data.components)) {
                  const newComponents = data.data.components
                  setComponents(newComponents)

                  // If it's a new component, select it
                  if (newComponents.length > currentComponentIndex) {
                    setCurrentComponentIndex(newComponents.length - 1)
                    setSelectedComponent(newComponents[newComponents.length - 1])

                    // Auto-switch tabs
                    const tabs = ['preview', 'code', 'docs']
                    const currentTabIndex = tabs.indexOf(activeTab)
                    const nextTabIndex = (currentTabIndex + 1) % tabs.length
                    setActiveTab(tabs[nextTabIndex])
                  }
                }

                // Update analysis result
                if (data.data.analysis) {
                  setAnalysisResult(data.data.analysis)
                }

                console.log('🔄 Received data chunk:', data.data.components?.length || 0, 'components')
              } else if (data.type === 'done' && data.data) {
                // Final result
                if (data.data.components && Array.isArray(data.data.components)) {
                  const finalComponents = data.data.components
                  setComponents(finalComponents)

                  // Select first component and show preview tab
                  if (finalComponents.length > 0) {
                    setSelectedComponent(finalComponents[0])
                    setActiveTab("preview")
                  }
                }

                if (data.data.analysis) {
                  setAnalysisResult(data.data.analysis)
                }

                console.log('🎉 Component generation completed:', data.data.components?.length || 0, 'components')
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Unknown error')
              }
            } catch (parseError) {
              console.warn('Failed to parse data chunk:', parseError)
            }
          }
        }
      }

    } catch (error) {
      console.error('Failed to generate components:', error)
      setError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // If no component is selected, select the first one
  if (!selectedComponent && components.length > 0) {
    setSelectedComponent(components[0])
    return null // Wait for state update
  }

  // If no components, show loading state or empty state
  if (components.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <motion.div
          className="absolute inset-0 -z-10 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
              "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            ],
          }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Generating components...</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  AI is generating components based on your requirements, please wait
                </p>
              </>
            ) : (
              <>
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to AI Component Generator</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Describe the components you need, AI will generate a complete component library with code, documentation and preview
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl px-8 py-3"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Ensure selectedComponent is not null
  if (!selectedComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading components...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">

      {/* Display error message */}
      {error && (
        <div className="fixed top-4 left-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm z-50 max-w-xs">
          <div className="font-medium mb-1">❌ Error</div>
          <div className="text-xs">{error}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="mt-2 h-6 px-2 text-xs"
          >
            Close
          </Button>
        </div>
      )}



      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">

          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Component Generator
              </h1>
            </Link>
            <div className="flex space-x-2">

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl"
                  disabled={!components.length || isDownloading}
                  onClick={downloadAllComponents}
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>



      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Component List */}
        <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm rounded-r-3xl">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Components
            </h2>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {components
                        .filter((component) => component.category === category)
                        .map((component) => (
                          <motion.button
                            key={component.id}
                            onClick={() => setSelectedComponent(component)}
                            className={cn(
                              "w-full text-left p-3 rounded-2xl transition-all duration-200 hover:bg-accent/50",
                              selectedComponent?.id === component.id &&
                              "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-accent-foreground border border-primary/20",
                            )}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="font-medium text-sm">{component.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {component.description}
                            </div>
                          </motion.button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Content - Component Details */}
        <div className="flex-1 flex flex-col">
          {/* Component Header */}
          <div className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {selectedComponent?.name || 'Select a Component'}
                </h1>
                <p className="text-muted-foreground">{selectedComponent?.description || 'Choose a component from the sidebar to view its details'}</p>
              </motion.div>
              {selectedComponent && (
                <Badge variant="secondary" className="rounded-2xl">
                  {selectedComponent.category}
                </Badge>
              )}
            </div>

            {/* Display analysis results */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-4 p-4 bg-muted/30 rounded-2xl border border-border/50"
              >
                <h3 className="text-sm font-medium text-foreground mb-2">📊 AI Requirements Analysis</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Summary:</strong> {analysisResult.summary}</p>
                  {analysisResult.estimatedComplexity && (
                    <p><strong>Complexity:</strong> {analysisResult.estimatedComplexity}</p>
                  )}
                  {analysisResult.technicalRequirements && analysisResult.technicalRequirements.length > 0 && (
                    <p><strong>Technical Requirements:</strong> {analysisResult.technicalRequirements.join(', ')}</p>
                  )}
                  {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                    <p><strong>Recommendations:</strong> {analysisResult.recommendations.join(', ')}</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {selectedComponent ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-border px-6">
                <TabsList className="grid w-full max-w-md grid-cols-3 rounded-2xl">
                  <TabsTrigger
                    value="preview"
                    className={cn(
                      "flex items-center space-x-2 rounded-2xl transition-all duration-300",
                      activeTab === 'preview' && "ring-2 ring-primary/20"
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    className={cn(
                      "flex items-center space-x-2 rounded-2xl transition-all duration-300",
                      activeTab === 'code' && "ring-2 ring-primary/20"
                    )}
                  >
                    <Code className="w-4 h-4" />
                    <span>Code</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="docs"
                    className={cn(
                      "flex items-center space-x-2 rounded-2xl transition-all duration-300",
                      activeTab === 'docs' && "ring-2 ring-primary/20"
                    )}
                  >
                    <span>Docs</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <TabsContent value="preview" className="h-full m-0">
                      <div className="h-full p-6">
                        <Card className="h-full rounded-3xl backdrop-blur-sm bg-card/80 shadow-lg">
                          <CardContent className="h-full p-0">
                            {isFieldReady('previewCodes') ? (
                              createPreview(selectedComponent, selectedExampleIndex, setSelectedExampleIndex)
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <GeneratingState fieldName="Preview" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="code" className="h-full m-0">
                      <div className="h-full p-6">
                        <Card className="h-full rounded-3xl backdrop-blur-sm bg-card/80 shadow-lg">
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Component Code</CardTitle>
                            {isFieldReady('code') && (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(selectedComponent.code)}
                                  className="rounded-2xl"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </Button>
                              </motion.div>
                            )}
                          </CardHeader>
                          <CardContent className="h-[calc(100%-80px)]">
                            {isFieldReady('code') ? (
                              <ScrollArea className="h-full">
                                <CodeBlock code={selectedComponent.code} />
                              </ScrollArea>
                            ) : (
                              <GeneratingState fieldName="Code" />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="docs" className="h-full m-0">
                      <div className="h-full p-6">
                        <Card className="h-full rounded-3xl backdrop-blur-sm bg-card/80 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg">Documentation</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[calc(100%-80px)]">
                            {isFieldReady('documentation') ? (
                              <ScrollArea className="h-full">
                                <MarkdownRenderer content={selectedComponent.documentation} />
                              </ScrollArea>
                            ) : (
                              <GeneratingState fieldName="Documentation" />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a component to view its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
