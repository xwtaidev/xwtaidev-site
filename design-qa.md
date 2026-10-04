# Homepage visual QA

final result: passed

Latest validation: Next.js migration and the user's centering, spacing, Gmail, inverse-tooltip and xwt refinements. See the latest section below for current evidence.

## Target and evidence

- Target: an original English, narrative-first homepage for a developer and independent maker, using Sanyam's measured desktop typography and scale. The user approved reducing the title, using a roughly 540px reading column, and implementing an HTML prototype.
- Source visual truth: `artifacts/reference-sanyam.jpg`, captured from https://sanyam.sh/ at 1280 × 720.
- Implementation: http://127.0.0.1:4173/.
- Final desktop screenshot: `artifacts/preview-desktop.jpg`, 1280 × 720.
- Mobile screenshot: `artifacts/preview-mobile.jpg`, 390 × 844.
- Dark screenshot: `artifacts/preview-dark.jpg`, 1280 × 720.
- Combined comparison: `artifacts/comparison.jpg`, rendered from `artifacts/comparison.html` at 1280 × 720. Includes both full views and original-pixel-scale crops of the reading area.
- State: homepage, dialog closed, light theme. Source and implementation captures use identical CSS viewport and pixel dimensions; no density resizing was needed.

## Fidelity surfaces

1. Fonts and typography: system sans-serif, 400 weight, 14.4px text and 23.04px line height on desktop. Mobile uses 15px and 25.5px line height. There is no oversized visible heading. Focused comparison confirms the intended text scale and first-paragraph hierarchy.
2. Spacing and layout: 540px reading column, 40px identity image, 40px gap before the introduction, 38px paragraph gaps, and a quiet footer divider. Source column is about 538px; the 2px difference is intentional. Different paragraph heights follow the original English sample copy rather than reproducing someone else's biography.
3. Colors: white background, charcoal introduction, #6b6b6b secondary copy, restrained green links, subtle neutral inline link surfaces. Dark theme uses independent foreground and background tokens. No gradients, large cards, or marketing hero.
4. Image quality: the user's supplied portrait is now shown as a 40px circular avatar using CSS object-fit. The JPEG was copied byte-for-byte and is not inverted in dark mode. The small signature remains the generated raster asset. Interface icons preserve published Phosphor SVG geometry, with colored icons rendered through CSS masks; license is saved in `assets/icons/LICENSE`. All page images load successfully.
5. Content: English throughout, developer / independent maker identity preserved. Name, product descriptions, and email remain illustrative concept content. The GitHub link opens the platform homepage until the user's profile is supplied. These are expected prototype data limitations rather than production claims.

## Interaction and responsive checks

- Readleaf, Draft, Notes, Lab, and contact links open the corresponding details.
- Dialog close button, return action, and Escape close the surface. Native dialog behavior contains focus and restores it to the trigger.
- Keyboard Tab shows a visible focus indicator and the identity tooltip.
- Theme toggles between light and dark; the selected theme persists after reload. Returned to light for final preview.
- 390px and 320px viewport checks show no horizontal overflow after the fix. Content and footer remain within the reading column. Project dialog also fits 390px.
- All rendered images report complete with nonzero natural dimensions.
- Browser console log check: no errors.
- JavaScript syntax check: `node --check app.js` exited 0.
- Reduced-motion guards are present; transitions use opacity and transform. OS-level reduced-motion emulation was not available in the browser checks.

## Comparison history

### Initial pass

- [P2, fixed] At 390px, offscreen invisible tooltip boxes extended the document width to 415px. Cause confirmed by DOM bounds for `#theme-hint` and `#draft-hint`; opacity alone did not remove their layout bounds.
- Fix: disable nonessential visual tooltips at widths up to 600px rather than clipping the entire page. Inline links and detail dialogs remain functional.
- Post-fix evidence: 390px viewport / 390px document width; 320px viewport / 305px document width with vertical scrollbar. Updated mobile screenshot has no horizontal scrollbar.
- [P3, fixed] The initial contact invitation ended with a single-word orphan on desktop. Shortened the sentence and kept the final inline link together.

### Final pass

- Full-view and focused side-by-side comparison accepted: reading scale, alignment, neutral palette, small link treatments and footer hierarchy match the approved direction.
- No remaining actionable P0/P1/P2 issues.

## Follow-up polish

- Replace the illustrative products, email and generic GitHub destination with the user's real content when moving from design prototype to the Next.js site. The user's real avatar is already in place.
- The generated raster assets are intentionally retained at source resolution for this prototype; production asset optimization can happen during that move.

