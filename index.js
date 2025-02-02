import config from './config.js';
import {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  userMention,
  Partials
} from "discord.js";

import puppeteer from 'puppeteer';
import { actualTime, sendDiscordMessage } from './utils/functions.js';
import sendMail from './utils/sendMail.js';

const {
  Channel,
  GuildMember,
  Message,
  Reaction,
  ThreadMember,
  User,
  GuildScheduledEvent,
} = Partials;
// Or import puppeteer from 'puppeteer-core';


function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

let browserParams = {}

if (config.onProduction) {
  browserParams = {
    // headless: config.HEADLESS,
    args: ["--no-sandbox"],
    executablePath: "/usr/bin/chromium-browser",
  }
} else {
  browserParams = {
    headless: config.headless,
    defaultViewport: null,
    args: ['--start-maximized'],
  }
}


// Launch the browser and open a new blank page
const browser = await puppeteer.launch(browserParams);

const client = new Client({
  intents: 3276799,
  partials: [
    Channel,
    GuildMember,
    Message,
    Reaction,
    ThreadMember,
    User,
    GuildScheduledEvent,
  ],
  allowedMentions: { parse: ["everyone", "roles", "users"] },
});

const isAccomodationAvailable = async (browser) => {
  return new Promise(async (resolve, reject) => {
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto(config.URL_TO_WATCH);

    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });

    await page.locator('body > div > header > div.fr-header__body > div > div > div.fr-header__tools > div > ul > li > a').click();

    await page.waitForSelector('#login\\[app\\]-label-0 > img');
    await delay(3000);

    console.log('clicking on login button');
    await page.locator('#login\\[app\\]-label-0 > img').click();
    await page.locator('#login\\[app\\]-label-0').click();
    // await page.

    await page.waitForSelector('#login_login');

    // // #login_login
    await page.locator('#login_login').fill(config.USERNAME);

    // // // #login_password
    await page.locator('#login_password').fill(config.PASSWORD);

    // // #pvelogin > div.form-element-wrapper > button
    await page.locator('#pvelogin > div.form-element-wrapper > button').click();

    await page.waitForSelector('#HomeSearch > div.fr-container.svelte-1n8fr4n > form > h1');
    await delay(1000);

    await page.goto(config.URL_TO_WATCH);

    await page.waitForSelector('#content');
    await delay(1000);


    if (await page.$('#ModalitiesForm-occupationMode') !== null) {
      // console.log('Occupation mode is present');
      resolve(true);
    } else {
      // console.log('Occupation mode is not present');
      resolve(false);
    }
  });
};

const watchForAccomodation = async (sendNoAccoMsg = false) => {

  const isAvailable = await isAccomodationAvailable(browser);

  if (isAvailable) {
    const subject = `🥳 LOGEMENT DISPO !! Vas-y vite !`;
    const message = `Un logement est disponible sur ${config.URL_TO_WATCH} !`;

    await sendMail(config.EMAIL_TO_NOTIFY, subject, message);

    const discordMessage = `${userMention(config.discord.USER_ID)} 🥳 LOGEMENT DISPONIBLE: ${config.URL_TO_WATCH} !`;
    await sendDiscordMessage(client, discordMessage);
    
    await delay(4500);

    await sendDiscordMessage(client, `LOGEMENT: ${config.URL_TO_WATCH} ${userMention(config.discord.USER_ID)}`);

    await delay(10500);

    await sendDiscordMessage(client, `${userMention(config.discord.USER_ID)}`);


  } else {
    console.log(`[${actualTime()}] No accomodation available.`);
    if (sendNoAccoMsg) {

      await sendDiscordMessage(client,
        `Pas de logement disponible à ${config.URL_TO_WATCH}`
      );
    }
  }
};


const rest = new REST({ version: "10" }).setToken(config.discord.TOKEN);

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Ping all devices and update status message")
    .toJSON(),
];

const data = await rest.put(
  Routes.applicationGuildCommands(
    config.discord.CLIENT_ID,
    config.discord.GUILD_ID
  ),
  { body: commands }
);

if (data?.length > 0) {
  console.log(
    `[${actualTime()}] Successfully registered application commands.`
  );
} else {
  console.error(`[${actualTime()}] Error registering application commands.`);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  watchForAccomodation(true);
  setInterval(async () => {

    // Random delay from 30 seconds to 1 minute
    const randomDelay = Math.floor(Math.random() * 30) + 30;
    console.log(`[${actualTime()}] Random delay: ${randomDelay} seconds`);
    await delay(randomDelay * 1000);


    watchForAccomodation();
  }, config.REFRESH_INTERVAL);
});

client.on(Events.InteractionCreate, async (interaction) => {

  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  console.log(`Command: ${commandName}`);

  if (commandName === "ping") {
    await interaction.reply({ content: "🏓 Pong!", ephemeral: true });
  } else if (commandName === "update") {
    await interaction.reply({
      content: "✅ Updated Watch !",
      ephemeral: true,
    });
    await watchForAccomodation(true);
  }
});

client.login(config.discord.TOKEN);