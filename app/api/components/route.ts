import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Parse Markdown format AI response
function parseMarkdownResponse(markdown: string) {
  try {
    // Use smarter splitting method, only split at true component separators
    const sections = markdown.split(/\n---\n/)
    const result: any = { components: [], analysis: {} }
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const trimmedSection = section.trim()
      if (!trimmedSection) continue
      
      // Parse component section
      if (trimmedSection.includes('# Component:')) {
        const componentMatch = trimmedSection.match(/# Component:\s*(.+)/)
        if (componentMatch) {
          const component: any = {}
          
          // Parse various fields
          const idMatch = trimmedSection.match(/## ID:\s*(.+)/)
          const nameMatch = trimmedSection.match(/## Name:\s*(.+)/)
          const categoryMatch = trimmedSection.match(/## Category:\s*(.+)/)
          const descriptionMatch = trimmedSection.match(/## Description:\s*(.+)/)
          const documentationMatch = trimmedSection.match(/## Documentation:\s*([\s\S]*?)(?=## Code:|$)/)
          
          if (idMatch) component.id = idMatch[1].trim()
          if (nameMatch) component.name = nameMatch[1].trim()
          if (categoryMatch) component.category = categoryMatch[1].trim()
          if (descriptionMatch) component.description = descriptionMatch[1].trim()
          if (documentationMatch) component.documentation = documentationMatch[1].trim()
          
          // Extract Code field
          const codeStart = trimmedSection.indexOf('## Code:')
          
          if (codeStart !== -1) {
            const codeSection = trimmedSection.substring(codeStart)
            const codeBlockMatch = codeSection.match(/```(?:tsx|ts|jsx|js)?\s*([\s\S]*?)```/)
            if (codeBlockMatch) {
              component.code = codeBlockMatch[1].trim()

            }
          }
          
          // Use AST parsing to automatically generate previewCode
          if (component.code) {
            try {
              const { generatePreviewCodeFromAST } = require('@/lib/ast-parser')
              component.previewCode = generatePreviewCodeFromAST(component.code)
            } catch (error) {
              console.error('❌ AST parsing failed:', error)
              // Final fallback
              component.previewCode = `render(<${component.name} />)`
            }
          }
          

          
          if (component.id && component.name) {
            result.components.push(component)
          }
        }
      }
      
      // Parse analysis section
      if (trimmedSection.includes('# Analysis:')) {
        const summaryMatch = trimmedSection.match(/## Summary:\s*(.+)/)
        const categoriesMatch = trimmedSection.match(/## Component Categories:\s*([\s\S]*?)(?=##|$)/)
        const technicalMatch = trimmedSection.match(/## Technical Requirements:\s*([\s\S]*?)(?=##|$)/)
        const patternsMatch = trimmedSection.match(/## Design Patterns:\s*([\s\S]*?)(?=##|$)/)
        const complexityMatch = trimmedSection.match(/## Estimated Complexity:\s*(.+)/)
        const recommendationsMatch = trimmedSection.match(/## Recommendations:\s*([\s\S]*?)(?=##|$)/)
        const dependenciesMatch = trimmedSection.match(/## Dependencies:\s*([\s\S]*?)(?=##|$)/)
        
        if (summaryMatch) result.analysis.summary = summaryMatch[1].trim()
        if (complexityMatch) result.analysis.estimatedComplexity = complexityMatch[1].trim()
        
        // Parse array fields
        if (categoriesMatch) {
          result.analysis.componentCategories = []
          const categoryLines = categoriesMatch[1].split('\n').filter(line => line.trim())
          for (const line of categoryLines) {
            if (line.includes(':')) {
              const [category, description] = line.split(':').map(s => s.trim())
              result.analysis.componentCategories.push({
                category,
                components: [],
                description
              })
            }
          }
        }
        
        if (technicalMatch) {
          result.analysis.technicalRequirements = technicalMatch[1]
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^[-*]\s*/, '').trim())
        }
        
        if (patternsMatch) {
          result.analysis.designPatterns = patternsMatch[1]
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^[-*]\s*/, '').trim())
        }
        
        if (recommendationsMatch) {
          result.analysis.recommendations = recommendationsMatch[1]
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^[-*]\s*/, '').trim())
        }
        
        if (dependenciesMatch) {
          result.analysis.dependencies = dependenciesMatch[1]
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^[-*]\s*/, '').trim())
        }
      }
    }
    
    return result
  } catch (error) {
    console.error('Markdown parsing failed:', error)
    throw new Error('Markdown format parsing failed')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Please provide prompt parameter' },
        { status: 400 }
      )
    }

    console.log('🎯 Received user request:', prompt)

    const systemPrompt = `You are a professional React component generation assistant. Please generate high-quality React component code and requirements analysis based on user needs.

Please strictly follow the following Markdown format for output:

# Component: [Component Name]

## ID: [Component unique identifier, English, use hyphens to separate]
## Name: [Component display name]
## Category: [Component category, such as: Buttons, Cards, Forms, Navigation, etc.]
## Description: [Component brief description]
## Documentation: [Component detailed documentation, Markdown format, including features, usage, Props, etc.]
## Code: [Complete component code, using modern React syntax and TypeScript, maintain code formatting and readability, do not compress]

\`\`\`tsx
// Complete component code
\`\`\`

---

# Analysis: [Requirements Analysis]

## Summary: [Requirements summary, concise and clear summary of user's core needs]
## Component Categories: [Component category analysis]
## Technical Requirements: [Technical requirements list]
## Design Patterns: [Recommended design patterns]
## Estimated Complexity: [Estimated complexity: low|medium|high]
## Recommendations: [Optimization suggestions list]
## Dependencies: [Possible dependency relationship list]

Generation requirements:
1. If user describes a single component, create one component
2. If user describes multiple components, create each component separately
3. If user describes functional requirements, break them down into specific components
4. Use modern React syntax and TypeScript
5. Include appropriate Props interfaces
6. Use Tailwind CSS for styling
7. Have good accessibility
8. Clear code structure, easy to understand
9. Strictly follow Markdown format, do not include other text
10. Provide both requirements analysis and component code
11. Maintain code formatting and readability, use appropriate indentation, line breaks and empty lines, do not compress code
12. Ensure code is easy to read and maintain
13. Ensure generated code is fully compatible with react-live environment and can run directly
14. Avoid advanced syntax features not supported by react-live
15. Code must include complete component implementation, not just JSX part
16. Components must be able to render normally, not just function definitions
17. Absolutely do not reference other component files, do not use import statements to import other components
18. Each component must be completely independent, containing all necessary internal logic and styles
19. If you need to display other components within a component, please implement them inline directly, do not reference external files
20. Ensure components can run independently in isolated environments without depending on any external component dependencies

  Please strictly follow this format, each component must contain all fields. Preview Code will be automatically generated by the system.`

    const userPrompt = `Please generate the following component requirements:

${prompt}

Please provide complete component code and requirements analysis. The generated component code must be suitable for running in a react-live environment, which already includes React 18 and Tailwind CSS.

Important requirements:
1. Please maintain code formatting and readability, use appropriate indentation, line breaks and empty lines, do not compress code
2. Ensure code is easy to read and maintain
3. Special attention: Code must include all functions, variables and logic used within the component, do not delete any necessary code
4. Most importantly, code must include complete component implementation to ensure the component can render normally
5. Absolutely do not reference other component files, do not use import statements to import other components
6. Each component must be completely independent, containing all necessary internal logic and styles
7. If you need to display other components within a component, please implement them inline directly, do not reference external files
8. Ensure components can run independently in isolated environments without depending on any external component dependencies

Please ensure the return is in valid Markdown format. Each component must contain all fields. Preview Code will be automatically generated by the system.`

    console.log('🤖 Starting OpenAI API call...')

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            stream: true,
          })

          let fullResponse = ''
          let lastParsedResult = null

          // Send start event
          const startData = JSON.stringify({
            type: 'start',
            message: 'Started processing user requirements',
            prompt: prompt,
            timestamp: new Date().toISOString()
          })
          
          controller.enqueue(new TextEncoder().encode(`event: start\ndata: ${startData}\n\n`))

          // Handle streaming response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              
              // Try to parse current accumulated response
              try {
                const parsedResult = parseMarkdownResponse(fullResponse)
                if (parsedResult && parsedResult.components && parsedResult.components.length > 0) {
                  lastParsedResult = parsedResult
                  
                  // Send parsed complete JSON
                  const chunkData = JSON.stringify({
                    type: 'chunk',
                    data: parsedResult,
                    timestamp: new Date().toISOString()
                  })
                  
                  controller.enqueue(new TextEncoder().encode(`event: chunk\ndata: ${chunkData}\n\n`))
                }
              } catch (parseError) {
                // Continue accumulating content when parsing fails
              }
            }
          }

          // Send final result
          if (lastParsedResult) {
            const finalData = JSON.stringify({
              type: 'done',
              data: lastParsedResult,
              timestamp: new Date().toISOString()
            })
            
            controller.enqueue(new TextEncoder().encode(`event: done\ndata: ${finalData}\n\n`))
          }

          controller.close()
        } catch (error) {
          console.error('❌ OpenAI API call failed:', error)
          const errorData = JSON.stringify({
            type: 'error',
            error: 'OpenAI API call failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
          
          controller.enqueue(new TextEncoder().encode(`event: error\ndata: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('❌ API request processing failed:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET方法 - 提供API信息
export async function GET() {
  return NextResponse.json({
    message: "Simplified Component API - Just Pass a Prompt",
    usage: {
      method: "POST",
      endpoint: "/api/components",
      body: {
        prompt: "描述你需要的组件，可以是单个或多个组件"
      }
    },
    features: {
      "Smart Parsing": "AI automatically understands user requirements and generates appropriate components",
      "Batch Generation": "Supports batch generation of multiple components",
      "Requirements Analysis": "Automatically provides technical analysis and suggestions",
      "Real-time Progress": "Server-Sent Events displays progress in real-time"
    },
    examples: {
      "Single Component": "Generate a modern React button component with support for multiple color themes and sizes",
      "Multiple Components": "Create a responsive card component with image, title and description; generate a form component with input fields, selectors and submit button",
      "Functional Requirements": "Create a complete navigation system for an e-commerce website, including top navigation bar, side menu and breadcrumb navigation"
    }
  })
}
