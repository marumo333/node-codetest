// src/index.js
// Node.js v20+ / ESM ("type":"module") 前提

import * as fs from 'node:fs';

/**
 * 入力読み込み
 * 標準入力から全ての行を読み込み、配列に変換する
 * 行の前後の空白を除去し、空行は除外
 */
const inputText = fs.readFileSync(process.stdin.fd, 'utf-8');
const lines = inputText.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');

/**
 * グラフ構築
 * - 入力形式: 始点ID, 終点ID, 距離
 * - 各行をパースし、有向グラフを隣接リスト形式で保持
 */
const graph = new Map();
const nodes = new Set();
for (const line of lines) {
    const [fromStr, toStr, distStr] = line.split(',').map(part => part.trim());
    if (!fromStr || !toStr || !distStr) continue;
    const from = Number.parseInt(fromStr, 10);
    const to = Number.parseInt(toStr, 10);
    const dist = Number.parseFloat(distStr);
    if (Number.isNaN(from) || Number.isNaN(to) || Number.isNaN(dist)) continue;

    nodes.add(from);
    nodes.add(to);
    if (!graph.has(from)) {
        graph.set(from, []);
    }
    graph.get(from).push({ node: to, dist: dist });
}
// 出現したノードがグラフに存在しない場合も空配列をセット
for (const n of nodes) {
    if (!graph.has(n)) graph.set(n, []);
}

/**
 * 枝刈り用の前処理
 * - グラフ内の全ての辺の距離を降順ソート
 * - prefix sum を計算して「残り最大でこれだけ距離が伸ばせる」上界を推定
 */
const allEdges = [];
for (const neighbors of graph.values()) {
    for (const { dist } of neighbors) {
        allEdges.push(dist);
    }
}
allEdges.sort((a, b) => b - a);
const prefixSum = [0];
for (let i = 0; i < allEdges.length; i++) {
    prefixSum[i + 1] = prefixSum[i] + allEdges[i];
}
const totalEdges = allEdges.length;
const totalNodes = nodes.size;

/**
 * 最良経路を記録する変数
 * - bestDistance: 最長距離
 * - bestPath: 経路（駅IDの配列）
 */
let bestDistance = Number.NEGATIVE_INFINITY;
let bestPath = [];

/**
 * DFS (深さ優先探索)
 * - サイクルを含む場合でも「同じ点を2回通らない」単純経路を探索
 * - 枝刈り: 残りのノード数から理論上取り得る最大距離を計算し、
 *   それでも既知の最長距離を超えられない場合は探索を打ち切る
 * 
 * @param {number} current 現在のノード
 * @param {number} start   始点（サイクル判定用）
 * @param {Set<number>} visited 訪問済みノード集合
 * @param {number} distance 現在までの総距離
 * @param {number[]} path 現在の経路
 */
function dfs(current, start, visited, distance, path) {
    // ---- 枝刈り判定 ----
    const remainingNodes = totalNodes - visited.size;
    const maxEdgesPossible = Math.min(remainingNodes, totalEdges);
    const maxPotentialDist = prefixSum[maxEdgesPossible] || 0;
    if (distance + maxPotentialDist <= bestDistance) {
        return; // これ以上探索しても最良経路を更新できない
    }

    // ---- 隣接ノードを探索 ----
    for (const { node: next, dist: w } of graph.get(current)) {
        if (next === start) {
            // 始点に戻る辺があれば、それも「最長経路」の候補になる
            const totalDist = distance + w;
            if (totalDist > bestDistance) {
                bestDistance = totalDist;
                bestPath = [...path, next];
            }
        } else if (!visited.has(next)) {
            // 未訪問ノードのみ探索
            visited.add(next);
            path.push(next);
            dfs(next, start, visited, distance + w, path);
            path.pop();
            visited.delete(next);
        }
    }
}

/**
 * 全てのノードを始点にDFSを実行
 * → 最長経路を探索
 */
for (const startNode of nodes) {
    const visited = new Set([startNode]);
    dfs(startNode, startNode, visited, 0, [startNode]);
}

// 辺が1つもない場合など、経路が見つからなければ適当に1ノード出力
if (!bestPath.length && nodes.size > 0) {
    bestPath = [nodes.values().next().value];
}

/**
 * 出力
 * - 問題文に従い CRLF (`\r\n`) 区切りで出力
 * - 最後も CRLF で終わるようにする
 */
const outputStr = bestPath.map(id => id.toString()).join('\r\n');
process.stdout.write(outputStr + '\r\n');
