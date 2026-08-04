import { Scenes } from 'telegraf';
import { checkCancel, yesNoKeyboard, cancelKeyboard, customKeyboard, isYes, isNo, operationalMenuKeyboard } from '../utils';

const injuryKeyboard = () =>
  customKeyboard([['Broken arm/leg', 'Cast'], ['Bruise/Scrape', 'Other']]);

export const illnessScene = new Scenes.WizardScene<Scenes.WizardContext>(
  'illness',

  async (ctx) => {
    (ctx.wizard.state as any).data = {};
    await ctx.reply(
      '🩹 Child Illness or Injury\n\nPlease select the type of injury/condition observed:',
      injuryKeyboard()
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.injuryType = text;

    if (text === 'Other') {
      await ctx.reply('Please briefly describe the injury/condition.', cancelKeyboard());
      return ctx.wizard.next();
    }

    (ctx.wizard.state as any).data.injuryDescription = text;
    await ctx.reply(
      '⚠️ Please note: activities will be restricted for this child based on the observed condition ' +
        '(e.g. no climbing, running, or rough play).'
    );
    await ctx.reply(
      'Has the parent signed the full responsibility & consent form for attendance with this condition?',
      yesNoKeyboard()
    );
    return ctx.wizard.selectStep(ctx.wizard.cursor + 2);
  },

  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.injuryDescription = text;
    await ctx.reply(
      '⚠️ Please note: activities will be restricted for this child based on the observed condition ' +
        '(e.g. no climbing, running, or rough play).'
    );
    await ctx.reply(
      'Has the parent signed the full responsibility & consent form for attendance with this condition?',
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
    d.consentSigned = isYes(text);

    if (!d.consentSigned) {
      await ctx.reply(
        '🚫 Entry DENIED. A signed responsibility & consent form is required before this child can attend.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }

    await ctx.reply(
      'ℹ️ Note: staff reserves the right to refuse entry at any time if the child\'s safety would be at risk.'
    );
    await ctx.reply(
      `✅ Entry APPROVED with restrictions.\n\n` +
        `• Condition: ${d.injuryType}${d.injuryDescription && d.injuryDescription !== d.injuryType ? ' - ' + d.injuryDescription : ''}\n` +
        `• Consent form: Signed\n` +
        `• Activity restrictions: In effect\n\n` +
        `Please proceed to the front desk.`,
      operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
    );
    return ctx.scene.leave();
  }
);
