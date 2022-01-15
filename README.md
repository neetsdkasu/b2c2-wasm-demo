# b2c2-wasm-demo

[b2c2](https://github.com/neetsdkasu/b2c2)の機能の一部を用いて
Webページ上でWebAssemblyによるb2c2の変換の一部処理のデモンストレーションを作りました

デモページ: https://neetsdkasu.github.io/b2c2-wasm-demo/



----------------------------------------------------------------

### このプロジェクトのビルドについて

[wasm-pack](https://github.com/rustwasm/wasm-pack)を使用しています  
`wasm-pack build -t web`でビルドできます  
ビルドで生成されたJavaScriptファイル(`b2c2_wasm_demo.js`)とWebAssemblyファイル(`b2c2_wasm_demo_bg.wasm`)を使用します  


----------------------------------------------------------------

### 開発環境

```bash
$ rustup toolchain list
stable-i686-pc-windows-msvc (default)

$ rustc --version
rustc 1.58.0 (02072b482 2022-01-11)

$ cargo --version
cargo 1.58.0 (7f08ace4f 2021-11-24)

$ wasm-pack --version
wasm-pack 0.10.1

$ cargo-generate --version
cargo-generate 0.11.0

$ wasm-bindgen --version
wasm-bindgen 0.2.78
```
