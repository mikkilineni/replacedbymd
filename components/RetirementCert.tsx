import { Card, SectionHeader, Field } from "./Card";
import type { FullRoastPayload } from "@/lib/types";

type RetirementCertProps = {
  name: string;
  cause_of_death: string;
  retirement: FullRoastPayload["retirement"];
};

export function RetirementCert({ name, cause_of_death, retirement }: RetirementCertProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card style={{ marginBottom: 32 }}>
      <SectionHeader text="RETIREMENT CERTIFICATE" />

      <Field label="RETIREE">
        <span style={{ fontSize: 24, fontWeight: 700 }}>{name}</span>
      </Field>

      <Field label="DATE OF RETIREMENT">{today}</Field>

      <Field label="CAUSE OF RETIREMENT" green>
        {cause_of_death}
      </Field>

      <Field label="PENSION">{retirement.pension}</Field>

      <Field label="FAREWELL" green="italic">
        {retirement.farewell}
      </Field>

      <div
        style={{
          marginTop: 28,
          paddingTop: 16,
          borderTop: "1px solid var(--green-border)",
        }}
      >
        <div
          style={{
            width: 120,
            height: 1,
            background: "var(--green)",
            marginBottom: 8,
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: "var(--green-dim)",
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          }}
        >
          Signed: Md, HR Division
        </span>
      </div>
    </Card>
  );
}
