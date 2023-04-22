import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { SERVERS } from '../constants/servers.js';
import AccountList, { Account } from '../types/accountList.js';

export default async function getBlitzAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  ign: string,
  server: keyof typeof SERVERS,
  callback: (account: Account) => void,
) {
  const serverName = SERVERS[server];
  const players = (await fetch(
    `https://api.wotblitz.${server}/wotb/account/list/?application_id=${process.env.WARGAMING_APPLICATION_ID}&search=${ign}`,
  ).then((response) => response.json())) as AccountList;

  if (players?.data?.[0]?.nickname === ign) {
    callback(players.data[0]);
  } else {
    // no exact match
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(NEGATIVE_COLOR)
          .setTitle(`Account not found`)
          .setDescription(
            `Are you sure your username is exactly "${ign}" in the ${serverName} server? I found ${
              players?.data
                ? players.data.length < 100
                  ? players.data.length
                  : 'over 100'
                : 0
            } similarly spelled account${
              players?.data?.length !== 1 ? 's' : ''
            }. Try re-running the command. Don't make typos and capitalize correctly.`,
          ),
      ],
    });
  }
}