## Avatar and color refinement

- User-approved source layout: `artifacts/preview-before-avatar-color.jpg` (1541 × 1228), captured from the existing user preview before this edit.
- Updated implementation: `artifacts/preview-avatar-color.jpg` (1541 × 1228), light theme, no open dialog or tooltip.
- Combined full-view and original-scale detail comparisons: `artifacts/comparison-avatar-full.jpg` and `artifacts/comparison-avatar-detail.jpg`, rendered from `artifacts/avatar-color-comparison.html`. Source and implementation have identical viewport and pixel dimensions; crop offsets are equal. No image-density normalization was needed.
- Portrait source: the user's attached JPEG, saved as `assets/avatar.jpg`; a byte comparison against the supplied file exited 0. Circular framing is only a presentation style. No photo generation, recoloring or destructive editing was performed.
- Color details: sage Readleaf icon and wash, warm clay Draft icon and wash, lavender Lab icon and wash, muted blue Notes link, warm email icon and sun, cool blue moon. Page surface, paragraph hierarchy, signature and GitHub icon remain neutral.
- Typography and layout remain 14.4px / 23.04px, 540px reading width, 38px paragraph gaps, and 40px avatar size on desktop. Side-by-side inspection confirms unchanged text wrapping and footer position.
- Verified light and dark icon colors and masks. Avatar filter is `none` in both themes, with successful image loading. Project details still open and return correctly; theme button still switches and updates its accessible label.
- Updated mobile capture: `artifacts/preview-avatar-mobile.jpg` at 390 × 844; 15px text, 40px avatar, no horizontal overflow.
- Dark capture: `artifacts/preview-avatar-dark.jpg` at 1541 × 1228.
- Browser console: no errors.
- No actionable P0/P1/P2 findings in this refinement. Final preview restored to light theme and the user's original viewport.

## Next.js migration and latest refinements

- Current runtime: Next.js 16.3.8, React 19.3.0, TypeScript 5.9.3 and Tailwind CSS 4.3.3. The original HTML/CSS/JS implementation is retained under `prototype/`; current code lives under `src/`, and served assets under `public/assets/`.
- Approved visual source: `artifacts/reference-pre-next.jpg`, captured from the archived approved HTML prototype at 1280 × 720. Current implementation: `artifacts/preview-next-desktop.jpg`, also 1280 × 720, same renderer, light theme and closed dialog. No pixel-density scaling was needed.
- Combined full-view and focused comparison: `artifacts/comparison-next.jpg`, rendered from `artifacts/next-comparison.html`. The focused reading areas are aligned by their first paragraph, since the vertical positioning intentionally changed.
- Authorized visual changes: center the complete content block both horizontally and vertically while leaving prose left aligned; reduce avatar gap from 40px to 32px on desktop, 34px to 28px on mobile; replace the email symbol with the current Gmail SVG; invert tooltip backgrounds by theme; replace the signature with lowercase handwritten `xwt`.
- Gmail SVG is copied from the asset observed on Google's current Gmail product page: https://www.gstatic.com/images/branding/productlogos/gmail_2026/v2/web/192px.svg. The brand colors are retained in both themes. Signature asset: `public/assets/signature-xwt.png`.
- Typography comparison accepted: desktop 14.4px / 23.04px, 400 weight, 540px reading width, existing paragraph rhythm and color tokens. English content and portrait remain intact. Custom motion and palette rules retain the approved design; Tailwind provides the baseline and layout utilities.
- Centering is measured from the avatar header through the footer: 360px center in a 720px desktop viewport and 422px center in an 844px mobile viewport. Tall narrow layouts use normal document scrolling rather than negative-position centering.
- Mobile evidence: `artifacts/preview-next-mobile.jpg` at 390 × 844, 15px body copy and no horizontal overflow. Additional checks at 320 × 740 keep the avatar at a positive 40px top position and allow normal vertical scrolling.
- Tooltip colors verified: light page uses #252a27 background / #f5f7f4 text; dark page uses #f5f7f4 background / #252a27 text. Keyboard focus shows the tooltip and focus indicator.
- React details open and return correctly. Native dialog keyboard behavior and focus restoration are retained. Theme switching and saved-dark reload were verified without hydration errors. The portrait is never inverted; optimized avatar/signature and Gmail assets load successfully.
- Server/client boundaries: pages and layout are server components; detail triggers, dialog state and theme store are small client components. Editable profile and detail content are centralized in `src/content/site.ts`.

