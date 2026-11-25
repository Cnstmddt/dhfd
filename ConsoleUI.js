const readline = require('readline');

class ConsoleUI {
    static ROLE_LABELS = {
        1: '1 · Керри',
        2: '2 · Мидер',
        3: '3 · Оффлейнер',
        4: '4 · Саппорт',
        5: '5 · Фулл-саппорт'
    };

    #trainer;
    #stats;
    #rl;

    constructor(trainer, stats) {
        this.#trainer = trainer;
        this.#stats = stats;
        this.#rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    }

    #ask(question) {
        return new Promise((resolve) => this.#rl.question(question, resolve));
    }

    async #askValidated(question, allowedValues) {
        while (true) {
            const input = (await this.#ask(question)).trim();

            if (allowedValues.includes(input)) {
                return input;
            }

            console.log(
                'Ошибка: некорректный ввод! Допустимые значения: ' + allowedValues.join(', ') + '. Попробуйте снова.\n'
            );
        }
    }

    #printStatsBlock() {
        console.log('--------------------------------------------------------------------------------');
        console.log('СТАТИСТИКА СЕССИИ:');
        console.log('  Очки:              ' + this.#stats.score);
        console.log('  Стрик:             ' + this.#stats.streak + ' (Лучший: ' + this.#stats.bestStreak + ')');
        console.log('  Точность ответов:  ' + this.#stats.getAccuracy() + '%');
        console.log('  Пройдено задач:    ' + this.#stats.totalTasks);
        console.log('--------------------------------------------------------------------------------');
    }

    #printAllComparisonTable(allOptions, userEval, bestEval, mode) {
        const isBan = mode === 'BAN';
        const bestLabel = isBan ? '[ЛУЧШИЙ БАН]' : '[ЛУЧШИЙ ПИК]';
        const bothLabel = isBan ? '[ЛУЧШИЙ БАН + ВАШ ВЫБОР]' : '[ЛУЧШИЙ + ВАШ ВЫБОР]';

        console.log('\n================================================================================');
        console.log('                      СРАВНЕНИЕ ПОКАЗАТЕЛЕЙ ВСЕХ ГЕРОЕВ                         ');
        console.log('================================================================================');

        const header =
            '   ' +
            'Герой'.padEnd(20, ' ') + ' | ' +
            'Контра'.padEnd(7, ' ') + ' | ' +
            'Матчап'.padEnd(7, ' ') + ' | ' +
            'Патч'.padEnd(6, ' ') + ' | ' +
            'ИТОГ'.padEnd(7, ' ') + ' | Статус';

        console.log(header);
        console.log('--------------------------------------------------------------------------------');

        const sortedOptions = [...allOptions].sort((a, b) => b.totalScore - a.totalScore);

        sortedOptions.forEach((opt) => {
            const isUser = opt.hero.id === userEval.hero.id;
            const isBest = opt.hero.id === bestEval.hero.id;

            let marker = '   ';
            let statusTag = '';

            if (isUser && isBest) {
                marker = '>> ';
                statusTag = bothLabel;
            } else if (isBest) {
                marker = '★  ';
                statusTag = bestLabel;
            } else if (isUser) {
                marker = '-> ';
                statusTag = '[ВАШ ВЫБОР]';
            }

            const row =
                marker +
                opt.hero.name.padEnd(20, ' ') + ' | ' +
                String(opt.counterScore).padEnd(7, ' ') + ' | ' +
                String(opt.matchupScore).padEnd(7, ' ') + ' | ' +
                String(opt.patchScore).padEnd(6, ' ') + ' | ' +
                String(opt.totalScore).padEnd(7, ' ') + ' | ' +
                statusTag;

            console.log(row);
        });

        console.log('================================================================================');

        const userRank = sortedOptions.findIndex((opt) => opt.hero.id === userEval.hero.id) + 1;
        const earnedPoints = this.#stats.recordResult(userRank);

        if (userRank === 1) {
            console.log(
                isBan
                    ? 'Итог: ИДЕАЛЬНО! Вы забанили самого опасного контрпика (+' + earnedPoints + ' очков).'
                    : 'Итог: ИДЕАЛЬНО! Вы выбрали самого сильного героя в этот драфт (+' + earnedPoints + ' очков).'
            );
        } else {
            const diff = (bestEval.totalScore - userEval.totalScore).toFixed(2);
            console.log(
                'Итог: Ваше решение заняло ' + userRank + '-е место (+' + earnedPoints + ' очков). Отставание от лучшего (' + bestEval.hero.name + '): ' + diff + ' балла.'
            );
        }

        this.#printStatsBlock();
    }

    async #playRound(isBanMode) {
        const scenario = isBanMode
            ? this.#trainer.generateBanScenario()
            : this.#trainer.generatePickScenario();

        const roleText = ConsoleUI.ROLE_LABELS[scenario.targetPosition];

        console.log('\n================================================================================');
        if (isBanMode) {
            console.log('Кого забанить?');
            console.log('У врага остался последний пик на роль — ' + roleText + '.');
            console.log('Какой герой сильнее всего контрит вашу команду и его нужно забанить?');
        } else {
            console.log('Кого взять?');
            console.log('Последний пик за вами, ваша роль — ' + roleText + '.');
            console.log('Кто лучше всего подходит к этому драфту?');
        }
        console.log('================================================================================\n');

        console.log('КОМАНДА ПРОТИВНИКА:');
        for (let pos = 1; pos <= 5; pos++) {
            if (isBanMode && pos === scenario.targetPosition) {
                console.log('  [' + ConsoleUI.ROLE_LABELS[pos] + '] -> ??? [ПУСТОЙ СЛОТ ВРАГА — БАН] ???');
            } else {
                const enemy = scenario.enemyTeam.find((e) => e.position === pos);
                console.log('  [' + ConsoleUI.ROLE_LABELS[pos] + '] -> ' + enemy.hero.name);
            }
        }

        console.log('\nВАША КОМАНДА:');
        for (let pos = 1; pos <= 5; pos++) {
            if (!isBanMode && pos === scenario.targetPosition) {
                console.log('  [' + ConsoleUI.ROLE_LABELS[pos] + '] -> ??? [ВАШ ПИК] ???');
            } else {
                const ally = scenario.allyTeam.find((a) => a.position === pos);
                console.log('  [' + ConsoleUI.ROLE_LABELS[pos] + '] -> ' + ally.hero.name);
            }
        }

        const { optionsForUser, bestEvaluation } = this.#trainer.generateFourOptions(scenario);

        console.log('\n--------------------------------------------------------------------------------');
        console.log(isBanMode ? 'ВЫБЕРИТЕ ОДНОГО ИЗ 4 ГЕРОЕВ ДЛЯ БАНА:' : 'ВЫБЕРИТЕ ОДНОГО ИЗ 4 ГЕРОЕВ ДЛЯ ПИКА:');
        optionsForUser.forEach((opt, idx) => {
            console.log('  ' + (idx + 1) + '. ' + opt.hero.name);
        });
        console.log('--------------------------------------------------------------------------------\n');

        const validChoice = await this.#askValidated('Введите номер варианта (1-4): ', ['1', '2', '3', '4']);
        const chosenOption = optionsForUser.at(parseInt(validChoice, 10) - 1);

        this.#printAllComparisonTable(optionsForUser, chosenOption, bestEvaluation, scenario.mode);
    }

    async start() {
        while (true) {
            console.log('\n================================================================================');
            console.log('                     ГЛАВНОЕ МЕНЮ — ТРЕНАЖЁР ДРАФТОВ DOTA 2                     ');
            console.log('================================================================================');
            if (this.#stats.totalTasks > 0) {
                console.log(
                    'Текущий прогресс: Очки: ' + this.#stats.score +
                    ' | Стрик: ' + this.#stats.streak +
                    ' | Точность: ' + this.#stats.getAccuracy() + '%' +
                    ' | Задач: ' + this.#stats.totalTasks
                );
                console.log('--------------------------------------------------------------------------------');
            }
            console.log('  1. Режим 1: Пик 5-го героя в вашу команду');
            console.log('  2. Режим 2: Бан 5-го героя для команды врага');
            console.log('  0. Выход из программы\n');

            const menuChoice = await this.#askValidated('Выберите пункт меню (1, 2 или 0): ', ['1', '2', '0']);

            if (menuChoice === '0') {
                console.log('\nЗавершение работы тренажёра');
                break;
            }

            const isBanMode = menuChoice === '2';

            while (true) {
                await this.#playRound(isBanMode);

                console.log('\nХотите продолжить тренировку или выйти в главное меню?');
                console.log('1. Продолжить');
                console.log('2. Выход');

                const nextChoice = await this.#askValidated('', ['1', '2']);

                if (nextChoice === '2') {
                    break;
                }
            }
        }

        this.#rl.close();
    }
}

module.exports = ConsoleUI;
