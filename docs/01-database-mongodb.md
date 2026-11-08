# 01. Database & Health Check Quick Notes

## 1. What We Built
* **Cached DB Singleton:** `src/lib/db.ts`
* **Health Check API:** `src/app/api/health/route.ts` (Accessible at `http://localhost:3000/api/health`)
* **Environment Config:** `.env.local`

---

## 2. Why We Built It (Senior Interview Knowledge)
* **The Serverless Problem:** Next.js re-runs code on every file save in development and spins up short-lived lambdas in production.
* **The Singleton Fix:** Without caching `mongoose.connect()` on Node's `global` object, MongoDB runs out of connections (`Connection pool exhausted`).
* **Health Check Endpoint:** Production platforms (AWS, Vercel, UptimeRobot) ping `/api/health` every 30s to verify DB socket is alive (`readyState === 1`).

---

## 3. Key Concepts Checklist
* **MongoDB Dynamic DB Creation:** You don't need to manually create databases in MongoDB. `/ecom_demo?` creates `ecom_demo` automatically on first write.
* **Mongoose readyState Codes:**
  * `0` = Disconnected
  * `1` = Connected (Healthy)
  * `2` = Connecting
  * `3` = Disconnecting
* **Network Access:** Dynamic ISP IPs change frequently; `0.0.0.0/0` prevents firewall handshake drops (SSL alert 80).

---

## 4. Official Docs & Sources
* 📖 [Mongoose Connection Guide](https://mongoosejs.com/docs/connections.html)
* 📖 [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
