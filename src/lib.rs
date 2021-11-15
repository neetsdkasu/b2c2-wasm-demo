mod utils;

use b2c2_compiler as compiler;
use b2c2_parser as parser;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Casl2Src {
    pub ok: bool,
    src: Option<String>,
    err_msg: Option<String>,
}

#[wasm_bindgen]
pub fn compile_basic_to_casl2(text: &str) -> Casl2Src {
    use std::fmt::Write;

    utils::set_panic_hook();

    let parse_result = match parser::parse(text.as_bytes()) {
        Ok(result) => result,
        Err(error) => {
            let mut err_msg = String::new();
            writeln!(&mut err_msg, "{:?}", error).unwrap();
            return Casl2Src::failed(err_msg);
        }
    };

    let basic_src = match parse_result {
        Ok(src) => src,
        Err(error) => {
            let mut err_msg = String::new();
            writeln!(&mut err_msg, "{:?}", error).unwrap();
            let line_number = if error.line_number == 0 {
                0
            } else {
                error.line_number - 1
            };
            if let Some(line) = text.lines().nth(line_number) {
                writeln!(&mut err_msg, "{}", line).unwrap();
                writeln!(&mut err_msg, "{ch:>pos$}", ch = "^", pos = error.position).unwrap();
            }
            return Casl2Src::failed(err_msg);
        }
    };

    let casl2_src = match compiler::compile(None, &basic_src) {
        Ok(src) => src,
        Err(error) => {
            let mut err_msg = String::new();
            writeln!(&mut err_msg, "CompileError {{ {} }}", error).unwrap();
            return Casl2Src::failed(err_msg);
        }
    };

    let mut src = String::new();

    for stmt in casl2_src.iter() {
        writeln!(&mut src, "{}", stmt).unwrap();
    }

    Casl2Src::success(src)
}

#[wasm_bindgen]
impl Casl2Src {
    pub fn get_error_message(self) -> Option<String> {
        self.err_msg
    }
    pub fn get_src(self) -> Option<String> {
        self.src
    }
    fn failed(err_msg: String) -> Self {
        Self {
            ok: false,
            src: None,
            err_msg: Some(err_msg),
        }
    }
    fn success(src: String) -> Self {
        Self {
            ok: true,
            src: Some(src),
            err_msg: None,
        }
    }
}
