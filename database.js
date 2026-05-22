// ==========================================
// BASE DE DATOS (database.js)
// ==========================================
const db = {
    level1: [
        { latexEq: "343^{x + 1} = 2401^{x - 2}", latexSuccess: "7^{3(x + 1)} = 7^{4(x - 2)}", latexLinear: "3(x + 1) = 4(x - 2)", base: "7", leftExp: "3", rightExp: "4", distLeft: ["3x+3", "3+3x"], distRight: ["4x-8", "-8+4x"], x: "11" },
        { latexEq: "216^{2x - 1} = 1296^{x + 1}", latexSuccess: "6^{3(2x - 1)} = 6^{4(x + 1)}", latexLinear: "3(2x - 1) = 4(x + 1)", base: "6", leftExp: "3", rightExp: "4", distLeft: ["6x-3", "-3+6x"], distRight: ["4x+4", "4+4x"], x: "3.5" },
        { latexEq: "125^{3x - 2} = 625^{2x + 1}", latexSuccess: "5^{3(3x - 2)} = 5^{4(2x + 1)}", latexLinear: "3(3x - 2) = 4(2x + 1)", base: "5", leftExp: "3", rightExp: "4", distLeft: ["9x-6", "-6+9x"], distRight: ["8x+4", "4+8x"], x: "10" },
        // Ejercicios con exponentes negativos (Fracciones)
        { latexEq: "\\left(\\frac{1}{4}\\right)^{2x - 1} = 8^{x + 3}", latexSuccess: "2^{-2(2x - 1)} = 2^{3(x + 3)}", latexLinear: "-2(2x - 1) = 3(x + 3)", base: "2", leftExp: "-2", rightExp: "3", distLeft: ["-4x+2", "2-4x"], distRight: ["3x+9", "9+3x"], x: "-1" },
        { latexEq: "125^{x + 1} = \\left(\\frac{1}{25}\\right)^{x - 4}", latexSuccess: "5^{3(x + 1)} = 5^{-2(x - 4)}", latexLinear: "3(x + 1) = -2(x - 4)", base: "5", leftExp: "3", rightExp: "-2", distLeft: ["3x+3", "3+3x"], distRight: ["-2x+8", "8-2x"], x: "1" },
        { latexEq: "\\left(\\frac{1}{9}\\right)^{x + 1} = 27^{x - 2}", latexSuccess: "3^{-2(x + 1)} = 3^{3(x - 2)}", latexLinear: "-2(x + 1) = 3(x - 2)", base: "3", leftExp: "-2", rightExp: "3", distLeft: ["-2x-2", "-2-2x"], distRight: ["3x-6", "-6+3x"], x: "0.8" }
    ],
    level2: [
        { 
            latexEq: "2^{2x+4} + 2^{2x+3} + 2^{2x+2} + 2^{2x+1} + 2^{2x} = 1984", 
            latexExpansion: "2^{2x} \\cdot 2^{4} + 2^{2x} \\cdot 2^{3} + 2^{2x} \\cdot 2^{2} + 2^{2x} \\cdot 2^{1} + 2^{2x} \\cdot 1",
            latexParenthesis: "2^{4} + 2^{3} + 2^{2} + 2^{1} + 1",
            expansion: ["2^2x.2^4+2^2x.2^3+2^2x.2^2+2^2x.2^1+2^2x", "2^2x.2^4+2^2x.2^3+2^2x.2^2+2^2x.2^1+2^2x.1"],
            fcBase: "2", fcExp: "2x", validParenthesis: ["2^4+2^3+2^2+2^1+1", "16+8+4+2+1"], 
            sumResult: ["31", "31/1"], target: "1984", reducedTarget: "64", x: "3" 
        },
        { 
            latexEq: "3^{x+2} + 3^{x+1} + 3^{x} + 3^{x-1} = 120", 
            latexExpansion: "3^{x} \\cdot 3^{2} + 3^{x} \\cdot 3^{1} + 3^{x} \\cdot 1 + 3^{x} \\cdot 3^{-1}",
            latexParenthesis: "3^{2} + 3^{1} + 1 + 3^{-1}",
            expansion: ["3^x.3^2+3^x.3^1+3^x+3^x.3^-1", "3^x.3^2+3^x.3^1+3^x.1+3^x.3^-1"],
            fcBase: "3", fcExp: "x", validParenthesis: ["3^2+3^1+1+3^-1", "9+3+1+1/3"], 
            sumResult: ["40/3"], target: "120", reducedTarget: "9", x: "2" 
        },
        { 
            latexEq: "4^{x+2} - 4^{x+1} + 4^{x} = 208", 
            latexExpansion: "4^{x} \\cdot 4^{2} - 4^{x} \\cdot 4^{1} + 4^{x} \\cdot 1",
            latexParenthesis: "4^{2} - 4^{1} + 1",
            expansion: ["4^x.4^2-4^x.4^1+4^x", "4^x.4^2-4^x.4^1+4^x.1"],
            fcBase: "4", fcExp: "x", validParenthesis: ["4^2-4^1+1", "16-4+1"], 
            sumResult: ["13", "13/1"], target: "208", reducedTarget: "16", x: "2" 
        }
    ],
    level3: [
        // 1. Una solución válida (Logaritmo)
        { 
            latexEq: "16^{x} + 4^{x} - 12 = 0", 
            latexIntermediate: "(4^{x})^{2} + 4^{x} - 12 = 0", latexQuad: "u^{2} + u - 12 = 0",
            uBase: "4", uExp: "x", root1: "3", root2: "-4", 
            route1: { latex: "4^{x} = 3", isValid: true, type: "log", logBase: "4", logArg: "3" },
            route2: { latex: "4^{x} = -4", isValid: false }
        },
        // 2. Dos soluciones válidas (Logaritmo)
        { 
            latexEq: "9^{x} - 7 \\cdot 3^{x} + 10 = 0", 
            latexIntermediate: "(3^{x})^{2} - 7 \\cdot 3^{x} + 10 = 0", latexQuad: "u^{2} - 7u + 10 = 0",
            uBase: "3", uExp: "x", root1: "5", root2: "2", 
            route1: { latex: "3^{x} = 5", isValid: true, type: "log", logBase: "3", logArg: "5" },
            route2: { latex: "3^{x} = 2", isValid: true, type: "log", logBase: "3", logArg: "2" }
        },
        // 3. Una solución válida (Directa, sin log)
        { 
            latexEq: "4^{x} - 2^{x} - 2 = 0", 
            latexIntermediate: "(2^{x})^{2} - 2^{x} - 2 = 0", latexQuad: "u^{2} - u - 2 = 0",
            uBase: "2", uExp: "x", root1: "2", root2: "-1", 
            route1: { latex: "2^{x} = 2", isValid: true, type: "direct", xValue: "1" },
            route2: { latex: "2^{x} = -1", isValid: false }
        },
        // 4. Dos soluciones válidas (Directas, sin log)
        { 
            latexEq: "4^{x} - 6 \\cdot 2^{x} + 8 = 0", 
            latexIntermediate: "(2^{x})^{2} - 6 \\cdot 2^{x} + 8 = 0", latexQuad: "u^{2} - 6u + 8 = 0",
            uBase: "2", uExp: "x", root1: "4", root2: "2", 
            route1: { latex: "2^{x} = 4", isValid: true, type: "direct", xValue: "2" },
            route2: { latex: "2^{x} = 2", isValid: true, type: "direct", xValue: "1" }
        },
        // 5. Mixta (Una solución log, una solución directa)
        { 
            latexEq: "25^{x} - 8 \\cdot 5^{x} + 15 = 0", 
            latexIntermediate: "(5^{x})^{2} - 8 \\cdot 5^{x} + 15 = 0", latexQuad: "u^{2} - 8u + 15 = 0",
            uBase: "5", uExp: "x", root1: "5", root2: "3", 
            route1: { latex: "5^{x} = 5", isValid: true, type: "direct", xValue: "1" },
            route2: { latex: "5^{x} = 3", isValid: true, type: "log", logBase: "5", logArg: "3" }
        }
    ]  
};
