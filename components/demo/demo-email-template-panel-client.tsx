"use client"

import { useState } from "react"

export type EmailTemplateTab = {
  id: string
  label: string
  subject: string
  lead: string
  preview: React.ReactNode
}

type DemoEmailTemplatePanelClientProps = {
  tabs: EmailTemplateTab[]
}

export function DemoEmailTemplatePanelClient({ tabs }: DemoEmailTemplatePanelClientProps) {
  const [kind, setKind] = useState(tabs[0]?.id ?? "store")
  const active = tabs.find((tab) => tab.id === kind) ?? tabs[0]

  if (!active) return null

  return (
    <>
      <div className="demo-email-template-tabs" role="tablist" aria-label="通知メールの種類">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`email-tab-${tab.id}`}
            aria-selected={kind === tab.id}
            aria-controls="email-tabpanel"
            className={`demo-email-template-tab${kind === tab.id ? " is-active" : ""}`}
            onClick={() => setKind(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id="email-tabpanel"
        role="tabpanel"
        aria-labelledby={`email-tab-${active.id}`}
        className="demo-email-template-section"
      >
        <p className="demo-email-template-section-lead">{active.lead}</p>
        <p className="demo-email-template-subject">
          <span className="demo-email-template-subject-label">件名</span>
          {active.subject}
        </p>
        <div className="demo-email-template-preview">{active.preview}</div>
      </div>
    </>
  )
}
