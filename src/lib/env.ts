import { object, string, type TypeOf } from 'zod';

const envSchema = object({
  DATABASE_URL: string().nonempty(),
  GOOGLE_CLIENT_ID: string().nonempty(),
  GOOGLE_CLIENT_SECRET: string().nonempty(),
});

type ParseEnvVariable = TypeOf<typeof envSchema>;
const env = envSchema.parse(process.env);
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<keyof ParseEnvVariable, unknown> {}
  }
}

function getEnvVariable<EnvType extends keyof ParseEnvVariable>(
  type: EnvType
): ParseEnvVariable[EnvType] {
  return env[type];
}

export { type ParseEnvVariable, getEnvVariable };
