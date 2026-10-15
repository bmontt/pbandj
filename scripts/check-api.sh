#!/usr/bin/env bash
# Exercises the API routes' validation paths against a local `next dev` server and
# checks that no response ever contains a secret.
#
#   scripts/check-api.sh
#       Starts `next dev` itself on $PORT (default 3123) with every secret env var
#       unset, plus a fake canary BLOB_READ_WRITE_TOKEN so the leak check has
#       something to look for. Nothing can be emailed or written: Resend and
#       Supabase are unconfigured. Refuses to run if a .env* file exists, because
#       Next would load real keys from it.
#
#   BASE_URL=http://localhost:3000 scripts/check-api.sh
#       Uses an already-running server. Skips the checks that would insert rows or
#       send email if that server has real keys.
#
# Needs: bash, curl, jq, node. Exit code is the number of failed checks.

set -uo pipefail

cd "$(dirname "$0")/.."

CANARY_STORE="checkapicanary0"
CANARY_BLOB_TOKEN="vercel_blob_rw_${CANARY_STORE}_NotARealSecretOnlyACanaryForLeakChecks"
PORT="${PORT:-3123}"
WORK="$(mktemp -d)"
SERVER_PID=""
PASS=0
FAIL=0

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    pkill -TERM -P "$SERVER_PID" 2>/dev/null
    kill -TERM "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT

if [[ -n "${BASE_URL:-}" ]]; then
  SELF_STARTED=0
  echo "Using existing server at $BASE_URL (tests that could send mail or write rows are skipped)"
else
  SELF_STARTED=1
  BASE_URL="http://localhost:${PORT}"
  shopt -s nullglob
  envfiles=(.env .env.*)
  shopt -u nullglob
  for f in ${envfiles[@]+"${envfiles[@]}"}; do
    if [[ -e "$f" && "$f" != ".env.example" ]]; then
      echo "Refusing to start: $f exists and may hold real keys. Move it aside or pass BASE_URL." >&2
      exit 1
    fi
  done

  echo "Starting next dev on :$PORT with secrets unset (canary Blob token only)..."
  env \
    -u RESEND_API_KEY -u EMAIL_FROM -u DEMO_RECIPIENT_EMAIL \
    -u NEXT_PUBLIC_SUPABASE_URL -u NEXT_PUBLIC_SUPABASE_ANON_KEY -u SUPABASE_SERVICE_ROLE_KEY \
    -u SPOTIFY_CLIENT_ID -u SPOTIFY_CLIENT_SECRET -u VERCEL_BLOB_CALLBACK_URL \
    BLOB_READ_WRITE_TOKEN="$CANARY_BLOB_TOKEN" \
    NEXT_TELEMETRY_DISABLED=1 \
    node node_modules/next/dist/bin/next dev -p "$PORT" >"$WORK/server.log" 2>&1 &
  SERVER_PID=$!

  for _ in $(seq 1 120); do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/upload-url" || true)
    [[ "$code" != "000" ]] && break
    sleep 1
  done
  if [[ "$code" == "000" ]]; then
    echo "Server did not start. Log:" >&2
    cat "$WORK/server.log" >&2
    exit 1
  fi
fi

# ---------- helpers ----------

STATUS=""
BODY=""
SECONDS_TAKEN=""

# req METHOD PATH [JSON_BODY] [IP]  -> sets STATUS, BODY, HEADERS file, SECONDS_TAKEN
req() {
  local method="$1" path="$2" data="${3:-}" ip="${4:-198.51.100.1}"
  local args=(-s -X "$method" -o "$WORK/body" -D "$WORK/headers" -w "%{http_code} %{time_total}" -H "x-forwarded-for: $ip")
  if [[ -n "$data" ]]; then
    args+=(-H "content-type: application/json" --data-binary "$data")
  fi
  local out
  out=$(curl "${args[@]}" "$BASE_URL$path")
  STATUS="${out%% *}"
  SECONDS_TAKEN="${out##* }"
  BODY="$(cat "$WORK/body")"
  scan_for_secrets "$method $path"
}

ok() { PASS=$((PASS + 1)); echo "  PASS  $1"; }
bad() { FAIL=$((FAIL + 1)); echo "  FAIL  $1"; echo "        status=$STATUS body=${BODY:0:300}"; }

