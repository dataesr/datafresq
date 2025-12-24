import { EmailButton, EmailHeading, EmailLayout, EmailSection, EmailText } from '../components';
import { colors } from '../styles';

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <EmailLayout
      title="Réinitialisation de mot de passe"
      preheader="Réinitialisation de votre mot de passe"
      footer={
        <span>
          Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
          <br />
          <br />© {new Date().getFullYear()} Ministère de l'enseignement supérieur, de la recherche
          et de l'espace
        </span>
      }
    >
      {/* Heading Section */}
      <EmailHeading level={1} backgroundColor={colors.primaryBackground}>
        Réinitialisation de mot de passe
      </EmailHeading>

      {/* Main Content */}
      <EmailSection backgroundColor={colors.backgroundDefault}>
        <EmailText>Bonjour,</EmailText>

        <EmailText>
          Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton
          ci-dessous pour définir un nouveau mot de passe.
        </EmailText>

        <EmailText variant="muted" style={{ marginBottom: 24 }}>
          Ce lien est valable pendant 1 heure.
        </EmailText>
      </EmailSection>

      {/* Button Section */}
      <EmailSection backgroundColor={colors.backgroundDefault} padding="0 10px 24px 10px">
        <EmailButton href={resetUrl} variant="primary">
          Réinitialiser mon mot de passe
        </EmailButton>
      </EmailSection>

      {/* Additional Info */}
      <EmailSection backgroundColor={colors.backgroundDefault}>
        <EmailText variant="small">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
        </EmailText>
        <EmailText variant="small" style={{ wordBreak: 'break-all' }}>
          {resetUrl}
        </EmailText>
      </EmailSection>

      {/* Security Notice */}
      <EmailSection backgroundColor={colors.backgroundAlt} darkModeClass="darkmode-1">
        <EmailText variant="small">
          <strong>Note de sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation,
          vous pouvez ignorer cet email. Votre mot de passe actuel reste inchangé.
        </EmailText>
      </EmailSection>
    </EmailLayout>
  );
}

export default PasswordResetEmail;
