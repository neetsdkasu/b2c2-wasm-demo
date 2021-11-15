// CodeMirror mode b2c2-BASIC
// author: Leonardone @ NEETSDKASU

CodeMirror.defineMode("b2c2", function(conf, parserConf) {
    "use strict";

    const op1Symbol = [
        "-",
        "+",
        "*",
        "\\",
        "&",
        "<",
        ">",
        "=",
        ",",
    ];

    const op2Symbol = [
        ">=",
        "<=",
        "<>",
        ">>",
        "<<",
        "+=",
        "-=",
    ];

    const op3Symbol = [
        ">>>",
        "<<<",
    ];

    const commentKeyword = [
        "REM",
    ];

    const topOnlyKeyword = [
        "DIM",
        "OPTION",
        "EXTERN",
        "END",
        "ARGUMENT",
        "ELSEIF",
        "LOOP",
        "EXIT",
        "FILL",
        "INPUT",
        "PRINT",
        "NEXT",
        "BYREF",
        "BYVAL",
    ];

    const topKeyword = [
        "CALL",     // END CALL
        "SUB",      // EXTERN SUB, END SUB, EXIT SUB
        "IF",       // END IF, ELSE IF
        "FOR",      // EXIT FOR, CONTINUE FOR
        "DO",       // EXIT DO, CONTINUE DO
        "ELSE",     // CASE ELSE
        "CASE",     // SELECT CASE
        "SELECT",   // EXIT SELECT
        "MID",
    ];

    const noTopKeyword = [
        "AS",
        "THEN",
        "WITH",
        "TO",
        "FROM",
        "STEP",
        "WHILE",
        "UNTIL",
    ];

    const typeKeyword = [
        "INTEGER",
        "BOOLEAN",
        "STRING",
    ];
    const typeKeywordRegex = new RegExp("^(" + typeKeyword.join("|") + ")", "i");

    const valueKeyword = [
        "TRUE",
        "FALSE",
    ];
    const valueKeywordRegex = new RegExp("^(" + valueKeyword.join("|") + ")", "i");

    const opKeyword = [
        "AND",
        "OR",
        "XOR",
        "MOD",
        "NOT",
    ];

    const funcKeyword = [
        "ABS",
        "ARRAY",
        "ASC",
        "CARRAY",
        "CBOOL",
        "CINT",
        "CSTR",
        "CHR",
        "EOF",
        "LEN",
        "MAX",
        "MID",
        "MIN",
        "SPACE",
        "STRING",
        "SUBARRAY",
    ];

    const keywords = commentKeyword
        .concat(topOnlyKeyword)
        .concat(topKeyword)
        .concat(noTopKeyword)
        .concat(typeKeyword)
        .concat(valueKeyword)
        .concat(opKeyword)
        .concat(funcKeyword);

    const numLiteralRegex = /^-?\d+/;
    const hexLiteralRegex = /^&[hH][0-9A-Fa-f]+/i;

    const varNameRegex = /^[A-Za-z][A-Za-z0-9_]*/i;

    function isKeyword(word) {
        return keywords.indexOf(word) >= 0;
    }

    function isValueKeyword(word) {
        return valueKeyword.indexOf(word) >= 0;
    }

    function isFuncKeyword(word) {
        return funcKeyword.indexOf(word) >= 0;
    }

    function tokenProgramName(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current();
            if (!word.match(/^GR[0-7]$/)) {
                if (word.match(/^[A-Z][A-Z0-9]{0,7}$/)) {
                    state.token = state.nextToken.pop();
                    state.tokenPos = state.nextTokenPos.pop();
                    state.commentOk = state.nextCommentOk.pop();
                    return "def";
                }
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenVarName(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current().toUpperCase();
            if (!isKeyword(word)) {
                if (state.tokenPos !== 1 && stream.match("(", false)) {
                    state.tokenPos = 1;
                    state.token = tokenExpr;
                    state.bracketCount = 0;
                } else {
                    state.token = state.nextToken.pop();
                    state.tokenPos = state.nextTokenPos.pop();
                    state.commentOk = state.nextCommentOk.pop();
                }
                return "variable";
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenMustError(stream, state) {
        stream.skipToEnd();
        return "error";
    }

    function tokenDim(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                setVarName(state, tokenDim, 5, false);
                return tokenVarName(stream, state);
            }
            case 2: {
                if (stream.match("AS", true, true)) {
                    if (stream.peek() === ' ') {
                        state.tokenPos = 3;
                        return "keyword";
                    }
                }
                break;
            }
            case 3: {
                if (stream.match(typeKeywordRegex)) {
                    state.tokenPos = 0;
                    state.commentOk = true;
                    return "type";
                }
                break;
            }
            case 5: {
                if (stream.match("(")) {
                    state.tokenPos = 6;
                    return "bracket";
                } else {
                    state.tokenPos = 2;
                    return tokenDim(stream, state);
                }
                break;
            }
            case 6: {
                if (stream.match(/^\d+/)) {
                    state.tokenPos = 7;
                    return "number";
                }
                break;
            }
            case 7: {
                if (stream.match(")")) {
                    state.tokenPos = 2;
                    return "bracket";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenArgument(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                setVarName(state, tokenArgument, 5, false);
                return tokenVarName(stream, state);
            }
            case 2: {
                if (stream.match("AS", true, true)) {
                    if (stream.peek() === " ") {
                        state.tokenPos = 3;
                        return "keyword";
                    }
                }
                break;
            }
            case 3: {
                if (stream.match(typeKeywordRegex)) {
                    if (stream.peek() === " ") {
                        state.tokenPos = 4;
                        return "type";
                    }
                }
                break;
            }
            case 4: {
                if (stream.match(/^(FROM|TO)/i)) {
                    if (stream.peek() === " ") {
                        state.tokenPos = 8;
                        return "keyword";
                    }
                }
                break;
            }
            case 5: {
                if (stream.match("(")) {
                    state.tokenPos = 6;
                    return "bracket";
                } else {
                    state.tokenPos = 2;
                    return tokenArgument(stream, state);
                }
                break;
            }
            case 6: {
                if (stream.match(/^\d+/)) {
                    state.tokenPos = 7;
                    return "number";
                }
                break;
            }
            case 7: {
                if (stream.match(")")) {
                    state.tokenPos = 2;
                    return "bracket";
                }
                break;
            }
            case 8:
            case 10: {
                if (stream.match(/^GR[1-7]/i)) {
                    state.tokenPos++;
                    state.commentOk = true;
                    return "atom";
                }
                break;
            }
            case 9: {
                if (stream.match(",")) {
                    state.tokenPos = 10;
                    return "operator";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenFor(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                setVarName(state, tokenFor, 2, false);
                return tokenVarName(stream, state);
            }
            case 2: {
                if (stream.match("=")) {
                    setExpr(state, tokenFor, 3, false);
                    return "operator";
                }
                break;
            }
            case 3: {
                if (stream.match(/^TO[^A-Za-z0-9_]/i, false)) {
                    stream.match("TO", true, true);
                    setExpr(state, tokenFor, 4, true);
                    return "keyword";
                }
                break;
            }
            case 4: {
                if (stream.match(/^STEP[^A-Za-z0-9_]/i, false)) {
                    stream.match("STEP", true, true);
                    setExpr(state);
                    return "keyword";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenContinue(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current().toUpperCase();
            switch (word) {
                case "DO":
                case "FOR":
                    state.token = tokenMustError;
                    state.commentOk = true;
                    return "keyword";
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenExit(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current().toUpperCase();
            switch (word) {
                case "DO":
                case "FOR":
                case "SELECT":
                case "SUB":
                    state.token = tokenMustError;
                    state.commentOk = true;
                    return "keyword";
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenEnd(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current().toUpperCase();
            switch (word) {
                case "ARGUMENT":
                case "CALL":
                case "IF":
                case "SELECT":
                case "SUB":
                    state.token = tokenMustError;
                    state.commentOk = true;
                    return "keyword";
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenMid(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                if (stream.match("(")) {
                    setVarName(state, tokenMid, 2, false);
                    return "bracket";
                }
                break;
            }
            case 2: {
                if (stream.match(",")) {
                    setExpr(state, tokenMid, 3, false);
                    return "operator";
                }
                break;
            }
            case 3: {
                if (stream.match(")")) {
                    state.tokenPos = 4;
                    return "bracket";
                }
                break;
            }
            case 4: {
                if (stream.match("=")) {
                    setExpr(state);
                    return "operator";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenLet(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                if (stream.match("(")) {
                    setExpr(state, tokenLet, 2, false);
                    return "bracket";
                } else if (stream.match(/^(=|\+=|-=)/)) {
                    setExpr(state);
                    return "operator";
                }
                break;
            }
            case 2: {
                if (stream.match(")")) {
                    state.tokenPos = 3;
                    return "bracket";
                }
                break;
            }
            case 3: {
                if (stream.match(/^(=|\+=|-=|)/)) {
                    setExpr(state);
                    return "operator";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenDoLoop(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current().toUpperCase();
            if (word === "WHILE" || word === "UNTIL") {
                setExpr(state);
                return "keyword";
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenThen(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current().toUpperCase();
            switch (state.tokenPos) {
                case 1: {
                    if (word === "THEN") {
                        state.token = tokenMustError;
                        state.commentOk = true;
                        return "keyword";
                    }
                    break;
                }
                case 2: {
                    if (word === "IF") {
                        setExpr(state, tokenThen, 1, false);
                        return "keyword";
                    }
                    break;
                }
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenSelect(stream, state) {
        setExpr(state);
        if (stream.match(/^CASE[^A-Za-z0-9_]/i, false)) {
            stream.match("CASE", true, true);
            return "keyword";
        } else {
            return tokenExpr(stream, state);
        }
    }

    function tokenCase(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                if (stream.match(numLiteralRegex)) {
                    state.tokenPos = 2;
                    state.commentOk = true;
                    return "number";
                } else if (stream.match(hexLiteralRegex)) {
                    state.tokenPos = 2;
                    state.commentOk = true;
                    return "number";
                } else if (stream.match('"')) {
                    if (takeString(stream)) {
                        state.tokenPos = 2;
                        state.commentOk = true;
                        if (stream.match("C", true, true)) {
                            return "string-2";
                        } else {
                            return "string";
                        }
                    }
                } else if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    if (word === "ELSE") {
                        state.token = tokenMustError;
                        state.commentOk = true;
                        return "keyword";
                    }
                }
                break;
            }
            case 2: {
                if (stream.match(",")) {
                    state.tokenPos = 1;
                    state.commentOk = false;
                    return "operator";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenExternSub(stream, state) {
        if (stream.match(varNameRegex)) {
            const word = stream.current().toUpperCase();
            switch (state.tokenPos) {
                case 1: {
                    if (word === "SUB") {
                        setProgramName(state, tokenExternSub, 2, true);
                        return "keyword";
                    }
                    break;
                }
                case 2: {
                    if (word === "WITH") {
                        state.token = tokenMustError;
                        state.commentOk = true;
                        return "keyword";
                    }
                    break;
                }
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenOption(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    switch (word) {
                        case "VARIABLE": {
                            state.tokenPos = 20;
                            return "keyword";
                        }
                        case "REGISTER": {
                            state.tokenPos = 30;
                            return "keyword";
                        }
                        case "EOF": {
                            state.tokenPos = 40;
                            return "keyword";
                        }
                        case "ALLOCATOR": {
                            state.tokenPos = 50;
                            return "keyword";
                        }
                        case "ARRAY": {
                            state.tokenPos = 60;
                            return "keyword";
                        }
                    }
                }
                break;
            }
            case 20: {
                if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    switch (word) {
                        case "DEFAULT":
                        case "INITIALIZE":
                        case "UNINITIALIZE": {
                            state.tokenPos = 0;
                            state.commentOk = true;
                            return "atom";
                        }
                    }
                }
                break;
            }
            case 30: {
                if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    switch (word) {
                        case "DEFAULT":
                        case "RESTORE":
                        case "DIRTY": {
                            state.tokenPos = 0;
                            state.commentOk = true;
                            return "atom";
                        }
                    }
                }
                break;
            }
            case 40: {
                if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    switch (word) {
                        case "DEFAULT":
                        case "INTERNAL":
                        case "SHARED": {
                            state.tokenPos = 0;
                            state.commentOk = true;
                            return "atom";
                        }
                    }
                }
                break;
            }
            case 50: {
                if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    switch (word) {
                        case "DEFAULT":
                        case "FIXED":
                        case "SHARED": {
                            state.tokenPos = 0;
                            state.commentOk = true;
                            return "atom";
                        }
                        case "INTERNAL": {
                            state.tokenPos = 51;
                            state.commentOk = true;
                            return "atom";
                        }
                    }
                }
                break;
            }
            case 51: {
                if (stream.match(/^\d+/)) {
                    state.tokenPos = 0;
                    state.commentOk = true;
                    return "number";
                }
                break;
            }
            case 60: {
                if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    switch (word) {
                        case "DEFAULT":
                        case "LENGTH":
                        case "BOUNDS": {
                            state.tokenPos = 0;
                            state.commentOk = true;
                            return "atom";
                        }
                    }
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function tokenCall(stream, state) {
        switch (state.tokenPos) {
            case 1: {
                if (stream.match(/^WITH[^A-Za-z0-9_]/i, false)) {
                    state.match("WITH", true, true);
                    state.token = tokenMustError;
                    state.commentOk = true;
                    return "keyword";
                }
                if (stream.match(/^WITH$/i)) {
                    state.token = tokenMustError;
                    state.commentOk = true;
                    return "keyword";
                }
                if (stream.match("(")) {
                    state.tokenPos = 2;
                    return "bracket";
                }
                setExpr(state);
                return tokenExpr(stream, state);
            }
            case 2: {
                if (stream.match(")")) {
                    state.token = tokenMustError;
                    state.commentOk = true;
                    return "bracket";
                }
                setExpr(state, tokenCall, 3, false);
                return tokenExpr(stream, state);
            }
            case 3: {
                if (stream.match(")")) {
                    state.tokenPos = 4;
                    state.commentOk = true;
                    return "bracket";
                }
                break;
            }
            case 4: {
                if (stream.match(",")) {
                    setExpr(state);
                    return "operator";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function takeString(stream) {
        do {
            if (!stream.skipTo('"')) {
                return false;
            }
        } while (stream.match('""'));
        return stream.match('"');
    }

    function tokenExpr(stream, state) {
        const commentOk = state.nextCommentOk[state.nextCommentOk.length-1];
        switch (state.tokenPos) {
            case 1: {
                if (stream.match(numLiteralRegex)) {
                    state.tokenPos = 20;
                    state.commentOk = commentOk;
                    return "number";
                } else if (stream.match(hexLiteralRegex)) {
                    state.tokenPos = 20;
                    state.commentOk = commentOk;
                    return "number";
                } else if (stream.match('"')) {
                    if (takeString(stream)) {
                        state.commentOk = commentOk;
                        if (stream.match("C", true, true)) {
                            state.tokenPos = 20;
                            return "string-2";
                        } else {
                            state.tokenPos = 30;
                            return "string";
                        }
                    }
                } else if (stream.match("(")) {
                    state.bracketCount++;
                    return "bracket";
                } else if (stream.match("-")) {
                    return "operator";
                } else if (stream.match(varNameRegex)) {
                    const word = stream.current().toUpperCase();
                    if (isKeyword(word)) {
                        if (word === "NOT") {
                            return "operator";
                        } else if (isValueKeyword(word)) {
                            state.tokenPos = 20;
                            state.commentOk = commentOk;
                            return "atom";
                        } else if (isFuncKeyword(word)) {
                            state.tokenPos = 40;
                            return "builtin";
                        }
                    } else {
                        state.tokenPos = 30;
                        return "variable";
                    }
                }
                break;
            }
            case 20: {
                state.commentOk = false;
                if (stream.match(")", false)) {
                    if (state.bracketCount > 0) {
                        stream.match(")");
                        state.bracketCount--;
                        state.commentOk = commentOk;
                        return "bracket";
                    }
                } else if (stream.match(/^(>>>|<<<)/)) {
                    state.tokenPos = 1;
                    return "operator";
                } else if (stream.match(/^(<<|>>|<=|>=|<>)/)) {
                    state.tokenPos = 1;
                    return "operator";
                } else if (stream.match(/^[<>\+\-\*\\\&\,\=]/)) {
                    state.tokenPos = 1;
                    return "operator";
                } else if (stream.match(/^(AND|OR|XOR|MOD)[^A-Za-z0-9_]/i, false)) {
                    stream.match(/^(AND|OR|XOR|MOD)/i);
                    state.tokenPos = 1;
                    return "operator";
                }
                state.token = state.nextToken.pop();
                state.tokenPos = state.nextTokenPos.pop();
                state.commentOk = state.nextCommentOk.pop();
                return state.token(stream, state);
            }
            case 30: {
                if (stream.match("(")) {
                    state.bracketCount++;
                    state.tokenPos = 1;
                    return "bracket";
                }
                state.tokenPos = 20;
                state.commentOk = commentOk;
                return tokenExpr(stream, state);
            }
            case 40: {
                if (stream.match("(")) {
                    state.bracketCount++;
                    state.tokenPos = 50;
                    return "bracket";
                }
                break;
            }
            case 50: {
                if (stream.match(")")) {
                    state.bracketCount--;
                    state.tokenPos = 20;
                    state.commentOk = commentOk;
                    return "bracket";
                }
                state.tokenPos = 1;
                return tokenExpr(stream, state);
            }
        }
        stream.skipToEnd();
        return "error";
    }

    function setExpr(state, token, tokenPos, commentOk) {
        state.tokenPos = 1;
        state.token = tokenExpr;
        state.bracketCount = 0;
        state.commentOk = false;
        if (typeof token === "function") {
            state.nextToken.push(token);
            state.nextTokenPos.push(tokenPos ?? 0);
            state.nextCommentOk.push(commentOk ?? true);
        } else {
            state.nextToken.push(tokenMustError);
            state.nextTokenPos.push(0);
            state.nextCommentOk.push(true);
        }
    }

    function setVarName(state, token, tokenPos, commentOk, arrVar) {
        state.tokenPos = arrVar ? 2 : 1;
        state.token = tokenVarName;
        state.commentOk = false;
        if (typeof token === "function") {
            state.nextToken.push(token);
            state.nextTokenPos.push(tokenPos ?? 0);
            state.nextCommentOk.push(commentOk ?? true);
        } else {
            state.nextToken.push(tokenMustError);
            state.nextTokenPos.push(0);
            state.nextCommentOk.push(true);
        }
        state.commentOk = false;
    }

    function setProgramName(state, token, tokenPos, commentOk) {
        state.tokenPos = 1;
        state.token = tokenProgramName;
        state.commentOk = false;
        if (typeof token === "function") {
            state.nextToken.push(token);
            state.nextTokenPos.push(tokenPos ?? 0);
            state.nextCommentOk.push(commentOk ?? true);
        } else {
            state.nextToken.push(tokenMustError);
            state.nextTokenPos.push(0);
            state.nextCommentOk.push(true);
        }
        state.commentOk = false;
    }

    function tokenToplevel(stream, state) {
        if (!stream.match(varNameRegex)) {
            stream.skipToEnd();
            return "error";
        }
        const word = stream.current().toUpperCase();
        switch (word) {
            case "REM": {
                stream.skipToEnd();
                return "comment";
            }
            case "ARGUMENT": {
                state.token = tokenMustError;
                state.commentOk = true;
                return "keyword";
            }
            case "DIM": {
                state.tokenPos = 1;
                state.token = tokenDim;
                state.commentOk = false;
                return "keyword";
            }
            case "BYREF":
            case "BYVAL": {
                state.tokenPos = 1;
                state.token = tokenArgument;
                state.commentOk = false;
                return "keyword";
            }
            case "PRINT": {
                setExpr(state);
                state.commentOk = true;
                return "keyword";
            }
            case "INPUT": {
                setVarName(state, tokenMustError, 0, true, true);
                return "keyword";
            }
            case "FOR": {
                state.tokenPos = 1;
                state.token = tokenFor;
                state.commentOk = false;
                return "keyword";
            }
            case "NEXT": {
                setVarName(state);
                return "keyword";
            }
            case "END": {
                state.tokenPos = 1;
                state.token = tokenEnd;
                state.commentOk = false;
                return "keyword";
            }
            case "SELECT": {
                state.token = tokenSelect;
                state.commentOk = false;
                return "keyword";
            }
            case "CASE": {
                state.tokenPos = 1;
                state.token = tokenCase;
                state.commentOk = false;
                return "keyword";
            }
            case "ELSEIF":
            case "IF": {
                setExpr(state, tokenThen, 1, false);
                return "keyword";
            }
            case "ELSE": {
                state.tokenPos = 2;
                state.token = tokenThen;
                state.commentOk = true;
                return "keyword";
            }
            case "LOOP":
            case "DO": {
                state.tokenPos = 1;
                state.token = tokenDoLoop;
                state.commentOk = true;
                return "keyword";
            }
            case "CONTINUE": {
                state.token = tokenContinue;
                return "keyword";
            }
            case "EXIT": {
                state.token = tokenExit;
                return "keyword";
            }
            case "SUB": {
                setProgramName(state);
                state.commentOk = true;
                return "keyword";
            }
            case "OPTION": {
                state.tokenPos = 1;
                state.token = tokenOption;
                state.commentOk = false;
                return "keyword";
            }
            case "CALL": {
                setProgramName(state, tokenCall, 1, false);
                return "keyword";
            }
            case "EXTERN": {
                state.tokenPos = 1;
                state.token = tokenExternSub;
                state.commentOk = false;
                return "keyword";
            }
            case "MID": {
                state.tokenPos = 1;
                state.token = tokenMid;
                state.commentOk = false;
                return "keyword";
            }
            case "FILL": {
                setExpr(state);
                return "keyword";
            }
            default: {
                if (!isKeyword(word)) {
                    state.tokenPos = 1;
                    state.token = tokenLet;
                    state.commentOk = false;
                    return "variable";
                }
                break;
            }
        }
        stream.skipToEnd();
        return "error";
    }

    const mode = {
        startState: function() { return {
            tokenPos: 0,
            token: tokenToplevel,
            commentOk: true,
            bracketCount: 0,
            nextToken: [],
            nextTokenPos: [],
            nextCommentOk: [],
        }},
        token: function(stream, state) {
            if (stream.sol()) {
                state.tokenPos = 0;
                state.token = tokenToplevel;
                state.commentOk = true;
                state.nextToken = [];
                state.nextTokenPos = [];
                state.nextCommentOk = [];
            }
            if (stream.eatSpace()) {
                return null;
            }
            if (stream.match("'")) {
                stream.skipToEnd();
                if (state.commentOk) {
                    return "comment";
                } else {
                    return "error";
                }
            }
            return state.token(stream, state);
        },
    };

    return mode;
});

CodeMirror.defineMIME("text/x-b2c2-basic", "b2c2");
