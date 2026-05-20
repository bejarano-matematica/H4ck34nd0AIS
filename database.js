// ==========================================
// BASE DE DATOS (database.js)
// ==========================================
const db = {
    level1: [
        { latexEq: "343^{x + 1} = 2401^{x - 2}", latexSuccess: "7^{3(x + 1)} = 7^{4(x - 2)}", latexLinear: "3(x + 1) = 4(x - 2)", base: "7", leftExp: "3", rightExp: "4", distLeft: ["3x+3", "3+3x"], distRight: ["4x-8", "-8+4x"], x: "11" },
        { latexEq: "216^{2x - 1} = 1296^{x + 1}", latexSuccess: "6^{3(2x - 1)} = 6^{4(x + 1)}", latexLinear: "3(2x - 1) = 4(x + 1)", base: "6", leftExp: "3", rightExp: "4", distLeft: ["6x-3", "-3+6x"], distRight: ["4x+4", "4+4x"], x: "3.5" },
        { latexEq: "125^{3x - 2} = 625^{2x + 1}", latexSuccess: "5^{3(3x - 2)} = 5^{4(2x + 1)}", latexLinear: "3(3x - 2) = 4(2x + 1)", base: "5", leftExp: "3", rightExp: "4", distLeft: ["9x-6", "-6+9x"], distRight: ["8x+4", "4+8x"], x: "10" },
        { latexEq: "256^{x + 3} = 1024^{x - 1}", latexSuccess: "2^{8(x + 3)} = 2^{10(x - 1)}", latexLinear: "8(x + 3) = 10(x - 1)", base: "2", leftExp: "8", rightExp: "10", distLeft: ["8x+24", "24+8x"], distRight: ["10x-10", "-10+10x"], x: "17" },
        { latexEq: "81^{3x - 1} = 243^{2x + 2}", latexSuccess: "3^{4(3x - 1)} = 3^{5(2x + 2)}", latexLinear: "4(3x - 1) = 5(2x + 2)", base: "3", leftExp: "4", rightExp: "5", distLeft: ["12x-4", "-4+12x"], distRight: ["10x+10", "10+10x"], x: "7" },
        { latexEq: "16^{2x + 1} = 64^{x - 1}", latexSuccess: "2^{4(2x + 1)} = 2^{6(x - 1)}", latexLinear: "4(2x + 1) = 6(x - 1)", base: "2", leftExp: "4", rightExp: "6", distLeft: ["8x+4", "4+8x"], distRight: ["6x-6", "-6+6x"], x: "-5" },
        { latexEq: "27^{x - 1} = 9^{x + 2}", latexSuccess: "3^{3(x - 1)} = 3^{2(x + 2)}", latexLinear: "3(x - 1) = 2(x + 2)", base: "3", leftExp: "3", rightExp: "2", distLeft: ["3x-3", "-3+3x"], distRight: ["2x+4", "4+2x"], x: "11" },
        { latexEq: "25^{3x - 1} = 125^{x + 2}", latexSuccess: "5^{2(3x - 1)} = 5^{3(x + 2)}", latexLinear: "2(3x - 1) = 3(x + 2)", base: "5", leftExp: "2", rightExp: "3", distLeft: ["6x-2", "-2+6x"], distRight: ["3x+6", "6+3x"], x: "2.66" },
        { latexEq: "49^{x + 4} = 343^{x}", latexSuccess: "7^{2(x + 4)} = 7^{3(x)}", latexLinear: "2(x + 4) = 3x", base: "7", leftExp: "2", rightExp: "3", distLeft: ["2x+8", "8+2x"], distRight: ["3x"], x: "8" },
        { latexEq: "32^{x - 2} = 128^{x - 4}", latexSuccess: "2^{5(x - 2)} = 2^{7(x - 4)}", latexLinear: "5(x - 2) = 7(x - 4)", base: "2", leftExp: "5", rightExp: "7", distLeft: ["5x-10", "-10+5x"], distRight: ["7x-28", "-28+7x"], x: "9" }
    ],
    level2: [
        { 
            latexEq: "2^{2x} + 2^{2x-1} + 2^{2x-2} + 2^{2x-3} + 2^{2x-4} = 1984", 
            latexExpansion: "2^{2x} + 2^{2x} \\cdot 2^{-1} + 2^{2x} \\cdot 2^{-2} + 2^{2x} \\cdot 2^{-3} + 2^{2x} \\cdot 2^{-4}",
            latexParenthesis: "1 + 2^{-1} + 2^{-2} + 2^{-3} + 2^{-4}",
            expansion: ["2^2x+2^2x.2^-1+2^2x.2^-2+2^2x.2^-3+2^2x.2^-4", "2^2x+2^2x*2^-1+2^2x*2^-2+2^2x*2^-3+2^2x*2^-4", "2^2x.1+2^2x.2^-1+2^2x.2^-2+2^2x.2^-3+2^2x.2^-4"],
            fcBase: "2", fcExp: "2x", 
            validParenthesis: ["1+2^-1+2^-2+2^-3+2^-4", "1+1/2+1/4+1/8+1/16"], 
            sumResult: ["31/16"],
            target: "1984", reducedTarget: "1024", x: "5" 
        },
        { 
            latexEq: "3^{x+2} + 3^{x+1} + 3^{x} + 3^{x-1} = 120", 
            latexExpansion: "3^{x} \\cdot 3^{2} + 3^{x} \\cdot 3^{1} + 3^{x} \\cdot 1 + 3^{x} \\cdot 3^{-1}",
            latexParenthesis: "3^{2} + 3^{1} + 1 + 3^{-1}",
            expansion: ["3^x.3^2+3^x.3^1+3^x+3^x.3^-1", "3^x*3^2+3^x*3^1+3^x+3^x*3^-1", "3^x.3^2+3^x.3^1+3^x.1+3^x.3^-1"],
            fcBase: "3", fcExp: "x", 
            validParenthesis: ["3^2+3^1+1+3^-1", "9+3+1+1/3"], 
            sumResult: ["40/3"],
            target: "120", reducedTarget: "9", x: "2" 
        },
        { 
            latexEq: "5^{x+1} + 5^{x} + 5^{x-1} = 775", 
            latexExpansion: "5^{x} \\cdot 5^{1} + 5^{x} \\cdot 1 + 5^{x} \\cdot 5^{-1}",
            latexParenthesis: "5^{1} + 1 + 5^{-1}",
            expansion: ["5^x.5^1+5^x+5^x.5^-1", "5^x*5^1+5^x+5^x*5^-1", "5^x.5^1+5^x.1+5^x.5^-1"],
            fcBase: "5", fcExp: "x", 
            validParenthesis: ["5^1+1+5^-1", "5+1+1/5"], 
            sumResult: ["31/5"],
            target: "775", reducedTarget: "125", x: "3" 
        },
        { 
            latexEq: "2^{x-1} + 2^{x-2} + 2^{x-3} + 2^{x-4} = 960", 
            latexExpansion: "2^{x} \\cdot 2^{-1} + 2^{x} \\cdot 2^{-2} + 2^{x} \\cdot 2^{-3} + 2^{x} \\cdot 2^{-4}",
            latexParenthesis: "2^{-1} + 2^{-2} + 2^{-3} + 2^{-4}",
            expansion: ["2^x.2^-1+2^x.2^-2+2^x.2^-3+2^x.2^-4", "2^x*2^-1+2^x*2^-2+2^x*2^-3+2^x*2^-4"],
            fcBase: "2", fcExp: "x", 
            validParenthesis: ["2^-1+2^-2+2^-3+2^-4", "1/2+1/4+1/8+1/16"], 
            sumResult: ["15/16"],
            target: "960", reducedTarget: "1024", x: "10" 
        },
        { 
            latexEq: "4^{x+2} - 4^{x+1} + 4^{x} = 208", 
            latexExpansion: "4^{x} \\cdot 4^{2} - 4^{x} \\cdot 4^{1} + 4^{x} \\cdot 1",
            latexParenthesis: "4^{2} - 4^{1} + 1",
            expansion: ["4^x.4^2-4^x.4^1+4^x", "4^x.4^2-4^x.4^1+4^x.1", "4^x*4^2-4^x*4^1+4^x*1"],
            fcBase: "4", fcExp: "x", 
            validParenthesis: ["4^2-4^1+1", "16-4+1"], 
            sumResult: ["13", "13/1"],
            target: "208", reducedTarget: "16", x: "2" 
        },
        { 
            latexEq: "2^{x+3} + 2^{x+2} - 2^{x+1} = 160", 
            latexExpansion: "2^{x} \\cdot 2^{3} + 2^{x} \\cdot 2^{2} - 2^{x} \\cdot 2^{1}",
            latexParenthesis: "2^{3} + 2^{2} - 2^{1}",
            expansion: ["2^x.2^3+2^x.2^2-2^x.2^1", "2^x*2^3+2^x*2^2-2^x*2^1"],
            fcBase: "2", fcExp: "x", 
            validParenthesis: ["2^3+2^2-2^1", "8+4-2"], 
            sumResult: ["10", "10/1"],
            target: "160", reducedTarget: "16", x: "4" 
        },
        { 
            latexEq: "3^{x+1} + 3^{x} - 3^{x-1} = 99", 
            latexExpansion: "3^{x} \\cdot 3^{1} + 3^{x} \\cdot 1 - 3^{x} \\cdot 3^{-1}",
            latexParenthesis: "3^{1} + 1 - 3^{-1}",
            expansion: ["3^x.3^1+3^x-3^x.3^-1", "3^x.3^1+3^x.1-3^x.3^-1", "3^x*3^1+3^x*1-3^x*3^-1"],
            fcBase: "3", fcExp: "x", 
            validParenthesis: ["3^1+1-3^-1", "3+1-1/3"], 
            sumResult: ["11/3"],
            target: "99", reducedTarget: "27", x: "3" 
        },
        { 
            latexEq: "7^{x+1} - 7^{x} = 294", 
            latexExpansion: "7^{x} \\cdot 7^{1} - 7^{x} \\cdot 1",
            latexParenthesis: "7^{1} - 1",
            expansion: ["7^x.7^1-7^x", "7^x*7^1-7^x", "7^x.7^1-7^x.1"],
            fcBase: "7", fcExp: "x", 
            validParenthesis: ["7^1-1", "7-1"], 
            sumResult: ["6", "6/1"],
            target: "294", reducedTarget: "49", x: "2" 
        }
    ],
    level3: [
        { 
            latexEq: "16^{x} + 4^{x} - 12 = 0", 
            latexIntermediate: "(4^{x})^{2} + 4^{x} - 12 = 0",
            latexQuad: "u^{2} + u - 12 = 0",
            uBase: "4", uExp: "x", root1: "3", root2: "-4", 
            route1: { latex: "4^{x} = 3", isValid: true, type: "log", logBase: "4", logArg: "3" },
            route2: { latex: "4^{x} = -4", isValid: false }
        },
        { 
            latexEq: "25^{x} - 6 \\cdot 5^{x} - 7 = 0", 
            latexIntermediate: "(5^{x})^{2} - 6 \\cdot 5^{x} - 7 = 0",
            latexQuad: "u^{2} - 6u - 7 = 0",
            uBase: "5", uExp: "x", root1: "7", root2: "-1", 
            route1: { latex: "5^{x} = 7", isValid: true, type: "log", logBase: "5", logArg: "7" },
            route2: { latex: "5^{x} = -1", isValid: false }
        },
        { 
            latexEq: "4^{x} + 2^{x} - 6 = 0", 
            latexIntermediate: "(2^{x})^{2} + 2^{x} - 6 = 0",
            latexQuad: "u^{2} + u - 6 = 0",
            uBase: "2", uExp: "x", root1: "2", root2: "-3", 
            route1: { latex: "2^{x} = 2", isValid: true, type: "base", matchExpLeft: "x", matchExpRight: "1", finalX: "1" },
            route2: { latex: "2^{x} = -3", isValid: false } 
        },
        { 
            latexEq: "4^{x} + 2^{x} - 30 = 0", 
            latexIntermediate: "(2^{x})^{2} + 2^{x} - 30 = 0",
            latexQuad: "u^{2} + u - 30 = 0",
            uBase: "2", uExp: "x", root1: "5", root2: "-6", 
            route1: { latex: "2^{x} = 5", isValid: true, type: "log", logBase: "2", logArg: "5" },
            route2: { latex: "2^{x} = -6", isValid: false }
        },
        { 
            latexEq: "9^{x} - 2 \\cdot 3^{x} - 15 = 0", 
            latexIntermediate: "(3^{x})^{2} - 2 \\cdot 3^{x} - 15 = 0",
            latexQuad: "u^{2} - 2u - 15 = 0",
            uBase: "3", uExp: "x", root1: "5", root2: "-3", 
            route1: { latex: "3^{x} = 5", isValid: true, type: "log", logBase: "3", logArg: "5" },
            route2: { latex: "3^{x} = -3", isValid: false }
        },
        { 
            latexEq: "49^{x} - 4 \\cdot 7^{x} - 12 = 0", 
            latexIntermediate: "(7^{x})^{2} - 4 \\cdot 7^{x} - 12 = 0",
            latexQuad: "u^{2} - 4u - 12 = 0",
            uBase: "7", uExp: "x", root1: "6", root2: "-2", 
            route1: { latex: "7^{x} = 6", isValid: true, type: "log", logBase: "7", logArg: "6" },
            route2: { latex: "7^{x} = -2", isValid: false }
        }, // <--- ¡Esta es la coma que faltaba!
        { 
            latexEq: "4^{x} - 4 \\cdot 2^{x} - 32 = 0", 
            latexIntermediate: "(2^{x})^{2} - 4 \\cdot 2^{x} - 32 = 0",
            latexQuad: "u^{2} - 4u - 32 = 0",
            uBase: "2", uExp: "x", root1: "8", root2: "-4", 
            route1: { latex: "2^{x} = 8", isValid: true, type: "base", matchExpLeft: "x", matchExpRight: "3", finalX: "3" },
            route2: { latex: "2^{x} = -4", isValid: false } 
        },
        { 
            latexEq: "9^{x} - 7 \\cdot 3^{x} - 18 = 0", 
            latexIntermediate: "(3^{x})^{2} - 7 \\cdot 3^{x} - 18 = 0",
            latexQuad: "u^{2} - 7u - 18 = 0",
            uBase: "3", uExp: "x", root1: "9", root2: "-2", 
            route1: { latex: "3^{x} = 9", isValid: true, type: "base", matchExpLeft: "x", matchExpRight: "2", finalX: "2" },
            route2: { latex: "3^{x} = -2", isValid: false } 
        },
        { 
            latexEq: "25^{x} - 20 \\cdot 5^{x} - 125 = 0", 
            latexIntermediate: "(5^{x})^{2} - 20 \\cdot 5^{x} - 125 = 0",
            latexQuad: "u^{2} - 20u - 125 = 0",
            uBase: "5", uExp: "x", root1: "25", root2: "-5", 
            route1: { latex: "5^{x} = 25", isValid: true, type: "base", matchExpLeft: "x", matchExpRight: "2", finalX: "2" },
            route2: { latex: "5^{x} = -5", isValid: false } 
        }
    ]
