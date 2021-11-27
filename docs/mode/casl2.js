// CodeMirror mode CASL2
// author: Leonardone @ NEETSDKASU

CodeMirror.defineMode("casl2", function(conf, parserConf) {
    "use strict";

    const COMET2CMD = "keyword";
    const CASL2CMD = "builtin";
    const LABEL = "variable";
    const REGISTER = "atom";
    const INDEX_REG = "atom";
    const NUMBER = "number";
    const STRING = "string";
    const LITERAL_NUMBER = "meta";
    const LITERAL_STRING = "string";
    const COMMENT = "comment";
    const COMMA = null;
    const ERROR = "error";

    const litNumRegex = /^=(-?[0-9]+|#[0-9A-Z]{4})/;
    const numRegex = /^(-?[0-9]+|#[0-9A-Z]{4})/;

    const wrongLabelRegex = /^(GR[0-7] |GR[0-7],|GR[0-7]$)/;
    const regRegex = /^GR[0-7]/;
    const indexRegex = /^GR[1-7]/;
    const labelRegex = /^[A-Z][A-Z0-9]{0,7}/;

    // no operand
    const op0 = ["NOP", "RET"];
    const op0Regex = new RegExp("^(" + op0.join("|") +")");
    // r
    const op1 = ["POP"];
    const op1Regex = new RegExp("^(" + op1.join("|") +")");

    // adr,[x]
    const op2 = [
        "CALL",
        "JMI",
        "JNZ",
        "JOV",
        "JPL",
        "JUMP",
        "JZE",
        "PUSH",
        "SVC",
    ];
    const op2Regex = new RegExp("^(" + op2.join("|") +")");

    // r,adr,[x]
    const op3 = [
        "LAD",
        "SLA",
        "SLL",
        "SRA",
        "SRL",
        "ST",
    ];
    const op3Regex = new RegExp("^(" + op3.join("|") +")");

    // r1,r2
    // r,adr,[x]
    const op23 = [
        "ADDA",
        "ADDL",
        "AND",
        "CPA",
        "CPL",
        "LD",
        "OR",
        "SUBA",
        "SUBL",
        "XOR",
    ];
    const op23Regex = new RegExp("^(" + op23.join("|") +")");

    CodeMirror.registerHelper("hintWords", "casl2",
        ["GR0", "GR1", "GR2", "GR3", "GR4", "GR5", "GR6", "GR7",
            "START", "RPUSH", "RPOP", "END", "OUT", "IN", "DS", "DC"
        ].concat(op0).concat(op1).concat(op2).concat(op3).concat(op23)
    );

    const afterSpaceAnyTokenRegex = /^ +[^ ]/;
    const afterCommaAnyTokenRegex = /^,./;

    function takeString(stream) {
        do {
            if (!stream.skipTo("'")) {
                return false;
            }
        } while (stream.match("''"));
        return stream.match("'");
    }

    function token(stream, state) {
        if (stream.sol()) {
            state.tokenPos = 0;
            if (stream.eol()) {
                return null;
            }
            if (stream.peek() === ";") {
                stream.skipToEnd();
                return COMMENT;
            }
            if (stream.match(wrongLabelRegex)) {
                stream.skipToEnd();
                return ERROR;
            }
            if (stream.match(labelRegex)) {
                if (stream.peek() === ' ') {
                    state.tokenPos = 6;
                    state.nextPos = 2;
                    return LABEL;
                }
            } else if (stream.eatSpace()) {
                state.tokenPos = stream.eol() ? 0 : 1;
                return null;
            }
            stream.skipToEnd();
            return ERROR;
        }
        switch (state.tokenPos) {
            case 1: {
                if (stream.peek() === ';') {
                    state.tokenPos = 0;
                    stream.skipToEnd();
                    return COMMENT;
                }
                // non break;
            }
            case 2: {
                if (stream.match("START")) {
                    if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 10000;
                        return CASL2CMD;
                    }
                } else if (stream.match(/^(END|RPOP|RPUSH)/)) {
                    if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 9;
                        return CASL2CMD;
                    }
                } else if (stream.match(/^(IN|OUT)/)) {
                    if (stream.match(afterSpaceAnyTokenRegex, false)) {
                        state.tokenPos = 6;
                        state.nextPos = 20000;
                        return CASL2CMD;
                    }
                } else if (stream.match("DS")) {
                    if (stream.match(afterSpaceAnyTokenRegex, false)) {
                        state.tokenPos = 6;
                        state.nextPos = 30000;
                        return CASL2CMD;
                    }
                } else if (stream.match("DC")) {
                    if (stream.match(afterSpaceAnyTokenRegex, false)) {
                        state.tokenPos = 6;
                        state.nextPos = 40000;
                        return CASL2CMD;
                    }
                } else if (stream.match(op0Regex)) {
                    if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 9;
                        return COMET2CMD;
                    }
                } else if (stream.match(op1Regex)) {
                    if (stream.match(afterSpaceAnyTokenRegex, false)) {
                        state.tokenPos = 6;
                        state.nextPos = 100;
                        return COMET2CMD;
                    }
                } else if (stream.match(op2Regex)) {
                    if (stream.match(afterSpaceAnyTokenRegex, false)) {
                        state.tokenPos = 6;
                        state.nextPos = 200;
                        return COMET2CMD;
                    }
                } else if (stream.match(op3Regex)) {
                    if (stream.match(afterSpaceAnyTokenRegex, false)) {
                        state.tokenPos = 6;
                        state.nextPos = 300;
                        return COMET2CMD;
                    }
                } else if (stream.match(op23Regex)) {
                    if (stream.match(afterSpaceAnyTokenRegex, false)) {
                        state.tokenPos = 6;
                        state.nextPos = 2300;
                        return COMET2CMD;
                    }
                }
                break;
            }
            case 5: {
                if (stream.eatSpace()) {
                    state.tokenPos = stream.eol() ? 0 : state.nextPos;
                    state.nextPos = 0;
                    return null;
                }
                break;
            }
            case 6: {
                if (stream.eatSpace()) {
                    state.tokenPos = state.nextPos;
                    state.nextPos = 0;
                    return null;
                }
                break;
            }
            case 7:
                if (stream.match(",")) {
                    if (!stream.eol() && stream.peek() !== ' ') {
                        state.tokenPos = state.nextPos;
                        state.nextPos = 0;
                        return COMMA;
                    }
                }
                break;
            case 8: {
                state.tokenPos = 0;
                stream.skipToEnd();
                return COMMENT;
            }
            case 9: {
                if (stream.peek() === ";") {
                    state.tokenPos = 0;
                    stream.skipToEnd();
                    return COMMENT;
                }
                break;
            }
            case 100: {
                if (stream.match(regRegex)) {
                    if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 8;
                        return REGISTER;
                    }
                }
                break;
            }
            case 200: {
                if (!stream.match(wrongLabelRegex)) {
                    let ret = "";
                    if (stream.match(litNumRegex)) {
                        ret = LITERAL_NUMBER;
                    } else if (stream.match("='")) {
                        if (takeString(stream)) {
                            ret = LITERAL_STRING;
                        }
                    } else if (stream.match(numRegex)) {
                        ret = NUMBER;
                    } else if (stream.match(labelRegex)) {
                        ret = LABEL;
                    }
                    if (ret !== "") {
                        if (stream.match(afterCommaAnyTokenRegex, false)) {
                            state.tokenPos = 7;
                            state.nextPos = 201;
                            return ret;
                        } else if (stream.peek() === ' ' || stream.eol()) {
                            state.tokenPos = stream.eol() ? 0 : 5;
                            state.nextPos = stream.eol() ? 0 : 8;
                            return ret;
                        }
                    }
                }
                break;
            }
            case 201: {
                if (stream.match(indexRegex)) {
                    if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 8;
                        return INDEX_REG;
                    }
                }
                break;
            }
            case 300: {
                if (stream.match(regRegex)) {
                    if (stream.match(afterCommaAnyTokenRegex, false)) {
                        state.tokenPos = 7;
                        state.nextPos = 200;
                        return REGISTER;
                    }
                }
                break;
            }
            case 2300: {
                if (stream.match(regRegex)) {
                    if (stream.match(afterCommaAnyTokenRegex, false)) {
                        state.tokenPos = 7;
                        state.nextPos = 2301;
                        return REGISTER;
                    }
                }
                break;
            }
            case 2301: {
                if (stream.match(regRegex)) {
                    if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 8;
                        return REGISTER;
                    }
                } else {
                    state.tokenPos = 200;
                    return token(stream, state);
                }
                break;
            }
            case 10000: {
                if (stream.match(";")) {
                    state.tokenPos = 0;
                    stream.skipToEnd();
                    return COMMENT;
                }
                if (!stream.match(wrongLabelRegex)) {
                    if (stream.match(labelRegex)) {
                        if (stream.peek() === ' ' || stream.eol()) {
                            state.tokenPos = stream.eol() ? 0 : 5;
                            state.nextPos = stream.eol() ? 0 : 8;
                            return LABEL;
                        }
                    }
                }
                break;
            }
            case 20000: {
                if (!stream.match(wrongLabelRegex)) {
                    if (stream.match(labelRegex)) {
                        if (stream.match(afterCommaAnyTokenRegex, false)) {
                            state.tokenPos = 7;
                            state.nextPos = 20001;
                            return LABEL;
                        }
                    }
                }
                break;
            }
            case 20001: {
                if (!stream.match(wrongLabelRegex)) {
                    if (stream.match(labelRegex)) {
                        if (stream.peek() === ' ' || stream.eol()) {
                            state.tokenPos = stream.eol() ? 0 : 5;
                            state.nextPos = stream.eol() ? 0 : 8;
                            return LABEL;
                        }
                    }
                }
                break;
            }
            case 30000: {
                if (stream.match(/^[0-9]+/)) {
                    if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 8;
                        return NUMBER;
                    }
                }
                break;
            }
            case 40000: {
                let ret = "";
                if (stream.match(numRegex)) {
                    ret = NUMBER;
                } else if (stream.match("'")) {
                    if (takeString(stream)) {
                        ret = STRING;
                    }
                } else if (!stream.match(wrongLabelRegex)) {
                    if (stream.match(labelRegex)) {
                        ret = LABEL;
                    }
                }
                if (ret !== "") {
                    if (stream.peek() === ",") {
                        state.tokenPos = 7;
                        state.nextPos = 40000;
                        return ret;
                    } else if (stream.peek() === ' ' || stream.eol()) {
                        state.tokenPos = stream.eol() ? 0 : 5;
                        state.nextPos = stream.eol() ? 0 : 8;
                        return ret;
                    }
                }
                break;
            }
        }

        state.tokenPos = 0;
        state.nextPos = 0;
        stream.skipToEnd();
        return ERROR;
    }

    const mode = {
        startState: function() { return {
            tokenPos: 0,
            nextPos: 0,
        }},
        token: token,
    };

    return mode;
});

CodeMirror.defineMIME("text/x-casl2", "casl2");

