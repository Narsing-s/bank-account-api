import { z } from 'zod';

/**
 * Zod schema for the UpdateAccountDetailesRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const updateAccountDetailesRequest = z.lazy(() => {
  return z.object({
    fullName: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    mobileNumber: z.string().optional().nullable(),
  });
});

/**
 *
 * @typedef  {UpdateAccountDetailesRequest} updateAccountDetailesRequest
 * @property {string}
 * @property {string}
 * @property {string}
 */
export type UpdateAccountDetailesRequest = z.infer<typeof updateAccountDetailesRequest>;

/**
 * Zod schema for mapping API responses to the UpdateAccountDetailesRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const updateAccountDetailesRequestResponse = z.lazy(() => {
  return z
    .object({
      FullName: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      mobileNumber: z.string().optional().nullable(),
    })
    .transform((data) => ({
      fullName: data['FullName'],
      address: data['address'],
      mobileNumber: data['mobileNumber'],
    }));
});

/**
 * Zod schema for mapping the UpdateAccountDetailesRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const updateAccountDetailesRequestRequest = z.lazy(() => {
  return z
    .object({
      fullName: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      mobileNumber: z.string().optional().nullable(),
    })
    .transform((data) => ({
      FullName: data['fullName'],
      address: data['address'],
      mobileNumber: data['mobileNumber'],
    }));
});
