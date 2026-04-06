import { loadBotConfig } from './infra/config';
import { createBotServices } from './infra/services';
import { createBot } from './bot/create-bot';

const config = loadBotConfig();

const bot = createBot({
  token: config.token,
  dashboardUrl: config.dashboardUrl,
  ownerChatId: config.ownerChatId,
  services: createBotServices(config),
});
bot.start();
