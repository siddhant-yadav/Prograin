/**
 * ProGrain protein calculator: EDIT VALUES HERE.
 *
 * Everything on the calculator is driven from this file.
 * - proteinPerProGrainRoti: grams of protein in ONE ProGrain roti (target until lab results exist).
 * - items[].proteinPerUnit: grams of protein in ONE unit of that food (one egg, one glass, one katori...).
 * - items[].unitGrams / unitMl (optional): size of one unit, used for the "about N g / ml" hint.
 * - items[].base: icon height in px at full size (stacks shrink automatically to fit).
 * - items[].ov: how much each stacked icon overlaps the one below (0 = side by side, 0.9 = tightly piled).
 * - items[].hideUnit: true skips the unit word (eggs, rotis) because the name already says it.
 * - Counts are rounded to the nearest half unit (so 2.5 katoris shows 2 and a half).
 */
window.PROGRAIN_CALC = {
  proteinPerProGrainRoti: 8,   // 3 rotis = 24 g
  defaultRotis: 3,
  minRotis: 1,
  maxRotis: 6,
  items: [
    { id: 'egg',    name: 'Eggs',            unit: ['egg', 'eggs'],         proteinPerUnit: 6,   icon: 'i-egg', hideUnit: true,    base: 76, ov: 0.50, note: 'Normal-sized eggs' },
    { id: 'milk',   name: 'Cow milk',        unit: ['glass', 'glasses'],    proteinPerUnit: 8,   icon: 'i-milk',   base: 76, ov: 0.45, note: '250 ml glasses', unitMl: 250 },
    { id: 'paneer', name: 'Paneer',          unit: ['cube', 'cubes'],       proteinPerUnit: 4.8, icon: 'i-paneer', base: 60, ov: 0.45, note: 'Cubes of about 22 g', unitGrams: 22 },
    { id: 'dal',    name: 'Cooked dal',      unit: ['katori', 'katoris'],   proteinPerUnit: 6,   icon: 'i-dal',    base: 62, ov: 0.58, note: '200 ml katori, diluted by water' },
    { id: 'rajma',  name: 'Rajma or chole',  unit: ['katori', 'katoris'],   proteinPerUnit: 9.5, icon: 'i-rajma',  base: 62, ov: 0.58, note: 'Cooked, 200 ml katori' },
    { id: 'soya',   name: 'Cooked soya chunks', unit: ['portion', 'portions'], proteinPerUnit: 6, icon: 'i-soya',   base: 62, ov: 0.58, note: 'Cooked, 34 g portions', unitGrams: 34 },
    { id: 'pb',     name: 'Peanut butter',   unit: ['spoon', 'spoons'],     proteinPerUnit: 4,   icon: 'i-pb',     base: 46, ov: 0.52, note: 'Small spoon, about 16 g' },
    { id: 'roti',   name: 'Whole wheat roti', unit: ['roti', 'rotis'],      proteinPerUnit: 2.7, icon: 'i-roti', hideUnit: true,   base: 40, ov: 0.62, note: 'Plain, 40 g each' }
  ]
};
