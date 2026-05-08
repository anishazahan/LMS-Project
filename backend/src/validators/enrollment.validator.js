import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const completeModuleSchema = z.object({
  moduleId: objectIdSchema,
});
