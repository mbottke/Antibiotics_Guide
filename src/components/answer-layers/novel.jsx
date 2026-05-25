/* layer · ans-novel — recently-approved / novel agents relevant here.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { NovelAgentsBlock } from "../NovelAgentsBlock.jsx";

export const novelLayer = {
  id: "ans-novel",
  group: "local",
  spineLabel: "Novel",
  when: (shared) => shared._novel.length > 0,
  render: (shared) => (
    <div id="ans-novel" style={{ scrollMarginTop: 96 }}>
      <NovelAgentsBlock agents={shared._novel} />
    </div>
  ),
};
