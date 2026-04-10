export interface BananaPuzzle {
  question: string; // image URL
  solution: number;
}

export async function fetchBananaPuzzle(): Promise<BananaPuzzle> {
  const res = await fetch('https://marcconrad.com/uob/banana/api.php', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch banana puzzle');
  const data = await res.json();
  return {
    question: data.question,
    solution: data.solution,
  };
}