# expect NAME STATUS [SUBSTRING_IN_BODY]
expect() {
  local name="$1" want="$2" substr="${3:-}"
  if [[ "$STATUS" != "$want" ]]; then bad "$name (expected $want, got $STATUS)"; return; fi
  if [[ -n "$substr" && "$BODY" != *"$substr"* ]]; then bad "$name (body missing: $substr)"; return; fi
  ok "$name"
}

# Fails the run if any response body or header carries a secret-looking value.
scan_for_secrets() {
  local where="$1"
  local pattern="vercel_blob_rw_|${CANARY_STORE}_NotARealSecret|(^|[^A-Za-z0-9])re_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}|eyJhbGciOi|sb_secret_|BLOB_READ_WRITE_TOKEN|SUPABASE_SERVICE_ROLE_KEY=|RESEND_API_KEY="
  if grep -Eq "$pattern" "$WORK/body" "$WORK/headers" 2>/dev/null; then
    FAIL=$((FAIL + 1))
    echo "  FAIL  SECRET LEAK in response to $where"
  fi
}

ip() { echo "203.0.113.$1"; }

# token_req PATHNAME SIZE [CONTENT_TYPE]: a handleUpload token request like the form sends.
# (Payloads are built with jq: bash 3.2 mangles escaped quotes inside "$(...)".)
token_req() {
  jq -cn --arg p "$1" --argjson s "$2" --arg t "${3:-}" '{
    type: "blob.generate-client-token",
    payload: {
      pathname: $p,
      clientPayload: ({size: $s} + (if $t == "" then {} else {contentType: $t} end) | tojson),
      multipart: false
    }
  }'
}

MB=$((1024 * 1024))

# ---------- /api/upload-url ----------
echo
echo "/api/upload-url"

req GET /api/upload-url
expect "GET is not allowed" 405

req POST /api/upload-url '{"filename":"song.mp3"}' "$(ip 10)"
expect "legacy {filename} request is refused (no token handed out)" 400

req POST /api/upload-url 'not json' "$(ip 10)"
expect "invalid JSON is refused" 400

req POST /api/upload-url "$(token_req demos/evil.exe 1000)" "$(ip 11)"
expect "disallowed extension is refused at token generation" 400 "isn't supported"

req POST /api/upload-url "$(token_req demos/song.mp3 1000 text/html)" "$(ip 11)"
expect "mismatched content type is refused" 400

req POST /api/upload-url "$(token_req demos/song.wav $((60 * MB)) audio/wav)" "$(ip 11)"
expect "oversize audio (60 MB) is refused at token generation" 400 "50 MB"

req POST /api/upload-url "$(token_req demos/cv.pdf $((11 * MB)) application/pdf)" "$(ip 11)"
expect "oversize PDF (11 MB) is refused at token generation" 400 "10 MB"

req POST /api/upload-url "$(token_req uploads/song.mp3 1000)" "$(ip 12)"
expect "pathname outside demos/ is refused" 400

req POST /api/upload-url "$(token_req 'demos/../song.mp3' 1000)" "$(ip 12)"
expect "path traversal is refused" 400

req POST /api/upload-url '{"type":"blob.generate-client-token","payload":{"pathname":"demos/song.mp3","clientPayload":null,"multipart":false}}' "$(ip 12)"
expect "missing size is refused" 400

req POST /api/upload-url '{"type":"blob.upload-completed","payload":{"blob":{}}}' "$(ip 12)"
expect "upload-completed events are not accepted" 400

