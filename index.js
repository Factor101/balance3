const balance = require('.\\balance');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const regexp = {
    compSingle: /(?<el>[A-Z][a-z]*[\d]*)/gm,
    mult: /(?:(?<![A-Za-z])[\d]+)/gm
};
/**
 * @param {string} _raw
 *
 * @constructor
 *
 * @property {string} raw - Raw string value of compound
 * @property {boolean} isSingle - whether or not the compound has a coefficient
 * @property {element[]} comp - individual elements in the compound and their subscripts
 * @property {number} mult - coefficient of the compound, default value is 1
 */
const Compound = function(_raw)
{
    //#region element
    /**
     * @private
     * @constructor
     *
     * @param {string} eRaw - raw string form of element, consisting of an element symbol and optionally coefficients
     *
     * @property {string} symbol - 1-2 char symbol of element
     * @property {number} count - number of atoms of element
     */
    const element = function(eRaw)
    {
        this.symbol = eRaw.match(/[^\d]+/gm)[0];
        this.count = /[\d]/gm.test(eRaw) ? Number(eRaw.match(/[\d]/gm)[0]) : 1;
        this.totalCount = 0;
    };
    //#endregion
    this.raw = _raw;
    this.isSingle = isSingle();
    this.mult = 1;
    if(this.isSingle) {
        this.comp = this.raw.match(regexp.compSingle)
            .map(a => new element(a));
    } else {
        // remove coefficient, then get comp and store in mult
        this.mult = Number(this.raw.match(regexp.mult)[0]);
        this.raw = this.raw
            .replace(regexp.mult, '')
            .replace(/[()]/gm, '');
        this.comp = this.raw.match(regexp.compSingle)
            .map(a => new element(a));
    }
    this.sum = function()
    {
        this.total = this.comp.reduce((a, e) => { return a + (this.mult * e.count); }, 0);
        this.comp.forEach(e => e.totalCount = e.count * this.mult);
    }
    this.sum();
    /**
     * @private
     *
     * @returns {Boolean}
     */
    function isSingle()
    {
        return !Boolean(
            /^[\d]+/gm.test(_raw) ||
            /[()]/gm.test(_raw)
        );
    }
};

(async (...args) => {
    let equationInput = "";
    await readline.question("Input Chemical Equation:", equ => {
       equationInput = equ;
        const equations = [
            "KMnO4 + HCl => KCl + MnCl2 + H2O + Cl2",
            "Fe + Cl2 = FeCl3",
            "N2 + O2 = N2O",
            "ClO2 + H2O = HClO2 + HClO3",
            "MnO2 + HCl = MnCl2 + H2O + Cl2",
            "HCl + Fe = FeCl2 + H2",
            "Fe + H2O = Fe3O4 + H2"
        ];
        let originalInput = equationInput !== "" ?
            equationInput :
            "Fe + Cl2 = FeCl3";
        let input = originalInput
            .replace(/\s+/gm, '')
            .split(/=+>*/gm)
            .map(e => e.split(/\+/gm));
        input = input.map(e => e.map(el => new Compound(el)));
        // [ [compounds left], [compounds right], {element counter} ]
        let list = [ [], [], {} ];
        input.forEach((e, i) => {
            e.forEach((el, j) => {
                list[i].push({});
                el.comp.forEach((a, b) => {
                    list[2][a.symbol] = 0;
                    list[i][j][a.symbol] = a.count;
                    list[i][j]["mult"] = el.mult;
                });
            });
        });
        const coefficients = balance.balanceEquation(list);
        const compoundsFlat = input[0].concat(input[1]);
        let result = "";
        compoundsFlat.forEach((e, i) => {
            if(coefficients[i] === 1) coefficients[i] = '';
            if(i === input[0].length) result += "=";
            result += `${i !== 0 ? ' ' : ''}${coefficients[i]}${e.raw} ${i !== compoundsFlat.length - 1 && i !== input[0].length - 1 ? '+' : ''}`;
        });
        console.log("Original: " + originalInput);
        console.log("Balanced: " + result);
        readline.close();
    });
})(null);