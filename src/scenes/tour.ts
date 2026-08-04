import { Scenes } from 'telegraf';
import { checkCancel, yesNoKeyboard, cancelKeyboard, isYes, isNo, operationalMenuKeyboard } from '../utils';

export const tourScene = new Scenes.WizardScene<Scenes.WizardContext>(
  'tour',

  // Step 0: welcome + admission inquiry (name & phone)
  async (ctx) => {
    (ctx.wizard.state as any).data = {};
    await ctx.reply(
      "🏫 Nursery Tour & Admission Inquiry\n\nWelcome! Let's get started.\n" +
        "Please send your name and phone number (e.g. 'Sara Ahmed, 010xxxxxxxx')."
    );
    return ctx.wizard.next();
  },

  // Step 1: store contact info -> TOUR (facility overview) -> ask to proceed to payment
  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    (ctx.wizard.state as any).data.contactInfo = text;

    await ctx.reply(
      '🏫 Facility overview:\n' +
        '• Menu: Fresh daily meals, allergy-aware kitchen\n' +
        '• Academic program: Play-based early learning curriculum\n' +
        '• Facilities: Indoor & outdoor play areas, nap rooms, art studio'
    );
    await ctx.reply('Shall we proceed with registration?', yesNoKeyboard());
    return ctx.wizard.next();
  },

  // Step 2: process decision -> PAYMENT
  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!isYes(text) && !isNo(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    if (isNo(text)) {
      await ctx.reply(
        'No problem! Our staff will follow up with you when you\'re ready.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }

    await ctx.reply(
      '💳 Fees: Registration fee + monthly tuition. Full breakdown will be sent via WhatsApp.'
    );
    await ctx.reply('Has the registration payment been completed?', yesNoKeyboard());
    return ctx.wizard.next();
  },

  // Step 3: process payment -> NEEDED DOCUMENTS
  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!isYes(text) && !isNo(text)) {
      await ctx.reply('Please tap ✅ Yes or ❌ No.', yesNoKeyboard());
      return;
    }
    if (isNo(text)) {
      await ctx.reply(
        '⚠️ Registration payment is required to reserve a spot. Please complete payment at the front desk, then contact us to continue.',
        operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
      );
      return ctx.scene.leave();
    }
    (ctx.wizard.state as any).data.paymentConfirmed = true;

    await ctx.reply(
      '📄 Required documents:\n' +
        '• Birth certificate copy\n' +
        '• Vaccination record\n' +
        '• 2 passport photos\n\n' +
        '👕 Uniform: Available for purchase at the front desk.'
    );
    await ctx.reply('What entry date would you like for your child?', cancelKeyboard());
    return ctx.wizard.next();
  },

  // Step 4: store ENTRY DATE -> final summary
  async (ctx) => {
    if (await checkCancel(ctx)) return;
    const text = (ctx.message as any)?.text;
    if (!text) return;
    const d = (ctx.wizard.state as any).data;
    d.entryDate = text;

    await ctx.reply(
      `✅ Admission inquiry complete!\n\n` +
        `• Contact: ${d.contactInfo}\n` +
        `• Payment: Confirmed\n` +
        `• Entry date: ${d.entryDate}\n\n` +
        `Thank you! We look forward to welcoming your child. 🎉`,
      operationalMenuKeyboard((ctx as any).session?.place, (ctx as any).session?.role)
    );
    return ctx.scene.leave();
  }
);
