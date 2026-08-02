# Bug Fix Skill

Fix a bug with minimal changes and full verification. Do NOT make any changes beyond the specific bug described.

## Process

1. **Read the relevant files first.** Understand the current code before touching anything.
2. **Identify the root cause.** State it clearly to the user in 1-2 sentences before implementing.
3. **Implement the MINIMAL fix.** Change only what is necessary to fix the bug. Do NOT:
   - Refactor surrounding code
   - Add comments or docstrings to unchanged code
   - Change styling or structure unrelated to the bug
   - "Improve" anything that wasn't asked about
4. **Run `npm run build`** to verify no type errors were introduced. If the build fails, fix it before continuing.
5. **Take a Playwright screenshot** of the affected page to verify the fix visually. If the dev server is running, navigate to the relevant URL and screenshot. If the fix doesn't look right, iterate — do not report success until it actually works.
6. **Report what was changed.** List only the files and lines modified. No suggestions for further improvements unless explicitly asked.

## Constraints

- If Tailwind CSS classes don't fix a layout/z-index/positioning issue on the first attempt, try inline styles as a fallback.
- Always check parent element `overflow` and stacking context when debugging z-index or sticky/fixed positioning.
- Never report a fix as complete until both the build passes AND the screenshot confirms the visual result.
