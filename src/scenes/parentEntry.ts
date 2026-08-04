import { Scenes } from 'telegraf';
import {
  checkCancel,
  yesNoKeyboard,
  cancelKeyboard,
  customKeyboard,
  isYes,
  isNo,
  operationalMenuKeyboard,
} from '../utils';

const durationKeyboard = () =>
  customKeyboard([['1 hour', '2 hours'], ['3 hours', 'Custom']]);

export const parentEntryScene = new Scenes.WizardScene<Scenes.WizardContext>(
  'parent-entry',

  async (ctx) => {
    (ctx.wizard.state as any).data = {};
    await ctx.reply(
      '👨‍👧 Parent & Child Entry\n\nDo you have a completed application form on file for this child?',
      yesNoKeyboard()
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (isNo(text)) {
      await ctx.reply(
        '⚠️ Entry cannot proceed without a completed application form. Please fill it out at the front desk first.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }
    if (!isYes(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    await ctx.reply('Do you consent to restroom assistance if needed during the visit?', yesNoKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!isYes(text) && !isNo(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    (ctx.wizard.state as any).data.restroomConsent = isYes(text);
    await ctx.reply('🚻 Reminder: please take your child to the restroom before their session begins.');
    await ctx.reply("What is the child's age? (please type a number)", cancelKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    const age = parseInt(text, 10);
    if (isNaN(age) || age < 0 || age > 18) {
      await ctx.reply('Please enter a valid age as a number (e.g. 4).', cancelKeyboard());
      return;
    }
    (ctx.wizard.state as any).data.childAge = age;

    if (age < 5) {
      (ctx.wizard.state as any).data.needsCaregiverCheck = true;
      await ctx.reply(
        'Since the child is under 5, a caregiver must remain on-site for the full visit.\nWill a caregiver be staying?',
        yesNoKeyboard()
      );
      return ctx.wizard.next();
    } else {
      (ctx.wizard.state as any).data.needsCaregiverCheck = false;
      await ctx.reply('✅ Independent entry approved (age 5+).');
      await ctx.reply('How long will the child be staying?', durationKeyboard());
      return ctx.wizard.selectStep(ctx.wizard.cursor + 2);
    }
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (isNo(text)) {
      await ctx.reply(
        '⚠️ Entry cannot proceed. Children under 5 require an on-site caregiver.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }
    if (!isYes(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    (ctx.wizard.state as any).data.caregiverPresent = true;
    await ctx.reply('How long will the child be staying?', durationKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.stayDuration = text;
    await ctx.reply('Has full advance payment for this stay been made?', yesNoKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (isNo(text)) {
      await ctx.reply(
        '⚠️ Full advance payment is required before entry. Please complete payment at the front desk.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }
    if (!isYes(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    (ctx.wizard.state as any).data.paymentConfirmed = true;
    await ctx.reply('Would you like the option to extend playtime later if needed?', yesNoKeyboard());
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
    d.extensionOption = isYes(text);

    await ctx.reply(
      `✅ Check-in complete!\n\n` +
        `• Child age: ${d.childAge}\n` +
        `• Caregiver on-site: ${d.needsCaregiverCheck ? 'Yes' : 'N/A (independent entry)'}\n` +
        `• Stay duration: ${d.stayDuration}\n` +
        `• Payment: Confirmed\n` +
        `• Extension option: ${d.extensionOption ? 'Yes' : 'No'}\n\n` +
        `Enjoy your visit! 🎉`,
      operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
    );
    return ctx.scene.leave();
  }
);
