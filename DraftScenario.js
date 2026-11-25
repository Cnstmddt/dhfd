class DraftScenario {
    #mode;
    #enemyTeam;
    #allyTeam;
    #targetPosition;

    constructor(mode, enemyTeam, allyTeam, targetPosition) {
        this.#mode = mode;
        this.#enemyTeam = enemyTeam;
        this.#allyTeam = allyTeam;
        this.#targetPosition = targetPosition;
    }

    get mode() { return this.#mode; }
    get enemyTeam() { return [...this.#enemyTeam]; }
    get allyTeam() { return [...this.#allyTeam]; }
    get targetPosition() { return this.#targetPosition; }

    getUsedHeroIds() {
        const ids = new Set();
        this.#enemyTeam.forEach((slot) => ids.add(slot.hero.id));
        this.#allyTeam.forEach((slot) => ids.add(slot.hero.id));
        return ids;
    }
}

module.exports = DraftScenario;
