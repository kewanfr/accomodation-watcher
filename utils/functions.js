import config from "../config.js";


export function actualTime() {
  const date = new Date();
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export function sendDiscordMessage(client, message) {
  const channel = client.channels.cache.get(config.discord.CHANNEL_ID);
  channel.send(message);
}