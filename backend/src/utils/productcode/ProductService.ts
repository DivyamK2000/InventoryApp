type ResolveResult = 
    | { code: string }
    | { suggestions: string[] };

export class ProductService {
    private static cleanName(name: string): string[] {
        return name
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim()
            .toUpperCase()
            .split(" ")
            .filter(Boolean);
    }

    private static generateBaseCode(words: string[]): string {
        if(words.length === 1) {
            return words[0].slice(0, 3).padEnd(3, "X");
        }

        if(words.length === 2) {
            return words[0].slice(0, 2) + words[1][0];
        }

        return words.slice(0, 3).map(w => w[0]).join("");
    }

    private static generateCandidates(words: string[]): string[] {
        const candidates: string[] = [];

        candidates.push(this.generateBaseCode(words));

        if(words.length === 1) {
            const word = words[0];
            for(let i = 0; i <= words.length - 3; i++) {
                candidates.push(word.slice(i, i + 3));
            }
        }

        if(words.length === 2) {
            const [word1, word2] = words;

            for(let i = 0; i < word1.length - 1; i++) {
                candidates.push(word1.slice(i, i + 2)) + word2[0];
            }

            for(let i = 0; i < word2.length -1; i++) {
                candidates.push(word1[0] + word2.slice(i, i + 2));
            }
        }

        if(words.length === 3) {
            for(const w of words) {
                candidates.push(
                    (w[0] || "X") +
                    (w[1] || "X") +
                    (w[2] || "X")
                );
            }
        }

        return [... new Set(candidates)];
    }

    private static similarityScore(code: string, base: string): number {
        let score = 0;

        for(let i = 0; i < 3; i++) {
            if(code[i] === base[i]) {
                score += 2;
            }
            else if(base.includes(code[i])) {
                score += 1;
            }
        }

        return score;
    }

    private static rankSuggestions(
        suggestions: string[],
        base: string
    ): string[] {
        return suggestions
            .sort((a, b) => {
                return (
                    this.similarityScore(b, base) -
                    this.similarityScore(a, base)
                );
            })
            .slice(0, 4);
    }

    static resolve(
        name: string,
        existingCode: Set<string>
    ): ResolveResult {
        const words = this.cleanName(name);
        const base = this.generateBaseCode(words);

        if(!existingCode.has(base)) {
            return { code: base };
        }

        const candidates = this.generateBaseCode(words);

        const available: string[] = [];

        for(const code of candidates) {
            if(!existingCode.has(code)) {
                available.push(code);
            }
        }

        if(available.length > 0) {
            return {
                suggestions: this.rankSuggestions(available, base)
            };
        }

        return { suggestions: [] };
    }
}