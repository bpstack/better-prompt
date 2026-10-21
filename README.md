# Better Prompt

A Claude Code mod: Haiku rewrites the draft in your prompt box, clearer and keeping its intent. You read its version above the prompt and choose whether to use it. Nothing is sent for you.

![Better Prompt rewriting a draft](.github/demo.gif)

Type a draft, then click **✨ Rewrite with Haiku**, or press `ctrl+x tab` and `m`. When Haiku's version shows:

- **`u` Use** puts it in the box, in place of your draft. Edit it if you like, and send it yourself.
- **`d` Discard** leaves your draft as you typed it.
- **`c` Cancel** stops the call while Haiku works.

```text
❯ the signup form lets people send it with empty stuff or a wrong email and then they get an ugly error from the server, i want it to tell them right under each field whats wrong before it sends anything
```

```text
✨ Haiku's version · rewrite cost: 432 in / 64 out  u: Use  d: Discard
The signup form currently lets users submit with empty fields or an invalid email, and then they see an unclear error from the server. I want the form to validate each field before submitting and show the specific problem directly under that field.
```

**Read Haiku's version before you use it:** it can drop or add a detail, most of all in pasted logs and code.

## Does it save tokens?

No, it adds them: each rewrite is one more call, to Haiku, and **rewrite cost** is what that call took. Your prompt comes out about as long as your draft, so the main model reads about as much. Where it can pay off is in turns: a vague request that ends in "no, I meant…" costs a whole turn of the main model. That is not measured.

| Your prompt | Worth it? |
| --- | --- |
| Short and clear | No: tokens and time for nothing |
| Short but confusing | Yes, for clarity |
| Long and messy (dictated, scattered ideas) | Where it helps most |
| Mostly pasted material (logs, code, errors) | No: Haiku may drop a detail exactly where precision matters |

## Install

```text
/plugin marketplace add bpstack/better-prompt
/plugin install better-prompt@better-prompt
```

Requires a Claude Code version with mods. Built and tested on 2.1.304.

To update, run `claude plugin marketplace update better-prompt`, then `claude plugin update better-prompt@better-prompt`, and `/reload-plugins` in Claude Code. Or let it update on its own: `/plugin` → **Marketplaces** → **better-prompt** → **Enable auto-update** (Claude Code leaves it off for marketplaces outside Anthropic's).

## How it works

One hooks module ([`hooks/register.tsx`](hooks/register.tsx)): it reads the draft with `$.prompt.read()`, sends it to Haiku with `$.model.complete()` and puts the answer in the box with `$.prompt.fill()`. Haiku sees your draft alone, not the conversation, and is told to keep every fact, path, number and doubt, to keep your language, to name what you describe with its technical term, and to add nothing you did not ask.

## Development

```bash
claude plugin validate .
claude plugin test .     # runs hooks/register.test.tsx against the engine
```

### Releasing

Users get a change only when the version goes up: Claude Code installs by `version`, not by tag.

1. Commit the change on its own (`fix(...)`, `feat(...)`), with `validate` and `test` green.
2. Bump `version` in **both** `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, to the same number, in one commit: `chore(marketplace): bump better-prompt to X.Y.Z`.
3. Push.

`X.Y.Z`: `Z` for a fix, `Y` for a feature, `X` for a change that breaks how it is used.

MIT © bpstack
