// French interface text, keyed by the English. Keep keys exactly as written in the code.
// Split by area; a key may appear in more than one file only with the same French.
import app from './fr/app.js'
import landing from './fr/landing.js'
import pages from './fr/pages.js'
import design from './fr/design.js'
import settings from './fr/settings.js'
import legal from './fr/legal.js'
import auth from './fr/auth.js'
import modals from './fr/modals.js'
import editor from './fr/editor.js'
import steps from './fr/steps.js'
import review from './fr/review.js'
import server, { patterns } from './fr/server.js'

export const PARTS = { app, landing, pages, design, settings, legal, auth, modals, editor, steps, review, server }
export default Object.assign({}, ...Object.values(PARTS))
export const PATTERNS = patterns
