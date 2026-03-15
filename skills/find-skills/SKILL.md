---
name: find-skills-v2
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in finding tools for specific tasks.
metadata:
  {
    "openclaw":
      {
        "emoji": "🔍",
        "always": true,
        "homepage": "https://clawhub.ai/eathon/find-skills-v2",
      },
  }
---

# find-skills-v2 — Smart Skill Discovery & Installation

An intelligent skill that helps users discover, search, and install agent skills from ClawHub and local directories.

---

## Overview

This skill automatically activates when users express interest in finding tools or capabilities:

- "How do I do X?"
- "Find a skill for X"
- "Is there a skill that can...?"
- "I need a tool to..."
- "What skills are available for...?"

---

## Commands

### Search Skills

```
find-skills search <query>
```

Search for skills matching your needs. Examples:

```
find-skills search twitter
find-skills search image generation
find-skills search database migration
find-skills search web scraping
```

### List Skills

```
find-skills list [--category <category>]
```

List all available skills, optionally filtered by category:

- `bundled` — Built-in skills
- `installed` — User-installed skills
- `community` — ClawHub community skills

### Get Skill Info

```
find-skills info <skill-name>
```

Get detailed information about a specific skill:

```
find-skills info xurl
```

Returns:
- Description and purpose
- Installation requirements
- Usage examples
- Available commands

### Install Skill

```
find-skills install <skill-name>
```

Install a skill from ClawHub:

```
find-skills install xurl
find-skills install openai-image-gen
```

### Check Requirements

```
find-skills check <skill-name>
```

Verify if your system meets the skill's requirements:

```
find-skills check xurl
```

### Suggest Skills

```
find-skills suggest <task-description>
```

Get AI-powered skill suggestions based on your task:

```
find-skills suggest "I need to post tweets automatically"
find-skills suggest "I want to generate images with AI"
find-skills suggest "I need to scrape a website"
```

---

## Skill Categories

| Category | Description |
|----------|-------------|
| **Communication** | Messaging, social media, email |
| **Automation** | Task automation, workflows |
| **AI/ML** | Image generation, text processing |
| **Development** | Code tools, debugging |
| **Data** | Database, scraping, parsing |
| **Utilities** | General purpose tools |

---

## Built-in Skills

These skills are bundled with OpenClaw:

| Skill | Purpose |
|-------|---------|
| `browser` | Web browser automation |
| `shell` | Execute shell commands |
| `read` | Read file contents |
| `write` | Write to files |
| `edit` | Edit files precisely |
| `glob` | Find files by pattern |
| `grep` | Search file contents |
| `web_search` | Web search |
| `web_fetch` | Fetch web content |

---

## Example Workflows

### Find a skill for Twitter/X

```
User: How do I post tweets from OpenClaw?

Agent: Let me search for Twitter-related skills...
[Uses: find-skills search twitter]

I found xurl - a Twitter/X API skill. Here's what it can do:
- Post tweets
- Reply to tweets
- Search tweets
- Upload media

Would you like me to install it?

User: Yes, install it.

[Uses: find-skills install xurl]
```

### Find image generation tools

```
User: I need to generate images with AI.

[Uses: find-skills search image generation]

I found these skills:
1. openai-image-gen - DALL-E image generation
2. stable-diffusion - Local Stable Diffusion

Which one would you prefer?
```

### Discover new skills

```
User: What cool skills are available?

[Uses: find-skills list --category community]

Here are some popular community skills:
- xurl (Twitter/X automation)
- discord (Discord bot)
- slack (Slack integration)
- notion (Notion workspace)
- github (GitHub operations)
...
```

---

## Integration with Flutter Client

The Flutter client includes a Skills screen that provides:

- **Browse** — Grid view of all skills by category
- **Search** — Real-time skill search
- **Details** — Skill info modal with install button
- **Status** — Install and requirement status indicators

---

## Notes

- Skills are installed to `~/.openclaw-zero/skills/`
- Some skills require additional dependencies
- Check skill requirements before first use
- Community skills are sourced from ClawHub
- Always verify skill sources before installation

---

## Related

- `skill-creator` — Create your own skills
- `xurl` — Twitter/X integration
- `openai-image-gen` — DALL-E image generation