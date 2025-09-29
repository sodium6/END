import React from "react";

function formatLabel(dateString) {
  if (!dateString) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export default function ActivityChart({ series = [] }) {
  if (!Array.isArray(series) || series.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-gray-500">
        ยังไม่มีข้อมูลกิจกรรมล่าสุด
      </div>
    );
  }

  const maxValue = Math.max(...series.map((item) => Number(item.count) || 0), 1);

  return (
    <div className="flex h-60 items-end gap-3 overflow-x-auto pb-4">
      {series.map(({ date, count }) => {
        const numericCount = Number(count) || 0;
        const height = `${(numericCount / maxValue) * 180}px`;
        return (
          <div key={date} className="flex w-12 flex-col items-center">
            <div
              className="flex w-full items-end justify-center rounded-t bg-blue-500 text-xs font-semibold text-white"
              style={{ height }}
            >
              {numericCount}
            </div>
            <span className="mt-2 text-xs text-gray-500">{formatLabel(date)}</span>
          </div>
        );
      })}
    </div>
  );
}
