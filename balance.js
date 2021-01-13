const echelon = require('rref');
const math = require('mathjs');

const fraction = function(n, d)
{
    this.n = n;
    this.d = d;
    this.quotient = function()
    {
        return this.n / this.d;
    }
}

module.exports.balanceEquation = function(equ)
{
    equ[1] = equ[1].map(a => {
        for(const i in a)
        {
            if(i === 'mult') continue;
            a[i] = -a[i];
        }
        return a;
    });
    const tmp = [];
    const elemNames = Object.keys(equ[2]);
    const elemsFlat = equ[0].concat(equ[1]);
    const elems = elemsFlat.map(() => 0);
    for(let i = 0; i < Object.values(equ[2]).length; i++)
    {
        tmp.push(elems);
    }
    console.log(elemsFlat)
    let rawMatrix = [];
    tmp.map((a, b) => {
        // b = element and vertical
        let temp = [];
        a.forEach((e, i) => {
            let val = elemsFlat[i][elemNames[b]];
            console.log(val)
            if(val === null || val === undefined) val = 0;
            a[i] = val;
            temp.push(val)
        });
        rawMatrix.push(temp);
        return a;
    });
    echelon(rawMatrix);
    console.log(rawMatrix)
    const last = [];
    const finalMatrix = rawMatrix.map((e, i) => {
        return e.map((a, b) => {
            if(b !== e.length - 1) return null;
            let toReturn;
            if(Math.abs(a) === 0) toReturn = new fraction(0, 1);
            if(a % 1 !== 0) {
                a = b === e.length - 1 ? -a : a;
                toReturn = decimalToFraction(a);
            } else {
                toReturn = new fraction(a, 1);
            }
            last.push(toReturn);
            return toReturn;
        }).filter(a => a !== null);
    });
    console.log(finalMatrix)
    console.log(last);
    const lcm = math.lcm(...(() => {
        let toReturn = [];
        for(const i of last)
        {
            toReturn.push(i.d);
        }
        return toReturn;
    })());
    let finalFraction = last.map(a => {
       a.n *= lcm;
       return a.quotient();
    });
    finalFraction.push(lcm);
    console.log(finalFraction);
    let canBreak = false;
    while(!canBreak)
    {
        for(let i = 0; i < finalFraction.length; i++)
        {
            if (finalFraction[i] % 1 !== 0)
            {
                finalFraction = finalFraction.map(a => a * 2);
                break;
            }
            canBreak = true;
        }
    }
    finalFraction = finalFraction.map(a => Math.abs(a));
    finalFraction.slice(0, equ[0].length).forEach((a, b) => {
        for(const i of equ[0]) {
            for (const j in i)
            {
                i[j] = Math.abs(i[j]);
            }
        }
        equ[0][b].mult = a;
    });
    finalFraction.slice(equ[0].length).forEach((a, b) => {
        for(const i of equ[1])
        {
            for (const j in i)
            {
                i[j] = Math.abs(i[j]);
            }
        }
        equ[1][b].mult = a;
    });
    console.log(equ)
    return finalFraction;
    //return equ;`
};

function gcd(a, b) {
    return (b) ? gcd(b, a % b) : a;
}

function decimalToFraction(_decimal) {
    var top		= _decimal.toString().replace(/\d+[.]/, '');
    var bottom	= Math.pow(10, top.length);
    if (_decimal > 1) {
        top	= +top + Math.floor(_decimal) * bottom;
    }
    var x = gcd(top, bottom);
    return new fraction(top / x, bottom /x);
};