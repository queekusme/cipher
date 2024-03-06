# This is a completely mad cipher idea I came up with on a whim...

It works, but its probably very iunefficiant

## Keg Generation

It works by constructing a 2d array of symbols
```
   A  B  C  D ...
A  0  1  2  3 ...
B 24 25 26 27 ...
C 48 49 50 51 ...
D 72 73 74 75 ...
...
```

This is then shuffled to provide a key. This creates "(symbol count)^2 factorial" possible keys which is quite big imho haha

## Encoding
To encode a string the string is split into vectors so Hello World would be:

```
H:E
E:L
L:L
L:O
L:_
_:W
W:O
O:R
R:L
L:D
```

Where _ is a space character

These are then used as indexes into the key map, colums/row order is randomised so the same message could be decoded 2^(length) different ways.

The resultant integer array is then the resultant encoding and is base46 encoded for simplicity.

## Decoding

The decoding method is the same as encoding but in reverse with an aditional step to undo the vector randomisation.

This is done by finding common letters in a vector and vector + 1

e.g.

H:E and EL would have a common letter of E.

This can then be used to work out the correct order of the vectors.

This is then compressed down into the final decoded message
