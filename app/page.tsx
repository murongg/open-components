"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [prompt, setPrompt] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    // Navigate to generate page with prompt parameter
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Component Generator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your needs in natural language, AI will generate a complete React component library for you
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="bg-transparent border-1 shadow-none">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-foreground mb-4">
              Start Generating Your Components
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Describe the components you need, AI will generate a complete component library
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Prompt Input Area */}
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-foreground mb-2">
                  Component Requirements Description
                </label>
                <Textarea
                  id="prompt"
                  placeholder="For example: Generate a modern React component library with button, card, input components, supporting multiple color themes and sizes, including hover effects and animations..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none text-base"
                  disabled={isGenerating}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  size="lg"
                  className="flex-1 h-12 text-lg font-medium"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Generating Components
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Usage Tips */}
            <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
              <h3 className="text-lg font-medium text-foreground mb-4">💡 Usage Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">🎯 Be Specific in Description</h4>
                  <ul className="space-y-1">
                    <li>• Specify component types (button, card, form, etc.)</li>
                    <li>• Describe style requirements (color, size, theme)</li>
                    <li>• Explain interaction effects (hover, animation, state)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">🚀 Be Clear About Functionality</h4>
                  <ul className="space-y-1">
                    <li>• Define component behavior and properties</li>
                    <li>• Specify component usage scenarios</li>
                    <li>• Describe component dependencies</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Description */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>AI will generate complete React component code and documentation based on your description</p>
        </div>
      </div>
    </div>
  )
}
