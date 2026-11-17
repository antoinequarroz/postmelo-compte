const WORDS = ["Zéro", "Une", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix", "Onze", "Douze"];

/** "Sept" for 7: the number of apps written out in the copy, whatever the catalogue holds. */
export const countWord = (n: number) => WORDS[n] ?? String(n);
