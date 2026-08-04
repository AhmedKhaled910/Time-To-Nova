import { Telegraf, Scenes, session } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config();

import { parentEntryScene } from './scenes/parentEntry';
import { nannyEntryScene } from './scenes/nannyEntry';
import { illnessScene } from './scenes/illness';
import { tourScene } from './scenes/tour';
import { birthdayScene } from './scenes/birthday';
import { policiesScene } from './scenes/policies';
import { teacherDutyText } from './teacherDuties';
import { getSessionStore } from './sessionStore';
import {
  MENU,
  TEACHER_MENU,
  PLACES,
  GYM_ROLES,
  NURSERY_ROLES,
  placeKeyboard,
  gymRoleKeyboard,
  nurseryRoleKeyboard,
  operationalMenuKeyboard,
} from './utils';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('Missing BOT_TOKEN. Set it in .env (local) or in your Vercel project env vars.');
}

export const bot = new Telegraf<Scenes.WizardContext>(BOT_TOKEN);

// Register every scenario as a scene in the Stage
const stage = new Scenes.Stage<Scenes.WizardContext>([
  parentEntryScene,
  nannyEntryScene,
  illnessScene,
  tourScene,
  birthdayScene,
  policiesScene as any,
]);

// Uses Redis on Vercel (persists across serverless invocations),
// falls back to in-memory automatically for local `npm run dev`.
const store = getSessionStore();
bot.use(store ? session({ store }) : session());
bot.use(stage.middleware());

// ---- /start: always re-asks Place + Role ----
bot.start(async (ctx) => {
  const session = (ctx as any).session;
  session.place = undefined;
  session.role = undefined;
  await ctx.reply('👋 Welcome to the Kids Area & Nursery Bot!\n\nPlease select your place:', placeKeyboard());
});

// ---- Step 1: Place selection ----
bot.hears(PLACES.GYM, async (ctx) => {
  (ctx as any).session.place = PLACES.GYM;
  (ctx as any).session.role = undefined;
  await ctx.reply('Please select your role:', gymRoleKeyboard());
});

bot.hears(PLACES.NURSERY, async (ctx) => {
  (ctx as any).session.place = PLACES.NURSERY;
  (ctx as any).session.role = undefined;
  await ctx.reply('Please select your role:', nurseryRoleKeyboard());
});

// ---- Step 2: Role selection (shared "Admin" label works for both places,
// since we already know ctx.session.place by this point) ----
bot.hears(GYM_ROLES.ADMIN, async (ctx) => {
  const session = (ctx as any).session;
  if (!session.place) return; // ignore stray taps before a place is chosen
  session.role = GYM_ROLES.ADMIN;
  await ctx.reply('✅ You are set up. Here is your menu:', operationalMenuKeyboard(session.place, session.role));
});

bot.hears(GYM_ROLES.MENTORS, async (ctx) => {
  const session = (ctx as any).session;
  if (session.place !== PLACES.GYM) return;
  session.role = GYM_ROLES.MENTORS;
  await ctx.reply('✅ You are set up. Here is your menu:', operationalMenuKeyboard(session.place, session.role));
});

bot.hears(GYM_ROLES.COACHES, async (ctx) => {
  const session = (ctx as any).session;
  if (session.place !== PLACES.GYM) return;
  session.role = GYM_ROLES.COACHES;
  await ctx.reply('✅ You are set up. Here is your menu:', operationalMenuKeyboard(session.place, session.role));
});

bot.hears(NURSERY_ROLES.TEACHERS, async (ctx) => {
  const session = (ctx as any).session;
  if (session.place !== PLACES.NURSERY) return;
  session.role = NURSERY_ROLES.TEACHERS;
  await ctx.reply('✅ You are set up. Here is your menu:', operationalMenuKeyboard(session.place, session.role));
});

// ---- Step 3: Kids GYM operational menu -> enter scenes ----
bot.hears(MENU.PARENT, (ctx) => ctx.scene.enter('parent-entry'));
bot.hears(MENU.NANNY, (ctx) => ctx.scene.enter('nanny-entry'));
bot.hears(MENU.ILLNESS, (ctx) => ctx.scene.enter('illness'));
bot.hears(MENU.BIRTHDAY, (ctx) => ctx.scene.enter('birthday'));
bot.hears(MENU.POLICIES, (ctx) => ctx.scene.enter('policies'));

// ---- Kids First (Nursery) operational menu ----
bot.hears(MENU.TOUR, (ctx) => ctx.scene.enter('tour'));

bot.hears(TEACHER_MENU.PROGRAM, (ctx) => ctx.reply(teacherDutyText[TEACHER_MENU.PROGRAM]));
bot.hears(TEACHER_MENU.ACTIVITIES, (ctx) => ctx.reply(teacherDutyText[TEACHER_MENU.ACTIVITIES]));
bot.hears(TEACHER_MENU.OPERATIONS, (ctx) => ctx.reply(teacherDutyText[TEACHER_MENU.OPERATIONS]));

// ---- Fallback for anything typed outside of a scene/menu flow ----
bot.on('text', async (ctx) => {
  const session = (ctx as any).session;
  if (session?.place && session?.role) {
    await ctx.reply('Please choose an option from the menu below.', operationalMenuKeyboard(session.place, session.role));
  } else {
    await ctx.reply('Please type /start to begin.', placeKeyboard());
  }
});

bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
});
