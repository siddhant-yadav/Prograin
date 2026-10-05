/**
 * ProGrain protein calculator: EDIT VALUES HERE.
 *
 * Everything on the calculator is driven from this file.
 * - proteinPerProGrainRoti: grams of protein in ONE ProGrain roti (target until lab results exist).
 * - items[].proteinPerUnit: grams of protein in ONE unit of that food (one egg, one glass, one katori, or one gram).
 * - items[].unit: [singular, plural] word shown with the name. Use ['g','g'] for foods measured by weight.
 * - items[].grams: true shows the amount as "110 g" and rounds to the nearest 5 g (instead of nearest half unit).
 * - items[].hideUnit: true skips the unit word (eggs, rotis) because the name already says it.
 * - items[].note: shown as a hover tooltip only (not printed on the tile).
 */
window.PROGRAIN_CALC = {
  proteinPerProGrainRoti: 8,   // 3 rotis = 24 g
  defaultRotis: 3,
  minRotis: 1,
  maxRotis: 6,
  items: [
    { id: 'egg',    name: 'Eggs',               unit: ['egg', 'eggs'],       proteinPerUnit: 6,      icon: 'i-egg',    hideUnit: true, note: 'Normal-sized eggs' },
    { id: 'milk',   name: 'Cow milk',           unit: ['glass', 'glasses'],  proteinPerUnit: 8,      icon: 'i-milk',   note: '250 ml glasses' },
    { id: 'paneer', name: 'Paneer',             unit: ['g', 'g'],            proteinPerUnit: 0.218,  icon: 'i-paneer', grams: true, note: 'About half a 200 g block at 24 g' },
    { id: 'dal',    name: 'Cooked dal',         unit: ['katori', 'katoris'], proteinPerUnit: 6,      icon: 'i-dal',    note: '200 ml katori' },
    { id: 'rajma',  name: 'Rajma or chole',     unit: ['katori', 'katoris'], proteinPerUnit: 9.5,    icon: 'i-rajma',  note: 'Cooked, 200 ml katori' },
    { id: 'soya',   name: 'Cooked soya chunks', unit: ['g', 'g'],            proteinPerUnit: 0.1765, icon: 'i-soya',   grams: true, note: 'About 45 g dry chunks at 24 g' },
    { id: 'pb',     name: 'Peanut butter',      unit: ['spoon', 'spoons'],   proteinPerUnit: 4,      icon: 'i-pb',     note: 'Small spoon, about 16 g' },
    { id: 'roti',   name: 'Whole wheat roti',   unit: ['roti', 'rotis'],     proteinPerUnit: 2.7,    icon: 'i-roti',   hideUnit: true, note: 'Plain, 40 g each' }
  ]
};
