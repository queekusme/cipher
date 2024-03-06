import Cipher from "./Cipher"
import * as fs from "fs"

const pskFile = "psk.txt";

if(!fs.existsSync(pskFile))
    fs.writeFileSync(pskFile, Cipher.createKey());

const cipher: Cipher = new Cipher(fs.readFileSync(pskFile).toString());

const text = "Hello World";
console.log("Input:", text);

const encoded = cipher.encode(text);

console.log("Encoded:", encoded);

console.log("Decoded:", cipher.decode(encoded));