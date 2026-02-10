AI-Assisted GitHub Pull Request Review Bot (MVP)

A minimal service that listens to GitHub Pull Request events, analyzes code changes, and posts AI-assisted review feedback without blocking developers.

## Overview

- Listens to GitHub Pull Request webhooks
- Fetches PR diffs and changed files
- Generates AI-based review suggestions
- Posts feedback as a single PR review

## Design Principles

- Reacts only to `pull_request` events (`opened`, `synchronize`)
- AI suggests improvements; humans decide what to accept
- No CI blocking, no auto-merge
- No database (stateless MVP)

## Architecture

```
GitHub Repository
   |
   | Pull Request Events (opened / updated)
   v
GitHub Webhook
   |
   | POST /webhook/github
   v
Fastify API (src/server.ts)
   |
   |-- Verify webhook signature
   |-- Filter PR events
   |-- Fetch PR diff via GitHub REST API
   |-- Generate AI review suggestions
   |
   v
GitHub REST API
   |
   | POST /repos/:owner/:repo/pulls/:number/reviews
   v
Pull Request Review (🤖 AI-assisted review)
```

## Tech Stack

- **Backend**: Node.js, TypeScript, Fastify
- **GitHub Integration**: Webhooks + REST API
- **AI Service**: Pluggable AI service (mocked for MVP)

## Status

MVP complete.