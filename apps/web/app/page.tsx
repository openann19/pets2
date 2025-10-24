import { redirect } from 'next/navigation';

export default function RootRedirect() {
  // Redirect to default locale homepage
  redirect('/en');
  return null;
}
