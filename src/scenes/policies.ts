import { Scenes } from 'telegraf';
import { customKeyboard, operationalMenuKeyboard, CANCEL_TEXT } from '../utils';

const TOPICS = {
  PAYMENT: '💳 Payment/Late Pick-up',
  HYGIENE: '🧼 Hygiene/Sickness',
  ALLERGY: '🍽️ Allergies/Medical',
  PICKUP: '🪪 Pick-up Verification',
  INCIDENT: '📝 Incident Reporting',
  EMERGENCY: '🚨 Emergency Protocols',
};

const topicText: Record<string, string> = {
  [TOPICS.PAYMENT]:
    '💳 Payment/Late Pick-up Policy:\nFull advance payment is required before entry. Late pick-up beyond ' +
    'the reserved time incurs an additional hourly fee, charged per 15-minute block.',
  [TOPICS.HYGIENE]:
    '🧼 Hygiene/Sickness Policy:\nChildren showing signs of contagious illness (fever, vomiting, rash) will ' +
    'not be admitted. Please keep your child home for 24 hours after symptoms resolve.',
  [TOPICS.ALLERGY]:
    '🍽️ Allergies/Medical Policy:\nAll allergies and medical conditions must be declared on the application ' +
    'form. Please notify staff of any medication your child may need during their visit.',
  [TOPICS.PICKUP]:
    '🪪 Pick-up Verification Policy:\nOnly individuals listed on the application form or explicitly authorized ' +
    'via written parental consent may pick up a child. Valid ID is required at pick-up.',
  [TOPICS.INCIDENT]:
    '📝 Incident Reporting Policy:\nAny injury, illness, or behavioral incident is documented in an incident ' +
    'report and shared with the parent/guardian on the same day.',
  [TOPICS.EMERGENCY]:
    '🚨 Emergency Protocols:\n' +
    '• Child injury: First aid administered immediately; parent notified.\n' +
    '• Medical emergency: 911/ambulance called; parent notified immediately.\n' +
    '• Fire: Facility evacuation per posted fire exit plan.\n' +
    '• Missing child: Immediate facility lockdown and search; parent & authorities notified.\n' +
    '• Security threat: Facility lockdown; authorities contacted.',
};

export const policiesScene = new Scenes.BaseScene<Scenes.SceneContext>('policies');

policiesScene.enter(async (ctx) => {
  await ctx.reply(
    '📋 Policies & Emergencies\n\nSelect a topic to learn more:',
    customKeyboard([
      [TOPICS.PAYMENT, TOPICS.HYGIENE],
      [TOPICS.ALLERGY, TOPICS.PICKUP],
      [TOPICS.INCIDENT, TOPICS.EMERGENCY],
    ])
  );
});

Object.values(TOPICS).forEach((label) => {
  policiesScene.hears(label, async (ctx) => {
    await ctx.reply(topicText[label]);
  });
});

policiesScene.hears(CANCEL_TEXT, async (ctx) => {
  const session = (ctx as any).session;
  await ctx.reply('Returning to menu.', operationalMenuKeyboard(session?.place, session?.role));
  return ctx.scene.leave();
});

policiesScene.on('text', async (ctx) => {
  await ctx.reply('Please tap one of the topic buttons below, or "🏠 Main Menu" to go back.');
});
