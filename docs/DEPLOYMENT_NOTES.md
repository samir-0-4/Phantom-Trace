# PhantomTrace — Production Deployment & Maintenance Guide
**Kiroween 2026 Hackathon | Category: Frankenstein**

This document covers operational guidance, resilience practices, and maintenance procedures for the live deployment of PhantomTrace.

---

## 1. Live Deployment Architecture

| Tier | Provider | Service / URL | Configuration |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel Edge CDN | [https://phantomtrace04.vercel.app](https://phantomtrace04.vercel.app) | React 18 + Vite 6 Single Page App |
| **Backend API** | Render Web Service | [https://phantomtrace-backend-vhxt.onrender.com](https://phantomtrace-backend-vhxt.onrender.com) | Spring Boot 3.4.2 (DockerTemurin 21) |
| **Database** | Render Managed PostgreSQL | `phantomtrace-db` | PostgreSQL 16 with Flyway (V1–V10) |
| **Blueprint** | Render Blueprint | `render.yaml` | Infrastructure-as-Code definition |

---

## 2. Render Free-Tier PostgreSQL 30-Day Renewal

Render's free PostgreSQL instances expire after **30 days** unless upgraded or renewed.

### Renewal & Expiration Schedule
- If using Render's free tier, Render sends email reminders 7 days prior to database expiration.
- To prevent database expiration during hackathon judging and evaluation:
  1. Open the [Render Dashboard](https://dashboard.render.com).
  2. Select the database instance: `phantomtrace-db`.
  3. Under the **Settings** or banner alert, click **Renew Database**.

### Automated Schema & Seed Recovery
If the database ever expires or requires re-creation:
1. PhantomTrace uses **Flyway database migrations** (`V1__baseline.sql` through `V10__investigation_tenant_isolation.sql`).
2. When the backend starts up against any fresh PostgreSQL instance, Flyway **automatically rebuilds all tables, relations, and indices**.
3. To immediately populate test cases after a database reset, navigate to `/campaign` and click **Seed Synthetic Campaign** (or trigger `POST /api/v1/investigations/seed-demo`).

---

## 3. Cold Start Handling & Keep-Alive Ping

### The Cold Start Behavior
On Render's free web tier:
- The backend instance spins down after **15 minutes** of inactivity.
- The first inbound request spins the container back up, which requires **30 to 50 seconds** (JVM startup, Hibernate initialization, and Flyway migration verification).
- Subsequent requests respond in **under 200 milliseconds**.

### Keeping the Service Warm Until Jan 29, 2027
To ensure hackathon judges experience instant response times without cold starts, set up an external uptime ping:

1. **Recommended Free Uptime Monitors:**
   - [UptimeRobot](https://uptimerobot.com) (free 5-minute HTTP checks)
   - [Cron-Job.org](https://cron-job.org) (free scheduled HTTP requests)
   - [Better Uptime](https://betterstack.com)
2. **Ping Target URL (Canonical Health Endpoint):**
   ```http
   GET https://phantomtrace-backend-vhxt.onrender.com/api/v1/health
   ```
3. **Recommended Schedule:**
   - Interval: Every **10 minutes**
   - HTTP Method: `GET`
   - Expected Status: `200 OK`
   - Response Body: `{"status":"UP","application":"PhantomTrace",...}`

Pinging `/api/v1/health` (or the bridged `/actuator/health`) every 10 minutes keeps the Render container warm continuously throughout the evaluation period.

---

## 4. Privacy & External Intel Hardening

The production deployment incorporates defense-in-depth privacy controls:

| Environment Variable | Production Default | Security Purpose |
| :--- | :--- | :--- |
| `THREAT_LOOKUP_STRIP_QUERY` | `true` | Strips sensitive URL query parameters (tokens, session IDs) before sending to VirusTotal/URLhaus |
| `JWT_SECRET` | Auto-configured secret | Signs tenant authentication tokens |
| `GROQ_API_KEY` | Managed secret | Orchestrates the 6 forensic AI agents |
| `SPRING_JPA_SHOW_SQL` | `false` | Prevents sensitive forensic evidence from leaking into container logs |

---

## 5. Emergency Diagnostic Commands

To test backend health directly from a terminal:
```bash
# Verify Canonical API Health and Database Connection
curl -i https://phantomtrace-backend-vhxt.onrender.com/api/v1/health

# Verify Actuator Compatibility Bridge
curl -i https://phantomtrace-backend-vhxt.onrender.com/actuator/health
```

