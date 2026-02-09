import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Confidentialite() {
  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="confidentialite-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>

        <Card className="p-8 bg-card border-border rounded-2xl">
          <h1 className="font-heading text-3xl font-bold mb-8">POLITIQUE DE CONFIDENTIALITÉ</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                La présente politique de confidentialité décrit comment <strong className="text-foreground">Trouve Ton Dossard</strong> collecte, 
                utilise et protège vos données personnelles conformément au Règlement Général sur la Protection 
                des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">2. Responsable du traitement</h2>
              <p className="text-muted-foreground">
                Le responsable du traitement des données est :
              </p>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li><strong className="text-foreground">Nom :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Email :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Adresse :</strong> [À compléter]</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">3. Données collectées</h2>
              <p className="text-muted-foreground mb-4">
                Nous collectons les données suivantes :
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Données d'identification :</strong> nom, adresse email</li>
                <li><strong className="text-foreground">Données de connexion :</strong> logs de connexion, adresse IP</li>
                <li><strong className="text-foreground">Données d'utilisation :</strong> courses favorites, préférences de notification</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">4. Finalités du traitement</h2>
              <p className="text-muted-foreground mb-4">
                Vos données sont utilisées pour :
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• Gérer votre compte utilisateur</li>
                <li>• Vous permettre de suivre des courses et recevoir des notifications</li>
                <li>• Vous envoyer des emails relatifs à l'ouverture des inscriptions (si vous l'avez autorisé)</li>
                <li>• Améliorer nos services et votre expérience utilisateur</li>
                <li>• Répondre à vos demandes de support</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">5. Base légale</h2>
              <p className="text-muted-foreground">
                Le traitement de vos données repose sur :
              </p>
              <ul className="text-muted-foreground mt-2 space-y-2">
                <li><strong className="text-foreground">Votre consentement</strong> pour les notifications email</li>
                <li><strong className="text-foreground">L'exécution du contrat</strong> pour la gestion de votre compte</li>
                <li><strong className="text-foreground">Notre intérêt légitime</strong> pour l'amélioration de nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">6. Durée de conservation</h2>
              <p className="text-muted-foreground">
                Vos données sont conservées pendant toute la durée de votre inscription sur le site. 
                En cas de suppression de votre compte, vos données seront effacées dans un délai de 30 jours, 
                sauf obligation légale de conservation.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">7. Vos droits</h2>
              <p className="text-muted-foreground mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong className="text-foreground">Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong className="text-foreground">Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong className="text-foreground">Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                <li><strong className="text-foreground">Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                <li><strong className="text-foreground">Droit de retrait du consentement :</strong> à tout moment pour les traitements basés sur le consentement</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Pour exercer ces droits, contactez-nous à : <strong className="text-foreground">[email à compléter]</strong>
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">8. Cookies</h2>
              <p className="text-muted-foreground">
                Notre site utilise uniquement des cookies essentiels au fonctionnement du service 
                (authentification, préférences). Aucun cookie de tracking ou publicitaire n'est utilisé. 
                Pour plus d'informations, consultez notre bandeau cookies.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">9. Sécurité</h2>
              <p className="text-muted-foreground">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
                protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">10. Contact et réclamation</h2>
              <p className="text-muted-foreground">
                Pour toute question relative à cette politique ou pour exercer vos droits, contactez-nous 
                à l'adresse : <strong className="text-foreground">[email à compléter]</strong>
              </p>
              <p className="text-muted-foreground mt-4">
                Vous pouvez également introduire une réclamation auprès de la CNIL : 
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  www.cnil.fr
                </a>
              </p>
            </section>
          </div>

          <p className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
            Dernière mise à jour : Janvier 2025
          </p>
        </Card>
      </div>
    </div>
  );
}
