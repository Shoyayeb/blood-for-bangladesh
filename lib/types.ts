import { z } from 'zod';

// Blood Group enum
export const BloodGroupEnum = z.enum([
  'A_POSITIVE',
  'A_NEGATIVE', 
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE'
]);

export type BloodGroup = z.infer<typeof BloodGroupEnum>;

// Privacy settings enums
export const ContactVisibilityEnum = z.enum([
  'PUBLIC',     // Contact details visible to everyone
  'RESTRICTED', // Contact details visible only to authenticated users  
  'PRIVATE'     // Contact details visible only to self
]);

export type ContactVisibility = z.infer<typeof ContactVisibilityEnum>;

export const ProfileVisibilityEnum = z.enum([
  'PUBLIC',  // Profile visible to everyone
  'PRIVATE'  // Profile visible only to authenticated users
]);

export type ProfileVisibility = z.infer<typeof ProfileVisibilityEnum>;

// User registration schema
export const UserRegistrationSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bloodGroup: BloodGroupEnum,
  area: z.string().min(2, 'Area is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  contactVisibility: ContactVisibilityEnum.default('RESTRICTED'),
  profileVisibility: ProfileVisibilityEnum.default('PUBLIC'),
});

export type UserRegistration = z.infer<typeof UserRegistrationSchema>;

// Donor search schema
export const DonorSearchSchema = z.object({
  bloodGroup: BloodGroupEnum.optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  area: z.string().optional(),
});

export type DonorSearch = z.infer<typeof DonorSearchSchema>;

// Donation schema
export const DonationSchema = z.object({
  location: z.string().optional(),
  notes: z.string().optional(),
});

export type DonationInput = z.infer<typeof DonationSchema>;

// User profile update schema
export const UserUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  area: z.string().min(2, 'Area is required').optional(),
  city: z.string().min(2, 'City is required').optional(),
  state: z.string().min(2, 'State is required').optional(),
  isActive: z.boolean().optional(),
  contactVisibility: ContactVisibilityEnum.optional(),
  profileVisibility: ProfileVisibilityEnum.optional(),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

// Blood group display mapping
export const BLOOD_GROUP_DISPLAY: Record<BloodGroup, string> = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
};

// Privacy settings display mapping
export const CONTACT_VISIBILITY_DISPLAY: Record<ContactVisibility, string> = {
  PUBLIC: 'Public - Anyone can see',
  RESTRICTED: 'Restricted - Only logged in users can see',
  PRIVATE: 'Private - Only you can see',
};

export const PROFILE_VISIBILITY_DISPLAY: Record<ProfileVisibility, string> = {
  PUBLIC: 'Public - Anyone can find you',
  PRIVATE: 'Private - Only logged in users can find you',
};

// Blood group compatibility for searching
export const BLOOD_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  A_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  A_NEGATIVE: ['A_NEGATIVE', 'O_NEGATIVE'],
  B_POSITIVE: ['B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  B_NEGATIVE: ['B_NEGATIVE', 'O_NEGATIVE'],
  AB_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  AB_NEGATIVE: ['A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE', 'O_NEGATIVE'],
  O_POSITIVE: ['O_POSITIVE', 'O_NEGATIVE'],
  O_NEGATIVE: ['O_NEGATIVE'],
};
