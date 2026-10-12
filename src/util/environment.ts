export const getEnvValue = (name: string): string | undefined => {
  if (import.meta.env && import.meta.env[name]) {
    return import.meta.env[name];
  }

  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }

  return undefined;
}
export const isTestEnvironment = () => String(getEnvValue('PUBLIC_TEST_BANNER')).toLowerCase() === 'true';