### Review findings and fixes

- [P2, fixed] Tailwind Preflight reset anchor underlines. `.text-link` and `.dialog-copy a` now explicitly declare `text-decoration-line: underline`; browser styles and focused comparison confirm the restored affordance.
- [P2, fixed] Next's beforeInteractive script queue could delay saved-theme initialization. Replaced it with a native inline head script. Built HTML confirms `#theme-bootstrap` precedes `<body>`; browser reload retained dark theme correctly.
- [P2, fixed] At 601px, the rightmost centered tooltip increased document width to 613px. `Tooltip` now supports end alignment, used by `ThemeButton`. After the fix, viewport/document both measure 601px and the tooltip's right edge is 570.5px. No global overflow clipping was introduced.
- Independent read-only code re-review reports no remaining actionable P0/P1/P2 findings.

### Final checks

- `npm run lint`: exit 0, no warnings.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0; homepage statically prerendered.
- Native early-theme script confirmed in production HTML.
- Browser console: no errors or hydration failures.
- Verified Next.js preview is running at the original address, http://127.0.0.1:4173/. Temporary comparison server is removed after inspection.
- At this migration checkpoint, the products, biography, email and GitHub destination were still illustrative. They are replaced by the real-content refinement below.

## Real content and footer alignment

- Profile source: https://github.com/xwtaidev/xwtaidev and the public READMEs for `obsidian-lattice-plugin`, `obsidian-weekly-schedule-plugin`, `FileSniffer-Releases` and `TokenPulse`. Homepage copy now reflects an independent maker building AI tools, Obsidian plugins and productivity apps. Lattice Board is labeled a prototype; VibeSpace is explicitly in development and not yet public.
- Real destinations: https://github.com/xwtaidev and `mailto:xwtaidev@gmail.com`. Both footer and prose use the same addresses. Project dialogs include the actual Lattice Board and Weekly Schedule repository links.
- Removed the illustrative Readleaf, Draft and sample notes content. Public handle `xwtaidev` is used for the introduction and metadata; the handwritten signature remains `xwt`.
- [P3, fixed] The absolutely positioned theme icons caused the theme button's vertical center to sit about 3px above GitHub and Gmail. Footer wrappers now use flex/grid alignment, and all three icons use 16px boxes. Measured desktop centers are identical at 834.6875px; mobile centers are identical at 686.5px.
- Theme sun and moon now use the main text color: black in light mode and white in dark mode. Gmail retains its brand colors; the project chips retain subtle sage, clay and lavender accents.
- Evidence: `artifacts/preview-real-content.jpg` (1529 × 1228) and `artifacts/preview-real-content-mobile.jpg` (390 × 844). Mobile has no horizontal overflow. Lattice Board, Weekly Schedule and VibeSpace details open and return correctly.
- `npm run typecheck`, `npm run lint` and `npm run build` all exit 0. Browser console has no errors; development Fast Refresh emitted only the expected full-reload notices while editing shared content. Final preview is light, with the temporary mobile viewport override reset.

## X and official Obsidian links

- Added `https://x.com/xwtaidev` to the footer with the published Phosphor X logo, matching the existing 16px monochrome social icons. The address matches the user's supplied URL and public GitHub profile README.
- Verified both plugins in the official community catalog and live plugin pages: https://community.obsidian.md/plugins/lattice-board and https://community.obsidian.md/plugins/weekly-schedule. The old `obsidian.md/plugins?id=...` links redirect to these pages.
- Both project dialogs now show the official plugin page first (`Get it for Obsidian`) and the source repository second (`Source on GitHub`). The official page provides the visitor-controlled Add to Obsidian action. No app installation was performed.
- The Lattice tooltip and eyebrow now identify an Obsidian plugin instead of the earlier prototype label. Copy continues to describe its Bases implementation without claiming maturity or a stable release.
- Desktop footer controls share a vertical center of 834.6875px; 390px mobile controls share a center of 686.5px. Mobile document width is 390px; the 350px dialog and wrapping link row fit within the viewport.
- Evidence: `artifacts/preview-x-desktop.jpg`, `artifacts/preview-x-mobile.jpg`, `artifacts/preview-obsidian-links.jpg`, `artifacts/preview-obsidian-links-mobile.jpg` and `artifacts/preview-obsidian-links-dark.jpg`. Both themes and both project dialogs were inspected. Temporary responsive overrides were reset, and the original dark theme was restored.
- Typecheck, lint and production build all exited 0. Browser console error list is empty.

