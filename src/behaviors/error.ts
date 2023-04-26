import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import { NEGATIVE_COLOR } from '../constants/colors.js';

export const PROCESS_ERROR_EVENTS = ['uncaughtException'];
export const CLIENT_ERROR_EVENTS = ['error'];

function handleError(error: Error, client: Client) {
  console.error(error);

  (
    client.guilds.cache
      .get(discord.guild_id)
      ?.channels.cache.get(discord.log_channel) as TextChannel
  ).send({
    embeds: [
      new EmbedBuilder()
        .setTitle('Skilled Bot ran into a catastrophic error')
        .setColor(NEGATIVE_COLOR)
        .setDescription(
          `Total shutdown was avoided! Error:\n\n\`\`\`${error.name}\n${error.message}\n${error.stack}\n${error.cause}\`\`\``,
        ),
    ],
  });
}

export function registerErrorHandlers(client: Client) {
  PROCESS_ERROR_EVENTS.forEach((name) =>
    process.on(name, (error) => handleError(error, client)),
  );
  CLIENT_ERROR_EVENTS.forEach((name) =>
    client.on(name, (error) => handleError(error, client)),
  );

  return client;
}
