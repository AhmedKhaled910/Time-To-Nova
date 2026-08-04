import { Scenes } from 'telegraf';
import { checkCancel, yesNoKeyboard, cancelKeyboard, isYes, isNo, operationalMenuKeyboard } from '../utils';

export const nannyEntryScene = new Scenes.WizardScene<Scenes.WizardContext>(
  'nanny-entry',

  async (ctx) => {
    (ctx.wizard.state as any).data = {};
    await ctx.reply(
      '🚗 Nanny/Driver Entry\n\nIs there an existing application form on file for this child?',
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
    (ctx.wizard.state as any).data.hasApp = isYes(text);
    await ctx.reply("Please type the child's full name to verify.", cancelKeyboard());
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.childName = text;
    await ctx.reply('Have you been able to reach the parent to confirm this pick-up/drop-off?', yesNoKeyboard());
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
    d.parentReached = isYes(text);

    if (!d.parentReached && !d.hasApp) {
      await ctx.reply(
        '🚫 Entry DENIED. The parent could not be reached and no application form is on file. ' +
          'Please ask the parent to call the front desk directly to authorize entry.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }

    await ctx.reply(
      'Please confirm: has the parent sent WhatsApp written consent authorizing this attendance/drop-off?',
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
    const d = (ctx.wizard.state as any).data;
    d.whatsappConsent = isYes(text);

    if (!d.whatsappConsent) {
      await ctx.reply(
        '🚫 Entry DENIED. Written WhatsApp consent from the parent is required for nanny/driver drop-off or pick-up.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }

    await ctx.reply(
      `✅ Entry APPROVED for ${d.childName}.\n\n` +
        `• Application on file: ${d.hasApp ? 'Yes' : 'No'}\n` +
        `• Parent reached: ${d.parentReached ? 'Yes' : 'No'}\n` +
        `• WhatsApp consent: Confirmed\n\n` +
        `Please proceed to the front desk.`,
      operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
    );
    return ctx.scene.leave();
  }
);
