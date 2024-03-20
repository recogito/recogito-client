export const matchesExtensionPoint = (pluginPattern: string, extensionPoint: string) => {
  const pluginPatternSegments = pluginPattern.split('.');

  const extensionPointSegments = extensionPoint.split('.');

  if (pluginPatternSegments.length > extensionPoint.length)
    return false; // the plugin pattern has more segments than the extension point

  for (let i = 0; i < pluginPattern.length; i++) {
    if (extensionPointSegments[i] !== '*' && pluginPatternSegments[i] !== '*' && pluginPatternSegments[i] !== extensionPointSegments[i])
      return false; // Segments don't match
  }

  return true; // All segments match
}