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
          
          // Extract Preview Codes field (AI generates multiple render examples)
          const previewCodesStart = trimmedSection.indexOf('## Preview Codes:')
          
          if (previewCodesStart !== -1) {
            const previewCodesSection = trimmedSection.substring(previewCodesStart)
            // Find all code blocks in the preview codes section
            const previewCodeBlocks = previewCodesSection.match(/```(?:tsx|ts|jsx|js)?\s*([\s\S]*?)```/g)
            
            if (previewCodeBlocks && previewCodeBlocks.length > 0) {
              const previewCodes: string[] = []
              
              for (const codeBlock of previewCodeBlocks) {
                const codeMatch = codeBlock.match(/```(?:tsx|ts|jsx|js)?\s*([\s\S]*?)```/)
                if (codeMatch) {
                  let aiRenderFunction = codeMatch[1].trim()
                  
                  // Clean up AI's render function - remove any component definitions and keep only render calls
                  aiRenderFunction = aiRenderFunction
                    .split('\n')
                    .filter(line => line.trim().startsWith('render(') || line.trim().startsWith('//'))
                    .join('\n')
                  
                  // Use AST to generate component definition + cleaned AI render function
                  if (component.code && component.name) {
                    try {
                      const { generatePreviewCodeFromAST } = require('@/lib/ast-parser')
                      const componentDefinition = generatePreviewCodeFromAST(component.code)
                      
                      // Combine: component definition from AST + cleaned render function from AI
                      previewCodes.push(componentDefinition + '\n\n' + aiRenderFunction)
                    } catch (error) {
                      console.error('❌ AST parsing failed:', error)
                      // Fallback: use cleaned AI render function with simple component
                      previewCodes.push(`const ${component.name} = () => <div>Component</div>\n\n${aiRenderFunction}`)
                    }
                  }
                }
              }
              
              component.previewCodes = previewCodes
            }
          }
          
          // Fallback: if no previewCodes are provided, generate one previewCode using AST
          if (!component.previewCodes && component.code && component.name) {
            try {
              const { generatePreviewCodeFromAST } = require('@/lib/ast-parser')
              const componentDefinition = generatePreviewCodeFromAST(component.code)
              component.previewCodes = [componentDefinition + '\n\nrender(<' + component.name + ' />)']
            } catch (error) {
              console.error('❌ AST parsing failed:', error)
              // Final fallback
              component.previewCodes = [`const ${component.name} = () => <div>Component</div>\n\nrender(<${component.name} />)`]
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

IMPORTANT: When users use vague terms like "等等" (etc.), "等" (and so on), "..." (ellipsis), "and more", "etc.", "and so on", or similar expressions, you should intelligently expand and generate additional related components to create a comprehensive component library.

Please strictly follow the following Markdown format for output:

# Component: [Component Name]

## ID: [Component unique identifier, English, use hyphens to separate]
## Name: [Component display name]
## Category: [Component category, such as: Buttons, Cards, Forms, Navigation, etc.]
## Description: [Component brief description]
## Documentation: [Component detailed documentation, Markdown format, including features, usage, Props, etc.]
## Code: [Complete component code, using modern React syntax and TypeScript, maintain code formatting and readability, do not compress. IMPORTANT: Include comprehensive props with various types (string, number, boolean, function, ReactNode, etc.) and provide detailed TypeScript interfaces. Each component should have at least 8-12 different props to showcase flexibility and reusability. CRITICAL: Do NOT reference other components like Button, Icon, etc. Use only basic HTML elements with Tailwind CSS styling.]

\`\`\`tsx
// Complete component code with rich props
\`\`\`

## Preview Codes: [Generate multiple render examples to showcase different component variants and usage scenarios. Each example should demonstrate different prop combinations and values. The component definition will be automatically generated by the system. Generate at least 5-8 examples with diverse prop combinations. IMPORTANT: For children content, use only simple text, emojis, or basic HTML elements, never reference other React components.]

\`\`\`tsx
// Example 1: Basic usage with minimal props
render(<ComponentName />)
\`\`\`

\`\`\`tsx
// Example 2: Primary variant with size and disabled state
render(<ComponentName variant="primary" size="large" disabled={true} />)
\`\`\`

\`\`\`tsx
// Example 3: Secondary variant with custom styling and events
render(<ComponentName variant="secondary" size="medium" className="custom-class" onClick={() => alert('clicked')} />)
\`\`\`

\`\`\`tsx
// Example 4: With children and complex props
render(<ComponentName variant="outline" size="small" loading={true} icon="star" badge="new">🚀 Click me! ✨</ComponentName>)
\`\`\`

\`\`\`tsx
// Example 5: Advanced usage with all major props
render(<ComponentName variant="ghost" size="xl" disabled={false} loading={false} icon="arrow-right" badge="hot" className="w-full" style={{fontWeight: 'bold'}} onClick={() => console.log('advanced')} onMouseEnter={() => console.log('hover')} />)
\`\`\`

---

# Component: [Additional Component Name]

[Repeat the same format for additional components when expanding on vague requests]

---

# Analysis: [Requirements Analysis]

## Summary: [Requirements summary, concise and clear summary of user's core needs]
## Component Categories: [Component category analysis]
## Technical Requirements: [Technical requirements list]
## Design Patterns: [Recommended design patterns]
## Estimated Complexity: [Estimated complexity: low|medium|high]
## Recommendations: [Optimization suggestions list]
## Dependencies: [Possible dependency relationship list]

## Component Expansion Strategy
[When users use vague terms like "等等", "...", "etc.", "and more", "and so on", intelligently expand to include related components. For example:
- If they mention "Button, Card, Input 等等" or "Button, Card, Input ...", also generate: Select, Textarea, Checkbox, Radio, Switch, Modal, Tooltip, Badge, Avatar, etc.
- If they mention "Navigation 等等" or "Navigation ...", also generate: Breadcrumb, Pagination, Tabs, Menu, Sidebar, etc.
- Always maintain consistency with the user's style preferences (transparency, shadows, etc.)]

Generation requirements:
1. If user describes a single component, create one component
2. If user describes multiple components, create each component separately
3. If user describes functional requirements, break them down into specific components
4. If user uses vague terms like "等等", "...", "etc.", "and more", "and so on", intelligently expand to create a comprehensive component library
5. Use modern React syntax and TypeScript
6. Include comprehensive Props interfaces with at least 8-12 different props covering various types (string, number, boolean, function, ReactNode, etc.)
7. Props should include: variant, size, disabled, loading, icon, badge, className, style, onClick, onMouseEnter, children, etc.
8. Use Tailwind CSS for styling with dynamic classes based on props
9. Have good accessibility with proper ARIA attributes
10. Clear code structure, easy to understand
11. Strictly follow Markdown format, do not include other text
12. Provide both requirements analysis and component code
13. Maintain code formatting and readability, use appropriate indentation, line breaks and empty lines, do not compress code
14. Ensure code is easy to read and maintain
15. Ensure generated code is fully compatible with react-live environment and can run directly
16. Avoid advanced syntax features not supported by react-live
17. Code must include complete component implementation, not just JSX part
18. Components must be able to render normally, not just function definitions
19. Absolutely do not reference other component files, do not use import statements to import other components
20. Each component must be completely independent, containing all necessary internal logic and styles
21. ABSOLUTELY NO component references: Do NOT use other components like Button, Icon, etc. within any component. If you need to show interactive elements, use basic HTML elements (button, div, span, etc.) with Tailwind CSS styling
22. If you need to display other components within a component, please implement them inline directly, do not reference external files
23. Ensure components can run independently in isolated environments without depending on any external component dependencies
24. For children content, use simple text, emojis, or basic HTML elements, never reference other React components
25. Preview examples should showcase different prop combinations to demonstrate component flexibility

  Please strictly follow this format, each component must contain all fields. For Preview Code, only generate the render function part (e.g., render(<ComponentName />)).`

    const userPrompt = `Please generate the following component requirements:

${prompt}

IMPORTANT: If the user uses vague terms like "等等" (etc.), "等" (and so on), "..." (ellipsis), "and more", "etc.", "and so on", please intelligently expand and generate additional related components to create a comprehensive component library. For example:
- If they mention "Button, Card, Input 等等" or "Button, Card, Input ...", also generate: Select, Textarea, Checkbox, Radio, Switch, Modal, Tooltip, Badge, Avatar, etc.
- If they mention "Navigation 等等" or "Navigation ...", also generate: Breadcrumb, Pagination, Tabs, Menu, Sidebar, etc.
- Always maintain consistency with the user's style preferences (transparency, shadows, etc.)

CRITICAL: Each component must have comprehensive props (at least 8-12 different props) including:
- Variant props (primary, secondary, outline, ghost, etc.)
- Size props (xs, sm, md, lg, xl, etc.)
- State props (disabled, loading, active, etc.)
- Style props (className, style, color, etc.)
- Event props (onClick, onMouseEnter, onChange, etc.)
- Content props (icon, badge, children, etc.)
- Accessibility props (aria-label, role, etc.)

Please provide complete component code and requirements analysis. The generated component code must be suitable for running in a react-live environment, which already includes React 18 and Tailwind CSS.

Important requirements:
1. Please maintain code formatting and readability, use appropriate indentation, line breaks and empty lines, do not compress code
2. Ensure code is easy to read and maintain
3. Special attention: Code must include all functions, variables and logic used within the component, do not delete any necessary code
4. Most importantly, code must include complete component implementation to ensure the component can render normally
5. Absolutely do not reference other component files, do not use import statements to import other components
6. Each component must be completely independent, containing all necessary internal logic and styles
7. ABSOLUTELY NO component references: Do NOT use other components like Button, Icon, etc. within any component. If you need to show interactive elements, use basic HTML elements (button, div, span, etc.) with Tailwind CSS styling
8. If you need to display other components within a component, please implement them inline directly, do not reference external files
9. Ensure components can run independently in isolated environments without depending on any external component dependencies
10. For children content, use simple text, emojis, or basic HTML elements, never reference other React components
9. When expanding on vague requests, generate 3-5 additional related components to create a comprehensive library
10. Each component must have rich, comprehensive props (8-12+ props) to demonstrate flexibility and reusability
11. Preview examples must showcase different prop combinations to highlight component capabilities

Please ensure the return is in valid Markdown format. Each component must contain all fields. For Preview Codes, generate multiple render examples to showcase different component variants and usage scenarios with diverse prop combinations.`

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
