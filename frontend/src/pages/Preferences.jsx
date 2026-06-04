import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, FileType, Globe, Scan } from "lucide-react";

export default function Preferences() {
  const [notifications, setNotifications] = useState(true);
  const [autoScan, setAutoScan] = useState(false);
  const [reportFormat, setReportFormat] = useState("PDF");
  const [language, setLanguage] = useState("English");

  const Toggle = ({ on, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl glass-card divide-y divide-slate-100"
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <Bell className="text-primary" size={20} />
          <div>
            <p className="font-medium text-slate-800">Notifications</p>
            <p className="text-sm text-slate-500">Email alerts when audits complete</p>
          </div>
        </div>
        <Toggle on={notifications} onChange={setNotifications} />
      </div>

      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <Scan className="text-primary" size={20} />
          <div>
            <p className="font-medium text-slate-800">Auto Scan</p>
            <p className="text-sm text-slate-500">Run scan automatically on upload</p>
          </div>
        </div>
        <Toggle on={autoScan} onChange={setAutoScan} />
      </div>

      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <FileType className="text-primary" size={20} />
          <div>
            <p className="font-medium text-slate-800">Report Format</p>
            <p className="text-sm text-slate-500">Default export format</p>
          </div>
        </div>
        <select
          value={reportFormat}
          onChange={(e) => setReportFormat(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option>PDF</option>
          <option>HTML</option>
          <option>JSON</option>
        </select>
      </div>

      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <Globe className="text-primary" size={20} />
          <div>
            <p className="font-medium text-slate-800">Language</p>
            <p className="text-sm text-slate-500">Interface language</p>
          </div>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Telugu</option>
        </select>
      </div>
    </motion.div>
  );
}
