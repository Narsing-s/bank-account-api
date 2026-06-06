import { z } from 'zod';

/**
 * Zod schema for the AccountCreationRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const accountCreationRequest = z.lazy(() => {
  return z.object({
    fullName: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    mobileNumber: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  });
});

/**
 *
 * @typedef  {AccountCreationRequest} accountCreationRequest
 * @property {string}
 * @property {string}
 * @property {string}
 * @property {string}
 * @property {string}
 */
export type AccountCreationRequest = z.infer<typeof accountCreationRequest>;

/**
 * Zod schema for mapping API responses to the AccountCreationRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const accountCreationRequestResponse = z.lazy(() => {
  return z
    .object({
      FullName: z.string().optional().nullable(),
      dateOfBirth: z.string().optional().nullable(),
      mobileNumber: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
    })
    .transform((data) => ({
      fullName: data['FullName'],
      dateOfBirth: data['dateOfBirth'],
      mobileNumber: data['mobileNumber'],
      email: data['email'],
      address: data['address'],
    }));
});

/**
 * Zod schema for mapping the AccountCreationRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const accountCreationRequestRequest = z.lazy(() => {
  return z
    .object({
      fullName: z.string().optional().nullable(),
      dateOfBirth: z.string().optional().nullable(),
      mobileNumber: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
    })
    .transform((data) => ({
      FullName: data['fullName'],
      dateOfBirth: data['dateOfBirth'],
      mobileNumber: data['mobileNumber'],
      email: data['email'],
      address: data['address'],
    }));
});
