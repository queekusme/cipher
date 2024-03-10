import Cipher from "./Cipher"
import * as fs from "fs"

const pskFile = "psk.txt";

if(!fs.existsSync(pskFile))
    fs.writeFileSync(pskFile, Cipher.createKey());

const cipher: Cipher = new Cipher(fs.readFileSync(pskFile).toString());

function test(input: string)
{
    console.log("Input:", input);
    const encoded = cipher.encode(input);
    console.log("Encoded:", encoded);
    const decoded = cipher.decode(encoded);
    console.log("Decoded:", decoded);
}

test("Hello World");
test("According to all known laws of aviation, there is no way a bee should be able to fly, its wings are too small to get its fat little body off the ground, the bee of course flies anyway, as bees don't care what humans think is impossible.");
