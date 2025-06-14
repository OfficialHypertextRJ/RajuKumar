# Fixing Vercel Deployment Issues

## Material UI v7 Grid Component Changes

In Material UI v7, the `Grid` component has been updated and no longer accepts the `item` prop directly. To fix this issue, you need to update all Grid components in your admin pages:

1. Replace all instances of `<Grid item xs={12}>` with `<Grid sx={{ gridColumn: 'span 12' }}>`
2. Replace all instances of `<Grid item xs={12} md={6}>` with `<Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>`
3. Replace all instances of `<Grid item xs={12} md={4}>` with `<Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>`

## Function Parameter Type Fixes

1. Update the `handleInputChange` function to accept field and value parameters:

```tsx
const handleInputChange = (field: string, value: string) => {
  setAboutData(prev => ({ ...prev, [field]: value }));
};
```

2. Update the `handleLanguagesInputChange` function to accept HTMLTextAreaElement:

```tsx
const handleLanguagesInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const value = e.target.value;
  setLanguagesInput(value);
  
  const languagesArray = value.split(',').map(lang => lang.trim()).filter(Boolean);
  setAboutData(prev => ({
    ...prev,
    languages: languagesArray
  }));
};
```

## Environment Variables for Vercel

Create a `.env.production` file with your Firebase configuration:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Alternatively, add these environment variables directly in the Vercel project settings.

## AdminFormField Component Update

Update the `AdminFormField` component to support the `fullWidth` prop:

```tsx
interface AdminFormFieldProps {
  // ... existing props
  fullWidth?: boolean; // Add fullWidth prop
}

export default function AdminFormField({
  // ... existing props
  fullWidth = true // Default to true for backward compatibility
}: AdminFormFieldProps) {
  // ... existing code
}
```

After making these changes, your project should deploy successfully on Vercel. 