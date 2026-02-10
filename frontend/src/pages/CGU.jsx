import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function CGU() {
  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="cgu-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>

        <Card className="p-8 bg-card border-border rounded-2xl">
          <h1 className="font-heading text-3xl font-bold mb-8">CONDITIONS GÉNÉRALES D'UTILISATION</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">1. Objet</h2>
              <p className="text-muted-foreground">
                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités 
                d'accès et d'utilisation du site <strong className="text-foreground">Trouve Ton Dossard</strong>, 
                plateforme de référencement des courses de trail en France.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">2. Acceptation des CGU</h2>
              <p className="text-muted-foreground">
                L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">3. Services proposés</h2>
              <p className="text-muted-foreground mb-4">
                Le site propose les services suivants :
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• Consultation du calendrier des courses de trail en France</li>
                <li>• Recherche et filtrage des courses par critères (région, distance, dénivelé, etc.)</li>
                <li>• Visualisation des courses sur une carte interactive</li>
                <li>• Création d'un compte utilisateur</li>
                <li>• Ajout de courses en favoris avec notifications</li>
                <li>• Soumission de nouvelles courses (sous réserve de modération)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">4. Inscription et compte utilisateur</h2>
              <p className="text-muted-foreground">
                L'accès à certaines fonctionnalités nécessite la création d'un compte. L'utilisateur s'engage à :
              </p>
              <ul className="text-muted-foreground mt-2 space-y-2">
                <li>• Fournir des informations exactes et à jour</li>
                <li>• Maintenir la confidentialité de ses identifiants de connexion</li>
                <li>• Signaler immédiatement toute utilisation non autorisée de son compte</li>
                <li>• Ne pas créer plusieurs comptes</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">5. Soumission de contenu</h2>
              <p className="text-muted-foreground">
                Les utilisateurs peuvent soumettre des informations sur des courses de trail. 
                En soumettant du contenu, l'utilisateur :
              </p>
              <ul className="text-muted-foreground mt-2 space-y-2">
                <li>• Garantit l'exactitude des informations fournies</li>
                <li>• Accepte que le contenu soit soumis à modération avant publication</li>
                <li>• Autorise l'éditeur à modifier ou supprimer le contenu si nécessaire</li>
                <li>• S'interdit de publier des contenus illicites, diffamatoires ou portant atteinte aux droits de tiers</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">6. Responsabilité</h2>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Trouve Ton Dossard</strong> s'efforce de fournir des informations 
                exactes et à jour, mais ne peut garantir l'exactitude, la complétude ou l'actualité des informations 
                publiées. Les informations relatives aux courses (dates, inscriptions, parcours) sont fournies à titre 
                indicatif et doivent être vérifiées auprès des organisateurs officiels.
              </p>
              <p className="text-muted-foreground mt-4">
                L'éditeur ne saurait être tenu responsable :
              </p>
              <ul className="text-muted-foreground mt-2 space-y-2">
                <li>• Des erreurs ou omissions dans les informations publiées</li>
                <li>• Des dommages résultant de l'utilisation du site</li>
                <li>• De l'indisponibilité temporaire du site</li>
                <li>• Du contenu des sites tiers vers lesquels des liens peuvent pointer</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">7. Propriété intellectuelle</h2>
              <p className="text-muted-foreground">
                Tous les éléments du site (design, textes, logos, code source) sont la propriété exclusive 
                de l'éditeur ou font l'objet d'une autorisation d'utilisation. Toute reproduction non autorisée 
                est interdite.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">8. Notifications email</h2>
              <p className="text-muted-foreground">
                En activant les notifications pour une course, l'utilisateur accepte de recevoir des emails 
                relatifs à l'ouverture des inscriptions. L'utilisateur peut désactiver ces notifications 
                à tout moment depuis son tableau de bord.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">9. Modification des CGU</h2>
              <p className="text-muted-foreground">
                L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. 
                Les utilisateurs seront informés des modifications significatives. La poursuite de 
                l'utilisation du site après modification vaut acceptation des nouvelles CGU.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">10. Résiliation</h2>
              <p className="text-muted-foreground">
                L'utilisateur peut supprimer son compte à tout moment. L'éditeur se réserve le droit 
                de suspendre ou supprimer un compte en cas de non-respect des présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">11. Droit applicable</h2>
              <p className="text-muted-foreground">
                Les présentes CGU sont soumises au droit français. Tout litige sera soumis 
                à la compétence exclusive des tribunaux français.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">12. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question concernant ces CGU, vous pouvez nous contacter à : 
                <a href="mailto:trouvetontrail.run@gmail.com" className="text-primary hover:underline ml-1">
                  trouvetontrail.run@gmail.com
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
