import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const WEATHER = {
  name: 'weather',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const POKEDEX = {
  name: 'pokedex',
  description: 'get info about a given pokemon',
  options: [
    {
      type: 3, // STRING type
      name: 'name',
      description: 'the name of the pokemon',
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const DAMAGE = {
  name: 'damage',
  description: 'get the damage relations for a given pokemon',
  options: [
    {
      type: 3, // STRING type
      name: 'name',
      description: 'the name of the pokemon',
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
const ALL_COMMANDS = [TEST_COMMAND, WEATHER, POKEDEX, DAMAGE];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
