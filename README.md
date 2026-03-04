# HVAC Business Platform

Complete local setup for the HVAC template library and HVAC lead generator.

## Quick Start

```bash
./start-all.sh
```

Access the local services:

- Template CMS: `http://localhost:3000`
- Template API: `http://localhost:5000`
- Lead Dashboard: `http://localhost:3001`
- Lead API: `http://localhost:5001`

Stop everything:

```bash
./stop-all.sh
```

## Project Layout

- `hvac-template-library/` - Dockerized CMS + API + Postgres + Redis stack
- `hvac-lead-generator/` - Standalone lead generator script, API, and dashboard

## Notes

- Template library docs are in `hvac-template-library/docs/`
- Lead generator Python dependencies live in `hvac-lead-generator/.venv`
- The lead generator still requires valid Google Maps, OpenAI, and Google Sheets credentials for a live export run