req POST /api/upload-url "$(token_req demos/my-demo.mp3 $((5 * MB)) audio/mpeg)" "$(ip 13)"
if [[ "$SELF_STARTED" == 1 ]]; then
  expect "valid request returns a scoped client token" 200 "vercel_blob_client_"
  if [[ "$STATUS" == 200 ]]; then
    # Decode the client token payload and check the limits baked into it.
    decoded=$(echo "$BODY" | jq -r .clientToken | node -e '
      const t = require("fs").readFileSync(0, "utf8").trim();
      const inner = Buffer.from(t.split("_")[4], "base64").toString();
      const payload = JSON.parse(Buffer.from(inner.split(".")[1], "base64").toString());
      console.log(JSON.stringify(payload));')
    if echo "$decoded" | jq -e --argjson max $((50 * MB)) '
        .pathname == "demos/my-demo.mp3" and .maximumSizeInBytes == $max and .addRandomSuffix == true
        and any(.allowedContentTypes[]; . == "audio/mpeg")
        and (any(.allowedContentTypes[]; . == "application/pdf") | not)
        and .validUntil < (now * 1000 + 31 * 60 * 1000)' >/dev/null; then
      ok "client token is limited to this pathname, audio types, 50 MB, random suffix, <=30 min"
    else
      bad "client token constraints wrong: $decoded"
    fi
  fi
else
  if [[ "$STATUS" == 200 || "$STATUS" == 503 ]]; then ok "valid request answered ($STATUS) without leaking"; else bad "valid upload request"; fi
fi

for i in $(seq 1 11); do req POST /api/upload-url 'not json' "$(ip 14)"; done
expect "11th request in 10 min from one IP is rate limited" 429

# ---------- /api/submit-demo ----------
echo
echo "/api/submit-demo"

submission() { # submission [jq filter applied to the base payload]
  jq -cn '{name: "Check Script", email: "check@example.com", role: "producer", message: "Automated validation check.", website: "", elapsedMs: 8000}' | jq -c "${1:-.}"
}

req POST /api/submit-demo 'not json' "$(ip 20)"
expect "invalid JSON is refused" 400

req POST /api/submit-demo "$(submission '.email = "not-an-email"')" "$(ip 21)"
expect "bad email returns 400" 400 "valid email"

req POST /api/submit-demo "$(submission 'del(.name)')" "$(ip 21)"
expect "missing name returns 400" 400 "your name"

req POST /api/submit-demo "$(submission '.role = "astronaut"')" "$(ip 21)"
expect "role outside the allowed set returns 400" 400 "role"

req POST /api/submit-demo "$(submission '.message = ("x" * 5001)')" "$(ip 22)"
expect "message over 5000 chars returns 400" 400 "5000"

req POST /api/submit-demo "$(submission '.audioUrl = "https://evil.example.com/demos/song-abc.mp3"')" "$(ip 22)"
expect "attachment on a foreign host returns 400" 400 "attachment"

req POST /api/submit-demo "$(submission '.audioUrl = "https://someoneelse.public.blob.vercel-storage.com/demos/song-abc.mp3"')" "$(ip 22)"
expect "attachment on another Blob store returns 400" 400 "attachment"

req POST /api/submit-demo "$(submission '.website = "http://spam.example"')" "$(ip 23)"
expect "honeypot hit is quietly accepted" 200 '"success":true'

req POST /api/submit-demo "$(submission '.elapsedMs = 400')" "$(ip 23)"
expect "too-fast submission is quietly accepted" 200 '"success":true'

req POST /api/submit-demo "$(submission 'del(.elapsedMs)')" "$(ip 23)"
expect "missing fill time asks the user to reload" 400 "reload"

big=$(head -c 40000 /dev/zero | tr '\0' 'a')
req POST /api/submit-demo "{\"name\":\"$big\"}" "$(ip 24)"
expect "oversized body returns 413" 413

if [[ "$SELF_STARTED" == 1 ]]; then
  # Valid payloads pass validation; with no database or email configured both
  # deliveries fail, so the route must report failure (generically) rather than success.
  req POST /api/submit-demo "$(submission)" "$(ip 25)"
  expect "valid submission without a file passes validation; both deliveries down -> generic 500" 500 "couldn't send your submission"
  project_blob_url="https://${CANARY_STORE}.public.blob.vercel-storage.com/demos/my-demo-AbC123.mp3"
  req POST /api/submit-demo "$(submission | jq -c --arg u "$project_blob_url" '.audioUrl = $u')" "$(ip 25)"
  expect "valid submission with a project Blob URL passes validation -> generic 500" 500 "couldn't send your submission"
  if [[ "$BODY" == *"RESEND"* || "$BODY" == *"supabase"* || "$BODY" == *"Error:"* ]]; then bad "500 body leaks internals"; else ok "500 body has no internal details"; fi
  if grep -q "Ignored submission (honeypot)" "$WORK/server.log" && grep -q "Ignored submission (too-fast)" "$WORK/server.log"; then
    ok "server logged the filtered bot submissions"
  else
    bad "server log missing honeypot/too-fast entries"
  fi
  if grep -q "\[email:submit-demo\] EMAIL_FROM is not set" "$WORK/server.log"; then ok "missing EMAIL_FROM is logged loudly"; else bad "missing EMAIL_FROM not logged"; fi
else
  echo "  SKIP  valid submissions (BASE_URL mode: would write to the database and send email)"
fi

for i in $(seq 1 6); do req POST /api/submit-demo 'not json' "$(ip 26)"; done
expect "6th submission in 10 min from one IP is rate limited" 429

# ---------- /api/newsletter-signup ----------
echo
echo "/api/newsletter-signup"

req POST /api/newsletter-signup '{"email":"not-an-email"}' "$(ip 30)"
expect "bad email returns 400" 400 "valid email"

req POST /api/newsletter-signup 'not json' "$(ip 30)"
expect "invalid JSON is refused" 400

req POST /api/newsletter-signup '{"email":"check@example.com","website":"http://spam.example"}' "$(ip 31)"
expect "honeypot hit gets the neutral response" 200 "If you're not already subscribed"
neutral="$BODY"

if [[ "$SELF_STARTED" == 1 ]]; then
  req POST /api/newsletter-signup '{"email":"check@example.com"}' "$(ip 32)"
  expect "valid email with no database -> 503, no email sent" 503 "temporarily unavailable"
  if grep -q "\[email:newsletter-signup\]" "$WORK/server.log"; then bad "newsletter tried to send email without a database"; else ok "no welcome email attempted without a database"; fi
else
  echo "  SKIP  valid signup (BASE_URL mode: would write to the database and send email)"
fi
[[ "$neutral" == *'"success":true'* ]] && ok "neutral response is a plain success (same as new/existing)" || bad "neutral response shape"

for i in $(seq 1 6); do req POST /api/newsletter-signup 'not json' "$(ip 33)"; done
expect "6th signup in 10 min from one IP is rate limited" 429

# ---------- /api/latest-tracks ----------
echo
echo "/api/latest-tracks"

req GET "/api/latest-tracks?limit=3" "" "$(ip 40)"
first_time="$SECONDS_TAKEN"
if [[ "$STATUS" == 200 ]] && echo "$BODY" | jq -e 'type == "array" and length <= 3' >/dev/null; then
  ok "limit=3 returns an array of <= 3 tracks (${first_time}s, $(echo "$BODY" | jq length) tracks)"
else
  bad "limit=3 response"
fi
if echo "$BODY" | jq -e 'all(.[]; has("id") and has("title") and has("artist") and has("nickname") and has("image") and has("url") and has("releaseDate") and has("platform"))' >/dev/null; then
  ok "tracks keep the response shape"
else
  bad "track shape changed"
fi
if grep -qi "^cache-control:.*s-maxage" "$WORK/headers"; then ok "response is CDN-cacheable ($(grep -i '^cache-control' "$WORK/headers" | tr -d '\r'))"; else bad "missing s-maxage"; fi
if awk -v t="$first_time" 'BEGIN { exit !(t < 20) }'; then ok "uncached request finished within the deadline"; else bad "uncached request took ${first_time}s"; fi

got_tracks=$(echo "$BODY" | jq length)
req GET "/api/latest-tracks?limit=3" "" "$(ip 40)"
if [[ "$got_tracks" -gt 0 ]]; then
  if awk -v t="$SECONDS_TAKEN" 'BEGIN { exit !(t < 1.5) }'; then ok "repeat request served from cache (${SECONDS_TAKEN}s)"; else bad "repeat request not cached (${SECONDS_TAKEN}s)"; fi
else
  echo "  SKIP  cache-hit timing (no tracks fetched: offline or sources down; empty results aren't cached)"
fi

req GET "/api/latest-tracks?limit=1000" "" "$(ip 40)"
if [[ "$STATUS" == 200 ]] && echo "$BODY" | jq -e 'type == "array" and length <= 50' >/dev/null; then ok "limit is capped at 50"; else bad "limit cap"; fi

req GET "/api/latest-tracks?limit=abc" "" "$(ip 40)"
if [[ "$STATUS" == 200 ]] && echo "$BODY" | jq -e 'type == "array" and length <= 9' >/dev/null; then ok "invalid limit falls back to 9"; else bad "invalid limit"; fi

# ---------- summary ----------
echo
if [[ "$SELF_STARTED" == 1 ]] && grep -q "$CANARY_STORE"_NotARealSecret "$WORK/server.log"; then
  FAIL=$((FAIL + 1)); echo "  FAIL  canary token appeared in the server log"
fi
echo "Passed: $PASS  Failed: $FAIL"
exit "$FAIL"
