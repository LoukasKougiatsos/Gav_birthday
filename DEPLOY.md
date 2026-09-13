# Deploying "Our Corner"

A walkthrough for putting this site live on Vercel, plus a full inventory of
what's real content vs. what you still need to fill in yourself.

## 1. Push the repo to GitHub

```bash
git add -A
git commit -m "Ready for deploy"
git push
```

(If you haven't made a GitHub repo yet: create an empty one on github.com,
then `git remote add origin <url>` and push.)

## 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in (GitHub login is easiest).
2. Import the repository you just pushed.
3. Framework preset: Vercel auto-detects Next.js - leave defaults as-is.
4. Before clicking Deploy, open **Environment Variables** and add the ones below.

## 3. Environment variables

Set these in Vercel's project settings (Settings → Environment Variables), not
in a committed file - `.env.local` never leaves your machine.

| Variable | Required? | What it's for | Where to get it |
|---|---|---|---|
| `SITE_PASSWORD` | Recommended | Whole-site password gate (see below). Leave unset and the site is simply unprotected. | Pick one yourself |
| `THE_DOG_API_KEY` | Optional | Animals section's weekly dachshund photo | [thedogapi.com](https://thedogapi.com/) - free key |
| `PERENUAL_API_KEY` | Optional | Plants section's species search/photo lookup | [perenual.com](https://perenual.com/docs/api) - free key |
| `SPOONACULAR_API_KEY` | Optional | Kitchen's weekly meal plan | [spoonacular.com/food-api](https://spoonacular.com/food-api) - free key |

Every optional key already has a value in your local `.env.local` - copy those
same values into Vercel if you want those features working in production too.
If a key is missing, that section degrades gracefully (Kitchen falls back to
TheMealDB, Animals shows the local dachshund illustration, etc.) rather than
breaking.

## 4. Turn on the password gate

The site works fine with no password set - anyone with the link can open it.
To lock it behind a shared password:

1. Add `SITE_PASSWORD` in Vercel (see table above) with whatever password you want her to type.
2. Redeploy (Vercel → Deployments → ⋯ → Redeploy), since env var changes need a new build.
3. Visiting any page will now redirect to `/login` until the correct password is entered once - it's remembered after that via a cookie.

## 5. Deploy

Click **Deploy**. First build takes a couple of minutes. You'll get a
`*.vercel.app` URL - that's the live site.

This alone already makes the site "always up" in the sense that matters: once
deployed, Vercel serves it continuously from their infrastructure, not from
your laptop - it doesn't depend on your machine being on or a `npm run dev`
terminal staying open. A custom domain (step 6) just replaces the
`*.vercel.app` URL with your own name; it doesn't change the uptime story.

## 6. Get a custom domain

Optional, but this is how you turn `*.vercel.app` into your own name. Three
steps, roughly $10-20/year depending on the name and ending (`.com`, `.gr`,
`.love`, `.site`, etc. all price differently).

**Chosen name: `koritsakimou.com`** - confirmed available on Namecheap at
€9.73/yr (€12.92/yr retail after any first-year promo). Note this puts the
pet name in a public, look-up-able domain record (anyone can see who
registered it via WHOIS unless you add WHOIS privacy - most registrars
include this free) and it'll sit in her browser autocomplete/history - a
deliberate call already made, not re-flagging it further, just noting it
here since it's a one-way door once bought.

1. ~~Pick a name.~~ Done - `koritsakimou.com`, doesn't have to match the
   "Our Corner" title in the code either; `src/app/layout.tsx`'s
   `metadata.title` can change independently whenever you like.
2. **Buy it.** This part has to be you - it's a real purchase with your own
   payment details, which isn't something to hand off. Two reasonable paths:
   - **Buy it directly inside Vercel** (Project → Settings → Domains → Buy
     a domain). Slightly less common name availability than a dedicated
     registrar, but it auto-connects with zero DNS steps - the easiest
     option if the name you want is available there.
   - **Buy it from a registrar** (Cloudflare Registrar is priced at-cost, no
     markup; Namecheap and Porkbun are also fine) if you want more name
     choices or a specific `.gr` registrar. This needs one extra step below.
