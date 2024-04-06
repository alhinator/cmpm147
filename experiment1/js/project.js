// project.js - this is the generator for the sinister potion recipe generator
// Author: Alex Leghart
// Date: 4-7-24



const fillers = {
  name: ["Wizard", "Witch", "Warlock", "Alchemist", "Gambler", "Sniler", "Executioner", "Gay Frog", "President", "Wes Mode", "Gamer"],
  tasteful: ["Tasteful", "Delicious", "Interesting", "Abhorrent", "Dégoûtant", 'Unusual', "Sinister", "Queer", "Addictive", "Righteous", "Frightening", "Perfected", "Ascendant", "Living", "Dreadful", "Non-alcoholic", "Rainbow", "Starry"],
  drinknoun: ["Potion", "Brew", "Concotion", "Sipping Drink", "Mixed Drink", "Creation", "Jus"],
  base_amt: ["a pint", "one shot", "two shots", "eight ounces", "a large jug"],
  base: ["lemonade", "iced tea", "seltzer water", "ginger beer", "limeade", "naked juice", "apple juice", "orange juice", "cranberry juice", "grapefruit juice", "milk", "cola", "pilk", "sprite", "nyquil", "lean", "kombucha", "coffee", "chai", "matcha", "redbull", "sugar-free monster", "beef broth", "margarita mixer", "grenadine syrup", "g-fuel"],
  alc: ["vodka", "everclear", "moonshine", "white rum", "coconut rum", "fireball", "cheap whiskey", "expensive whiskey", "brandy", "ale", "mead", "tequila", "white wine", "red wine", "coor's banquet", "miller high life", "banana liqueur"],
  method_adverb:["Slowly", "Quickly", "Carefully", "Lovingly", "Violently"],
  method:["stir", "shake", "microwave", "blend", "heat to a rolling boil"],
  time:["ten seconds", "fifteen seconds", "thirty seconds", "one minute"],
  garnish: ["a sprig of mint", "salt", "cayenne powder", "tajin", "a dash of lime", "a dash of lemon", "a wedge of lime", "a wedge of orange", "a wedge of lemon", "a sprig of cilantro", "three drops of your own blood", "the tears of a maiden", "MDMA"],
  served: ["warm", "chilled", "frozen", "piping hot", "lukewarm", "on the rocks"],
  container:["old fashioned glass", "shotglass", "tall shotglass", "potion bottle", "copper mug", "pint glass", "wooden tankard", "coffee mug", "bong", "hydroflask", "dog bowl"]
};

const template = `Recipe for "$name\'s $tasteful $drinknoun":

Begin by filling a large mixing container with $base_amt of $base.
Add $base_amt of $alc, and if you're feeling brave, add $base_amt of $alc.
$method_adverb $method for $time; Garnish with $garnish and serve $served in a $container.`
;


// STUDENTS: You don't need to edit code below this line.

const slotPattern = /\$(\w+)/;

function replacer(match, name) {
  let options = fillers[name];
  if (options) {
    return options[Math.floor(Math.random() * options.length)];
  } else {
    return `<UNKNOWN:${name}>`;
  }
}

function generate() {
  let story = template;
  while (story.match(slotPattern)) {
    story = story.replace(slotPattern, replacer);
  }

  /* global box */
  box.innerText = story;
}

/* global clicker */
clicker.onclick = generate;

generate();
