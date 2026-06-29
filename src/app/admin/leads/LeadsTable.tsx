"use client";

import { useState } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  interest: string | null;
  status: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-indigo-100 text-indigo-700",
  contacted: "bg-amber-100 text-amber-700",
  closed: "bg-green-100 text-green-700",
};

export default function LeadsTable({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial);

  async function setStatus(id: string, status: string) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  if (leads.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        No leads yet. Enquiries from the website demo form will appear here.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Interest</th>
            <th className="px-4 py-3">Received</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((l) => (
            <tr key={l.id} className="align-top hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{l.name}</td>
              <td className="px-4 py-3">
                <a href={`mailto:${l.email}`} className="text-brand hover:underline">{l.email}</a>
                {l.phone && <div className="text-xs text-slate-500">{l.phone}</div>}
              </td>
              <td className="px-4 py-3 text-slate-600">{l.company || "—"}</td>
              <td className="px-4 py-3 max-w-xs text-slate-600">{l.interest || "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                {new Date(l.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <select
                  value={l.status}
                  onChange={(e) => setStatus(l.id, e.target.value)}
                  className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[l.status] ?? ""}`}
                >
                  <option value="new">new</option>
                  <option value="contacted">contacted</option>
                  <option value="closed">closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