3. **Point it at the deployment** (skip this if you bought it through Vercel
   directly - that's automatic). In the registrar's DNS settings, either:
   - hand the domain's nameservers to Vercel (Vercel gives you two `ns1./ns2.`
     addresses to paste in), or
   - add the specific `A`/`CNAME` records Vercel's domain page shows you,
     if you'd rather keep the registrar's own nameservers.
   Then in Vercel: Project → Settings → Domains → Add → type the domain →
   follow its verification prompt. HTTPS is issued automatically once it
   verifies (usually a few minutes, occasionally a few hours for DNS to
   propagate).

After that, set `SITE_PASSWORD` (step 4 above) if you haven't - a real
domain name is more likely to get stumbled on than a random `.vercel.app`
one.

---

## Content that still needs your input

Everything below is scaffolding, not fabricated as real. Each item says
exactly where to edit it.

### `src/config/site.ts`
- `anniversaryDate` - currently `null`. Set it to `"YYYY-MM-DD"` to turn on the Us section's days-together counter (it shows a "needs setup" note until you do).
- `homeCoordinates` - set to Argyroupoli's suburb center, not your exact address (that street didn't resolve precisely in OpenStreetMap). Replace with an exact lat/lon if you want Discover/Trails/Plants-watering centered more precisely - drop a pin in Google Maps and copy the coordinates.
- `herName` - already set to "κοριτσάκι μου".

### `src/content/memories.json` (Us section - "Σαν σήμερα" card)
Six invented placeholder entries (Jan/Mar/May/Jul/Sep/Nov), each with a
`month`/`day` and placeholder `title`/`text`. Replace the title/text with
real memories from your relationship - add as many entries as you like, the
month/day just needs to match a real date so it surfaces on that day in
later years. `year` is optional if you remember which year it happened.

### `src/content/clinicMilestones.ts` (Clinic streak milestones)
Four placeholder messages for hitting a 1/7/30/100-day streak. Replace each
string with what you actually want to say to her at that milestone.

### `src/content/clinicCases.json` (Clinic wildlife-care mini-game)
Contains a disclaimer at the top: every `correctFoods`/`wrongFoods`/`note`
value was written from general knowledge, not verified wildlife-rehab
guidance. Worth a pass from an actual wildlife rehabber (or at least a
credible source check) before this is treated as accurate, since it's
presented as educational content.

### `src/content/discoverPlaces.json` / `discoverFoodDrink.json` (Discover section)
These *are* real researched places (not invented), each with a `source`
noted - but worth a spot-check of a few entries before showing it to anyone,
since coordinates for some are area-center estimates rather than exact pins.

### `src/components/mind/EncouragementAvatar.tsx` (Mind section)
A hand-drawn SVG illustration based on a written description (dark hair,
moustache, soul patch, one earring, casual top) since no reference photo was
provided. If you want it to actually look like you, either replace this
component's SVG paths or swap in a real photo/illustration.

### `.env.local` (local dev only - see table above for the production equivalent)
Already has working keys for Dog API, Perenual, and Spoonacular from your
local setup. `SITE_PASSWORD` is commented out - uncomment and set it only if
you also want the password gate active during local development.

---

## Quick pre-launch checklist

- [ ] Set `anniversaryDate` if you want the days-together counter
- [ ] Replace the six placeholder memories with real ones
- [ ] Replace the four clinic milestone messages
- [ ] Spot-check a few Discover coordinates
- [ ] Have someone sanity-check the wildlife-care Clinic content
- [ ] Decide on `SITE_PASSWORD` and add it in Vercel
- [ ] Copy any API keys you want live into Vercel's env vars
- [ ] Deploy, then open the `*.vercel.app` link on your phone and click through every section once
