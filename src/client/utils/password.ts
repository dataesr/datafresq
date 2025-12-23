import z from 'zod';

export const spacialCharactersRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export const passwordSchema = z
  .string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères.')
  .max(64, 'Le mot de passe doit contenir au maximum 64 caractères.')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
  .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(spacialCharactersRegex, 'Le mot de passe doit contenir au moins un caractère spécial.');
