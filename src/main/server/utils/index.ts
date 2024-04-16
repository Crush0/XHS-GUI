/**
 * The GID must be hex string of 16 characters, 
 * thus [0-9a-fA-F] are allowed and leading zeros must not be stripped. 
 * The GID all 0 is reserved and must not be used. The GID must be unique, 
 * otherwise error is reported and the download is not added.
 * @param length 
 * @returns a random GID string of given length
 */
export function generateGidString(length: number): string {
    const characters: string = '0123456789abcdef';
    const gidArray: string[] = [];
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        gidArray.push(characters[randomIndex]);
    }
    let gid = gidArray.join('');
    // Ensure the generated GID is not all zeros
    while (gid === '0'.repeat(length)) {
        gid = generateGidString(length);
    }
    return gid;
}
