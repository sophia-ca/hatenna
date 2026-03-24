import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 4000;
// To keep track of our active games
const activeGames = {};
const typesColour = {"normal": 0xA8A878, "fire": 0xF08030, "water": 0x6890F0, "electric": 0xF8D030, "grass": 0x78C850, "ice": 0x98d8d8, "fighting": 0xC03028,"poison": 0xA040A0, "ground": 0xe0c068, "flying": 0xA890F0, "psychic": 0xF85888, "bug": 0xA8B820, "rock": 0xB8A038, "ghost": 0x705898, "dragon": 0x7038F8, "dark": 0x705848 , "steel": 0xB8B8D0, "fairy": 0xEE99AC}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              // Fetches a random emoji to send from a helper function
              content: `hello world ${getRandomEmoji()}`
            }
          ]
        },
      });
    }
    if (name === 'weather') {
      // Send a message into the channel where command was triggered from
      const weatherRes = await fetch('https://projects.dawgy.pw/projects/weatherstation/api.php');
      const weather = await weatherRes.json();
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `Weather: ${weather.temperature}°C, ${weather.humidity}% humidity`,
            }
          ]
        },
      });
    }
    if (name === 'pokedex') {
      const pokeName = data.options?.find(opt => opt.name === 'name')?.value || 'pikachu';
      try {
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);
        if (!pokeRes.ok) throw new Error('Pokémon not found');
        const pokeData = await pokeRes.json();
        const sprite = pokeData.sprites.front_default;
        const shinySprite = pokeData.sprites.front_shiny;
        const typesArr = pokeData.types.map(t => t.type.name);
        const typestring = typesArr.length > 1 ? 'types' : 'type';
        const types = typesArr.join(', ');
        
        const abilitiesArr = pokeData.abilities.map(a => a.ability.name);
        const abilitiesstring = abilitiesArr.length > 1 ? 'abilities' : 'ability';
        const abilities = abilitiesArr.join(', ');
        const cries = pokeData.cries.latest;
        const pokeText = `ID: ${pokeData.id}\n${typestring}: ${types}\n${abilitiesstring}:${abilities}\n[cry](${cries})`;
    
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: pokeData.name,
                description: pokeText,
                image: { url: sprite },
                thumbnail: { url: shinySprite},
                color: typesColour[pokeData.types[0].type.name] // Example color (yellow)
              }
            ]
          },
        });
      } catch (err) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Could not fetch Pokémon data.',
          },
        });
      }
    }
  if (name === 'damage') {
    const pokeName = data.options?.find(opt => opt.name === 'name')?.value || 'psychic';
    try {
      const pokeRes = await fetch(`https://pokeapi.co/api/v2/type/${pokeName}`);
      if (!pokeRes.ok) throw new Error('Type not found');
      const pokeData = await pokeRes.json();
      const damage = pokeData.damage_relations;
      const formatDamage = (arr) => arr.map(type => type.name).join(', ') || 'none';
      const moveDmgClass = pokeData.move_damage_class.name;

      const damageText = 
        'damage class: ' + moveDmgClass + '\n' +
        `0x to: ${formatDamage(damage.no_damage_to)}\n` +
        `0.5x to: ${formatDamage(damage.half_damage_to)}\n` +
        `2x to: ${formatDamage(damage.double_damage_to)}\n` +
        `0x from: ${formatDamage(damage.no_damage_from)}\n` +
        `0.5x from: ${formatDamage(damage.half_damage_from)}\n` +
        `2x from: ${formatDamage(damage.double_damage_from)}`;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: pokeData.name.charAt(0) + pokeData.name.slice(1) + ' type effectiveness',
              description: damageText,
              color: typesColour[pokeData.name] || 0xCCCCCC // fallback color
            }
          ]
        },
      });
  } catch (err) {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Could not fetch Pokémon type data.',
      },
    });
  }
}
    
    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
