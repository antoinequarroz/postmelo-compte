"use client";

import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Button, inputClass } from "@/components/ui";
import { authClient, comesFromTool, goHome, message } from "@/lib/auth-client";
import { api, APP_NAME, MIN_PASSWORD } from "@/lib/utils";

type Step = "loading" | "setup" | "password" | "code" | "backup";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [trust, setTrust] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [passkeys, setPasskeys] = useState(false);

  useEffect(() => {
    setPasskeys(typeof window.PublicKeyCredential !== "undefined");
    // With a time limit: a request that never answers must not leave the page empty.
    api<{ needsSetup: boolean }>("/api/demarrage", { signal: AbortSignal.timeout(6000) }).then(
      (s) => setStep(s.needsSetup ? "setup" : "password"),
      () => setStep("password"),
    );
  }, []);

  /** Runs one step; on success the browser leaves for the tool that asked, or for the account page. */
  const run = async (action: () => Promise<{ error?: Parameters<typeof message>[0]; data?: unknown }>) => {
    setBusy(true);
    setError("");
    try {
      const { error, data } = await action();
      if (error) {
        setError(message(error));
        setBusy(false);
        return;
      }
      // The account has a second factor: ask for the code before any session exists.
      if (data && typeof data === "object" && "twoFactorRedirect" in data) {
        setStep("code");
        setBusy(false);
        return;
      }
      goHome();
    } catch (err) {
      setError((err as Error).message || "Une erreur est survenue.");
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "setup")
      return run(async () => {
        await api("/api/demarrage", { method: "POST", json: { name, email, password } });
        return authClient.signIn.email({ email, password });
      });
    if (step === "password") return run(() => authClient.signIn.email({ email, password }));
    if (step === "code") return run(() => authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, ""), trustDevice: trust }));
    return run(() => authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice: trust }));
  };

  // Until the server says whether an account exists: the logo, rather than an empty page.
  if (step === "loading")
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <Logo className="size-9 animate-pulse" />
      </div>
    );

  const second = step === "code" || step === "backup";
  const intro = {
    setup: "Bienvenue. Crée ton compte : ce sera celui de l'administrateur.",
    password: comesFromTool() ? "Connecte-toi pour continuer vers ton outil." : "Un seul compte pour tous tes outils.",
    code: "Entre le code à six chiffres de ton application d'authentification.",
    backup: "Entre l'un de tes codes de secours. Chacun ne sert qu'une fois.",
  }[step];

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <form onSubmit={submit} className="rise w-full max-w-[360px] rounded-2xl border border-line bg-surface/80 p-7 shadow-card backdrop-blur-xl">
        <Logo className="size-9" />
        <h1 className="mt-5 font-display text-[30px] leading-none">{second ? "Vérification" : APP_NAME}</h1>
        <p className="mt-2 text-[13px] text-ink-3">{intro}</p>

        {!second && (
          <div className="mt-6 flex flex-col gap-2.5">
            {step === "setup" && <input autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" maxLength={80} className={inputClass} />}
            <input type="email" autoFocus={step !== "setup"} autoComplete="username webauthn" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className={inputClass} />
            <input
              type="password"
              autoComplete={step === "setup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={step === "setup" ? `Mot de passe (${MIN_PASSWORD} caractères au moins)` : "Mot de passe"}
              className={inputClass}
            />
          </div>
        )}

        {second && (
          <div className="mt-6 flex flex-col gap-3">
            <input
              key={step}
              autoFocus
              inputMode={step === "code" ? "numeric" : "text"}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={step === "code" ? "123 456" : "Code de secours"}
              maxLength={step === "code" ? 7 : 40}
              className={`${inputClass} text-center font-mono tracking-[0.2em]`}
            />
            <label className="flex items-center gap-2 text-[12.5px] text-ink-2">
              <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} className="size-4 accent-[var(--accent)]" />
              Ne plus demander sur cet appareil pendant 30 jours
            </label>
          </div>
        )}

        {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}

        <Button variant="primary" className="mt-4 w-full" disabled={busy || (second ? !code.trim() : !email || !password || (step === "setup" && (!name.trim() || password.length < MIN_PASSWORD)))}>
          {busy ? "Un instant…" : step === "setup" ? "Créer mon compte" : second ? "Vérifier" : "Se connecter"}
        </Button>

        {step === "password" && passkeys && (
          <Button type="button" className="mt-2 w-full" disabled={busy} onClick={() => run(() => authClient.signIn.passkey())}>
            <KeyRound className="size-4" />
            Utiliser une clé d&apos;accès
          </Button>
        )}

        {second && (
          <button
            type="button"
            className="mt-4 w-full text-center text-[12.5px] text-ink-3 underline-offset-2 hover:text-ink hover:underline"
            onClick={() => {
              setCode("");
              setError("");
              setStep(step === "code" ? "backup" : "code");
            }}
          >
            {step === "code" ? "Utiliser un code de secours" : "Utiliser mon application d'authentification"}
          </button>
        )}
      </form>
    </div>
  );
}
