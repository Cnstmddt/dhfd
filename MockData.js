const Hero = require('./Hero');

// Параметры: id, name, attribute, winrate, pickrate, matchupRating, patchRating, rolesString
const HEROES_DATA = [
    new Hero(1, 'Anti-Mage', 'AGI', 51.2, 14.5, 0.5, 0.8, '1'),
    new Hero(5, 'Juggernaut', 'AGI', 51.9, 17.4, 1.4, 1.3, '1'),
    new Hero(8, 'Phantom Assassin', 'AGI', 50.7, 20.5, 0.3, 0.5, '1'),
    new Hero(19, 'Faceless Void', 'AGI', 51.7, 15.6, 1.0, 1.1, '1'),
    new Hero(22, 'Sven', 'STR', 51.5, 11.8, 0.8, 0.9, '1'),
    new Hero(26, 'Slark', 'AGI', 50.4, 14.2, 0.6, 0.3, '1'),
    new Hero(28, 'Phantom Lancer', 'AGI', 50.3, 10.7, 0.4, 0.2, '1'),
    new Hero(30, 'Ursa', 'AGI', 53.1, 13.5, 1.7, 2.1, '1'),

    new Hero(4, 'Invoker', 'INT', 49.4, 18.1, 0.2, -0.4, '2,4'),
    new Hero(10, 'Shadow Fiend', 'AGI', 51.0, 15.9, 1.1, 0.7, '1,2'),
    new Hero(13, 'Zeus', 'INT', 52.4, 13.7, 1.3, 1.6, '2,4'),
    new Hero(17, 'Sniper', 'AGI', 51.4, 18.7, 0.7, 1.0, '1,2'),
    new Hero(18, 'Storm Spirit', 'INT', 50.8, 13.4, 0.9, 0.6, '2'),
    new Hero(21, 'Lina', 'INT', 50.9, 14.1, 1.2, 0.7, '1,2'),
    new Hero(23, 'Queen of Pain', 'INT', 49.7, 13.9, 0.8, -0.2, '2,4'),
    new Hero(31, 'Puck', 'INT', 50.6, 12.1, 1.1, 0.4, '2'),

    new Hero(2, 'Axe', 'STR', 52.8, 16.0, 1.5, 1.9, '3'),
    new Hero(7, 'Mars', 'STR', 50.1, 12.3, 0.9, 0.1, '2,3'),
    new Hero(11, 'Tidehunter', 'STR', 52.1, 11.4, 1.3, 1.4, '3'),
    new Hero(15, 'Centaur Warrunner', 'STR', 52.3, 12.9, 1.2, 1.5, '3'),
    new Hero(24, 'Legion Commander', 'STR', 52.6, 15.1, 1.6, 1.8, '3'),
    new Hero(32, 'Doom', 'STR', 50.4, 10.8, 0.7, 0.3, '3'),
    new Hero(33, 'Underlord', 'STR', 52.9, 9.6, 1.4, 1.9, '3'),

    new Hero(3, 'Crystal Maiden', 'INT', 50.5, 15.2, 0.6, 0.4, '4,5'),
    new Hero(6, 'Lion', 'INT', 49.8, 19.0, 0.4, -0.1, '4,5'),
    new Hero(9, 'Rubick', 'INT', 48.9, 16.8, 0.3, -0.7, '4,5'),
    new Hero(12, 'Witch Doctor', 'INT', 53.0, 14.8, 1.5, 2.0, '4,5'),
    new Hero(14, 'Dazzle', 'INT', 51.6, 10.2, 1.1, 1.1, '2,5'),
    new Hero(16, 'Pudge', 'STR', 50.2, 24.5, 0.2, 0.2, '2,3,4,5'),
    new Hero(20, 'Earthshaker', 'STR', 51.1, 16.2, 0.7, 0.8, '2,3,4'),
    new Hero(25, 'Oracle', 'INT', 51.8, 8.5, 1.3, 1.2, '5'),
    new Hero(27, 'Disruptor', 'INT', 52.0, 11.9, 1.2, 1.3, '4,5'),
    new Hero(29, 'Grimstroke', 'INT', 49.6, 9.8, 0.5, -0.3, '4,5'),
    new Hero(34, 'Shadow Shaman', 'INT', 51.3, 14.4, 1.0, 0.9, '4,5'),
    new Hero(35, 'Jakiro', 'INT', 52.5, 11.7, 1.6, 1.7, '4,5')
];

const MATCHUPS_DATA = [
    { a: 1, b: 2, c: -3.5 }, { a: 1, b: 4, c: 3.2 }, { a: 1, b: 13, c: 4.0 },
    { a: 1, b: 18, c: 3.6 }, { a: 1, b: 24, c: -3.1 }, { a: 1, b: 31, c: 2.8 },
    { a: 1, b: 32, c: -3.4 }, { a: 2, b: 8, c: 3.8 }, { a: 2, b: 14, c: -2.8 },
    { a: 2, b: 28, c: 3.4 }, { a: 2, b: 30, c: -3.2 }, { a: 3, b: 5, c: -2.1 },
    { a: 4, b: 10, c: 1.5 }, { a: 5, b: 11, c: 2.0 }, { a: 6, b: 8, c: 2.4 },
    { a: 6, b: 18, c: 2.9 }, { a: 6, b: 31, c: 3.1 }, { a: 7, b: 13, c: 2.2 },
    { a: 7, b: 17, c: 3.1 }, { a: 9, b: 12, c: 2.6 }, { a: 11, b: 26, c: -2.9 },
    { a: 16, b: 17, c: 2.7 }, { a: 17, b: 18, c: -3.5 }, { a: 18, b: 31, c: -2.4 },
    { a: 19, b: 25, c: -2.5 }, { a: 20, b: 28, c: 4.5 }, { a: 22, b: 28, c: 3.7 },
    { a: 24, b: 26, c: 2.8 }, { a: 26, b: 27, c: -2.6 }, { a: 32, b: 33, c: 1.8 },
    { a: 34, b: 35, c: -1.4 }
];

module.exports = { HEROES_DATA, MATCHUPS_DATA };
