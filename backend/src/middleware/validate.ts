import { Request, Response, NextFunction } from 'express';

export interface FieldRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
}

export type ValidationSchema = Record<string, FieldRule>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validatePayload = (
  payload: unknown,
  schema: ValidationSchema
): ValidationResult => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: ['Invalid request body format.'] };
  }

  const record = payload as Record<string, unknown>;
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(schema)) {
    const value = record[field];
    const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

    if (rule.required && isEmpty) {
      errors.push(rule.message || `Field "${field}" is required.`);
      continue;
    }

    if (isEmpty) continue;

    if (rule.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(rule.message || `Field "${field}" must be a string.`);
        continue;
      }
      const trimmed = value.trim();
      if (rule.minLength !== undefined && trimmed.length < rule.minLength) {
        errors.push(rule.message || `Field "${field}" must be at least ${rule.minLength} characters.`);
      }
      if (rule.maxLength !== undefined && trimmed.length > rule.maxLength) {
        errors.push(rule.message || `Field "${field}" must be at most ${rule.maxLength} characters.`);
      }
      if (rule.pattern && !rule.pattern.test(trimmed)) {
        errors.push(rule.message || `Field "${field}" has an invalid format.`);
      }
    } else if (rule.type === 'number') {
      const num = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(num)) {
        errors.push(rule.message || `Field "${field}" must be a valid number.`);
        continue;
      }
      if (rule.min !== undefined && num < rule.min) {
        errors.push(rule.message || `Field "${field}" must be at least ${rule.min}.`);
      }
      if (rule.max !== undefined && num > rule.max) {
        errors.push(rule.message || `Field "${field}" must be at most ${rule.max}.`);
      }
    } else if (rule.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(rule.message || `Field "${field}" must be a boolean.`);
    }
  }

  return { valid: errors.length === 0, errors };
};

export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validatePayload(req.body, schema);
    if (!result.valid) {
      res.status(400).json({
        error: result.errors[0],
        details: result.errors,
      });
      return;
    }
    next();
  };
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_SCHEMAS = {
  register: {
    email: { required: true, type: 'string' as const, maxLength: 180, pattern: EMAIL_REGEX, message: 'يرجى إدخال بريد إلكتروني صحيح.' },
    password: { required: true, type: 'string' as const, minLength: 6, maxLength: 128, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' },
    name: { required: false, type: 'string' as const, maxLength: 100 },
  },
  login: {
    email: { required: true, type: 'string' as const, maxLength: 180, pattern: EMAIL_REGEX, message: 'يرجى إدخال بريد إلكتروني صحيح.' },
    password: { required: true, type: 'string' as const, minLength: 1, maxLength: 128, message: 'يرجى إدخال كلمة المرور.' },
  },
  weightLog: {
    weight: { required: true, type: 'number' as const, min: 20, max: 400, message: 'يرجى إدخال وزن منطقي بين 20 و 400 كجم.' },
    notes: { required: false, type: 'string' as const, maxLength: 500 },
  },
};
