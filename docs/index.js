import init_b2c2, { compile_basic_to_casl2 } from "./b2c2_wasm_demo.js";

const b2c2Src = CodeMirror.fromTextArea(
    document.getElementById("b2c2_src"),
    { lineNumbers: true, mode: "b2c2" }
);
const casl2Src = CodeMirror.fromTextArea(
    document.getElementById("casl2_src"),
    { lineNumbers: true, mode: "casl2" }
);

function compile() {
    const text = b2c2Src.getValue();
    const result = compile_basic_to_casl2(text);
    if (result.ok) {
        casl2Src.setValue(result.get_src());
    } else {
        casl2Src.setValue(result.get_error_message());
    }
}

init_b2c2().then( () => {
    const compileButton = document.getElementById("compile");
    compileButton.disabled = false;
    compileButton.addEventListener("click", compile);
});
