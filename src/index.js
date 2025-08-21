#!/usr/bin/env node

/**
 * グラフ上で「同じ点を2回通らない最長経路」を探索するプログラム
 * 
 * - 入力は標準入力から読み込み、1行ごとに "u, v, w" 形式
 * - 出力は最長経路に含まれるノードIDを改行区切りで表示
 * - DFS + 枝刈りで最長単純経路を探索
 */

import fs from "fs";

/**
 * エントリーポイント
 */
function main() {
  const input = fs.readFileSync(0, "utf8").trim().split("\n");
  if (input.length === 0 || (input.length === 1 && input[0] === "")) return;

  console.log(solve(input));
}

/**
 * 与えられた入力から最長経路を求める
 * @param {string[]} inputLines - "u, v, w" の形式の文字列配列
 * @returns {string} - 最長経路のノード列を改行区切りにした文字列
 */
export function solve(inputLines) {
  // -------------------------------
  // 入力処理
  // -------------------------------
  const edges = [];
  const nodes = new Set();

  for (const line of inputLines) {
    if (!line.trim()) continue;
    const [a, b, c] = line.split(",").map(s => s.trim());
    const u = Number(a), v = Number(b), w = Number(c);
    edges.push([u, v, w]);
    nodes.add(u);
    nodes.add(v);
  }

  const totalNodes = nodes.size;

  // 隣接リストの構築
  const graph = new Map();
  for (const n of nodes) graph.set(n, []);
  for (const [u, v, w] of edges) {
    graph.get(u).push({ node: v, dist: w });
  }

  // エッジを距離降順でソート（上界計算用）
  const sortedEdges = edges.map(e => e[2]).sort((a, b) => b - a);
  const prefixSum = [0];
  for (let i = 0; i < sortedEdges.length; i++) {
    prefixSum[i + 1] = prefixSum[i] + sortedEdges[i];
  }
  const totalEdges = sortedEdges.length;

  // -------------------------------
  // DFS による最長経路探索
  // -------------------------------
  let bestDistance = -1;
  let bestPath = [];

  function dfs(current, visited, distance, path) {
    // --- 枝刈り ---
    const remainingNodes = totalNodes - visited.size;
    const maxEdgesPossible = Math.min(remainingNodes, totalEdges);
    const maxPotentialDist = prefixSum[maxEdgesPossible] || 0;
    if (distance + maxPotentialDist <= bestDistance) return;

    let extended = false;
    for (const { node: next, dist: w } of graph.get(current)) {
      if (!visited.has(next)) {
        extended = true;
        visited.add(next);
        path.push(next);
        dfs(next, visited, distance + w, path);
        path.pop();
        visited.delete(next);
      }
    }

    // これ以上進めない場合に最長経路を更新
    if (!extended && distance > bestDistance) {
      bestDistance = distance;
      bestPath = path.slice();
    }
  }

  // 各ノードを始点に探索
  for (const startNode of nodes) {
    const visited = new Set([startNode]);
    dfs(startNode, visited, 0, [startNode]);
  }

  return bestPath.join("\r\n");
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
