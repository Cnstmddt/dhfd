const { HEROES_DATA, MATCHUPS_DATA } = require('./MockData');
const DraftTrainer = require('./DraftTrainer');
const SessionStats = require('./SessionStats');
const ConsoleUI = require('./ConsoleUI');

function main() {
    const trainer = new DraftTrainer(HEROES_DATA, MATCHUPS_DATA);
    const stats = new SessionStats();
    const ui = new ConsoleUI(trainer, stats);

    ui.start();
}

main();
