/**
 * Validates that all required environment variables and dependencies are set up
 */

export function validateSetup(): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check API key
  if (!process.env.GOOGLE_GENERATIVE_AI_KEY) {
    errors.push(
      'GOOGLE_GENERATIVE_AI_KEY environment variable is not set. ' +
        'Add it in the Vars section of the sidebar with your Gemini API key from aistudio.google.com'
    );
  }

  // Check if running in browser (client-side)
  if (typeof window !== 'undefined') {
    warnings.push(
      'Setup validation is running in the browser. This should only be checked server-side.'
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Logs setup validation results to console
 */
export function logSetupValidation() {
  const { valid, errors, warnings } = validateSetup();

  if (valid) {
    console.log('✅ Setup validation passed - all required environment variables are set');
  } else {
    console.error('❌ Setup validation failed:');
    errors.forEach((error) => console.error('  - ' + error));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Setup warnings:');
    warnings.forEach((warning) => console.warn('  - ' + warning));
  }

  return valid;
}
