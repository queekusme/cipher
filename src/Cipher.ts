const symbols: string[] = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I",
    "J", "K", "L", "M", "N", "O", "P", "Q", "R",
    "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i",
    "j", "k", "l", "m", "n", "o", "p", "q", "r",
    "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8",
    "9", " ", "!", "@", "£", "#", "$", "%", "^",
    "&", "*", "(", ")", "-", "_", "+", "=", "{",
    "}", "[", "]", ":", ";", "\"", "'", "\\", "|",
    "<", ">", ",", ".", "/", "?", "~"
]

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
        for (var i = array.length - 1; i > 0; i--)
        {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    public static createKey(): string
    {
        const source: number[] = [];

        for(let i = 0; i < Math.pow(symbols.length, 2); i++)
        {
            if(i === 0)
                source.push(0);
            else
                source.push(source[i - 1] + 1)
        }

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

    private static decodeSymbol(num: number): string
    {
        let decoded = symbols[num];

        switch(decoded)
        {
            case "Space":
                return " ";
            default:
                return decoded;
        }
    }

    private static findCommonSymbol(a: StringVector, b: StringVector): 0 | 1 | 2 | 3 | null
    {
        if(b.indexOf(a[0]) === 0) // [X .] [X .] // Should only occur on the 1st pair
            return 0;
        else if(b.indexOf(a[1]) === 0) // [. X] [X .]
            return 1;
        else if(b.indexOf(a[0]) === 1) // [X .] [. X] // Should only occur on the first pair
            return 2;
        else if(b.indexOf(a[1]) === 1) // [. X] [. X]
            return 3;
        else
            return null;
    }

    private static swapVectors<T>(a: InternalVector<T>): InternalVector<T>
    {
        return [a[1], a[0]];
    }

    public encode(source: string): string // Base64
    {
        const characters = source.split("").map(c => symbols.indexOf(c));
        const vectors: IndexVector[] = [];
        const out: number[] = [];

        for(let i = 0; i < characters.length - 1; i++)
            vectors.push([characters[i], characters[i + 1]]);

        for(const vector of vectors)
        {
            const flip =  Math.random() < 0.5;
            const index = (vector[flip ? 1 : 0] * symbols.length) + vector[flip ? 0 : 1];
            out.push(this.keyValues[index]);
        }

        return Cipher.stringify(out);
    }

    public decode(encoded: string): string
    {
        const encodedNumbers = Cipher.parse(encoded)

        const decodedVectors: StringVector[] = [];

        for(const num of encodedNumbers)
        {
            const index = this.keyValues.indexOf(num);
            const Vector0 = Cipher.decodeSymbol(Math.floor(index / symbols.length))
            const Vector1 = Cipher.decodeSymbol(index % symbols.length)

            decodedVectors.push([Vector0, Vector1]);
        }

        for(let i = 0; i < decodedVectors.length -1; i++)
        {
            const result = Cipher.findCommonSymbol(decodedVectors[i], decodedVectors[i + 1]);
            if(result === null)
                throw Error("Unscramble not possible")

            switch (result)
            {
                case 0: // [X .] [X .] // Should only occur on the 1st pair
                    decodedVectors[i] = Cipher.swapVectors(decodedVectors[i]);
                    break;
                case 1: // [. X] [X .]
                    // This one's correct
                    break;
                case 2: // [X .] [. X] // Should only occur on the first pair
                    decodedVectors[i] = Cipher.swapVectors(decodedVectors[i]);
                    decodedVectors[i + 1] = Cipher.swapVectors(decodedVectors[i + 1]);
                    break;
                case 3: // [. X] [. X]
                    decodedVectors[i + 1] = Cipher.swapVectors(decodedVectors[i + 1]);
                    break;
            }
        }

        return [...decodedVectors.map(v => v[0]), decodedVectors[decodedVectors.length -1][1]].join("");
    }
}