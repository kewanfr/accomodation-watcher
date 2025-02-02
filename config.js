import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default {
  URL_TO_WATCH: process.env.URL,
  
  USERNAME: process.env.USERNAME,
  PASSWORD: process.env.PASSWORD,

  headless: process.env.HEADLESS || true,


  GMAIL: {
    USER: process.env.GMAIL_USER,
    CODE: process.env.GMAIL_CODE
  },

  EMAIL_TO_NOTIFY: process.env.EMAIL_TO_NOTIFY,

  discord: {
    CLIENT_ID: "1327786761039904798",
    USER_ID: "355402435893919754",
    GUILD_ID: "704411388549922847",
    TOKEN: process.env.DISCORD_TOKEN,

    CHANNEL_ID: "1335638018027163742"
  },

  REFRESH_INTERVAL: 1000*60*20 // 20 minutse (100ms * 60s * 20min)
}