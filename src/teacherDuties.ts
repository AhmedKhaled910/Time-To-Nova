// Content shown to Kids First (Nursery) staff when they tap a Teacher-duty
// menu button. Replace the placeholder text below with your real content
// whenever you're ready — the structure/menu wiring won't need to change.

import { TEACHER_MENU } from './utils';

export const teacherDutyText: Record<string, string> = {
  [TEACHER_MENU.PROGRAM]:
    '📚 Program of the Subjects:\n' +
    '(Add your curriculum/subject breakdown here — e.g. Literacy, Numeracy, ' +
    'Motor Skills, Arts & Crafts — with weekly or termly structure.)',
  [TEACHER_MENU.ACTIVITIES]:
    '🎨 Activities:\n' +
    '(Add your daily/weekly activity schedule here — e.g. circle time, ' +
    'outdoor play, story time, nap schedule.)',
  [TEACHER_MENU.OPERATIONS]:
    '⚙️ Operations:\n' +
    '(Add operational duties here — e.g. attendance logging, incident ' +
    'reporting steps, opening/closing checklist, supply requests.)',
};
