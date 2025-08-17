import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

// Generate previewCode based on Babel AST parsing
export function generatePreviewCodeFromAST(code: string): string {
  try {
    // Parse code to AST
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    })

    let componentName = 'Component'
    let componentProps: string[] = []
    let componentBody: string[] = []
    let jsxReturn: string = ''

    // Traverse AST to find component definitions
    traverse(ast, {
      // Find function declarations
      FunctionDeclaration(path: any) {
        if (path.node.id && path.node.id.name) {
          componentName = path.node.id.name

          // Extract parameters
          if (path.node.params) {
            componentProps = path.node.params.map((param: any) => {
              if (t.isIdentifier(param)) {
                return param.name
              } else if (t.isObjectPattern(param)) {
                return `{ ${param.properties.map((prop: any) => {
                  if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                    return prop.key.name
                  }
                  return ''
                }).filter(Boolean).join(', ')} }`
              }
              return ''
            }).filter(Boolean)
          }

          // Extract function body
          if (path.node.body && t.isBlockStatement(path.node.body)) {
            const statements = path.node.body.body

            for (const statement of statements) {
              if (t.isReturnStatement(statement)) {
                // Extract return JSX
                if (statement.argument) {
                  jsxReturn = code.substring(statement.argument.start!, statement.argument.end!)
                }
              } else {
                // Extract other statements
                const statementCode = code.substring(statement.start!, statement.end!)
                componentBody.push(statementCode)
              }
            }
          }
        }
      },

      // Find arrow functions
      VariableDeclarator(path: any) {
        if (t.isArrowFunctionExpression(path.node.init)) {
          const arrowFunc = path.node.init

          // Extract parameters
          if (arrowFunc.params) {
            componentProps = arrowFunc.params.map((param: any) => {
              if (t.isIdentifier(param)) {
                return param.name
              } else if (t.isObjectPattern(param)) {
                return `{ ${param.properties.map((prop: any) => {
                  if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                    return prop.key.name
                  }
                  return ''
                }).filter(Boolean).join(', ')} }`
              }
              return ''
            }).filter(Boolean)
          }

          // Extract function body
          if (t.isBlockStatement(arrowFunc.body)) {
            const statements = arrowFunc.body.body

            for (const statement of statements) {
              if (t.isReturnStatement(statement)) {
                // Extract return JSX
                if (statement.argument) {
                  jsxReturn = code.substring(statement.argument.start!, statement.argument.end!)
                }
              } else {
                // Extract other statements
                const statementCode = code.substring(statement.start!, statement.end!)
                componentBody.push(statementCode)
              }
            }
          } else if (t.isJSXElement(arrowFunc.body)) {
            // Direct return JSX case
            jsxReturn = code.substring(arrowFunc.body.start!, arrowFunc.body.end!)
          }
        }
      }
    })

    // Build previewCode
    let previewCode = `function ${componentName}(${componentProps.join(', ')}) {\n`

    // Add logic in component body
    if (componentBody.length > 0) {
      previewCode += `  ${componentBody.join('\n  ')}\n\n`
    }

    // Add render function
    previewCode += `  const render = () => {\n`
    previewCode += `    return ${jsxReturn};\n`
    previewCode += `  };\n\n`

    // Call render function, passing component instance
    previewCode += `  return render();\n`
    previewCode += `}\n\n`

    // Generate random content
    const randomContents = [
      'Click me!',
      'Submit',
      'Save',
      'Cancel',
      'Confirm',
      'Delete',
      'Edit',
      'View',
      'Download',
      'Upload',
      'Search',
      'Filter',
      'Sort',
      'Refresh',
      'Next',
      'Previous',
      'Finish',
      'Start',
      'Stop',
      'Play',
      'Pause',
      'Settings',
      'Profile',
      'Dashboard',
      'Home',
      'Back',
      'Forward',
      'Menu',
      'Close',
      'Open'
    ]

    // Randomly select content
    const randomContent = randomContents[Math.floor(Math.random() * randomContents.length)]
    const randomEmoji = ['🚀', '✨', '🎯', '💡', '🔥', '⭐', '🎉', '🎨', '🚀', '💎'][Math.floor(Math.random() * 5)]

    // Generate different render calls based on component type
    if (componentProps.some(prop => prop.includes('children'))) {
      // Components with children, pass random content
      previewCode += `render(<${componentName}>${randomEmoji} ${randomContent}</${componentName}>)`
    } else {
      // Components without children, don't pass content
      previewCode += `render(<${componentName} />)`
    }

    return previewCode

  } catch (error) {
    console.error('❌ Babel AST parsing failed to generate previewCode:', error)

    // Fallback solution: use simple code wrapping
    try {
      // Try to extract JSX content
      const jsxMatch = code.match(/(<[^>]*>[\s\S]*<\/[^>]*>|<[^>]*\/>)/)
      if (jsxMatch) {
        const randomContent = ['Click me!', 'Submit', 'Save', 'Cancel'][Math.floor(Math.random() * 4)]
        const randomEmoji = ['🚀', '✨', '🎯', '💡'][Math.floor(Math.random() * 4)]
        
        return `function Component() {
  const render = () => {
    return ${jsxMatch[1]};
  };
  return render();
}

render(<Component>${randomEmoji} ${randomContent}</Component>)`
      }
    } catch (fallbackError) {
      console.error('Fallback solution also failed:', fallbackError)
    }

    // Final fallback
    return `function Component() {
  const render = () => {
    return <div>Component generated from Babel AST</div>;
  };
  return render();
}

render(<Component>🚀 Click me!</Component>)`
  }
}
