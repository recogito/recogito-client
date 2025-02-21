/**
 * Tests if a specific pattern matches an existing Recogito
 * extensions point name.
 */
export const matchesExtensionPoint = (pattern: string, extensionPoint: string) => {
  const patternSegments = pattern.split(/[\.,:]+/);

  const epSegments = extensionPoint.split(/[\.,:]+/);

  if (patternSegments.length > epSegments.length)
    return false; // the pattern is more specific than the extension point

  for (let i = 0; i < patternSegments.length; i++) {
    if (epSegments[i] !== '*' 
      && patternSegments[i] !== '*' 
      && patternSegments[i] !== epSegments[i]) { 
        // Segment doesn't match
        return false; 
    }
  }

  return true; // All segments match
}