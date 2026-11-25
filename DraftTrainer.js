const DraftScenario = require('./DraftScenario');

class DraftTrainer {
    static LANE_OPPONENTS = { 1: 3, 2: 2, 3: 1, 4: 5, 5: 4 };

    #heroes;
    #matchups;

    constructor(heroes, matchups) {
        this.#heroes = heroes;
        this.#matchups = matchups;
    }

    #getCounterCoefficient(hero1Id, hero2Id) {
        if (hero1Id === hero2Id) return 0;
        const minId = hero1Id < hero2Id ? hero1Id : hero2Id;
        const maxId = hero1Id < hero2Id ? hero2Id : hero1Id;
        const record = this.#matchups.find((m) => m.a === minId && m.b === maxId);
        if (!record) return 0;
        return hero1Id === minId ? record.c : -record.c;
    }

    #pickWeightedHero(candidates) {
        const totalWeight = candidates.reduce((sum, h) => sum + h.pickrate, 0);
        let random = Math.random() * totalWeight;
        for (const hero of candidates) {
            random -= hero.pickrate;
            if (random <= 0) return hero;
        }
        return candidates.at(-1);
    }

    #shuffleArray(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = copy.at(i);
            copy.splice(i, 1, copy.at(j));
            copy.splice(j, 1, temp);
        }
        return copy;
    }

    #pickFourTiers(evaluatedSortedDesc) {
        const len = evaluatedSortedDesc.length;
        const best = evaluatedSortedDesc.at(0);
        const average = evaluatedSortedDesc.at(Math.floor(len * 0.35));
        const bad = evaluatedSortedDesc.at(Math.floor(len * 0.70));
        const terrible = evaluatedSortedDesc.at(-1);

        const distinct = [
            { ...best, tier: 'BEST' },
            { ...average, tier: 'AVERAGE' },
            { ...bad, tier: 'BAD' },
            { ...terrible, tier: 'TERRIBLE' }
        ];

        return {
            optionsForUser: this.#shuffleArray(distinct),
            bestEvaluation: best
        };
    }

    generatePickScenario() {
        const usedIds = new Set();
        const enemyTeam = [];
        const allyTeam = [];

        for (let pos = 1; pos <= 5; pos++) {
            const pool = this.#heroes.filter((h) => !usedIds.has(h.id) && h.canPlayPosition(pos));
            const chosen = this.#pickWeightedHero(pool);
            usedIds.add(chosen.id);
            enemyTeam.push({ position: pos, hero: chosen });
        }

        const missingPosition = Math.floor(Math.random() * 5) + 1;

        for (let pos = 1; pos <= 5; pos++) {
            if (pos === missingPosition) continue;
            const pool = this.#heroes.filter((h) => !usedIds.has(h.id) && h.canPlayPosition(pos));
            const chosen = this.#pickWeightedHero(pool);
            usedIds.add(chosen.id);
            allyTeam.push({ position: pos, hero: chosen });
        }

        return new DraftScenario('PICK', enemyTeam, allyTeam, missingPosition);
    }

    generateBanScenario() {
        const usedIds = new Set();
        const allyTeam = [];
        const enemyTeam = [];

        for (let pos = 1; pos <= 5; pos++) {
            const pool = this.#heroes.filter((h) => !usedIds.has(h.id) && h.canPlayPosition(pos));
            const chosen = this.#pickWeightedHero(pool);
            usedIds.add(chosen.id);
            allyTeam.push({ position: pos, hero: chosen });
        }

        const missingEnemyPosition = Math.floor(Math.random() * 5) + 1;

        for (let pos = 1; pos <= 5; pos++) {
            if (pos === missingEnemyPosition) continue;
            const pool = this.#heroes.filter((h) => !usedIds.has(h.id) && h.canPlayPosition(pos));
            const chosen = this.#pickWeightedHero(pool);
            usedIds.add(chosen.id);
            enemyTeam.push({ position: pos, hero: chosen });
        }

        return new DraftScenario('BAN', enemyTeam, allyTeam, missingEnemyPosition);
    }

    // Оценка кандидата для ПИКА: Контра + Матчап + Патч
    evaluatePickCandidate(candidateHero, scenario) {
        let counterScore = 0;
        const laneEnemyPos = DraftTrainer.LANE_OPPONENTS[scenario.targetPosition];

        for (const enemy of scenario.enemyTeam) {
            const coef = this.#getCounterCoefficient(candidateHero.id, enemy.hero.id);
            const weight = enemy.position === laneEnemyPos ? 1.5 : 1.0;
            counterScore += coef * weight;
        }

        const matchupScore = candidateHero.matchupRating;
        const patchScore = candidateHero.patchRating;

        const totalScore = Number((counterScore + matchupScore + patchScore).toFixed(2));
        return {
            hero: candidateHero,
            totalScore,
            counterScore: Number(counterScore.toFixed(2)),
            matchupScore: Number(matchupScore.toFixed(2)),
            patchScore: Number(patchScore.toFixed(2))
        };
    }

    // Оценка угрозы для БАНА: Контра + Матчап + Патч
    evaluateBanCandidate(enemyCandidate, scenario) {
        let counterScore = 0;
        const laneAllyPos = DraftTrainer.LANE_OPPONENTS[scenario.targetPosition];

        for (const ally of scenario.allyTeam) {
            const coef = this.#getCounterCoefficient(enemyCandidate.id, ally.hero.id);
            const weight = ally.position === laneAllyPos ? 1.5 : 1.0;
            counterScore += coef * weight;
        }

        const matchupScore = enemyCandidate.matchupRating;
        const patchScore = enemyCandidate.patchRating + (enemyCandidate.pickrate - 13) * 0.08;

        const totalScore = Number((counterScore + matchupScore + patchScore).toFixed(2));
        return {
            hero: enemyCandidate,
            totalScore,
            counterScore: Number(counterScore.toFixed(2)),
            matchupScore: Number(matchupScore.toFixed(2)),
            patchScore: Number(patchScore.toFixed(2))
        };
    }

    generateFourOptions(scenario) {
        const usedIds = scenario.getUsedHeroIds();
        const roleCandidates = this.#heroes.filter(
            (h) => !usedIds.has(h.id) && h.canPlayPosition(scenario.targetPosition)
        );

        const evaluated = roleCandidates
            .map((hero) =>
                scenario.mode === 'PICK'
                    ? this.evaluatePickCandidate(hero, scenario)
                    : this.evaluateBanCandidate(hero, scenario)
            )
            .sort((a, b) => b.totalScore - a.totalScore);

        return this.#pickFourTiers(evaluated);
    }
}

module.exports = DraftTrainer;
