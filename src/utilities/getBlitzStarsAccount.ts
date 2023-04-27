import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import fetch from 'node-fetch';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { PlayerStatistics } from '../types/statistics.js';

export default async function getBlitzStarsAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  accountId: number,
  name: string,
  callback: (account: PlayerStatistics) => void,
) {
  await interaction.deferReply();
  
  async function notTracked() {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('No data to display')
          .setDescription(`${name} is not tracked by BlitzStars.`)
          .setColor(NEGATIVE_COLOR),
      ],
    });

    console.log(`${name} is not tracked by BlitzStars.`);
  }

  fetch(`https://www.blitzstars.com/api/top/player/${accountId}`)
    .then(async (response) => {
      const data = (await response.json()) as PlayerStatistics;

      if (data.statistics) {
        callback(data);
      } else {
        notTracked();
      }
    })
    .catch(notTracked);
}
