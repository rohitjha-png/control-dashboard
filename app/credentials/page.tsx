"use client";
import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskSecret } from "@/lib/utils";
import { CREDENTIAL_GROUPS } from "@/lib/constants";
import { Eye, EyeOff, Save, Check, AlertCircle } from "lucide-react";

interface CredentialField {
  key: string;
  label: string;
  type: string;
}

export default function CredentialsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [adminKey, setAdminKey] = useState("");

  // Load current credentials on mount
  useEffect(() => {
    fetch("/api/credentials")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data && typeof data === "object") setValues(data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    setErrorMsg("");
    try {
      const res = await fetch("/api/credentials", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setErrorMsg(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title="Credentials"
        subtitle="Manage environment variables and API keys"
      >
        <Button
          size="sm"
          onClick={handleSave}
          loading={saving}
          variant={saveStatus === "success" ? "success" : saveStatus === "error" ? "danger" : "default"}
        >
          {saveStatus === "success" ? (
            <>
              <Check size={12} /> Saved
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertCircle size={12} /> Error
            </>
          ) : (
            <>
              <Save size={12} /> Save All
            </>
          )}
        </Button>
      </Topbar>

      <div className="p-6 space-y-5">
        {/* Admin key required for saving */}
        <Card className="border-yellow-700/50 bg-yellow-900/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-300">Admin authentication required to save</p>
                <p className="text-xs text-yellow-600 mt-1 mb-3">
                  Enter your admin API key to write changes to the server environment.
                </p>
                <div className="max-w-sm">
                  <Input
                    type="password"
                    placeholder="Admin API key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {saveStatus === "error" && errorMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-900/20 border border-red-700/50 text-red-300 text-sm">
            <AlertCircle size={14} />
            {errorMsg}
          </div>
        )}

        {CREDENTIAL_GROUPS.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map((field: CredentialField) => {
                  const isPassword = field.type === "password";
                  const isRevealed = revealed[field.key];
                  const displayValue = isPassword && !isRevealed
                    ? maskSecret(values[field.key] ?? "")
                    : values[field.key] ?? "";

                  return (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-400">
                        {field.label}
                        <span className="ml-1.5 text-gray-600 font-mono">{field.key}</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type={isPassword && !isRevealed ? "password" : "text"}
                          value={values[field.key] ?? ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={isPassword ? "••••••••" : `Enter ${field.label}`}
                          className="flex-1 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() => toggleReveal(field.key)}
                            className="px-2.5 rounded-md border border-gray-600 bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
