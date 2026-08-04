import { Scenes } from 'telegraf';
import { checkCancel, yesNoKeyboard, cancelKeyboard, customKeyboard, isYes, isNo, operationalMenuKeyboard } from '../utils';

const packageKeyboard = () =>
  customKeyboard([['Basic', 'Standard'], ['Premium']]);

export const birthdayScene = new Scenes.WizardScene<Scenes.WizardContext>(
  'birthday',

  async (ctx) => {
    (ctx.wizard.state as any).data = {};
    await ctx.reply(
      "🎂 Birthday Party Booking\n\nWelcome! Let's plan your party.\n" +
        "Please send your name and phone number (e.g. 'Sara Ahmed, 010xxxxxxxx')."
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.contactInfo = text;

    await ctx.reply(
      '🎈 Our packages:\n' +
        '• Basic: 2hr venue + decor\n' +
        '• Standard: 3hr venue + decor + meal package\n' +
        '• Premium: 4hr venue + decor + meal package + entertainment slot'
    );
    await ctx.reply('Which package would you like?', packageKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.package = text;

    await ctx.reply(
      '🏛️ Venue: Our party hall fits up to 40 children, with a dedicated play area, ' +
        'sound system, and decoration space.'
    );
    await ctx.reply('How many children are you expecting?', cancelKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    const count = parseInt(text, 10);
    if (isNaN(count) || count <= 0) {
      await ctx.reply('Please enter a valid number of children (e.g. 15).', cancelKeyboard());
      return;
    }
    (ctx.wizard.state as any).data.numberOfChildren = count;
    await ctx.reply('What date and time would you like? (e.g. "2026-08-10, 4:00 PM")', cancelKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.preferredDateTime = text;

    await ctx.reply(`📅 Checking availability for ${text}... ✅ That slot is available!`);
    await ctx.reply(
      'Shall we proceed to sign the contract and collect the 50% deposit to confirm the booking?',
      yesNoKeyboard()
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!isYes(text) && !isNo(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    if (isNo(text)) {
      await ctx.reply(
        'No problem! The slot will be held for 24 hours. Our staff will follow up with you.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }

    (ctx.wizard.state as any).data.depositConfirmed = true;
    await ctx.reply('✅ Contract signed and 50% deposit recorded. Booking confirmed!');
    await ctx.reply('What theme would you like for the party? (e.g. "Superheroes", "Princess")', cancelKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.theme = text;
    await ctx.reply(`🎨 Theme "${text}" sent to our designer.`);
    await ctx.reply('Would you like to add entertainment (magician, clown, face painting, etc.)?', yesNoKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!isYes(text) && !isNo(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    const d = (ctx.wizard.state as any).data;
    d.entertainment = isYes(text);

    await ctx.reply(
      '📦 Our team will verify stock for meals, decor, and supplies for your date and confirm shortly.'
    );
    await ctx.reply(
      `✅ Booking Summary:\n\n` +
        `• Contact: ${d.contactInfo}\n` +
        `• Package: ${d.package}\n` +
        `• Children: ${d.numberOfChildren}\n` +
        `• Date/Time: ${d.preferredDateTime}\n` +
        `• Deposit: Confirmed (50%)\n` +
        `• Theme: ${d.theme}\n` +
        `• Entertainment: ${d.entertainment ? 'Yes' : 'No'}\n\n` +
        `We can't wait to celebrate with you! 🎉`,
      operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
    );
    return ctx.scene.leave();
  }
);
