const symbols: string[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", "!", "@", "£", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "{", "}", "[", "]", ":", ";", "\"", "'", "\\", "|", "<", ">", ",", ".", "/", "?", "~"];

type StringVector = [string, string];

export default class Cipher
{
    protected readonly keyValues: number[];

    constructor( protected readonly base64key: string)
    {
        this.keyValues = Cipher.parse(base64key);
    }

    private static swapArrayNums = <T>(array: T[], i: number, j: number) => [array[i], array[j]] = [array[j], array[i]]; // This is deffo magic...
    private static swapVectors = <T>(a: StringVector) => Cipher.swapArrayNums(a, 0, 1);
    private static stringify = (n: number[]) =>  Buffer.from(n.map(e => e.toString()).join(",")).toString("base64");
    private static parse = (s: string) => Buffer.from(s, "base64").toString().split(",").map(n => parseInt(n));

    public static createKey(): string
    {
        const source: number[] = [0];

        for(let i = 1; i < Math.pow(symbols.length, 2); i++)
            source.push(source[i - 1] + 1);

        for (let i = source.length - 1; i > 0; i--)
            Cipher.swapArrayNums(source, i, Math.floor(Math.random() * (i + 1)));

        return Cipher.stringify(source);
    }

    public encode(source: string): string // Base64
    {
        const characters = source.split("").map(c => symbols.indexOf(c));
        const out: number[] = [];

        for(let i = 0; i < characters.length - 1; i++)
        {
            const vector = [characters[i], characters[i + 1]];
            const flip =  Math.random() < 0.5;

            out.push(this.keyValues[(vector[+flip] * symbols.length) + vector[+(!flip)]]);
        }

        return Cipher.stringify(out);
    }

    public decode(encoded: string): string
    {
        const decodedVectors: StringVector[] = [];

        for(const num of Cipher.parse(encoded))
        {
            const index = this.keyValues.indexOf(num);
            const previousPair: StringVector = decodedVectors[decodedVectors.length - 1];
            const currentPair: StringVector = [symbols[Math.floor(index / symbols.length)], symbols[index % symbols.length]];

            decodedVectors.push(currentPair);

            if(decodedVectors.length === 2 && currentPair.indexOf(previousPair[0]) > -1)// [X .] [? ?]
                Cipher.swapVectors(previousPair);

            if(decodedVectors.length <= 1 || currentPair.indexOf(previousPair[1]) === 0) // [. X] [X .]
                continue;    // NOP

            if(currentPair.indexOf(previousPair[0]) === 1 || currentPair.indexOf(previousPair[1]) === 1) // [? ?] [. X]
                Cipher.swapVectors(currentPair);
        }

        return [...decodedVectors.map(v => v[0]), decodedVectors[decodedVectors.length -1][1]].join("");
    }
}