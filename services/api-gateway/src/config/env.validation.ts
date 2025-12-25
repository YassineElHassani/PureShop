export function validate(config: Record<string, unknown>) {
  const requiredVars = ['JWT_SECRET', 'RABBITMQ_URL'];
  
  const missingVars = requiredVars.filter(varName => !config[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.',
    );
  }

  // Validate JWT_SECRET strength in production
  if (config.NODE_ENV === 'production') {
    const jwtSecret = config.JWT_SECRET as string;
    if (jwtSecret.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long in production.',
      );
    }
  }

  return config;
}
