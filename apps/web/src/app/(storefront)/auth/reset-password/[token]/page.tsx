import ResetPasswordForm from './_form';

interface ResetPasswordPageProps {
  params: { token: string };
}

/**
 * Server shell — pulls the reset token out of the dynamic route segment
 * and hands it to the client form. Kept as a Server Component so the token
 * is never mounted into any client bundle it doesn't need to be in.
 */
export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return <ResetPasswordForm token={params.token} />;
}

export const metadata = {
  title: 'Reset password • SUMOSTA',
  description: 'Choose a new password for your SUMOSTA account.',
};
