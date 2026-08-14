import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function promptHidden(label) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      console.error("Run this tool in an interactive Windows CMD terminal.");
      process.exit(1);
    }

    process.stdout.write(label);
    let value = "";

    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    const onData = (chunk) => {
      const text = chunk.toString("utf8");
      for (const ch of text) {
        if (ch === "\u0003") {
          cleanup();
          process.stdout.write("\n");
          process.exit(130);
        }
        if (ch === "\r" || ch === "\n") {
          cleanup();
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u007f" || ch === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        value += ch;
        process.stdout.write("*");
      }
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

loadEnvFile(path.join(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerEmail = (process.env.OWNER_EMAIL || "wowamazingglobal@gmail.com").trim().toLowerCase();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

console.log(`Owner account: ${ownerEmail}`);

const { data: listData, error: listError } =
  await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

if (listError) {
  console.error("Could not read Supabase Auth users:", listError.message);
  process.exit(1);
}

const owner = listData.users.find(
  (user) => (user.email || "").trim().toLowerCase() === ownerEmail
);

if (!owner) {
  console.error(`No Supabase Auth user was found for ${ownerEmail}.`);
  process.exit(1);
}

if (!owner.email_confirmed_at) {
  console.error("The owner email is not confirmed. Nothing was changed.");
  process.exit(1);
}

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", owner.id)
  .maybeSingle();

if (profileError) {
  console.error("Could not verify the owner profile:", profileError.message);
  process.exit(1);
}

if (!profile || profile.role !== "owner") {
  console.error(
    `This user is not role=owner in public.profiles (found: ${profile?.role ?? "none"}).`
  );
  process.exit(1);
}

const password = await promptHidden("Enter NEW owner password: ");
const confirm = await promptHidden("Confirm NEW owner password: ");

if (password !== confirm) {
  console.error("Passwords do not match. Nothing was changed.");
  process.exit(1);
}

if (password.length < 12) {
  console.error("Use a password of at least 12 characters. Nothing was changed.");
  process.exit(1);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(owner.id, {
  password,
});

if (updateError) {
  console.error("Password reset failed:", updateError.message);
  process.exit(1);
}

console.log("");
console.log("SUCCESS: Owner password updated directly in Supabase Auth.");
console.log(`Email: ${ownerEmail}`);
console.log("Role: owner");
console.log("Sign in: https://itsamazing.com.ng/admin/login");
