// Weirdest Job Title: Blind Judge Showdown — one-line entry selector and writer.
// Holds the 14 candidate job titles from the local tournament (see
// CANDIDATES.md), scores each on the judge's published criteria in the
// judge's order (a weird job title first, then stranger than ordinary work
// with a gloriously odd twist, then funny with a twist that lands on the
// first read, then sounding like a real job specific enough to picture the
// person doing it, then reading instantly), runs a full round-robin, and
// writes the winner to /output/entry.txt. Deterministic: same input, same
// winner, every run.
import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  // Feature scores from the local round-robin tournament (CANDIDATES.md):
  weird: number; // a weird job title, not an ordinary one
  strange: number; // stranger than ordinary work, a gloriously odd twist
  funny: number; // funny, twist lands on the first read
  real: number; // sounds like a real job, specific enough to picture it
  instant: number; // reads instantly, short enough to take in at a glance
};

const CANDIDATES: Candidate[] = [
  { text: `Senior Apologizer for Billionaires' Group Chats`, weird: 5, strange: 5, funny: 5, real: 5, instant: 5 },
  { text: `Professional Excuse Writer for Dogs Who Ate Homework`, weird: 5, strange: 4, funny: 5, real: 4, instant: 5 },
  { text: `Senior Manager of Apologizing to Cats on Behalf of Dogs`, weird: 5, strange: 5, funny: 4, real: 4, instant: 4 },
  { text: `Vice President of Saying No to Billionaires`, weird: 4, strange: 4, funny: 4, real: 5, instant: 5 },
  { text: `Chief Excuse Writer for Cats Who Missed Work`, weird: 5, strange: 4, funny: 4, real: 4, instant: 5 },
  { text: `Professional Queue Stander for Impatient Millionaires`, weird: 4, strange: 4, funny: 4, real: 5, instant: 4 },
  { text: `Senior Manager of Holding Elevators for CEOs`, weird: 4, strange: 4, funny: 4, real: 4, instant: 5 },
  { text: `Chief Nap Quality Inspector, Five-Star Hotels`, weird: 4, strange: 4, funny: 4, real: 4, instant: 5 },
  { text: `Professional Sock Matcher, Single Socks Division`, weird: 4, strange: 5, funny: 4, real: 4, instant: 5 },
  { text: `Official Taste Tester for Dog Birthday Cakes`, weird: 4, strange: 4, funny: 4, real: 4, instant: 5 },
  { text: `Professional Apologizer for Billionaires' Exes`, weird: 5, strange: 4, funny: 4, real: 4, instant: 5 },
  { text: `Senior Dog Excuse Writer, Corporate Division`, weird: 4, strange: 4, funny: 3, real: 4, instant: 5 },
  { text: `Chief Ice Cube Inspector for Luxury Hotels`, weird: 4, strange: 3, funny: 3, real: 4, instant: 5 },
  { text: `Professional Wi-Fi Password Rememberer`, weird: 4, strange: 3, funny: 3, real: 4, instant: 5 },
];

// Weighted in the judge's published order: weird first, then strange, then
// funny, then real-sounding, then instant read.
const score = (c: Candidate): number =>
  c.weird * 5 + c.strange * 4 + c.funny * 3 + c.real * 2 + c.instant * 1;

// Full round-robin: every candidate meets every other; the higher weighted
// score takes the pairing.
let winner = CANDIDATES[0];
let wins = 0;
let runnerUpScore = -1;
for (const c of CANDIDATES) {
  let w = 0;
  for (const other of CANDIDATES) {
    if (other !== c && score(c) > score(other)) w++;
  }
  if (w > wins || (w === wins && score(c) > score(winner))) {
    winner = c;
    wins = w;
  }
}
for (const c of CANDIDATES) {
  if (c !== winner) runnerUpScore = Math.max(runnerUpScore, score(c));
}

const ENTRY = winner.text;

// Tournament safeguard: never ship a winner that did not beat the whole field
// outright, or whose weighted score does not clear the runner-up.
if (wins !== CANDIDATES.length - 1 || score(winner) <= runnerUpScore) {
  console.error(`tournament inconclusive: wins=${wins}, margin=${score(winner) - runnerUpScore}`);
  process.exit(1);
}

// Sealed-gate self-check: UTF-8 text, 1-60 chars, not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 60 || ENTRY.trim().length === 0) {
  console.error(`entry invalid: ${ENTRY.length} chars`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, ENTRY, "utf8");
console.log(`winner won ${wins}/${CANDIDATES.length - 1} pairings; wrote ${ENTRY.length} chars to ${outDir}/entry.txt`);
