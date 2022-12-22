export interface Match {
  match: string;
  line: number;
  column: number;
}

export function getMatches(content: string, regex: RegExp): Match[] {
  // Create a new RegExp object with the global and multiline flags (g and m) set
  const regExp = new RegExp(regex, "gm");

  // Initialize an empty array to store the matches
  const matches = [];

  // Initialize an empty table to store the solutions to the subproblems
  const table = new Array(content.length);
  for (let i = 0; i < content.length; i++) {
    table[i] = new Array(content.length);
  }

  // Use the exec() method of the RegExp object to find the next match
  let match = regExp.exec(content);

  // Continue looping while there are more matches
  while (match) {
    // Check if the current match has already been calculated
    if (table[match.index][match.index + match[0].length - 1] === undefined) {
      // Add the match to the matches array
      matches.push({
        match: match[0],
        line: getLineNumber(content, match.index) + 1, // Line numbers are 1-indexed
        column: getColumnNumber(content, match.index) + 1, // Column numbers are 1-indexed
      });

      // Mark the current match as calculated
      table[match.index][match.index + match[0].length - 1] = true;
    }

    // Find the next match
    match = regExp.exec(content);
  }

  // Return the array of matches
  return matches;
}

function getLineNumber(content: string, index: number) {
  // Split the content into an array of lines
  const lines = content.split("\n");

  // Loop through each line
  for (let i = 0; i < lines.length; i++) {
    // Get the current line
    const line = lines[i];

    // Check if the index is within the current line
    if (index < line.length) {
      // Return the line number
      return i;
    }

    // Decrement the index by the length of the line, plus 1 for the newline character
    index -= line.length + 1;
  }

  // Return -1 if the index is not within the content
  return -1;
}

function getColumnNumber(content: string, index: number) {
  // Split the content into an array of lines
  const lines = content.split("\n");

  // Loop through each line
  for (let i = 0; i < lines.length; i++) {
    // Get the current line
    const line = lines[i];

    // Check if the index is within the current line
    if (index < line.length) {
      // Return the column number
      return index;
    }

    // Decrement the index by the length of the line, plus 1 for the newline character
    index -= line.length + 1;
  }

  // Return -1 if the index is not within the content
  return -1;
}
