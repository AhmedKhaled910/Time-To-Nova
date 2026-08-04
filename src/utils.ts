import { Markup, Scenes } from 'telegraf';

// ---- Places ----
export const PLACES = {
  GYM: '🏋️ Kids GYM (Playing Area)',
  NURSERY: '🎓 Kids First (Nursery)',
};

// ---- Roles ----
export const GYM_ROLES = {
  ADMIN: 'Admin',
  MENTORS: 'Mentors',
  COACHES: 'Coaches',
};

export const NURSERY_ROLES = {
  ADMIN: 'Admin',
  TEACHERS: 'Teachers',
};

// ---- Kids GYM operational menu buttons ----
export const MENU = {
  PARENT: '👨‍👧 Parent & Child Entry',
  NANNY: '🚗 Nanny/Driver Entry',
  ILLNESS: '🩹 Child Illness/Injury',
  BIRTHDAY: '🎂 Birthday Party Booking',
  POLICIES: '📋 Policies & Emergencies',
  TOUR: '🏫 Nursery Tour',
};

// ---- Kids First (Nursery) Teacher duties menu buttons ----
export const TEACHER_MENU = {
  PROGRAM: '📚 Program of the Subjects',
  ACTIVITIES: '🎨 Activities',
  OPERATIONS: '⚙️ Operations',
};

export const CANCEL_TEXT = '🏠 Main Menu';

// ---- Keyboards ----
export function placeKeyboard() {
  return Markup.keyboard([[PLACES.GYM], [PLACES.NURSERY]]).resize();
}

export function gymRoleKeyboard() {
  return Markup.keyboard([
    [GYM_ROLES.ADMIN],
    [GYM_ROLES.MENTORS],
    [GYM_ROLES.COACHES],
  ]).resize();
}

export function nurseryRoleKeyboard() {
  return Markup.keyboard([[NURSERY_ROLES.ADMIN], [NURSERY_ROLES.TEACHERS]]).resize();
}

export function yesNoKeyboard() {
  return Markup.keyboard([['✅ Yes', '❌ No'], [CANCEL_TEXT]]).resize().oneTime();
}

export function cancelKeyboard() {
  return Markup.keyboard([[CANCEL_TEXT]]).resize().oneTime();
}

export function customKeyboard(rows: string[][]) {
  return Markup.keyboard([...rows, [CANCEL_TEXT]]).resize().oneTime();
}

// Builds the correct operational menu based on the person's Place + Role.
// Falls back to the place-selection keyboard if session data is missing
// (e.g. session expired or the process restarted).
export function operationalMenuKeyboard(place?: string, role?: string) {
  if (place === PLACES.GYM) {
    return Markup.keyboard([
      [MENU.PARENT, MENU.NANNY],
      [MENU.ILLNESS, MENU.BIRTHDAY],
      [MENU.POLICIES],
    ]).resize();
  }

  if (place === PLACES.NURSERY) {
    if (role === NURSERY_ROLES.TEACHERS) {
      return Markup.keyboard([
        [TEACHER_MENU.PROGRAM, TEACHER_MENU.ACTIVITIES],
        [TEACHER_MENU.OPERATIONS],
      ]).resize();
    }
    // Nursery Admin sees the Tour flow plus oversight of Teacher duties
    return Markup.keyboard([
      [MENU.TOUR],
      [TEACHER_MENU.PROGRAM, TEACHER_MENU.ACTIVITIES],
      [TEACHER_MENU.OPERATIONS],
    ]).resize();
  }

  // No place/role selected yet (e.g. brand new session) -> send them to /start
  return placeKeyboard();
}

// ---- Answer parsing helpers ----
export function isYes(text?: string) {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  return t.startsWith('✅') || t === 'yes' || t === 'y';
}

export function isNo(text?: string) {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  return t.startsWith('❌') || t === 'no' || t === 'n';
}

// ---- Universal "Main Menu" escape hatch ----
// Call this at the top of every wizard step. If it returns true,
// the step function should `return` immediately (scene already left).
// Returns the person to THEIR role menu (not a generic one).
export async function checkCancel(ctx: Scenes.WizardContext): Promise<boolean> {
  const text = (ctx.message as any)?.text;
  if (text === CANCEL_TEXT) {
    const session = (ctx as any).session;
    await ctx.reply('Returning to menu.', operationalMenuKeyboard(session?.place, session?.role));
    await ctx.scene.leave();
    return true;
  }
  return false;
}
