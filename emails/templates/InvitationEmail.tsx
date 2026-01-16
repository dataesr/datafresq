import { EmailButton, EmailHeading, EmailLayout, EmailSection, EmailText } from '../components';
import { colors } from '../styles';

interface InvitationEmailProps {
  invitationUrl: string;
}

export function InvitationEmail({ invitationUrl }: InvitationEmailProps) {
  return (
    <EmailLayout
      title="Invitation à rejoindre la plateforme"
      preheader="Vous avez été invité(e) à rejoindre notre plateforme"
      footer={
        <span>
          Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
          <br />
          <br />© {new Date().getFullYear()} Ministère de l'enseignement supérieur, de la recherche
          et de l'espace
        </span>
      }
    >
      <EmailHeading level={1} backgroundColor={colors.primaryBackground}>
        Invitation à rejoindre la dataFresq
      </EmailHeading>

      <EmailSection backgroundColor={colors.backgroundDefault}>
        <EmailText>Bonjour,</EmailText>

        <EmailText>
          Vous avez été invité(e) à rejoindre dataFresq. Cliquez sur le bouton ci-dessous pour créer
          votre compte et commencer à utiliser le service.
        </EmailText>

        <EmailText variant="muted" style={{ marginBottom: 24 }}>
          Ce lien est valable pendant 48 heures.
        </EmailText>
      </EmailSection>

      <EmailSection backgroundColor={colors.backgroundDefault} padding="0 10px 24px 10px">
        <EmailButton href={invitationUrl} variant="primary">
          Créer mon compte
        </EmailButton>
      </EmailSection>

      <EmailSection backgroundColor={colors.backgroundDefault}>
        <EmailText variant="small">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
        </EmailText>
        <EmailText variant="small" style={{ wordBreak: 'break-all' }}>
          {invitationUrl}
        </EmailText>
      </EmailSection>
    </EmailLayout>
  );
}

export default InvitationEmail;
