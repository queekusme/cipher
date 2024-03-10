const symbols: string[] = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", "!", "@", "£", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "{", "}", "[", "]", ":", ";", "\"", "'", "\\", "|", "<", ">", ",", ".", "/", "?", "~"
];

type InternalVector<T> = [T, T];

export type IndexVector = InternalVector<number>;
export type StringVector = InternalVector<string>;

export default class Cipher
{
    protected readonly keyValues: number[];

    constructor(
        protected readonly key: string // Base64
    )
    {
        this.keyValues = Cipher.parse(key);
    }

    private static shuffleArray(array: number[])
    {
        for (let i = array.length - 1; i > 0; i--)
            Cipher.swapArrayNums(array, i, Math.floor(Math.random() * (i + 1)));
    }

    private static swapArrayNums<T>(array: T[], i: number, j: number): void
    {
        const temp = array[i]
        array[i] = array[j];
        array[j] = temp;
    }

    private static swapVectors = <T>(a: InternalVector<T>) => Cipher.swapArrayNums(a, 0, 1);

    public static createKey(): string
    {
        const source: number[] = [0];

        for(let i = 1; i < Math.pow(symbols.length, 2); i++)
            source.push(source[i - 1] + 1);

        Cipher.shuffleArray(source);

        return Cipher.stringify(source);
    }

    private static stringify(n: number[])
    {
        return Buffer.from(n.map(e => e.toString()).join(",")).toString("base64");
    }

    private static parse(s: string)
    {
        return Buffer.from(s, "base64").toString().split(",").map(n => parseInt(n));
    }

    private static processCommonSymbol(a: StringVector, b: StringVector): void
    {
        if(b.indexOf(a[0]) === 0) // [X .] [X .] // Should only occur on the 1st pair
            Cipher.swapVectors(a);
        else if(b.indexOf(a[1]) === 0) // [. X] [X .]
        {}    // NOP
        else if(b.indexOf(a[0]) === 1) // [X .] [. X] // Should only occur on the first pair
        {
            Cipher.swapVectors(a);
            Cipher.swapVectors(b);
        }
        else if(b.indexOf(a[1]) === 1) // [. X] [. X]
            Cipher.swapVectors(b);
        else
            throw Error("Unscramble not possible");
    }

    public encode(source: string): string // Base64
    {
        const characters = source.split("").map(c => symbols.indexOf(c));
        const out: number[] = [];

        for(let i = 0; i < characters.length - 1; i++)
        {
            const vector = [characters[i], characters[i + 1]];
            const flip =  Math.random() < 0.5;

            out.push(this.keyValues[(vector[flip ? 1 : 0] * symbols.length) + vector[flip ? 0 : 1]]);
        }

        return Cipher.stringify(out);
    }

    public decode(encoded: string): string
    {
        const decodedVectors: StringVector[] = [];

        for(const num of Cipher.parse(encoded))
        {
            const index = this.keyValues.indexOf(num);
            decodedVectors.push([symbols[Math.floor(index / symbols.length)], symbols[index % symbols.length]]);
        }

        for(let i = 0; i < decodedVectors.length -1; i++)
            Cipher.processCommonSymbol(decodedVectors[i], decodedVectors[i + 1]);

        return [...decodedVectors.map(v => v[0]), decodedVectors[decodedVectors.length -1][1]].join("");
    }
}