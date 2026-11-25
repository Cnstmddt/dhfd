class Hero {
    static POSITION_BITS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

    #id;
    #name;
    #attribute;
    #winrate;
    #pickrate;
    #matchupRating;
    #patchRating;
    #rolesMask;

    constructor(id, name, attribute, winrate, pickrate, matchupRating, patchRating, rolesString) {
        this.#id = id;
        this.#name = name;
        this.#attribute = attribute;
        this.#winrate = winrate;
        this.#pickrate = pickrate;
        this.#matchupRating = matchupRating;
        this.#patchRating = patchRating;
        this.#rolesMask = rolesString
            .split(',')
            .map(Number)
            .reduce((mask, pos) => mask | Hero.POSITION_BITS[pos], 0);
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get attribute() { return this.#attribute; }
    get winrate() { return this.#winrate; }
    get pickrate() { return this.#pickrate; }
    get matchupRating() { return this.#matchupRating; }
    get patchRating() { return this.#patchRating; }

    canPlayPosition(position) {
        return Boolean(this.#rolesMask & Hero.POSITION_BITS[position]);
    }
}

module.exports = Hero;
