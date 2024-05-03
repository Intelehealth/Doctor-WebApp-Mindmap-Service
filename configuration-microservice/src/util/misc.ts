/**
 * Miscellaneous shared functions go here.
 */


/**
 * Get a random number between 1 and 1,000,000,000,000
 */
export function getRandomInt(): number {
  return Math.floor(Math.random() * 1_000_000_000_000);
}

/**
 * Wait for a certain number of milliseconds.
 */
export function tick(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

/**
 * get asset path
 */
export function getAssetPath(fullPath: any): string {
  return fullPath.replace("src\\public\\",'').replaceAll("\\","/");
}
