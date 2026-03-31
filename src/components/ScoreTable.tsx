/* Copyright 2026 NUREUM Labs (JIHO MIN). All rights reserved. ButtonNureum@gmail.com */
import { Fragment } from "react";

export type Mode = "pushup" | "pullup" | "situp";

interface ScoreRow {
  score: string;
  reps: string;
}

// 팔굽혀펴기: 10(70) ~ 6.0(30), 과락 30미만
const PUSHUP_SCORES: ScoreRow[] = Array.from({ length: 41 }, (_, i) => {
  const s = 10 - i * 0.1;
  return { 
    score: Number(s.toFixed(1)).toString(), 
    reps: String(70 - i) 
  };
});
PUSHUP_SCORES.push({ score: "과락", reps: "30미만" });

// 턱걸이: 10(18) ~ 6(10), 0(10이하)
const PULLUP_SCORES: ScoreRow[] = [
  { score: "10", reps: "18" },
  { score: "9.5", reps: "17" },
  { score: "9", reps: "16" },
  { score: "8.5", reps: "15" },
  { score: "8", reps: "14" },
  { score: "7.5", reps: "13" },
  { score: "7", reps: "12" },
  { score: "6.5", reps: "11" },
  { score: "6", reps: "10" },
  { score: "0", reps: "10미만" },
];

// 윗몸일으키기: 10(85) ~ 6.0(45), 과락 45미만
const SITUP_SCORES: ScoreRow[] = Array.from({ length: 41 }, (_, i) => {
  const s = 10 - i * 0.1;
  return { 
    score: Number(s.toFixed(1)).toString(), 
    reps: String(85 - i) 
  };
});
SITUP_SCORES.push({ score: "과락", reps: "45미만" });

const DATA_MAP: Record<Mode, ScoreRow[]> = {
  pushup: PUSHUP_SCORES,
  pullup: PULLUP_SCORES,
  situp: SITUP_SCORES,
};

// How many columns to display side-by-side
const COLS_MAP: Record<Mode, number> = {
  pushup: 4,
  pullup: 2,
  situp: 4,
};

interface ScoreTableProps {
  mode: Mode;
}

const ScoreTable = ({ mode }: ScoreTableProps) => {
  const data = DATA_MAP[mode];
  const cols = COLS_MAP[mode];

  const rowsPerCol = Math.ceil(data.length / cols);
  const columnGroups: ScoreRow[][] = [];
  for (let c = 0; c < cols; c++) {
    columnGroups.push(data.slice(c * rowsPerCol, (c + 1) * rowsPerCol));
  }
  const maxRows = rowsPerCol;

  return (
    <div className="w-full mx-auto">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary border-b border-border">
              <th 
                colSpan={columnGroups.length * 2} 
                className="font-display px-2 py-2.5 text-center font-semibold text-primary tracking-wide text-xs sm:text-sm"
              >
                {mode === "pushup" ? "팔굽혀펴기" : mode === "pullup" ? "턱걸이" : "윗몸일으키기"}
              </th>
            </tr>
            <tr className="bg-secondary/80 border-b border-border">
              {columnGroups.map((_, ci) => (
                <Fragment key={`h-frag-${ci}`}>
                  <th key={`h1-${ci}`} className="font-display px-2 py-1.5 text-center font-medium text-primary/80 tracking-wide text-xs">배점</th>
                  <th key={`h2-${ci}`} className="font-display px-2 py-1.5 text-center font-medium text-primary/80 tracking-wide text-xs border-r border-border last:border-r-0">횟수</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }, (_, rowIdx) => {
              return (
              <tr
                  key={rowIdx}
                  className="border-b border-border last:border-b-0 transition-colors bg-card"
                >
                  {columnGroups.map((group, ci) => {
                    const item = group[rowIdx];
                    const isFail = item && (item.score === "과락" || item.score === "0");

                    if (!item) {
                      const isLastCol = ci === columnGroups.length - 1;
                      if (isLastCol) {
                        return (
                          <td 
                            key={`e-cell-merged-${ci}`} 
                            colSpan={2} 
                            className="px-2 py-2 border-r border-border last:border-r-0" 
                          />
                        );
                      }
                      return (
                        <Fragment key={`e-frag-${ci}`}>
                          <td key={`e1-${ci}`} className="px-2 py-2 border-r border-border last:border-r-0" />
                          <td key={`e2-${ci}`} className="px-2 py-2 border-r border-border last:border-r-0" />
                        </Fragment>
                      );
                    }

                    if (isFail) {
                      return (
                        <td
                          key={`f-cell-${ci}`}
                          colSpan={2}
                          className="font-body px-2 py-2 text-center tabular-nums text-destructive font-semibold border-r border-border last:border-r-0"
                        >
                          {item.score} {item.reps}
                        </td>
                      );
                    }

                    return (
                      <Fragment key={`e-frag-v-${ci}`}>
                        <td
                          className="font-body px-2 py-2 text-center tabular-nums text-foreground"
                        >
                          {item.score}
                        </td>
                        <td
                          className="font-body px-2 py-2 text-center tabular-nums border-r border-border last:border-r-0 text-muted-foreground"
                        >
                          {item.reps}
                        </td>
                      </Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreTable;
