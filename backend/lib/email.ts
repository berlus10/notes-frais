import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_dev')
export async function sendEmailSoumission(
  reportId: string,
  membreNom: string,
  montantTotal: number
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.EMAIL_TRESORIER!,
    subject: `Nouvelle note de frais — ${membreNom}`,
    html: `
      <h2>Nouvelle note de frais soumise</h2>
      <p><strong>Membre :</strong> ${membreNom}</p>
      <p><strong>Montant total :</strong> ${montantTotal.toFixed(2)} €</p>
      <p><strong>Référence :</strong> ${reportId}</p>
      <p>Connectez-vous à l'interface admin pour valider ou rejeter.</p>
    `,
  })
}

export async function sendEmailValidation(
  membreEmail: string,
  membreNom: string,
  reportId: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: membreEmail,
    subject: `Votre note de frais a été validée`,
    html: `
      <h2>Note de frais validée</h2>
      <p>Bonjour ${membreNom},</p>
      <p>Votre note de frais (réf. ${reportId}) a été validée par le trésorier.</p>
      <p>Le remboursement sera effectué prochainement.</p>
    `,
  })
}

export async function sendEmailRejet(
  membreEmail: string,
  membreNom: string,
  reportId: string,
  commentaire: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: membreEmail,
    subject: `Votre note de frais a été rejetée`,
    html: `
      <h2>Note de frais rejetée</h2>
      <p>Bonjour ${membreNom},</p>
      <p>Votre note de frais (réf. ${reportId}) a été rejetée.</p>
      <p><strong>Motif :</strong> ${commentaire}</p>
      <p>Contactez le trésorier pour plus d'informations.</p>
    `,
  })
}