## Dialog controls and destination icons

- Removed the redundant Back to the homepage control from all details. The accessible top-right Close details button remains; clicking it closes the dialog and restores focus to its trigger. Escape was also verified.
- Kept descriptive action labels and added a corresponding 16px destination icon to each external link. Obsidian uses the unchanged SVG from https://obsidian.md/images/obsidian-logo-gradient.svg; GitHub uses the existing Phosphor icon. The small external-link arrows remain.
- Both plugin dialogs and the About GitHub link use typed icon metadata in `src/content/site.ts`. Obsidian brand colors are preserved in light and dark themes.
- Verified desktop inline links and mobile wrapping. At 390px, document width is 390px, dialog width is 350px, and both links fit individually without overflow.
- Evidence: `artifacts/preview-dialog-brand-icons.jpg`, `artifacts/preview-dialog-brand-icons-mobile.jpg` and `artifacts/preview-dialog-brand-icons-dark.jpg`. Typecheck, lint and production build exited 0; browser console has no errors. Original light theme and desktop viewport were restored after checking.

## Name rainbow entrance

- The introduction's `xwtaidev` now reveals through a five-color band moving left to right. It starts after 230ms, runs once for 1200ms, and leaves the name in the current theme's strong text color.
- Implemented with CSS text clipping and background-position animation; no new client component, JavaScript or dependency. A 300%-wide background makes the rainbow band 34% of the word's width. The solid region follows it while the leading region remains transparent.
- Verified 17 desktop frames from 92% to 25% background position. The name's bounding box remains exactly identical across every frame. Recorded preview: `artifacts/preview-name-reveal.gif`; only this preview recording loops, while the website animation runs once.
- Switching to dark theme changes the final solid color to rgb(231, 236, 232) and retains the finished 25% position. Opening and closing a project dialog also retains 25%, confirming no replay.
- Verified the full dark-theme entrance at 390px. The document and viewport both remain 390px wide. Raw light and dark mobile screenshots are under `artifacts/name-reveal-frames/`.
- Reduced-motion CSS disables the animation and gradient, restoring ordinary text and text fill. Text clipping is guarded by feature support. OS-level reduced-motion emulation is not exposed by the browser tools, so this guard was inspected in source rather than changing the user's OS settings.
- Typecheck, lint and production build exited 0. Browser console error list is empty. Temporary viewport and theme changes were restored.

## Synchronized link underlines

- GitHub and say hello keep visible text while their 1px underlines grow from left to right. The name and both lines share the 230ms delay, 1200ms duration and cubic-bezier easing, and each runs once.
- Lines use absolutely positioned pseudo-elements and transform scaling, preserving the existing link bounds and paragraph wrapping. Original blue/green colors, 46% resting opacity and hover emphasis are retained.
- Captured 19 frames. The two underline scales match in every sample; their progress differs from the normalized name progress by less than 0.000001. Link bounds remain identical across all frames.
- Recording: `artifacts/preview-synced-underlines.gif` (the recording loops for inspection). Both lines remain fully drawn when switching themes. At 390px, document and viewport widths are equal; evidence is `artifacts/preview-synced-underlines-mobile-dark.jpg`.
- Reduced-motion styling disables the entrance and leaves complete underlines visible. Typecheck, lint and production build exited 0; browser console has no errors. Original theme and viewport were restored.

## Product background entrance

- The three product chips now reveal their sage, clay and lavender backgrounds from left to right. Text and icons remain visible throughout. Name, backgrounds and underlines share the same entry duration, delay and easing via `--intro-reveal-*` tokens.
- Backgrounds use isolated pseudo-elements behind the chip contents and transform scaling. Pointer events pass through to the existing detail links; hover colors and inset emphasis remain on the background layer. Reduced-motion styling immediately shows complete backgrounds.
- Captured 18 frames. All three background scales match both underline scales in every sample; progress differs from normalized name progress by less than 0.000001. Chip bounds remain constant, with opacity 1 throughout.
- Evidence: `artifacts/preview-product-background-reveal.gif` (looping recording) and `artifacts/preview-product-background-mobile-dark.jpg`. Opening and closing Lattice Board details works; switching themes retains completed backgrounds. All three chips fit the 390px mobile viewport, with no horizontal overflow.
- Lint and production build exited 0. Browser console has no errors. Original light theme and desktop viewport were restored.
