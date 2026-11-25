class SessionStats {
    #score;
    #streak;
    #bestStreak;
    #totalTasks;
    #correctTasks;

    constructor() {
        this.#score = 0;
        this.#streak = 0;
        this.#bestStreak = 0;
        this.#totalTasks = 0;
        this.#correctTasks = 0;
    }

    get score() { return this.#score; }
    get streak() { return this.#streak; }
    get bestStreak() { return this.#bestStreak; }
    get totalTasks() { return this.#totalTasks; }
    get correctTasks() { return this.#correctTasks; }

    getAccuracy() {
        if (this.#totalTasks === 0) return 0;
        return Number(((this.#correctTasks / this.#totalTasks) * 100).toFixed(1));
    }

    // Начисляет очки по месту выбранного героя (rank: 1 = лучший, 2 = второй, 3 = третий, 4 = худший)
    recordResult(rank) {
        this.#totalTasks += 1;

        let earnedPoints = 0;
        if (rank === 1) {
            earnedPoints = 100;
            this.#correctTasks += 1;
            this.#streak += 1;
            if (this.#streak > this.#bestStreak) {
                this.#bestStreak = this.#streak;
            }
        } else if (rank === 2) {
            earnedPoints = 50;
            this.#streak = 0;
        } else if (rank === 3) {
            earnedPoints = 20;
            this.#streak = 0;
        } else {
            earnedPoints = 0;
            this.#streak = 0;
        }

        this.#score += earnedPoints;
        return earnedPoints;
    }
}

module.exports = SessionStats;
